import {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight, CheckCircle2, ChevronLeft, Crown, Eye, EyeOff, Lock, Mail, User, AlertCircle} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useAuth} from '@/hooks/useAuth';
import {useToast} from '@/hooks/use-toast';

export default function SignUp() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {signUp, isLoading, error, clearError, isInitialized} = useAuth();

    const [displayName, setDisplayName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    // Clear auth errors when user changes input
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [displayName, email, password, error, clearError]);

    const handleSignUp = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!displayName || !email || !password) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all fields.',
                variant: 'destructive'
            });
            return;
        }

        if (password.length < 8) {
            toast({
                title: 'Password too short',
                description: 'At least 8 characters required.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const {error} = await signUp(email, password, displayName);

            if (error) {
                // Error is already handled by the auth hook
                return;
            }

            setSent(true);
        } catch (err) {
            toast({
                title: 'Sign up failed',
                description: 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Don't render until auth is initialized
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    /* ── Email sent confirmation ── */
    if (sent) return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative"
            style={{background: 'hsl(var(--background))'}}
        >
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] blur-[160px]"
                    style={{background: 'hsl(var(--primary)/0.06)'}}/>
            </div>
            <motion.div
                initial={{opacity: 0, scale: 0.92, y: 20}}
                animate={{opacity: 1, scale: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="text-center space-y-5 max-w-sm relative z-10"
            >
                <motion.div
                    initial={{scale: 0}}
                    animate={{scale: 1}}
                    transition={{delay: 0.15, type: 'spring', stiffness: 260, damping: 20}}
                    className="w-20 h-20 flex items-center justify-center mx-auto"
                    style={{background: 'hsl(var(--primary))', boxShadow: '0 0 60px hsl(var(--primary)/0.45)'}}
                >
                    <CheckCircle2 className="w-10 h-10 text-white"/>
                </motion.div>
                <div>
                    <h2 className="text-[26px] font-black tracking-tight leading-none mb-2">Check Your Email</h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                        We sent a confirmation link to{' '}
                        <strong className="text-foreground font-bold">{email}</strong>.
                        Click it to activate your account and claim your throne.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/connect')}
                    className="w-full h-12 border border-border/30 bg-surface-1 hover:bg-surface-2 transition-colors text-[13px] font-bold flex items-center justify-center gap-2"
                >
                    <ChevronLeft className="w-4 h-4"/>
                    Back to Sign In
                </button>
                <p className="text-[10px] text-muted-foreground/30 font-bold uppercase tracking-widest">
                    Didn't receive it? Check your spam folder.
                </p>
            </motion.div>
        </div>
    );

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* Ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[140px]"
                    style={{background: 'hsl(var(--primary)/0.07)'}}
                />
                <div
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            <motion.div
                initial={{opacity: 0, y: 28}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="w-full max-w-sm relative z-10"
            >
                {/* Branding */}
                <div className="text-center mb-9">
                    <motion.div
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{delay: 0.1, type: 'spring', stiffness: 300}}
                        className="inline-flex items-center justify-center w-14 h-14 mb-5"
                        style={{
                            background: 'hsl(var(--primary))',
                            boxShadow: '0 0 40px hsl(var(--primary)/0.5), 0 0 80px hsl(var(--primary)/0.2)',
                        }}
                    >
                        <Crown className="w-7 h-7 text-white"/>
                    </motion.div>
                    <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.18}}>
                        <p className="eyebrow mb-1.5" style={{color: 'hsl(var(--primary))'}}>FIND YOUR KING</p>
                        <h1 className="text-[28px] font-black tracking-tight leading-none">Create Account</h1>
                        <p className="text-[13px] text-muted-foreground mt-2">Join 520,000+ kings worldwide</p>
                    </motion.div>
                </div>

                {/* Error Alert */}
                {error && (
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        className="mb-6"
                    >
                        <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertDescription>
                                {error.message.includes('User already registered')
                                    ? 'An account with this email already exists. Try signing in instead.'
                                    : error.message
                                }
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                <motion.form
                    initial={{opacity: 0, y: 16}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.22}}
                    onSubmit={handleSignUp}
                    className="space-y-4"
                >
                    {/* Display Name */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Display
                            Name</Label>
                        <div className="relative">
                            <User
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                value={displayName}
                                onChange={(e) => setDisplayName(e.target.value)}
                                placeholder="Your name"
                                className="pl-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                data-testid="input-display-name"
                                disabled={isLoading || isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label
                            className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Email</Label>
                        <div className="relative">
                            <Mail
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                className="pl-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                autoComplete="email"
                                data-testid="input-email"
                                disabled={isLoading || isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Password */}
                    <div className="space-y-1.5">
                        <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                            Password
                            <span
                                className="text-muted-foreground/40 ml-1 normal-case font-normal">(min. 8 characters)</span>
                        </Label>
                        <div className="relative">
                            <Lock
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                type={showPw ? 'text' : 'password'}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="pl-10 pr-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                required
                                data-testid="input-password"
                                disabled={isLoading || isSubmitting}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPw(!showPw)}
                                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                                disabled={isLoading || isSubmitting}
                            >
                                {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                            </button>
                        </div>
                    </div>

                    {/* Terms */}
                    <p className="text-[11px] text-muted-foreground/50 leading-relaxed">
                        By creating an account you agree to our{' '}
                        <Link to="/legal/terms"
                              className="underline text-muted-foreground hover:text-foreground transition-colors">Terms</Link>{' '}
                        and{' '}
                        <Link to="/legal/privacy"
                              className="underline text-muted-foreground hover:text-foreground transition-colors">Privacy
                            Policy</Link>.
                        {' '}You must be 18+ to use this platform.
                    </p>

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-13 text-[13px] font-black tracking-wider"
                        style={{
                            background: 'hsl(var(--primary))',
                            color: '#fff',
                            boxShadow: '0 8px 32px hsl(var(--primary)/0.35)'
                        }}
                        disabled={isLoading || isSubmitting}
                        data-testid="button-submit"
                    >
                        {(isLoading || isSubmitting) ? (
                            <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"/>
                        ) : (
                            <><ArrowRight className="w-4 h-4 mr-2"/> Create Account</>
                        )}
                    </Button>
                </motion.form>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[13px] text-muted-foreground">
                        Already a member?{' '}
                        <Link
                            to="/connect"
                            className="font-black transition-colors"
                            style={{color: 'hsl(var(--primary))'}}
                        >
                            Sign In
                        </Link>
                    </p>
                </div>

                {/* Trust signals */}
                <div className="mt-8 flex items-center justify-center gap-5">
                    {['Free to join', 'Verified profiles', 'Privacy first'].map((f) => (
                        <span key={f}
                              className="text-[9px] font-bold text-muted-foreground/30 uppercase tracking-widest">
              {f}
            </span>
                    ))}
                </div>
            </motion.div>
        </div>
    );
}
