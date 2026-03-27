/**
 * =============================================================================
 * useLocalAI — React Hook for Local AI
 * =============================================================================
 *
 * React hook that provides a ready-to-use LocalAI instance with reactive
 * loading state.
 *
 * @module lib/ai/hooks
 * @version 15.0.0
 */

import { useEffect, useRef, useSyncExternalStore } from 'react';
import type { LocalAIStatus } from './LocalAI';
import { getLocalAI, LocalAI } from './LocalAI';

export interface UseLocalAIReturn {
  /** The LocalAI instance. */
  ai: LocalAI;
  /** Reactive status (ready, loading, progress, error, backend). */
  status: LocalAIStatus;
  /** Shorthand: is the model ready for inference? */
  ready: boolean;
  /** Shorthand: is the model currently loading? */
  loading: boolean;
  /** Loading progress 0–100. */
  progress: number;
  /** Error string if something went wrong. */
  error: string | null;
  /** Which backend is in use. */
  backend: string;
  /** Generate a reply (auto-inits if needed). */
  generateReply: (input: string, systemPrompt?: string) => Promise<string>;
  /** Generate an icebreaker (auto-inits if needed). */
  generateIcebreaker: (context: string) => Promise<string>;
  /** Classify message intent (instant, no model needed). */
  classifyIntent: (message: string) => string;
  /** Release model memory. */
  dispose: () => void;
}

/**
 * React hook that provides a ready-to-use LocalAI instance with reactive
 * loading state.
 *
 * @example
 * ```tsx
 * const { ai, status, ready, generateReply } = useLocalAI();
 *
 * // Send a message once ready:
 * const reply = await generateReply("User: Hi there!\n", "You are a dating coach.");
 * ```
 */
export function useLocalAI(modelId?: string): UseLocalAIReturn {
  const aiRef = useRef<LocalAI | null>(null);
  if (!aiRef.current) {
    aiRef.current = getLocalAI(modelId);
  }
  const ai = aiRef.current;

  // Trigger init on mount.
  useEffect(() => {
    ai.init().catch((err: unknown) => {
      console.error('[useLocalAI] init failed:', err);
    });
  }, [ai]);

  // Reactive status via useSyncExternalStore.
  const status = useSyncExternalStore(
    (onStoreChange) => ai.onStatusChange(onStoreChange),
    () => ai.getStatus(),
    () => ai.getStatus(),
  );

  return {
    ai,
    status,
    ready: status.ready,
    loading: status.loading,
    progress: status.progress,
    error: status.error,
    backend: status.backend,
    generateReply: ai.generateReply.bind(ai),
    generateIcebreaker: ai.generateIcebreaker.bind(ai),
    classifyIntent: ai.classifyIntent.bind(ai),
    dispose: ai.dispose.bind(ai),
  };
}
