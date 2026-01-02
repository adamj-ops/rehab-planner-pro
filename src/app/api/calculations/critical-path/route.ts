import { NextRequest, NextResponse } from 'next/server'
import { ScopeItem } from '@/types/rehab'
import { CACHE_TTL_SECONDS, cacheKeys, withCache } from '@/server/cache'

export const runtime = 'nodejs'

interface TaskTiming {
  taskId: string
  taskName: string
  earliestStart: number
  earliestFinish: number
  latestStart: number
  latestFinish: number
  slack: number
  isCritical: boolean
  duration: number
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

    const data = await withCache({
      key: cacheKeys.computed({ scope: 'critical-path', entityId: 'global', inputs: body }),
      ttlSeconds: CACHE_TTL_SECONDS.COMPUTED_FIELDS,
      loader: async () => {
        const includedItems: ScopeItem[] = scopeItems.filter((item: ScopeItem) => item.included)

        if (includedItems.length === 0) {
          return {
            criticalPath: [],
            taskTimings: [],
            projectDuration: 0,
            criticalPathDuration: 0,
            totalSlack: 0,
            bottlenecks: [],
            statistics: {
              totalTasks: 0,
              criticalTasks: 0,
              nonCriticalTasks: 0,
              averageSlack: 0,
              maxSlack: 0,
              criticalPathPercentage: 0,
            },
          }
        }

        // Build dependency map
        const taskMap = new Map<string, ScopeItem>()
        const successors = new Map<string, string[]>()
        const predecessors = new Map<string, string[]>()

        includedItems.forEach((item) => {
          taskMap.set(item.id, item)
          successors.set(item.id, [])
          predecessors.set(item.id, item.dependsOn)
        })

        // Build successor relationships
        includedItems.forEach((item) => {
          item.dependsOn.forEach((depId) => {
            if (successors.has(depId)) {
              successors.get(depId)!.push(item.id)
            }
          })
        })

        // Forward pass - calculate earliest start/finish
        const earliestStart = new Map<string, number>()
        const earliestFinish = new Map<string, number>()

        const calculateEarliest = (taskId: string): number => {
          if (earliestFinish.has(taskId)) {
            return earliestFinish.get(taskId)!
          }

          const task = taskMap.get(taskId)!
          const deps = predecessors.get(taskId) || []

          let es = 1 // Earliest start
          if (deps.length > 0) {
            es = Math.max(...deps.map((depId) => calculateEarliest(depId) + 1))
          }

          const ef = es + task.daysRequired - 1 // Earliest finish

          earliestStart.set(taskId, es)
          earliestFinish.set(taskId, ef)

          return ef
        }

        // Calculate earliest times for all tasks
        includedItems.forEach((item) => calculateEarliest(item.id))

        // Find project completion time
        const projectDuration = Math.max(...Array.from(earliestFinish.values()))

        // Backward pass - calculate latest start/finish
        const latestStart = new Map<string, number>()
        const latestFinish = new Map<string, number>()

        // Find end nodes (tasks with no successors)
        const endNodes = includedItems.filter((item) => {
          const succs = successors.get(item.id) || []
          return succs.length === 0
        })

        // Initialize end nodes with project duration
        endNodes.forEach((item) => {
          latestFinish.set(item.id, projectDuration)
          latestStart.set(item.id, projectDuration - item.daysRequired + 1)
        })

        const calculateLatest = (taskId: string): number => {
          if (latestStart.has(taskId)) {
            return latestStart.get(taskId)!
          }

          const task = taskMap.get(taskId)!
          const succs = successors.get(taskId) || []

          let lf = projectDuration // Latest finish
          if (succs.length > 0) {
            lf = Math.min(
              ...succs.map((succId) => {
                const succLs = calculateLatest(succId)
                return succLs - 1
              })
            )
          }

          const ls = lf - task.daysRequired + 1 // Latest start

          latestFinish.set(taskId, lf)
          latestStart.set(taskId, ls)

          return ls
        }

        // Calculate latest times for all tasks
        includedItems.forEach((item) => calculateLatest(item.id))

        // Calculate slack and identify critical path
        const taskTimings: TaskTiming[] = includedItems.map((item) => {
          const es = earliestStart.get(item.id) || 1
          const ef = earliestFinish.get(item.id) || 1
          const ls = latestStart.get(item.id) || 1
          const lf = latestFinish.get(item.id) || 1
          const slack = ls - es

          return {
            taskId: item.id,
            taskName: item.itemName,
            earliestStart: es,
            earliestFinish: ef,
            latestStart: ls,
            latestFinish: lf,
            slack,
            isCritical: slack === 0,
            duration: item.daysRequired,
          }
        })

        // Extract critical path
        const criticalPath = taskTimings
          .filter((t) => t.isCritical)
          .sort((a, b) => a.earliestStart - b.earliestStart)
          .map((t) => ({
            taskId: t.taskId,
            taskName: t.taskName,
            start: t.earliestStart,
            end: t.earliestFinish,
            duration: t.duration,
          }))

        // Calculate total slack
        const totalSlack = taskTimings.reduce((sum, t) => sum + t.slack, 0)

        // Find bottlenecks (tasks with dependencies that could delay project)
        const bottlenecks = taskTimings
          .filter((t) => !t.isCritical && t.slack < 3) // Near-critical
          .map((t) => ({
            taskId: t.taskId,
            taskName: t.taskName,
            slack: t.slack,
            warning: `Only ${t.slack} day${t.slack !== 1 ? 's' : ''} of buffer`,
          }))

        return {
          criticalPath,
          taskTimings,
          projectDuration,
          criticalPathDuration: criticalPath.reduce((sum, t) => sum + t.duration, 0),
          totalSlack,
          bottlenecks,
          statistics: {
            totalTasks: taskTimings.length,
            criticalTasks: criticalPath.length,
            nonCriticalTasks: taskTimings.length - criticalPath.length,
            averageSlack: totalSlack / taskTimings.length,
            maxSlack: Math.max(...taskTimings.map((t) => t.slack)),
            criticalPathPercentage: (criticalPath.length / taskTimings.length) * 100,
          },
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
    console.error('Error calculating critical path:', error)
    return NextResponse.json(
      { error: 'Failed to calculate critical path' },
      { status: 500 }
    )
  }
}

