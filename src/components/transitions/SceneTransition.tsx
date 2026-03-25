/**
 * SceneTransition.tsx — Cinematic page transitions with Framer Motion
 * 
 * Features:
 * - Scene-like transitions between routes
 * - Multiple transition variants (slide, fade, scale, cube)
 * - Staggered children animations
 * - Reduced motion support for accessibility
 * 
 * Best Practices from:
 * - Framer Motion AnimatePresence docs: https://motion.dev/docs/react-animation
 * - React Router v6 transition patterns: https://blog.sethcorker.com/page-transitions-in-react-router-with-framer-motion/
 */

import type { ReactNode } from 'react';
import { useEffect, useState } from 'react';
import { motion, AnimatePresence, type TargetAndTransition } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export type TransitionVariant = 'slide' | 'fade' | 'scale' | 'cube' | 'none';

interface SceneTransitionProps {
  children: ReactNode;
  variant?: TransitionVariant;
  duration?: number;
  delay?: number;
  className?: string;
}

// Check for reduced motion preference (accessibility)
const useReducedMotion = (): boolean => {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setPrefersReducedMotion(mediaQuery.matches);

    const handler = (e: MediaQueryListEvent) => setPrefersReducedMotion(e.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  return prefersReducedMotion;
};

// Transition variants
const transitions: Record<TransitionVariant, { initial: TargetAndTransition; animate: TargetAndTransition; exit: TargetAndTransition }> = {
  slide: {
    initial: { opacity: 0, x: 100, scale: 0.95 },
    animate: { opacity: 1, x: 0, scale: 1 },
    exit: { opacity: 0, x: -100, scale: 0.95 },
  },
  fade: {
    initial: { opacity: 0 },
    animate: { opacity: 1 },
    exit: { opacity: 0 },
  },
  scale: {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 1.1 },
  },
  cube: {
    initial: { opacity: 0, rotateY: 90, scale: 0.9 },
    animate: { opacity: 1, rotateY: 0, scale: 1 },
    exit: { opacity: 0, rotateY: -90, scale: 0.9 },
  },
  none: {
    initial: {},
    animate: {},
    exit: {},
  },
};

export function SceneTransition({
  children,
  variant = 'slide',
  duration = 0.4,
  delay = 0,
  className = '',
}: SceneTransitionProps) {
  const prefersReducedMotion = useReducedMotion();
  const selectedVariant = prefersReducedMotion ? 'none' : variant;

  const { initial, animate, exit } = transitions[selectedVariant];

  return (
    <motion.div
      initial={initial}
      animate={animate}
      exit={exit}
      transition={{
        duration: prefersReducedMotion ? 0 : duration,
        delay,
        ease: [0.16, 1, 0.3, 1],
      }}
      className={`w-full h-full ${className}`}
      style={{ willChange: 'transform, opacity' }}
    >
      {children}
    </motion.div>
  );
}

// AnimatedRoutes — Wrapper for route-level transitions
interface AnimatedRoutesProps {
  children: ReactNode;
}

export function AnimatedRoutes({ children }: AnimatedRoutesProps) {
  const location = useLocation();
  const prefersReducedMotion = useReducedMotion();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.pathname}
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: -20 }}
        transition={{
          duration: prefersReducedMotion ? 0 : 0.3,
          ease: [0.16, 1, 0.3, 1],
        }}
        className="w-full h-full"
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}

// StaggerContainer — For staggering children elements
interface StaggerContainerProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
}

export function StaggerContainer({
  children,
  staggerDelay = 0.1,
  className = '',
}: StaggerContainerProps) {
  const prefersReducedMotion = useReducedMotion();

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: prefersReducedMotion ? 0 : staggerDelay,
            delayChildren: 0.1,
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// StaggerItem — Individual item for stagger animations
interface StaggerItemProps {
  children: ReactNode;
  className?: string;
}

export function StaggerItem({ children, className = '' }: StaggerItemProps) {
  return (
    <motion.div
      variants={{
        hidden: { opacity: 0, y: 20 },
        visible: {
          opacity: 1,
          y: 0,
          transition: {
            duration: 0.4,
            ease: [0.16, 1, 0.3, 1],
          },
        },
      }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

// SceneSection — For breaking pages into scene-like sections
interface SceneSectionProps {
  children: ReactNode;
  id?: string;
  className?: string;
  background?: string;
}

export function SceneSection({
  children,
  id,
  className = '',
  background,
}: SceneSectionProps) {
  return (
    <motion.section
      id={id}
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className={`relative min-h-screen w-full ${className}`}
      style={{ background }}
    >
      {children}
    </motion.section>
  );
}

export default SceneTransition;
