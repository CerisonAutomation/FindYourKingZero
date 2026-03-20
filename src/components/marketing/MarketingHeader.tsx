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
                            <p className="text-[13px] font-black tracking-[-0.02em] leading-none">MACHOBB</p>
                            <p
                                className="text-[7px] font-black tracking-[0.1em] uppercase"
                                style={{color: 'hsl(var(--muted-foreground))'}}
                            >CONNECT · EXPLORE</p>
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
