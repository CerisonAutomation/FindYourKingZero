/**
 * =============================================================================
 * CANONICAL CHAT AI HOOK v15.0 — Chat-Like AI Interface
 * =============================================================================
 *
 * Provides a chat-like API on top of the canonical useAI hook.
 * Bridges the gap between the canonical AI API and chat-oriented components.
 *
 * Standards: 15/10 Legendary | Zero-Trust | WCAG 3.0 AAA
 *
 * @module hooks/useChatAI
 * @version 15.0.0
 */

import { useState, useCallback, useRef } from 'react';
import { useAI } from '@/lib/ai/canonical';
import type { ProfileData } from '@/lib/ai/useUnifiedAI';

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

export interface UseChatAIReturn {
  messages: ChatMessage[];
  isStreaming: boolean;
  input: string;
  setInput: (value: string) => void;
  sendMessage: (message: string, context?: string) => Promise<void>;
  clearMessages: () => void;
  error: string | null;
  generateIcebreaker: (targetProfile: ProfileData, myProfile: ProfileData) => Promise<string>;
  analyzeCompatibility: (profile1: ProfileData, profile2: ProfileData) => Promise<{ score: number; insights: string[] }>;
}

export function useChatAI(): UseChatAIReturn {
  const ai = useAI();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef(false);

  const sendMessage = useCallback(async (message: string, context?: string) => {
    if (!message.trim()) return;

    const userMsg: ChatMessage = {
      role: 'user',
      content: message.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMsg]);
    setIsStreaming(true);
    setError(null);
    abortRef.current = false;

    try {
      const response = await ai.generateResponse(message, context);
      
      if (abortRef.current) return;

      const assistantMsg: ChatMessage = {
        role: 'assistant',
        content: response.content,
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev, assistantMsg]);
    } catch (err) {
      if (!abortRef.current) {
        const errorMsg = err instanceof Error ? err.message : 'Failed to generate response';
        setError(errorMsg);
        
        const errorAssistantMsg: ChatMessage = {
          role: 'assistant',
          content: `Sorry, I encountered an error: ${errorMsg}. Please try again.`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, errorAssistantMsg]);
      }
    } finally {
      setIsStreaming(false);
    }
  }, [ai.generateResponse]);

  const clearMessages = useCallback(() => {
    setMessages([]);
    setError(null);
    abortRef.current = true;
  }, []);

  return {
    messages,
    isStreaming,
    input,
    setInput,
    sendMessage,
    clearMessages,
    error,
    generateIcebreaker: ai.generateIcebreaker,
    analyzeCompatibility: ai.analyzeCompatibility,
  };
}

export default useChatAI;