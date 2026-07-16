"use client";

import { create } from "zustand";
import { seedData } from "./seed";
import type { Person, Phase, Project, Task, TaskStatus } from "./types";

interface SchedulerState {
  projects: Project[];
  phases: Phase[];
  tasks: Task[];
  people: Person[];

  /** filters shared across views */
  tradeFilter: string | null;
  assigneeFilter: string | null;
  setTradeFilter: (t: string | null) => void;
  setAssigneeFilter: (a: string | null) => void;

  setTaskStatus: (taskId: string, status: TaskStatus) => void;
  shiftTask: (taskId: string, days: number) => void;
  updateTask: (taskId: string, patch: Partial<Task>) => void;
}

export const useScheduler = create<SchedulerState>((set) => ({
  projects: seedData.projects,
  phases: seedData.phases,
  tasks: seedData.tasks,
  people: seedData.people,

  tradeFilter: null,
  assigneeFilter: null,
  setTradeFilter: (t) => set({ tradeFilter: t }),
  setAssigneeFilter: (a) => set({ assigneeFilter: a }),

  setTaskStatus: (taskId, status) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, status } : t)),
    })),

  shiftTask: (taskId, days) =>
    set((s) => ({
      tasks: s.tasks.map((t) => {
        if (t.id !== taskId) return t;
        return {
          ...t,
          startDate: shiftIso(t.startDate, days),
          endDate: shiftIso(t.endDate, days),
        };
      }),
    })),

  updateTask: (taskId, patch) =>
    set((s) => ({
      tasks: s.tasks.map((t) => (t.id === taskId ? { ...t, ...patch } : t)),
    })),
}));

function shiftIso(iso: string, days: number) {
  const dt = new Date(`${iso}T00:00:00`);
  dt.setDate(dt.getDate() + days);
  return dt.toISOString().slice(0, 10);
}

/* ---------- selectors / helpers ---------- */

export function useProject(projectId: string) {
  return useScheduler((s) => s.projects.find((p) => p.id === projectId));
}

export function personById(people: Person[], id?: string) {
  return people.find((p) => p.id === id);
}
