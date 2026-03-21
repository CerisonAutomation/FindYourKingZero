import {useState, useEffect} from 'react';
import {Link} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowLeft, CheckCircle2, Crown, Mail, AlertCircle} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Alert, AlertDescription} from '@/components/ui/alert';
import {useAuth} from '@/hooks/useAuth';
import {useToast} from '@/hooks/use-toast';

export default function MagicLink() {
    const {toast} = useToast();
    const {signInWithMagicLink, isLoading, error, clearError, isInitialized} = useAuth();

    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [sent, setSent] = useState(false);

    // Clear auth errors when user changes input
    useEffect(() => {
        if (error) {
            clearError();
        }
    }, [email, error, clearError]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email) {
            toast({
                title: 'Missing email',
                description: 'Please enter your email address.',
                variant: 'destructive'
            });
            return;
        }

        setIsSubmitting(true);

        try {
            const {error} = await signInWithMagicLink(email);

            if (error) {
                // Error is already handled by the auth hook
                return;
            }

            setSent(true);
            toast({
                title: 'Magic link sent!',
                description: 'Check your inbox for the sign-in link.',
            });
        } catch (err) {
            toast({
                title: 'Failed to send magic link',
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

    return (
        <div
            className="min-h-screen flex flex-col items-center justify-center p-6 relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] blur-[140px]"
                     style={{background: 'hsl(var(--primary)/0.07)'}}/>
                <div className="absolute inset-0 opacity-[0.015]"
                     style={{
                         backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
                         backgroundSize: '60px 60px',
                     }}
                />
            </div>

            <motion.div
                initial={{opacity: 0, y: 24}}
                animate={{opacity: 1, y: 0}}
                transition={{duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                className="w-full max-w-sm relative z-10"
            >
                {/* Back */}
                <Link
                    to="/connect"
                    className="flex items-center gap-2 text-[13px] text-muted-foreground/50 hover:text-muted-foreground transition-colors mb-8"
                >
                    <ArrowLeft className="w-4 h-4"/> Back to sign in
                </Link>

                {/* Branding */}
                <div className="text-center mb-9">
                    <motion.div
                        initial={{scale: 0.8, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        transition={{delay: 0.1, type: 'spring', stiffness: 300}}
                        className="inline-flex items-center justify-center w-14 h-14 mb-5"
                        style={{
                            background: 'hsl(var(--primary))',
                            boxShadow: '0 0 40px hsl(var(--primary)/0.5)',
                        }}
                    >
                        <Crown className="w-7 h-7 text-white"/>
                    </motion.div>
                    <p className="eyebrow mb-1.5" style={{color: 'hsl(var(--primary))'}}>PASSWORDLESS</p>
                    <h1 className="text-[28px] font-black tracking-tight leading-none">Magic Link</h1>
                    <p className="text-[13px] text-muted-foreground mt-2">Sign in without a password</p>
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
                                {error.message}
                            </AlertDescription>
                        </Alert>
                    </motion.div>
                )}

                {sent ? (
                    <motion.div
                        initial={{opacity: 0, scale: 0.95}}
                        animate={{opacity: 1, scale: 1}}
                        className="text-center space-y-5"
                    >
                        <div
                            className="w-20 h-20 flex items-center justify-center mx-auto"
                            style={{background: 'hsl(var(--primary)/0.1)', border: '1px solid hsl(var(--primary)/0.2)'}}
                        >
                            <CheckCircle2 className="w-10 h-10" style={{color: 'hsl(var(--primary))'}}/>
                        </div>
                        <div>
                            <p className="font-black text-[15px] mb-1">Link Sent</p>
                            <p className="text-[13px] text-muted-foreground leading-relaxed">
                                Magic link sent to <strong className="text-foreground font-bold">{email}</strong>.
                                Check your inbox.
                            </p>
                        </div>
                        <button
                            onClick={() => setSent(false)}
                            className="w-full h-11 border border-border/30 bg-surface-1 hover:bg-surface-2 transition-colors text-[13px] font-semibold"
                            data-testid="button-send-another"
                        >
                            Send another link
                        </button>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSend} className="space-y-5">
                        <div className="space-y-1.5">
                            <Label className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                Email Address
                            </Label>
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
                                    data-testid="input-email"
                                    disabled={isLoading || isSubmitting}
                                />
                            </div>
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading || isSubmitting}
                            className="w-full h-12 flex items-center justify-center gap-2 text-[13px] font-black text-white transition-opacity active:opacity-90 disabled:opacity-50"
                            style={{
                                background: 'hsl(var(--primary))',
                                boxShadow: '0 6px 24px hsl(var(--primary)/0.35)'
                            }}
                            data-testid="button-send-magic-link"
                        >
                            {(isLoading || isSubmitting) ? (
                                <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"/>
                            ) : (
                                <><Mail className="w-4 h-4"/> Send Magic Link</>
                            )}
                        </button>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
