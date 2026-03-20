import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {ArrowRight, Check, Eye, EyeOff, Lock} from 'lucide-react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {supabase} from '@/integrations/supabase/client';
import {useToast} from '@/hooks/use-toast';

export default function ResetPassword() {
    const navigate = useNavigate();
    const {toast} = useToast();
    const [password, setPassword] = useState('');
    const [confirm, setConfirm] = useState('');
    const [showPw, setShowPw] = useState(false);
    const [loading, setLoading] = useState(false);
    const [done, setDone] = useState(false);
    const [isRecovery, setIsRecovery] = useState(false);

    useEffect(() => {
        const hash = window.location.hash;
        if (hash.includes('type=recovery')) setIsRecovery(true);
        const {data: {subscription}} = supabase.auth.onAuthStateChange((event) => {
            if (event === 'PASSWORD_RECOVERY') setIsRecovery(true);
        });
        return () => subscription.unsubscribe();
    }, []);

    const handleReset = async (e: React.FormEvent) => {
        e.preventDefault();
        if (password !== confirm) {
            toast({title: 'Passwords do not match', variant: 'destructive'});
            return;
        }
        if (password.length < 8) {
            toast({title: 'Password too short', description: 'At least 8 characters.', variant: 'destructive'});
            return;
        }
        setLoading(true);
        const {error} = await supabase.auth.updateUser({password});
        setLoading(false);
        if (error) {
            toast({title: 'Error', description: error.message, variant: 'destructive'});
        } else {
            setDone(true);
            setTimeout(() => navigate('/app/grid'), 2000);
        }
    };

    /* ── Invalid link ── */
    if (!isRecovery) return (
        <div
            className="min-h-screen flex items-center justify-center p-6"
            style={{background: 'hsl(var(--background))'}}
        >
            <div className="text-center space-y-5 max-w-sm">
                <div
                    className="w-16 h-16 flex items-center justify-center mx-auto"
                    style={{background: 'hsl(var(--destructive)/0.1)', border: '1px solid hsl(var(--destructive)/0.2)'}}
                >
                    <Lock className="w-8 h-8 text-destructive"/>
                </div>
                <div>
                    <h2 className="text-[20px] font-black tracking-tight mb-1">Invalid Reset Link</h2>
                    <p className="text-[13px] text-muted-foreground leading-relaxed">
                        This link may have expired. Request a new password reset from the sign in page.
                    </p>
                </div>
                <button
                    onClick={() => navigate('/connect')}
                    className="w-full h-12 flex items-center justify-center gap-2 text-[13px] font-bold text-white"
                    style={{background: 'hsl(var(--primary))'}}
                >
                    Go to Sign In
                </button>
            </div>
        </div>
    );

    return (
        <div
            className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] blur-[140px]"
                     style={{background: 'hsl(var(--primary)/0.07)'}}/>
            </div>

            <motion.div
                initial={{opacity: 0, y: 24}}
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
                            background: done ? 'hsl(142 72% 46%)' : 'hsl(var(--primary))',
                            boxShadow: done
                                ? '0 0 40px hsl(142 72% 46% / 0.5)'
                                : '0 0 40px hsl(var(--primary)/0.5)',
                        }}
                    >
                        {done ? <Check className="w-7 h-7 text-white" strokeWidth={3}/> :
                            <Lock className="w-7 h-7 text-white"/>}
                    </motion.div>
                    <p className="eyebrow mb-1.5" style={{color: done ? 'hsl(142 72% 46%)' : 'hsl(var(--primary))'}}>
                        {done ? 'SUCCESS' : 'SECURITY'}
                    </p>
                    <h1 className="text-[28px] font-black tracking-tight leading-none">
                        {done ? 'Password Updated' : 'Set New Password'}
                    </h1>
                    {done && (
                        <p className="text-[13px] text-muted-foreground mt-2">Redirecting you to the app…</p>
                    )}
                </div>

                {!done && (
                    <form onSubmit={handleReset} className="space-y-4">
                        {[
                            {label: 'New Password', id: 'new-password', value: password, set: setPassword},
                            {label: 'Confirm Password', id: 'confirm-password', value: confirm, set: setConfirm},
                        ].map(({label, id, value, set}) => (
                            <div key={label} className="space-y-1.5">
                                <Label
                                    className="text-[11px] font-black uppercase tracking-wider text-muted-foreground">
                                    {label}
                                </Label>
                                <div className="relative">
                                    <Lock
                                        className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground/50"/>
                                    <Input
                                        type={showPw ? 'text' : 'password'}
                                        value={value}
                                        onChange={(e) => set(e.target.value)}
                                        placeholder="••••••••"
                                        className="pl-10 pr-10 h-12 bg-surface-1 border-border/30 focus:border-primary/50 text-[14px]"
                                        required
                                        data-testid={`input-${id}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPw(!showPw)}
                                        className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
                                    >
                                        {showPw ? <EyeOff className="w-4 h-4"/> : <Eye className="w-4 h-4"/>}
                                    </button>
                                </div>
                            </div>
                        ))}

                        <div className="pt-1">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full h-12 flex items-center justify-center gap-2 text-[13px] font-black text-white transition-opacity active:opacity-90 disabled:opacity-50"
                                style={{
                                    background: 'hsl(var(--primary))',
                                    boxShadow: '0 6px 24px hsl(var(--primary)/0.35)'
                                }}
                                data-testid="button-update-password"
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white animate-spin"/>
                                ) : (
                                    <><ArrowRight className="w-4 h-4"/> Update Password</>
                                )}
                            </button>
                        </div>
                    </form>
                )}
            </motion.div>
        </div>
    );
}
