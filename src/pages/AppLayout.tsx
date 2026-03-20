import {Suspense, useEffect, useState} from 'react';
import {Outlet, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {BottomNav} from '@/components/ui/BottomNav';
import {NotificationsPanel} from '@/components/NotificationsPanel';
import {usePresence} from '@/hooks/usePresence';
import {useToast} from '@/hooks/use-toast';
import {AnimatePresence, motion} from 'framer-motion';
import {Bell, Bot, Compass, MessageCircle, Radio, Settings, Sparkles, User} from 'lucide-react';
import AIKing from '@/components/AIKing';
import {PWAInstallBanner} from '@/components/PWAInstallBanner';
import {useNotifications} from '@/hooks/useNotifications';
import {cn} from '@/lib/utils';

const PageLoader = () => (
    <div className="flex-1 flex items-center justify-center bg-background">
        <div className="relative w-7 h-7">
            <div
                className="absolute inset-0 rounded-full border-[1.5px] border-transparent animate-spin"
                style={{borderTopColor: 'hsl(var(--primary))', borderRightColor: 'hsl(var(--primary)/0.3)'}}
            />
        </div>
    </div>
);

const HIDE_NAV_PATTERNS = [
    /^\/app\/chat\//,
    /^\/app\/right-now\/map/,
    /^\/app\/map/,
];

const NAV_H = 56;
const SIDEBAR_W = 224;

const SIDEBAR_ITEMS = [
    {id: 'grid', path: '/app/grid', icon: Compass, label: 'Discover'},
    {id: 'right-now', path: '/app/right-now', icon: Radio, label: 'Right Now'},
    {id: 'messages', path: '/app/messages', icon: MessageCircle, label: 'Messages'},
    {id: 'events', path: '/app/events', icon: Sparkles, label: 'Events'},
    {id: 'profile', path: '/app/profile/me', icon: User, label: 'My Profile'},
];

function resolveActive(pathname: string): string {
    if (pathname.startsWith('/app/chat')) return 'messages';
    if (pathname.startsWith('/app/right-now')) return 'right-now';
    if (pathname.startsWith('/app/profile/me')) return 'profile';
    if (pathname.startsWith('/app/events')) return 'events';
    const match = SIDEBAR_ITEMS.find(t => pathname.startsWith(t.path));
    return match?.id || 'grid';
}

function DesktopSidebar({onAIOpen}: { onAIOpen: () => void }) {
    const navigate = useNavigate();
    const location = useLocation();
    const {unreadCount} = useNotifications();
    const activeId = resolveActive(location.pathname);

    return (
        <aside
            className="hidden lg:flex flex-col shrink-0 z-40 relative"
            style={{
                width: `${SIDEBAR_W}px`,
                background: 'hsl(224 14% 4%)',
                borderRight: '1px solid hsl(224 8% 100% / 0.055)',
                boxShadow: '1px 0 0 hsl(224 8% 100% / 0.025)',
            }}
        >
            {/* Ambient vertical gradient */}
            <div
                className="absolute inset-0 pointer-events-none"
                style={{
                    background:
                        'radial-gradient(ellipse 120% 40% at 50% -5%, hsl(221 90% 60% / 0.07) 0%, transparent 60%)',
                }}
            />

            {/* Logo */}
            <div className="relative px-4 py-4 shrink-0" style={{borderBottom: '1px solid hsl(224 8% 100% / 0.055)'}}>
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 rounded-[6px] flex items-center justify-center text-[11px] font-black text-white shrink-0"
                        style={{
                            background: 'var(--gradient-primary)',
                            boxShadow: '0 0 12px hsl(221 90% 60% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                        }}
                    >
                        M
                    </div>
                    <div>
                        <p className="font-black text-[13px] tracking-[-0.02em] leading-none">MACHOBB</p>
                        <p className="text-[9px] font-semibold text-muted-foreground tracking-[0.06em] mt-0.5">CONNECT ·
                            EXPLORE</p>
                    </div>
                </div>
            </div>

            {/* Nav section label */}
            <div className="px-4 pt-4 pb-1">
                <p className="eyebrow">Navigation</p>
            </div>

            {/* Nav items */}
            <nav className="flex-1 px-2 pb-2 flex flex-col gap-0.5 overflow-y-auto">
                {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeId === item.id;
                    const showBadge = item.id === 'messages' && unreadCount > 0;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                'relative flex items-center gap-2.5 px-3 py-2 text-[12.5px] font-semibold',
                                'transition-all duration-120 text-left w-full',
                                'rounded-[var(--radius)]',
                                isActive
                                    ? 'text-foreground bg-surface-2'
                                    : 'text-muted-foreground/60 hover:text-foreground/80 hover:bg-surface-1',
                            )}
                            style={isActive ? {boxShadow: 'var(--shadow-xs)'} : {}}
                        >
                            {/* Active left accent */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-accent"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-3.5 rounded-r-full"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        boxShadow: '0 0 8px hsl(221 90% 60% / 0.5)',
                                    }}
                                />
                            )}

                            <Icon
                                className={cn('w-[15px] h-[15px] shrink-0 transition-none')}
                                style={{color: isActive ? 'hsl(var(--foreground))' : 'currentColor'}}
                                strokeWidth={isActive ? 2.1 : 1.7}
                            />

                            {item.label}

                            {showBadge && (
                                <span
                                    className="ml-auto min-w-[16px] h-[16px] rounded-sm text-[8px] font-black flex items-center justify-center px-1"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        color: '#fff',
                                        boxShadow: '0 0 6px hsl(221 90% 60% / 0.4)',
                                    }}
                                >
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
                            )}

                            {item.id === 'right-now' && (
                                <span
                                    className="ml-auto w-[6px] h-[6px] rounded-full"
                                    style={{
                                        background: 'hsl(var(--emerald))',
                                        boxShadow: '0 0 5px hsl(var(--emerald) / 0.5)'
                                    }}
                                />
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* Bottom actions */}
            <div
                className="relative px-2 py-3 flex flex-col gap-0.5 shrink-0"
                style={{borderTop: '1px solid hsl(224 8% 100% / 0.055)'}}
            >
                <button
                    onClick={onAIOpen}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-[12.5px] font-semibold text-muted-foreground/60 hover:text-foreground/80 hover:bg-surface-1 transition-all duration-120"
                >
                    <Bot className="w-[15px] h-[15px]" style={{color: 'hsl(var(--primary))'}} strokeWidth={1.7}/>
                    AI Assistant
                    <span
                        className="ml-auto text-[8px] font-black px-1.5 py-0.5 rounded-sm"
                        style={{background: 'hsl(var(--primary)/0.12)', color: 'hsl(var(--primary))'}}
                    >
            AI
          </span>
                </button>
                <button
                    onClick={() => navigate('/app/notifications')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-[12.5px] font-semibold text-muted-foreground/60 hover:text-foreground/80 hover:bg-surface-1 transition-all duration-120"
                >
                    <Bell className="w-[15px] h-[15px]" strokeWidth={1.7}/>
                    Notifications
                </button>
                <button
                    onClick={() => navigate('/app/settings')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius)] text-[12.5px] font-semibold text-muted-foreground/60 hover:text-foreground/80 hover:bg-surface-1 transition-all duration-120"
                >
                    <Settings className="w-[15px] h-[15px]" strokeWidth={1.7}/>
                    Settings
                </button>
            </div>
        </aside>
    );
}

const AppLayout = () => {
    const [searchParams] = useSearchParams();
    const {toast} = useToast();
    const location = useLocation();
    const [aiOpen, setAiOpen] = useState(false);

    usePresence();

    const hideNav = HIDE_NAV_PATTERNS.some(p => p.test(location.pathname));

    useEffect(() => {
        document.documentElement.style.setProperty('--nav-h', `${NAV_H}px`);
        document.documentElement.style.setProperty('--sidebar-w', `${SIDEBAR_W}px`);
    }, []);

    useEffect(() => {
        const payment = searchParams.get('payment');
        if (payment === 'success') {
            toast({title: 'Payment Successful', description: 'Your subscription is now active!'});
        } else if (payment === 'cancelled') {
            toast({
                title: 'Payment Cancelled',
                description: 'Your subscription was not processed.',
                variant: 'destructive'
            });
        }
    }, [searchParams, toast]);

    return (
        <div className="w-full flex overflow-hidden" style={{height: '100dvh', background: 'hsl(var(--background))'}}>
            {/* Desktop sidebar */}
            <DesktopSidebar onAIOpen={() => setAiOpen(true)}/>

            {/* Main column */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">

                {/* Notifications — floats top right */}
                <div className="fixed top-3 right-3 z-[60]">
                    <NotificationsPanel/>
                </div>

                {/* Page content */}
                <main
                    className="relative z-10 flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0"
                    style={{
                        paddingBottom: !hideNav
                            ? 'calc(var(--nav-h, 56px) + env(safe-area-inset-bottom, 0px))'
                            : 0,
                    }}
                >
                    <Suspense fallback={<PageLoader/>}>
                        <Outlet/>
                    </Suspense>
                </main>

                {/* Mobile bottom nav */}
                {!hideNav && <div className="lg:hidden"><BottomNav/></div>}

                {/* AI FAB — mobile only */}
                <AnimatePresence>
                    {!hideNav && (
                        <motion.button
                            key="ai-fab"
                            initial={{scale: 0, opacity: 0}}
                            animate={{scale: 1, opacity: 1}}
                            exit={{scale: 0, opacity: 0}}
                            transition={{delay: 0.6, type: 'spring', stiffness: 600, damping: 30}}
                            whileTap={{scale: 0.9}}
                            onClick={() => setAiOpen(true)}
                            className="lg:hidden fixed right-3 z-50 w-10 h-10 rounded-[var(--radius-lg)] flex items-center justify-center"
                            style={{
                                bottom: 'calc(var(--nav-h, 56px) + env(safe-area-inset-bottom, 0px) + 10px)',
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 4px 20px hsl(221 90% 60% / 0.5), 0 1px 3px hsl(0 0% 0% / 0.5), inset 0 1px 0 hsl(0 0% 100% / 0.15)',
                            }}
                            aria-label="Open AI Assistant"
                        >
                            <Bot className="w-4 h-4 text-white" strokeWidth={2.2}/>
                        </motion.button>
                    )}
                </AnimatePresence>
            </div>

            <AIKing open={aiOpen} onClose={() => setAiOpen(false)}/>
            <PWAInstallBanner/>
        </div>
    );
};

export default AppLayout;
