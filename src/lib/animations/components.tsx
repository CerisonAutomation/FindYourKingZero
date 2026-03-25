/**
 * Reveal Component - Elite Animation Wrapper
 * Based on motion-presets Reveal component with enhancements
 * Provides one-line animation declarations for any component
 */

import { motion, AnimatePresence } from 'framer-motion';
import { forwardRef, useMemo } from 'react';
import { presets, type AnimationPreset, type PresetName } from './presets';

interface RevealProps {
  children: React.ReactNode;
  preset?: PresetName | PresetName[] | AnimationPreset;
  delay?: number;
  duration?: number;
  className?: string;
  disabled?: boolean;
  once?: boolean;
  amount?: number;
}

export const Reveal = forwardRef<HTMLDivElement, RevealProps>(
  (
    {
      children,
      preset = 'fadeIn',
      delay = 0,
      duration,
      className = '',
      disabled = false,
      once = false,
      amount = 0.3,
    },
    ref
  ) => {
    const animationProps = useMemo(() => {
      if (disabled) {
        return {};
      }

      let selectedPreset: AnimationPreset;

      if (typeof preset === 'string') {
        const presetValue = presets[preset];
        selectedPreset = typeof presetValue === 'function'
          ? presetValue()
          : presetValue || presets.fadeIn;
      } else if (Array.isArray(preset)) {
        // Combine multiple presets
        const resolvedPresets = preset.map(p => {
          if (typeof p === 'string') {
            const presetValue = presets[p];
            return typeof presetValue === 'function'
              ? presetValue()
              : presetValue || presets.fadeIn;
          }
          return p;
        });

        selectedPreset = resolvedPresets.reduce((acc, curr) => ({
          initial: { ...acc.initial, ...curr.initial },
          animate: { ...acc.animate, ...curr.animate },
          exit: { ...acc.exit, ...curr.exit },
          transition: { ...acc.transition, ...curr.transition },
          whileHover: { ...acc.whileHover, ...curr.whileHover },
          whileTap: { ...acc.whileTap, ...curr.whileTap },
          whileInView: { ...acc.whileInView, ...curr.whileInView }
        }));
      } else {
        selectedPreset = preset;
      }

      return {
        initial: selectedPreset.initial,
        animate: selectedPreset.animate,
        exit: selectedPreset.exit,
        whileHover: selectedPreset.whileHover,
        whileTap: selectedPreset.whileTap,
        transition: {
          ...selectedPreset.transition,
          delay,
          ...(duration && { duration })
        }
      };
    }, [disabled, preset, delay, duration]);

    const viewportProps = once
      ? { once: true, amount }
      : { amount };

    if (disabled) {
      return (
        <div ref={ref} className={className}>
          {children}
        </div>
      );
    }

    return (
      <AnimatePresence mode="wait">
        <motion.div
          ref={ref}
          className={className}
          initial={animationProps.initial}
          animate={animationProps.animate}
          exit={animationProps.exit}
          whileHover={animationProps.whileHover}
          whileTap={animationProps.whileTap}
          transition={animationProps.transition}
          viewport={viewportProps}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    );
  }
);

Reveal.displayName = 'Reveal';

/**
 * Stagger Container - For animating lists with staggered children
 */
interface StaggerContainerProps {
  children: React.ReactNode;
  className?: string;
  staggerDelay?: number;
  delayChildren?: number;
}

export const StaggerContainer = forwardRef<HTMLDivElement, StaggerContainerProps>(
  ({ children, className = '', staggerDelay = 0.1, delayChildren = 0.2 }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        initial="hidden"
        animate="visible"
        exit="exit"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: staggerDelay,
              delayChildren
            }
          },
          exit: {
            opacity: 0,
            transition: {
              staggerChildren: staggerDelay * 0.5,
              staggerDirection: -1
            }
          }
        }}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerContainer.displayName = 'StaggerContainer';

/**
 * Stagger Item - Child component for stagger animations
 */
interface StaggerItemProps {
  children: React.ReactNode;
  className?: string;
}

export const StaggerItem = forwardRef<HTMLDivElement, StaggerItemProps>(
  ({ children, className = '' }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={className}
        variants={{
          hidden: { opacity: 0, y: 20 },
          visible: {
            opacity: 1,
            y: 0,
            transition: {
              type: 'spring',
              stiffness: 300,
              damping: 24
            }
          },
          exit: {
            opacity: 0,
            y: -20,
            transition: {
              duration: 0.2
            }
          }
        }}
      >
        {children}
      </motion.div>
    );
  }
);

StaggerItem.displayName = 'StaggerItem';

/**
 * Magnetic Card - Ultra-modern card with magnetic hover effect
 * Extracted and enhanced from motion-presets
 */
interface MagneticCardProps {
  children: React.ReactNode;
  className?: string;
  magneticStrength?: number;
  glowEffect?: boolean;
}

export const MagneticCard = forwardRef<HTMLDivElement, MagneticCardProps>(
  ({ children, className = '', glowEffect = true }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`relative ${className}`}
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        whileHover={{
          scale: 1.02,
          transition: { type: 'spring', stiffness: 400, damping: 17 }
        }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        style={{ transformStyle: 'preserve-3d' }}
      >
        {glowEffect && (
          <motion.div
            className="absolute -inset-1 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
            style={{
              background: 'linear-gradient(135deg, rgba(255,0,150,0.3), rgba(0,255,255,0.3))',
            }}
          />
        )}
        <div className="relative">
          {children}
        </div>
      </motion.div>
    );
  }
);

MagneticCard.displayName = 'MagneticCard';

/**
 * Swipeable Card - For dating app swipe interactions
 */
interface SwipeableCardProps {
  children: React.ReactNode;
  className?: string;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onSwipeUp?: () => void;
}

export const SwipeableCard = forwardRef<HTMLDivElement, SwipeableCardProps>(
  ({ children, className = '', onSwipeLeft, onSwipeRight, onSwipeUp }, ref) => {
    return (
      <motion.div
        ref={ref}
        className={`cursor-grab active:cursor-grabbing ${className}`}
        drag
        dragConstraints={{ left: 0, right: 0, top: 0, bottom: 0 }}
        dragElastic={0.9}
        onDragEnd={(_, info) => {
          const threshold = 100;
          if (info.offset.x > threshold && onSwipeRight) {
            onSwipeRight();
          } else if (info.offset.x < -threshold && onSwipeLeft) {
            onSwipeLeft();
          } else if (info.offset.y < -threshold && onSwipeUp) {
            onSwipeUp();
          }
        }}
        whileDrag={{ scale: 1.05, cursor: 'grabbing' }}
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {children}
      </motion.div>
    );
  }
);

SwipeableCard.displayName = 'SwipeableCard';

export default Reveal;
