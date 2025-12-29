"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconArrowLeft, IconCheck, IconCircle, IconCircleDashed } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { projectSections } from "@/lib/navigation";
import { useProject } from "./project-provider";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";

interface ProjectSidebarProps extends React.ComponentProps<typeof Sidebar> {
  projectId: string;
}

// Section completion status type
type SectionStatus = "complete" | "in_progress" | "not_started";

// Placeholder for section completion - will be implemented with real data
function getSectionStatus(path: string): SectionStatus {
  // TODO: Implement actual completion checking based on project data
  // For now, return placeholder status
  if (path === "details") return "complete";
  if (path === "design/colors") return "complete";
  if (path === "design/materials") return "in_progress";
  return "not_started";
}

function StatusIcon({ status }: { status: SectionStatus }) {
  switch (status) {
    case "complete":
      return <IconCheck className="h-4 w-4 text-green-500" />;
    case "in_progress":
      return <IconCircleDashed className="h-4 w-4 text-yellow-500" />;
    default:
      return <IconCircle className="h-4 w-4 text-muted-foreground" />;
  }
}

export function ProjectSidebar({ projectId, ...props }: ProjectSidebarProps) {
  const pathname = usePathname();
  const { project, isLoading } = useProject();

  // Calculate progress (placeholder - will be based on actual completion)
  const completedSections = 3;
  const totalSections = 11;
  const progress = Math.round((completedSections / totalSections) * 100);

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader className="p-4">
        {/* Back Button */}
        <Link
          href="/dashboard"
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
        >
          <IconArrowLeft className="h-4 w-4" />
          <span className="group-data-[collapsible=icon]:hidden">
            Back to Dashboard
          </span>
        </Link>

        {/* Project Info */}
        <div className="group-data-[collapsible=icon]:hidden">
          {isLoading ? (
            <div className="space-y-2">
              <Skeleton className="h-5 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-2 w-full mt-2" />
            </div>
          ) : project ? (
            <div className="space-y-2">
              <h2 className="font-semibold text-sm truncate">
                {project.project_name || project.address_street || "Untitled Project"}
              </h2>
              <p className="text-xs text-muted-foreground capitalize">
                {project.investment_strategy?.replace("_", " ") || "Draft"} • {progress}% complete
              </p>
              <Progress value={progress} className="h-1.5" />
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Project not found</p>
          )}
        </div>
      </SidebarHeader>

      <SidebarSeparator />

      <SidebarContent>
        {projectSections.map((section) => (
          <SidebarGroup key={section.label}>
            <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              {section.label}
            </SidebarGroupLabel>
            <SidebarMenu>
              {section.items.map((item) => {
                const href = `/project/${projectId}/${item.path}`;
                const isActive = pathname === href || pathname.startsWith(`${href}/`);
                const status = getSectionStatus(item.path);

                return (
                  <SidebarMenuItem key={item.path}>
                    <SidebarMenuButton
                      asChild
                      isActive={isActive}
                      tooltip={item.title}
                    >
                      <Link href={href}>
                        <item.icon className="h-4 w-4" />
                        <span className="flex-1">{item.title}</span>
                        <StatusIcon status={status} />
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="p-4 group-data-[collapsible=icon]:hidden">
        <div className="text-xs text-muted-foreground text-center">
          Project ID: {projectId.slice(0, 8)}...
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
