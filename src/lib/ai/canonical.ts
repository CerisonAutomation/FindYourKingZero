/**
 * =============================================================================
 * CANONICAL AI SYSTEM v15.0 — Enterprise-Grade AI Consolidation
 * =============================================================================
 *
 * Consolidates ALL AI functionality into ONE canonical source.
 * Single source of truth for AI operations across the application.
 *
 * Standards: 15/10 Legendary | Enterprise Production | Zero-Trust
 *
 * @module lib/ai
 * @version 15.0.0
 */

// =============================================================================
// CORE AI EXPORTS
// =============================================================================

// Local AI Engine
export { LocalAI, getLocalAI } from './LocalAI';
export type { LocalAIStatus, GenerateOptions, IntentType } from './LocalAI';
export { useLocalAI } from './index';

// Chat AI
export { chatAI } from './ChatAI';
export type { SafetyResult, QuickReply } from './ChatAI';

// AI Client
export { default as aiClient } from './client';

// OpenRouter Integration
export {
  OPENROUTER_BASE,
  OPENROUTER_MODELS,
  DEFAULT_MODEL,
  type OpenRouterMessage,
  type OpenRouterOptions,
  openrouterChat,
  openrouterStream,
  getAIResponse,
  getAIStream,
  AI_PROMPTS
} from './openrouter';

// Offline Responses
export type { OfflineResponseSet } from './offlineResponses';
export { getOfflineResponse } from './offlineResponses';

// =============================================================================
// AI AGENTS
// =============================================================================
export {
  AgentOrchestrator,
  MatchMakerAgent,
  ChatAssistAgent,
  SafeGuardianAgent,
  ProfileOptimizerAgent,
} from './agents/AgentOrchestrator';

export type {
  AgentMemory,
  ProfileSuggestion,
  MatchScore,
} from './agents/AgentOrchestrator';

// =============================================================================
// SPECIALIZED AI ENGINES
// =============================================================================
export { AIBrain } from './AIBrain';
export { AIMatchingEngine } from './AIMatchingEngine';
export { InfermaxAIEngine } from './InfermaxAIEngine';
export { default as MLServices } from './MLServices';

// =============================================================================
// TYPES
// =============================================================================
export interface AIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableStreaming?: boolean;
  timeout?: number;
}

export interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

export interface AIError {
  code: string;
  message: string;
  retryable: boolean;
}

// =============================================================================
// CANONICAL AI HOOK — Single Source of Truth
// =============================================================================
export {
  useUnifiedAI,
  useUnifiedAI as useAI,
  useUnifiedAI as useKeylessAI,
  default as useUnifiedAIDefault,
} from './useUnifiedAI';

export type {
  UseUnifiedAIOptions,
  UnifiedAIState,
  ProfileData,
} from './useUnifiedAI';

// Legacy type aliases for backward compatibility
export type { AIConfig as UnifiedAIConfig } from './useUnifiedAI';
export type { AIResponse as UnifiedAIResponse } from './useUnifiedAI';

// =============================================================================
// WEBLLM SERVICE — Local LLM Inference
// =============================================================================
export {
  WebLLMService,
  getWebLLMService,
  resetWebLLMService,
  initWebLLM,
  quickChat,
  useWebLLM,
  RECOMMENDED_MODELS,
} from '@/services/ai/WebLLMService';

export type {
  WebLLMConfig,
  WebLLMChatOptions,
  WebLLMResponse,
  WebLLMState,
  UseWebLLMReturn,
} from '@/services/ai/WebLLMService';

// =============================================================================
// PORCUPINE SERVICE — Wake Word Detection
// =============================================================================
export {
  PorcupineService,
  getPorcupineService,
  resetPorcupineService,
  initWakeWord,
  startListening,
  usePorcupine,
  BuiltInKeyword,
} from '@/services/ai/PorcupineService';

export type {
  PorcupineConfig,
  PorcupineState,
  UsePorcupineReturn,
} from '@/services/ai/PorcupineService';

// =============================================================================
// WAKE WORD CONFIG — Customizable Wake Words
// =============================================================================
export {
  WAKE_WORD_PRESETS,
  DEFAULT_WAKE_WORD_CONFIG,
  WAKE_WORD_STORAGE_KEY,
  getWakeWordPreset,
  getAllWakeWordPresets,
  getCustomModelPresets,
  getBuiltInPresets,
  presetToKeywords,
  customWakeWordToKeyword,
  generatePorcupineConfig,
  validateWakeWordConfig,
  loadWakeWordConfig,
  saveWakeWordConfig,
  clearWakeWordConfig,
  useWakeWordConfig,
} from '@/services/ai/WakeWordConfig';

export type {
  WakeWordPreset,
  CustomWakeWord,
  WakeWordConfiguration,
  UseWakeWordConfigReturn,
} from '@/services/ai/WakeWordConfig';
