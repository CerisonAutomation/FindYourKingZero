import {memo, useState} from 'react';
import {motion} from 'framer-motion';
import {Clock, Crown, MapPin, Navigation, Plus, Send, Sparkles, Users, X,} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from '@/components/ui/dialog';
import {Sheet, SheetContent, SheetHeader, SheetTitle,} from '@/components/ui/sheet';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Party, PARTY_TYPES, useCreateParty, useParties, useRSVPParty} from '@/hooks/useParties';
import {
  MEET_NOW_STATUSES,
  MeetNowUser,
  useMeetNowUsers,
  useMyMeetNowStatus,
  useShareLocation,
  useStopSharing
} from '@/hooks/useMeetNow';
import {useSubscription} from '@/hooks/useSubscription';
import {useAuth} from '@/hooks/useAuth';
import {cn} from '@/lib/utils';
import {format} from 'date-fns';

// Simulated map marker positions (in a real app, this would use actual map coordinates)
const generateMarkerPosition = (lat: number, lng: number, index: number) => {
    // Generate pseudo-random positions based on coordinates
    const baseX = ((lng + 180) % 360) / 360;
    const baseY = ((90 - lat) % 180) / 180;
    return {
        x: (baseX * 80 + 10 + (index * 7) % 20) + '%',
        y: (baseY * 60 + 20 + (index * 11) % 15) + '%',
    };
};

const PartyMarker = memo(({party, onClick, index}: { party: Party; onClick: () => void; index: number }) => {
    const position = generateMarkerPosition(party.latitude, party.longitude, index);
    const typeIcon = party.party_type === 'private' ? '🔒' : party.party_type === 'open' ? '🚪' : '🔑';

    return (
        <motion.button
            initial={{scale: 0, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{delay: index * 0.1}}
            onClick={onClick}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{left: position.x, top: position.y}}
        >
            <div className="relative">
                <div
                    className="w-12 h-12 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-xl shadow-lg group-hover:scale-110 transition-transform animate-pulse-glow">
                    🎉
                </div>
                <span className="absolute -top-1 -right-1 text-sm">{typeIcon}</span>
                <div
                    className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/90 backdrop-blur px-2 py-0.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    {party.title}
                </div>
            </div>
        </motion.button>
    );
});

PartyMarker.displayName = 'PartyMarker';

const MeetNowMarker = memo(({user, onClick, index}: { user: MeetNowUser; onClick: () => void; index: number }) => {
    const position = generateMarkerPosition(user.latitude, user.longitude, index + 50);
    const status = MEET_NOW_STATUSES.find((s) => s.id === user.status);

    return (
        <motion.button
            initial={{scale: 0, opacity: 0}}
            animate={{scale: 1, opacity: 1}}
            transition={{delay: index * 0.05}}
            onClick={onClick}
            className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
            style={{left: position.x, top: position.y}}
        >
            <div className="relative">
                <Avatar
                    className="w-10 h-10 border-2 border-background shadow-lg group-hover:scale-110 transition-transform">
                    <AvatarImage src={user.profile?.avatar_url || ''}/>
                    <AvatarFallback>{user.profile?.display_name?.[0] || '?'}</AvatarFallback>
                </Avatar>
                <span
                    className={cn('absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full border-2 border-background', status?.color || 'bg-green-500')}/>
                {user.distance && (
                    <div
                        className="absolute -bottom-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-card/90 backdrop-blur px-2 py-0.5 rounded text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        {user.distance < 1 ? `${Math.round(user.distance * 1000)}m` : `${user.distance.toFixed(1)}km`}
                    </div>
                )}
            </div>
        </motion.button>
    );
});

MeetNowMarker.displayName = 'MeetNowMarker';

function CreatePartyDialog({onClose}: { onClose: () => void }) {
    const createParty = useCreateParty();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        party_type: 'semi-private',
        location: '',
        latitude: 40.7128 + (Math.random() - 0.5) * 0.1,
        longitude: -74.006 + (Math.random() - 0.5) * 0.1,
        start_time: '',
        max_guests: 20,
        dress_code: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createParty.mutate(formData, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Party Type</Label>
                <div className="grid grid-cols-3 gap-2">
                    {PARTY_TYPES.map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({...formData, party_type: type.id})}
                            className={cn(
                                'p-3 rounded-xl border text-center transition-all',
                                formData.party_type === type.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            <span className="text-2xl">{type.icon}</span>
                            <p className="text-sm font-medium mt-1">{type.label}</p>
                            <p className="text-xs text-muted-foreground">{type.description}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Party Name</Label>
                <Input
                    id="title"
                    placeholder="Saturday Night Vibes"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                    id="description"
                    placeholder="Join us for an unforgettable night..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="start_time">When</Label>
                    <Input
                        id="start_time"
                        type="datetime-local"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="max_guests">Max Guests</Label>
                    <Select
                        value={formData.max_guests.toString()}
                        onValueChange={(v) => setFormData({...formData, max_guests: parseInt(v)})}
                    >
                        <SelectTrigger>
                            <SelectValue/>
                        </SelectTrigger>
                        <SelectContent>
                            {[5, 10, 20, 50, 100].map((n) => (
                                <SelectItem key={n} value={n.toString()}>
                                    {n} guests
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    placeholder="Downtown Loft"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="dress_code">Dress Code (optional)</Label>
                <Input
                    id="dress_code"
                    placeholder="Smart casual"
                    value={formData.dress_code}
                    onChange={(e) => setFormData({...formData, dress_code: e.target.value})}
                />
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={createParty.isPending}>
                {createParty.isPending ? 'Creating...' : '🎉 Host Party'}
            </Button>
        </form>
    );
}

function ShareLocationDialog({onClose}: { onClose: () => void }) {
    const shareLocation = useShareLocation();
    const [status, setStatus] = useState('available');
    const [message, setMessage] = useState('');
    const [duration, setDuration] = useState(1);

    const handleShare = () => {
        // In a real app, get actual user location
        const latitude = 40.7128 + (Math.random() - 0.5) * 0.05;
        const longitude = -74.006 + (Math.random() - 0.5) * 0.05;

        shareLocation.mutate(
            {latitude, longitude, status, message, durationHours: duration},
            {onSuccess: () => onClose()}
        );
    };

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                <Label>Your Status</Label>
                <div className="grid grid-cols-3 gap-2">
                    {MEET_NOW_STATUSES.map((s) => (
                        <button
                            key={s.id}
                            type="button"
                            onClick={() => setStatus(s.id)}
                            className={cn(
                                'p-3 rounded-xl border text-center transition-all',
                                status === s.id ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/50'
                            )}
                        >
                            <span className="text-2xl">{s.icon}</span>
                            <p className="text-sm font-medium mt-1">{s.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="message">Message (optional)</Label>
                <Input
                    id="message"
                    placeholder="Looking for coffee ☕"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <Label>Share for</Label>
                <Select value={duration.toString()} onValueChange={(v) => setDuration(parseInt(v))}>
                    <SelectTrigger>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="1">1 hour</SelectItem>
                        <SelectItem value="2">2 hours</SelectItem>
                        <SelectItem value="4">4 hours</SelectItem>
                        <SelectItem value="8">8 hours</SelectItem>
                    </SelectContent>
                </Select>
            </div>

            <Button onClick={handleShare} className="w-full gradient-primary" disabled={shareLocation.isPending}>
                {shareLocation.isPending ? 'Sharing...' : '📍 Share Location'}
            </Button>
        </div>
    );
}

export function PartyMap({onViewProfile}: { onViewProfile: (id: string) => void }) {
    const {user} = useAuth();
    const {isPremium} = useSubscription();
    const [selectedParty, setSelectedParty] = useState<Party | null>(null);
    const [selectedUser, setSelectedUser] = useState<MeetNowUser | null>(null);
    const [showCreateParty, setShowCreateParty] = useState(false);
    const [showShareLocation, setShowShareLocation] = useState(false);
    const [viewMode, setViewMode] = useState<'all' | 'parties' | 'people'>('all');

    const {data: parties = []} = useParties();
    const {data: meetNowUsers = []} = useMeetNowUsers({lat: 40.7128, lng: -74.006});
    const {data: myMeetNowStatus} = useMyMeetNowStatus();
    const rsvpParty = useRSVPParty();
    const stopSharing = useStopSharing();

    return (
        <div className="min-h-screen pb-24 bg-background">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-primary"/>
                            Live Map
                        </h1>
                        <p className="text-sm text-muted-foreground">
                            {parties.length} parties • {meetNowUsers.length} nearby
                        </p>
                    </div>
                    <div className="flex gap-2">
                        {myMeetNowStatus ? (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => stopSharing.mutate()}
                                className="text-destructive border-destructive/30"
                            >
                                <X className="w-4 h-4 mr-1"/>
                                Stop Sharing
                            </Button>
                        ) : (
                            <Dialog open={showShareLocation} onOpenChange={setShowShareLocation}>
                                <DialogTrigger asChild>
                                    <Button variant="outline" size="sm">
                                        <Navigation className="w-4 h-4 mr-1"/>
                                        Go Live
                                    </Button>
                                </DialogTrigger>
                                <DialogContent>
                                    <DialogHeader>
                                        <DialogTitle>Share Your Location</DialogTitle>
                                    </DialogHeader>
                                    <ShareLocationDialog onClose={() => setShowShareLocation(false)}/>
                                </DialogContent>
                            </Dialog>
                        )}
                        <Dialog open={showCreateParty} onOpenChange={setShowCreateParty}>
                            <DialogTrigger asChild>
                                <Button size="sm" className="gradient-primary">
                                    <Plus className="w-4 h-4 mr-1"/>
                                    Host Party
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                                <DialogHeader>
                                    <DialogTitle className="flex items-center gap-2">
                                        <Crown className="w-5 h-5 text-gold"/>
                                        Host a Party
                                    </DialogTitle>
                                </DialogHeader>
                                <CreatePartyDialog onClose={() => setShowCreateParty(false)}/>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                {/* View Mode Toggle */}
                <div className="flex gap-2">
                    {[
                        {id: 'all', label: 'All'},
                        {id: 'parties', label: '🎉 Parties'},
                        {id: 'people', label: '👥 People'},
                    ].map((mode) => (
                        <button
                            key={mode.id}
                            onClick={() => setViewMode(mode.id as typeof viewMode)}
                            className={cn(
                                'px-4 py-2 rounded-full text-sm font-medium transition-colors',
                                viewMode === mode.id
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-secondary/50 hover:bg-secondary'
                            )}
                        >
                            {mode.label}
                        </button>
                    ))}
                </div>
            </header>

            {/* Map Area */}
            <div className="relative h-[60vh] bg-gradient-to-b from-secondary/30 to-background overflow-hidden">
                {/* Grid pattern for visual effect */}
                <div
                    className="absolute inset-0 opacity-20"
                    style={{
                        backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
                        backgroundSize: '50px 50px',
                    }}
                />

                {/* Party Markers */}
                {(viewMode === 'all' || viewMode === 'parties') &&
                    parties.map((party, index) => (
                        <PartyMarker
                            key={party.id}
                            party={party}
                            onClick={() => setSelectedParty(party)}
                            index={index}
                        />
                    ))}

                {/* Meet Now User Markers */}
                {(viewMode === 'all' || viewMode === 'people') &&
                    meetNowUsers.map((user, index) => (
                        <MeetNowMarker
                            key={user.id}
                            user={user}
                            onClick={() => setSelectedUser(user)}
                            index={index}
                        />
                    ))}

                {/* Center marker for user */}
                <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                    <div className="w-4 h-4 rounded-full bg-primary animate-ping absolute"/>
                    <div className="w-4 h-4 rounded-full bg-primary border-2 border-background relative"/>
                </div>
            </div>

            {/* Party List */}
            <div className="p-4 space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-primary"/>
                    Upcoming Parties
                </h3>
                {parties.slice(0, 3).map((party) => (
                    <motion.button
                        key={party.id}
                        initial={{opacity: 0, y: 10}}
                        animate={{opacity: 1, y: 0}}
                        onClick={() => setSelectedParty(party)}
                        className="w-full p-4 rounded-2xl bg-card border border-border/50 text-left hover:border-primary/30 transition-colors"
                    >
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-purple-600 flex items-center justify-center text-lg">
                                    🎉
                                </div>
                                <div>
                                    <h4 className="font-medium">{party.title}</h4>
                                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                                        <Clock className="w-3 h-3"/>
                                        {format(new Date(party.start_time), 'EEE, MMM d • h:mm a')}
                                    </p>
                                </div>
                            </div>
                            <div className="text-right">
                                <Badge variant="secondary" className="mb-1">
                                    <Users className="w-3 h-3 mr-1"/>
                                    {party.rsvp_count}/{party.max_guests}
                                </Badge>
                            </div>
                        </div>
                    </motion.button>
                ))}
            </div>

            {/* Party Detail Sheet */}
            <Sheet open={!!selectedParty} onOpenChange={() => setSelectedParty(null)}>
                <SheetContent side="bottom" className="h-[70vh] rounded-t-3xl">
                    {selectedParty && (
                        <div className="space-y-4">
                            <SheetHeader>
                                <SheetTitle className="flex items-center gap-2">
                                    <span className="text-2xl">🎉</span>
                                    {selectedParty.title}
                                </SheetTitle>
                            </SheetHeader>

                            <div className="space-y-3">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="w-4 h-4"/>
                                    {format(new Date(selectedParty.start_time), 'EEEE, MMMM d • h:mm a')}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <MapPin className="w-4 h-4"/>
                                    {selectedParty.location}
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Users className="w-4 h-4"/>
                                    {selectedParty.rsvp_count} / {selectedParty.max_guests} guests
                                </div>
                                {selectedParty.dress_code && (
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <span>👔</span>
                                        {selectedParty.dress_code}
                                    </div>
                                )}
                            </div>

                            {selectedParty.description && (
                                <p className="text-muted-foreground">{selectedParty.description}</p>
                            )}

                            <div className="flex items-center gap-3 p-3 rounded-xl bg-secondary/50">
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={selectedParty.host?.avatar_url || ''}/>
                                    <AvatarFallback>{selectedParty.host?.display_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <p className="font-medium">{selectedParty.host?.display_name}</p>
                                    <p className="text-sm text-muted-foreground">Host</p>
                                </div>
                            </div>

                            {selectedParty.my_rsvp_status ? (
                                <Badge
                                    className={cn(
                                        'w-full justify-center py-3',
                                        selectedParty.my_rsvp_status === 'approved'
                                            ? 'bg-green-500/20 text-green-500'
                                            : selectedParty.my_rsvp_status === 'pending'
                                                ? 'bg-yellow-500/20 text-yellow-500'
                                                : 'bg-destructive/20 text-destructive'
                                    )}
                                >
                                    {selectedParty.my_rsvp_status === 'approved'
                                        ? "✅ You're on the list!"
                                        : selectedParty.my_rsvp_status === 'pending'
                                            ? '⏳ Request pending'
                                            : '❌ Request declined'}
                                </Badge>
                            ) : (
                                <Button
                                    className="w-full gradient-primary"
                                    onClick={() => {
                                        rsvpParty.mutate({partyId: selectedParty.id});
                                        setSelectedParty(null);
                                    }}
                                >
                                    <Send className="w-4 h-4 mr-2"/>
                                    Request to Join
                                </Button>
                            )}
                        </div>
                    )}
                </SheetContent>
            </Sheet>

            {/* User Detail Sheet */}
            <Sheet open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <SheetContent side="bottom" className="h-[50vh] rounded-t-3xl">
                    {selectedUser && (
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <Avatar className="w-16 h-16">
                                    <AvatarImage src={selectedUser.profile?.avatar_url || ''}/>
                                    <AvatarFallback>{selectedUser.profile?.display_name?.[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <h3 className="text-xl font-bold">{selectedUser.profile?.display_name}</h3>
                                    <p className="text-muted-foreground">
                                        {selectedUser.profile?.age && `${selectedUser.profile.age} • `}
                                        {selectedUser.distance
                                            ? selectedUser.distance < 1
                                                ? `${Math.round(selectedUser.distance * 1000)}m away`
                                                : `${selectedUser.distance.toFixed(1)}km away`
                                            : 'Nearby'}
                                    </p>
                                </div>
                            </div>

                            {selectedUser.message && (
                                <div className="p-3 rounded-xl bg-secondary/50">
                                    <p className="text-sm">"{selectedUser.message}"</p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button
                                    className="flex-1 gradient-primary"
                                    onClick={() => {
                                        onViewProfile(selectedUser.user_id);
                                        setSelectedUser(null);
                                    }}
                                >
                                    View Profile
                                </Button>
                                <Button variant="outline" className="flex-1">
                                    Say Hi 👋
                                </Button>
                            </div>
                        </div>
                    )}
                </SheetContent>
            </Sheet>
        </div>
    );
}
