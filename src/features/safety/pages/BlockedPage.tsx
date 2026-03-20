import {useNavigate} from 'react-router-dom';
import {motion} from 'framer-motion';
import {Ban, ChevronLeft, UserX} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {useBlocks} from '@/hooks/useBlocks';
import {useQuery} from '@tanstack/react-query';
import {supabase} from '@/integrations/supabase/client';
import {EmptyState} from '@/components/ui/EmptyState';

export default function BlockedPage() {
    const navigate = useNavigate();
    const {blocks, unblockUser, isUnblocking} = useBlocks();

    const {data: blockedProfiles = []} = useQuery({
        queryKey: ['blocked-profiles', blocks.map((b) => b.blocked_id)],
        queryFn: async () => {
            if (blocks.length === 0) return [];
            const {data, error} = await supabase
                .from('profiles')
                .select('user_id, display_name, avatar_url')
                .in(
                    'user_id',
                    blocks.map((b) => b.blocked_id)
                );
            if (error) throw error;
            return data;
        },
        enabled: blocks.length > 0,
    });

    return (
        <div className="min-h-screen pb-24">
            <header className="sticky top-0 z-40 glass border-b border-border/30 px-4 py-3 flex items-center gap-3">
                <Button variant="ghost" size="icon" onClick={() => navigate(-1 as any)}>
                    <ChevronLeft className="w-5 h-5"/>
                </Button>
                <h1 className="text-lg font-bold flex items-center gap-2">
                    <Ban className="w-5 h-5 text-destructive"/>
                    Blocked Users
                </h1>
            </header>

            <div className="p-4">
                {blockedProfiles.length > 0 ? (
                    <div className="space-y-2">
                        {blockedProfiles.map((profile) => (
                            <motion.div
                                key={profile.user_id}
                                initial={{opacity: 0, y: 10}}
                                animate={{opacity: 1, y: 0}}
                                className="flex items-center gap-4 p-4 rounded-2xl bg-card border border-border/50"
                            >
                                <Avatar className="w-12 h-12">
                                    <AvatarImage src={profile.avatar_url || ''}/>
                                    <AvatarFallback>{(profile.display_name || 'U')[0]}</AvatarFallback>
                                </Avatar>
                                <span className="flex-1 font-medium">{profile.display_name || 'User'}</span>
                                <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => unblockUser(profile.user_id)}
                                    disabled={isUnblocking}
                                >
                                    Unblock
                                </Button>
                            </motion.div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon={UserX}
                        title="No blocked users"
                        description="Users you block will appear here."
                    />
                )}
            </div>
        </div>
    );
}
