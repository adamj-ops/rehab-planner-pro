import { NextRequest, NextResponse } from 'next/server'
import { ScopeItem } from '@/types/rehab'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scopeItems, budget, targetROI = 20, strategy = 'flip' } = body

    if (!scopeItems || !budget) {
      return NextResponse.json(
        { error: 'Missing required fields: scopeItems, budget' },
        { status: 400 }
      )
    }

    const items: ScopeItem[] = scopeItems
    const currentCost = items.reduce((sum, item) => sum + item.totalCost, 0)
    const overBudget = currentCost > budget

    if (!overBudget) {
      return NextResponse.json({
        success: true,
        data: {
          optimizedScope: items,
          changes: [],
          originalCost: currentCost,
          optimizedCost: currentCost,
          savings: 0,
          originalROI: items.reduce((sum, item) => sum + item.roiImpact, 0),
          optimizedROI: items.reduce((sum, item) => sum + item.roiImpact, 0),
          message: 'Scope is already within budget'
        }
      })
    }

    // Calculate target reduction
    const targetReduction = currentCost - budget
    
    // Score items by ROI efficiency (ROI impact / cost)
    const scoredItems = items.map(item => ({
      ...item,
      efficiency: item.totalCost > 0 ? item.roiImpact / item.totalCost : 0
    })).sort((a, b) => a.efficiency - b.efficiency) // Least efficient first

    const optimizedScope: ScopeItem[] = []
    const removedItems: ScopeItem[] = []
    let totalReduction = 0

    // Remove/downgrade least efficient items until under budget
    for (const item of scoredItems) {
      if (totalReduction >= targetReduction) {
        optimizedScope.push(item)
        continue
      }

      // Keep critical items (must-have, safety, structural)
      if (item.priority === 'must' || 
          item.category.toLowerCase().includes('safety') ||
          item.category.toLowerCase().includes('structural')) {
        optimizedScope.push(item)
        continue
      }

      // For expensive low-efficiency items, try downgrading first
      if (item.totalCost > 5000 && item.efficiency < 0.01) {
        const downgraded = {
          ...item,
          totalCost: item.totalCost * 0.7, // 30% reduction
          materialCost: item.materialCost * 0.7,
          roiImpact: item.roiImpact * 0.9, // 10% ROI reduction
        }
        optimizedScope.push(downgraded)
        totalReduction += (item.totalCost - downgraded.totalCost)
      } else if (item.priority === 'nice' || item.priority === 'could') {
        // Remove nice-to-have and could-have items
        removedItems.push(item)
        totalReduction += item.totalCost
      } else {
        optimizedScope.push(item)
      }
    }

    const optimizedCost = optimizedScope.reduce((sum, item) => sum + item.totalCost, 0)
    const originalROI = items.reduce((sum, item) => sum + item.roiImpact, 0)
    const optimizedROI = optimizedScope.reduce((sum, item) => sum + item.roiImpact, 0)

    const changes = [
      ...removedItems.map(item => ({
        type: 'removed' as const,
        item: item.itemName,
        costImpact: -item.totalCost,
        roiImpact: -item.roiImpact,
        reason: 'Low ROI efficiency'
      })),
      ...scoredItems
        .filter(original => {
          const opt = optimizedScope.find(o => o.id === original.id)
          return opt && opt.totalCost < original.totalCost
        })
        .map(item => {
          const opt = optimizedScope.find(o => o.id === item.id)!
          return {
            type: 'downgraded' as const,
            item: item.itemName,
            costImpact: -(item.totalCost - opt.totalCost),
            roiImpact: -(item.roiImpact - opt.roiImpact),
            reason: 'Downgraded to mid-range option'
          }
        })
    ]

    return NextResponse.json({
      success: true,
      data: {
        optimizedScope,
        changes,
        originalCost: currentCost,
        optimizedCost,
        savings: currentCost - optimizedCost,
        originalROI,
        optimizedROI,
        roiRetained: (optimizedROI / originalROI) * 100,
        itemsRemoved: removedItems.length,
        message: `Optimized scope to fit budget by removing ${removedItems.length} low-ROI items while retaining ${((optimizedROI / originalROI) * 100).toFixed(1)}% of ROI potential`
      }
    })
  } catch (error) {
    console.error('Error optimizing scope:', error)
    return NextResponse.json(
      { error: 'Failed to optimize scope' },
      { status: 500 }
    )
  }
}

