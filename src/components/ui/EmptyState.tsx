import {motion} from 'framer-motion';
import {LucideIcon} from 'lucide-react';
import {Button} from './button';

interface EmptyStateProps {
    icon: LucideIcon;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
}

export function EmptyState({icon: Icon, title, description, actionLabel, onAction}: EmptyStateProps) {
    return (
        <motion.div
            initial={{opacity: 0, y: 20}}
            animate={{opacity: 1, y: 0}}
            className="flex flex-col items-center justify-center py-16 px-6 text-center"
        >
            <motion.div
                className="w-24 h-24 rounded-full bg-gradient-to-br from-primary/20 via-accent/10 to-muted flex items-center justify-center mb-6 relative"
                animate={{scale: [1, 1.05, 1]}}
                transition={{duration: 3, repeat: Infinity, ease: "easeInOut"}}
            >
                <Icon className="w-12 h-12 text-primary"/>
                <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"
                     style={{animationDuration: '3s'}}/>
            </motion.div>

            <h3 className="text-xl font-semibold text-foreground mb-2">{title}</h3>
            <p className="text-muted-foreground max-w-sm mb-6 leading-relaxed">{description}</p>

            {actionLabel && onAction && (
                <Button onClick={onAction} className="gradient-primary glow">
                    {actionLabel}
                </Button>
            )}
        </motion.div>
    );
}
