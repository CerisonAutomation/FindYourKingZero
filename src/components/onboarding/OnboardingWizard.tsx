import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {ArrowLeft, ArrowRight, Camera, Check, Crown, Heart, Sparkles, Upload, User} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Label} from '@/components/ui/label';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {useUpdateProfile} from '@/hooks/useProfile';
import {useUploadPhoto} from '@/hooks/useProfilePhotos';
import {cn} from '@/lib/utils';

interface OnboardingWizardProps {
    onComplete: () => void;
    onSkip: () => void;
}

const TRIBES = ['Bear', 'Twink', 'Otter', 'Jock', 'Daddy', 'Cub', 'Geek', 'Leather', 'Muscle'];
const LOOKING_FOR = ['Dating', 'Friends', 'Networking', 'Hookups', 'Relationship', 'Chat'];

export function OnboardingWizard({onComplete, onSkip}: OnboardingWizardProps) {
    const [step, setStep] = useState(0);
    const [formData, setFormData] = useState({
        display_name: '',
        bio: '',
        age: '',
        city: '',
        country: '',
        tribes: [] as string[],
        looking_for: [] as string[],
    });
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    const updateProfile = useUpdateProfile();
    const uploadPhoto = useUploadPhoto();

    const steps = [
        {title: 'Welcome', icon: Crown},
        {title: 'Photo', icon: Camera},
        {title: 'About', icon: User},
        {title: 'Interests', icon: Heart},
        {title: 'Ready', icon: Sparkles},
    ];

    const progress = ((step + 1) / steps.length) * 100;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setPhotoPreview(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const toggleTribe = (tribe: string) => {
        setFormData(prev => ({
            ...prev,
            tribes: prev.tribes.includes(tribe)
                ? prev.tribes.filter(t => t !== tribe)
                : [...prev.tribes, tribe].slice(0, 3),
        }));
    };

    const toggleLookingFor = (item: string) => {
        setFormData(prev => ({
            ...prev,
            looking_for: prev.looking_for.includes(item)
                ? prev.looking_for.filter(l => l !== item)
                : [...prev.looking_for, item].slice(0, 3),
        }));
    };

    const handleNext = async () => {
        if (step === steps.length - 1) {
            // Final step - save everything
            try {
                if (photoFile) {
                    await uploadPhoto.mutateAsync({file: photoFile, isPrimary: true});
                }

                await updateProfile.mutateAsync({
                    display_name: formData.display_name || null,
                    bio: formData.bio || null,
                    age: formData.age ? parseInt(formData.age) : null,
                    city: formData.city || null,
                    country: formData.country || null,
                    tribes: formData.tribes,
                    looking_for: formData.looking_for,
                });

                onComplete();
            } catch (error) {
                console.error('Error saving profile:', error);
            }
        } else {
            setStep(prev => prev + 1);
        }
    };

    const handleBack = () => {
        if (step > 0) {
            setStep(prev => prev - 1);
        }
    };

    const canProceed = () => {
        switch (step) {
            case 1:
                return true; // Photo is optional
            case 2:
                return formData.display_name.trim().length > 0;
            case 3:
                return true; // Interests optional
            default:
                return true;
        }
    };

    return (
        <div className="fixed inset-0 z-50 bg-background flex flex-col">
            {/* Header */}
            <header className="p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Crown className="w-6 h-6 text-primary"/>
                    <span className="font-bold">Find Your King</span>
                </div>
                <Button variant="ghost" size="sm" onClick={onSkip}>
                    Skip for now
                </Button>
            </header>

            {/* Progress */}
            <div className="px-4">
                <Progress value={progress} className="h-2"/>
                <div className="flex justify-between mt-2">
                    {steps.map((s, i) => (
                        <div
                            key={s.title}
                            className={cn(
                                "flex flex-col items-center gap-1",
                                i <= step ? "text-primary" : "text-muted-foreground"
                            )}
                        >
                            <div className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center",
                                i < step ? "bg-primary text-primary-foreground" :
                                    i === step ? "bg-primary/20 border-2 border-primary" :
                                        "bg-muted"
                            )}>
                                {i < step ? <Check className="w-4 h-4"/> : <s.icon className="w-4 h-4"/>}
                            </div>
                            <span className="text-xs hidden sm:block">{s.title}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={step}
                        initial={{opacity: 0, x: 20}}
                        animate={{opacity: 1, x: 0}}
                        exit={{opacity: 0, x: -20}}
                        className="max-w-md mx-auto"
                    >
                        {step === 0 && (
                            <div className="text-center space-y-6 py-8">
                                <motion.div
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center"
                                >
                                    <Crown className="w-12 h-12 text-primary-foreground"/>
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">Welcome, King! 👑</h1>
                                    <p className="text-muted-foreground">
                                        Let's set up your royal profile in just a few steps.
                                        This will help you find your perfect match.
                                    </p>
                                </div>
                                <div className="grid grid-cols-3 gap-4 mt-8">
                                    {[
                                        {icon: '📸', label: 'Add Photo'},
                                        {icon: '✏️', label: 'Share Bio'},
                                        {icon: '💕', label: 'Find Matches'},
                                    ].map((item) => (
                                        <div key={item.label}
                                             className="p-4 rounded-xl bg-card border border-border/50">
                                            <span className="text-2xl">{item.icon}</span>
                                            <p className="text-xs mt-2 text-muted-foreground">{item.label}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {step === 1 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2">Add a Profile Photo</h2>
                                    <p className="text-muted-foreground">
                                        Profiles with photos get 10x more matches! 📸
                                    </p>
                                </div>

                                <label className="block cursor-pointer">
                                    <div
                                        className="aspect-square max-w-xs mx-auto rounded-2xl border-2 border-dashed border-border hover:border-primary/50 transition-colors overflow-hidden bg-card flex items-center justify-center">
                                        {photoPreview ? (
                                            <img src={photoPreview} alt="Preview"
                                                 className="w-full h-full object-cover"/>
                                        ) : (
                                            <div className="text-center p-8">
                                                <Upload className="w-12 h-12 mx-auto text-muted-foreground mb-4"/>
                                                <p className="text-sm text-muted-foreground">
                                                    Tap to upload a photo
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={handlePhotoChange}
                                        className="hidden"
                                    />
                                </label>

                                <p className="text-xs text-center text-muted-foreground">
                                    Use a clear photo of your face. No sunglasses, no group photos.
                                </p>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2">Tell Us About Yourself</h2>
                                    <p className="text-muted-foreground">
                                        Let others know who you are!
                                    </p>
                                </div>

                                <div className="space-y-4">
                                    <div>
                                        <Label htmlFor="name">Display Name *</Label>
                                        <Input
                                            id="name"
                                            value={formData.display_name}
                                            onChange={(e) => setFormData(prev => ({
                                                ...prev,
                                                display_name: e.target.value
                                            }))}
                                            placeholder="Your display name"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div>
                                        <Label htmlFor="age">Age</Label>
                                        <Input
                                            id="age"
                                            type="number"
                                            min="18"
                                            max="99"
                                            value={formData.age}
                                            onChange={(e) => setFormData(prev => ({...prev, age: e.target.value}))}
                                            placeholder="Your age"
                                            className="mt-1"
                                        />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="city">City</Label>
                                            <Input
                                                id="city"
                                                value={formData.city}
                                                onChange={(e) => setFormData(prev => ({...prev, city: e.target.value}))}
                                                placeholder="Your city"
                                                className="mt-1"
                                            />
                                        </div>
                                        <div>
                                            <Label htmlFor="country">Country</Label>
                                            <Input
                                                id="country"
                                                value={formData.country}
                                                onChange={(e) => setFormData(prev => ({
                                                    ...prev,
                                                    country: e.target.value
                                                }))}
                                                placeholder="Your country"
                                                className="mt-1"
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="bio">Bio</Label>
                                        <Textarea
                                            id="bio"
                                            value={formData.bio}
                                            onChange={(e) => setFormData(prev => ({...prev, bio: e.target.value}))}
                                            placeholder="Tell others about yourself..."
                                            className="mt-1 min-h-[100px]"
                                            maxLength={500}
                                        />
                                        <p className="text-xs text-muted-foreground mt-1 text-right">
                                            {formData.bio.length}/500
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="space-y-6">
                                <div className="text-center">
                                    <h2 className="text-2xl font-bold mb-2">Your Interests</h2>
                                    <p className="text-muted-foreground">
                                        Select up to 3 tribes and what you're looking for
                                    </p>
                                </div>

                                <div>
                                    <Label className="mb-3 block">My Tribes (select up to 3)</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {TRIBES.map((tribe) => (
                                            <Badge
                                                key={tribe}
                                                variant={formData.tribes.includes(tribe) ? 'default' : 'outline'}
                                                className={cn(
                                                    "cursor-pointer transition-all px-4 py-2",
                                                    formData.tribes.includes(tribe) && "bg-primary"
                                                )}
                                                onClick={() => toggleTribe(tribe)}
                                            >
                                                {tribe}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label className="mb-3 block">Looking For (select up to 3)</Label>
                                    <div className="flex flex-wrap gap-2">
                                        {LOOKING_FOR.map((item) => (
                                            <Badge
                                                key={item}
                                                variant={formData.looking_for.includes(item) ? 'default' : 'outline'}
                                                className={cn(
                                                    "cursor-pointer transition-all px-4 py-2",
                                                    formData.looking_for.includes(item) && "bg-accent"
                                                )}
                                                onClick={() => toggleLookingFor(item)}
                                            >
                                                {item}
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        )}

                        {step === 4 && (
                            <div className="text-center space-y-6 py-8">
                                <motion.div
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    className="w-24 h-24 mx-auto rounded-full bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center"
                                >
                                    <Sparkles className="w-12 h-12 text-white"/>
                                </motion.div>
                                <div>
                                    <h1 className="text-3xl font-bold mb-2">You're All Set! 🎉</h1>
                                    <p className="text-muted-foreground">
                                        Your profile is ready. Start exploring and find your king!
                                    </p>
                                </div>

                                <div className="p-4 rounded-2xl bg-card border border-border/50 text-left space-y-3">
                                    <h3 className="font-semibold flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-primary"/>
                                        Pro Tips:
                                    </h3>
                                    <ul className="text-sm text-muted-foreground space-y-2">
                                        <li>• Complete your profile for better matches</li>
                                        <li>• Verify your photo to build trust</li>
                                        <li>• Be respectful and have fun!</li>
                                    </ul>
                                </div>
                            </div>
                        )}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-border/50 flex gap-3">
                {step > 0 && (
                    <Button variant="outline" onClick={handleBack} className="gap-2">
                        <ArrowLeft className="w-4 h-4"/>
                        Back
                    </Button>
                )}
                <Button
                    className="flex-1 gradient-primary gap-2"
                    onClick={handleNext}
                    disabled={!canProceed() || updateProfile.isPending || uploadPhoto.isPending}
                >
                    {step === steps.length - 1 ? (
                        <>
                            Start Exploring
                            <Sparkles className="w-4 h-4"/>
                        </>
                    ) : (
                        <>
                            Continue
                            <ArrowRight className="w-4 h-4"/>
                        </>
                    )}
                </Button>
            </div>
        </div>
    );
}
