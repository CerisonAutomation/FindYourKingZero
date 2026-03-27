/**
 * Wake Word Configuration — Customizable Wake Word Presets & Management
 *
 * Provides pre-configured wake words and utilities for custom wake word setup.
 * All wake words require a .ppn file (Porcupine model file) or base64 encoding.
 *
 * @see https://console.picovoice.ai/ — Train custom wake words here
 */

import type { PorcupineConfig } from './PorcupineService';

// =============================================================================
// WAKE WORD PRESETS
// =============================================================================

export interface WakeWordPreset {
  /** Unique identifier */
  id: string;
  /** Display name for UI */
  name: string;
  /** Keywords to detect */
  keywords: PorcupineConfig['keywords'];
  /** Description */
  description: string;
  /** Sensitivity (0.0 - 1.0) — higher = more sensitive but more false positives */
  defaultSensitivity: number;
  /** Requires custom model file */
  requiresCustomModel: boolean;
  /** Model file path pattern */
  modelPath?: string;
}

/** Pre-configured wake word presets */
export const WAKE_WORD_PRESETS: Record<string, WakeWordPreset> = {
  /** Default — "Hey King" */
  HEY_KING: {
    id: 'hey-king',
    name: 'Hey King',
    keywords: [
      { label: 'Hey King', publicPath: '/models/hey-king.ppn', sensitivity: 0.7 },
    ],
    description: 'Activate the AI assistant by saying "Hey King"',
    defaultSensitivity: 0.7,
    requiresCustomModel: true,
    modelPath: '/models/hey-king.ppn',
  },

  /** Alternative — "Hey Sovereign" */
  HEY_SOVEREIGN: {
    id: 'hey-sovereign',
    name: 'Hey Sovereign',
    keywords: [
      { label: 'Hey Sovereign', publicPath: '/models/hey-sovereign.ppn', sensitivity: 0.7 },
    ],
    description: 'Activate with "Hey Sovereign"',
    defaultSensitivity: 0.7,
    requiresCustomModel: true,
    modelPath: '/models/hey-sovereign.ppn',
  },

  /** Simple — "Hey AI" */
  HEY_AI: {
    id: 'hey-ai',
    name: 'Hey AI',
    keywords: [
      { label: 'Hey AI', publicPath: '/models/hey-ai.ppn', sensitivity: 0.65 },
    ],
    description: 'Simple activation with "Hey AI"',
    defaultSensitivity: 0.65,
    requiresCustomModel: true,
    modelPath: '/models/hey-ai.ppn',
  },

  /** Magic word — "Abracadabra" */
  ABRACADABRA: {
    id: 'abracadabra',
    name: 'Abracadabra',
    keywords: [
      { label: 'Abracadabra', publicPath: '/models/abracadabra.ppn', sensitivity: 0.6 },
    ],
    description: 'Fun activation with "Abracadabra"',
    defaultSensitivity: 0.6,
    requiresCustomModel: true,
    modelPath: '/models/abracadabra.ppn',
  },

  /** Wake word — "Wake Up" */
  WAKE_UP: {
    id: 'wake-up',
    name: 'Wake Up',
    keywords: [
      { label: 'Wake Up', publicPath: '/models/wake-up.ppn', sensitivity: 0.65 },
    ],
    description: 'Classic wake phrase',
    defaultSensitivity: 0.65,
    requiresCustomModel: true,
    modelPath: '/models/wake-up.ppn',
  },

  /** Multiple — "Hey King" OR "Wake Up" */
  DUAL: {
    id: 'dual',
    name: 'Dual Mode (Hey King + Wake Up)',
    keywords: [
      { label: 'Hey King', publicPath: '/models/hey-king.ppn', sensitivity: 0.7 },
      { label: 'Wake Up', publicPath: '/models/wake-up.ppn', sensitivity: 0.65 },
    ],
    description: 'Multiple activation phrases',
    defaultSensitivity: 0.7,
    requiresCustomModel: true,
  },

  /** Built-in (no custom model needed) — uses Porcupine's built-in keywords */
  BUILT_IN_OKAY_GOOGLE: {
    id: 'builtin-okay-google',
    name: 'Okay Google (Built-in)',
    keywords: [
      // BuiltInKeyword uses numeric enum values
      { label: 'Okay Google', sensitivity: 0.5 },
    ],
    description: 'Uses built-in Porcupine keyword (no model file needed)',
    defaultSensitivity: 0.5,
    requiresCustomModel: false,
  },

  BUILT_IN_HEY_GOOGLE: {
    id: 'builtin-hey-google',
    name: 'Hey Google (Built-in)',
    keywords: [{ label: 'Hey Google', sensitivity: 0.5 }],
    description: 'Uses built-in Porcupine keyword (no model file needed)',
    defaultSensitivity: 0.5,
    requiresCustomModel: false,
  },

  BUILT_IN_ALEXA: {
    id: 'builtin-alexa',
    name: 'Alexa (Built-in)',
    keywords: [{ label: 'Alexa', sensitivity: 0.5 }],
    description: 'Uses built-in Porcupine keyword (no model file needed)',
    defaultSensitivity: 0.5,
    requiresCustomModel: false,
  },
};

// =============================================================================
// CUSTOM WAKE WORD TYPE
// =============================================================================

export interface CustomWakeWord {
  /** User-defined label */
  label: string;
  /** Path to .ppn file or base64 string */
  modelSource: {
    type: 'path' | 'base64';
    value: string;
  };
  /** Sensitivity (0.0 - 1.0) */
  sensitivity?: number;
  /** User notes */
  description?: string;
}

// =============================================================================
// WAKE WORD CONFIGURATION
// =============================================================================

export interface WakeWordConfiguration {
  /** Selected preset ID or 'custom' */
  presetId: string;
  /** Custom wake words (if presetId === 'custom') */
  customWakeWords?: CustomWakeWord[];
  /** Global sensitivity override */
  sensitivity?: number;
  /** Picovoice access key */
  accessKey?: string;
  /** Enable wake word detection */
  enabled: boolean;
}

// =============================================================================
// DEFAULT CONFIGURATION
// =============================================================================

export const DEFAULT_WAKE_WORD_CONFIG: WakeWordConfiguration = {
  presetId: 'hey-king',
  enabled: true,
  sensitivity: 0.7,
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Get preset by ID
 */
export function getWakeWordPreset(id: string): WakeWordPreset | undefined {
  return WAKE_WORD_PRESETS[id.toUpperCase().replace(/-/g, '_')];
}

/**
 * Get all available presets as array
 */
export function getAllWakeWordPresets(): WakeWordPreset[] {
  return Object.values(WAKE_WORD_PRESETS);
}

/**
 * Get presets that require custom model files
 */
export function getCustomModelPresets(): WakeWordPreset[] {
  return Object.values(WAKE_WORD_PRESETS).filter((p) => p.requiresCustomModel);
}

/**
 * Get presets using built-in keywords
 */
export function getBuiltInPresets(): WakeWordPreset[] {
  return Object.values(WAKE_WORD_PRESETS).filter((p) => !p.requiresCustomModel);
}

/**
 * Convert preset to PorcupineConfig keywords
 */
export function presetToKeywords(
  preset: WakeWordPreset,
  sensitivityOverride?: number
): PorcupineConfig['keywords'] {
  const sensitivity = sensitivityOverride ?? preset.defaultSensitivity;

  return preset.keywords.map((kw) => ({
    ...kw,
    sensitivity,
  }));
}

/**
 * Convert custom wake word to Porcupine keyword format
 */
export function customWakeWordToKeyword(
  custom: CustomWakeWord,
  sensitivityOverride?: number
): PorcupineConfig['keywords'][0] {
  const sensitivity = sensitivityOverride ?? custom.sensitivity ?? 0.7;

  if (custom.modelSource.type === 'base64') {
    return {
      label: custom.label,
      base64: custom.modelSource.value,
      sensitivity,
    };
  }

  return {
    label: custom.label,
    publicPath: custom.modelSource.value,
    sensitivity,
  };
}

/**
 * Generate PorcupineConfig from WakeWordConfiguration
 */
export function generatePorcupineConfig(
  config: WakeWordConfiguration,
  onWakeWord: (label: string, index: number) => void,
  onError?: (error: Error) => void
): Omit<PorcupineConfig, 'accessKey'> & { keywords: PorcupineConfig['keywords'] } {
  let keywords: PorcupineConfig['keywords'] = [];

  if (config.presetId === 'custom' && config.customWakeWords) {
    // Custom wake words
    keywords = config.customWakeWords.map((cw) =>
      customWakeWordToKeyword(cw, config.sensitivity)
    );
  } else {
    // Preset wake words
    const preset = getWakeWordPreset(config.presetId);
    if (preset) {
      keywords = presetToKeywords(preset, config.sensitivity);
    }
  }

  return {
    keywords,
    onWakeWord,
    onError,
    useWorker: true,
  };
}

/**
 * Validate wake word configuration
 */
export function validateWakeWordConfig(
  config: WakeWordConfiguration
): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!config.accessKey && config.enabled) {
    errors.push('Picovoice access key is required');
  }

  if (config.presetId === 'custom') {
    if (!config.customWakeWords || config.customWakeWords.length === 0) {
      errors.push('At least one custom wake word is required for custom mode');
    } else {
      config.customWakeWords.forEach((cw, i) => {
        if (!cw.label.trim()) {
          errors.push(`Custom wake word ${i + 1}: label is required`);
        }
        if (!cw.modelSource.value.trim()) {
          errors.push(`Custom wake word ${i + 1}: model source is required`);
        }
      });
    }
  } else {
    const preset = getWakeWordPreset(config.presetId);
    if (!preset) {
      errors.push(`Unknown preset: ${config.presetId}`);
    }
  }

  if (config.sensitivity !== undefined) {
    if (config.sensitivity < 0 || config.sensitivity > 1) {
      errors.push('Sensitivity must be between 0.0 and 1.0');
    }
  }

  return { valid: errors.length === 0, errors };
}

/**
 * Storage key for persisting wake word config
 */
export const WAKE_WORD_STORAGE_KEY = 'fykz_wake_word_config';

/**
 * Load wake word config from localStorage
 */
export function loadWakeWordConfig(): WakeWordConfiguration | null {
  try {
    const stored = localStorage.getItem(WAKE_WORD_STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored) as WakeWordConfiguration;
    }
  } catch {
    // Ignore parse errors
  }
  return null;
}

/**
 * Save wake word config to localStorage
 */
export function saveWakeWordConfig(config: WakeWordConfiguration): void {
  try {
    localStorage.setItem(WAKE_WORD_STORAGE_KEY, JSON.stringify(config));
  } catch {
    // Ignore storage errors
  }
}

/**
 * Clear saved wake word config
 */
export function clearWakeWordConfig(): void {
  localStorage.removeItem(WAKE_WORD_STORAGE_KEY);
}

// =============================================================================
// REACT HOOK
// =============================================================================

import { useCallback, useEffect, useState } from 'react';

export interface UseWakeWordConfigReturn {
  config: WakeWordConfiguration;
  setPreset: (presetId: string) => void;
  setCustomWakeWords: (words: CustomWakeWord[]) => void;
  setSensitivity: (sensitivity: number) => void;
  setAccessKey: (key: string) => void;
  setEnabled: (enabled: boolean) => void;
  save: () => void;
  reset: () => void;
  validate: () => { valid: boolean; errors: string[] };
  allPresets: WakeWordPreset[];
  currentPreset: WakeWordPreset | undefined;
}

export function useWakeWordConfig(
  initialConfig?: Partial<WakeWordConfiguration>
): UseWakeWordConfigReturn {
  const [config, setConfig] = useState<WakeWordConfiguration>(() => {
    const saved = loadWakeWordConfig();
    return {
      ...DEFAULT_WAKE_WORD_CONFIG,
      ...saved,
      ...initialConfig,
    };
  });

  const setPreset = useCallback((presetId: string) => {
    setConfig((prev) => ({
      ...prev,
      presetId,
      customWakeWords: undefined, // Clear custom when switching to preset
    }));
  }, []);

  const setCustomWakeWords = useCallback((words: CustomWakeWord[]) => {
    setConfig((prev) => ({
      ...prev,
      presetId: 'custom',
      customWakeWords: words,
    }));
  }, []);

  const setSensitivity = useCallback((sensitivity: number) => {
    setConfig((prev) => ({ ...prev, sensitivity }));
  }, []);

  const setAccessKey = useCallback((accessKey: string) => {
    setConfig((prev) => ({ ...prev, accessKey }));
  }, []);

  const setEnabled = useCallback((enabled: boolean) => {
    setConfig((prev) => ({ ...prev, enabled }));
  }, []);

  const save = useCallback(() => {
    saveWakeWordConfig(config);
  }, [config]);

  const reset = useCallback(() => {
    const resetConfig = {
      ...DEFAULT_WAKE_WORD_CONFIG,
      ...initialConfig,
    };
    setConfig(resetConfig);
    clearWakeWordConfig();
  }, [initialConfig]);

  const validate = useCallback(() => {
    return validateWakeWordConfig(config);
  }, [config]);

  // Auto-save on change (debounced)
  useEffect(() => {
    const timer = setTimeout(() => {
      saveWakeWordConfig(config);
    }, 500);
    return () => clearTimeout(timer);
  }, [config]);

  return {
    config,
    setPreset,
    setCustomWakeWords,
    setSensitivity,
    setAccessKey,
    setEnabled,
    save,
    reset,
    validate,
    allPresets: getAllWakeWordPresets(),
    currentPreset: getWakeWordPreset(config.presetId),
  };
}

export default useWakeWordConfig;
