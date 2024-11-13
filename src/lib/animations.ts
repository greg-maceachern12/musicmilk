// lib/animations.ts
import { Variants } from 'framer-motion';

export const fadeIn: Variants = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

export const fadeInUp: Variants = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
};

export const fadeInDown: Variants = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
};

export const staggerContainer: Variants = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export const scaleIn: Variants = {
  initial: { opacity: 0, scale: 0.95 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.95 }
};

export const slideInLeft: Variants = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
};

export const slideInRight: Variants = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
};

// Animation configurations
export const defaultTransition = {
  duration: 0.4,
  ease: [0.43, 0.13, 0.23, 0.96] // Custom easing function
};

export const quickTransition = {
  duration: 0.2,
  ease: "easeOut"
};

export const delayedFadeIn = {
  ...fadeIn,
  transition: {
    delay: 0.2,
    ...defaultTransition
  }
};

// HOC for adding hover animations to cards
export const cardHover: Variants = {
  initial: { scale: 1 },
  hover: { 
    scale: 1.02,
    transition: {
      duration: 0.2,
      ease: "easeOut"
    }
  },
  tap: { 
    scale: 0.98,
    transition: {
      duration: 0.1,
      ease: "easeOut"
    }
  }
};

// List containers with stagger effect
export const listContainer: Variants = {
  initial: {},
  animate: {
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.3
    }
  },
  exit: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: -1
    }
  }
};

// Helper function to create staggered delay
export const createStaggerDelay = (index: number, baseDelay: number = 0.1) => ({
  transition: {
    delay: baseDelay * index,
    ...defaultTransition
  }
});

// Preset animation combinations
export const pageTransition = {
  variants: fadeIn,
  initial: "initial",
  animate: "animate",
  exit: "exit",
  transition: defaultTransition
};

export const cardTransition = {
  variants: fadeInUp,
  initial: "initial",
  animate: "animate",
  exit: "exit",
  whileHover: "hover",
  whileTap: "tap",
  transition: defaultTransition
};