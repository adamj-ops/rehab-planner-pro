"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  IconListNumbers, 
  IconPlus, 
  IconTrash,
  IconCurrencyDollar,
  IconTrendingUp,
  IconSparkles,
  IconChevronUp,
} from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Form, FormField } from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { useWizard } from "@/components/wizard/wizard-context";
import {
  priorityMatrixSchema,
  type PriorityMatrixFormData,
  type ScopeItemFormData,
  type StrategyFormData,
  PRIORITY_LEVELS,
} from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";
import { PriorityScoringEngine, type PriorityScore } from "@/lib/priority-engine";
import type { OptimizableItem } from "@/lib/priority-engine/budget-optimizer";
import { PriorityScoreCard } from "./priority-score-card";
import { BudgetOptimizationDialog } from "./budget-optimization-dialog";
import { DependencySelector } from "./dependency-selector";
import type { DependencyItem } from "@/lib/utils/dependency-validation";
import ScenarioComparisonPanel from "./scenario-comparison-panel";
import ScenarioBuilderDialog from "./scenario-builder-dialog";
import { useScenarios } from "@/hooks/use-scenarios";
import { CreateScenarioParams, BudgetScenario } from "@/types/scenario";

const CATEGORY_OPTIONS = [
  { value: "exterior", label: "Exterior" },
  { value: "interior", label: "Interior" },
  { value: "kitchen", label: "Kitchen" },
  { value: "bathroom", label: "Bathroom" },
  { value: "flooring", label: "Flooring" },
  { value: "electrical", label: "Electrical" },
  { value: "plumbing", label: "Plumbing" },
  { value: "hvac", label: "HVAC" },
  { value: "roofing", label: "Roofing" },
  { value: "landscaping", label: "Landscaping" },
  { value: "structural", label: "Structural" },
  { value: "other", label: "Other" },
];

const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  must: { label: "Must Have", color: "bg-red-500" },
  should: { label: "Should Have", color: "bg-orange-500" },
  could: { label: "Could Have", color: "bg-yellow-500" },
  nice_to_have: { label: "Nice to Have", color: "bg-green-500" },
};

const DEFAULT_SCOPE_ITEMS: ScopeItemFormData[] = [
  {
    category: "kitchen",
    item_name: "Cabinet Refinishing",
    description: "Refinish existing cabinets with new paint/stain",
    priority: "should",
    total_cost: 2500,
    estimated_duration_days: 3,
    urgency_score: 60,
    roi_impact_score: 75,
    is_included: true,
    is_approved: false,
  },
  {
    category: "flooring",
    item_name: "LVP Flooring Installation",
    description: "Install luxury vinyl plank throughout main areas",
    priority: "must",
    total_cost: 4500,
    estimated_duration_days: 2,
    urgency_score: 80,
    roi_impact_score: 85,
    is_included: true,
    is_approved: false,
  },
  {
    category: "bathroom",
    item_name: "Vanity Replacement",
    description: "Replace bathroom vanity and mirror",
    priority: "should",
    total_cost: 1200,
    estimated_duration_days: 1,
    urgency_score: 50,
    roi_impact_score: 70,
    is_included: true,
    is_approved: false,
  },
  {
    category: "exterior",
    item_name: "Front Door Replacement",
    description: "Install new entry door with hardware",
    priority: "could",
    total_cost: 1800,
    estimated_duration_days: 1,
    urgency_score: 40,
    roi_impact_score: 90,
    is_included: true,
    is_approved: false,
  },
];

// Helper to convert ScopeItemFormData to ScopeItem format for priority engine
function convertToScopeItem(item: ScopeItemFormData, index: number) {
  return {
    id: item.id || `item-${index}`,
    projectId: "wizard",
    category: item.category || "other",
    subcategory: item.subcategory,
    itemName: item.item_name,
    description: item.description,
    location: item.room_name,
    quantity: item.quantity || 1,
    unitOfMeasure: item.unit_type || "each",
    materialCost: item.material_cost || 0,
    laborCost: item.labor_cost || 0,
    totalCost: item.total_cost || 0,
    priority: item.priority === "nice_to_have" ? "nice" : item.priority,
    roiImpact: item.roi_impact_score || 50,
    daysRequired: item.estimated_duration_days || 1,
    dependsOn: item.depends_on || [],
    phase: item.priority === "must" ? 1 : item.priority === "should" ? 2 : item.priority === "could" ? 3 : 4,
    included: item.is_included ?? true,
    completed: false,
  };
}

// Helper to get current season
function getCurrentSeason(): "spring" | "summer" | "fall" | "winter" {
  const month = new Date().getMonth();
  if (month >= 2 && month <= 4) return "spring";
  if (month >= 5 && month <= 7) return "summer";
  if (month >= 8 && month <= 10) return "fall";
  return "winter";
}

export function PriorityMatrixForm() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();
  const [showOptimizationDialog, setShowOptimizationDialog] = useState(false);
  const [priorityScores, setPriorityScores] = useState<Map<number, PriorityScore>>(new Map());
  
  // Scenario management state
  const [showScenarioDialog, setShowScenarioDialog] = useState(false);
  const [editingScenario, setEditingScenario] = useState<BudgetScenario | undefined>();

  // Filter and sort state
  const [filters, setFilters] = useState({
    category: 'all',
    priority: 'all', 
    status: 'all', // included, excluded, all
    search: '',
  });

  const [sortConfig, setSortConfig] = useState({
    field: 'priority_score', // priority_score, cost, duration, name
    direction: 'desc' as 'asc' | 'desc',
  });

  const storedData = getStepData<PriorityMatrixFormData>(5);
  const step3Data = getStepData<StrategyFormData>(3);
  
  // Scenario management
  // Note: In a real app, we'd get the projectId from context/props
  const projectId = "wizard-project"; // Placeholder for wizard mode
  const scenarios = useScenarios(projectId);
  
  const form = useForm<PriorityMatrixFormData>({
    resolver: zodResolver(priorityMatrixSchema),
    defaultValues: {
      scope_items: storedData?.scope_items?.length ? storedData.scope_items : DEFAULT_SCOPE_ITEMS,
    },
    mode: "onBlur",
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "scope_items",
  });

  // Auto-save on changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      setStepData(5, data as Partial<PriorityMatrixFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepData]);

  // Auto-create baseline scenario
  useEffect(() => {
    const createBaseline = async () => {
      const items = form.getValues("scope_items");
      if (items && items.length > 0 && scenarios.scenarios.length === 0 && !scenarios.isLoading) {
        try {
          await scenarios.createBaseline(
            projectId,
            optimizableItems,
            step3Data?.max_budget || 100000
          );
        } catch (error) {
          console.warn('Failed to create baseline scenario:', error);
        }
      }
    };

    createBaseline();
  }, [form, scenarios, optimizableItems, projectId, step3Data?.max_budget]);

  // Calculate priority scores when items or strategy changes
  useEffect(() => {
    const items = form.getValues("scope_items");
    if (!items || items.length === 0) return;

    // Convert to ScopeItem format for priority engine
    const scopeItems = items.map((item, index) => convertToScopeItem(item, index));

    // Build project context from wizard data
    const projectContext = {
      strategy: (step3Data?.investment_strategy as "flip" | "rental" | "wholetail" | "airbnb") || "flip",
      timeline: 6, // Default 6 months, could come from step3
      budget: step3Data?.max_budget || 100000,
      season: getCurrentSeason(),
      marketConditions: "balanced" as const,
    };

    // Calculate scores for each item
    const newScores = new Map<number, PriorityScore>();
    scopeItems.forEach((scopeItem, index) => {
      try {
        const score = PriorityScoringEngine.calculatePriorityScore(
          scopeItem,
          scopeItems,
          projectContext
        );
        newScores.set(index, score);
        
        // Update the urgency and ROI scores in the form
        const currentItem = items[index];
        if (currentItem && score.overall !== currentItem.urgency_score) {
          // Only update if significantly different to avoid infinite loops
          const overallDiff = Math.abs(score.overall - (currentItem.urgency_score || 50));
          if (overallDiff > 5) {
            form.setValue(`scope_items.${index}.urgency_score`, score.components.urgency);
            form.setValue(`scope_items.${index}.roi_impact_score`, score.components.roiImpact);
          }
        }
      } catch {
        // Fallback to default score if calculation fails
        newScores.set(index, {
          overall: 50,
          components: {
            urgency: 50,
            roiImpact: 50,
            riskMitigation: 50,
            dependencies: 50,
            marketTiming: 50,
            complexity: 50,
          },
          reasoning: [],
        });
      }
    });

    setPriorityScores(newScores);
  }, [form, step3Data]);

  // Convert items for budget optimizer
  const optimizableItems = useMemo<OptimizableItem[]>(() => {
    const items = form.getValues("scope_items") || [];
    return items.map((item, index) => ({
      id: item.id || `item-${index}`,
      name: item.item_name || `Item ${index + 1}`,
      cost: item.total_cost || 0,
      value: priorityScores.get(index)?.overall || item.roi_impact_score || 50,
      priority: item.priority === "nice_to_have" ? "nice" : item.priority,
      category: item.category || "other",
    }));
  }, [form, priorityScores]);

  // Get currently selected (included) items
  const currentSelection = useMemo(() => {
    const items = form.getValues("scope_items") || [];
    return optimizableItems.filter((_, index) => items[index]?.is_included);
  }, [form, optimizableItems]);

  // Filtered and sorted scope items
  const filteredAndSortedItems = useMemo(() => {
    let filtered = [...fields];
    const scopeItems = form.getValues("scope_items") || [];
    
    // Apply filters
    if (filters.category !== 'all') {
      filtered = filtered.filter((_, index) => 
        scopeItems[index]?.category === filters.category
      );
    }
    
    if (filters.priority !== 'all') {
      filtered = filtered.filter((_, index) => 
        scopeItems[index]?.priority === filters.priority
      );
    }
    
    if (filters.status !== 'all') {
      const includeItems = filters.status === 'included';
      filtered = filtered.filter((_, index) => 
        scopeItems[index]?.is_included === includeItems
      );
    }
    
    if (filters.search) {
      filtered = filtered.filter((_, index) => 
        scopeItems[index]?.item_name?.toLowerCase().includes(filters.search.toLowerCase()) ||
        scopeItems[index]?.description?.toLowerCase().includes(filters.search.toLowerCase())
      );
    }
    
    // Apply sorting
    filtered.sort((a, b) => {
      const aIndex = fields.indexOf(a);
      const bIndex = fields.indexOf(b);
      const aItem = scopeItems[aIndex];
      const bItem = scopeItems[bIndex];
      
      let aValue: string | number = 0;
      let bValue: string | number = 0;
      
      switch (sortConfig.field) {
        case 'priority_score':
          aValue = priorityScores.get(aIndex)?.overall || aItem?.roi_impact_score || 0;
          bValue = priorityScores.get(bIndex)?.overall || bItem?.roi_impact_score || 0;
          break;
        case 'cost':
          aValue = aItem?.total_cost || 0;
          bValue = bItem?.total_cost || 0;
          break;
        case 'duration':
          aValue = aItem?.estimated_duration_days || 0;
          bValue = bItem?.estimated_duration_days || 0;
          break;
        case 'name':
          aValue = aItem?.item_name?.toLowerCase() || '';
          bValue = bItem?.item_name?.toLowerCase() || '';
          break;
        default:
          return 0;
      }
      
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        if (sortConfig.direction === 'asc') {
          return aValue.localeCompare(bValue);
        } else {
          return bValue.localeCompare(aValue);
        }
      }
      
      if (sortConfig.direction === 'asc') {
        return (aValue as number) - (bValue as number);
      } else {
        return (bValue as number) - (aValue as number);
      }
    });
    
    return filtered;
  }, [fields, form, filters, sortConfig, priorityScores]);

  // Handle optimization apply
  const handleApplyOptimization = useCallback((selectedIds: string[]) => {
    const selectedSet = new Set(selectedIds);
    const items = form.getValues("scope_items");
    
    items.forEach((_, index) => {
      const itemId = optimizableItems[index]?.id;
      const shouldBeIncluded = selectedSet.has(itemId);
      form.setValue(`scope_items.${index}.is_included`, shouldBeIncluded);
    });
  }, [form, optimizableItems]);

  // Scenario management handlers
  const handleCreateScenario = useCallback(() => {
    setEditingScenario(undefined);
    setShowScenarioDialog(true);
  }, []);

  const handleEditScenario = useCallback((scenario: BudgetScenario) => {
    setEditingScenario(scenario);
    setShowScenarioDialog(true);
  }, []);

  const handleSaveScenario = useCallback(async (params: CreateScenarioParams) => {
    try {
      if (editingScenario) {
        await scenarios.updateScenario(editingScenario.id, {
          name: params.name,
          description: params.description,
        });
      } else {
        await scenarios.createScenario({ ...params, projectId });
      }
    } catch (error) {
      console.error('Failed to save scenario:', error);
      throw error; // Re-throw to let the dialog handle the error
    }
  }, [editingScenario, scenarios, projectId]);

  const handleDeleteScenario = useCallback(async (scenarioId: string) => {
    try {
      if (confirm('Are you sure you want to delete this scenario?')) {
        await scenarios.deleteScenario(scenarioId);
      }
    } catch (error) {
      console.error('Failed to delete scenario:', error);
    }
  }, [scenarios]);

  const handleApplyScenario = useCallback(async (scenarioId: string) => {
    try {
      const scenario = scenarios.scenarios.find(s => s.id === scenarioId);
      if (!scenario) {
        console.error('Scenario not found:', scenarioId);
        return;
      }

      // Apply the scenario's item selection to the form
      const selectedSet = new Set(scenario.selectedItemIds);
      const items = form.getValues("scope_items");
      
      items.forEach((_, index) => {
        const itemId = optimizableItems[index]?.id;
        const shouldBeIncluded = selectedSet.has(itemId);
        form.setValue(`scope_items.${index}.is_included`, shouldBeIncluded);
      });

      // Mark scenario as active
      await scenarios.applyScenario(scenarioId);
    } catch (error) {
      console.error('Failed to apply scenario:', error);
    }
  }, [scenarios, form, optimizableItems]);

  const handleCompareScenarios = useCallback((scenarioIds: string[]) => {
    // This would open a comparison dialog
    // For now, just log the comparison
    console.log('Compare scenarios:', scenarioIds);
  }, []);

  const onSubmit = async (data: PriorityMatrixFormData) => {
    setStepData(5, data);
    markStepComplete(5);
    await goToNextStep();
  };

  const handleSave = async () => {
    const data = form.getValues();
    setStepData(5, data);
    await saveDraft();
  };

  const addNewItem = () => {
    append({
      category: "other",
      item_name: "",
      description: "",
      priority: "should",
      total_cost: 0,
      estimated_duration_days: 1,
      urgency_score: 50,
      roi_impact_score: 50,
      is_included: true,
      is_approved: false,
      depends_on: [],
    });
  };

  // Handle sorting
  const handleSort = (field: string) => {
    setSortConfig(prev => ({
      field,
      direction: prev.field === field && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  // Handle clear filters
  const handleClearFilters = () => {
    setFilters({
      category: 'all',
      priority: 'all',
      status: 'all',
      search: '',
    });
  };

  // Check if any filters are active
  const hasActiveFilters = filters.category !== 'all' || filters.priority !== 'all' || 
    filters.status !== 'all' || filters.search;

  // Count active filters
  const activeFilterCount = Object.values(filters).filter(v => v && v !== 'all').length;

  const toggleIncluded = (index: number) => {
    const currentValue = form.getValues(`scope_items.${index}.is_included`);
    form.setValue(`scope_items.${index}.is_included`, !currentValue);
  };

  const scopeItems = form.watch("scope_items");
  const includedItems = scopeItems?.filter((item) => item.is_included) || [];
  const totalCost = includedItems.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const totalDays = Math.max(...includedItems.map((item) => item.estimated_duration_days || 0), 0);

  // Convert scope items to DependencyItem format for the DependencySelector
  const dependencyItems = useMemo<DependencyItem[]>(() => {
    return (scopeItems || []).map((item, index) => ({
      id: item.id || `item-${index}`,
      name: item.item_name || `Item ${index + 1}`,
      depends_on: item.depends_on || [],
    }));
  }, [scopeItems]);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Priority Matrix</h1>
          <p className="text-muted-foreground">
            Review and prioritize renovation items by ROI impact and urgency.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid gap-4 md:grid-cols-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <IconListNumbers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Items Included</p>
                  <p className="text-2xl font-bold">{includedItems.length} / {scopeItems?.length || 0}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <IconCurrencyDollar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Total</p>
                  <p className="text-2xl font-bold">${totalCost.toLocaleString()}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <IconTrendingUp className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Est. Timeline</p>
                  <p className="text-2xl font-bold">{totalDays} days</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Optimize Budget Card */}
          <Card className="border-dashed border-primary/50 bg-primary/5">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center justify-center gap-2 text-center">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        size="lg"
                        onClick={() => setShowOptimizationDialog(true)}
                        className="gap-2"
                        disabled={!scopeItems || scopeItems.length === 0}
                      >
                        <IconSparkles className="h-4 w-4" />
                        Optimize Budget
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom">
                      <p>AI-powered optimization to maximize ROI within your budget</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                <p className="text-xs text-muted-foreground">
                  Maximize value
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Scenario Comparison Panel */}
        <ScenarioComparisonPanel
          scenarios={scenarios.scenarios}
          onCreateScenario={handleCreateScenario}
          onEditScenario={handleEditScenario}
          onDeleteScenario={handleDeleteScenario}
          onApplyScenario={handleApplyScenario}
          onCompareScenarios={handleCompareScenarios}
        />

        {/* Scope Items Table */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <IconListNumbers className="h-5 w-5" />
                  Scope Items
                </CardTitle>
                <CardDescription>
                  Toggle items on/off and adjust priorities
                </CardDescription>
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={addNewItem}
                className="rounded-none"
              >
                <IconPlus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {fields.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <IconListNumbers className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No scope items added yet.</p>
                <Button
                  type="button"
                  variant="outline"
                  onClick={addNewItem}
                  className="mt-4 rounded-none"
                >
                  <IconPlus className="h-4 w-4 mr-1" />
                  Add First Item
                </Button>
              </div>
            ) : (
              <>
                {/* Filter and Sort Toolbar */}
                <div className="flex flex-wrap items-center gap-3 p-4 border border-b-0 rounded-t-lg bg-muted/30">
                  {/* Search */}
                  <div className="flex-1 min-w-[200px] max-w-sm">
                    <Input
                      placeholder="Search items..."
                      value={filters.search}
                      onChange={(e) => setFilters(prev => ({...prev, search: e.target.value}))}
                      className="h-9"
                    />
                  </div>
                  
                  {/* Category Filter */}
                  <Select
                    value={filters.category}
                    onValueChange={(value) => setFilters(prev => ({...prev, category: value}))}
                  >
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {CATEGORY_OPTIONS.map((cat) => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Priority Filter */}
                  <Select
                    value={filters.priority}
                    onValueChange={(value) => setFilters(prev => ({...prev, priority: value}))}
                  >
                    <SelectTrigger className="w-40 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Priorities</SelectItem>
                      {Object.entries(PRIORITY_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  
                  {/* Status Filter */}
                  <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters(prev => ({...prev, status: value}))}
                  >
                    <SelectTrigger className="w-32 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="included">Included</SelectItem>
                      <SelectItem value="excluded">Excluded</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Sort Controls */}
                  <Select
                    value={`${sortConfig.field}-${sortConfig.direction}`}
                    onValueChange={(value) => {
                      const [field, direction] = value.split('-') as [string, 'asc' | 'desc'];
                      setSortConfig({ field, direction });
                    }}
                  >
                    <SelectTrigger className="w-48 h-9">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="priority_score-desc">Score (High → Low)</SelectItem>
                      <SelectItem value="priority_score-asc">Score (Low → High)</SelectItem>
                      <SelectItem value="cost-desc">Cost (High → Low)</SelectItem>
                      <SelectItem value="cost-asc">Cost (Low → High)</SelectItem>
                      <SelectItem value="duration-desc">Duration (Long → Short)</SelectItem>
                      <SelectItem value="duration-asc">Duration (Short → Long)</SelectItem>
                      <SelectItem value="name-asc">Name (A → Z)</SelectItem>
                      <SelectItem value="name-desc">Name (Z → A)</SelectItem>
                    </SelectContent>
                  </Select>
                  
                  {/* Active Filters Count + Clear */}
                  {hasActiveFilters && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleClearFilters}
                      className="h-9"
                    >
                      Clear Filters
                      <Badge variant="secondary" className="ml-2 text-xs">
                        {activeFilterCount}
                      </Badge>
                    </Button>
                  )}
                </div>

                <div className="border border-t-0 rounded-b-lg overflow-hidden">
                  <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Include</TableHead>
                      <TableHead 
                        className="cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('name')}
                      >
                        <div className="flex items-center justify-between">
                          Item
                          {sortConfig.field === 'name' && (
                            <IconChevronUp className={cn("h-4 w-4 transition-transform", 
                              sortConfig.direction === 'desc' && "rotate-180")} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="w-32">Category</TableHead>
                      <TableHead className="w-32">Priority</TableHead>
                      <TableHead className="w-16 text-center">Deps</TableHead>
                      <TableHead 
                        className="w-28 text-right cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('cost')}
                      >
                        <div className="flex items-center justify-between">
                          Cost
                          {sortConfig.field === 'cost' && (
                            <IconChevronUp className={cn("h-4 w-4 transition-transform", 
                              sortConfig.direction === 'desc' && "rotate-180")} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead 
                        className="w-20 text-center cursor-pointer hover:bg-muted/50 transition-colors"
                        onClick={() => handleSort('priority_score')}
                      >
                        <div className="flex items-center justify-between">
                          Score
                          {sortConfig.field === 'priority_score' && (
                            <IconChevronUp className={cn("h-4 w-4 transition-transform", 
                              sortConfig.direction === 'desc' && "rotate-180")} />
                          )}
                        </div>
                      </TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredAndSortedItems.map((field) => {
                      const originalIndex = fields.indexOf(field);
                      const item = scopeItems?.[originalIndex];
                      const isIncluded = item?.is_included ?? true;
                      const priority = item?.priority || "should";
                      const priorityConfig = PRIORITY_CONFIG[priority];

                      return (
                        <TableRow 
                          key={field.id}
                          className={cn(!isIncluded && "opacity-50")}
                        >
                          <TableCell>
                            <Switch
                              checked={isIncluded}
                              onCheckedChange={() => toggleIncluded(originalIndex)}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`scope_items.${originalIndex}.item_name`}
                              render={({ field }) => (
                                <Input 
                                  {...field}
                                  placeholder="Item name"
                                  className="border-0 bg-transparent p-0 h-auto focus-visible:ring-0"
                                />
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`scope_items.${originalIndex}.category`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="h-8 w-full border-0 bg-transparent">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {CATEGORY_OPTIONS.map((cat) => (
                                      <SelectItem key={cat.value} value={cat.value}>
                                        {cat.label}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`scope_items.${originalIndex}.priority`}
                              render={({ field }) => (
                                <Select
                                  onValueChange={field.onChange}
                                  value={field.value}
                                >
                                  <SelectTrigger className="h-8 w-full border-0 bg-transparent">
                                    <div className="flex items-center gap-2">
                                      <div className={cn("w-2 h-2 rounded-full", priorityConfig?.color)} />
                                      <SelectValue />
                                    </div>
                                  </SelectTrigger>
                                  <SelectContent>
                                    {PRIORITY_LEVELS.map((level) => (
                                      <SelectItem key={level} value={level}>
                                        <div className="flex items-center gap-2">
                                          <div className={cn("w-2 h-2 rounded-full", PRIORITY_CONFIG[level]?.color)} />
                                          {PRIORITY_CONFIG[level]?.label}
                                        </div>
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            <DependencySelector
                              itemId={item?.id || `item-${originalIndex}`}
                              itemName={item?.item_name || `Item ${originalIndex + 1}`}
                              allItems={dependencyItems}
                              selectedDependencyIds={item?.depends_on || []}
                              onDependenciesChange={(deps) => {
                                form.setValue(`scope_items.${originalIndex}.depends_on`, deps);
                              }}
                              disabled={!isIncluded}
                            />
                          </TableCell>
                          <TableCell className="text-right">
                            <FormField
                              control={form.control}
                              name={`scope_items.${originalIndex}.total_cost`}
                              render={({ field }) => (
                                <div className="relative">
                                  <span className="absolute left-0 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">$</span>
                                  <Input 
                                    type="number"
                                    {...field}
                                    onChange={(e) => field.onChange(Number(e.target.value))}
                                    className="border-0 bg-transparent p-0 pl-3 h-auto text-right focus-visible:ring-0"
                                  />
                                </div>
                              )}
                            />
                          </TableCell>
                          <TableCell className="text-center">
                            {(() => {
                              const score = priorityScores.get(originalIndex);
                              return score ? (
                                <PriorityScoreCard
                                  itemName={item?.item_name || "Item"}
                                  score={score}
                                  compact
                                />
                              ) : (
                                <Badge variant="outline" className="font-mono">
                                  {item?.roi_impact_score || 50}
                                </Badge>
                              );
                            })()}
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(originalIndex)}
                              className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                            >
                              <IconTrash className="h-4 w-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <WizardFooter
          onSave={handleSave}
          isSaving={isSaving}
          canProceed={includedItems.length > 0}
          form={form}
        />

        {/* Budget Optimization Dialog */}
        <BudgetOptimizationDialog
          open={showOptimizationDialog}
          onOpenChange={setShowOptimizationDialog}
          items={optimizableItems}
          budget={step3Data?.max_budget || 100000}
          currentSelection={currentSelection}
          onApplyOptimization={handleApplyOptimization}
        />

        {/* Scenario Builder Dialog */}
        <ScenarioBuilderDialog
          open={showScenarioDialog}
          onOpenChange={setShowScenarioDialog}
          onSave={handleSaveScenario}
          items={optimizableItems}
          currentBudget={step3Data?.max_budget || 100000}
          existingScenario={editingScenario}
          investmentStrategy={step3Data?.investment_strategy}
        />
      </form>
    </Form>
  );
}
