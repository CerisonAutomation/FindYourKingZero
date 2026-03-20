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
