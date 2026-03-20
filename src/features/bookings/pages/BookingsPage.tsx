import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, Users, DollarSign, Star, Filter, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

interface Booking {
  id: string;
  title: string;
  host: {
    id: string;
    name: string;
    avatar: string;
    rating: number;
  };
  type: 'event' | 'venue' | 'experience';
  category: string;
  date: string;
  time: string;
  location: string;
  price: number;
  maxAttendees: number;
  currentAttendees: number;
  description: string;
  images: string[];
  tags: string[];
  status: 'upcoming' | 'attended' | 'cancelled';
  bookedAt: string;
}

export default function BookingsPage() {
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBy, setFilterBy] = useState<'all' | 'upcoming' | 'attended'>('all');

  useEffect(() => {
    // Simulate loading bookings
    setTimeout(() => {
      setBookings([
        {
          id: '1',
          title: 'Sunset Mixer Party',
          host: {
            id: '1',
            name: 'Mike',
            avatar: '/api/placeholder/40/40',
            rating: 4.8
          },
          type: 'event',
          category: 'Social',
          date: '2024-01-20',
          time: '6:00 PM',
          location: 'West Hollywood',
          price: 15,
          maxAttendees: 50,
          currentAttendees: 32,
          description: 'Join us for an amazing sunset mixer with great music and vibes.',
          images: ['/api/placeholder/400/300'],
          tags: ['Music', 'Social', 'Outdoor'],
          status: 'upcoming',
          bookedAt: '2024-01-15'
        },
        {
          id: '2',
          title: 'Wine Tasting Experience',
          host: {
            id: '2',
            name: 'Sarah',
            avatar: '/api/placeholder/40/40',
            rating: 4.9
          },
          type: 'experience',
          category: 'Food & Drink',
          date: '2024-01-25',
          time: '7:30 PM',
          location: 'Beverly Hills',
          price: 45,
          maxAttendees: 20,
          currentAttendees: 18,
          description: 'Exclusive wine tasting with sommelier guidance.',
          images: ['/api/placeholder/400/300'],
          tags: ['Wine', 'Food', 'Upscale'],
          status: 'upcoming',
          bookedAt: '2024-01-12'
        }
      ]);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredBookings = bookings.filter(booking => {
    const matchesSearch = booking.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         booking.location.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterBy === 'all' || 
                         (filterBy === 'upcoming' && booking.status === 'upcoming') ||
                         (filterBy === 'attended' && booking.status === 'attended');
    return matchesSearch && matchesFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">My Bookings</h1>
          <p className="text-muted-foreground">Events and experiences you've signed up for</p>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search bookings..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Tabs value={filterBy} onValueChange={(value) => setFilterBy(value as any)}>
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
              <TabsTrigger value="attended">Attended</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Results */}
        <div className="mb-4">
          <p className="text-sm text-muted-foreground">
            {filteredBookings.length} {filteredBookings.length === 1 ? 'booking' : 'bookings'} found
          </p>
        </div>

        {/* Bookings List */}
        {filteredBookings.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <Calendar className="w-12 h-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No bookings yet</h3>
              <p className="text-muted-foreground text-center mb-4">
                Discover and book amazing events and experiences
              </p>
              <Button onClick={() => navigate('/app/events')}>
                Browse Events
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-6">
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className="overflow-hidden">
                <div className="flex flex-col lg:flex-row">
                  {/* Image */}
                  <div className="lg:w-1/3">
                    <img
                      src={booking.images[0] || '/api/placeholder/400/300'}
                      alt={booking.title}
                      className="w-full h-48 lg:h-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="text-xl font-semibold">{booking.title}</h3>
                          <Badge variant={booking.status === 'upcoming' ? 'default' : 'secondary'}>
                            {booking.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground mb-3">
                          <div className="flex items-center gap-1">
                            <Calendar className="w-4 h-4" />
                            {new Date(booking.date).toLocaleDateString()}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {booking.time}
                          </div>
                          <div className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {booking.location}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">${booking.price}</div>
                        <div className="text-sm text-muted-foreground">per person</div>
                      </div>
                    </div>

                    {/* Host */}
                    <div className="flex items-center gap-3 mb-4">
                      <Avatar className="w-10 h-10">
                        <AvatarImage src={booking.host.avatar} alt={booking.host.name} />
                        <AvatarFallback>{booking.host.name[0]}</AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">Hosted by {booking.host.name}</div>
                        <div className="flex items-center gap-1 text-sm text-muted-foreground">
                          <Star className="w-4 h-4 text-yellow-500 fill-current" />
                          {booking.host.rating}
                        </div>
                      </div>
                    </div>

                    {/* Description */}
                    <p className="text-muted-foreground mb-4 line-clamp-2">
                      {booking.description}
                    </p>

                    {/* Tags and Attendees */}
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-wrap gap-1">
                        {booking.tags.map((tag, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4" />
                        {booking.currentAttendees}/{booking.maxAttendees}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      <Button className="flex-1" onClick={() => navigate(`/app/events/${booking.id}`)}>
                        View Details
                      </Button>
                      {booking.status === 'upcoming' && (
                        <Button variant="outline" onClick={() => navigate(`/app/events/${booking.id}/chat`)}>
                          Chat with Host
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
