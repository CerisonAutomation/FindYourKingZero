/**
 * AI barrel export — LocalAI + hook.
 */

export { LocalAI, getLocalAI } from './LocalAI';
export type { LocalAIStatus, GenerateOptions, IntentType } from './LocalAI';

// ---------------------------------------------------------------------------
// useLocalAI — React hook
// ---------------------------------------------------------------------------

import {useEffect, useRef, useSyncExternalStore} from 'react';
import type {LocalAIStatus} from './LocalAI';
import {getLocalAI, LocalAI} from './LocalAI';

/**
 * React hook that provides a ready-to-use LocalAI instance with reactive
 * loading state.
 *
 * ```tsx
 * const { ai, status, ready, generateReply } = useLocalAI();
 *
 * // Send a message once ready:
 * const reply = await generateReply("User: Hi there!\n", "You are a dating coach.");
 * ```
 */
export function useLocalAI(modelId?: string) {
  const aiRef = useRef<LocalAI | null>(null);
  if (!aiRef.current) {
    aiRef.current = getLocalAI(modelId);
  }
  const ai = aiRef.current;

  // Trigger init on mount.
  useEffect(() => {
    ai.init().catch((err) => {
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
    /** The LocalAI instance. */
    ai,
    /** Reactive status (ready, loading, progress, error, backend). */
    status,
    /** Shorthand: is the model ready for inference? */
    ready: status.ready,
    /** Shorthand: is the model currently loading? */
    loading: status.loading,
    /** Loading progress 0–100. */
    progress: status.progress,
    /** Error string if something went wrong. */
    error: status.error,
    /** Which backend is in use. */
    backend: status.backend,
    /** Generate a reply (auto-inits if needed). */
    generateReply: ai.generateReply.bind(ai),
    /** Generate an icebreaker (auto-inits if needed). */
    generateIcebreaker: ai.generateIcebreaker.bind(ai),
    /** Classify message intent (instant, no model needed). */
    classifyIntent: ai.classifyIntent.bind(ai),
    /** Release model memory. */
    dispose: ai.dispose.bind(ai),
  };
}
