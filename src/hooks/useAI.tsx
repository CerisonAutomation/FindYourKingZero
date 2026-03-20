import { useState, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from './use-toast';
import {
    createStreamingChat,
    generateEmbedding,
    generateProfileEmbeddings,
    checkContentSafety,
    findAIMatches,
    enhanceMessageContent,
    analyzeProfileCompatibility,
    aiTools
} from '@/lib/ai/client';
import type { Profile, Message, MatchingCandidate } from '@/types';

type AIMode = 'chat' | 'auto_reply' | 'icebreaker' | 'bio_suggestions';

interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
}

// Enhanced AI Hook with Vercel AI SDK integration
export const useAI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();

    const generateResponse = async (
        messages: AIMessage[],
        mode: AIMode = 'chat'
    ): Promise<string | null> => {
        setIsLoading(true);
        try {
            // Use Vercel AI SDK for enhanced AI responses
            const { text } = await createStreamingChat(messages, Object.values(aiTools));
            return text;
        } catch (error) {
            console.error('AI request failed:', error);

            // Fallback to edge function
            const { data, error: edgeError } = await supabase.functions.invoke('ai-chat', {
                body: { messages, mode },
            });

            if (edgeError) {
                console.error('AI edge function error:', edgeError);
                if (edgeError.message?.includes('429')) {
                    toast({
                        title: 'Rate limit exceeded',
                        description: 'Please wait a moment before trying again.',
                        variant: 'destructive',
                    });
                } else if (edgeError.message?.includes('402')) {
                    toast({
                        title: 'AI credits exhausted',
                        description: 'Please add credits to continue using AI features.',
                        variant: 'destructive',
                    });
                } else {
                    toast({
                        title: 'AI Error',
                        description: 'Failed to generate response. Please try again.',
                        variant: 'destructive',
                    });
                }
                return null;
            }

            return data?.content || null;
        } finally {
            setIsLoading(false);
        }
    };

    const generateAutoReply = async (conversationContext: string): Promise<string | null> => {
        return generateResponse(
            [{role: 'user', content: `Generate a reply to this message: "${conversationContext}"`}],
            'auto_reply'
        );
    };

    const generateIcebreakers = async (profileInfo?: string): Promise<string[] | null> => {
        const content = profileInfo
            ? `Generate icebreakers for someone who is: ${profileInfo}`
            : 'Generate 3 creative icebreakers for a dating app';

        const response = await generateResponse(
            [{role: 'user', content}],
            'icebreaker'
        );

        if (!response) return null;

        try {
            // Try to parse as JSON array
            const parsed = JSON.parse(response);
            return Array.isArray(parsed) ? parsed : [response];
        } catch {
            // Split by newlines if not valid JSON
            return response.split('\n').filter(line => line.trim());
        }
    };

    const generateBioSuggestion = async (
        interests: string[],
        lookingFor: string[]
    ): Promise<string | null> => {
        return generateResponse(
            [{
                role: 'user',
                content: `Create a bio for someone interested in: ${interests.join(', ')}. They're looking for: ${lookingFor.join(', ')}.`,
            }],
            'bio_suggestions'
        );
    };

    return {
        isLoading,
        generateResponse,
        generateAutoReply,
        generateIcebreakers,
        generateBioSuggestion,
    };
};

// AI Chat Hook with streaming
export function useAIChat(initialMessages: AIMessage[] = []) {
    const [messages, setMessages] = useState(initialMessages);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const abortControllerRef = useRef<AbortController | null>(null);

    const sendMessage = useCallback(async (content: string) => {
        setIsLoading(true);
        setError(null);

        // Cancel previous request if exists
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
        }

        abortControllerRef.current = new AbortController();

        try {
            // Add user message
            const userMessage = { role: 'user' as const, content };
            setMessages(prev => [...prev, userMessage]);

            // Check content safety
            const safetyCheck = await checkContentSafety(content);
            if (!safetyCheck.isSafe) {
                setError('Message contains inappropriate content');
                return;
            }

            // Create streaming chat
            const { text } = await createStreamingChat([...messages, userMessage], Object.values(aiTools));

            // Add assistant response
            const assistantMessage = { role: 'assistant' as const, content: text };
            setMessages(prev => [...prev, assistantMessage]);

        } catch (err) {
            if (err instanceof Error && err.name === 'AbortError') {
                console.log('Request aborted');
            } else {
                setError(err instanceof Error ? err.message : 'Failed to send message');
            }
        } finally {
            setIsLoading(false);
            abortControllerRef.current = null;
        }
    }, [messages]);

    const stopGeneration = useCallback(() => {
        if (abortControllerRef.current) {
            abortControllerRef.current.abort();
            setIsLoading(false);
        }
    }, []);

    const clearMessages = useCallback(() => {
        setMessages([]);
        setError(null);
    }, []);

    return {
        messages,
        isLoading,
        error,
        sendMessage,
        stopGeneration,
        clearMessages,
    };
}

// AI Profile Analysis Hook
export function useProfileAnalysis(profileId: string) {
    return useQuery({
        queryKey: ['profile-analysis', profileId],
        queryFn: async () => {
            const { data: profile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', profileId)
                .single();

            if (!profile) {
                throw new Error('Profile not found');
            }

            const analysis = await analyzeProfileCompatibility(profile);
            return analysis;
        },
        enabled: !!profileId,
        staleTime: 1000 * 60 * 30, // 30 minutes
    });
}

// AI Matching Hook
export function useAIMatching(userId: string, preferences?: any) {
    const queryClient = useQueryClient();

    const {
        data: matches,
        isLoading,
        error,
        refetch,
    } = useQuery({
        queryKey: ['ai-matches', userId, preferences],
        queryFn: async () => {
            const candidates = await findAIMatches(userId, preferences);
            return candidates;
        },
        enabled: !!userId,
        staleTime: 1000 * 60 * 15, // 15 minutes
    });

    const refreshMatches = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: ['ai-matches', userId] });
        refetch();
    }, [userId, queryClient, refetch]);

    return {
        matches: matches || [],
        isLoading,
        error,
        refreshMatches,
    };
}

// Message Enhancement Hook
export function useMessageEnhancement() {
    const [isEnhancing, setIsEnhancing] = useState(false);
    const [enhancements, setEnhancements] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const enhanceMessage = useCallback(async (
        message: string,
        context?: string,
        enhancementType: 'grammar' | 'tone' | 'engagement' | 'icebreaker' = 'engagement'
    ) => {
        setIsEnhancing(true);
        setError(null);

        try {
            const result = await enhanceMessageContent(message, context, enhancementType);
            setEnhancements(result);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to enhance message');
        } finally {
            setIsEnhancing(false);
        }
    }, []);

    const clearEnhancements = useCallback(() => {
        setEnhancements(null);
        setError(null);
    }, []);

    return {
        enhanceMessage,
        enhancements,
        isEnhancing,
        error,
        clearEnhancements,
    };
}

// Profile Embedding Generation Hook
export function useProfileEmbeddings() {
    const queryClient = useQueryClient();

    const mutation = useMutation({
        mutationFn: async (profile: Profile) => {
            const embeddings = await generateProfileEmbeddings(profile);

            // Update profile with embeddings
            await supabase
                .from('profiles')
                .update({
                    profile_embedding: embeddings.profile_embedding,
                    bio_embedding: embeddings.bio_embedding,
                    interests_embedding: embeddings.interests_embedding,
                    embedding_model_version: 'text-embedding-ada-002',
                    embedding_updated_at: new Date().toISOString(),
                })
                .eq('id', profile.id);

            return embeddings;
        },
        onSuccess: (data, variables) => {
            // Invalidate related queries
            queryClient.invalidateQueries({ queryKey: ['profile', variables.id] });
            queryClient.invalidateQueries({ queryKey: ['ai-matches'] });
        },
    });

    return {
        generateEmbeddings: mutation.mutate,
        isLoading: mutation.isPending,
        error: mutation.error,
        data: mutation.data,
    };
}

// Content Safety Hook
export function useContentSafety() {
    const [isChecking, setIsChecking] = useState(false);
    const [safetyResult, setSafetyResult] = useState<any>(null);
    const [error, setError] = useState<string | null>(null);

    const checkSafety = useCallback(async (content: string) => {
        setIsChecking(true);
        setError(null);

        try {
            const result = await checkContentSafety(content);
            setSafetyResult(result);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check content safety');
            return null;
        } finally {
            setIsChecking(false);
        }
    }, []);

    return {
        checkSafety,
        safetyResult,
        isChecking,
        error,
    };
}

// AI-Powered Bio Generation Hook
export function useBioGeneration() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedBio, setGeneratedBio] = useState<string>('');
    const [error, setError] = useState<string | null>(null);

    const generateBio = useCallback(async (profile: Partial<Profile>) => {
        setIsGenerating(true);
        setError(null);

        try {
            const prompt = `
                Generate a compelling dating profile bio based on this information:

                Name: ${profile.name}
                Age: ${profile.age}
                Interests: ${profile.interests?.join(', ') || 'Not specified'}
                Looking for: ${profile.lookingFor?.join(', ') || 'Not specified'}
                Relationship goals: ${profile.relationship_goals}
                Profession: ${profile.occupation || 'Not specified'}
                Education: ${profile.education || 'Not specified'}

                Guidelines:
                - Be authentic and genuine
                - Show personality and humor if appropriate
                - Be specific rather than generic
                - Include what makes them unique
                - Keep it under 300 characters
                - Avoid clichés
                - Make it engaging and approachable

                Generate exactly one bio that captures their personality and what they're looking for.
            `;

            const { text } = await createStreamingChat([
                { role: 'user', content: prompt }
            ]);

            setGeneratedBio(text.trim());
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate bio');
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const clearBio = useCallback(() => {
        setGeneratedBio('');
        setError(null);
    }, []);

    return {
        generateBio,
        generatedBio,
        isGenerating,
        error,
        clearBio,
    };
}

// AI Conversation Starter Hook
export function useConversationStarters() {
    const [isGenerating, setIsGenerating] = useState(false);
    const [starters, setStarters] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const generateStarters = useCallback(async (profile: Profile) => {
        setIsGenerating(true);
        setError(null);

        try {
            const prompt = `
                Generate 5 engaging conversation starters for someone messaging this profile:

                Profile:
                Name: ${profile.name}
                Age: ${profile.age}
                Bio: ${profile.bio || 'No bio provided'}
                Interests: ${profile.interests?.join(', ') || 'No interests listed'}
                Looking for: ${profile.lookingFor?.join(', ') || 'Not specified'}

                Guidelines:
                - Personalize based on their profile
                - Ask open-ended questions
                - Show genuine interest
                - Be creative but not creepy
                - Avoid generic compliments
                - Reference specific interests or details
                - Keep each starter under 100 characters

                Generate exactly 5 conversation starters, each on a new line.
            `;

            const { text } = await createStreamingChat([
                { role: 'user', content: prompt }
            ]);

            const starterList = text.split('\n').filter(line => line.trim()).slice(0, 5);
            setStarters(starterList);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to generate conversation starters');
        } finally {
            setIsGenerating(false);
        }
    }, []);

    const clearStarters = useCallback(() => {
        setStarters([]);
        setError(null);
    }, []);

    return {
        generateStarters,
        starters,
        isGenerating,
        error,
        clearStarters,
    };
}

// Enhanced AI Stream Hook
export const useAIStream = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const { toast } = useToast();

    const streamResponse = async (
        messages: AIMessage[],
        onDelta: (chunk: string) => void,
        onDone: () => void
    ) => {
        setIsStreaming(true);

        try {
            // Try Vercel AI SDK streaming first
            const { text } = await createStreamingChat(messages);

            // Simulate streaming for compatibility
            const words = text.split(' ');
            for (let i = 0; i < words.length; i++) {
                onDelta(words[i] + (i < words.length - 1 ? ' ' : ''));
                await new Promise(resolve => setTimeout(resolve, 50));
            }

            onDone();
        } catch (error) {
            console.error('Stream error:', error);

            // Fallback to edge function streaming
            try {
                const response = await fetch(
                    `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-stream`,
                    {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
                        },
                        body: JSON.stringify({ messages }),
                    }
                );

                if (!response.ok || !response.body) {
                    const errorData = await response.json().catch(() => ({}));
                    if (response.status === 429) {
                        toast({
                            title: 'Rate limit exceeded',
                            description: 'Please wait before trying again.',
                            variant: 'destructive',
                        });
                    } else if (response.status === 402) {
                        toast({
                            title: 'Credits exhausted',
                            description: 'Add credits to continue.',
                            variant: 'destructive',
                        });
                    }
                    throw new Error(errorData.error || 'Stream failed');
                }

                const reader = response.body.getReader();
                const decoder = new TextDecoder();
                let buffer = '';

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    buffer += decoder.decode(value, { stream: true });

                    let newlineIndex: number;
                    while ((newlineIndex = buffer.indexOf('\n')) !== -1) {
                        let line = buffer.slice(0, newlineIndex);
                        buffer = buffer.slice(newlineIndex + 1);

                        if (line.endsWith('\r')) line = line.slice(0, -1);
                        if (line.startsWith(':') || line.trim() === '') continue;
                        if (!line.startsWith('data: ')) continue;

                        const jsonStr = line.slice(6).trim();
                        if (jsonStr === '[DONE]') break;

                        try {
                            const parsed = JSON.parse(jsonStr);
                            const content = parsed.choices?.[0]?.delta?.content;
                            if (content) onDelta(content);
                        } catch {
                            buffer = line + '\n' + buffer;
                            break;
                        }
                    }
                }

                onDone();
            } catch (fallbackError) {
                console.error('Fallback stream error:', fallbackError);
                toast({
                    title: 'AI Error',
                    description: 'Failed to stream response.',
                    variant: 'destructive',
                });
                onDone();
            }
        } finally {
            setIsStreaming(false);
        }
    };

    return {
        isStreaming,
        streamResponse,
    };
};

// ═══════════════════════════════════════════════════════════════════════════════
// BACKWARD COMPATIBILITY EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * @deprecated Use useConversationStarters instead
 */
export const useIcebreakers = useConversationStarters;

/**
 * @deprecated Use useBioGeneration instead
 */
export const useBioOptimizer = useBioGeneration;

/**
 * @deprecated Use useContentSafety instead
 */
export const useModeration = useContentSafety;

/**
 * @deprecated Use useProfileAnalysis instead
 */
export const useCompatibilityAnalysis = useProfileAnalysis;

/**
 * @deprecated Use useConversationStarters instead
 */
export const useConversationHelp = useConversationStarters;

/**
 * @deprecated Use useAIChat instead
 */
export const useAIAssistant = useAIChat;
