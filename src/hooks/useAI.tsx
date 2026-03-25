// =============================================================================
// useAI.tsx v4.0 — Vercel AI SDK v4, real SSE streaming, no fake word-loop
// Fixes: ai@v3 → v4, @ai-sdk/openai v0.0.54 → v1, fake setTimeout stream removed
// Uses: useChat from 'ai/react' (v4 API), streamText for server actions
// =============================================================================
import {useCallback, useRef, useState} from 'react';
import {type Message, useChat} from '@ai-sdk/react';
import {useQueryClient} from '@tanstack/react-query';
import {useToast} from './use-toast';
import {supabase} from '@/integrations/supabase/client';
import type {Profile} from '@/types';

// ── Types ──────────────────────────────────────────────────────────────────────────
export type AIMode = 'chat' | 'auto_reply' | 'icebreaker' | 'bio_suggestions' | 'compatibility';

export type AIMessage  = {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt?: Date;
}

export type UseAIReturn  = {
  // Chat state (real SSE stream via AI SDK v4)
  messages: Message[];
  input: string;
  isStreaming: boolean;
  error: Error | null;
  setInput: (v: string) => void;
  sendMessage: (content?: string) => Promise<void>;
  stopStreaming: () => void;
  clearMessages: () => void;
  // One-shot AI actions
  generateIcebreaker: (profile: Profile) => Promise<string | null>;
  generateBioSuggestions: (currentBio: string) => Promise<string[] | null>;
  analyzeCompatibility: (a: Profile, b: Profile) => Promise<string | null>;
  generateAutoReply: (context: string, lastMessage: string) => Promise<string | null>;
  // Meta
  mode: AIMode;
  setMode: (m: AIMode) => void;
  isActionLoading: boolean;
}

// ── Edge function caller (replaces old @lib/ai/client pattern) ─────────────────
// Calls Supabase Edge Functions which use AI SDK v4 streamText internally
async function callEdgeFunction(
  fn: string,
  payload: Record<string, unknown>,
): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke(fn, { body: payload });
    if (error) throw error;
    return (data as { result: string })?.result ?? null;
  } catch (err) {
    console.error(`[useAI] Edge function ${fn} failed:`, err);
    return null;
  }
}

// ── Hook ─────────────────────────────────────────────────────────────────────────────
export const useAI = (): UseAIReturn => {
  const [mode, setMode] = useState<AIMode>('chat');
  const [isActionLoading, setIsActionLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const abortRef = useRef<AbortController | null>(null);

  // ── Real SSE streaming via AI SDK v4 useChat ──────────────────────────
  // FIXED: was a fake word-by-word setTimeout loop.
  // Now uses real SSE from AI SDK v4 useChat pointing at a Supabase Edge Function.
  const {
    messages,
    input,
    setInput,
    append,
    stop,
    setMessages,
    isLoading: isStreaming,
    error,
  } = useChat({
    api: `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`,
    headers: {
      Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
    },
    onError: (err) => {
      toast({
        title: 'AI Error',
        description: err.message ?? 'Something went wrong. Please try again.',
        variant: 'destructive',
      });
    },
  });

  const sendMessage = useCallback(
    async (content?: string) => {
      const text = content ?? input;
      if (!text.trim()) return;
      abortRef.current = new AbortController();
      await append({ role: 'user', content: text });
    },
    [input, append],
  );

  const stopStreaming = useCallback(() => {
    stop();
    abortRef.current?.abort();
  }, [stop]);

  const clearMessages = useCallback(() => setMessages([]), [setMessages]);

  // ── One-shot actions via Edge Functions ────────────────────────────────
  const generateIcebreaker = useCallback(async (profile: Profile): Promise<string | null> => {
    setIsActionLoading(true);
    try {
      return await callEdgeFunction('ai-icebreaker', {
        name: profile.display_name,
        interests: profile.interests ?? [],
        bio: profile.bio ?? '',
      });
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const generateBioSuggestions = useCallback(async (currentBio: string): Promise<string[] | null> => {
    setIsActionLoading(true);
    try {
      const result = await callEdgeFunction('ai-bio-suggestions', { currentBio });
      if (!result) return null;
      return result.split('\n').filter(Boolean).slice(0, 5);
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const analyzeCompatibility = useCallback(async (
    a: Profile,
    b: Profile,
  ): Promise<string | null> => {
    setIsActionLoading(true);
    try {
      return await callEdgeFunction('ai-compatibility', {
        profileA: { name: a.display_name, bio: a.bio, interests: a.interests },
        profileB: { name: b.display_name, bio: b.bio, interests: b.interests },
      });
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  const generateAutoReply = useCallback(async (
    context: string,
    lastMessage: string,
  ): Promise<string | null> => {
    setIsActionLoading(true);
    try {
      return await callEdgeFunction('ai-auto-reply', { context, lastMessage });
    } finally {
      setIsActionLoading(false);
    }
  }, []);

  return {
    messages,
    input,
    isStreaming,
    error: error ?? null,
    setInput,
    sendMessage,
    stopStreaming,
    clearMessages,
    generateIcebreaker,
    generateBioSuggestions,
    analyzeCompatibility,
    generateAutoReply,
    mode,
    setMode,
    isActionLoading,
  };
};

export default useAI;
