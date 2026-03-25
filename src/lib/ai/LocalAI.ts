/**
 * LocalAI — Lightweight on-device AI engine using Transformers.js
 *
 * Uses the smallest viable model (distilgpt2, ~82 MB quantized) so the
 * first download is fast and subsequent loads come straight from the
 * browser cache / IndexedDB.  No server needed.
 *
 * Supported backends: WebGPU → WASM (auto-detected).
 */

import {env, pipeline, type PipelineType,} from '@huggingface/transformers';

// ---------------------------------------------------------------------------
// Configuration
// ---------------------------------------------------------------------------

/** Default model — distilgpt2 is ~82 MB quantized, fast enough for mobile. */
const DEFAULT_MODEL = 'Xenova/distilgpt2';

/** Fallback model if distilgpt2 produces garbage. */
const FALLBACK_MODEL = 'Xenova/gpt2';

/** Maximum new tokens per generation. */
const MAX_NEW_TOKENS = 120;

/** Temperature for general chat. */
const DEFAULT_TEMPERATURE = 0.7;

/** Temperature for icebreakers — slightly higher for creativity. */
const ICEBREAKER_TEMPERATURE = 0.9;

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type IntentType =
  | 'question'
  | 'compliment'
  | 'plan'
  | 'flirt'
  | 'rejection'
  | 'greeting'
  | 'story'
  | 'other';

export interface GenerateOptions {
  /** Max tokens to generate (default 120). */
  maxNewTokens?: number;
  /** Sampling temperature (default 0.7). */
  temperature?: number;
  /** Top-p nucleus sampling (default 0.9). */
  topP?: number;
  /** Repetition penalty (default 1.1). */
  repetitionPenalty?: number;
  /** Abort signal for cancellation. */
  signal?: AbortSignal;
}

export interface LocalAIStatus {
  ready: boolean;
  loading: boolean;
  progress: number; // 0–100
  error: string | null;
  backend: 'webgpu' | 'wasm' | null;
  modelId: string;
}

type Listener = (status: LocalAIStatus) => void;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Detect best available backend. */
async function detectBackend(): Promise<'webgpu' | 'wasm'> {
  try {
    if (typeof navigator !== 'undefined' && 'gpu' in navigator) {
      const adapter = await (navigator as any).gpu?.requestAdapter();
      if (adapter) return 'webgpu';
    }
  } catch {
    /* webgpu not available */
  }
  return 'wasm';
}

/** Intent classification keyword buckets. */
const INTENT_PATTERNS: Record<IntentType, RegExp> = {
  question: /\b(what|how|why|when|where|who|which|do you|are you|can you|would you|could you|is it)\b|\?$/i,
  compliment: /\b(hot|beautiful|cute|gorgeous|handsome|sexy|stunning|pretty|love your|nice pic|wow)\b/i,
  plan: /\b(free|tonight|weekend|date|meet|hang|grab|dinner|coffee|drinks|movie|when are|let'?s)\b/i,
  flirt: /\b(babe|baby|hey cutie|miss you|thinking of you|wish you|dream|cuddle|kiss|😘|😍|🔥)\b/i,
  rejection: /\b(no thanks|not interested|pass|sorry not|good luck|not my type|nope)\b/i,
  greeting: /^(hey|hi|hello|sup|yo|what'?s up|howdy|morning|evening|afternoon)\b/i,
  story: /\b(so |then |funny story|guess what|you won't believe|remember when)\b/i,
  other: /.*/,
};

// ---------------------------------------------------------------------------
// LocalAI Class
// ---------------------------------------------------------------------------

export class LocalAI {
  private generator: any = null;
  private modelId: string;
  private backend: 'webgpu' | 'wasm' | null = null;
  private loading = false;
  private progress = 0;
  private error: string | null = null;
  private listeners = new Set<Listener>();

  constructor(modelId: string = DEFAULT_MODEL) {
    this.modelId = modelId;

    // Tell Transformers.js to cache models in IndexedDB for offline use.
    env.useBrowserCache = true;
    // Allow remote model downloads.
    env.allowLocalModels = false;
  }

  // ── Public status ────────────────────────────────────────────────

  /** Current status snapshot. */
  getStatus(): LocalAIStatus {
    return {
      ready: this.generator !== null,
      loading: this.loading,
      progress: this.progress,
      error: this.error,
      backend: this.backend,
      modelId: this.modelId,
    };
  }

  /** Subscribe to status changes. Returns unsubscribe fn. */
  onStatusChange(cb: Listener): () => void {
    this.listeners.add(cb);
    return () => this.listeners.delete(cb);
  }

  // ── Lifecycle ────────────────────────────────────────────────────

  /**
   * Initialise the model. Safe to call multiple times — subsequent calls
   * resolve immediately if already loaded.
   */
  async init(signal?: AbortSignal): Promise<void> {
    if (this.generator) return;
    if (this.loading) {
      // Wait for the in-flight load to finish.
      await new Promise<void>((resolve, reject) => {
        const unsub = this.onStatusChange((s) => {
          if (s.ready) { unsub(); resolve(); }
          if (s.error) { unsub(); reject(new Error(s.error)); }
        });
        signal?.addEventListener('abort', () => { unsub(); reject(new DOMException('Aborted', 'AbortError')); });
      });
      return;
    }

    this.loading = true;
    this.progress = 0;
    this.error = null;
    this.emit();

    try {
      this.backend = await detectBackend();

      const options: Record<string, any> = {};
      if (this.backend === 'webgpu') {
        options.device = 'webgpu';
        options.dtype = 'q4'; // quantised for speed on WebGPU
      }

      const progressCallback: ProgressCallback = (info: any) => {
        if (info.progress !== undefined) {
          this.progress = Math.round(info.progress);
          this.emit();
        }
      };

      this.generator = await pipeline(
        'text-generation' as PipelineType,
        this.modelId,
        { ...options, progress_callback: progressCallback },
      );

      this.progress = 100;
      this.loading = false;
      this.emit();
    } catch (err: any) {
      this.loading = false;
      this.error = err?.message ?? 'Model load failed';
      this.emit();

      // Auto-fallback to full-precision gpt2 if quantised variant fails.
      if (this.modelId === DEFAULT_MODEL) {
        console.warn('[LocalAI] distilgpt2 failed, falling back to gpt2…');
        this.modelId = FALLBACK_MODEL;
        this.generator = null;
        return this.init(signal);
      }
      throw err;
    }
  }

  /** Release model memory. */
  async dispose(): Promise<void> {
    if (this.generator?.dispose) {
      await this.generator.dispose();
    }
    this.generator = null;
    this.backend = null;
    this.progress = 0;
    this.emit();
  }

  // ── Generation ───────────────────────────────────────────────────

  /**
   * Generate a reply given conversation context.
   *
   * @param context  Full conversation so far as a plain string (each turn
   *                 prefixed with "User: " / "Assistant: ").
   * @param system   Optional system-style prefix prepended to the prompt.
   * @param opts     Generation options.
   */
  async generateReply(
    context: string,
    system?: string,
    opts: GenerateOptions = {},
  ): Promise<string> {
    await this.init(opts.signal);

    const prompt = system
      ? `${system}\n\n${context}\nAssistant:`
      : `${context}\nAssistant:`;

    return this.generate(prompt, {
      maxNewTokens: opts.maxNewTokens ?? MAX_NEW_TOKENS,
      temperature: opts.temperature ?? DEFAULT_TEMPERATURE,
      topP: opts.topP ?? 0.9,
      repetitionPenalty: opts.repetitionPenalty ?? 1.1,
      signal: opts.signal,
    });
  }

  /**
   * Generate an icebreaker / dating opener.
   *
   * @param profileInfo  Short text describing the target profile.
   * @param opts         Generation options.
   */
  async generateIcebreaker(
    profileInfo: string,
    opts: GenerateOptions = {},
  ): Promise<string> {
    await this.init(opts.signal);

    const prompt = [
      'You are a witty, charming dating coach.',
      'Write a single short icebreaker message (1-2 sentences) based on this profile.',
      '',
      `Profile: ${profileInfo}`,
      '',
      'Icebreaker:',
    ].join('\n');

    const raw = await this.generate(prompt, {
      maxNewTokens: 60,
      temperature: opts.temperature ?? ICEBREAKER_TEMPERATURE,
      topP: opts.topP ?? 0.92,
      repetitionPenalty: opts.repetitionPenalty ?? 1.15,
      signal: opts.signal,
    });

    // Clean up — take only the first sentence-ish chunk.
    return this.cleanOutput(raw);
  }

  /**
   * Classify a message's intent.
   * Pure regex — no model inference needed, so it's instant.
   */
  classifyIntent(text: string): IntentType {
    const trimmed = text.trim();
    for (const [type, pattern] of Object.entries(INTENT_PATTERNS) as [IntentType, RegExp][]) {
      if (type === 'other') continue;
      if (pattern.test(trimmed)) return type;
    }
    return 'other';
  }

  // ── Internal ─────────────────────────────────────────────────────

  private async generate(
    prompt: string,
    opts: Required<Pick<GenerateOptions, 'maxNewTokens' | 'temperature' | 'topP' | 'repetitionPenalty'>> & { signal?: AbortSignal },
  ): Promise<string> {
    if (!this.generator) throw new Error('Model not loaded');

    const output = await this.generator(prompt, {
      max_new_tokens: opts.maxNewTokens,
      temperature: opts.temperature,
      top_p: opts.topP,
      repetition_penalty: opts.repetitionPenalty,
      do_sample: true,
    });

    // Pipeline returns [{ generated_text }] for text-generation.
    const full: string = output?.[0]?.generated_text ?? '';
    // Strip the prompt prefix to get only the new text.
    const generated = full.slice(prompt.length).trim();
    return generated || '(no response)';
  }

  /** Strip prompt artifacts and take first coherent chunk. */
  private cleanOutput(text: string): string {
    // Remove any lines that look like prompt echoes.
    const lines = text.split('\n').filter((l) => {
      const lower = l.toLowerCase().trim();
      return (
        lower.length > 0 &&
        !lower.startsWith('profile:') &&
        !lower.startsWith('icebreaker:') &&
        !lower.startsWith('you are') &&
        !lower.startsWith('write a')
      );
    });

    let cleaned = lines.join(' ').trim();

    // Take up to the first period + space (one sentence).
    const periodIdx = cleaned.indexOf('. ');
    if (periodIdx > 10) {
      cleaned = cleaned.slice(0, periodIdx + 1);
    }

    // Fallback if too short.
    if (cleaned.length < 10) {
      cleaned = text.trim().slice(0, 200);
    }

    return cleaned;
  }

  private emit(): void {
    const status = this.getStatus();
    for (const cb of Array.from(this.listeners)) cb(status);
  }
}

// ---------------------------------------------------------------------------
// Singleton (optional convenience)
// ---------------------------------------------------------------------------

let _instance: LocalAI | null = null;

/** Get or create the shared LocalAI singleton. */
export function getLocalAI(modelId?: string): LocalAI {
  if (!_instance) _instance = new LocalAI(modelId);
  return _instance;
}
