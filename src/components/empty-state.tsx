'use client'

import { Button } from '@/components/ui/button'
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty'
import { cn } from '@/lib/utils'
import {
  IconHome,
  IconUsers,
  IconClipboardList,
  IconPalette,
  IconPlus,
  IconSearch,
  IconFolderOff,
} from '@tabler/icons-react'
import Link from 'next/link'
import { ReactNode } from 'react'

type EmptyStateVariant = 'projects' | 'vendors' | 'materials' | 'designs' | 'search' | 'generic'

interface EmptyStateProps {
  variant?: EmptyStateVariant
  title?: string
  description?: string
  icon?: ReactNode
  action?: {
    label: string
    href?: string
    onClick?: () => void
  }
  className?: string
}

const variantConfig: Record<
  EmptyStateVariant,
  {
    icon: ReactNode
    title: string
    description: string
    action: { label: string; href: string }
  }
> = {
  projects: {
    icon: <IconHome className="size-6" />,
    title: 'No projects yet',
    description:
      'Get started by creating your first rehab project. Our wizard will guide you through the process.',
    action: { label: 'Create Project', href: '/wizard/step-1' },
  },
  vendors: {
    icon: <IconUsers className="size-6" />,
    title: 'No vendors found',
    description:
      'Add contractors and suppliers to your vendor database for quick access during projects.',
    action: { label: 'Add Vendor', href: '/vendors' },
  },
  materials: {
    icon: <IconClipboardList className="size-6" />,
    title: 'No materials selected',
    description: 'Browse our material catalog and add items to your project scope.',
    action: { label: 'Browse Materials', href: '/materials' },
  },
  designs: {
    icon: <IconPalette className="size-6" />,
    title: 'No designs created',
    description: 'Create moodboards and color palettes to visualize your renovation plans.',
    action: { label: 'Start Designing', href: '/design' },
  },
  search: {
    icon: <IconSearch className="size-6" />,
    title: 'No results found',
    description: 'Try adjusting your search or filters to find what you are looking for.',
    action: { label: 'Clear Filters', href: '#' },
  },
  generic: {
    icon: <IconFolderOff className="size-6" />,
    title: 'Nothing here yet',
    description: 'This section is empty. Get started by adding some content.',
    action: { label: 'Get Started', href: '#' },
  },
}

export function EmptyState({
  variant = 'generic',
  title,
  description,
  icon,
  action,
  className,
}: EmptyStateProps) {
  const config = variantConfig[variant]

  const displayIcon = icon || config.icon
  const displayTitle = title || config.title
  const displayDescription = description || config.description
  const displayAction = action || config.action

  return (
    <Empty className={cn('border', className)}>
      <EmptyHeader>
        <EmptyMedia variant="icon">{displayIcon}</EmptyMedia>
        <EmptyTitle>{displayTitle}</EmptyTitle>
        <EmptyDescription>{displayDescription}</EmptyDescription>
      </EmptyHeader>
      <EmptyContent>
        {displayAction.onClick ? (
          <Button onClick={displayAction.onClick} className="gap-2">
            <IconPlus className="size-4" />
            {displayAction.label}
          </Button>
        ) : (
          <Button asChild className="gap-2">
            <Link href={displayAction.href || '#'}>
              <IconPlus className="size-4" />
              {displayAction.label}
            </Link>
          </Button>
        )}
      </EmptyContent>
    </Empty>
  )
}
