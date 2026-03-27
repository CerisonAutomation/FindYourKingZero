/**
 * MobileAIAvatar — Mobile-first AI assistant with proper tap/hold gestures
 *
 * Interaction Pattern:
 * - TAP (short press < 300ms): Open bottom sheet chat
 * - HOLD (long press > 500ms): Start voice input
 * - Release while holding: Stop voice input
 *
 * Keyless AI Backend:
 * - Web Speech API for voice recognition (no API key)
 * - Edge functions with signed URLs for AI processing
 * - Porcupine wake word for hands-free activation (optional)
 */

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence, useMotionValue, useTransform, type PanInfo } from 'framer-motion';
import {
  Mic,
  MicOff,
  Volume2,
  VolumeX,
  X,
  WifiOff,
  Sparkles,
  Send
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAI } from '@/hooks/useAI';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import { useToast } from '@/hooks/use-toast';
import { getOfflineResponse } from '@/lib/ai/offlineResponses';

// =============================================================================
// TYPES
// =============================================================================

type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'error' | 'offline';
type SheetState = 'collapsed' | 'expanded' | 'full';

interface MobileAIAvatarProps {
  className?: string;
  /** Positioning mode (unused, always fixed for mobile) */
  _position?: 'fixed' | 'relative' | 'absolute';
  enableOfflineMode?: boolean;
  /** Minimum drag distance to trigger swipe (px) - unused */
  _swipeThreshold?: number;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  isOffline?: boolean;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const STATE_CONFIG: Record<AvatarState, {
  label: string;
  color: string;
  icon: typeof Mic;
  description: string;
}> = {
  idle: {
    label: 'Ask AI',
    color: '#8B5CF6',
    icon: Mic,
    description: 'Tap to speak or swipe up for chat'
  },
  listening: {
    label: 'Listening...',
    color: '#EF4444',
    icon: MicOff,
    description: 'Speak now. Tap to stop.'
  },
  thinking: {
    label: 'Thinking...',
    color: '#F59E0B',
    icon: Sparkles,
    description: 'Processing your request'
  },
  speaking: {
    label: 'Speaking',
    color: '#10B981',
    icon: Volume2,
    description: 'Playing response'
  },
  error: {
    label: 'Error',
    color: '#EF4444',
    icon: MicOff,
    description: 'Something went wrong'
  },
  offline: {
    label: 'Offline',
    color: '#6B7280',
    icon: WifiOff,
    description: 'Limited responses available'
  },
};

// Mobile design constants
const MOBILE = {
  FAB_SIZE: 56,
  BOTTOM_SHEET_SNAP_POINTS: [0.15, 0.5, 0.92],
  SWIPE_THRESHOLD: 50,
  TOUCH_TARGET_MIN: 44,
  LONG_PRESS_DURATION: 500, // ms to trigger voice
  TAP_MAX_DURATION: 300,    // ms to consider a tap
  HAPTIC_LIGHT: 10,         // ms for light feedback
  HAPTIC_MEDIUM: 20,        // ms for medium feedback
  HAPTIC_HEAVY: 30,         // ms for heavy feedback
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

// getOfflineResponse is now imported from '@/lib/ai/offlineResponses'

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

// =============================================================================
// ANIMATION VARIANTS
// =============================================================================

const sheetVariants = {
  collapsed: { y: '85%' },
  expanded: { y: '50%' },
  full: { y: '8%' },
};

// Animation variants (unused but kept for future use)
const _fabVariants = {
  idle: { scale: 1 },
  pressed: { scale: 0.95 },
};

// =============================================================================
// SUB-COMPONENTS
// =============================================================================

interface BottomSheetProps {
  isOpen: boolean;
  sheetState: SheetState;
  onStateChange: (state: SheetState) => void;
  onClose: () => void;
  children: React.ReactNode;
}

function BottomSheet({ isOpen, sheetState, onStateChange, onClose, children }: BottomSheetProps) {
  const y = useMotionValue(0);
  const backgroundOpacity = useTransform(y, [0, 300], [0.5, 0]);

  const handleDragEnd = (_event: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const velocity = info.velocity.y;
    const offset = info.offset.y;

    // Swipe down fast
    if (velocity > 500) {
      if (sheetState === 'full') onStateChange('expanded');
      else if (sheetState === 'expanded') onStateChange('collapsed');
      else onClose();
      return;
    }

    // Swipe up
    if (velocity < -500) {
      if (sheetState === 'collapsed') onStateChange('expanded');
      else if (sheetState === 'expanded') onStateChange('full');
      return;
    }

    // Based on position
    if (offset > 100) {
      if (sheetState === 'full') onStateChange('expanded');
      else if (sheetState === 'expanded') onStateChange('collapsed');
      else onClose();
    } else if (offset < -100) {
      if (sheetState === 'collapsed') onStateChange('expanded');
      else if (sheetState === 'expanded') onStateChange('full');
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 pointer-events-none"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0 bg-black pointer-events-auto"
        style={{ opacity: backgroundOpacity }}
        onClick={onClose}
      />

      {/* Sheet */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 bg-background rounded-t-3xl shadow-2xl pointer-events-auto overflow-hidden"
        style={{ y, height: '95%' }}
        initial="collapsed"
        animate={sheetState}
        variants={sheetVariants}
        transition={{ type: 'spring', damping: 25, stiffness: 300 }}
        drag="y"
        dragConstraints={{ top: 0, bottom: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
      >
        {/* Drag Handle */}
        <div className="w-full pt-3 pb-1 flex justify-center">
          <div className="w-12 h-1.5 bg-muted-foreground/30 rounded-full" />
        </div>

        {/* Sheet Header */}
        <div className="px-4 py-2 border-b flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-purple-500" />
            <span className="font-semibold">AI Assistant</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-full"
            onClick={onClose}
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        {/* Content */}
        <div className="h-full overflow-y-auto">
          {children}
        </div>
      </motion.div>
    </motion.div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function MobileAIAvatar({
  className,
  _position = 'fixed',
  enableOfflineMode = true,
  _swipeThreshold = MOBILE.SWIPE_THRESHOLD,
}: MobileAIAvatarProps) {
  // State
  const [avatarState, setAvatarState] = useState<AvatarState>('idle');
  const [sheetState, setSheetState] = useState<SheetState>('collapsed');
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [isMuted, setIsMuted] = useState(false);
  const [isOffline, setIsOffline] = useState(!navigator.onLine);
  const [announcement, setAnnouncement] = useState('');

  // Refs
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Gesture handling refs
  const pressStartTimeRef = useRef<number>(0);
  const isLongPressRef = useRef<boolean>(false);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const hasTriggeredVoiceRef = useRef<boolean>(false);
  const { toast } = useToast();
  const stateConfig = STATE_CONFIG[avatarState];
  const StateIcon = stateConfig.icon;

  const { messages: aiMessages, isStreaming, sendMessage: sendAIMessage } = useAI();

  const {
    isActive: isListening,
    isSupported: isVoiceSupported,
    transcript: _transcript,
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
      if (avatarState === 'offline') setAvatarState('idle');
    };
    const handleOffline = () => {
      setIsOffline(true);
      setAvatarState('offline');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [avatarState]);

  useEffect(() => {
    setAnnouncement(stateConfig.description);
  }, [avatarState, stateConfig.description]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    if (permissionDenied) {
      toast({
        title: 'Microphone Access Required',
        description: 'Please allow microphone access in your device settings.',
        variant: 'destructive',
      });
    }
  }, [permissionDenied, toast]);

  // Haptic feedback helper
  const triggerHaptic = useCallback((duration: number = MOBILE.HAPTIC_LIGHT) => {
    if ('vibrate' in navigator) {
      navigator.vibrate(duration);
    }
  }, []);

  // Core handlers (must be defined before gesture handlers)
  const openSheet = useCallback(() => {
    setIsSheetOpen(true);
    setSheetState('expanded');
    setTimeout(() => inputRef.current?.focus(), 100);
  }, []);

  const toggleListening = useCallback(() => {
    if (isListening) {
      stopListening();
      setAvatarState(isOffline ? 'offline' : 'idle');
    } else {
      clearTranscript();
      startListening();
      setAvatarState('listening');
    }
  }, [isListening, stopListening, isOffline, startListening, clearTranscript]);

  // Gesture Handlers - TAP for menu, HOLD for voice
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    e.preventDefault();
    pressStartTimeRef.current = Date.now();
    isLongPressRef.current = false;
    hasTriggeredVoiceRef.current = false;

    longPressTimerRef.current = setTimeout(() => {
      isLongPressRef.current = true;
      hasTriggeredVoiceRef.current = true;
      triggerHaptic(MOBILE.HAPTIC_MEDIUM);
      toggleListening();
    }, MOBILE.LONG_PRESS_DURATION);
  }, [toggleListening, triggerHaptic]);

  const handlePointerUp = useCallback((e: React.PointerEvent) => {
    e.preventDefault();

    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    const pressDuration = Date.now() - pressStartTimeRef.current;

    if (hasTriggeredVoiceRef.current && isListening) {
      stopListening();
      setAvatarState(isOffline ? 'offline' : 'idle');
      return;
    }

    if (pressDuration < MOBILE.TAP_MAX_DURATION && !isLongPressRef.current) {
      triggerHaptic(MOBILE.HAPTIC_LIGHT);
      openSheet();
    }
  }, [isListening, stopListening, isOffline, openSheet, triggerHaptic]);

  const handlePointerLeave = useCallback(() => {
    if (longPressTimerRef.current) {
      clearTimeout(longPressTimerRef.current);
      longPressTimerRef.current = null;
    }

    if (hasTriggeredVoiceRef.current && isListening) {
      stopListening();
      setAvatarState(isOffline ? 'offline' : 'idle');
    }
  }, [isListening, stopListening, isOffline]);

  async function handleVoiceTranscript(text: string, isFinal: boolean) {
    if (!isFinal || !text.trim()) return;

    stopListening();

    // Add user message
    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    // Open sheet to show conversation
    setIsSheetOpen(true);
    setSheetState('expanded');

    // Process response
    await processResponse(text);
  }

  async function processResponse(userText: string) {
    setAvatarState('thinking');

    let responseText: string;
    let isOfflineResponse = false;

    if (isOffline && enableOfflineMode) {
      responseText = getOfflineResponse(userText);
      isOfflineResponse = true;

      // Simulate processing delay
      await new Promise(r => setTimeout(r, 800));
    } else {
      try {
        await sendAIMessage(userText);
        responseText = aiMessages[aiMessages.length - 1]?.content ||
          "I'm here to help! What would you like to know?";
      } catch (_err) {
        responseText = "Sorry, I couldn't process that. Please try again.";
        setAvatarState('error');
      }
    }

    // Add assistant message
    const assistantMessage: Message = {
      id: generateId(),
      role: 'assistant',
      content: responseText,
      timestamp: Date.now(),
      isOffline: isOfflineResponse,
    };
    setMessages(prev => [...prev, assistantMessage]);

    // Speak if not muted
    if (!isMuted) {
      setAvatarState('speaking');
      speakText(responseText);
    } else {
      setAvatarState(isOffline ? 'offline' : 'idle');
    }
  }

  const speakText = useCallback((text: string) => {
    if (!synthRef.current || isMuted) return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1.1; // Slightly faster for mobile
    utterance.pitch = 1;
    utterance.volume = 1;

    // Try to get a natural voice
    const voices = synthRef.current.getVoices();
    const preferredVoice = voices.find(v =>
      v.name.includes('Google US English') ||
      v.name.includes('Samantha')
    );
    if (preferredVoice) utterance.voice = preferredVoice;

    utterance.onend = () => setAvatarState(isOffline ? 'offline' : 'idle');
    utterance.onerror = () => setAvatarState(isOffline ? 'offline' : 'idle');

    synthRef.current.speak(utterance);
  }, [isMuted, isOffline]);

  const handleSendText = async () => {
    if (!inputText.trim()) return;

    const text = inputText.trim();
    setInputText('');

    const userMessage: Message = {
      id: generateId(),
      role: 'user',
      content: text,
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, userMessage]);

    await processResponse(text);
  };

  const closeSheet = () => {
    setIsSheetOpen(false);
    setSheetState('collapsed');
    stopListening();
    setAvatarState(isOffline ? 'offline' : 'idle');
  };

  // =============================================================================
  // RENDER
  // =============================================================================

  return (
    <>
      {/* Screen reader announcements */}
      <div className="sr-only" aria-live="polite" aria-atomic="true">
        {announcement}
      </div>

      {/* Floating Action Button - TAP for menu, HOLD for voice */}
      <motion.button
        className={cn(
          "fixed bottom-6 right-4 z-40 rounded-full shadow-xl",
          "flex items-center justify-center select-none",
          "transition-colors focus:outline-none focus:ring-4 focus:ring-offset-2",
          "active:scale-95",
          isListening && "animate-pulse",
          className
        )}
        style={{
          width: MOBILE.FAB_SIZE,
          height: MOBILE.FAB_SIZE,
          background: isListening
            ? 'linear-gradient(135deg, #EF4444, #DC2626)'
            : `linear-gradient(135deg, ${stateConfig.color}, ${stateConfig.color}DD)`,
          boxShadow: `0 4px 20px ${stateConfig.color}66`,
          touchAction: 'none', // Prevent scroll while holding
        }}
        onPointerDown={handlePointerDown}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerLeave}
        onContextMenu={(e) => e.preventDefault()} // Prevent long-press menu
        aria-label={stateConfig.description}
        aria-pressed={isListening}
      >
        <StateIcon className="w-6 h-6 text-white pointer-events-none" />

        {/* Ripple effect when listening */}
        {isListening && (
          <>
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.5, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5 }}
            />
            <motion.span
              className="absolute inset-0 rounded-full border-2 border-white pointer-events-none"
              initial={{ scale: 1, opacity: 0.5 }}
              animate={{ scale: 1.8, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }}
            />
          </>
        )}
      </motion.button>

      {/* Gesture hint */}
      <AnimatePresence>
        {!isSheetOpen && !isListening && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="fixed bottom-20 right-4 z-30 text-xs text-muted-foreground bg-background/90 px-3 py-1.5 rounded-full backdrop-blur shadow-sm"
          >
            Tap for chat • Hold for voice
          </motion.div>
        )}
      </AnimatePresence>

      {/* Bottom Sheet Chat Interface */}
      <AnimatePresence>
        {isSheetOpen && (
          <BottomSheet
            isOpen={isSheetOpen}
            sheetState={sheetState}
            onStateChange={setSheetState}
            onClose={closeSheet}
          >
            <div className="flex flex-col h-full pb-32">
              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
                {messages.length === 0 && (
                  <div className="text-center text-muted-foreground py-8">
                    <Sparkles className="w-12 h-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">How can I help?</p>
                    <p className="text-sm mt-1">Tap the mic or type a message</p>
                  </div>
                )}

                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={cn(
                      "flex",
                      msg.role === 'user' ? "justify-end" : "justify-start"
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-2xl px-4 py-3",
                        msg.role === 'user'
                          ? "bg-purple-500 text-white rounded-br-md"
                          : "bg-muted rounded-bl-md"
                      )}
                    >
                      {msg.isOffline && (
                        <span className="flex items-center gap-1 text-xs opacity-70 mb-1">
                          <WifiOff className="w-3 h-3" />
                          Offline
                        </span>
                      )}
                      <p className="text-sm leading-relaxed">{msg.content}</p>
                      <span className="text-[10px] opacity-50 mt-1 block">
                        {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))}

                {isStreaming && (
                  <div className="flex justify-start">
                    <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3">
                      <span className="flex gap-1">
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-100" />
                        <span className="w-2 h-2 bg-purple-500 rounded-full animate-bounce delay-200" />
                      </span>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Input Area - Mobile Optimized */}
              <div className="border-t bg-background px-4 py-3 pb-safe">
                {/* Voice Input Indicator */}
                {(isListening || interimTranscript) && (
                  <div className="mb-3 bg-purple-50 rounded-xl p-3 flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-500 flex items-center justify-center animate-pulse">
                      <Mic className="w-5 h-5 text-white" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-purple-900">
                        {interimTranscript || "Listening..."}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-10 w-10 rounded-full"
                      onClick={stopListening}
                    >
                      <X className="w-5 h-5" />
                    </Button>
                  </div>
                )}

                {/* Text Input */}
                <div className="flex items-center gap-2">
                  <div className="flex-1 relative">
                    <input
                      ref={inputRef}
                      type="text"
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleSendText();
                      }}
                      placeholder={isOffline ? "Offline mode - limited responses" : "Type a message..."}
                      className="w-full h-12 px-4 pr-12 rounded-full border bg-background text-base focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                    {inputText && (
                      <button
                        onClick={() => setInputText('')}
                        className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-muted flex items-center justify-center"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </div>

                  {/* Voice Button */}
                  <Button
                    variant={isListening ? "destructive" : "default"}
                    size="icon"
                    className="h-12 w-12 rounded-full shrink-0"
                    onClick={toggleListening}
                    disabled={!isVoiceSupported}
                  >
                    {isListening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                  </Button>

                  {/* Send Button */}
                  <Button
                    variant="default"
                    size="icon"
                    className="h-12 w-12 rounded-full shrink-0 bg-purple-500 hover:bg-purple-600"
                    onClick={handleSendText}
                    disabled={!inputText.trim()}
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>

                {/* Bottom Actions */}
                <div className="flex items-center justify-between mt-3">
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-9 px-3 text-muted-foreground"
                      onClick={() => setIsMuted(!isMuted)}
                    >
                      {isMuted ? <VolumeX className="w-4 h-4 mr-1" /> : <Volume2 className="w-4 h-4 mr-1" />}
                      {isMuted ? 'Muted' : 'Sound On'}
                    </Button>
                  </div>

                  {isOffline && (
                    <span className="flex items-center gap-1 text-xs text-amber-500">
                      <WifiOff className="w-3 h-3" />
                      Offline Mode
                    </span>
                  )}
                </div>
              </div>
            </div>
          </BottomSheet>
        )}
      </AnimatePresence>

      {/* Hidden instructions for accessibility */}
      <div className="sr-only" role="complementary" aria-label="AI Assistant Instructions">
        <p>Mobile AI Assistant Instructions:</p>
        <ul>
          <li>Tap the floating button quickly to open chat menu</li>
          <li>Press and hold the button to start voice input, release to stop</li>
          <li>Swipe up in the chat to expand, swipe down to close</li>
        </ul>
      </div>
    </>
  );
}

export type { MobileAIAvatarProps };
export default MobileAIAvatar;
