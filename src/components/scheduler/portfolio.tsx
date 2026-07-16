"use client";

import Link from "next/link";
import {
  ArrowUpRight,
  CalendarClock,
  CircleDollarSign,
  TriangleAlert,
} from "lucide-react";
import { useScheduler } from "@/lib/scheduler/store";
import { projectMetrics, activeToday } from "@/lib/scheduler/derive";
import {
  PROJECT_STATUS_META,
  PROJECT_TYPE_LABEL,
  TRADE_META,
} from "@/lib/scheduler/types";
import { fmtDate, fmtMoney, fmtRange } from "@/lib/scheduler/dates";
import { Avatar, Badge, Dot } from "@/components/scheduler/primitives";
import { StatusPill } from "@/components/scheduler/status-pill";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function Portfolio() {
  const { projects, tasks, people, setTaskStatus } = useScheduler();

  const activeProjects = projects.filter((p) => p.status === "active");
  const totalBudget = projects.reduce((s, p) => s + p.budget, 0);
  const totalSpent = projects.reduce((s, p) => s + p.spent, 0);
  const blocked = tasks.filter((t) => t.status === "blocked").length;
  const todays = activeToday(tasks);

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto max-w-[1180px] px-6 py-8">
        <header className="mb-7">
          <p className="text-sm text-muted-foreground">Good to see you, Adam</p>
          <h1 className="mt-0.5 text-2xl font-semibold tracking-tight">Portfolio</h1>
        </header>

        {/* Stat row */}
        <div className="mb-8 grid grid-cols-2 gap-3 md:grid-cols-4">
          <Stat
            label="Active projects"
            value={String(activeProjects.length)}
            sub={`${projects.length} total`}
            icon={<Hammer />}
          />
          <Stat
            label="On the calendar today"
            value={String(todays.length)}
            sub="tasks in flight"
            icon={<CalendarClock size={18} />}
          />
          <Stat
            label="Blocked"
            value={String(blocked)}
            sub={blocked ? "need attention" : "all clear"}
            icon={<TriangleAlert size={18} />}
            alert={blocked > 0}
          />
          <Stat
            label="Budget committed"
            value={fmtMoney(totalSpent, { compact: true })}
            sub={`of ${fmtMoney(totalBudget, { compact: true })}`}
            icon={<CircleDollarSign size={18} />}
          />
        </div>

        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Project cards */}
          <section>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">Projects</h2>
            <div className="space-y-3">
              {projects.map((p) => {
                const m = projectMetrics(p, tasks);
                const lead = people.find((x) => x.id === p.leadId);
                const statusMeta = PROJECT_STATUS_META[p.status];
                return (
                  <Link
                    key={p.id}
                    href={`/scheduler/${p.id}/timeline`}
                    className="group block overflow-hidden rounded-xl border bg-card transition hover:border-border hover:shadow-sm"
                  >
                    <div className="flex">
                      <div className="w-1.5 shrink-0" style={{ background: p.accent }} />
                      <div className="flex-1 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <h3 className="truncate text-[15px] font-semibold">{p.name}</h3>
                              <ArrowUpRight
                                size={14}
                                className="shrink-0 text-muted-foreground opacity-0 transition group-hover:opacity-100"
                              />
                            </div>
                            <p className="truncate text-xs text-muted-foreground">{p.address}</p>
                          </div>
                          <Badge color={statusMeta.color}>
                            <Dot color={statusMeta.color} size={6} />
                            {statusMeta.label}
                          </Badge>
                        </div>

                        <div className="mt-3 flex items-center gap-2 text-xs text-muted-foreground">
                          <span className="rounded bg-muted px-1.5 py-0.5 font-medium">
                            {PROJECT_TYPE_LABEL[p.type]}
                          </span>
                          <span>{fmtRange(p.startDate, p.targetDate)}</span>
                          {m.overdue > 0 && (
                            <span style={{ color: "#b04a3f" }}>· {m.overdue} overdue</span>
                          )}
                        </div>

                        <div className="mt-3 grid grid-cols-2 gap-4">
                          <div>
                            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Schedule</span>
                              <span className="font-medium text-foreground">
                                {m.done}/{m.total} tasks
                              </span>
                            </div>
                            <Progress value={m.progress} indicatorClassName="bg-primary" />
                          </div>
                          <div>
                            <div className="mb-1 flex items-center justify-between text-[11px] text-muted-foreground">
                              <span>Budget</span>
                              <span className="font-medium text-foreground">
                                {fmtMoney(p.spent, { compact: true })} · {m.budgetPct}%
                              </span>
                            </div>
                            <Progress
                              value={m.budgetPct}
                              indicatorClassName={m.budgetPct > 90 ? "bg-destructive" : "bg-accent"}
                            />
                          </div>
                        </div>

                        <div className="mt-3 flex items-center justify-between">
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {lead && <Avatar person={lead} size={22} />}
                            <span>{lead ? lead.name : "Unassigned lead"}</span>
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {m.daysToTarget >= 0
                              ? `${m.daysToTarget}d to target`
                              : `${Math.abs(m.daysToTarget)}d past target`}
                          </span>
                        </div>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>

          {/* Today rail */}
          <aside>
            <h2 className="mb-3 text-sm font-semibold text-muted-foreground">In flight today</h2>
            <Card className="p-2">
              {todays.length === 0 && (
                <p className="p-4 text-sm text-muted-foreground">Nothing scheduled today.</p>
              )}
              {todays.map((t) => {
                const project = projects.find((p) => p.id === t.projectId);
                const person = people.find((x) => x.id === t.assigneeId);
                const trade = TRADE_META[t.trade];
                return (
                  <div
                    key={t.id}
                    className="flex items-start gap-2.5 rounded-lg px-2.5 py-2 hover:bg-muted/60"
                  >
                    <span
                      className="mt-1.5 h-2 w-2 shrink-0 rounded-full"
                      style={{ background: trade.color }}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-medium">{t.title}</div>
                      <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-muted-foreground">
                        <span className="truncate">{project?.name}</span>
                        <span>·</span>
                        <span>{fmtDate(t.endDate)}</span>
                      </div>
                      <div className="mt-1.5">
                        <StatusPill status={t.status} onChange={(s) => setTaskStatus(t.id, s)} compact />
                      </div>
                    </div>
                    <Avatar person={person} size={22} />
                  </div>
                );
              })}
            </Card>
          </aside>
        </div>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  sub,
  icon,
  alert,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground">{label}</span>
        <span className={alert ? "text-destructive" : "text-muted-foreground"}>{icon}</span>
      </div>
      <div className="mt-2 text-2xl font-semibold tracking-tight">{value}</div>
      <div className="text-xs text-muted-foreground">{sub}</div>
    </Card>
  );
}

function Hammer() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m15 12-8.5 8.5a2.12 2.12 0 1 1-3-3L12 9" />
      <path d="M17.64 15 22 10.64" />
      <path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16.01 4.6a5.56 5.56 0 0 0-3.94-1.64H9l.92.82A6.18 6.18 0 0 1 12 8.4v1.56l2 2h.86c.85 0 1.65.33 2.25.93l1.25 1.25" />
    </svg>
  );
}
