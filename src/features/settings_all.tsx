import {Lock, Mail, Trash2, User} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {useAuth} from '@/hooks/useAuth';

export default function SettingsAccount() {
    const {user} = useAuth();
    return (
        <SubPageShell title="Account" icon={User}>
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email Address</h3>
                <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-muted-foreground"/>
                    <span className="text-sm flex-1">{user?.email}</span>
                    <Badge variant="secondary"
                           className="text-[10px] text-emerald-500 border-emerald-500/20">Verified</Badge>
                </div>
            </div>
            <div className="p-4  bg-card border border-border/40 space-y-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Change Password</h3>
                {['Current Password', 'New Password', 'Confirm New Password'].map(l => (
                    <div key={l} className="space-y-1.5"><Label className="text-sm">{l}</Label><Input type="password"
                                                                                                      placeholder="••••••••"
                                                                                                      className="h-11"/>
                    </div>
                ))}
                <Button className="w-full h-11" variant="outline"><Lock className="w-4 h-4 mr-2"/>Update
                    Password</Button>
            </div>
            <div className="p-4  bg-card border border-destructive/20 space-y-3">
                <h3 className="text-xs font-semibold text-destructive uppercase tracking-wide">Danger Zone</h3>
                <p className="text-sm text-muted-foreground">Deleting your account is permanent after a 30-day recovery
                    window.</p>
                <Button variant="outline"
                        className="w-full h-11 border-destructive/40 text-destructive hover:bg-destructive/10"><Trash2
                    className="w-4 h-4 mr-2"/>Delete Account</Button>
            </div>
        </SubPageShell>
    );
}
import {Settings} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Switch} from '@/components/ui/switch';
import {useState} from 'react';

export default function SettingsContent() {
    const [s, setS] = useState({explicitContent: true, safeSearch: false, showNSFW: true});
    const upd = (k: string, v: boolean) => setS(p => ({...p, [k]: v}));
    return (
        <SubPageShell title="Content" icon={Settings}>
            <p className="text-sm text-muted-foreground">Control what content you see in your feed and grid.</p>
            {[
                {
                    key: 'explicitContent',
                    label: 'Show explicit profile photos',
                    desc: 'NSFW photos from verified profiles'
                },
                {key: 'safeSearch', label: 'Safe search', desc: 'Filter potentially sensitive content'},
            ].map(({key, label, desc}) => (
                <div key={key} className="flex items-center justify-between p-4  bg-card border border-border/40">
                    <div className="flex-1 mr-4"><p className="font-semibold text-sm">{label}</p><p
                        className="text-xs text-muted-foreground mt-0.5">{desc}</p></div>
                    <Switch checked={s[key as keyof typeof s]} onCheckedChange={v => upd(key, v)}/>
                </div>
            ))}
        </SubPageShell>
    );
}
import {useState} from 'react';
import {Bell, Smartphone} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Switch} from '@/components/ui/switch';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {AnimatePresence, motion} from 'framer-motion';

export default function SettingsNotifications() {
    const [s, setS] = useState({
        messages: true,
        matches: true,
        events: true,
        marketing: false,
        push: true,
        quietHours: false,
        quietFrom: '22:00',
        quietTo: '08:00'
    });
    const upd = (k: string, v: boolean | string) => setS(p => ({...p, [k]: v}));
    return (
        <SubPageShell title="Notifications" icon={Bell}>
            <div className="p-4  bg-card border border-border/40 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center"><Smartphone
                        className="w-4 h-4 text-muted-foreground"/></div>
                    <div><p className="font-semibold text-sm">Push Notifications</p><p
                        className="text-xs text-muted-foreground">Receive alerts on your device</p></div>
                </div>
                <Switch checked={s.push} onCheckedChange={v => upd('push', v)}/>
            </div>
            {[
                {key: 'messages', label: 'New Messages', desc: 'When someone sends you a message'},
                {key: 'matches', label: 'Matches & Taps', desc: 'When someone taps or matches you'},
                {key: 'events', label: 'Event Updates', desc: 'RSVP confirmations and changes'},
                {key: 'marketing', label: 'Promotions', desc: 'App news and special offers'},
            ].map(({key, label, desc}) => (
                <div key={key} className="flex items-center justify-between p-4  bg-card border border-border/40">
                    <div className="flex-1 mr-4"><p className="font-semibold text-sm">{label}</p><p
                        className="text-xs text-muted-foreground mt-0.5">{desc}</p></div>
                    <Switch checked={s[key as keyof typeof s] as boolean} onCheckedChange={v => upd(key, v)}
                            disabled={!s.push}/>
                </div>
            ))}
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <div className="flex items-center justify-between">
                    <div><p className="font-semibold text-sm">Quiet Hours</p><p
                        className="text-xs text-muted-foreground mt-0.5">Silence push during this window</p></div>
                    <Switch checked={s.quietHours} onCheckedChange={v => upd('quietHours', v)}/>
                </div>
                <AnimatePresence>
                    {s.quietHours && (
                        <motion.div initial={{height: 0, opacity: 0}} animate={{height: 'auto', opacity: 1}}
                                    exit={{height: 0, opacity: 0}} className="overflow-hidden">
                            <div className="grid grid-cols-2 gap-3 pt-1">
                                {[{label: 'From', key: 'quietFrom'}, {label: 'To', key: 'quietTo'}].map(({
                                                                                                             label,
                                                                                                             key
                                                                                                         }) => (
                                    <div key={key} className="space-y-1.5">
                                        <Label className="text-xs">{label}</Label>
                                        <Input type="time" className="h-10" value={s[key as 'quietFrom' | 'quietTo']}
                                               onChange={e => upd(key, e.target.value)}/>
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </SubPageShell>
    );
}
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
import {useState} from 'react';
import {Download, ExternalLink, Eye, EyeOff, Globe, MessageCircle} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Switch} from '@/components/ui/switch';
import {Button} from '@/components/ui/button';
import {useNavigate} from 'react-router-dom';
import {useSubscription} from '@/hooks/useSubscription';
import {Badge} from '@/components/ui/badge';

export default function SettingsPrivacy() {
    const navigate = useNavigate();
    const {isPremium} = useSubscription();
    const [settings, setSettings] = useState({
        showDistance: true,
        showLastActive: true,
        showOnlineStatus: true,
        allowMessageRequests: true,
        incognito: false
    });
    const upd = (k: string, v: boolean) => setSettings(p => ({...p, [k]: v}));
    const rows = [
        {key: 'showDistance', label: 'Show distance to others', icon: Globe},
        {key: 'showLastActive', label: 'Show last active time', icon: Eye},
        {key: 'showOnlineStatus', label: 'Show online status', icon: Eye},
        {key: 'allowMessageRequests', label: 'Allow message requests', icon: MessageCircle},
        {key: 'incognito', label: 'Incognito mode', icon: EyeOff, premium: true},
    ];
    return (
        <SubPageShell title="Privacy" icon={Eye}>
            <div className="space-y-2.5">
                {rows.map(({key, label, icon: Icon, premium}) => (
                    <div key={key} className="flex items-center gap-4 p-4  bg-card border border-border/40">
                        <div className="w-9 h-9 rounded-full bg-secondary flex items-center justify-center shrink-0">
                            <Icon className="w-4 h-4 text-muted-foreground"/></div>
                        <span className="flex-1 text-sm font-medium">{label}</span>
                        {premium && <Badge variant="secondary" className="text-[10px] mr-1">Premium</Badge>}
                        <Switch checked={settings[key as keyof typeof settings] as boolean}
                                onCheckedChange={v => upd(key, v)} disabled={premium && !isPremium}/>
                    </div>
                ))}
            </div>
            <div className="p-4  bg-card border border-border/40 space-y-2.5">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Data & Privacy</h3>
                <Button variant="outline" className="w-full h-11 justify-start"
                        onClick={() => navigate('/legal/privacy')}><ExternalLink className="w-4 h-4 mr-2"/>Privacy
                    Policy</Button>
                <Button variant="outline" className="w-full h-11 justify-start"><Download className="w-4 h-4 mr-2"/>Export
                    My Data (DSAR)</Button>
            </div>
        </SubPageShell>
    );
}
import {Fingerprint, Shield} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Button} from '@/components/ui/button';

export default function SettingsSecurity() {
    return (
        <SubPageShell title="Security" icon={Shield}>
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Two-Factor
                    Authentication</h3>
                <p className="text-sm text-muted-foreground">Add an extra layer of security to your account.</p>
                <Button variant="outline" className="w-full h-11"><Fingerprint className="w-4 h-4 mr-2"/>Enable
                    2FA</Button>
            </div>
            <div className="p-4  bg-card border border-border/40 space-y-3">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Active Sessions</h3>
                <p className="text-sm text-muted-foreground">You are signed in on this device.</p>
                <Button variant="outline" className="w-full h-11 text-destructive border-destructive/30">Sign Out All
                    Devices</Button>
            </div>
        </SubPageShell>
    );
}
import {Check, CreditCard, Crown} from 'lucide-react';
import SubPageShell from './SubPageShell';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {useSubscription} from '@/hooks/useSubscription';
import {cn} from '@/lib/utils';

const PLANS = [
    {
        tier: 'premium',
        label: 'Premium',
        price: '$19.99',
        period: '/mo',
        features: ['Unlimited messaging', 'Read receipts', 'Advanced filters', 'Incognito mode', 'Priority search'],
        recommended: true
    },
    {
        tier: 'black',
        label: 'Black',
        price: '$49.99',
        period: '/mo',
        features: ['All Premium', 'Verified badge', 'Featured profile', 'AI assistant', 'Priority support']
    },
];

export default function SettingsSubscription() {
    const {isPremium, currentPlan, planInfo} = useSubscription();
    return (
        <SubPageShell title="Subscription" icon={CreditCard}>
            {isPremium ? (
                <div
                    className="p-6 rounded-2xl bg-gradient-to-br from-primary/15 via-card to-accent/10 border border-primary/30 text-center space-y-4">
                    <div
                        className="w-16 h-16 rounded-full gradient-primary flex items-center justify-center mx-auto shadow-[0_0_32px_hsl(var(--primary)/0.4)]">
                        <Crown className="w-8 h-8 text-primary-foreground"/></div>
                    <div><h3 className="text-xl font-bold">Active Plan</h3><p
                        className="text-muted-foreground text-sm mt-1 capitalize">{currentPlan}</p></div>
                    <Button variant="outline" className="w-full h-11">Manage Billing</Button>
                </div>
            ) : (
                <>
                    <div className="p-4 rounded-2xl bg-secondary/40 border border-border/40 text-center"><p
                        className="text-muted-foreground text-sm">You are on the <strong>Free</strong> plan.</p></div>
                    {PLANS.map(plan => (
                        <div key={plan.tier}
                             className={cn('p-5 rounded-2xl border space-y-4', plan.recommended ? 'border-primary/60 bg-primary/5 shadow-[0_0_24px_hsl(var(--primary)/0.12)]' : 'bg-card border-border/40')}>
                            {plan.recommended && <div className="flex justify-center"><Badge
                                className="gradient-primary text-primary-foreground text-xs px-3 py-1">Most
                                Popular</Badge></div>}
                            <div className="flex items-end justify-between">
                                <h3 className="text-lg font-bold">{plan.label}</h3>
                                <div className="text-right"><span
                                    className="text-2xl font-bold text-primary">{plan.price}</span><span
                                    className="text-sm text-muted-foreground">{plan.period}</span></div>
                            </div>
                            <ul className="space-y-2">{plan.features.map(f => <li key={f}
                                                                                  className="flex items-center gap-2.5 text-sm">
                                <div
                                    className="w-4 h-4 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
                                    <Check className="w-2.5 h-2.5 text-primary"/></div>
                                {f}</li>)}</ul>
                            <Button
                                className={cn('w-full h-11', plan.recommended ? 'gradient-primary shadow-[0_4px_20px_hsl(var(--primary)/0.3)]' : '')}
                                variant={plan.recommended ? 'default' : 'outline'}>Upgrade to {plan.label}</Button>
                        </div>
                    ))}
                </>
            )}
        </SubPageShell>
    );
}
import {useNavigate} from 'react-router-dom';
import {ChevronRight} from 'lucide-react';
import {motion} from 'framer-motion';
import React from 'react';

interface SubPageShellProps {
    title: string;
    icon: React.ElementType;
    children: React.ReactNode;
    action?: React.ReactNode;
}

const SubPageShell = ({title, icon: Icon, children, action}: SubPageShellProps) => {
    const navigate = useNavigate();
    return (
        <div className="min-h-screen bg-background pb-24">
            {/* Header — minimal, no card wrapper */}
            <header
                className="sticky top-0 z-40 border-b border-border/12 px-4 py-2.5"
                style={{background: 'hsl(var(--background)/0.94)', backdropFilter: 'blur(20px)'}}
            >
                <div className="flex items-center gap-2.5 max-w-lg mx-auto">
                    <button
                        className="w-7 h-7 flex items-center justify-center text-muted-foreground active:scale-90 transition-all"
                        style={{borderRadius: '6px', background: 'hsl(var(--secondary)/0.5)'}}
                        onClick={() => navigate(-1)}
                        aria-label="Back"
                    >
                        <ChevronRight className="w-3.5 h-3.5 rotate-180"/>
                    </button>
                    <div className="flex items-center gap-1.5 flex-1 min-w-0">
                        <Icon className="w-3.5 h-3.5 text-primary shrink-0"/>
                        <h1 className="text-[13.5px] font-black truncate">{title}</h1>
                    </div>
                    {action && <div className="shrink-0">{action}</div>}
                </div>
            </header>

            <motion.div
                initial={{opacity: 0, y: 6}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.18, ease: [0.16, 1, 0.3, 1]}}
                className="px-4 py-3 space-y-2.5 max-w-lg mx-auto"
            >
                {children}
            </motion.div>
        </div>
    );
};

export default SubPageShell;
/**
 * SubscriptionPage — full monetization UI
 * Tiers: Free / Plus / Pro / Elite / Host
 * Feature packs, progression level, upgrade CTAs
 */
import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowRight, Check, ChevronRight, Crown, Shield, Sparkles, Star, Users, Zap,} from 'lucide-react';
import {useNavigate} from 'react-router-dom';
import {
    FEATURE_PACKS,
    LEVEL_META,
    SubTier,
    TIER_BENEFITS,
    TIER_META,
    useMyLevel,
    useMySubscription,
} from '@/hooks/useSubscriptionTier';
import {cn} from '@/lib/utils';

// ── Tier icon map ─────────────────────────────────────────────
const TIER_ICONS: Record<SubTier, typeof Crown> = {
    free: Zap,
    plus: Star,
    pro: Crown,
    elite: Shield,
    host: Users,
};

// ── Plan card ─────────────────────────────────────────────────
function PlanCard({
                      tier, isCurrentTier, isHighlighted, annual,
                      onUpgrade,
                  }: {
    tier: SubTier;
    isCurrentTier: boolean;
    isHighlighted: boolean;
    annual: boolean;
    onUpgrade: (t: SubTier) => void;
}) {
    const meta = TIER_META[tier];
    const benefits = TIER_BENEFITS[tier];
    const Icon = TIER_ICONS[tier];
    const price = annual ? meta.price_annual : meta.price_monthly;
    const priceLabel = tier === 'free' ? 'Free forever' : annual
        ? `$${meta.price_annual}/yr`
        : `$${meta.price_monthly}/mo`;
    const savingsLabel = annual && meta.price_monthly > 0
        ? `Save $${((meta.price_monthly * 12) - meta.price_annual).toFixed(0)}/yr`
        : null;

    return (
        <motion.div
            initial={{opacity: 0, y: 16}}
            animate={{opacity: 1, y: 0}}
            className={cn(
                'relative border overflow-hidden transition-all',
                isHighlighted
                    ? 'border-primary/50 shadow-[0_0_32px_hsl(var(--primary)/0.15)]'
                    : 'border-border/25',
                isCurrentTier && 'outline outline-1 outline-primary/30',
            )}
            style={{background: isHighlighted ? 'hsl(var(--card))' : 'hsl(var(--surface-1))'}}
        >
            {/* Recommended badge */}
            {isHighlighted && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="px-3 py-0.5 text-[10px] font-black text-primary-foreground"
                style={{background: 'var(--gradient-primary, hsl(var(--primary)))'}}>
            MOST POPULAR
          </span>
                </div>
            )}

            <div className="p-5 pt-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <div className="w-7 h-7 flex items-center justify-center"
                                 style={{background: `${meta.color}20`}}>
                                <Icon className="w-4 h-4" style={{color: meta.color}}/>
                            </div>
                            <span className="font-black text-[16px]">{meta.label}</span>
                            {isCurrentTier && (
                                <span className="px-2 py-0.5 text-[9px] font-black bg-primary/15 text-primary">
                  CURRENT
                </span>
                            )}
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="font-black text-[20px] leading-none" style={{color: meta.color}}>
                            {tier === 'free' ? 'Free' : `$${annual ? (meta.price_annual / 12).toFixed(2) : meta.price_monthly}`}
                        </p>
                        {tier !== 'free' && (
                            <p className="text-[10px] text-muted-foreground mt-0.5">
                                {annual ? '/mo billed annually' : '/month'}
                            </p>
                        )}
                        {savingsLabel && (
                            <p className="text-[10px] font-bold mt-0.5"
                               style={{color: 'hsl(var(--emerald))'}}>{savingsLabel}</p>
                        )}
                    </div>
                </div>

                {/* Benefits */}
                <ul className="space-y-1.5 mb-5">
                    {benefits.slice(0, 6).map(b => (
                        <li key={b} className="flex items-center gap-2 text-[12px]">
                            <Check className="w-3.5 h-3.5 shrink-0" style={{color: meta.color}}/>
                            <span
                                className={cn(b.startsWith('Everything') ? 'text-muted-foreground italic' : 'text-foreground/85')}>
                {b}
              </span>
                        </li>
                    ))}
                    {benefits.length > 6 && (
                        <li className="text-[11px] text-muted-foreground pl-5">
                            +{benefits.length - 6} more benefits
                        </li>
                    )}
                </ul>

                {/* CTA */}
                {!isCurrentTier && tier !== 'free' ? (
                    <button
                        onClick={() => onUpgrade(tier)}
                        className={cn(
                            'w-full h-10 font-bold text-[13px] flex items-center justify-center gap-2 transition-all active:scale-[0.98]',
                            isHighlighted
                                ? 'text-primary-foreground shadow-[0_4px_16px_hsl(var(--primary)/0.35)]'
                                : 'border border-border/40 hover:border-primary/40 bg-secondary/40',
                        )}
                        style={isHighlighted ? {background: 'var(--gradient-primary, hsl(var(--primary)))'} : {}}
                    >
                        Upgrade to {meta.label}
                        <ArrowRight className="w-3.5 h-3.5"/>
                    </button>
                ) : isCurrentTier ? (
                    <div
                        className="w-full h-10 border border-border/30 flex items-center justify-center gap-2 text-[13px] text-muted-foreground">
                        <Check className="w-3.5 h-3.5"/>
                        Active Plan
                    </div>
                ) : (
                    <div
                        className="w-full h-10 bg-secondary/30 flex items-center justify-center text-[12px] text-muted-foreground">
                        Your current plan
                    </div>
                )}
            </div>
        </motion.div>
    );
}

// ── Level progress card ───────────────────────────────────────
function LevelProgressCard() {
    const {level, meta, xp, nextLevel, nextXP, progress, levelData} = useMyLevel();

    return (
        <div className="border border-border/25 overflow-hidden"
             style={{background: 'hsl(var(--surface-1))'}}>
            <div className="p-4">
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2.5">
                        <div className="w-10 h-10 flex items-center justify-center font-black text-[16px]"
                             style={{background: `${meta.color}20`, color: meta.color}}>
                            {meta.label[0]}
                        </div>
                        <div>
                            <p className="font-black text-[14px]">{meta.label}</p>
                            <p className="text-[10px] text-muted-foreground">{xp.toLocaleString()} XP</p>
                        </div>
                    </div>
                    {nextLevel && (
                        <div className="text-right">
                            <p className="text-[10px] text-muted-foreground">Next</p>
                            <p className="font-bold text-[12px]" style={{color: LEVEL_META[nextLevel].color}}>
                                {LEVEL_META[nextLevel].label}
                            </p>
                            <p className="text-[10px] text-muted-foreground">{nextXP?.toLocaleString()} XP</p>
                        </div>
                    )}
                </div>

                {/* Progress bar */}
                {nextLevel && (
                    <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                        <motion.div
                            initial={{width: 0}} animate={{width: `${progress}%`}}
                            transition={{duration: 0.8, ease: 'easeOut'}}
                            className="h-full rounded-full"
                            style={{background: meta.color}}
                        />
                    </div>
                )}

                {/* Perks */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                    {meta.perks.map(p => (
                        <span key={p}
                              className="px-2 py-0.5 text-[10px] font-semibold bg-secondary/60 text-muted-foreground border border-border/20">
              {p}
            </span>
                    ))}
                </div>
            </div>

            {/* Stats row */}
            {levelData && (
                <div className="grid grid-cols-3 divide-x divide-border/20 border-t border-border/20">
                    {[
                        {label: 'Events', value: levelData.total_events_attended},
                        {label: 'Hosted', value: levelData.total_events_hosted},
                        {label: 'Streak', value: `${levelData.streak_days}d`},
                    ].map(({label, value}) => (
                        <div key={label} className="py-2.5 text-center">
                            <p className="font-black text-[15px]">{value}</p>
                            <p className="text-[9px] text-muted-foreground font-semibold uppercase tracking-wider">{label}</p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

// ── Feature pack card ─────────────────────────────────────────
function FeaturePackCard({pack}: { pack: (typeof FEATURE_PACKS)[number] }) {
    const {hasPack} = useMySubscription();
    const owned = hasPack(pack.id);

    return (
                            <div className={cn(
                                'border p-4 flex items-center gap-3 transition-all',
                                owned ? 'border-primary/30 bg-primary/5' : 'border-border/25 bg-surface-1',
                            )}>
            <div className="w-10 h-10 flex items-center justify-center text-[20px] bg-secondary/60 shrink-0">
                {pack.icon}
            </div>
            <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5 mb-0.5">
                    <p className="font-bold text-[13px]">{pack.name}</p>
                    {owned && <Check className="w-3.5 h-3.5 text-primary shrink-0"/>}
                </div>
                <p className="text-[11px] text-muted-foreground line-clamp-1">{pack.description}</p>
            </div>
            <div className="shrink-0 text-right">
                {owned ? (
                    <span className="text-[11px] font-bold text-primary">Active</span>
                ) : (
                    <>
                        <p className="font-black text-[14px]">${pack.price}</p>
                        <p className="text-[9px] text-muted-foreground">/mo</p>
                    </>
                )}
            </div>
        </div>
    );
}

// ── Main page ─────────────────────────────────────────────────
export default function SubscriptionPage() {
    const navigate = useNavigate();
    const {tier: currentTier, isLoading} = useMySubscription();
    const [annual, setAnnual] = useState(true);
    const [activeSection, setActiveSection] = useState<'plans' | 'packs' | 'level'>('plans');

    const tiers: SubTier[] = ['free', 'plus', 'pro', 'elite', 'host'];
    const HIGHLIGHTED: SubTier = 'pro';

    const handleUpgrade = (tier: SubTier) => {
        // Route to checkout — wired to Stripe in create-checkout edge function
        navigate(`/app/settings/checkout?tier=${tier}&annual=${annual}`);
    };

    return (
        <div className="min-h-screen pb-24" style={{background: 'hsl(var(--background))'}}>
            {/* Header */}
            <header className="sticky top-0 z-40 border-b border-border/15"
                    style={{background: 'hsl(var(--card)/0.95)', backdropFilter: 'blur(20px)'}}>
                <div className="flex items-center gap-3 px-4 py-3.5">
                    <button onClick={() => navigate(-1)}
                            className="w-8 h-8 flex items-center justify-center bg-secondary/60 active:scale-90 transition-all">
                        <ChevronRight className="w-4 h-4 rotate-180"/>
                    </button>
                    <div className="flex-1">
                        <h1 className="font-black text-[16px] leading-tight">Upgrade</h1>
                        <p className="text-[10px] text-muted-foreground">Unlock your full potential</p>
                    </div>
                    <div className="flex items-center gap-1 p-0.5 bg-secondary/40">
                        {(['plans', 'packs', 'level'] as const).map(s => (
                            <button key={s} onClick={() => setActiveSection(s)}
                                    className={cn(
                                        'px-2.5 py-1 rounded-[6px] text-[11px] font-bold transition-all capitalize',
                                        activeSection === s ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground',
                                    )}>
                                {s}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            <div className="px-4 pt-4 space-y-4">
                <AnimatePresence mode="wait">

                    {/* ── Plans section ── */}
                    {activeSection === 'plans' && (
                        <motion.div key="plans" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="space-y-4">

                            {/* Hero */}
                            <div className="text-center py-2">
                                <div
                                    className="inline-flex items-center gap-2 px-3 py-1 bg-primary/10 border border-primary/20 mb-3">
                                    <Sparkles className="w-3.5 h-3.5 text-primary"/>
                                    <span className="text-[11px] font-bold text-primary">Premium Social Platform</span>
                                </div>
                                <p className="text-[13px] text-muted-foreground max-w-xs mx-auto">
                                    Unlock faster discovery, better coordination, and higher-quality outcomes.
                                </p>
                            </div>

                            {/* Annual toggle */}
                            <div className="flex items-center justify-center gap-3">
                                <span
                                    className={cn('text-[12px] font-semibold', !annual && 'text-foreground', annual && 'text-muted-foreground')}>Monthly</span>
                                <button
                                    onClick={() => setAnnual(a => !a)}
                                    className={cn(
                                        'relative w-11 h-6 transition-all',
                                        annual ? 'bg-primary' : 'bg-secondary',
                                    )}
                                >
                                    <motion.div
                                        animate={{x: annual ? 20 : 2}}
                                        transition={{type: 'spring', stiffness: 500, damping: 30}}
                                        className="absolute top-1 w-4 h-4 bg-white shadow"
                                    />
                                </button>
                                <div className="flex items-center gap-1.5">
                                    <span
                                        className={cn('text-[12px] font-semibold', annual && 'text-foreground', !annual && 'text-muted-foreground')}>Annual</span>
                                    <span
                                        className="px-1.5 py-0.5 text-[9px] font-black bg-emerald-400/15 text-emerald-400">SAVE 20%</span>
                                </div>
                            </div>

                            {/* Plan cards */}
                            {tiers.map(t => (
                                <PlanCard
                                    key={t}
                                    tier={t}
                                    isCurrentTier={t === currentTier}
                                    isHighlighted={t === HIGHLIGHTED}
                                    annual={annual}
                                    onUpgrade={handleUpgrade}
                                />
                            ))}

                            {/* Trust badges */}
                            <div className="flex items-center justify-center gap-6 py-4">
                                {['Cancel anytime', 'Secure billing', 'Instant activation'].map(b => (
                                    <div key={b} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                                        <Check className="w-3 h-3 text-emerald-400"/>{b}
                                    </div>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* ── Feature packs section ── */}
                    {activeSection === 'packs' && (
                        <motion.div key="packs" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="space-y-3">
                            <div className="border border-border/25 p-4 bg-secondary/20">
                                <p className="text-[12px] text-muted-foreground">
                                    Feature packs add targeted capabilities to your plan. Mix and match what matters to
                                    you.
                                </p>
                            </div>
                            {FEATURE_PACKS.map(pack => (
                                <FeaturePackCard key={pack.id} pack={pack}/>
                            ))}
                        </motion.div>
                    )}

                    {/* ── Level / progression section ── */}
                    {activeSection === 'level' && (
                        <motion.div key="level" initial={{opacity: 0}} animate={{opacity: 1}} exit={{opacity: 0}}
                                    className="space-y-4">
                            <LevelProgressCard/>

                            {/* Level ladder */}
                            <div className="border border-border/25 overflow-hidden"
                                 style={{background: 'hsl(var(--surface-1))'}}>
                                <div className="px-4 py-3 border-b border-border/15">
                                    <p className="font-black text-[13px]">Level Progression</p>
                                    <p className="text-[11px] text-muted-foreground mt-0.5">Earn XP through attendance,
                                        hosting, and quality interactions</p>
                                </div>
                                {(Object.entries(LEVEL_META) as [string, typeof LEVEL_META[keyof typeof LEVEL_META]][]).map(([key, m]) => (
                                    <div key={key}
                                         className="flex items-center gap-3 px-4 py-3 border-b border-border/10 last:border-0">
                                        <div
                                            className="w-8 h-8 flex items-center justify-center font-black text-[13px] shrink-0"
                                            style={{background: `${m.color}18`, color: m.color}}>
                                            {m.label[0]}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-[12px]">{m.label}</p>
                                                <span
                                                    className="text-[10px] text-muted-foreground">{m.xp.toLocaleString()} XP</span>
                                            </div>
                                            <p className="text-[11px] text-muted-foreground truncate">{m.perks[0]}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* How to earn XP */}
                            <div className="border border-border/25 p-4"
                                 style={{background: 'hsl(var(--surface-1))'}}>
                                <p className="font-black text-[13px] mb-3">Earn XP</p>
                                <div className="space-y-2">
                                    {[
                                        {action: 'Complete your profile', xp: 50, icon: '👤'},
                                        {action: 'Attend an event (RSVP + show)', xp: 25, icon: '✅'},
                                        {action: 'Host an event', xp: 75, icon: '🎉'},
                                        {action: 'Receive 5-star host rating', xp: 100, icon: '⭐'},
                                        {action: 'Refer a new user', xp: 40, icon: '🤝'},
                                        {action: '7-day activity streak', xp: 30, icon: '🔥'},
                                    ].map(({action, xp, icon}) => (
                                        <div key={action} className="flex items-center gap-3">
                                            <span className="text-lg w-7">{icon}</span>
                                            <span className="flex-1 text-[12px]">{action}</span>
                                            <span className="font-black text-[12px] text-primary">+{xp} XP</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </motion.div>
                    )}

                </AnimatePresence>
            </div>
        </div>
    );
}
