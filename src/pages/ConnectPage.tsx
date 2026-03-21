import {useState} from 'react';
import {Link, useSearchParams, useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {
    ArrowRight,
    BadgeCheck,
    Brain,
    Crown,
    Eye,
    EyeOff,
    Lock,
    Mail,
    Radio,
    Shield,
    Sparkles,
    Trophy,
    Zap,
    SkipForward,
} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from '@/hooks/use-toast';

// ── Brand panel perks ───────────────────────────────────────────
const PERKS = [
    {icon: Brain, label: 'AI King', desc: 'Your personal AI wingman'},
    {icon: Radio, label: 'Right Now', desc: 'Real-time nearby availability'},
    {icon: Trophy, label: 'Elite Circles', desc: 'Trust-based progression'},
    {icon: Shield, label: 'Verified & Safe', desc: 'Photo ID + community trust'},
];

// ── Main ────────────────────────────────────────────────────────
const ConnectPage = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const isRegisterMode = searchParams.get('mode') === 'register';

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isRegister, setIsRegister] = useState(isRegisterMode);
    const [isMagicLink, setIsMagicLink] = useState(false);
    const [magicLinkSent, setMagicLinkSent] = useState(false);
    const {toast} = useToast();

    const handleSkipAuth = () => {
        toast({
            title: 'Skipped Authentication',
            description: 'Continuing without sign in.',
        });
        navigate('/app/grid');
    };

    const handleMagicLink = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const {error} = await supabase.auth.signInWithOtp({
                email,
                options: {emailRedirectTo: `${window.location.origin}/auth/callback`},
            });
            if (error) throw error;
            setMagicLinkSent(true);
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({title: 'Error', description: errorMessage, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (isMagicLink) return handleMagicLink(e);
        setIsLoading(true);
        try {
            if (isRegister) {
                if (password !== confirmPassword) {
                    toast({title: "Passwords don't match", variant: 'destructive'});
                    return;
                }

                const {error} = await supabase.auth.signUp({
                    email,
                    password,
                    options: {emailRedirectTo: `${window.location.origin}/auth/callback`},
                });
                if (error) throw error;
                toast({title: 'Welcome to the kingdom!', description: 'Check your email to verify your account.'});
            } else {

                const {error} = await supabase.auth.signInWithPassword({email, password});
                if (error) throw error;
                toast({title: 'Welcome back, King!'});
                window.location.href = '/app';
            }
        } catch (error: unknown) {
            const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
            toast({title: 'Error', description: errorMessage, variant: 'destructive'});
        } finally {
            setIsLoading(false);
        }
    };

    // ── Magic link sent state ──
    if (magicLinkSent) {
        return (
            <div
                className="min-h-screen flex items-center justify-center p-4"
                style={{background: 'hsl(var(--background))'}}
            >
                <motion.div
                    initial={{opacity: 0, scale: 0.95}}
                    animate={{opacity: 1, scale: 1}}
                    className="max-w-md w-full text-center"
                >
                    <div
                        className="w-16 h-16 mx-auto mb-6 flex items-center justify-center"
                        style={{background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)'}}
                    >
                        <Sparkles className="w-7 h-7 text-white"/>
                    </div>
                    <h1 className="text-[28px] font-black tracking-[-0.03em] mb-3">CHECK YOUR INBOX</h1>
                    <p className="text-muted-foreground mb-8 text-[14px] leading-relaxed">
                        We sent a magic link to <strong className="text-foreground">{email}</strong>.
                        Click it to sign in instantly — no password needed.
                    </p>
                    <button
                        onClick={() => {
                            setMagicLinkSent(false);
                            setEmail('');
                        }}
                        className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                    >
                        Use a different email
                    </button>
                </motion.div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* ── Left: Brand Panel ── */}
            <div
                className="hidden lg:flex flex-col justify-between w-[420px] xl:w-[480px] shrink-0 relative overflow-hidden p-10 xl:p-12"
                style={{
                    background: 'hsl(var(--surface-1))',
                    borderRight: '1px solid hsl(var(--border))',
                }}
            >
                {/* Ambient nebula */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
              radial-gradient(ellipse 80% 50% at 20% 20%, hsl(214 100% 58% / 0.1) 0%, transparent 65%),
              radial-gradient(ellipse 60% 40% at 80% 80%, hsl(188 100% 50% / 0.07) 0%, transparent 60%)
            `,
                    }}
                />
                {/* Grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.02]"
                    style={{
                        backgroundImage: `
              linear-gradient(hsl(var(--primary)) 1px, transparent 1px),
              linear-gradient(90deg, hsl(var(--primary)) 1px, transparent 1px)
            `,
                        backgroundSize: '40px 40px',
                    }}
                />

                {/* Top: Logo */}
                <div className="relative z-10">
                    <Link to="/" className="flex items-center gap-2.5 mb-16">
                        <div
                            className="w-8 h-8 flex items-center justify-center"
                            style={{
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 0 20px hsl(214 100% 58% / 0.4)',
                            }}
                        >
                            <Crown className="w-4 h-4 text-white"/>
                        </div>
                        <div>
                            <p className="text-[14px] font-black tracking-[-0.02em] leading-none">FIND YOUR KING</p>
                            <p className="text-[8px] font-black tracking-[0.1em] uppercase text-muted-foreground mt-0.5">CONNECT
                                · EXPLORE</p>
                        </div>
                    </Link>

                    <div
                        className="w-8 h-[1px] mb-6"
                        style={{background: 'hsl(var(--primary))'}}
                    />
                    <h2
                        className="font-black leading-[0.95] tracking-[-0.04em] mb-4"
                        style={{fontSize: 'clamp(28px, 3vw, 40px)'}}
                    >
                        {isRegister ? 'JOIN THE\nKINGDOM.' : 'WELCOME\nBACK, KING.'}
                    </h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed max-w-[280px]">
                        {isRegister
                            ? 'Create your profile and start connecting with men who know what they want.'
                            : 'Your kingdom is waiting. Sign in to discover who\'s nearby and ready.'}
                    </p>
                </div>

                {/* Middle: Perks */}
                <div className="relative z-10 space-y-4">
                    <p
                        className="text-[9px] font-black tracking-[0.2em] uppercase mb-5"
                        style={{color: 'hsl(var(--muted-foreground))'}}
                    >Platform Capabilities</p>
                    {PERKS.map(({icon: Icon, label, desc}, i) => (
                        <motion.div
                            key={label}
                            initial={{opacity: 0, x: -16}}
                            animate={{opacity: 1, x: 0}}
                            transition={{delay: 0.1 + i * 0.08}}
                            className="flex items-center gap-3"
                        >
                            <div
                                className="w-8 h-8 flex items-center justify-center shrink-0"
                                style={{
                                    background: 'hsl(var(--primary) / 0.08)',
                                    border: '1px solid hsl(var(--primary) / 0.18)',
                                }}
                            >
                                <Icon className="w-3.5 h-3.5" style={{color: 'hsl(var(--primary))'}} strokeWidth={1.8}/>
                            </div>
                            <div>
                                <p className="text-[12px] font-black">{label}</p>
                                <p className="text-[11px] text-muted-foreground">{desc}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Bottom: Trust */}
                <div className="relative z-10">
                    <div className="flex flex-wrap gap-4">
                        {['GDPR', 'SSL', '18+', '4.9★'].map((t) => (
                            <div key={t} className="flex items-center gap-1.5">
                                <BadgeCheck
                                    className="w-3 h-3"
                                    style={{color: 'hsl(var(--emerald))'}}
                                />
                                <span className="text-[10px] font-semibold text-muted-foreground">{t}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right: Auth Form ── */}
            <div className="flex-1 flex flex-col min-h-screen">
                {/* Mobile logo */}
                <div className="lg:hidden px-6 pt-6">
                    <Link to="/" className="flex items-center gap-2">
                        <div
                            className="w-7 h-7 flex items-center justify-center"
                            style={{background: 'var(--gradient-primary)'}}
                        >
                            <Crown className="w-3.5 h-3.5 text-white"/>
                        </div>
                        <span className="text-[13px] font-black tracking-tight">FIND YOUR KING</span>
                    </Link>
                </div>

                <div className="flex-1 flex items-center justify-center px-4 sm:px-8 py-12">
                    <div className="w-full max-w-[420px] glass-effect glow-gold-ring p-8 sm:p-10">
                        <motion.div
                            initial={{opacity: 0, y: 16}}
                            animate={{opacity: 1, y: 0}}
                            transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
                        >
                            {/* Header */}
                            <div className="mb-8">
                                <h1 className="text-hero mb-2">
                                    {isRegister ? 'Create Account' : 'Sign In'}
                                </h1>
                                <p className="text-[14px] text-muted-foreground font-semibold">
                                    {isRegister
                                        ? 'Join 520,000+ members worldwide'
                                        : 'Your throne awaits'}
                                </p>
                            </div>

                            {/* Magic link toggle */}
                            <button
                                type="button"
                                onClick={() => setIsMagicLink(!isMagicLink)}
                                className="w-full flex items-center justify-center gap-2 h-10 mb-5 text-[12px] font-black tracking-[0.08em] uppercase transition-all duration-120"
                                style={{
                                    background: isMagicLink ? 'hsl(var(--primary) / 0.12)' : 'transparent',
                                    color: isMagicLink ? 'hsl(var(--primary))' : 'hsl(var(--muted-foreground))',
                                    border: isMagicLink ? '1px solid hsl(var(--primary) / 0.3)' : '1px solid hsl(var(--border))',
                                }}
                            >
                                <Sparkles className="w-3.5 h-3.5"/>
                                {isMagicLink ? 'Using Magic Link ✓' : 'Use Magic Link (No Password)'}
                            </button>

                            {/* Divider */}
                            {!isMagicLink && (
                                <div className="flex items-center gap-3 mb-5">
                                    <div className="flex-1 h-[1px]" style={{background: 'hsl(var(--border))'}}/>
                                    <span
                                        className="text-[10px] font-black tracking-[0.12em] uppercase text-muted-foreground">
                    or with password
                  </span>
                                    <div className="flex-1 h-[1px]" style={{background: 'hsl(var(--border))'}}/>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="space-y-4">
                                {/* Email */}
                                <div>
                                    <label
                                        htmlFor="email"
                                        className="block text-[11px] font-black tracking-[0.12em] uppercase mb-2"
                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                    >Email Address</label>
                                    <div className="relative">
                                        <Mail
                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                                            style={{color: 'hsl(var(--muted-foreground))'}}
                                        />
                                        <Input
                                            id="email"
                                            type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            placeholder="king@example.com" autoFocus
                                            required
                                            className="pl-11 h-12 text-[14px] font-semibold"
                                        />
                                    </div>
                                </div>

                                <AnimatePresence>
                                    {!isMagicLink && (
                                        <motion.div
                                            initial={{opacity: 0, height: 0}}
                                            animate={{opacity: 1, height: 'auto'}}
                                            exit={{opacity: 0, height: 0}}
                                            className="space-y-4 overflow-hidden"
                                        >
                                            {/* Password */}
                                            <div>
                                                <div className="flex items-center justify-between mb-2">
                                                    <label
                                                        htmlFor="password"
                                                        className="text-[11px] font-black tracking-[0.12em] uppercase"
                                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                                    >Password</label>
                                                    {!isRegister && (
                                                        <Link
                                                            to="/auth/reset-password"
                                                            className="text-[11px] font-semibold transition-colors"
                                                            style={{color: 'hsl(var(--primary))'}}
                                                        >Forgot?</Link>
                                                    )}
                                                </div>
                                                <div className="relative">
                                                    <Lock
                                                        className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                                    />
                                                    <Input
                                                        id="password"
                                                        type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"}
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        placeholder="••••••••"
                                                        required
                                                        className="pl-11 pr-10 h-12 text-[14px] font-semibold"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => setShowPassword(!showPassword)}
                                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                                    >
                                                        {showPassword
                                                            ? <EyeOff className="w-[18px] h-[18px]"/>
                                                            : <Eye className="w-[18px] h-[18px]"/>}
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Confirm password */}
                                            {isRegister && (
                                                <div>
                                                    <label
                                                        htmlFor="confirm"
                                                        className="block text-[11px] font-black tracking-[0.12em] uppercase mb-2"
                                                        style={{color: 'hsl(var(--muted-foreground))'}}
                                                    >Confirm Password</label>
                                                    <div className="relative">
                                                        <Lock
                                                            className="absolute left-4 top-1/2 -translate-y-1/2 w-[18px] h-[18px]"
                                                            style={{color: 'hsl(var(--muted-foreground))'}}
                                                        />
                                                        <Input
                                                            id="confirm"
                                                            type={showPassword ? "text" : "password"} autoComplete={isRegister ? "new-password" : "current-password"}
                                                            value={confirmPassword}
                                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                                            placeholder="••••••••"
                                                            required
                                                            className="pl-11 h-12 text-[14px] font-semibold"
                                                        />
                                                    </div>
                                                </div>
                                            )}
                                        </motion.div>
                                    )}
                                </AnimatePresence>

                                {/* Submit */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full h-13 flex items-center justify-center gap-2 text-[13px] btn-gold disabled:opacity-50 disabled:pointer-events-none"
                                    style={{marginTop: '8px'}}
                                >
                                    {isLoading ? (
                                        <div
                                            className="w-4 h-4 border-2 border-white/30 border-t-white animate-spin"
                                            style={{borderRadius: 0}}
                                        />
                                    ) : isMagicLink ? (
                                        <><Zap className="w-4 h-4"/> Send Magic Link</>
                                    ) : isRegister ? (
                                        <><Crown className="w-4 h-4"/> Create Account</>
                                    ) : (
                                        <><ArrowRight className="w-4 h-4"/> Sign In</>
                                    )}
                                </button>
                            </form>

                            {/* Toggle mode */}
                            <div className="mt-6 text-center">
                                <button
                                    onClick={() => {
                                        setIsRegister(!isRegister);
                                        setIsMagicLink(false);
                                    }}
                                    className="text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {isRegister
                                        ? 'Already have an account? Sign in →'
                                        : "Don't have an account? Join us →"}
                                </button>
                            </div>

                            {/* Skip Button */}
                            <div className="mt-4 text-center">
                                <button
                                    onClick={handleSkipAuth}
                                    className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors flex items-center gap-1 mx-auto"
                                    disabled={isLoading}
                                >
                                    <SkipForward className="w-3 h-3" />
                                    Skip for now
                                </button>
                            </div>

                            {/* Register trust note */}
                            {isRegister && (
                                <p className="mt-4 text-center text-[10px] text-muted-foreground leading-relaxed">
                                    By creating an account you agree to our{' '}
                                    <Link to="/terms-of-service"
                                          className="hover:text-foreground transition-colors underline underline-offset-2">Terms</Link>
                                    {' '}and{' '}
                                    <Link to="/privacy-policy"
                                          className="hover:text-foreground transition-colors underline underline-offset-2">Privacy
                                        Policy</Link>.
                                    Platform is for adults 18+ only.
                                </p>
                            )}
                        </motion.div>
                    </div>
                </div>

                {/* Bottom footer strip */}
                <div
                    className="px-6 py-4 flex items-center justify-center gap-6"
                    style={{borderTop: '1px solid hsl(var(--border))'}}
                >
                    {[
                        {icon: Lock, label: 'Encrypted'},
                        {icon: Shield, label: 'GDPR'},
                        {icon: BadgeCheck, label: '18+ Only'},
                    ].map(({icon: Icon, label}) => (
                        <div key={label} className="flex items-center gap-1.5">
                            <Icon
                                className="w-3 h-3"
                                style={{color: 'hsl(var(--muted-foreground))'}}
                                strokeWidth={1.5}
                            />
                            <span className="text-[10px] font-semibold text-muted-foreground">{label}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ConnectPage;
