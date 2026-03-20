import {Link} from 'react-router-dom';
import {AlertTriangle, ArrowLeft, Camera, Heart, MessageCircle, Shield, Users} from 'lucide-react';

const rules = [
    {
        icon: Heart,
        title: 'Respect & Dignity',
        body: 'Treat every member with respect. Hate speech, discrimination, or harassment based on race, ethnicity, gender identity, sexual orientation, religion, disability, or any other characteristic will result in immediate ban.'
    },
    {
        icon: Camera,
        title: 'Authentic Profiles',
        body: 'Use real photos of yourself. Do not impersonate others, use stock photos, or misrepresent your identity. Catfishing is a bannable offense.'
    },
    {
        icon: Shield,
        title: 'Age Policy (18+)',
        body: 'You must be 18 or older to use FindYourKing. Any content involving minors is strictly prohibited and will be reported to law enforcement.'
    },
    {
        icon: AlertTriangle,
        title: 'Zero Tolerance for Scams',
        body: 'Do not solicit money, financial information, or personal documents from other users. Scammers are banned and reported.'
    },
    {
        icon: MessageCircle,
        title: 'Consensual Communication',
        body: 'Respect when someone is not interested. Repeated unwanted messages, threats, or coercion are not tolerated.'
    },
    {
        icon: Users,
        title: 'Events & Parties',
        body: 'Event hosts are responsible for safety at their gatherings. Do not share event addresses publicly without host permission. Panic button is available for all attendees.'
    },
];

export default function CommunityGuidelines() {
    return (
        <div className="min-h-screen bg-background">
            <div className="max-w-2xl mx-auto px-4 py-12">
                <Link to="/"
                      className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 transition-colors">
                    <ArrowLeft className="w-4 h-4"/> Back
                </Link>
                <h1 className="text-3xl font-bold mb-2">Community Guidelines</h1>
                <p className="text-muted-foreground mb-8">These rules keep FindYourKing safe and welcoming for
                    everyone.</p>
                <div className="space-y-6">
                    {rules.map(({icon: Icon, title, body}) => (
                        <div key={title} className="flex gap-4 p-5  bg-card border border-border/40">
                            <div className="w-10 h-10  bg-primary/10 flex items-center justify-center shrink-0">
                                <Icon className="w-5 h-5 text-primary"/>
                            </div>
                            <div>
                                <h3 className="font-semibold mb-1">{title}</h3>
                                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="mt-8 p-5  bg-destructive/5 border border-destructive/20">
                    <h3 className="font-semibold text-destructive mb-2">Reporting Violations</h3>
                    <p className="text-sm text-muted-foreground">
                        Report any user, message, or event from the three-dot menu or the Safety Center. Our moderation
                        team reviews reports within 24 hours.
                    </p>
                </div>
            </div>
        </div>
    );
}
