/**
 * AIMatchBadge — Compact compatibility score chip for profile cards
 *
 * Shows AI-computed match percentage. Lazy-loads: only runs
 * MatchMakerAgent.scoreCompatibility() when the user hovers for >300ms,
 * preventing unnecessary computation on scroll.
 *
 * Blueprint reference: MatchMakerAgent (Find, Rank, Explain)
 */

import {useEffect, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {AgentOrchestrator, type MatchScore} from '@/lib/ai/agents/AgentOrchestrator';

interface Props {
    userProfile: Record<string, any>;
    targetProfile: Record<string, any>;
    lazy?: boolean;
}

function getScoreColor(score: number): string {
    if (score >= 80) return 'hsl(142 72% 42%)';
    if (score >= 60) return 'hsl(42 98% 56%)';
    return 'hsl(var(--muted-foreground))';
}

function getScoreEmoji(score: number): string {
    if (score >= 85) return '🔥';
    if (score >= 70) return '✨';
    if (score >= 55) return '😊';
    return '👋';
}

export function AIMatchBadge({userProfile, targetProfile, lazy = true}: Props) {
    const [match, setMatch] = useState<MatchScore | null>(null);
    const [loading, setLoading] = useState(false);
    const [hovered, setHovered] = useState(false);
    const hoverTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const loadedRef = useRef(false);

    const loadScore = () => {
        if (loadedRef.current || loading) return;
        loadedRef.current = true;
        setLoading(true);
        AgentOrchestrator.matchMaker
            .scoreCompatibility(userProfile, targetProfile)
            .then(r => {
                setMatch(r.data);
                setLoading(false);
            })
            .catch(() => setLoading(false));
    };

    useEffect(() => {
        if (!lazy) loadScore();
    }, [lazy]);

    const handleMouseEnter = () => {
        setHovered(true);
        if (lazy) {
            hoverTimerRef.current = setTimeout(loadScore, 320);
        }
    };

    const handleMouseLeave = () => {
        setHovered(false);
        if (hoverTimerRef.current) clearTimeout(hoverTimerRef.current);
    };

    return (
        <div
            className="relative"
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
        >
            <div
                className="flex items-center gap-1 px-1.5 py-0.5 rounded-full cursor-default"
                style={{
                    background: 'hsl(220 18% 2% / 0.7)',
                    backdropFilter: 'blur(8px)',
                    border: '1px solid hsl(0 0% 100% / 0.1)',
                }}
            >
                {loading ? (
                    <div
                        className="w-2.5 h-2.5 rounded-full border border-white/20 border-t-white/70 animate-spin"
                    />
                ) : match ? (
                    <>
                        <span className="text-[8px] leading-none">{getScoreEmoji(match.score)}</span>
                        <span
                            className="text-[8px] font-black leading-none"
                            style={{color: getScoreColor(match.score)}}
                        >
                            {match.score}%
                        </span>
                    </>
                ) : (
                    <span className="text-[7px] font-bold text-white/40">match</span>
                )}
            </div>

            {/* Explanation tooltip */}
            <AnimatePresence>
                {hovered && match && (
                    <motion.div
                        initial={{opacity: 0, y: 4, scale: 0.94}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 4, scale: 0.94}}
                        transition={{duration: 0.15}}
                        className="absolute bottom-full mb-1.5 left-0 z-50 w-[140px]"
                    >
                        <div
                            className="p-2 rounded-[6px]"
                            style={{
                                background: 'hsl(220 14% 8% / 0.97)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid hsl(0 0% 100% / 0.1)',
                                boxShadow: '0 8px 24px hsl(0 0% 0% / 0.5)',
                            }}
                        >
                            <p
                                className="text-[9px] font-black mb-0.5"
                                style={{color: getScoreColor(match.score)}}
                            >
                                {match.score}% Compatible
                            </p>
                            <p className="text-[8.5px] text-white/60 leading-relaxed">{match.explanation}</p>
                            {match.compatibilityFactors.length > 0 && (
                                <div className="flex flex-wrap gap-0.5 mt-1.5">
                                    {match.compatibilityFactors.slice(0, 3).map(f => (
                                        <span
                                            key={f}
                                            className="text-[7px] font-bold px-1 py-0.5 rounded-full text-white/50"
                                            style={{background: 'hsl(0 0% 100% / 0.06)'}}
                                        >
                                            {f}
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
