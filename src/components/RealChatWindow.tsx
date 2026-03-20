import {useCallback, useEffect, useMemo, useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
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
} from 'lucide-react';
import {Conversation, Message, useMessages, useSendMessage} from '@/hooks/useMessages';
import {useConversationPresence} from '@/hooks/usePresence';
import {REACTION_EMOJIS, useReactions} from '@/hooks/useReactions';
import {useAuth} from '@/hooks/useAuth';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Skeleton} from '@/components/ui/skeleton';
import {cn} from '@/lib/utils';
import {supabase} from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const ANON_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

/* ── AI Quick Replies ───────────────────────────────────────── */
async function fetchQuickReplies(lastMsg: string): Promise<string[]> {
    try {
        const resp = await fetch(`${SUPABASE_URL}/functions/v1/ai-chat`, {
            method: 'POST',
            headers: {'Content-Type': 'application/json', Authorization: `Bearer ${ANON_KEY}`},
            body: JSON.stringify({
                messages: [{
                    role: 'user',
                    content: `The last message received was: "${lastMsg}". Give me 3 short reply options.`
                }],
                mode: 'quick_reply',
            }),
        });
        if (!resp.ok) return [];
        const data = await resp.json();
        return Array.isArray(data.suggestions) ? data.suggestions.slice(0, 3) : [];
    } catch {
        return [];
    }
}

/* ── Reaction overlay for a single message ──────────────────── */
function ReactionPicker({messageId, onClose}: { messageId: string; onClose: () => void }) {
    const {toggleReaction, hasUserReacted} = useReactions(messageId);
    return (
        <motion.div
            initial={{opacity: 0, scale: 0.85, y: 6}}
            animate={{opacity: 1, scale: 1, y: 0}}
            exit={{opacity: 0, scale: 0.85, y: 6}}
            transition={{type: 'spring', stiffness: 500, damping: 32}}
            className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 flex gap-1 px-2.5 py-2 rounded-full z-30 border border-border/20"
            style={{background: 'hsl(var(--card))', boxShadow: '0 8px 32px hsl(0 0% 0%/0.5)'}}
            onClick={e => e.stopPropagation()}
        >
            {REACTION_EMOJIS.slice(0, 8).map(emoji => (
                <motion.button
                    key={emoji}
                    whileTap={{scale: 1.35}}
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

/* ── Reaction row below a message ───────────────────────────── */
function MessageReactionsRow({messageId}: { messageId: string }) {
    const {reactions, toggleReaction, hasUserReacted} = useReactions(messageId);

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

/* ── Message status icon ─────────────────────────────────────── */
function MsgStatus({msg, isOwn}: { msg: Message; isOwn: boolean }) {
    if (!isOwn) return null;
    if (msg.is_read) return <CheckCheck className="w-3 h-3 text-primary shrink-0"/>;
    return <Check className="w-3 h-3 text-muted-foreground/50 shrink-0"/>;
}

/* ── Single message bubble ───────────────────────────────────── */
function ChatBubble({
                        msg, isOwn, showAvatar, avatarUrl, displayName,
                    }: {
    msg: Message; isOwn: boolean; showAvatar: boolean;
    avatarUrl: string; displayName: string;
}) {
    const [pickerOpen, setPickerOpen] = useState(false);
    const longPressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onPressStart = () => {
        longPressRef.current = setTimeout(() => setPickerOpen(true), 450);
    };
    const onPressEnd = () => {
        if (longPressRef.current) clearTimeout(longPressRef.current);
    };

    const ts = (() => {
        try {
            return new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        } catch {
            return '';
        }
    })();

    return (
        <motion.div
            initial={{opacity: 0, y: 8, scale: 0.96}}
            animate={{opacity: 1, y: 0, scale: 1}}
            exit={{opacity: 0, scale: 0.92}}
            transition={{duration: 0.16, ease: [0.16, 1, 0.3, 1]}}
            className={cn('flex items-end gap-2 group', isOwn && 'flex-row-reverse')}
        >
            {/* Avatar spacer */}
            <div className="w-7 shrink-0">
                {!isOwn && showAvatar && (
                    <Avatar className="w-7 h-7">
                        <AvatarImage src={avatarUrl}/>
                        <AvatarFallback className="text-[10px] font-bold bg-secondary">{displayName[0]}</AvatarFallback>
                    </Avatar>
                )}
            </div>

            <div className={cn('flex flex-col max-w-[75%]', isOwn && 'items-end')}>
                <div className="relative">
                    {/* Reaction picker */}
                    <AnimatePresence>
                        {pickerOpen && (
                            <ReactionPicker messageId={msg.id} onClose={() => setPickerOpen(false)}/>
                        )}
                    </AnimatePresence>

                    {/* Bubble */}
                    <motion.div
                        whileTap={{scale: 0.97}}
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
                            ? {background: 'var(--gradient-primary)'}
                            : {background: 'hsl(var(--card))'}
                        }
                    >
                        <p style={{whiteSpace: 'pre-wrap'}}>{msg.content}</p>
                        <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
              <span className={cn('text-[10px]', isOwn ? 'text-white/55' : 'text-muted-foreground/60')}>
                {ts}
              </span>
                            <MsgStatus msg={msg} isOwn={isOwn}/>
                        </div>
                    </motion.div>
                </div>

                <MessageReactionsRow messageId={msg.id}/>
            </div>
        </motion.div>
    );
}

/* ── Typing indicator ────────────────────────────────────────── */
function TypingDots({avatarUrl, name}: { avatarUrl: string; name: string }) {
    return (
        <motion.div
            initial={{opacity: 0, y: 8}}
            animate={{opacity: 1, y: 0}}
            exit={{opacity: 0, y: -4}}
            className="flex items-end gap-2"
        >
            <Avatar className="w-7 h-7">
                <AvatarImage src={avatarUrl}/>
                <AvatarFallback className="text-[10px] font-bold bg-secondary">{name[0]}</AvatarFallback>
            </Avatar>
            <div className="px-3.5 py-3 rounded-2xl rounded-bl-md border border-border/20"
                 style={{background: 'hsl(var(--card))'}}>
                <div className="flex gap-1 items-center">
                    {[0, 1, 2].map(i => (
                        <motion.div
                            key={i}
                            className="w-1.5 h-1.5 rounded-full"
                            style={{background: 'hsl(var(--muted-foreground)/0.55)'}}
                            animate={{y: [0, -5, 0]}}
                            transition={{duration: 0.55, repeat: Infinity, delay: i * 0.14}}
                        />
                    ))}
                </div>
            </div>
        </motion.div>
    );
}

/* ── Main component ──────────────────────────────────────────── */
interface RealChatWindowProps {
    conversation: Conversation;
    onBack: () => void;
    onViewProfile: (profileId: string) => void;
}

export function RealChatWindow({conversation, onBack, onViewProfile}: RealChatWindowProps) {
    const {user} = useAuth();
    const [draft, setDraft] = useState('');
    const [emojiOpen, setEmojiOpen] = useState(false);
    const [quickReplies, setQuickReplies] = useState<string[]>([]);
    const [loadingQR, setLoadingQR] = useState(false);

    const messagesEndRef = useRef<HTMLDivElement>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {messages, isLoading} = useMessages(conversation.id);
    const sendMessage = useSendMessage();
    const {setTyping, isUserTyping} = useConversationPresence(conversation.id);

    const otherUserId = conversation.participant_one === user?.id
        ? conversation.participant_two
        : conversation.participant_one;

    const isOtherTyping = isUserTyping(otherUserId);
    const otherUser = conversation.other_user;
    const displayName = otherUser?.display_name || 'User';
    const avatarUrl = otherUser?.avatar_url || '';

    /* Auto scroll */
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages, isOtherTyping]);

    /* Typing indicator */
    useEffect(() => {
        let t: ReturnType<typeof setTimeout>;
        if (draft) {
            setTyping(true);
            t = setTimeout(() => setTyping(false), 2000);
        } else setTyping(false);
        return () => clearTimeout(t);
    }, [draft, setTyping]);

    /* Fetch AI quick replies when a new inbound message arrives */
    const lastInboundContent = useMemo(() => {
        const inbound = [...messages].reverse().find(m => m.sender_id !== user?.id);
        return inbound?.content || '';
    }, [messages, user?.id]);

    useEffect(() => {
        if (!lastInboundContent) return;
        let cancelled = false;
        setLoadingQR(true);
        fetchQuickReplies(lastInboundContent).then(r => {
            if (!cancelled) {
                setQuickReplies(r);
                setLoadingQR(false);
            }
        });
        return () => {
            cancelled = true;
        };
    }, [lastInboundContent]);

    /* Resize textarea */
    const resizeTa = () => {
        const ta = textareaRef.current;
        if (!ta) return;
        ta.style.height = 'auto';
        ta.style.height = `${Math.min(ta.scrollHeight, 120)}px`;
    };

    /* Send */
    const handleSend = useCallback((text?: string) => {
        const content = (text ?? draft).trim();
        if (!content) return;
        setDraft('');
        setEmojiOpen(false);
        if (textareaRef.current) textareaRef.current.style.height = 'auto';

        // Optimistic: mutate immediately
        sendMessage.mutate({conversationId: conversation.id, content});
    }, [draft, sendMessage, conversation.id]);

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    /* Emoji picker — simple inline grid */
    const EMOJIS_ROWS = [
        ['😊', '😂', '🥰', '😍', '🤩', '😎', '😏', '🤭'],
        ['❤️', '🔥', '👑', '💋', '💦', '😈', '🌹', '✨'],
        ['👍', '👋', '🫶', '🙌', '💪', '🍆', '🍑', '💯'],
    ];

    return (
        <motion.div
            initial={{x: '100%'}}
            animate={{x: 0}}
            exit={{x: '100%'}}
            transition={{type: 'spring', damping: 26, stiffness: 220}}
            className="fixed inset-0 z-50 flex flex-col bg-background"
        >
            {/* ── Header ── */}
            <header
                className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-border/20"
                style={{background: 'hsl(var(--card)/0.9)', backdropFilter: 'blur(20px)'}}
            >
                <button
                    onClick={onBack}
                    className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all bg-secondary/60"
                >
                    <ChevronLeft className="w-5 h-5"/>
                </button>

                <button
                    onClick={() => onViewProfile(otherUserId)}
                    className="flex items-center gap-2.5 flex-1 min-w-0"
                >
                    <div className="relative shrink-0">
                        <Avatar className="w-9 h-9 border border-border/30">
                            <AvatarImage src={avatarUrl}/>
                            <AvatarFallback
                                className="text-[11px] font-black bg-secondary">{displayName[0]}</AvatarFallback>
                        </Avatar>
                        {otherUser?.is_online && (
                            <span
                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full border-2 border-background bg-status-online">
                <span className="absolute inset-0 rounded-full bg-status-online animate-ping opacity-70"/>
              </span>
                        )}
                    </div>
                    <div className="text-left min-w-0">
                        <p className="font-bold text-[13px] truncate leading-tight">{displayName}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            {isOtherTyping ? (
                                <motion.span initial={{opacity: 0}} animate={{opacity: 1}}
                                             className="text-primary font-semibold">typing…</motion.span>
                            ) : otherUser?.is_online ? (
                                <span className="text-status-online font-semibold">Online</span>
                            ) : 'Offline'}
                        </p>
                    </div>
                </button>

                <div className="flex items-center gap-0.5">
                    {[Phone, Video, MoreVertical].map((Icon, i) => (
                        <button key={i}
                                className="w-9 h-9 rounded-full flex items-center justify-center active:scale-90 transition-all hover:bg-secondary/60">
                            <Icon className="w-4 h-4 text-muted-foreground"/>
                        </button>
                    ))}
                </div>
            </header>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-1.5 min-h-0">
                {/* E2E notice */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Lock className="w-3 h-3 text-muted-foreground/50"/>
                    <span
                        className="text-[10px] text-muted-foreground/50 font-medium">Messages are encrypted in transit</span>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {[...Array(6)].map((_, i) => (
                            <div key={i} className={cn('flex items-end gap-2', i % 2 === 0 ? '' : 'flex-row-reverse')}>
                                <Skeleton className="w-7 h-7 rounded-full shrink-0"/>
                                <Skeleton className={cn('h-10 rounded-2xl', i % 2 === 0 ? 'w-52' : 'w-40')}/>
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
                        {messages.map((msg, i) => {
                            const isOwn = msg.sender_id === user?.id;
                            const showAv = !isOwn && (i === 0 || messages[i - 1].sender_id !== msg.sender_id);
                            return (
                                <ChatBubble
                                    key={msg.id}
                                    msg={msg}
                                    isOwn={isOwn}
                                    showAvatar={showAv}
                                    avatarUrl={avatarUrl}
                                    displayName={displayName}
                                />
                            );
                        })}
                    </AnimatePresence>
                )}

                <AnimatePresence>
                    {isOtherTyping && <TypingDots avatarUrl={avatarUrl} name={displayName}/>}
                </AnimatePresence>

                <div ref={messagesEndRef} className="h-1"/>
            </div>

            {/* ── AI Quick Replies ── */}
            <AnimatePresence>
                {quickReplies.length > 0 && (
                    <motion.div
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: 10}}
                        className="flex-shrink-0 px-3 py-1.5 border-t border-border/15 overflow-x-auto scrollbar-hide"
                    >
                        <div className="flex gap-1.5 items-center">
                            <Zap className="w-3 h-3 text-primary shrink-0" strokeWidth={3}/>
                            {quickReplies.map((r, i) => (
                                <button
                                    key={i}
                                    onClick={() => handleSend(r)}
                                    className="px-2.5 py-1 rounded-full text-[11px] font-semibold border border-border/30 bg-secondary/50 text-foreground whitespace-nowrap hover:border-primary/40 active:scale-95 transition-all shrink-0"
                                >
                                    {r}
                                </button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Emoji Picker ── */}
            <AnimatePresence>
                {emojiOpen && (
                    <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        className="flex-shrink-0 overflow-hidden border-t border-border/20 px-3 py-2"
                        style={{background: 'hsl(var(--card))'}}
                    >
                        {EMOJIS_ROWS.map((row, ri) => (
                            <div key={ri} className="flex gap-1 mb-1">
                                {row.map(e => (
                                    <button key={e} onClick={() => setDraft(d => d + e)}
                                            className="w-8 h-8 flex items-center justify-center text-xl rounded-lg hover:bg-secondary/60 active:scale-90 transition-all">
                                        {e}
                                    </button>
                                ))}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Input dock ── */}
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
                    onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file || !user) return;
                        try {
                            const ext = file.name.split('.').pop();
                            const path = `chat/${user.id}/${Date.now()}.${ext}`;
                            const {error} = await supabase.storage.from('chat-media').upload(path, file);
                            if (!error) {
                                const {data: urlData} = supabase.storage.from('chat-media').getPublicUrl(path);
                                handleSend(urlData.publicUrl);
                            }
                        } catch { /* ignore */
                        }
                        e.target.value = '';
                    }}
                />

                <div className="flex items-end gap-1.5">
                    {/* Media */}
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-secondary/60 border border-border/25 active:scale-90 transition-all"
                    >
                        <ImagePlus className="w-4 h-4 text-muted-foreground"/>
                    </button>

                    {/* Emoji toggle */}
                    <button
                        onClick={() => setEmojiOpen(v => !v)}
                        className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center shrink-0 border transition-all active:scale-90',
                            emojiOpen ? 'bg-primary/15 border-primary/40 text-primary' : 'bg-secondary/60 border-border/25 text-muted-foreground'
                        )}
                    >
                        <Smile className="w-4 h-4"/>
                    </button>

                    {/* Text input */}
                    <textarea
                        ref={textareaRef}
                        rows={1}
                        placeholder="Message…"
                        value={draft}
                        onChange={e => {
                            setDraft(e.target.value);
                            resizeTa();
                        }}
                        onKeyDown={handleKey}
                        className="flex-1 resize-none bg-secondary/40 border border-border/25 rounded-2xl px-3.5 py-2.5 text-[13px] text-foreground placeholder:text-muted-foreground/40 focus:outline-none focus:border-primary/40 leading-snug min-h-[40px] max-h-[120px] transition-colors"
                    />

                    {/* Mic or Send */}
                    <AnimatePresence mode="wait">
                        {draft.trim() ? (
                            <motion.button
                                key="send"
                                initial={{scale: 0.6, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.6, opacity: 0}}
                                transition={{type: 'spring', stiffness: 600, damping: 30}}
                                whileTap={{scale: 0.88}}
                                onClick={() => handleSend()}
                                disabled={sendMessage.isPending}
                                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 disabled:opacity-50"
                                style={{
                                    background: 'var(--gradient-primary)',
                                    boxShadow: '0 4px 16px hsl(var(--primary)/0.45)',
                                }}
                            >
                                <Send className="w-4 h-4 text-white" strokeWidth={2.5}/>
                            </motion.button>
                        ) : (
                            <motion.button
                                key="mic"
                                initial={{scale: 0.6, opacity: 0}}
                                animate={{scale: 1, opacity: 1}}
                                exit={{scale: 0.6, opacity: 0}}
                                transition={{type: 'spring', stiffness: 600, damping: 30}}
                                whileTap={{scale: 0.88}}
                                className="w-9 h-9 rounded-full flex items-center justify-center shrink-0 bg-secondary/60 border border-border/25"
                            >
                                <Mic className="w-4 h-4 text-muted-foreground"/>
                            </motion.button>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </motion.div>
    );
}
