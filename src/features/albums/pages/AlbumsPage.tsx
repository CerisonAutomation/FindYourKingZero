import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Camera, Heart, Plus, Grid, List, Image as ImageIcon, Download, Share2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';

interface Album {
  id: string;
  title: string;
  description: string;
  photos: Photo[];
  coverPhoto: string;
  createdAt: string;
  updatedAt: string;
  isPrivate: boolean;
  likes: number;
  tags: string[];
}

interface Photo {
  id: string;
  url: string;
  caption: string;
  uploadedAt: string;
  likes: number;
  isPrivate: boolean;
}

export default function AlbumsPage() {
  const navigate = useNavigate();
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);

  useEffect(() => {
    // Simulate loading albums
    setTimeout(() => {
      setAlbums([
        {
          id: '1',
          title: 'Summer Adventures',
          description: 'My favorite summer moments and adventures',
          photos: [
            {
              id: '1',
              url: '/api/placeholder/400/400',
              caption: 'Beach sunset',
              uploadedAt: '2024-01-15',
              likes: 24,
              isPrivate: false
            },
            {
              id: '2',
              url: '/api/placeholder/400/400',
              caption: 'Mountain hiking',
              uploadedAt: '2024-01-12',
              likes: 18,
              isPrivate: false
            }
          ],
          coverPhoto: '/api/placeholder/400/300',
          createdAt: '2024-01-10',
          updatedAt: '2024-01-15',
          isPrivate: false,
          likes: 42,
          tags: ['Summer', 'Adventure', 'Travel']
        },
        {
          id: '2',
          title: 'Private Collection',
          description: 'Personal moments and memories',
          photos: [
            {
              id: '3',
              url: '/api/placeholder/400/400',
              caption: 'Private moment',
              uploadedAt: '2024-01-08',
              likes: 5,
              isPrivate: true
            }
          ],
          coverPhoto: '/api/placeholder/400/300',
          createdAt: '2024-01-05',
          updatedAt: '2024-01-08',
          isPrivate: true,
          likes: 5,
          tags: ['Private', 'Personal']
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const handleCreateAlbum = () => {
    // In a real app, this would open a create album dialog
    console.log('Creating new album');
  };

  const handleUploadPhoto = (albumId: string) => {
    // In a real app, this would open file upload
    console.log(`Uploading photo to album ${albumId}`);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading albums...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h1 className="text-3xl font-bold mb-2">Photo Albums</h1>
              <p className="text-muted-foreground">Organize and share your memories</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}>
                {viewMode === 'grid' ? <List className="w-4 h-4" /> : <Grid className="w-4 h-4" />}
              </Button>
              <Button onClick={handleCreateAlbum}>
                <Plus className="w-4 h-4 mr-2" />
                Create Album
              </Button>
            </div>
          </div>
        </div>

        {/* Albums Grid/List */}
        {albums.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Camera className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No albums yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Create your first album to start organizing your photos
              </p>
              <Button onClick={handleCreateAlbum}>
                <Plus className="w-4 h-4 mr-2" />
                Create Album
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {albums.map((album) => (
              <Card key={album.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                {/* Cover Photo */}
                <div className="relative">
                  <img
                    src={album.coverPhoto || '/api/placeholder/400/300'}
                    alt={album.title}
                    className="w-full h-48 object-cover"
                  />
                  {album.isPrivate && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary">Private</Badge>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="outline">
                      {album.photos.length} photos
                    </Badge>
                  </div>
                </div>

                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="text-lg">{album.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                        {album.description}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                      <Heart className="w-4 h-4" />
                      {album.likes}
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  {/* Tags */}
                  <div className="flex flex-wrap gap-1 mb-4">
                    {album.tags.map((tag, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  {/* Actions */}
                  <div className="flex gap-2">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1" onClick={() => setSelectedAlbum(album)}>
                          <ImageIcon className="w-4 h-4 mr-2" />
                          View Photos
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                        <DialogHeader>
                          <DialogTitle>{album.title}</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <p className="text-muted-foreground">{album.description}</p>
                          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            {album.photos.map((photo) => (
                              <div key={photo.id} className="relative group">
                                <img
                                  src={photo.url}
                                  alt={photo.caption}
                                  className="w-full h-40 object-cover rounded-lg"
                                />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                                  <Button size="sm" variant="secondary">
                                    <Download className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="secondary">
                                    <Share2 className="w-4 h-4" />
                                  </Button>
                                  <Button size="sm" variant="secondary">
                                    <Trash2 className="w-4 h-4" />
                                  </Button>
                                </div>
                                <div className="absolute bottom-2 left-2 text-white text-xs bg-black/50 px-2 py-1 rounded">
                                  {photo.likes} likes
                                </div>
                              </div>
                            ))}
                          </div>
                          <Button onClick={() => handleUploadPhoto(album.id)} className="w-full">
                            <Plus className="w-4 h-4 mr-2" />
                            Add Photo
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                    <Button onClick={() => handleUploadPhoto(album.id)}>
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        {/* Stats */}
        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Album Statistics</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{albums.length}</div>
                <div className="text-sm text-muted-foreground">Total Albums</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {albums.reduce((sum, album) => sum + album.photos.length, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Photos</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {albums.reduce((sum, album) => sum + album.likes, 0)}
                </div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {albums.filter(album => album.isPrivate).length}
                </div>
                <div className="text-sm text-muted-foreground">Private Albums</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
