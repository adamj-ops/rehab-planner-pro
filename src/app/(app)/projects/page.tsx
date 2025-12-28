"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import {
  IconArrowRight,
  IconCalendar,
  IconFilter,
  IconHome,
  IconLayoutGrid,
  IconLayoutList,
  IconMapPin,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import { useState } from "react";

export default function ProjectsPage() {
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  // Placeholder data
  const projects = [
    {
      id: "1",
      name: "123 Main Street",
      status: "In Progress",
      budget: 45000,
      spent: 29250,
      progress: 65,
      city: "Austin, TX",
      daysRemaining: 14,
      startDate: "Nov 15, 2024",
    },
    {
      id: "2",
      name: "456 Oak Avenue",
      status: "Planning",
      budget: 32000,
      spent: 4800,
      progress: 15,
      city: "Dallas, TX",
      daysRemaining: 45,
      startDate: "Dec 1, 2024",
    },
    {
      id: "3",
      name: "789 Pine Road",
      status: "Design",
      budget: 58000,
      spent: 20300,
      progress: 35,
      city: "Houston, TX",
      daysRemaining: 30,
      startDate: "Nov 20, 2024",
    },
    {
      id: "4",
      name: "321 Elm Boulevard",
      status: "Completed",
      budget: 41000,
      spent: 38500,
      progress: 100,
      city: "San Antonio, TX",
      daysRemaining: 0,
      startDate: "Sep 1, 2024",
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

  const filteredProjects =
    statusFilter === "all"
      ? projects
      : projects.filter((p) => p.status === statusFilter);

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-semibold tracking-tight">My Projects</h1>
          <p className="text-sm text-muted-foreground">
            Manage all your fix & flip projects
          </p>
        </div>
        <Button asChild>
          <Link href="/wizard/step-1">
            <IconPlus className="size-4" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Filters Bar */}
      <Card>
        <CardContent className="py-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-1 gap-3">
              <div className="relative flex-1 max-w-sm">
                <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input placeholder="Search projects..." className="pl-10" />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <IconFilter className="size-4 mr-2" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="Planning">Planning</SelectItem>
                  <SelectItem value="Design">Design</SelectItem>
                  <SelectItem value="In Progress">In Progress</SelectItem>
                  <SelectItem value="Completed">Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-1 border rounded-md p-1">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="sm"
                mode="icon"
                onClick={() => setViewMode("grid")}
              >
                <IconLayoutGrid className="size-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="sm"
                mode="icon"
                onClick={() => setViewMode("list")}
              >
                <IconLayoutList className="size-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Projects Grid View */}
      {viewMode === "grid" && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((project) => (
            <Card
              key={project.id}
              className="group hover:shadow-md transition-shadow"
            >
              <CardHeader className="border-0 pb-3">
                <div className="flex items-start justify-between">
                  <div className="p-2 rounded-lg bg-muted">
                    <IconHome className="size-5 text-muted-foreground" />
                  </div>
                  <Badge
                    variant={getStatusVariant(project.status)}
                    appearance="light"
                    size="sm"
                  >
                    {project.status}
                  </Badge>
                </div>
                <CardTitle className="mt-3 text-base">{project.name}</CardTitle>
                <div className="flex items-center gap-1 text-xs text-muted-foreground">
                  <IconMapPin className="size-3" />
                  {project.city}
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Budget</span>
                    <div className="flex items-baseline gap-1">
                      <span className="font-semibold">
                        ${project.spent.toLocaleString()}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        / ${project.budget.toLocaleString()}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-muted-foreground">Progress</span>
                      <span className="font-medium">{project.progress}%</span>
                    </div>
                    <Progress value={project.progress} className="h-1.5" />
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <IconCalendar className="size-3" />
                      {project.startDate}
                    </span>
                    {project.daysRemaining > 0 && (
                      <span>{project.daysRemaining}d remaining</span>
                    )}
                  </div>
                </div>

                <Button
                  variant="secondary"
                  className="w-full"
                  asChild
                >
                  <Link href={`/projects/${project.id}`}>
                    View Details
                    <IconArrowRight className="size-3.5" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Projects List View */}
      {viewMode === "list" && (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y">
              {filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 hover:bg-muted/50 transition-colors"
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
                          {project.startDate}
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

                    <Button
                      variant="secondary"
                      size="sm"
                      asChild
                      className="shrink-0"
                    >
                      <Link href={`/projects/${project.id}`}>
                        View
                        <IconArrowRight className="size-3.5" />
                      </Link>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {filteredProjects.length === 0 && (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center justify-center text-center">
              <div className="p-3 rounded-full bg-muted mb-4">
                <IconHome className="size-6 text-muted-foreground" />
              </div>
              <h3 className="font-medium text-foreground mb-1">
                No projects found
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {statusFilter === "all"
                  ? "Get started by creating your first rehab project."
                  : `No projects with status "${statusFilter}" found.`}
              </p>
              {statusFilter === "all" ? (
                <Button asChild>
                  <Link href="/wizard/step-1">
                    <IconPlus className="size-4" />
                    Create Project
                  </Link>
                </Button>
              ) : (
                <Button variant="secondary" onClick={() => setStatusFilter("all")}>
                  Clear Filter
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
