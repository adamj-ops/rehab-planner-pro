/**
 * FadeInWhenVisible Component
 *
 * Fades in and slides content when it becomes visible in the viewport.
 * Uses Intersection Observer for performance.
 */

"use client"

import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ReactNode } from "react"
import { durations, easings } from "@/lib/animation-constants"

interface FadeInWhenVisibleProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right" | "none"
  threshold?: number
  triggerOnce?: boolean
  className?: string
}

export function FadeInWhenVisible({
  children,
  delay = 0,
  duration = durations.normal,
  direction = "up",
  threshold = 0.1,
  triggerOnce = true,
  className,
}: FadeInWhenVisibleProps) {
  const { ref, inView } = useInView({
    triggerOnce,
    threshold,
  })

  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 },
    none: {},
  }

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{
        opacity: 0,
        ...directions[direction],
      }}
      animate={
        inView
          ? {
              opacity: 1,
              x: 0,
              y: 0,
            }
          : {}
      }
      transition={{
        delay: delay / 1000,
        duration: duration / 1000,
        ease: easings.standard,
      }}
    >
      {children}
    </motion.div>
  )
}
