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
