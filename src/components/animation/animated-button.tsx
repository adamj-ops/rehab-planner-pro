/**
 * AnimatedButton Component
 *
 * Enhanced button with hover, tap, and loading animations.
 * Built on top of shadcn Button component.
 */

"use client"

import { motion } from "framer-motion"
import { Button, ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"
import { springs } from "@/lib/animation-constants"

interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean
  shimmer?: boolean
  lift?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  (
    {
      children,
      ripple = false,
      shimmer = true,
      lift = true,
      className,
      variant,
      disabled,
      ...props
    },
    ref
  ) => {
    const shouldAnimate = !disabled

    return (
      <motion.div
        className="relative inline-block"
        whileHover={shouldAnimate && lift ? { scale: 1.02, y: -2 } : {}}
        whileTap={shouldAnimate ? { scale: 0.98 } : {}}
        transition={springs.stiff}
      >
        <Button
          ref={ref}
          className={cn("relative overflow-hidden", className)}
          variant={variant}
          disabled={disabled}
          {...props}
        >
          {/* Shimmer effect for primary buttons */}
          {shimmer && variant === "default" && !disabled && (
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              initial={{ x: "-100%" }}
              whileHover={{ x: "100%" }}
              transition={{ duration: 0.6 }}
            />
          )}

          {/* Content */}
          <span className="relative z-10">{children}</span>
        </Button>

        {/* Glow effect on hover */}
        {lift && !disabled && (
          <motion.div
            className={cn(
              "absolute inset-0 rounded-md -z-10 blur-sm opacity-0",
              variant === "default" && "bg-blue-500/50",
              variant === "destructive" && "bg-red-500/50",
              variant === "outline" && "bg-gray-500/30"
            )}
            whileHover={{ opacity: 0.5 }}
            transition={{ duration: 0.2 }}
          />
        )}
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
