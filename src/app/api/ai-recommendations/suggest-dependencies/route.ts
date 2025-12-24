import { NextRequest, NextResponse } from 'next/server'
import { ScopeItem } from '@/types/rehab'

/**
 * Common dependency rules for construction tasks
 */
const DEPENDENCY_RULES: Record<string, string[]> = {
  // Structural must come first
  'foundation': [],
  'framing': ['foundation'],
  'roof': ['framing'],
  
  // Systems depend on framing/structural
  'electrical rough-in': ['framing'],
  'plumbing rough-in': ['framing'],
  'hvac rough-in': ['framing', 'roof'],
  
  // Insulation after rough-ins
  'insulation': ['electrical rough-in', 'plumbing rough-in', 'hvac rough-in'],
  
  // Drywall after insulation
  'drywall': ['insulation'],
  'drywall finishing': ['drywall'],
  
  // Paint after drywall
  'paint': ['drywall finishing'],
  'interior paint': ['drywall finishing'],
  'exterior paint': ['roof'],
  
  // Flooring after paint
  'flooring': ['paint'],
  'hardwood': ['paint'],
  'tile': ['paint'],
  'carpet': ['paint'],
  
  // Fixtures after finishes
  'electrical fixtures': ['paint', 'electrical rough-in'],
  'plumbing fixtures': ['paint', 'plumbing rough-in'],
  'light fixtures': ['paint', 'electrical rough-in'],
  
  // Kitchen/Bath depend on systems + finishes
  'kitchen cabinets': ['paint', 'flooring'],
  'kitchen countertops': ['kitchen cabinets'],
  'bathroom vanity': ['paint', 'flooring'],
  
  // Final items
  'appliances': ['kitchen cabinets', 'kitchen countertops'],
  'landscaping': ['exterior paint'],
  'final cleaning': ['flooring', 'paint'],
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { scopeItems } = body

    if (!scopeItems || !Array.isArray(scopeItems)) {
      return NextResponse.json(
        { error: 'Invalid scope items provided' },
        { status: 400 }
      )
    }

    const items: ScopeItem[] = scopeItems
    const suggestions: Array<{
      taskId: string
      taskName: string
      currentDependencies: string[]
      suggestedDependencies: string[]
      newDependencies: string[]
      reasoning: string
      confidence: number
    }> = []

    items.forEach(item => {
      const itemKey = item.itemName.toLowerCase()
      const itemCategory = item.category.toLowerCase()
      
      // Find matching rules
      const matchingRules: string[] = []
      let matchedBy = ''
      
      // Check exact name match
      for (const [ruleKey, deps] of Object.entries(DEPENDENCY_RULES)) {
        if (itemKey.includes(ruleKey) || ruleKey.includes(itemKey)) {
          matchingRules.push(...deps)
          matchedBy = `name: ${ruleKey}`
          break
        }
      }
      
      // Check category match if no name match
      if (matchingRules.length === 0) {
        for (const [ruleKey, deps] of Object.entries(DEPENDENCY_RULES)) {
          if (itemCategory.includes(ruleKey) || ruleKey.includes(itemCategory)) {
            matchingRules.push(...deps)
            matchedBy = `category: ${ruleKey}`
            break
          }
        }
      }
      
      if (matchingRules.length > 0) {
        // Find actual scope items that match the rule dependencies
        const suggestedDepIds: string[] = []
        matchingRules.forEach(depRule => {
          const matchingItem = items.find(i => 
            i.itemName.toLowerCase().includes(depRule) ||
            i.category.toLowerCase().includes(depRule)
          )
          if (matchingItem && matchingItem.id !== item.id) {
            suggestedDepIds.push(matchingItem.id)
          }
        })
        
        // Filter to only new dependencies
        const newDeps = suggestedDepIds.filter(id => !item.dependsOn.includes(id))
        
        if (newDeps.length > 0) {
          suggestions.push({
            taskId: item.id,
            taskName: item.itemName,
            currentDependencies: item.dependsOn,
            suggestedDependencies: suggestedDepIds,
            newDependencies: newDeps,
            reasoning: `Based on construction best practices (${matchedBy}), this task should depend on: ${newDeps.map(id => items.find(i => i.id === id)?.itemName).join(', ')}`,
            confidence: 0.85
          })
        }
      }
    })

    // Also check for logical dependencies based on category relationships
    const categoryDeps = this.suggestCategoryDependencies(items)
    suggestions.push(...categoryDeps)

    return NextResponse.json({
      success: true,
      data: {
        suggestions,
        totalSuggestions: suggestions.length,
        highConfidence: suggestions.filter(s => s.confidence >= 0.8).length,
        summary: {
          tasksWithSuggestions: suggestions.length,
          totalNewDependencies: suggestions.reduce((sum, s) => sum + s.newDependencies.length, 0),
        }
      }
    })
  } catch (error) {
    console.error('Error suggesting dependencies:', error)
    return NextResponse.json(
      { error: 'Failed to suggest dependencies' },
      { status: 500 }
    )
  }
}

// Helper function for suggesting category-based dependencies
function suggestCategoryDependencies(items: ScopeItem[]) {
  const suggestions: any[] = []

  // Systems should depend on structural
  const structural = items.filter(i =>
    i.category.toLowerCase().includes('structural') ||
    i.category.toLowerCase().includes('framing')
  )

  const systems = items.filter(i =>
    i.category.toLowerCase().includes('electrical') ||
    i.category.toLowerCase().includes('plumbing') ||
    i.category.toLowerCase().includes('hvac')
  )

  systems.forEach(system => {
    structural.forEach(struct => {
      if (!system.dependsOn.includes(struct.id)) {
        const existing = suggestions.find(s => s.taskId === system.id)
        if (existing) {
          existing.newDependencies.push(struct.id)
        } else {
          suggestions.push({
            taskId: system.id,
            taskName: system.itemName,
            currentDependencies: system.dependsOn,
            suggestedDependencies: [struct.id],
            newDependencies: [struct.id],
            reasoning: `${system.category} work typically requires ${struct.category} to be completed first`,
            confidence: 0.75
          })
        }
      }
    })
  })

  return suggestions
}

