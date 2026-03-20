import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
    Bell,
    Calendar,
    CheckCheck,
    ChevronRight,
    Crown,
    Heart,
    MessageCircle,
    Sparkles,
    Star,
    UserPlus,
    Zap,
} from 'lucide-react';
import {useNotifications} from '@/hooks/useNotifications';
import {format, formatDistanceToNow, isToday} from 'date-fns';
import {cn} from '@/lib/utils';

const NOTIF_CONFIG: Record<string, { icon: any; color: string; bgStyle: React.CSSProperties }> = {
    match: {
        icon: Heart,
        color: 'text-rose-400',
        bgStyle: {background: 'hsl(350 80% 55% / 0.12)', border: '1px solid hsl(350 80% 55% / 0.2)'}
    },
    message: {
        icon: MessageCircle,
        color: 'text-primary',
        bgStyle: {background: 'hsl(var(--primary)/0.1)', border: '1px solid hsl(var(--primary)/0.2)'}
    },
    event: {
        icon: Calendar,
        color: 'text-[hsl(var(--gold))]',
        bgStyle: {background: 'hsl(var(--gold)/0.1)', border: '1px solid hsl(var(--gold)/0.18)'}
    },
    right_now: {
        icon: Zap,
        color: 'text-[hsl(var(--emerald))]',
        bgStyle: {background: 'hsl(var(--emerald)/0.1)', border: '1px solid hsl(var(--emerald)/0.2)'}
    },
    follow: {
        icon: UserPlus,
        color: 'text-[hsl(var(--accent))]',
        bgStyle: {background: 'hsl(var(--accent)/0.1)', border: '1px solid hsl(var(--accent)/0.2)'}
    },
    favorite: {
        icon: Star,
        color: 'text-[hsl(var(--gold))]',
        bgStyle: {background: 'hsl(var(--gold)/0.1)', border: '1px solid hsl(var(--gold)/0.18)'}
    },
    premium: {
        icon: Crown,
        color: 'text-[hsl(var(--gold))]',
        bgStyle: {background: 'hsl(var(--gold)/0.1)', border: '1px solid hsl(var(--gold)/0.18)'}
    },
    default: {
        icon: Bell,
        color: 'text-muted-foreground',
        bgStyle: {background: 'hsl(var(--surface-2))', border: '1px solid hsl(var(--border)/0.3)'}
    },
};

const formatNotifTime = (dateStr: string) => {
    try {
        const date = new Date(dateStr);
        if (isToday(date)) return formatDistanceToNow(date, {addSuffix: true});
        return format(date, 'MMM d');
    } catch {
        return '';
    }
};

export default function NotificationsPage() {
    const navigate = useNavigate();
    const {notifications, markAsRead, markAllAsRead, unreadCount} = useNotifications();

    const todayNotifs = notifications.filter(n => isToday(new Date(n.created_at)));
    const olderNotifs = notifications.filter(n => !isToday(new Date(n.created_at)));

    const renderNotif = (notification: any, index: number) => {
        const type = notification.type || 'default';
        const config = NOTIF_CONFIG[type] || NOTIF_CONFIG.default;
        const Icon = config.icon;
        const isUnread = !notification.is_read;

        return (
            <motion.div
                key={notification.id}
                initial={{opacity: 0, x: -12}}
                animate={{opacity: 1, x: 0}}
                exit={{opacity: 0, x: 12, height: 0}}
                transition={{delay: index * 0.025}}
                onClick={() => isUnread && markAsRead(notification.id)}
                className={cn(
                    'flex items-start gap-3.5 px-4 py-4 cursor-pointer transition-all duration-100 relative',
                    'hover:bg-white/[0.02] active:bg-white/[0.04]',
                    isUnread && 'bg-primary/[0.025]',
                )}
                data-testid={`notification-item-${notification.id}`}
            >
                {/* Unread left bar */}
                {isUnread && (
                    <div
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-10"
                        style={{background: 'hsl(var(--primary))'}}
                    />
                )}

                {/* Icon square */}
                <div
                    className="w-10 h-10 flex items-center justify-center shrink-0"
                    style={config.bgStyle}
                >
                    <Icon className={cn('w-4 h-4', config.color)}/>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-0.5">
                        <p className={cn(
                            'text-[13px] leading-snug',
                            isUnread ? 'font-bold text-foreground' : 'font-medium text-foreground/75',
                        )}>
                            {notification.title}
                        </p>
                        <span className="text-[10px] text-muted-foreground/50 shrink-0 mt-0.5 font-medium">
              {formatNotifTime(notification.created_at)}
            </span>
                    </div>
                    {notification.body && (
                        <p className="text-[12px] text-muted-foreground/65 leading-relaxed line-clamp-2">
                            {notification.body}
                        </p>
                    )}
                </div>

                {/* Unread dot */}
                {isUnread && (
                    <div
                        className="w-2 h-2 shrink-0 mt-1.5"
                        style={{background: 'hsl(var(--primary))'}}
                    />
                )}
            </motion.div>
        );
    };

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ─── Header ─── */}
            <header
                className="flex-shrink-0 border-b border-white/[0.05] z-40"
                style={{background: 'hsl(var(--background)/0.95)', backdropFilter: 'blur(20px)'}}
            >
                <div className="px-4 pt-4 pb-3">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="flex items-center gap-2.5 mb-0.5">
                                <h1 className="text-[22px] font-black tracking-tight">Notifications</h1>
                                <AnimatePresence>
                                    {unreadCount > 0 && (
                                        <motion.span
                                            initial={{scale: 0}}
                                            animate={{scale: 1}}
                                            exit={{scale: 0}}
                                            className="px-1.5 py-0.5 text-[9px] font-black text-white min-w-[18px] text-center"
                                            style={{background: 'hsl(var(--primary))'}}
                                            data-testid="unread-count-badge"
                                        >
                                            {unreadCount}
                                        </motion.span>
                                    )}
                                </AnimatePresence>
                            </div>
                            <p className="text-[11px] text-muted-foreground/50 font-medium">
                                {notifications.length} total · {unreadCount} unread
                            </p>
                        </div>
                        {unreadCount > 0 && (
                            <button
                                onClick={() => markAllAsRead()}
                                className="flex items-center gap-1.5 px-3 py-2 border text-[11px] font-bold transition-all active:opacity-70"
                                style={{
                                    background: 'hsl(var(--primary)/0.08)',
                                    border: '1px solid hsl(var(--primary)/0.2)',
                                    color: 'hsl(var(--primary))',
                                }}
                                data-testid="button-mark-all-read"
                            >
                                <CheckCheck className="w-3.5 h-3.5"/>
                                Mark all read
                            </button>
                        )}
                    </div>
                </div>
            </header>

            {/* ─── List ─── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <AnimatePresence>
                    {notifications.length > 0 ? (
                        <motion.div initial={{opacity: 0}} animate={{opacity: 1}}>
                            {todayNotifs.length > 0 && (
                                <>
                                    <div
                                        className="px-4 py-2.5 sticky top-0 z-10"
                                        style={{background: 'hsl(var(--background)/0.85)', backdropFilter: 'blur(8px)'}}
                                    >
                                        <p className="eyebrow">Today</p>
                                    </div>
                                    <div className="divide-y divide-border/8">
                                        {todayNotifs.map((n, i) => renderNotif(n, i))}
                                    </div>
                                </>
                            )}
                            {olderNotifs.length > 0 && (
                                <>
                                    <div
                                        className="px-4 py-2.5 sticky top-0 z-10"
                                        style={{background: 'hsl(var(--background)/0.85)', backdropFilter: 'blur(8px)'}}
                                    >
                                        <p className="eyebrow">Earlier</p>
                                    </div>
                                    <div className="divide-y divide-border/8">
                                        {olderNotifs.map((n, i) => renderNotif(n, todayNotifs.length + i))}
                                    </div>
                                </>
                            )}
                            <div className="h-8"/>
                        </motion.div>
                    ) : (
                        /* Empty state */
                        <motion.div
                            initial={{opacity: 0, scale: 0.97}}
                            animate={{opacity: 1, scale: 1}}
                            className="flex flex-col items-center justify-center py-24 px-8 text-center gap-5"
                        >
                            <div
                                className="w-20 h-20 flex items-center justify-center"
                                style={{
                                    background: 'hsl(var(--surface-1))',
                                    border: '1px solid hsl(var(--border)/0.2)'
                                }}
                            >
                                <Bell className="w-8 h-8 text-muted-foreground/25"/>
                            </div>
                            <div>
                                <p className="font-black text-[15px] tracking-tight mb-1">All caught up</p>
                                <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-[220px] mx-auto">
                                    Matches, messages and activity will appear here in real time.
                                </p>
                            </div>
                            <div className="flex items-center gap-1.5 mt-1">
                                <Sparkles className="w-3 h-3" style={{color: 'hsl(var(--gold))'}}/>
                                <span className="text-[11px] font-bold" style={{color: 'hsl(var(--gold))'}}>
                  Upgrade to see who viewed your profile
                </span>
                                <ChevronRight className="w-3 h-3" style={{color: 'hsl(var(--gold))'}}/>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
