"use client";

import { useState } from "react";
import { useProjectData } from "@/lib/scheduler/use-project-data";
import { useScheduler } from "@/lib/scheduler/store";
import { Filters, useFilteredTasks } from "@/components/scheduler/filters";
import { Avatar, Dot } from "@/components/scheduler/primitives";
import {
  TASK_STATUS_META,
  TASK_STATUS_ORDER,
  TRADE_META,
  type Person,
  type Task,
  type TaskStatus,
} from "@/lib/scheduler/types";
import { fmtRange, fmtMoney } from "@/lib/scheduler/dates";
import { cn } from "@/lib/utils";

export function BoardView({ projectId }: { projectId: string }) {
  const { phases, tasks, people } = useProjectData(projectId);
  const setTaskStatus = useScheduler((s) => s.setTaskStatus);
  const filtered = useFilteredTasks(tasks);

  const [dragId, setDragId] = useState<string | null>(null);
  const [over, setOver] = useState<TaskStatus | null>(null);

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card px-8 py-2.5">
        <Filters projectTasks={tasks} people={people} />
        <span className="text-xs text-muted-foreground">drag cards to update status</span>
      </div>

      <div className="min-h-0 flex-1 overflow-x-auto px-8 py-5">
        <div className="flex h-full gap-4">
          {TASK_STATUS_ORDER.map((status) => {
            const meta = TASK_STATUS_META[status];
            const cards = filtered.filter((t) => t.status === status);
            const isOver = over === status;
            return (
              <div
                key={status}
                onDragOver={(e) => {
                  e.preventDefault();
                  setOver(status);
                }}
                onDragLeave={() => setOver((o) => (o === status ? null : o))}
                onDrop={() => {
                  if (dragId) setTaskStatus(dragId, status);
                  setDragId(null);
                  setOver(null);
                }}
                className={cn(
                  "flex w-[280px] shrink-0 flex-col rounded-xl border transition",
                  isOver ? "border-primary bg-accent/20" : "border-border bg-muted/40"
                )}
              >
                <div className="flex items-center justify-between px-3 py-2.5">
                  <div className="flex items-center gap-2 text-sm font-semibold">
                    <Dot color={meta.dot} />
                    {meta.label}
                  </div>
                  <span className="rounded-full bg-card px-2 py-0.5 text-xs text-muted-foreground">
                    {cards.length}
                  </span>
                </div>

                <div className="flex-1 space-y-2 overflow-y-auto px-2 pb-2 scrollbar-hide">
                  {cards.map((t) => (
                    <BoardCard
                      key={t.id}
                      task={t}
                      phaseName={phases.find((p) => p.id === t.phaseId)?.name ?? ""}
                      person={people.find((p) => p.id === t.assigneeId)}
                      dragging={dragId === t.id}
                      onDragStart={() => setDragId(t.id)}
                      onDragEnd={() => {
                        setDragId(null);
                        setOver(null);
                      }}
                    />
                  ))}
                  {cards.length === 0 && (
                    <div className="rounded-lg border border-dashed py-6 text-center text-xs text-muted-foreground">
                      Drop here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function BoardCard({
  task,
  phaseName,
  person,
  dragging,
  onDragStart,
  onDragEnd,
}: {
  task: Task;
  phaseName: string;
  person?: Person;
  dragging: boolean;
  onDragStart: () => void;
  onDragEnd: () => void;
}) {
  const trade = TRADE_META[task.trade];
  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      className={cn(
        "cursor-grab rounded-lg border bg-card p-3 shadow-sm transition active:cursor-grabbing",
        dragging && "opacity-40"
      )}
      style={{ borderLeft: `3px solid ${trade.color}` }}
    >
      <div className="text-[11px] font-medium text-muted-foreground">{phaseName}</div>
      <div className="mt-0.5 text-sm font-medium leading-snug">{task.title}</div>
      <div className="mt-2 flex items-center justify-between">
        <span
          className="rounded-full px-2 py-0.5 text-[11px] font-medium"
          style={{
            color: trade.color,
            background: `color-mix(in srgb, ${trade.color} 14%, transparent)`,
          }}
        >
          {trade.label}
        </span>
        <Avatar person={person} size={22} />
      </div>
      <div className="mt-2 flex items-center justify-between text-[11px] text-muted-foreground">
        <span>{fmtRange(task.startDate, task.endDate)}</span>
        <span className="tabular-nums">{fmtMoney(task.cost, { compact: true })}</span>
      </div>
    </div>
  );
}
