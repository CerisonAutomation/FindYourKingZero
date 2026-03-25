import {useEffect, useState} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight, ChevronRight, Crown, Eye, EyeOff, Lock, Mail, AlertCircle, Shield, Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useAuth} from '@/hooks/useAuth';
import {useToast} from '@/hooks/use-toast';
import {AuthErrorCode} from '@/integrations/supabase/client';

const TRUST_SIGNALS = [
    {icon: Shield, label: 'Verified members'},
    {icon: Crown, label: 'Privacy first'},
    {icon: Sparkles, label: '18+ only'},
];

export default function SignIn() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {signIn, isLoading, error, errorCode, clearError, isInitialized} = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        if (error) clearError();
    }, [email, password, error, clearError]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({title: 'Missing fields', description: 'Please fill in all fields.', variant: 'destructive'});
            return;
        }
        setIsSubmitting(true);
        try {
            const {error} = await signIn(email, password);
            if (!error) {
                toast({title: 'Welcome back!', description: 'Signed in successfully.'});
                navigate('/app/grid');
            }
        } catch {
            toast({title: 'Sign in failed', description: 'An unexpected error occurred.', variant: 'destructive'});
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{background: 'hsl(var(--background))'}}>
                <div className="relative w-8 h-8">
                    <svg className="w-full h-full animate-spin" viewBox="0 0 32 32" fill="none">
                        <circle cx="16" cy="16" r="13" stroke="hsl(var(--primary)/0.15)" strokeWidth="2.5"/>
                        <path d="M16 3 A13 13 0 0 1 29 16" stroke="hsl(var(--primary))" strokeWidth="2.5" strokeLinecap="round"/>
                    </svg>
                </div>
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* ── Ambient glows ── */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[500px] blur-[160px]"
                    style={{background: 'hsl(42 98% 56% / 0.055)'}}
                />
                <div
                    className="absolute bottom-0 left-0 w-[350px] h-[350px] blur-[130px]"
                    style={{background: 'hsl(214 85% 55% / 0.04)'}}
                />
                {/* Subtle dot-grid texture */}
                <div
                    className="absolute inset-0 opacity-[0.018]"
                    style={{
                        backgroundImage: 'radial-gradient(hsl(0 0% 100%) 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
            </div>

            <motion.div
                initial={{opacity: 0, y: 32}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="w-full max-w-[360px] relative z-10"
            >
                {/* ── Branding ── */}
                <div className="text-center mb-10">
                    <motion.div
                        initial={{scale: 0.75, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{delay: 0.08, type: 'spring', stiffness: 280, damping: 22}}
                        className="inline-flex items-center justify-center w-16 h-16 mb-5 relative"
                        style={{
                            background: 'var(--gradient-gold)',
                            borderRadius: 'var(--radius-md)',
                            boxShadow: '0 0 40px hsl(42 98% 56% / 0.45), 0 0 80px hsl(42 98% 56% / 0.18), inset 0 1px 0 hsl(0 0% 100% / 0.2)',
                        }}
                    >
                        <Crown className="w-8 h-8 text-white" strokeWidth={2.5}/>
                        {/* Inner glow */}
                        <div
                            className="absolute inset-0 rounded-[inherit]"
                            style={{
                                background: 'radial-gradient(ellipse at 40% 30%, hsl(0 0% 100% / 0.2), transparent 70%)',
                            }}
                        />
                    </motion.div>

                    <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.16}}>
                        <p
                            className="text-[10px] font-black uppercase tracking-[0.18em] mb-1.5"
                            style={{color: 'hsl(42 98% 56%)'}}
                        >
                            Find Your King
                        </p>
                        <h1 className="text-[32px] font-black tracking-[-0.02em] leading-none text-foreground">
                            Welcome back
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-2">
                            Sign in to your royal account
                        </p>
                    </motion.div>
                </div>

                {/* ── Error alert ── */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{opacity: 0, y: -10, height: 0}}
                            animate={{opacity: 1, y: 0, height: 'auto'}}
                            exit={{opacity: 0, y: -8, height: 0}}
                            className="mb-5 overflow-hidden"
                        >
                            <Alert variant="destructive">
                                <AlertCircle className="h-4 w-4"/>
                                <AlertDescription>
                                    {errorCode === AuthErrorCode.INVALID_CREDENTIALS
                                        ? 'Incorrect email or password.'
                                        : errorCode === AuthErrorCode.RATE_LIMITED
                                            ? 'Too many attempts. Please wait and try again.'
                                            : errorCode === AuthErrorCode.EMAIL_NOT_CONFIRMED
                                                ? 'Please confirm your email first.'
                                                : errorCode === AuthErrorCode.NETWORK_ERROR
                                                    ? 'Network error. Check your connection.'
                                                    : error.message}
                                </AlertDescription>
                            </Alert>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* ── Form ── */}
                <motion.form
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.22}}
                    onSubmit={handleSignIn}
                    className="space-y-4"
                >
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground/70">
                            Email
                        </Label>
                        <div className="relative">
                            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none"/>
                            <Input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="pl-10 h-12 bg-surface-1 border-border/30 focus:border-primary/40 text-[14px] transition-colors"
                                required
                                autoComplete="email"
                                data-testid="input-email"
                                disabled={isLoading || isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-[10.5px] font-black uppercase tracking-wider text-muted-foreground/70">
                                Password
                            </Label>
                            <Link
                                to="/auth/reset-password"
                                className="text-[11px] font-semibold transition-colors hover:opacity-80"
                                style={{color: 'hsl(var(--primary))'}}
                            >
                                Forgot?
                            </Link>
                        </div>
                        <div className="relative">
                            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/40 pointer-events-none"/>
                            <Input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12 bg-surface-1 border-border/30 focus:border-primary/40 text-[14px] transition-colors"
                                required
                                autoComplete="current-password"
                                data-testid="input-password"
                                disabled={isLoading || isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(s => !s)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/40 hover:text-muted-foreground transition-colors"
                                tabIndex={-1}
                                disabled={isLoading || isSubmitting}
                            >
                                {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                        </div>
                    </div>

                    {/* Submit */}
                    <motion.div whileTap={{scale: 0.985}}>
                        <Button
                            type="submit"
                            size="lg"
                            className="w-full h-12 text-[13px] font-black tracking-wider mt-1"
                            style={{
                                background: 'var(--gradient-gold)',
                                color: '#fff',
                                boxShadow: '0 8px 32px hsl(42 98% 56% / 0.35), 0 2px 8px hsl(0 0% 0% / 0.25)',
                                border: 'none',
                            }}
                            disabled={isLoading || isSubmitting}
                            data-testid="button-submit"
                        >
                            {(isLoading || isSubmitting) ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin rounded-full"/>
                            ) : (
                                <>
                                    <ArrowRight className="w-4 h-4 mr-2"/>
                                    Sign In
                                </>
                            )}
                        </Button>
                    </motion.div>
                </motion.form>

                {/* ── Divider ── */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border/20"/>
                    <span className="text-[9.5px] font-bold text-muted-foreground/35 uppercase tracking-widest">or</span>
                    <div className="flex-1 h-px bg-border/20"/>
                </div>

                {/* ── Magic link ── */}
                <Link to="/auth/magic-link">
                    <motion.button
                        type="button"
                        whileTap={{scale: 0.98}}
                        className="w-full h-11 flex items-center justify-center gap-2 text-[13px] font-semibold transition-all"
                        style={{
                            background: 'hsl(var(--surface-1))',
                            border: '1px solid hsl(var(--border) / 0.3)',
                            borderRadius: 'var(--radius-sm)',
                            color: 'hsl(var(--foreground) / 0.8)',
                        }}
                        data-testid="button-magic-link"
                    >
                        <Mail className="w-4 h-4 text-muted-foreground/50"/>
                        Sign in with Magic Link
                    </motion.button>
                </Link>

                {/* ── Footer ── */}
                <div className="mt-8 text-center">
                    <p className="text-[13px] text-muted-foreground">
                        No account?{' '}
                        <Link
                            to="/auth/sign-up"
                            className="font-black transition-colors hover:opacity-80"
                            style={{color: 'hsl(var(--primary))'}}
                        >
                            Create one <ChevronRight className="inline w-3 h-3"/>
                        </Link>
                    </p>
                </div>

                {/* ── Trust signals ── */}
                <div className="mt-8 flex items-center justify-center gap-6">
                    {TRUST_SIGNALS.map(({icon: Icon, label}) => (
                        <div key={label} className="flex flex-col items-center gap-1">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground/30" strokeWidth={1.5}/>
                            <span className="text-[8.5px] font-bold text-muted-foreground/30 uppercase tracking-widest text-center">
                                {label}
                            </span>
                        </div>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
