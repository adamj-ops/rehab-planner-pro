"use client";

import { useProjectData } from "@/lib/scheduler/use-project-data";
import { useSetTaskStatus } from "@/hooks/use-scheduler";
import { isScheduled } from "@/lib/scheduler/map";
import { Filters, useFilteredTasks } from "@/components/scheduler/filters";
import { StatusPill } from "@/components/scheduler/status-pill";
import { Avatar, Badge, Dot } from "@/components/scheduler/primitives";
import { ViewMessage, errorMessage } from "@/components/scheduler/view-state";
import { TRADE_META } from "@/lib/scheduler/types";
import { durationDays, fmtMoney, fmtRange } from "@/lib/scheduler/dates";

export function TableView({ projectId }: { projectId: string }) {
  const { phases, tasks, people, isLoading, isError, error } =
    useProjectData(projectId);
  const setTaskStatus = useSetTaskStatus();
  const filtered = useFilteredTasks(tasks);

  if (isLoading) return <ViewMessage>Loading tasks…</ViewMessage>;
  if (isError) return <ViewMessage>{errorMessage(error)}</ViewMessage>;
  if (tasks.length === 0) return <ViewMessage>No tasks yet.</ViewMessage>;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card px-8 py-2.5">
        <Filters projectTasks={tasks} people={people} />
        <span className="text-xs text-muted-foreground">{filtered.length} tasks</span>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-8 py-5">
        <div className="min-w-[880px] overflow-hidden rounded-xl border bg-card">
          {/* Column header */}
          <div className="grid grid-cols-[minmax(220px,2fr)_130px_120px_150px_150px_90px_110px] items-center gap-2 border-b bg-muted/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            <span>Task</span>
            <span>Status</span>
            <span>Trade</span>
            <span>Assignee</span>
            <span>Dates</span>
            <span>Days</span>
            <span className="text-right">Cost</span>
          </div>

          {phases.map((phase) => {
            const rows = filtered.filter((t) => t.phaseId === phase.id);
            if (rows.length === 0) return null;
            const phaseCost = rows.reduce((s, t) => s + (t.cost ?? 0), 0);
            return (
              <div key={phase.id}>
                <div className="flex items-center gap-2 border-b bg-muted/30 px-4 py-1.5">
                  <span className="h-2.5 w-2.5 rounded-sm" style={{ background: phase.color }} />
                  <span className="text-xs font-semibold">{phase.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {rows.length} · {fmtMoney(phaseCost, { compact: true })}
                  </span>
                </div>
                {rows.map((t) => {
                  const person = people.find((p) => p.id === t.assigneeId);
                  const trade = TRADE_META[t.trade];
                  const scheduled = isScheduled(t);
                  return (
                    <div
                      key={t.id}
                      className="grid grid-cols-[minmax(220px,2fr)_130px_120px_150px_150px_90px_110px] items-center gap-2 border-b border-border/70 px-4 py-2.5 text-sm last:border-0 hover:bg-muted/60"
                    >
                      <div className="min-w-0">
                        <div className="truncate font-medium">{t.title}</div>
                        {t.dependsOn.length > 0 && (
                          <div className="mt-0.5 text-[11px] text-muted-foreground">
                            depends on {t.dependsOn.length}
                          </div>
                        )}
                      </div>
                      <StatusPill
                        status={t.status}
                        onChange={(s) =>
                          setTaskStatus.mutate({ taskId: t.id, projectId, status: s })
                        }
                      />
                      <Badge color={trade.color}>
                        <Dot color={trade.color} size={6} />
                        {trade.label}
                      </Badge>
                      <div className="flex items-center gap-1.5">
                        <Avatar person={person} size={22} />
                        <span className="truncate text-xs text-muted-foreground">
                          {person?.name ?? "—"}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {scheduled ? fmtRange(t.startDate, t.endDate) : "—"}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {scheduled ? `${durationDays(t.startDate, t.endDate)}d` : "—"}
                      </span>
                      <span className="text-right text-xs font-medium tabular-nums">
                        {fmtMoney(t.cost, { compact: true })}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
