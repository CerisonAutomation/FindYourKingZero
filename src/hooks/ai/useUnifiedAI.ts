/**
 * =============================================================================
 * useUnifiedAI — Canonical Re-export
 * =============================================================================
 * 
 * This file is a canonical re-export from the unified AI system.
 * All AI logic lives in: src/lib/ai/useUnifiedAI.ts
 * 
 * @deprecated Direct imports from this file. Use `@/lib/ai/canonical` or `@/lib/ai/useUnifiedAI` instead.
 * @see src/lib/ai/useUnifiedAI.ts
 */

// Re-export everything from the canonical AI module
export {
  useUnifiedAI,
  default,
  type AIConfig,
  type AIResponse,
  type UseUnifiedAIOptions,
  type UnifiedAIState,
  type ProfileData,
} from '@/lib/ai/useUnifiedAI';