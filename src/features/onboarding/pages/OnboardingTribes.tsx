import {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {useUpdateProfile} from '@/hooks/useProfile';
import {cn} from '@/lib/utils';

const TRIBES = ['Bear', 'Jock', 'Twink', 'Daddy', 'Muscle', 'Otter', 'Cub', 'Leather', 'Geek', 'Poz', 'Trans', 'Non-binary', 'Masc', 'Femme', 'Bi', 'Vers'];
const LOOKING = ['Chat', 'Friends', 'Dates', 'Relationship', 'Hookup', 'Networking', 'Right Now', 'Travel Buddy'];

export default function OnboardingTribes() {
    const navigate = useNavigate();
    const updateProfile = useUpdateProfile();
    const [tribes, setTribes] = useState<string[]>([]);
    const [lookingFor, setLookingFor] = useState<string[]>([]);

    const toggle = (arr: string[], setArr: (v: string[]) => void, val: string) =>
        setArr(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);

    const handleNext = async () => {
        await updateProfile.mutateAsync({tribes, looking_for: lookingFor});
        localStorage.setItem('onboarding_step', '5');
        navigate('/onboarding/preferences');
    };

    return (
        <OnboardingShell step={5} total={10} title="Tribes & Interests" desc="Select all that apply" onNext={handleNext}
                         onBack={() => navigate('/onboarding/photos')} loading={updateProfile.isPending}>
            <div className="space-y-6 pt-2">
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Tribes</p>
                    <div className="flex flex-wrap gap-2">
                        {TRIBES.map(t => (
                            <button key={t} onClick={() => toggle(tribes, setTribes, t)}
                                    className={cn('px-3 py-2 rounded-full text-sm border transition-all', tribes.includes(t) ? 'bg-primary/15 border-primary text-primary' : 'bg-card border-border/50 text-muted-foreground')}>{t}</button>
                        ))}
                    </div>
                </div>
                <div className="space-y-3">
                    <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Looking For</p>
                    <div className="flex flex-wrap gap-2">
                        {LOOKING.map(l => (
                            <button key={l} onClick={() => toggle(lookingFor, setLookingFor, l)}
                                    className={cn('px-3 py-2 rounded-full text-sm border transition-all', lookingFor.includes(l) ? 'bg-primary/15 border-primary text-primary' : 'bg-card border-border/50 text-muted-foreground')}>{l}</button>
                        ))}
                    </div>
                </div>
            </div>
        </OnboardingShell>
    );
}
