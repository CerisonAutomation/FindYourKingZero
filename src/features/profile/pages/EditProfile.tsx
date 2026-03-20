import {useNavigate} from 'react-router-dom';
import {Camera, ChevronLeft, Edit2} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {useProfile, useUpdateProfile} from '@/hooks/useProfile';
import {useEffect, useState} from 'react';
import {useToast} from '@/hooks/use-toast';

export default function EditProfile() {
    const navigate = useNavigate();
    const {profile} = useProfile();
    const updateProfile = useUpdateProfile();
    const {toast} = useToast();
    const [form, setForm] = useState({display_name: '', bio: '', city: '', age: ''});

    useEffect(() => {
        if (profile) setForm({
            display_name: profile.display_name || '',
            bio: profile.bio || '',
            city: profile.city || '',
            age: profile.age ? String(profile.age) : ''
        });
    }, [profile]);

    const handleSave = async () => {
        await updateProfile.mutateAsync({
            display_name: form.display_name,
            bio: form.bio,
            city: form.city,
            age: form.age ? parseInt(form.age) : undefined
        });
        toast({title: 'Profile updated'});
        navigate('/app/profile/me');
    };

    return (
        <div className="min-h-screen bg-background pb-28">
            <header
                className="sticky top-0 z-40 glass-heavy border-b border-[hsl(var(--glass-border))] px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" className="w-10 h-10 rounded-full"
                        onClick={() => navigate(-1)}><ChevronLeft className="w-5 h-5"/></Button>
                <h1 className="text-lg font-bold flex items-center gap-2"><Edit2 className="w-5 h-5 text-primary"/>Edit
                    Profile</h1>
                <Button className="ml-auto h-9 gradient-primary" onClick={handleSave}
                        disabled={updateProfile.isPending}>Save</Button>
            </header>

            <div className="px-4 py-6 space-y-5">
                <div className="flex flex-col items-center gap-3">
                    <div className="relative">
                        <div className="w-24 h-24 rounded-2xl bg-secondary overflow-hidden">
                            {profile?.avatar_url ?
                                <img src={profile.avatar_url} className="w-full h-full object-cover" alt="avatar"/> :
                                <div
                                    className="w-full h-full flex items-center justify-center text-4xl font-bold text-muted-foreground/30">{(profile?.display_name || 'U')[0]}</div>}
                        </div>
                        <div
                            className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gradient-primary flex items-center justify-center shadow-lg">
                            <Camera className="w-4 h-4 text-primary-foreground"/>
                        </div>
                    </div>
                    <p className="text-xs text-muted-foreground">Tap to change photo</p>
                </div>

                {[
                    {label: 'Display Name', key: 'display_name', placeholder: 'How you appear to others', type: 'text'},
                    {label: 'Age', key: 'age', placeholder: '18+', type: 'number'},
                    {label: 'City', key: 'city', placeholder: 'Your city', type: 'text'},
                ].map(({label, key, placeholder, type}) => (
                    <div key={key} className="space-y-2">
                        <Label>{label}</Label>
                        <Input type={type} placeholder={placeholder} className="h-11"
                               value={form[key as keyof typeof form]}
                               onChange={e => setForm(p => ({...p, [key]: e.target.value}))}/>
                    </div>
                ))}

                <div className="space-y-2">
                    <Label>Bio</Label>
                    <Textarea placeholder="Tell people about yourself…" value={form.bio}
                              onChange={e => setForm(p => ({...p, bio: e.target.value}))} rows={4}/>
                </div>
            </div>
        </div>
    );
}
