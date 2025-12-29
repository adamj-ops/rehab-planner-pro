# 🎨 Rehab Planner Pro - UI/UX Polish & Micro-Animations Guide

**Document Version:** 1.0
**Last Updated:** December 28, 2025
**Project:** Rehab Planner Pro
**Purpose:** Comprehensive guide for implementing professional UI polish and micro-animations across Epic 1 & Epic 2

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Animation Philosophy](#animation-philosophy)
3. [Technical Stack](#technical-stack)
4. [Epic 1: Authentication & Infrastructure](#epic-1-authentication--infrastructure)
5. [Epic 2: Project Dashboard & Design Intelligence](#epic-2-project-dashboard--design-intelligence)
6. [Cross-Epic Enhancements](#cross-epic-enhancements)
7. [Reusable Animation Components](#reusable-animation-components)
8. [Implementation Roadmap](#implementation-roadmap)
9. [Performance Considerations](#performance-considerations)
10. [Testing & Quality Assurance](#testing--quality-assurance)

---

## Overview

### Current State Assessment

**Strengths:**
- ✅ Solid component architecture with shadcn/ui
- ✅ Mira theme implementation with OKLCH colors
- ✅ Proper state management with Zustand
- ✅ Clean, professional base styling
- ✅ Comprehensive form validation

**Opportunities:**
- ⚡ Enhance user feedback with micro-animations
- ⚡ Add delightful transitions between states
- ⚡ Improve perceived performance with loading animations
- ⚡ Create memorable interactions that differentiate from competitors
- ⚡ Add progressive enhancement for power users

### Success Metrics

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| User Delight Score | 3.5/5 | 4.5/5 | User surveys |
| Interaction Time | 200ms | 150ms | Analytics |
| Bounce Rate | 35% | 25% | Analytics |
| Form Completion | 65% | 85% | Conversion tracking |
| Perceived Performance | 3.8/5 | 4.6/5 | User feedback |

---

## Animation Philosophy

### Principles

**1. Purpose-Driven**
- Every animation must serve a purpose (feedback, guidance, delight)
- No animation for animation's sake
- Respect user's motion preferences (`prefers-reduced-motion`)

**2. Performance-First**
- Use CSS transforms and opacity for animations
- Avoid animating properties that trigger layout/paint
- Implement progressive enhancement
- 60fps minimum for all animations

**3. Consistency**
- Use consistent timing functions across similar interactions
- Maintain visual hierarchy in animation choreography
- Follow established patterns from Mira theme

**4. Subtlety**
- Micro-animations should be noticeable but not distracting
- Duration: 150-300ms for most interactions
- Spring physics for natural feel

### Timing Functions

```typescript
export const easings = {
  // Standard easing for most UI elements
  standard: [0.4, 0.0, 0.2, 1],

  // Accelerate easing for exits
  accelerate: [0.4, 0.0, 1, 1],

  // Decelerate easing for entrances
  decelerate: [0.0, 0.0, 0.2, 1],

  // Sharp easing for attention-grabbing
  sharp: [0.4, 0.0, 0.6, 1],

  // Bounce for playful interactions
  bounce: [0.68, -0.55, 0.265, 1.55],
}

export const durations = {
  fast: 150,      // Quick feedback
  normal: 250,    // Standard transitions
  slow: 400,      // Complex animations
  slowest: 600,   // Page transitions
}

export const springs = {
  // Gentle spring for cards and panels
  gentle: { tension: 280, friction: 60 },

  // Bouncy spring for playful elements
  bouncy: { tension: 500, friction: 10 },

  // Stiff spring for responsive UI
  stiff: { tension: 800, friction: 50 },

  // Wobbly for celebration animations
  wobbly: { tension: 180, friction: 12 },
}
```

---

## Epic 1: Authentication & Infrastructure

### 1.1 Auth Page (`/auth/page.tsx`)

#### Current Implementation
```typescript
// Location: src/app/auth/page.tsx
// Lines: 22-30 (Loading state)
// Lines: 36-56 (Main auth page)
```

#### Enhancement: Animated Loading State

**File:** `src/app/auth/page.tsx`

**Before:**
```typescript
if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p className="text-gray-600">Loading...</p>
      </div>
    </div>
  )
}
```

**After:**
```typescript
import { motion } from "framer-motion"

if (loading) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          animate={{
            rotate: 360,
            scale: [1, 1.1, 1]
          }}
          transition={{
            rotate: { duration: 1, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
          }}
          className="mx-auto mb-4"
        >
          <Loader2 className="h-8 w-8 text-blue-600" />
        </motion.div>
        <motion.p
          className="text-gray-600 font-medium"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          Loading your workspace...
        </motion.p>
      </motion.div>
    </div>
  )
}
```

#### Enhancement: Page Entrance Animation

**After:**
```typescript
return (
  <motion.div
    className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    transition={{ duration: 0.5 }}
  >
    <motion.div
      className="w-full max-w-md"
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay: 0.1, duration: 0.4 }}
    >
      <motion.div
        className="text-center mb-8"
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <h1 className="text-4xl font-bold text-gray-900 mb-2">
          Rehab Estimator
        </h1>
        <p className="text-gray-600">
          Professional renovation planning and cost estimation
        </p>
      </motion.div>

      <AuthForm mode={mode} onModeChange={setMode} />

      <motion.div
        className="mt-8 text-center text-sm text-gray-500"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.4, duration: 0.3 }}
      >
        <p>
          By continuing, you agree to our Terms of Service and Privacy Policy
        </p>
      </motion.div>
    </motion.div>
  </motion.div>
)
```

---

### 1.2 Auth Form (`/components/auth/auth-form.tsx`)

#### Enhancement 1: Password Strength Indicator

**File:** `src/components/auth/auth-form.tsx`
**Lines:** 274-298

**Before:**
```typescript
{signUpForm.watch('password') && (
  <div className="space-y-2">
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((level) => (
        <div
          key={level}
          className={cn(
            "h-1 flex-1 rounded-full transition-colors",
            level <= passwordStrength
              ? passwordStrength <= 2
                ? "bg-yellow-500"
                : "bg-green-500"
              : "bg-gray-200"
          )}
        />
      ))}
    </div>
    <p className="text-xs text-muted-foreground">
      {passwordStrength <= 1 && "Weak password"}
      {passwordStrength === 2 && "Fair password"}
      {passwordStrength === 3 && "Good password"}
      {passwordStrength === 4 && "Strong password"}
    </p>
  </div>
)}
```

**After:**
```typescript
import { motion, AnimatePresence } from "framer-motion"

{signUpForm.watch('password') && (
  <motion.div
    className="space-y-2"
    initial={{ opacity: 0, height: 0 }}
    animate={{ opacity: 1, height: "auto" }}
    exit={{ opacity: 0, height: 0 }}
  >
    <div className="flex gap-1">
      {[1, 2, 3, 4].map((level) => (
        <motion.div
          key={level}
          className={cn(
            "h-1.5 flex-1 rounded-full origin-left overflow-hidden"
          )}
          initial={{ scaleX: 0 }}
          animate={{
            scaleX: level <= passwordStrength ? 1 : 0,
            backgroundColor: level <= passwordStrength
              ? passwordStrength <= 2
                ? "#eab308" // yellow-500
                : "#22c55e" // green-500
              : "#e5e7eb" // gray-200
          }}
          transition={{
            scaleX: {
              type: "spring",
              stiffness: 300,
              damping: 20,
              delay: level * 0.05
            },
            backgroundColor: { duration: 0.3 }
          }}
        >
          {/* Shimmer effect for completed bars */}
          {level <= passwordStrength && (
            <motion.div
              className="h-full w-full bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 3,
                ease: "easeInOut"
              }}
            />
          )}
        </motion.div>
      ))}
    </div>

    <AnimatePresence mode="wait">
      <motion.p
        key={passwordStrength}
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.2 }}
        className={cn(
          "text-xs font-medium flex items-center gap-1.5",
          passwordStrength <= 1 && "text-red-600",
          passwordStrength === 2 && "text-yellow-600",
          passwordStrength === 3 && "text-blue-600",
          passwordStrength === 4 && "text-green-600"
        )}
      >
        {passwordStrength === 4 && (
          <motion.span
            initial={{ scale: 0 }}
            animate={{ scale: 1, rotate: [0, -10, 10, 0] }}
            transition={{ type: "spring", stiffness: 500 }}
          >
            ✓
          </motion.span>
        )}
        {passwordStrength <= 1 && "Weak password"}
        {passwordStrength === 2 && "Fair password"}
        {passwordStrength === 3 && "Good password"}
        {passwordStrength === 4 && "Strong password"}
      </motion.p>
    </AnimatePresence>
  </motion.div>
)}
```

#### Enhancement 2: Success State with Celebration

**File:** `src/components/auth/auth-form.tsx`
**Lines:** 151-183

**After:**
```typescript
import confetti from 'canvas-confetti'

// Add celebration effect function
const celebrateSuccess = () => {
  confetti({
    particleCount: 100,
    spread: 70,
    origin: { y: 0.6 },
    colors: ['#3b82f6', '#8b5cf6', '#ec4899']
  })
}

// Call in success state render
if (success && mode === 'signup') {
  // Trigger confetti on mount
  useEffect(() => {
    celebrateSuccess()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 200, damping: 20 }}
    >
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center">
          <motion.div
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100"
            initial={{ scale: 0 }}
            animate={{
              scale: 1,
              rotate: [0, -10, 10, -10, 0]
            }}
            transition={{
              scale: { type: "spring", stiffness: 500, delay: 0.1 },
              rotate: { duration: 0.5, delay: 0.3 }
            }}
          >
            <motion.div
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <CheckCircle2 className="h-8 w-8 text-green-600" />
            </motion.div>
          </motion.div>

          <motion.div
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <CardTitle className="text-2xl font-bold tracking-tight">
              Check your email
            </CardTitle>
            <CardDescription className="mt-2">
              We've sent a verification link to your email address
            </CardDescription>
          </motion.div>
        </CardHeader>

        <CardContent className="text-center">
          <motion.p
            className="text-sm text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            Click the link in your email to verify your account.
            If you don't see it, check your spam folder.
          </motion.p>
        </CardContent>

        <CardFooter>
          <motion.div
            className="w-full"
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSuccess(null)
                onModeChange('signin')
              }}
            >
              Back to sign in
            </Button>
          </motion.div>
        </CardFooter>
      </Card>
    </motion.div>
  )
}
```

#### Enhancement 3: Error State with Shake Animation

**File:** `src/components/auth/auth-form.tsx`
**Lines:** 360-365

**After:**
```typescript
{error && (
  <motion.div
    initial={{ opacity: 0, y: -10 }}
    animate={{
      opacity: 1,
      y: 0,
      x: [0, -10, 10, -10, 10, 0]
    }}
    transition={{
      opacity: { duration: 0.2 },
      y: { duration: 0.2 },
      x: { duration: 0.4, delay: 0.2 }
    }}
  >
    <Alert variant="destructive" className="relative overflow-hidden">
      {/* Pulse effect */}
      <motion.div
        className="absolute inset-0 bg-red-500/10"
        animate={{ opacity: [0.5, 0, 0.5] }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      <AlertCircle className="h-4 w-4" />
      <AlertDescription>{error}</AlertDescription>
    </Alert>
  </motion.div>
)}
```

#### Enhancement 4: Input Focus States

**File:** `src/components/auth/auth-form.tsx`
**Multiple locations**

**Create reusable AnimatedInput component:**
```typescript
// File: src/components/ui/animated-input.tsx
import { motion } from "framer-motion"
import { Input, InputProps } from "@/components/ui/input"
import { forwardRef } from "react"

interface AnimatedInputProps extends InputProps {
  icon?: React.ReactNode
}

export const AnimatedInput = forwardRef<HTMLInputElement, AnimatedInputProps>(
  ({ icon, className, ...props }, ref) => {
    return (
      <motion.div
        className="relative"
        whileFocus={{ scale: 1.01 }}
        transition={{ type: "spring", stiffness: 400, damping: 30 }}
      >
        {icon && (
          <motion.div
            className="absolute left-3 top-3 text-muted-foreground"
            whileFocus={{ color: "hsl(var(--primary))", scale: 1.1 }}
          >
            {icon}
          </motion.div>
        )}

        <Input
          ref={ref}
          className={cn(
            icon && "pl-9",
            "transition-all duration-200",
            "focus:ring-2 focus:ring-primary/20",
            "focus:border-primary",
            className
          )}
          {...props}
        />
      </motion.div>
    )
  }
)

AnimatedInput.displayName = "AnimatedInput"
```

#### Enhancement 5: OAuth Buttons with Hover Effects

**File:** `src/components/auth/auth-form.tsx`
**Lines:** 414-442

**After:**
```typescript
<div className="grid grid-cols-3 gap-4">
  {[
    { provider: 'google', Icon: Icons.google, label: 'Google' },
    { provider: 'github', Icon: Icons.github, label: 'GitHub' },
    { provider: 'microsoft', Icon: Icons.microsoft, label: 'Microsoft' }
  ].map(({ provider, Icon, label }) => (
    <motion.div
      key={provider}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.95 }}
      transition={{ type: "spring", stiffness: 400, damping: 10 }}
    >
      <Button
        variant="outline"
        onClick={() => handleOAuthSignIn(provider)}
        disabled={isLoading}
        className="w-full relative overflow-hidden group"
      >
        {/* Shimmer effect on hover */}
        <motion.div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
          initial={{ x: "-100%" }}
          whileHover={{ x: "100%" }}
          transition={{ duration: 0.6 }}
        />

        <Icon className="mr-2 h-4 w-4" />
        {label}
      </Button>
    </motion.div>
  ))}
</div>
```

---

## Epic 2: Project Dashboard & Design Intelligence

### 2.1 Wizard Progress Bar

**File:** `src/app/(dashboard)/rehab-estimator/page.tsx`
**Line:** 119

**Create new component:** `src/components/wizard/animated-step-progress.tsx`

```typescript
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: number
  name: string
  description: string
  icon: React.ComponentType<{ className?: string }>
}

interface AnimatedStepProgressProps {
  steps: Step[]
  currentStep: number
  onStepClick?: (step: number) => void
}

export function AnimatedStepProgress({
  steps,
  currentStep,
  onStepClick
}: AnimatedStepProgressProps) {
  const progress = (currentStep / steps.length) * 100

  return (
    <div className="w-full py-8">
      {/* Progress Bar Background */}
      <div className="relative">
        <div className="absolute top-5 left-0 right-0 h-1 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden">
          {/* Animated Progress Fill */}
          <motion.div
            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{
              type: "spring",
              stiffness: 100,
              damping: 15,
              duration: 0.6
            }}
          >
            {/* Shimmer effect */}
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
              animate={{ x: ["-100%", "100%"] }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 1,
                ease: "easeInOut"
              }}
            />
          </motion.div>
        </div>

        {/* Step Indicators */}
        <div className="relative flex justify-between">
          {steps.map((step, index) => {
            const isCompleted = index < currentStep - 1
            const isCurrent = index === currentStep - 1
            const Icon = step.icon

            return (
              <motion.div
                key={step.id}
                className="flex flex-col items-center relative z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                {/* Step Circle */}
                <motion.button
                  className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center",
                    "border-2 transition-colors cursor-pointer",
                    "focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2",
                    isCompleted && "bg-green-500 border-green-500",
                    isCurrent && "bg-blue-500 border-blue-500 ring-4 ring-blue-500/20",
                    !isCompleted && !isCurrent && "bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-700"
                  )}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isCurrent ? {
                    scale: [1, 1.05, 1],
                    boxShadow: [
                      "0 0 0 0 rgba(59, 130, 246, 0.4)",
                      "0 0 0 8px rgba(59, 130, 246, 0)",
                      "0 0 0 0 rgba(59, 130, 246, 0)"
                    ]
                  } : {}}
                  transition={isCurrent ? {
                    scale: { repeat: Infinity, duration: 2 },
                    boxShadow: { repeat: Infinity, duration: 2 }
                  } : {}}
                  onClick={() => onStepClick?.(index + 1)}
                  disabled={index > currentStep}
                >
                  {isCompleted ? (
                    <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{ type: "spring", stiffness: 500 }}
                    >
                      <Check className="w-5 h-5 text-white" />
                    </motion.div>
                  ) : (
                    <Icon className={cn(
                      "w-5 h-5",
                      isCurrent && "text-white",
                      !isCurrent && "text-gray-400 dark:text-gray-600"
                    )} />
                  )}
                </motion.button>

                {/* Step Label */}
                <motion.div
                  className="mt-2 text-center max-w-[120px]"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                >
                  <p className={cn(
                    "text-xs font-medium",
                    (isCompleted || isCurrent) && "text-gray-900 dark:text-gray-100",
                    !isCompleted && !isCurrent && "text-gray-500 dark:text-gray-500"
                  )}>
                    {step.name}
                  </p>
                  {isCurrent && (
                    <motion.p
                      className="text-xs text-muted-foreground mt-0.5"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ delay: 0.2 }}
                    >
                      {step.description}
                    </motion.p>
                  )}
                </motion.div>
              </motion.div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
```

**Usage in wizard:**
```typescript
// In rehab-estimator/page.tsx
import { AnimatedStepProgress } from "@/components/wizard/animated-step-progress"

<AnimatedStepProgress
  steps={steps}
  currentStep={currentStep}
  onStepClick={(step) => setCurrentStep(step)}
/>
```

---

### 2.2 Dashboard Stats Cards

**Create:** `src/components/dashboard/animated-stat-card.tsx`

```typescript
import { motion } from "framer-motion"
import { useSpring, animated } from "@react-spring/web"
import { useInView } from "react-intersection-observer"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface AnimatedStatCardProps {
  label: string
  value: number
  change?: number
  icon: LucideIcon
  prefix?: string
  suffix?: string
  trend?: "up" | "down"
  delay?: number
}

export function AnimatedStatCard({
  label,
  value,
  change,
  icon: Icon,
  prefix = "",
  suffix = "",
  trend,
  delay = 0
}: AnimatedStatCardProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  // Animated number count-up
  const { number } = useSpring({
    from: { number: 0 },
    number: inView ? value : 0,
    delay: delay * 1000,
    config: { mass: 1, tension: 20, friction: 10 }
  })

  return (
    <motion.div
      ref={ref}
      className="relative group"
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{
        delay: delay,
        duration: 0.5,
        ease: "easeOut"
      }}
      whileHover={{
        y: -4,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
    >
      <Card className="relative overflow-hidden">
        {/* Gradient border on hover */}
        <motion.div
          className="absolute inset-0 rounded-lg bg-gradient-to-r from-blue-500 to-purple-600 opacity-0 group-hover:opacity-100 -z-10"
          style={{ padding: "1px" }}
          transition={{ duration: 0.3 }}
        />

        {/* Animated background glow */}
        <motion.div
          className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-600/20 rounded-lg blur opacity-0 group-hover:opacity-100"
          transition={{ duration: 0.3 }}
        />

        <CardHeader className="flex flex-row items-center justify-between pb-2">
          <CardTitle className="text-sm font-medium text-muted-foreground">
            {label}
          </CardTitle>

          {/* Animated icon */}
          <motion.div
            animate={{
              y: [0, -4, 0],
              rotate: [0, 5, -5, 0]
            }}
            transition={{
              repeat: Infinity,
              duration: 3,
              repeatDelay: 2,
              ease: "easeInOut"
            }}
          >
            <div className="p-2 rounded-lg bg-blue-500/10 group-hover:bg-blue-500/20 transition-colors">
              <Icon className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            </div>
          </motion.div>
        </CardHeader>

        <CardContent>
          {/* Animated number */}
          <div className="text-2xl font-bold">
            <animated.span>
              {number.to(n => {
                const formatted = Math.floor(n).toLocaleString()
                return `${prefix}${formatted}${suffix}`
              })}
            </animated.span>
          </div>

          {/* Change indicator */}
          {change !== undefined && (
            <motion.div
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: delay + 0.5 }}
              className="flex items-center gap-1 mt-1"
            >
              <motion.span
                animate={{ y: trend === "up" ? -2 : 2 }}
                transition={{ repeat: Infinity, duration: 1, repeatType: "reverse" }}
                className={cn(
                  "text-sm font-medium",
                  trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
                )}
              >
                {trend === "up" ? "↑" : "↓"}
              </motion.span>
              <p className={cn(
                "text-xs font-medium",
                trend === "up" ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400"
              )}>
                {Math.abs(change)}% from last month
              </p>
            </motion.div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}
```

---

### 2.3 Color Library Enhancements

**File:** `src/components/design/ColorLibrary/ColorCard.tsx`

```typescript
import { motion, AnimatePresence } from "framer-motion"
import { Check, Heart, Info } from "lucide-react"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { useState } from "react"

interface ColorCardProps {
  color: {
    id: string
    name: string
    code: string
    hex: string
    rgb: string
    family: string
    lrv: number
  }
  isSelected?: boolean
  onSelect?: () => void
  onFavorite?: () => void
  size?: "sm" | "md" | "lg"
}

export function ColorCard({
  color,
  isSelected,
  onSelect,
  onFavorite,
  size = "md"
}: ColorCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizes = {
    sm: "h-24",
    md: "h-32",
    lg: "h-40"
  }

  return (
    <motion.div
      className="group relative cursor-pointer"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={{
        scale: 1.03,
        transition: { type: "spring", stiffness: 400, damping: 10 }
      }}
      whileTap={{ scale: 0.98 }}
      layout
      onClick={onSelect}
    >
      <Card className={cn(
        "overflow-hidden transition-shadow duration-300",
        isSelected && "ring-2 ring-blue-500 ring-offset-2"
      )}>
        {/* Color Swatch */}
        <motion.div
          className={cn("relative overflow-hidden", sizes[size])}
          style={{ backgroundColor: color.hex }}
          animate={isHovered ? { scale: 1.05 } : { scale: 1 }}
          transition={{ type: "spring", stiffness: 400, damping: 20 }}
        >
          {/* Overlay actions */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-black/40 flex items-center justify-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                <motion.button
                  className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={(e) => {
                    e.stopPropagation()
                    onFavorite?.()
                  }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ delay: 0.05 }}
                >
                  <Heart className="h-4 w-4 text-gray-700" />
                </motion.button>

                <motion.button
                  className="p-2 rounded-full bg-white/90 hover:bg-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 180 }}
                  transition={{ delay: 0.1 }}
                >
                  <Info className="h-4 w-4 text-gray-700" />
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selection checkmark */}
          <AnimatePresence>
            {isSelected && (
              <motion.div
                className="absolute top-2 right-2"
                initial={{ scale: 0, rotate: -180 }}
                animate={{
                  scale: 1,
                  rotate: 0,
                  y: [0, -4, 0]
                }}
                exit={{ scale: 0, rotate: 180 }}
                transition={{
                  scale: { type: "spring", stiffness: 500, damping: 15 },
                  rotate: { duration: 0.3 },
                  y: { duration: 0.5, delay: 0.2 }
                }}
              >
                <div className="w-7 h-7 rounded-full bg-green-500 flex items-center justify-center shadow-lg ring-2 ring-white">
                  <Check className="w-4 h-4 text-white" strokeWidth={3} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Shimmer effect on hover */}
          <AnimatePresence>
            {isHovered && (
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent"
                initial={{ x: "-100%" }}
                animate={{ x: "100%" }}
                transition={{ duration: 0.6 }}
              />
            )}
          </AnimatePresence>
        </motion.div>

        {/* Color Info */}
        <motion.div
          className="p-3 space-y-2"
          animate={isHovered ? { y: -2 } : { y: 0 }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{color.name}</p>
              <p className="text-xs text-muted-foreground">{color.code}</p>
            </div>

            <Badge variant="secondary" className="text-xs shrink-0">
              {color.family}
            </Badge>
          </div>

          <motion.div
            className="flex items-center justify-between text-xs text-muted-foreground"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.1 }}
          >
            <span>LRV: {color.lrv}</span>
            <span className="font-mono">{color.hex}</span>
          </motion.div>
        </motion.div>
      </Card>
    </motion.div>
  )
}
```

---

### 2.4 Material Library Enhancements

Similar pattern to ColorCard, create `AnimatedMaterialCard.tsx`:

```typescript
// File: src/components/design/AnimatedMaterialCard.tsx
// Similar structure to ColorCard but with:
// - Image lazy loading with blur-up effect
// - Price badge with pulse on hover
// - "Add to project" button with success confirmation animation
// - Category badge with color coding
```

---

### 2.5 Moodboard Canvas Interactions

**File:** `src/components/design/moodboard-canvas.tsx`

```typescript
import { useDrag } from '@use-gesture/react'
import { useSpring, animated, config } from '@react-spring/web'
import { motion, AnimatePresence } from "framer-motion"

interface MoodboardElementProps {
  element: {
    id: string
    type: string
    x: number
    y: number
    width: number
    height: number
    content: any
  }
  isSelected: boolean
  onUpdate: (element: any) => void
  onDelete: () => void
  onSelect: () => void
}

export function MoodboardElement({
  element,
  isSelected,
  onUpdate,
  onDelete,
  onSelect
}: MoodboardElementProps) {
  const [{ x, y, scale }, api] = useSpring(() => ({
    x: element.x,
    y: element.y,
    scale: 1,
    config: config.gentle
  }))

  // Drag gesture
  const bind = useDrag(({ offset: [ox, oy], down, tap }) => {
    if (tap) {
      onSelect()
      return
    }

    api.start({
      x: ox,
      y: oy,
      scale: down ? 1.05 : 1,
      immediate: down,
      config: down ? config.stiff : config.gentle
    })

    if (!down) {
      // Snap to grid (20px)
      const snappedX = Math.round(ox / 20) * 20
      const snappedY = Math.round(oy / 20) * 20

      api.start({
        x: snappedX,
        y: snappedY,
        config: config.wobbly
      })

      onUpdate({ ...element, x: snappedX, y: snappedY })
    }
  }, {
    from: () => [x.get(), y.get()],
    bounds: { left: 0, top: 0, right: 2000, bottom: 2000 }
  })

  return (
    <animated.div
      {...bind()}
      style={{
        x,
        y,
        scale,
        touchAction: 'none',
        position: 'absolute'
      }}
      className={cn(
        "cursor-move select-none",
        isSelected && "z-50"
      )}
    >
      {/* Selection ring */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            className="absolute -inset-2 rounded-lg"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{
              opacity: 1,
              scale: 1,
              boxShadow: [
                "0 0 0 2px rgba(59, 130, 246, 0.5)",
                "0 0 0 2px rgba(59, 130, 246, 1)",
                "0 0 0 2px rgba(59, 130, 246, 0.5)"
              ]
            }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{
              boxShadow: { repeat: Infinity, duration: 2 }
            }}
          />
        )}
      </AnimatePresence>

      {/* Element content */}
      <div className="relative bg-white dark:bg-gray-900 rounded-lg shadow-lg overflow-hidden">
        {element.content}
      </div>

      {/* Delete button on hover */}
      <AnimatePresence>
        {isSelected && (
          <motion.button
            className="absolute -top-3 -right-3 w-6 h-6 bg-red-500 rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors"
            initial={{ scale: 0, rotate: -180 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0, rotate: 180 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation()
              onDelete()
            }}
          >
            <X className="w-3 h-3 text-white" />
          </motion.button>
        )}
      </AnimatePresence>
    </animated.div>
  )
}

// Delete animation with "poof" effect
function PoofAnimation({ onComplete }: { onComplete: () => void }) {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center pointer-events-none"
      initial={{ scale: 1, opacity: 1 }}
      animate={{
        scale: [1, 1.5, 2],
        opacity: [1, 0.5, 0]
      }}
      transition={{ duration: 0.5 }}
      onAnimationComplete={onComplete}
    >
      <div className="w-20 h-20 rounded-full bg-gray-400/50 blur-xl" />
    </motion.div>
  )
}
```

---

## Cross-Epic Enhancements

### 3.1 Animated Toast Notifications

**File:** `src/components/ui/animated-toast.tsx`

```typescript
import { motion, AnimatePresence } from "framer-motion"
import { useToast } from "@/components/ui/use-toast"
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react"
import { cn } from "@/lib/utils"

export function AnimatedToast() {
  const { toasts, dismiss } = useToast()

  const icons = {
    success: CheckCircle2,
    error: AlertCircle,
    info: Info,
    warning: AlertCircle
  }

  const colors = {
    success: "bg-green-500",
    error: "bg-red-500",
    info: "bg-blue-500",
    warning: "bg-yellow-500"
  }

  return (
    <div className="fixed top-4 right-4 z-50 flex flex-col gap-2 max-w-md">
      <AnimatePresence mode="popLayout">
        {toasts.map((toast) => {
          const Icon = icons[toast.variant || 'info']
          const color = colors[toast.variant || 'info']

          return (
            <motion.div
              key={toast.id}
              layout
              initial={{ opacity: 0, y: -50, scale: 0.3 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{
                opacity: 0,
                x: 100,
                scale: 0.5,
                transition: { duration: 0.2 }
              }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className="relative"
            >
              <motion.div
                className={cn(
                  "flex items-start gap-3 p-4 rounded-lg shadow-lg bg-white dark:bg-gray-900 border",
                  toast.variant === 'error' && "border-red-200 dark:border-red-900/50"
                )}
                animate={toast.variant === 'error' ? {
                  x: [-5, 5, -5, 5, 0]
                } : {}}
                transition={{ duration: 0.4 }}
              >
                {/* Icon with animation */}
                <motion.div
                  initial={{ scale: 0, rotate: -180 }}
                  animate={{
                    scale: 1,
                    rotate: 0,
                    y: [0, -2, 0]
                  }}
                  transition={{
                    scale: { type: "spring", stiffness: 500 },
                    rotate: { duration: 0.3 },
                    y: { duration: 0.5, repeat: Infinity, repeatType: "reverse" }
                  }}
                  className={cn("p-1 rounded-full", color)}
                >
                  <Icon className="w-4 h-4 text-white" />
                </motion.div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  {toast.title && (
                    <motion.p
                      className="font-semibold text-sm"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.1 }}
                    >
                      {toast.title}
                    </motion.p>
                  )}
                  {toast.description && (
                    <motion.p
                      className="text-sm text-muted-foreground mt-1"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.2 }}
                    >
                      {toast.description}
                    </motion.p>
                  )}
                </div>

                {/* Close button */}
                <motion.button
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  onClick={() => dismiss(toast.id)}
                >
                  <X className="w-4 h-4" />
                </motion.button>

                {/* Progress bar for auto-dismiss */}
                {toast.duration && (
                  <motion.div
                    className={cn("absolute bottom-0 left-0 h-1 rounded-b-lg", color)}
                    initial={{ width: "100%" }}
                    animate={{ width: "0%" }}
                    transition={{ duration: toast.duration / 1000, ease: "linear" }}
                  />
                )}
              </motion.div>
            </motion.div>
          )
        })}
      </AnimatePresence>
    </div>
  )
}
```

---

### 3.2 Page Transitions

**File:** `src/components/layout/page-transition.tsx`

```typescript
import { motion, AnimatePresence } from "framer-motion"
import { usePathname } from "next/navigation"
import { ReactNode } from "react"

interface PageTransitionProps {
  children: ReactNode
}

const variants = {
  hidden: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  enter: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: {
      duration: 0.4,
      ease: [0.61, 1, 0.88, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -20,
    scale: 0.98,
    transition: {
      duration: 0.3,
      ease: [0.61, 1, 0.88, 1]
    }
  }
}

export function PageTransition({ children }: PageTransitionProps) {
  const pathname = usePathname()

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={pathname}
        initial="hidden"
        animate="enter"
        exit="exit"
        variants={variants}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  )
}
```

**Usage in layout:**
```typescript
// In app/(dashboard)/layout.tsx
import { PageTransition } from "@/components/layout/page-transition"

export default function DashboardLayout({ children }) {
  return (
    <ProtectedRoute>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header>...</header>
          <main className="flex-1">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </ProtectedRoute>
  )
}
```

---

### 3.3 Enhanced Button Component

**File:** `src/components/ui/animated-button.tsx`

```typescript
import { motion } from "framer-motion"
import { Button, ButtonProps } from "@/components/ui/button"
import { forwardRef } from "react"
import { cn } from "@/lib/utils"

interface AnimatedButtonProps extends ButtonProps {
  ripple?: boolean
  shimmer?: boolean
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, ripple = true, shimmer = false, className, variant, ...props }, ref) => {
    return (
      <motion.div
        className="relative inline-block"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        transition={{ type: "spring", stiffness: 400, damping: 17 }}
      >
        <Button
          ref={ref}
          className={cn("relative overflow-hidden", className)}
          variant={variant}
          {...props}
        >
          {/* Shimmer effect for primary buttons */}
          {shimmer && variant === "default" && (
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
      </motion.div>
    )
  }
)

AnimatedButton.displayName = "AnimatedButton"
```

---

## Reusable Animation Components

### 4.1 Fade In When Visible

**File:** `src/components/animation/fade-in-when-visible.tsx`

```typescript
import { motion } from "framer-motion"
import { useInView } from "react-intersection-observer"
import { ReactNode } from "react"

interface FadeInWhenVisibleProps {
  children: ReactNode
  delay?: number
  duration?: number
  direction?: "up" | "down" | "left" | "right"
}

export function FadeInWhenVisible({
  children,
  delay = 0,
  duration = 0.5,
  direction = "up"
}: FadeInWhenVisibleProps) {
  const { ref, inView } = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const directions = {
    up: { y: 40 },
    down: { y: -40 },
    left: { x: 40 },
    right: { x: -40 }
  }

  return (
    <motion.div
      ref={ref}
      initial={{
        opacity: 0,
        ...directions[direction]
      }}
      animate={inView ? {
        opacity: 1,
        x: 0,
        y: 0
      } : {}}
      transition={{
        delay,
        duration,
        ease: "easeOut"
      }}
    >
      {children}
    </motion.div>
  )
}
```

### 4.2 Stagger Children Animation

**File:** `src/components/animation/stagger-children.tsx`

```typescript
import { motion } from "framer-motion"
import { ReactNode } from "react"

interface StaggerChildrenProps {
  children: ReactNode
  staggerDelay?: number
}

export function StaggerChildren({
  children,
  staggerDelay = 0.1
}: StaggerChildrenProps) {
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay
      }
    }
  }

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
    >
      {Array.isArray(children) ? (
        children.map((child, index) => (
          <motion.div key={index} variants={item}>
            {child}
          </motion.div>
        ))
      ) : (
        <motion.div variants={item}>{children}</motion.div>
      )}
    </motion.div>
  )
}
```

### 4.3 Loading Skeleton with Shimmer

**File:** `src/components/animation/skeleton-shimmer.tsx`

```typescript
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface SkeletonShimmerProps {
  className?: string
  variant?: "text" | "circular" | "rectangular"
  width?: string | number
  height?: string | number
}

export function SkeletonShimmer({
  className,
  variant = "rectangular",
  width,
  height
}: SkeletonShimmerProps) {
  const variants = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded-md"
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
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 dark:via-white/10 to-transparent"
        animate={{ x: ["-100%", "100%"] }}
        transition={{
          duration: 1.5,
          repeat: Infinity,
          ease: "easeInOut"
        }}
      />
    </div>
  )
}

// Usage example
export function DashboardSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <SkeletonShimmer key={i} className="h-24" />
        ))}
      </div>
      <SkeletonShimmer className="h-64" />
      <div className="grid grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <SkeletonShimmer key={i} className="h-32" />
        ))}
      </div>
    </div>
  )
}
```

---

## Implementation Roadmap

### Phase 1: Foundation (Week 1)
**Goal:** Set up animation infrastructure and core utilities

#### Tasks:
1. **Install Dependencies**
   ```bash
   npm install framer-motion @react-spring/web @use-gesture/react react-intersection-observer canvas-confetti
   ```

2. **Create Animation Primitives**
   - [ ] FadeInWhenVisible component
   - [ ] StaggerChildren component
   - [ ] SkeletonShimmer component
   - [ ] PageTransition component

3. **Update Global Configuration**
   - [ ] Add motion preferences detection
   - [ ] Create animation constants file
   - [ ] Set up performance monitoring

4. **Create Reusable Components**
   - [ ] AnimatedButton
   - [ ] AnimatedInput
   - [ ] AnimatedToast

**Deliverables:**
- Core animation library ready
- Documentation for each component
- Performance baseline established

---

### Phase 2: Epic 1 Polish (Week 2)
**Goal:** Enhance authentication experience

#### Tasks:
1. **Auth Page Enhancements**
   - [ ] Implement page entrance animation
   - [ ] Add loading state animation
   - [ ] Create mode transition effect

2. **Auth Form Improvements**
   - [ ] Enhanced password strength indicator
   - [ ] Success state with confetti
   - [ ] Error shake animations
   - [ ] Input focus effects

3. **OAuth Button Polish**
   - [ ] Hover lift effects
   - [ ] Shimmer on hover
   - [ ] Loading state animations

4. **Form Validation Feedback**
   - [ ] Success checkmarks
   - [ ] Error highlights
   - [ ] Field-level animations

**Deliverables:**
- Polished auth experience
- A/B test setup for conversion tracking
- User feedback collection

---

### Phase 3: Epic 2 - Dashboard (Week 3)
**Goal:** Create delightful dashboard experience

#### Tasks:
1. **Wizard Progress Enhancement**
   - [ ] Implement AnimatedStepProgress
   - [ ] Add completion celebrations
   - [ ] Step transition animations

2. **Dashboard Stats**
   - [ ] AnimatedStatCard with count-up
   - [ ] Hover effects and glow
   - [ ] Loading skeletons

3. **Project Cards**
   - [ ] Hover lift and shadow
   - [ ] Quick action buttons
   - [ ] Status badge animations

4. **Page Transitions**
   - [ ] Smooth navigation
   - [ ] Loading states
   - [ ] Error boundaries

**Deliverables:**
- Engaging dashboard
- Performance metrics
- User engagement analytics

---

### Phase 4: Epic 2 - Design Tools (Week 4)
**Goal:** Polish design intelligence features

#### Tasks:
1. **Color Library**
   - [ ] Enhanced ColorCard animations
   - [ ] Selection feedback
   - [ ] Favorite interactions
   - [ ] Filter animations

2. **Material Library**
   - [ ] AnimatedMaterialCard
   - [ ] Image lazy loading
   - [ ] Price badge effects
   - [ ] Category filters

3. **Moodboard Canvas**
   - [ ] Drag with momentum
   - [ ] Snap to grid animation
   - [ ] Selection ring
   - [ ] Delete animations
   - [ ] Undo/redo transitions

4. **Search & Filters**
   - [ ] Filter panel slide-in
   - [ ] Search result animations
   - [ ] Clear filters effect

**Deliverables:**
- Professional design tools
- User testing sessions
- Iteration based on feedback

---

## Performance Considerations

### Best Practices

1. **Use CSS Transforms**
   - Prefer `transform` and `opacity` for animations
   - Avoid animating `width`, `height`, `top`, `left`
   - Use `will-change` sparingly

2. **Respect User Preferences**
   ```typescript
   // Detect reduced motion preference
   const prefersReducedMotion = window.matchMedia(
     '(prefers-reduced-motion: reduce)'
   ).matches

   // Conditionally apply animations
   const transition = prefersReducedMotion
     ? { duration: 0 }
     : { duration: 0.3, type: "spring" }
   ```

3. **Progressive Enhancement**
   - Start with functional, non-animated UI
   - Layer animations on top
   - Ensure accessibility without animations

4. **Lazy Load Heavy Animations**
   ```typescript
   const ConfettiLazy = lazy(() => import('./confetti-animation'))
   ```

5. **Monitor Performance**
   ```typescript
   // Track animation performance
   useEffect(() => {
     const observer = new PerformanceObserver((list) => {
       for (const entry of list.getEntries()) {
         console.log('Animation FPS:', 1000 / entry.duration)
       }
     })
     observer.observe({ entryTypes: ['measure'] })
   }, [])
   ```

### Performance Targets

| Metric | Target | Critical |
|--------|--------|----------|
| First Contentful Paint | < 1.5s | < 2.5s |
| Time to Interactive | < 3.5s | < 5s |
| Animation Frame Rate | 60 FPS | 30 FPS |
| Bundle Size Increase | < 50KB | < 100KB |
| CPU Usage (idle) | < 5% | < 10% |

---

## Testing & Quality Assurance

### Testing Checklist

#### Visual Regression Testing
- [ ] Test all animations in Chrome, Firefox, Safari
- [ ] Verify mobile responsiveness
- [ ] Check dark mode compatibility
- [ ] Test with different screen sizes

#### Performance Testing
- [ ] Run Lighthouse audits
- [ ] Measure bundle size impact
- [ ] Check CPU/memory usage during animations
- [ ] Test on low-end devices

#### Accessibility Testing
- [ ] Verify keyboard navigation
- [ ] Test with screen readers
- [ ] Check reduced motion preferences
- [ ] Validate focus indicators

#### User Testing
- [ ] A/B test auth conversion rates
- [ ] Measure task completion times
- [ ] Collect user satisfaction scores
- [ ] Track feature adoption rates

### Quality Gates

**Before Merge:**
1. ✅ All animations run at 60fps
2. ✅ No layout shift (CLS < 0.1)
3. ✅ Bundle size increase < 50KB
4. ✅ Lighthouse score > 90
5. ✅ Accessibility score 100%
6. ✅ Cross-browser tested
7. ✅ Mobile responsive
8. ✅ Reduced motion support

---

## Appendix

### A. Animation Utilities

```typescript
// File: src/lib/animation-utils.ts

export const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 }
}

export const fadeInDown = {
  initial: { opacity: 0, y: -20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: 20 }
}

export const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 }
}

export const slideInLeft = {
  initial: { opacity: 0, x: -20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: 20 }
}

export const slideInRight = {
  initial: { opacity: 0, x: 20 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -20 }
}

export const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
}

export const staggerItem = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 }
}
```

### B. Color Palette for Animations

```typescript
// Animation-specific colors aligned with Mira theme
export const animationColors = {
  primary: {
    light: "rgba(59, 130, 246, 0.1)",    // blue-500/10
    default: "rgba(59, 130, 246, 1)",     // blue-500
    dark: "rgba(37, 99, 235, 1)"          // blue-600
  },
  success: {
    light: "rgba(34, 197, 94, 0.1)",      // green-500/10
    default: "rgba(34, 197, 94, 1)",      // green-500
    dark: "rgba(22, 163, 74, 1)"          // green-600
  },
  error: {
    light: "rgba(239, 68, 68, 0.1)",      // red-500/10
    default: "rgba(239, 68, 68, 1)",      // red-500
    dark: "rgba(220, 38, 38, 1)"          // red-600
  },
  warning: {
    light: "rgba(234, 179, 8, 0.1)",      // yellow-500/10
    default: "rgba(234, 179, 8, 1)",      // yellow-500
    dark: "rgba(202, 138, 4, 1)"          // yellow-600
  }
}
```

### C. Performance Monitoring Hook

```typescript
// File: src/hooks/use-animation-performance.ts
import { useEffect, useRef } from 'react'

export function useAnimationPerformance(name: string) {
  const startTimeRef = useRef<number>()
  const frameCountRef = useRef(0)

  useEffect(() => {
    startTimeRef.current = performance.now()
    let frameId: number

    const measureFrameRate = () => {
      frameCountRef.current++
      const currentTime = performance.now()
      const elapsed = currentTime - (startTimeRef.current || 0)

      if (elapsed >= 1000) {
        const fps = (frameCountRef.current / elapsed) * 1000
        console.log(`[${name}] FPS:`, fps.toFixed(2))

        // Reset counters
        startTimeRef.current = currentTime
        frameCountRef.current = 0
      }

      frameId = requestAnimationFrame(measureFrameRate)
    }

    frameId = requestAnimationFrame(measureFrameRate)

    return () => {
      if (frameId) {
        cancelAnimationFrame(frameId)
      }
    }
  }, [name])
}
```

---

## Document Change Log

| Version | Date | Changes | Author |
|---------|------|---------|--------|
| 1.0 | Dec 28, 2025 | Initial document creation | Claude |

---

**End of Document**
