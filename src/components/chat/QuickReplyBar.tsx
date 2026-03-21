import {useState} from 'react';
import {AnimatePresence, motion} from 'framer-motion';
import * as LucideIcons from 'lucide-react';
import {QUICK_REPLIES, QUICK_REPLY_CATEGORIES} from '@/lib/quickReplies';
import {cn} from '@/lib/utils';

const {ChevronDown, ChevronUp} = LucideIcons;

function DynamicIcon({name, className}: {name: string; className?: string}) {
    const Icon = (LucideIcons as any)[name];
    return Icon ? <Icon className={className} strokeWidth={2}/> : null;
}

interface QuickReplyBarProps {
    onSend: (message: string) => void;
    disabled?: boolean;
}

export function QuickReplyBar({onSend, disabled}: QuickReplyBarProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>('icebreakers');
    const [expanded, setExpanded] = useState(false);

    const filteredReplies = QUICK_REPLIES.filter(
        (r) => r.category === selectedCategory
    );

    return (
        <div className="border-t border-border/30">
            {/* Toggle */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-center gap-1.5 py-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
                {expanded ? <ChevronDown className="w-3.5 h-3.5"/> : <ChevronUp className="w-3.5 h-3.5"/>}
                Quick Replies
            </button>

            <AnimatePresence>
                {expanded && (
                    <motion.div
                        initial={{height: 0, opacity: 0}}
                        animate={{height: 'auto', opacity: 1}}
                        exit={{height: 0, opacity: 0}}
                        transition={{duration: 0.2}}
                        className="overflow-hidden"
                    >
                        {/* Category Tabs */}
                        <div className="flex gap-1.5 px-3 pb-2 overflow-x-auto scrollbar-hide">
                            {QUICK_REPLY_CATEGORIES.map((cat) => (
                                <button
                                    key={cat.id}
                                    onClick={() => setSelectedCategory(cat.id)}
                                    className={cn(
                                        'px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap transition-colors',
                                        selectedCategory === cat.id
                                            ? 'bg-primary text-primary-foreground'
                                            : 'bg-secondary text-muted-foreground hover:text-foreground'
                                    )}
                                >
                                    <DynamicIcon name={cat.icon} className="w-3.5 h-3.5 inline mr-1" /> {cat.label}
                                </button>
                            ))}
                        </div>

                        {/* Reply Chips */}
                        <div className="flex gap-2 px-3 pb-3 overflow-x-auto scrollbar-hide">
                            {filteredReplies.map((reply) => (
                                <motion.button
                                    key={reply.id}
                                    whileTap={{scale: 0.95}}
                                    onClick={() => {
                                        onSend(reply.text);
                                        setExpanded(false);
                                    }}
                                    disabled={disabled}
                                    className="px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap bg-secondary/80 border border-border/50 text-foreground hover:bg-primary/10 hover:border-primary/30 transition-colors disabled:opacity-50"
                                >
                                    <DynamicIcon name={reply.icon} className="w-3.5 h-3.5 inline mr-1" /> {reply.text}
                                </motion.button>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
