"use client";

import { create } from "zustand";
import type { Person } from "./types";

/**
 * UI-only store for the scheduler. Data (projects / phases / tasks / people)
 * now comes from Supabase via react-query hooks (`@/hooks/use-scheduler`); this
 * store holds nothing but the cross-view filter state.
 */
interface SchedulerUiState {
  tradeFilter: string | null;
  assigneeFilter: string | null;
  setTradeFilter: (t: string | null) => void;
  setAssigneeFilter: (a: string | null) => void;
}

export const useScheduler = create<SchedulerUiState>((set) => ({
  tradeFilter: null,
  assigneeFilter: null,
  setTradeFilter: (t) => set({ tradeFilter: t }),
  setAssigneeFilter: (a) => set({ assigneeFilter: a }),
}));

/* ---------- helpers ---------- */

export function personById(people: Person[], id?: string) {
  return people.find((p) => p.id === id);
}
