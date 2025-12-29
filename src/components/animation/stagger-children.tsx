/**
 * StaggerChildren Component
 *
 * Animates children with a stagger effect - each child appears sequentially
 * with a small delay between them.
 */

"use client"

import { motion } from "framer-motion"
import { ReactNode, Children } from "react"

interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
  className?: string
  childClassName?: string
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1,
  className,
  childClassName,
}: StaggerChildrenProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  }

  const childArray = Children.toArray(children)

  return (
    <motion.div
      className={className}
      variants={container}
      initial="hidden"
      animate="show"
    >
      {childArray.map((child, index) => (
        <motion.div key={index} variants={item} className={childClassName}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  )
}
