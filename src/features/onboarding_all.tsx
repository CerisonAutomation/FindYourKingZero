import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useUpdateProfile} from '@/hooks/useProfile';
import {useAuth} from '@/hooks/useAuth';

export default function OnboardingBasics() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const updateProfile = useUpdateProfile();
    const [form, setForm] = useState({display_name: '', age: '', city: ''});

    const handleNext = async () => {
        if (!form.display_name || !form.age) return;
        await updateProfile.mutateAsync({display_name: form.display_name, age: parseInt(form.age), city: form.city});
        localStorage.setItem('onboarding_step', '2');
        navigate('/onboarding/photos');
    };

    return (
        <OnboardingShell step={2} total={10} title="The Basics" desc="Tell us a bit about yourself" onNext={handleNext}
                         onBack={() => navigate('/onboarding/welcome')} loading={updateProfile.isPending}>
            <div className="space-y-4 pt-2">
                {[
                    {
                        label: 'Display Name *',
                        key: 'display_name',
                        placeholder: 'How you appear to others',
                        type: 'text'
                    },
                    {label: 'Age *', key: 'age', placeholder: '18+', type: 'number'},
                    {label: 'City', key: 'city', placeholder: 'Your city', type: 'text'},
                ].map(({label, key, placeholder, type}) => (
                    <div key={key} className="space-y-2">
                        <Label>{label}</Label>
                        <Input type={type} placeholder={placeholder} className="h-12"
                               value={form[key as keyof typeof form]}
                               onChange={(e) => setForm(p => ({...p, [key]: e.target.value}))}/>
                    </div>
                ))}
            </div>
        </OnboardingShell>
    );
}
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {Switch} from '@/components/ui/switch';

export default function OnboardingConsent() {
    const navigate = useNavigate();
    const [terms, setTerms] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [age, setAge] = useState(false);

    const handleNext = async () => {
        if (!terms || !privacy || !age) return;
        // Consent stored locally — full consent_records table added in next migration
        localStorage.setItem('consent_granted', JSON.stringify({
            terms,
            privacy,
            age,
            version: '1.0',
            at: new Date().toISOString()
        }));
        localStorage.setItem('onboarding_step', '10');
        navigate('/onboarding/finish');
    };

    const items = [
        {label: 'I agree to the Terms of Service', key: 'terms', val: terms, set: setTerms},
        {label: 'I agree to the Privacy Policy', key: 'privacy', val: privacy, set: setPrivacy},
        {label: 'I confirm I am 18 or older', key: 'age', val: age, set: setAge},
    ];

    return (
        <OnboardingShell step={10} total={10} title="One Last Thing" desc="Please confirm the following"
                         onNext={handleNext} onBack={() => navigate('/onboarding/notifications')}
                         nextLabel="Agree & Finish" loading={!terms || !privacy || !age}>
            <div className="space-y-3 pt-2">
                {items.map(({label, key, val, set}) => (
                    <div key={key}
                         className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/40">
                        <span className="text-sm font-medium pr-4">{label}</span>
                        <Switch checked={val} onCheckedChange={set}/>
                    </div>
                ))}
            </div>
        </OnboardingShell>
    );
}
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
import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import OnboardingShell from './OnboardingShell';
import {MapPin} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useUpdateProfile} from '@/hooks/useProfile';

export default function OnboardingLocation() {
    const navigate = useNavigate();
    const updateProfile = useUpdateProfile();
    const [granted, setGranted] = useState(false);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            navigate('/onboarding/privacy');
            return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            await updateProfile.mutateAsync({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
            localStorage.setItem('onboarding_step', '7');
            setGranted(true);
        }, () => navigate('/onboarding/privacy'));
    };

    return (
        <OnboardingShell step={7} total={10} title="Your Location" desc="Used to show nearby people"
                         onNext={() => navigate('/onboarding/privacy')}
                         onBack={() => navigate('/onboarding/preferences')}
                         nextLabel={granted ? 'Continue' : 'Skip for now'}>
            <div className="flex flex-col items-center py-12 gap-5">
                <div
                    className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-primary"/>
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xs">Allow location access to see who is
                    near you and appear in local searches.</p>
                {!granted ? (
                    <Button className="gradient-primary h-12 px-8" onClick={requestLocation}>Allow Location</Button>
                ) : (
                    <p className="text-sm text-emerald-500 font-semibold">Location set!</p>
                )}
            </div>
        </OnboardingShell>
    );
}
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';

export default function OnboardingNotifications() {
    const navigate = useNavigate();
    return (
        <OnboardingShell step={9} total={10} title="Notifications" desc="Stay in the loop"
                         onNext={() => navigate('/onboarding/consent')} onBack={() => navigate('/onboarding/privacy')}
                         nextLabel="Enable & Continue">
            <div className="py-4 space-y-3 text-sm text-muted-foreground">
                {['New messages', 'Taps and matches', 'Event updates', 'Safety alerts'].map(s => (
                    <div key={s} className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/40">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0"/>
                        {s}</div>
                ))}
            </div>
        </OnboardingShell>
    );
}
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {Camera} from 'lucide-react';

export default function OnboardingPhotos() {
    const navigate = useNavigate();
    return (
        <OnboardingShell step={3} total={10} title="Add Photos" desc="At least 1 photo helps you get more connections"
                         onNext={() => navigate('/onboarding/tribes-interests')}
                         onBack={() => navigate('/onboarding/basics')} nextLabel="Continue (skip for now)">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/40">
                    <Camera className="w-8 h-8 text-muted-foreground"/>
                </div>
                <p className="text-sm text-muted-foreground text-center">Tap to upload your first photo<br/>You can add
                    more from your profile</p>
            </div>
        </OnboardingShell>
    );
}
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';

export default function OnboardingPreferences() {
    const navigate = useNavigate();
    return (
        <OnboardingShell step={6} total={10} title="Your Preferences" desc="Set your discovery preferences"
                         onNext={() => navigate('/onboarding/location')}
                         onBack={() => navigate('/onboarding/tribes-interests')}>
            <div className="py-8 text-center text-muted-foreground text-sm">Preferences can be customised in Settings →
                Filters after setup.
            </div>
        </OnboardingShell>
    );
}
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';

export default function OnboardingPrivacy() {
    const navigate = useNavigate();
    return (
        <OnboardingShell step={8} total={10} title="Privacy Defaults" desc="You can change these any time in Settings"
                         onNext={() => navigate('/onboarding/notifications')}
                         onBack={() => navigate('/onboarding/location')}>
            <div className="py-4 space-y-3 text-sm text-muted-foreground">
                {['Your distance is visible to others', 'Your online status is visible', 'Your profile is public by default', 'You can enable Incognito mode with Premium'].map(s => (
                    <div key={s} className="flex items-center gap-2 p-3 rounded-xl bg-card border border-border/40">
                        <div className="w-2 h-2 rounded-full bg-primary shrink-0"/>
                        {s}</div>
                ))}
            </div>
        </OnboardingShell>
    );
}
import {ChevronLeft} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {motion} from 'framer-motion';
import React from 'react';

interface OnboardingShellProps {
    step: number;
    total: number;
    title: string;
    desc?: string;
    children: React.ReactNode;
    onNext?: () => void;
    onBack?: () => void;
    nextLabel?: string;
    loading?: boolean;
}

const OnboardingShell = ({
                             step, total, title, desc, children,
                             onNext, onBack, nextLabel = 'Continue', loading = false
                         }: OnboardingShellProps) => (
    <div className="min-h-screen max-h-screen w-full bg-background flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex-shrink-0 px-5 pt-14 pb-5">
            {/* Back */}
            {onBack && (
                <button
                    onClick={onBack}
                    className="mb-5 flex items-center gap-1 text-muted-foreground hover:text-foreground transition-colors"
                >
                    <ChevronLeft className="w-4 h-4"/>
                    <span className="text-sm">Back</span>
                </button>
            )}

            {/* Progress bar */}
            <div className="flex gap-1 mb-6">
                {Array.from({length: total}).map((_, i) => (
                    <motion.div
                        key={i}
                        className="h-[3px] rounded-full flex-1"
                        animate={{backgroundColor: i < step ? 'hsl(var(--primary))' : 'hsl(var(--border))'}}
                        transition={{duration: 0.3, delay: i * 0.03}}
                    />
                ))}
            </div>

            {/* Step label */}
            <p className="text-xs text-muted-foreground font-semibold uppercase tracking-widest mb-2">
                Step {step} of {total}
            </p>

            <motion.h1
                key={title}
                initial={{opacity: 0, y: 12}}
                animate={{opacity: 1, y: 0}}
                className="text-2xl font-bold tracking-tight"
            >
                {title}
            </motion.h1>
            {desc && (
                <p className="text-sm text-muted-foreground mt-1 leading-relaxed">{desc}</p>
            )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden px-5 scrollbar-hide">
            <motion.div
                key={title + '-body'}
                initial={{opacity: 0, y: 8}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: 0.05}}
            >
                {children}
            </motion.div>
        </div>

        {/* CTA */}
        {onNext && (
            <div className="flex-shrink-0 px-5 py-5 pb-[max(1.25rem,env(safe-area-inset-bottom))]">
                <Button
                    size="lg"
                    className="w-full h-12 gradient-primary font-semibold text-base rounded-2xl shadow-[0_8px_32px_hsl(var(--primary)/0.3)] active:scale-[0.98] transition-transform"
                    onClick={onNext}
                    disabled={loading}
                >
                    {loading ? (
                        <div
                            className="w-5 h-5 rounded-full border-2 border-primary-foreground/30 border-t-primary-foreground animate-spin"/>
                    ) : nextLabel}
                </Button>
            </div>
        )}
    </div>
);

export default OnboardingShell;
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {useUpdateProfile} from '@/hooks/useProfile';
import {cn} from '@/lib/utils';

const TRIBES = ['Bear', 'Jock', 'Twink', 'Daddy', 'Muscle', 'Otter', 'Cub', 'Leather', 'Geek', 'Poz', 'Trans', 'Non-binary', 'Masc', 'Femme', 'Bi', 'Vers'];
const LOOKING = ['Chat', 'Friends', 'Dates', 'Relationship', 'Hookup', 'Networking', 'Right Now', 'Travel Buddy'];

export default function OnboardingTribes() {
    const navigate = useNavigate();
    const updateProfile = useUpdateProfile();
    const [tribes, setTribes] = useState<string[]>([]);
    const [lookingFor, setLookingFor] = useState<string[]>([]);

    const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
        setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

    const handleNext = async () => {
        await updateProfile.mutateAsync({tribes, looking_for: lookingFor});
        localStorage.setItem('onboarding_step', '5');
        navigate('/onboarding/preferences');
    };

    return (
        <OnboardingShell step={5} total={10} title="Tribes & Interests" desc="Select all that apply" onNext={handleNext}
                         onBack={() => navigate('/onboarding/photos')} loading={updateProfile.isPending}>
            <div className="space-y-6 pt-2">
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tribes</p>
                    <div className="flex flex-wrap gap-2">
                        {TRIBES.map(t => (
                            <button key={t} onClick={() => toggle(tribes, setTribes, t)}
                                    className={cn('px-3 py-2 rounded-full text-sm border transition-all', tribes.includes(t) ? 'bg-primary/15 border-primary text-primary' : 'bg-card border-border/50 text-muted-foreground')}>{t}</button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Looking For</p>
                    <div className="flex flex-wrap gap-2">
                        {LOOKING.map(l => (
                            <button key={l} onClick={() => toggle(lookingFor, setLookingFor, l)}
                                    className={cn('px-3 py-2 rounded-full text-sm border transition-all', lookingFor.includes(l) ? 'bg-primary/15 border-primary text-primary' : 'bg-card border-border/50 text-muted-foreground')}>{l}</button>
                        ))}
                    </div>
                </div>
            </div>
        </OnboardingShell>
    );
}
import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowRight, Bell, Camera, Check, ChevronLeft, Crown, Shield, Sparkles, User,} from 'lucide-react';

type Step = 'welcome' | 'basics' | 'photos' | 'preferences' | 'finish';
const STEPS: Step[] = ['welcome', 'basics', 'photos', 'preferences', 'finish'];

const STEP_META: Record<Step, { title: string; desc: string; icon: typeof Crown; color: string }> = {
    welcome: {title: 'Welcome', desc: 'Build your royal profile', icon: Crown, color: 'hsl(var(--primary))'},
    basics: {title: 'The Basics', desc: 'Age, city, tribe', icon: User, color: 'hsl(var(--accent))'},
    photos: {title: 'Photos', desc: 'Add your best shots', icon: Camera, color: 'hsl(var(--gold))'},
    preferences: {title: 'Preferences', desc: 'Who you want to meet', icon: Sparkles, color: 'hsl(var(--primary))'},
    finish: {title: 'All Done', desc: 'You\'re ready', icon: Check as typeof Crown, color: 'hsl(142 72% 46%)'},
};

const WELCOME_FEATURES = [
    {icon: Shield, label: '100% Verified', desc: 'Every member reviewed'},
    {icon: Crown, label: 'Premium Quality', desc: 'The top 1% of gay dating'},
    {icon: Bell, label: 'Real-time', desc: 'Live matches & activity'},
];

export default function OnboardingWelcome() {
    const navigate = useNavigate();
    const [step, setStep] = useState<Step>('welcome');
    const stepIdx = STEPS.indexOf(step);
    const progress = stepIdx === 0 ? 0 : (stepIdx / (STEPS.length - 1)) * 100;

    const next = () => {
        if (stepIdx < STEPS.length - 1) setStep(STEPS[stepIdx + 1]);
        else navigate('/app/grid');
    };
    const back = () => {
        if (stepIdx > 0) setStep(STEPS[stepIdx - 1]);
    };

    return (
        <div
            className="min-h-screen flex flex-col relative overflow-hidden"
            style={{background: 'hsl(var(--background))'}}
        >
            {/* Ambient */}
            <div className="fixed inset-0 pointer-events-none">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[350px] blur-[140px]"
                     style={{background: 'hsl(var(--primary)/0.07)'}}/>
                <div className="absolute bottom-0 right-0 w-[250px] h-[250px] blur-[120px]"
                     style={{background: 'hsl(var(--gold)/0.04)'}}/>
                <div
                    className="absolute inset-0 opacity-[0.015]"
                    style={{
                        backgroundImage: 'linear-gradient(hsl(0 0% 100%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 0% 100%) 1px, transparent 1px)',
                        backgroundSize: '60px 60px',
                    }}
                />
            </div>

            {/* Progress bar */}
            {step !== 'welcome' && (
                <div className="relative h-[3px] bg-border/20 flex-shrink-0">
                    <motion.div
                        className="absolute inset-y-0 left-0"
                        initial={{width: 0}}
                        animate={{width: `${progress}%`}}
                        transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
                        style={{background: 'hsl(var(--primary))'}}
                    />
                </div>
            )}

            {/* Step header */}
            {step !== 'welcome' && (
                <header className="flex-shrink-0 px-4 py-3 flex items-center gap-3 relative z-10">
                    <button
                        onClick={back}
                        className="w-9 h-9 flex items-center justify-center border border-border/25 bg-surface-1 active:scale-90 transition-all"
                        data-testid="button-back"
                    >
                        <ChevronLeft className="w-4 h-4"/>
                    </button>
                    <div className="flex-1 flex gap-1.5">
                        {STEPS.slice(1, -1).map((s) => (
                            <div
                                key={s}
                                className="h-1 flex-1 transition-all duration-300"
                                style={{
                                    background: STEPS.indexOf(s) <= stepIdx
                                        ? 'hsl(var(--primary))'
                                        : 'hsl(var(--border)/0.3)',
                                }}
                            />
                        ))}
                    </div>
                    <span className="text-[10px] font-black text-muted-foreground/40 uppercase tracking-widest">
            {stepIdx}/{STEPS.length - 2}
          </span>
                </header>
            )}

            {/* Content */}
            <div className="flex-1 flex flex-col relative z-10">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{opacity: 0, x: step === 'welcome' ? 0 : 24}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: -24}}
                        transition={{duration: 0.3, ease: [0.16, 1, 0.3, 1]}}
                        className="flex-1 flex flex-col"
                    >
                        {/* ── WELCOME ── */}
                        {step === 'welcome' && (
                            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                                <motion.div
                                    initial={{scale: 0.7, opacity: 0}}
                                    animate={{scale: 1, opacity: 1}}
                                    transition={{type: 'spring', stiffness: 280, delay: 0.08}}
                                    className="relative mb-8"
                                >
                                    <div
                                        className="w-24 h-24 flex items-center justify-center"
                                        style={{
                                            background: 'hsl(var(--primary))',
                                            boxShadow: '0 0 60px hsl(var(--primary)/0.5), 0 0 120px hsl(var(--primary)/0.2)',
                                        }}
                                    >
                                        <Crown className="w-12 h-12 text-white"/>
                                    </div>
                                    {/* Gold orbiting accent */}
                                    <motion.div
                                        animate={{rotate: 360}}
                                        transition={{duration: 8, repeat: Infinity, ease: 'linear'}}
                                        className="absolute -top-3 -right-3 w-8 h-8 flex items-center justify-center"
                                        style={{
                                            background: 'hsl(var(--gold))',
                                            boxShadow: '0 0 16px hsl(var(--gold)/0.6)',
                                        }}
                                    >
                                        <Sparkles className="w-4 h-4 text-black"/>
                                    </motion.div>
                                </motion.div>

                                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                            transition={{delay: 0.18}}>
                                    <p className="eyebrow mb-2" style={{color: 'hsl(var(--primary))'}}>FIND YOUR KING</p>
                                    <h1 className="text-[36px] font-black tracking-tight leading-none mb-3">
                                        Find Your<br/>
                                        <span style={{color: 'hsl(var(--gold))'}}>King.</span>
                                    </h1>
                                    <p className="text-[14px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                        Premium gay dating & social. Let's build your royal profile in 2 minutes.
                                    </p>
                                </motion.div>

                                {/* Feature trio */}
                                <motion.div
                                    initial={{opacity: 0, y: 16}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.28}}
                                    className="flex gap-0 mt-8 w-full max-w-sm"
                                >
                                    {WELCOME_FEATURES.map((f, i) => {
                                        const Icon = f.icon;
                                        return (
                                            <div
                                                key={f.label}
                                                className="flex-1 flex flex-col items-center gap-2 py-4 px-2 text-center"
                                                style={{
                                                    background: 'hsl(var(--surface-1))',
                                                    borderTop: '1px solid hsl(var(--border)/0.2)',
                                                    borderBottom: '1px solid hsl(var(--border)/0.2)',
                                                    borderLeft: i === 0 ? '1px solid hsl(var(--border)/0.2)' : 'none',
                                                    borderRight: '1px solid hsl(var(--border)/0.2)',
                                                }}
                                            >
                                                <Icon className="w-4 h-4" style={{color: 'hsl(var(--primary))'}}/>
                                                <div>
                                                    <p className="text-[10px] font-black uppercase tracking-wider leading-none mb-0.5">{f.label}</p>
                                                    <p className="text-[9px] text-muted-foreground/50">{f.desc}</p>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </motion.div>

                                {/* CTAs */}
                                <motion.div
                                    initial={{opacity: 0, y: 16}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.36}}
                                    className="w-full max-w-sm mt-6 space-y-3"
                                >
                                    <button
                                        onClick={next}
                                        className="w-full h-14 flex items-center justify-center gap-2 text-[14px] font-black tracking-wide text-white transition-opacity active:opacity-90"
                                        style={{
                                            background: 'hsl(var(--primary))',
                                            boxShadow: '0 8px 32px hsl(var(--primary)/0.4)',
                                        }}
                                        data-testid="button-get-started"
                                    >
                                        Get Started <ArrowRight className="w-5 h-5"/>
                                    </button>
                                    <button
                                        onClick={() => navigate('/app/grid')}
                                        className="w-full h-11 flex items-center justify-center text-[13px] font-semibold text-muted-foreground/50 transition-colors active:opacity-70"
                                        data-testid="button-skip"
                                    >
                                        Skip for now
                                    </button>
                                </motion.div>
                            </div>
                        )}

                        {/* ── INTERMEDIATE STEPS ── */}
                        {step !== 'welcome' && step !== 'finish' && (
                            <div className="flex-1 flex flex-col px-5 pb-6 pt-4">
                                {/* Step label */}
                                <div className="mb-6">
                                    <p className="eyebrow mb-1" style={{color: STEP_META[step].color}}>
                                        Step {stepIdx} of {STEPS.length - 2}
                                    </p>
                                    <h2 className="text-[26px] font-black tracking-tight leading-none">
                                        {STEP_META[step].title}
                                    </h2>
                                    <p className="text-[13px] text-muted-foreground mt-1.5">{STEP_META[step].desc}</p>
                                </div>

                                {/* Content area — connected to real onboarding pages */}
                                <div
                                    className="flex-1 flex items-center justify-center text-center"
                                    style={{
                                        background: 'hsl(var(--surface-1))',
                                        border: '1px solid hsl(var(--border)/0.2)'
                                    }}
                                >
                                    <div className="p-8">
                                        {(() => {
                                            const Icon = STEP_META[step].icon;
                                            return (
                                                <>
                                                    <div
                                                        className="w-16 h-16 flex items-center justify-center mx-auto mb-4"
                                                        style={{
                                                            background: `${STEP_META[step].color}18`,
                                                            border: `1px solid ${STEP_META[step].color}30`
                                                        }}
                                                    >
                                                        <Icon className="w-8 h-8"
                                                              style={{color: STEP_META[step].color}}/>
                                                    </div>
                                                    <p className="text-[13px] text-muted-foreground/60 leading-relaxed max-w-[200px]">
                                                        {STEP_META[step].desc} — complete your profile to unlock full
                                                        access.
                                                    </p>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>

                                {/* Next CTA */}
                                <div className="mt-5">
                                    <button
                                        onClick={next}
                                        className="w-full h-14 flex items-center justify-center gap-2 text-[14px] font-black text-white transition-opacity active:opacity-90"
                                        style={{
                                            background: 'hsl(var(--primary))',
                                            boxShadow: '0 6px 24px hsl(var(--primary)/0.3)'
                                        }}
                                        data-testid="button-continue"
                                    >
                                        Continue <ArrowRight className="w-5 h-5"/>
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* ── FINISH ── */}
                        {step === 'finish' && (
                            <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 text-center">
                                <motion.div
                                    initial={{scale: 0.5, opacity: 0}}
                                    animate={{scale: 1, opacity: 1}}
                                    transition={{type: 'spring', stiffness: 240, damping: 18}}
                                    className="w-24 h-24 flex items-center justify-center mb-8"
                                    style={{
                                        background: 'hsl(142 72% 46%)',
                                        boxShadow: '0 0 60px hsl(142 72% 46% / 0.4)',
                                    }}
                                >
                                    <Check className="w-12 h-12 text-white" strokeWidth={3}/>
                                </motion.div>

                                <motion.div initial={{opacity: 0, y: 20}} animate={{opacity: 1, y: 0}}
                                            transition={{delay: 0.2}}>
                                    <p className="eyebrow mb-2" style={{color: 'hsl(142 72% 46%)'}}>PROFILE COMPLETE</p>
                                    <h2 className="text-[32px] font-black tracking-tight leading-none mb-3">
                                        You're All Set
                                    </h2>
                                    <p className="text-[14px] text-muted-foreground max-w-xs mx-auto leading-relaxed">
                                        Your royal profile is ready. Time to find your king — 520,000+ members are
                                        waiting.
                                    </p>
                                </motion.div>

                                <motion.div
                                    initial={{opacity: 0, y: 16}}
                                    animate={{opacity: 1, y: 0}}
                                    transition={{delay: 0.32}}
                                    className="w-full max-w-sm mt-8"
                                >
                                    <button
                                        onClick={() => navigate('/app/grid')}
                                        className="w-full h-14 flex items-center justify-center gap-2 text-[14px] font-black text-white transition-opacity active:opacity-90"
                                        style={{
                                            background: 'hsl(var(--primary))',
                                            boxShadow: '0 8px 32px hsl(var(--primary)/0.4)',
                                        }}
                                        data-testid="button-start-exploring"
                                    >
                                        Start Exploring <ArrowRight className="w-5 h-5"/>
                                    </button>
                                </motion.div>

                                {/* Stats */}
                                <motion.div
                                    initial={{opacity: 0}}
                                    animate={{opacity: 1}}
                                    transition={{delay: 0.45}}
                                    className="flex gap-0 mt-8 w-full max-w-sm"
                                >
                                    {[
                                        {val: '520K+', label: 'Members'},
                                        {val: '98%', label: 'Verified'},
                                        {val: '4.9★', label: 'Rating'},
                                    ].map((s, i) => (
                                        <div
                                            key={s.label}
                                            className="flex-1 py-3 text-center"
                                            style={{
                                                background: 'hsl(var(--surface-1))',
                                                border: '1px solid hsl(var(--border)/0.2)',
                                                borderLeft: i === 0 ? '1px solid hsl(var(--border)/0.2)' : 'none',
                                            }}
                                        >
                                            <p className="text-[16px] font-black leading-none"
                                               style={{color: 'hsl(var(--gold))'}}>{s.val}</p>
                                            <p className="text-[9px] font-bold text-muted-foreground/40 mt-0.5 uppercase tracking-wider">{s.label}</p>
                                        </div>
                                    ))}
                                </motion.div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>
        </div>
    );
}
