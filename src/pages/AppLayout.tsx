import {Suspense, useEffect, useState} from 'react';
import {Outlet, useLocation, useNavigate, useSearchParams} from 'react-router-dom';
import {BottomNav} from '@/components/ui/BottomNav';
import {NotificationsPanel} from '@/components/NotificationsPanel';
import {usePresence} from '@/hooks/usePresence';
import {useToast} from '@/hooks/use-toast';
import {AnimatePresence, motion} from 'framer-motion';
import {Bell, Bot, Compass, Crown, MessageCircle, Radio, Settings, Sparkles, User} from 'lucide-react';
import AIKing from '@/components/AIKing';
import {PWAInstallBanner} from '@/components/PWAInstallBanner';
import {useNotifications} from '@/hooks/useNotifications';
import {cn} from '@/lib/utils';

// ── Page loader ──────────────────────────────────────────────
const PageLoader = () => (
    <div className="flex-1 flex items-center justify-center bg-background">
        <div className="relative w-8 h-8">
            <svg className="w-full h-full animate-spin" viewBox="0 0 32 32" fill="none">
                <circle cx="16" cy="16" r="13" stroke="hsl(var(--primary)/0.15)" strokeWidth="2.5"/>
                <path
                    d="M16 3 A13 13 0 0 1 29 16"
                    stroke="hsl(var(--primary))"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                />
            </svg>
            <div
                className="absolute inset-0 blur-md rounded-full opacity-40"
                style={{background: 'hsl(var(--primary)/0.25)'}}
            />
        </div>
    </div>
);

// ── Config ───────────────────────────────────────────────────
const HIDE_NAV_PATTERNS = [
    /^\/app\/chat\//,
    /^\/app\/right-now\/map/,
    /^\/app\/map/,
];

const NAV_H = 56;
const SIDEBAR_W = 224;

const SIDEBAR_ITEMS = [
    {id: 'grid', path: '/app/grid', icon: Compass, label: 'Discover', desc: 'Browse profiles'},
    {id: 'right-now', path: '/app/right-now', icon: Radio, label: 'Right Now', desc: 'Live nearby', live: true},
    {id: 'messages', path: '/app/messages', icon: MessageCircle, label: 'Messages', desc: 'Chats'},
    {id: 'events', path: '/app/events', icon: Sparkles, label: 'Events', desc: 'Parties & meetups'},
    {id: 'profile', path: '/app/profile/me', icon: User, label: 'My Profile', desc: 'View & edit'},
];

function resolveActive(pathname: string): string {
    if (pathname.startsWith('/app/chat')) return 'messages';
    if (pathname.startsWith('/app/right-now')) return 'right-now';
    if (pathname.startsWith('/app/profile/me')) return 'profile';
    if (pathname.startsWith('/app/events')) return 'events';
    const match = SIDEBAR_ITEMS.find(t => pathname.startsWith(t.path));
    return match?.id || 'grid';
}

// ── Desktop Sidebar ─────────────────────────────────────────
function DesktopSidebar({onAIOpen}: {onAIOpen: () => void}) {
    const navigate = useNavigate();
    const location = useLocation();
    const {unreadCount} = useNotifications();
    const activeId = resolveActive(location.pathname);

    return (
        <aside
            className="hidden lg:flex flex-col shrink-0 z-40 relative"
            style={{
                width: `${SIDEBAR_W}px`,
                background: 'hsl(224 14% 3.5%)',
                borderRight: '1px solid hsl(224 8% 100% / 0.06)',
                boxShadow: '1px 0 0 hsl(224 8% 100% / 0.025)',
            }}
        >
            {/* Ambient top glow */}
            <div
                className="absolute top-0 left-0 right-0 h-40 pointer-events-none"
                style={{background: 'radial-gradient(ellipse 120% 60% at 50% -10%, hsl(42 98% 56% / 0.06) 0%, transparent 70%)'}}
            />

            {/* ── Brand logo ── */}
            <div
                className="relative px-4 py-4 shrink-0"
                style={{borderBottom: '1px solid hsl(224 8% 100% / 0.055)'}}
            >
                <div className="flex items-center gap-2.5">
                    {/* Crown icon mark */}
                    <motion.div
                        whileHover={{scale: 1.06}}
                        transition={{type: 'spring', stiffness: 600, damping: 30}}
                        className="relative w-8 h-8 rounded-[var(--radius-sm)] flex items-center justify-center shrink-0"
                        style={{
                            background: 'var(--gradient-gold)',
                            boxShadow: '0 0 16px hsl(42 98% 56% / 0.4), 0 0 32px hsl(42 98% 56% / 0.1), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                        }}
                    >
                        <Crown className="w-4 h-4 text-white" strokeWidth={2.5}/>
                    </motion.div>

                    <div className="min-w-0">
                        <p className="font-black text-[13px] tracking-[-0.02em] leading-none text-foreground">
                            FIND YOUR KING
                        </p>
                        <p className="text-[9px] font-semibold text-muted-foreground/60 tracking-[0.08em] mt-0.5 uppercase">
                            Connect · Explore
                        </p>
                    </div>
                </div>
            </div>

            {/* ── Navigation label ── */}
            <div className="px-4 pt-5 pb-1.5">
                <p className="text-[9px] font-black uppercase tracking-[0.14em] text-muted-foreground/40">
                    Navigation
                </p>
            </div>

            {/* ── Nav items ── */}
            <nav className="flex-1 px-2 pb-2 flex flex-col gap-0.5 overflow-y-auto scrollbar-hide">
                {SIDEBAR_ITEMS.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeId === item.id;
                    const showBadge = item.id === 'messages' && unreadCount > 0;

                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={cn(
                                'relative flex items-center gap-2.5 px-3 py-2.5 text-left w-full',
                                'rounded-[var(--radius-sm)] transition-all duration-120',
                                'group',
                                isActive
                                    ? 'text-foreground'
                                    : 'text-muted-foreground/50 hover:text-foreground/80',
                            )}
                            style={isActive ? {
                                background: 'hsl(var(--surface-2))',
                                boxShadow: 'var(--shadow-xs), inset 0 1px 0 hsl(0 0% 100% / 0.03)',
                            } : {}}
                        >
                            {/* Hover fill */}
                            {!isActive && (
                                <div className="absolute inset-0 rounded-[var(--radius-sm)] bg-surface-1 opacity-0 group-hover:opacity-100 transition-opacity duration-120"/>
                            )}

                            {/* Active left accent bar */}
                            {isActive && (
                                <motion.div
                                    layoutId="sidebar-accent"
                                    className="absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 rounded-r-full"
                                    style={{
                                        background: 'var(--gradient-gold)',
                                        boxShadow: '0 0 8px hsl(42 98% 56% / 0.55)',
                                    }}
                                />
                            )}

                            {/* Icon */}
                            <div className="relative shrink-0">
                                <Icon
                                    className="w-[15px] h-[15px]"
                                    style={{color: isActive ? 'hsl(var(--foreground))' : 'currentColor'}}
                                    strokeWidth={isActive ? 2.2 : 1.7}
                                />
                            </div>

                            {/* Label */}
                            <span className="text-[12.5px] font-semibold flex-1 leading-none">
                                {item.label}
                            </span>

                            {/* Messages badge */}
                            {showBadge && (
                                <motion.span
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    className="ml-auto min-w-[16px] h-4 rounded-[3px] text-[8px] font-black flex items-center justify-center px-1 text-white"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        boxShadow: '0 0 8px hsl(42 98% 56% / 0.4)',
                                    }}
                                >
                                    {unreadCount > 99 ? '99+' : unreadCount}
                                </motion.span>
                            )}

                            {/* Live dot for Right Now */}
                            {item.live && (
                                <span className="relative ml-auto">
                                    <span
                                        className="block w-[6px] h-[6px] rounded-full"
                                        style={{background: 'hsl(var(--status-online))'}}
                                    />
                                    <span
                                        className="absolute inset-0 rounded-full animate-ping opacity-75"
                                        style={{background: 'hsl(var(--status-online))'}}
                                    />
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            {/* ── Bottom utilities ── */}
            <div
                className="relative px-2 py-3 flex flex-col gap-0.5 shrink-0"
                style={{borderTop: '1px solid hsl(224 8% 100% / 0.055)'}}
            >
                {/* AI Assistant */}
                <button
                    onClick={onAIOpen}
                    className="relative flex items-center gap-2.5 px-3 py-2.5 rounded-[var(--radius-sm)] text-left w-full group transition-all duration-120 overflow-hidden"
                >
                    <div
                        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                        style={{background: 'hsl(42 98% 56% / 0.06)'}}
                    />
                    <div
                        className="relative w-5 h-5 rounded-[3px] flex items-center justify-center shrink-0"
                        style={{background: 'hsl(42 98% 56% / 0.15)'}}
                    >
                        <Bot className="w-3 h-3" style={{color: 'hsl(var(--primary))'}} strokeWidth={2}/>
                    </div>
                    <span className="text-[12.5px] font-semibold text-muted-foreground/50 group-hover:text-foreground/80 transition-colors flex-1">
                        AI Assistant
                    </span>
                    <span
                        className="text-[7.5px] font-black px-1.5 py-0.5 rounded-[3px] tracking-wide"
                        style={{background: 'hsl(42 98% 56% / 0.12)', color: 'hsl(var(--primary))'}}
                    >
                        AI
                    </span>
                </button>

                <button
                    onClick={() => navigate('/app/notifications')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[12.5px] font-semibold text-muted-foreground/50 hover:text-foreground/80 hover:bg-surface-1 transition-all duration-120"
                >
                    <Bell className="w-[15px] h-[15px] shrink-0" strokeWidth={1.7}/>
                    Notifications
                </button>

                <button
                    onClick={() => navigate('/app/settings')}
                    className="flex items-center gap-2.5 px-3 py-2 rounded-[var(--radius-sm)] text-[12.5px] font-semibold text-muted-foreground/50 hover:text-foreground/80 hover:bg-surface-1 transition-all duration-120"
                >
                    <Settings className="w-[15px] h-[15px] shrink-0" strokeWidth={1.7}/>
                    Settings
                </button>
            </div>
        </aside>
    );
}

// ── Main layout ──────────────────────────────────────────────
const AppLayout = () => {
    const [searchParams] = useSearchParams();
    const {toast} = useToast();
    const location = useLocation();
    const navigate = useNavigate();
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
                variant: 'destructive',
            });
        }
    }, [searchParams, toast]);

    return (
        <div className="w-full flex overflow-hidden" style={{height: '100dvh', background: 'hsl(var(--background))'}}>

            {/* Desktop sidebar */}
            <DesktopSidebar onAIOpen={() => setAiOpen(true)}/>

            {/* Main content column */}
            <div className="flex-1 flex flex-col overflow-hidden min-w-0 relative">

                {/* Notifications bell — top right */}
                <div className="fixed top-3 right-3 z-[60] hidden lg:block">
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
                        <AnimatePresence mode="wait" initial={false}>
                            <motion.div
                                key={location.pathname}
                                initial={{opacity: 0, y: 6}}
                                animate={{opacity: 1, y: 0}}
                                exit={{opacity: 0, y: -4}}
                                transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                                className="flex-1 flex flex-col min-h-0"
                            >
                                <Outlet/>
                            </motion.div>
                        </AnimatePresence>
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
                            transition={{delay: 0.5, type: 'spring', stiffness: 500, damping: 26}}
                            whileTap={{scale: 0.88}}
                            onClick={() => setAiOpen(true)}
                            className="lg:hidden fixed right-4 z-50 w-11 h-11 rounded-[var(--radius-lg)] flex items-center justify-center"
                            style={{
                                bottom: 'calc(var(--nav-h, 56px) + env(safe-area-inset-bottom, 0px) + 12px)',
                                background: 'var(--gradient-gold)',
                                boxShadow: '0 4px 24px hsl(42 98% 56% / 0.5), 0 2px 8px hsl(0 0% 0% / 0.4), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                            }}
                            aria-label="Open AI Assistant"
                        >
                            <Crown className="w-4.5 h-4.5 text-white" strokeWidth={2.2}/>
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
