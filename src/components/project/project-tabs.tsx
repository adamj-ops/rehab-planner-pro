'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  IconLayoutDashboard,
  IconPhoto,
  IconChecklist,
  IconReportAnalytics,
  IconNotebook,
  IconCalendarEvent,
  IconBriefcase,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

interface ProjectTabsProps {
  projectId: string
}

interface TabItem {
  label: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

export function ProjectTabs({ projectId }: ProjectTabsProps) {
  const pathname = usePathname()

  const tabs: TabItem[] = [
    {
      label: 'Dashboard',
      href: `/projects/${projectId}/dashboard`,
      icon: IconLayoutDashboard,
    },
    {
      label: 'Photos',
      href: `/projects/${projectId}/photos`,
      icon: IconPhoto,
    },
    {
      label: 'Tasks',
      href: `/projects/${projectId}/tasks`,
      icon: IconChecklist,
    },
    {
      label: 'Reports',
      href: `/projects/${projectId}/reports`,
      icon: IconReportAnalytics,
    },
    {
      label: 'Notebook',
      href: `/projects/${projectId}/notebook`,
      icon: IconNotebook,
    },
    {
      label: 'Planning',
      href: `/projects/${projectId}/planning`,
      icon: IconCalendarEvent,
    },
    {
      label: 'Portfolio',
      href: `/projects/${projectId}/portfolio`,
      icon: IconBriefcase,
    },
  ]

  const isActive = (href: string) => {
    // Handle exact match for dashboard
    if (href.endsWith('/dashboard')) {
      return pathname === href || pathname === `/projects/${projectId}`
    }
    // For other routes, check if pathname starts with the href
    return pathname.startsWith(href)
  }

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="flex overflow-x-auto scrollbar-hide">
        <div className="flex min-w-full px-4 gap-1">
          {tabs.map((tab) => {
            const Icon = tab.icon
            const active = isActive(tab.href)

            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors whitespace-nowrap',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground hover:border-muted-foreground/30'
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
