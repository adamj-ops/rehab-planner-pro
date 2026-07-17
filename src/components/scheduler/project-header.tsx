"use client";

import Link from "next/link";
import { notFound, usePathname } from "next/navigation";
import { CalendarDays, GanttChartSquare, KanbanSquare, MapPin, Table2 } from "lucide-react";
import { useSchedulerProject } from "@/hooks/use-scheduler";
import { projectMetrics } from "@/lib/scheduler/derive";
import { PROJECT_STATUS_META, PROJECT_TYPE_LABEL } from "@/lib/scheduler/types";
import { Avatar, Badge, Dot } from "@/components/scheduler/primitives";
import { fmtMoney, fmtRange } from "@/lib/scheduler/dates";
import { cn } from "@/lib/utils";

const VIEWS = [
  { key: "timeline", label: "Timeline", icon: GanttChartSquare },
  { key: "board", label: "Board", icon: KanbanSquare },
  { key: "calendar", label: "Calendar", icon: CalendarDays },
  { key: "table", label: "Table", icon: Table2 },
] as const;

export function ProjectHeader({ projectId }: { projectId: string }) {
  const pathname = usePathname();
  const { data, isLoading, isError } = useSchedulerProject(projectId);

  if (isLoading) {
    return (
      <header className="shrink-0 border-b bg-card px-8 py-6">
        <div className="h-5 w-48 animate-pulse rounded bg-muted" />
        <div className="mt-2 h-3 w-72 animate-pulse rounded bg-muted" />
      </header>
    );
  }

  const project = data?.project ?? null;
  // A finished (non-loading) load with no project row => genuine 404.
  if (!project && !isError) return notFound();
  if (!project) {
    return (
      <header className="shrink-0 border-b bg-card px-8 py-6 text-sm text-muted-foreground">
        Could not load this project.
      </header>
    );
  }

  const tasks = data?.tasks ?? [];
  const people = data?.people ?? [];
  const m = projectMetrics(project, tasks);
  const lead = people.find((x) => x.id === project.leadId);
  const statusMeta = PROJECT_STATUS_META[project.status];

  return (
    <header className="shrink-0 border-b bg-card px-8 pt-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5">
            <span className="h-5 w-1.5 rounded-full" style={{ background: project.accent }} />
            <h1 className="truncate text-xl font-semibold tracking-tight">{project.name}</h1>
            <Badge color={statusMeta.color}>
              <Dot color={statusMeta.color} size={6} />
              {statusMeta.label}
            </Badge>
          </div>
          <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 pl-4 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1">
              <MapPin size={12} /> {project.address}
            </span>
            <span className="rounded bg-muted px-1.5 py-0.5 font-medium text-foreground">
              {PROJECT_TYPE_LABEL[project.type]}
            </span>
            <span>{fmtRange(project.startDate, project.targetDate)}</span>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-5 text-right">
          <HeaderStat label="Progress" value={`${m.progress}%`} sub={`${m.done}/${m.total} tasks`} />
          <HeaderStat
            label="Budget"
            value={`${m.budgetPct}%`}
            sub={`${fmtMoney(project.spent, { compact: true })} / ${fmtMoney(project.budget, { compact: true })}`}
          />
          <HeaderStat
            label="Target"
            value={m.daysToTarget >= 0 ? `${m.daysToTarget}d` : `+${Math.abs(m.daysToTarget)}d`}
            sub={m.daysToTarget >= 0 ? "remaining" : "over"}
            alert={m.daysToTarget < 0}
          />
          {lead && (
            <div className="flex items-center gap-2 border-l pl-4">
              <Avatar person={lead} size={30} />
            </div>
          )}
        </div>
      </div>

      {/* View tabs */}
      <nav className="mt-4 flex gap-1">
        {VIEWS.map((v) => {
          const href = `/scheduler/${project.id}/${v.key}`;
          const active = pathname === href;
          const Icon = v.icon;
          return (
            <Link
              key={v.key}
              href={href}
              className={cn(
                "-mb-px flex items-center gap-1.5 border-b-2 px-3 py-2.5 text-sm font-medium transition",
                active
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon size={15} />
              {v.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}

function HeaderStat({
  label,
  value,
  sub,
  alert,
}: {
  label: string;
  value: string;
  sub: string;
  alert?: boolean;
}) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={cn("text-lg font-semibold leading-tight", alert && "text-destructive")}>
        {value}
      </div>
      <div className="text-[11px] text-muted-foreground">{sub}</div>
    </div>
  );
}
