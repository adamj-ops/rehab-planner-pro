/**
 * Timeline & Scheduling Types
 */

export interface TimelineTask {
  id: string;
  name: string;
  description?: string;
  category: string;
  phase: number;
  
  // Scheduling
  startDate: Date;
  endDate: Date;
  durationDays: number;
  
  // Dependencies
  dependencies: string[]; // task IDs this depends on
  dependents: string[];   // task IDs that depend on this
  
  // Assignment
  assignedVendorId?: string;
  assignedVendorName?: string;
  
  // Status
  status: 'pending' | 'in_progress' | 'completed' | 'blocked' | 'delayed';
  progress: number; // 0-100
  
  // Metadata
  estimatedCost?: number;
  actualCost?: number;
  priority: 'must' | 'should' | 'could' | 'nice';
  
  // Visual
  color?: string;
  swimlane?: string; // For grouping in Gantt view
}

export interface TimelinePhase {
  id: string;
  name: string;
  number: number;
  startDate: Date;
  endDate: Date;
  tasks: string[];
  color: string;
}

export interface TimelineMilestone {
  id: string;
  name: string;
  date: Date;
  type: 'start' | 'deadline' | 'inspection' | 'payment' | 'custom';
  relatedTaskIds?: string[];
}

export interface TimelineConfig {
  projectStartDate: Date;
  projectEndDate: Date;
  workingDaysPerWeek: number; // Usually 5 or 6
  holidayDates: Date[];
  bufferDays: number; // Contingency at end
}

export interface ScheduleConflict {
  type: 'dependency_violation' | 'resource_conflict' | 'overlap' | 'impossible_date';
  severity: 'error' | 'warning';
  affectedTaskIds: string[];
  description: string;
  suggestedFix?: string;
}

export interface ScheduleResult {
  tasks: TimelineTask[];
  phases: TimelinePhase[];
  milestones: TimelineMilestone[];
  conflicts: ScheduleConflict[];
  metrics: {
    totalDays: number;
    criticalPath: string[];
    criticalPathDays: number;
    slack: Record<string, number>; // taskId -> days of slack
    utilization: number; // 0-1, how packed the schedule is
  };
}

export interface GanttViewOptions {
  viewMode: 'day' | 'week' | 'month';
  showDependencies: boolean;
  showProgress: boolean;
  showMilestones: boolean;
  groupBy: 'phase' | 'category' | 'vendor' | 'none';
  highlightCriticalPath: boolean;
  compactMode: boolean;
}
