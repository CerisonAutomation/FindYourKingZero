// ═══════════════════════════════════════════════════════════════
// HOOKS: useAI — Worker wrapper with React integration
// Lazy loads models. Zero UI blocking.
// ═══════════════════════════════════════════════════════════════

import { useRef, useCallback, useEffect, useState } from 'react';

type AIType =
  | 'smart-reply' | 'toxicity' | 'translate' | 'icebreaker'
  | 'sentiment' | 'embed' | 'whisper' | 'tts' | 'preload' | 'unload';

interface PendingRequest {
  resolve: (value: any) => void;
  reject: (error: Error) => void;
}

export function useAI() {
  const workerRef = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/ai.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (e) => {
      const { id, result, error } = e.data;
      const pending = pendingRef.current.get(id);
      if (pending) {
        if (error) pending.reject(new Error(error));
        else pending.resolve(result);
        pendingRef.current.delete(id);
      }
      setLoading(null);
    };

    worker.onerror = (e) => {
      console.error('[AI Worker]', e.message);
    };

    workerRef.current = worker;
    setReady(true);

    return () => {
      worker.terminate();
    };
  }, []);

  const request = useCallback(<T = any>(type: AIType, payload: any = {}): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      if (!workerRef.current) {
        reject(new Error('AI worker not ready'));
        return;
      }
      const id = crypto.randomUUID();
      pendingRef.current.set(id, { resolve, reject });
      setLoading(type);
      workerRef.current.postMessage({ type, payload, id });
    });
  }, []);

  // Preload essential models (toxicity, sentiment) on first use
  const preloadEssential = useCallback(() => {
    return request('preload', { models: ['toxicity', 'sentiment', 'embeddings'] });
  }, [request]);

  return {
    ready,
    loading,

    // Text generation
    smartReplies: (message: string) => request<string[]>('smart-reply', { message }),
    icebreakers: (myTribes: string[], theirTribes: string[]) =>
      request<string[]>('icebreaker', { myTribes, theirTribes }),

    // Safety
    checkToxicity: (text: string) => request<Array<{ label: string; score: number }>>('toxicity', { text }),
    checkSentiment: (text: string) => request<{ label: string; score: number }>('sentiment', { text }),

    // Translation
    translate: (text: string, from: string, to: string) =>
      request<string>('translate', { text, from, to }),

    // Matching
    getEmbedding: (text: string) => request<number[]>('embed', { text }),

    // Voice
    transcribe: (audio: Float32Array, lang?: string) =>
      request<string>('whisper', { audio, lang }),
    synthesize: (text: string, speakerUrl: string) =>
      request<Float32Array>('tts', { text, speakerUrl }),

    // Lifecycle
    preloadEssential,
    unload: () => request('unload'),
  };
}
