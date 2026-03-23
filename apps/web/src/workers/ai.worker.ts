// ═══════════════════════════════════════════════════════════════
// WORKER: AI — Transformers.js v4 (WebGPU)
// Runs off main thread. Zero API keys.
// Models cached to IndexedDB after first download.
// ═══════════════════════════════════════════════════════════════

import { pipeline, env } from '@huggingface/transformers';

// Cache models locally for offline
env.localModelPath = '/models/';
env.allowRemoteModels = true;

// Lazy-loaded pipelines
let smartReply: any = null;
let toxicity: any = null;
let translator: any = null;
let icebreaker: any = null;
let sentiment: any = null;
let embeddings: any = null;
let whisper: any = null;
let tts: any = null;

async function ensurePipeline(name: string) {
  const configs: Record<string, [string, string, object]> = {
    'smart-reply': ['text-generation', 'Xenova/Phi-3-mini-4k-instruct-q4', { device: 'webgpu', dtype: 'q4' }],
    'toxicity': ['text-classification', 'Xenova/toxic-bert', { device: 'webgpu', dtype: 'q8' }],
    'translate': ['translation', 'Xenova/nllb-200-distilled-600M', { device: 'webgpu', dtype: 'q8' }],
    'icebreaker': ['text-generation', 'Xenova/Phi-3-mini-4k-instruct-q4', { device: 'webgpu', dtype: 'q4' }],
    'sentiment': ['text-classification', 'Xenova/distilbert-base-uncased-finetuned-sst-2-english', { device: 'webgpu', dtype: 'q8' }],
    'embeddings': ['feature-extraction', 'Xenova/all-MiniLM-L6-v2', { device: 'webgpu', dtype: 'q8' }],
    'whisper': ['automatic-speech-recognition', 'Xenova/whisper-tiny', { device: 'webgpu', dtype: 'q8' }],
    'tts': ['text-to-speech', 'Xenova/speecht5_tts', { device: 'webgpu', dtype: 'q8' }],
  };

  const [task, model, options] = configs[name]!;

  switch (name) {
    case 'smart-reply': if (!smartReply) smartReply = await pipeline(task as any, model, options); return smartReply;
    case 'toxicity': if (!toxicity) toxicity = await pipeline(task as any, model, options); return toxicity;
    case 'translate': if (!translator) translator = await pipeline(task as any, model, options); return translator;
    case 'icebreaker': if (!icebreaker) icebreaker = await pipeline(task as any, model, options); return icebreaker;
    case 'sentiment': if (!sentiment) sentiment = await pipeline(task as any, model, options); return sentiment;
    case 'embeddings': if (!embeddings) embeddings = await pipeline(task as any, model, options); return embeddings;
    case 'whisper': if (!whisper) whisper = await pipeline(task as any, model, options); return whisper;
    case 'tts': if (!tts) tts = await pipeline(task as any, model, options); return tts;
    default: throw new Error(`Unknown pipeline: ${name}`);
  }
}

function parseSmartReplies(text: string): string[] {
  const matches = text.match(/\d\.\s*([^\n]+)/g) || [];
  return matches.slice(0, 3).map(s => s.replace(/^\d\.\s*/, '').trim()).filter(Boolean);
}

// ── Message handler ───────────────────────────────────────────

self.onmessage = async (e: MessageEvent) => {
  const { type, payload, id } = e.data;

  try {
    let result: any;

    switch (type) {
      // Smart replies: generate 3 contextual responses
      case 'smart-reply': {
        const pipe = await ensurePipeline('smart-reply');
        const out = await pipe(
          `<|user|>Given this message: "${payload.message}"\nGenerate 3 short confident replies numbered 1. 2. 3., max 10 words each.<|end|><|assistant|>`,
          { max_new_tokens: 80, temperature: 0.7, do_sample: true },
        );
        result = parseSmartReplies(out[0]?.generated_text ?? '');
        break;
      }

      // Toxicity check
      case 'toxicity': {
        const pipe = await ensurePipeline('toxicity');
        const out = await pipe(payload.text);
        // out: [{ label: 'toxic', score: 0.95 }, ...]
        result = out.map((r: any) => ({ label: r.label, score: r.score }));
        break;
      }

      // Translation
      case 'translate': {
        const pipe = await ensurePipeline('translate');
        const out = await pipe(payload.text, { src_lang: payload.from, tgt_lang: payload.to });
        result = out[0]?.translation_text ?? '';
        break;
      }

      // Icebreakers: based on shared interests
      case 'icebreaker': {
        const pipe = await ensurePipeline('icebreaker');
        const out = await pipe(
          `<|user|>My interests: ${payload.myTribes.join(', ')}. Their interests: ${payload.theirTribes.join(', ')}. Suggest 3 icebreaker messages, numbered 1. 2. 3., each max 15 words.<|end|><|assistant|>`,
          { max_new_tokens: 100, temperature: 0.8, do_sample: true },
        );
        result = parseSmartReplies(out[0]?.generated_text ?? '');
        break;
      }

      // Sentiment analysis
      case 'sentiment': {
        const pipe = await ensurePipeline('sentiment');
        const out = await pipe(payload.text);
        result = out[0];
        break;
      }

      // Embeddings for vector similarity matching
      case 'embed': {
        const pipe = await ensurePipeline('embeddings');
        const out = await pipe(payload.text, { pooling: 'mean', normalize: true });
        result = Array.from(out.data as Float32Array);
        break;
      }

      // Speech-to-text
      case 'whisper': {
        const pipe = await ensurePipeline('whisper');
        const out = await pipe(payload.audio, { language: payload.lang ?? 'en', task: 'transcribe' });
        result = out.text;
        break;
      }

      // Text-to-speech
      case 'tts': {
        const pipe = await ensurePipeline('tts');
        const out = await pipe(payload.text, { speaker_embeddings: payload.speakerUrl });
        result = out; // Float32Array audio samples
        break;
      }

      // Preload models
      case 'preload': {
        const models = payload.models ?? ['toxicity', 'sentiment'];
        for (const m of models) {
          await ensurePipeline(m);
        }
        result = { loaded: models };
        break;
      }

      // Free GPU memory
      case 'unload': {
        smartReply = toxicity = translator = icebreaker = sentiment = embeddings = whisper = tts = null;
        result = { unloaded: true };
        break;
      }

      default:
        throw new Error(`Unknown AI request type: ${type}`);
    }

    self.postMessage({ id, result });
  } catch (error: any) {
    self.postMessage({ id, error: error.message });
  }
};
