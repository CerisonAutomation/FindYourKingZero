/**
 * 🎯 UNIFIED PROFILE DISPLAY COMPONENT
 * Consolidates ProfileCard, ProfileDetail, ProfileView into single component
 * Supports multiple display modes and layouts for maximum reusability
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BadgeCheck,
  Crown,
  Heart,
  MapPin,
  MessageCircle,
  Star,
  ChevronLeft,
  ChevronRight,
  Edit,
  Share2,
  Ban,
  Calendar,
  Shield,
  Camera,
  Trash2,
  Plus,
  Bell
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Sheet, SheetContent } from '@/components/ui/sheet';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';

// Unified Profile Types
export type UnifiedProfile =  {
  id: string;
  user_id?: string;
  name?: string;
  display_name?: string | null;
  age?: number | null;
  bio?: string;
  location?: string;
  city?: string | null;
  country?: string | null;
  distance?: number;
  avatar?: string;
  avatar_url?: string | null;
  photos?: string[];
  tribes?: string[];
  interests?: string[];
  isOnline?: boolean;
  is_online?: boolean;
  isVerified?: boolean;
  is_verified?: boolean;
  isPremium?: boolean;
  is_available_now?: boolean;
  role?: 'seeker' | 'provider';
  hourly_rate?: number | null;
  rating?: number | null;
  reviewCount?: number;
  favorites_count?: number;
  stats?: {
    profileViews?: number;
    profileLikes?: number;
    matches?: number;
    messages?: number;
    responseRate?: number;
  };
  social?: {
    instagram?: string;
    twitter?: string;
    website?: string;
  };
  verification?: {
    photo?: boolean;
    age?: boolean;
    identity?: boolean;
    phone?: boolean;
  };
  membership?: {
    tier: 'free' | 'premium' | 'vip';
    expiresAt?: string;
  };
}

export type ProfileActions =  {
  onFavorite?: (id: string) => void;
  onUnfavorite?: (id: string) => void;
  onMessage?: (id: string) => void;
  onBlock?: (id: string) => void;
  onReport?: (id: string) => void;
  onShare?: (profile: UnifiedProfile) => void;
  onEdit?: (profile: UnifiedProfile) => void;
  onViewPhotos?: (photos: string[], startIndex?: number) => void;
}

export type ProfileDisplayMode = 'card' | 'detail' | 'full' | 'gallery' | 'compact';
export type ProfileLayout = 'grid' | 'list' | 'modal' | 'sheet' | 'page';

interface UnifiedProfileDisplayProps {
  profile: UnifiedProfile;
  mode: ProfileDisplayMode;
  layout?: ProfileLayout;
  actions?: ProfileActions;
  isFavorited?: boolean;
  isOwnProfile?: boolean;
  showActions?: boolean;
  showStats?: boolean;
  showVerification?: boolean;
  className?: string;
  index?: number;
}

export function UnifiedProfileDisplay({
  profile,
  mode,
  layout = 'grid',
  actions,
  isFavorited = false,
  isOwnProfile = false,
  showActions = true,
  showStats = true,
  showVerification = true,
  className,
  index = 0
}: UnifiedProfileDisplayProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [showPhotoGallery, setShowPhotoGallery] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editProfile, setEditProfile] = useState(profile);

  // Normalize profile data
  const profileId = profile.user_id || profile.id || '';
  const name = profile.display_name || profile.name || 'User';
  const age = profile.age;
  const location = profile.location || `${profile.city || ''}, ${profile.country || ''}`.trim();
  const photos = [profile.avatar || profile.avatar_url || '', ...(profile.photos || [])].filter(Boolean);
  const isOnline = profile.isOnline || profile.is_online || false;
  const isVerified = profile.isVerified || profile.is_verified || false;
  const isPremium = profile.isPremium || profile.membership?.tier !== 'free';

  const nextPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev + 1) % photos.length);
  };

  const prevPhoto = () => {
    setCurrentPhotoIndex((prev) => (prev - 1 + photos.length) % photos.length);
  };

  const handleFavorite = () => {
    if (isFavorited && actions?.onUnfavorite) {
      actions.onUnfavorite(profileId);
    } else if (!isFavorited && actions?.onFavorite) {
      actions.onFavorite(profileId);
    }
  };

  const handleMessage = () => {
    actions?.onMessage?.(profileId);
  };

  const handleBlock = () => {
    actions?.onBlock?.(profileId);
  };

  const handleShare = () => {
    actions?.onShare?.(profile);
  };

  const handleEdit = () => {
    if (isOwnProfile) {
      setEditProfile(profile);
      setShowEditDialog(true);
    }
  };

  const handleSaveEdit = () => {
    actions?.onEdit?.(editProfile);
    setShowEditDialog(false);
  };

  // Card Mode - Compact grid/list display
  if (mode === 'card') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.05 }}
        className={cn("relative group", className)}
      >
        <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 cursor-pointer">
          {/* Photo Section */}
          <div className="relative aspect-[3/4] overflow-hidden">
            <img
              src={photos[0] || '/placeholder-avatar.jpg'}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />

            {/* Online Status */}
            {isOnline && (
              <div className="absolute top-2 right-2 w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
            )}

            {/* Verification Badge */}
            {isVerified && (
              <div className="absolute top-2 left-2">
                <BadgeCheck className="w-4 h-4 text-white bg-blue-500 rounded-full p-1" />
              </div>
            )}

            {/* Premium Badge */}
            {isPremium && (
              <div className="absolute top-2 left-8">
                <Crown className="w-4 h-4 text-yellow-500" />
              </div>)}

            {/* Quick Actions */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <div className="absolute bottom-2 left-2 right-2 flex gap-2">
                {showActions && (
                  <>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleMessage}
                      className="flex-1 bg-white/20 backdrop-blur-sm text-white hover:bg-white/30"
                    >
                      <MessageCircle className="w-3 h-3 mr-1" />
                      Chat
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={handleFavorite}
                      className={cn(
                        "bg-white/20 backdrop-blur-sm hover:bg-white/30",
                        isFavorited && "bg-red-500/80 text-white"
                      )}
                    >
                      <Heart className={cn("w-3 h-3", isFavorited && "fill-current")} />
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Info Section */}
          <CardContent className="p-3">
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <h3 className="font-semibold text-sm truncate">{name}, {age}</h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {location || 'Location not set'}
                </p>
              </div>
              {profile.rating && (
                <div className="flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-500 fill-current" />
                  <span className="text-xs font-medium">{profile.rating}</span>
                </div>
              )}
            </div>

            {/* Bio */}
            {profile.bio && (
              <p className="text-xs text-muted-foreground line-clamp-2 mb-2">
                {profile.bio}
              </p>
            )}

            {/* Tags */}
            {(profile.tribes || profile.interests) && (
              <div className="flex flex-wrap gap-1 mb-2">
                {(profile.tribes?.slice(0, 3) || profile.interests?.slice(0, 3)).map((tag, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Stats */}
            {showStats && profile.stats && (
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{profile.stats.profileViews || 0} views</span>
                <span>{profile.stats.matches || 0} matches</span>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    );
  }

  // Detail Mode - Modal/Sheet view
  if (mode === 'detail') {
    const DetailContent = () => (
      <div className="h-full overflow-y-auto">
        {/* Photo Gallery */}
        <div className="relative aspect-[3/4] max-h-[60vh]">
          <AnimatePresence mode="wait">
            <motion.img
              key={currentPhotoIndex}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              src={photos[currentPhotoIndex] || '/placeholder-avatar.jpg'}
              alt={name}
              className="w-full h-full object-cover"
            />
          </AnimatePresence>

          {/* Photo Navigation */}
          {photos.length > 1 && (
            <>
              <Button
                variant="ghost"
                size="sm"
                onClick={prevPhoto}
                className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={nextPhoto}
                className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </>
          )}

          {/* Photo Indicators */}
          {photos.length > 1 && (
            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1">
              {photos.map((_, i) => (
                <div
                  key={i}
                  className={cn(
                    "w-1.5 h-1.5 rounded-full transition-colors",
                    i === currentPhotoIndex ? "bg-white" : "bg-white/50"
                  )}
                />
              ))}
            </div>
          )}

          {/* View Photos Button */}
          {photos.length > 1 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowPhotoGallery(true)}
              className="absolute top-2 right-2 bg-black/20 text-white hover:bg-black/40"
            >
              <Camera className="w-4 h-4 mr-1" />
              {photos.length} photos
            </Button>
          )}
        </div>

        {/* Profile Info */}
        <div className="p-4 space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold">{name}, {age}</h2>
                {isVerified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                {isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
                {isOnline && (
                  <Badge variant="secondary" className="text-xs">
                    Online
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground flex items-center gap-1">
                <MapPin className="w-4 h-4" />
                {location || 'Location not set'}
              </p>
            </div>

            {showActions && !isOwnProfile && (
              <div className="flex gap-2">
                <Button onClick={handleMessage} size="sm">
                  <MessageCircle className="w-4 h-4 mr-1" />
                  Message
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleFavorite}
                  className={cn(isFavorited && "bg-red-50 border-red-200 text-red-600")}
                >
                  <Heart className={cn("w-4 h-4 mr-1", isFavorited && "fill-current")} />
                  {isFavorited ? 'Favorited' : 'Favorite'}
                </Button>
              </div>
            )}

            {isOwnProfile && (
              <Button onClick={handleEdit} size="sm" variant="outline">
                <Edit className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
          </div>

          {/* Bio */}
          {profile.bio && (
            <div>
              <h3 className="font-semibold mb-2">About</h3>
              <p className="text-muted-foreground">{profile.bio}</p>
            </div>
          )}

          {/* Stats */}
          {showStats && profile.stats && (
            <div>
              <h3 className="font-semibold mb-2">Stats</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.stats.profileViews || 0}</div>
                  <div className="text-xs text-muted-foreground">Profile Views</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.stats.matches || 0}</div>
                  <div className="text-xs text-muted-foreground">Matches</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{profile.stats.messages || 0}</div>
                  <div className="text-xs text-muted-foreground">Messages</div>
                </div>
                <div className="text-center">
                  <div className="text-lg font-bold">{Math.round((profile.stats.responseRate || 0) * 100)}%</div>
                  <div className="text-xs text-muted-foreground">Response Rate</div>
                </div>
              </div>
            </div>
          )}

          {/* Interests */}
          {(profile.tribes || profile.interests) && (
            <div>
              <h3 className="font-semibold mb-2">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {(profile.tribes || profile.interests)?.map((interest, i) => (
                  <Badge key={i} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Verification Status */}
          {showVerification && profile.verification && (
            <div>
              <h3 className="font-semibold mb-2">Verification</h3>
              <div className="space-y-2">
                {profile.verification.photo && (
                  <div className="flex items-center gap-2">
                    <Camera className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Photo Verified</span>
                  </div>
                )}
                {profile.verification.age && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Age Verified</span>
                  </div>
                )}
                {profile.verification.identity && (
                  <div className="flex items-center gap-2">
                    <Shield className="w-4 h-4 text-green-500" />
                    <span className="text-sm">Identity Verified</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Actions */}
          {showActions && !isOwnProfile && (
            <div className="flex gap-2 pt-4 border-t">
              <Button variant="outline" onClick={handleShare} className="flex-1">
                <Share2 className="w-4 h-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" onClick={handleBlock} className="flex-1">
                <Ban className="w-4 h-4 mr-2" />
                Block
              </Button>
            </div>
          )}
        </div>
      </div>
    );

    if (layout === 'modal') {
      return (
        <Dialog open={true}>
          <DialogContent className="max-w-md h-[90vh] p-0 overflow-hidden">
            <DetailContent />
          </DialogContent>
        </Dialog>
      );
    }

    return (
      <Sheet open={true}>
        <SheetContent side="bottom" className="h-[95vh] rounded-t-3xl p-0 overflow-hidden">
          <DetailContent />
        </SheetContent>
      </Sheet>
    );
  }

  // Full Mode - Complete profile page view
  if (mode === 'full') {
    return (
      <div className={cn("max-w-4xl mx-auto p-4 space-y-6", className)}>
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="verification">Verification</TabsTrigger>
            {isOwnProfile && <TabsTrigger value="settings">Settings</TabsTrigger>}
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Header with Photo */}
            <Card>
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-6">
                  <div className="flex-shrink-0">
                    <Avatar className="w-24 h-24 md:w-32 md:h-32">
                      <AvatarImage src={photos[0] || '/placeholder-avatar.jpg'} />
                      <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
                    </Avatar>
                    {showActions && isOwnProfile && (
                      <Button onClick={handleEdit} size="sm" className="mt-2 w-full">
                        <Edit className="w-4 h-4 mr-1" />
                        Edit Profile
                      </Button>
                    )}
                  </div>

                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-2 mb-2">
                        <h1 className="text-2xl font-bold">{name}, {age}</h1>
                        {isVerified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
                        {isPremium && <Crown className="w-5 h-5 text-yellow-500" />}
                        {isOnline && (
                          <Badge variant="secondary">Online</Badge>
                        )}
                      </div>
                      <p className="text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {location || 'Location not set'}
                      </p>
                    </div>

                    {profile.bio && (
                      <div>
                        <h3 className="font-semibold mb-2">About</h3>
                        <p className="text-muted-foreground">{profile.bio}</p>
                      </div>
                    )}

                    {showActions && !isOwnProfile && (
                      <div className="flex gap-2">
                        <Button onClick={handleMessage} className="flex-1">
                          <MessageCircle className="w-4 h-4 mr-2" />
                          Send Message
                        </Button>
                        <Button
                          variant="outline"
                          onClick={handleFavorite}
                          className={cn(isFavorited && "bg-red-50 border-red-200 text-red-600")}
                        >
                          <Heart className={cn("w-4 h-4 mr-2", isFavorited && "fill-current")} />
                          {isFavorited ? 'Favorited' : 'Favorite'}
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Interests */}
            {(profile.tribes || profile.interests) && (
              <Card>
                <CardHeader>
                  <CardTitle>Interests</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {(profile.tribes || profile.interests)?.map((interest, i) => (
                      <Badge key={i} variant="secondary">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="photos" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {photos.map((photo, i) => (
                    <div
                      key={i}
                      className="aspect-square rounded-lg overflow-hidden cursor-pointer"
                      onClick={() => {
                        setCurrentPhotoIndex(i);
                        setShowPhotoGallery(true);
                      }}
                    >
                      <img
                        src={photo}
                        alt={`${name} - Photo ${i + 1}`}
                        className="w-full h-full object-cover hover:scale-105 transition-transform"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="stats" className="space-y-6">
            {showStats && profile.stats && (
              <Card>
                <CardHeader>
                  <CardTitle>Profile Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{profile.stats.profileViews || 0}</div>
                      <div className="text-sm text-muted-foreground">Profile Views</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{profile.stats.profileLikes || 0}</div>
                      <div className="text-sm text-muted-foreground">Profile Likes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{profile.stats.matches || 0}</div>
                      <div className="text-sm text-muted-foreground">Matches</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{profile.stats.messages || 0}</div>
                      <div className="text-sm text-muted-foreground">Messages</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="verification" className="space-y-6">
            {showVerification && profile.verification && (
              <Card>
                <CardHeader>
                  <CardTitle>Verification Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {profile.verification.photo && (
                      <div className="flex items-center gap-3">
                        <Camera className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">Photo Verified</div>
                          <div className="text-sm text-muted-foreground">Your photo has been verified</div>
                        </div>
                      </div>
                    )}
                    {profile.verification.age && (
                      <div className="flex items-center gap-3">
                        <Calendar className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">Age Verified</div>
                          <div className="text-sm text-muted-foreground">Your age has been verified</div>
                        </div>
                      </div>
                    )}
                    {profile.verification.identity && (
                      <div className="flex items-center gap-3">
                        <Shield className="w-5 h-5 text-green-500" />
                        <div>
                          <div className="font-medium">Identity Verified</div>
                          <div className="text-sm text-muted-foreground">Your identity has been verified</div>
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {isOwnProfile && (
            <TabsContent value="settings" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Profile Settings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Button onClick={handleEdit} className="w-full">
                      <Edit className="w-4 h-4 mr-2" />
                      Edit Profile
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Shield className="w-4 h-4 mr-2" />
                      Privacy Settings
                    </Button>
                    <Button variant="outline" className="w-full">
                      <Bell className="w-4 h-4 mr-2" />
                      Notification Settings
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          )}
        </Tabs>

        {/* Photo Gallery Dialog */}
        <Dialog open={showPhotoGallery} onOpenChange={setShowPhotoGallery}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Photo Gallery</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-[3/4] max-h-[70vh]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={photos[currentPhotoIndex]}
                  alt={`${name} - Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhotoIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === currentPhotoIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Profile Dialog */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Edit Profile</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  value={editProfile.display_name || editProfile.name || ''}
                  onChange={(e) => setEditProfile({...editProfile, display_name: e.target.value})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Age</label>
                <Input
                  type="number"
                  value={editProfile.age || ''}
                  onChange={(e) => setEditProfile({...editProfile, age: parseInt(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Bio</label>
                <Textarea
                  value={editProfile.bio || ''}
                  onChange={(e) => setEditProfile({...editProfile, bio: e.target.value})}
                  rows={4}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Location</label>
                <Input
                  value={editProfile.location || ''}
                  onChange={(e) => setEditProfile({...editProfile, location: e.target.value})}
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveEdit}>
                  Save Changes
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Gallery Mode - Photo focused view
  if (mode === 'gallery') {
    return (
      <div className={cn("space-y-4", className)}>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {photos.map((photo, i) => (
            <div
              key={i}
              className="aspect-square rounded-lg overflow-hidden cursor-pointer group"
              onClick={() => {
                setCurrentPhotoIndex(i);
                setShowPhotoGallery(true);
              }}
            >
              <img
                src={photo}
                alt={`${name} - Photo ${i + 1}`}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
          ))}
        </div>

        {/* Photo Gallery Dialog */}
        <Dialog open={showPhotoGallery} onOpenChange={setShowPhotoGallery}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>{name}'s Photos</DialogTitle>
            </DialogHeader>
            <div className="relative aspect-[3/4] max-h-[70vh]">
              <AnimatePresence mode="wait">
                <motion.img
                  key={currentPhotoIndex}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  src={photos[currentPhotoIndex]}
                  alt={`${name} - Photo ${currentPhotoIndex + 1}`}
                  className="w-full h-full object-contain"
                />
              </AnimatePresence>

              {photos.length > 1 && (
                <>
                  <Button
                    variant="ghost"
                    onClick={prevPhoto}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    onClick={nextPhoto}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 text-white hover:bg-black/40"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </>
              )}
            </div>
            <div className="flex justify-center gap-2 mt-4">
              {photos.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setCurrentPhotoIndex(i)}
                  className={cn(
                    "w-2 h-2 rounded-full transition-colors",
                    i === currentPhotoIndex ? "bg-primary" : "bg-muted"
                  )}
                />
              ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  // Compact Mode - Minimal display
  if (mode === 'compact') {
    return (
      <div className={cn("flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors", className)}>
        <Avatar className="w-10 h-10">
          <AvatarImage src={photos[0] || '/placeholder-avatar.jpg'} />
          <AvatarFallback>{name?.charAt(0)}</AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium truncate">{name}, {age}</span>
            {isVerified && <BadgeCheck className="w-3 h-3 text-blue-500" />}
            {isOnline && <div className="w-2 h-2 bg-green-500 rounded-full" />}
          </div>
          <p className="text-sm text-muted-foreground truncate">{location}</p>
        </div>
        {showActions && !isOwnProfile && (
          <div className="flex gap-1">
            <Button size="sm" variant="ghost" onClick={handleMessage}>
              <MessageCircle className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={handleFavorite}>
              <Heart className={cn("w-4 h-4", isFavorited && "fill-current text-red-500")} />
            </Button>
          </div>
        )}
      </div>
    );
  }

  return null;
}

export default UnifiedProfileDisplay;
