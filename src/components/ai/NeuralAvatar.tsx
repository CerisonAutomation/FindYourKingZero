/**
 * NeuralAvatar.tsx — Next-Gen AI Avatar with Neural Network Visualization
 *
 * Features:
 * - Animated neural network nodes
 * - Glowing orb with particle effects
 * - State-based animations (idle, listening, thinking, speaking)
 * - Holographic shimmer effects
 * - Quantum energy field visualization
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Volume2, VolumeX, Sparkles, Crown, X, Zap, Brain } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { log } from '@/lib/enterprise/Logger';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error';

interface NeuralAvatarProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'fixed' | 'relative' | 'absolute';
  placement?: 'bottom-right' | 'bottom-left' | 'center';
  showChat?: boolean;
  onStateChange?: (state: AvatarState) => void;
}

// Advanced color system with glow effects
const COLORS = {
  primary: {
    base: '#8B5CF6',
    glow: '#A78BFA',
    pulse: 'rgba(139, 92, 246, 0.6)',
    gradient: 'linear-gradient(135deg, #8B5CF6, #EC4899, #F59E0B)',
  },
  listening: {
    base: '#EF4444',
    glow: '#FCA5A5',
    pulse: 'rgba(239, 68, 68, 0.6)',
  },
  thinking: {
    base: '#3B82F6',
    glow: '#93C5FD',
    pulse: 'rgba(59, 130, 246, 0.6)',
  },
  speaking: {
    base: '#10B981',
    glow: '#6EE7B7',
    pulse: 'rgba(16, 185, 129, 0.6)',
  },
  gold: {
    primary: '#FFD700',
    secondary: '#FFA500',
    glow: '#FFEC8B',
    pulse: 'rgba(255, 215, 0, 0.6)',
  },
};

// Neural Node Component
const NeuralNode = ({
  x,
  y,
  delay,
  isActive
}: {
  x: number;
  y: number;
  delay: number;
  isActive: boolean;
}) => (
  <motion.div
    className={cn(
      "absolute w-2 h-2 rounded-full",
      isActive ? "bg-violet-400" : "bg-zinc-600"
    )}
    style={{ left: x, top: y }}
    initial={{ scale: 0, opacity: 0 }}
    animate={{
      scale: isActive ? [1, 1.5, 1] : 0.5,
      opacity: isActive ? [0.6, 1, 0.6] : 0.3,
      boxShadow: isActive
        ? ['0 0 10px rgba(139, 92, 246, 0.5)', '0 0 20px rgba(139, 92, 246, 0.8)', '0 0 10px rgba(139, 92, 246, 0.5)']
        : 'none',
    }}
    transition={{
      duration: 2,
      delay,
      repeat: Infinity,
      ease: 'easeInOut',
    }}
  />
);

// Neural Network Ring
const NeuralRing = ({
  radius,
  nodes,
  rotation = 0,
  state
}: {
  radius: number;
  nodes: number;
  rotation?: number;
  state: AvatarState;
}) => {
  const isActive = state !== 'idle';

  return (
    <div
      className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
      style={{
        width: radius * 2,
        height: radius * 2,
        transform: `translate(-50%, -50%) rotate(${rotation}deg)`,
      }}
    >
      {/* Connection lines */}
      <svg
        className="absolute inset-0 w-full h-full pointer-events-none"
        style={{ transform: `rotate(-${rotation}deg)` }}
      >
        {Array.from({ length: nodes }).map((_, i) => {
          const angle1 = (i / nodes) * Math.PI * 2;
          const angle2 = ((i + 1) % nodes / nodes) * Math.PI * 2;
          const x1 = radius + Math.cos(angle1) * radius * 0.8;
          const y1 = radius + Math.sin(angle1) * radius * 0.8;
          const x2 = radius + Math.cos(angle2) * radius * 0.8;
          const y2 = radius + Math.sin(angle2) * radius * 0.8;

          return (
            <motion.line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke={isActive ? '#8B5CF6' : '#3f3f46'}
              strokeWidth="1"
              initial={{ pathLength: 0, opacity: 0 }}
              animate={{
                pathLength: 1,
                opacity: isActive ? [0.3, 0.8, 0.3] : 0.2,
              }}
              transition={{ duration: 3, repeat: Infinity, delay: i * 0.1 }}
            />
          );
        })}
      </svg>

      {/* Nodes */}
      {Array.from({ length: nodes }).map((_, i) => {
        const angle = (i / nodes) * Math.PI * 2;
        const x = radius + Math.cos(angle) * radius * 0.8 - 4;
        const y = radius + Math.sin(angle) * radius * 0.8 - 4;

        return (
          <NeuralNode
            key={i}
            x={x}
            y={y}
            delay={i * 0.1}
            isActive={isActive}
          />
        );
      })}
    </div>
  );
};

// Quantum Orb Component
const QuantumOrb = ({ state, size }: { state: AvatarState; size: number }) => {
  const getColors = () => {
    switch (state) {
      case 'listening': return COLORS.listening;
      case 'thinking': return COLORS.thinking;
      case 'speaking': return COLORS.speaking;
      default: return COLORS.primary;
    }
  };

  const colors = getColors();

  return (
    <div className="relative" style={{ width: size, height: size }}>
      {/* Outer glow rings */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            `0 0 40px ${colors.pulse}, 0 0 80px ${colors.pulse}`,
            `0 0 60px ${colors.pulse}, 0 0 120px ${colors.pulse}`,
            `0 0 40px ${colors.pulse}, 0 0 80px ${colors.pulse}`,
          ],
        }}
        transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating gradient ring */}
      <motion.div
        className="absolute -inset-3 rounded-full"
        style={{
          background: `conic-gradient(from 0deg, ${colors.base}, ${colors.glow}, ${colors.base})`,
          opacity: 0.4,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
      />

      {/* Neural network rings */}
      <div className="absolute inset-0">
        <NeuralRing radius={size * 0.5} nodes={8} rotation={0} state={state} />
        <NeuralRing radius={size * 0.35} nodes={6} rotation={45} state={state} />
        <NeuralRing radius={size * 0.2} nodes={4} rotation={90} state={state} />
      </div>

      {/* Core orb */}
      <motion.div
        className="absolute inset-[15%] rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${colors.glow}, ${colors.base} 50%, #1a1a2e 100%)`,
          boxShadow: `inset -10px -10px 30px rgba(0,0,0,0.5), inset 10px 10px 30px rgba(255,255,255,0.2), 0 0 50px ${colors.pulse}`,
        }}
        animate={{
          scale: state === 'speaking' ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 0.5, repeat: state === 'speaking' ? Infinity : 0 }}
      >
        {/* Crown icon */}
        <motion.div
          animate={{
            rotate: state === 'thinking' ? [0, 5, -5, 0] : 0,
            scale: state === 'listening' ? [1, 1.1, 1] : 1,
          }}
          transition={{ duration: 0.5, repeat: state === 'thinking' || state === 'listening' ? Infinity : 0 }}
        >
          <Crown
            className="text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.8)]"
            style={{ width: size * 0.3, height: size * 0.3 }}
            strokeWidth={1.5}
          />
        </motion.div>
      </motion.div>

      {/* Floating particles */}
      <AnimatePresence>
        {(state === 'listening' || state === 'speaking') && (
          <>
            {[...Array(8)].map((_, i) => (
              <motion.div
                key={i}
                className="absolute w-1.5 h-1.5 rounded-full"
                style={{
                  background: colors.glow,
                  left: '50%',
                  top: '50%',
                  boxShadow: `0 0 10px ${colors.glow}`,
                }}
                initial={{ scale: 0, x: '-50%', y: '-50%' }}
                animate={{
                  scale: [0, 1, 0],
                  x: `${Math.cos((i / 8) * Math.PI * 2) * (size * 0.6) - size * 0.5}px`,
                  y: `${Math.sin((i / 8) * Math.PI * 2) * (size * 0.6) - size * 0.5}px`,
                  opacity: [0, 1, 0],
                }}
                transition={{
                  duration: 2,
                  delay: i * 0.15,
                  repeat: Infinity,
                  ease: 'easeOut',
                }}
              />
            ))}
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

// Size configurations
const SIZE_CONFIG = {
  sm: { container: 120, orb: 90 },
  md: { container: 160, orb: 120 },
  lg: { container: 200, orb: 150 },
  xl: { container: 280, orb: 220 },
} as const;

export const NeuralAvatar = ({
  className,
  size = 'md',
  position = 'fixed',
  placement = 'bottom-right',
  showChat = true,
  onStateChange,
}: NeuralAvatarProps) => {
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
        const errorMessage = err instanceof Error ? err.message : String(err);
        log.error('AI_AVATAR', 'Failed to process voice input', err instanceof Error ? err : new Error(errorMessage));
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
  const currentColors = avatarState === 'listening' ? COLORS.listening :
                       avatarState === 'thinking' ? COLORS.thinking :
                       avatarState === 'speaking' ? COLORS.speaking :
                       avatarState === 'error' ? COLORS.listening : COLORS.primary;

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
            className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl p-4 max-w-[300px] mb-2"
            style={{ boxShadow: `0 8px 32px ${currentColors.pulse}` }}
          >
            <div className="flex items-start gap-3">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${currentColors.base}, ${currentColors.glow})` }}
              >
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="text-sm leading-relaxed text-zinc-200">{lastResponse}</p>
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
            className="bg-zinc-950/95 backdrop-blur-xl border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden mb-2 w-[340px]"
            style={{ boxShadow: `0 8px 32px ${COLORS.primary.pulse}` }}
          >
            {/* Chat header */}
            <div
              className="flex items-center justify-between p-4 border-b border-zinc-800"
              style={{ background: `linear-gradient(90deg, rgba(139, 92, 246, 0.1), rgba(236, 72, 153, 0.1))` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${COLORS.primary.base}, ${COLORS.primary.glow})` }}
                >
                  <Brain className="w-5 h-5 text-white" />
                </div>
                <div>
                  <span className="font-bold text-white text-sm">King AI Neural</span>
                  <p className="text-[10px] text-zinc-400">GPT-4 Powered • Quantum Core</p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={() => setIsMuted(!isMuted)}
                >
                  {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-zinc-400 hover:text-white"
                  onClick={() => setIsChatOpen(false)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Voice transcript */}
            <div className="p-3 space-y-2 min-h-[80px] bg-zinc-900/50">
              {(interimTranscript || transcript) && (
                <div className="bg-zinc-800/50 rounded-lg p-3 text-sm border border-zinc-700/50">
                  <span className="text-zinc-500 text-xs uppercase tracking-wider">You:</span>
                  <p className="text-zinc-300 mt-1">{interimTranscript || transcript}</p>
                </div>
              )}
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-zinc-500">
                  <Sparkles className="w-4 h-4 animate-pulse" style={{ color: currentColors.base }} />
                  <span>Neural processing...</span>
                </div>
              )}
            </div>

            {/* Chat actions */}
            <div className="p-3 border-t border-zinc-800 bg-zinc-900/30">
              <div className="flex items-center gap-2">
                <Button
                  variant={isListening ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1 gap-2 font-semibold"
                  style={!isListening ? {
                    background: `linear-gradient(135deg, ${currentColors.base}, ${currentColors.glow})`,
                  } : {}}
                  onClick={toggleListening}
                  disabled={!isVoiceSupported}
                >
                  {isListening ? (
                    <><MicOff className="w-4 h-4" /> Stop</>
                  ) : (
                    <><Mic className="w-4 h-4" /> Voice Command</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsChatOpen(false)}
                  className="border-zinc-700/50"
                >
                  Close
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Avatar container */}
      <div
        className="relative cursor-pointer group"
        style={{ width: sizeConfig.container, height: sizeConfig.container }}
        onClick={() => !isListening && setIsChatOpen(!isChatOpen)}
      >
        {/* Listening pulse rings */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2, 3].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2"
                  style={{ borderColor: COLORS.listening.pulse }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.8 + i * 0.4, opacity: 0 }}
                  transition={{
                    duration: 2,
                    delay: i * 0.5,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main quantum orb */}
        <div
          className="absolute inset-0 flex items-center justify-center"
          style={{ width: sizeConfig.container, height: sizeConfig.container }}
        >
          <QuantumOrb state={avatarState} size={sizeConfig.orb} />
        </div>

        {/* Status indicator */}
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <motion.div
            className={cn(
              'px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md whitespace-nowrap',
              avatarState === 'idle' && 'bg-zinc-800/80 text-zinc-400 border border-zinc-700',
              avatarState === 'listening' && 'text-white border border-red-500/50',
              avatarState === 'thinking' && 'text-white border border-blue-500/50',
              avatarState === 'speaking' && 'text-white border border-emerald-500/50',
              avatarState === 'error' && 'bg-red-500/20 text-red-400 border border-red-500/50'
            )}
            style={{
              background: avatarState === 'idle' ? undefined :
                `linear-gradient(135deg, ${currentColors.base}, ${currentColors.glow})`,
            }}
            animate={{ scale: avatarState !== 'idle' ? [1, 1.05, 1] : 1 }}
            transition={{ duration: 1, repeat: avatarState !== 'idle' ? Infinity : 0 }}
          >
            {avatarState === 'idle' && 'Neural AI'}
            {avatarState === 'listening' && 'Listening'}
            {avatarState === 'thinking' && 'Processing'}
            {avatarState === 'speaking' && 'Speaking'}
            {avatarState === 'error' && 'Error'}
          </motion.div>
        </div>

        {/* Quick action button */}
        <motion.button
          whileTap={{ scale: 0.9 }}
          onClick={(e) => {
            e.stopPropagation();
            toggleListening();
          }}
          className="absolute -top-2 -right-2 w-12 h-12 rounded-full flex items-center justify-center
                     shadow-lg transition-all z-10 border-2 border-zinc-950"
          style={{
            background: isListening
              ? `linear-gradient(135deg, ${COLORS.listening.base}, ${COLORS.listening.glow})`
              : `linear-gradient(135deg, ${COLORS.gold.primary}, ${COLORS.gold.secondary})`,
            boxShadow: `0 4px 20px ${isListening ? COLORS.listening.pulse : COLORS.gold.pulse}`,
          }}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Zap className="w-5 h-5 text-black" />}
        </motion.button>
      </div>
    </div>
  );
};

export default NeuralAvatar;
