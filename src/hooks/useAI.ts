/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * 🚀 AI HOOKS - Simplified OpenRouter Integration
 * ═══════════════════════════════════════════════════════════════════════════════
 *
 * Replaces complex AI hooks with simplified OpenRouter integration.
 * Provides icebreakers, bio optimization, moderation, and compatibility analysis.
 *
 * @author FindYourKingZero Enterprise Team
 * @version 2.0.0
 */

import { useState, useCallback, useRef } from 'react'
import { getAIResponse, getAIStream, AI_PROMPTS, OPENROUTER_MODELS } from '@/lib/ai/openrouter'

export interface UseAIOptions {
  model?: keyof typeof OPENROUTER_MODELS
  temperature?: number
  maxTokens?: number
  stream?: boolean
}

export interface UseAIState {
  response: string
  isLoading: boolean
  error: string | null
  stream: string
}

/**
 * Generic AI hook for any prompt type
 */
export function useAI(promptType: keyof typeof AI_PROMPTS, options: UseAIOptions = {}) {
  const [state, setState] = useState<UseAIState>({
    response: '',
    isLoading: false,
    error: null,
    stream: '',
  })

  const abortControllerRef = useRef<AbortController>()

  const generateResponse = useCallback(async (context: string) => {
    setState(prev => ({ ...prev, isLoading: true, error: null, stream: '' }))

    try {
      abortControllerRef.current = new AbortController()

      if (options.stream) {
        // Streaming response
        const stream = await getAIStream(promptType, context, {
          model: options.model ? OPENROUTER_MODELS[options.model] : undefined,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        })

        const reader = stream.getReader()
        const decoder = new TextDecoder()
        let accumulatedResponse = ''

        while (true) {
          const { done, value } = await reader.read()
          if (done) break

          const chunk = decoder.decode(value)
          accumulatedResponse += chunk
          setState(prev => ({ ...prev, stream: accumulatedResponse }))
        }

        setState(prev => ({ 
          ...prev, 
          response: accumulatedResponse, 
          isLoading: false 
        }))
      } else {
        // Non-streaming response
        const response = await getAIResponse(promptType, context, {
          model: options.model ? OPENROUTER_MODELS[options.model] : undefined,
          temperature: options.temperature,
          maxTokens: options.maxTokens,
        })

        setState(prev => ({ 
          ...prev, 
          response, 
          isLoading: false 
        }))
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Unknown error', 
        isLoading: false 
      }))
    }
  }, [promptType, options])

  const cancel = useCallback(() => {
    abortControllerRef.current?.abort()
    setState(prev => ({ ...prev, isLoading: false }))
  }, [])

  const reset = useCallback(() => {
    setState({
      response: '',
      isLoading: false,
      error: null,
      stream: '',
    })
  }, [])

  return {
    ...state,
    generateResponse,
    cancel,
    reset,
  }
}

/**
 * Icebreaker suggestions hook
 */
export function useIcebreakers(options?: UseAIOptions) {
  const { response, isLoading, error, generateResponse } = useAI('ICEBREAKER', options)

  const generateIcebreakers = useCallback(async (profile: string) => {
    return generateResponse(profile)
  }, [generateResponse])

  return {
    icebreakers: response.split('\n').filter(line => line.trim()).slice(0, 3),
    isLoading,
    error,
    generateIcebreakers,
  }
}

/**
 * Bio optimization hook
 */
export function useBioOptimizer(options?: UseAIOptions) {
  const { response, isLoading, error, generateResponse } = useAI('BIO_OPTIMIZATION', options)

  const optimizeBio = useCallback(async (bio: string) => {
    return generateResponse(bio)
  }, [generateResponse])

  return {
    optimizedBio: response,
    isLoading,
    error,
    optimizeBio,
  }
}

/**
 * Message moderation hook
 */
export function useModeration(options?: UseAIOptions) {
  const { response, isLoading, error, generateResponse } = useAI('MODERATION', {
    ...options,
    temperature: 0.1, // Lower temperature for consistent moderation
  })

  const moderateMessage = useCallback(async (message: string) => {
    await generateResponse(message)
    return response === 'APPROVED'
  }, [generateResponse, response])

  return {
    isApproved: response === 'APPROVED',
    moderationResult: response,
    isLoading,
    error,
    moderateMessage,
  }
}

/**
 * Compatibility analysis hook
 */
export function useCompatibilityAnalysis(options?: UseAIOptions) {
  const { response, isLoading, error, generateResponse } = useAI('COMPATIBILITY', options)

  const analyzeCompatibility = useCallback(async (profile1: string, profile2: string) => {
    const context = `${profile1}\n\n${profile2}`
    return generateResponse(context)
  }, [generateResponse])

  const parseCompatibilityScore = useCallback((analysis: string): number => {
    const match = analysis.match(/(\d+)\/10/i)
    return match ? parseInt(match[1]) : 5
  }, [])

  return {
    compatibilityAnalysis: response,
    compatibilityScore: response ? parseCompatibilityScore(response) : 0,
    isLoading,
    error,
    analyzeCompatibility,
  }
}

/**
 * Conversation help hook
 */
export function useConversationHelp(options?: UseAIOptions) {
  const { response, isLoading, error, generateResponse } = useAI('CONVERSATION_HELP', options)

  const getSuggestions = useCallback(async (context: string) => {
    return generateResponse(context)
  }, [generateResponse])

  return {
    suggestions: response.split('\n').filter(line => line.trim()).slice(0, 3),
    isLoading,
    error,
    getSuggestions,
  }
}

/**
 * AI-powered chat assistant hook
 */
export function useAIAssistant(options?: UseAIOptions) {
  const [messages, setMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([])
  const { response, isLoading, error, generateResponse } = useAI('ICEBREAKER', {
    ...options,
    stream: true,
  })

  const sendMessage = useCallback(async (message: string) => {
    const newMessages = [...messages, { role: 'user' as const, content: message }]
    setMessages(newMessages)

    // Build conversation context
    const context = newMessages.map(m => `${m.role}: ${m.content}`).join('\n')
    
    await generateResponse(context)

    setMessages(prev => [...prev, { role: 'assistant' as const, content: response }])
  }, [messages, generateResponse, response])

  const clearConversation = useCallback(() => {
    setMessages([])
  }, [])

  return {
    messages,
    currentResponse: response,
    isLoading,
    error,
    sendMessage,
    clearConversation,
  }
}