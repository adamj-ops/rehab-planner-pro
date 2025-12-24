import { NextRequest, NextResponse } from 'next/server'
import { recommendationEngine } from '@/lib/ai/recommendation-engine'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { project, scopeItems, assessments } = body

    if (!project || !scopeItems) {
      return NextResponse.json(
        { error: 'Missing required fields: project, scopeItems' },
        { status: 400 }
      )
    }

    // Generate recommendations using rule-based engine
    const recommendations = recommendationEngine.generateRecommendations(
      project,
      scopeItems,
      assessments
    )

    // Calculate impact summary
    const totalCostImpact = recommendations.reduce((sum, rec) => sum + rec.estimatedCostImpact, 0)
    const totalROIImpact = recommendations.reduce((sum, rec) => sum + rec.roiImpact, 0)
    const totalTimeImpact = recommendations.reduce((sum, rec) => sum + rec.timeImpactDays, 0)

    // Group by type
    const byType = {
      add: recommendations.filter(r => r.type === 'add'),
      remove: recommendations.filter(r => r.type === 'remove'),
      upgrade: recommendations.filter(r => r.type === 'upgrade'),
      downgrade: recommendations.filter(r => r.type === 'downgrade'),
      timing: recommendations.filter(r => r.type === 'timing'),
      costSavings: recommendations.filter(r => r.type === 'cost-savings'),
    }

    // Group by priority (confidence level)
    const byPriority = {
      high: recommendations.filter(r => r.confidence >= 0.8),
      medium: recommendations.filter(r => r.confidence >= 0.6 && r.confidence < 0.8),
      low: recommendations.filter(r => r.confidence < 0.6),
    }

    return NextResponse.json({
      success: true,
      data: {
        recommendations,
        summary: {
          totalRecommendations: recommendations.length,
          potentialSavings: totalCostImpact < 0 ? Math.abs(totalCostImpact) : 0,
          potentialCosts: totalCostImpact > 0 ? totalCostImpact : 0,
          roiImprovement: totalROIImpact,
          timeReduction: totalTimeImpact < 0 ? Math.abs(totalTimeImpact) : 0,
          timeIncrease: totalTimeImpact > 0 ? totalTimeImpact : 0,
        },
        byType,
        byPriority,
        topRecommendations: recommendations.slice(0, 5)
      }
    })
  } catch (error) {
    console.error('Error generating recommendations:', error)
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    )
  }
}

