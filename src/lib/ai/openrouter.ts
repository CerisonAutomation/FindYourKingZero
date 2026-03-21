/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 OPENROUTER AI CLIENT - Simplified AI Integration
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Replaces complex MLC Web-LLM + OpenAI integration with unified OpenRouter API.
 * Uses free OSS models: Llama 3.3, Mistral 7B, Gemma 3 27B, etc.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 */

export const OPENROUTER_BASE = 'https://openrouter.ai/api/v1'

export type OpenRouterMessage =  {
  role: 'system' | 'user' | 'assistant'
  content: string
}

export type OpenRouterOptions =  {
  model?: string
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

// Free OSS models available on OpenRouter
export const OPENROUTER_MODELS = {
  // General purpose - Best for most tasks
  LLAMA_33_70B: 'meta-llama/llama-3.3-70b-instruct:free',
  
  // Fast responses - Good for quick moderation
  MISTRAL_7B: 'mistralai/mistral-7b-instruct:free',
  
  // Profile suggestions - Good for creative writing
  GEMMA_27B: 'google/gemma-3-27b-it:free',
  
  // Complex reasoning - Advanced tasks
  HERMES_405B: 'nousresearch/hermes-3-llama-3.1-405b:free',
  
  // Lightweight - Fast for simple tasks
  QWEN_7B: 'qwen/qwen-2.5-7b-instruct:free',
} as const

export const DEFAULT_MODEL = OPENROUTER_MODELS.LLAMA_33_70B

/**
 * Send chat completion request to OpenRouter
 */
export async function openrouterChat(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<string> {
  const model = options.model ?? DEFAULT_MODEL

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'HTTP-Referer': import.meta.env.VITE_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'FindYourKingZero',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 512,
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`OpenRouter error ${res.status}: ${err}`)
  }

  const data = await res.json() as {
    choices: Array<{ message: { content: string } }>
  }
  return data.choices[0]?.message.content ?? ''
}

/**
 * Streaming chat completion - returns ReadableStream for real-time responses
 */
export async function openrouterStream(
  messages: OpenRouterMessage[],
  options: OpenRouterOptions = {}
): Promise<ReadableStream<string>> {
  const model = options.model ?? DEFAULT_MODEL

  const res = await fetch(`${OPENROUTER_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${import.meta.env.VITE_OPENROUTER_API_KEY}`,
      'HTTP-Referer': import.meta.env.VITE_APP_URL ?? 'http://localhost:3000',
      'X-Title': 'FindYourKingZero',
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens ?? 1024,
      stream: true,
    }),
  })

  if (!res.ok || !res.body) throw new Error(`OpenRouter stream error ${res.status}`)
  return res.body.pipeThrough(new TextDecoderStream()) as ReadableStream<string>
}

/**
 * AI PROMPTS - Optimized for dating app use cases
 */

export const AI_PROMPTS = {
  // Icebreaker suggestions
  ICEBREAKER: {
    system: `You are a dating coach specializing in LGBTQ+ dating. Generate engaging, respectful icebreakers that spark genuine conversations. Keep responses under 100 characters and avoid clichés.`,
    user: (profile: string) => `Suggest 3 icebreakers for someone with this profile: ${profile}`,
  },

  // Profile bio optimization
  BIO_OPTIMIZATION: {
    system: `You are a professional dating profile writer. Help users create authentic, engaging bios that attract compatible partners. Focus on personality, interests, and what makes them unique.`,
    user: (bio: string) => `Optimize this dating profile bio to be more engaging: ${bio}`,
  },

  // Message moderation
  MODERATION: {
    system: `You are a content moderator for a dating app. Analyze messages for inappropriate content, harassment, or spam. Respond with only "APPROVED" or "FLAGGED" and a brief reason.`,
    user: (message: string) => `Moderate this message: ${message}`,
  },

  // Match compatibility analysis
  COMPATIBILITY: {
    system: `You are a relationship compatibility expert. Analyze two profiles and provide a compatibility score (1-10) with brief reasoning. Focus on values, interests, and relationship goals.`,
    user: (profile1: string, profile2: string) => `Analyze compatibility between these profiles: Profile 1: ${profile1} Profile 2: ${profile2}`,
  },

  // Conversation suggestions
  CONVERSATION_HELP: {
    system: `You are a conversation coach. Help users keep conversations flowing naturally with engaging questions and topics. Avoid generic advice and focus on specific context.`,
    user: (context: string) => `Suggest 3 ways to continue this conversation: ${context}`,
  },
} as const

/**
 * Helper function to get AI response for specific use cases
 */
export async function getAIResponse(
  promptType: keyof typeof AI_PROMPTS,
  context: string,
  options?: OpenRouterOptions
): Promise<string> {
  const prompt = AI_PROMPTS[promptType]
  const messages: OpenRouterMessage[] = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: typeof prompt.user === 'string' ? prompt.user : prompt.user(context) },
  ]

  return openrouterChat(messages, options)
}

/**
 * Streaming version for real-time responses
 */
export async function getAIStream(
  promptType: keyof typeof AI_PROMPTS,
  context: string,
  options?: OpenRouterOptions
): Promise<ReadableStream<string>> {
  const prompt = AI_PROMPTS[promptType]
  const messages: OpenRouterMessage[] = [
    { role: 'system', content: prompt.system },
    { role: 'user', content: typeof prompt.user === 'string' ? prompt.user : prompt.user(context) },
  ]

  return openrouterStream(messages, options)
}