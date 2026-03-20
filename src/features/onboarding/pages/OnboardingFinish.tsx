import {useEffect} from 'react';
import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Sparkles} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/hooks/useAuth';

export default function OnboardingFinish() {
    const navigate = useNavigate();
    const {user} = useAuth();

    useEffect(() => {
        // Mark onboarding done in localStorage until DB migration adds the column
        localStorage.setItem('onboarding_completed', 'true');
        localStorage.setItem('onboarding_step', '10');
        // Also try to persist in profile if columns exist
        if (user) {
            supabase.from('profiles').update({display_name: undefined} as never).eq('user_id', user.id).then(() => {
            });
        }
    }, [user]);

    return (
        <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
            <motion.div initial={{opacity: 0, scale: 0.8}} animate={{opacity: 1, scale: 1}}
                        transition={{type: 'spring', bounce: 0.4}} className="space-y-6">
                <div
                    className="w-24 h-24 rounded-3xl gradient-primary flex items-center justify-center mx-auto shadow-[0_0_48px_hsl(var(--primary)/0.5)]">
                    <Sparkles className="w-12 h-12 text-primary-foreground"/>
                </div>
                <div>
                    <h1 className="text-3xl font-bold">You're in!</h1>
                    <p className="text-muted-foreground mt-2">Welcome to FindYourKing. Start exploring.</p>
                </div>
                <Button size="lg"
                        className="gradient-primary h-14 px-12 shadow-[0_8px_32px_hsl(var(--primary)/0.35)] text-base"
                        onClick={() => navigate('/app/grid')}>
                    Explore the Grid
                </Button>
            </motion.div>
        </div>
    );
}
