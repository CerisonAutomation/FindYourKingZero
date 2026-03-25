/**
 * AIAvatarOrb — Enhanced AI-powered animated avatar with Vibrant Power Orb
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Crown, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { log } from '@/lib/enterprise/Logger';

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface AIAvatarOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'fixed' | 'relative' | 'absolute';
  placement?: 'bottom-right' | 'bottom-left' | 'center';
  showChat?: boolean;
  onStateChange?: (state: AvatarState) => void;
}

const COLORS = {
  gold: { primary: '#FFD700', secondary: '#FFA500', glow: '#FFEC8B', pulse: 'rgba(255, 215, 0, 0.6)' },
  red: { primary: '#FF4444', secondary: '#FF6B6B', glow: '#FF8888', pulse: 'rgba(255, 68, 68, 0.6)' },
  cyan: { primary: '#00FFFF', secondary: '#00CED1', glow: '#7FFFD4', pulse: 'rgba(0, 255, 255, 0.6)' },
  emerald: { primary: '#00FF88', secondary: '#00CC6A', glow: '#88FFB3', pulse: 'rgba(0, 255, 136, 0.6)' },
};

const SIZE_CONFIG = {
  sm: { container: 120, orb: 80 },
  md: { container: 160, orb: 110 },
  lg: { container: 200, orb: 140 },
  xl: { container: 280, orb: 200 },
} as const;

const AnimatedOrb = ({ state, size }: { state: AvatarState; size: number }) => {
  const getColors = () => {
    switch (state) {
      case 'listening': return COLORS.red;
      case 'thinking': return COLORS.cyan;
      case 'speaking': return COLORS.emerald;
      case 'error': return COLORS.red;
      default: return COLORS.gold;
    }
  };
  const colors = getColors();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{ boxShadow: [`0 0 30px ${colors.pulse}`, `0 0 60px ${colors.pulse}`, `0 0 30px ${colors.pulse}`] }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />
      <motion.div
        className="absolute -inset-4 rounded-full"
        style={{ background: `conic-gradient(from 0deg, ${colors.primary}, ${colors.secondary}, ${colors.glow}, ${colors.primary})`, opacity: 0.6 }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.glow}, ${colors.primary} 50%, ${colors.secondary} 100%)`,
          boxShadow: `inset -10px -10px 30px rgba(0,0,0,0.3), inset 10px 10px 30px rgba(255,255,255,0.4), 0 0 40px ${colors.pulse}`,
        }}
      >
        <motion.div
          animate={{ scale: state === 'speaking' ? [1, 1.1, 1] : 1, rotate: state === 'thinking' ? [0, 5, -5, 0] : 0 }}
          transition={{ duration: 0.5, repeat: state === 'speaking' || state === 'thinking' ? Infinity : 0 }}
        >
          <Crown className="text-white drop-shadow-lg" style={{ width: size * 0.35, height: size * 0.35 }} strokeWidth={1.5} />
        </motion.div>
      </div>
      <AnimatePresence>
        {(state === 'listening' || state === 'speaking') && (
          <>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{ background: colors.glow, left: '50%', top: '50%' }}
                initial={{ scale: 0, x: '-50%', y: '-50%' }}
                animate={{
                  scale: [0, 1, 0],
                  x: `${Math.cos((i / 6) * Math.PI * 2) * (size * 0.7) - size * 0.5}px`,
                  y: `${Math.sin((i / 6) * Math.PI * 2) * (size * 0.7) - size * 0.5}px`,
                  opacity: [0, 1, 0],
                }}
                transition={{ duration: 1.5, delay: i * 0.15, repeat: Infinity, ease: 'easeOut' }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export const AIAvatarOrb = ({
  className,
  size = 'md',
  position = 'fixed',
  placement = 'bottom-right',
  showChat = true,
  onStateChange,
}: AIAvatarOrbProps) => {
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);

  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const { messages, isStreaming, sendMessage } = useAI();

  const {
    isActive: isListening,
    isSupported: isVoiceSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
  } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    continuous: true,
    interimResults: true,
  });

  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    onStateChange?.(avatarState);
    if ('vibrate' in navigator && avatarState !== 'idle') {
      navigator.vibrate(avatarState === 'listening' ? 50 : 30);
    }
  }, [avatarState, onStateChange]);

  async function handleVoiceTranscript(text: string, isFinal: boolean) {
    if (isFinal && text.trim()) {
      setAvatarState('thinking');
      stopListening();
      try {
        await sendMessage(text);
        setAvatarState('speaking');
        const response = messages[messages.length - 1]?.content || "I'm here to help you find your perfect match!";
        setLastResponse(response);
        setShowResponse(true);
        if (!isMuted) {
          speakText(response);
        }
        setTimeout(() => {
          setShowResponse(false);
          setAvatarState('idle');
        }, 5000);
      } catch (err: unknown) {
        log.error('AI_AVATAR', 'Failed to process voice input', err instanceof Error ? err : new Error(String(err)));
        setAvatarState('error');
        setTimeout(() => setAvatarState('idle'), 2000);
      }
    }
  }

  const speakText = useCallback((text: string) => {
    if (!synthRef.current || isMuted) return;
    synthRef.current.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1.1;
    utterance.volume = 0.8;
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Google US English') || v.name.includes('Samantha') || v.name.includes('Victoria')
    );
    if (preferredVoice) utterance.voice = preferredVoice;
    utterance.onstart = () => setAvatarState('speaking');
    utterance.onend = () => {
      setAvatarState('idle');
      setShowResponse(false);
    };
    utterance.onerror = () => setAvatarState('idle');
    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [isMuted]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      setAvatarState('idle');
    } else {
      clearTranscript();
      startListening();
      setAvatarState('listening');
      setIsChatOpen(true);
    }
  }, [isListening, startListening, stopListening, clearTranscript]);

  const getPositionClass = (pos: string, place: string): string => {
    const styles: Record<string, Record<string, string>> = {
      'fixed': { 'bottom-right': 'fixed bottom-6 right-6 z-50', 'bottom-left': 'fixed bottom-6 left-6 z-50', 'center': 'fixed bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 z-50' },
      'relative': { 'bottom-right': '', 'bottom-left': '', 'center': '' },
      'absolute': { 'bottom-right': '', 'bottom-left': '', 'center': '' },
    };
    return styles[pos]?.[place] ?? '';
  };

  const sizeConfig = SIZE_CONFIG[size];
  const currentColors = avatarState === 'listening' ? COLORS.red :
                       avatarState === 'thinking' ? COLORS.cyan :
                       avatarState === 'speaking' ? COLORS.emerald :
                       avatarState === 'error' ? COLORS.red : COLORS.gold;

  return (
    <div className={cn(
      getPositionClass(position, placement),
      'flex flex-col items-end gap-3',
      className
    )}>
      {/* Response bubble */}
      <AnimatePresence>
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 max-w-[280px] mb-2"
            style={{ boxShadow: `0 8px 32px ${currentColors.pulse}` }}
          >
            <div className="flex items-start gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})` }}
              >
                <Crown className="w-4 h-4 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed">{lastResponse}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {showChat && isChatOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden mb-2 w-[320px]"
            style={{ boxShadow: `0 8px 32px ${COLORS.gold.pulse}` }}
          >
            {/* Chat header */}
            <div
              className="flex items-center justify-between p-3 border-b border-border"
              style={{ background: `linear-gradient(90deg, ${COLORS.gold.primary}15, ${COLORS.gold.secondary}15)` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${COLORS.gold.primary}, ${COLORS.gold.secondary})` }}
                >
                  <Crown className="w-4 h-4 text-white" />
                </div>
                <span className="font-bold text-sm">King AI</span>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Voice transcript */}
            <div className="p-3 space-y-2 min-h-[60px]">
              {(interimTranscript || transcript) && (
                <div className="bg-muted rounded-lg p-2 text-sm">
                  <span className="text-muted-foreground text-xs">You:</span>
                  <p>{interimTranscript || transcript}</p>
                </div>
              )}
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4 animate-pulse" style={{ color: currentColors.primary }} />
                  <span>Thinking...</span>
                </div>
              )}
            </div>

            {/* Chat actions */}
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  variant={isListening ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1 gap-2 font-semibold"
                  style={!isListening ? {
                    background: `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`,
                  } : {}}
                  onClick={toggleListening}
                  disabled={!isVoiceSupported}
                >
                  {isListening ? (
                    <><MicOff className="w-4 h-4" /> Stop</>
                  ) : (
                    <><Mic className="w-4 h-4" /> Ask King AI</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar orb container */}
      <div
        className="relative cursor-pointer group"
        style={{ width: sizeConfig.container, height: sizeConfig.container }}
        onClick={() => !isListening && setIsChatOpen(!isChatOpen)}
      >
        {/* Listening pulse rings */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: COLORS.red.pulse }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main animated orb */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: sizeConfig.container, height: sizeConfig.container }}
        >
          <AnimatedOrb state={avatarState} size={sizeConfig.orb} />
        </div>

        {/* Status indicator */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <motion.div
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md whitespace-nowrap',
              avatarState === 'idle' && 'bg-muted/80 text-muted-foreground',
              avatarState === 'listening' && 'text-white',
              avatarState === 'thinking' && 'text-white',
              avatarState === 'speaking' && 'text-white',
              avatarState === 'error' && 'bg-destructive/20 text-destructive'
            )}
            style={{
              background: avatarState === 'idle' ? undefined :
                `linear-gradient(135deg, ${currentColors.primary}, ${currentColors.secondary})`,
            }}
            animate={{ scale: avatarState !== 'idle' ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: avatarState !== 'idle' ? Infinity : 0 }}
          >
            {avatarState === 'idle' && 'King AI'}
            {avatarState === 'listening' && 'Listening'}
            {avatarState === 'thinking' && 'Thinking'}
            {avatarState === 'speaking' && 'Speaking'}
            {avatarState === 'error' && 'Error'}
          </motion.div>
        </div>

        {/* Quick action button - Tap to open menu, Hold to talk */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            setIsChatOpen(!isChatOpen);
          }}
          onPointerDown={(e) => {
            e.stopPropagation();
            // Start hold-to-talk timer
            const holdTimer = setTimeout(() => {
              if (!isListening) {
                clearTranscript();
                startListening();
                setAvatarState('listening');
                setIsChatOpen(true);
              }
            }, 500);
            // Store timer reference
            (e.target as any).__holdTimer = holdTimer;
          }}
          onPointerUp={(e) => {
            e.stopPropagation();
            // Clear hold timer
            const holdTimer = (e.target as any).__holdTimer;
            if (holdTimer) {
              clearTimeout(holdTimer);
            }
            // Stop listening if was listening
            if (isListening) {
              stopListening();
              setAvatarState('idle');
            }
          }}
          onPointerLeave={(e) => {
            // Clear hold timer and stop listening
            const holdTimer = (e.target as any).__holdTimer;
            if (holdTimer) {
              clearTimeout(holdTimer);
            }
            if (isListening) {
              stopListening();
              setAvatarState('idle');
            }
          }}
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-lg transition-all z-10"
          style={{
            background: isListening
              ? `linear-gradient(135deg, ${COLORS.red.primary}, ${COLORS.red.secondary})`
              : `linear-gradient(135deg, ${COLORS.gold.primary}, ${COLORS.gold.secondary})`,
            boxShadow: `0 4px 20px ${isListening ? COLORS.red.pulse : COLORS.gold.pulse}`,
          }}
          title="Tap to open menu, Hold to talk"
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-black" />}
        </motion.button>
      </div>
    </div>
  );
};

export default AIAvatarOrb;
