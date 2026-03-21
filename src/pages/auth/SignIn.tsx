import {useState, useEffect} from 'react';
import {Link, useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight, ChevronRight, Crown, Eye, EyeOff, Lock, Mail, AlertCircle, SkipForward} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useAuth} from '@/hooks/useAuth';
import {useToast} from '@/hooks/use-toast';
import {AuthErrorCode} from '@/integrations/supabase/client';

export default function SignIn() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const {signIn, isLoading, error, errorCode, clearError, isInitialized} = useAuth();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Clear auth errors when user changes input
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [email, password, error, clearError]);

    const handleSignIn = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email || !password) {
            toast({
                title: 'Missing fields',
                description: 'Please fill in all fields.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const {error} = await signIn(email, password);

            if (error) {
                // Error is already handled by the auth hook
                return;
            }

            toast({
                title: 'Welcome back!',
                description: 'Successfully signed in.',
            });

            navigate('/app/grid');
        } catch (err) {
            toast({
                title: 'Sign in failed',
                description: 'An unexpected error occurred.',
                variant: 'destructive'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSkipAuth = () => {
        toast({
            title: 'Skipped Authentication',
            description: 'Continuing without sign in.',
        });
        navigate('/app/grid');
    };

    // Don't render until auth is initialized
    if (!isInitialized) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin" />
            </div>
        );
    }

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* Obsidian ambient glow */}
            <div className="fixed inset-0 pointer-events-none">
                <div
                    className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[140px]"
                    style={{background: 'hsl(var(--primary)/0.07)'}}
                />
                <div
                    className="absolute bottom-0 right-0 w-[300px] h-[300px] blur-[120px]"
                    style={{background: 'hsl(var(--gold)/0.04)'}}
                />
                {/* Grid texture */}
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
                <div className="text-center mb-10">
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
                        <h1 className="text-[28px] font-black tracking-tight leading-none">
                            Sign In
                        </h1>
                        <p className="text-[13px] text-muted-foreground mt-2">Access your royal account</p>
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
                                {errorCode === AuthErrorCode.INVALID_CREDENTIALS
                                    ? 'Invalid email or password. Please try again.'
                                    : errorCode === AuthErrorCode.RATE_LIMITED
                                    ? 'Too many attempts. Please wait a moment and try again.'
                                    : errorCode === AuthErrorCode.EMAIL_NOT_CONFIRMED
                                    ? 'Please confirm your email before signing in.'
                                    : errorCode === AuthErrorCode.NETWORK_ERROR
                                    ? 'Network error. Please check your connection and try again.'
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
                    onSubmit={handleSignIn}
                    className="space-y-4"
                >
                    {/* Email */}
                    <div className="space-y-1.5">
                        <Label
                            className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Email</Label>
                        <div className="relative">
                            <Mail
                                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                            <Input
                                type="email" autoComplete="email" autoCapitalize="none" autoCorrect="off" spellCheck={false}
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
                        <div className="flex items-center justify-between">
                            <Label
                                className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">Password</Label>
                            <Link
                                to="/auth/reset-password"
                                className="text-[11px] font-semibold transition-colors"
                                style={{color: 'hsl(var(--primary))'}}
                            >
                                Forgot?
                            </Link>
                        </div>
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
                                autoComplete="current-password"
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

                    {/* Submit */}
                    <Button
                        type="submit"
                        size="lg"
                        className="w-full h-13 text-[13px] font-black tracking-wider mt-2"
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
                            <><ArrowRight className="w-4 h-4 mr-2"/> Sign In</>
                        )}
                    </Button>
                </motion.form>

                {/* Divider */}
                <div className="flex items-center gap-3 my-6">
                    <div className="flex-1 h-px bg-border/20"/>
                    <span className="text-[10px] font-bold text-muted-foreground/40 uppercase tracking-widest">OR</span>
                    <div className="flex-1 h-px bg-border/20"/>
                </div>

                {/* Magic link */}
                <Link to="/auth/magic-link">
                    <button
                        type="button"
                        className="w-full h-11 flex items-center justify-center gap-2 border border-border/30 bg-surface-1 hover:bg-surface-2 transition-colors text-[13px] font-semibold"
                        data-testid="button-magic-link"
                        disabled={isLoading || isSubmitting}
                    >
                        <Mail className="w-4 h-4 text-muted-foreground/60"/>
                        Sign in with Magic Link
                    </button>
                </Link>

                {/* Footer */}
                <div className="mt-8 text-center">
                    <p className="text-[13px] text-muted-foreground">
                        Don't have an account?{' '}
                        <Link
                            to="/auth/sign-up"
                            className="font-black transition-colors"
                            style={{color: 'hsl(var(--primary))'}}
                        >
                            Create Account <ChevronRight className="inline w-3 h-3"/>
                        </Link>
                    </p>
                </div>

                {/* Skip Button */}
                <div className="mt-6 text-center">
                    <Button
                        variant="ghost"
                        size="sm"
                        onClick={handleSkipAuth}
                        className="text-[11px] text-muted-foreground/60 hover:text-muted-foreground transition-colors"
                        disabled={isLoading || isSubmitting}
                    >
                        <SkipForward className="w-3 h-3 mr-1" />
                        Skip for now
                    </Button>
                </div>

                {/* Trust signals */}
                <div className="mt-8 flex items-center justify-center gap-5">
                    {['Verified members', 'Privacy first', '18+ only'].map((f) => (
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
