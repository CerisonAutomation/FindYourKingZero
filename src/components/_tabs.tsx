import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Calendar, Check, ChevronRight, Clock, CreditCard, DollarSign, Loader2, MapPin, Plus, X} from 'lucide-react';
import {Booking, useBookings, useUpdateBookingStatus} from '@/hooks/useBookings';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Skeleton} from '@/components/ui/skeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {cn} from '@/lib/utils';
import {format, parseISO} from 'date-fns';

interface BookingsTabProps {
    onViewProfile: (profileId: string) => void;
}

function BookingCardSkeleton() {
    return (
        <div className="p-4 rounded-2xl bg-card border border-border/50 space-y-4">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Skeleton className="w-12 h-12 rounded-full"/>
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-24"/>
                        <Skeleton className="h-3 w-16"/>
                    </div>
                </div>
                <Skeleton className="h-6 w-20 rounded-full"/>
            </div>
            <div className="grid grid-cols-2 gap-3">
                <Skeleton className="h-4 w-24"/>
                <Skeleton className="h-4 w-20"/>
                <Skeleton className="h-4 w-32 col-span-2"/>
            </div>
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <Skeleton className="h-6 w-16"/>
                <Skeleton className="h-9 w-24"/>
            </div>
        </div>
    );
}

export function BookingsTab({onViewProfile}: BookingsTabProps) {
    const [activeTab, setActiveTab] = useState<'pending' | 'upcoming' | 'past'>('upcoming');

    // Fetch real bookings from database
    const {data: pendingBookings = [], isLoading: loadingPending} = useBookings('pending');
    const {data: upcomingBookings = [], isLoading: loadingUpcoming} = useBookings('upcoming');
    const {data: pastBookings = [], isLoading: loadingPast} = useBookings('past');

    const updateStatus = useUpdateBookingStatus();

    const isLoading = loadingPending || loadingUpcoming || loadingPast;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending':
                return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/30';
            case 'accepted':
                return 'bg-green-500/10 text-green-500 border-green-500/30';
            case 'completed':
                return 'bg-primary/10 text-primary border-primary/30';
            case 'cancelled':
            case 'declined':
                return 'bg-destructive/10 text-destructive border-destructive/30';
            default:
                return 'bg-muted text-muted-foreground';
        }
    };

    const handleAccept = (bookingId: string) => {
        updateStatus.mutate({bookingId, status: 'accepted'});
    };

    const handleDecline = (bookingId: string) => {
        updateStatus.mutate({bookingId, status: 'declined'});
    };

    const BookingCard = ({booking, index}: { booking: Booking; index: number }) => {
        const bookingDate = parseISO(booking.booking_date);
        const otherUser = booking.other_user;

        return (
            <motion.div
                initial={{opacity: 0, y: 20}}
                animate={{opacity: 1, y: 0}}
                transition={{delay: index * 0.05}}
                className="p-4 rounded-2xl bg-card border border-border/50 space-y-4 hover:border-primary/30 transition-colors"
            >
                {/* Header */}
                <div className="flex items-center justify-between">
                    <button
                        onClick={() => otherUser && onViewProfile(otherUser.user_id)}
                        className="flex items-center gap-3 group"
                    >
                        <Avatar
                            className="w-12 h-12 border-2 border-border group-hover:border-primary/50 transition-colors">
                            <AvatarImage src={otherUser?.avatar_url || ''}/>
                            <AvatarFallback>{(otherUser?.display_name || 'U')[0]}</AvatarFallback>
                        </Avatar>
                        <div className="text-left">
                            <p className="font-semibold group-hover:text-primary transition-colors">
                                {otherUser?.display_name || 'User'}
                            </p>
                            <p className="text-sm text-muted-foreground">
                                {otherUser?.city || 'Unknown location'}
                            </p>
                        </div>
                    </button>
                    <Badge variant="outline" className={cn("capitalize", getStatusColor(booking.status))}>
                        {booking.status}
                    </Badge>
                </div>

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="w-4 h-4 shrink-0"/>
                        <span>{format(bookingDate, 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Clock className="w-4 h-4 shrink-0"/>
                        <span>{booking.start_time} ({booking.duration_hours}h)</span>
                    </div>
                    {booking.location && (
                        <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                            <MapPin className="w-4 h-4 shrink-0"/>
                            <span className="truncate">{booking.location}</span>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex items-center justify-between pt-3 border-t border-border/50">
                    <div className="flex items-center gap-1.5">
                        <DollarSign className="w-5 h-5 text-gold"/>
                        <span className="text-lg font-bold text-gold">
              {booking.total_amount ? `$${booking.total_amount}` : 'TBD'}
            </span>
                        {booking.payment_status && (
                            <Badge variant="outline" className="ml-2 text-xs">
                                <CreditCard className="w-3 h-3 mr-1"/>
                                {booking.payment_status}
                            </Badge>
                        )}
                    </div>

                    {booking.status === 'pending' && (
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleDecline(booking.id)}
                                disabled={updateStatus.isPending}
                                className="text-destructive border-destructive/30 hover:bg-destructive/10"
                            >
                                {updateStatus.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                ) : (
                                    <>
                                        <X className="w-4 h-4 mr-1"/>
                                        Decline
                                    </>
                                )}
                            </Button>
                            <Button
                                size="sm"
                                onClick={() => handleAccept(booking.id)}
                                disabled={updateStatus.isPending}
                                className="gradient-primary"
                            >
                                {updateStatus.isPending ? (
                                    <Loader2 className="w-4 h-4 animate-spin"/>
                                ) : (
                                    <>
                                        <Check className="w-4 h-4 mr-1"/>
                                        Accept
                                    </>
                                )}
                            </Button>
                        </div>
                    )}

                    {booking.status === 'accepted' && (
                        <Button variant="outline" size="sm">
                            View Details
                            <ChevronRight className="w-4 h-4 ml-1"/>
                        </Button>
                    )}
                </div>
            </motion.div>
        );
    };

    const currentBookings = activeTab === 'pending'
        ? pendingBookings
        : activeTab === 'upcoming'
            ? upcomingBookings
            : pastBookings;

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/30">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold">Bookings</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                Manage your appointments
                            </p>
                        </div>
                        <Button size="icon" className="gradient-primary rounded-full w-12 h-12">
                            <Plus className="w-5 h-5"/>
                        </Button>
                    </div>

                    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)} className="w-full">
                        <TabsList className="w-full bg-secondary/50">
                            <TabsTrigger value="pending"
                                         className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                Pending
                                {pendingBookings.length > 0 && (
                                    <motion.span
                                        initial={{scale: 0}}
                                        animate={{scale: 1}}
                                        className="ml-1.5 w-5 h-5 rounded-full bg-yellow-500 text-yellow-950 text-xs flex items-center justify-center font-bold"
                                    >
                                        {pendingBookings.length}
                                    </motion.span>
                                )}
                            </TabsTrigger>
                            <TabsTrigger value="upcoming"
                                         className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                Upcoming
                            </TabsTrigger>
                            <TabsTrigger value="past"
                                         className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                                Past
                            </TabsTrigger>
                        </TabsList>
                    </Tabs>
                </div>
            </header>

            {/* Content */}
            <div className="p-4 space-y-4">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <motion.div
                            key="loading"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="space-y-4"
                        >
                            {[...Array(3)].map((_, i) => (
                                <BookingCardSkeleton key={i}/>
                            ))}
                        </motion.div>
                    ) : currentBookings.length > 0 ? (
                        <motion.div
                            key={activeTab}
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="space-y-4"
                        >
                            {currentBookings.map((booking, index) => (
                                <BookingCard key={booking.id} booking={booking} index={index}/>
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState
                            icon={Calendar}
                            title={`No ${activeTab} bookings`}
                            description={
                                activeTab === 'pending'
                                    ? "You don't have any pending booking requests."
                                    : activeTab === 'upcoming'
                                        ? "You don't have any upcoming appointments."
                                        : "You haven't completed any bookings yet."
                            }
                        />
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
import {memo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Calendar, Check, Clock, Crown, MapPin, Plus, Sparkles, Users, X,} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {Tabs, TabsList, TabsTrigger} from '@/components/ui/tabs';
import {Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,} from '@/components/ui/dialog';
import {Input} from '@/components/ui/input';
import {Label} from '@/components/ui/label';
import {Textarea} from '@/components/ui/textarea';
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from '@/components/ui/select';
import {Event, EVENT_TYPES, useCreateEvent, useEvents, useJoinEvent, useLeaveEvent} from '@/hooks/useEvents';
import {useAuth} from '@/hooks/useAuth';
import {cn} from '@/lib/utils';
import {format, parseISO} from 'date-fns';

interface EventsTabProps {
    onViewProfile: (profileId: string) => void;
}

const EventCard = memo(({event, onJoin, onLeave, onViewProfile}: {
    event: Event;
    onJoin: (id: string) => void;
    onLeave: (id: string) => void;
    onViewProfile: (id: string) => void;
}) => {
    const eventType = EVENT_TYPES.find((t) => t.id === event.event_type);
    const eventDate = parseISO(event.event_date);

    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="p-4 rounded-2xl bg-card border border-border/50 space-y-4 hover:border-primary/30 transition-colors"
        >
            {/* Header */}
            <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div
                        className={cn(
                            'w-12 h-12 rounded-xl flex items-center justify-center text-2xl',
                            eventType?.color || 'bg-primary/20'
                        )}
                    >
                        {eventType?.icon || '📅'}
                    </div>
                    <div className="min-w-0">
                        <h3 className="font-semibold truncate">{event.title}</h3>
                        <p className="text-sm text-muted-foreground capitalize">
                            {eventType?.label || event.event_type}
                        </p>
                    </div>
                </div>
                {event.is_premium_only && (
                    <Badge className="bg-gold/20 text-gold border-gold/30 shrink-0">
                        <Crown className="w-3 h-3 mr-1"/>
                        VIP
                    </Badge>
                )}
            </div>

            {/* Details */}
            <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="w-4 h-4 shrink-0"/>
                    <span className="truncate">{format(eventDate, 'EEE, MMM d')}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4 shrink-0"/>
                    <span>{event.start_time.slice(0, 5)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground col-span-2">
                    <MapPin className="w-4 h-4 shrink-0"/>
                    <span className="truncate">{event.location}</span>
                </div>
            </div>

            {/* Host & Attendees */}
            <div className="flex items-center justify-between pt-3 border-t border-border/50">
                <button
                    onClick={() => event.host_id && onViewProfile(event.host_id)}
                    className="flex items-center gap-2"
                >
                    <Avatar className="w-8 h-8 border border-border">
                        <AvatarImage src={event.host?.avatar_url || ''}/>
                        <AvatarFallback>{event.host?.display_name?.[0] || 'H'}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{event.host?.display_name || 'Host'}</span>
                </button>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="w-4 h-4"/>
                        <span>
              {event.attendee_count}/{event.max_attendees}
            </span>
                    </div>

                    {event.is_attending ? (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onLeave(event.id)}
                            className="text-destructive border-destructive/30 hover:bg-destructive/10"
                        >
                            <X className="w-4 h-4 mr-1"/>
                            Leave
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={() => onJoin(event.id)}
                            className="gradient-primary"
                            disabled={(event.attendee_count || 0) >= event.max_attendees}
                        >
                            <Check className="w-4 h-4 mr-1"/>
                            Join
                        </Button>
                    )}
                </div>
            </div>
        </motion.div>
    );
});

EventCard.displayName = 'EventCard';

function CreateEventDialog({onClose}: { onClose: () => void }) {
    const createEvent = useCreateEvent();
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        event_type: 'meetup',
        location: '',
        event_date: '',
        start_time: '',
        max_attendees: 10,
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createEvent.mutate(formData, {
            onSuccess: () => onClose(),
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
                <Label>Event Type</Label>
                <div className="grid grid-cols-5 gap-2">
                    {EVENT_TYPES.slice(0, 10).map((type) => (
                        <button
                            key={type.id}
                            type="button"
                            onClick={() => setFormData({...formData, event_type: type.id})}
                            className={cn(
                                'p-3 rounded-xl border text-center transition-all',
                                formData.event_type === type.id
                                    ? 'border-primary bg-primary/10'
                                    : 'border-border hover:border-primary/50'
                            )}
                        >
                            <span className="text-2xl">{type.icon}</span>
                            <p className="text-xs mt-1 truncate">{type.label}</p>
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                    id="title"
                    placeholder="Gym session at 7am"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="description">Description (optional)</Label>
                <Textarea
                    id="description"
                    placeholder="Looking for a gym buddy..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    rows={2}
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label htmlFor="event_date">Date</Label>
                    <Input
                        id="event_date"
                        type="date"
                        value={formData.event_date}
                        onChange={(e) => setFormData({...formData, event_date: e.target.value})}
                        required
                    />
                </div>
                <div className="space-y-2">
                    <Label htmlFor="start_time">Time</Label>
                    <Input
                        id="start_time"
                        type="time"
                        value={formData.start_time}
                        onChange={(e) => setFormData({...formData, start_time: e.target.value})}
                        required
                    />
                </div>
            </div>

            <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                    id="location"
                    placeholder="Gold's Gym, Manhattan"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                    required
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="max_attendees">Max Attendees</Label>
                <Select
                    value={formData.max_attendees.toString()}
                    onValueChange={(v) => setFormData({...formData, max_attendees: parseInt(v)})}
                >
                    <SelectTrigger>
                        <SelectValue/>
                    </SelectTrigger>
                    <SelectContent>
                        {[2, 5, 10, 20, 50, 100].map((n) => (
                            <SelectItem key={n} value={n.toString()}>
                                {n} people
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <Button type="submit" className="w-full gradient-primary" disabled={createEvent.isPending}>
                {createEvent.isPending ? 'Creating...' : 'Create Event'}
            </Button>
        </form>
    );
}

function EmptyState({message, icon}: { message: string; icon?: React.ReactNode }) {
    return (
        <motion.div
            initial={{opacity: 0}}
            animate={{opacity: 1}}
            className="flex flex-col items-center justify-center py-16 text-center"
        >
            <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
                {icon || <Calendar className="w-8 h-8 text-muted-foreground"/>}
            </div>
            <p className="text-muted-foreground">{message}</p>
        </motion.div>
    );
}

export function EventsTab({onViewProfile}: EventsTabProps) {
    const [activeTab, setActiveTab] = useState('upcoming');
    const [showCreate, setShowCreate] = useState(false);
    const {user} = useAuth();

    const {data: upcomingEvents = [], isLoading: loadingUpcoming} = useEvents('upcoming');
    const {data: myEvents = []} = useEvents('my_events');
    const {data: attendingEvents = []} = useEvents('attending');

    const joinEvent = useJoinEvent();
    const leaveEvent = useLeaveEvent();

    const handleJoin = (eventId: string) => {
        joinEvent.mutate(eventId);
    };

    const handleLeave = (eventId: string) => {
        leaveEvent.mutate(eventId);
    };

    return (
        <div className="min-h-screen pb-24">
            {/* Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/50 px-4 py-4">
                <div className="flex items-center justify-between mb-4">
                    <div>
                        <h1 className="text-2xl font-bold">Events</h1>
                        <p className="text-sm text-muted-foreground mt-1">Find your activity partner</p>
                    </div>
                    <Dialog open={showCreate} onOpenChange={setShowCreate}>
                        <DialogTrigger asChild>
                            <Button size="icon" className="gradient-primary rounded-full">
                                <Plus className="w-5 h-5"/>
                            </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
                            <DialogHeader>
                                <DialogTitle>Create Event</DialogTitle>
                            </DialogHeader>
                            <CreateEventDialog onClose={() => setShowCreate(false)}/>
                        </DialogContent>
                    </Dialog>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                    <TabsList className="w-full bg-secondary/50">
                        <TabsTrigger
                            value="upcoming"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Sparkles className="w-4 h-4 mr-1.5"/>
                            Discover
                        </TabsTrigger>
                        <TabsTrigger
                            value="attending"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Check className="w-4 h-4 mr-1.5"/>
                            Attending
                        </TabsTrigger>
                        <TabsTrigger
                            value="hosting"
                            className="flex-1 data-[state=active]:bg-primary data-[state=active]:text-primary-foreground"
                        >
                            <Crown className="w-4 h-4 mr-1.5"/>
                            Hosting
                        </TabsTrigger>
                    </TabsList>
                </Tabs>
            </header>

            {/* Quick Event Types */}
            <div className="px-4 py-3 overflow-x-auto scrollbar-hide">
                <div className="flex gap-2">
                    {EVENT_TYPES.map((type) => (
                        <button
                            key={type.id}
                            className="flex items-center gap-2 px-4 py-2 rounded-full bg-secondary/50 border border-border/50 hover:border-primary/50 transition-colors shrink-0"
                        >
                            <span>{type.icon}</span>
                            <span className="text-sm font-medium">{type.label}</span>
                        </button>
                    ))}
                </div>
            </div>

            {/* Content */}
            <div className="p-4 space-y-4">
                <AnimatePresence mode="wait">
                    {activeTab === 'upcoming' && (
                        <motion.div
                            key="upcoming"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="space-y-4"
                        >
                            {loadingUpcoming ? (
                                <div className="flex justify-center py-12">
                                    <div
                                        className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"/>
                                </div>
                            ) : upcomingEvents.length > 0 ? (
                                upcomingEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onJoin={handleJoin}
                                        onLeave={handleLeave}
                                        onViewProfile={onViewProfile}
                                    />
                                ))
                            ) : (
                                <EmptyState message="No events nearby. Create one!"/>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'attending' && (
                        <motion.div
                            key="attending"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="space-y-4"
                        >
                            {attendingEvents.length > 0 ? (
                                attendingEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onJoin={handleJoin}
                                        onLeave={handleLeave}
                                        onViewProfile={onViewProfile}
                                    />
                                ))
                            ) : (
                                <EmptyState message="You haven't joined any events yet"/>
                            )}
                        </motion.div>
                    )}

                    {activeTab === 'hosting' && (
                        <motion.div
                            key="hosting"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="space-y-4"
                        >
                            {myEvents.length > 0 ? (
                                myEvents.map((event) => (
                                    <EventCard
                                        key={event.id}
                                        event={event}
                                        onJoin={handleJoin}
                                        onLeave={handleLeave}
                                        onViewProfile={onViewProfile}
                                    />
                                ))
                            ) : (
                                <EmptyState message="You haven't created any events yet"/>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}
import {useCallback, useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {RefreshCw, Search, SlidersHorizontal, Sparkles, Users} from 'lucide-react';
import {ProfileCard} from '@/components/ui/ProfileCard';
import {FilterDialog} from '@/components/FilterDialog';
import {ProfileDetail} from '@/components/ProfileDetail';
import {ProfileGridSkeleton} from '@/components/ui/ProfileSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {Profile, useProfiles} from '@/hooks/useProfile';
import {useBlocks} from '@/hooks/useBlocks';
import {FilterPreferences} from '@/types';
import {Input} from '@/components/ui/input';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';

interface ExploreTabProps {
    favorites: string[];
    onToggleFavorite: (id: string) => void;
    onStartChat: (profileId: string) => void;
}

export function ExploreTab({favorites, onToggleFavorite, onStartChat}: ExploreTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
    const [filters, setFilters] = useState<FilterPreferences>({
        ageRange: [18, 60],
        distanceRadius: 50,
        tribes: [],
        lookingFor: [],
        showOnlineOnly: false,
        showVerifiedOnly: false,
    });

    // Fetch real profiles from database
    const {data: profiles, isLoading, refetch, isRefetching} = useProfiles({
        minAge: filters.ageRange[0],
        maxAge: filters.ageRange[1],
        isOnline: filters.showOnlineOnly || undefined,
        isVerified: filters.showVerifiedOnly || undefined,
        tribes: filters.tribes.length > 0 ? filters.tribes : undefined,
    });

    // Get blocked users to filter them out
    const {blocks} = useBlocks();
    const blockedIds = blocks.map(b => b.blocked_id);

    const filteredProfiles = useMemo(() => {
        if (!profiles) return [];

        return profiles
            .filter((profile) => {
                // Filter out blocked users
                if (blockedIds.includes(profile.user_id)) return false;

                // Search filter
                if (searchQuery) {
                    const query = searchQuery.toLowerCase();
                    const name = (profile.display_name || '').toLowerCase();
                    const city = (profile.city || '').toLowerCase();
                    const bio = (profile.bio || '').toLowerCase();
                    if (!name.includes(query) && !city.includes(query) && !bio.includes(query)) {
                        return false;
                    }
                }

                return true;
            })
            .sort((a, b) => {
                // Sort by online status first, then by last_seen
                if (a.is_online !== b.is_online) return a.is_online ? -1 : 1;
                return new Date(b.last_seen || 0).getTime() - new Date(a.last_seen || 0).getTime();
            });
    }, [profiles, searchQuery, blockedIds]);

    const activeFiltersCount = useMemo(() => {
        let count = 0;
        if (filters.ageRange[0] !== 18 || filters.ageRange[1] !== 60) count++;
        if (filters.distanceRadius !== 50) count++;
        if (filters.tribes.length > 0) count++;
        if (filters.lookingFor.length > 0) count++;
        if (filters.showOnlineOnly) count++;
        if (filters.showVerifiedOnly) count++;
        return count;
    }, [filters]);

    const onlineCount = useMemo(() => {
        return filteredProfiles.filter(p => p.is_online).length;
    }, [filteredProfiles]);

    const handleRefresh = useCallback(() => {
        refetch();
    }, [refetch]);

    // Convert database profile to display format for ProfileDetail
    const convertToDisplayProfile = (profile: Profile) => ({
        id: profile.user_id,
        name: profile.display_name || 'User',
        age: profile.age || 0,
        location: profile.city ? `${profile.city}${profile.country ? `, ${profile.country}` : ''}` : 'Unknown',
        avatar: profile.avatar_url || '/placeholder.svg',
        photos: profile.avatar_url ? [profile.avatar_url] : [],
        bio: profile.bio || '',
        height: profile.height ? `${Math.floor(profile.height / 12)}'${profile.height % 12}"` : undefined,
        weight: profile.weight ? `${profile.weight} lbs` : undefined,
        tribes: profile.tribes || [],
        lookingFor: profile.looking_for || [],
        isOnline: profile.is_online,
        isVerified: profile.is_verified,
        isPremium: profile.is_available_now,
        role: 'seeker' as const,
        hourlyRate: profile.hourly_rate || undefined,
        rating: profile.rating,
    });

    return (
        <div className="min-h-screen pb-24">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/30">
                <div className="px-4 py-4">
                    {/* Search Row */}
                    <div className="flex items-center gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                            <Input
                                type="text"
                                placeholder="Search by name, city, or bio..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-secondary/50 border-border/50 focus:border-primary/50 h-11"
                            />
                        </div>
                        <Button
                            variant="outline"
                            size="icon"
                            onClick={() => setShowFilters(true)}
                            className="relative shrink-0 h-11 w-11"
                        >
                            <SlidersHorizontal className="w-5 h-5"/>
                            {activeFiltersCount > 0 && (
                                <motion.span
                                    initial={{scale: 0}}
                                    animate={{scale: 1}}
                                    className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold shadow-lg"
                                >
                                    {activeFiltersCount}
                                </motion.span>
                            )}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={handleRefresh}
                            disabled={isRefetching}
                            className="shrink-0 h-11 w-11"
                        >
                            <RefreshCw className={`w-5 h-5 ${isRefetching ? 'animate-spin' : ''}`}/>
                        </Button>
                    </div>

                    {/* Stats Row */}
                    <motion.div
                        initial={{opacity: 0, y: -10}}
                        animate={{opacity: 1, y: 0}}
                        className="flex items-center justify-between mt-3"
                    >
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2">
                                <div
                                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                    <motion.div
                                        className="w-2 h-2 rounded-full bg-green-500"
                                        animate={{scale: [1, 1.2, 1]}}
                                        transition={{duration: 1.5, repeat: Infinity}}
                                    />
                                    <span className="text-sm font-medium text-green-400">{onlineCount} online</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
                                <Users className="w-4 h-4"/>
                                <span>{filteredProfiles.length} profiles</span>
                            </div>
                        </div>

                        <Badge variant="secondary" className="gap-1.5">
                            <Sparkles className="w-3 h-3 text-primary"/>
                            Live
                        </Badge>
                    </motion.div>
                </div>
            </header>

            {/* Profile Grid */}
            <div className="p-4">
                <AnimatePresence mode="wait">
                    {isLoading ? (
                        <ProfileGridSkeleton count={8}/>
                    ) : filteredProfiles.length > 0 ? (
                        <motion.div
                            key="profiles"
                            initial={{opacity: 0}}
                            animate={{opacity: 1}}
                            exit={{opacity: 0}}
                            className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                        >
                            {filteredProfiles.map((profile, index) => (
                                <ProfileCard
                                    key={profile.user_id}
                                    profile={profile}
                                    index={index}
                                    isFavorited={favorites.includes(profile.user_id)}
                                    onFavorite={onToggleFavorite}
                                    onMessage={onStartChat}
                                    onClick={() => setSelectedProfile(profile)}
                                />
                            ))}
                        </motion.div>
                    ) : (
                        <EmptyState
                            icon={Search}
                            title="No profiles found"
                            description="Try adjusting your filters or search terms to discover more people."
                            actionLabel="Reset Filters"
                            onAction={() => {
                                setSearchQuery('');
                                setFilters({
                                    ageRange: [18, 60],
                                    distanceRadius: 50,
                                    tribes: [],
                                    lookingFor: [],
                                    showOnlineOnly: false,
                                    showVerifiedOnly: false,
                                });
                            }}
                        />
                    )}
                </AnimatePresence>
            </div>

            {/* Filter Dialog */}
            <FilterDialog
                open={showFilters}
                onOpenChange={setShowFilters}
                filters={filters}
                onFiltersChange={setFilters}
            />

            {/* Profile Detail Sheet */}
            {selectedProfile && (
                <ProfileDetail
                    profile={convertToDisplayProfile(selectedProfile)}
                    open={!!selectedProfile}
                    onOpenChange={(open) => !open && setSelectedProfile(null)}
                    isFavorited={favorites.includes(selectedProfile.user_id)}
                    onFavorite={onToggleFavorite}
                    onMessage={onStartChat}
                />
            )}
        </div>
    );
}
import {motion} from 'framer-motion';
import {Heart, Sparkles} from 'lucide-react';
import {useFavorites} from '@/hooks/useFavorites';
import {ProfileCard} from '@/components/ui/ProfileCard';
import {ProfileGridSkeleton} from '@/components/ui/ProfileSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {Badge} from '@/components/ui/badge';

interface FavoritesTabProps {
    favorites: string[];
    onToggleFavorite: (id: string) => void;
    onStartChat: (profileId: string) => void;
    onViewProfile: (profileId: string) => void;
}

export function FavoritesTab({
                                 favorites,
                                 onToggleFavorite,
                                 onStartChat,
                                 onViewProfile
                             }: FavoritesTabProps) {
    // Use real favorites from database
    const {favorites: favoritedProfiles, isLoading, favoriteIds} = useFavorites();

    const onlineCount = favoritedProfiles.filter(p => p.is_online).length;

    return (
        <div className="min-h-screen pb-24">
            {/* Premium Header */}
            <header className="sticky top-0 z-40 glass border-b border-border/30">
                <div className="px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold">Favorites</h1>
                            <p className="text-sm text-muted-foreground mt-1">
                                {favoriteIds.length} saved {favoriteIds.length === 1 ? 'profile' : 'profiles'}
                            </p>
                        </div>
                        <motion.div
                            className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center"
                            animate={{scale: [1, 1.05, 1]}}
                            transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
                        >
                            <Heart className="w-7 h-7 text-primary"/>
                        </motion.div>
                    </div>

                    {/* Stats */}
                    {favoritedProfiles.length > 0 && (
                        <motion.div
                            initial={{opacity: 0, y: -10}}
                            animate={{opacity: 1, y: 0}}
                            className="flex items-center gap-4 mt-4"
                        >
                            <div
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-500/10 border border-green-500/20">
                                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"/>
                                <span className="text-sm font-medium text-green-400">{onlineCount} online</span>
                            </div>
                            <Badge variant="secondary" className="gap-1.5">
                                <Sparkles className="w-3 h-3 text-primary"/>
                                {favoritedProfiles.length} saved
                            </Badge>
                        </motion.div>
                    )}
                </div>
            </header>

            {/* Content */}
            <div className="p-4">
                {isLoading ? (
                    <ProfileGridSkeleton count={4}/>
                ) : favoritedProfiles.length > 0 ? (
                    <motion.div
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
                    >
                        {favoritedProfiles.map((profile, index) => (
                            <ProfileCard
                                key={profile.user_id}
                                profile={profile}
                                index={index}
                                isFavorited={true}
                                onFavorite={onToggleFavorite}
                                onMessage={onStartChat}
                                onClick={() => onViewProfile(profile.user_id)}
                            />
                        ))}
                    </motion.div>
                ) : (
                    <EmptyState
                        icon={Heart}
                        title="No favorites yet"
                        description="Start exploring and save profiles you like. They'll appear here for easy access."
                        actionLabel="Start Exploring"
                        onAction={() => {
                            // Navigate to explore tab would be handled by parent
                        }}
                    />
                )}
            </div>
        </div>
    );
}
import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {MessageCircle, Search, Sparkles} from 'lucide-react';
import {Conversation, useConversations} from '@/hooks/useMessages';
import {UnifiedChatWindow} from '@/components/chat/UnifiedChatWindow';
import {ConversationListSkeleton} from '@/components/ui/ProfileSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';

interface MessagesTabProps {
    onViewProfile: (profileId: string) => void;
}

export function MessagesTab({onViewProfile}: MessagesTabProps) {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(null);

    // Fetch real conversations from database
    const {conversations, isLoading} = useConversations();

    const filteredConversations = useMemo(() => {
        if (!conversations) return [];

        return conversations.filter((conv) => {
            if (!searchQuery) return true;
            const name = conv.other_user?.display_name || '';
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery]);

    const totalUnread = useMemo(() => {
        return conversations.reduce((acc, conv) => acc + (conv.unread_count || 0), 0);
    }, [conversations]);

    const formatTime = (dateString: string | undefined) => {
        if (!dateString) return '';
        try {
            return formatDistanceToNow(new Date(dateString), {addSuffix: false});
        } catch {
            return '';
        }
    };

    return (
        <div className="min-h-screen pb-24">
            <AnimatePresence mode="wait">
                {selectedConversation ? (
                    <UnifiedChatWindow
                        key="chat"
                        conversation={selectedConversation}
                        onBack={() => setSelectedConversation(null)}
                        onViewProfile={onViewProfile}
                    />
                ) : (
                    <motion.div
                        key="list"
                        initial={{opacity: 0}}
                        animate={{opacity: 1}}
                        exit={{opacity: 0}}
                    >
                        {/* Premium Header */}
                        <header className="sticky top-0 z-40 glass border-b border-border/30">
                            <div className="px-4 py-4">
                                <div className="flex items-center justify-between mb-4">
                                    <div>
                                        <h1 className="text-2xl font-bold">Messages</h1>
                                        <p className="text-sm text-muted-foreground mt-0.5">
                                            {conversations.length} conversation{conversations.length !== 1 ? 's' : ''}
                                        </p>
                                    </div>
                                    {totalUnread > 0 && (
                                        <Badge className="bg-primary text-primary-foreground px-3 py-1 text-sm">
                                            {totalUnread} unread
                                        </Badge>
                                    )}
                                </div>

                                <div className="relative">
                                    <Search
                                        className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground"/>
                                    <Input
                                        type="text"
                                        placeholder="Search conversations..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="pl-10 bg-secondary/50 border-border/50 h-11"
                                    />
                                </div>
                            </div>
                        </header>

                        {/* Conversations List */}
                        {isLoading ? (
                            <ConversationListSkeleton count={5}/>
                        ) : filteredConversations.length > 0 ? (
                            <div className="divide-y divide-border/30">
                                {filteredConversations.map((conversation, index) => (
                                    <motion.button
                                        key={conversation.id}
                                        initial={{opacity: 0, x: -20}}
                                        animate={{opacity: 1, x: 0}}
                                        transition={{delay: index * 0.05}}
                                        onClick={() => setSelectedConversation(conversation)}
                                        className="w-full flex items-center gap-4 p-4 hover:bg-secondary/30 transition-all duration-200 text-left group"
                                    >
                                        {/* Avatar with online indicator */}
                                        <div className="relative">
                                            <Avatar
                                                className="w-14 h-14 border-2 border-border group-hover:border-primary/50 transition-colors">
                                                <AvatarImage src={conversation.other_user?.avatar_url || ''}/>
                                                <AvatarFallback
                                                    className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
                                                    {(conversation.other_user?.display_name || 'U')[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            {conversation.other_user?.is_online && (
                                                <motion.div
                                                    className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-green-500 border-2 border-background"
                                                    animate={{scale: [1, 1.1, 1]}}
                                                    transition={{duration: 2, repeat: Infinity}}
                                                />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between gap-2">
                                                <div className="flex items-center gap-1.5 min-w-0">
                          <span className="font-semibold truncate">
                            {conversation.other_user?.display_name || 'User'}
                          </span>
                                                    {conversation.other_user?.is_online && (
                                                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0"/>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime(conversation.last_message?.created_at)}
                        </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-1">
                                                <p className={cn(
                                                    "text-sm truncate",
                                                    (conversation.unread_count || 0) > 0
                                                        ? "text-foreground font-medium"
                                                        : "text-muted-foreground"
                                                )}>
                                                    {conversation.last_message?.content || 'Start a conversation...'}
                                                </p>
                                                {(conversation.unread_count || 0) > 0 && (
                                                    <motion.span
                                                        initial={{scale: 0}}
                                                        animate={{scale: 1}}
                                                        className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold"
                                                    >
                                                        {conversation.unread_count}
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        ) : (
                            <EmptyState
                                icon={MessageCircle}
                                title="No conversations yet"
                                description="Start chatting with someone from their profile to begin a conversation."
                            />
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
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
