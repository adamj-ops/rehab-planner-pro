/**
 * Auto-Scheduling Engine
 * 
 * Implements topological sorting for dependency-aware scheduling
 * and critical path method (CPM) for optimization.
 */

import { 
  TimelineTask, 
  TimelinePhase, 
  TimelineMilestone,
  TimelineConfig,
  ScheduleResult,
  ScheduleConflict 
} from './types';

// =============================================================================
// SCHEDULING ENGINE
// =============================================================================

export class SchedulingEngine {
  /**
   * Main entry point - schedule all tasks respecting dependencies
   */
  static scheduleProject(
    tasks: Omit<TimelineTask, 'startDate' | 'endDate'>[],
    config: TimelineConfig
  ): ScheduleResult {
    const conflicts: ScheduleConflict[] = [];
    
    // Step 1: Topological sort for dependency order
    const { sorted, hasCycle, cycleNodes } = this.topologicalSort(tasks);
    
    if (hasCycle) {
      conflicts.push({
        type: 'dependency_violation',
        severity: 'error',
        affectedTaskIds: cycleNodes,
        description: 'Circular dependency detected',
        suggestedFix: 'Remove one of the dependency relationships between these tasks',
      });
      // Continue with partial schedule
    }
    
    // Step 2: Forward pass - calculate earliest start times
    const scheduledTasks = this.forwardPass(sorted, config);
    
    // Step 3: Calculate phases from tasks
    const phases = this.calculatePhases(scheduledTasks, config);
    
    // Step 4: Generate milestones
    const milestones = this.generateMilestones(scheduledTasks, phases, config);
    
    // Step 5: Backward pass for slack calculation
    const { criticalPath, slack } = this.backwardPass(scheduledTasks, config);
    
    // Step 6: Validate schedule
    const validationConflicts = this.validateSchedule(scheduledTasks, config);
    conflicts.push(...validationConflicts);
    
    // Calculate metrics
    const totalDays = this.calculateWorkingDays(
      config.projectStartDate,
      scheduledTasks.reduce(
        (latest, task) => task.endDate > latest ? task.endDate : latest,
        config.projectStartDate
      ),
      config
    );
    
    const criticalPathDays = criticalPath.reduce((sum, taskId) => {
      const task = scheduledTasks.find(t => t.id === taskId);
      return sum + (task?.durationDays || 0);
    }, 0);
    
    return {
      tasks: scheduledTasks,
      phases,
      milestones,
      conflicts,
      metrics: {
        totalDays,
        criticalPath,
        criticalPathDays,
        slack,
        utilization: this.calculateUtilization(scheduledTasks, totalDays),
      },
    };
  }

  /**
   * Topological sort using Kahn's algorithm
   */
  private static topologicalSort(
    tasks: Omit<TimelineTask, 'startDate' | 'endDate'>[]
  ): { sorted: typeof tasks; hasCycle: boolean; cycleNodes: string[] } {
    const inDegree = new Map<string, number>();
    const adjacency = new Map<string, string[]>();
    
    // Initialize
    tasks.forEach(task => {
      inDegree.set(task.id, 0);
      adjacency.set(task.id, []);
    });
    
    // Build graph
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const deps = adjacency.get(depId);
        if (deps) deps.push(task.id);
        inDegree.set(task.id, (inDegree.get(task.id) || 0) + 1);
      });
    });
    
    // Find all nodes with no incoming edges
    const queue: string[] = [];
    inDegree.forEach((degree, id) => {
      if (degree === 0) queue.push(id);
    });
    
    const sorted: typeof tasks = [];
    const taskMap = new Map(tasks.map(t => [t.id, t]));
    
    while (queue.length > 0) {
      const id = queue.shift()!;
      const task = taskMap.get(id);
      if (task) sorted.push(task);
      
      const neighbors = adjacency.get(id) || [];
      neighbors.forEach(neighborId => {
        const newDegree = (inDegree.get(neighborId) || 1) - 1;
        inDegree.set(neighborId, newDegree);
        if (newDegree === 0) queue.push(neighborId);
      });
    }
    
    // Check for cycle
    const hasCycle = sorted.length !== tasks.length;
    const cycleNodes = hasCycle
      ? tasks.filter(t => !sorted.some(s => s.id === t.id)).map(t => t.id)
      : [];
    
    return { sorted, hasCycle, cycleNodes };
  }

  /**
   * Forward pass - calculate earliest start dates
   */
  private static forwardPass(
    sortedTasks: Omit<TimelineTask, 'startDate' | 'endDate'>[],
    config: TimelineConfig
  ): TimelineTask[] {
    const scheduled: TimelineTask[] = [];
    const earliestStart = new Map<string, Date>();
    
    sortedTasks.forEach(task => {
      // Calculate earliest start based on dependencies
      let taskStart = config.projectStartDate;
      
      if (task.dependencies.length > 0) {
        task.dependencies.forEach(depId => {
          const depTask = scheduled.find(t => t.id === depId);
          if (depTask && depTask.endDate > taskStart) {
            taskStart = this.addWorkingDays(depTask.endDate, 1, config);
          }
        });
      }
      
      // Phase-based grouping (later phases start after earlier ones)
      const earlierPhaseTasks = scheduled.filter(t => t.phase < task.phase);
      if (earlierPhaseTasks.length > 0) {
        const latestPhaseEnd = earlierPhaseTasks.reduce(
          (latest, t) => t.endDate > latest ? t.endDate : latest,
          config.projectStartDate
        );
        if (latestPhaseEnd > taskStart) {
          taskStart = this.addWorkingDays(latestPhaseEnd, 1, config);
        }
      }
      
      earliestStart.set(task.id, taskStart);
      
      const taskEnd = this.addWorkingDays(taskStart, task.durationDays, config);
      
      scheduled.push({
        ...task,
        startDate: taskStart,
        endDate: taskEnd,
        dependents: this.findDependents(task.id, sortedTasks),
      });
    });
    
    return scheduled;
  }

  /**
   * Backward pass - calculate latest dates and slack
   */
  private static backwardPass(
    scheduledTasks: TimelineTask[],
    config: TimelineConfig
  ): { criticalPath: string[]; slack: Record<string, number> } {
    const latestFinish = new Map<string, Date>();
    const slack: Record<string, number> = {};
    
    // Find project end (latest task end)
    const projectEnd = scheduledTasks.reduce(
      (latest, task) => task.endDate > latest ? task.endDate : latest,
      config.projectStartDate
    );
    
    // Process in reverse order
    const reversed = [...scheduledTasks].reverse();
    
    reversed.forEach(task => {
      // Calculate latest finish based on dependents
      let taskLatestFinish = projectEnd;
      
      task.dependents.forEach(depId => {
        const depTask = scheduledTasks.find(t => t.id === depId);
        if (depTask) {
          const depLatestStart = this.subtractWorkingDays(depTask.startDate, 1, config);
          if (depLatestStart < taskLatestFinish) {
            taskLatestFinish = depLatestStart;
          }
        }
      });
      
      latestFinish.set(task.id, taskLatestFinish);
      
      // Calculate slack
      const taskSlack = this.calculateWorkingDays(task.endDate, taskLatestFinish, config);
      slack[task.id] = Math.max(0, taskSlack);
    });
    
    // Critical path = tasks with 0 slack
    const criticalPath = scheduledTasks
      .filter(task => slack[task.id] === 0)
      .map(task => task.id);
    
    return { criticalPath, slack };
  }

  /**
   * Calculate phases from tasks
   */
  private static calculatePhases(
    tasks: TimelineTask[],
    config: TimelineConfig
  ): TimelinePhase[] {
    const phaseNumbers = [...new Set(tasks.map(t => t.phase))].sort();
    
    const phaseColors = [
      '#3B82F6', // Blue
      '#10B981', // Green
      '#F59E0B', // Yellow
      '#EF4444', // Red
      '#8B5CF6', // Purple
      '#EC4899', // Pink
    ];
    
    const phaseNames = [
      'Pre-Construction',
      'Demolition & Prep',
      'Structural & Systems',
      'Rough-In',
      'Finishes',
      'Final Details',
    ];
    
    return phaseNumbers.map((phaseNum, index) => {
      const phaseTasks = tasks.filter(t => t.phase === phaseNum);
      const startDate = phaseTasks.reduce(
        (earliest, t) => t.startDate < earliest ? t.startDate : earliest,
        phaseTasks[0]?.startDate || config.projectStartDate
      );
      const endDate = phaseTasks.reduce(
        (latest, t) => t.endDate > latest ? t.endDate : latest,
        startDate
      );
      
      return {
        id: `phase-${phaseNum}`,
        name: phaseNames[phaseNum - 1] || `Phase ${phaseNum}`,
        number: phaseNum,
        startDate,
        endDate,
        tasks: phaseTasks.map(t => t.id),
        color: phaseColors[index % phaseColors.length],
      };
    });
  }

  /**
   * Generate automatic milestones
   */
  private static generateMilestones(
    tasks: TimelineTask[],
    phases: TimelinePhase[],
    config: TimelineConfig
  ): TimelineMilestone[] {
    const milestones: TimelineMilestone[] = [];
    
    // Project start milestone
    milestones.push({
      id: 'milestone-start',
      name: 'Project Kickoff',
      date: config.projectStartDate,
      type: 'start',
    });
    
    // Phase completion milestones
    phases.forEach(phase => {
      milestones.push({
        id: `milestone-phase-${phase.number}`,
        name: `${phase.name} Complete`,
        date: phase.endDate,
        type: 'deadline',
        relatedTaskIds: phase.tasks,
      });
    });
    
    // Project end milestone
    const projectEnd = tasks.reduce(
      (latest, t) => t.endDate > latest ? t.endDate : latest,
      config.projectStartDate
    );
    
    milestones.push({
      id: 'milestone-end',
      name: 'Project Complete',
      date: projectEnd,
      type: 'deadline',
    });
    
    return milestones;
  }

  /**
   * Validate the schedule for conflicts
   */
  private static validateSchedule(
    tasks: TimelineTask[],
    config: TimelineConfig
  ): ScheduleConflict[] {
    const conflicts: ScheduleConflict[] = [];
    
    // Check for tasks before project start
    tasks.forEach(task => {
      if (task.startDate < config.projectStartDate) {
        conflicts.push({
          type: 'impossible_date',
          severity: 'error',
          affectedTaskIds: [task.id],
          description: `Task "${task.name}" starts before project start date`,
          suggestedFix: 'Adjust task dependencies or project start date',
        });
      }
    });
    
    // Check for tasks after project end (with buffer)
    const hardDeadline = this.addWorkingDays(
      config.projectEndDate,
      config.bufferDays,
      config
    );
    
    tasks.forEach(task => {
      if (task.endDate > hardDeadline) {
        conflicts.push({
          type: 'impossible_date',
          severity: 'warning',
          affectedTaskIds: [task.id],
          description: `Task "${task.name}" ends after project deadline`,
          suggestedFix: 'Consider parallel execution or scope reduction',
        });
      }
    });
    
    // Check for dependency violations
    tasks.forEach(task => {
      task.dependencies.forEach(depId => {
        const depTask = tasks.find(t => t.id === depId);
        if (depTask && task.startDate < depTask.endDate) {
          conflicts.push({
            type: 'dependency_violation',
            severity: 'error',
            affectedTaskIds: [task.id, depId],
            description: `Task "${task.name}" starts before dependency "${depTask.name}" completes`,
            suggestedFix: 'Adjust start dates or remove dependency',
          });
        }
      });
    });
    
    return conflicts;
  }

  // =========================================================================
  // HELPER METHODS
  // =========================================================================

  private static findDependents(
    taskId: string,
    tasks: Omit<TimelineTask, 'startDate' | 'endDate'>[]
  ): string[] {
    return tasks.filter(t => t.dependencies.includes(taskId)).map(t => t.id);
  }

  private static addWorkingDays(
    date: Date,
    days: number,
    config: TimelineConfig
  ): Date {
    const result = new Date(date);
    let addedDays = 0;
    
    while (addedDays < days) {
      result.setDate(result.getDate() + 1);
      
      const dayOfWeek = result.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = config.holidayDates.some(
        h => h.toDateString() === result.toDateString()
      );
      
      if (!isWeekend && !isHoliday) {
        addedDays++;
      }
    }
    
    return result;
  }

  private static subtractWorkingDays(
    date: Date,
    days: number,
    config: TimelineConfig
  ): Date {
    const result = new Date(date);
    let subtractedDays = 0;
    
    while (subtractedDays < days) {
      result.setDate(result.getDate() - 1);
      
      const dayOfWeek = result.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = config.holidayDates.some(
        h => h.toDateString() === result.toDateString()
      );
      
      if (!isWeekend && !isHoliday) {
        subtractedDays++;
      }
    }
    
    return result;
  }

  private static calculateWorkingDays(
    startDate: Date,
    endDate: Date,
    config: TimelineConfig
  ): number {
    let workingDays = 0;
    const current = new Date(startDate);
    
    while (current < endDate) {
      current.setDate(current.getDate() + 1);
      
      const dayOfWeek = current.getDay();
      const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
      const isHoliday = config.holidayDates.some(
        h => h.toDateString() === current.toDateString()
      );
      
      if (!isWeekend && !isHoliday) {
        workingDays++;
      }
    }
    
    return workingDays;
  }

  private static calculateUtilization(
    tasks: TimelineTask[],
    totalDays: number
  ): number {
    if (totalDays === 0) return 0;
    
    const totalTaskDays = tasks.reduce((sum, t) => sum + t.durationDays, 0);
    return Math.min(1, totalTaskDays / totalDays);
  }
}

// =============================================================================
// SCHEDULE OPTIMIZER
// =============================================================================

export class ScheduleOptimizer {
  /**
   * Compress schedule by parallelizing independent tasks
   */
  static compressSchedule(
    result: ScheduleResult,
    config: TimelineConfig
  ): ScheduleResult {
    // Re-schedule with aggressive parallelization
    const tasks = result.tasks.map(t => ({
      ...t,
      // Allow parallel execution where dependencies allow
    }));
    
    return SchedulingEngine.scheduleProject(tasks, config);
  }

  /**
   * Level resources by spreading work evenly
   */
  static levelResources(
    result: ScheduleResult,
    maxParallelTasks: number = 3
  ): ScheduleResult {
    // Group tasks by start date
    const tasksByDate = new Map<string, TimelineTask[]>();
    
    result.tasks.forEach(task => {
      const dateKey = task.startDate.toISOString().split('T')[0];
      const existing = tasksByDate.get(dateKey) || [];
      existing.push(task);
      tasksByDate.set(dateKey, existing);
    });
    
    // Find dates with too many parallel tasks
    const overloadedDates = Array.from(tasksByDate.entries())
      .filter(([_, tasks]) => tasks.length > maxParallelTasks);
    
    // TODO: Implement resource leveling algorithm
    // For now, return unchanged
    return result;
  }

  /**
   * Suggest schedule improvements
   */
  static suggestImprovements(result: ScheduleResult): string[] {
    const suggestions: string[] = [];
    
    // Suggest parallelization
    const highSlackTasks = result.tasks.filter(
      t => (result.metrics.slack[t.id] || 0) > 5
    );
    
    if (highSlackTasks.length > 3) {
      suggestions.push(
        `${highSlackTasks.length} tasks have significant slack. Consider starting them earlier to reduce risk.`
      );
    }
    
    // Suggest critical path optimization
    if (result.metrics.criticalPath.length > 5) {
      suggestions.push(
        'Long critical path detected. Consider adding resources to critical tasks to compress timeline.'
      );
    }
    
    // Suggest phase balancing
    const phaseDurations = result.phases.map(p => {
      const start = p.startDate.getTime();
      const end = p.endDate.getTime();
      return (end - start) / (1000 * 60 * 60 * 24);
    });
    
    const maxPhase = Math.max(...phaseDurations);
    const avgPhase = phaseDurations.reduce((a, b) => a + b, 0) / phaseDurations.length;
    
    if (maxPhase > avgPhase * 2) {
      suggestions.push(
        'One phase is significantly longer than others. Consider breaking it into sub-phases.'
      );
    }
    
    return suggestions;
  }
}
