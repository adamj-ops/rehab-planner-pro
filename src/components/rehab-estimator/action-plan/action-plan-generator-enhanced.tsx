'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Workflow,
  List,
  BarChart3,
  RefreshCw,
  Download,
  AlertTriangle,
  Zap,
  ArrowRight,
  ArrowLeft
} from 'lucide-react'
import { RehabProject, ActionPlanPhase } from '@/types/rehab'
import { ActionPlanFlow } from './action-plan-flow'
import { cn } from '@/lib/utils'

interface ActionPlanGeneratorProps {
  project: Partial<RehabProject>
  onNext: (data: any) => void
  onBack: () => void
  currentStep: number
  totalSteps: number
}

export function ActionPlanGeneratorEnhanced({ 
  project, 
  onNext, 
  onBack,
  currentStep,
  totalSteps 
}: ActionPlanGeneratorProps) {
  const [viewMode, setViewMode] = useState<'flow' | 'list' | 'gantt'>('flow')
  const [phases, setPhases] = useState<ActionPlanPhase[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [criticalPath, setCriticalPath] = useState<string[]>([])
  const [conflicts, setConflicts] = useState<any[]>([])

  // Generate action plan from scope items
  useEffect(() => {
    if (project.scopeItems && project.scopeItems.length > 0) {
      generateTimeline()
    }
  }, [project.scopeItems])

  const generateTimeline = async () => {
    setIsLoading(true)
    setError(null)

    try {
      // Call timeline API
      const response = await fetch('/api/calculations/timeline', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeItems: project.scopeItems
        })
      })

      if (!response.ok) throw new Error('Failed to generate timeline')

      const data = await response.json()
      
      if (data.success) {
        setPhases(data.data.phases)
        setConflicts(data.data.warnings || [])
        
        // Get critical path
        await getCriticalPath()
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate timeline')
    } finally {
      setIsLoading(false)
    }
  }

  const getCriticalPath = async () => {
    try {
      const response = await fetch('/api/calculations/critical-path', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeItems: project.scopeItems
        })
      })

      if (!response.ok) return

      const data = await response.json()
      
      if (data.success) {
        setCriticalPath(data.data.criticalPath.map((cp: any) => cp.taskId))
      }
    } catch (err) {
      console.error('Failed to calculate critical path:', err)
    }
  }

  const handleRegenerateWithOptimization = async () => {
    setIsGenerating(true)

    try {
      // This would call an AI optimization endpoint in the future
      // For now, just regenerate
      await generateTimeline()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to optimize timeline')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleNext = () => {
    // Save timeline data to project
    onNext({
      actionPlan: phases,
      criticalPath,
      totalDays: phases.length > 0 
        ? Math.max(...phases.map(p => p.endDay)) 
        : 0
    })
  }

  if (!project.scopeItems || project.scopeItems.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Action Plan Generator</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              No scope items found. Please go back and add items to your project scope.
            </AlertDescription>
          </Alert>
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={onBack}>
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Action Plan & Timeline</CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Visual project scheduling with dependency management
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleRegenerateWithOptimization}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Optimize Timeline
                  </>
                )}
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  // Export functionality
                  console.log('Export timeline')
                }}
              >
                <Download className="w-4 h-4 mr-2" />
                Export
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* View Mode Tabs */}
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList className="grid w-full max-w-md grid-cols-3">
              <TabsTrigger value="flow">
                <Workflow className="w-4 h-4 mr-2" />
                Flow View
              </TabsTrigger>
              <TabsTrigger value="list">
                <List className="w-4 h-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="gantt">
                <BarChart3 className="w-4 h-4 mr-2" />
                Gantt Chart
              </TabsTrigger>
            </TabsList>

            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Conflicts Warning */}
            {conflicts.length > 0 && (
              <Alert className="mt-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>{conflicts.length} scheduling conflict{conflicts.length !== 1 ? 's' : ''} detected:</strong>
                  <ul className="list-disc list-inside mt-2">
                    {conflicts.slice(0, 3).map((warning, idx) => (
                      <li key={idx} className="text-sm">{warning}</li>
                    ))}
                  </ul>
                  {conflicts.length > 3 && (
                    <p className="text-sm mt-1">...and {conflicts.length - 3} more</p>
                  )}
                </AlertDescription>
              </Alert>
            )}

            {/* Flow View */}
            <TabsContent value="flow" className="mt-4">
              {isLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-[600px] w-full" />
                </div>
              ) : (
                <ActionPlanFlow 
                  project={project}
                  phases={phases}
                  onUpdatePhases={setPhases}
                />
              )}
            </TabsContent>

            {/* List View */}
            <TabsContent value="list" className="mt-4">
              {isLoading ? (
                <Skeleton className="h-96 w-full" />
              ) : (
                <div className="space-y-4">
                  {phases.map((phase, idx) => (
                    <Card key={phase.id}>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <h3 className="font-semibold">{phase.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              Day {phase.startDay} - {phase.endDay} ({phase.endDay - phase.startDay + 1} days)
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">${phase.cost.toLocaleString()}</p>
                            <Badge variant={phase.criticalPath ? "destructive" : "secondary"}>
                              {phase.criticalPath ? "Critical Path" : `${phase.tasks.length} tasks`}
                            </Badge>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {phase.tasks.map((task) => (
                            <div 
                              key={task.id}
                              className={cn(
                                "flex items-center justify-between p-3 rounded-lg border",
                                criticalPath.includes(task.id) && "border-red-500 bg-red-50 dark:bg-red-950"
                              )}
                            >
                              <div className="flex-1">
                                <p className="font-medium">{task.name}</p>
                                <p className="text-sm text-muted-foreground">{task.contractor}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <div className="text-right">
                                  <p className="text-sm">{task.duration} days</p>
                                  <p className="text-sm text-muted-foreground">${task.cost.toLocaleString()}</p>
                                </div>
                                <Badge variant={task.priority === 'critical' ? 'destructive' : 'secondary'}>
                                  {task.priority}
                                </Badge>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </TabsContent>

            {/* Gantt Chart View */}
            <TabsContent value="gantt" className="mt-4">
              <Card>
                <CardContent className="p-6">
                  <div className="text-center text-muted-foreground py-12">
                    <BarChart3 className="w-12 h-12 mx-auto mb-4" />
                    <p>Gantt chart view coming soon</p>
                    <p className="text-sm">Use Flow View for interactive timeline visualization</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Summary Stats */}
      {phases.length > 0 && !isLoading && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Project Summary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-4 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Total Duration</p>
                <p className="text-2xl font-bold">
                  {Math.max(...phases.map(p => p.endDay))} days
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Cost</p>
                <p className="text-2xl font-bold">
                  ${phases.reduce((sum, p) => sum + p.cost, 0).toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Tasks</p>
                <p className="text-2xl font-bold">
                  {phases.reduce((sum, p) => sum + p.tasks.length, 0)}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Critical Tasks</p>
                <p className="text-2xl font-bold text-red-600">
                  {criticalPath.length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button onClick={handleNext} disabled={isLoading || phases.length === 0}>
          Next: Final Review
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}

