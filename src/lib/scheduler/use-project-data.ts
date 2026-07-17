"use client";

import { useMemo } from "react";
import { useSchedulerProject } from "@/hooks/use-scheduler";
import type { Person, Phase, Project, Task } from "./types";

export interface ProjectDataResult {
  project: Project | null;
  phases: Phase[];
  tasks: Task[];
  people: Person[];
  isLoading: boolean;
  isError: boolean;
  error: unknown;
}

/**
 * Scheduler data scoped to one project, sourced from Supabase.
 * Phases arrive pre-sorted by order; the shape matches the old zustand slice so
 * the views keep working, with async flags added for loading/empty/error UI.
 */
export function useProjectData(projectId: string): ProjectDataResult {
  const query = useSchedulerProject(projectId);

  return useMemo(() => {
    const data = query.data;
    const phases = (data?.phases ?? []).slice().sort((a, b) => a.order - b.order);
    return {
      project: data?.project ?? null,
      phases,
      tasks: data?.tasks ?? [],
      people: data?.people ?? [],
      isLoading: query.isLoading,
      isError: query.isError,
      error: query.error,
    };
  }, [query.data, query.isLoading, query.isError, query.error]);
}
