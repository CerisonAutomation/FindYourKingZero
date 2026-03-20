import {memo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {
    Award,
    Bell,
    Camera,
    Check,
    ChevronRight,
    CreditCard,
    Crown,
    Edit3,
    Eye,
    Heart,
    HelpCircle,
    Image,
    LogOut,
    MapPin,
    Ruler,
    Settings,
    Shield,
    Sparkles,
    Star,
    Upload,
    Users,
    Zap
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Progress} from '@/components/ui/progress';
import {Input} from '@/components/ui/input';
import {Textarea} from '@/components/ui/textarea';
import {Dialog, DialogContent, DialogHeader, DialogTitle} from '@/components/ui/dialog';
import {SubscriptionPlans} from '@/components/SubscriptionPlans';
import {VerificationBadges} from '@/components/verification/VerificationBadges';
import {PhotoVerification} from '@/components/verification/PhotoVerification';
import {AgeVerification} from '@/components/verification/AgeVerification';
import {useProfile, useUpdateProfile} from '@/hooks/useProfile';
import {useProfilePhotos, useUploadPhoto} from '@/hooks/useProfilePhotos';
import {useSubscription} from '@/hooks/useSubscription';
import {useAuth} from '@/hooks/useAuth';
import {cn} from '@/lib/utils';

interface ProfileTabProps {
    onSignOut?: () => void;
}

const StatCard = memo(({icon: Icon, value, label, color}: {
    icon: React.ElementType;
    value: number | string;
    label: string;
    color?: string;
}) => (
    <div className="text-center p-3 rounded-xl bg-secondary/30 border border-border/30">
        <div className="flex items-center justify-center gap-1.5 mb-1">
            <Icon className={cn("w-4 h-4", color || "text-primary")}/>
            <span className="text-xl font-bold">{value}</span>
        </div>
        <p className="text-xs text-muted-foreground">{label}</p>
    </div>
));

StatCard.displayName = 'StatCard';

const PhotoGrid = memo(({photos, onAddPhoto}: {
    photos: Array<{ id: string; url: string; is_primary?: boolean }>;
    onAddPhoto: () => void;
}) => (
    <div className="grid grid-cols-3 gap-2">
        {photos.slice(0, 5).map((photo, index) => (
            <div
                key={photo.id}
                className={cn(
                    "relative aspect-square rounded-xl overflow-hidden group",
                    index === 0 && "col-span-2 row-span-2"
                )}
            >
                <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                {photo.is_primary && (
                    <div
                        className="absolute top-2 left-2 px-2 py-0.5 bg-primary/90 backdrop-blur rounded-full text-xs font-medium">
                        Main
                    </div>
                )}
                <div
                    className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"/>
            </div>
        ))}
        <button
            onClick={onAddPhoto}
            className="aspect-square rounded-xl border-2 border-dashed border-border/50 flex flex-col items-center justify-center gap-1 hover:border-primary/50 hover:bg-primary/5 transition-colors"
        >
            <Upload className="w-5 h-5 text-muted-foreground"/>
            <span className="text-xs text-muted-foreground">Add</span>
        </button>
    </div>
));

PhotoGrid.displayName = 'PhotoGrid';

export function ProfileTab({onSignOut}: ProfileTabProps) {
    const {user} = useAuth();
    const {profile, isLoading} = useProfile();
    const {data: photos = []} = useProfilePhotos();
    const {subscription, isPremium} = useSubscription();
    const updateProfile = useUpdateProfile();
    const uploadPhoto = useUploadPhoto();

    const [isEditing, setIsEditing] = useState(false);
    const [showSubscription, setShowSubscription] = useState(false);
    const [showPhotoVerification, setShowPhotoVerification] = useState(false);
    const [showAgeVerification, setShowAgeVerification] = useState(false);
    const [editForm, setEditForm] = useState({
        display_name: '',
        bio: '',
        city: '',
        country: '',
    });

    const handleStartEdit = () => {
        if (profile) {
            setEditForm({
                display_name: profile.display_name || '',
                bio: profile.bio || '',
                city: profile.city || '',
                country: profile.country || '',
            });
        }
        setIsEditing(true);
    };

    const handleSaveEdit = () => {
        updateProfile.mutate(editForm, {
            onSuccess: () => setIsEditing(false),
        });
    };

    const handlePhotoUpload = () => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = (e.target as HTMLInputElement).files?.[0];
            if (file) {
                uploadPhoto.mutate({file, isPrimary: photos.length === 0});
            }
        };
        input.click();
    };

    // Calculate profile completion
    const completionItems = [
        {done: !!profile?.avatar_url, label: 'Profile photo'},
        {done: !!profile?.bio, label: 'Bio'},
        {done: (photos?.length || 0) >= 3, label: 'At least 3 photos'},
        {done: profile?.age_verified, label: 'Age verified'},
        {done: profile?.photo_verified, label: 'Photo verified'},
        {done: (profile?.interests?.length || 0) > 0, label: 'Interests added'},
    ];
    const completedCount = completionItems.filter(i => i.done).length;
    const completionPercent = Math.round((completedCount / completionItems.length) * 100);

    const menuItems = [
        {
            icon: Bell, label: 'Notifications', action: () => {
            }
        },
        {
            icon: Shield, label: 'Privacy & Security', action: () => {
            }
        },
        {
            icon: CreditCard,
            label: 'Subscription',
            badge: isPremium ? 'PRO' : undefined,
            action: () => setShowSubscription(true)
        },
        {
            icon: HelpCircle, label: 'Help & Support', action: () => {
            }
        },
        {
            icon: Settings, label: 'Settings', action: () => {
            }
        },
    ];

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"/>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Hero Header */}
            <div className="relative h-56 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/40 via-accent/30 to-background"/>
                <div
                    className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/30 via-transparent to-transparent"/>

                {/* Animated particles */}
                <div className="absolute inset-0 overflow-hidden">
                    {[...Array(20)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="absolute w-1 h-1 bg-primary/40 rounded-full"
                            initial={{x: Math.random() * 400, y: Math.random() * 200, opacity: 0}}
                            animate={{
                                y: [null, Math.random() * -100],
                                opacity: [0, 1, 0],
                            }}
                            transition={{
                                duration: 3 + Math.random() * 2,
                                repeat: Infinity,
                                delay: Math.random() * 2,
                            }}
                        />
                    ))}
                </div>

                {/* Settings Button */}
                <button
                    className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center z-10 hover:bg-white/10 transition-colors">
                    <Settings className="w-5 h-5"/>
                </button>

                {/* Premium Badge */}
                {isPremium && (
                    <motion.div
                        initial={{opacity: 0, scale: 0.8}}
                        animate={{opacity: 1, scale: 1}}
                        className="absolute top-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-gold/20 to-gold/10 border border-gold/30 backdrop-blur-sm"
                    >
                        <Crown className="w-4 h-4 text-gold"/>
                        <span className="text-sm font-semibold text-gold">Premium</span>
                    </motion.div>
                )}
            </div>

            {/* Profile Section */}
            <div className="px-4 -mt-24">
                {/* Avatar */}
                <div className="relative inline-block">
                    <motion.div
                        initial={{scale: 0.9, opacity: 0}}
                        animate={{scale: 1, opacity: 1}}
                        className="relative"
                    >
                        <Avatar className="w-32 h-32 border-4 border-background shadow-2xl ring-4 ring-primary/20">
                            <AvatarImage src={profile?.avatar_url || ''}/>
                            <AvatarFallback className="text-3xl bg-gradient-to-br from-primary/20 to-accent/20">
                                {profile?.display_name?.[0] || 'U'}
                            </AvatarFallback>
                        </Avatar>
                        <button
                            onClick={handlePhotoUpload}
                            className="absolute bottom-2 right-2 w-10 h-10 rounded-full gradient-primary text-primary-foreground flex items-center justify-center shadow-lg hover:scale-105 transition-transform"
                        >
                            <Camera className="w-5 h-5"/>
                        </button>
                        {profile?.is_online && (
                            <div
                                className="absolute top-2 right-2 w-5 h-5 rounded-full bg-green-500 border-4 border-background animate-pulse"/>
                        )}
                    </motion.div>
                </div>

                {/* Name & Badges */}
                <div className="mt-4">
                    <div className="flex items-center gap-2 flex-wrap">
                        <h1 className="text-2xl font-bold">
                            {profile?.display_name || 'Anonymous'}{profile?.age ? `, ${profile.age}` : ''}
                        </h1>
                        <VerificationBadges
                            ageVerified={profile?.age_verified || false}
                            photoVerified={profile?.photo_verified || false}
                            idVerified={profile?.id_verified || false}
                            phoneVerified={profile?.phone_verified || false}
                        />
                    </div>
                    <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4"/>
                        <span>{profile?.city || 'Location not set'}{profile?.country ? `, ${profile.country}` : ''}</span>
                    </div>
                </div>

                {/* Action Buttons */}
                <div className="flex gap-2 mt-4">
                    <Button
                        variant="outline"
                        className="flex-1"
                        onClick={handleStartEdit}
                    >
                        <Edit3 className="w-4 h-4 mr-2"/>
                        Edit Profile
                    </Button>
                    {!isPremium && (
                        <Button
                            className="flex-1 gradient-primary"
                            onClick={() => setShowSubscription(true)}
                        >
                            <Crown className="w-4 h-4 mr-2"/>
                            Go Premium
                        </Button>
                    )}
                </div>

                {/* Stats Grid */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.1}}
                    className="grid grid-cols-4 gap-2 mt-6"
                >
                    <StatCard icon={Eye} value={profile?.views_count || 0} label="Views"/>
                    <StatCard icon={Heart} value={profile?.favorites_count || 0} label="Likes" color="text-red-500"/>
                    <StatCard icon={Users} value={0} label="Matches" color="text-pink-500"/>
                    <StatCard icon={Star} value={profile?.rating?.toFixed(1) || '5.0'} label="Rating"
                              color="text-gold"/>
                </motion.div>

                {/* Profile Completion */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.15}}
                    className="mt-4 p-4 rounded-2xl bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Sparkles className="w-5 h-5 text-primary"/>
                            <span className="font-semibold">Profile Completion</span>
                        </div>
                        <span className="text-lg font-bold text-primary">{completionPercent}%</span>
                    </div>
                    <Progress value={completionPercent} className="h-2 mb-3"/>
                    <div className="flex flex-wrap gap-2">
                        {completionItems.filter(i => !i.done).slice(0, 2).map((item, i) => (
                            <Badge key={i} variant="outline" className="text-xs">
                                {item.label}
                            </Badge>
                        ))}
                    </div>
                </motion.div>

                {/* Verification Section */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.2}}
                    className="mt-4 p-4 rounded-2xl bg-card border border-border/50"
                >
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                        <Shield className="w-5 h-5 text-primary"/>
                        Verification Status
                    </h3>
                    <div className="space-y-3">
                        {[
                            {
                                verified: profile?.age_verified,
                                icon: Shield,
                                label: 'Age Verified',
                                desc: 'Confirm you are 18+',
                                action: () => setShowAgeVerification(true),
                            },
                            {
                                verified: profile?.photo_verified,
                                icon: Camera,
                                label: 'Photo Verified',
                                desc: 'Take a selfie to verify identity',
                                action: () => setShowPhotoVerification(true),
                            },
                            {
                                verified: profile?.id_verified,
                                icon: Award,
                                label: 'ID Verified',
                                desc: 'Premium verification with ID',
                                action: () => {
                                },
                            },
                        ].map((item) => (
                            <div key={item.label}
                                 className="flex items-center justify-between p-3 rounded-xl bg-secondary/30">
                                <div className="flex items-center gap-3">
                                    <div className={cn(
                                        "w-10 h-10 rounded-full flex items-center justify-center",
                                        item.verified ? "bg-green-500/10" : "bg-muted"
                                    )}>
                                        <item.icon
                                            className={cn("w-5 h-5", item.verified ? "text-green-500" : "text-muted-foreground")}/>
                                    </div>
                                    <div>
                                        <p className="font-medium text-sm">{item.label}</p>
                                        <p className="text-xs text-muted-foreground">{item.desc}</p>
                                    </div>
                                </div>
                                {item.verified ? (
                                    <Check className="w-5 h-5 text-green-500"/>
                                ) : (
                                    <Button size="sm" variant="outline" onClick={item.action}>
                                        Verify
                                    </Button>
                                )}
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Photos Section */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.25}}
                    className="mt-4 p-4 rounded-2xl bg-card border border-border/50"
                >
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold flex items-center gap-2">
                            <Image className="w-5 h-5 text-primary"/>
                            My Photos
                        </h3>
                        <span className="text-sm text-muted-foreground">{photos?.length || 0}/6</span>
                    </div>
                    <PhotoGrid photos={photos || []} onAddPhoto={handlePhotoUpload}/>
                </motion.div>

                {/* Bio */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.3}}
                    className="mt-4 p-4 rounded-2xl bg-card border border-border/50"
                >
                    <h3 className="font-semibold mb-2">About Me</h3>
                    <p className="text-muted-foreground text-sm leading-relaxed">
                        {profile?.bio || 'No bio yet. Tell others about yourself!'}
                    </p>
                </motion.div>

                {/* Details */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.35}}
                    className="mt-4 p-4 rounded-2xl bg-card border border-border/50"
                >
                    <h3 className="font-semibold mb-3">Details</h3>
                    <div className="grid grid-cols-2 gap-3">
                        {profile?.height && (
                            <div className="flex items-center gap-2 text-sm">
                                <Ruler className="w-4 h-4 text-muted-foreground"/>
                                <span>{profile.height} cm</span>
                            </div>
                        )}
                        {profile?.weight && (
                            <div className="flex items-center gap-2 text-sm">
                                <span className="text-muted-foreground">Weight:</span>
                                <span>{profile.weight} kg</span>
                            </div>
                        )}
                        {profile?.hourly_rate && (
                            <div className="flex items-center gap-2 text-sm col-span-2">
                                <Zap className="w-4 h-4 text-gold"/>
                                <span className="text-gold font-semibold">${profile.hourly_rate}/hr</span>
                            </div>
                        )}
                    </div>
                </motion.div>

                {/* Tribes */}
                {(profile?.tribes?.length || 0) > 0 && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.4}}
                        className="mt-4 p-4 rounded-2xl bg-card border border-border/50"
                    >
                        <h3 className="font-semibold mb-3">My Tribes</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile?.tribes?.map((tribe) => (
                                <Badge key={tribe} variant="secondary" className="px-3 py-1">
                                    {tribe}
                                </Badge>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Looking For */}
                {(profile?.looking_for?.length || 0) > 0 && (
                    <motion.div
                        initial={{opacity: 0, y: 20}}
                        animate={{opacity: 1, y: 0}}
                        transition={{delay: 0.45}}
                        className="mt-4 p-4 rounded-2xl bg-card border border-border/50"
                    >
                        <h3 className="font-semibold mb-3">Looking For</h3>
                        <div className="flex flex-wrap gap-2">
                            {profile?.looking_for?.map((item) => (
                                <Badge key={item} className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">
                                    {item}
                                </Badge>
                            ))}
                        </div>
                    </motion.div>
                )}

                {/* Menu */}
                <motion.div
                    initial={{opacity: 0, y: 20}}
                    animate={{opacity: 1, y: 0}}
                    transition={{delay: 0.5}}
                    className="mt-6 rounded-2xl bg-card border border-border/50 overflow-hidden"
                >
                    {menuItems.map((item, index) => (
                        <button
                            key={item.label}
                            onClick={item.action}
                            className={cn(
                                "w-full flex items-center justify-between p-4 hover:bg-secondary/50 transition-colors",
                                index !== menuItems.length - 1 && "border-b border-border/50"
                            )}
                        >
                            <div className="flex items-center gap-3">
                                <item.icon className="w-5 h-5 text-muted-foreground"/>
                                <span className="font-medium">{item.label}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                {item.badge && (
                                    <Badge className="bg-gold text-black text-xs">
                                        {item.badge}
                                    </Badge>
                                )}
                                <ChevronRight className="w-4 h-4 text-muted-foreground"/>
                            </div>
                        </button>
                    ))}
                </motion.div>

                {/* Logout */}
                <Button
                    variant="ghost"
                    className="w-full mt-4 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={onSignOut}
                >
                    <LogOut className="w-4 h-4 mr-2"/>
                    Sign Out
                </Button>

                {/* Version */}
                <p className="text-center text-xs text-muted-foreground mt-4 mb-8">
                    Version 2.0.0 • Made with ❤️
                </p>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={isEditing} onOpenChange={setIsEditing}>
                <DialogContent className="max-w-md">
                    <DialogHeader>
                        <DialogTitle>Edit Profile</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Display Name</label>
                            <Input
                                value={editForm.display_name}
                                onChange={(e) => setEditForm({...editForm, display_name: e.target.value})}
                                placeholder="Your name"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Bio</label>
                            <Textarea
                                value={editForm.bio}
                                onChange={(e) => setEditForm({...editForm, bio: e.target.value})}
                                placeholder="Tell others about yourself..."
                                rows={4}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">City</label>
                                <Input
                                    value={editForm.city}
                                    onChange={(e) => setEditForm({...editForm, city: e.target.value})}
                                    placeholder="Your city"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Country</label>
                                <Input
                                    value={editForm.country}
                                    onChange={(e) => setEditForm({...editForm, country: e.target.value})}
                                    placeholder="Your country"
                                />
                            </div>
                        </div>
                        <Button
                            onClick={handleSaveEdit}
                            className="w-full gradient-primary"
                            disabled={updateProfile.isPending}
                        >
                            {updateProfile.isPending ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Subscription Dialog */}
            <Dialog open={showSubscription} onOpenChange={setShowSubscription}>
                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                    <SubscriptionPlans onClose={() => setShowSubscription(false)}/>
                </DialogContent>
            </Dialog>

            {/* Photo Verification */}
            <AnimatePresence>
                {showPhotoVerification && (
                    <PhotoVerification
                        onComplete={() => setShowPhotoVerification(false)}
                        onCancel={() => setShowPhotoVerification(false)}
                    />
                )}
            </AnimatePresence>

            {/* Age Verification */}
            <AnimatePresence>
                {showAgeVerification && (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                        className="fixed inset-0 bg-background/95 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                    >
                        <AgeVerification
                            onComplete={() => setShowAgeVerification(false)}
                            onSkip={() => setShowAgeVerification(false)}
                        />
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
