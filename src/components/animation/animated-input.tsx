/**
 * AnimatedInput Component
 *
 * Enhanced input with focus animations and icon support.
 * Built on top of shadcn Input component.
 */

"use client"

import { motion } from "framer-motion"
import { Input, InputProps } from "@/components/ui/input"
import { forwardRef, ReactNode, useState } from "react"
import { cn } from "@/lib/utils"
import { springs } from "@/lib/animation-constants"

interface AnimatedInputProps extends InputProps {
  icon?: ReactNode
  iconPosition?: "left" | "right"
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ icon, iconPosition = "left", className, ...props }, ref) => {
    const [isFocused, setIsFocused] = useState(false)

    return (
      <motion.div
        className="relative"
        animate={isFocused ? { scale: 1.01 } : { scale: 1 }}
        transition={springs.smooth}
      >
        {icon && iconPosition === "left" && (
          <motion.div
            className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            animate={
              isFocused
                ? {
                    color: "hsl(var(--primary))",
                    scale: 1.1,
                  }
                : {
                    color: "hsl(var(--muted-foreground))",
                    scale: 1,
                  }
            }
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}

        <Input
          ref={ref}
          className={cn(
            icon && iconPosition === "left" && "pl-10",
            icon && iconPosition === "right" && "pr-10",
            "transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20",
            "focus:border-primary",
            className
          )}
          onFocus={(e) => {
            setIsFocused(true)
            props.onFocus?.(e)
          }}
          onBlur={(e) => {
            setIsFocused(false)
            props.onBlur?.(e)
          }}
          {...props}
        />

        {icon && iconPosition === "right" && (
          <motion.div
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
            animate={
              isFocused
                ? {
                    color: "hsl(var(--primary))",
                    scale: 1.1,
                  }
                : {
                    color: "hsl(var(--muted-foreground))",
                    scale: 1,
                  }
            }
            transition={{ duration: 0.2 }}
          >
            {icon}
          </motion.div>
        )}

        {/* Focus ring animation */}
        <motion.div
          className="absolute inset-0 rounded-md border-2 border-primary pointer-events-none"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={
            isFocused
              ? { opacity: 0.2, scale: 1 }
              : { opacity: 0, scale: 0.95 }
          }
          transition={{ duration: 0.2 }}
        />
      </motion.div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"
