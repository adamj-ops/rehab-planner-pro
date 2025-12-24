import { NextRequest, NextResponse } from 'next/server'
import { ScopeItem } from '@/types/rehab'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scopeItems, contingencyPercentage = 10 } = body

    if (!scopeItems || !Array.isArray(scopeItems)) {
      return NextResponse.json(
        { error: 'Invalid scope items provided' },
        { status: 400 }
      )
    }

    // Filter included items
    const includedItems: ScopeItem[] = scopeItems.filter((item: ScopeItem) => item.included)

    // Calculate totals
    const totalMaterialCost = includedItems.reduce((sum, item) => sum + item.materialCost, 0)
    const totalLaborCost = includedItems.reduce((sum, item) => sum + item.laborCost, 0)
    const subtotal = totalMaterialCost + totalLaborCost
    const contingency = subtotal * (contingencyPercentage / 100)
    const totalCost = subtotal + contingency

    // Calculate timeline
    const totalDays = Math.max(...includedItems.map(item => {
      // Calculate end day based on dependencies
      const maxDepDay = item.dependsOn.length > 0
        ? Math.max(...item.dependsOn.map(depId => {
            const depItem = includedItems.find(i => i.id === depId)
            return depItem ? depItem.daysRequired : 0
          }))
        : 0
      return maxDepDay + item.daysRequired
    }), 0)

    // Calculate category breakdown
    const categoryBreakdown: Record<string, number> = {}
    includedItems.forEach(item => {
      if (!categoryBreakdown[item.category]) {
        categoryBreakdown[item.category] = 0
      }
      categoryBreakdown[item.category] += item.totalCost
    })

    // Calculate ROI impact
    const totalROI = includedItems.reduce((sum, item) => sum + item.roiImpact, 0)

    const estimate = {
      totalCost,
      materialCost: totalMaterialCost,
      laborCost: totalLaborCost,
      contingency,
      totalDays,
      itemCount: includedItems.length,
      categoryBreakdown,
      roiImpact: totalROI,
      breakdown: {
        subtotal,
        contingencyPercentage,
        contingencyAmount: contingency,
        total: totalCost
      },
      perSquareFoot: null, // Will be calculated if squareFeet provided
    }

    return NextResponse.json({
      success: true,
      data: estimate
    })
  } catch (error) {
    console.error('Error calculating estimate:', error)
    return NextResponse.json(
      { error: 'Failed to calculate estimate' },
      { status: 500 }
    )
  }
}

