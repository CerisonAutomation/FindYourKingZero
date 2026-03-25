import {useEffect, useRef, useState} from 'react';
import {Link} from 'react-router-dom';
import {motion, useInView, useScroll, useTransform} from 'framer-motion';
import {
    ArrowRight,
    BadgeCheck,
    Brain,
    Calendar,
    Crown,
    Globe,
    Lock,
    MapPin,
    MessageCircle,
    Radio,
    Shield,
    Sparkles,
    Star,
    Trophy,
} from 'lucide-react';
import {GoldButton} from '@/components/ui/GoldButton';

// ── Animated counter ─────────────────────────────────────────
function Counter({end, duration = 1800, suffix = '', prefix = ''}: {
    end: number; duration?: number; suffix?: string; prefix?: string;
}) {
    const [n, setN] = useState(0);
    const ref = useRef<HTMLSpanElement>(null);
    const inView = useInView(ref, {once: true, margin: '-30px'});
    useEffect(() => {
        if (!inView) return;
        let start: number | null = null;
        const step = (ts: number) => {
            if (!start) start = ts;
            const p = Math.min((ts - start) / duration, 1);
            const e = 1 - Math.pow(1 - p, 4);
            setN(Math.floor(e * end));
            if (p < 1) requestAnimationFrame(step);
        };
        requestAnimationFrame(step);
    }, [inView, end, duration]);
    const d = n >= 1_000_000 ? `${(n / 1_000_000).toFixed(1)}M`
        : n >= 1_000 ? `${(n / 1_000).toFixed(0)}K`
            : n;
    return <span ref={ref} className="num-display">{prefix}{d}{suffix}</span>;
}

// ── Reveal wrapper ────────────────────────────────────────────
function Reveal({children, delay = 0, y = 28}: {
    children: React.ReactNode; delay?: number; y?: number;
}) {
    return (
        <motion.div
            initial={{opacity: 0, y}}
            whileInView={{opacity: 1, y: 0}}
            viewport={{once: true, margin: '-60px'}}
            transition={{delay, duration: 0.55, ease: [0.16, 1, 0.3, 1]}}
        >
            {children}
        </motion.div>
    );
}

// ── Section divider ──────────────────────────────────────────
function SectionDivider({accent = 'primary'}: { accent?: string }) {
    return (
        <div className="flex items-center gap-4 mb-14">
            <div className="flex-1 h-px" style={{background: 'hsl(var(--border))'}}/>
            <div className="w-1 h-1 rotate-45" style={{background: `hsl(var(--${accent}))`}}/>
            <div className="flex-1 h-px" style={{background: 'hsl(var(--border))'}}/>
        </div>
    );
}

// ── Data ─────────────────────────────────────────────────────
const TICKER_ITEMS = [
    '520,000+ MEMBERS', '14,800 ACTIVE TODAY', 'AI-POWERED MATCHING',
    '230+ CITIES WORLDWIDE', 'REAL-TIME PROXIMITY', 'GDPR CERTIFIED',
    '4.9★ APP STORE', 'END-TO-END ENCRYPTED', 'FREE TO JOIN',
    'PHOTO VERIFIED PROFILES', 'ELITE EVENTS SYSTEM', 'LIVE AI COACH',
];

const FEATURES = [
    {
        id: 'ai',
        label: 'AI KING',
        title: 'Your Personal AI Wingman',
        desc: 'Openers that convert. Safety checks. Date planning. Real-time social coaching that learns your style and adapts to every interaction.',
        icon: Brain,
        accent: 'gold',
        size: 'large',
        stat: '3.2× more matches',
    },
    {
        id: 'now',
        label: 'RIGHT NOW',
        title: 'Real-Time Availability',
        desc: 'Signal you\'re available. See who\'s nearby and ready — with zero friction. The hook-up layer built for kings who don\'t wait.',
        icon: Radio,
        accent: 'red',
        size: 'small',
        stat: '< 4 min response',
    },
    {
        id: 'safe',
        label: 'VERIFIED SAFE',
        title: 'Trust Infrastructure',
        desc: 'Photo ID, behavioral scoring, community moderation. Safety isn\'t a feature here — it\'s the architecture.',
        icon: Shield,
        accent: 'emerald',
        size: 'small',
        stat: '99.4% report rate',
    },
    {
        id: 'chat',
        label: 'REAL-TIME CHAT',
        title: 'DMs, Rooms & Voice',
        desc: 'Group circles, event rooms, direct threads — reactions, voice notes, read receipts, AI quick replies. Communication that keeps up.',
        icon: MessageCircle,
        accent: 'royal',
        size: 'small',
        stat: '1.2s delivery',
    },
    {
        id: 'events',
        label: 'EVENTS & CIRCLES',
        title: 'Private Events Engine',
        desc: 'Host or attend — private parties, recurring meetups, house events. Analytics, ticketing, co-host workflows.',
        icon: Calendar,
        accent: 'violet',
        size: 'small',
        stat: '4,200+ events / mo',
    },
    {
        id: 'map',
        label: 'LIVE MAP',
        title: 'Precision Proximity',
        desc: 'Know who\'s near — on your terms. Full privacy toggles, fuzzy distance, opt-in visibility. Power without exposure.',
        icon: MapPin,
        accent: 'amber',
        size: 'small',
        stat: '±50m accuracy',
    },
    {
        id: 'albums',
        label: 'PRIVATE ALBUMS',
        title: 'Selective Photo Sharing',
        desc: 'Unlock access for specific users. Revoke instantly. Your content, your rules, enforced at infrastructure level.',
        icon: Lock,
        accent: 'rose',
        size: 'small',
        stat: 'Revoke anytime',
    },
    {
        id: 'rank',
        label: 'PROGRESSION',
        title: 'Elite Rank System',
        desc: 'Earn trust. Unlock platform power. From New to Elite — every rank carries real capability: wider reach, exclusive circles, priority placement.',
        icon: Trophy,
        accent: 'gold',
        size: 'large',
        stat: '6 rank tiers',
    },
];

const TIERS = [
    {
        id: 'free', name: 'FREE', price: '0', period: 'forever',
        desc: 'Full access to basics',
        accent: 'hsl(var(--muted-foreground))',
        features: ['Profile + photo gallery', 'Join public circles', 'Basic DMs', 'Standard discovery', 'Privacy controls'],
        cta: 'Start Free', popular: false,
    },
    {
        id: 'plus', name: 'PLUS', price: '9', period: '/mo',
        desc: 'Remove all limits',
        accent: 'hsl(var(--primary))',
        features: ['Expanded filters', 'Unlimited interactions', 'AI match recommendations', 'See compatibility scores', 'Travel mode', 'Priority inbox'],
        cta: 'Go Plus', popular: false,
    },
    {
        id: 'pro', name: 'PRO', price: '24', period: '/mo',
        desc: 'Operate like a host',
        accent: 'hsl(var(--cyan))',
        features: ['Everything in Plus', 'AI event drafting', 'Host analytics dashboard', 'Co-host workflows', 'Attendee segmentation', 'Premium circles'],
        cta: 'Go Pro', popular: true,
    },
    {
        id: 'elite', name: 'ELITE', price: '69', period: '/mo',
        desc: 'Exclusive access tier',
        accent: 'hsl(var(--gold))',
        features: ['Priority placement', 'Elite-only circles', 'White-glove events', 'Dedicated support', 'Premium safety', 'Early access'],
        cta: 'Go Elite', popular: false,
    },
];

const QUOTES = [
    {
        text: 'This is what the community deserves. Premium design, real people, fast matching. Finally an app that doesn\'t feel cheap.',
        name: 'Kai T.',
        city: 'London',
        level: 'PRO MEMBER',
        stars: 5
    },
    {
        text: 'AI King writes better openers than me. Booked a coffee date within 20 minutes of signing up. The intelligence layer is genuinely insane.',
        name: 'Dev M.',
        city: 'New York',
        level: 'ELITE HOST',
        stars: 5
    },
];

// ── MAIN ─────────────────────────────────────────────────────
export default function HomePage() {
    const heroRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const {scrollY} = useScroll({container: containerRef});
    const heroY = useTransform(scrollY, [0, 600], [0, -60]);
    const heroOpacity = useTransform(scrollY, [0, 500], [1, 0.25]);
    const [activeFeature, setActiveFeature] = useState<string | null>(null);

    return (
        <div
            ref={containerRef}
            className="text-foreground overflow-x-hidden overflow-y-auto"
            style={{background: 'hsl(var(--background))', minHeight: '100%', height: '100%'}}
        >

            {/* ════ NAV ════ */}
            <header
                className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-5 sm:px-8 md:px-10"
                style={{
                    height: 60,
                    background: 'hsl(220 18% 2% / 0.85)',
                    backdropFilter: 'blur(24px) saturate(160%)',
                    borderBottom: '1px solid hsl(220 12% 100% / 0.055)',
                }}
            >
                {/* Logo */}
                <div className="flex items-center gap-2.5">
                    <div
                        className="w-7 h-7 flex items-center justify-center"
                        style={{background: 'var(--gradient-red)', boxShadow: '0 0 14px hsl(0 92% 54% / 0.45)'}}
                    >
                        <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.2}/>
                    </div>
                    <div>
                        <span className="text-[13px] font-black tracking-[-0.02em] leading-none">FIND YOUR KING</span>
                        <span
                            className="block text-[7px] font-black tracking-[0.22em] uppercase mt-0.5"
                            style={{color: 'hsl(var(--primary))'}}
                        >by FIND YOUR KING</span>
                    </div>
                </div>

                {/* Nav links — desktop */}
                <nav className="hidden md:flex items-center gap-6">
                    {[
                        { label: 'Features', href: '#features' },
                        { label: 'Pricing', href: '#pricing' },
                        { label: 'Safety', href: '#safety' },
                        { label: 'Events', href: '#events' }
                    ].map(({ label, href }) => (
                        <Link
                            key={label}
                            to={href}
                            className="text-[11px] font-semibold text-muted-foreground/60 hover:text-foreground transition-colors duration-120 tracking-wide"
                        >{label}</Link>
                    ))}
                </nav>

                {/* CTAs */}
                <div className="flex items-center gap-2.5">
                    <Link to="/connect">
                        <button
                            className="hidden sm:block text-[11px] font-black tracking-[0.1em] uppercase px-4 h-8 text-muted-foreground hover:text-foreground transition-colors duration-120">
                            Sign In
                        </button>
                    </Link>
                    <Link to="/connect?mode=register">
                        <button
                            className="text-[11px] font-black tracking-[0.1em] uppercase px-5 h-8 transition-all duration-120 active:scale-[0.97]"
                            style={{
                                background: 'var(--gradient-red)',
                                color: '#fff',
                                boxShadow: '0 2px 14px hsl(0 92% 54% / 0.35)',
                            }}
                        >
                            Join Free
                        </button>
                    </Link>
                </div>
            </header>

            {/* ════ HERO ════ */}
            <section
                ref={heroRef}
                className="relative flex flex-col justify-end overflow-hidden grain-overlay"
                style={{minHeight: '100svh', paddingTop: 60, position: 'relative'}}
            >
                {/* Deep nebula background */}
                <div className="absolute inset-0 pointer-events-none">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `
                radial-gradient(ellipse 100% 70% at 5% 0%, hsl(0 92% 54% / 0.11) 0%, transparent 55%),
                radial-gradient(ellipse 80% 60% at 95% 100%, hsl(42 98% 56% / 0.08) 0%, transparent 55%),
                radial-gradient(ellipse 50% 80% at 50% 50%, hsl(214 85% 58% / 0.04) 0%, transparent 65%)
              `,
                        }}
                    />
                    {/* Fine dot grid */}
                    <div
                        className="absolute inset-0"
                        style={{
                            backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.08) 1px, transparent 1px)`,
                            backgroundSize: '32px 32px',
                            opacity: 0.4,
                        }}
                    />
                    {/* Left crimson stripe */}
                    <div
                        className="absolute top-0 left-0 bottom-0 w-[3px]"
                        style={{
                            background: 'linear-gradient(180deg, transparent 0%, hsl(0 92% 54%) 30%, hsl(0 92% 54%) 70%, transparent 100%)',
                            opacity: 0.7,
                        }}
                    />
                </div>

                {/* Hero content */}
                <motion.div
                    style={{y: heroY, opacity: heroOpacity}}
                    className="relative z-10 px-6 sm:px-10 md:px-14 lg:px-20 pb-16 md:pb-24"
                >
                    {/* Overline eyebrow */}
                    <motion.div
                        initial={{opacity: 0, x: -20}}
                        animate={{opacity: 1, x: 0}}
                        transition={{delay: 0.1, duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                        className="flex items-center gap-3 mb-8"
                    >
            <span
                className="w-[6px] h-[6px] rounded-full relative"
                style={{background: 'hsl(var(--destructive))'}}
            >
              <span
                  className="absolute inset-0 rounded-full animate-ping opacity-75"
                  style={{background: 'hsl(var(--destructive))'}}
              />
            </span>
                        <span
                            className="text-[9px] font-black tracking-[0.3em] uppercase"
                            style={{color: 'hsl(var(--destructive))'}}
                        >520,000+ Kings Worldwide · Live Now</span>
                    </motion.div>

                    {/* Main headline — EDITORIAL SCALE */}
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        transition={{delay: 0.18, duration: 0.7}}
                    >
                        <h1 className="text-mega mb-0">
                            <motion.span
                                initial={{opacity: 0, x: -30}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: 0.2, duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                                className="block"
                            >FIND
                            </motion.span>
                            <motion.span
                                initial={{opacity: 0, x: -30}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: 0.28, duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                                className="block"
                                style={{
                                    WebkitTextStroke: '1px hsl(var(--foreground))',
                                    WebkitTextFillColor: 'transparent',
                                    textStroke: '1px hsl(var(--foreground))',
                                }}
                            >YOUR
                            </motion.span>
                            <motion.span
                                initial={{opacity: 0, x: -30}}
                                animate={{opacity: 1, x: 0}}
                                transition={{delay: 0.36, duration: 0.6, ease: [0.16, 1, 0.3, 1]}}
                                className="block text-gradient"
                                style={{fontSize: 'clamp(64px, 14vw, 158px)'}}
                            >KING.
                            </motion.span>
                        </h1>
                    </motion.div>

                    {/* Horizontal rule + subtext */}
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.5, duration: 0.55, ease: [0.16, 1, 0.3, 1]}}
                        className="mt-10 max-w-xl"
                    >
                        <div
                            className="w-16 h-[2px] mb-6"
                            style={{background: 'hsl(var(--destructive))'}}
                        />
                        <p
                            className="text-[15px] leading-relaxed mb-10 max-w-[500px]"
                            style={{color: 'hsl(var(--muted-foreground))'}}
                        >
                            The premium gay social platform built for men who know what they want.
                            Real connections. Live events. AI-powered intelligence. Enterprise-grade privacy.
                        </p>

                        {/* CTAs */}
                        <div className="flex flex-wrap gap-3 mb-10">
                            <Link to="/connect?mode=register">
                                <GoldButton size="lg">
                                    <Crown className="w-4 h-4" strokeWidth={2}/> Claim Your Throne
                                </GoldButton>
                            </Link>
                            <Link to="/connect">
                                <button
                                    className="flex items-center gap-2.5 px-8 h-12 text-[12px] font-black tracking-[0.1em] uppercase transition-all duration-120"
                                    style={{
                                        color: 'hsl(var(--foreground))',
                                        border: '1px solid hsl(var(--border-strong))',
                                    }}
                                >
                                    Sign In <ArrowRight className="w-3.5 h-3.5"/>
                                </button>
                            </Link>
                        </div>

                        {/* Trust chips */}
                        <div className="flex flex-wrap items-center gap-4">
                            {['GDPR', 'SSL 256-bit', '18+ Only', '4.9★ App Store'].map((t) => (
                                <div key={t} className="flex items-center gap-1.5">
                                    <BadgeCheck className="w-3 h-3 shrink-0" style={{color: 'hsl(var(--emerald))'}}/>
                                    <span
                                        className="text-[10px] font-semibold text-muted-foreground/70 tracking-wide">{t}</span>
                                </div>
                            ))}
                        </div>
                    </motion.div>
                </motion.div>

                {/* Stat column — bottom right */}
                <motion.div
                    initial={{opacity: 0}}
                    animate={{opacity: 1}}
                    transition={{delay: 0.7, duration: 0.6}}
                    className="absolute bottom-10 right-6 sm:right-10 md:right-14 lg:right-20 z-10 flex flex-col items-end gap-6 hidden sm:flex"
                >
                    {[
                        {n: 520000, s: '+', label: 'Members', color: 'hsl(var(--primary))'},
                        {n: 14800, s: '+', label: 'Active Today', color: 'hsl(var(--cyan))'},
                        {n: 230, s: '+', label: 'Cities', color: 'hsl(var(--muted-foreground))'},
                    ].map(({n, s, label, color}) => (
                        <div key={label} className="text-right">
                            <div className="text-[28px] font-black leading-none num-display" style={{color}}>
                                <Counter end={n} suffix={s}/>
                            </div>
                            <div
                                className="text-[9px] font-bold tracking-[0.18em] uppercase text-muted-foreground/50 mt-1">{label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Scroll indicator */}
                <motion.div
                    initial={{opacity: 0, y: -10}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 1.1, duration: 0.6}}
                    className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5"
                >
                    <div
                        className="w-[1px] h-8 overflow-hidden"
                        style={{background: 'hsl(var(--border))'}}
                    >
                        <motion.div
                            className="w-full h-4"
                            style={{background: 'hsl(var(--primary))'}}
                            animate={{y: ['-100%', '200%']}}
                            transition={{duration: 1.4, repeat: Infinity, ease: 'easeInOut'}}
                        />
                    </div>
                    <span
                        className="text-[7px] font-black tracking-[0.3em] uppercase text-muted-foreground/30">Scroll</span>
                </motion.div>
            </section>

            {/* ════ TICKER MARQUEE ════ */}
            <div
                className="overflow-hidden py-4 relative"
                style={{
                    background: 'hsl(var(--destructive))',
                    borderTop: '1px solid hsl(0 0% 0% / 0.2)',
                    borderBottom: '1px solid hsl(0 0% 0% / 0.2)',
                }}
            >
                <div className="marquee-track whitespace-nowrap" aria-hidden>
                    {[...TICKER_ITEMS, ...TICKER_ITEMS].map((item, i) => (
                        <span key={i}
                              className="inline-flex items-center gap-4 px-6 text-[10px] font-black tracking-[0.22em] uppercase text-white">
              {item}
                            <span className="w-1 h-1 bg-white/40 rotate-45 inline-block"/>
            </span>
                    ))}
                </div>
            </div>

            {/* ════ MANIFESTO ════ */}
            <section className="py-28 px-6 sm:px-10 md:px-14 lg:px-20 relative overflow-hidden">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{background: 'radial-gradient(ellipse 70% 60% at 80% 50%, hsl(42 98% 56% / 0.04) 0%, transparent 65%)'}}
                />
                <div className="max-w-5xl">
                    <Reveal>
                        <p className="eyebrow mb-6">PLATFORM MANIFESTO</p>
                    </Reveal>
                    <Reveal delay={0.08}>
                        <h2
                            className="font-black leading-[0.92] tracking-[-0.04em] mb-8"
                            style={{fontSize: 'clamp(32px, 6vw, 72px)'}}
                        >
                            Built for men who refuse{' '}
                            <span
                                className="italic font-light"
                                style={{
                                    WebkitTextStroke: '1px hsl(var(--foreground) / 0.5)',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >to settle</span>{' '}
                            for average.
                        </h2>
                    </Reveal>
                    <Reveal delay={0.14}>
                        <p className="text-[15px] text-muted-foreground leading-relaxed max-w-2xl mb-10">
                            Every feature is engineered around one truth: you deserve a platform as premium as
                            the life you live. AI-powered. Safety-first. Designed with the intelligence, privacy,
                            and aesthetic that the community has always deserved — and never had.
                        </p>
                    </Reveal>

                    {/* Horizontal stat row */}
                    <Reveal delay={0.2}>
                        <div
                            className="grid grid-cols-2 md:grid-cols-4 border-t border-b"
                            style={{borderColor: 'hsl(var(--border))'}}
                        >
                            {[
                                {n: 520000, s: '+', l: 'Members', c: 'hsl(var(--primary))'},
                                {n: 14800, s: '+', l: 'Daily Active', c: 'hsl(var(--cyan))'},
                                {n: 98, s: '%', l: 'Satisfaction', c: 'hsl(var(--emerald))'},
                                {n: 230, s: '+', l: 'Cities', c: 'hsl(var(--gold))'},
                            ].map(({n, s, l, c}, i) => (
                                <div
                                    key={l}
                                    className="py-8 px-6 flex flex-col gap-1"
                                    style={{
                                        borderRight: i < 3 ? '1px solid hsl(var(--border))' : 'none',
                                        background: i % 2 === 0 ? 'transparent' : 'hsl(var(--surface-1) / 0.4)',
                                    }}
                                >
                                    <div className="text-[36px] font-black tracking-[-0.04em] num-display"
                                         style={{color: c}}>
                                        <Counter end={n} suffix={s}/>
                                    </div>
                                    <div
                                        className="text-[10px] font-bold tracking-[0.14em] uppercase text-muted-foreground/60">{l}</div>
                                </div>
                            ))}
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ════ FEATURES BENTO ════ */}
            <section className="py-24 px-6 sm:px-10 md:px-14 lg:px-20 relative">
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{background: 'radial-gradient(ellipse 60% 50% at 15% 60%, hsl(214 85% 58% / 0.05) 0%, transparent 60%)'}}
                />
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <div className="mb-16">
                            <p className="eyebrow mb-5">PLATFORM CAPABILITIES</p>
                            <div className="flex items-end justify-between gap-8 flex-wrap">
                                <h2
                                    className="font-black leading-[0.93] tracking-[-0.04em]"
                                    style={{fontSize: 'clamp(28px, 5vw, 58px)'}}
                                >
                                    Nine reasons this is<br/>
                                    <span className="text-gradient">the only app you need.</span>
                                </h2>
                                <Link to="/connect?mode=register">
                                    <button
                                        className="hidden md:flex items-center gap-2 text-[11px] font-black tracking-[0.1em] uppercase px-6 h-10 transition-all duration-120 shrink-0"
                                        style={{
                                            border: '1px solid hsl(var(--border-strong))',
                                            color: 'hsl(var(--foreground))',
                                        }}
                                    >
                                        See All Features <ArrowRight className="w-3 h-3"/>
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </Reveal>

                    {/* Bento Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-px"
                         style={{background: 'hsl(var(--border))'}}>
                        {FEATURES.map((feat, i) => {
                            const Icon = feat.icon;
                            const accentColor = `hsl(var(--${feat.accent}))`;
                            const isLarge = feat.size === 'large';

                            return (
                                <motion.div
                                    key={feat.id}
                                    initial={{opacity: 0, y: 20}}
                                    whileInView={{opacity: 1, y: 0}}
                                    viewport={{once: true, margin: '-40px'}}
                                    transition={{delay: (i % 3) * 0.06, duration: 0.5, ease: [0.16, 1, 0.3, 1]}}
                                    onHoverStart={() => setActiveFeature(feat.id)}
                                    onHoverEnd={() => setActiveFeature(null)}
                                    className={`relative group cursor-default p-8 overflow-hidden card-luxury ${
                                        isLarge ? 'lg:col-span-2 md:col-span-2' : ''
                                    }`}
                                    style={{
                                        background: activeFeature === feat.id
                                            ? `hsl(var(--surface-2))`
                                            : 'hsl(var(--surface-0))',
                                    }}
                                >
                                    {/* Top accent line on hover */}
                                    <div
                                        className="absolute top-0 left-0 right-0 h-[2px] scale-x-0 group-hover:scale-x-100 origin-left transition-transform duration-300"
                                        style={{background: `linear-gradient(90deg, ${accentColor}, transparent)`}}
                                    />
                                    {/* Number watermark */}
                                    <div
                                        className="absolute bottom-6 right-6 text-[52px] font-black leading-none tracking-[-0.04em] opacity-[0.04] group-hover:opacity-[0.07] transition-opacity duration-300 select-none"
                                        style={{color: accentColor}}
                                    >
                                        {String(i + 1).padStart(2, '0')}
                                    </div>

                                    {/* Icon */}
                                    <div
                                        className="w-10 h-10 flex items-center justify-center mb-6"
                                        style={{
                                            background: `hsl(var(--${feat.accent}) / 0.08)`,
                                            border: `1px solid hsl(var(--${feat.accent}) / 0.2)`,
                                        }}
                                    >
                                        <Icon className="w-4 h-4" style={{color: accentColor}} strokeWidth={1.8}/>
                                    </div>

                                    {/* Label */}
                                    <p
                                        className="text-[8px] font-black tracking-[0.26em] uppercase mb-2"
                                        style={{color: accentColor}}
                                    >{feat.label}</p>

                                    {/* Title */}
                                    <h3 className="text-[15px] font-black tracking-[-0.02em] mb-3 leading-tight">{feat.title}</h3>

                                    {/* Desc */}
                                    <p className="text-[12px] text-muted-foreground leading-relaxed mb-5">{feat.desc}</p>

                                    {/* Stat pill */}
                                    <div
                                        className="inline-flex items-center gap-1.5 px-3 py-1"
                                        style={{
                                            background: `hsl(var(--${feat.accent}) / 0.07)`,
                                            border: `1px solid hsl(var(--${feat.accent}) / 0.15)`,
                                        }}
                                    >
                                        <div className="w-1 h-1 rounded-full" style={{background: accentColor}}/>
                                        <span className="text-[9px] font-black tracking-[0.12em] uppercase"
                                              style={{color: accentColor}}>
                      {feat.stat}
                    </span>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            </section>

            {/* ════ HOW IT WORKS ════ */}
            <section
                className="py-24 px-6 sm:px-10 md:px-14 lg:px-20 relative overflow-hidden"
                style={{background: 'hsl(var(--surface-1))'}}
            >
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{background: 'radial-gradient(ellipse 60% 50% at 90% 20%, hsl(0 92% 54% / 0.06) 0%, transparent 60%)'}}
                />
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <p className="eyebrow mb-5">GETTING STARTED</p>
                        <h2
                            className="font-black leading-[0.93] tracking-[-0.04em] mb-16"
                            style={{fontSize: 'clamp(28px, 5vw, 58px)'}}
                        >
                            Up and running<br/>
                            <span className="text-gradient">in three steps.</span>
                        </h2>
                    </Reveal>

                    <div
                        className="grid grid-cols-1 md:grid-cols-3 gap-px"
                        style={{background: 'hsl(var(--border))'}}
                    >
                        {[
                            {
                                n: '01', label: 'CREATE', title: 'Build your profile',
                                desc: 'Sign up in 60 seconds. Upload photos, set your preferences, choose your tribes. Your identity, your rules.',
                                accent: 'hsl(var(--primary))',
                            },
                            {
                                n: '02', label: 'DISCOVER', title: 'Find your people',
                                desc: 'Browse nearby kings, join live events, activate Right Now mode. AI matches you based on behavior, not just photos.',
                                accent: 'hsl(var(--cyan))',
                            },
                            {
                                n: '03', label: 'CONNECT', title: 'Make it happen',
                                desc: 'Send a message, RSVP to an event, drop a pin. AI King helps you craft the perfect opener. The rest is chemistry.',
                                accent: 'hsl(var(--gold))',
                            },
                        ].map(({n, label, title, desc, accent}, i) => (
                            <Reveal key={n} delay={i * 0.1}>
                                <div
                                    className="relative p-8 md:p-10 h-full"
                                    style={{background: 'hsl(var(--surface-0))'}}
                                >
                                    <div
                                        className="text-[72px] font-black leading-none tracking-[-0.05em] mb-6 opacity-[0.07]"
                                        style={{color: accent}}
                                    >{n}</div>
                                    <p className="text-[8px] font-black tracking-[0.28em] uppercase mb-3"
                                       style={{color: accent}}>{label}</p>
                                    <h3 className="text-[16px] font-black tracking-[-0.02em] mb-4">{title}</h3>
                                    <p className="text-[12px] text-muted-foreground leading-relaxed">{desc}</p>

                                    <div className="absolute top-8 right-8">
                                        <div className="w-2 h-2" style={{background: accent, opacity: 0.4}}/>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>

                    <Reveal delay={0.3}>
                        <div className="mt-10 text-center">
                            <Link to="/connect?mode=register">
                                <button
                                    className="inline-flex items-center gap-2.5 px-10 h-12 text-[12px] font-black tracking-[0.12em] uppercase transition-all duration-120 active:scale-[0.97]"
                                    style={{
                                        background: 'var(--gradient-primary)',
                                        color: 'hsl(var(--background))',
                                        boxShadow: '0 4px 24px hsl(42 98% 56% / 0.35)',
                                    }}
                                >
                                    <Sparkles className="w-4 h-4" strokeWidth={2}/> Start For Free
                                </button>
                            </Link>
                        </div>
                    </Reveal>
                </div>
            </section>

            {/* ════ MEMBERSHIP TIERS ════ */}
            <section className="py-24 px-6 sm:px-10 md:px-14 lg:px-20">
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <p className="eyebrow mb-5">MEMBERSHIP</p>
                        <div className="flex items-end justify-between gap-8 flex-wrap mb-14">
                            <h2
                                className="font-black leading-[0.93] tracking-[-0.04em]"
                                style={{fontSize: 'clamp(28px, 5vw, 58px)'}}
                            >
                                Choose your<br/>
                                <span className="text-gradient-king">level of access.</span>
                            </h2>
                            <p className="text-[13px] text-muted-foreground max-w-sm leading-relaxed">
                                Start free. Upgrade when you're ready to dominate. Cancel anytime, no questions asked.
                            </p>
                        </div>
                    </Reveal>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-px"
                         style={{background: 'hsl(var(--border))'}}>
                        {TIERS.map((tier, i) => (
                            <motion.div
                                key={tier.id}
                                initial={{opacity: 0, y: 20}}
                                whileInView={{opacity: 1, y: 0}}
                                viewport={{once: true}}
                                transition={{delay: i * 0.07, duration: 0.45}}
                                className="relative flex flex-col"
                                style={{background: tier.popular ? 'hsl(var(--surface-2))' : 'hsl(var(--surface-0))'}}
                            >
                                {/* Popular top bar */}
                                {tier.popular && (
                                    <div
                                        className="absolute top-0 left-0 right-0 h-[2px]"
                                        style={{background: `linear-gradient(90deg, transparent 5%, ${tier.accent}, transparent 95%)`}}
                                    />
                                )}
                                {tier.popular && (
                                    <div
                                        className="absolute -top-px left-1/2 -translate-x-1/2 -translate-y-full px-3 py-[3px] text-[8px] font-black tracking-[0.18em] uppercase"
                                        style={{background: tier.accent, color: 'hsl(var(--background))'}}
                                    >
                                        MOST POPULAR
                                    </div>
                                )}

                                <div className="p-7 flex-1">
                                    <div className="flex items-center justify-between mb-5">
                                        <span className="text-[8px] font-black tracking-[0.24em] uppercase"
                                              style={{color: tier.accent}}>{tier.name}</span>
                                        <div className="w-1 h-1 rotate-45"
                                             style={{background: tier.accent, opacity: 0.5}}/>
                                    </div>
                                    <div className="mb-1">
                                        <span className="text-[11px] font-semibold text-muted-foreground">$</span>
                                        <span
                                            className="text-[40px] font-black leading-none tracking-[-0.04em] num-display">{tier.price}</span>
                                        <span className="text-[11px] text-muted-foreground">{tier.period}</span>
                                    </div>
                                    <p className="text-[11px] text-muted-foreground mb-6">{tier.desc}</p>

                                    <ul className="space-y-2.5 mb-6">
                                        {tier.features.map((f) => (
                                            <li key={f} className="flex items-start gap-2">
                                                <div className="w-3.5 h-3.5 mt-px shrink-0"
                                                     style={{color: tier.accent}}>
                                                    <BadgeCheck className="w-3.5 h-3.5"/>
                                                </div>
                                                <span
                                                    className="text-[11px] text-foreground/70 leading-tight">{f}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                <div className="p-5 pt-0">
                                    <Link to="/connect?mode=register">
                                        <button
                                            className="w-full py-3 text-[11px] font-black tracking-[0.12em] uppercase transition-all duration-120 active:scale-[0.97]"
                                            style={{
                                                background: tier.popular ? tier.accent : 'transparent',
                                                color: tier.popular ? 'hsl(var(--background))' : tier.accent,
                                                border: `1px solid ${tier.accent.replace(')', ' / 0.35)')}`,
                                            }}
                                        >
                                            {tier.cta} →
                                        </button>
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════ SOCIAL PROOF ════ */}
            <section
                className="py-24 px-6 sm:px-10 md:px-14 lg:px-20"
                style={{background: 'hsl(var(--surface-1))'}}
            >
                <div className="max-w-7xl mx-auto">
                    <Reveal>
                        <p className="eyebrow mb-14">WHAT KINGS SAY</p>
                    </Reveal>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-px" style={{background: 'hsl(var(--border))'}}>
                        {QUOTES.map((q, i) => (
                            <Reveal key={i} delay={i * 0.1}>
                                <div className="p-10 md:p-12" style={{background: 'hsl(var(--surface-0))'}}>
                                    {/* Stars */}
                                    <div className="flex gap-1 mb-8">
                                        {Array.from({length: q.stars}).map((_, si) => (
                                            <Star
                                                key={si}
                                                className="w-3.5 h-3.5 fill-current"
                                                style={{color: 'hsl(var(--primary))'}}
                                            />
                                        ))}
                                    </div>

                                    {/* Pull quote */}
                                    <div
                                        className="text-[11px] font-black text-muted-foreground/30 mb-4 select-none"
                                        style={{fontSize: 48, lineHeight: 0.8, fontFamily: 'Georgia, serif'}}
                                    >"
                                    </div>
                                    <blockquote
                                        className="font-semibold leading-[1.4] tracking-[-0.01em] mb-8"
                                        style={{
                                            fontSize: 'clamp(14px, 2vw, 18px)',
                                            color: 'hsl(var(--foreground) / 0.9)'
                                        }}
                                    >
                                        {q.text}
                                    </blockquote>

                                    {/* Author */}
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-8 h-8 flex items-center justify-center text-[11px] font-black"
                                            style={{
                                                background: i === 0 ? 'var(--gradient-primary)' : 'var(--gradient-royal)',
                                                color: '#fff',
                                            }}
                                        >
                                            {q.name[0]}
                                        </div>
                                        <div>
                                            <p className="text-[12px] font-black tracking-[-0.01em]">{q.name}</p>
                                            <p className="text-[10px] text-muted-foreground">{q.city} · <span
                                                style={{color: 'hsl(var(--primary))'}}>{q.level}</span></p>
                                        </div>
                                    </div>
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* ════ FINAL CTA ════ */}
            <section
                className="relative overflow-hidden py-32 px-6 sm:px-10 md:px-14 lg:px-20 text-center"
                style={{background: 'hsl(0 80% 8%)'}}
            >
                {/* Ambient glow */}
                <div
                    className="absolute inset-0 pointer-events-none"
                    style={{
                        background: `
              radial-gradient(ellipse 80% 60% at 50% 0%, hsl(0 92% 54% / 0.25) 0%, transparent 65%),
              radial-gradient(ellipse 60% 40% at 50% 100%, hsl(42 98% 56% / 0.12) 0%, transparent 60%)
            `,
                    }}
                />
                {/* Fine grid */}
                <div
                    className="absolute inset-0 pointer-events-none opacity-[0.04]"
                    style={{
                        backgroundImage: `linear-gradient(hsl(0 92% 54%) 1px, transparent 1px), linear-gradient(90deg, hsl(0 92% 54%) 1px, transparent 1px)`,
                        backgroundSize: '80px 80px',
                    }}
                />

                <Reveal>
                    <div className="relative z-10 max-w-4xl mx-auto">
                        <p
                            className="text-[9px] font-black tracking-[0.35em] uppercase mb-8"
                            style={{color: 'hsl(0 92% 54% / 0.7)'}}
                        >Your Kingdom Awaits</p>

                        <h2
                            className="font-black leading-[0.88] tracking-[-0.055em] mb-8"
                            style={{
                                fontSize: 'clamp(44px, 10vw, 110px)',
                                color: '#fff',
                            }}
                        >
                            YOUR THRONE<br/>
                            <span
                                style={{
                                    WebkitTextStroke: '1px hsl(0 0% 100% / 0.35)',
                                    WebkitTextFillColor: 'transparent',
                                }}
                            >IS WAITING.</span>
                        </h2>

                        <p
                            className="text-[14px] leading-relaxed mb-12 max-w-lg mx-auto"
                            style={{color: 'hsl(0 0% 100% / 0.5)'}}
                        >
                            Join 520,000+ kings building real connections every day.
                            Free forever. Upgrade when you're ready to rule.
                        </p>

                        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-12">
                            <Link to="/connect?mode=register">
                                <button
                                    className="inline-flex items-center gap-2.5 px-12 h-14 text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-120 active:scale-[0.97]"
                                    style={{
                                        background: 'hsl(var(--destructive))',
                                        color: '#fff',
                                        boxShadow: '0 4px 40px hsl(0 92% 54% / 0.6), 0 1px 0 hsl(0 0% 100% / 0.15) inset',
                                    }}
                                >
                                    <Crown className="w-4 h-4" strokeWidth={2.2}/> Create Free Account
                                </button>
                            </Link>
                            <Link to="/connect">
                                <button
                                    className="inline-flex items-center gap-2.5 px-12 h-14 text-[13px] font-black tracking-[0.12em] uppercase transition-all duration-120"
                                    style={{
                                        background: 'transparent',
                                        color: 'hsl(0 0% 100% / 0.65)',
                                        border: '1px solid hsl(0 0% 100% / 0.15)',
                                    }}
                                >
                                    Sign In <ArrowRight className="w-3.5 h-3.5"/>
                                </button>
                            </Link>
                        </div>

                        <div className="flex flex-wrap items-center justify-center gap-6">
                            {[
                                {icon: Lock, label: 'End-to-End Encrypted'},
                                {icon: Shield, label: 'GDPR Compliant'},
                                {icon: BadgeCheck, label: '18+ Platform'},
                                {icon: Globe, label: '230+ Cities'},
                            ].map(({icon: Icon, label}) => (
                                <div key={label} className="flex items-center gap-1.5">
                                    <Icon className="w-3 h-3" style={{color: 'hsl(0 0% 100% / 0.3)'}}
                                          strokeWidth={1.5}/>
                                    <span className="text-[10px] font-semibold"
                                          style={{color: 'hsl(0 0% 100% / 0.35)'}}>{label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </Reveal>
            </section>

            {/* ════ FOOTER ════ */}
            <footer
                className="py-12 px-6 sm:px-10 md:px-14 lg:px-20"
                style={{
                    background: 'hsl(var(--surface-0))',
                    borderTop: '1px solid hsl(var(--border))',
                }}
            >
                <div className="max-w-7xl mx-auto">
                    <div className="flex flex-col md:flex-row items-start justify-between gap-10 mb-10">
                        {/* Brand */}
                        <div>
                            <div className="flex items-center gap-2.5 mb-4">
                                <div
                                    className="w-7 h-7 flex items-center justify-center"
                                    style={{
                                        background: 'var(--gradient-red)',
                                        boxShadow: '0 0 12px hsl(0 92% 54% / 0.4)'
                                    }}
                                >
                                    <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.2}/>
                                </div>
                                <div>
                                    <p className="text-[12px] font-black tracking-[-0.01em]">FIND YOUR KING</p>
                                    <p className="text-[7px] font-black tracking-[0.22em] uppercase text-muted-foreground mt-0.5">by
                                        FIND YOUR KING</p>
                                </div>
                            </div>
                            <p className="text-[11px] text-muted-foreground max-w-[220px] leading-relaxed">
                                The premium gay social platform. Real connections, live events, enterprise-grade
                                privacy.
                            </p>
                        </div>

                        {/* Links */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
                            {[
                                {
                                    heading: 'Platform',
                                    links: [{label: 'Features', href: '#'}, {
                                        label: 'Pricing',
                                        href: '#'
                                    }, {label: 'Safety', href: '#'}, {label: 'Events', href: '#'}]
                                },
                                {
                                    heading: 'Legal',
                                    links: [{label: 'Privacy', href: '/legal/privacy'}, {
                                        label: 'Terms',
                                        href: '/legal/terms'
                                    }, {label: 'Cookies', href: '/legal/cookies'}, {
                                        label: 'Community',
                                        href: '/legal/community-guidelines'
                                    }]
                                },
                                {
                                    heading: 'Company',
                                    links: [{label: 'About', href: '#'}, {label: 'Blog', href: '#'}, {
                                        label: 'Press',
                                        href: '#'
                                    }, {label: 'Contact', href: '#'}]
                                },
                            ].map(({heading, links}) => (
                                <div key={heading}>
                                    <p className="text-[9px] font-black tracking-[0.22em] uppercase text-muted-foreground/50 mb-3">{heading}</p>
                                    <ul className="space-y-2.5">
                                        {links.map(({label, href}) => (
                                            <li key={label}>
                                                <Link to={href}
                                                      className="text-[11px] font-semibold text-muted-foreground/60 hover:text-foreground transition-colors duration-120">
                                                    {label}
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div
                        className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6"
                        style={{borderTop: '1px solid hsl(var(--border) / 0.5)'}}
                    >
                        <p className="text-[10px] text-muted-foreground/40">© 2026 FIND YOUR KING · Find Your King · All rights
                            reserved</p>
                        <div
                            className="px-3 py-1 text-[9px] font-black tracking-[0.14em] uppercase"
                            style={{color: 'hsl(var(--rose))', border: '1px solid hsl(var(--rose) / 0.25)'}}
                        >18+ ONLY
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}
