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
    config,
    isVoiceEnabled,
    setIsVoiceEnabled,
    generateVoiceReply
  };
};
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { log } from '@/lib/enterprise/Logger';

// Voice command types
export type VoiceCommand  = {
  command: string;
  action: () => void | Promise<void>;
  description: string;
  keywords: string[];
}

export type VoiceNavigationState  = {
  isListening: boolean;
  isSupported: boolean;
  transcript: string;
  confidence: number;
  error: string | null;
  lastCommand: string | null;
  feedback: string | null;
}

// Voice navigation hook
export const useVoiceNavigation = () => {
  const navigate = useNavigate();
  const recognitionRef = useRef<any>(null);
  const [state, setState] = useState<VoiceNavigationState>({
    isListening: false,
    isSupported: false,
    transcript: '',
    confidence: 0,
    error: null,
    lastCommand: null,
    feedback: null
  });

  // Voice commands registry
  const [commands] = useState<VoiceCommand[]>([
    // Navigation commands
    {
      command: 'go home',
      action: () => navigate('/'),
      description: 'Navigate to home page',
      keywords: ['home', 'main', 'start']
    },
    {
      command: 'go to grid',
      action: () => navigate('/app/grid'),
      description: 'Navigate to discovery grid',
      keywords: ['grid', 'discover', 'browse']
    },
    {
      command: 'go to messages',
      action: () => navigate('/app/messages'),
      description: 'Navigate to messages',
      keywords: ['messages', 'chat', 'conversations']
    },
    {
      command: 'go to events',
      action: () => navigate('/app/events'),
      description: 'Navigate to events',
      keywords: ['events', 'parties', 'chills', 'meetups']
    },
    {
      command: 'go to profile',
      action: () => navigate('/app/profile/me'),
      description: 'Navigate to my profile',
      keywords: ['profile', 'me', 'account']
    },
    {
      command: 'go to settings',
      action: () => navigate('/app/settings'),
      description: 'Navigate to settings',
      keywords: ['settings', 'preferences', 'options']
    },
    {
      command: 'go back',
      action: () => navigate(-1),
      description: 'Go back to previous page',
      keywords: ['back', 'previous', 'return']
    },

    // App actions
    {
      command: 'search profiles',
      action: () => navigate('/app/grid'),
      description: 'Search for profiles',
      keywords: ['search', 'find', 'look for', 'profiles', 'people']
    },
    {
      command: 'create event',
      action: () => navigate('/app/events/create'),
      description: 'Create a new event',
      keywords: ['create', 'new', 'event', 'party', 'meetup']
    },
    {
      command: 'check notifications',
      action: () => navigate('/app/notifications'),
      description: 'Check notifications',
      keywords: ['notifications', 'alerts', 'updates']
    },

    // Quick replies
    {
      command: 'say hello',
      action: async () => {
        setState(prev => ({ ...prev, feedback: 'Hello! How can I help you today?' }));
        await speak('Hello! How can I help you today?');
      },
      description: 'Greeting response',
      keywords: ['hello', 'hi', 'hey']
    },
    {
      command: 'say thanks',
      action: async () => {
        setState(prev => ({ ...prev, feedback: 'You\'re welcome!' }));
        await speak('You\'re welcome!');
      },
      description: 'Thank you response',
      keywords: ['thanks', 'thank you', 'appreciate']
    }
  ]);

  // Text-to-speech function
  const speak = useCallback(async (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;

      // Get available voices and select a good one
      const voices = speechSynthesis.getVoices();
      const preferredVoice = voices.find(voice =>
        voice.lang.includes('en') && voice.name.includes('Female')
      ) || voices.find(voice => voice.lang.includes('en')) || voices[0];

      if (preferredVoice) {
        utterance.voice = preferredVoice;
      }

      speechSynthesis.speak(utterance);
      log.info('VOICE', 'Speaking response', { text });
    }
  }, []);

  // Process voice command
  const processCommand = useCallback(async (transcript: string) => {
    const normalizedTranscript = transcript.toLowerCase().trim();
    log.info('VOICE', 'Processing command', { transcript: normalizedTranscript });

    // Find matching command
    let matchedCommand: VoiceCommand | null = null;
    let bestMatch = 0;

    for (const cmd of commands) {
      // Check exact command match
      if (normalizedTranscript === cmd.command.toLowerCase()) {
        matchedCommand = cmd;
        bestMatch = 100;
        break;
      }

      // Check keyword matches
      const keywordMatches = cmd.keywords.filter(keyword =>
        normalizedTranscript.includes(keyword)
      ).length;

      if (keywordMatches > 0 && keywordMatches > bestMatch) {
        matchedCommand = cmd;
        bestMatch = keywordMatches;
      }
    }

    if (matchedCommand && bestMatch >= 1) {
      setState(prev => ({
        ...prev,
        lastCommand: matchedCommand!.command,
        feedback: `Executing: ${matchedCommand!.description}`
      }));

      try {
        await matchedCommand.action();
        log.info('VOICE', 'Command executed successfully', {
          command: matchedCommand.command
        });
      } catch (error) {
        log.error('VOICE', 'Command execution failed', {
          command: matchedCommand.command,
          errorMessage: String(error)
        });
        setState(prev => ({
          ...prev,
          error: `Failed to execute: ${matchedCommand.command}`,
          feedback: 'Sorry, I couldn\'t execute that command.'
        }));
        await speak('Sorry, I couldn\'t execute that command.');
      }
    } else {
      // Try to handle as a natural language query
      await handleNaturalLanguageQuery(normalizedTranscript);
    }
  }, [commands, navigate, speak]);

  // Handle natural language queries with AI
  const handleNaturalLanguageQuery = useCallback(async (query: string) => {
    setState(prev => ({ ...prev, feedback: 'Processing your request...' }));

    try {
      // Simple pattern matching for common queries
      if (query.includes('help') || query.includes('what can you do')) {
        const helpText = 'You can say things like: "go home", "go to messages", "go to events", "search profiles", or "create event". Try saying "navigate to" followed by any page name.';
        setState(prev => ({ ...prev, feedback: helpText }));
        await speak(helpText);
      } else if (query.includes('where am i')) {
        const currentPath = window.location.pathname;
        setState(prev => ({
          ...prev,
          feedback: `You're currently on: ${currentPath}`
        }));
        await speak(`You're currently on: ${currentPath}`);
      } else {
        setState(prev => ({
          ...prev,
          feedback: 'I didn\'t understand that. Try saying "help" for available commands.'
        }));
        await speak('I didn\'t understand that. Try saying help for available commands.');
      }
    } catch (error) {
      log.error('VOICE', 'Natural language query failed', { query, errorMessage: String(error) });
      setState(prev => ({
        ...prev,
        error: 'Failed to process your request',
        feedback: 'Sorry, I had trouble understanding that.'
      }));
    }
  }, [speak]);

  // Initialize speech recognition
  useEffect(() => {
    const initializeSpeechRecognition = () => {
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          error: 'Speech recognition is not supported in this browser'
        }));
        return;
      }

      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const recognition = new SpeechRecognition();

      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = 'en-US';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setState(prev => ({ ...prev, isListening: true, error: null }));
        log.info('VOICE', 'Speech recognition started');
      };

      recognition.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const result = event.results[i];
          if (result.isFinal) {
            finalTranscript += result[0].transcript;
          } else {
            interimTranscript += result[0].transcript;
          }
        }

        if (finalTranscript) {
          setState(prev => ({
            ...prev,
            transcript: finalTranscript,
            confidence: event.results[event.results.length - 1][0].confidence
          }));

          // Process the final command
          processCommand(finalTranscript);
        } else {
          setState(prev => ({
            ...prev,
            transcript: interimTranscript
          }));
        }
      };

      recognition.onerror = (event: any) => {
        let errorMessage = 'Speech recognition error';

        switch (event.error) {
          case 'no-speech':
            errorMessage = 'No speech detected';
            break;
          case 'audio-capture':
            errorMessage = 'Microphone not available';
            break;
          case 'not-allowed':
            errorMessage = 'Microphone permission denied';
            break;
          case 'network':
            errorMessage = 'Network error';
            break;
          case 'service-not-allowed':
            errorMessage = 'Service not allowed';
            break;
          default:
            errorMessage = `Recognition error: ${event.error}`;
        }

        log.error('VOICE', 'Speech recognition error', { errorMessage: event.error });
        setState(prev => ({
          ...prev,
          error: errorMessage,
          isListening: false
        }));
      };

      recognition.onend = () => {
        setState(prev => ({ ...prev, isListening: false }));
        log.info('VOICE', 'Speech recognition ended');
      };

      recognitionRef.current = recognition;
      setState(prev => ({ ...prev, isSupported: true }));
    };

    initializeSpeechRecognition();

    // Load voices for text-to-speech
    if ('speechSynthesis' in window) {
      speechSynthesis.getVoices();
      speechSynthesis.onvoiceschanged = () => {
        speechSynthesis.getVoices();
      };
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [processCommand]);

  // Control functions
  const startListening = useCallback(() => {
    if (recognitionRef.current && !state.isListening) {
      recognitionRef.current.start();
      log.info('VOICE', 'Started listening');
    }
  }, [state.isListening]);

  const stopListening = useCallback(() => {
    if (recognitionRef.current && state.isListening) {
      recognitionRef.current.stop();
      log.info('VOICE', 'Stopped listening');
    }
  }, [state.isListening]);

  const toggleListening = useCallback(() => {
    if (state.isListening) {
      stopListening();
    } else {
      startListening();
    }
  }, [state.isListening, startListening, stopListening]);

  // Add custom command
  const addCommand = useCallback((command: VoiceCommand) => {
    commands.push(command);
    log.info('VOICE', 'Custom command added', { command: command.command });
  }, [commands]);

  return {
    ...state,
    startListening,
    stopListening,
    toggleListening,
    addCommand,
    commands,
    speak
  };
};

// Type declarations for Web Speech API
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}
