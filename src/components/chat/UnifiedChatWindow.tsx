import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  ImagePlus,
  Lock,
  Mic,
  MoreVertical,
  Phone,
  Send,
  Smile,
  Video,
  Zap,
  Calendar,
  Crown,
  BadgeCheck,
} from 'lucide-react';
import { Conversation, Message, useMessages, useSendMessage } from '@/hooks/useMessages';
import { useConversationPresence } from '@/hooks/usePresence';
import { REACTION_EMOJIS, useReactions } from '@/hooks/useReactions';
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

// Configuration interface for enterprise flexibility
interface ChatWindowConfig {
  enableAIReactions?: boolean;
  enableQuickReplies?: boolean;
  enableEmojiPicker?: boolean;
  enableFileUpload?: boolean;
  enableVoiceMessages?: boolean;
  enableVideoCall?: boolean;
  enableEncryptionNotice?: boolean;
  maxMessageLength?: number;
  typingTimeout?: number;
  autoScrollThreshold?: number;
  theme?: 'light' | 'dark' | 'auto';
}

interface UnifiedChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
  onViewProfile: (profileId: string) => void;
  config?: Partial<ChatWindowConfig>;
  mockMode?: boolean; // For development/testing
}

// Default configuration
const DEFAULT_CONFIG: Required<ChatWindowConfig> = {
  enableAIReactions: true,
  enableQuickReplies: true,
  enableEmojiPicker: true,
  enableFileUpload: true,
  enableVoiceMessages: true,
  enableVideoCall: true,
  enableEncryptionNotice: true,
  maxMessageLength: 1000,
  typingTimeout: 2000,
  autoScrollThreshold: 100,
  theme: 'auto',
};

// AI Quick Replies Service
class AIQuickRepliesService {
  private static instance: AIQuickRepliesService;
  private cache = new Map<string, string[]>();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes

  static getInstance(): AIQuickRepliesService {
    if (!AIQuickRepliesService.instance) {
      AIQuickRepliesService.instance = new AIQuickRepliesService();
    }
    return AIQuickRepliesService.instance;
  }

  async fetchQuickReplies(lastMessage: string): Promise<string[]> {
    const cacheKey = lastMessage.toLowerCase().trim();
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - this.getCacheTimestamp(cacheKey) < this.CACHE_TTL) {
      return cached;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('No session');

      const response = await supabase.functions.invoke('ai-chat', {
        body: {
          messages: [{
            role: 'user',
            content: `The last message received was: "${lastMessage}". Give me 3 short reply options.`
          }],
          mode: 'quick_reply',
        }
      });

      if (response.error) throw response.error;
      
      const suggestions = Array.isArray(response.data?.suggestions) 
        ? response.data.suggestions.slice(0, 3) 
        : [];

      this.cache.set(cacheKey, suggestions);
      this.setCacheTimestamp(cacheKey);
      
      return suggestions;
    } catch (error) {
      console.warn('Failed to fetch AI quick replies:', error);
      return [];
    }
  }

  private getCacheTimestamp(key: string): number {
    return parseInt(localStorage.getItem(`qr_timestamp_${key}`) || '0');
  }

  private setCacheTimestamp(key: string): void {
    localStorage.setItem(`qr_timestamp_${key}`, Date.now().toString());
  }
}

// Reaction Picker Component
function ReactionPicker({ messageId, onClose }: { messageId: string; onClose: () => void }) {
  const { toggleReaction, hasUserReacted } = useReactions(messageId);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.85, y: 6 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.85, y: 6 }}
      transition={{ type: 'spring', stiffness: 500, damping: 32 }}
      className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1 px-2.5 py-2 rounded-full z-30 border border-border/20"
      style={{ background: 'hsl(var(--card))', boxShadow: '0 8px 32px hsl(0 0% 0%/0.5)' }}
      onClick={e => e.stopPropagation()}
    >
      {REACTION_EMOJIS.slice(0, 8).map(emoji => (
        <motion.button
          key={emoji}
          whileTap={{ scale: 1.35 }}
          onClick={() => {
            toggleReaction(emoji);
            onClose();
          }}
          className={cn('text-[18px] leading-none w-8 h-8 flex items-center justify-center rounded-full transition-all',
            hasUserReacted(emoji) ? 'bg-primary/20' : 'hover:bg-secondary/60')}
        >
          {emoji}
        </motion.button>
      ))}
    </motion.div>
  );
}

// Message Reactions Component
function MessageReactionsRow({ messageId }: { messageId: string }) {
  const { reactions, toggleReaction, hasUserReacted } = useReactions(messageId);

  const grouped = useMemo(() => {
    const map = new Map<string, number>();
    reactions.forEach(r => map.set(r.emoji, (map.get(r.emoji) || 0) + 1));
    return [...map.entries()];
  }, [reactions]);

  if (!grouped.length) return null;

  return (
    <div className="flex flex-wrap gap-1 mt-1">
      {grouped.map(([emoji, count]) => (
        <button
          key={emoji}
          onClick={() => toggleReaction(emoji)}
          className={cn(
            'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold border transition-all',
            hasUserReacted(emoji)
              ? 'border-primary/50 bg-primary/15 text-primary'
              : 'border-border/30 bg-secondary/50 text-foreground',
          )}
        >
          <span>{emoji}</span>
          {count > 1 && <span className="text-[9px]">{count}</span>}
        </button>
      ))}
    </div>
  );
}

// Message Status Component
function MessageStatus({ message, isOwn }: { message: Message; isOwn: boolean }) {
  if (!isOwn) return null;
  
  const isRead = message.is_read || message.status === 'read';
  const isDelivered = message.status === 'delivered' || message.status === 'sent';
  
  if (isRead) return <CheckCheck className="w-3 h-3 text-primary shrink-0" />;
  if (isDelivered) return <Check className="w-3 h-3 text-muted-foreground/50 shrink-0" />;
  return null;
}

// Message Bubble Component
function MessageBubble({
  message,
  isOwn,
  showAvatar,
  avatarUrl,
  displayName,
  config,
}: {
  message: Message;
  isOwn: boolean;
  showAvatar: boolean;
  avatarUrl: string;
  displayName: string;
  config: Required<ChatWindowConfig>;
}) {
  const [pickerOpen, setPickerOpen] = useState(false);
  const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPressStart = () => {
    if (config.enableAIReactions) {
      longPressRef.current = setTimeout(() => setPickerOpen(true), 450);
    }
  };

  const onPressEnd = () => {
    if (longPressRef.current) clearTimeout(longPressRef.current);
  };

  const formatTime = useCallback((date: string | Date) => {
    try {
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 8, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, scale: 0.92 }}
      transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
      className={cn('flex items-end gap-2 group', isOwn && 'flex-row-reverse')}
    >
      {/* Avatar spacer */}
      <div className="w-7 shrink-0">
        {!isOwn && showAvatar && (
          <Avatar className="w-7 h-7">
            <AvatarImage src={avatarUrl} />
            <AvatarFallback className="text-[10px] font-bold bg-secondary">
              {displayName[0]}
            </AvatarFallback>
          </Avatar>
        )}
      </div>

      <div className={cn('flex flex-col max-w-[75%]', isOwn && 'items-end')}>
        <div className="relative">
          {/* Reaction picker */}
          <AnimatePresence>
            {config.enableAIReactions && pickerOpen && (
              <ReactionPicker messageId={message.id} onClose={() => setPickerOpen(false)} />
            )}
          </AnimatePresence>

          {/* Bubble */}
          <motion.div
            whileTap={{ scale: 0.97 }}
            onPointerDown={onPressStart}
            onPointerUp={onPressEnd}
            onPointerLeave={onPressEnd}
            className={cn(
              'px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed cursor-pointer select-none',
              isOwn
                ? 'rounded-br-md text-white'
                : 'rounded-bl-md border border-border/20',
            )}
            style={isOwn
              ? { background: 'var(--gradient-primary)' }
              : { background: 'hsl(var(--card))' }
            }
          >
            <p style={{ whiteSpace: 'pre-wrap' }}>{message.content}</p>
            <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
              <span className={cn('text-[10px]', isOwn ? 'text-white/55' : 'text-muted-foreground/60')}>
                {formatTime(message.created_at)}
              </span>
              <MessageStatus message={message} isOwn={isOwn} />
            </div>
          </motion.div>
        </div>

        <MessageReactionsRow messageId={message.id} />
      </div>
    </motion.div>
  );
}

// Typing Indicator Component
function TypingIndicator({ avatarUrl, name }: { avatarUrl: string; name: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4 }}
      className="flex items-end gap-2"
    >
      <Avatar className="w-7 h-7">
        <AvatarImage src={avatarUrl} />
        <AvatarFallback className="text-[10px] font-bold bg-secondary">
          {name[0]}
        </AvatarFallback>
      </Avatar>
      <div className="px-3.5 py-3 rounded-2xl rounded-bl-md border border-border/20"
        style={{ background: 'hsl(var(--card))' }}>
        <div className="flex gap-1 items-center">
          {[0, 1, 2].map(i => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full"
              style={{ background: 'hsl(var(--muted-foreground)/0.55)' }}
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 0.55, repeat: Infinity, delay: i * 0.14 }}
            />
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Main Unified Chat Window Component
export function UnifiedChatWindow({ 
  conversation, 
  onBack, 
  onViewProfile, 
  config = {},
  mockMode = false 
}: UnifiedChatWindowProps) {
  const finalConfig = useMemo(() => ({ ...DEFAULT_CONFIG, ...config }), [config]);
  const { user } = useAuth();
  const [draft, setDraft] = useState('');
  const [emojiOpen, setEmojiOpen] = useState(false);
  const [quickReplies, setQuickReplies] = useState<string[]>([]);
  const [loadingQR, setLoadingQR] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Mock mode for development
  const mockMessages = useMemo(() => {
    if (!mockMode) return [];
    return [
      {
        id: '1',
        conversation_id: conversation.id,
        sender_id: 'other',
        content: 'Hey there! I saw your profile and you seem really interesting 😊',
        type: 'text' as const,
        created_at: new Date(Date.now() - 3600000).toISOString(),
        status: 'read' as const,
        is_read: true,
      },
      {
        id: '2',
        conversation_id: conversation.id,
        sender_id: 'current-user',
        content: 'Thanks! Your profile caught my eye too. Love the photos!',
        type: 'text' as const,
        created_at: new Date(Date.now() - 3500000).toISOString(),
        status: 'read' as const,
        is_read: true,
      },
    ];
  }, [mockMode, conversation.id]);

  // Real data or mock data
  const { messages, isLoading } = mockMode 
    ? { messages: mockMessages, isLoading: false }
    : useMessages(conversation.id);
  
  const sendMessage = useSendMessage();
  const { setTyping, isUserTyping } = useConversationPresence(conversation.id);

  const otherUserId = conversation.participant_one === user?.id
    ? conversation.participant_two
    : conversation.participant_one;

  const isOtherTyping = isUserTyping(otherUserId);
  const otherUser = conversation.other_user;
  const displayName = otherUser?.display_name || conversation.participant?.name || 'User';
  const avatarUrl = otherUser?.avatar_url || conversation.participant?.avatar || '';

  // Auto scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isOtherTyping]);

  // Typing indicator
  useEffect(() => {
    let timeout: ReturnType<typeof setTimeout>;
    if (draft) {
      setTyping(true);
      timeout = setTimeout(() => setTyping(false), finalConfig.typingTimeout);
    } else {
      setTyping(false);
    }
    return () => clearTimeout(timeout);
  }, [draft, setTyping, finalConfig.typingTimeout]);

  // Fetch AI quick replies
  useEffect(() => {
    if (!finalConfig.enableQuickReplies || mockMode) return;

    const lastInboundContent = [...messages]
      .reverse()
      .find(m => m.sender_id !== user?.id)?.content || '';

    if (!lastInboundContent) return;

    let cancelled = false;
    setLoadingQR(true);
    
    AIQuickRepliesService.getInstance()
      .fetchQuickReplies(lastInboundContent)
      .then(replies => {
        if (!cancelled) {
          setQuickReplies(replies);
          setLoadingQR(false);
        }
      })
      .catch(() => {
        if (!cancelled) setLoadingQR(false);
      });

    return () => { cancelled = true; };
  }, [messages, user?.id, finalConfig.enableQuickReplies, mockMode]);

  // Resize textarea
  const resizeTextarea = useCallback(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 120)}px`;
  }, []);

  // Send message
  const handleSend = useCallback((text?: string) => {
    const content = (text ?? draft).trim();
    if (!content || content.length > finalConfig.maxMessageLength) return;

    setDraft('');
    setEmojiOpen(false);
    if (textareaRef.current) textareaRef.current.style.height = 'auto';

    if (mockMode) {
      // Mock send - just add to local state
      const newMessage: Message = {
        id: Date.now().toString(),
        conversation_id: conversation.id,
        sender_id: 'current-user',
        content,
        type: 'text',
        created_at: new Date().toISOString(),
        status: 'sent',
        is_read: false,
      };
      // In mock mode, you would update local state here
    } else {
      sendMessage.mutate({ conversationId: conversation.id, content });
    }
  }, [draft, sendMessage, conversation.id, finalConfig.maxMessageLength, mockMode]);

  // Handle keyboard events
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Emoji picker data
  const EMOJI_ROWS = [
    ['😊', '😂', '🥰', '😍', '🤩', '😎', '😏', '🤭'],
    ['❤️', '🔥', '👑', '💋', '💦', '😈', '🌹', '✨'],
    ['👍', '👋', '🫶', '🙌', '💪', '🍆', '🍑', '💯'],
  ];

  return (
    <motion.div
      initial={{ x: '100%' }}
      animate={{ x: 0 }}
      exit={{ x: '100%' }}
      transition={{ type: 'spring', damping: 26, stiffness: 220 }}
      className="fixed inset-0 z-50 flex flex-col bg-background"
    >
      {/* Header */}
      <header
        className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-border/20"
        style={{ background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(20px)' }}
      >
        <button
          onClick={onBack}
          className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all bg-secondary/60"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        <button
          onClick={() => onViewProfile(otherUserId)}
          className="flex items-center gap-2.5 flex-1 min-w-0"
        >
          <div className="relative shrink-0">
            <Avatar className="w-9 h-9 border border-border/30">
              <AvatarImage src={avatarUrl} />
              <AvatarFallback className="text-[11px] font-black bg-secondary">
                {displayName[0]}
              </AvatarFallback>
            </Avatar>
            {(otherUser?.is_online || conversation.participant?.isOnline) && (
              <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-status-online">
                <span className="absolute inset-0 rounded-full bg-status-online animate-ping opacity-70" />
              </span>
            )}
          </div>
          <div className="text-left min-w-0">
            <p className="font-bold text-[13px] truncate leading-tight flex items-center gap-1.5">
              {displayName}
              {(conversation.participant?.isVerified || otherUser?.is_verified) && (
                <BadgeCheck className="w-3.5 h-3.5 text-primary" />
              )}
              {(conversation.participant?.isPremium || otherUser?.is_premium) && (
                <Crown className="w-3.5 h-3.5 text-gold" />
              )}
            </p>
            <p className="text-[10px] text-muted-foreground leading-tight">
              {isOtherTyping ? (
                <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-primary font-semibold">
                  typing…
                </motion.span>
              ) : (otherUser?.is_online || conversation.participant?.isOnline) ? (
                <span className="text-status-online font-semibold">Online</span>
              ) : (
                'Offline'
              )}
            </p>
          </div>
        </button>

        <div className="flex items-center gap-0.5">
          {finalConfig.enableVideoCall && (
            <button className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-secondary/60">
              <Phone className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          {finalConfig.enableVideoCall && (
            <button className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-secondary/60">
              <Video className="w-4 h-4 text-muted-foreground" />
            </button>
          )}
          <button className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-secondary/60">
            <MoreVertical className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>
      </header>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-1.5 min-h-0">
        {/* Encryption notice */}
        {finalConfig.enableEncryptionNotice && (
          <div className="flex items-center justify-center gap-1.5 mb-3">
            <Lock className="w-3 h-3 text-muted-foreground/50" />
            <span className="text-[10px] text-muted-foreground/50 font-medium">
              Messages are encrypted in transit
            </span>
          </div>
        )}

        {isLoading ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
              <div key={i} className={cn('flex items-end gap-2', i % 2 === 0 ? '' : 'flex-row-reverse')}>
                <Skeleton className="w-7 h-7 rounded-full shrink-0" />
                <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-52' : 'w-40')} />
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
            <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center">
              <span className="text-2xl">👋</span>
            </div>
            <p className="font-bold text-[15px]">Say hello!</p>
            <p className="text-[13px] text-muted-foreground">You matched — break the ice.</p>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {messages.map((message, i) => {
              const isOwn = message.sender_id === user?.id;
              const showAvatar = !isOwn && (i === 0 || messages[i - 1]?.sender_id !== message.sender_id);
              
              return (
                <MessageBubble
                  key={message.id}
                  message={message}
                  isOwn={isOwn}
                  showAvatar={showAvatar}
                  avatarUrl={avatarUrl}
                  displayName={displayName}
                  config={finalConfig}
                />
              );
            })}
          </AnimatePresence>
        )}

        <AnimatePresence>
          {isOtherTyping && <TypingIndicator avatarUrl={avatarUrl} name={displayName} />}
        </AnimatePresence>

        <div ref={messagesEndRef} className="h-1" />
      </div>

      {/* AI Quick Replies */}
      <AnimatePresence>
        {finalConfig.enableQuickReplies && quickReplies.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="flex-shrink-0 px-3 py-1.5 border-t border-border/15 overflow-x-auto scrollbar-hide"
          >
            <div className="flex gap-1.5 items-center">
              <Zap className="w-3 h-3 text-primary shrink-0" strokeWidth={3} />
              {quickReplies.map((reply, i) => (
                <button
                  key={i}
                  onClick={() => handleSend(reply)}
                  className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-border/30 bg-secondary/50 text-foreground whitespace-nowrap hover:border-primary/40 active:scale-95 transition-all shrink-0"
                >
                  {reply}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Emoji Picker */}
      <AnimatePresence>
        {finalConfig.enableEmojiPicker && emojiOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="flex-shrink-0 overflow-hidden border-t border-border/20 px-3 py-2"
            style={{ background: 'hsl(var(--card))' }}
          >
            {EMOJI_ROWS.map((row, rowIndex) => (
              <div key={rowIndex} className="flex gap-1 mb-1">
                {row.map(emoji => (
                  <button
                    key={emoji}
                    onClick={() => setDraft(d => d + emoji)}
                    className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-secondary/60 active:scale-90 transition-all"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quick Actions for Provider Role */}
      {conversation.participant?.role === 'provider' && (
        <div className="px-4 py-2 border-t border-border/50">
          <Button
            variant="outline"
            size="sm"
            className="text-primary border-primary/30 hover:bg-primary/10"
          >
            <Calendar className="w-4 h-4 mr-2" />
            Quick Book
          </Button>
        </div>
      )}

      {/* Input Area */}
      <div
        className="flex-shrink-0 px-3 pt-2 pb-2 border-t border-border/15"
        style={{
          paddingBottom: 'max(env(safe-area-inset-bottom), 10px)',
          background: 'hsl(var(--background)/0.97)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          disabled={!finalConfig.enableFileUpload || mockMode}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file || !user || mockMode) return;
            
            try {
              const ext = file.name.split('.').pop();
              const path = `chat/${user.id}/${Date.now()}.${ext}`;
              const { error } = await supabase.storage.from('chat-media').upload(path, file);
              
              if (!error) {
                const { data: urlData } = supabase.storage.from('chat-media').getPublicUrl(path);
                handleSend(urlData.publicUrl);
              }
            } catch (error) {
              console.warn('Failed to upload image:', error);
            }
            e.target.value = '';
          }}
        />

        <div className="flex items-end gap-1.5">
          {/* Media button */}
          {finalConfig.enableFileUpload && (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-secondary/60 border border-border/25 active:scale-90 transition-all"
            >
              <ImagePlus className="w-4 h-4 text-muted-foreground" />
            </button>
          )}

          {/* Emoji toggle */}
          {finalConfig.enableEmojiPicker && (
            <button
              onClick={() => setEmojiOpen(v => !v)}
              className={cn(
                'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90',
                emojiOpen ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-secondary/60 border-border/25 text-muted-foreground'
              )}
            >
              <Smile className="w-4 h-4" />
            </button>
          )}

          {/* Text input */}
          <textarea
            ref={textareaRef}
            rows={1}
            placeholder="Message…"
            value={draft}
            onChange={e => {
              const value = e.target.value;
              if (value.length <= finalConfig.maxMessageLength) {
                setDraft(value);
                resizeTextarea();
              }
            }}
            onKeyDown={handleKeyDown}
            className="flex-1 resize-none bg-secondary/40 border border-border/25 rounded-2xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 leading-snug min-h-[40px] max-h-[120px] transition-colors"
          />

          {/* Send/Mic button */}
          <AnimatePresence mode="wait">
            {draft.trim() ? (
              <motion.button
                key="send"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                whileTap={{ scale: 0.88 }}
                onClick={() => handleSend()}
                disabled={sendMessage.isPending}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50"
                style={{
                  background: 'var(--gradient-primary)',
                  boxShadow: '0 4px 16px hsl(var(--primary)/0.45)',
                }}
              >
                <Send className="w-4 h-4 text-white" strokeWidth={2.5} />
              </motion.button>
            ) : (
              <motion.button
                key="mic"
                initial={{ scale: 0.6, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.6, opacity: 0 }}
                transition={{ type: 'spring', stiffness: 600, damping: 30 }}
                whileTap={{ scale: 0.88 }}
                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-secondary/60 border border-border/25"
              >
                <Mic className="w-4 h-4 text-muted-foreground" />
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
}

export default UnifiedChatWindow;
