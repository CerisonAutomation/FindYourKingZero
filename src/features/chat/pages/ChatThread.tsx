import {useNavigate, useParams} from 'react-router-dom';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {useAuth} from '@/hooks/useAuth';
import {RealChatWindow} from '@/components/RealChatWindow';

export default function ChatThread() {
    const {conversationId} = useParams<{ conversationId: string }>();
    const navigate = useNavigate();
    const {user} = useAuth();

    const {data: conversation, isLoading} = useQuery({
        queryKey: ['conversation-detail', conversationId],
        queryFn: async () => {
            if (!conversationId || !user) return null;

            const {data: conv, error} = await supabase
                .from('conversations')
                .select('*')
                .eq('id', conversationId)
                .single();

            if (error) throw error;

            const otherUserId =
                conv.participant_one === user.id ? conv.participant_two : conv.participant_one;

            const {data: profile} = await supabase
                .from('profiles')
                .select('user_id, display_name, avatar_url, is_online, last_seen')
                .eq('user_id', otherUserId)
                .single();

            return {
                ...conv,
                other_user: profile,
                unread_count: 0,
                last_message: null,
            };
        },
        enabled: !!conversationId && !!user,
    });

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"/>
            </div>
        );
    }

    if (!conversation) {
        return (
            <div className="min-h-screen flex items-center justify-center text-muted-foreground">
                Conversation not found
            </div>
        );
    }

    return (
        <RealChatWindow
            conversation={conversation as any}
            onBack={() => navigate('/app/messages')}
            onViewProfile={(id) => navigate(`/app/profile/${id}`)}
        />
    );
}
