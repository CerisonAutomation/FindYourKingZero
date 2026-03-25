import {motion} from 'framer-motion';
import {BadgeCheck, ChevronLeft, ChevronRight, Crown, Heart, MapPin, MessageCircle, Ruler, Star, X} from 'lucide-react';
import {useState} from 'react';
import type {Profile} from '@/types';
import {Sheet, SheetContent} from '@/components/ui/sheet';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';

interface ProfileDetailProps {
    profile: Profile;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    isFavorited: boolean;
    onFavorite: (id: string) => void;
    onMessage: (id: string) => void;
}

export function ProfileDetail({
                                  profile,
                                  open,
                                  onOpenChange,
                                  isFavorited,
                                  onFavorite,
                                  onMessage
                              }: ProfileDetailProps) {
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const photos = [profile.avatar, ...profile.photos];

    const nextPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom"
                          className="h-[95vh] rounded-t-3xl bg-background border-border p-0 overflow-hidden">
                <div className="h-full overflow-y-auto scrollbar-hide">
                    {/* Photo Gallery */}
                    <div className="relative aspect-[3/4] max-h-[60vh]">
                        <motion.img
                            key={currentPhotoIndex}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            src={photos[currentPhotoIndex]}
                            alt={profile.name}
                            className="w-full h-full object-cover"
                        />
                        <div
                            className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent"/>

                        {/* Close Button */}
                        <button
                            onClick={() => onOpenChange(false)}
                            className="absolute top-4 right-4 w-10 h-10 rounded-full glass flex items-center justify-center"
                        >
                            <X className="w-5 h-5"/>
                        </button>

                        {/* Photo Navigation */}
                        {photos.length > 1 && (
                            <>
                                <button
                                    onClick={prevPhoto}
                                    className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center"
                                >
                                    <ChevronLeft className="w-5 h-5"/>
                                </button>
                                <button
                                    onClick={nextPhoto}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full glass flex items-center justify-center"
                                >
                                    <ChevronRight className="w-5 h-5"/>
                                </button>

                                {/* Photo Indicators */}
                                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5">
                                    {photos.map((_, index) => (
                                        <button
                                            key={index}
                                            onClick={() => setCurrentPhotoIndex(index)}
                                            className={cn(
                                                "w-2 h-2 rounded-full transition-all",
                                                index === currentPhotoIndex
                                                    ? "bg-primary w-6"
                                                    : "bg-foreground/30"
                                            )}
                                        />
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Online Status */}
                        {profile.isOnline && (
                            <div
                                className="absolute top-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/20 backdrop-blur-sm border border-green-500/30">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                                <span className="text-sm font-medium text-green-400">Online Now</span>
                            </div>
                        )}
                    </div>

                    {/* Profile Info */}
                    <div className="p-6 space-y-6">
                        {/* Header */}
                        <div className="flex items-start justify-between">
                            <div>
                                <div className="flex items-center gap-2">
                                    <h2 className="text-2xl font-bold">{profile.name}, {profile.age}</h2>
                                    {profile.isVerified && (
                                        <BadgeCheck className="w-6 h-6 text-primary"/>
                                    )}
                                    {profile.isPremium && (
                                        <Crown className="w-6 h-6 text-gold"/>
                                    )}
                                </div>
                                <div className="flex items-center gap-1.5 text-muted-foreground mt-1">
                                    <MapPin className="w-4 h-4"/>
                                    <span>{profile.location}</span>
                                    {profile.distance && (
                                        <span className="text-primary">• {profile.distance} mi away</span>
                                    )}
                                </div>
                            </div>

                            {profile.role === 'provider' && profile.rating && (
                                <div
                                    className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20">
                                    <Star className="w-4 h-4 fill-gold text-gold"/>
                                    <span className="font-semibold text-gold">{profile.rating}</span>
                                </div>
                            )}
                        </div>

                        {/* Stats for Providers */}
                        {profile.role === 'provider' && (
                            <div className="grid grid-cols-3 gap-4 p-4 rounded-2xl bg-secondary/50">
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-primary">${profile.hourly_rate ?? 0}</p>
                                    <p className="text-sm text-muted-foreground">per hour</p>
                                </div>
                                <div className="text-center border-x border-border">
                                    <p className="text-2xl font-bold">{profile.review_count ?? 0}</p>
                                    <p className="text-sm text-muted-foreground">reviews</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-2xl font-bold text-gold">{profile.rating ?? 0}</p>
                                    <p className="text-sm text-muted-foreground">rating</p>
                                </div>
                            </div>
                        )}

                        {/* Quick Info */}
                        <div className="flex flex-wrap gap-3">
                            {profile.height && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50">
                                    <Ruler className="w-4 h-4 text-muted-foreground"/>
                                    <span className="text-sm">{profile.height}</span>
                                </div>
                            )}
                            {profile.weight && (
                                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-secondary/50">
                                    <span className="text-sm">{profile.weight}</span>
                                </div>
                            )}
                        </div>

                        {/* Bio */}
                        <div>
                            <h3 className="font-semibold mb-2">About</h3>
                            <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
                        </div>

                        {/* Tribes */}
                        <div>
                            <h3 className="font-semibold mb-3">Tribes</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.tribes.map((tribe) => (
                                    <Badge key={tribe} variant="secondary" className="px-3 py-1">
                                        {tribe}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Looking For */}
                        <div>
                            <h3 className="font-semibold mb-3">Looking For</h3>
                            <div className="flex flex-wrap gap-2">
                                {profile.lookingFor.map((item) => (
                                    <Badge key={item}
                                           className="px-3 py-1 bg-primary/10 text-primary hover:bg-primary/20">
                                        {item}
                                    </Badge>
                                ))}
                            </div>
                        </div>

                        {/* Spacer for fixed buttons */}
                        <div className="h-24"/>
                    </div>
                </div>

                {/* Fixed Action Buttons */}
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-background via-background to-transparent pt-8">
                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            size="lg"
                            onClick={() => onFavorite(profile.id)}
                            className={cn(
                                "flex-1 h-14",
                                isFavorited && "border-primary text-primary"
                            )}
                        >
                            <Heart className={cn("w-5 h-5 mr-2", isFavorited && "fill-current")}/>
                            {isFavorited ? 'Saved' : 'Save'}
                        </Button>
                        <Button
                            size="lg"
                            onClick={() => {
                                onMessage(profile.id);
                                onOpenChange(false);
                            }}
                            className="flex-[2] h-14 gradient-primary hover:opacity-90"
                        >
                            <MessageCircle className="w-5 h-5 mr-2"/>
                            Message
                        </Button>
                    </div>
                </div>
            </SheetContent>
        </Sheet>
    );
}
