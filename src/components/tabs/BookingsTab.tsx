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
