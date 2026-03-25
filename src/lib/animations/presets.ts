/**
 * Elite Animation System - Production-Grade Motion Library
 * Extracted and enhanced from motion-presets + framer-motion-template
 * For FindYourKingZero Dating App
 */

import { type Transition, type Variants } from 'framer-motion';

// ═══════════════════════════════════════════════════════════════
// Animation Preset Types
// ═══════════════════════════════════════════════════════════════

export interface AnimationPreset {
  initial?: object;
  animate?: object;
  exit?: object;
  transition?: Transition;
  whileHover?: object;
  whileTap?: object;
  whileInView?: object;
}

export interface SpringOptions {
  stiffness?: number;
  damping?: number;
  mass?: number;
  velocity?: number;
  restDelta?: number;
  initialScale?: number;
  targetScale?: number;
  initialOpacity?: number;
  targetOpacity?: number;
  repeat?: number | 'Infinity';
}

// ═══════════════════════════════════════════════════════════════
// ELITE ENTRANCE ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const fadeIn: AnimationPreset = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: 0.3, ease: 'easeOut' }
};

export const fadeInUp: AnimationPreset = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
};

export const fadeInDown: AnimationPreset = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
};

export const fadeInLeft: AnimationPreset = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
};

export const fadeInRight: AnimationPreset = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }
};

export const slideInUp: AnimationPreset = {
  initial: { y: 100, opacity: 0 },
  animate: { y: 0, opacity: 1 },
  exit: { y: 100, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
};

export const slideInLeft: AnimationPreset = {
  initial: { x: -100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: -100, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
};

export const slideInRight: AnimationPreset = {
  initial: { x: 100, opacity: 0 },
  animate: { x: 0, opacity: 1 },
  exit: { x: 100, opacity: 0 },
  transition: { type: 'spring', stiffness: 300, damping: 30 }
};

export const zoomIn: AnimationPreset = {
  initial: { scale: 0.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 0.5, opacity: 0 },
  transition: { type: 'spring', stiffness: 400, damping: 25 }
};

export const zoomOut: AnimationPreset = {
  initial: { scale: 1.5, opacity: 0 },
  animate: { scale: 1, opacity: 1 },
  exit: { scale: 1.5, opacity: 0 },
  transition: { type: 'spring', stiffness: 400, damping: 25 }
};

// ═══════════════════════════════════════════════════════════════
// PHYSICS-BASED SPRING ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const springBounce = (options?: SpringOptions): AnimationPreset => ({
  initial: { scale: options?.initialScale ?? 0, opacity: options?.initialOpacity ?? 0 },
  animate: {
    scale: options?.targetScale ?? 1,
    opacity: options?.targetOpacity ?? 1,
    transition: {
      type: 'spring',
      stiffness: options?.stiffness ?? 500,
      damping: options?.damping ?? 15,
      mass: options?.mass ?? 1,
      velocity: options?.velocity ?? 0
    }
  },
  exit: { scale: options?.initialScale ?? 0, opacity: options?.initialOpacity ?? 0 }
});

export const elasticIn = (options?: SpringOptions): AnimationPreset => ({
  initial: {
    x: -(options?.velocity ?? 100),
    opacity: options?.initialOpacity ?? 0
  },
  animate: {
    x: 0,
    opacity: options?.targetOpacity ?? 1,
    transition: {
      type: 'spring',
      stiffness: options?.stiffness ?? 100,
      damping: options?.damping ?? 8,
      mass: options?.mass ?? 0.8,
      restDelta: options?.restDelta ?? 0.001
    }
  },
  exit: {
    x: options?.velocity ?? 100,
    opacity: options?.initialOpacity ?? 0
  }
});

export const magneticPull = (options?: SpringOptions & { initialX?: number; initialY?: number }): AnimationPreset => ({
  initial: {
    x: options?.initialX ?? 100,
    y: options?.initialY ?? 100,
    scale: options?.initialScale ?? 0.5
  },
  animate: {
    x: 0,
    y: 0,
    scale: options?.targetScale ?? 1,
    transition: {
      type: 'spring',
      stiffness: options?.stiffness ?? 80,
      damping: options?.damping ?? 15,
      mass: options?.mass ?? 1.5,
      restDelta: options?.restDelta ?? 0.001
    }
  },
  whileHover: {
    scale: (options?.targetScale ?? 1) * 1.05,
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 10
    }
  }
});

export const gravityFall = (options?: SpringOptions & { height?: number }): AnimationPreset => ({
  initial: {
    y: -(options?.height ?? 200),
    opacity: options?.initialOpacity ?? 0
  },
  animate: {
    y: 0,
    opacity: options?.targetOpacity ?? 1,
    transition: {
      y: {
        type: 'spring',
        stiffness: options?.stiffness ?? 50,
        damping: options?.damping ?? 20,
        mass: options?.mass ?? 2,
        velocity: options?.velocity ?? 200
      },
      opacity: {
        duration: 0.3
      }
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// ATTENTION & INTERACTION ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const pulse = (options?: SpringOptions): AnimationPreset => ({
  initial: { scale: options?.initialScale ?? 1 },
  animate: {
    scale: [
      options?.initialScale ?? 1,
      options?.targetScale ?? 1.1,
      options?.initialScale ?? 1
    ],
    transition: {
      type: 'spring',
      stiffness: options?.stiffness ?? 300,
      damping: options?.damping ?? 10,
      repeat: options?.repeat === 'Infinity' ? Infinity : (options?.repeat ?? Infinity),
      repeatType: 'reverse',
      duration: 1
    }
  }
});

export const shake = (amplitude: number = 10, duration: number = 0.5): AnimationPreset => {
  const pattern: number[] = [];
  const oscillations = 5;

  for (let i = 0; i < oscillations; i++) {
    const factor = 1 - (i / oscillations);
    pattern.push(-amplitude * factor, amplitude * factor);
  }
  pattern.push(0);

  return {
    initial: { x: 0 },
    animate: {
      x: pattern,
      transition: {
        duration,
        ease: 'linear'
      }
    }
  };
};

export const jello = (intensity: number = 0.25): AnimationPreset => ({
  initial: { scaleX: 1, scaleY: 1 },
  animate: {
    scaleX: [
      1,
      1 + intensity,
      1 - intensity,
      1 + intensity * 0.6,
      1 - intensity * 0.2,
      1 + intensity * 0.2,
      1
    ],
    scaleY: [
      1,
      1 - intensity,
      1 + intensity,
      1 - intensity * 0.6,
      1 + intensity * 0.2,
      1 - intensity * 0.2,
      1
    ],
    transition: {
      duration: 1,
      ease: 'easeInOut'
    }
  }
});

export const float = (amplitude: number = 10, duration: number = 3): AnimationPreset => ({
  initial: { y: 0 },
  animate: {
    y: [
      -amplitude,
      amplitude,
      -amplitude
    ],
    transition: {
      duration,
      ease: 'easeInOut',
      repeat: Infinity,
      repeatType: 'reverse'
    }
  }
});

// ═══════════════════════════════════════════════════════════════
// 3D & ADVANCED TRANSFORMATIONS
// ═══════════════════════════════════════════════════════════════

export const flip3D = (options?: { duration?: number }): AnimationPreset => ({
  initial: { rotateY: -90, opacity: 0 },
  animate: {
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: options?.duration ?? 0.6,
      ease: 'easeOut'
    }
  },
  exit: {
    rotateY: 90,
    opacity: 0,
    transition: {
      duration: options?.duration ?? 0.6,
      ease: 'easeIn'
    }
  }
});

export const rotate3D = (options?: { duration?: number; delay?: number }): AnimationPreset => ({
  initial: {
    rotateX: -30,
    rotateY: 30,
    opacity: 0,
    transformPerspective: 1000
  },
  animate: {
    rotateX: 0,
    rotateY: 0,
    opacity: 1,
    transition: {
      duration: options?.duration ?? 0.8,
      delay: options?.delay ?? 0,
      ease: 'easeOut'
    }
  },
  exit: {
    rotateX: 30,
    rotateY: -30,
    opacity: 0
  }
});

// ═══════════════════════════════════════════════════════════════
// STAGGER & LIST ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  },
  exit: {
    opacity: 0,
    transition: {
      staggerChildren: 0.05,
      staggerDirection: -1
    }
  }
};

export const staggerItem: Variants = {
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
};

// ═══════════════════════════════════════════════════════════════
// DATING APP SPECIFIC ANIMATIONS
// ═══════════════════════════════════════════════════════════════

export const swipeLeft: AnimationPreset = {
  initial: { x: 0, rotate: 0, opacity: 1 },
  animate: {
    x: -500,
    rotate: -30,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
};

export const swipeRight: AnimationPreset = {
  initial: { x: 0, rotate: 0, opacity: 1 },
  animate: {
    x: 500,
    rotate: 30,
    opacity: 0,
    transition: {
      type: 'spring',
      stiffness: 300,
      damping: 30
    }
  }
};

export const matchPop: AnimationPreset = {
  initial: { scale: 0, rotate: -180 },
  animate: {
    scale: 1,
    rotate: 0,
    transition: {
      type: 'spring',
      stiffness: 260,
      damping: 20
    }
  },
  exit: {
    scale: 0,
    rotate: 180,
    transition: {
      duration: 0.3
    }
  }
};

export const heartBurst: AnimationPreset = {
  initial: { scale: 0 },
  animate: {
    scale: [0, 1.2, 1],
    transition: {
      type: 'spring',
      stiffness: 400,
      damping: 15
    }
  }
};

export const profileReveal: AnimationPreset = {
  initial: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 0
  },
  animate: {
    clipPath: 'circle(150% at 50% 50%)',
    opacity: 1,
    transition: {
      duration: 0.6,
      ease: [0.25, 0.46, 0.45, 0.94]
    }
  },
  exit: {
    clipPath: 'circle(0% at 50% 50%)',
    opacity: 0
  }
};

// ═══════════════════════════════════════════════════════════════
// PRESETS EXPORT FOR EASY ACCESS
// ═══════════════════════════════════════════════════════════════

export const presets = {
  fadeIn,
  fadeInUp,
  fadeInDown,
  fadeInLeft,
  fadeInRight,
  slideInUp,
  slideInLeft,
  slideInRight,
  zoomIn,
  zoomOut,
  springBounce,
  elasticIn,
  magneticPull,
  gravityFall,
  pulse,
  shake,
  jello,
  float,
  flip3D,
  rotate3D,
  swipeLeft,
  swipeRight,
  matchPop,
  heartBurst,
  profileReveal
};

export type PresetName = keyof typeof presets;

// ═══════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════

export const createStaggerDelay = (index: number, baseDelay: number = 0.1): number => {
  return index * baseDelay;
};

export const createSpringTransition = (
  stiffness: number = 300,
  damping: number = 30,
  mass: number = 1
): Transition => ({
  type: 'spring',
  stiffness,
  damping,
  mass
});

export const combineAnimations = (...animations: AnimationPreset[]): AnimationPreset => {
  return animations.reduce((acc, curr) => ({
    initial: { ...acc.initial, ...curr.initial },
    animate: { ...acc.animate, ...curr.animate },
    exit: { ...acc.exit, ...curr.exit },
    transition: { ...acc.transition, ...curr.transition },
    whileHover: { ...acc.whileHover, ...curr.whileHover },
    whileTap: { ...acc.whileTap, ...curr.whileTap },
    whileInView: { ...acc.whileInView, ...curr.whileInView }
  }));
};

export default presets;
