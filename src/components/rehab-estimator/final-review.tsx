'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  CheckCircle, 
  AlertTriangle, 
  TrendingUp, 
  Calendar, 
  DollarSign,
  Download,
  Share2,
  Save,
  ArrowLeft,
  ArrowRight
} from 'lucide-react'
import { CostBreakdownChart, ROIAnalysisChart } from '@/components/charts'
import { useRouter } from 'next/navigation'

interface FinalReviewProps {
  project: any
  onNext: (data: any) => void
  onBack: () => void
}

export function FinalReview({ project, onNext, onBack }: FinalReviewProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [estimateData, setEstimateData] = useState<any>(null)
  const [roiData, setROIData] = useState<any>(null)

  useEffect(() => {
    // Fetch estimate and ROI data
    fetchEstimateData()
    fetchROIData()
  }, [project])

  const fetchEstimateData = async () => {
    try {
      const response = await fetch('/api/calculations/estimate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scopeItems: project.scopeItems || []
        })
      })

      if (response.ok) {
        const data = await response.json()
        setEstimateData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch estimate:', error)
    }
  }

  const fetchROIData = async () => {
    try {
      const response = await fetch('/api/calculations/roi', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          purchasePrice: project.purchasePrice || 0,
          rehabCost: estimateData?.totalCost || 0,
          arv: project.arv || 0,
          strategy: project.investmentStrategy || 'flip',
          monthlyRent: project.monthlyRent
        })
      })

      if (response.ok) {
        const data = await response.json()
        setROIData(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch ROI:', error)
    }
  }

  const handleSaveProject = async () => {
    setIsSaving(true)
    try {
      // Save to database via API
      const response = await fetch(project.id ? `/api/rehab/projects/${project.id}` : '/api/rehab/projects', {
        method: project.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          status: 'draft',
          estimateData,
          roiData
        })
      })

      if (response.ok) {
        const data = await response.json()
        console.log('Project saved:', data)
      }
    } catch (error) {
      console.error('Failed to save project:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleFinalize = async () => {
    setIsSubmitting(true)
    try {
      // Save final version
      const response = await fetch(project.id ? `/api/rehab/projects/${project.id}` : '/api/rehab/projects', {
        method: project.id ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...project,
          status: 'active',
          estimateData,
          roiData,
          finalizedAt: new Date().toISOString()
        })
      })

      if (response.ok) {
        const data = await response.json()
        router.push('/dashboard')
      }
    } catch (error) {
      console.error('Failed to finalize project:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const getProjectSummary = () => {
    const scopeItems = project.scopeItems || []
    const assessments = project.assessments || {}
    const phases = project.phases || []
    
    return {
      totalCost: scopeItems.reduce((sum: number, item: any) => sum + item.totalCost, 0),
      totalDays: phases.reduce((sum: number, phase: any) => sum + (phase.endDay - phase.startDay), 0),
      totalROI: scopeItems.reduce((sum: number, item: any) => sum + item.roiImpact, 0),
      roomsAssessed: Object.keys(assessments).length,
      scopeItems: scopeItems.length,
      phases: phases.length
    }
  }

  const summary = getProjectSummary()

  const getRiskLevel = () => {
    const budgetUtilization = (summary.totalCost / project.maxBudget) * 100
    if (budgetUtilization > 90) return { level: 'High', color: 'destructive', icon: AlertTriangle }
    if (budgetUtilization > 75) return { level: 'Medium', color: 'default', icon: AlertTriangle }
    return { level: 'Low', color: 'secondary', icon: CheckCircle }
  }

  const getROILevel = () => {
    if (summary.totalROI > 20) return { level: 'Excellent', color: 'default', icon: TrendingUp }
    if (summary.totalROI > 15) return { level: 'Good', color: 'secondary', icon: TrendingUp }
    return { level: 'Fair', color: 'outline', icon: TrendingUp }
  }

  const riskInfo = getRiskLevel()
  const roiInfo = getROILevel()
  const RiskIcon = riskInfo.icon
  const ROIIcon = roiInfo.icon

  return (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold mb-2">Final Review</h2>
        <p className="text-muted-foreground">
          Review your strategic rehab plan before finalizing
        </p>
      </div>

      {/* Project Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Project Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{project.projectName}</div>
              <div className="text-sm text-muted-foreground">Project Name</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{project.address?.city}, {project.address?.state}</div>
              <div className="text-sm text-muted-foreground">Location</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{project.squareFeet?.toLocaleString()}</div>
              <div className="text-sm text-muted-foreground">Square Feet</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{project.propertyType?.replace('_', ' ')}</div>
              <div className="text-sm text-muted-foreground">Property Type</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Financial Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Financial Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-lg bg-blue-50">
              <div className="text-3xl font-bold text-blue-600">${summary.totalCost.toLocaleString()}</div>
              <div className="text-sm text-blue-600">Total Investment</div>
              <Progress 
                value={(summary.totalCost / project.maxBudget) * 100} 
                className="mt-2 h-2"
              />
              <div className="text-xs text-blue-600 mt-1">
                {((summary.totalCost / project.maxBudget) * 100).toFixed(0)}% of budget
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-green-50">
              <div className="text-3xl font-bold text-green-600">+{summary.totalROI.toFixed(1)}%</div>
              <div className="text-sm text-green-600">Expected ROI</div>
              <div className="text-xs text-green-600 mt-1">
                Based on market analysis
              </div>
            </div>
            
            <div className="text-center p-4 rounded-lg bg-purple-50">
              <div className="text-3xl font-bold text-purple-600">{summary.totalDays}</div>
              <div className="text-sm text-purple-600">Total Days</div>
              <div className="text-xs text-purple-600 mt-1">
                {Math.ceil(summary.totalDays / 30)} months
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Risk Assessment */}
      <Card>
        <CardHeader>
          <CardTitle>Risk Assessment</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <RiskIcon className={`w-6 h-6 text-${riskInfo.color === 'destructive' ? 'red' : riskInfo.color === 'default' ? 'blue' : 'green'}-600`} />
              <div>
                <div className="font-medium">Budget Risk</div>
                <Badge variant={riskInfo.color as any}>{riskInfo.level}</Badge>
              </div>
            </div>
            
            <div className="flex items-center space-x-3 p-3 rounded-lg bg-gray-50">
              <ROIIcon className="w-6 h-6 text-green-600" />
              <div>
                <div className="font-medium">ROI Potential</div>
                <Badge variant={roiInfo.color as any}>{roiInfo.level}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Scope Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Scope Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{summary.roomsAssessed}</div>
              <div className="text-sm text-muted-foreground">Rooms Assessed</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.scopeItems}</div>
              <div className="text-sm text-muted-foreground">Scope Items</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{summary.phases}</div>
              <div className="text-sm text-muted-foreground">Execution Phases</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{project.investmentStrategy}</div>
              <div className="text-sm text-muted-foreground">Strategy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Data Visualizations */}
      <Tabs defaultValue="cost" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="cost">Cost Analysis</TabsTrigger>
          <TabsTrigger value="roi">ROI Projections</TabsTrigger>
        </TabsList>

        <TabsContent value="cost" className="mt-4">
          {estimateData ? (
            <CostBreakdownChart data={estimateData} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Loading cost analysis...
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="roi" className="mt-4">
          {roiData ? (
            <ROIAnalysisChart data={roiData} />
          ) : (
            <Card>
              <CardContent className="p-12 text-center text-muted-foreground">
                Loading ROI analysis...
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Final Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Ready to Proceed?</CardTitle>
          <CardDescription>
            Save your project or finalize to begin implementation
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <CheckCircle className="h-4 w-4" />
            <AlertDescription>
              Your rehab plan is complete and ready for execution. Save as draft to continue working later, 
              or finalize to mark this project as active.
            </AlertDescription>
          </Alert>
          
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={handleSaveProject}
              disabled={isSaving}
            >
              {isSaving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-current mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Save Draft
                </>
              )}
            </Button>

            <Button
              variant="outline"
              onClick={() => {/* Export functionality */}}
            >
              <Download className="w-4 h-4 mr-2" />
              Export PDF
            </Button>

            <Button
              variant="outline"
              onClick={() => {/* Share functionality */}}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between pt-6">
        <Button variant="outline" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>

        <Button 
          onClick={handleFinalize} 
          disabled={isSubmitting}
          size="lg"
        >
          {isSubmitting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Finalizing...
            </>
          ) : (
            <>
              Finalize & Start Project
              <ArrowRight className="w-4 h-4 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
