import { NextRequest, NextResponse } from 'next/server'
import { ScopeItem } from '@/types/rehab'

interface PriorityScore {
  itemId: string
  itemName: string
  urgencyScore: number // 0-100
  roiScore: number // 0-100
  costEfficiencyScore: number // 0-100
  overallScore: number // 0-100
  priority: 'critical' | 'high' | 'medium' | 'low'
  category: 'safety' | 'structural' | 'systems' | 'cosmetic' | 'optional'
  recommendation: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scopeItems, propertyValue, investmentStrategy = 'flip' } = body

    if (!scopeItems || !Array.isArray(scopeItems)) {
      return NextResponse.json(
        { error: 'Invalid scope items provided' },
        { status: 400 }
      )
    }

    const scores: PriorityScore[] = scopeItems.map((item: ScopeItem) => {
      // Calculate Urgency Score (0-100)
      let urgencyScore = 50 // Base score
      
      // Priority level impact
      switch (item.priority) {
        case 'must':
          urgencyScore += 30
          break
        case 'should':
          urgencyScore += 15
          break
        case 'could':
          urgencyScore -= 10
          break
        case 'nice':
          urgencyScore -= 25
          break
      }
      
      // Category impact on urgency
      const category = getCategoryFromItem(item)
      switch (category) {
        case 'safety':
          urgencyScore += 20
          break
        case 'structural':
          urgencyScore += 15
          break
        case 'systems':
          urgencyScore += 10
          break
        case 'cosmetic':
          urgencyScore -= 5
          break
        case 'optional':
          urgencyScore -= 15
          break
      }
      
      // Dependencies increase urgency
      urgencyScore += item.dependsOn.length * 5
      
      // Clamp to 0-100
      urgencyScore = Math.max(0, Math.min(100, urgencyScore))

      // Calculate ROI Score (0-100)
      // Normalize ROI impact to 0-100 scale
      const roiScore = Math.max(0, Math.min(100, item.roiImpact))

      // Calculate Cost Efficiency Score (0-100)
      // Lower cost relative to ROI impact is better
      const costToRoiRatio = item.roiImpact > 0 
        ? (item.totalCost / item.roiImpact) 
        : Infinity
      
      let costEfficiencyScore = 50
      if (costToRoiRatio < 100) costEfficiencyScore = 90
      else if (costToRoiRatio < 200) costEfficiencyScore = 75
      else if (costToRoiRatio < 500) costEfficiencyScore = 60
      else if (costToRoiRatio < 1000) costEfficiencyScore = 40
      else costEfficiencyScore = 20

      // Calculate Overall Score (weighted average)
      const weights = {
        urgency: investmentStrategy === 'flip' ? 0.3 : 0.4,
        roi: investmentStrategy === 'flip' ? 0.5 : 0.3,
        costEfficiency: 0.2
      }
      
      const overallScore = 
        (urgencyScore * weights.urgency) +
        (roiScore * weights.roi) +
        (costEfficiencyScore * weights.costEfficiency)

      // Determine final priority
      let finalPriority: 'critical' | 'high' | 'medium' | 'low'
      if (overallScore >= 80 || category === 'safety') finalPriority = 'critical'
      else if (overallScore >= 60) finalPriority = 'high'
      else if (overallScore >= 40) finalPriority = 'medium'
      else finalPriority = 'low'

      // Generate recommendation
      const recommendation = generateRecommendation(
        item,
        category,
        finalPriority,
        urgencyScore,
        roiScore,
        costEfficiencyScore
      )

      return {
        itemId: item.id,
        itemName: item.itemName,
        urgencyScore,
        roiScore,
        costEfficiencyScore,
        overallScore,
        priority: finalPriority,
        category,
        recommendation
      }
    })

    // Sort by overall score (highest first)
    scores.sort((a, b) => b.overallScore - a.overallScore)

    // Add matrix quadrants
    const matrix = categor izeIntoMatrix(scores)

    return NextResponse.json({
      success: true,
      data: {
        scores,
        matrix,
        statistics: {
          totalItems: scores.length,
          critical: scores.filter(s => s.priority === 'critical').length,
          high: scores.filter(s => s.priority === 'high').length,
          medium: scores.filter(s => s.priority === 'medium').length,
          low: scores.filter(s => s.priority === 'low').length,
          averageScore: scores.reduce((sum, s) => sum + s.overallScore, 0) / scores.length
        }
      }
    })
  } catch (error) {
    console.error('Error calculating priority scores:', error)
    return NextResponse.json(
      { error: 'Failed to calculate priority scores' },
      { status: 500 }
    )
  }
}

// Helper functions
function getCategoryFromItem(item: ScopeItem): 'safety' | 'structural' | 'systems' | 'cosmetic' | 'optional' {
  const category = item.category.toLowerCase()
  
  if (category.includes('electrical') || category.includes('plumbing') || category.includes('hvac')) {
    return 'systems'
  }
  if (category.includes('foundation') || category.includes('roof') || category.includes('structural')) {
    return 'structural'
  }
  if (category.includes('safety') || category.includes('code')) {
    return 'safety'
  }
  if (category.includes('paint') || category.includes('flooring') || category.includes('cosmetic')) {
    return 'cosmetic'
  }
  
  return 'optional'
}

function generateRecommendation(
  item: ScopeItem,
  category: string,
  priority: string,
  urgencyScore: number,
  roiScore: number,
  costEfficiencyScore: number
): string {
  if (category === 'safety') {
    return 'Must be completed for safety compliance - highest priority'
  }
  
  if (priority === 'critical') {
    if (roiScore > 70) {
      return 'High ROI and urgent - prioritize in Phase 1'
    }
    return 'Critical for project success - schedule early'
  }
  
  if (priority === 'high') {
    if (costEfficiencyScore > 70) {
      return 'Good value for money - include in main scope'
    }
    if (roiScore > 60) {
      return 'Strong ROI potential - recommended for inclusion'
    }
    return 'Important but not critical - Phase 2 or 3'
  }
  
  if (priority === 'medium') {
    if (item.totalCost < 1000) {
      return 'Low cost item - consider including if budget allows'
    }
    return 'Optional enhancement - evaluate based on budget'
  }
  
  if (costEfficiencyScore < 40) {
    return 'Low cost efficiency - consider removing or downgrading'
  }
  
  return 'Low priority - defer or eliminate if over budget'
}

function categorizeIntoMatrix(scores: PriorityScore[]) {
  return {
    highUrgencyHighROI: scores.filter(s => s.urgencyScore >= 60 && s.roiScore >= 60),
    highUrgencyLowROI: scores.filter(s => s.urgencyScore >= 60 && s.roiScore < 60),
    lowUrgencyHighROI: scores.filter(s => s.urgencyScore < 60 && s.roiScore >= 60),
    lowUrgencyLowROI: scores.filter(s => s.urgencyScore < 60 && s.roiScore < 60)
  }
}

