'use client'

import { useCallback, useMemo, useState } from 'react'
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  Node,
  Edge,
  useNodesState,
  useEdgesState,
  addEdge,
  Connection,
  MarkerType,
  Panel,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { RenovationTaskNode, RenovationTaskData } from './renovation-task-node'
import { getLayoutedElements, calculateCriticalPath, calculateProjectDuration } from '@/lib/flow-layout'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  LayoutDashboard,
  Maximize2,
  Clock,
  DollarSign,
  TrendingUp,
  Download,
  Sparkles
} from 'lucide-react'

const nodeTypes = {
  renovationTask: RenovationTaskNode,
}

// Sample renovation workflow data
const initialNodes: Node<RenovationTaskData>[] = [
  {
    id: '1',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Demolition & Cleanup',
      category: 'demo',
      duration: 3,
      cost: 5000,
      priority: 'critical',
      status: 'completed',
      roi: 0,
      description: 'Remove old fixtures, flooring, and prepare for renovation'
    }
  },
  {
    id: '2',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Structural Repairs',
      category: 'structural',
      duration: 7,
      cost: 12000,
      priority: 'critical',
      status: 'in-progress',
      roi: 80,
      description: 'Foundation repairs, roof work, major structural fixes'
    }
  },
  {
    id: '3',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Plumbing Rough-In',
      category: 'mechanical',
      duration: 4,
      cost: 8000,
      priority: 'high',
      status: 'not-started',
      roi: 70,
      description: 'Install new plumbing lines, update fixtures'
    }
  },
  {
    id: '4',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Electrical Rough-In',
      category: 'mechanical',
      duration: 4,
      cost: 7000,
      priority: 'high',
      status: 'not-started',
      roi: 65,
      description: 'Update electrical panel, run new circuits'
    }
  },
  {
    id: '5',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'HVAC Installation',
      category: 'mechanical',
      duration: 3,
      cost: 6500,
      priority: 'high',
      status: 'not-started',
      roi: 90,
      description: 'Install new HVAC system'
    }
  },
  {
    id: '6',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Drywall & Insulation',
      category: 'finish',
      duration: 5,
      cost: 4500,
      priority: 'medium',
      status: 'not-started',
      roi: 50,
      description: 'Hang drywall, add insulation, tape and mud'
    }
  },
  {
    id: '7',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Kitchen Remodel',
      category: 'finish',
      duration: 7,
      cost: 25000,
      priority: 'critical',
      status: 'not-started',
      roi: 150,
      description: 'New cabinets, countertops, appliances'
    }
  },
  {
    id: '8',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Bathroom Remodel',
      category: 'finish',
      duration: 5,
      cost: 15000,
      priority: 'high',
      status: 'not-started',
      roi: 120,
      description: 'New fixtures, tile, vanity'
    }
  },
  {
    id: '9',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Flooring Installation',
      category: 'finish',
      duration: 4,
      cost: 8000,
      priority: 'medium',
      status: 'not-started',
      roi: 85,
      description: 'Install hardwood/LVP throughout'
    }
  },
  {
    id: '10',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Paint & Trim',
      category: 'finish',
      duration: 3,
      cost: 3500,
      priority: 'medium',
      status: 'not-started',
      roi: 70,
      description: 'Paint all rooms, install baseboards and crown'
    }
  },
  {
    id: '11',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Exterior Improvements',
      category: 'exterior',
      duration: 5,
      cost: 10000,
      priority: 'high',
      status: 'not-started',
      roi: 110,
      description: 'Landscaping, siding, curb appeal'
    }
  },
  {
    id: '12',
    type: 'renovationTask',
    position: { x: 0, y: 0 },
    data: {
      label: 'Final Inspections',
      category: 'finish',
      duration: 1,
      cost: 500,
      priority: 'critical',
      status: 'not-started',
      roi: 0,
      description: 'Get all necessary permits and inspections'
    }
  },
]

const initialEdges: Edge[] = [
  { id: 'e1-2', source: '1', target: '2', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-3', source: '2', target: '3', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-4', source: '2', target: '4', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e2-5', source: '2', target: '5', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e3-6', source: '3', target: '6', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e4-6', source: '4', target: '6', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e5-6', source: '5', target: '6', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e6-7', source: '6', target: '7', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e6-8', source: '6', target: '8', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e6-9', source: '6', target: '9', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e7-10', source: '7', target: '10', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e8-10', source: '8', target: '10', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e9-10', source: '9', target: '10', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e10-11', source: '10', target: '11', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
  { id: 'e11-12', source: '11', target: '12', animated: false, markerEnd: { type: MarkerType.ArrowClosed } },
]

export function RenovationDependencyFlow() {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node<RenovationTaskData>>([])
  const [edges, setEdges, onEdgesChange] = useEdgesState([])
  const [criticalPath, setCriticalPath] = useState<string[]>([])

  // Initialize with auto-layout
  const onLayout = useCallback(
    (direction: 'TB' | 'LR' = 'TB') => {
      const layouted = getLayoutedElements(
        initialNodes,
        initialEdges,
        { direction }
      )
      setNodes(layouted.nodes)

      // Calculate and highlight critical path
      const path = calculateCriticalPath(layouted.nodes, initialEdges)
      setCriticalPath(path)

      // Animate edges on critical path
      const edgesWithAnimation = initialEdges.map(edge => ({
        ...edge,
        animated: path.includes(edge.source) && path.includes(edge.target),
        style: path.includes(edge.source) && path.includes(edge.target)
          ? { stroke: 'rgb(239, 68, 68)', strokeWidth: 2 }
          : { stroke: 'rgb(100, 116, 139)' },
      }))
      setEdges(edgesWithAnimation)
    },
    [setNodes, setEdges]
  )

  // Calculate project metrics
  const projectMetrics = useMemo(() => {
    if (nodes.length === 0) return { totalCost: 0, totalDuration: 0, avgROI: 0 }

    const totalCost = nodes.reduce((sum, node) => sum + node.data.cost, 0)
    const totalDuration = calculateProjectDuration(nodes, edges)
    const avgROI = nodes
      .filter(n => n.data.roi !== undefined && n.data.roi > 0)
      .reduce((sum, node) => sum + (node.data.roi || 0), 0) /
      nodes.filter(n => n.data.roi).length

    return { totalCost, totalDuration, avgROI }
  }, [nodes, edges])

  // Initialize on mount
  useMemo(() => {
    onLayout('TB')
  }, [onLayout])

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  )

  return (
    <div className="h-[800px] w-full rounded-lg border border-border bg-background overflow-hidden">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
        className="bg-background"
        minZoom={0.2}
        maxZoom={1.5}
      >
        <Background
          className="bg-background"
          gap={16}
          size={1}
          color="hsl(var(--muted-foreground) / 0.1)"
        />

        <Controls className="bg-card border border-border" />

        <MiniMap
          className="bg-card border border-border"
          nodeColor={(node) => {
            if (criticalPath.includes(node.id)) return 'rgb(239, 68, 68)'
            return 'rgb(100, 116, 139)'
          }}
        />

        {/* Stats Panel */}
        <Panel position="top-left" className="space-y-2">
          <Card className="p-3 space-y-2">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-semibold">Critical Path</span>
              <Badge variant="destructive" className="text-xs">
                {criticalPath.length} tasks
              </Badge>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <DollarSign className="w-3 h-3" />
                  <span className="text-xs">Total Cost</span>
                </div>
                <p className="text-sm font-semibold">
                  ${projectMetrics.totalCost.toLocaleString()}
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <Clock className="w-3 h-3" />
                  <span className="text-xs">Duration</span>
                </div>
                <p className="text-sm font-semibold">
                  {projectMetrics.totalDuration} days
                </p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1 text-muted-foreground">
                  <TrendingUp className="w-3 h-3" />
                  <span className="text-xs">Avg ROI</span>
                </div>
                <p className="text-sm font-semibold text-green-500">
                  {projectMetrics.avgROI.toFixed(0)}%
                </p>
              </div>
            </div>
          </Card>
        </Panel>

        {/* Layout Controls */}
        <Panel position="top-right" className="space-y-2">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLayout('TB')}
              className="bg-card"
            >
              <LayoutDashboard className="w-4 h-4 mr-2" />
              Vertical
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => onLayout('LR')}
              className="bg-card"
            >
              <Maximize2 className="w-4 h-4 mr-2" />
              Horizontal
            </Button>
            <Button
              size="sm"
              variant="outline"
              className="bg-card"
            >
              <Download className="w-4 h-4 mr-2" />
              Export
            </Button>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  )
}
