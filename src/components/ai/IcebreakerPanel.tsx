/**
 * IcebreakerPanel — AI-generated opening message suggestions
 *
 * Shown on profile views to help users start the conversation.
 * Uses ChatAssistAgent to generate 3 contextual openers.
 *
 * Blueprint reference: ChatAssist Agent (Icebreaker capability)
 */

import {useCallback, useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Copy, MessageCircle, RefreshCw, Sparkles} from 'lucide-react';
import {AgentOrchestrator} from '@/lib/ai/agents/AgentOrchestrator';
import {cn} from '@/lib/utils';

import {type Profile} from '@/types';

interface Props {
    profile: Profile;
    onUseIcebreaker?: (text: string) => void;
    className?: string;
}

export function IcebreakerPanel({profile, onUseIcebreaker, className}: Props) {
    const [icebreakers, setIcebreakers] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);
    const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

    const load = useCallback(() => {
        setLoading(true);
        AgentOrchestrator.chatAssist.generateIcebreakers(profile).then(r => {
            setIcebreakers(r.data);
            setLoading(false);
        });
    }, [profile]);

    useEffect(load, [load]);

    const handleCopy = async (text: string, idx: number) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedIdx(idx);
            setTimeout(() => setCopiedIdx(null), 1800);
        } catch (e) {
            // Clipboard write failed - ignore
            console.warn('Failed to copy to clipboard:', e);
        }
    };

    return (
        <div
            className={cn('overflow-hidden', className)}
            style={{
                background: 'hsl(var(--surface-1))',
                border: '1px solid hsl(var(--border) / 0.4)',
                borderRadius: 'var(--radius-md)',
            }}
        >
            {/* Header */}
            <div className="flex items-center gap-2.5 px-4 py-3 border-b border-border/20">
                <div
                    className="w-6 h-6 rounded-[5px] flex items-center justify-center shrink-0"
                    style={{background: 'hsl(214 85% 55% / 0.15)'}}
                >
                    <Sparkles className="w-3 h-3" style={{color: 'hsl(214 85% 65%)'}}/>
                </div>
                <p className="text-[12px] font-black text-foreground flex-1">AI Icebreakers</p>
                <button
                    onClick={load}
                    disabled={loading}
                    className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-secondary/50 transition-colors"
                >
                    <RefreshCw className={cn('w-3 h-3 text-muted-foreground/50', loading && 'animate-spin')}/>
                </button>
            </div>

            {/* Suggestions */}
            <div className="px-3 py-3 space-y-2">
                {loading ? (
                    Array.from({length: 3}).map((_, i) => (
                        <div key={i} className="h-9 rounded-[6px] bg-surface-2 animate-pulse"/>
                    ))
                ) : (
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={icebreakers.join('')}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            className="space-y-2"
                        >
                            {icebreakers.map((text, i) => (
                                <motion.div
                                    key={i}
                                    initial={{opacity: 0, y: 6}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: i * 0.07}}
                                    className="flex items-start gap-2 p-2.5 rounded-[6px] group"
                                    style={{
                                        background: 'hsl(var(--surface-2))',
                                        border: '1px solid hsl(var(--border) / 0.25)',
                                    }}
                                >
                                    <p className="text-[11.5px] text-foreground/85 flex-1 leading-relaxed">{text}</p>
                                    <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleCopy(text, i)}
                                            className="w-6 h-6 rounded flex items-center justify-center hover:bg-secondary/60 transition-colors"
                                            title="Copy"
                                        >
                                            <Copy className="w-3 h-3 text-muted-foreground/50"/>
                                        </button>
                                        {onUseIcebreaker && (
                                            <button
                                                onClick={() => onUseIcebreaker(text)}
                                                className="w-6 h-6 rounded flex items-center justify-center transition-colors"
                                                style={{background: 'hsl(var(--primary)/0.12)'}}
                                                title="Use this"
                                            >
                                                <MessageCircle className="w-3 h-3" style={{color: 'hsl(var(--primary))'}}/>
                                            </button>
                                        )}
                                    </div>
                                    {copiedIdx === i && (
                                        <motion.span
                                            initial={{opacity: 0, scale: 0.8}}
                                            animate={{opacity: 1, scale: 1}}
                                            exit={{opacity: 0}}
                                            className="text-[9px] font-bold shrink-0 self-center"
                                            style={{color: 'hsl(142 72% 45%)'}}
                                        >
                                            Copied!
                                        </motion.span>
                                    )}
                                </motion.div>
                            ))}
                        </motion.div>
                    </AnimatePresence>
                )}
            </div>
        </div>
    );
}
