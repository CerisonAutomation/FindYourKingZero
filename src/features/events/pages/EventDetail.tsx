import {useNavigate, useParams} from 'react-router-dom';
import {
    AlertTriangle,
    Bell,
    Calendar,
    Check,
    ChevronLeft,
    Clock,
    Crown,
    Lock,
    MapPin,
    Shield,
    Users,
    X
} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Badge} from '@/components/ui/badge';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {EVENT_TYPES, useEvents, useJoinEvent, useLeaveEvent} from '@/hooks/useEvents';
import {useAuth} from '@/hooks/useAuth';
import {format, parseISO} from 'date-fns';
import {cn} from '@/lib/utils';
import {motion} from 'framer-motion';

export default function EventDetail() {
    const {id} = useParams<{ id: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();
    const {data: events = []} = useEvents();
    const joinEvent = useJoinEvent();
    const leaveEvent = useLeaveEvent();

    const event = events.find(e => e.id === id);
    if (!event) return (
        <div className="min-h-screen bg-background flex items-center justify-center">
            <div className="text-center space-y-3">
                <p className="text-muted-foreground">Event not found</p>
                <Button variant="outline" onClick={() => navigate('/app/events')}>Back to Events</Button>
            </div>
        </div>
    );

    const eventType = EVENT_TYPES.find(t => t.id === event.event_type);
    const isHost = event.host_id === user?.id;
    const isParty = event.event_type === 'party';
    const isFull = (event.attendee_count || 0) >= event.max_attendees;
    const fillPct = Math.min(100, Math.round(((event.attendee_count || 0) / event.max_attendees) * 100));

    return (
        <div className="min-h-screen bg-background pb-28">
            {/* Hero */}
            <div
                className="relative h-56 bg-gradient-to-br from-secondary via-card to-background flex items-center justify-center">
                <span className="text-9xl drop-shadow-lg">{eventType?.icon || '📅'}</span>
                <button onClick={() => navigate(-1)}
                        className="absolute top-4 left-4 w-10 h-10 rounded-full glass flex items-center justify-center">
                    <ChevronLeft className="w-5 h-5"/>
                </button>
                {isParty && (
                    <div className="absolute bottom-4 left-4 flex items-center gap-2 px-3 py-1.5 rounded-full glass">
                        <Shield className="w-4 h-4 text-primary"/>
                        <span className="text-sm font-semibold">Party Safety Active</span>
                    </div>
                )}
            </div>

            <div className="px-4 py-5 space-y-5">
                <div className="flex items-start justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-bold">{event.title}</h1>
                        <p className="text-muted-foreground text-sm capitalize mt-0.5">{eventType?.label}</p>
                    </div>
                    {event.is_premium_only && (
                        <Badge
                            className="bg-[hsl(var(--gold)/0.15)] text-[hsl(var(--gold))] border-[hsl(var(--gold)/0.3)] shrink-0">
                            <Crown className="w-3 h-3 mr-1"/> VIP
                        </Badge>
                    )}
                </div>

                {/* Party Safety Panel */}
                {isParty && (
                    <motion.div initial={{opacity: 0, y: 8}} animate={{opacity: 1, y: 0}}
                                className="p-4 rounded-2xl bg-primary/5 border border-primary/25 space-y-3">
                        <p className="font-semibold text-sm flex items-center gap-2">
                            <Shield className="w-4 h-4 text-primary"/> Party Safety Protocol
                        </p>
                        {[
                            {icon: Lock, text: 'Precise address revealed only after host approval'},
                            {icon: Bell, text: 'Safety check-in available on arrival'},
                            {icon: AlertTriangle, text: 'Panic button active for all attendees during the event'},
                        ].map(({icon: Icon, text}) => (
                            <div key={text} className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Icon className="w-3.5 h-3.5 text-primary shrink-0"/>{text}
                            </div>
                        ))}
                    </motion.div>
                )}

                {/* Details */}
                <div className="grid grid-cols-2 gap-3">
                    {[
                        {
                            icon: Calendar,
                            value: event.event_date ? format(parseISO(event.event_date), 'EEE, MMM d') : '—'
                        },
                        {icon: Clock, value: event.start_time?.slice(0, 5) || '—'},
                    ].map(({icon: Icon, value}) => (
                        <div key={value} className="flex items-center gap-2 p-3 rounded-xl bg-secondary/40">
                            <Icon className="w-4 h-4 text-muted-foreground"/>
                            <span className="text-sm font-medium">{value}</span>
                        </div>
                    ))}
                </div>

                <div className="p-3 rounded-xl bg-secondary/40 flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-muted-foreground"/>
                    {isParty && !isHost
                        ? <span className="text-sm text-muted-foreground italic flex items-center gap-1"><Lock
                            className="w-3 h-3"/> Address unlocked after approval</span>
                        : <span className="text-sm font-medium">{event.location}</span>
                    }
                </div>

                {/* Capacity */}
                <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                        <span className="flex items-center gap-1.5 text-muted-foreground"><Users
                            className="w-4 h-4"/>{event.attendee_count}/{event.max_attendees} attending</span>
                        <span
                            className={cn('font-semibold', fillPct >= 90 ? 'text-destructive' : 'text-muted-foreground')}>{fillPct}%</span>
                    </div>
                    <div className="h-2 rounded-full bg-border overflow-hidden">
                        <motion.div initial={{width: 0}} animate={{width: `${fillPct}%`}}
                                    transition={{duration: 0.6, ease: 'easeOut'}}
                                    className={cn('h-full rounded-full', fillPct >= 90 ? 'bg-destructive' : 'bg-gradient-to-r from-primary to-accent')}/>
                    </div>
                </div>

                {event.description && (
                    <div className="p-4 rounded-2xl bg-card border border-border/40">
                        <p className="text-sm leading-relaxed text-muted-foreground">{event.description}</p>
                    </div>
                )}

                {/* Host */}
                <button onClick={() => event.host_id && navigate(`/app/profile/${event.host_id}`)}
                        className="flex items-center gap-3 p-4 rounded-2xl bg-card border border-border/40 w-full text-left hover:border-primary/30">
                    <Avatar className="w-12 h-12 border-2 border-border">
                        <AvatarImage src={event.host?.avatar_url || ''}/>
                        <AvatarFallback>{event.host?.display_name?.[0] || 'H'}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{event.host?.display_name || 'Host'}</p>
                        <p className="text-xs text-muted-foreground">Event host</p>
                    </div>
                </button>

                {/* CTA */}
                {!isHost && (
                    event.is_attending
                        ? <Button variant="outline" size="lg"
                                  className="w-full h-14 text-destructive border-destructive/30"
                                  onClick={() => leaveEvent.mutate(event.id)}>
                            <X className="w-5 h-5 mr-2"/> Leave Event
                        </Button>
                        : <Button size="lg"
                                  className="w-full h-14 gradient-primary shadow-[0_8px_32px_hsl(var(--primary)/0.25)]"
                                  disabled={isFull} onClick={() => joinEvent.mutate(event.id)}>
                            <Check
                                className="w-5 h-5 mr-2"/>{isParty ? 'Request to Join' : isFull ? 'Event Full' : 'Join Event'}
                        </Button>
                )}
            </div>
        </div>
    );
}
