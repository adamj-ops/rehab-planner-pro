'use client';

import React, { useCallback, useMemo, useState, useRef } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  MiniMap,
  useNodesState,
  useEdgesState,
  Panel,
  Node,
  Edge,
  NodeTypes,
  Position,
  Handle,
  MarkerType,
  NodeDragHandler,
  OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { TimelineTask, TimelinePhase, TimelineMilestone, GanttViewOptions } from '@/lib/timeline/types';
import {
  validateTaskMove,
  detectScheduleConflicts,
  addDays,
  type TaskMoveValidation,
  type ConflictResult,
} from '@/lib/timeline/task-validation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import {
  IconUser,
  IconAlertTriangle,
  IconCircleCheck,
  IconClock,
  IconPlayerPause,
  IconGripVertical,
} from '@tabler/icons-react';
import dayjs from 'dayjs';

// =============================================================================
// CONSTANTS
// =============================================================================

const PIXELS_PER_DAY = 40; // Width of one day in pixels
const ROW_HEIGHT = 60;     // Height of one task row
const HEADER_HEIGHT = 40;  // Height of date header
const PHASE_LABEL_WIDTH = 150; // Width of phase labels on left

const STATUS_COLORS = {
  pending: 'bg-zinc-400',
  in_progress: 'bg-blue-500',
  completed: 'bg-green-500',
  blocked: 'bg-red-500',
  delayed: 'bg-amber-500',
};

const STATUS_ICONS = {
  pending: IconClock,
  in_progress: IconPlayerPause,
  completed: IconCircleCheck,
  blocked: IconAlertTriangle,
  delayed: IconAlertTriangle,
};

// =============================================================================
// DRAG STATE CONTEXT
// =============================================================================

interface DragState {
  isDragging: boolean;
  taskId: string | null;
  originalX: number;
  currentX: number;
  newStartDate: Date | null;
  newEndDate: Date | null;
  validation: TaskMoveValidation | null;
  conflicts: ConflictResult | null;
}

const initialDragState: DragState = {
  isDragging: false,
  taskId: null,
  originalX: 0,
  currentX: 0,
  newStartDate: null,
  newEndDate: null,
  validation: null,
  conflicts: null,
};

// =============================================================================
// CUSTOM NODE COMPONENTS
// =============================================================================

interface TaskNodeData {
  task: TimelineTask;
  dayOffset: number;
  durationDays: number;
  isOnCriticalPath: boolean;
  showProgress: boolean;
  isDragging?: boolean;
  isInvalid?: boolean;
  dragPreviewDates?: { start: Date; end: Date } | null;
  validation?: TaskMoveValidation | null;
}

function TaskNode({ data, selected, dragging }: { data: TaskNodeData; selected: boolean; dragging?: boolean }) {
  const { task, durationDays, isOnCriticalPath, showProgress, isInvalid, dragPreviewDates, isDragging } = data;
  const StatusIcon = STATUS_ICONS[task.status];
  
  const width = durationDays * PIXELS_PER_DAY;
  const isDraggingNode = dragging || isDragging;
  
  // Show preview dates if dragging
  const displayStartDate = dragPreviewDates?.start || task.startDate;
  const displayEndDate = dragPreviewDates?.end || task.endDate;
  
  return (
    <>
      <Handle type="target" position={Position.Left} className="!bg-zinc-500" />
      
      {/* Drag ghost/preview */}
      {isDraggingNode && dragPreviewDates && (
        <div
          className="absolute pointer-events-none border-2 border-dashed border-primary bg-primary/20 rounded-sm -top-1 -left-1 z-50"
          style={{
            width: `${width + 2}px`,
            height: `${ROW_HEIGHT - 10}px`,
          }}
        />
      )}
      
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div
              className={cn(
                'relative w-full rounded-sm text-white text-xs font-medium transition-all group',
                'flex items-center px-2 overflow-hidden border shadow-sm',
                // Cursor states
                isDraggingNode ? 'cursor-grabbing' : 'cursor-move',
                // Drag visual feedback
                isDraggingNode && 'opacity-70 scale-105 shadow-lg z-40',
                // Validation states
                isInvalid && 'ring-2 ring-red-500 ring-offset-2',
                selected && 'ring-2 ring-primary ring-offset-2',
                isOnCriticalPath && !isDraggingNode && 'ring-1 ring-red-400',
                // Background
                'bg-background border-border',
                // Hover effects
                !isDraggingNode && 'hover:shadow-md hover:scale-[1.01]'
              )}
              style={{ 
                width: `${width}px`,
                height: `${ROW_HEIGHT - 12}px`,
              }}
            >
              {/* Drag handle indicator */}
              <div className={cn(
                'absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center',
                'bg-gradient-to-r from-muted/70 to-transparent',
                isDraggingNode ? 'opacity-100' : 'opacity-0 group-hover:opacity-100',
                'transition-opacity duration-200'
              )}>
                <IconGripVertical className="h-3 w-3 text-muted-foreground" />
              </div>
              
              {/* Status color bar */}
              <div
                className={cn(
                  'absolute inset-0 rounded-sm',
                  STATUS_COLORS[task.status],
                  isDraggingNode ? 'opacity-60' : 'opacity-80'
                )}
              />
              
              {/* Progress overlay */}
              {showProgress && task.progress > 0 && (
                <div
                  className="absolute inset-0 bg-white/30 rounded-sm transition-all"
                  style={{ width: `${(task.progress / 100) * width}px` }}
                />
              )}
              
              {/* Invalid state overlay */}
              {isDraggingNode && isInvalid && (
                <div className="absolute inset-0 bg-red-500/30 rounded-sm flex items-center justify-center z-10">
                  <IconAlertTriangle className="h-4 w-4 text-red-600 animate-pulse" />
                </div>
              )}
              
              {/* Task content */}
              <div className="relative z-20 flex items-center justify-between w-full pl-4">
                <div className="flex items-center gap-1 min-w-0">
                  <StatusIcon className="h-3 w-3 flex-shrink-0 text-white/90" />
                  <span className="truncate text-[11px] font-medium text-white">
                    {task.name}
                  </span>
                </div>
                
                {width > 120 && (
                  <div className="flex items-center gap-2 text-[10px] text-white/70">
                    {task.assignedVendorName && (
                      <span className="flex items-center gap-0.5">
                        <IconUser className="h-3 w-3" />
                        {task.assignedVendorName}
                      </span>
                    )}
                    <span>{durationDays}d</span>
                    {showProgress && <span>{task.progress}%</span>}
                  </div>
                )}
              </div>
              
              {/* Shimmer effect during drag */}
              {isDraggingNode && !isInvalid && (
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse" />
              )}
            </div>
          </TooltipTrigger>
          <TooltipContent side="top" className="z-50">
            <div className="text-xs space-y-1">
              <div className="font-medium">{task.name}</div>
              <div className={cn(isInvalid && 'text-red-500')}>
                {dragPreviewDates ? (
                  <>
                    <div className="text-muted-foreground">Moving to:</div>
                    <div>{dayjs(displayStartDate).format('MMM D')} - {dayjs(displayEndDate).format('MMM D')}</div>
                    {isInvalid && data.validation && (
                      <div className="text-red-500 text-[10px] mt-1">
                        {data.validation.errors.join(', ')}
                      </div>
                    )}
                  </>
                ) : (
                  <div>{dayjs(displayStartDate).format('MMM D')} - {dayjs(displayEndDate).format('MMM D')}</div>
                )}
              </div>
              {task.assignedVendorName && (
                <div className="text-muted-foreground">
                  Assigned to: {task.assignedVendorName}
                </div>
              )}
              {isDraggingNode && (
                <div className="text-blue-500 text-[10px] italic">
                  Drag horizontally to reschedule
                </div>
              )}
            </div>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      
      <Handle type="source" position={Position.Right} className="!bg-zinc-500" />
    </>
  );
}

interface MilestoneNodeData {
  milestone: TimelineMilestone;
  dayOffset: number;
}

function MilestoneNode({ data }: { data: MilestoneNodeData }) {
  const { milestone } = data;
  
  return (
    <div className="flex flex-col items-center">
      <div className="w-4 h-4 bg-primary rotate-45 border border-primary-foreground shadow-sm" />
      <span className="text-[10px] font-medium mt-1 whitespace-nowrap">
        {milestone.name}
      </span>
    </div>
  );
}

interface PhaseNodeData {
  phase: TimelinePhase;
  dayOffset: number;
  durationDays: number;
}

function PhaseNode({ data }: { data: PhaseNodeData }) {
  const { phase, durationDays } = data;
  const width = durationDays * PIXELS_PER_DAY;
  
  return (
    <div
      className="rounded-sm px-2 py-1 text-xs font-medium text-white"
      style={{
        width: `${width}px`,
        backgroundColor: phase.color,
        opacity: 0.6,
      }}
    >
      {phase.name}
    </div>
  );
}

const nodeTypes: NodeTypes = {
  task: TaskNode,
  milestone: MilestoneNode,
  phase: PhaseNode,
};

// =============================================================================
// DATE UTILS
// =============================================================================

function getDayOffset(date: Date, projectStart: Date): number {
  const diffTime = date.getTime() - projectStart.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

function getDurationDays(startDate: Date, endDate: Date): number {
  const diffTime = endDate.getTime() - startDate.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

function pixelsToDays(pixels: number): number {
  return Math.round(pixels / PIXELS_PER_DAY);
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

interface GanttChartProps {
  tasks: TimelineTask[];
  phases: TimelinePhase[];
  milestones: TimelineMilestone[];
  projectStartDate: Date;
  projectEndDate: Date;
  criticalPath?: string[];
  onTaskClick?: (task: TimelineTask) => void;
  onTaskUpdate?: (task: TimelineTask, updates?: { startDate: Date; endDate: Date }) => void;
  onTaskDragStart?: (task: TimelineTask) => void;
  onDragStart?: (taskId: string) => void;
  onDragEnd?: (taskId: string, cancelled: boolean) => void;
  className?: string;
}

export function GanttChart({
  tasks,
  phases,
  milestones,
  projectStartDate,
  projectEndDate,
  criticalPath = [],
  onTaskClick,
  onTaskUpdate,
  onDragStart,
  onDragEnd,
  className,
}: GanttChartProps) {
  // View options state
  const [viewOptions, setViewOptions] = useState<GanttViewOptions>({
    viewMode: 'day',
    showDependencies: true,
    showProgress: true,
    showMilestones: true,
    groupBy: 'phase',
    highlightCriticalPath: true,
    compactMode: false,
  });

  // Drag state
  const [dragState, setDragState] = useState<DragState>(initialDragState);
  const dragStartPositionRef = useRef<{ x: number; y: number } | null>(null);

  const criticalPathSet = useMemo(() => new Set(criticalPath), [criticalPath]);

  // Convert tasks to nodes
  const { initialNodes, initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    
    // Group tasks by phase for vertical positioning
    const tasksByPhase = new Map<number, TimelineTask[]>();
    tasks.forEach(task => {
      const existing = tasksByPhase.get(task.phase) || [];
      existing.push(task);
      tasksByPhase.set(task.phase, existing);
    });
    
    let yOffset = HEADER_HEIGHT + 10;
    
    // Add phase headers and tasks
    const sortedPhases = [...phases].sort((a, b) => a.number - b.number);
    
    sortedPhases.forEach(phase => {
      const phaseTasks = tasksByPhase.get(phase.number) || [];
      const phaseDuration = getDurationDays(phase.startDate, phase.endDate);
      const phaseOffset = getDayOffset(phase.startDate, projectStartDate);
      
      // Phase header node (not draggable)
      nodes.push({
        id: phase.id,
        type: 'phase',
        position: { 
          x: PHASE_LABEL_WIDTH + phaseOffset * PIXELS_PER_DAY, 
          y: yOffset 
        },
        data: {
          phase,
          dayOffset: phaseOffset,
          durationDays: phaseDuration,
        } as PhaseNodeData,
        draggable: false,
      });
      
      yOffset += 30;
      
      // Task nodes (draggable horizontally)
      phaseTasks.forEach((task, index) => {
        const dayOffset = getDayOffset(task.startDate, projectStartDate);
        const durationDays = getDurationDays(task.startDate, task.endDate);
        
        // Check if this task is currently being dragged
        const isDraggingThis = dragState.isDragging && dragState.taskId === task.id;
        
        nodes.push({
          id: task.id,
          type: 'task',
          position: {
            x: PHASE_LABEL_WIDTH + dayOffset * PIXELS_PER_DAY,
            y: yOffset + index * ROW_HEIGHT,
          },
          data: {
            task,
            dayOffset,
            durationDays,
            isOnCriticalPath: viewOptions.highlightCriticalPath && criticalPathSet.has(task.id),
            showProgress: viewOptions.showProgress,
            isDragging: isDraggingThis,
            isInvalid: isDraggingThis && dragState.validation && !dragState.validation.isValid,
            dragPreviewDates: isDraggingThis && dragState.newStartDate && dragState.newEndDate
              ? { start: dragState.newStartDate, end: dragState.newEndDate }
              : null,
            validation: isDraggingThis ? dragState.validation : null,
          } as TaskNodeData,
          draggable: true,
        });
        
        // Dependency edges
        if (viewOptions.showDependencies) {
          task.dependencies.forEach(depId => {
            const isInvalidDep = isDraggingThis && 
              dragState.validation?.dependencyViolations.some(v => v.dependencyId === depId);
            
            edges.push({
              id: `${depId}-${task.id}`,
              source: depId,
              target: task.id,
              type: 'smoothstep',
              animated: task.status === 'blocked' || isInvalidDep,
              style: {
                stroke: isInvalidDep
                  ? '#EF4444'
                  : criticalPathSet.has(task.id) && criticalPathSet.has(depId)
                    ? '#EF4444'
                    : '#94a3b8',
                strokeWidth: isInvalidDep ? 3 : 2,
              },
              markerEnd: {
                type: MarkerType.ArrowClosed,
                width: 15,
                height: 15,
                color: isInvalidDep
                  ? '#EF4444'
                  : criticalPathSet.has(task.id) && criticalPathSet.has(depId)
                    ? '#EF4444'
                    : '#94a3b8',
              },
            });
          });
        }
      });
      
      yOffset += phaseTasks.length * ROW_HEIGHT + 20;
    });
    
    // Milestone nodes (not draggable)
    if (viewOptions.showMilestones) {
      milestones.forEach((milestone) => {
        const dayOffset = getDayOffset(milestone.date, projectStartDate);
        
        nodes.push({
          id: milestone.id,
          type: 'milestone',
          position: {
            x: PHASE_LABEL_WIDTH + dayOffset * PIXELS_PER_DAY - 8,
            y: -30,
          },
          data: {
            milestone,
            dayOffset,
          } as MilestoneNodeData,
          draggable: false,
        });
      });
    }
    
    return { initialNodes: nodes, initialEdges: edges };
  }, [tasks, phases, milestones, projectStartDate, viewOptions, criticalPathSet, dragState]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Sync nodes when data changes
  React.useEffect(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);

  // Handle node click
  const handleNodeClick = useCallback(
    (_: React.MouseEvent, node: Node) => {
      if (node.type === 'task' && onTaskClick && !dragState.isDragging) {
        onTaskClick((node.data as TaskNodeData).task);
      }
    },
    [onTaskClick, dragState.isDragging]
  );

  // Handle drag start
  const handleNodeDragStart: NodeDragHandler = useCallback(
    (_, node) => {
      if (node.type !== 'task') return;
      
      const taskData = node.data as TaskNodeData;
      dragStartPositionRef.current = { x: node.position.x, y: node.position.y };
      
      setDragState({
        isDragging: true,
        taskId: taskData.task.id,
        originalX: node.position.x,
        currentX: node.position.x,
        newStartDate: taskData.task.startDate,
        newEndDate: taskData.task.endDate,
        validation: null,
        conflicts: null,
      });
      
      onDragStart?.(taskData.task.id);
    },
    [onDragStart]
  );

  // Handle drag (real-time validation)
  const handleNodeDrag: OnNodeDrag = useCallback(
    (_, node) => {
      if (node.type !== 'task' || !dragState.isDragging) return;
      
      const taskData = node.data as TaskNodeData;
      const task = taskData.task;
      
      // Calculate new dates based on horizontal position change
      const deltaX = node.position.x - dragState.originalX;
      const deltaDays = pixelsToDays(deltaX);
      
      const newStartDate = addDays(task.startDate, deltaDays);
      const newEndDate = addDays(task.endDate, deltaDays);
      
      // Validate the move (including project boundary checks)
      const validation = validateTaskMove(task, newStartDate, tasks);
      const conflicts = detectScheduleConflicts(task, newStartDate, newEndDate, tasks);
      
      // Add boundary validation
      if (newStartDate < projectStartDate) {
        validation.isValid = false;
        validation.errors.push('Cannot start before project start date');
      }
      if (newEndDate > projectEndDate) {
        validation.warnings.push('Task extends beyond project end date');
      }
      
      setDragState(prev => ({
        ...prev,
        currentX: node.position.x,
        newStartDate,
        newEndDate,
        validation,
        conflicts,
      }));
    },
    [dragState.isDragging, dragState.originalX, tasks, projectStartDate, projectEndDate]
  );

  // Handle drag stop
  const handleNodeDragStop: NodeDragHandler = useCallback(
    (_, node) => {
      if (node.type !== 'task' || !dragState.isDragging) return;
      
      const taskData = node.data as TaskNodeData;
      const task = taskData.task;
      
      // Check if drag was cancelled (invalid move or no change)
      const deltaX = node.position.x - dragState.originalX;
      const deltaDays = pixelsToDays(deltaX);
      const isCancelled = deltaDays === 0 || (dragState.validation && !dragState.validation.isValid);
      
      if (!isCancelled && dragState.newStartDate && dragState.newEndDate && onTaskUpdate) {
        // Apply the update
        const updatedTask: TimelineTask = {
          ...task,
          startDate: dragState.newStartDate,
          endDate: dragState.newEndDate,
        };
        onTaskUpdate(updatedTask);
      }
      
      // Reset drag state
      setDragState(initialDragState);
      dragStartPositionRef.current = null;
      
      onDragEnd?.(task.id, isCancelled);
    },
    [dragState, onTaskUpdate, onDragEnd]
  );

  // Constrain node movement to horizontal only
  const handleNodesChange = useCallback(
    (changes: Parameters<typeof onNodesChange>[0]) => {
      // For position changes during drag, lock Y position
      const constrainedChanges = changes.map(change => {
        if (
          change.type === 'position' &&
          change.dragging &&
          dragStartPositionRef.current
        ) {
          return {
            ...change,
            position: change.position
              ? { x: change.position.x, y: dragStartPositionRef.current.y }
              : undefined,
          };
        }
        return change;
      });
      
      onNodesChange(constrainedChanges);
    },
    [onNodesChange]
  );

  return (
    <div className={cn('w-full h-[600px] border rounded-lg bg-background', className)}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={handleNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onNodeDragStart={handleNodeDragStart}
        onNodeDrag={handleNodeDrag}
        onNodeDragStop={handleNodeDragStop}
        nodeTypes={nodeTypes}
        fitView
        minZoom={0.3}
        maxZoom={1.5}
        defaultViewport={{ x: 0, y: 0, zoom: 0.8 }}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={true}
        selectNodesOnDrag={false}
      >
        <Background color="#e5e7eb" gap={PIXELS_PER_DAY} />
        <Controls position="bottom-right" />
        <MiniMap 
          nodeStrokeColor={node => {
            if (node.type === 'task') {
              return STATUS_COLORS[(node.data as TaskNodeData).task.status].replace('bg-', '#');
            }
            return '#64748b';
          }}
          nodeColor={node => {
            if (node.type === 'phase') {
              return (node.data as PhaseNodeData).phase.color;
            }
            return '#f1f5f9';
          }}
          position="top-right"
        />
        
        {/* Controls Panel */}
        <Panel position="top-left" className="bg-background border rounded-lg p-3 shadow-sm">
          <div className="flex flex-wrap gap-4">
            {/* View Mode */}
            <div className="flex items-center gap-2">
              <Label className="text-xs">View:</Label>
              <Select
                value={viewOptions.viewMode}
                onValueChange={(value: 'day' | 'week' | 'month') =>
                  setViewOptions(prev => ({ ...prev, viewMode: value }))
                }
              >
                <SelectTrigger className="h-7 w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="day">Day</SelectItem>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Show Dependencies */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-deps"
                checked={viewOptions.showDependencies}
                onCheckedChange={checked =>
                  setViewOptions(prev => ({ ...prev, showDependencies: checked }))
                }
              />
              <Label htmlFor="show-deps" className="text-xs">Dependencies</Label>
            </div>
            
            {/* Show Progress */}
            <div className="flex items-center gap-2">
              <Switch
                id="show-progress"
                checked={viewOptions.showProgress}
                onCheckedChange={checked =>
                  setViewOptions(prev => ({ ...prev, showProgress: checked }))
                }
              />
              <Label htmlFor="show-progress" className="text-xs">Progress</Label>
            </div>
            
            {/* Critical Path */}
            <div className="flex items-center gap-2">
              <Switch
                id="critical-path"
                checked={viewOptions.highlightCriticalPath}
                onCheckedChange={checked =>
                  setViewOptions(prev => ({ ...prev, highlightCriticalPath: checked }))
                }
              />
              <Label htmlFor="critical-path" className="text-xs text-red-500">Critical Path</Label>
            </div>
          </div>
        </Panel>
        
        {/* Drag Info Panel */}
        {dragState.isDragging && (
          <Panel position="top-center" className="bg-background border rounded-lg p-2 shadow-lg">
            <div className="text-xs space-y-1">
              <div className="font-medium">
                {dragState.newStartDate && dayjs(dragState.newStartDate).format('MMM D')}
                {' → '}
                {dragState.newEndDate && dayjs(dragState.newEndDate).format('MMM D')}
              </div>
              {dragState.validation && !dragState.validation.isValid && (
                <div className="text-red-500 flex items-center gap-1">
                  <IconAlertTriangle className="h-3 w-3" />
                  {dragState.validation.errors[0]}
                </div>
              )}
              {dragState.conflicts?.hasConflicts && (
                <div className="text-amber-500 flex items-center gap-1">
                  <IconAlertTriangle className="h-3 w-3" />
                  {dragState.conflicts.conflicts.length} conflict(s)
                </div>
              )}
            </div>
          </Panel>
        )}
        
        {/* Legend Panel */}
        <Panel position="bottom-left" className="bg-background border rounded-lg p-2 shadow-sm">
          <div className="flex gap-3 text-[10px]">
            {Object.entries(STATUS_COLORS).map(([status, color]) => (
              <div key={status} className="flex items-center gap-1">
                <div className={cn('w-2 h-2 rounded-full', color)} />
                <span className="capitalize">{status.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
}

// =============================================================================
// SIMPLE GANTT (Non-React Flow version for simpler use cases)
// =============================================================================

export function SimpleGantt({
  tasks,
  projectStartDate,
  className,
}: {
  tasks: TimelineTask[];
  projectStartDate: Date;
  className?: string;
}) {
  const totalDays = useMemo(() => {
    const lastTask = tasks.reduce(
      (latest, t) => t.endDate > latest ? t.endDate : latest,
      projectStartDate
    );
    return getDurationDays(projectStartDate, lastTask) + 5;
  }, [tasks, projectStartDate]);

  return (
    <div className={cn('w-full overflow-x-auto', className)}>
      {/* Date header */}
      <div
        className="flex border-b bg-muted/50"
        style={{ width: `${PHASE_LABEL_WIDTH + totalDays * PIXELS_PER_DAY}px` }}
      >
        <div className="w-[150px] flex-shrink-0 p-2 font-medium text-sm">Task</div>
        <div className="flex">
          {Array.from({ length: totalDays }, (_, i) => {
            const date = new Date(projectStartDate);
            date.setDate(date.getDate() + i);
            return (
              <div
                key={i}
                className="text-center text-[10px] text-muted-foreground border-l"
                style={{ width: `${PIXELS_PER_DAY}px` }}
              >
                {dayjs(date).format('M/D')}
              </div>
            );
          })}
        </div>
      </div>
      
      {/* Task rows */}
      {tasks.map(task => {
        const dayOffset = getDayOffset(task.startDate, projectStartDate);
        const durationDays = getDurationDays(task.startDate, task.endDate);
        
        return (
          <div
            key={task.id}
            className="flex border-b hover:bg-muted/30"
            style={{ width: `${PHASE_LABEL_WIDTH + totalDays * PIXELS_PER_DAY}px` }}
          >
            <div className="w-[150px] flex-shrink-0 p-2 text-sm truncate">
              {task.name}
            </div>
            <div className="relative flex-1">
              <div
                className={cn(
                  'absolute top-1 bottom-1 rounded',
                  STATUS_COLORS[task.status]
                )}
                style={{
                  left: `${dayOffset * PIXELS_PER_DAY}px`,
                  width: `${durationDays * PIXELS_PER_DAY}px`,
                }}
              >
                <div
                  className="h-full bg-white/30"
                  style={{ width: `${task.progress}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
