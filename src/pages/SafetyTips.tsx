import {Link} from 'react-router-dom';
import {AlertTriangle, ArrowLeft, Eye, Lock, MapPin, Phone, Shield} from 'lucide-react';

const tips = [
    {
        icon: Eye,
        category: 'Before Meeting',
        items: ['Video call first to verify identity', 'Research the person on social media', 'Trust your instincts — if something feels off, it probably is', 'Never send money to someone you have not met in person']
    },
    {
        icon: MapPin,
        category: 'Meeting in Person',
        items: ['Always meet in a public place first', 'Tell a trusted friend where you are going and who you are meeting', 'Arrange your own transportation', 'Keep your phone charged and with you at all times']
    },
    {
        icon: Lock,
        category: 'Protecting Your Privacy',
        items: ['Don\'t share your full name, address, or workplace early on', 'Use the in-app messaging instead of sharing your phone number immediately', 'Be cautious about photos you share — check for location metadata', 'Use incognito mode if you don\'t want others to see you browsing']
    },
    {
        icon: Shield,
        category: 'At Events & Parties',
        items: ['Use the safety check-in feature when you arrive', 'Keep the panic button accessible in the app', 'Don\'t accept drinks from strangers or leave your drink unattended', 'Have an exit strategy and know how to get home safely']
    },
    {
        icon: AlertTriangle,
        category: 'Recognising Red Flags',
        items: ['Pressure to move off-platform immediately', 'Requests for financial information or money', 'Inconsistent stories or refusal to video call', 'Overly intense or controlling behaviour early on']
    },
];

export default function SafetyTips() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Link to="/"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8">
                    <ArrowLeft className="w-4 h-4"/> Back
                </Link>
                <div className="flex items-center gap-3 mb-2">
                    <Shield className="w-8 h-8 text-primary"/>
                    <h1 className="text-3xl font-bold">Safety Tips</h1>
                </div>
                <p className="text-muted-foreground mb-8">Your safety is our priority. Follow these tips to stay
                    safe.</p>
                <div className="space-y-6">
                    {tips.map(({icon: Icon, category, items}) => (
                        <div key={category} className="p-5  bg-card border border-border/40">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-9 h-9  bg-primary/10 flex items-center justify-center">
                                    <Icon className="w-4 h-4 text-primary"/>
                                </div>
                                <h3 className="font-semibold">{category}</h3>
                            </div>
                            <ul className="space-y-2">
                                {items.map((item) => (
                                    <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                                        <div className="w-1.5 h-1.5 rounded-full bg-primary mt-2 shrink-0"/>
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-5  bg-primary/5 border border-primary/20 flex items-center gap-4">
                    <Phone className="w-6 h-6 text-primary shrink-0"/>
                    <div>
                        <p className="font-semibold text-sm">Emergency? Call 999 (UK) / 911 (US)</p>
                        <p className="text-xs text-muted-foreground mt-0.5">If you are in immediate danger, always
                            contact emergency services first.</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
