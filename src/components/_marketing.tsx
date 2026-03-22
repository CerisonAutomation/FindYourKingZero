import {useEffect, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Button} from '@/components/ui/button';

export const CookieConsent = () => {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const consent = localStorage.getItem('FIND YOUR KING_cookie_consent');
        if (!consent) {
            // Show after a short delay for better UX
            const timer = setTimeout(() => setIsVisible(true), 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        localStorage.setItem('FIND YOUR KING_cookie_consent', 'accepted');
        setIsVisible(false);
    };

    const handleDeny = () => {
        localStorage.setItem('FIND YOUR KING_cookie_consent', 'denied');
        setIsVisible(false);
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    initial={{y: 100, opacity: 0}}
                    animate={{y: 0, opacity: 1}}
                    exit={{y: 100, opacity: 0}}
                    transition={{duration: 0.3}}
                    className="fixed bottom-0 left-0 right-0 z-50 p-4"
                >
                    <div
                        className="max-w-4xl mx-auto bg-[#141418] rounded-xl border border-[#2A2E35] p-4 sm:p-6 shadow-2xl">
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-[#B9BDC7] text-sm text-center sm:text-left">
                                We use cookies to maintain user session & generate statistics. Read our{' '}
                                <a
                                    href="https://FIND YOUR KING.com/legalfoot.php"
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[#E53945] hover:text-[#FF6B6B] underline transition-colors"
                                >
                                    Cookies policy
                                </a>
                            </p>

                            <div className="flex items-center gap-3">
                                <Button
                                    variant="outline"
                                    onClick={handleDeny}
                                    className="border-[#2A2E35] text-[#B9BDC7] hover:bg-[#2A2E35] hover:text-white px-6"
                                >
                                    Deny
                                </Button>
                                <Button
                                    onClick={handleAccept}
                                    className="bg-[#E53945] hover:bg-[#FF6B6B] text-white font-semibold px-6"
                                >
                                    I understand
                                </Button>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
import {useState} from 'react';

interface Language {
    code: string;
    name: string;
    flag: string;
}

const languages: Language[] = [
    {code: 'en', name: 'English', flag: 'https://FIND YOUR KING.com/img/lang_en.png'},
    {code: 'fr', name: 'Français', flag: 'https://FIND YOUR KING.com/img/lang_fr.png'},
    {code: 'es', name: 'Español', flag: 'https://FIND YOUR KING.com/img/lang_es.png'},
    {code: 'de', name: 'Deutsch', flag: 'https://FIND YOUR KING.com/img/lang_de.png'},
    {code: 'pt', name: 'Português', flag: 'https://FIND YOUR KING.com/img/lang_pt.png'},
    {code: 'it', name: 'Italiano', flag: 'https://FIND YOUR KING.com/img/lang_it.png'},
];

interface LanguageSelectorProps {
    variant?: 'header' | 'footer' | 'compact';
}

export const LanguageSelector = ({variant = 'header'}: LanguageSelectorProps) => {
    const [selectedLang, setSelectedLang] = useState('en');

    if (variant === 'compact') {
        return (
            <div className="flex items-center gap-2">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang.code)}
                        className={`w-6 h-6 rounded overflow-hidden transition-all duration-200 hover:scale-110 ${
                            selectedLang === lang.code ? 'ring-2 ring-[#E53945]' : 'opacity-70 hover:opacity-100'
                        }`}
                        title={lang.name}
                        aria-label={`Switch to ${lang.name}`}
                    >
                        <img
                            src={lang.flag}
                            alt={`${lang.name} language`}
                            className="w-full h-full object-cover"
                        />
                    </button>
                ))}
            </div>
        );
    }

    if (variant === 'footer') {
        return (
            <div className="flex flex-wrap gap-3">
                {languages.map((lang) => (
                    <button
                        key={lang.code}
                        onClick={() => setSelectedLang(lang.code)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-200 ${
                            selectedLang === lang.code
                                ? 'bg-[#E53945]/20 text-[#E53945]'
                                : 'bg-[#141418] text-[#B9BDC7] hover:bg-[#1a1a1f] hover:text-white'
                        }`}
                        aria-label={`Switch to ${lang.name}`}
                    >
                        <img
                            src={lang.flag}
                            alt={`${lang.name} flag`}
                            className="w-5 h-5 rounded"
                        />
                        <span className="text-sm">{lang.name}</span>
                    </button>
                ))}
            </div>
        );
    }

    // Header variant (default)
    return (
        <div className="flex items-center gap-1.5">
            {languages.map((lang) => (
                <button
                    key={lang.code}
                    onClick={() => setSelectedLang(lang.code)}
                    className={`w-6 h-6 rounded overflow-hidden transition-all duration-200 hover:scale-110 ${
                        selectedLang === lang.code ? 'ring-2 ring-[#E53945]' : 'opacity-70 hover:opacity-100'
                    }`}
                    title={lang.name}
                    aria-label={`Switch to ${lang.name}`}
                >
                    <img
                        src={lang.flag}
                        alt={`${lang.name} language`}
                        className="w-full h-full object-cover"
                    />
                </button>
            ))}
        </div>
    );
};
import {Link} from 'react-router-dom';
import {Crown, Globe, Lock, Shield} from 'lucide-react';
import {LanguageSelector} from './LanguageSelector';

const LEGAL_LINKS = [
    {label: 'Privacy Policy', href: '/privacy-policy'},
    {label: 'Terms of Service', href: '/terms-of-service'},
    {label: 'Cookie Policy', href: '/cookie-policy'},
    {label: 'Community Guidelines', href: '/community-guidelines'},
    {label: 'Safety Tips', href: '/safety-tips'},
];

const TRUST_ITEMS = [
    {icon: Shield, label: 'GDPR Compliant'},
    {icon: Lock, label: 'SSL Encrypted'},
    {icon: Globe, label: '230+ Cities'},
];

export const MarketingFooter = () => {
    return (
        <footer
            style={{
                background: 'hsl(var(--surface-0))',
                borderTop: '1px solid hsl(var(--border))',
            }}
        >
            {/* Main grid */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
                <div className="grid md:grid-cols-[240px_1fr_200px] gap-10">

                    {/* Brand column */}
                    <div>
                        <div className="flex items-center gap-2.5 mb-4">
                            <div
                                className="w-7 h-7 flex items-center justify-center"
                                style={{
                                    background: 'var(--gradient-primary)',
                                    boxShadow: '0 0 12px hsl(var(--primary) / 0.35)',
                                }}
                            >
                                <Crown className="w-3.5 h-3.5 text-white"/>
                            </div>
                            <div>
                                <p className="text-[13px] font-black tracking-[-0.02em]">FIND YOUR KING</p>
                                <p
                                    className="text-[8px] font-black tracking-[0.1em] uppercase"
                                    style={{color: 'hsl(var(--muted-foreground))'}}
                                >KING'S COURT · LIVE</p>
                            </div>
                        </div>
                        <p className="text-[12px] leading-relaxed" style={{color: 'hsl(var(--muted-foreground))'}}>
                            The premium gay social platform for adults seeking genuine connections,
                            live events, and spontaneous meetups.
                        </p>
                        <div className="mt-4">
                            <div
                                className="inline-flex items-center px-2.5 py-1 text-[9px] font-black tracking-[0.12em] uppercase"
                                style={{
                                    color: 'hsl(var(--rose))',
                                    border: '1px solid hsl(var(--rose) / 0.3)',
                                    background: 'hsl(var(--rose) / 0.06)',
                                }}
                            >18+ ADULTS ONLY
                            </div>
                        </div>
                    </div>

                    {/* Links columns */}
                    <div className="grid sm:grid-cols-2 gap-8">
                        {/* Legal */}
                        <div>
                            <h3
                                className="text-[9px] font-black tracking-[0.2em] uppercase mb-4"
                                style={{color: 'hsl(var(--muted-foreground))'}}
                            >Legal</h3>
                            <ul className="space-y-2.5">
                                {LEGAL_LINKS.map(({label, href}) => (
                                    <li key={label}>
                                        <Link
                                            to={href}
                                            className="text-[12px] font-medium transition-colors"
                                            style={{color: 'hsl(var(--muted-foreground))'}}
                                            onMouseEnter={(e) => (e.target as HTMLElement).style.color = 'hsl(var(--foreground))'}
                                            onMouseLeave={(e) => (e.target as HTMLElement).style.color = 'hsl(var(--muted-foreground))'}
                                        >
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Network + Trust */}
                        <div>
                            <h3
                                className="text-[9px] font-black tracking-[0.2em] uppercase mb-4"
                                style={{color: 'hsl(var(--muted-foreground))'}}
                            >Trust & Safety</h3>
                            <div className="space-y-2.5 mb-6">
                                {TRUST_ITEMS.map(({icon: Icon, label}) => (
                                    <div key={label} className="flex items-center gap-2">
                                        <Icon
                                            className="w-3.5 h-3.5 shrink-0"
                                            style={{color: 'hsl(var(--emerald))'}}
                                            strokeWidth={1.5}
                                        />
                                        <span
                                            className="text-[12px] font-medium"
                                            style={{color: 'hsl(var(--muted-foreground))'}}
                                        >{label}</span>
                                    </div>
                                ))}
                            </div>
                            <div>
                                <h3
                                    className="text-[9px] font-black tracking-[0.2em] uppercase mb-3"
                                    style={{color: 'hsl(var(--muted-foreground))'}}
                                >Network</h3>
                                <p
                                    className="text-[11px] mb-2"
                                    style={{color: 'hsl(var(--muted-foreground))'}}
                                >Part of the OmoLink network</p>
                                <img
                                    src="https://storage1.FIND YOUR KING.com/mbb/c/5/f/6888e723d4f5c/black-omolink-mbb.png"
                                    alt="OmoLink Network"
                                    className="h-7 opacity-70 hover:opacity-100 transition-opacity"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Language column */}
                    <div>
                        <h3
                            className="text-[9px] font-black tracking-[0.2em] uppercase mb-4"
                            style={{color: 'hsl(var(--muted-foreground))'}}
                        >Language</h3>
                        <LanguageSelector variant="footer"/>
                    </div>
                </div>
            </div>

            {/* Bottom bar */}
            <div
                className="px-4 sm:px-6 py-4"
                style={{borderTop: '1px solid hsl(var(--border) / 0.5)'}}
            >
                <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
                    <p
                        className="text-[11px] font-medium"
                        style={{color: 'hsl(var(--muted-foreground))'}}
                    >
                        © {new Date().getFullYear()} FIND YOUR KING. All rights reserved.
                    </p>
                    <div className="flex items-center gap-4">
                        <LanguageSelector variant="compact"/>
                        <p
                            className="text-[11px] font-medium"
                            style={{color: 'hsl(var(--muted-foreground))'}}
                        >Built for men who know what they want.</p>
                    </div>
                </div>
            </div>
        </footer>
    );
};
import {useState} from 'react';
import {Link} from 'react-router-dom';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowRight, Crown, Menu, X} from 'lucide-react';
import {LanguageSelector} from './LanguageSelector';

const NAV_LINKS = [
    {href: '#features', label: 'Features'},
    {href: '#pricing', label: 'Pricing'},
    {href: '#reviews', label: 'Reviews'},
];

export const MarketingHeader = () => {
    const [mobileOpen, setMobileOpen] = useState(false);

    return (
        <header
            className="fixed top-0 left-0 right-0 z-50"
            style={{
                background: 'hsl(220 18% 3% / 0.92)',
                backdropFilter: 'blur(24px) saturate(180%)',
                WebkitBackdropFilter: 'blur(24px) saturate(180%)',
                borderBottom: '1px solid hsl(220 12% 100% / 0.055)',
                boxShadow: '0 1px 0 hsl(0 0% 0% / 0.4)',
            }}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6">
                <div className="h-[60px] flex items-center justify-between gap-4">

                    {/* ── Logo ── */}
                    <Link to="/" className="flex items-center gap-2.5 shrink-0">
                        <div
                            className="w-7 h-7 flex items-center justify-center"
                            style={{
                                background: 'var(--gradient-primary)',
                                boxShadow: '0 0 14px hsl(214 100% 58% / 0.45)',
                            }}
                        >
                            <Crown className="w-3.5 h-3.5 text-white" strokeWidth={2.2}/>
                        </div>
                        <div className="hidden sm:block">
                            <p className="text-[13px] font-black tracking-[-0.02em] leading-none">FIND YOUR KING</p>
                            <p
                                className="text-[7px] font-black tracking-[0.1em] uppercase"
                                style={{color: 'hsl(var(--muted-foreground))'}}
                            >KING'S DOMAIN</p>
                        </div>
                    </Link>

                    {/* ── Desktop nav ── */}
                    <nav className="hidden md:flex items-center gap-1">
                        {NAV_LINKS.map(({href, label}) => (
                            <a
                                key={label}
                                href={href}
                                className="px-4 h-8 flex items-center text-[12px] font-semibold text-muted-foreground hover:text-foreground transition-colors duration-120"
                            >
                                {label}
                            </a>
                        ))}
                    </nav>

                    {/* ── Right actions ── */}
                    <div className="flex items-center gap-2">
                        <div className="hidden md:block">
                            <LanguageSelector/>
                        </div>

                        <Link to="/connect">
                            <button
                                className="hidden md:flex items-center h-8 px-4 text-[11px] font-black tracking-[0.1em] uppercase transition-all duration-120"
                                style={{
                                    color: 'hsl(var(--muted-foreground))',
                                    border: '1px solid transparent',
                                }}
                                onMouseEnter={(e) => {
                                    (e.target as HTMLElement).style.color = 'hsl(var(--foreground))';
                                }}
                                onMouseLeave={(e) => {
                                    (e.target as HTMLElement).style.color = 'hsl(var(--muted-foreground))';
                                }}
                            >
                                Log in
                            </button>
                        </Link>

                        <Link to="/connect?mode=register">
                            <button
                                className="flex items-center gap-1.5 h-8 px-4 text-[11px] font-black tracking-[0.1em] uppercase text-white transition-all duration-120 active:scale-[0.97]"
                                style={{
                                    background: 'var(--gradient-primary)',
                                    boxShadow: '0 2px 12px hsl(214 100% 58% / 0.35)',
                                }}
                            >
                                Get Started <ArrowRight className="w-3 h-3"/>
                            </button>
                        </Link>

                        {/* Mobile menu toggle */}
                        <button
                            onClick={() => setMobileOpen(!mobileOpen)}
                            className="md:hidden w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                            aria-label="Toggle menu"
                        >
                            {mobileOpen ? <X className="w-4.5 h-4.5"/> : <Menu className="w-4.5 h-4.5"/>}
                        </button>
                    </div>
                </div>
            </div>

            {/* ── Mobile menu ── */}
            <AnimatePresence>
                {mobileOpen && (
                    <motion.div
                        initial={{opacity: 0, y: -8}}
                        animate={{opacity: 1, y: 0}}
                        exit={{opacity: 0, y: -8}}
                        transition={{duration: 0.18}}
                        className="md:hidden"
                        style={{borderTop: '1px solid hsl(var(--border))'}}
                    >
                        <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-1">
                            {NAV_LINKS.map(({href, label}) => (
                                <a
                                    key={label}
                                    href={href}
                                    onClick={() => setMobileOpen(false)}
                                    className="px-3 h-10 flex items-center text-[13px] font-semibold text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    {label}
                                </a>
                            ))}

                            <div className="pt-3 flex flex-col gap-2"
                                 style={{borderTop: '1px solid hsl(var(--border) / 0.5)'}}>
                                <LanguageSelector/>
                                <Link to="/connect" onClick={() => setMobileOpen(false)}>
                                    <button
                                        className="w-full h-10 text-[12px] font-black tracking-[0.1em] uppercase transition-colors"
                                        style={{
                                            color: 'hsl(var(--muted-foreground))',
                                            border: '1px solid hsl(var(--border))',
                                        }}
                                    >
                                        Log In
                                    </button>
                                </Link>
                                <Link to="/connect?mode=register" onClick={() => setMobileOpen(false)}>
                                    <button
                                        className="w-full h-10 text-[12px] font-black tracking-[0.1em] uppercase text-white"
                                        style={{background: 'var(--gradient-primary)'}}
                                    >
                                        Get Started →
                                    </button>
                                </Link>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
};
