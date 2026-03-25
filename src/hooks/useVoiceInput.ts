/**
 * useVoiceInput — Web Speech API hook for real-time voice-to-text
 *
 * Features:
 *  • Real-time interim + final transcripts
 *  • Auto-restart on silence (continuous mode)
 *  • Permission detection + error states
 *  • Voice command routing via VoiceCommandProcessor
 *  • "Hey King" wake-word detection
 *
 * All processing is 100% on-device — zero server calls.
 */

import {useCallback, useEffect, useRef, useState} from 'react';
import {voiceCommandProcessor} from '@/lib/voice/VoiceCommandProcessor';

export type VoiceInputState = 'idle' | 'requesting' | 'listening' | 'processing' | 'error';

export interface VoiceInputOptions {
    lang?: string;
    continuous?: boolean;
    interimResults?: boolean;
    onTranscript?: (text: string, isFinal: boolean) => void;
    onCommand?: (commandId: string, transcript: string) => void;
    onError?: (error: string) => void;
    wakeWord?: string;
}

const WAKE_WORD = 'hey king';
const SILENCE_TIMEOUT = 4000;

export function useVoiceInput(options: VoiceInputOptions = {}) {
    const {
        lang = 'en-US',
        continuous = false,
        interimResults = true,
        onTranscript,
        onCommand,
        onError,
        wakeWord = WAKE_WORD,
    } = options;

    const [state, setState] = useState<VoiceInputState>('idle');
    const [transcript, setTranscript] = useState('');
    const [interimTranscript, setInterimTranscript] = useState('');
    const [isSupported, setIsSupported] = useState(false);
    const [permissionDenied, setPermissionDenied] = useState(false);
    const [wakeWordActive, setWakeWordActive] = useState(false);

    const recognitionRef = useRef<any>(null);
    const silenceTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const wakeWordListenerRef = useRef<any>(null);

    // ── Detect browser support ──────────────────────────────────────────
    useEffect(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;
        setIsSupported(!!SpeechRecognition);
    }, []);

    // ── Cleanup on unmount ──────────────────────────────────────────────
    useEffect(() => {
        return () => {
            stopListening();
            if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
        };
    }, []);

    // ── Create recognition instance ─────────────────────────────────────
    const createRecognition = useCallback(() => {
        const SpeechRecognition =
            (window as any).SpeechRecognition ||
            (window as any).webkitSpeechRecognition;

        if (!SpeechRecognition) return null;

        const rec = new SpeechRecognition();
        rec.lang = lang;
        rec.continuous = continuous;
        rec.interimResults = interimResults;
        rec.maxAlternatives = 1;

        rec.onstart = () => {
            setState('listening');
            setPermissionDenied(false);
        };

        rec.onresult = (event: any) => {
            let finalText = '';
            let interimText = '';

            for (let i = event.resultIndex; i < event.results.length; i++) {
                const result = event.results[i];
                if (result.isFinal) {
                    finalText += result[0].transcript;
                } else {
                    interimText += result[0].transcript;
                }
            }

            if (interimText) {
                setInterimTranscript(interimText);
                onTranscript?.(interimText, false);
            }

            if (finalText) {
                const normalized = finalText.trim();
                setTranscript(prev => prev + (prev ? ' ' : '') + normalized);
                setInterimTranscript('');
                onTranscript?.(normalized, true);

                // Check for wake word
                if (normalized.toLowerCase().includes(wakeWord.toLowerCase())) {
                    setWakeWordActive(true);
                    setTimeout(() => setWakeWordActive(false), 3000);
                }

                // Route through voice command processor
                setState('processing');
                voiceCommandProcessor.processSpeech(normalized, result?.[0]?.confidence ?? 0.85)
                    .then(matched => {
                        if (matched) {
                            onCommand?.(matched.id, normalized);
                        }
                        setState('listening');
                    })
                    .catch(() => setState('listening'));

                // Reset silence timer
                if (silenceTimerRef.current) clearTimeout(silenceTimerRef.current);
                if (!continuous) {
                    silenceTimerRef.current = setTimeout(() => {
                        stopListening();
                    }, SILENCE_TIMEOUT);
                }
            }
        };

        rec.onerror = (event: any) => {
            if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
                setPermissionDenied(true);
                setState('error');
                onError?.('Microphone permission denied');
            } else if (event.error === 'no-speech') {
                setState('idle');
            } else if (event.error === 'aborted') {
                setState('idle');
            } else {
                setState('error');
                onError?.(event.error);
            }
        };

        rec.onend = () => {
            if (recognitionRef.current) {
                setState('idle');
            }
        };

        return rec;
    }, [lang, continuous, interimResults, onTranscript, onCommand, onError, wakeWord]);

    // ── Start listening ─────────────────────────────────────────────────
    const startListening = useCallback(async () => {
        if (!isSupported) {
            onError?.('Speech recognition not supported in this browser');
            return;
        }

        setState('requesting');
        setTranscript('');
        setInterimTranscript('');

        try {
            // Request mic permission explicitly first
            await navigator.mediaDevices.getUserMedia({audio: true});

            const rec = createRecognition();
            if (!rec) return;

            recognitionRef.current = rec;
            rec.start();
        } catch (err) {
            setPermissionDenied(true);
            setState('error');
            onError?.('Microphone access denied');
        }
    }, [isSupported, createRecognition, onError]);

    // ── Stop listening ──────────────────────────────────────────────────
    const stopListening = useCallback(() => {
        if (recognitionRef.current) {
            try {
                recognitionRef.current.stop();
            } catch {/* already stopped */}
            recognitionRef.current = null;
        }
        if (silenceTimerRef.current) {
            clearTimeout(silenceTimerRef.current);
        }
        setState('idle');
        setInterimTranscript('');
    }, []);

    // ── Toggle ──────────────────────────────────────────────────────────
    const toggle = useCallback(() => {
        if (state === 'listening' || state === 'processing') {
            stopListening();
        } else {
            startListening();
        }
    }, [state, startListening, stopListening]);

    // ── Clear transcript ────────────────────────────────────────────────
    const clearTranscript = useCallback(() => {
        setTranscript('');
        setInterimTranscript('');
    }, []);

    const isActive = state === 'listening' || state === 'processing';

    return {
        state,
        isActive,
        isListening: state === 'listening',
        isProcessing: state === 'processing',
        isSupported,
        permissionDenied,
        wakeWordActive,
        transcript,
        interimTranscript,
        liveText: interimTranscript || transcript,
        startListening,
        stopListening,
        toggle,
        clearTranscript,
    };
}
