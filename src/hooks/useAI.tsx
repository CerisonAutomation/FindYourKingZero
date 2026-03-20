import {useState} from 'react';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from './use-toast';

type AIMode = 'chat' | 'auto_reply' | 'icebreaker' | 'bio_suggestions';

interface Message {
    role: 'user' | 'assistant';
    content: string;
}

export const useAI = () => {
    const [isLoading, setIsLoading] = useState(false);
    const {toast} = useToast();

    const generateResponse = async (
        messages: Message[],
        mode: AIMode = 'chat'
    ): Promise<string | null> => {
        setIsLoading(true);
        try {
            const {data, error} = await supabase.functions.invoke('ai-chat', {
                body: {messages, mode},
            });

            if (error) {
                console.error('AI error:', error);
                if (error.message?.includes('429')) {
                    toast({
                        title: 'Rate limit exceeded',
                        description: 'Please wait a moment before trying again.',
                        variant: 'destructive',
                    });
                } else if (error.message?.includes('402')) {
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
        } catch (error) {
            console.error('AI request failed:', error);
            toast({
                title: 'Connection Error',
                description: 'Could not reach AI service.',
                variant: 'destructive',
            });
            return null;
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

export const useAIStream = () => {
    const [isStreaming, setIsStreaming] = useState(false);
    const {toast} = useToast();

    const streamResponse = async (
        messages: Message[],
        onDelta: (chunk: string) => void,
        onDone: () => void
    ) => {
        setIsStreaming(true);

        try {
            const response = await fetch(
                `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-stream`,
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                    },
                    body: JSON.stringify({messages}),
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
                const {done, value} = await reader.read();
                if (done) break;

                buffer += decoder.decode(value, {stream: true});

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
        } catch (error) {
            console.error('Stream error:', error);
            toast({
                title: 'AI Error',
                description: 'Failed to stream response.',
                variant: 'destructive',
            });
            onDone();
        } finally {
            setIsStreaming(false);
        }
    };

    return {
        isStreaming,
        streamResponse,
    };
};
