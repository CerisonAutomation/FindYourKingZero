import {useCallback, useRef, useState} from 'react';
import {useToast} from '@/hooks/use-toast';
import {supabase} from '@/integrations/supabase/client';

// AI Configuration Interface
interface AIConfig {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  enableStreaming?: boolean;
  timeout?: number;
}

// AI Response Interface
interface AIResponse {
  content: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  model?: string;
  finishReason?: string;
}

// AI Hook State Interface
interface UnifiedAIState {
  isLoading: boolean;
  error: string | null;
  response: AIResponse | null;
  conversation: Array<{ role: 'user' | 'assistant'; content: string }>;
}

// AI Hook Options Interface
interface UseUnifiedAIOptions {
  enableHistory?: boolean;
  maxHistoryLength?: number;
  autoRetry?: boolean;
  maxRetries?: number;
  onError?: (error: string) => void;
  onSuccess?: (response: AIResponse) => void;
}

// Unified AI Hook
export function useUnifiedAI(config: AIConfig = {}, options: UseUnifiedAIOptions = {}) {
  const { toast } = useToast();
  const abortControllerRef = useRef<AbortController | null>(null);
  
  // Default configuration
  const defaultConfig: Required<AIConfig> = {
    model: 'gpt-4-turbo-preview',
    temperature: 0.7,
    maxTokens: 1000,
    enableStreaming: true,
    timeout: 30000,
    ...config,
  };

  const defaultOptions: Required<UseUnifiedAIOptions> = {
    enableHistory: true,
    maxHistoryLength: 10,
    autoRetry: true,
    maxRetries: 3,
    onError: () => {},
    onSuccess: () => {},
    ...options,
  };

  // State management
  const [state, setState] = useState<UnifiedAIState>({
    isLoading: false,
    error: null,
    response: null,
    conversation: [],
  });

  // Enhanced bio generation
  const generateBioSuggestion = useCallback(async (
    interests: string[] = [],
    context: string[] = []
  ): Promise<string | null> => {
    const prompt = `Generate a compelling dating bio based on:
    Interests: ${interests.join(', ') || 'Not specified'}
    Context: ${context.join(', ') || 'General dating profile'}
    
    Requirements:
    - 100-200 characters
    - Authentic and engaging
    - Include personality traits
    - Mention specific interests if provided
    - Avoid clichés
    - Make it memorable and unique`;

    return generateContent(prompt);
  }, []);

  // Profile analysis
  const analyzeProfile = useCallback(async (profileData: {
    bio?: string;
    interests?: string[];
    photos?: string[];
    age?: number;
    location?: string;
  }): Promise<string | null> => {
    const prompt = `Analyze this dating profile and provide improvement suggestions:
    
    Bio: ${profileData.bio || 'Not provided'}
    Interests: ${profileData.interests?.join(', ') || 'Not specified'}
    Age: ${profileData.age || 'Not specified'}
    Location: ${profileData.location || 'Not specified'}
    Photos: ${profileData.photos?.length || 0} photos uploaded
    
    Provide specific, actionable suggestions to improve:
    1. Bio quality and authenticity
    2. Interest diversity
    3. Overall appeal
    4. Safety considerations
    
    Keep response under 300 characters.`;

    return generateContent(prompt);
  }, []);

  // Compatibility scoring
  const calculateCompatibility = useCallback(async (
    profile1: any,
    profile2: any
  ): Promise<number> => {
    const prompt = `Calculate compatibility score (0-100) between two profiles:
    
    Profile 1:
    - Bio: ${profile1.bio || 'Not provided'}
    - Interests: ${profile1.interests?.join(', ') || 'Not specified'}
    - Age: ${profile1.age || 'Not specified'}
    
    Profile 2:
    - Bio: ${profile2.bio || 'Not provided'}
    - Interests: ${profile2.interests?.join(', ') || 'Not specified'}
    - Age: ${profile2.age || 'Not specified'}
    
    Consider:
    - Interest overlap
    - Age appropriateness
    - Bio compatibility
    - Personality indicators
    
    Return only a number between 0-100.`;

    const response = await generateContent(prompt);
    const score = parseInt(response?.match(/\d+/)?.[0] || '0');
    return Math.min(100, Math.max(0, score));
  }, []);

  // Content moderation
  const moderateContent = useCallback(async (content: string): Promise<{
    isAppropriate: boolean;
    confidence: number;
    issues: string[];
  }> => {
    const prompt = `Moderate this content for a dating app:
    
    Content: "${content}"
    
    Check for:
    - Inappropriate language
    - Harassment or hate speech
    - Spam or scam content
    - Personal information sharing
    - Violent or harmful content
    
    Respond with JSON format:
    {
      "isAppropriate": boolean,
      "confidence": number (0-1),
      "issues": ["issue1", "issue2"]
    }`;

    try {
      const response = await generateContent(prompt);
      const parsed = JSON.parse(response || '{}');
      return {
        isAppropriate: parsed.isAppropriate ?? true,
        confidence: parsed.confidence ?? 0.5,
        issues: parsed.issues ?? [],
      };
    } catch {
      return {
        isAppropriate: true,
        confidence: 0.5,
        issues: [],
      };
    }
  }, []);

  // Conversation starter suggestions
  const generateConversationStarters = useCallback(async (
    profile: any,
    context: string = 'dating'
  ): Promise<string[]> => {
    const prompt = `Generate 3 conversation starters for ${context} based on this profile:
    
    Bio: ${profile.bio || 'Not provided'}
    Interests: ${profile.interests?.join(', ') || 'Not specified'}
    
    Requirements:
    - Personalized and specific to their profile
    - Open-ended questions
    - Show genuine interest
    - Avoid generic compliments
    - Keep each under 50 characters
    
    Return as a JSON array of strings.`;

    try {
      const response = await generateContent(prompt);
      const parsed = JSON.parse(response || '[]');
      return Array.isArray(parsed) ? parsed.slice(0, 3) : [];
    } catch {
      return [
        "What's your favorite way to spend a weekend?",
        "I noticed you're into [interest] - tell me more!",
        "What's been the best part of your week so far?",
      ];
    }
  }, []);

  // Event description enhancement
  const enhanceEventDescription = useCallback(async (description: string): Promise<string | null> => {
    const prompt = `Enhance this event description to be more engaging and informative:
    
    Original: "${description}"
    
    Improve:
    - Add excitement and energy
    - Include what to expect
    - Mention atmosphere/vibe
    - Add call-to-action
    - Keep under 300 characters
    - Maintain authenticity
    
    Make it compelling but not overly promotional.`;

    return generateContent(prompt);
  }, []);

  // Core content generation function
  const generateContent = useCallback(async (prompt: string): Promise<string | null> => {
    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Create new abort controller
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      // Prepare conversation history
      const messages = [
        {
          role: 'system',
          content: 'You are a helpful AI assistant for a dating app. Be authentic, respectful, and provide practical advice.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ];

      // Add conversation history if enabled
      if (defaultOptions.enableHistory && state.conversation.length > 0) {
        messages.splice(-1, 0, ...state.conversation.slice(-defaultOptions.maxHistoryLength));
      }

      // Call AI function
      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages,
          model: defaultConfig.model,
          temperature: defaultConfig.temperature,
          max_tokens: defaultConfig.maxTokens,
          stream: defaultConfig.enableStreaming,
        },
      });

      if (response.error) {
        throw new Error(response.error.message);
      }

      const content = response.data?.content || response.data || '';
      
      // Update conversation history
      if (defaultOptions.enableHistory) {
        setState(prev => ({
          ...prev,
          conversation: [
            ...prev.conversation.slice(-defaultOptions.maxHistoryLength),
            { role: 'user', content: prompt },
            { role: 'assistant', content },
          ],
        }));
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        response: {
          content,
          usage: response.data?.usage,
          model: response.data?.model,
          finishReason: response.data?.finish_reason,
        },
      }));

      defaultOptions.onSuccess({
        content,
        usage: response.data?.usage,
        model: response.data?.model,
        finishReason: response.data?.finish_reason,
      });

      return content;

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));

      defaultOptions.onError(errorMessage);

      toast({
        title: 'AI Error',
        description: errorMessage,
        variant: 'destructive',
      });

      // Auto-retry if enabled
      if (defaultOptions.autoRetry) {
        // Implementation for retry logic could go here
      }

      return null;
    }
  }, [
    defaultConfig,
    defaultOptions,
    state.conversation,
    toast,
  ]);

  // Clear conversation history
  const clearConversation = useCallback(() => {
    setState(prev => ({
      ...prev,
      conversation: [],
      response: null,
      error: null,
    }));
  }, []);

  // Reset state
  const reset = useCallback(() => {
    setState({
      isLoading: false,
      error: null,
      response: null,
      conversation: [],
    });
  }, []);

  // Cleanup on unmount
  const cleanup = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  // Return hook interface
  return {
    // State
    isLoading: state.isLoading,
    error: state.error,
    response: state.response,
    conversation: state.conversation,

    // Methods
    generateBioSuggestion,
    analyzeProfile,
    calculateCompatibility,
    moderateContent,
    generateConversationStarters,
    enhanceEventDescription,
    generateContent,

    // Utilities
    clearConversation,
    reset,
    cleanup,
  };
}

// Export types for external use
export type { AIConfig, AIResponse, UseUnifiedAIOptions, UnifiedAIState };

export default useUnifiedAI;
