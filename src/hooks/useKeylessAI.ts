/**
 * =============================================================================
 * useKeylessAI — Canonical Re-export
 * =============================================================================
 * 
 * This file is a canonical re-export from the unified AI system.
 * All AI logic lives in: src/lib/ai/canonical.ts
 * 
 * @deprecated Direct imports from this file. Use `@/lib/ai/canonical` or `@/lib/ai` instead.
 * @see src/lib/ai/canonical.ts
 */

// Re-export everything from the canonical AI module
export {
  useUnifiedAI as default,
  useUnifiedAI as useKeylessAI,
  LocalAI,
  getLocalAI,
  useLocalAI,
  chatAI,
  aiClient,
  getOfflineResponse,
  AgentOrchestrator,
  MatchMakerAgent,
  ChatAssistAgent,
  SafeGuardianAgent,
  ProfileOptimizerAgent,
  AIBrain,
  AIMatchingEngine,
  InfermaxAIEngine,
  WebLLMService,
  type AIConfig,
  type AIResponse,
  type AIError,
  type LocalAIStatus,
  type GenerateOptions,
  type IntentType,
  type SafetyResult,
  type QuickReply,
  type OfflineResponseSet,
  type AgentMemory,
  type ProfileSuggestion,
  type MatchScore,
} from '@/lib/ai/canonical';