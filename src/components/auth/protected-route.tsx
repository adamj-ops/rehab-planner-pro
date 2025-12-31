'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  fallback?: React.ReactNode
  requireOnboarding?: boolean
}

export function ProtectedRoute({ 
  children, 
  fallback,
  requireOnboarding = true 
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [onboardingChecked, setOnboardingChecked] = useState(false)
  const [onboardingComplete, setOnboardingComplete] = useState(true)

  // Check authentication
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Check onboarding status
  useEffect(() => {
    async function checkOnboarding() {
      if (!user || !requireOnboarding) {
        setOnboardingChecked(true)
        return
      }

      try {
        const response = await fetch('/api/onboarding/status')
        if (response.ok) {
          const data = await response.json()
          setOnboardingComplete(data.completed)
          if (!data.completed) {
            router.push('/onboarding/step-1')
          }
        }
      } catch (error) {
        console.error('Error checking onboarding status:', error)
      } finally {
        setOnboardingChecked(true)
      }
    }

    if (!loading && user) {
      checkOnboarding()
    }
  }, [user, loading, router, requireOnboarding])

  if (loading || (requireOnboarding && !onboardingChecked)) {
    return (
      fallback || (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    )
  }

  if (!user) {
    return null // Will redirect in useEffect
  }

  if (requireOnboarding && !onboardingComplete) {
    return null // Will redirect to onboarding
  }

  return <>{children}</>
}
