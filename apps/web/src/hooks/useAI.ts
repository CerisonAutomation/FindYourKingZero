// useAI.ts — Worker wrapper with React integration
import { useRef, useCallback, useEffect, useState } from 'react';

type AIType =
  | 'smart-reply' | 'toxicity' | 'translate' | 'icebreaker'
  | 'sentiment' | 'embed' | 'whisper' | 'tts' | 'preload' | 'unload';

interface PendingRequest<T = unknown> {
  resolve: (value: T) => void;
  reject:  (error: Error) => void;
}

export function useAI() {
  const workerRef  = useRef<Worker | null>(null);
  const pendingRef = useRef<Map<string, PendingRequest>>(new Map());
  const [ready,   setReady]   = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL('../workers/ai.worker.ts', import.meta.url),
      { type: 'module' },
    );

    worker.onmessage = (e: MessageEvent<{ id: string; result: unknown; error?: string }>) => {
      const { id, result, error } = e.data;
      const pending = pendingRef.current.get(id);
      if (pending) {
        if (error) pending.reject(new Error(error));
        else       (pending as PendingRequest<unknown>).resolve(result);
        pendingRef.current.delete(id);
      }
      setLoading(null);
    };

    worker.onerror = (e: ErrorEvent) => {
      console.error('[AI Worker]', e.message);
    };

    workerRef.current = worker;
    setReady(true);
    return () => { worker.terminate(); };
  }, []);

  const request = useCallback(<T = unknown>(type: AIType, payload: Record<string, unknown> = {}): Promise<T> => {
    return new Promise<T>((resolve, reject) => {
      if (!workerRef.current) { reject(new Error('AI worker not ready')); return; }
      const id = crypto.randomUUID();
      pendingRef.current.set(id, { resolve: resolve as (v: unknown) => void, reject });
      setLoading(type);
      workerRef.current.postMessage({ type, payload, id });
    });
  }, []);

  const preloadEssential = useCallback(() =>
    request('preload', { models: ['toxicity', 'sentiment', 'embeddings'] })
  , [request]);

  return {
    ready,
    loading,
    smartReplies:   (message: string)                          => request<string[]>('smart-reply', { message }),
    icebreakers:    (myTribes: string[], theirTribes: string[]) => request<string[]>('icebreaker', { myTribes, theirTribes }),
    checkToxicity:  (text: string)                             => request<Array<{ label: string; score: number }>>('toxicity', { text }),
    checkSentiment: (text: string)                             => request<{ label: string; score: number }>('sentiment', { text }),
    translate:      (text: string, from: string, to: string)   => request<string>('translate', { text, from, to }),
    getEmbedding:   (text: string)                             => request<number[]>('embed', { text }),
    transcribe:     (audio: Float32Array, lang?: string)        => request<string>('whisper', { audio: Array.from(audio), lang }),
    synthesize:     (text: string, speakerUrl: string)         => request<Float32Array>('tts', { text, speakerUrl }),
    preloadEssential,
    unload: () => request('unload'),
  };
}
