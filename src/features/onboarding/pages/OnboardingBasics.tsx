import {useNavigate} from 'react-router-dom';
import OnboardingShell from './OnboardingShell';
import {useState} from 'react';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {useUpdateProfile} from '@/hooks/useProfile';
import {useAuth} from '@/hooks/useAuth';

export default function OnboardingBasics() {
    const navigate = useNavigate();
    const {user} = useAuth();
    const updateProfile = useUpdateProfile();
    const [form, setForm] = useState({display_name: '', age: '', city: ''});

    const handleNext = async () => {
        if (!form.display_name || !form.age) return;
        await updateProfile.mutateAsync({display_name: form.display_name, age: parseInt(form.age), city: form.city});
        localStorage.setItem('onboarding_step', '2');
        navigate('/onboarding/photos');
    };

    return (
        <OnboardingShell step={2} total={10} title="The Basics" desc="Tell us a bit about yourself" onNext={handleNext}
                         onBack={() => navigate('/onboarding/welcome')} loading={updateProfile.isPending}>
            <div className="space-y-4 pt-2">
                {[
                    {
                        label: 'Display Name *',
                        key: 'display_name',
                        placeholder: 'How you appear to others',
                        type: 'text'
                    },
                    {label: 'Age *', key: 'age', placeholder: '18+', type: 'number'},
                    {label: 'City', key: 'city', placeholder: 'Your city', type: 'text'},
                ].map(({label, key, placeholder, type}) => (
                    <div key={key} className="space-y-2">
                        <Label>{label}</Label>
                        <Input type={type} placeholder={placeholder} className="h-12"
                               value={form[key as keyof typeof form]}
                               onChange={(e) => setForm(p => ({...p, [key]: e.target.value}))}/>
                    </div>
                ))}
            </div>
        </OnboardingShell>
    );
}
