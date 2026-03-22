import {useNavigate, useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/hooks/useAuth';
import {UnifiedChatWindow} from '@/components/chat/UnifiedChatWindow';

export default function ChatThread() {
    const {conversationId} = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();

    const {data: conversation, isLoading} = useQuery({
        queryKey: ['conversation-detail', conversationId],
        queryFn: async () => {
            if (!conversationId || !user) return null;

            const {data: conv, error} = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();

            if (error) throw error;

            const otherUserId =
                conv.participant_one === user.id ? conv.participant_two : conv.participant_one;

            const {data: profile} = await supabase
                .from('profiles')
                .select('user_id, display_name, avatar_url, is_online, last_seen')
                .eq('user_id', otherUserId)
                .single();

            return {
                ...conv,
                other_user: profile,
                unread_count: 0,
                last_message: null,
            };
        },
        enabled: !!conversationId && !!user,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"/>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Conversation not found
            </div>
        );
    }

    return (
        <UnifiedChatWindow
            conversation={conversation as any}
            onBack={() => navigate('/app/messages')}
            onViewProfile={(id: string) => navigate(`/app/profile/${id}`)}
        />
    );
}
/**
 * EventChatPage — chat room attached to a specific event
 * Auto-creates room on first open; joins user as member
 */
import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/hooks/useAuth';
import {useCreateRoom, useJoinRoom} from '@/hooks/useChatRooms';

export default function EventChatPage() {
    const {eventId} = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();
    const createRoom = useCreateRoom();
    const joinRoom = useJoinRoom();

    // Look up or create room for this event
    const {data: room, isLoading} = useQuery({
        queryKey: ['event-room', eventId],
        queryFn: async () => {
            if (!eventId) return null;
            const {data} = await (supabase as any)
                .from('chat_rooms')
                .select('*')
                .eq('event_id', eventId)
                .eq('type', 'event')
                .maybeSingle();
            return data;
        },
        enabled: !!eventId && !!user,
    });

    useEffect(() => {
        if (!room && !isLoading && eventId && user) {
            // Create + auto-join
            createRoom.mutate({
                type: 'event',
                name: 'Event Chat',
                eventId,
                isPrivate: false,
            });
        }
    }, [room, isLoading, eventId, user]);

    useEffect(() => {
        if (room && user) {
            joinRoom.mutate(room.id);
        }
    }, [room, user]);

    if (isLoading || createRoom.isPending) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full w-10 h-10 border-t-2 border-primary"/>
            </div>
        );
    }

    if (!room) return null;

    // Redirect to the generic room chat with this room's ID
    navigate(`/app/room/${room.id}`, {replace: true});
    return null;
}
import {useMemo, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {CheckCheck, MessageCircle, PenSquare, Search, X,} from 'lucide-react';
import {useConversations} from '@/hooks/useMessages';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {cn} from '@/lib/utils';
import {format, isToday, isYesterday} from 'date-fns';

type Tab = 'chats' | 'requests';

const fmtTime = (d?: string) => {
    if (!d) return '';
    try {
        const date = new Date(d);
        if (isToday(date)) return format(date, 'HH:mm');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM d');
    } catch {
        return '';
    }
};

// Deterministic avatar gradient
const AVATAR_GRADS = [
    ['hsl(0,80%,55%)', 'hsl(25,90%,55%)'],
    ['hsl(218,80%,55%)', 'hsl(268,70%,55%)'],
    ['hsl(155,60%,40%)', 'hsl(170,55%,38%)'],
    ['hsl(35,85%,52%)', 'hsl(10,80%,52%)'],
    ['hsl(268,70%,55%)', 'hsl(340,75%,55%)'],
];
const getGrad = (id: string) => AVATAR_GRADS[(id || '').charCodeAt(0) % AVATAR_GRADS.length];

export default function MessagesPage() {
    const navigate = useNavigate();
    const [searchQuery, setSearchQuery] = useState('');
    const [searchOpen, setSearchOpen] = useState(false);
    const [tab, setTab] = useState<Tab>('chats');
    const {conversations, isLoading} = useConversations();

    const filtered = useMemo(() => {
        if (!conversations) return [];
        if (!searchQuery) return conversations;
        return conversations.filter(c =>
            (c.other_user?.display_name || '').toLowerCase().includes(searchQuery.toLowerCase())
        );
    }, [conversations, searchQuery]);

    const totalUnread = useMemo(() =>
            conversations.reduce((a, c) => a + (c.unread_count || 0), 0),
        [conversations]
    );

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ─ Header ─ */}
            <header className="flex-shrink-0 glass-nav border-b border-white/[0.04] z-40">
                <div className="px-4 pt-4 pb-2.5">

                    {/* Title row */}
                    <div className="flex items-center justify-between mb-3">
                        <div>
                            <div className="flex items-center gap-2">
                                <h1 className="text-[22px] font-black tracking-tight">Messages</h1>
                                <AnimatePresence>
                                    {totalUnread > 0 && (
                                        <motion.span
                                            initial={{scale: 0}} animate={{scale: 1}} exit={{scale: 0}}
                                            className="px-1.5 py-0.5 rounded-full bg-primary text-primary-foreground text-[10px] font-black min-w-[18px] text-center"
                                        >
                                            {totalUnread}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{filtered.length} conversation{filtered.length !== 1 ? 's' : ''}</p>
                        </div>
                        <div className="flex gap-1.5">
                            <button
                                onClick={() => {
                                    setSearchOpen(s => !s);
                                    if (searchOpen) setSearchQuery('');
                                }}
                                className={cn(
                                    'w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90',
                                    searchOpen ? 'bg-primary/15 border border-primary/30 text-primary' : 'bg-secondary/60 text-muted-foreground',
                                )}>
                                {searchOpen ? <X className="w-4 h-4"/> : <Search className="w-4 h-4"/>}
                            </button>
                            <button
                                onClick={() => navigate('/app/grid')}
                                className="w-9 h-9 rounded-full bg-primary/12 border border-primary/25 flex items-center justify-center active:scale-90 transition-all">
                                <PenSquare className="w-4 h-4 text-primary"/>
                            </button>
                        </div>
                    </div>

                    {/* Search input */}
                    <AnimatePresence>
                        {searchOpen && (
                            <motion.div
                                initial={{height: 0, opacity: 0}}
                                animate={{height: 'auto', opacity: 1}}
                                exit={{height: 0, opacity: 0}}
                                className="overflow-hidden mb-2.5"
                            >
                                <div className="relative">
                                    <Search
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground pointer-events-none"/>
                                    <Input
                                        autoFocus
                                        placeholder="Search conversations…"
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                        className="pl-9 h-10 bg-secondary/40 border-border/30  text-[13px]"
                                    />
                                    {searchQuery && (
                                        <button onClick={() => setSearchQuery('')}
                                                className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-muted flex items-center justify-center">
                                            <X className="w-2.5 h-2.5 text-muted-foreground"/>
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {/* Tabs */}
                    <div className="flex gap-0 p-0.5 bg-secondary/40 ">
                        {(['chats', 'requests'] as Tab[]).map((t) => (
                            <button
                                key={t}
                                onClick={() => setTab(t)}
                                className={cn(
                                    'relative flex-1 py-1.5 px-4 rounded-[10px] text-[12px] font-bold transition-all duration-200',
                                    tab === t ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                                )}>
                                {t === 'chats' ? 'Chats' : 'Requests'}
                                {t === 'requests' && (
                                    <span
                                        className="ml-1.5 px-1 py-0.5 rounded-full bg-primary/15 text-primary text-[9px] font-black">0</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* ─ List ─ */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        /* Skeletons */
                        <div key="skel" className="px-4 pt-3 space-y-1">
                            {Array.from({length: 8}).map((_, i) => (
                                <div key={i} className="flex items-center gap-3.5 py-3 animate-pulse">
                                    <div className="w-[54px] h-[54px] rounded-full bg-secondary shrink-0"/>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-3.5 bg-secondary rounded-full w-32"/>
                                        <div className="h-3 bg-secondary/60 rounded-full w-52"/>
                                    </div>
                                    <div className="h-2.5 w-8 bg-secondary rounded-full"/>
                                </div>
                            ))}
                        </div>
                    ) : filtered.length > 0 ? (
                        <motion.div key="list" initial={{opacity: 0}} animate={{opacity: 1}}>

                            {/* Pinned / unread section marker */}
                            {totalUnread > 0 && (
                                <div className="px-4 pt-3 pb-1">
                                    <p className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.12em]">
                                        Unread · {totalUnread}
                                    </p>
                                </div>
                            )}

                            {filtered.map((conv, index) => {
                                const hasUnread = (conv.unread_count || 0) > 0;
                                const [g1, g2] = getGrad(conv.id);
                                const name = conv.other_user?.display_name || 'User';
                                const initial = name[0].toUpperCase();
                                const lastMsg = conv.last_message?.content || 'Start a conversation…';
                                const isOnline = conv.other_user?.is_online;

                                return (
                                    <motion.button
                                        key={conv.id}
                                        initial={{opacity: 0, x: -12}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: index * 0.02, duration: 0.2}}
                                        onClick={() => navigate(`/app/chat/${conv.id}`)}
                                        className={cn(
                                            'w-full flex items-center gap-3 px-4 py-3 text-left relative transition-colors duration-100',
                                            'hover:bg-secondary/15 active:bg-secondary/25',
                                            hasUnread && 'bg-primary/[0.025]',
                                        )}
                                    >
                                        {/* Unread line */}
                                        {hasUnread && (
                                            <div
                                                className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-9 bg-primary rounded-r-full"/>
                                        )}

                                        {/* Avatar */}
                                        <div className="relative shrink-0">
                                            <div className={cn(
                                                'p-[2px] rounded-full transition-all',
                                                hasUnread ? 'bg-gradient-to-br' : 'bg-transparent',
                                            )}
                                                 style={hasUnread ? {backgroundImage: `linear-gradient(135deg, ${g1}, ${g2})`} : {}}>
                                                <Avatar className="w-[52px] h-[52px] border-2 border-background">
                                                    <AvatarImage src={conv.other_user?.avatar_url || ''}/>
                                                    <AvatarFallback
                                                        className="text-[15px] font-black"
                                                        style={{
                                                            backgroundImage: `linear-gradient(135deg, ${g1}, ${g2})`,
                                                            color: 'white'
                                                        }}
                                                    >
                                                        {initial}
                                                    </AvatarFallback>
                                                </Avatar>
                                            </div>
                                            {isOnline && (
                                                <span
                                                    className="absolute bottom-0.5 right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-background"/>
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-baseline justify-between gap-2 mb-0.5">
                                                <div className="flex items-center gap-1.5 min-w-0">
                          <span className={cn(
                              'text-[13px] truncate',
                              hasUnread ? 'font-black text-foreground' : 'font-semibold text-foreground/85',
                          )}>
                            {name}
                          </span>
                                                    {isOnline && <span
                                                        className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"/>}
                                                </div>
                                                <span className={cn(
                                                    'text-[11px] shrink-0 font-medium',
                                                    hasUnread ? 'text-primary font-bold' : 'text-muted-foreground',
                                                )}>
                          {fmtTime(conv.last_message?.created_at)}
                        </span>
                                            </div>

                                            <div className="flex items-center justify-between gap-2">
                                                <p className={cn(
                                                    'text-[12px] truncate leading-snug',
                                                    hasUnread ? 'text-foreground/85 font-medium' : 'text-muted-foreground',
                                                )}>
                                                    {lastMsg}
                                                </p>
                                                {hasUnread ? (
                                                    <motion.span
                                                        initial={{scale: 0}} animate={{scale: 1}}
                                                        className="shrink-0 min-w-[18px] h-[18px] px-1.5 rounded-full bg-primary text-primary-foreground text-[8px] font-black flex items-center justify-center"
                                                    >
                                                        {conv.unread_count}
                                                    </motion.span>
                                                ) : conv.last_message ? (
                                                    <CheckCheck className="w-3.5 h-3.5 text-primary/40 shrink-0"/>
                                                ) : null}
                                            </div>
                                        </div>
                                    </motion.button>
                                );
                            })}
                            <div className="h-4"/>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="empty"
                            initial={{opacity: 0, scale: 0.95}}
                            animate={{opacity: 1, scale: 1}}
                            className="flex flex-col items-center justify-center py-28 px-8 text-center gap-4"
                        >
                            <div className="w-16 h-16  bg-secondary flex items-center justify-center">
                                <MessageCircle className="w-8 h-8 text-muted-foreground/50"/>
                            </div>
                            <div>
                                <p className="font-black text-[16px]">
                                    {searchQuery ? 'No results' : tab === 'requests' ? 'No requests' : 'No conversations'}
                                </p>
                                <p className="text-[13px] text-muted-foreground mt-1">
                                    {searchQuery ? 'Try a different name' : 'Browse profiles and tap Message to start chatting'}
                                </p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
/**
 * RoomChatPage — full-featured room chat (direct / event / circle / meetup)
 * WebSocket-backed via Supabase Realtime Presence + postgres_changes
 * Features: reactions, read receipts, typing, pinned, reply, search,
 *           disappearing messages, media, message scheduling
 */
import {useCallback, useEffect, useMemo, useRef, useState,} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
  Check,
  CheckCheck,
  ChevronLeft,
  Clock,
  Edit2,
  EyeOff,
  ImagePlus,
  Lock,
  Mic,
  Phone,
  Pin,
  Reply,
  Search,
  Send,
  Trash2,
  Users,
  Video,
  X,
} from 'lucide-react';
import {useAuth} from '@/hooks/useAuth';
import {
  ChatMessage,
  useChatRoom,
  useDeleteMessage,
  useEditMessage,
  useMessageSearch,
  usePinMessage,
  usePinnedMessages,
  useRoomMembers,
  useRoomMessages,
  useRoomReaction,
  useRoomTyping,
  useSendRoomMessage
} from '@/hooks/useChatRooms';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';

// ── Reaction emojis ───────────────────────────────────────────
const REACTIONS = ['❤️', '🔥', '😂', '👍', '😮', '😢', '🎉', '💯'];

// ── Typing indicator ──────────────────────────────────────────
function TypingIndicator({names}: { names: string[] }) {
    if (!names.length) return null;
    return (
        <motion.div initial={{opacity: 0, y: 6}} animate={{opacity: 1, y: 0}}
                    exit={{opacity: 0, y: -4}} className="flex items-center gap-2 px-4 py-1.5">
            <div className="flex gap-0.5">
                {[0, 1, 2].map(i => (
                    <motion.div key={i} className="w-1.5 h-1.5 rounded-full bg-muted-foreground/50"
                                animate={{y: [0, -4, 0]}}
                                transition={{duration: 0.55, repeat: Infinity, delay: i * 0.12}}/>
                ))}
            </div>
            <span className="text-[11px] text-muted-foreground">
        {names.length === 1 ? `${names[0]} is typing…` : `${names.length} people typing…`}
      </span>
        </motion.div>
    );
}

// ── Message status ────────────────────────────────────────────
function MsgStatus({msg, isOwn}: { msg: ChatMessage; isOwn: boolean }) {
    if (!isOwn) return null;
    if ((msg.read_by?.length ?? 0) > 0)
        return <CheckCheck className="w-3 h-3 text-primary shrink-0"/>;
    return <Check className="w-3 h-3 text-muted-foreground/40 shrink-0"/>;
}

// ── Reaction picker ───────────────────────────────────────────
function ReactionRow({msg}: { msg: ChatMessage }) {
    const {reactions, toggle} = useRoomReaction(msg.id);
    const [open, setOpen] = useState(false);

    return (
        <div className="relative">
            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.8, y: 6}} animate={{opacity: 1, scale: 1, y: 0}}
                        exit={{opacity: 0, scale: 0.8, y: 6}} transition={{type: 'spring', stiffness: 400, damping: 28}}
                        className="absolute bottom-full mb-1.5 left-0 z-40 flex gap-1 px-2 py-1.5 rounded-xl border border-border/20"
                        style={{background: 'hsl(var(--card))', boxShadow: '0 8px 24px hsl(0 0% 0%/0.45)'}}
                        onClick={e => e.stopPropagation()}
                    >
                        {REACTIONS.map(e => (
                            <motion.button key={e} whileTap={{scale: 1.4}}
                                           onClick={() => {
                                               toggle(e);
                                               setOpen(false);
                                           }}
                                           className="text-lg w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary/60 transition-all">
                                {e}
                            </motion.button>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Inline reactions display */}
            {reactions.length > 0 && (
                <div className="flex flex-wrap gap-1 mt-1">
                    {reactions.map(r => (
                        <button key={r.emoji} onClick={() => toggle(r.emoji)}
                                className={cn(
                                    'flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[11px] font-bold border transition-all',
                                    r.has_mine ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border/25 bg-secondary/50',
                                )}>
                            <span>{r.emoji}</span>
                            {r.count > 1 && <span className="text-[9px] ml-0.5">{r.count}</span>}
                        </button>
                    ))}
                    <button onClick={() => setOpen(true)}
                            className="px-1.5 py-0.5 rounded-full text-[11px] border border-border/25 bg-secondary/50 hover:border-primary/30 transition-all">
                        +
                    </button>
                </div>
            )}

            {/* Long-press trigger (invisible) */}
            {reactions.length === 0 && (
                <button onClick={() => setOpen(true)}
                        className="text-[10px] text-muted-foreground/40 hover:text-muted-foreground transition-all mt-0.5 ml-1 opacity-0 group-hover:opacity-100">
                    React
                </button>
            )}
        </div>
    );
}

// ── Reply preview ─────────────────────────────────────────────
function ReplyPreview({msg, onClear}: { msg: ChatMessage; onClear: () => void }) {
    return (
        <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}}
                    exit={{height: 0, opacity: 0}}
                    className="flex items-center gap-2 px-3 py-2 border-t border-border/15 bg-secondary/20">
            <div className="flex-1 min-w-0 pl-2 border-l-2 border-primary">
                <p className="text-[10px] text-primary font-semibold">
                    {msg.sender?.display_name ?? 'User'}
                </p>
                <p className="text-[11px] text-muted-foreground truncate">{msg.content}</p>
            </div>
            <button onClick={onClear}
                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary">
                <X className="w-3.5 h-3.5"/>
            </button>
        </motion.div>
    );
}

// ── Message bubble ────────────────────────────────────────────
function MessageBubble({
                           msg, isOwn, showAvatar, onReply, onEdit, onDelete, onPin,
                       }: {
    msg: ChatMessage; isOwn: boolean; showAvatar: boolean;
    onReply: (m: ChatMessage) => void;
    onEdit: (m: ChatMessage) => void;
    onDelete: (id: string) => void;
    onPin: (id: string, pinned: boolean) => void;
}) {
    const [menuOpen, setMenuOpen] = useState(false);
    const pressRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const onPressStart = () => {
        pressRef.current = setTimeout(() => setMenuOpen(true), 400);
    };
    const onPressEnd = () => {
        if (pressRef.current) clearTimeout(pressRef.current);
    };

    const ts = (() => {
        try {
            return new Date(msg.created_at).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
        } catch {
            return '';
        }
    })();

    const isDisappearing = msg.disappears_at && new Date(msg.disappears_at) > new Date();

    return (
        <div className={cn('flex items-end gap-2 group', isOwn && 'flex-row-reverse')}>
            {/* Avatar */}
            <div className="w-7 shrink-0">
                {!isOwn && showAvatar && (
                    <Avatar className="w-7 h-7">
                        <AvatarImage src={msg.sender?.avatar_url ?? ''}/>
                        <AvatarFallback className="text-[10px] font-black bg-secondary">
                            {(msg.sender?.display_name ?? 'U')[0]}
                        </AvatarFallback>
                    </Avatar>
                )}
            </div>

            <div className={cn('flex flex-col max-w-[78%]', isOwn && 'items-end')}>
                {/* Sender name (group only) */}
                {!isOwn && showAvatar && (
                    <span className="text-[10px] font-bold text-muted-foreground mb-1 ml-1">
            {msg.sender?.display_name ?? 'User'}
          </span>
                )}

                {/* Reply context */}
                {msg.reply_to && (
                    <div className={cn(
                        'text-[11px] px-2.5 py-1.5 rounded-lg mb-1 border-l-2 border-primary opacity-70',
                        isOwn ? 'bg-primary/10 text-right' : 'bg-secondary/60',
                    )}>
                        <p className="font-semibold text-primary text-[10px]">{msg.reply_to.sender_id}</p>
                        <p className="truncate">{msg.reply_to.content}</p>
                    </div>
                )}

                {/* Bubble */}
                <div className="relative">
                    <AnimatePresence>
                        {menuOpen && (
                            <motion.div
                                initial={{opacity: 0, scale: 0.85, y: 4}}
                                animate={{opacity: 1, scale: 1, y: 0}}
                                exit={{opacity: 0, scale: 0.85, y: 4}}
                                transition={{type: 'spring', stiffness: 400, damping: 28}}
                                className={cn(
                                    'absolute bottom-full mb-1.5 z-40 flex gap-0.5 px-1.5 py-1 rounded-xl border border-border/20',
                                    isOwn ? 'right-0' : 'left-0',
                                )}
                                style={{background: 'hsl(var(--card))', boxShadow: '0 8px 24px hsl(0 0% 0%/0.45)'}}
                                onClick={e => {
                                    e.stopPropagation();
                                    setMenuOpen(false);
                                }}
                            >
                                {[
                                    {icon: Reply, label: 'Reply', action: () => onReply(msg)},
                                    ...(isOwn ? [
                                        {icon: Edit2, label: 'Edit', action: () => onEdit(msg)},
                                        {icon: Trash2, label: 'Delete', action: () => onDelete(msg.id)},
                                    ] : []),
                                    {
                                        icon: Pin,
                                        label: msg.is_pinned ? 'Unpin' : 'Pin',
                                        action: () => onPin(msg.id, !msg.is_pinned)
                                    },
                                ].map(({icon: Icon, label, action}) => (
                                    <button key={label} onClick={action}
                                            className="flex flex-col items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-secondary/60 transition-all min-w-[44px]">
                                        <Icon className="w-3.5 h-3.5"/>
                                        <span className="text-[9px] font-medium">{label}</span>
                                    </button>
                                ))}
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <motion.div
                        initial={{opacity: 0, y: 8, scale: 0.95}}
                        animate={{opacity: 1, y: 0, scale: 1}}
                        transition={{duration: 0.14, ease: [0.16, 1, 0.3, 1]}}
                        whileTap={{scale: 0.97}}
                        onPointerDown={onPressStart}
                        onPointerUp={onPressEnd}
                        onPointerLeave={onPressEnd}
                        className={cn(
                            'px-3.5 py-2.5 text-sm leading-relaxed cursor-pointer select-none',
                            'rounded-2xl',
                            isOwn ? 'rounded-br-[4px] text-white' : 'rounded-bl-[4px] border border-border/20',
                        )}
                        style={isOwn
                            ? {background: 'var(--gradient-primary, hsl(var(--primary)))'}
                            : {background: 'hsl(var(--card))'}
                        }
                    >
                        {/* Media */}
                        {msg.media_url && msg.msg_type === 'image' && (
                            <img src={msg.media_url} alt="media"
                                 className="rounded-lg max-w-full mb-2 max-h-52 object-cover"/>
                        )}

                        {/* Content */}
                        {msg.content && (
                            <p style={{whiteSpace: 'pre-wrap'}}>{msg.content}</p>
                        )}

                        {/* Footer */}
                        <div className={cn('flex items-center gap-1 mt-1', isOwn ? 'justify-end' : 'justify-start')}>
                            {msg.is_edited && (
                                <span
                                    className={cn('text-[9px] italic', isOwn ? 'text-white/40' : 'text-muted-foreground/50')}>edited</span>
                            )}
                            {isDisappearing && <EyeOff className="w-2.5 h-2.5 opacity-50"/>}
                            {msg.is_pinned && <Pin className="w-2.5 h-2.5 text-amber-400"/>}
                            <span
                                className={cn('text-[10px]', isOwn ? 'text-white/50' : 'text-muted-foreground/55')}>{ts}</span>
                            <MsgStatus msg={msg} isOwn={isOwn}/>
                        </div>
                    </motion.div>
                </div>

                {/* Reactions */}
                <ReactionRow msg={msg}/>
            </div>
        </div>
    );
}

// ── Search overlay ────────────────────────────────────────────
function SearchOverlay({roomId, onClose, onJump}: {
    roomId: string;
    onClose: () => void;
    onJump: (id: string) => void;
}) {
    const [q, setQ] = useState('');
    const {data: results} = useMessageSearch(roomId, q);

    return (
        <motion.div initial={{y: '-100%'}} animate={{y: 0}} exit={{y: '-100%'}}
                    transition={{type: 'spring', stiffness: 320, damping: 32}}
                    className="absolute top-0 left-0 right-0 z-50 border-b border-border/20 p-3"
                    style={{background: 'hsl(var(--background))'}}
        >
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground"/>
                    <input
                        autoFocus
                        value={q} onChange={e => setQ(e.target.value)}
                        placeholder="Search messages…"
                        className="w-full h-9 pl-9 pr-3 bg-secondary/40 border border-border/30 rounded-lg text-sm focus:outline-none focus:border-primary/50"
                    />
                </div>
                <button onClick={onClose}
                        className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-secondary">
                    <X className="w-4 h-4"/>
                </button>
            </div>
            {results && results.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto space-y-1">
                    {(results as any[]).map((r: any) => (
                        <button key={r.id} onClick={() => {
                            onJump(r.id);
                            onClose();
                        }}
                                className="w-full text-left px-3 py-2 rounded-lg hover:bg-secondary/40 transition-all">
                            <p className="text-[11px] text-muted-foreground">{formatDistanceToNow(new Date(r.created_at), {addSuffix: true})}</p>
                            <p className="text-[13px] line-clamp-1">{r.content}</p>
                        </button>
                    ))}
                </div>
            )}
        </motion.div>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function RoomChatPage() {
    const {roomId} = useParams<{ roomId: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();

    const {data: room} = useChatRoom(roomId);
    const {messages, isLoading} = useRoomMessages(roomId);
    const {data: members} = useRoomMembers(roomId);
    const {data: pinned} = usePinnedMessages(roomId);
    const sendMsg = useSendRoomMessage();
    const editMsg = useEditMessage();
    const deleteMsg = useDeleteMessage();
    const pinMsg = usePinMessage();
    const {setTyping} = useRoomTyping(roomId);

    const [draft, setDraft] = useState('');
    const [replyTo, setReplyTo] = useState<ChatMessage | null>(null);
    const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null);
    const [showSearch, setShowSearch] = useState(false);
    const [showMembers, setShowMembers] = useState(false);
    const [showPinned, setShowPinned] = useState(false);
    const [typingNames, setTypingNames] = useState<string[]>([]);
    const [scheduleMode, setScheduleMode] = useState(false);
    const [disappearMode, setDisappearMode] = useState(false);

    const bottomRef = useRef<HTMLDivElement>(null);
    const taRef = useRef<HTMLTextAreaElement>(null);
    const jumpRef = useRef<string | null>(null);

    // Scroll to bottom
    useEffect(() => {
        bottomRef.current?.scrollIntoView({behavior: 'smooth'});
    }, [messages.length]);

    // Typing indicator
    useEffect(() => {
        let t: ReturnType<typeof setTimeout>;
        if (draft) {
            setTyping(true);
            t = setTimeout(() => setTyping(false), 2200);
        } else setTyping(false);
        return () => clearTimeout(t);
    }, [draft, setTyping]);

    const handleSend = useCallback(async () => {
        const content = draft.trim();
        if (!content || !roomId) return;

        if (editingMsg) {
            await editMsg.mutateAsync({messageId: editingMsg.id, content});
            setEditingMsg(null);
        } else {
            await sendMsg.mutateAsync({
                roomId,
                content,
                replyToId: replyTo?.id,
                disappearsIn: disappearMode ? 300 : undefined, // 5 min
            });
            setReplyTo(null);
        }

        setDraft('');
        if (taRef.current) taRef.current.style.height = 'auto';
    }, [draft, roomId, editingMsg, replyTo, disappearMode, sendMsg, editMsg]);

    const handleKey = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleEdit = useCallback((msg: ChatMessage) => {
        setEditingMsg(msg);
        setDraft(msg.content);
        taRef.current?.focus();
    }, []);

    const handleDelete = useCallback(async (id: string) => {
        await deleteMsg.mutateAsync(id);
    }, [deleteMsg]);

    const handlePin = useCallback(async (id: string, pin: boolean) => {
        if (!roomId) return;
        await pinMsg.mutateAsync({messageId: id, pin, roomId});
    }, [roomId, pinMsg]);

    const isGroup = room?.type !== 'direct';
    const roomName = room?.name ?? (members?.find(m => m.user_id !== user?.id)?.profile?.display_name ?? 'Chat');
    const memberCount = members?.length ?? 0;

    // Group messages by date
    const messagesByDate = useMemo(() => {
        const groups: { date: string; msgs: ChatMessage[] }[] = [];
        let lastDate = '';
        (messages ?? []).forEach(m => {
            const d = new Date(m.created_at).toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
            });
            if (d !== lastDate) {
                groups.push({date: d, msgs: []});
                lastDate = d;
            }
            groups[groups.length - 1].msgs.push(m);
        });
        return groups;
    }, [messages]);

    return (
        <motion.div
            initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}}
            transition={{type: 'spring', damping: 26, stiffness: 220}}
            className="fixed inset-0 z-50 flex flex-col"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* ── Header ── */}
            <header className="flex-shrink-0 flex items-center gap-2 px-3 py-2.5 border-b border-border/15"
                    style={{background: 'hsl(var(--card)/0.92)', backdropFilter: 'blur(20px)'}}>
                <button onClick={() => navigate(-1)}
                        className="w-9 h-9 rounded-full flex items-center justify-center bg-secondary/60 active:scale-90 transition-all">
                    <ChevronLeft className="w-5 h-5"/>
                </button>

                <div className="flex items-center gap-2.5 flex-1 min-w-0">
                    <div className="relative shrink-0">
                        {room?.avatar_url ? (
                            <Avatar className="w-9 h-9">
                                <AvatarImage src={room.avatar_url}/>
                                <AvatarFallback className="text-[11px] font-black bg-secondary">
                                    {roomName[0]}
                                </AvatarFallback>
                            </Avatar>
                        ) : (
                            <div
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/30 flex items-center justify-center">
                                <span className="text-[13px] font-black text-primary-foreground">{roomName[0]}</span>
                            </div>
                        )}
                    </div>
                    <div className="min-w-0">
                        <p className="font-black text-[13px] truncate leading-tight">{roomName}</p>
                        <p className="text-[10px] text-muted-foreground leading-tight">
                            {isGroup ? `${memberCount} members` : (
                                <span className="text-status-online font-semibold">Online</span>
                            )}
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-0.5">
                    <button onClick={() => setShowSearch(s => !s)}
                            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90',
                                showSearch ? 'bg-primary/15 text-primary' : 'hover:bg-secondary/60 text-muted-foreground')}>
                        <Search className="w-4 h-4"/>
                    </button>
                    {isGroup && (
                        <button onClick={() => setShowMembers(s => !s)}
                                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/60 text-muted-foreground active:scale-90 transition-all">
                            <Users className="w-4 h-4"/>
                        </button>
                    )}
                    {!isGroup && (
                        <>
                            <button
                                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/60 text-muted-foreground">
                                <Phone className="w-4 h-4"/>
                            </button>
                            <button
                                className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-secondary/60 text-muted-foreground">
                                <Video className="w-4 h-4"/>
                            </button>
                        </>
                    )}
                    <button onClick={() => setShowPinned(s => !s)}
                            className={cn('w-9 h-9 rounded-full flex items-center justify-center transition-all active:scale-90',
                                (pinned?.length ?? 0) > 0 ? 'text-amber-400 hover:bg-amber-400/10' : 'text-muted-foreground hover:bg-secondary/60')}>
                        <Pin className="w-4 h-4"/>
                    </button>
                </div>
            </header>

            {/* ── Search overlay ── */}
            <AnimatePresence>
                {showSearch && (
                    <div className="relative flex-shrink-0">
                        <SearchOverlay roomId={roomId!} onClose={() => setShowSearch(false)}
                                       onJump={id => {
                                           jumpRef.current = id;
                                       }}/>
                    </div>
                )}
            </AnimatePresence>

            {/* ── Pinned messages bar ── */}
            <AnimatePresence>
                {showPinned && (pinned?.length ?? 0) > 0 && (
                    <motion.div initial={{height: 0}} animate={{height: 'auto'}} exit={{height: 0}}
                                className="flex-shrink-0 overflow-hidden border-b border-amber-400/20 bg-amber-400/5">
                        <div className="px-4 py-2 space-y-1 max-h-28 overflow-y-auto">
                            <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider">Pinned
                                Messages</p>
                            {(pinned ?? []).map((p: any) => (
                                <div key={p.id} className="flex items-center gap-2">
                                    <Pin className="w-3 h-3 text-amber-400 shrink-0"/>
                                    <p className="text-[12px] text-foreground/80 truncate">{p.content}</p>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Members panel ── */}
            <AnimatePresence>
                {showMembers && (
                    <motion.div initial={{x: '100%'}} animate={{x: 0}} exit={{x: '100%'}}
                                transition={{type: 'spring', stiffness: 320, damping: 30}}
                                className="absolute top-[57px] right-0 bottom-0 w-72 z-40 border-l border-border/20 flex flex-col"
                                style={{background: 'hsl(var(--background))'}}>
                        <div className="flex items-center justify-between px-4 py-3 border-b border-border/15">
                            <span className="font-black text-[13px]">Members · {memberCount}</span>
                            <button onClick={() => setShowMembers(false)}
                                    className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-secondary">
                                <X className="w-3.5 h-3.5"/>
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto scrollbar-hide">
                            {(members ?? []).map(m => (
                                <div key={m.id} className="flex items-center gap-3 px-4 py-2.5">
                                    <div className="relative">
                                        <Avatar className="w-8 h-8">
                                            <AvatarImage src={m.profile?.avatar_url ?? ''}/>
                                            <AvatarFallback className="text-[10px] font-black bg-secondary">
                                                {(m.profile?.display_name ?? 'U')[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                        {m.profile?.is_online && (
                                            <span
                                                className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-background"/>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[12px] font-semibold truncate">{m.profile?.display_name ?? 'User'}</p>
                                        <p className="text-[10px] text-muted-foreground capitalize">{m.role}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Messages ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide px-3 py-3 space-y-1 min-h-0">
                {/* Encryption notice */}
                <div className="flex items-center justify-center gap-1.5 mb-3">
                    <Lock className="w-3 h-3 text-muted-foreground/40"/>
                    <span
                        className="text-[10px] text-muted-foreground/40 font-medium">Messages are encrypted in transit</span>
                </div>

                {isLoading ? (
                    <div className="space-y-3">
                        {Array.from({length: 6}).map((_, i) => (
                            <div key={i} className={cn('flex items-end gap-2', i % 2 === 0 ? '' : 'flex-row-reverse')}>
                                <div className="w-7 h-7 rounded-full bg-secondary animate-pulse shrink-0"/>
                                <div
                                    className={cn('h-10 rounded-2xl bg-secondary animate-pulse', i % 2 === 0 ? 'w-48' : 'w-36')}/>
                            </div>
                        ))}
                    </div>
                ) : messagesByDate.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 gap-3 text-center px-8">
                        <div className="w-14 h-14 rounded-xl bg-secondary flex items-center justify-center">
                            <span className="text-2xl">👋</span>
                        </div>
                        <p className="font-black text-[15px]">Be the first to say hello</p>
                        <p className="text-[13px] text-muted-foreground">
                            {isGroup ? 'This is the start of the group chat.' : 'Start the conversation.'}
                        </p>
                    </div>
                ) : (
                    <AnimatePresence initial={false}>
                        {messagesByDate.map(({date, msgs}) => (
                            <div key={date}>
                                {/* Date separator */}
                                <div className="flex items-center gap-3 py-3">
                                    <div className="flex-1 h-px bg-border/20"/>
                                    <span
                                        className="text-[10px] text-muted-foreground/60 font-semibold px-2">{date}</span>
                                    <div className="flex-1 h-px bg-border/20"/>
                                </div>
                                <div className="space-y-1.5">
                                    {msgs.map((msg, i) => {
                                        const isOwn = msg.sender_id === user?.id;
                                        const showAv = isGroup && !isOwn && (i === 0 || msgs[i - 1].sender_id !== msg.sender_id);
                                        return (
                                            <MessageBubble
                                                key={msg.id}
                                                msg={msg}
                                                isOwn={isOwn}
                                                showAvatar={showAv}
                                                onReply={setReplyTo}
                                                onEdit={handleEdit}
                                                onDelete={handleDelete}
                                                onPin={handlePin}
                                            />
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </AnimatePresence>
                )}

                <AnimatePresence>
                    {typingNames.length > 0 && <TypingIndicator names={typingNames}/>}
                </AnimatePresence>

                <div ref={bottomRef} className="h-1"/>
            </div>

            {/* ── Composer ── */}
            <div className="flex-shrink-0 border-t border-border/15"
                 style={{background: 'hsl(var(--card)/0.95)', backdropFilter: 'blur(20px)'}}>

                {/* Reply preview */}
                <AnimatePresence>
                    {replyTo && <ReplyPreview msg={replyTo} onClear={() => setReplyTo(null)}/>}
                    {editingMsg && (
                        <motion.div initial={{height: 0}} animate={{height: 'auto'}} exit={{height: 0}}
                                    className="flex items-center gap-2 px-3 py-2 border-t border-border/15 bg-primary/5">
                            <Edit2 className="w-3.5 h-3.5 text-primary shrink-0"/>
                            <span className="flex-1 text-[11px] text-primary font-semibold">Editing message</span>
                            <button onClick={() => {
                                setEditingMsg(null);
                                setDraft('');
                            }}
                                    className="w-6 h-6 flex items-center justify-center rounded-full hover:bg-secondary">
                                <X className="w-3.5 h-3.5"/>
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Mode toggles */}
                <div className="flex items-center gap-1.5 px-3 pt-2">
                    <button onClick={() => setDisappearMode(d => !d)}
                            className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all',
                                disappearMode ? 'border-primary/40 bg-primary/15 text-primary' : 'border-border/25 text-muted-foreground')}>
                        <EyeOff className="w-3 h-3"/><span>Disappear</span>
                    </button>
                    <button onClick={() => setScheduleMode(s => !s)}
                            className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all',
                                scheduleMode ? 'border-amber-400/40 bg-amber-400/10 text-amber-400' : 'border-border/25 text-muted-foreground')}>
                        <Clock className="w-3 h-3"/><span>Schedule</span>
                    </button>
                </div>

                <div className="flex items-end gap-2 px-3 pt-2 pb-3">
                    {/* Attachment */}
                    <button
                        className="w-9 h-9 flex items-center justify-center rounded-full bg-secondary/60 hover:bg-secondary active:scale-90 transition-all shrink-0">
                        <ImagePlus className="w-4 h-4 text-muted-foreground"/>
                    </button>

                    {/* Textarea */}
                    <div className="flex-1 relative">
            <textarea
                ref={taRef}
                rows={1}
                value={draft}
                onChange={e => {
                    setDraft(e.target.value);
                    e.target.style.height = 'auto';
                    e.target.style.height = `${Math.min(e.target.scrollHeight, 120)}px`;
                }}
                onKeyDown={handleKey}
                placeholder="Message…"
                className="w-full resize-none bg-secondary/40 border border-border/30 rounded-xl px-3.5 py-2.5 text-sm focus:outline-none focus:border-primary/50 transition-colors min-h-[42px] leading-[22px] scrollbar-hide"
                style={{maxHeight: '120px'}}
            />
                    </div>

                    {/* Send / Mic */}
                    <motion.button
                        whileTap={{scale: 0.9}}
                        onClick={draft.trim() ? handleSend : undefined}
                        disabled={sendMsg.isPending || editMsg.isPending}
                        className={cn(
                            'w-9 h-9 rounded-full flex items-center justify-center transition-all shrink-0',
                            draft.trim()
                                ? 'bg-primary text-primary-foreground shadow-[0_2px_12px_hsl(var(--primary)/0.4)]'
                                : 'bg-secondary/60 text-muted-foreground',
                        )}
                    >
                        {draft.trim()
                            ? <Send className="w-4 h-4" strokeWidth={2.5}/>
                            : <Mic className="w-4 h-4"/>
                        }
                    </motion.button>
                </div>
            </div>
        </motion.div>
    );
}
