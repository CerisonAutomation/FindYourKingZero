import {useEffect, useState} from 'react';
import {motion} from 'framer-motion';
import {CheckCircle2, Chrome, Download, Plus, Share, Smartphone, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useNavigate} from 'react-router-dom';

type Platform = 'ios' | 'android' | 'desktop' | 'unknown';

function detectPlatform(): Platform {
    const ua = navigator.userAgent;
    if (/iPad|iPhone|iPod/.test(ua)) return 'ios';
    if (/Android/.test(ua)) return 'android';
    if (typeof window !== 'undefined') return 'desktop';
    return 'unknown';
}

function isInStandaloneMode() {
    return (
        window.matchMedia('(display-mode: standalone)').matches ||
        (window.navigator as any).standalone === true
    );
}

export default function InstallPage() {
    const navigate = useNavigate();
    const [platform] = useState<Platform>(detectPlatform);
    const [isInstalled] = useState(isInStandaloneMode);
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [installed, setInstalled] = useState(false);
    const [step, setStep] = useState(0);

    useEffect(() => {
        const handler = (e: Event) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handler);
        return () => window.removeEventListener('beforeinstallprompt', handler);
    }, []);

    const handleInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const result = await deferredPrompt.userChoice;
            if (result.outcome === 'accepted') {
                setInstalled(true);
                setTimeout(() => navigate('/app/grid'), 2000);
            }
        }
    };

    if (isInstalled || installed) {
        return (
            <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 px-6">
                <motion.div
                    initial={{scale: 0}} animate={{scale: 1}}
                    transition={{type: 'spring', stiffness: 400, damping: 20}}
                    className="w-24 h-24 rounded-3xl flex items-center justify-center"
                    style={{background: 'var(--gradient-emerald)'}}
                >
                    <CheckCircle2 className="w-12 h-12 text-white"/>
                </motion.div>
                <motion.div initial={{opacity: 0, y: 12}} animate={{opacity: 1, y: 0}} transition={{delay: 0.2}}
                            className="text-center">
                    <h1 className="text-2xl font-black mb-2">You're all set!</h1>
                    <p className="text-muted-foreground">MACHOBB is installed on your device.</p>
                </motion.div>
                <Button onClick={() => navigate('/app/grid')}
                        className="gradient-primary w-full max-w-xs h-12 rounded-2xl font-bold">
                    Open App
                </Button>
            </div>
        );
    }

    const iosSteps = [
        {icon: Share, label: 'Tap the Share button', sub: 'in Safari\'s bottom toolbar'},
        {icon: Plus, label: 'Tap "Add to Home Screen"', sub: 'scroll down in the share sheet'},
        {icon: CheckCircle2, label: 'Tap "Add"', sub: 'and you\'re done!'},
    ];

    return (
        <div className="min-h-screen bg-background flex flex-col overflow-hidden">
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-safe pt-4">
                <button onClick={() => navigate(-1)}
                        className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center">
                    <X className="w-4 h-4"/>
                </button>
            </div>

            {/* Hero */}
            <div className="flex-1 flex flex-col items-center justify-center px-6 gap-8">
                {/* App Icon */}
                <motion.div
                    initial={{scale: 0.8, opacity: 0}} animate={{scale: 1, opacity: 1}}
                    transition={{type: 'spring', stiffness: 300, damping: 24}}
                    className="relative"
                >
                    <div
                        className="w-28 h-28 rounded-[28px] flex items-center justify-center shadow-2xl"
                        style={{background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-glow)'}}
                    >
                        <span className="text-4xl font-black text-white tracking-tighter">M</span>
                    </div>
                    <div
                        className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-emerald-500 border-2 border-background flex items-center justify-center">
                        <Smartphone className="w-4 h-4 text-white"/>
                    </div>
                </motion.div>

                <motion.div
                    initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.15}}
                    className="text-center space-y-2"
                >
                    <h1 className="text-3xl font-black tracking-tight">Install MACHOBB</h1>
                    <p className="text-muted-foreground text-sm leading-relaxed max-w-xs">
                        Add to your home screen for the fastest, fullscreen experience — no app store needed.
                    </p>
                </motion.div>

                {/* Benefits */}
                <motion.div
                    initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.25}}
                    className="w-full max-w-sm grid grid-cols-3 gap-3"
                >
                    {[
                        {icon: '⚡', label: 'Lightning fast'},
                        {icon: '🔔', label: 'Push alerts'},
                        {icon: '📵', label: 'Works offline'},
                    ].map((b) => (
                        <div key={b.label}
                             className="flex flex-col items-center gap-1.5 p-3 rounded-2xl bg-secondary/40 border border-border/30">
                            <span className="text-xl">{b.icon}</span>
                            <span
                                className="text-[10px] font-semibold text-muted-foreground text-center leading-tight">{b.label}</span>
                        </div>
                    ))}
                </motion.div>

                {/* Platform-specific instructions */}
                <motion.div
                    initial={{opacity: 0, y: 16}} animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.35}}
                    className="w-full max-w-sm"
                >
                    {platform === 'ios' ? (
                        <div className="space-y-3">
                            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest text-center mb-4">
                                How to install on iPhone / iPad
                            </p>
                            {iosSteps.map((s, i) => (
                                <motion.div
                                    key={i}
                                    initial={{opacity: 0, x: -12}} animate={{opacity: 1, x: 0}}
                                    transition={{delay: 0.4 + i * 0.08}}
                                    className="flex items-center gap-3 p-3.5 rounded-2xl bg-secondary/40 border border-border/30"
                                >
                                    <div
                                        className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 text-xs font-black text-primary-foreground"
                                        style={{background: 'var(--gradient-primary)'}}
                                    >
                                        {i + 1}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold">{s.label}</p>
                                        <p className="text-xs text-muted-foreground">{s.sub}</p>
                                    </div>
                                </motion.div>
                            ))}
                        </div>
                    ) : platform === 'android' || deferredPrompt ? (
                        <Button
                            onClick={handleInstall}
                            className="w-full h-14 rounded-2xl font-black text-base gradient-primary shadow-[0_8px_32px_hsl(var(--primary)/0.4)]"
                        >
                            <Download className="w-5 h-5 mr-2"/>
                            Install App
                        </Button>
                    ) : (
                        <div className="text-center space-y-3 p-4 rounded-2xl bg-secondary/40 border border-border/30">
                            <Chrome className="w-8 h-8 text-muted-foreground/40 mx-auto"/>
                            <p className="text-sm text-muted-foreground">
                                On desktop, click the install icon in your browser's address bar, or use Chrome/Edge for
                                best experience.
                            </p>
                        </div>
                    )}
                </motion.div>

                {/* Skip */}
                <button
                    onClick={() => navigate('/app/grid')}
                    className="text-xs text-muted-foreground/50 hover:text-muted-foreground transition-colors pb-8"
                >
                    Skip for now — continue in browser
                </button>
            </div>
        </div>
    );
}
