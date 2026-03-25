/**
 * ProfileOptimizerPanel — AI-powered profile completeness + improvement suggestions
 *
 * Uses ProfileOptimizerAgent to analyze the user's profile and surface
 * actionable suggestions with priority indicators.
 *
 * Blueprint reference: ProfileOptimizer Agent (Enhance, Analyze, Suggest)
 */

import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ChevronDown, ChevronUp, Sparkles, X} from 'lucide-react';
import {AgentOrchestrator, type ProfileSuggestion} from '@/lib/ai/agents/AgentOrchestrator';
import {cn} from '@/lib/utils';

interface Props {
    profile: Record<string, any>;
    onDismiss?: () => void;
    className?: string;
}

const PRIORITY_CONFIG = {
    high: {
        label: 'High impact',
        color: 'hsl(0 72% 55%)',
        bg: 'hsl(0 72% 55% / 0.1)',
        border: 'hsl(0 72% 55% / 0.25)',
    },
    medium: {
        label: 'Medium impact',
        color: 'hsl(42 98% 56%)',
        bg: 'hsl(42 98% 56% / 0.1)',
        border: 'hsl(42 98% 56% / 0.25)',
    },
    low: {
        label: 'Nice to have',
        color: 'hsl(var(--muted-foreground))',
        bg: 'hsl(var(--surface-2))',
        border: 'hsl(var(--border) / 0.3)',
    },
};

// Score arc SVG
function ScoreArc({score}: {score: number}) {
    const radius = 28;
    const circ = 2 * Math.PI * radius;
    const filled = (score / 100) * circ;
    const color = score >= 80 ? 'hsl(142 72% 45%)' : score >= 55 ? 'hsl(42 98% 56%)' : 'hsl(0 72% 55%)';

    return (
        <div className="relative flex items-center justify-center" style={{width: 72, height: 72}}>
            <svg width="72" height="72" style={{transform: 'rotate(-90deg)'}}>
                <circle cx="36" cy="36" r={radius} fill="none" stroke="hsl(var(--surface-2))" strokeWidth="4"/>
                <motion.circle
                    cx="36" cy="36" r={radius}
                    fill="none"
                    stroke={color}
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeDasharray={circ}
                    initial={{strokeDashoffset: circ}}
                    animate={{strokeDashoffset: circ - filled}}
                    transition={{duration: 1, ease: [0.16, 1, 0.3, 1], delay: 0.2}}
                    style={{filter: `drop-shadow(0 0 4px ${color}80)`}}
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-[17px] font-black leading-none" style={{color}}>{score}</span>
                <span className="text-[7px] font-bold text-muted-foreground/50 uppercase tracking-wide mt-0.5">score</span>
            </div>
        </div>
    );
}

// Single suggestion row
function SuggestionRow({s, index}: {s: ProfileSuggestion; index: number}) {
    const cfg = PRIORITY_CONFIG[s.priority];

    return (
        <motion.div
            initial={{opacity: 0, x: -12}}
            animate={{opacity: 1, x: 0}}
            transition={{delay: index * 0.06 + 0.1, duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
            className="flex gap-3 p-3 rounded-[var(--radius-sm)]"
            style={{background: cfg.bg, border: `1px solid ${cfg.border}`}}
        >
            <div className="text-[18px] shrink-0 leading-none mt-0.5">{s.icon}</div>
            <div className="flex-1 min-w-0">
                <p className="text-[11.5px] font-bold text-foreground leading-snug">{s.issue}</p>
                <p className="text-[10.5px] text-muted-foreground mt-0.5 leading-relaxed">{s.suggestion}</p>
            </div>
            <div className="shrink-0">
                <span
                    className="text-[8px] font-black uppercase tracking-wide px-1.5 py-0.5 rounded-full"
                    style={{color: cfg.color, background: cfg.bg}}
                >
                    {s.priority}
                </span>
            </div>
        </motion.div>
    );
}

export function ProfileOptimizerPanel({profile, onDismiss, className}: Props) {
    const [loading, setLoading] = useState(true);
    const [score, setScore] = useState(0);
    const [suggestions, setSuggestions] = useState<ProfileSuggestion[]>([]);
    const [summary, setSummary] = useState('');
    const [expanded, setExpanded] = useState(true);

    useEffect(() => {
        let cancelled = false;
        AgentOrchestrator.profileOptimizer.analyzeProfile(profile).then(result => {
            if (cancelled) return;
            setScore(result.data.score);
            setSuggestions(result.data.suggestions);
            setSummary(result.data.summary);
            setLoading(false);
        });
        return () => { cancelled = true; };
    }, [profile.user_id]);

    return (
        <motion.div
            initial={{opacity: 0, y: 12}}
            animate={{opacity: 1, y: 0}}
            transition={{duration: 0.28, ease: [0.16, 1, 0.3, 1]}}
            className={cn('overflow-hidden', className)}
            style={{
                background: 'hsl(var(--surface-1))',
                border: '1px solid hsl(var(--border) / 0.4)',
                borderRadius: 'var(--radius-md)',
            }}
        >
            {/* Header */}
            <button
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
                onClick={() => setExpanded(e => !e)}
            >
                <div
                    className="w-7 h-7 rounded-[6px] flex items-center justify-center shrink-0"
                    style={{background: 'hsl(42 98% 56% / 0.12)'}}
                >
                    <Sparkles className="w-3.5 h-3.5" style={{color: 'hsl(var(--primary))'}}/>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[12.5px] font-black text-foreground">AI Profile Coach</p>
                    <p className="text-[10px] text-muted-foreground">
                        {loading ? 'Analyzing…' : suggestions.length > 0
                            ? `${suggestions.length} improvement${suggestions.length > 1 ? 's' : ''} found`
                            : 'Profile looks great!'}
                    </p>
                </div>
                {!loading && <ScoreArc score={score}/>}
                <div className="ml-1">
                    {expanded
                        ? <ChevronUp className="w-4 h-4 text-muted-foreground/50"/>
                        : <ChevronDown className="w-4 h-4 text-muted-foreground/50"/>}
                </div>
                {onDismiss && (
                    <button
                        onClick={e => {e.stopPropagation(); onDismiss();}}
                        className="w-6 h-6 rounded-full flex items-center justify-center hover:bg-secondary/60 transition-colors ml-1"
                    >
                        <X className="w-3 h-3 text-muted-foreground/50"/>
                    </button>
                )}
            </button>

            {/* Body */}
            <AnimatePresence>
                {expanded && !loading && (
                    <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.22, ease: [0.16, 1, 0.3, 1]}}
                        className="overflow-hidden"
                    >
                        <div className="px-4 pb-4 space-y-2">
                            {/* Summary */}
                            <p className="text-[11px] text-muted-foreground leading-relaxed pb-1">{summary}</p>

                            {suggestions.length > 0 ? (
                                suggestions.map((s, i) => (
                                    <SuggestionRow key={s.field + i} s={s} index={i}/>
                                ))
                            ) : (
                                <div className="flex items-center gap-2 py-2">
                                    <span className="text-[18px]">🏆</span>
                                    <p className="text-[11.5px] font-bold text-foreground">
                                        Your profile is fully optimized!
                                    </p>
                                </div>
                            )}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
