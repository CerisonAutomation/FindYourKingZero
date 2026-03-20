import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import {Smile} from 'lucide-react';
import {Button} from '@/components/ui/button';
import {Popover, PopoverContent, PopoverTrigger} from '@/components/ui/popover';
import {REACTION_EMOJIS, useReactions} from '@/hooks/useReactions';
import {cn} from '@/lib/utils';

interface MessageReactionsProps {
    messageId: string;
    isOwnMessage: boolean;
}

export const MessageReactions = ({messageId, isOwnMessage}: MessageReactionsProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const {reactions, toggleReaction, getReactionCount, hasUserReacted, isToggling} = useReactions(messageId);

    const handleReaction = async (emoji: string) => {
        await toggleReaction(emoji);
        setIsOpen(false);
    };

    // Group reactions by emoji
    const reactionGroups = REACTION_EMOJIS
        .map((emoji) => ({
            emoji,
            count: getReactionCount(emoji),
            hasReacted: hasUserReacted(emoji),
        }))
        .filter((r) => r.count > 0);

    return (
        <div className={cn('flex items-center gap-1', isOwnMessage ? 'flex-row-reverse' : 'flex-row')}>
            {/* Display existing reactions */}
            <AnimatePresence>
                {reactionGroups.map((reaction) => (
                    <motion.button
                        key={reaction.emoji}
                        initial={{scale: 0}}
                        animate={{scale: 1}}
                        exit={{scale: 0}}
                        whileHover={{scale: 1.1}}
                        whileTap={{scale: 0.9}}
                        onClick={() => toggleReaction(reaction.emoji)}
                        disabled={isToggling}
                        className={cn(
                            'flex items-center gap-1 px-2 py-0.5 rounded-full text-xs transition-colors',
                            reaction.hasReacted
                                ? 'bg-primary/20 border border-primary/50'
                                : 'bg-muted hover:bg-muted/80'
                        )}
                    >
                        <span>{reaction.emoji}</span>
                        <span className="text-muted-foreground">{reaction.count}</span>
                    </motion.button>
                ))}
            </AnimatePresence>

            {/* Add reaction button */}
            <Popover open={isOpen} onOpenChange={setIsOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                        <Smile className="h-4 w-4 text-muted-foreground"/>
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-2" side="top">
                    <div className="flex gap-1 flex-wrap max-w-[200px]">
                        {REACTION_EMOJIS.map((emoji) => (
                            <motion.button
                                key={emoji}
                                whileHover={{scale: 1.2}}
                                whileTap={{scale: 0.9}}
                                onClick={() => handleReaction(emoji)}
                                disabled={isToggling}
                                className={cn(
                                    'w-8 h-8 flex items-center justify-center rounded-lg hover:bg-muted transition-colors text-lg',
                                    hasUserReacted(emoji) && 'bg-primary/20'
                                )}
                            >
                                {emoji}
                            </motion.button>
                        ))}
                    </div>
                </PopoverContent>
            </Popover>
        </div>
    );
};
