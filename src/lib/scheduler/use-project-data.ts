"use client";

import { useMemo } from "react";
import { useScheduler } from "./store";

/** Slice of the store scoped to one project, phases pre-sorted by order. */
export function useProjectData(projectId: string) {
  const { projects, phases, tasks, people } = useScheduler();

  return useMemo(() => {
    const project = projects.find((p) => p.id === projectId);
    const projectPhases = phases
      .filter((ph) => ph.projectId === projectId)
      .sort((a, b) => a.order - b.order);
    const projectTasks = tasks.filter((t) => t.projectId === projectId);
    return { project, phases: projectPhases, tasks: projectTasks, people };
  }, [projects, phases, tasks, people, projectId]);
}
