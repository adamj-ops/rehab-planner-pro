"use client";

import { X } from "lucide-react";
import { useScheduler } from "@/lib/scheduler/store";
import { TRADE_META, type Person, type Task } from "@/lib/scheduler/types";
import { Avatar, Dot } from "@/components/scheduler/primitives";
import { cn } from "@/lib/utils";

/** Trade + assignee filter chips shared by every view. */
export function Filters({ projectTasks, people }: { projectTasks: Task[]; people: Person[] }) {
  const { tradeFilter, assigneeFilter, setTradeFilter, setAssigneeFilter } = useScheduler();

  const trades = Array.from(new Set(projectTasks.map((t) => t.trade)));
  const assigneeIds = Array.from(
    new Set(projectTasks.map((t) => t.assigneeId).filter(Boolean) as string[])
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap items-center gap-1.5">
        {trades.map((tr) => {
          const meta = TRADE_META[tr];
          const active = tradeFilter === tr;
          return (
            <button
              key={tr}
              onClick={() => setTradeFilter(active ? null : tr)}
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs transition",
                active
                  ? "border-transparent text-white"
                  : "border-border bg-card text-muted-foreground hover:bg-muted/60"
              )}
              style={active ? { background: meta.color } : undefined}
            >
              <Dot color={active ? "#fff" : meta.color} size={7} />
              {meta.label}
            </button>
          );
        })}
      </div>

      <span className="mx-1 h-4 w-px bg-border" />

      <div className="flex items-center gap-1">
        {assigneeIds.map((id) => {
          const person = people.find((p) => p.id === id);
          const active = assigneeFilter === id;
          return (
            <button
              key={id}
              onClick={() => setAssigneeFilter(active ? null : id)}
              className={cn(
                "rounded-full p-0.5 transition",
                active ? "ring-2 ring-foreground" : "opacity-70 hover:opacity-100"
              )}
              title={person?.name}
            >
              <Avatar person={person} size={24} />
            </button>
          );
        })}
      </div>

      {(tradeFilter || assigneeFilter) && (
        <button
          onClick={() => {
            setTradeFilter(null);
            setAssigneeFilter(null);
          }}
          className="ml-1 inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs text-muted-foreground hover:text-foreground"
        >
          <X size={12} /> Clear
        </button>
      )}
    </div>
  );
}

/** Apply the active filters to a task list. */
export function useFilteredTasks(tasks: Task[]) {
  const { tradeFilter, assigneeFilter } = useScheduler();
  return tasks.filter(
    (t) =>
      (!tradeFilter || t.trade === tradeFilter) &&
      (!assigneeFilter || t.assigneeId === assigneeFilter)
  );
}
