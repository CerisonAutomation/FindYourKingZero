// =============================================================================
// EmptyState.tsx — Beautiful empty states with actionable suggestions
// =============================================================================

import React from 'react';
import {motion} from 'framer-motion';
import {LucideIcon} from 'lucide-react';
import {cn} from '@/lib/utils';

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  secondaryAction?: {
    label: string;
    onClick: () => void;
  };
  className?: string;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  icon: Icon,
  title,
  description,
  action,
  secondaryAction,
  className,
}) => {
  return (
    <motion.div
      initial={{opacity: 0, scale: 0.96}}
      animate={{opacity: 1, scale: 1}}
      transition={{duration: 0.4, ease: [0.16, 1, 0.3, 1]}}
      className={cn(
        'flex flex-col items-center justify-center py-16 px-8 text-center',
        className
      )}
    >
      {/* Icon container with ambient glow */}
      {Icon && (
        <div className="relative mb-6">
          <div
            className="w-20 h-20 rounded-full flex items-center justify-center"
            style={{
              background: 'hsl(var(--surface-2))',
              border: '1px solid hsl(var(--border))',
              boxShadow: 'var(--shadow-glow-gold)',
            }}
          >
            <Icon
              className="w-10 h-10"
              style={{color: 'hsl(var(--primary))'}}
              strokeWidth={1.5}
            />
          </div>
          {/* Ambient glow behind icon */}
          <div
            className="absolute inset-0 -z-10 w-32 h-32 rounded-full blur-3xl opacity-20"
            style={{background: 'hsl(var(--primary))'}}
          />
        </div>
      )}

      {/* Title */}
      <h3 className="text-lg font-black tracking-tight mb-2">{title}</h3>

      {/* Description */}
      {description && (
        <p className="text-sm text-muted-foreground leading-relaxed max-w-sm mb-6">
          {description}
        </p>
      )}

      {/* Actions */}
      {(action || secondaryAction) && (
        <div className="flex flex-col sm:flex-row gap-3">
          {action && (
            <button
              onClick={action.onClick}
              className="px-6 h-10 text-xs font-black tracking-[0.1em] uppercase transition-all duration-120 active:scale-[0.97]"
              style={{
                background: 'var(--gradient-primary)',
                color: 'hsl(var(--background))',
                boxShadow: '0 4px 16px hsl(42 98% 56% / 0.35)',
              }}
            >
              {action.label}
            </button>
          )}
          {secondaryAction && (
            <button
              onClick={secondaryAction.onClick}
              className="px-6 h-10 text-xs font-black tracking-[0.1em] uppercase transition-all duration-120"
              style={{
                background: 'transparent',
                color: 'hsl(var(--foreground))',
                border: '1px solid hsl(var(--border-strong))',
              }}
            >
              {secondaryAction.label}
            </button>
          )}
        </div>
      )}
    </motion.div>
  );
};

export default EmptyState;