/**
 * Framer Motion Animation Presets
 * Luxury, regal animations for FIND YOUR KING
 * All pre-configured variants for cinematic effects
 */

export const animationPresets = {
    // Fade animations — entrance/exit
    fade: {
        initial: {opacity: 0},
        animate: {opacity: 1},
        exit: {opacity: 0},
        transition: {duration: 0.3, ease: "easeInOut"},
    },

    // Scale animations — growth effects
    scale: {
        initial: {scale: 0.92, opacity: 0},
        animate: {scale: 1, opacity: 1},
        exit: {scale: 0.92, opacity: 0},
        transition: {duration: 0.3, ease: [0.34, 1.56, 0.64, 1]},
    },

    // Slide up animations — card reveals
    slideUp: {
        initial: {y: 40, opacity: 0},
        animate: {y: 0, opacity: 1},
        exit: {y: 40, opacity: 0},
        transition: {duration: 0.35, ease: [0.16, 1, 0.3, 1]},
    },

    // Slide down animations — dropdown
    slideDown: {
        initial: {y: -40, opacity: 0},
        animate: {y: 0, opacity: 1},
        exit: {y: -40, opacity: 0},
        transition: {duration: 0.35, ease: [0.16, 1, 0.3, 1]},
    },

    // Slide right animations — drawer
    slideRight: {
        initial: {x: -60, opacity: 0},
        animate: {x: 0, opacity: 1},
        exit: {x: -60, opacity: 0},
        transition: {duration: 0.4, ease: [0.16, 1, 0.3, 1]},
    },

    // Slide left animations — page transition
    slideLeft: {
        initial: {x: 60, opacity: 0},
        animate: {x: 0, opacity: 1},
        exit: {x: 60, opacity: 0},
        transition: {duration: 0.4, ease: [0.16, 1, 0.3, 1]},
    },

    // Rotate animations — spinner
    rotate: {
        animate: {rotate: 360},
        transition: {duration: 1.5, repeat: Infinity, ease: "linear"},
    },

    // Pulse animations — luxury glow
    pulseLuxury: {
        animate: {scale: [1, 1.02, 1], opacity: [1, 0.92, 1]},
        transition: {duration: 2.5, repeat: Infinity, ease: "easeInOut"},
    },

    // Float animations — floating elements
    float: {
        animate: {y: [0, -8, 0]},
        transition: {duration: 5, repeat: Infinity, ease: "easeInOut"},
    },

    // Shimmer animations — gold shine
    shimmerGold: {
        animate: {backgroundPosition: ["-200% 0", "200% 0"]},
        transition: {duration: 2, repeat: Infinity, ease: "linear"},
    },

    // Stagger container — animate children in sequence
    staggerContainer: {
        animate: {transition: {staggerChildren: 0.1}},
    },

    // Pop animations — quick entrance
    pop: {
        initial: {scale: 0, rotate: -10},
        animate: {scale: 1, rotate: 0},
        exit: {scale: 0, rotate: -10},
        transition: {duration: 0.25, ease: "easeOutBack"},
    },

    // Bounce animations — playful entrance
    bounce: {
        initial: {y: 20, opacity: 0},
        animate: {y: 0, opacity: 1},
        transition: {duration: 0.4, ease: [0.34, 1.56, 0.64, 1]},
    },

    // Glow pulse — neon effect
    glowPulse: {
        animate: {
            boxShadow: [
                "0 0 14px hsl(42 98% 56% / 0.18)",
                "0 0 36px hsl(42 98% 56% / 0.4), 0 0 64px hsl(214 85% 58% / 0.12)",
                "0 0 28px hsl(0 92% 54% / 0.28), 0 0 50px hsl(214 85% 58% / 0.09)",
                "0 0 14px hsl(42 98% 56% / 0.18)",
            ]
        },
        transition: {duration: 3.5, repeat: Infinity, ease: "easeInOut"},
    },

    // Ripple animations — expanding circles
    ripple: {
        animate: {scale: [0, 1], opacity: [1, 0]},
        transition: {duration: 0.6, ease: "easeOut"},
    },

    // Hero entrance — cinematic fade + slide
    heroEntrance: {
        initial: {opacity: 0, y: 60},
        animate: {opacity: 1, y: 0},
        transition: {duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94]},
    },

    // Page entrance — staggered children
    pageEntrance: {
        container: {
            initial: {opacity: 0},
            animate: {opacity: 1, transition: {staggerChildren: 0.08}},
        },
        item: {
            initial: {opacity: 0, y: 20},
            animate: {opacity: 1, y: 0, transition: {duration: 0.3}},
        },
    },

    // Chat message entrance
    messageEntrance: {
        initial: {opacity: 0, y: 10, scale: 0.95},
        animate: {opacity: 1, y: 0, scale: 1},
        transition: {duration: 0.2, ease: "easeOut"},
    },

    // Profile card hover
    profileHover: {
        whileHover: {scale: 1.04, y: -8},
        transition: {duration: 0.25},
    },

    // Button press
    buttonPress: {
        whileTap: {scale: 0.96},
        transition: {duration: 0.15},
    },

    // Smooth scroll reveal
    scrollReveal: {
        initial: {opacity: 0, y: 40},
        whileInView: {opacity: 1, y: 0},
        transition: {duration: 0.5, ease: [0.16, 1, 0.3, 1]},
        viewport: {once: true, margin: "0px 0px -100px 0px"},
    },

    // Parallax effect
    parallax: (offset = 50) => ({
        style: {
            y: typeof window !== "undefined" ? window.scrollY * 0.5 : 0,
        },
    }),
};

/**
 * Transition presets for quick use
 */
export const transitions = {
    quick: {duration: 0.15, ease: "easeOut"},
    normal: {duration: 0.3, ease: [0.16, 1, 0.3, 1]},
    slow: {duration: 0.5, ease: [0.16, 1, 0.3, 1]},
    verySlow: {duration: 0.8, ease: "easeInOut"},
    spring: {type: "spring", stiffness: 300, damping: 30},
    luxury: {duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94]},
};

/**
 * Easing functions for luxury animations
 */
export const easings = {
    easeOutQuad: [0.25, 0.46, 0.45, 0.94],
    easeInOutCubic: [0.645, 0.045, 0.355, 1],
    easeInOutQuart: [0.77, 0, 0.175, 1],
    easeOutExpo: [0.19, 1, 0.22, 1],
    easeOutElastic: [0.34, 1.56, 0.64, 1],
    easeInOutQuint: [0.86, 0, 0.07, 1],
};

/**
 * Responsive animation breaks
 * Disable animations on very slow devices or low-motion preferences
 */
export const respectMotionPreferences = () => {
    if (typeof window === "undefined") return true;
    return !window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

/**
 * Viewport-based animations
 * Useful for scroll-triggered reveals
 */
export const viewportConfig = {
    once: true,
    margin: "0px 0px -100px 0px",
    amount: "some" as const,
};

/**
 * Reveal component variant for scroll-triggered reveals
 */
export const Reveal = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
};
export const containerQueries = {
    small: "(max-width: 640px)",
    medium: "(max-width: 1024px)",
    large: "(min-width: 1024px)",
};
