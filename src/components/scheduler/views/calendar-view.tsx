"use client";

import { useState } from "react";
import {
  addMonths,
  eachDayOfInterval,
  endOfMonth,
  endOfWeek,
  format,
  isSameMonth,
  isWithinInterval,
  startOfMonth,
  startOfWeek,
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useProjectData } from "@/lib/scheduler/use-project-data";
import { Filters, useFilteredTasks } from "@/components/scheduler/filters";
import { TRADE_META, type Task } from "@/lib/scheduler/types";
import { toDate, TODAY } from "@/lib/scheduler/dates";
import { cn } from "@/lib/utils";

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarView({ projectId }: { projectId: string }) {
  const { tasks, people } = useProjectData(projectId);
  const filtered = useFilteredTasks(tasks);
  const today = toDate(TODAY);

  // start the calendar on the month containing the project's current activity
  const [monthOffset, setMonthOffset] = useState(0);
  const cursor = addMonths(startOfMonth(today), monthOffset);

  const gridStart = startOfWeek(startOfMonth(cursor));
  const gridEnd = endOfWeek(endOfMonth(cursor));
  const days = eachDayOfInterval({ start: gridStart, end: gridEnd });

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b bg-card px-8 py-2.5">
        <Filters projectTasks={tasks} people={people} />
        <div className="flex items-center gap-3">
          <span className="min-w-[130px] text-right text-sm font-semibold">
            {format(cursor, "MMMM yyyy")}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setMonthOffset((m) => m - 1)}
              className="rounded-md border p-1 text-muted-foreground hover:bg-muted/60"
            >
              <ChevronLeft size={16} />
            </button>
            <button
              onClick={() => setMonthOffset(0)}
              className="rounded-md border px-2 py-1 text-xs text-muted-foreground hover:bg-muted/60"
            >
              Today
            </button>
            <button
              onClick={() => setMonthOffset((m) => m + 1)}
              className="rounded-md border p-1 text-muted-foreground hover:bg-muted/60"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-auto px-8 py-5">
        <div className="overflow-hidden rounded-xl border bg-card">
          <div className="grid grid-cols-7 border-b bg-muted/40">
            {WEEKDAYS.map((day) => (
              <div
                key={day}
                className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground"
              >
                {day}
              </div>
            ))}
          </div>

          <div className="grid grid-cols-7">
            {days.map((day) => {
              const inMonth = isSameMonth(day, cursor);
              const isToday = format(day, "yyyy-MM-dd") === TODAY;
              const dayTasks = filtered.filter((t) =>
                isWithinInterval(day, {
                  start: toDate(t.startDate),
                  end: toDate(t.endDate),
                })
              );
              return (
                <div
                  key={day.toISOString()}
                  className={cn(
                    "min-h-[112px] border-b border-r p-1.5 last:border-r-0",
                    !inMonth && "bg-muted/30"
                  )}
                >
                  <div className="mb-1 flex items-center justify-between px-1">
                    <span
                      className={cn(
                        "grid h-6 w-6 place-items-center rounded-full text-xs",
                        isToday
                          ? "bg-primary font-semibold text-primary-foreground"
                          : inMonth
                            ? "text-muted-foreground"
                            : "text-muted-foreground/60"
                      )}
                    >
                      {format(day, "d")}
                    </span>
                  </div>
                  <div className="space-y-1">
                    {dayTasks.slice(0, 3).map((t) => (
                      <CalendarChip key={t.id} task={t} day={day} />
                    ))}
                    {dayTasks.length > 3 && (
                      <div className="px-1 text-[10px] text-muted-foreground">
                        +{dayTasks.length - 3} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function CalendarChip({ task, day }: { task: Task; day: Date }) {
  const trade = TRADE_META[task.trade];
  const isStart = format(day, "yyyy-MM-dd") === task.startDate;
  const isEnd = format(day, "yyyy-MM-dd") === task.endDate;
  return (
    <div
      className={cn(
        "truncate px-1.5 py-0.5 text-[11px] font-medium text-white",
        isStart ? "rounded-l-md" : "",
        isEnd ? "rounded-r-md" : "",
        !isStart && !isEnd && "opacity-90"
      )}
      style={{ background: trade.color }}
      title={task.title}
    >
      {isStart ? task.title : " "}
    </div>
  );
}
