import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {Camera} from 'lucide-react';

export default function OnboardingPhotos() {
    const navigate = useNavigate();
    return (
        <OnboardingShell step={3} total={10} title="Add Photos" desc="At least 1 photo helps you get more connections"
                         onNext={() => navigate('/onboarding/tribes-interests')}
                         onBack={() => navigate('/onboarding/basics')} nextLabel="Continue (skip for now)">
            <div className="flex flex-col items-center justify-center py-12 gap-4">
                <div
                    className="w-24 h-24 rounded-2xl border-2 border-dashed border-border flex items-center justify-center bg-secondary/40">
                    <Camera className="w-8 h-8 text-muted-foreground"/>
                </div>
                <p className="text-sm text-muted-foreground text-center">Tap to upload your first photo<br/>You can add
                    more from your profile</p>
            </div>
        </OnboardingShell>
    );
}
