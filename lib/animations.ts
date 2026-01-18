import { Variants, Transition } from "framer-motion";

// Cubic bezier type for Framer Motion easing
type CubicBezier = [number, number, number, number];

// Easing Functions - Luxury feel
export const EASING: Record<string, CubicBezier> = {
  smooth: [0.22, 1, 0.36, 1],
  bounce: [0.68, -0.55, 0.265, 1.55],
  elastic: [0.175, 0.885, 0.32, 1.275],
  snappy: [0.25, 0.1, 0.25, 1],
};

// Timing Constants
export const TIMING = {
  instant: 0.1,
  fast: 0.2,
  normal: 0.3,
  slow: 0.6,
  deliberate: 0.8,
};

// Transition Presets
export const TRANSITIONS = {
  smooth: {
    duration: TIMING.slow,
    ease: EASING.smooth,
  } as Transition,
  fast: {
    duration: TIMING.fast,
    ease: EASING.smooth,
  } as Transition,
  spring: {
    type: "spring",
    stiffness: 300,
    damping: 30,
  } as Transition,
  springBounce: {
    type: "spring",
    stiffness: 400,
    damping: 25,
  } as Transition,
};

// Fade In Animation
export const fadeIn: Variants = {
  hidden: {
    opacity: 0,
  },
  visible: {
    opacity: 1,
    transition: TRANSITIONS.smooth,
  },
};

// Fade In Up Animation
export const fadeInUp: Variants = {
  hidden: {
    opacity: 0,
    y: 30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.smooth,
  },
};

// Fade In Down Animation
export const fadeInDown: Variants = {
  hidden: {
    opacity: 0,
    y: -30,
  },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.smooth,
  },
};

// Fade In Scale Animation
export const fadeInScale: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
  },
  visible: {
    opacity: 1,
    scale: 1,
    transition: TRANSITIONS.smooth,
  },
};

// Stagger Container Animation
export const staggerContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1,
    },
  },
};

// Stagger Item Animation
export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: TRANSITIONS.smooth,
  },
};

// Slide In From Left
export const slideInLeft: Variants = {
  hidden: {
    opacity: 0,
    x: -50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.smooth,
  },
};

// Slide In From Right
export const slideInRight: Variants = {
  hidden: {
    opacity: 0,
    x: 50,
  },
  visible: {
    opacity: 1,
    x: 0,
    transition: TRANSITIONS.smooth,
  },
};

// Scale On Hover
export const scaleOnHover = {
  whileHover: { scale: 1.02 },
  whileTap: { scale: 0.98 },
  transition: TRANSITIONS.fast,
};

// Button Hover Effect
export const buttonHover = {
  whileHover: {
    scale: 1.02,
    y: -2,
  },
  whileTap: {
    scale: 0.98,
  },
  transition: TRANSITIONS.fast,
};

// Card Hover Effect
export const cardHover = {
  whileHover: {
    y: -4,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)",
  },
  transition: {
    duration: TIMING.normal,
    ease: EASING.smooth,
  },
};

// Glass Card Hover
export const glassCardHover = {
  whileHover: {
    y: -4,
    scale: 1.01,
    boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.15)",
  },
  transition: {
    duration: TIMING.normal,
    ease: EASING.smooth,
  },
};

// Navbar Animation
export const navbarVariants: Variants = {
  hidden: {
    y: -100,
    opacity: 0,
  },
  visible: {
    y: 0,
    opacity: 1,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
};

// Hero Text Animation
export const heroTextVariants: Variants = {
  hidden: {
    opacity: 0,
    y: 40,
  },
  visible: (delay: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.deliberate,
      ease: EASING.smooth,
      delay,
    },
  }),
};

// Orb Float Animation
export const orbFloat: Variants = {
  animate: {
    y: [0, -20, 0],
    x: [0, 10, 0],
    scale: [1, 1.05, 1],
    transition: {
      duration: 8,
      ease: "easeInOut",
      repeat: Infinity,
      repeatType: "reverse" as const,
    },
  },
};

// Recording Pulse Animation
export const recordingPulse: Variants = {
  idle: {
    scale: 1,
    boxShadow: "0 0 0 0 rgba(244, 63, 94, 0)",
  },
  recording: {
    scale: [1, 1.05, 1],
    boxShadow: [
      "0 0 0 0 rgba(244, 63, 94, 0.4)",
      "0 0 0 20px rgba(244, 63, 94, 0)",
      "0 0 0 0 rgba(244, 63, 94, 0)",
    ],
    transition: {
      duration: 2,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// Breathing Glow Animation
export const breathingGlow: Variants = {
  idle: {
    boxShadow: "0 0 0 rgba(244, 63, 94, 0)",
  },
  active: {
    boxShadow: [
      "0 0 20px rgba(244, 63, 94, 0.3), 0 0 40px rgba(244, 63, 94, 0.2), 0 0 60px rgba(244, 63, 94, 0.1)",
      "0 0 30px rgba(244, 63, 94, 0.5), 0 0 60px rgba(244, 63, 94, 0.3), 0 0 90px rgba(244, 63, 94, 0.2)",
      "0 0 20px rgba(244, 63, 94, 0.3), 0 0 40px rgba(244, 63, 94, 0.2), 0 0 60px rgba(244, 63, 94, 0.1)",
    ],
    transition: {
      duration: 3,
      ease: "easeInOut",
      repeat: Infinity,
    },
  },
};

// Page Transition
export const pageTransition: Variants = {
  initial: {
    opacity: 0,
    y: 20,
  },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: TIMING.slow,
      ease: EASING.smooth,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    transition: {
      duration: TIMING.fast,
      ease: EASING.smooth,
    },
  },
};

// Scroll Progress
export const scrollProgress = {
  initial: { scaleX: 0 },
  animate: (progress: number) => ({
    scaleX: progress,
    transition: { duration: 0 },
  }),
};

// Parallax Scroll
export const parallaxY = (offset: number) => ({
  y: offset,
  transition: {
    type: "spring",
    stiffness: 100,
    damping: 30,
  },
});

// Modal Animation
export const modalOverlay: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: TIMING.fast },
  },
  exit: {
    opacity: 0,
    transition: { duration: TIMING.fast },
  },
};

export const modalContent: Variants = {
  hidden: {
    opacity: 0,
    scale: 0.95,
    y: 20,
  },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: TRANSITIONS.spring,
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    y: 20,
    transition: { duration: TIMING.fast },
  },
};

// Shimmer Effect Helper
export const shimmerKeyframes = {
  "0%": { backgroundPosition: "-200% 0" },
  "100%": { backgroundPosition: "200% 0" },
};

// Custom viewport settings for scroll animations
export const scrollViewport = {
  once: true,
  margin: "-100px 0px",
};

// Reduced motion check (for accessibility)
export const shouldReduceMotion = () => {
  if (typeof window === "undefined") return false;
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
};

// Get appropriate animation based on reduced motion preference
export const getAnimation = (animation: Variants, reducedAnimation?: Variants): Variants => {
  if (shouldReduceMotion() && reducedAnimation) {
    return reducedAnimation;
  }
  return animation;
};
