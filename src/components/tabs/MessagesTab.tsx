import {useMemo, useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {MessageCircle, Search, Sparkles} from 'lucide-react';
import type {Conversation} from '@/hooks/useMessages';
import {useConversations} from '@/hooks/useMessages';
import {UnifiedChatWindow} from '@/components/chat/UnifiedChatWindow';
import {ConversationListSkeleton} from '@/components/ui/ProfileSkeleton';
import {EmptyState} from '@/components/ui/EmptyState';
import {Input} from '@/components/ui/input';
import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Badge} from '@/components/ui/badge';
import {cn} from '@/lib/utils';
import {formatDistanceToNow} from 'date-fns';

// Helper to safely access snake_case legacy fields from conversation
type ConvAny = Conversation & Record<string, unknown>;

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
            const c = conv as ConvAny;
            const name = (c.other_user as {display_name?: string} | undefined)?.display_name
                ?? c.otherUser?.displayName ?? '';
            return name.toLowerCase().includes(searchQuery.toLowerCase());
        });
    }, [conversations, searchQuery]);

    const totalUnread = useMemo(() => {
        return conversations.reduce((acc, conv) => {
            const c = conv as ConvAny;
            return acc + (((c.unread_count as number | undefined) ?? conv.unreadCount) || 0);
        }, 0);
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
                                {filteredConversations.map((conversation, index) => {
                                    const c = conversation as ConvAny;
                                    const otherUser = c.other_user as {avatar_url?: string; display_name?: string; is_online?: boolean} | undefined
                                        ?? (c.otherUser ? {avatar_url: c.otherUser.avatarUrl ?? undefined, display_name: c.otherUser.displayName, is_online: c.otherUser.isOnline} : undefined);
                                    const lastMsg = c.last_message as {created_at?: string; content?: string; content_encrypted?: string} | undefined
                                        ?? c.lastMessage;
                                    const unreadCount = ((c.unread_count as number | undefined) ?? c.unreadCount) || 0;
                                    return (
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
                                                <AvatarImage src={otherUser?.avatar_url || ''}/>
                                                <AvatarFallback
                                                    className="bg-gradient-to-br from-primary/20 to-accent/20 text-lg font-semibold">
                                                    {(otherUser?.display_name || 'U')[0]}
                                                </AvatarFallback>
                                            </Avatar>
                                            {otherUser?.is_online && (
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
                            {otherUser?.display_name || 'User'}
                          </span>
                                                    {otherUser?.is_online && (
                                                        <Sparkles className="w-3.5 h-3.5 text-primary shrink-0"/>
                                                    )}
                                                </div>
                                                <span className="text-xs text-muted-foreground shrink-0">
                          {formatTime((lastMsg as {created_at?: string} | undefined)?.created_at)}
                        </span>
                                            </div>
                                            <div className="flex items-center justify-between gap-2 mt-1">
                                                <p className={cn(
                                                    "text-sm truncate",
                                                    unreadCount > 0
                                                        ? "text-foreground font-medium"
                                                        : "text-muted-foreground"
                                                )}>
                                                    {(lastMsg as {content?: string; content_encrypted?: string} | undefined)?.content
                                                        ?? (lastMsg as {content_encrypted?: string} | undefined)?.content_encrypted
                                                        ?? 'Start a conversation...'}
                                                </p>
                                                {unreadCount > 0 && (
                                                    <motion.span
                                                        initial={{scale: 0}}
                                                        animate={{scale: 1}}
                                                        className="shrink-0 min-w-5 h-5 px-1.5 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold"
                                                    >
                                                        {unreadCount}
                                                    </motion.span>
                                                )}
                                            </div>
                                        </div>
                                    </motion.button>
                                    );
                                })}
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
