'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { 
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Panel,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  Edge,
  Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  GitBranch,
  Maximize2,
  Download,
  RefreshCw,
  ZoomIn,
  ZoomOut,
  Workflow
} from 'lucide-react'

import { nodeTypes } from '@/components/flow-nodes'
import { edgeTypes } from '@/components/flow-edges'
import { 
  CustomNode, 
  CustomEdge,
  TaskNodeData 
} from '@/lib/react-flow/types'
import { 
  autoLayoutNodes, 
  calculateCriticalPath, 
  detectConflicts,
  getFitViewOptions 
} from '@/lib/react-flow/utils'
import { RehabProject, ActionPlanPhase } from '@/types/rehab'
import { cn } from '@/lib/utils'

interface ActionPlanFlowProps {
  project: Partial<RehabProject>
  phases: ActionPlanPhase[]
  onUpdatePhases?: (phases: ActionPlanPhase[]) => void
}

export function ActionPlanFlow({ project, phases, onUpdatePhases }: ActionPlanFlowProps) {
  const [nodes, setNodes, onNodesChange] = useNodesState<CustomNode>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState<CustomEdge>([])
  const [viewMode, setViewMode] = useState<'dependency' | 'timeline' | 'phases'>('dependency')

  // Convert phases to React Flow nodes and edges
  useEffect(() => {
    if (phases && phases.length > 0) {
      generateFlowData()
    }
  }, [phases, viewMode])

  const generateFlowData = useCallback(() => {
    const newNodes: CustomNode[] = []
    const newEdges: CustomEdge[] = []
    let nodeYOffset = 0

    phases.forEach((phase, phaseIndex) => {
      // Add phase node
      const phaseNode: Node = {
        id: `phase-${phase.id}`,
        type: 'phase',
        position: { x: 0, y: nodeYOffset },
        data: {
          phase,
          isExpanded: true,
        },
      }
      newNodes.push(phaseNode as CustomNode)
      nodeYOffset += 250

      // Add task nodes
      phase.tasks.forEach((task, taskIndex) => {
        const taskNode: Node = {
          id: task.id,
          type: 'task',
          position: { x: 300 + (taskIndex * 300), y: nodeYOffset },
          data: {
            task,
            phase: phaseIndex + 1,
            contractor: task.contractor,
            status: 'pending',
            onEdit: (taskId: string) => {
              console.log('Edit task:', taskId)
            },
            onDelete: (taskId: string) => {
              console.log('Delete task:', taskId)
            },
          } as TaskNodeData,
        }
        newNodes.push(taskNode as CustomNode)

        // Connect task to phase
        newEdges.push({
          id: `edge-phase-${phase.id}-${task.id}`,
          source: `phase-${phase.id}`,
          target: task.id,
          type: 'default',
          animated: false,
        } as CustomEdge)

        // Add dependency edges
        task.dependencies.forEach(depId => {
          newEdges.push({
            id: `edge-${depId}-${task.id}`,
            source: depId,
            target: task.id,
            type: 'dependency',
            data: {
              type: 'finish-to-start',
              isCriticalPath: false,
            },
            animated: true,
          } as CustomEdge)
        })
      })

      nodeYOffset += 300
    })

    // Calculate critical path
    const criticalPath = calculateCriticalPath(newNodes, newEdges)
    
    // Update edges to highlight critical path
    const updatedEdges = newEdges.map(edge => {
      if (criticalPath.has(edge.source) && criticalPath.has(edge.target)) {
        return {
          ...edge,
          data: {
            ...edge.data,
            isCriticalPath: true,
          },
        }
      }
      return edge
    })

    // Auto-layout nodes
    const layoutedNodes = autoLayoutNodes(newNodes, updatedEdges, {
      direction: viewMode === 'timeline' ? 'horizontal' : 'vertical',
      nodeSpacing: 250,
      rankSpacing: 200,
      algorithm: 'manual',
    })

    setNodes(layoutedNodes)
    setEdges(updatedEdges)
  }, [phases, viewMode])

  const onConnect = useCallback(
    (params: Connection) => {
      setEdges((eds) => addEdge({
        ...params,
        type: 'dependency',
        data: {
          type: 'finish-to-start',
          isCriticalPath: false,
        },
      }, eds))
    },
    [setEdges]
  )

  const handleLayout = useCallback(() => {
    const layoutedNodes = autoLayoutNodes(nodes, edges, {
      direction: viewMode === 'timeline' ? 'horizontal' : 'vertical',
      nodeSpacing: 250,
      rankSpacing: 200,
      algorithm: 'manual',
    })
    setNodes(layoutedNodes)
  }, [nodes, edges, viewMode, setNodes])

  const conflicts = useMemo(() => detectConflicts(nodes, edges), [nodes, edges])

  return (
    <Card className="h-[600px] flex flex-col">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Action Plan Timeline</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">
              Drag tasks to adjust schedule • Click to edit • Connect to add dependencies
            </p>
          </div>
          
          <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as any)}>
            <TabsList>
              <TabsTrigger value="dependency">
                <GitBranch className="w-4 h-4 mr-2" />
                Dependencies
              </TabsTrigger>
              <TabsTrigger value="timeline">
                <Workflow className="w-4 h-4 mr-2" />
                Timeline
              </TabsTrigger>
              <TabsTrigger value="phases">
                Phases
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </CardHeader>

      <CardContent className="flex-1 p-0 relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          fitView
          fitViewOptions={getFitViewOptions()}
          attributionPosition="bottom-left"
          className="bg-accent/5"
        >
          <Background variant={BackgroundVariant.Dots} gap={16} size={1} />
          <Controls />
          <MiniMap 
            nodeStrokeWidth={3}
            pannable
            zoomable
            className="bg-background"
          />
          
          <Panel position="top-right" className="space-x-2">
            <Button
              variant="secondary"
              size="sm"
              onClick={handleLayout}
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Auto Layout
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                // Export functionality
                console.log('Export')
              }}
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </Panel>

          {conflicts.length > 0 && (
            <Panel position="bottom-right">
              <Card className="w-64">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">
                    ⚠️ Scheduling Conflicts ({conflicts.length})
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {conflicts.slice(0, 3).map((conflict, idx) => (
                    <div key={idx} className="text-xs text-muted-foreground">
                      {conflict.reason}
                    </div>
                  ))}
                  {conflicts.length > 3 && (
                    <p className="text-xs text-muted-foreground italic">
                      +{conflicts.length - 3} more conflicts
                    </p>
                  )}
                </CardContent>
              </Card>
            </Panel>
          )}
        </ReactFlow>
      </CardContent>
    </Card>
  )
}

