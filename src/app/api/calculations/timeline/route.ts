import { NextRequest, NextResponse } from 'next/server'
import { ScopeItem, ActionPlanPhase, ActionTask } from '@/types/rehab'
import { CACHE_TTL_SECONDS, cacheKeys, withCache } from '@/server/cache'

export const runtime = 'nodejs'

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

    const data = await withCache({
      key: cacheKeys.computed({ scope: 'timeline', entityId: 'global', inputs: body }),
      ttlSeconds: CACHE_TTL_SECONDS.COMPUTED_FIELDS,
      loader: async () => {
        const includedItems: ScopeItem[] = scopeItems.filter((item: ScopeItem) => item.included)

        if (includedItems.length === 0) {
          return {
            phases: [],
            totalDays: 0,
            criticalPath: [],
            warnings: [],
          }
        }

        // Group items by phase
        const phaseMap = new Map<number, ScopeItem[]>()
        includedItems.forEach((item) => {
          if (!phaseMap.has(item.phase)) {
            phaseMap.set(item.phase, [])
          }
          phaseMap.get(item.phase)?.push(item)
        })

        // Build phases with timeline
        const phases: ActionPlanPhase[] = []
        let currentDay = 1
        const taskDays = new Map<string, { start: number; end: number }>()

        // Calculate earliest start times using topological sort
        const calculateTaskTiming = (item: ScopeItem): { start: number; end: number } => {
          // If already calculated, return cached value
          if (taskDays.has(item.id)) {
            return taskDays.get(item.id)!
          }

          // Calculate based on dependencies
          let earliestStart = currentDay

          if (item.dependsOn.length > 0) {
            // Find the latest end time of all dependencies
            item.dependsOn.forEach((depId) => {
              const dep = includedItems.find((i) => i.id === depId)
              if (dep) {
                const depTiming = calculateTaskTiming(dep)
                earliestStart = Math.max(earliestStart, depTiming.end + 1)
              }
            })
          }

          const timing = {
            start: earliestStart,
            end: earliestStart + item.daysRequired - 1,
          }

          taskDays.set(item.id, timing)
          return timing
        }

        // Calculate all task timings
        includedItems.forEach((item) => calculateTaskTiming(item))

        // Build phases
        Array.from(phaseMap.keys())
          .sort((a, b) => a - b)
          .forEach((phaseNum) => {
            const phaseItems = phaseMap.get(phaseNum) || []

            const tasks: ActionTask[] = phaseItems.map((item) => {
              const timing = taskDays.get(item.id) || { start: currentDay, end: currentDay }

              return {
                id: item.id,
                name: item.itemName,
                contractor: determineContractor(item),
                duration: item.daysRequired,
                cost: item.totalCost,
                dependencies: item.dependsOn,
                priority: item.priority === 'must' ? 'critical' : 'high',
              }
            })

            const phaseStartDay = Math.min(
              ...phaseItems.map((item) => taskDays.get(item.id)?.start || currentDay)
            )
            const phaseEndDay = Math.max(
              ...phaseItems.map((item) => taskDays.get(item.id)?.end || currentDay)
            )
            const phaseCost = phaseItems.reduce((sum, item) => sum + item.totalCost, 0)

            phases.push({
              id: `phase-${phaseNum}`,
              name: `Phase ${phaseNum}`,
              startDay: phaseStartDay,
              endDay: phaseEndDay,
              cost: phaseCost,
              tasks,
              dependencies: [],
              criticalPath: false,
              warnings: [],
            })

            currentDay = phaseEndDay + 1
          })

        // Calculate total project duration
        const totalDays = Math.max(...Array.from(taskDays.values()).map((t) => t.end), 0)

        // Calculate critical path
        const criticalPath = calculateCriticalPathTasks(includedItems, taskDays)

        // Mark phases on critical path
        phases.forEach((phase) => {
          const hasCriticalTask = phase.tasks.some((task) => criticalPath.includes(task.id))
          phase.criticalPath = hasCriticalTask
        })

        // Detect warnings
        const warnings: string[] = []

        // Check for parallel tasks with same contractor
        const contractorSchedule = new Map<string, Array<{ taskId: string; start: number; end: number }>>()
        includedItems.forEach((item) => {
          const contractor = determineContractor(item)
          const timing = taskDays.get(item.id)!

          if (!contractorSchedule.has(contractor)) {
            contractorSchedule.set(contractor, [])
          }
          contractorSchedule.get(contractor)?.push({
            taskId: item.id,
            start: timing.start,
            end: timing.end,
          })
        })

        contractorSchedule.forEach((tasks, contractor) => {
          for (let i = 0; i < tasks.length; i++) {
            for (let j = i + 1; j < tasks.length; j++) {
              if (tasks[i].start <= tasks[j].end && tasks[j].start <= tasks[i].end) {
                warnings.push(`${contractor} has overlapping tasks`)
                break
              }
            }
          }
        })

        return {
          phases,
          totalDays,
          criticalPath,
          warnings,
          taskTimeline: Array.from(taskDays.entries()).map(([id, timing]) => ({
            taskId: id,
            ...timing,
          })),
        }
      },
    })

    return NextResponse.json({
      success: true,
      data: {
        ...data,
      }
    })
  } catch (error) {
    console.error('Error calculating timeline:', error)
    return NextResponse.json(
      { error: 'Failed to calculate timeline' },
      { status: 500 }
    )
  }
}

// Helper function to determine contractor
function determineContractor(item: ScopeItem): string {
  const category = item.category.toLowerCase()
  
  if (category.includes('electrical')) return 'Electrician'
  if (category.includes('plumbing')) return 'Plumber'
  if (category.includes('hvac')) return 'HVAC Technician'
  if (category.includes('roofing')) return 'Roofer'
  if (category.includes('flooring')) return 'Flooring Specialist'
  if (category.includes('paint')) return 'Painter'
  if (category.includes('kitchen') || category.includes('bath')) return 'General Contractor'
  
  return 'General Contractor'
}

// Calculate critical path tasks
function calculateCriticalPathTasks(
  items: ScopeItem[],
  taskDays: Map<string, { start: number; end: number }>
): string[] {
  const criticalPath: string[] = []
  
  // Find the task that ends last
  let lastTask: ScopeItem | null = null
  let latestEnd = 0
  
  items.forEach(item => {
    const timing = taskDays.get(item.id)
    if (timing && timing.end > latestEnd) {
      latestEnd = timing.end
      lastTask = item
    }
  })
  
  if (!lastTask) return []
  
  // Trace back through dependencies
  const traceCriticalPath = (item: ScopeItem) => {
    criticalPath.push(item.id)
    
    if (item.dependsOn.length > 0) {
      // Find the dependency that ends latest
      let latestDep: ScopeItem | null = null
      let latestDepEnd = 0
      
      item.dependsOn.forEach(depId => {
        const dep = items.find(i => i.id === depId)
        if (dep) {
          const timing = taskDays.get(dep.id)
          if (timing && timing.end > latestDepEnd) {
            latestDepEnd = timing.end
            latestDep = dep
          }
        }
      })
      
      if (latestDep) {
        traceCriticalPath(latestDep)
      }
    }
  }
  
  traceCriticalPath(lastTask)
  
  return criticalPath
}

