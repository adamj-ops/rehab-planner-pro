'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Home, Calculator, TrendingUp, Target } from 'lucide-react'
import { useAuth } from '@/lib/auth/auth-context'

export default function HomePage() {
  const router = useRouter()
  const { user, loading } = useAuth()

  useEffect(() => {
    if (!loading && user) {
      router.push('/dashboard')
    }
  }, [user, loading, router])

  const handleGetStarted = () => {
    if (user) {
      router.push('/dashboard')
    } else {
      router.push('/auth')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect in useEffect
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold text-gray-900 mb-6">
            Strategic Rehab Estimator
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Build data-driven renovation scopes that maximize ROI. 
            Go beyond simple cost calculations with AI-powered insights, 
            market analysis, and strategic optimization.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calculator className="w-8 h-8 text-blue-600" />
            </div>
            <CardTitle className="mb-2">Smart Cost Estimation</CardTitle>
            <p className="text-gray-600">
              AI-powered scope building with market-based pricing and ROI optimization
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-green-600" />
            </div>
            <CardTitle className="mb-2">Strategic Insights</CardTitle>
            <p className="text-gray-600">
              Data-driven recommendations based on comparable properties and market trends
            </p>
          </Card>

          <Card className="text-center p-6">
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Target className="w-8 h-8 text-purple-600" />
            </div>
            <CardTitle className="mb-2">Execution Planning</CardTitle>
            <p className="text-gray-600">
              Phased timelines with dependency mapping and critical path analysis
            </p>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            size="lg" 
            className="text-lg px-8 py-4"
            onClick={handleGetStarted}
          >
            Get Started
          </Button>
        </div>
      </div>
    </div>
  )
}
