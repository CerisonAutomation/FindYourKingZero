/**
 * EventChatPage — chat room attached to a specific event
 * Auto-creates room on first open; joins user as member
 */
import {useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/hooks/useAuth';
import {useCreateRoom, useJoinRoom} from '@/hooks/useChatRooms';

export default function EventChatPage() {
    const {eventId} = useParams<{ eventId: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();
    const createRoom = useCreateRoom();
    const joinRoom = useJoinRoom();

    // Look up or create room for this event
    const {data: room, isLoading} = useQuery({
        queryKey: ['event-room', eventId],
        queryFn: async () => {
            if (!eventId) return null;
            const {data} = await (supabase as any)
                .from('chat_rooms')
                .select('*')
                .eq('event_id', eventId)
                .eq('type', 'event')
                .maybeSingle();
            return data;
        },
        enabled: !!eventId && !!user,
    });

    useEffect(() => {
        if (!room && !isLoading && eventId && user) {
            // Create + auto-join
            createRoom.mutate({
                type: 'event',
                name: 'Event Chat',
                eventId,
                isPrivate: false,
            });
        }
    }, [room, isLoading, eventId, user]);

    useEffect(() => {
        if (room && user) {
            joinRoom.mutate(room.id);
        }
    }, [room, user]);

    if (isLoading || createRoom.isPending) {
        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
                <div className="animate-spin rounded-full w-10 h-10 border-t-2 border-primary"/>
            </div>
        );
    }

    if (!room) return null;

    // Redirect to the generic room chat with this room's ID
    navigate(`/app/room/${room.id}`, {replace: true});
    return null;
}
