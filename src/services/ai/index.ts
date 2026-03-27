/**
 * =============================================================================
 * AI Services — Canonical Re-export Barrel
 * =============================================================================
 * 
 * This file is a pure re-export barrel from the canonical AI system.
 * All AI service logic lives in: src/lib/ai/canonical.ts
 * 
 * @deprecated Direct imports from this file. Use `@/lib/ai/canonical` or `@/lib/ai` instead.
 * @see src/lib/ai/canonical.ts
 */

// Re-export everything from canonical AI module
export {
  // WebLLM Service
  WebLLMService,
  getWebLLMService,
  resetWebLLMService,
  initWebLLM,
  quickChat,
  useWebLLM,
  RECOMMENDED_MODELS,

  // Porcupine Service
  PorcupineService,
  getPorcupineService,
  resetPorcupineService,
  initWakeWord,
  startListening,
  usePorcupine,
  BuiltInKeyword,

  // Wake Word Config
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
} from '@/lib/ai/canonical';