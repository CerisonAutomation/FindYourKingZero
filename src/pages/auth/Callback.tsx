// =============================================================================
// Callback.tsx v2.0 — PKCE-first auth callback handler
// Fixes: old code called getSession() before exchangeCodeForSession (wrong order for PKCE)
// Handles: email confirmation, OAuth, magic link — all via code exchange
// =============================================================================
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Crown, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { supabase, supabaseAuth } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function Callback() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');

  useEffect(() => {
    let cancelled = false;

    const handleCallback = async () => {
      try {
        const code = searchParams.get('code');
        const urlError = searchParams.get('error');
        const errorDescription = searchParams.get('error_description');

        // ── 1. Handle OAuth/OTP errors in URL ──────────────────────────────
        if (urlError) {
          if (cancelled) return;
          setStatus('error');
          setMessage(errorDescription || urlError);
          toast({
            title: 'Authentication error',
            description: errorDescription || urlError,
            variant: 'destructive',
          });
          setTimeout(() => {
            if (!cancelled) navigate('/connect', { replace: true });
          }, 3000);
          return;
        }

        // ── 2. PKCE: exchange code for session first ──────────────────────
        if (code) {
          const { session: exchangedSession, error: exchangeError } =
            await supabaseAuth.exchangeCodeForSession(code);

          if (cancelled) return;

          if (exchangeError) {
            console.error('Code exchange error:', exchangeError);
            setStatus('error');
            setMessage(exchangeError.message);
            toast({
              title: 'Authentication failed',
              description: exchangeError.message,
              variant: 'destructive',
            });
            setTimeout(() => {
              if (!cancelled) navigate('/connect', { replace: true });
            }, 3000);
            return;
          }

          if (exchangedSession) {
            // Ensure profile exists for this user
            await supabaseAuth.ensureProfile(exchangedSession.user);

            if (cancelled) return;
            setStatus('success');

            const isEmailConfirmation = !exchangedSession.user.app_metadata?.provider ||
              exchangedSession.user.app_metadata?.provider === 'email';

            setMessage(isEmailConfirmation ? 'Email confirmed successfully!' : 'Successfully signed in!');

            toast({
              title: isEmailConfirmation ? 'Email confirmed!' : 'Welcome back!',
              description: isEmailConfirmation
                ? 'Your account has been activated.'
                : 'You have been successfully authenticated.',
            });

            // Check if user has completed onboarding
            const { data: profile } = await supabase
              .from('profiles')
              .select('onboarding_completed')
              .eq('user_id', exchangedSession.user.id)
              .single();

            setTimeout(() => {
              if (cancelled) return;
              if (profile?.onboarding_completed) {
                navigate('/app/grid', { replace: true });
              } else {
                navigate('/onboarding', { replace: true });
              }
            }, 1500);
            return;
          }
        }

        // ── 3. Fallback: check for existing session (e.g. page refresh) ───
        const { session: existingSession, error: sessionError } = await supabaseAuth.getSession();

        if (cancelled) return;

        if (sessionError) {
          console.error('Session error:', sessionError);
          setStatus('error');
          setMessage(sessionError.message);
          toast({
            title: 'Authentication failed',
            description: sessionError.message,
            variant: 'destructive',
          });
          setTimeout(() => {
            if (!cancelled) navigate('/connect', { replace: true });
          }, 3000);
          return;
        }

        if (existingSession) {
          setStatus('success');
          setMessage('Successfully signed in!');
          toast({
            title: 'Welcome back!',
            description: 'You have been successfully authenticated.',
          });

          const { data: profile } = await supabase
            .from('profiles')
            .select('onboarding_completed')
            .eq('user_id', existingSession.user.id)
            .single();

          setTimeout(() => {
            if (cancelled) return;
            if (profile?.onboarding_completed) {
              navigate('/app/grid', { replace: true });
            } else {
              navigate('/onboarding', { replace: true });
            }
          }, 1500);
          return;
        }

        // ── 4. No session, no code — unexpected ───────────────────────────
        setStatus('error');
        setMessage('No authentication data found. Please try signing in again.');
        setTimeout(() => {
          if (!cancelled) navigate('/connect', { replace: true });
        }, 3000);
      } catch (err) {
        if (cancelled) return;
        console.error('Callback handling error:', err);
        setStatus('error');
        setMessage('An unexpected error occurred');
        toast({
          title: 'Authentication error',
          description: 'An unexpected error occurred during sign in.',
          variant: 'destructive',
        });
        setTimeout(() => {
          if (!cancelled) navigate('/connect', { replace: true });
        }, 3000);
      }
    };

    handleCallback();

    return () => {
      cancelled = true;
    };
  }, [navigate, searchParams, toast]);

  return (
    <div
      className="min-h-screen flex items-center justify-center p-6 relative overflow-hidden"
      style={{ background: 'hsl(var(--background))' }}
    >
      {/* Ambient glow */}
      <div className="fixed inset-0 pointer-events-none">
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] blur-[140px]"
          style={{ background: 'hsl(var(--primary)/0.07)' }}
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
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="text-center space-y-6 max-w-sm relative z-10"
      >
        {/* Icon */}
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.15, type: 'spring', stiffness: 260, damping: 20 }}
          className="w-20 h-20 flex items-center justify-center mx-auto"
          style={{
            background: status === 'success'
              ? 'hsl(var(--primary)/0.1)'
              : status === 'error'
              ? 'hsl(var(--destructive)/0.1)'
              : 'hsl(var(--primary)/0.05)',
            border: status === 'success'
              ? '1px solid hsl(var(--primary)/0.2)'
              : status === 'error'
              ? '1px solid hsl(var(--destructive)/0.2)'
              : '1px solid hsl(var(--primary)/0.1)',
          }}
        >
          {status === 'loading' && (
            <Loader2 className="w-10 h-10 animate-spin" style={{ color: 'hsl(var(--primary))' }} />
          )}
          {status === 'success' && (
            <CheckCircle2 className="w-10 h-10" style={{ color: 'hsl(var(--primary))' }} />
          )}
          {status === 'error' && (
            <AlertCircle className="w-10 h-10" style={{ color: 'hsl(var(--destructive))' }} />
          )}
        </motion.div>

        {/* Branding */}
        <div>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.1, type: 'spring', stiffness: 300 }}
            className="inline-flex items-center justify-center w-12 h-12 mb-4 mx-auto"
            style={{
              background: 'hsl(var(--primary))',
              boxShadow: '0 0 40px hsl(var(--primary)/0.5)',
            }}
          >
            <Crown className="w-6 h-6 text-white" />
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}>
            <h2 className="text-[24px] font-black tracking-tight leading-none mb-2">
              {status === 'loading' && 'Authenticating...'}
              {status === 'success' && 'Welcome!'}
              {status === 'error' && 'Authentication Failed'}
            </h2>
            <p className="text-[13px] text-muted-foreground leading-relaxed">
              {status === 'loading' && 'Please wait while we verify your identity...'}
              {status === 'success' && message}
              {status === 'error' && message}
            </p>
          </motion.div>
        </div>

        {/* Loading indicator */}
        {status === 'loading' && (
          <div className="flex justify-center">
            <div className="w-8 h-8 border-2 border-primary/20 border-t-primary animate-spin" />
          </div>
        )}

        {/* Auto-redirect message */}
        {status !== 'loading' && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-[11px] text-muted-foreground/50"
          >
            Redirecting automatically...
          </motion.p>
        )}
      </motion.div>
    </div>
  );
}
