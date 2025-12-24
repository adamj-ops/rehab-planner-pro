# React Flow Integration

This directory contains the React Flow integration for the Rehab Estimator app, providing interactive visual workflows for project timelines, dependencies, and task management.

## Overview

React Flow is used to create interactive, node-based UIs for:
- **Action Plan Timeline**: Visual project scheduling with drag-and-drop
- **Dependency Mapping**: PERT-style dependency graphs
- **Critical Path Analysis**: Automatic CPM calculations with visual highlighting
- **Resource Allocation**: Contractor scheduling with conflict detection

## Directory Structure

```
src/lib/react-flow/
├── types.ts           # TypeScript definitions for nodes and edges
├── utils.ts           # Helper functions (layout, critical path, conflicts)
└── README.md          # This file

src/components/flow-nodes/
├── TaskNode.tsx       # Individual renovation task node
├── PhaseNode.tsx      # Project phase grouping node
├── MilestoneNode.tsx  # Milestone marker node
├── ContractorNode.tsx # Contractor resource node
└── index.ts           # Node type exports

src/components/flow-edges/
├── DependencyEdge.tsx # Task dependency edge
├── TimelineEdge.tsx   # Timeline connection edge
└── index.ts           # Edge type exports
```

## Custom Node Types

### TaskNode
Displays individual renovation tasks with:
- Task name and description
- Cost and duration
- Priority level (color-coded)
- Status indicator
- Assigned contractor
- Edit/delete actions

### PhaseNode
Groups related tasks into project phases:
- Phase summary (cost, duration, task count)
- Collapsible task list
- Critical path indicator
- Warning messages
- Timeline bar

### MilestoneNode
Marks important project milestones:
- Inspection points
- Payment milestones
- Decision gates
- Completion markers
- Date information

### ContractorNode
Represents contractor resources:
- Contractor info and specialty
- Availability status
- Hourly rate
- Assigned tasks list
- Contact information

## Custom Edge Types

### DependencyEdge
Shows task dependencies:
- Finish-to-start (FS)
- Start-to-start (SS)
- Finish-to-finish (FF)
- Lead/lag time
- Critical path highlighting
- Animated for critical tasks

### TimelineEdge
Timeline connections:
- Duration labels
- Conflict indicators
- Dashed styling

## Utility Functions

### autoLayoutNodes(nodes, edges, config)
Automatically positions nodes using topological sort:
```typescript
const layoutedNodes = autoLayoutNodes(nodes, edges, {
  direction: 'horizontal',
  nodeSpacing: 200,
  rankSpacing: 150,
  algorithm: 'manual'
})
```

### calculateCriticalPath(nodes, edges)
Identifies the critical path through tasks:
```typescript
const criticalPath = calculateCriticalPath(nodes, edges)
// Returns Set<string> of node IDs on critical path
```

### detectConflicts(nodes, edges)
Finds scheduling conflicts:
```typescript
const conflicts = detectConflicts(nodes, edges)
// Returns array of conflicts with reasons
```

## Usage Example

```tsx
import { ReactFlow, Background, Controls, MiniMap } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { nodeTypes } from '@/components/flow-nodes'
import { edgeTypes } from '@/components/flow-edges'

function MyFlowComponent() {
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      nodeTypes={nodeTypes}
      edgeTypes={edgeTypes}
      fitView
    >
      <Background />
      <Controls />
      <MiniMap />
    </ReactFlow>
  )
}
```

## Features

- ✅ Drag-and-drop task scheduling
- ✅ Visual dependency management
- ✅ Critical path highlighting
- ✅ Conflict detection
- ✅ Auto-layout algorithms
- ✅ Zoom and pan controls
- ✅ Mini-map for navigation
- ✅ Export to image (planned)
- ✅ Undo/redo (planned)

## Resources

- [React Flow Docs](https://reactflow.dev)
- [Interactive Playground](https://play.reactflow.dev)
- [Example Apps](https://github.com/xyflow/react-flow-example-apps)
- [Main Repository](https://github.com/xyflow/xyflow)

