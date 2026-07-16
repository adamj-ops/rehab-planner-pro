"use client";

import { Fragment, useMemo } from "react";
import { addDays, eachDayOfInterval, format, startOfWeek } from "date-fns";
import { useProjectData } from "@/lib/scheduler/use-project-data";
import { Filters, useFilteredTasks } from "@/components/scheduler/filters";
import { Avatar } from "@/components/scheduler/primitives";
import { TASK_STATUS_META, TRADE_META, type Person, type Task } from "@/lib/scheduler/types";
import { daysBetween, durationDays, toDate, TODAY } from "@/lib/scheduler/dates";
import { cn } from "@/lib/utils";

const DAY_W = 30; // px per day
const LABEL_W = 260; // px for the task-name column
const ROW_H = 38;

export function TimelineView({ projectId }: { projectId: string }) {
  const { phases, tasks, people } = useProjectData(projectId);
  const filtered = useFilteredTasks(tasks);

  const { days, rangeStart } = useMemo(() => {
    if (filtered.length === 0) {
      const s = startOfWeek(toDate(TODAY));
      return { days: eachDayOfInterval({ start: s, end: addDays(s, 27) }), rangeStart: s };
    }
    let min = toDate(filtered[0].startDate);
    let max = toDate(filtered[0].endDate);
    for (const t of filtered) {
      const s = toDate(t.startDate);
      const e = toDate(t.endDate);
      if (s < min) min = s;
      if (e > max) max = e;
    }
    const start = startOfWeek(addDays(min, -2));
    const end = addDays(max, 4);
    return { days: eachDayOfInterval({ start, end }), rangeStart: start };
  }, [filtered]);

  const gridW = days.length * DAY_W;
  const todayOffset = daysBetween(format(rangeStart, "yyyy-MM-dd"), TODAY);
  const todayX = todayOffset >= 0 && todayOffset < days.length ? todayOffset * DAY_W : null;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card px-8 py-2.5">
        <Filters projectTasks={tasks} people={people} />
        <div className="flex items-center gap-3 text-[11px] text-muted-foreground">
          {Object.entries(TASK_STATUS_META).map(([k, v]) => (
            <span key={k} className="inline-flex items-center gap-1">
              <span className="h-2 w-2 rounded-full" style={{ background: v.dot }} />
              {v.label}
            </span>
          ))}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto">
        <div style={{ width: LABEL_W + gridW }} className="relative">
          {/* Header */}
          <div className="sticky top-0 z-30 flex border-b bg-card">
            <div
              className="sticky left-0 z-10 shrink-0 border-r bg-card px-4 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              style={{ width: LABEL_W }}
            >
              Phase / Task
            </div>
            <div className="relative" style={{ width: gridW }}>
              <div className="flex">
                {days.map((day, i) => {
                  const isMonthStart = day.getDate() === 1 || i === 0;
                  const isToday = format(day, "yyyy-MM-dd") === TODAY;
                  const weekend = day.getDay() === 0 || day.getDay() === 6;
                  return (
                    <div
                      key={i}
                      className={cn(
                        "shrink-0 border-r text-center",
                        weekend && "bg-muted/40"
                      )}
                      style={{ width: DAY_W }}
                    >
                      <div className="h-3.5 text-[9px] font-medium text-primary">
                        {isMonthStart ? format(day, "MMM") : ""}
                      </div>
                      <div
                        className={cn(
                          "text-[10px] leading-tight text-muted-foreground",
                          isToday && "font-bold text-primary"
                        )}
                      >
                        {format(day, "EEEEE")}
                      </div>
                      <div
                        className={cn(
                          "text-[11px] leading-tight",
                          isToday ? "font-bold text-primary" : "text-muted-foreground"
                        )}
                      >
                        {format(day, "d")}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Today line spanning the body */}
          {todayX !== null && (
            <div
              className="pointer-events-none absolute z-20 w-px bg-primary/70"
              style={{ left: LABEL_W + todayX + DAY_W / 2, top: 46, bottom: 0 }}
            />
          )}

          {/* Rows grouped by phase */}
          {phases.map((phase) => {
            const rows = filtered
              .filter((t) => t.phaseId === phase.id)
              .sort((a, b) => a.startDate.localeCompare(b.startDate));
            if (rows.length === 0) return null;
            return (
              <Fragment key={phase.id}>
                {/* Phase header row */}
                <div className="flex border-b bg-muted/30">
                  <div
                    className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r bg-muted px-4 py-1.5"
                    style={{ width: LABEL_W }}
                  >
                    <span className="h-2.5 w-2.5 rounded-sm" style={{ background: phase.color }} />
                    <span className="text-xs font-semibold">{phase.name}</span>
                    <span className="text-[11px] text-muted-foreground">{rows.length}</span>
                  </div>
                  <div style={{ width: gridW }} className="bg-muted/20" />
                </div>

                {rows.map((t) => (
                  <TimelineRow
                    key={t.id}
                    task={t}
                    person={people.find((p) => p.id === t.assigneeId)}
                    rangeStartIso={format(rangeStart, "yyyy-MM-dd")}
                    days={days.length}
                  />
                ))}
              </Fragment>
            );
          })}

          {filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-muted-foreground">
              No tasks match the current filter.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function TimelineRow({
  task,
  person,
  rangeStartIso,
  days,
}: {
  task: Task;
  person?: Person;
  rangeStartIso: string;
  days: number;
}) {
  const trade = TRADE_META[task.trade];
  const statusMeta = TASK_STATUS_META[task.status];
  const offset = daysBetween(rangeStartIso, task.startDate);
  const span = durationDays(task.startDate, task.endDate);
  const left = offset * DAY_W;
  const width = span * DAY_W - 4;
  const isDone = task.status === "done";

  return (
    <div className="flex border-b border-border/60 hover:bg-muted/40">
      <div
        className="sticky left-0 z-10 flex shrink-0 items-center gap-2 border-r bg-card px-4"
        style={{ width: LABEL_W, height: ROW_H }}
      >
        <Avatar person={person} size={20} />
        <span className="truncate text-[13px]">{task.title}</span>
      </div>
      <div className="relative" style={{ width: days * DAY_W, height: ROW_H }}>
        <div
          className={cn(
            "group absolute top-1/2 flex -translate-y-1/2 items-center gap-1.5 rounded-md px-2 text-[11px] font-medium text-white shadow-sm ring-1 ring-black/5",
            isDone && "opacity-75"
          )}
          style={{
            left,
            width: Math.max(width, DAY_W - 4),
            height: 22,
            background: trade.color,
          }}
          title={`${task.title} · ${statusMeta.label} · ${span}d`}
        >
          <span
            className="h-1.5 w-1.5 shrink-0 rounded-full ring-1 ring-white/60"
            style={{ background: statusMeta.dot }}
          />
          <span className="truncate">{task.title}</span>
        </div>
      </div>
    </div>
  );
}
