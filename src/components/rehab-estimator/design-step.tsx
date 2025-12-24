"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  Palette,
  Package,
  Layout,
  ArrowLeft,
  ArrowRight,
  Loader2,
  Check,
  Plus,
} from "lucide-react"
import { toast } from "sonner"
import { ProjectColorPlanner } from "@/components/design/project-color-planner"
import { ProjectMaterialSelector } from "@/components/design/project-material-selector"
import type { RehabProject } from "@/types/rehab"
import type { Color, Material, ProjectColorSelection, ProjectMaterialSelection, Moodboard } from "@/types/design"

interface DesignStepProps {
  project: Partial<RehabProject>
  onNext?: (data: Record<string, unknown>) => void
  onBack?: () => void
  currentStep?: number
  totalSteps?: number
}

export function DesignStep({
  project,
  onNext,
  onBack,
  currentStep = 1,
  totalSteps = 7,
}: DesignStepProps) {
  const [activeTab, setActiveTab] = React.useState("colors")
  const [loading, setLoading] = React.useState(true)
  const [saving, setSaving] = React.useState(false)

  // Data state
  const [colors, setColors] = React.useState<Color[]>([])
  const [materials, setMaterials] = React.useState<Material[]>([])
  const [colorSelections, setColorSelections] = React.useState<(ProjectColorSelection & { color?: Color })[]>([])
  const [materialSelections, setMaterialSelections] = React.useState<(ProjectMaterialSelection & { material?: Material })[]>([])
  const [moodboards, setMoodboards] = React.useState<Moodboard[]>([])

  // Load data on mount
  React.useEffect(() => {
    loadData()
  }, [project.id])

  const loadData = async () => {
    setLoading(true)
    try {
      // Load colors library
      const colorsRes = await fetch("/api/colors")
      if (colorsRes.ok) {
        const data = await colorsRes.json()
        setColors(data.data || [])
      }

      // Load materials library
      const materialsRes = await fetch("/api/materials")
      if (materialsRes.ok) {
        const data = await materialsRes.json()
        setMaterials(data.data || [])
      }

      // Load project color selections
      if (project.id) {
        const colorSelectionsRes = await fetch(`/api/projects/${project.id}/colors`)
        if (colorSelectionsRes.ok) {
          const data = await colorSelectionsRes.json()
          setColorSelections(data.data || [])
        }

        // Load moodboards
        const moodboardsRes = await fetch(`/api/moodboards?projectId=${project.id}`)
        if (moodboardsRes.ok) {
          const data = await moodboardsRes.json()
          setMoodboards(data.data || [])
        }
      }
    } catch (error) {
      console.error("Error loading design data:", error)
      toast.error("Failed to load design data")
    } finally {
      setLoading(false)
    }
  }

  // Color selection handlers
  const handleAddColorSelection = async (colorId: string, roomName?: string, surface?: string) => {
    if (!project.id) {
      toast.error("Please save the project first")
      return
    }

    const response = await fetch(`/api/projects/${project.id}/colors`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ colorId, roomName, applicationSurface: surface }),
    })

    if (response.ok) {
      const data = await response.json()
      const color = colors.find((c) => c.id === colorId)
      setColorSelections([...colorSelections, { ...data.data, color }])
    } else {
      throw new Error("Failed to add color selection")
    }
  }

  const handleUpdateColorSelection = async (id: string, updates: Partial<ProjectColorSelection>) => {
    const response = await fetch(`/api/color-selections/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(updates),
    })

    if (response.ok) {
      const data = await response.json()
      setColorSelections(colorSelections.map((s) => (s.id === id ? { ...s, ...data.data } : s)))
    } else {
      throw new Error("Failed to update color selection")
    }
  }

  const handleDeleteColorSelection = async (id: string) => {
    const response = await fetch(`/api/color-selections/${id}`, {
      method: "DELETE",
    })

    if (response.ok) {
      setColorSelections(colorSelections.filter((s) => s.id !== id))
    } else {
      throw new Error("Failed to delete color selection")
    }
  }

  // Material selection handlers
  const handleAddMaterialSelection = async (materialId: string, roomName?: string) => {
    if (!project.id) {
      toast.error("Please save the project first")
      return
    }

    // For now, add to local state - in production, this would call the API
    const material = materials.find((m) => m.id === materialId)
    const newSelection: ProjectMaterialSelection & { material?: Material } = {
      id: `temp-${Date.now()}`,
      projectId: project.id,
      materialId,
      roomName: roomName || null,
      quantity: null,
      installationStatus: "planned",
      notes: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      material,
    }
    setMaterialSelections([...materialSelections, newSelection])
  }

  const handleUpdateMaterialSelection = async (id: string, updates: Partial<ProjectMaterialSelection>) => {
    setMaterialSelections(materialSelections.map((s) => (s.id === id ? { ...s, ...updates } : s)))
  }

  const handleDeleteMaterialSelection = async (id: string) => {
    setMaterialSelections(materialSelections.filter((s) => s.id !== id))
  }

  // Create moodboard
  const handleCreateMoodboard = async () => {
    if (!project.id) {
      toast.error("Please save the project first")
      return
    }

    try {
      const response = await fetch("/api/moodboards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          projectId: project.id,
          name: `${project.propertyAddress || "Property"} Moodboard`,
          moodboardType: "custom",
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMoodboards([...moodboards, data.data])
        toast.success("Moodboard created")
      } else {
        throw new Error("Failed to create moodboard")
      }
    } catch (error) {
      toast.error("Failed to create moodboard")
    }
  }

  // Handle next step
  const handleNext = async () => {
    setSaving(true)
    try {
      onNext?.({
        colorSelections,
        materialSelections,
        moodboards,
      })
    } catch (error) {
      toast.error("Failed to save design selections")
    } finally {
      setSaving(false)
    }
  }

  // Progress indicators
  const colorProgress = colorSelections.length > 0
  const materialProgress = materialSelections.length > 0
  const moodboardProgress = moodboards.length > 0

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Design Selections</h2>
          <p className="text-muted-foreground">
            Choose colors, materials, and create a moodboard for your renovation
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant={colorProgress ? "default" : "outline"} className="gap-1">
            <Palette className="h-3 w-3" />
            {colorSelections.length} Colors
            {colorProgress && <Check className="h-3 w-3" />}
          </Badge>
          <Badge variant={materialProgress ? "default" : "outline"} className="gap-1">
            <Package className="h-3 w-3" />
            {materialSelections.length} Materials
            {materialProgress && <Check className="h-3 w-3" />}
          </Badge>
          <Badge variant={moodboardProgress ? "default" : "outline"} className="gap-1">
            <Layout className="h-3 w-3" />
            {moodboards.length} Moodboard{moodboards.length !== 1 ? "s" : ""}
            {moodboardProgress && <Check className="h-3 w-3" />}
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Main content tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="colors" className="gap-2">
            <Palette className="h-4 w-4" />
            Color Plan
          </TabsTrigger>
          <TabsTrigger value="materials" className="gap-2">
            <Package className="h-4 w-4" />
            Materials
          </TabsTrigger>
          <TabsTrigger value="moodboard" className="gap-2">
            <Layout className="h-4 w-4" />
            Moodboard
          </TabsTrigger>
        </TabsList>

        {/* Colors tab */}
        <TabsContent value="colors" className="space-y-6">
          <ProjectColorPlanner
            projectId={project.id || ""}
            selections={colorSelections}
            colors={colors}
            loading={loading}
            onAddSelection={handleAddColorSelection}
            onUpdateSelection={handleUpdateColorSelection}
            onDeleteSelection={handleDeleteColorSelection}
          />
        </TabsContent>

        {/* Materials tab */}
        <TabsContent value="materials" className="space-y-6">
          <ProjectMaterialSelector
            projectId={project.id || ""}
            selections={materialSelections}
            materials={materials}
            loading={loading}
            onAddSelection={handleAddMaterialSelection}
            onUpdateSelection={handleUpdateMaterialSelection}
            onDeleteSelection={handleDeleteMaterialSelection}
          />
        </TabsContent>

        {/* Moodboard tab */}
        <TabsContent value="moodboard" className="space-y-6">
          {moodboards.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Layout className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No moodboard yet</h3>
                <p className="text-muted-foreground text-center max-w-sm mb-6">
                  Create a visual moodboard to showcase your design vision with
                  colors, materials, and inspiration images.
                </p>
                <Button onClick={handleCreateMoodboard} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create Moodboard
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {moodboards.map((moodboard) => (
                <Card
                  key={moodboard.id}
                  className="cursor-pointer hover:border-primary/50 transition-colors"
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{moodboard.name}</CardTitle>
                        <CardDescription className="text-sm">
                          {moodboard.canvasWidth} × {moodboard.canvasHeight}px
                        </CardDescription>
                      </div>
                      {moodboard.isPrimary && <Badge>Primary</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div
                      className="aspect-video rounded-md border overflow-hidden"
                      style={{ backgroundColor: moodboard.backgroundColor }}
                    >
                      <div className="w-full h-full flex items-center justify-center text-muted-foreground text-sm">
                        Click to edit
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {/* Add moodboard card */}
              <Card
                className="border-dashed cursor-pointer hover:border-primary/50 transition-colors"
                onClick={handleCreateMoodboard}
              >
                <CardContent className="flex flex-col items-center justify-center h-full py-12">
                  <Plus className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Add Moodboard</p>
                </CardContent>
              </Card>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Navigation buttons */}
      <Separator />
      <div className="flex items-center justify-between">
        <Button variant="outline" onClick={onBack} disabled={!onBack}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          Step {currentStep} of {totalSteps}
        </div>

        <Button onClick={handleNext} disabled={saving}>
          {saving ? (
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          ) : (
            <ArrowRight className="h-4 w-4 ml-2" />
          )}
          Continue
        </Button>
      </div>
    </div>
  )
}

