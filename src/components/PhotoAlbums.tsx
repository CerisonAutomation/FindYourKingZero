import {useRef, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Image, Lock, Plus, Trash2, Upload} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Switch} from '@/components/ui/switch';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger} from '@/components/ui/dialog';
import {useAddPhotoToAlbum, useAlbums, useCreateAlbum, useDeleteAlbum} from '@/hooks/useAlbums';
import type {Album} from '@/hooks/useAlbums';

interface PhotoAlbumsProps {
    userId?: string;
    isOwnProfile?: boolean;
}

export const PhotoAlbums = ({userId, isOwnProfile = false}: PhotoAlbumsProps) => {
    const {data: albums = [], isLoading} = useAlbums(userId);
    const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    if (isLoading) {
        return (
            <div className="grid grid-cols-2 gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="aspect-square bg-muted animate-pulse rounded-xl"/>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Albums</h3>
                {isOwnProfile && (
                    <Dialog open={isCreating} onOpenChange={setIsCreating}>
                        <DialogTrigger asChild>
                            <Button size="sm" variant="outline" className="gap-2">
                                <Plus className="h-4 w-4"/>
                                New Album
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <CreateAlbumForm onClose={() => setIsCreating(false)}/>
                        </DialogContent>
                    </Dialog>
                )}
            </div>

            {albums.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                    <Image className="h-12 w-12 mx-auto mb-2 opacity-50"/>
                    <p>No albums yet</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-3">
                    {albums.map((album) => (
                        <AlbumCard
                            key={album.id}
                            album={album}
                            onClick={() => setSelectedAlbum(album)}
                            isOwnProfile={isOwnProfile}
                        />
                    ))}
                </div>
            )}

            {/* Album Detail Modal */}
            <Dialog open={!!selectedAlbum} onOpenChange={() => setSelectedAlbum(null)}>
                <DialogContent className="max-w-lg max-h-[80vh] overflow-y-auto">
                    {selectedAlbum && (
                        <AlbumDetail
                            album={selectedAlbum}
                            isOwnProfile={isOwnProfile}
                            onClose={() => setSelectedAlbum(null)}
                        />
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
};

const AlbumCard = ({album, onClick, isOwnProfile}: { album: Album; onClick: () => void; isOwnProfile: boolean }) => {
    const deleteAlbum = useDeleteAlbum();

    return (
        <motion.div
            whileHover={{scale: 1.02}}
            whileTap={{scale: 0.98}}
            onClick={onClick}
            className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
        >
            {album.cover_url ? (
                <img
                    src={album.cover_url}
                    alt={album.name}
                    className="w-full h-full object-cover"
                />
            ) : (
                <div className="w-full h-full bg-muted flex items-center justify-center">
                    <Image className="h-8 w-8 text-muted-foreground"/>
                </div>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent"/>

            {/* Info */}
            <div className="absolute bottom-0 left-0 right-0 p-3">
                <div className="flex items-center gap-2">
                    {album.is_private && <Lock className="h-3 w-3 text-white/80"/>}
                    <h4 className="text-white font-medium text-sm truncate">{album.name}</h4>
                </div>
                <p className="text-white/70 text-xs">{album.photos?.length || 0} photos</p>
            </div>

            {/* Delete button */}
            {isOwnProfile && (
                <Button
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2 h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={(e) => {
                        e.stopPropagation();
                        deleteAlbum.mutate(album.id);
                    }}
                >
                    <Trash2 className="h-4 w-4"/>
                </Button>
            )}
        </motion.div>
    );
};

const CreateAlbumForm = ({onClose}: { onClose: () => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [isPrivate, setIsPrivate] = useState(false);
    const createAlbum = useCreateAlbum();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        await createAlbum.mutateAsync({name, description, is_private: isPrivate});
        onClose();
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle>Create New Album</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="name">Album Name</Label>
                    <Input
                        id="name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="My Photos"
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Input
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Optional description..."
                    />
                </div>
                <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                        <Label htmlFor="private">Private Album</Label>
                        <p className="text-xs text-muted-foreground">Only you can see this album</p>
                    </div>
                    <Switch
                        id="private"
                        checked={isPrivate}
                        onCheckedChange={setIsPrivate}
                    />
                </div>
                <Button type="submit" className="w-full" disabled={createAlbum.isPending}>
                    {createAlbum.isPending ? 'Creating...' : 'Create Album'}
                </Button>
            </form>
        </>
    );
};

const AlbumDetail = ({album, isOwnProfile, onClose}: { album: Album; isOwnProfile: boolean; onClose: () => void }) => {
    const addPhoto = useAddPhotoToAlbum();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            await addPhoto.mutateAsync({albumId: album.id, file});
        }
    };

    return (
        <>
            <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                    {album.is_private && <Lock className="h-4 w-4"/>}
                    {album.name}
                </DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
                {album.description && (
                    <p className="text-muted-foreground text-sm">{album.description}</p>
                )}

                {isOwnProfile && (
                    <div>
                        <input
                            ref={fileInputRef}
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                        <Button
                            variant="outline"
                            className="w-full gap-2"
                            onClick={() => fileInputRef.current?.click()}
                            disabled={addPhoto.isPending}
                        >
                            <Upload className="h-4 w-4"/>
                            {addPhoto.isPending ? 'Uploading...' : 'Add Photo'}
                        </Button>
                    </div>
                )}

                {album.photos && album.photos.length > 0 ? (
                    <div className="grid grid-cols-3 gap-2">
                        <AnimatePresence>
                            {album.photos.map((photo) => (
                                <motion.div
                                    key={photo.id}
                                    initial={{opacity: 0, scale: 0.8}}
                                    animate={{opacity: 1, scale: 1}}
                                    exit={{opacity: 0, scale: 0.8}}
                                    className="aspect-square rounded-lg overflow-hidden"
                                >
                                    <img
                                        src={photo.url}
                                        alt={photo.caption || 'Album photo'}
                                        className="w-full h-full object-cover"
                                    />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-8 text-muted-foreground">
                        <Image className="h-8 w-8 mx-auto mb-2 opacity-50"/>
                        <p className="text-sm">No photos yet</p>
                    </div>
                )}
            </div>
        </>
    );
};
