import { useState, useCallback, useRef } from 'react';
import { generateObject } from 'ai';
import { openai } from '@ai-sdk/openai';
import { z } from 'zod';
import { log } from '@/lib/enterprise/Logger';

// Auto-reply types
export type AutoReplyConfig = {
  enabled: boolean;
  context: string;
  personality: 'friendly' | 'professional' | 'casual' | 'flirty';
  responseLength: 'short' | 'medium' | 'long';
  autoSend: boolean;
  confidenceThreshold: number;
}

export type MessageContext = {
  conversationId?: string;
  senderName: string;
  senderProfile?: {
    age?: number;
    interests?: string[];
    location?: string;
    bio?: string;
  };
  recentMessages: Array<{
    sender: string;
    content: string;
    timestamp: Date;
  }>;
}

export type AutoReplySuggestion = {
  content: string;
  confidence: number;
  intent: 'reply' | 'question' | 'compliment' | 'emoji' | 'goodbye';
  tone: string;
  reasoning: string;
}

// Auto-reply hook with LLM integration
export const useAutoReply = (config: AutoReplyConfig) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestions, setSuggestions] = useState<AutoReplySuggestion[]>([]);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Response generation schema
  const replySchema = z.object({
    suggestions: z.array(z.object({
      content: z.string().describe('The suggested reply text'),
      confidence: z.number().min(0).max(1).describe('Confidence score 0-1'),
      intent: z.enum(['reply', 'question', 'compliment', 'emoji', 'goodbye']).describe('The intent of the reply'),
      tone: z.string().describe('The tone of the reply (friendly, professional, etc.)'),
      reasoning: z.string().describe('Why this reply is appropriate')
    }))
  });

  // Generate auto-reply suggestions
  const generateReplies = useCallback(async (
    incomingMessage: string,
    context: MessageContext
  ): Promise<AutoReplySuggestion[]> => {
    if (!config.enabled) {
      return [];
    }

    setIsGenerating(true);
    setError(null);

    // Cancel any ongoing generation
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();

    try {
      // Build context prompt
      const contextPrompt = buildContextPrompt(incomingMessage, context);

      log.info('AUTO_REPLY', 'Generating replies', {
        messageLength: incomingMessage.length,
        personality: config.personality
      });

      const result = await generateObject({
        model: openai('gpt-4o-mini'),
        schema: replySchema,
        prompt: contextPrompt,
        temperature: 0.7,
        maxTokens: 500,
        abortSignal: abortControllerRef.current.signal
      });

      // Filter suggestions by confidence threshold
      const filteredSuggestions = result.object.suggestions.filter(
        suggestion => suggestion.confidence >= config.confidenceThreshold
      );

      log.info('AUTO_REPLY', 'Generated suggestions', {
        count: filteredSuggestions.length,
        topConfidence: filteredSuggestions[0]?.confidence || 0
      });

      setSuggestions(filteredSuggestions);
      return filteredSuggestions;

    } catch (err) {
      if (err instanceof Error && err.name === 'AbortError') {
        log.info('AUTO_REPLY', 'Generation aborted');
        return [];
      }

      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      log.error('AUTO_REPLY', 'Failed to generate replies', { errorMessage: errorMessage });
      setError(errorMessage);

      // Fallback to basic replies
      return getFallbackReplies(incomingMessage, context);
    } finally {
      setIsGenerating(false);
      abortControllerRef.current = null;
    }
  }, [config]);

  // Build context-aware prompt for LLM
  const buildContextPrompt = (message: string, context: MessageContext): string => {
    const personalityInstructions = {
      friendly: 'Be warm, approachable, and enthusiastic. Use emojis occasionally.',
      professional: 'Be respectful, articulate, and maintain appropriate boundaries.',
      casual: 'Be relaxed, informal, and use natural conversational language.',
      flirty: 'Be charming, playful, and subtly suggestive without being inappropriate.'
    };

    const lengthInstructions = {
      short: 'Keep responses concise (1-2 sentences).',
      medium: 'Provide moderately detailed responses (2-3 sentences).',
      long: 'Give thoughtful, detailed responses (3+ sentences).'
    };

    let prompt = `You are helping someone write a dating app reply. Generate 3 different reply suggestions based on the context.

Personality: ${config.personality}
Instructions: ${personalityInstructions[config.personality]}
Length: ${config.responseLength}
Instructions: ${lengthInstructions[config.responseLength]}

Incoming message: "${message}"

Context:
- From: ${context.senderName}
- Recent conversation: ${context.recentMessages.slice(-3).map(m => `${m.sender}: ${m.content}`).join('\n')}
`;

    if (context.senderProfile) {
      prompt += `
Sender profile:
${context.senderProfile.age ? `- Age: ${context.senderProfile.age}` : ''}
${context.senderProfile.interests ? `- Interests: ${context.senderProfile.interests.join(', ')}` : ''}
${context.senderProfile.location ? `- Location: ${context.senderProfile.location}` : ''}
${context.senderProfile.bio ? `- Bio: ${context.senderProfile.bio}` : ''}
`;
    }

    prompt += `
Additional context: ${config.context}

Generate 3 diverse reply options that match the personality and length requirements. Each should have:
- content: The actual reply text
- confidence: How confident you are this is a good reply (0-1)
- intent: The primary intent (reply, question, compliment, emoji, goodbye)
- tone: The specific tone of this reply
- reasoning: Brief explanation of why this reply works

Focus on being authentic, engaging, and appropriate for a dating context.`;

    return prompt;
  };

  // Fallback basic replies when LLM fails
  const getFallbackReplies = (message: string, context: MessageContext): AutoReplySuggestion[] => {
    const messageLower = message.toLowerCase();

    const fallbacks: AutoReplySuggestion[] = [];

    // Basic pattern matching for common messages
    if (messageLower.includes('hi') || messageLower.includes('hello') || messageLower.includes('hey')) {
      fallbacks.push({
        content: `Hey ${context.senderName}! How's your day going? 😊`,
        confidence: 0.7,
        intent: 'reply',
        tone: 'friendly',
        reasoning: 'Friendly greeting with a question to continue conversation'
      });
    }

    if (messageLower.includes('how are you')) {
      fallbacks.push({
        content: "I'm doing great, thanks for asking! How about you?",
        confidence: 0.8,
        intent: 'reply',
        tone: 'friendly',
        reasoning: 'Polite response with reciprocal question'
      });
    }

    if (messageLower.includes('what are you up to')) {
      fallbacks.push({
        content: "Just relaxing and enjoying the day. What about you?",
        confidence: 0.7,
        intent: 'reply',
        tone: 'casual',
        reasoning: 'Casual response with reciprocal question'
      });
    }

    if (messageLower.includes('nice to meet you')) {
      fallbacks.push({
        content: `Nice to meet you too ${context.senderName}! 👋`,
        confidence: 0.9,
        intent: 'reply',
        tone: 'friendly',
        reasoning: 'Enthusiastic reciprocal greeting'
      });
    }

    // Default fallback
    if (fallbacks.length === 0) {
      fallbacks.push({
        content: "That's interesting! Tell me more 😊",
        confidence: 0.5,
        intent: 'reply',
        tone: 'friendly',
        reasoning: 'Generic engaging response'
      });
    }

    return fallbacks.slice(0, 3);
  };

  // Auto-send reply if enabled and confidence is high
  const autoSendReply = useCallback(async (
    message: string,
    context: MessageContext,
    onSend: (reply: string) => Promise<void>
  ): Promise<boolean> => {
    if (!config.autoSend) {
      return false;
    }

    const suggestions = await generateReplies(message, context);

    // Find the highest confidence suggestion
    const topSuggestion = suggestions.length > 0 ? suggestions.reduce((best, current) =>
      current.confidence > best.confidence ? current : best
    ) : undefined;

    if (topSuggestion && topSuggestion.confidence >= 0.8) {
      try {
        await onSend(topSuggestion.content);
        log.info('AUTO_REPLY', 'Auto-sent reply', {
          confidence: topSuggestion.confidence,
          intent: topSuggestion.intent
        });
        return true;
      } catch (error) {
        log.error('AUTO_REPLY', 'Failed to auto-send reply', { errorMessage: String(error) });
        return false;
      }
    }

    return false;
  }, [config.autoSend, generateReplies]);

  // Cancel ongoing generation
  const cancelGeneration = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setIsGenerating(false);
      log.info('AUTO_REPLY', 'Generation cancelled by user');
    }
  }, []);

  // Clear suggestions
  const clearSuggestions = useCallback(() => {
    setSuggestions([]);
    setError(null);
  }, []);

  return {
    isGenerating,
    suggestions,
    error,
    generateReplies,
    autoSendReply,
    cancelGeneration,
    clearSuggestions
  };
};

// Voice-activated auto-reply helper
export const useVoiceAutoReply = (config: AutoReplyConfig) => {
  const autoReply = useAutoReply(config);
  const [isVoiceEnabled, setIsVoiceEnabled] = useState(false);

  // Voice-activated reply generation
  const generateVoiceReply = useCallback(async (
    message: string,
    context: MessageContext,
    onSpeak: (text: string) => Promise<void>
  ): Promise<void> => {
    if (!isVoiceEnabled) {
      return;
    }

    const suggestions = await autoReply.generateReplies(message, context);

    if (suggestions.length > 0) {
      const topSuggestion = suggestions[0];
      if (topSuggestion) {
        await onSpeak(topSuggestion.content);

        log.info('VOICE_AUTO_REPLY', 'Spoken reply generated', {
          confidence: topSuggestion.confidence,
          intent: topSuggestion.intent
        });
      }
    }
  }, [autoReply, isVoiceEnabled]);

  return {
    ...autoReply,
    isVoiceEnabled,
    setIsVoiceEnabled,
    generateVoiceReply
  };
};
