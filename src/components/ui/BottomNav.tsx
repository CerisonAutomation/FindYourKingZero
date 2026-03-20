import {motion} from 'framer-motion';
import {Compass, MessageCircle, Radio, Sparkles, User} from 'lucide-react';
import {useLocation, useNavigate} from 'react-router-dom';
import {cn} from '@/lib/utils';
import {useNotifications} from '@/hooks/useNotifications';
import {useLocaleStore} from '@/stores/useLocaleStore';

const TABS = [
    {id: 'grid', path: '/app/grid', icon: Compass, key: 'nav.discover'},
    {id: 'right-now', path: '/app/right-now', icon: Radio, key: 'nav.nearby'},
    {id: 'messages', path: '/app/messages', icon: MessageCircle, key: 'nav.chats'},
    {id: 'events', path: '/app/events', icon: Sparkles, key: 'nav.party'},
    {id: 'profile', path: '/app/profile/me', icon: User, key: 'nav.me'},
];

function resolveActive(pathname: string): string {
    if (pathname.startsWith('/app/chat')) return 'messages';
    if (pathname.startsWith('/app/right-now')) return 'right-now';
    if (pathname.startsWith('/app/profile/me')) return 'profile';
    if (pathname.startsWith('/app/events') || pathname.startsWith('/app/chills') || pathname.startsWith('/app/house-parties')) return 'events';
    const match = TABS.find(t => pathname.startsWith(t.path));
    return match?.id || 'grid';
}

export function BottomNav() {
    const navigate = useNavigate();
    const location = useLocation();
    const {unreadCount} = useNotifications();
    const {t} = useLocaleStore();
    const activeId = resolveActive(location.pathname);

    return (
        <nav
            className="fixed bottom-0 left-0 right-0 z-50"
            style={{
                height: 'calc(var(--nav-h, 56px) + env(safe-area-inset-bottom, 0px))',
                background: 'hsl(224 14% 4% / 0.9)',
                backdropFilter: 'blur(32px) saturate(180%)',
                WebkitBackdropFilter: 'blur(32px) saturate(180%)',
                borderTop: '1px solid hsl(224 8% 100% / 0.055)',
                /* Subtle top edge light */
                boxShadow: '0 -1px 0 hsl(0 0% 100% / 0.04), 0 -4px 16px hsl(0 0% 0% / 0.35)',
            }}
            role="navigation"
            aria-label="Main navigation"
        >
            {/* Active track — thin top line that slides */}
            <div
                className="absolute top-0 left-0 right-0 h-px"
                style={{background: 'hsl(224 8% 100% / 0.06)'}}
            />

            <div
                className="flex items-stretch justify-around max-w-lg mx-auto px-2"
                style={{height: 'var(--nav-h, 56px)'}}
            >
                {TABS.map(tab => {
                    const isActive = activeId === tab.id;
                    const Icon = tab.icon;
                    const isRightNow = tab.id === 'right-now';

                    return (
                        <button
                            key={tab.id}
                            onClick={() => navigate(tab.path)}
                            aria-label={t(tab.key)}
                            aria-current={isActive ? 'page' : undefined}
                            className={cn(
                                'relative flex flex-col items-center justify-center flex-1 gap-[3px]',
                                'transition-colors duration-120 active:scale-[0.88]',
                                isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/35 hover:text-muted-foreground/70',
                            )}
                        >
                            {/* Active indicator — sharp 2px line from top */}
                            {isActive && (
                                <motion.div
                                    layoutId="nav-top-line"
                                    className="absolute top-0 w-4 h-[2px] rounded-b-full"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        boxShadow: '0 0 8px hsl(221 90% 60% / 0.6)',
                                    }}
                                    initial={{opacity: 0, scaleX: 0}}
                                    animate={{opacity: 1, scaleX: 1}}
                                    transition={{type: 'spring', stiffness: 700, damping: 45}}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative">
                                <motion.div
                                    animate={
                                        isActive
                                            ? {scale: 1.08, y: -0.5}
                                            : {scale: 1, y: 0}
                                    }
                                    transition={{type: 'spring', stiffness: 700, damping: 40}}
                                >
                                    <Icon
                                        style={{
                                            width: 16,
                                            height: 16,
                                            color: isActive ? 'hsl(var(--foreground))' : 'currentColor',
                                        }}
                                        strokeWidth={isActive ? 2.2 : 1.65}
                                    />
                                </motion.div>

                                {/* Unread badge */}
                                {tab.id === 'messages' && unreadCount > 0 && (
                                    <motion.span
                                        initial={{scale: 0, opacity: 0}}
                                        animate={{scale: 1, opacity: 1}}
                                        className="absolute -top-[5px] -right-[7px] min-w-[13px] h-[13px] rounded-sm flex items-center justify-center px-[3px]"
                                        style={{
                                            background: 'var(--gradient-primary)',
                                            fontSize: '7px',
                                            fontWeight: 900,
                                            color: '#fff',
                                            boxShadow: '0 0 6px hsl(221 90% 60% / 0.5)',
                                        }}
                                    >
                                        {unreadCount > 99 ? '99+' : unreadCount}
                                    </motion.span>
                                )}

                                {/* Right Now live indicator */}
                                {isRightNow && (
                                    <span
                                        className="absolute -top-[2px] -right-[3px] w-[5px] h-[5px] rounded-full border border-background"
                                        style={{background: 'hsl(var(--emerald))'}}
                                    />
                                )}
                            </div>

                            {/* Label — only visible when active */}
                            <motion.span
                                animate={{opacity: isActive ? 1 : 0, y: isActive ? 0 : 1}}
                                transition={{duration: 0.12}}
                                className="text-[8px] font-bold tracking-wide leading-none pointer-events-none"
                            >
                                {t(tab.key)}
                            </motion.span>
                        </button>
                    );
                })}
            </div>
        </nav>
    );
}
