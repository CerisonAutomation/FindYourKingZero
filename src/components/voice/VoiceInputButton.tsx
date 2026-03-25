/**
 * VoiceInputButton — Microphone button for in-chat speech-to-text
 *
 * Features:
 *  • Animated listening state (ripple + waveform)
 *  • Live transcript preview above button
 *  • Auto-inserts transcript into parent input
 *  • Permission error state with helpful message
 *  • Keyboard: Space to toggle when focused
 */

import {useEffect} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Mic, MicOff, X} from 'lucide-react';
import {useVoiceInput} from '@/hooks/useVoiceInput';
import {cn} from '@/lib/utils';

interface VoiceInputButtonProps {
    onTranscript: (text: string) => void;
    className?: string;
    size?: 'sm' | 'md';
    disabled?: boolean;
}

export function VoiceInputButton({
    onTranscript,
    className,
    size = 'md',
    disabled,
}: VoiceInputButtonProps) {
    const {
        isActive,
        isListening,
        isSupported,
        permissionDenied,
        transcript,
        interimTranscript,
        toggle,
        stopListening,
        clearTranscript,
        state,
    } = useVoiceInput({
        onTranscript: (text, isFinal) => {
            if (isFinal && text.trim()) {
                onTranscript(text.trim());
            }
        },
        continuous: false,
    });

    // Auto-stop after transcript delivered
    useEffect(() => {
        if (transcript) {
            const t = setTimeout(() => {
                stopListening();
                clearTranscript();
            }, 400);
            return () => clearTimeout(t);
        }
    }, [transcript, stopListening, clearTranscript]);

    if (!isSupported) return null;

    const dim = size === 'sm' ? 32 : 36;
    const iconSz = size === 'sm' ? 14 : 16;

    return (
        <div className="relative flex items-center justify-center">
            {/* Live transcript bubble */}
            <AnimatePresence>
                {isActive && (interimTranscript || transcript) && (
                    <motion.div
                        initial={{opacity: 0, y: 6, scale: 0.92}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        exit={{opacity: 0, y: 4, scale: 0.94}}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap max-w-[220px]"
                        style={{zIndex: 60}}
                    >
                        <div
                            className="px-2.5 py-1.5 rounded-[8px] text-[11px] font-medium text-white truncate"
                            style={{
                                background: 'hsl(220 14% 8% / 0.95)',
                                backdropFilter: 'blur(12px)',
                                border: '1px solid hsl(0 0% 100% / 0.1)',
                                boxShadow: '0 4px 16px hsl(0 0% 0% / 0.4)',
                            }}
                        >
                            {interimTranscript || transcript}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Error tip */}
            <AnimatePresence>
                {permissionDenied && (
                    <motion.div
                        initial={{opacity: 0, y: 6}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0}}
                        className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 whitespace-nowrap"
                        style={{zIndex: 60}}
                    >
                        <div
                            className="px-2.5 py-1.5 rounded-[8px] text-[10px] font-medium text-white"
                            style={{background: 'hsl(0 72% 45% / 0.95)', backdropFilter: 'blur(8px)'}}
                        >
                            Mic permission denied
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Pulse rings when listening */}
            <AnimatePresence>
                {isListening && (
                    <>
                        {[0, 1].map(i => (
                            <motion.div
                                key={i}
                                className="absolute inset-0 rounded-full pointer-events-none"
                                style={{
                                    border: '1.5px solid hsl(0 72% 55% / 0.4)',
                                }}
                                initial={{scale: 1, opacity: 0.5}}
                                animate={{scale: 1.9 + i * 0.4, opacity: 0}}
                                transition={{
                                    duration: 1.4,
                                    delay: i * 0.5,
                                    repeat: Infinity,
                                    ease: 'easeOut',
                                }}
                            />
                        ))}
                    </>
                )}
            </AnimatePresence>

            {/* Main button */}
            <motion.button
                type="button"
                whileTap={{scale: 0.88}}
                onClick={disabled ? undefined : toggle}
                disabled={disabled}
                aria-label={isActive ? 'Stop recording' : 'Start voice input'}
                className={cn(
                    'relative flex items-center justify-center rounded-full transition-colors select-none',
                    permissionDenied ? 'opacity-40 cursor-not-allowed' : 'cursor-pointer',
                    className,
                )}
                style={{
                    width: dim,
                    height: dim,
                    background: isActive
                        ? 'hsl(0 72% 50%)'
                        : 'hsl(var(--surface-2))',
                    border: `1px solid ${isActive ? 'hsl(0 72% 60% / 0.5)' : 'hsl(var(--border) / 0.4)'}`,
                    boxShadow: isActive
                        ? '0 0 16px hsl(0 72% 50% / 0.4)'
                        : 'none',
                }}
            >
                {state === 'requesting' ? (
                    <div
                        className="rounded-full border-2 border-white/30 border-t-white animate-spin"
                        style={{width: iconSz - 2, height: iconSz - 2}}
                    />
                ) : isActive ? (
                    <motion.div
                        animate={{scale: [1, 1.15, 1]}}
                        transition={{duration: 0.8, repeat: Infinity}}
                    >
                        <Mic
                            style={{width: iconSz, height: iconSz, color: 'white'}}
                            strokeWidth={2.2}
                        />
                    </motion.div>
                ) : (
                    <Mic
                        style={{
                            width: iconSz,
                            height: iconSz,
                            color: 'hsl(var(--muted-foreground))',
                        }}
                        strokeWidth={1.8}
                    />
                )}
            </motion.button>
        </div>
    );
}
