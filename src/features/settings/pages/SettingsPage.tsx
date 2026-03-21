import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Bell, ChevronRight, CreditCard, Crown, Fingerprint, HelpCircle, LogOut, Settings, Shield, User,} from 'lucide-react';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useAuth} from '@/hooks/useAuth';
import {useProfile} from '@/hooks/useProfile';
import {useSubscription} from '@/hooks/useSubscription';

const NAV_ITEMS = [
    {
        id: 'account',
        icon: User,
        label: 'Account',
        desc: 'Email, password, delete account',
        path: '/app/settings/account'
    },
    {
        id: 'privacy',
        icon: Shield,
        label: 'Privacy & Security',
        desc: 'Visibility, data, blocking',
        path: '/app/settings/privacy'
    },
    {
        id: 'biometric',
        icon: Fingerprint,
        label: 'Face ID / Touch ID',
        desc: 'Use biometrics to unlock the app',
        path: '/app/settings/security',
        action: 'biometric' as const,
    },
    {
        id: 'notifications',
        icon: Bell,
        label: 'Notifications',
        desc: 'Push, email, in-app alerts',
        path: '/app/settings/notifications'
    },
    {
        id: 'subscription',
        icon: CreditCard,
        label: 'Subscription',
        desc: 'Plans, billing, manage',
        path: '/app/settings/subscription'
    },
    {
        id: 'help',
        icon: HelpCircle,
        label: 'Help & Support',
        desc: 'FAQ, contact, community guidelines',
        path: '/app/settings/help'
    },
];

export default function SettingsPage() {
    const navigate = useNavigate();
    const {user, signOut} = useAuth();
    const {profile} = useProfile();
    const {isPremium, currentPlan} = useSubscription();

    const handleSignOut = async () => {
        await signOut();
        navigate('/');
    };

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">

            {/* ── Header ── */}
            <header
                className="flex-shrink-0 flex items-center gap-2.5 px-4 py-2.5 border-b border-border/15 z-10"
                style={{background: 'hsl(var(--background)/0.94)', backdropFilter: 'blur(20px)'}}
            >
                <button
                    onClick={() => navigate(-1)}
                    className="w-7 h-7 rounded-sm flex items-center justify-center bg-secondary/50 active:scale-90 transition-all"
                >
                    <ChevronRight className="w-5 h-5 rotate-180"/>
                </button>
                <div className="flex items-center gap-1.5 flex-1">
                    <Settings className="w-5 h-5 text-primary"/>
                    <h1 className="font-black text-[14px] tracking-tight">Settings</h1>
                </div>
            </header>

            {/* ── Content ── */}
            <div className="flex-1 overflow-y-auto scrollbar-hide">
                <motion.div
                    initial={{opacity: 0, y: 6}}
                    animate={{opacity: 1, y: 0}}
                    transition={{duration: 0.2, ease: [0.16, 1, 0.3, 1]}}
                    className="px-4 py-3 max-w-lg mx-auto"
                >

                    {/* ── Profile hero — borderless, photo + name + tier ── */}
                    {profile && (
                        <button
                            onClick={() => navigate('/app/profile/me')}
                            className="w-full flex items-center gap-3 py-3.5 mb-1 active:opacity-70 transition-opacity text-left"
                        >
                            <div className="relative shrink-0">
                                <Avatar className="w-14 h-14 border border-border/25" style={{borderRadius: '8px'}}>
                                    <AvatarImage src={profile.avatar_url || ''} style={{borderRadius: '7px'}}/>
                                    <AvatarFallback
                                        className="text-lg font-black bg-secondary"
                                        style={{borderRadius: '7px'}}
                                    >
                                        {(profile.display_name || 'U')[0]}
                                    </AvatarFallback>
                                </Avatar>
                                {isPremium && (
                                    <div
                                        className="absolute -bottom-1 -right-1 w-5 h-5 flex items-center justify-center"
                                        style={{borderRadius: '4px', background: 'hsl(var(--gold))'}}
                                    >
                                        <Crown className="w-2.5 h-2.5 text-black"/>
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-black text-[15px] truncate">{profile.display_name}</p>
                                <p className="text-[11px] text-muted-foreground truncate">{user?.email}</p>
                                {isPremium && (
                                    <p className="text-[9.5px] font-black mt-0.5 uppercase tracking-widest"
                                       style={{color: 'hsl(var(--gold))'}}>
                                        {currentPlan} Member
                                    </p>
                                )}
                            </div>
                            <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/40 shrink-0"/>
                        </button>
                    )}

                    {/* ── Divider ── */}
                    <div className="h-px bg-border/15 mb-2"/>

                    {/* ── Section Header ── */}
                    <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground/60 px-4 py-2">Preferences</p>

                    {/* ── Nav — row-list, no card wrappers ── */}
                    <div>
                        {NAV_ITEMS.map((item, i) => {
                            const Icon = item.icon;
                            const isSubscription = item.id === 'subscription';
                            return (
                                <motion.button
                                    key={item.id}
                                    initial={{opacity: 0, x: -6}}
                                    animate={{opacity: 1, x: 0}}
                                    transition={{delay: i * 0.035, duration: 0.18}}
                                    onClick={() => navigate(item.path)}
                                    className="w-full flex items-center gap-3 px-4 py-3 border-b border-border/12 last:border-0 active:opacity-60 transition-opacity text-left"
                                >
                                    <div
                                        className="w-8 h-8 flex items-center justify-center shrink-0"
                                        style={{borderRadius: '6px', background: 'hsl(var(--primary)/0.09)'}}
                                    >
                                        <Icon className="w-5 h-5 text-primary"/>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-semibold text-[13px]">{item.label}</p>
                                        <p className="text-[10.5px] text-muted-foreground truncate">{item.desc}</p>
                                    </div>
                                    {isSubscription && !isPremium && (
                                        <span
                                            className="text-[8.5px] px-1.5 py-0.5 font-black shrink-0 uppercase tracking-wider"
                                            style={{
                                                borderRadius: '3px',
                                                background: 'hsl(var(--gold)/0.1)',
                                                color: 'hsl(var(--gold))',
                                                border: '1px solid hsl(var(--gold)/0.22)',
                                            }}
                                        >
                      UPGRADE
                    </span>
                                    )}
                                    <ChevronRight className="w-3.5 h-3.5 text-muted-foreground/35 shrink-0"/>
                                </motion.button>
                            );
                        })}
                    </div>

                    {/* ── Divider ── */}
                    <div className="h-px bg-border/15 mt-2 mb-2"/>

                    {/* ── Sign out — minimal text row ── */}
                    <motion.button
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.22}}
                        onClick={handleSignOut}
                        className="w-full flex items-center gap-3 py-3 active:opacity-60 transition-opacity text-left"
                    >
                        <div
                            className="w-8 h-8 flex items-center justify-center shrink-0"
                            style={{borderRadius: '6px', background: 'hsl(var(--destructive)/0.1)'}}
                        >
                            <LogOut className="w-5 h-5 text-destructive"/>
                        </div>
                        <p className="font-semibold text-[13px] text-destructive flex-1">Sign Out</p>
                    </motion.button>

                    {/* ── Version ── */}
                    <p className="text-center text-[9px] text-muted-foreground/30 font-bold pt-4 pb-6 uppercase tracking-widest">
                        FIND YOUR KING v1.0.0
                    </p>
                </motion.div>
            </div>
        </div>
    );
}
