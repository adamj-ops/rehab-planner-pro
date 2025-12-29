/**
 * SkeletonShimmer Component
 *
 * Loading skeleton with animated shimmer effect.
 * Perfect for loading states while data is being fetched.
 */

"use client"

import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkeletonShimmerProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
  shimmer?: boolean
}

export function SkeletonShimmer({
  className,
  variant = "rectangular",
  width,
  height,
  shimmer = true,
}: SkeletonShimmerProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md",
  }

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-gray-200 dark:bg-gray-800",
        variants[variant],
        className
      )}
      style={{ width, height }}
    >
      {shimmer && (
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
          animate={{ x: ["-100%", "100%"] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      )}
    </div>
  )
}

// ============================================================================
// PRE-BUILT SKELETON LAYOUTS
// ============================================================================

/**
 * Dashboard stats skeleton
 */
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonShimmer key={i} className="h-24" />
        ))}
      </div>
      <SkeletonShimmer className="h-64" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonShimmer key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}

/**
 * Card skeleton
 */
export function CardSkeleton() {
  return (
    <div className="space-y-3 p-4">
      <div className="flex items-center gap-3">
        <SkeletonShimmer variant="circular" width={40} height={40} />
        <div className="flex-1 space-y-2">
          <SkeletonShimmer className="h-4 w-3/4" />
          <SkeletonShimmer className="h-3 w-1/2" />
        </div>
      </div>
      <SkeletonShimmer className="h-32" />
      <div className="space-y-2">
        <SkeletonShimmer className="h-3 w-full" />
        <SkeletonShimmer className="h-3 w-5/6" />
        <SkeletonShimmer className="h-3 w-4/6" />
      </div>
    </div>
  )
}

/**
 * List skeleton
 */
export function ListSkeleton({ count = 5 }: { count?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-3">
          <SkeletonShimmer variant="circular" width={32} height={32} />
          <div className="flex-1 space-y-2">
            <SkeletonShimmer className="h-4 w-3/4" />
            <SkeletonShimmer className="h-3 w-1/2" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Form skeleton
 */
export function FormSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="space-y-2">
          <SkeletonShimmer className="h-4 w-24" />
          <SkeletonShimmer className="h-10 w-full" />
        </div>
      ))}
      <div className="flex gap-2 pt-4">
        <SkeletonShimmer className="h-10 w-24" />
        <SkeletonShimmer className="h-10 w-24" />
      </div>
    </div>
  )
}
