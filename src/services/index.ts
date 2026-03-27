/**
 * =============================================================================
 * SERVICES CANONICAL BARREL — Enterprise-Grade Service Layer Consolidation
 * =============================================================================
 *
 * Single source of truth for ALL service layer functionality.
 * Consolidates AI services, WebLLM, Porcupine, and future service modules.
 *
 * Standards: 15/10 Legendary | Zero-Trust | Enterprise Production
 *
 * @module services
 * @version 15.0.0
 */

// =============================================================================
// AI SERVICES — All AI/ML service functionality
// =============================================================================
export {
  // WebLLM Service
  WebLLMService,
  getWebLLMService,
  resetWebLLMService,
  initWebLLM,
  quickChat,
  useWebLLM,
  RECOMMENDED_MODELS,

  // Porcupine Wake Word Service
  PorcupineService,
  getPorcupineService,
  resetPorcupineService,
  initWakeWord,
  startListening,
  usePorcupine,
  BuiltInKeyword,

  // Wake Word Configuration
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

  // Types
  type WebLLMConfig,
  type WebLLMChatOptions,
  type WebLLMResponse,
  type WebLLMState,
  type UseWebLLMReturn,
  type PorcupineConfig,
  type PorcupineState,
  type UsePorcupineReturn,
  type WakeWordPreset,
  type CustomWakeWord,
  type WakeWordConfiguration,
  type UseWakeWordConfigReturn,
} from './ai';

// Re-export from canonical AI for convenience
export {
  // Core AI services from lib/ai canonical
  LocalAI,
  getLocalAI,
  chatAI,
  aiClient,
  openrouterChat,
  openrouterStream,
  getAIResponse,
  getAIStream,
  AI_PROMPTS,
  AgentOrchestrator,
  MatchMakerAgent,
  ChatAssistAgent,
  SafeGuardianAgent,
  ProfileOptimizerAgent,
  AIBrain,
  AIMatchingEngine,
  InfermaxAIEngine,
  MLServices,
} from '@/lib/ai/canonical';

// =============================================================================
// TYPES
// =============================================================================
export type {
  LocalAIStatus,
  GenerateOptions,
  IntentType,
  SafetyResult,
  QuickReply,
  OpenRouterMessage,
  OpenRouterOptions,
  OfflineResponseSet,
  AgentMemory,
  ProfileSuggestion,
  MatchScore,
} from '@/lib/ai/canonical';
