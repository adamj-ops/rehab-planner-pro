"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  IconChevronDown,
  IconPlus,
  IconPalette,
  IconBuildingWarehouse,
  IconBriefcase,
  IconSettings,
  IconHelp,
} from "@tabler/icons-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Skeleton } from "@/components/ui/skeleton"
import { AppLogo } from "@/components/app-logo"
import { NavUserAuth } from "@/components/nav-user-auth"
import { ThemeSwitcherToggle } from "@/components/elements/theme-switcher-toggle"
import { ProjectSidebarItem } from "./project-sidebar-item"
import {
  useWorkspaceStore,
  groupProjectsByPhase,
  type WorkspaceProject,
} from "@/stores/workspace-store"

interface WorkspaceSidebarProps extends React.ComponentProps<typeof Sidebar> {
  projects: WorkspaceProject[]
  isLoading?: boolean
}

export function WorkspaceSidebar({
  projects,
  isLoading,
  ...props
}: WorkspaceSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  
  const activeProjectId = useWorkspaceStore((state) => state.activeProjectId)
  const sidebarState = useWorkspaceStore((state) => state.sidebarState)
  const setActiveProject = useWorkspaceStore((state) => state.setActiveProject)
  const toggleSection = useWorkspaceStore((state) => state.toggleSection)
  
  // Group projects by phase
  const grouped = React.useMemo(() => groupProjectsByPhase(projects), [projects])
  
  // Handle project click - navigate to appropriate dashboard
  const handleProjectClick = (project: WorkspaceProject) => {
    setActiveProject(project.id)
    
    // Navigate based on phase
    if (project.phase === 'planning') {
      router.push(`/projects/${project.id}/planning`)
    } else if (project.phase === 'completed' || project.phase === 'archived') {
      router.push(`/projects/${project.id}/portfolio`)
    } else {
      router.push(`/projects/${project.id}/dashboard`)
    }
  }
  
  const handleNewProject = () => {
    router.push('/wizard/step-1')
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        {/* Workspaces Label */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Workspaces
          </SidebarGroupLabel>
        </SidebarGroup>

        {isLoading ? (
          <WorkspaceSidebarSkeleton />
        ) : (
          <>
            {/* Active Projects (Construction) */}
            {grouped.active.length > 0 && (
              <Collapsible
                open={sidebarState.activeExpanded}
                onOpenChange={() => toggleSection('activeExpanded')}
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1 -mx-2 flex items-center justify-between group">
                      <span className="flex items-center gap-2">
                        <span className="text-sm">Active</span>
                        <span className="text-xs text-muted-foreground">
                          ({grouped.active.length})
                        </span>
                      </span>
                      <IconChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          sidebarState.activeExpanded && "rotate-180"
                        )}
                      />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {grouped.active.map((project) => (
                          <ProjectSidebarItem
                            key={project.id}
                            project={project}
                            isActive={project.id === activeProjectId}
                            onClick={() => handleProjectClick(project)}
                          />
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}

            {/* Planning Projects */}
            {grouped.planning.length > 0 && (
              <Collapsible
                open={sidebarState.planningExpanded}
                onOpenChange={() => toggleSection('planningExpanded')}
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1 -mx-2 flex items-center justify-between group">
                      <span className="flex items-center gap-2">
                        <span className="text-sm">Planning</span>
                        <span className="text-xs text-muted-foreground">
                          ({grouped.planning.length})
                        </span>
                      </span>
                      <IconChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          sidebarState.planningExpanded && "rotate-180"
                        )}
                      />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {grouped.planning.map((project) => (
                          <ProjectSidebarItem
                            key={project.id}
                            project={project}
                            isActive={project.id === activeProjectId}
                            isPlanning
                            onClick={() => handleProjectClick(project)}
                          />
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}

            {/* Completed Projects */}
            {grouped.completed.length > 0 && (
              <Collapsible
                open={sidebarState.completedExpanded}
                onOpenChange={() => toggleSection('completedExpanded')}
              >
                <SidebarGroup>
                  <CollapsibleTrigger asChild>
                    <SidebarGroupLabel className="cursor-pointer hover:bg-accent/50 rounded-md px-2 py-1 -mx-2 flex items-center justify-between group">
                      <span className="flex items-center gap-2">
                        <span className="text-sm">Completed</span>
                        <span className="text-xs text-muted-foreground">
                          ({grouped.completed.length})
                        </span>
                      </span>
                      <IconChevronDown
                        className={cn(
                          "h-4 w-4 text-muted-foreground transition-transform",
                          sidebarState.completedExpanded && "rotate-180"
                        )}
                      />
                    </SidebarGroupLabel>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <SidebarGroupContent>
                      <SidebarMenu>
                        {grouped.completed.map((project) => (
                          <ProjectSidebarItem
                            key={project.id}
                            project={project}
                            isActive={project.id === activeProjectId}
                            isCompleted
                            onClick={() => handleProjectClick(project)}
                          />
                        ))}
                      </SidebarMenu>
                    </SidebarGroupContent>
                  </CollapsibleContent>
                </SidebarGroup>
              </Collapsible>
            )}

            {/* Empty state */}
            {projects.length === 0 && (
              <SidebarGroup>
                <SidebarGroupContent className="px-2 py-4 text-center">
                  <p className="text-sm text-muted-foreground mb-3">
                    No projects yet
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full"
                    onClick={handleNewProject}
                  >
                    <IconPlus className="mr-2 h-4 w-4" />
                    Create Project
                  </Button>
                </SidebarGroupContent>
              </SidebarGroup>
            )}
          </>
        )}

        {/* New Project Button */}
        {projects.length > 0 && (
          <SidebarGroup>
            <SidebarGroupContent className="px-2">
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-muted-foreground hover:text-foreground"
                onClick={handleNewProject}
              >
                <IconPlus className="mr-2 h-4 w-4" />
                New Project
              </Button>
            </SidebarGroupContent>
          </SidebarGroup>
        )}

        <SidebarSeparator />

        {/* Resources */}
        <SidebarGroup>
          <SidebarGroupLabel>Resources</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/colors'}>
                  <Link href="/colors">
                    <IconPalette className="h-4 w-4" />
                    <span>Colors</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/materials'}>
                  <Link href="/materials">
                    <IconBuildingWarehouse className="h-4 w-4" />
                    <span>Materials</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/vendors'}>
                  <Link href="/vendors">
                    <IconBriefcase className="h-4 w-4" />
                    <span>Vendors</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Settings */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname?.startsWith('/settings')}>
                  <Link href="/settings">
                    <IconSettings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === '/help'}>
                  <Link href="/help">
                    <IconHelp className="h-4 w-4" />
                    <span>Help & Docs</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent className="flex justify-center py-2">
            <ThemeSwitcherToggle />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <NavUserAuth />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}

function WorkspaceSidebarSkeleton() {
  return (
    <SidebarGroup>
      <SidebarGroupContent className="space-y-2 px-2">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex items-center gap-2 py-2">
            <Skeleton className="h-5 w-5 rounded" />
            <Skeleton className="h-4 w-32" />
          </div>
        ))}
      </SidebarGroupContent>
    </SidebarGroup>
  )
}
