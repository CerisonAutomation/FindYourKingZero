/**
 * WebLLM Service — Local LLM Inference in Browser
 * Keyless, offline-capable, WebGPU-accelerated
 *
 * @see https://github.com/mlc-ai/web-llm
 * @see https://webllm.mlc.ai/docs/
 *
 * FEATURES:
 * - Zero API keys required
 * - Full OpenAI API compatibility
 * - Streaming responses
 * - Web Worker offloading
 * - Offline capable after model load
 */

import {
  CreateMLCEngine,
  MLCEngine,
  type ChatCompletionMessageParam,
  type InitProgressReport,
} from '@mlc-ai/web-llm';

// =============================================================================
// TYPES
// =============================================================================

export interface WebLLMConfig {
  /** Model ID from https://mlc.ai/models */
  modelId: string;
  /** Progress callback during model download/init */
  onProgress?: (progress: InitProgressReport) => void;
  /** Use Web Worker for inference (better UI performance) */
  useWebWorker?: boolean;
  /** Worker URL (required if useWebWorker=true) */
  workerUrl?: string;
}

export interface WebLLMChatOptions {
  messages: ChatCompletionMessageParam[];
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
}

export interface WebLLMResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export type WebLLMState =
  | 'uninitialized'
  | 'downloading'
  | 'initializing'
  | 'ready'
  | 'generating'
  | 'error';

// =============================================================================
// RECOMMENDED MODELS (sorted by size/speed)
// =============================================================================

export const RECOMMENDED_MODELS = {
  /** Fastest, smallest — good for simple Q&A */
  PHI_MINI: 'Phi-3.5-mini-instruct-q4f16_1-MLC',
  /** Balanced speed/quality — best general purpose */
  GEMMA_2B: 'gemma-2-2b-it-q4f16_1-MLC',
  /** Larger, slower — better reasoning */
  LLAMA_8B: 'Llama-3.1-8B-Instruct-q4f16_1-MLC',
  /** Multilingual powerhouse */
  QWEN_7B: 'Qwen2.5-7B-Instruct-q4f16_1-MLC',
  /** Tiny, ultra-fast — limited capability */
  QWEN_SMALL: 'Qwen2.5-0.5B-Instruct-q4f16_1-MLC',
} as const;

// =============================================================================
// WEBLLM SERVICE CLASS
// =============================================================================

export class WebLLMService {
  private engine: MLCEngine | null = null;
  private state: WebLLMState = 'uninitialized';
  private modelId: string | null = null;

  // Event listeners
  private listeners: {
    onStateChange: Array<(state: WebLLMState) => void>;
    onError: Array<(error: Error) => void>;
  } = { onStateChange: [], onError: [] };

  // =============================================================================
  // INITIALIZATION
  // =============================================================================

  async initialize(config: WebLLMConfig): Promise<void> {
    if (this.engine) {
      console.warn('[WebLLM] Already initialized');
      return;
    }

    this.modelId = config.modelId;
    this.setState('downloading');

    try {
      const progressCallback = (report: InitProgressReport) => {
        console.log(
          `[WebLLM] ${report.text} — ${Math.round(report.progress * 100)}%`
        );
        config.onProgress?.(report);

        if (report.progress >= 1) {
          this.setState('ready');
        }
      };

      // NOTE: Web Worker mode has type issues - using main thread for now
      // For production, create a separate worker file and use CreateWebWorkerMLCEngine
      this.engine = await CreateMLCEngine(config.modelId, {
        initProgressCallback: progressCallback,
      });

      console.log('[WebLLM] Initialized successfully');
    } catch (error) {
      this.setState('error');
      this.emitError(error as Error);
      throw error;
    }
  }

  // =============================================================================
  // CHAT COMPLETION
  // =============================================================================

  async chat(options: WebLLMChatOptions): Promise<WebLLMResponse> {
    if (!this.engine || this.state !== 'ready') {
      throw new Error('[WebLLM] Not initialized. Call initialize() first.');
    }

    this.setState('generating');

    try {
      const response = await this.engine.chat.completions.create({
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 512,
        stream: false,
      });

      this.setState('ready');

      return {
        content: response.choices[0]?.message?.content ?? '',
        usage: response.usage
          ? {
              promptTokens: response.usage.prompt_tokens,
              completionTokens: response.usage.completion_tokens,
              totalTokens: response.usage.total_tokens,
            }
          : undefined,
      };
    } catch (error) {
      this.setState('error');
      this.emitError(error as Error);
      throw error;
    }
  }

  // =============================================================================
  // STREAMING CHAT
  // =============================================================================

  async *streamChat(
    options: WebLLMChatOptions
  ): AsyncGenerator<string, WebLLMResponse, unknown> {
    if (!this.engine || this.state !== 'ready') {
      throw new Error('[WebLLM] Not initialized. Call initialize() first.');
    }

    this.setState('generating');

    try {
      const chunks = await this.engine.chat.completions.create({
        messages: options.messages,
        temperature: options.temperature ?? 0.7,
        max_tokens: options.maxTokens ?? 512,
        stream: true,
        stream_options: { include_usage: true },
      });

      let fullContent = '';
      let usage: WebLLMResponse['usage'];

      for await (const chunk of chunks) {
        const content = chunk.choices[0]?.delta?.content ?? '';
        fullContent += content;
        yield content;

        // Last chunk has usage stats
        if (chunk.usage) {
          usage = {
            promptTokens: chunk.usage.prompt_tokens,
            completionTokens: chunk.usage.completion_tokens,
            totalTokens: chunk.usage.total_tokens,
          };
        }
      }

      this.setState('ready');

      return { content: fullContent, usage };
    } catch (error) {
      this.setState('error');
      this.emitError(error as Error);
      throw error;
    }
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  async unload(): Promise<void> {
    if (this.engine) {
      await this.engine.unload();
      this.engine = null;
      this.modelId = null;
      this.setState('uninitialized');
      console.log('[WebLLM] Unloaded');
    }
  }

  getState(): WebLLMState {
    return this.state;
  }

  isReady(): boolean {
    return this.state === 'ready';
  }

  getLoadedModel(): string | null {
    return this.modelId;
  }

  // =============================================================================
  // EVENT HANDLING
  // =============================================================================

  onStateChange(callback: (state: WebLLMState) => void): () => void {
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

  private setState(state: WebLLMState): void {
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

let webLLMInstance: WebLLMService | null = null;

export function getWebLLMService(): WebLLMService {
  if (!webLLMInstance) {
    webLLMInstance = new WebLLMService();
  }
  return webLLMInstance;
}

export function resetWebLLMService(): void {
  webLLMInstance = null;
}

// =============================================================================
// QUICK START FUNCTIONS
// =============================================================================

/**
 * Quick initialization with recommended model
 */
export async function initWebLLM(
  onProgress?: (progress: InitProgressReport) => void
): Promise<WebLLMService> {
  const service = getWebLLMService();
  await service.initialize({
    modelId: RECOMMENDED_MODELS.PHI_MINI,
    onProgress,
  });
  return service;
}

/**
 * Quick chat completion
 */
export async function quickChat(
  message: string,
  systemPrompt?: string
): Promise<string> {
  const service = getWebLLMService();

  if (!service.isReady()) {
    await initWebLLM();
  }

  const messages: ChatCompletionMessageParam[] = [];
  if (systemPrompt) {
    messages.push({ role: 'system', content: systemPrompt });
  }
  messages.push({ role: 'user', content: message });

  const response = await service.chat({ messages });
  return response.content;
}

// =============================================================================
// HOOK FOR REACT
// =============================================================================

import { useCallback, useEffect, useState } from 'react';

export interface UseWebLLMReturn {
  service: WebLLMService;
  state: WebLLMState;
  isReady: boolean;
  progress: InitProgressReport | null;
  initialize: (config: WebLLMConfig) => Promise<void>;
  chat: (options: WebLLMChatOptions) => Promise<WebLLMResponse>;
  streamChat: (
    options: WebLLMChatOptions
  ) => AsyncGenerator<string, void, unknown>;
  error: Error | null;
}

export function useWebLLM(): UseWebLLMReturn {
  const [service] = useState(() => getWebLLMService());
  const [state, setState] = useState<WebLLMState>(service.getState());
  const [progress, setProgress] = useState<InitProgressReport | null>(null);
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
    async (config: WebLLMConfig) => {
      setError(null);
      try {
        await service.initialize({
          ...config,
          onProgress: (p) => {
            setProgress(p);
            config.onProgress?.(p);
          },
        });
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [service]
  );

  const chat = useCallback(
    async (options: WebLLMChatOptions) => {
      setError(null);
      try {
        return await service.chat(options);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [service]
  );

  const streamChat = useCallback(
    async function* (options: WebLLMChatOptions) {
      setError(null);
      try {
        yield* service.streamChat(options);
      } catch (err) {
        setError(err as Error);
        throw err;
      }
    },
    [service]
  );

  return {
    service,
    state,
    isReady: state === 'ready',
    progress,
    initialize,
    chat,
    streamChat,
    error,
  };
}

export default WebLLMService;
