/**
 * AIAvatarOrb — Production-grade accessible AI avatar component
 *
 * Features:
 * - Full keyboard navigation (Tab, Enter, Space, Escape)
 * - Screen reader optimized with ARIA live regions
 * - Offline-capable with local fallback responses
 * - Reduced motion support via prefers-reduced-motion
 * - WCAG 2.1 AA compliant
 *
 * Keyboard Shortcuts:
 * - Ctrl+C: Toggle chat panel
 * - Ctrl+V: Toggle voice input
 * - Ctrl+M: Toggle mute
 * - Esc: Close chat
 * - Enter/Space: Activate voice when focused
 *
 * @accessibility WCAG 2.1 AA compliant
 * @offline Supports offline mode with cached responses
 */

import { useCallback, useEffect, useRef, useState, useMemo } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  Keyboard,
  WifiOff,
  Crown
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useChatAI } from '@/hooks/useChatAI';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useToast } from '@/hooks/use-toast';
import { getOfflineResponse } from '@/lib/ai/offlineResponses';

// =============================================================================
// TYPES
// =============================================================================

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'offline';

export interface AIAvatarOrbProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  position?: 'fixed' | 'relative' | 'absolute';
  placement?: 'bottom-right' | 'bottom-left' | 'center';
  showChat?: boolean;
  onStateChange?: (state: AvatarState) => void;
  enableOfflineMode?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const AVATAR_STATES: Record<AvatarState, {
  label: string;
  color: string;
  description: string;
  ariaLive: 'polite' | 'assertive';
}> = {
  idle: {
    label: 'AI Assistant Ready',
    color: '#FFD700',
    description: 'Press Enter to start voice input, or click to open chat',
    ariaLive: 'polite'
  },
  listening: {
    label: 'Listening',
    color: '#00F5FF',
    description: 'Speak now. Press Escape to cancel.',
    ariaLive: 'assertive'
  },
  thinking: {
    label: 'Processing',
    color: '#FF6B6B',
    description: 'Processing your request...',
    ariaLive: 'polite'
  },
  speaking: {
    label: 'Responding',
    color: '#00FF88',
    description: 'Playing response audio',
    ariaLive: 'polite'
  },
  error: {
    label: 'Error',
    color: '#FF4444',
    description: 'Something went wrong. Please try again.',
    ariaLive: 'assertive'
  },
  offline: {
    label: 'Offline Mode',
    color: '#FFA500',
    description: 'Working offline with limited responses. Press Enter for voice input.',
    ariaLive: 'polite'
  },
};

const SIZE_CONFIG = {
  sm: { container: 120, orb: 80 },
  md: { container: 160, orb: 110 },
  lg: { container: 200, orb: 140 },
  xl: { container: 280, orb: 200 },
} as const;

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// Removed getOfflineResponse function and OFFLINE_RESPONSES constant
// as they are now imported from '@/lib/ai/offlineResponses'

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface OrbCoreProps {
  state: AvatarState;
  size: number;
  prefersReducedMotion: boolean;
}

function OrbCore({ state, size, prefersReducedMotion }: OrbCoreProps) {
  const color = AVATAR_STATES[state].color;

  if (prefersReducedMotion) {
    return (
      <div
        className="rounded-full flex items-center justify-center transition-colors duration-300"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 30% 30%, ${color}66, ${color}33 50%, ${color}11 100%)`,
          boxShadow: `0 0 20px ${color}44`,
        }}
        aria-hidden="true"
      >
        <Crown className="text-white" style={{ width: size * 0.4, height: size * 0.4 }} />
      </div>
    );
  }

  return (
    <div className="relative" style={{ width: size, height: size }} aria-hidden="true">
      {/* Outer glow pulse */}
      <motion.div
        className="absolute inset-0 rounded-full"
        animate={{
          boxShadow: [
            `0 0 20px ${color}44`,
            `0 0 40px ${color}66`,
            `0 0 20px ${color}44`
          ],
          scale: state === 'speaking' ? [1, 1.05, 1] : 1,
        }}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Rotating gradient ring */}
      <motion.div
        className="absolute -inset-2 rounded-full opacity-60"
        style={{
          background: `conic-gradient(from 0deg, ${color}00, ${color}66, ${color}33, ${color}00)`,
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
      />

      {/* Core orb */}
      <div
        className="absolute inset-0 rounded-full flex items-center justify-center"
        style={{
          background: `radial-gradient(circle at 30% 30%, ${color}88, ${color}44 50%, ${color}22 100%)`,
          boxShadow: `inset -8px -8px 20px rgba(0,0,0,0.2), inset 8px 8px 20px rgba(255,255,255,0.3), 0 0 30px ${color}44`,
        }}
      >
        <motion.div
          animate={{
            scale: state === 'speaking' ? [1, 1.1, 1] : 1,
            rotate: state === 'thinking' ? [0, 5, -5, 0] : 0,
          }}
          transition={{
            duration: 0.5,
            repeat: state === 'speaking' || state === 'thinking' ? Infinity : 0
          }}
        >
          <Crown className="text-white drop-shadow-lg" style={{ width: size * 0.4, height: size * 0.4 }} />
        </motion.div>
      </div>
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function AIAvatarOrb({
  className,
  size = 'md',
  position = 'fixed',
  placement = 'bottom-right',
  showChat = true,
  onStateChange,
  enableOfflineMode = true,
}: AIAvatarOrbProps) {
  // State
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [lastResponse, setLastResponse] = useState('');
  const [showResponse, setShowResponse] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [announcement, setAnnouncement] = useState('');
  const [showShortcuts, setShowShortcuts] = useState(false);

  // Refs
  const containerRef = useRef<HTMLDivElement>(null);
  const chatPanelRef = useRef<HTMLDivElement>(null);
  const toggleButtonRef = useRef<HTMLButtonElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  // Hooks
  const { toast } = useToast();
  const prefersReducedMotion = useReducedMotion();
  const sizeConfig = SIZE_CONFIG[size];
  const stateInfo = AVATAR_STATES[avatarState];

  const { messages, isStreaming, sendMessage } = useChatAI();

  const {
    isActive: isListening,
    isSupported: isVoiceSupported,
    transcript,
    interimTranscript,
    startListening,
    stopListening,
    clearTranscript,
    permissionDenied,
  } = useVoiceInput({
    onTranscript: handleVoiceTranscript,
    continuous: true,
    interimResults: true,
  });

  // Effects
  useEffect(() => {
    if ('speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
    }
  }, []);

  useEffect(() => {
    const handleOnline = () => {
      setIsOffline(false);
      if (avatarState === 'offline') {
        setAvatarState('idle');
      }
      setAnnouncement('Connection restored. Online mode active.');
    };

    const handleOffline = () => {
      setIsOffline(true);
      setAvatarState('offline');
      setAnnouncement('You are offline. Limited responses available.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [avatarState]);

  useEffect(() => {
    onStateChange?.(avatarState);
    setAnnouncement(stateInfo.description);

    if ('vibrate' in navigator && avatarState !== 'idle' && avatarState !== 'offline') {
      navigator.vibrate(avatarState === 'listening' ? 50 : 30);
    }
  }, [avatarState, onStateChange, stateInfo.description]);

  useEffect(() => {
    if (permissionDenied) {
      toast({
        title: 'Microphone Access Required',
        description: 'Please allow microphone access to use voice input.',
        variant: 'destructive',
      });
      setAvatarState('error');
    }
  }, [permissionDenied, toast]);

  // Focus trap for chat panel
  useEffect(() => {
    if (!isChatOpen) return;

    const container = chatPanelRef.current;
    if (!container) return;

    const focusableElements = container.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    const handleTabKey = (e: KeyboardEvent) => {
      if (e.key !== 'Tab') return;

      if (e.shiftKey && document.activeElement === firstElement) {
        e.preventDefault();
        lastElement?.focus();
      } else if (!e.shiftKey && document.activeElement === lastElement) {
        e.preventDefault();
        firstElement?.focus();
      }
    };

    container.addEventListener('keydown', handleTabKey);
    firstElement?.focus();

    return () => {
      container.removeEventListener('keydown', handleTabKey);
    };
  }, [isChatOpen]);

  // Handlers
  async function handleVoiceTranscript(text: string, isFinal: boolean) {
    if (!isFinal || !text.trim()) return;

    stopListening();

    if (isOffline && enableOfflineMode) {
      setAvatarState('thinking');
      const offlineResponse = getOfflineResponse(text);

      setTimeout(() => {
        setAvatarState('speaking');
        setLastResponse(offlineResponse);
        setShowResponse(true);

        if (!isMuted) {
          speakText(offlineResponse);
        }

        setTimeout(() => {
          setShowResponse(false);
          setAvatarState('offline');
        }, 5000);
      }, 800);

      return;
    }

    setAvatarState('thinking');

    try {
      await sendMessage(text);

      setAvatarState('speaking');
      const response = messages[messages.length - 1]?.content ||
        "I'm here to help you find your perfect match!";

      setLastResponse(response);
      setShowResponse(true);

      if (!isMuted) {
        speakText(response);
      }

      setTimeout(() => {
        setShowResponse(false);
        setAvatarState(isOffline ? 'offline' : 'idle');
      }, 5000);

    } catch (err) {
      console.error('AI processing error:', err);
      setAvatarState('error');

      toast({
        title: 'Processing Error',
        description: 'Failed to process your request. Please try again.',
        variant: 'destructive',
      });

      setTimeout(() => setAvatarState(isOffline ? 'offline' : 'idle'), 3000);
    }
  }

  const speakText = useCallback((text: string) => {
    if (!synthRef.current || isMuted) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    utterance.volume = 0.8;

    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Google US English') ||
      v.name.includes('Samantha') ||
      v.name.includes('Victoria')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => {
      setAvatarState(isOffline ? 'offline' : 'idle');
      setShowResponse(false);
    };

    utterance.onerror = () => {
      setAvatarState(isOffline ? 'offline' : 'idle');
    };

    utteranceRef.current = utterance;
    synthRef.current.speak(utterance);
  }, [isMuted, isOffline]);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      setAvatarState(isOffline ? 'offline' : 'idle');
    } else {
      clearTranscript();
      startListening();
      setAvatarState('listening');
      setIsChatOpen(true);
    }
  }, [isListening, startListening, stopListening, clearTranscript, isOffline]);

  const toggleChat = useCallback(() => {
    setIsChatOpen(prev => !prev);
  }, []);

  const closeChat = useCallback(() => {
    setIsChatOpen(false);
    stopListening();
    setAvatarState(isOffline ? 'offline' : 'idle');
    toggleButtonRef.current?.focus();
  }, [stopListening, isOffline]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (e.key === 'Escape' && isChatOpen) {
        e.preventDefault();
        closeChat();
        return;
      }

      if (!e.ctrlKey && !e.metaKey) return;

      switch (e.key.toLowerCase()) {
        case 'c':
          e.preventDefault();
          toggleChat();
          break;
        case 'v':
          e.preventDefault();
          toggleListening();
          break;
        case 'm':
          e.preventDefault();
          setIsMuted(prev => !prev);
          break;
        case '/':
          e.preventDefault();
          setShowShortcuts(prev => !prev);
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isChatOpen, closeChat, toggleChat, toggleListening]);

  // Position classes
  const positionClasses = useMemo(() => {
    const styles: Record<string, Record<string, string>> = {
      fixed: {
        'bottom-right': 'fixed bottom-6 right-6 z-50',
        'bottom-left': 'fixed bottom-6 left-6 z-50',
        center: 'fixed bottom-1/2 right-1/2 translate-x-1/2 translate-y-1/2 z-50',
      },
      relative: { 'bottom-right': '', 'bottom-left': '', center: '' },
      absolute: { 'bottom-right': '', 'bottom-left': '', center: '' },
    };
    return styles[position]?.[placement] ?? '';
  }, [position, placement]);

  const currentColor = stateInfo.color;

  return (
    <div
      ref={containerRef}
      className={cn(positionClasses, 'flex flex-col items-end gap-3', className)}
      role="region"
      aria-label="AI Assistant"
    >
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live={stateInfo.ariaLive} aria-atomic="true">
        {announcement}
      </div>

      {/* Response Toast */}
      <AnimatePresence>
        {showResponse && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl p-4 max-w-[280px] mb-2"
            style={{ boxShadow: `0 8px 32px ${currentColor}44` }}
            role="alert"
            aria-label="AI Response"
          >
            <div className="flex items-start gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center shrink-0"
                style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}88)` }}
                aria-hidden="true"
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

      {/* Chat Panel */}
      <AnimatePresence>
        {showChat && isChatOpen && (
          <motion.div
            ref={chatPanelRef}
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-2xl shadow-2xl overflow-hidden mb-2 w-[320px]"
            style={{ boxShadow: `0 8px 32px ${currentColor}33` }}
            role="dialog"
            aria-modal="true"
            aria-label="AI Assistant Chat"
          >
            {/* Header */}
            <div
              className="flex items-center justify-between p-3 border-b border-border"
              style={{ background: `linear-gradient(90deg, ${currentColor}15, ${currentColor}08)` }}
            >
              <div className="flex items-center gap-2">
                <div
                  className="w-8 h-8 rounded-full flex items-center justify-center"
                  style={{ background: `linear-gradient(135deg, ${currentColor}, ${currentColor}88)` }}
                  aria-hidden="true"
                >
                  {isOffline ? <WifiOff className="w-4 h-4 text-white" /> : <Crown className="w-4 h-4 text-white" />}
                </div>
                <div>
                  <span className="font-bold text-sm">AI Assistant</span>
                  {isOffline && (
                    <span className="block text-xs text-amber-500 font-medium">Offline Mode</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setIsMuted(!isMuted)}
                  aria-label={isMuted ? 'Unmute voice' : 'Mute voice'}
                  title={`${isMuted ? 'Unmute' : 'Mute'} (Ctrl+M)`}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setShowShortcuts(true)}
                  aria-label="Show keyboard shortcuts"
                  title="Shortcuts (Ctrl+/)"
                >
                  <Keyboard className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={closeChat}
                  aria-label="Close chat panel"
                  title="Close (Escape)"
                >
                  <X className="w-3.5 h-3.5" />
                </Button>
              </div>
            </div>

            {/* Voice Transcript */}
            <div className="p-3 space-y-2 min-h-[60px]">
              {(interimTranscript || transcript) && (
                <div className="bg-muted rounded-lg p-2 text-sm">
                  <span className="text-muted-foreground text-xs font-medium">You said:</span>
                  <p className="mt-0.5">{interimTranscript || transcript}</p>
                </div>
              )}
              {isStreaming && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="animate-pulse">●</span>
                  <span>Processing...</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="p-3 border-t border-border">
              <div className="flex items-center gap-2">
                <Button
                  ref={toggleButtonRef}
                  variant={isListening ? 'destructive' : 'default'}
                  size="sm"
                  className="flex-1 gap-2 font-semibold"
                  style={!isListening ? {
                    background: `linear-gradient(135deg, ${currentColor}, ${currentColor}88)`,
                  } : {}}
                  onClick={toggleListening}
                  disabled={!isVoiceSupported}
                  aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                >
                  {isListening ? (
                    <><MicOff className="w-4 h-4" /> Stop</>
                  ) : (
                    <><Mic className="w-4 h-4" /> {isOffline ? 'Voice (Offline)' : 'Ask AI'}</>
                  )}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={closeChat}
                >
                  Close
                </Button>
              </div>

              {/* Keyboard shortcuts hint */}
              <div className="mt-2 text-xs text-muted-foreground flex items-center justify-between">
                <span>Ctrl+C: Chat • Ctrl+V: Voice • Esc: Close</span>
                <button
                  onClick={() => setShowShortcuts(true)}
                  className="hover:text-foreground transition-colors"
                >
                  More shortcuts
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Keyboard Shortcuts Modal */}
      <AnimatePresence>
        {showShortcuts && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-card/95 backdrop-blur-xl border border-border rounded-xl shadow-2xl p-4 mb-2 w-[280px]"
            role="dialog"
            aria-label="Keyboard shortcuts"
          >
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-sm">Keyboard Shortcuts</h3>
              <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => setShowShortcuts(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl + C</kbd>
                <span className="text-muted-foreground">Toggle chat</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl + V</kbd>
                <span className="text-muted-foreground">Toggle voice</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Ctrl + M</kbd>
                <span className="text-muted-foreground">Toggle mute</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Escape</kbd>
                <span className="text-muted-foreground">Close chat</span>
              </div>
              <div className="flex justify-between">
                <kbd className="px-2 py-0.5 bg-muted rounded text-xs">Enter / Space</kbd>
                <span className="text-muted-foreground">Activate voice</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Avatar Container */}
      <div
        className="relative group"
        style={{ width: sizeConfig.container, height: sizeConfig.container }}
      >
        {/* Listening Pulse Rings */}
        <AnimatePresence>
          {isListening && (
            <>
              {[0, 1, 2].map((i) => (
                <motion.div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 pointer-events-none"
                  style={{ borderColor: currentColor }}
                  initial={{ scale: 1, opacity: 0.6 }}
                  animate={{ scale: 1.5 + i * 0.3, opacity: 0 }}
                  transition={{
                    duration: 1.5,
                    delay: i * 0.4,
                    repeat: Infinity,
                    ease: 'easeOut',
                  }}
                  aria-hidden="true"
                />
              ))}
            </>
          )}
        </AnimatePresence>

        {/* Main Orb Button */}
        <button
          ref={toggleButtonRef}
          className={cn(
            "absolute inset-0 flex items-center justify-center rounded-full",
            "focus:outline-none focus-visible:ring-4 focus-visible:ring-offset-2",
            "transition-transform active:scale-95 hover:scale-105"
          )}
          style={{ '--tw-ring-color': currentColor } as React.CSSProperties}
          onClick={() => !isListening && toggleChat()}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault();
              toggleListening();
            }
          }}
          aria-label={`${stateInfo.label}. ${stateInfo.description}`}
          aria-pressed={isListening}
        >
          <OrbCore
            state={avatarState}
            size={sizeConfig.orb}
            prefersReducedMotion={prefersReducedMotion ?? false}
          />
        </button>

        {/* Status Badge */}
        <div className="absolute -bottom-1 left-1/2 -translate-x-1/2">
          <span
            className="px-3 py-1 rounded-full text-[10px] font-bold backdrop-blur-md whitespace-nowrap flex items-center gap-1"
            style={{
              background: `${currentColor}33`,
              color: currentColor,
              border: `1px solid ${currentColor}44`,
            }}
          >
            {isOffline && <WifiOff className="w-3 h-3" />}
            {stateInfo.label}
          </span>
        </div>

        {/* Quick Voice Toggle Button */}
        <Button
          variant="default"
          size="icon"
          className="absolute -top-2 -right-2 w-10 h-10 rounded-full shadow-lg transition-transform hover:scale-105"
          style={{
            background: isListening ? '#FF4444' : `linear-gradient(135deg, ${currentColor}, ${currentColor}88)`,
            boxShadow: `0 4px 20px ${currentColor}44`,
          }}
          onClick={toggleListening}
          disabled={!isVoiceSupported}
          aria-label={isListening ? 'Stop voice input' : 'Start voice input'}
          title={isListening ? 'Stop listening' : 'Start listening (Ctrl+V)'}
        >
          {isListening ? <MicOff className="w-5 h-5 text-white" /> : <Mic className="w-5 h-5 text-white" />}
        </Button>
      </div>

      {/* Screen reader only instructions */}
      <div className="sr-only" role="complementary" aria-label="AI Assistant Help">
        <p>AI Assistant keyboard shortcuts available:</p>
        <ul>
          <li>Control plus C: Toggle chat panel</li>
          <li>Control plus V: Toggle voice input</li>
          <li>Control plus M: Toggle mute</li>
          <li>Escape: Close chat panel</li>
          <li>Enter or Space: Activate voice when focused</li>
        </ul>
      </div>
    </div>
  );
}

export default AIAvatarOrb;
