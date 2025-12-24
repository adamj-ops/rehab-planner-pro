'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Calendar,
  Clock,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  Play,
  Pause,
  Square,
  Zap,
  Network
} from 'lucide-react'
import { RehabProject, ScopeItem, ActionPlanPhase, ActionTask } from '@/types/rehab'
import { cn } from '@/lib/utils'
import dynamic from 'next/dynamic'

// Lazy load the flow component for better performance
const RenovationDependencyFlow = dynamic(
  () => import('../flow/renovation-dependency-flow').then(mod => ({ default: mod.RenovationDependencyFlow })),
  { ssr: false }
)

interface ActionPlanGeneratorProps {
  project: Partial<RehabProject>
  onNext: (data: any) => void
  onBack: () => void
}

interface TimelineItem {
  id: string
  name: string
  startDay: number
  endDay: number
  duration: number
  cost: number
  contractor: string
  dependencies: string[]
  phase: number
  status: 'pending' | 'in-progress' | 'completed'
  critical: boolean
}

export function ActionPlanGenerator({ project, onNext, onBack }: ActionPlanGeneratorProps) {
  const [phases, setPhases] = useState<ActionPlanPhase[]>([])
  const [timelineItems, setTimelineItems] = useState<TimelineItem[]>([])
  const [selectedPhase, setSelectedPhase] = useState<number>(1)
  const [viewMode, setViewMode] = useState<'flow' | 'timeline' | 'phases' | 'contractors'>('flow')

  // Generate action plan when scope items change
  useEffect(() => {
    if (project.scopeItems) {
      generateActionPlan()
    }
  }, [project.scopeItems])

  const generateActionPlan = () => {
    const scopeItems = project.scopeItems || []
    const includedItems = scopeItems.filter(item => item.included)
    
    if (includedItems.length === 0) return

    // Group items by phase
    const maxPhase = Math.max(...includedItems.map(item => item.phase), 0)
    const newPhases: ActionPlanPhase[] = []
    const newTimelineItems: TimelineItem[] = []

    let currentDay = 1

    for (let phaseNum = 1; phaseNum <= maxPhase; phaseNum++) {
      const phaseItems = includedItems.filter(item => item.phase === phaseNum)
      
      if (phaseItems.length === 0) continue

      const phaseStartDay = currentDay
      const phaseTasks: ActionTask[] = []
      let phaseCost = 0
      let phaseDuration = 0

      // Create timeline items for this phase
      phaseItems.forEach((item, index) => {
        const taskStartDay = currentDay
        const taskEndDay = currentDay + item.daysRequired - 1
        
        const timelineItem: TimelineItem = {
          id: item.id,
          name: item.itemName,
          startDay: taskStartDay,
          endDay: taskEndDay,
          duration: item.daysRequired,
          cost: item.totalCost,
          contractor: getContractorForItem(item),
          dependencies: item.dependsOn,
          phase: phaseNum,
          status: 'pending',
          critical: item.priority === 'must'
        }

        newTimelineItems.push(timelineItem)

        const task: ActionTask = {
          id: item.id,
          name: item.itemName,
          contractor: timelineItem.contractor,
          duration: item.daysRequired,
          cost: item.totalCost,
          dependencies: item.dependsOn,
          priority: item.priority === 'must' ? 'critical' : 'high'
        }

        phaseTasks.push(task)
        phaseCost += item.totalCost
        phaseDuration = Math.max(phaseDuration, item.daysRequired)
        
        // Move to next day for parallel tasks
        if (index === 0) {
          currentDay += item.daysRequired
        }
      })

      const phaseEndDay = currentDay - 1

      const phase: ActionPlanPhase = {
        id: `phase-${phaseNum}`,
        name: `Phase ${phaseNum}`,
        startDay: phaseStartDay,
        endDay: phaseEndDay,
        cost: phaseCost,
        tasks: phaseTasks,
        dependencies: [],
        criticalPath: phaseNum === 1,
        warnings: []
      }

      newPhases.push(phase)
    }

    setPhases(newPhases)
    setTimelineItems(newTimelineItems)
  }

  const getContractorForItem = (item: ScopeItem): string => {
    const category = item.category.toLowerCase()
    
    if (category.includes('electrical')) return 'Electrician'
    if (category.includes('plumbing')) return 'Plumber'
    if (category.includes('hvac')) return 'HVAC Contractor'
    if (category.includes('roof')) return 'Roofing Contractor'
    if (category.includes('paint')) return 'Painter'
    if (category.includes('flooring')) return 'Flooring Contractor'
    if (category.includes('kitchen') || category.includes('bathroom')) return 'General Contractor'
    if (category.includes('landscaping')) return 'Landscaper'
    
    return 'General Contractor'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />
      case 'in-progress': return <Play className="w-4 h-4 text-blue-500" />
      default: return <Square className="w-4 h-4 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'in-progress': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getContractorColor = (contractor: string) => {
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-orange-500', 
      'bg-red-500', 'bg-pink-500', 'bg-indigo-500', 'bg-teal-500'
    ]
    const index = contractor.length % colors.length
    return colors[index]
  }

  const calculateTotalTimeline = () => {
    if (phases.length === 0) return 0
    return Math.max(...phases.map(phase => phase.endDay))
  }

  const calculateTotalCost = () => {
    return phases.reduce((sum, phase) => sum + phase.cost, 0)
  }

  const getContractorSchedule = () => {
    const contractors = new Map<string, { tasks: TimelineItem[], totalCost: number }>()
    
    timelineItems.forEach(item => {
      if (!contractors.has(item.contractor)) {
        contractors.set(item.contractor, { tasks: [], totalCost: 0 })
      }
      const contractor = contractors.get(item.contractor)!
      contractor.tasks.push(item)
      contractor.totalCost += item.cost
    })
    
    return Array.from(contractors.entries()).map(([name, data]) => ({
      name,
      tasks: data.tasks,
      totalCost: data.totalCost
    }))
  }

  const handleSubmit = () => {
    onNext({ phases, timelineItems })
  }

  const totalTimeline = calculateTotalTimeline()
  const totalCost = calculateTotalCost()
  const contractorSchedule = getContractorSchedule()

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Calendar className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{totalTimeline}</div>
                <div className="text-sm text-muted-foreground">Total Days</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <DollarSign className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">${totalCost.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">Total Cost</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">{contractorSchedule.length}</div>
                <div className="text-sm text-muted-foreground">Contractors</div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Zap className="w-8 h-8 text-orange-600" />
              <div>
                <div className="text-2xl font-bold">{phases.length}</div>
                <div className="text-sm text-muted-foreground">Phases</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Action Plan Tabs */}
      <Tabs value={viewMode} onValueChange={(value: any) => setViewMode(value)}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="flow" className="gap-2">
            <Network className="w-4 h-4" />
            Flow View
          </TabsTrigger>
          <TabsTrigger value="timeline">Timeline View</TabsTrigger>
          <TabsTrigger value="phases">Phase Details</TabsTrigger>
          <TabsTrigger value="contractors">Contractor Schedule</TabsTrigger>
        </TabsList>

        {/* Flow View - Interactive Dependency Visualization */}
        <TabsContent value="flow" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Network className="w-5 h-5" />
                    Renovation Dependency Flow
                  </CardTitle>
                  <CardDescription>
                    Interactive visualization of task dependencies and critical path
                  </CardDescription>
                </div>
                <Badge variant="secondary" className="gap-1">
                  <Zap className="w-3 h-3" />
                  AI-Powered
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <RenovationDependencyFlow />

              <div className="mt-4 p-4 bg-muted rounded-lg">
                <h4 className="font-semibold text-sm mb-2">How to use this view:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• <strong>Red animated edges</strong> show the critical path</li>
                  <li>• <strong>Drag nodes</strong> to rearrange the layout</li>
                  <li>• <strong>Zoom and pan</strong> to navigate large projects</li>
                  <li>• <strong>Click nodes</strong> to see task details</li>
                  <li>• <strong>Switch layouts</strong> using the buttons above</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Timeline View */}
        <TabsContent value="timeline" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Project Timeline</CardTitle>
              <CardDescription>
                Visual timeline of all renovation tasks
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {/* Timeline Header */}
                <div className="flex items-center space-x-2 text-sm font-medium text-muted-foreground">
                  <div className="w-32">Task</div>
                  <div className="flex-1">Timeline</div>
                  <div className="w-24 text-right">Duration</div>
                  <div className="w-32 text-right">Cost</div>
                  <div className="w-32 text-right">Contractor</div>
                </div>

                <Separator />

                {/* Timeline Items */}
                {timelineItems.map((item) => (
                  <div key={item.id} className="flex items-center space-x-2 py-2">
                    <div className="w-32">
                      <div className="font-medium text-sm">{item.name}</div>
                      <div className="text-xs text-muted-foreground">Phase {item.phase}</div>
                    </div>
                    
                    <div className="flex-1 relative">
                      <div className="relative h-8 bg-gray-100 rounded-lg overflow-hidden">
                        <div 
                          className={cn(
                            "absolute h-full rounded-lg transition-all",
                            getContractorColor(item.contractor),
                            item.critical && "ring-2 ring-red-500"
                          )}
                          style={{
                            left: `${((item.startDay - 1) / totalTimeline) * 100}%`,
                            width: `${(item.duration / totalTimeline) * 100}%`
                          }}
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-xs font-medium text-white">
                          Days {item.startDay}-{item.endDay}
                        </div>
                      </div>
                    </div>
                    
                    <div className="w-24 text-right text-sm">
                      {item.duration} days
                    </div>
                    
                    <div className="w-32 text-right text-sm">
                      ${item.cost.toLocaleString()}
                    </div>
                    
                    <div className="w-32 text-right">
                      <Badge 
                        variant="outline" 
                        className={cn(getContractorColor(item.contractor), "text-white")}
                      >
                        {item.contractor}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Phase Details */}
        <TabsContent value="phases" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Phase List */}
            <Card>
              <CardHeader>
                <CardTitle>Project Phases</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {phases.map((phase) => (
                    <div
                      key={phase.id}
                      className={cn(
                        "p-4 border rounded-lg cursor-pointer transition-colors",
                        selectedPhase === parseInt(phase.name.split(' ')[1]) 
                          ? "border-primary bg-primary/5" 
                          : "border-muted hover:border-primary/50"
                      )}
                      onClick={() => setSelectedPhase(parseInt(phase.name.split(' ')[1]))}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium">{phase.name}</h3>
                        <Badge variant="outline">
                          ${phase.cost.toLocaleString()}
                        </Badge>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Days {phase.startDay}-{phase.endDay} • {phase.tasks.length} tasks
                      </div>
                      {phase.criticalPath && (
                        <Badge className="mt-2 bg-red-500 text-white">
                          Critical Path
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Phase Details */}
            <Card>
              <CardHeader>
                <CardTitle>Phase {selectedPhase} Details</CardTitle>
              </CardHeader>
              <CardContent>
                {phases.find(p => parseInt(p.name.split(' ')[1]) === selectedPhase) ? (
                  <div className="space-y-4">
                    {phases
                      .find(p => parseInt(p.name.split(' ')[1]) === selectedPhase)!
                      .tasks.map((task) => (
                        <div key={task.id} className="p-3 border rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <div className="font-medium">{task.name}</div>
                            <Badge variant={task.priority === 'critical' ? 'destructive' : 'default'}>
                              {task.priority}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-3 gap-4 text-sm text-muted-foreground">
                            <div>
                              <div>Contractor</div>
                              <div className="font-medium">{task.contractor}</div>
                            </div>
                            <div>
                              <div>Duration</div>
                              <div className="font-medium">{task.duration} days</div>
                            </div>
                            <div>
                              <div>Cost</div>
                              <div className="font-medium">${task.cost.toLocaleString()}</div>
                            </div>
                          </div>
                          {task.dependencies.length > 0 && (
                            <div className="mt-2 text-xs text-muted-foreground">
                              Dependencies: {task.dependencies.join(', ')}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                ) : (
                  <div className="text-center text-muted-foreground py-8">
                    Select a phase to view details
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Contractor Schedule */}
        <TabsContent value="contractors" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Contractor Schedule</CardTitle>
              <CardDescription>
                Breakdown of work by contractor
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {contractorSchedule.map((contractor) => (
                  <div key={contractor.name} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-2">
                        <div className={cn("w-3 h-3 rounded-full", getContractorColor(contractor.name))} />
                        <h3 className="font-medium">{contractor.name}</h3>
                      </div>
                      <Badge variant="outline">
                        ${contractor.totalCost.toLocaleString()}
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      {contractor.tasks.map((task) => (
                        <div key={task.id} className="flex items-center justify-between text-sm">
                          <div className="flex items-center space-x-2">
                            <div className={cn("w-2 h-2 rounded-full", getContractorColor(contractor.name))} />
                            <span>{task.name}</span>
                          </div>
                          <div className="text-muted-foreground">
                            Days {task.startDay}-{task.endDay} • ${task.cost.toLocaleString()}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Critical Path Analysis */}
      {phases.some(phase => phase.criticalPath) && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <AlertTriangle className="w-5 h-5 text-orange-600" />
              <span>Critical Path Analysis</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Critical Path:</strong> Phase 1 is on the critical path and any delays will impact the entire project timeline.
                  Ensure all critical path tasks are completed on schedule.
                </AlertDescription>
              </Alert>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {phases.filter(p => p.criticalPath).length}
                  </div>
                  <div className="text-sm text-orange-600">Critical Phases</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {timelineItems.filter(item => item.critical).length}
                  </div>
                  <div className="text-sm text-orange-600">Critical Tasks</div>
                </div>
                <div className="text-center p-3 bg-orange-50 rounded-lg">
                  <div className="text-lg font-bold text-orange-600">
                    {phases.filter(p => p.criticalPath).reduce((sum, p) => sum + p.cost, 0).toLocaleString()}
                  </div>
                  <div className="text-sm text-orange-600">Critical Cost</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Cash Flow Projection */}
      <Card>
        <CardHeader>
          <CardTitle>Cash Flow Projection</CardTitle>
          <CardDescription>
            Estimated cash flow based on phase completion
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {phases.map((phase, index) => (
              <div key={phase.id} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-sm font-medium">
                    {index + 1}
                  </div>
                  <div>
                    <div className="font-medium">{phase.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Due: Day {phase.endDay}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">${phase.cost.toLocaleString()}</div>
                  <div className="text-sm text-muted-foreground">
                    {((phase.cost / totalCost) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Submit Handler - Navigation is handled by parent component */}
      <div className="hidden">
        <Button 
          onClick={handleSubmit}
          disabled={phases.length === 0}
        >
          Continue to Final Review
        </Button>
      </div>
    </div>
  )
}
