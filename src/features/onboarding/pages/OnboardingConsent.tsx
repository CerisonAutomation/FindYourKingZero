import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {Switch} from '@/components/ui/switch';

export default function OnboardingConsent() {
    const navigate = useNavigate();
    const [terms, setTerms] = useState(false);
    const [privacy, setPrivacy] = useState(false);
    const [age, setAge] = useState(false);

    const handleNext = async () => {
        if (!terms || !privacy || !age) return;
        // Consent stored locally — full consent_records table added in next migration
        localStorage.setItem('consent_granted', JSON.stringify({
            terms,
            privacy,
            age,
            version: '1.0',
            at: new Date().toISOString()
        }));
        localStorage.setItem('onboarding_step', '10');
        navigate('/onboarding/finish');
    };

    const items = [
        {label: 'I agree to the Terms of Service', key: 'terms', val: terms, set: setTerms},
        {label: 'I agree to the Privacy Policy', key: 'privacy', val: privacy, set: setPrivacy},
        {label: 'I confirm I am 18 or older', key: 'age', val: age, set: setAge},
    ];

    return (
        <OnboardingShell step={10} total={10} title="One Last Thing" desc="Please confirm the following"
                         onNext={handleNext} onBack={() => navigate('/onboarding/notifications')}
                         nextLabel="Agree & Finish" loading={!terms || !privacy || !age}>
            <div className="space-y-3 pt-2">
                {items.map(({label, key, val, set}) => (
                    <div key={key}
                         className="flex items-center justify-between p-4 rounded-2xl bg-card border border-border/40">
                        <span className="text-sm font-medium pr-4">{label}</span>
                        <Switch checked={val} onCheckedChange={set}/>
                    </div>
                ))}
            </div>
        </OnboardingShell>
    );
}
