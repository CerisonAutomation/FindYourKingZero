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
                                    src="https://storage1.machobb.com/mbb/c/5/f/6888e723d4f5c/black-omolink-mbb.png"
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
                        © {new Date().getFullYear()} MACHOBB. All rights reserved.
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
