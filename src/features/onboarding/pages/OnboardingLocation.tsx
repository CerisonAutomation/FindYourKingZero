import {useNavigate} from 'react-router-dom';
import {useState} from 'react';
import OnboardingShell from './OnboardingShell';
import {MapPin} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {useUpdateProfile} from '@/hooks/useProfile';

export default function OnboardingLocation() {
    const navigate = useNavigate();
    const updateProfile = useUpdateProfile();
    const [granted, setGranted] = useState(false);

    const requestLocation = () => {
        if (!navigator.geolocation) {
            navigate('/onboarding/privacy');
            return;
        }
        navigator.geolocation.getCurrentPosition(async (pos) => {
            await updateProfile.mutateAsync({latitude: pos.coords.latitude, longitude: pos.coords.longitude});
            localStorage.setItem('onboarding_step', '7');
            setGranted(true);
        }, () => navigate('/onboarding/privacy'));
    };

    return (
        <OnboardingShell step={7} total={10} title="Your Location" desc="Used to show nearby people"
                         onNext={() => navigate('/onboarding/privacy')}
                         onBack={() => navigate('/onboarding/preferences')}
                         nextLabel={granted ? 'Continue' : 'Skip for now'}>
            <div className="flex flex-col items-center py-12 gap-5">
                <div
                    className="w-20 h-20 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                    <MapPin className="w-10 h-10 text-primary"/>
                </div>
                <p className="text-sm text-muted-foreground text-center max-w-xs">Allow location access to see who is
                    near you and appear in local searches.</p>
                {!granted ? (
                    <Button className="gradient-primary h-12 px-8" onClick={requestLocation}>Allow Location</Button>
                ) : (
                    <p className="text-sm text-emerald-500 font-semibold">Location set!</p>
                )}
            </div>
        </OnboardingShell>
    );
}
