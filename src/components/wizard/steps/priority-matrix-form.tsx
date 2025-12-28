"use client";

import { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  IconListNumbers, 
  IconPlus, 
  IconTrash,
  IconGripVertical,
  IconCurrencyDollar,
  IconTrendingUp,
  IconAlertTriangle,
  IconCircleCheck,
} from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
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
  PriorityMatrixFormData,
  ScopeItemFormData,
  PRIORITY_LEVELS,
  QUALITY_TIERS,
  ROOM_TYPES,
} from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";

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

export function PriorityMatrixForm() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();
  const [showAddForm, setShowAddForm] = useState(false);

  const storedData = getStepData<PriorityMatrixFormData>(5);
  
  const form = useForm<PriorityMatrixFormData>({
    resolver: zodResolver(priorityMatrixSchema),
    defaultValues: {
      scope_items: storedData?.scope_items?.length ? storedData.scope_items : DEFAULT_SCOPE_ITEMS,
    },
    mode: "onBlur",
  });

  const { fields, append, remove, update } = useFieldArray({
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
    });
    setShowAddForm(true);
  };

  const toggleIncluded = (index: number) => {
    const currentValue = form.getValues(`scope_items.${index}.is_included`);
    form.setValue(`scope_items.${index}.is_included`, !currentValue);
  };

  const scopeItems = form.watch("scope_items");
  const includedItems = scopeItems?.filter((item) => item.is_included) || [];
  const totalCost = includedItems.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const totalDays = Math.max(...includedItems.map((item) => item.estimated_duration_days || 0), 0);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Priority Matrix</h1>
          <p className="text-muted-foreground">
            Review and prioritize renovation items by ROI impact and urgency.
          </p>
        </div>

        {/* Summary Card */}
        <div className="grid gap-4 md:grid-cols-3">
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
        </div>

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
              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-12">Include</TableHead>
                      <TableHead>Item</TableHead>
                      <TableHead className="w-32">Category</TableHead>
                      <TableHead className="w-32">Priority</TableHead>
                      <TableHead className="w-28 text-right">Cost</TableHead>
                      <TableHead className="w-20 text-center">ROI</TableHead>
                      <TableHead className="w-12"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fields.map((field, index) => {
                      const item = scopeItems?.[index];
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
                              onCheckedChange={() => toggleIncluded(index)}
                            />
                          </TableCell>
                          <TableCell>
                            <FormField
                              control={form.control}
                              name={`scope_items.${index}.item_name`}
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
                              name={`scope_items.${index}.category`}
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
                              name={`scope_items.${index}.priority`}
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
                          <TableCell className="text-right">
                            <FormField
                              control={form.control}
                              name={`scope_items.${index}.total_cost`}
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
                            <Badge variant="outline" className="font-mono">
                              {item?.roi_impact_score || 50}%
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => remove(index)}
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
            )}
          </CardContent>
        </Card>

        <WizardFooter
          onSave={handleSave}
          isSaving={isSaving}
          canProceed={includedItems.length > 0}
          form={form}
        />
      </form>
    </Form>
  );
}
