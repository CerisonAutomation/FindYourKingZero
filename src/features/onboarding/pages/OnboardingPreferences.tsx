import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';

export default function OnboardingPreferences() {
    const navigate = useNavigate();
    return (
        <OnboardingShell step={6} total={10} title="Your Preferences" desc="Set your discovery preferences"
                         onNext={() => navigate('/onboarding/location')}
                         onBack={() => navigate('/onboarding/tribes-interests')}>
            <div className="py-8 text-center text-muted-foreground text-sm">Preferences can be customised in Settings →
                Filters after setup.
            </div>
        </OnboardingShell>
    );
}
