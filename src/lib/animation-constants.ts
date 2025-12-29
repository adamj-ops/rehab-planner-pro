/**
 * Animation Constants & Utilities
 *
 * Centralized animation configuration for consistent timing,
 * easing functions, and animation patterns across the app.
 */

// ============================================================================
// TIMING FUNCTIONS (Cubic Bezier)
// ============================================================================

export const easings = {
  // Standard easing for most UI elements
  standard: [0.4, 0.0, 0.2, 1] as const,

  // Accelerate easing for exits
  accelerate: [0.4, 0.0, 1, 1] as const,

  // Decelerate easing for entrances
  decelerate: [0.0, 0.0, 0.2, 1] as const,

  // Sharp easing for attention-grabbing
  sharp: [0.4, 0.0, 0.6, 1] as const,

  // Bounce for playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55] as const,

  // Smooth for gentle transitions
  smooth: [0.25, 0.46, 0.45, 0.94] as const,
}

// ============================================================================
// DURATIONS (in milliseconds)
// ============================================================================

export const durations = {
  instant: 0,
  fastest: 100,
  fast: 150,
  normal: 250,
  slow: 400,
  slowest: 600,
  page: 800,
}

// ============================================================================
// SPRING CONFIGURATIONS (for framer-motion)
// ============================================================================

export const springs = {
  // Gentle spring for cards and panels
  gentle: {
    type: "spring" as const,
    stiffness: 280,
    damping: 60,
  },

  // Bouncy spring for playful elements
  bouncy: {
    type: "spring" as const,
    stiffness: 500,
    damping: 10,
  },

  // Stiff spring for responsive UI
  stiff: {
    type: "spring" as const,
    stiffness: 800,
    damping: 50,
  },

  // Wobbly for celebration animations
  wobbly: {
    type: "spring" as const,
    stiffness: 180,
    damping: 12,
  },

  // Smooth for natural feel
  smooth: {
    type: "spring" as const,
    stiffness: 300,
    damping: 30,
  },
}

// ============================================================================
// COMMON ANIMATION VARIANTS (for framer-motion)
// ============================================================================

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
  transition: { duration: durations.normal / 1000, ease: easings.standard },
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 },
  transition: { duration: durations.normal / 1000, ease: easings.standard },
}

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
  transition: { duration: durations.normal / 1000 },
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
  transition: { duration: durations.normal / 1000, ease: easings.standard },
}

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 },
  transition: { duration: durations.normal / 1000, ease: easings.decelerate },
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 },
  transition: { duration: durations.normal / 1000, ease: easings.decelerate },
}

// ============================================================================
// STAGGER CONFIGURATIONS
// ============================================================================

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
}

// ============================================================================
// ANIMATION COLORS (aligned with Mira theme)
// ============================================================================

export const animationColors = {
  primary: {
    light: "rgba(59, 130, 246, 0.1)", // blue-500/10
    default: "rgba(59, 130, 246, 1)", // blue-500
    dark: "rgba(37, 99, 235, 1)", // blue-600
  },
  success: {
    light: "rgba(34, 197, 94, 0.1)", // green-500/10
    default: "rgba(34, 197, 94, 1)", // green-500
    dark: "rgba(22, 163, 74, 1)", // green-600
  },
  error: {
    light: "rgba(239, 68, 68, 0.1)", // red-500/10
    default: "rgba(239, 68, 68, 1)", // red-500
    dark: "rgba(220, 38, 38, 1)", // red-600
  },
  warning: {
    light: "rgba(234, 179, 8, 0.1)", // yellow-500/10
    default: "rgba(234, 179, 8, 1)", // yellow-500
    dark: "rgba(202, 138, 4, 1)", // yellow-600
  },
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Check if user prefers reduced motion
 */
export function prefersReducedMotion(): boolean {
  if (typeof window === "undefined") return false
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches
}

/**
 * Get transition config respecting user preferences
 */
export function getTransition(
  transition: any,
  options?: { respectMotionPreference?: boolean }
) {
  if (options?.respectMotionPreference && prefersReducedMotion()) {
    return { duration: 0 }
  }
  return transition
}

/**
 * Create a delayed animation variant
 */
export function withDelay(variant: any, delay: number) {
  return {
    ...variant,
    transition: {
      ...variant.transition,
      delay: delay / 1000,
    },
  }
}

/**
 * Create a custom spring animation
 */
export function createSpring(stiffness: number, damping: number) {
  return {
    type: "spring" as const,
    stiffness,
    damping,
  }
}

/**
 * Create a custom duration-based animation
 */
export function createTransition(duration: number, ease?: number[]) {
  return {
    duration: duration / 1000,
    ease: ease || easings.standard,
  }
}
