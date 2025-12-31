'use client'

import Link from 'next/link'
import { useParams } from 'next/navigation'
import { useProject } from '../layout'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import {
  IconWand,
  IconCamera,
  IconNotes,
  IconReceipt,
  IconCheck,
  IconCircle,
  IconArrowRight,
} from '@tabler/icons-react'
import { getProjectDisplayName } from '@/hooks/use-workspace-store'

// Wizard steps for progress tracking
const wizardSteps = [
  { number: 1, title: 'Property Details', shortTitle: 'Property' },
  { number: 2, title: 'Current Condition', shortTitle: 'Condition' },
  { number: 3, title: 'Investment Strategy', shortTitle: 'Strategy' },
  { number: 4, title: 'Design Intelligence', shortTitle: 'Design' },
  { number: 5, title: 'Priority Matrix', shortTitle: 'Priority' },
  { number: 6, title: 'Action Plan', shortTitle: 'Action' },
  { number: 7, title: 'Review & Export', shortTitle: 'Review' },
]

export default function PlanningDashboardPage() {
  const params = useParams()
  const projectId = params.projectId as string
  const { project, isLoading } = useProject()

  if (isLoading || !project) {
    return <PlanningDashboardSkeleton />
  }

  const displayName = getProjectDisplayName(project)
  
  // TODO: Fetch wizard progress from database
  // For now, assume step 0 (not started)
  const lastCompletedStep = 0
  const progressPercent = Math.round((lastCompletedStep / 7) * 100)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="flex items-start gap-3">
          <span className="text-3xl">{project.emoji}</span>
          <div>
            <h1 className="text-2xl font-bold">{displayName}</h1>
            <p className="text-muted-foreground">
              {project.address_city && project.address_state
                ? `${project.address_city}, ${project.address_state}`
                : 'No address'}
            </p>
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">Planning Phase</Badge>
            </div>
          </div>
        </div>
        
        <Button asChild>
          <Link href={`/wizard/step-${lastCompletedStep + 1}?project=${projectId}`}>
            <IconWand className="mr-2 h-4 w-4" />
            {lastCompletedStep === 0 ? 'Start Planning' : 'Resume Wizard'}
          </Link>
        </Button>
      </div>

      {/* Wizard Progress */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconWand className="h-5 w-5" />
            Planning Progress
          </CardTitle>
          <CardDescription>
            Complete the wizard to define your project scope and estimate
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">
                {lastCompletedStep} of 7 steps completed
              </span>
              <span className="text-sm text-muted-foreground">{progressPercent}%</span>
            </div>
            <Progress value={progressPercent} className="h-2" />
            
            {/* Step indicators */}
            <div className="grid grid-cols-7 gap-1 mt-4">
              {wizardSteps.map((step) => (
                <div
                  key={step.number}
                  className="flex flex-col items-center gap-1"
                >
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                      step.number <= lastCompletedStep
                        ? 'bg-primary text-primary-foreground'
                        : step.number === lastCompletedStep + 1
                        ? 'bg-primary/20 text-primary border-2 border-primary'
                        : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {step.number <= lastCompletedStep ? (
                      <IconCheck className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  <span className="text-xs text-muted-foreground text-center hidden sm:block">
                    {step.shortTitle}
                  </span>
                </div>
              ))}
            </div>

            {/* Resume button */}
            <div className="flex justify-center mt-4">
              <Button asChild variant="outline">
                <Link href={`/wizard/step-${lastCompletedStep + 1}?project=${projectId}`}>
                  {lastCompletedStep === 0
                    ? 'Start with Property Details'
                    : `Continue: ${wizardSteps[lastCompletedStep]?.title}`}
                  <IconArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Add notes and photos during property walkthrough
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" className="gap-2">
              <IconCamera className="h-4 w-4" />
              Upload Photos
            </Button>
            <Button variant="outline" className="gap-2">
              <IconNotes className="h-4 w-4" />
              Add Note
            </Button>
            <Button variant="outline" className="gap-2">
              <IconReceipt className="h-4 w-4" />
              Add Budget Estimate
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Planning Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Planning Photos */}
        <Card>
          <CardHeader>
            <CardTitle>Property Photos</CardTitle>
            <CardDescription>Photos from walkthrough</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconCamera className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No photos yet</p>
              <Button variant="link" size="sm" className="mt-2">
                Upload photos →
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Planning Notes */}
        <Card>
          <CardHeader>
            <CardTitle>Planning Notes</CardTitle>
            <CardDescription>Notes and observations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <IconNotes className="h-10 w-10 text-muted-foreground mb-3" />
              <p className="text-sm text-muted-foreground">No notes yet</p>
              <Button variant="link" size="sm" className="mt-2">
                Add a note →
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Budget Estimates */}
      <Card>
        <CardHeader>
          <CardTitle>Budget Estimates</CardTitle>
          <CardDescription>Early cost estimates and quotes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <IconReceipt className="h-10 w-10 text-muted-foreground mb-3" />
            <p className="text-sm text-muted-foreground">
              No budget estimates yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Complete the wizard to generate a detailed estimate
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Start Construction CTA */}
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-8 text-center">
          <h3 className="font-semibold mb-2">Ready to start construction?</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Complete the planning wizard first, then transition to construction phase
          </p>
          <Button variant="outline" disabled>
            Complete Planning First
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

function PlanningDashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-start gap-3">
        <Skeleton className="h-10 w-10 rounded" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-32" />
        </div>
      </div>
      <Skeleton className="h-48" />
      <Skeleton className="h-24" />
      <div className="grid gap-4 md:grid-cols-2">
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    </div>
  )
}
