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
