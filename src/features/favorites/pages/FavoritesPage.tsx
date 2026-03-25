import {useEffect, useState} from 'react';
import {useNavigate} from 'react-router-dom';
import {Heart, MapPin, Search, Star} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Input} from '@/components/ui/input';
import {Card, CardContent, CardHeader, CardTitle} from '@/components/ui/card';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';

interface FavoriteProfile {
  id: string;
  name: string;
  age: number;
  location: string;
  distance: string;
  bio: string;
  interests: string[];
  photos: string[];
  isOnline: boolean;
  compatibility: number;
  favoritedAt: string;
}

interface FavoriteService {
  // Add properties for FavoriteService
}

interface FavoriteConversation {
  // Add properties for FavoriteConversation
}

interface FavoriteInsight {
  // Add properties for FavoriteInsight
}

export default function FavoritesPage() {
  const navigate = useNavigate();
  const [favorites, setFavorites] = useState<FavoriteProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'online' | 'recent'>('all');

  useEffect(() => {
    // Simulate loading favorites
    setTimeout(() => {
      setFavorites([
        {
          id: '1',
          name: 'Alex',
          age: 28,
          location: '2 miles away',
          distance: '2 miles',
          bio: 'Adventure seeker, coffee enthusiast, and dog lover.',
          interests: ['Hiking', 'Coffee', 'Dogs', 'Travel'],
          photos: ['/api/placeholder/400/400'],
          favoritedAt: '2024-01-15',
          isOnline: true,
          compatibility: 92
        },
        {
          id: '2',
          name: 'Jordan',
          age: 32,
          location: '5 miles away',
          distance: '5 miles',
          bio: 'Creative soul with a passion for art and music.',
          interests: ['Art', 'Music', 'Photography', 'Museums'],
          photos: ['/api/placeholder/400/400'],
          favoritedAt: '2024-01-10',
          isOnline: false,
          compatibility: 88
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredFavorites = favorites.filter(favorite => {
    const matchesSearch = favorite.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         favorite.bio.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' ||
                         (filterBy === 'online' && favorite.isOnline) ||
                         (filterBy === 'recent' && new Date(favorite.favoritedAt) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading favorites...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Favorites</h1>
          <p className="text-muted-foreground">Profiles you've saved and want to connect with</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search favorites..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={filterBy} onValueChange={(value) => setFilterBy(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="online">Online</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredFavorites.length} {filteredFavorites.length === 1 ? 'favorite' : 'favorites'} found
          </p>
        </div>

        {/* Favorites Grid */}
        {filteredFavorites.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Heart className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No favorites yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Start exploring and save profiles you're interested in
              </p>
              <Button onClick={() => navigate('/app/grid')}>
                Start Exploring
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFavorites.map((favorite) => (
              <Card key={favorite.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="relative">
                  <img
                    src={favorite.photos[0] || '/api/placeholder/400/400'}
                    alt={favorite.name}
                    className="w-full h-48 object-cover"
                  />
                  {favorite.isOnline && (
                    <div className="absolute top-2 right-2">
                      <Badge variant="secondary" className="bg-green-500 text-white">
                        Online
                      </Badge>
                    </div>
                  )}
                  <div className="absolute bottom-2 left-2">
                    <Badge variant="secondary">
                      {favorite.compatibility}% Match
                    </Badge>
                  </div>
                </div>
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        {favorite.name}, {favorite.age}
                        <Star className="w-4 h-4 text-yellow-500 fill-current" />
                      </CardTitle>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <MapPin className="w-4 h-4 mr-1" />
                        {favorite.location}
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {favorite.bio}
                  </p>
                  <div className="flex flex-wrap gap-1 mb-4">
                    {favorite.interests.slice(0, 3).map((interest, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                    {favorite.interests.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{favorite.interests.length - 3}
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button className="flex-1" onClick={() => navigate(`/app/profile/${favorite.id}`)}>
                      View Profile
                    </Button>
                    <Button variant="outline" onClick={() => navigate(`/app/chat/${favorite.id}`)}>
                      Message
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
