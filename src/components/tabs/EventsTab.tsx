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
import type {AppEvent} from '@/hooks/useEvents';
import {EVENT_TYPES, useCreateEvent, useEvents, useJoinEvent, useLeaveEvent} from '@/hooks/useEvents';
import {useAuth} from '@/hooks/useAuth';
import {cn} from '@/lib/utils';
import {format, parseISO} from 'date-fns';

interface EventsTabProps {
    onViewProfile: (profileId: string) => void;
}

const EventCard = memo(({event, onJoin, onLeave, onViewProfile}: {
    event: AppEvent;
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
