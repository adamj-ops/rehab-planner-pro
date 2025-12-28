"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardToolbar,
} from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  IconPlus,
  IconHome,
  IconTrendingUp,
  IconTrendingDown,
  IconClock,
  IconChartBar,
  IconArrowRight,
  IconMapPin,
  IconCalendar,
} from "@tabler/icons-react";

export default function DashboardPage() {
  // Placeholder data - will be replaced with real data from Supabase
  const stats = {
    activeProjects: 3,
    completedProjects: 12,
    totalInvested: 485000,
    totalProfit: 127500,
    avgRoi: 26.3,
  };

  const performance = [
    {
      label: "Active Projects",
      value: stats.activeProjects,
      trend: 2,
      trendDir: "up" as const,
      icon: IconHome,
    },
    {
      label: "Completed",
      value: stats.completedProjects,
      trend: 8,
      trendDir: "up" as const,
      icon: IconClock,
    },
    {
      label: "Avg ROI",
      value: `${stats.avgRoi}%`,
      trend: 3.2,
      trendDir: "up" as const,
      icon: IconChartBar,
    },
  ];

  const recentProjects = [
    {
      id: "1",
      name: "123 Main Street",
      city: "Austin, TX",
      status: "In Progress",
      budget: 45000,
      spent: 29250,
      progress: 65,
      daysRemaining: 14,
    },
    {
      id: "2",
      name: "456 Oak Avenue",
      city: "Dallas, TX",
      status: "Planning",
      budget: 32000,
      spent: 4800,
      progress: 15,
      daysRemaining: 45,
    },
    {
      id: "3",
      name: "789 Pine Road",
      city: "Houston, TX",
      status: "Design",
      budget: 58000,
      spent: 20300,
      progress: 35,
      daysRemaining: 30,
    },
  ];

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "In Progress":
        return "primary";
      case "Completed":
        return "success";
      case "Planning":
        return "secondary";
      case "Design":
        return "info";
      default:
        return "secondary";
    }
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-sm text-muted-foreground">
            Welcome back! Here&apos;s an overview of your rehab projects.
          </p>
        </div>
        <Button asChild>
          <Link href="/wizard/step-1">
            <IconPlus className="size-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Financial Overview Card */}
      <Card>
        <CardHeader className="border-0 py-5">
          <CardTitle>Financial Overview</CardTitle>
          <CardToolbar>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/projects">
                View All
                <IconArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardContent className="space-y-5">
          {/* Stats Row */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                Total Invested
              </div>
              <div className="text-2xl font-bold text-foreground">
                ${stats.totalInvested.toLocaleString()}
              </div>
            </div>
            <Separator orientation="vertical" className="hidden sm:block h-12" />
            <Separator className="sm:hidden" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="text-xs text-muted-foreground font-medium tracking-wide uppercase">
                Total Profit
              </div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-success">
                  +${stats.totalProfit.toLocaleString()}
                </span>
                <span className="flex items-center gap-0.5 text-xs font-semibold text-success">
                  <IconTrendingUp className="size-3" />
                  {stats.avgRoi}%
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Performance Grid */}
          <div>
            <div className="font-medium text-sm mb-3 text-foreground">
              Performance Metrics
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {performance.map((item) => (
                <div
                  className="flex flex-col items-start justify-start p-3 rounded-lg border bg-card"
                  key={item.label}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-1.5 rounded-md bg-muted">
                      <item.icon className="size-4 text-muted-foreground" />
                    </div>
                    <span className="text-xs text-muted-foreground font-medium">
                      {item.label}
                    </span>
                  </div>
                  <div className="text-xl font-bold text-foreground">
                    {item.value}
                  </div>
                  <span
                    className={`flex items-center gap-0.5 text-xs font-semibold mt-1 ${
                      item.trendDir === "up" ? "text-success" : "text-destructive"
                    }`}
                  >
                    {item.trendDir === "up" ? (
                      <IconTrendingUp className="size-3" />
                    ) : (
                      <IconTrendingDown className="size-3" />
                    )}
                    {item.trendDir === "up" ? "+" : "-"}
                    {item.trend}%
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Projects */}
      <Card>
        <CardHeader className="border-0 py-5">
          <CardTitle>Recent Projects</CardTitle>
          <CardToolbar>
            <Button variant="secondary" size="sm" asChild>
              <Link href="/projects">
                View All
                <IconArrowRight className="size-3.5" />
              </Link>
            </Button>
          </CardToolbar>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {recentProjects.map((project) => (
              <div
                key={project.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-lg border hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <div className="p-2 rounded-lg bg-muted shrink-0">
                    <IconHome className="size-5 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">
                        {project.name}
                      </span>
                      <Badge
                        variant={getStatusVariant(project.status)}
                        appearance="light"
                        size="sm"
                      >
                        {project.status}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <IconMapPin className="size-3" />
                        {project.city}
                      </span>
                      <span className="flex items-center gap-1">
                        <IconCalendar className="size-3" />
                        {project.daysRemaining}d remaining
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-6 sm:gap-8">
                  <div className="flex flex-col items-start sm:items-end gap-1 min-w-[100px]">
                    <div className="text-xs text-muted-foreground">Budget</div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-sm font-semibold text-foreground">
                        ${project.spent.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / ${project.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="flex flex-col gap-1 min-w-[80px]">
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">
                        Progress
                      </span>
                      <span className="text-xs font-semibold text-foreground">
                        {project.progress}%
                      </span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>

                  <Button variant="secondary" size="sm" asChild className="shrink-0">
                    <Link href={`/projects/${project.id}`}>
                      View
                      <IconArrowRight className="size-3.5" />
                    </Link>
                  </Button>
                </div>
              </div>
            ))}
          </div>

          {recentProjects.length === 0 && (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-3 rounded-full bg-muted mb-4">
                <IconHome className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                No projects yet
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                Get started by creating your first rehab project.
              </p>
              <Button asChild>
                <Link href="/wizard/step-1">
                  <IconPlus className="size-4" />
                  Create Project
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
