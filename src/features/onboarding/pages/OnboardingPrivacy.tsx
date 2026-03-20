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
