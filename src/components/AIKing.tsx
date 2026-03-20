import {useCallback, useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Bot, ChevronDown, Heart, Mic, MicOff, RefreshCw, Send, Shield, Sparkles, Square, Zap,} from 'lucide-react';
import {cn} from '@/lib/utils';

/* ── Types ───────────────────────────────────────────────────── */
type Message = { id: string; role: 'user' | 'assistant'; content: string };
type Mode = 'companion' | 'coach' | 'safety' | 'icebreaker';

/* ── Mode config ─────────────────────────────────────────────── */
const MODES: {
    id: Mode; label: string; icon: React.ElementType;
    accent: string; prompt: string; chips: string[];
}[] = [
    {
        id: 'companion', label: 'Companion', icon: Heart,
        accent: 'hsl(340 80% 58%)',
        prompt: 'You are a warm, empathetic AI companion for a gay dating app. Be supportive, friendly, and helpful. Keep responses concise and conversational.',
        chips: ['How was your day?', 'I feel lonely', 'Pep talk please', 'Help with my bio'],
    },
    {
        id: 'coach', label: 'Coach', icon: Zap,
        accent: 'hsl(var(--primary))',
        prompt: 'You are a dating coach AI for gay men. Give confident, actionable advice about dating, attraction, and relationships. Be direct and positive.',
        chips: ['How to start a convo?', 'First date tips', 'Moving too fast?', 'Handle rejection'],
    },
    {
        id: 'safety', label: 'Safety', icon: Shield,
        accent: 'hsl(155 65% 42%)',
        prompt: 'You are a safety advisor AI for a dating app. Help users stay safe, recognize red flags, and make smart decisions when meeting people online and in person.',
        chips: ['Is this profile real?', 'Safe meeting tips', 'Red flag checklist', 'Privacy protection'],
    },
    {
        id: 'icebreaker', label: 'Icebreaker', icon: Sparkles,
        accent: 'hsl(var(--accent))',
        prompt: 'You are a witty, fun AI that specializes in creating perfect icebreaker messages for gay dating apps. Keep it flirty, fun, and authentic.',
        chips: ['Write an opener', 'Reply to his message', 'Compliment his profile', 'Funny icebreaker'],
    },
];

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/* ── Streaming helper ────────────────────────────────────────── */
async function streamAI(
    msgs: { role: string; content: string }[],
    systemPrompt: string,
    onToken: (t: string) => void,
    onDone: () => void,
    signal: AbortSignal,
) {
    const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}`},
        body: JSON.stringify({messages: msgs, context: systemPrompt, stream: true}),
        signal,
    });

    if (!resp.ok || !resp.body) {
        onDone();
        return;
    }

    const reader = resp.body.getReader();
    const decoder = new TextDecoder();
    let buf = '';

    while (true) {
        const {done, value} = await reader.read();
        if (done) break;
        buf += decoder.decode(value, {stream: true});
        let nl: number;
        while ((nl = buf.indexOf('\n')) !== -1) {
            let line = buf.slice(0, nl);
            buf = buf.slice(nl + 1);
            if (line.endsWith('\r')) line = line.slice(0, -1);
            if (!line.startsWith('data: ')) continue;
            const raw = line.slice(6).trim();
            if (raw === '[DONE]') {
                onDone();
                return;
            }
            try {
                const chunk = JSON.parse(raw)?.choices?.[0]?.delta?.content;
                if (chunk) onToken(chunk);
            } catch { /* partial line — skip */
            }
        }
    }
    onDone();
}

/* ── Component ───────────────────────────────────────────────── */
export default function AIKing({open, onClose}: { open: boolean; onClose: () => void }) {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState('');
    const [streaming, setStream] = useState(false);
    const [mode, setMode] = useState<Mode>('companion');
    const [listening, setListening] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);
    const abortRef = useRef<AbortController | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const recognRef = useRef<any>(null);

    const currentMode = MODES.find(m => m.id === mode)!;

    /* Welcome message */
    useEffect(() => {
        if (open && messages.length === 0) {
            setMessages([{
                id: 'welcome',
                role: 'assistant',
                content: `Hey King. I'm your AI companion — here to help with dating advice, conversation openers, safety tips, and more. What's on your mind?`,
            }]);
        }
    }, [open]);

    /* Scroll to bottom */
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages]);

    /* Auto-resize textarea */
    const resizeTextarea = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    };

    /* Send message */
    const send = useCallback(async (text?: string) => {
        const content = (text ?? input).trim();
        if (!content || streaming) return;

        setInput('');
        if (textareaRef.current) {
            textareaRef.current.style.height = 'auto';
        }

        const userMsg: Message = {id: crypto.randomUUID(), role: 'user', content};
        const assistId = crypto.randomUUID();

        setMessages(prev => [
            ...prev,
            userMsg,
            {id: assistId, role: 'assistant', content: ''},
        ]);
        setStream(true);

        abortRef.current = new AbortController();

        try {
            await streamAI(
                [...messages, userMsg].map(m => ({role: m.role, content: m.content})),
                currentMode.prompt,
                (token) => setMessages(prev => prev.map(m =>
                    m.id === assistId ? {...m, content: m.content + token} : m
                )),
                () => setStream(false),
                abortRef.current.signal,
            );
        } catch (e: any) {
            if (e?.name !== 'AbortError') {
                setMessages(prev => prev.map(m =>
                    m.id === assistId ? {...m, content: 'Something went wrong. Please try again.'} : m
                ));
                setStream(false);
            }
        }
    }, [input, streaming, messages, currentMode.prompt]);

    const stop = () => {
        abortRef.current?.abort();
        setStream(false);
    };

    const clear = () => {
        abortRef.current?.abort();
        setStream(false);
        setMessages([]);
        setTimeout(() => setMessages([{
            id: 'welcome',
            role: 'assistant',
            content: `Fresh start. What's on your mind, King?`,
        }]), 60);
    };

    /* Voice input */
    const toggleVoice = () => {
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;

        if (listening) {
            recognRef.current?.stop();
            setListening(false);
            return;
        }

        const r = new SR();
        r.lang = 'en-US';
        r.interimResults = false;
        r.onresult = (e: any) => {
            const t = e.results[0][0].transcript;
            setInput(p => (p + ' ' + t).trim());
            resizeTextarea();
        };
        r.onend = () => setListening(false);
        r.start();
        recognRef.current = r;
        setListening(true);
    };

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            send();
        }
    };

    return (
        <AnimatePresence>
            {open && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        key="backdrop"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 z-[90]"
                        style={{background: 'hsl(0 0% 0%/0.65)', backdropFilter: 'blur(10px)'}}
                        onClick={onClose}
                    />

                    {/* Sheet */}
                    <motion.div
                        key="sheet"
                        initial={{y: '100%'}}
                        animate={{y: 0}}
                        exit={{y: '100%'}}
                        transition={{type: 'spring', stiffness: 480, damping: 42}}
                        className="fixed bottom-0 left-0 right-0 z-[91] flex flex-col rounded-t-[28px] overflow-hidden"
                        style={{
                            height: '90dvh',
                            background: 'hsl(var(--background))',
                            borderTop: '1px solid hsl(var(--border)/0.2)',
                            boxShadow: '0 -20px 80px hsl(0 0% 0%/0.7)',
                        }}
                        onClick={e => e.stopPropagation()}
                    >
                        {/* Drag handle */}
                        <div className="flex justify-center pt-3 pb-1 flex-shrink-0">
                            <div className="w-9 h-[3px] rounded-full bg-border/50"/>
                        </div>

                        {/* ── Header ── */}
                        <header className="flex-shrink-0 px-4 pb-3 border-b border-border/20">
                            <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-2.5">
                                    <motion.div
                                        className="w-9 h-9 rounded-2xl flex items-center justify-center"
                                        style={{
                                            background: 'var(--gradient-primary)',
                                            boxShadow: `0 4px 20px hsl(var(--primary)/0.45)`
                                        }}
                                        animate={streaming ? {scale: [1, 1.06, 1]} : {}}
                                        transition={{duration: 1.2, repeat: Infinity}}
                                    >
                                        <Bot className="w-4.5 h-4.5 text-white" strokeWidth={2.5}/>
                                    </motion.div>
                                    <div>
                                        <p className="font-black text-[13px] tracking-tight">AI King</p>
                                        <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-widest">
                                            {streaming ? 'Thinking...' : 'Your AI companion'}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-1.5">
                                    <button
                                        onClick={clear}
                                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all"
                                        style={{background: 'hsl(var(--secondary)/0.7)'}}
                                        title="New conversation"
                                    >
                                        <RefreshCw className="w-3.5 h-3.5 text-muted-foreground"/>
                                    </button>
                                    <button
                                        onClick={onClose}
                                        className="w-8 h-8 rounded-full flex items-center justify-center active:scale-90 transition-all"
                                        style={{background: 'hsl(var(--secondary)/0.7)'}}
                                    >
                                        <ChevronDown className="w-3.5 h-3.5 text-muted-foreground"/>
                                    </button>
                                </div>
                            </div>

                            {/* Mode pills */}
                            <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
                                {MODES.map(m => {
                                    const Icon = m.icon;
                                    const active = mode === m.id;
                                    return (
                                        <motion.button
                                            key={m.id}
                                            onClick={() => setMode(m.id)}
                                            whileTap={{scale: 0.92}}
                                            className={cn(
                                                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-bold border shrink-0 transition-all duration-200',
                                                active
                                                    ? 'text-white border-transparent shadow-lg'
                                                    : 'border-border/30 text-muted-foreground bg-secondary/40 hover:border-border/60',
                                            )}
                                            style={active ? {
                                                background: m.accent,
                                                boxShadow: `0 4px 16px ${m.accent}55`
                                            } : {}}
                                        >
                                            <Icon className="w-3 h-3" strokeWidth={2.5}/>
                                            {m.label}
                                        </motion.button>
                                    );
                                })}
                            </div>
                        </header>

                        {/* ── Messages ── */}
                        <div className="flex-1 overflow-y-auto scrollbar-hide px-4 py-3 space-y-2 min-h-0">
                            <AnimatePresence initial={false}>
                                {messages.map((msg) => (
                                    <motion.div
                                        key={msg.id}
                                        initial={{opacity: 0, y: 8, scale: 0.96}}
                                        animate={{opacity: 1, y: 0, scale: 1}}
                                        transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                                        className={cn('flex gap-2 max-w-[90%]', msg.role === 'user' ? 'ml-auto flex-row-reverse' : 'mr-auto')}
                                    >
                                        {msg.role === 'assistant' && (
                                            <div
                                                className="w-6 h-6 rounded-full flex items-center justify-center shrink-0 mt-0.5"
                                                style={{
                                                    background: 'var(--gradient-primary)',
                                                    boxShadow: '0 2px 8px hsl(var(--primary)/0.3)'
                                                }}>
                                                <Bot className="w-3 h-3 text-white" strokeWidth={2.5}/>
                                            </div>
                                        )}
                                        <div
                                            className={cn('px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed', msg.role === 'user' ? 'rounded-tr-md text-white' : 'rounded-tl-md border border-border/20')}
                                            style={msg.role === 'user'
                                                ? {background: 'var(--gradient-primary)'}
                                                : {background: 'hsl(var(--card))'}
                                            }
                                        >
                                            {msg.content ? (
                                                <span style={{whiteSpace: 'pre-wrap'}}>{msg.content}
                                                    {/* Cursor while streaming */}
                                                    {streaming && msg.role === 'assistant' && messages[messages.length - 1]?.id === msg.id && (
                                                        <motion.span
                                                            animate={{opacity: [1, 0, 1]}}
                                                            transition={{duration: 0.8, repeat: Infinity}}
                                                            className="inline-block w-0.5 h-3.5 ml-0.5 rounded-full align-middle"
                                                            style={{background: 'hsl(var(--muted-foreground))'}}
                                                        />
                                                    )}
                        </span>
                                            ) : (
                                                /* Loading dots */
                                                <div className="flex gap-1 items-center py-0.5 px-1">
                                                    {[0, 1, 2].map(i => (
                                                        <motion.div key={i} className="w-1.5 h-1.5 rounded-full"
                                                                    style={{background: 'hsl(var(--muted-foreground)/0.5)'}}
                                                                    animate={{
                                                                        scale: [1, 1.5, 1],
                                                                        opacity: [0.4, 1, 0.4]
                                                                    }}
                                                                    transition={{
                                                                        duration: 1,
                                                                        delay: i * 0.18,
                                                                        repeat: Infinity
                                                                    }}
                                                        />
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Quick prompt chips — only on fresh start */}
                            {messages.length <= 1 && (
                                <motion.div
                                    initial={{opacity: 0, y: 6}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.2}}
                                    className="pt-3 space-y-2"
                                >
                                    <p className="text-[9px] font-black text-muted-foreground/60 uppercase tracking-[0.14em] text-center">Quick
                                        start</p>
                                    <div className="grid grid-cols-2 gap-1.5">
                                        {currentMode.chips.map(chip => (
                                            <button
                                                key={chip}
                                                onClick={() => send(chip)}
                                                className="px-3 py-2.5 rounded-xl text-[11px] font-semibold text-left leading-tight border border-border/30 bg-secondary/40 hover:border-primary/30 active:scale-95 transition-all"
                                            >
                                                {chip}
                                            </button>
                                        ))}
                                    </div>
                                </motion.div>
                            )}

                            <div ref={bottomRef} className="h-1"/>
                        </div>

                        {/* ── Input dock ── */}
                        <div
                            className="flex-shrink-0 px-3 pt-2 pb-3 border-t border-border/15"
                            style={{
                                paddingBottom: 'max(env(safe-area-inset-bottom), 12px)',
                                background: 'hsl(var(--background)/0.97)',
                                backdropFilter: 'blur(20px)',
                            }}
                        >
                            <div className="flex items-end gap-2">
                                {/* Voice */}
                                <motion.button
                                    whileTap={{scale: 0.88}}
                                    onClick={toggleVoice}
                                    className={cn(
                                        'w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-all',
                                        listening ? 'border border-destructive/60' : 'border border-border/30 bg-secondary/50',
                                    )}
                                    style={listening ? {background: 'hsl(var(--destructive)/0.15)'} : {}}
                                    title="Voice input"
                                >
                                    {listening
                                        ? <motion.div animate={{scale: [1, 1.2, 1]}}
                                                      transition={{duration: 0.8, repeat: Infinity}}><Mic
                                            className="w-4 h-4 text-destructive"/></motion.div>
                                        : <MicOff className="w-4 h-4 text-muted-foreground/60"/>
                                    }
                                </motion.button>

                                {/* Text input */}
                                <textarea
                                    ref={textareaRef}
                                    rows={1}
                                    placeholder={`Ask ${currentMode.label} AI…`}
                                    value={input}
                                    onChange={e => {
                                        setInput(e.target.value);
                                        resizeTextarea();
                                    }}
                                    onKeyDown={handleKey}
                                    className="flex-1 resize-none bg-secondary/40 border border-border/25 rounded-2xl px-4 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/45 focus:outline-none focus:border-primary/40 leading-snug min-h-[40px] max-h-[120px] transition-colors"
                                />

                                {/* Send / Stop */}
                                {streaming ? (
                                    <motion.button
                                        whileTap={{scale: 0.88}}
                                        onClick={stop}
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 border border-border/30 bg-secondary/50"
                                    >
                                        <Square className="w-3.5 h-3.5 text-muted-foreground" fill="currentColor"/>
                                    </motion.button>
                                ) : (
                                    <motion.button
                                        whileTap={{scale: 0.88}}
                                        onClick={() => send()}
                                        disabled={!input.trim()}
                                        className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
                                        style={{
                                            background: 'var(--gradient-primary)',
                                            boxShadow: input.trim() ? '0 4px 20px hsl(var(--primary)/0.45)' : 'none',
                                        }}
                                    >
                                        <Send className="w-4 h-4 text-white" strokeWidth={2.5}/>
                                    </motion.button>
                                )}
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
