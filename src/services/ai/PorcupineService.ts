/**
 * Porcupine Wake Word Service — Hardware-Accelerated Wake Word Detection
 * Keyless (free tier), offline-capable, runs in Web Worker
 *
 * @see https://github.com/Picovoice/porcupine
 * @see https://picovoice.ai/docs/porcupine/
 *
 * FEATURES:
 * - "Hey King" wake word detection
 * - Runs in Web Worker (no UI blocking)
 * - 99.5% accuracy, <50ms latency
 * - Free tier: 100 hours/month per device
 * - Custom wake word training via Picovoice Console
 */

import {
  Porcupine,
  PorcupineWorker,
  type PorcupineKeyword,
  type PorcupineModel,
  type DetectionCallback,
} from '@picovoice/porcupine-web';
import { WebVoiceProcessor } from '@picovoice/web-voice-processor';

// =============================================================================
// TYPES
// =============================================================================

export interface PorcupineConfig {
  /** Picovoice Access Key (free from https://console.picovoice.ai) */
  accessKey: string;
  /** Wake word keywords to detect */
  keywords: Array<{
    /** Label for the keyword */
    label: string;
    /** Path to .ppn file OR base64 string */
    publicPath?: string;
    base64?: string;
    /** Sensitivity 0-1 (default 0.5) */
    sensitivity?: number;
  }>;
  /** Path to porcupine_params.pv model file */
  modelPath?: string;
  /** Use Web Worker for detection (recommended) */
  useWorker?: boolean;
  /** Called when wake word detected */
  onWakeWord: (label: string, index: number) => void;
  /** Called on processing error */
  onError?: (error: Error) => void;
}

export type PorcupineState =
  | 'uninitialized'
  | 'loading'
  | 'ready'
  | 'listening'
  | 'detected'
  | 'error';

// =============================================================================
// BUILT-IN KEYWORDS (no custom training needed)
// =============================================================================

/** Import from @picovoice/porcupine-web */
export { BuiltInKeyword } from '@picovoice/porcupine-web';

// =============================================================================
// PORCUPINE SERVICE CLASS
// =============================================================================

export class PorcupineService {
  private porcupine: Porcupine | PorcupineWorker | null = null;
  private state: PorcupineState = 'uninitialized';
  private config: PorcupineConfig | null = null;

  // Event listeners
  private listeners: {
    onStateChange: Array<(state: PorcupineState) => void>;
    onError: Array<(error: Error) => void>;
  } = { onStateChange: [], onError: [] };

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  async initialize(config: PorcupineConfig): Promise<void> {
    if (this.porcupine) {
      console.warn('[Porcupine] Already initialized');
      return;
    }

    this.config = config;
    this.setState('loading');

    try {
      // Keyword detection callback
      const detectionCallback: DetectionCallback = (keyword) => {
        console.log(`[Porcupine] Detected: ${keyword.label}`);
        this.setState('detected');
        config.onWakeWord(keyword.label, keyword.index);

        // Auto-return to listening after detection
        setTimeout(() => {
          if (this.state === 'detected') {
            this.setState('listening');
          }
        }, 1000);
      };

      // Error callback
      const errorCallback = (error: Error) => {
        console.error('[Porcupine] Error:', error);
        this.setState('error');
        config.onError?.(error);
      };

      // Model configuration
      const model: PorcupineModel = {
        publicPath: config.modelPath || '/models/porcupine_params.pv',
      };

      // Convert keywords to Porcupine format
      const keywords: PorcupineKeyword[] = config.keywords.map((k) => ({
        publicPath: k.publicPath,
        base64: k.base64,
        label: k.label,
        sensitivity: k.sensitivity ?? 0.5,
      }));

      if (config.useWorker !== false) {
        // Use Worker for better performance
        this.porcupine = await PorcupineWorker.create(
          config.accessKey,
          keywords,
          detectionCallback,
          model,
          { processErrorCallback: errorCallback }
        );
      } else {
        // Main thread mode
        this.porcupine = await Porcupine.create(
          config.accessKey,
          keywords,
          detectionCallback,
          model,
          { processErrorCallback: errorCallback }
        );
      }

      this.setState('ready');
      console.log('[Porcupine] Initialized successfully');
    } catch (error) {
      this.setState('error');
      this.emitError(error as Error);
      throw error;
    }
  }

  // =============================================================================
  // START/STOP LISTENING
  // =============================================================================

  async start(): Promise<void> {
    if (!this.porcupine || this.state === 'uninitialized') {
      throw new Error('[Porcupine] Not initialized. Call initialize() first.');
    }

    if (this.state === 'listening') {
      console.warn('[Porcupine] Already listening');
      return;
    }

    try {
      // Subscribe Porcupine to WebVoiceProcessor (static method)
      await WebVoiceProcessor.subscribe(this.porcupine);
      this.setState('listening');

      console.log('[Porcupine] Listening for wake words...');
    } catch (error) {
      this.setState('error');
      this.emitError(error as Error);
      throw error;
    }
  }

  async stop(): Promise<void> {
    if (this.porcupine) {
      await WebVoiceProcessor.unsubscribe(this.porcupine);
    }

    if (this.state === 'listening' || this.state === 'detected') {
      this.setState('ready');
      console.log('[Porcupine] Stopped listening');
    }
  }

  // =============================================================================
  // CLEANUP
  // =============================================================================

  async release(): Promise<void> {
    await this.stop();

    if (this.porcupine) {
      // Type guard for Worker vs non-Worker
      if ('terminate' in this.porcupine) {
        await (this.porcupine as PorcupineWorker).terminate();
      } else {
        await (this.porcupine as Porcupine).release();
      }
      this.porcupine = null;
    }

    this.config = null;
    this.setState('uninitialized');
    console.log('[Porcupine] Released');
  }

  // =============================================================================
  // STATE & INFO
  // =============================================================================

  getState(): PorcupineState {
    return this.state;
  }

  isListening(): boolean {
    return this.state === 'listening';
  }

  isReady(): boolean {
    return this.state === 'ready' || this.state === 'listening';
  }

  // =============================================================================
  // EVENT HANDLING
  // =============================================================================

  onStateChange(callback: (state: PorcupineState) => void): () => void {
    this.listeners.onStateChange.push(callback);
    return () => {
      const index = this.listeners.onStateChange.indexOf(callback);
      if (index > -1) this.listeners.onStateChange.splice(index, 1);
    };
  }

  onError(callback: (error: Error) => void): () => void {
    this.listeners.onError.push(callback);
    return () => {
      const index = this.listeners.onError.indexOf(callback);
      if (index > -1) this.listeners.onError.splice(index, 1);
    };
  }

  private setState(state: PorcupineState): void {
    this.state = state;
    this.listeners.onStateChange.forEach((cb) => cb(state));
  }

  private emitError(error: Error): void {
    this.listeners.onError.forEach((cb) => cb(error));
  }
}

// =============================================================================
// SINGLETON INSTANCE
// =============================================================================

let porcupineInstance: PorcupineService | null = null;

export function getPorcupineService(): PorcupineService {
  if (!porcupineInstance) {
    porcupineInstance = new PorcupineService();
  }
  return porcupineInstance;
}

export function resetPorcupineService(): void {
  porcupineInstance = null;
}

// =============================================================================
// QUICK START FUNCTIONS
// =============================================================================

/**
 * Quick initialization with "Hey King" wake word
 */
export async function initWakeWord(
  accessKey: string,
  onWakeWord: (label: string) => void
): Promise<PorcupineService> {
  const service = getPorcupineService();

  await service.initialize({
    accessKey,
    keywords: [
      { label: 'Hey King', publicPath: '/models/hey-king.ppn', sensitivity: 0.7 },
    ],
    onWakeWord: (label) => onWakeWord(label),
  });

  return service;
}

/**
 * Start listening for wake word
 */
export async function startListening(accessKey: string, onWakeWord: (label: string) => void): Promise<void> {
  const service = getPorcupineService();

  if (!service.isReady()) {
    await initWakeWord(accessKey, onWakeWord);
  }

  await service.start();
}

// =============================================================================
// HOOK FOR REACT
// =============================================================================

import { useCallback, useEffect, useState } from 'react';

export interface UsePorcupineReturn {
  service: PorcupineService;
  state: PorcupineState;
  isReady: boolean;
  isListening: boolean;
  initialize: (config: PorcupineConfig) => Promise<void>;
  start: () => Promise<void>;
  stop: () => Promise<void>;
  release: () => Promise<void>;
  error: Error | null;
}

export function usePorcupine(): UsePorcupineReturn {
  const [service] = useState(() => getPorcupineService());
  const [state, setState] = useState<PorcupineState>(service.getState());
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const unsubscribeState = service.onStateChange(setState);
    const unsubscribeError = service.onError((err) => setError(err));

    return () => {
      unsubscribeState();
      unsubscribeError();
    };
  }, [service]);

  const initialize = useCallback(
    async (config: PorcupineConfig) => {
      setError(null);
      try {
        await service.initialize(config);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [service]
  );

  const start = useCallback(async () => {
    setError(null);
    try {
      await service.start();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [service]);

  const stop = useCallback(async () => {
    try {
      await service.stop();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [service]);

  const release = useCallback(async () => {
    try {
      await service.release();
    } catch (err) {
      setError(err as Error);
      throw err;
    }
  }, [service]);

  return {
    service,
    state,
    isReady: service.isReady(),
    isListening: service.isListening(),
    initialize,
    start,
    stop,
    release,
    error,
  };
}

export default PorcupineService;
