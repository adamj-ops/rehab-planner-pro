'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { IconPlus, IconHome, IconTrendingUp, IconClock, IconCash } from '@tabler/icons-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { Progress } from '@/components/ui/progress'
import { projectService } from '@/lib/supabase/database'
import { useRehabStore } from '@/hooks/use-rehab-store'
import { RehabProject, ProjectStatus } from '@/types/database'
import { useSpring, animated } from '@react-spring/web'
import { useInView } from 'react-intersection-observer'
import { motion } from 'framer-motion'
import { StaggerChildren } from '@/components/animation'

// Status badge color mapping
const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200',
  active: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
  in_progress: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  completed: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
  on_hold: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  archived: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200',
}

// Status display labels
const statusLabels: Record<ProjectStatus, string> = {
  draft: 'Draft',
  active: 'Active',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
  archived: 'Archived',
}

interface DashboardStats {
  activeProjects: number
  completedProjects: number
  totalBudget: number
  totalEstimatedCost: number
  avgRoi: number | null
}

// Animated counter component
function AnimatedCounter({ value, formatFn }: { value: number; formatFn?: (val: number) => string }) {
  const [ref, inView] = useInView({ triggerOnce: true, threshold: 0.1 })
  const springProps = useSpring({
    from: { val: 0 },
    to: { val: inView ? value : 0 },
    config: { tension: 280, friction: 60 },
  })

  return (
    <animated.div ref={ref} className="text-2xl font-bold">
      {springProps.val.to((val) => formatFn ? formatFn(val) : Math.floor(val).toLocaleString())}
    </animated.div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [projects, setProjects] = useState<RehabProject[]>([])
  const [stats, setStats] = useState<DashboardStats>({
    activeProjects: 0,
    completedProjects: 0,
    totalBudget: 0,
    totalEstimatedCost: 0,
    avgRoi: null,
  })

  const resetProject = useRehabStore((state) => state.resetProject)

  useEffect(() => {
    async function loadDashboardData() {
      setLoading(true)
      try {
        const allProjects = await projectService.getAll()
        setProjects(allProjects.slice(0, 5)) // Recent 5 projects

        // Calculate stats
        const activeCount = allProjects.filter(
          (p) => p.status === 'active' || p.status === 'in_progress'
        ).length
        const completedCount = allProjects.filter(
          (p) => p.status === 'completed'
        ).length
        const totalBudget = allProjects.reduce(
          (sum, p) => sum + (p.max_budget || 0),
          0
        )
        const totalEstimatedCost = allProjects.reduce(
          (sum, p) => sum + (p.total_estimated_cost || 0),
          0
        )

        // Calculate average ROI for completed projects
        const completedWithRoi = allProjects.filter(
          (p) => p.status === 'completed' && p.arv && p.purchase_price && p.total_estimated_cost
        )
        let avgRoi: number | null = null
        if (completedWithRoi.length > 0) {
          const totalRoi = completedWithRoi.reduce((sum, p) => {
            const profit = (p.arv || 0) - (p.purchase_price || 0) - (p.total_estimated_cost || 0)
            const investment = (p.purchase_price || 0) + (p.total_estimated_cost || 0)
            return sum + (investment > 0 ? (profit / investment) * 100 : 0)
          }, 0)
          avgRoi = totalRoi / completedWithRoi.length
        }

        setStats({
          activeProjects: activeCount,
          completedProjects: completedCount,
          totalBudget,
          totalEstimatedCost,
          avgRoi,
        })
      } catch (error) {
        console.error('Error loading dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    loadDashboardData()
  }, [])

  const handleNewProject = () => {
    resetProject()
    router.push('/wizard/step-1')
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  if (loading) {
    return <DashboardSkeleton />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back! Here&apos;s an overview of your rehab projects.
          </p>
        </div>
        <Button onClick={handleNewProject} className="rounded-none gap-2">
          <IconPlus className="h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Grid */}
      <StaggerChildren staggerDelay={0.1} className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <IconHome className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter value={stats.activeProjects} />
            <p className="text-xs text-muted-foreground">Currently in progress</p>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <IconClock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter value={stats.completedProjects} />
            <p className="text-xs text-muted-foreground">Projects finished</p>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Budget</CardTitle>
            <IconCash className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <AnimatedCounter
              value={stats.totalBudget}
              formatFn={(val) => new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: 'USD',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0,
              }).format(Math.floor(val))}
            />
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card className="rounded-none">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg ROI</CardTitle>
            <IconTrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {stats.avgRoi !== null ? (
              <AnimatedCounter
                value={stats.avgRoi}
                formatFn={(val) => {
                  const formatted = val.toFixed(1);
                  return `${formatted}%`;
                }}
              />
            ) : (
              <div className="text-2xl font-bold">-</div>
            )}
            <p className="text-xs text-muted-foreground">On completed projects</p>
          </CardContent>
        </Card>
      </StaggerChildren>

      {/* Recent Projects */}
      <Card className="rounded-none">
        <CardHeader>
          <CardTitle>Recent Projects</CardTitle>
          <CardDescription>Your most recent rehab projects</CardDescription>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="text-center py-8">
              <IconHome className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first project to get started.
              </p>
              <Button onClick={handleNewProject} className="rounded-none gap-2">
                <IconPlus className="h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <>
              <div className="space-y-4">
                {projects.map((project) => {
                  const status = (project.status || 'draft') as ProjectStatus
                  // Calculate a simple progress based on status
                  const progressMap: Record<ProjectStatus, number> = {
                    draft: 10,
                    active: 25,
                    in_progress: 60,
                    on_hold: 50,
                    completed: 100,
                    archived: 100,
                  }
                  const progress = progressMap[status]

                  return (
                    <motion.div
                      key={project.id}
                      className="flex items-center justify-between p-4 border rounded-none"
                      whileHover={{
                        y: -4,
                        scale: 1.01,
                        boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)"
                      }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                    >
                      <div className="flex items-center gap-4">
                        <div className="h-10 w-10 bg-primary/10 flex items-center justify-center rounded-none">
                          <IconHome className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{project.project_name}</p>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            {status === 'in_progress' ? (
                              <motion.div
                                animate={{
                                  scale: [1, 1.05, 1],
                                  opacity: [0.8, 1, 0.8]
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                              >
                                <Badge
                                  variant="secondary"
                                  className={`rounded-none text-xs ${statusColors[status]}`}
                                >
                                  {statusLabels[status]}
                                </Badge>
                              </motion.div>
                            ) : status === 'completed' ? (
                              <motion.div
                                initial={{ scale: 0.8 }}
                                animate={{ scale: 1 }}
                                transition={{ type: "spring", stiffness: 500, damping: 15 }}
                              >
                                <Badge
                                  variant="secondary"
                                  className={`rounded-none text-xs ${statusColors[status]}`}
                                >
                                  ✓ {statusLabels[status]}
                                </Badge>
                              </motion.div>
                            ) : (
                              <Badge
                                variant="secondary"
                                className={`rounded-none text-xs ${statusColors[status]}`}
                              >
                                {statusLabels[status]}
                              </Badge>
                            )}
                            {project.max_budget && (
                              <span>• {formatCurrency(project.max_budget)} budget</span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="w-24 hidden sm:block">
                          <Progress value={progress} className="h-2 rounded-none" />
                          <p className="text-xs text-muted-foreground mt-1 text-right">
                            {progress}%
                          </p>
                        </div>
                        <Button variant="ghost" size="sm" asChild className="rounded-none">
                          <Link href={`/projects/${project.id}`}>View</Link>
                        </Button>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
              <div className="mt-4 pt-4 border-t">
                <Button variant="outline" className="w-full rounded-none" asChild>
                  <Link href="/projects">View All Projects</Link>
                </Button>
              </div>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <Skeleton className="h-9 w-32 rounded-none" />
          <Skeleton className="h-4 w-64 rounded-none" />
        </div>
        <Skeleton className="h-10 w-32 rounded-none" />
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="border p-6 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-none" />
              <Skeleton className="h-4 w-4 rounded-none" />
            </div>
            <Skeleton className="h-8 w-16 rounded-none" />
            <Skeleton className="h-3 w-32 rounded-none" />
          </div>
        ))}
      </div>

      {/* Recent Projects */}
      <div className="border p-6 space-y-4">
        <div className="space-y-2">
          <Skeleton className="h-6 w-40 rounded-none" />
          <Skeleton className="h-4 w-64 rounded-none" />
        </div>
        <div className="space-y-4 pt-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center justify-between p-4 border">
              <div className="flex items-center gap-4">
                <Skeleton className="h-10 w-10 rounded-none" />
                <div className="space-y-2">
                  <Skeleton className="h-5 w-40 rounded-none" />
                  <Skeleton className="h-4 w-32 rounded-none" />
                </div>
              </div>
              <div className="flex items-center gap-4">
                <Skeleton className="h-2 w-24 rounded-none" />
                <Skeleton className="h-8 w-16 rounded-none" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
