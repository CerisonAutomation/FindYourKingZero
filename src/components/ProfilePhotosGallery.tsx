import {useRef, useState} from 'react';
import {motion} from 'framer-motion';
import {Plus, Star, Trash2, X} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Dialog, DialogContent} from '@/components/ui/dialog';
import {
    ProfilePhoto,
    useAddProfilePhoto,
    useDeleteProfilePhoto,
    useProfilePhotos,
    useSetPrimaryPhoto,
} from '@/hooks/useProfilePhotos';

interface ProfilePhotosGalleryProps {
    userId?: string;
    isOwnProfile?: boolean;
}

export const ProfilePhotosGallery = ({userId, isOwnProfile = false}: ProfilePhotosGalleryProps) => {
    const {data: photos = [], isLoading} = useProfilePhotos(userId);
    const [selectedPhoto, setSelectedPhoto] = useState<ProfilePhoto | null>(null);

    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="w-20 h-20 bg-muted animate-pulse rounded-xl flex-shrink-0"/>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <h3 className="text-sm font-medium text-muted-foreground">Photos</h3>
                <span className="text-xs text-muted-foreground">{photos.length} photos</span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                {/* Add photo button */}
                {isOwnProfile && (
                    <AddPhotoButton/>
                )}

                {/* Photo thumbnails */}
                {photos.map((photo, index) => (
                    <PhotoThumbnail
                        key={photo.id}
                        photo={photo}
                        index={index}
                        isOwnProfile={isOwnProfile}
                        onClick={() => setSelectedPhoto(photo)}
                    />
                ))}

                {photos.length === 0 && !isOwnProfile && (
                    <p className="text-muted-foreground text-sm">No photos</p>
                )}
            </div>

            {/* Full-screen photo viewer */}
            <Dialog open={!!selectedPhoto} onOpenChange={() => setSelectedPhoto(null)}>
                <DialogContent className="max-w-2xl p-0 overflow-hidden">
                    {selectedPhoto && (
                        <PhotoViewer
                            photo={selectedPhoto}
                            photos={photos}
                            isOwnProfile={isOwnProfile}
                            onClose={() => setSelectedPhoto(null)}
                            onNavigate={(photo) => setSelectedPhoto(photo)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const AddPhotoButton = () => {
    const addPhoto = useAddProfilePhoto();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await addPhoto.mutateAsync({file, isPrimary: false});
        }
    };

    return (
        <>
            <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
            />
            <motion.button
                whileHover={{scale: 1.05}}
                whileTap={{scale: 0.95}}
                onClick={() => fileInputRef.current?.click()}
                disabled={addPhoto.isPending}
                className="w-20 h-20 rounded-xl bg-muted/50 border-2 border-dashed border-muted-foreground/30 flex items-center justify-center flex-shrink-0 hover:border-primary/50 transition-colors"
            >
                {addPhoto.isPending ? (
                    <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"/>
                ) : (
                    <Plus className="h-6 w-6 text-muted-foreground"/>
                )}
            </motion.button>
        </>
    );
};

const PhotoThumbnail = ({
                            photo,
                            index,
                            isOwnProfile,
                            onClick,
                        }: {
    photo: ProfilePhoto;
    index: number;
    isOwnProfile: boolean;
    onClick: () => void;
}) => {
    const setPrimary = useSetPrimaryPhoto();
    const deletePhoto = useDeleteProfilePhoto();

    return (
        <motion.div
            initial={{opacity: 0, scale: 0.8}}
            animate={{opacity: 1, scale: 1}}
            transition={{delay: index * 0.05}}
            className="relative w-20 h-20 flex-shrink-0 group"
        >
            <button
                onClick={onClick}
                className="w-full h-full rounded-xl overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary"
            >
                <img
                    src={photo.url}
                    alt={`Photo ${index + 1}`}
                    className="w-full h-full object-cover"
                />
            </button>

            {/* Primary indicator */}
            {photo.is_primary && (
                <div className="absolute top-1 left-1 p-1 bg-primary rounded-full">
                    <Star className="h-3 w-3 text-primary-foreground fill-current"/>
                </div>
            )}

            {/* Action buttons */}
            {isOwnProfile && (
                <div
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-xl flex items-center justify-center gap-1">
                    {!photo.is_primary && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-white hover:bg-white/20"
                            onClick={(e) => {
                                e.stopPropagation();
                                setPrimary.mutate(photo.id);
                            }}
                        >
                            <Star className="h-4 w-4"/>
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 text-white hover:bg-white/20"
                        onClick={(e) => {
                            e.stopPropagation();
                            deletePhoto.mutate(photo.id);
                        }}
                    >
                        <Trash2 className="h-4 w-4"/>
                    </Button>
                </div>
            )}
        </motion.div>
    );
};

const PhotoViewer = ({
                         photo,
                         photos,
                         isOwnProfile,
                         onClose,
                         onNavigate,
                     }: {
    photo: ProfilePhoto;
    photos: ProfilePhoto[];
    isOwnProfile: boolean;
    onClose: () => void;
    onNavigate: (photo: ProfilePhoto) => void;
}) => {
    const setPrimary = useSetPrimaryPhoto();
    const deletePhoto = useDeleteProfilePhoto();
    const currentIndex = photos.findIndex((p) => p.id === photo.id);

    const handlePrevious = () => {
        if (currentIndex > 0) {
            onNavigate(photos[currentIndex - 1]);
        }
    };

    const handleNext = () => {
        if (currentIndex < photos.length - 1) {
            onNavigate(photos[currentIndex + 1]);
        }
    };

    return (
        <div className="relative">
            <img
                src={photo.url}
                alt="Profile photo"
                className="w-full max-h-[70vh] object-contain"
            />

            {/* Close button */}
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2 bg-black/50 hover:bg-black/70 text-white"
                onClick={onClose}
            >
                <X className="h-5 w-5"/>
            </Button>

            {/* Navigation arrows */}
            {photos.length > 1 && (
                <>
                    {currentIndex > 0 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10"
                            onClick={handlePrevious}
                        >
                            ←
                        </Button>
                    )}
                    {currentIndex < photos.length - 1 && (
                        <Button
                            variant="ghost"
                            size="icon"
                            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white h-10 w-10"
                            onClick={handleNext}
                        >
                            →
                        </Button>
                    )}
                </>
            )}

            {/* Actions */}
            {isOwnProfile && (
                <div
                    className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent flex justify-center gap-3">
                    {!photo.is_primary && (
                        <Button
                            variant="outline"
                            size="sm"
                            className="gap-2"
                            onClick={() => setPrimary.mutate(photo.id)}
                        >
                            <Star className="h-4 w-4"/>
                            Set as Primary
                        </Button>
                    )}
                    <Button
                        variant="destructive"
                        size="sm"
                        className="gap-2"
                        onClick={() => {
                            deletePhoto.mutate(photo.id);
                            onClose();
                        }}
                    >
                        <Trash2 className="h-4 w-4"/>
                        Delete
                    </Button>
                </div>
            )}

            {/* Photo counter */}
            <div
                className="absolute bottom-4 left-1/2 -translate-x-1/2 px-3 py-1 bg-black/50 rounded-full text-white text-sm">
                {currentIndex + 1} / {photos.length}
            </div>
        </div>
    );
};
