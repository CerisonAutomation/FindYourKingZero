import {useCallback, useRef, useState} from 'react';

export interface AIMessage {
    role: 'user' | 'assistant';
    content: string;
}

const EDGE_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/ai-chat`;

export function useAIChat() {
    const [messages, setMessages] = useState<AIMessage[]>([]);
    const [isStreaming, setIsStreaming] = useState(false);
    const abortRef = useRef<AbortController | null>(null);

    const send = useCallback(async (input: string, context?: string) => {
        const userMsg: AIMessage = {role: 'user', content: input};
        const next = [...messages, userMsg];
        setMessages(next);
        setIsStreaming(true);

        abortRef.current = new AbortController();

        try {
            const resp = await fetch(EDGE_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
                },
                body: JSON.stringify({messages: next, context}),
                signal: abortRef.current.signal,
            });

            if (!resp.ok) {
                const err = await resp.json().catch(() => ({error: 'Request failed'}));
                throw new Error(err.error || 'AI request failed');
            }

            const reader = resp.body!.getReader();
            const decoder = new TextDecoder();
            let buf = '';
            let accumulated = '';

            const upsert = (chunk: string) => {
                accumulated += chunk;
                setMessages(prev => {
                    const last = prev[prev.length - 1];
                    if (last?.role === 'assistant') {
                        return prev.map((m, i) => i === prev.length - 1 ? {...m, content: accumulated} : m);
                    }
                    return [...prev, {role: 'assistant', content: accumulated}];
                });
            };

            while (true) {
                const {done, value} = await reader.read();
                if (done) break;
                buf += decoder.decode(value, {stream: true});
                let nl: number;
                while ((nl = buf.indexOf('\n')) !== -1) {
                    let line = buf.slice(0, nl);
                    buf = buf.slice(nl + 1);
                    if (line.endsWith('\r')) line = line.slice(0, -1);
                    if (!line.startsWith('data: ') || line === 'data: [DONE]') continue;
                    try {
                        const parsed = JSON.parse(line.slice(6));
                        const token = parsed.choices?.[0]?.delta?.content as string | undefined;
                        if (token) upsert(token);
                    } catch {
                        buf = line + '\n' + buf;
                        break;
                    }
                }
            }
        } catch (e: any) {
            if (e?.name !== 'AbortError') {
                setMessages(prev => [...prev, {
                    role: 'assistant',
                    content: `❌ ${e.message || 'Something went wrong'}`
                }]);
            }
        } finally {
            setIsStreaming(false);
        }
    }, [messages]);

    const stop = useCallback(() => {
        abortRef.current?.abort();
        setIsStreaming(false);
    }, []);

    const clear = useCallback(() => setMessages([]), []);

    return {messages, isStreaming, send, stop, clear};
}

// Quick one-shot AI call (no streaming, returns string)
export async function quickAI(prompt: string, systemPrompt?: string): Promise<string> {
    const resp = await fetch(EDGE_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify({
            messages: [{role: 'user', content: prompt}],
            context: systemPrompt,
            stream: false,
        }),
    });
    if (!resp.ok) throw new Error('AI request failed');
    const data = await resp.json();
    return data.content || data.choices?.[0]?.message?.content || '';
}
