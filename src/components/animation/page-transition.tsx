/**
 * PageTransition Component
 *
 * Smooth page transitions for route changes.
 * Wraps page content and animates on route changes.
 */

"use client"

import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"
import { durations, easings } from "@/lib/animation-constants"

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

const variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98,
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: durations.slow / 1000,
      ease: easings.decelerate,
    },
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: durations.normal / 1000,
      ease: easings.accelerate,
    },
  },
}

export function PageTransition({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Slide transition variant
 */
export function PageTransitionSlide({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  const slideVariants = {
    hidden: { opacity: 0, x: -20 },
    enter: {
      opacity: 1,
      x: 0,
      transition: {
        duration: durations.slow / 1000,
        ease: easings.decelerate,
      },
    },
    exit: {
      opacity: 0,
      x: 20,
      transition: {
        duration: durations.normal / 1000,
        ease: easings.accelerate,
      },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={slideVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}

/**
 * Scale transition variant
 */
export function PageTransitionScale({ children, className }: PageTransitionProps) {
  const pathname = usePathname()

  const scaleVariants = {
    hidden: { opacity: 0, scale: 0.95 },
    enter: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: durations.slow / 1000,
        ease: easings.smooth,
      },
    },
    exit: {
      opacity: 0,
      scale: 1.05,
      transition: {
        duration: durations.normal / 1000,
        ease: easings.accelerate,
      },
    },
  }

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={scaleVariants}
        className={className}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
