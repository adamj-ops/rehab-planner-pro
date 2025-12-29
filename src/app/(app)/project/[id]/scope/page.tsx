"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams } from "next/navigation";
import { ProjectPageHeader, useProject } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/lib/supabase/client";
import {
  IconClipboardList,
  IconLoader2,
  IconPlus,
  IconTrash,
  IconEdit,
  IconCurrencyDollar,
  IconClock,
  IconSearch,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

// Scope item categories
const CATEGORIES = [
  { id: "kitchen", label: "Kitchen", color: "bg-orange-500" },
  { id: "bathroom", label: "Bathroom", color: "bg-blue-500" },
  { id: "flooring", label: "Flooring", color: "bg-amber-500" },
  { id: "painting", label: "Painting", color: "bg-purple-500" },
  { id: "electrical", label: "Electrical", color: "bg-yellow-500" },
  { id: "plumbing", label: "Plumbing", color: "bg-cyan-500" },
  { id: "hvac", label: "HVAC", color: "bg-red-500" },
  { id: "roof", label: "Roofing", color: "bg-gray-500" },
  { id: "exterior", label: "Exterior", color: "bg-green-500" },
  { id: "landscaping", label: "Landscaping", color: "bg-lime-500" },
  { id: "other", label: "Other", color: "bg-slate-500" },
];

const PRIORITY_LEVELS = [
  { id: "critical", label: "Critical", color: "bg-red-500" },
  { id: "high", label: "High", color: "bg-orange-500" },
  { id: "medium", label: "Medium", color: "bg-yellow-500" },
  { id: "low", label: "Low", color: "bg-green-500" },
];

interface ScopeItem {
  id: string;
  project_id: string;
  category: string;
  subcategory: string | null;
  item_name: string;
  description: string | null;
  location: string | null;
  quantity: number | null;
  unit_of_measure: string | null;
  material_cost: number | null;
  labor_cost: number | null;
  total_cost: number | null;
  priority: string | null;
  roi_impact: number | null;
  days_required: number | null;
  phase: number | null;
  included: boolean | null;
  completed: boolean | null;
  created_at: string | null;
  updated_at: string | null;
}

interface NewScopeItem {
  category: string;
  item_name: string;
  description: string;
  location: string;
  quantity: string;
  unit_of_measure: string;
  material_cost: string;
  labor_cost: string;
  priority: string;
  days_required: string;
}

const initialNewItem: NewScopeItem = {
  category: "",
  item_name: "",
  description: "",
  location: "",
  quantity: "1",
  unit_of_measure: "each",
  material_cost: "",
  labor_cost: "",
  priority: "medium",
  days_required: "1",
};

export default function ScopePage() {
  const params = useParams();
  const projectId = params.id as string;
  const { project, isLoading: projectLoading } = useProject();

  const [scopeItems, setScopeItems] = useState<ScopeItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ScopeItem | null>(null);
  const [newItem, setNewItem] = useState<NewScopeItem>(initialNewItem);
  const [saving, setSaving] = useState(false);
  const [filterCategory, setFilterCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  // Load scope items
  useEffect(() => {
    if (projectId) {
      loadScopeItems();
    }
  }, [projectId]);

  const loadScopeItems = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("rehab_scope_items")
        .select("*")
        .eq("project_id", projectId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setScopeItems(data || []);
    } catch (err) {
      console.error("Error loading scope items:", err);
      toast.error("Failed to load scope items");
    } finally {
      setLoading(false);
    }
  };

  // Filter items
  const filteredItems = useMemo(() => {
    return scopeItems.filter((item) => {
      const matchesCategory = filterCategory === "all" || item.category === filterCategory;
      const matchesSearch =
        searchQuery === "" ||
        item.item_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.location?.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [scopeItems, filterCategory, searchQuery]);

  // Calculate totals
  const totals = useMemo(() => {
    const included = scopeItems.filter((item) => item.included !== false);
    return {
      totalItems: scopeItems.length,
      includedItems: included.length,
      totalCost: included.reduce((sum, item) => sum + (item.total_cost || 0), 0),
      totalDays: included.reduce((sum, item) => sum + (item.days_required || 0), 0),
      materialCost: included.reduce((sum, item) => sum + (item.material_cost || 0), 0),
      laborCost: included.reduce((sum, item) => sum + (item.labor_cost || 0), 0),
    };
  }, [scopeItems]);

  const handleSaveItem = async () => {
    if (!newItem.item_name || !newItem.category) {
      toast.error("Please fill in required fields");
      return;
    }

    setSaving(true);
    try {
      const materialCost = parseFloat(newItem.material_cost) || 0;
      const laborCost = parseFloat(newItem.labor_cost) || 0;
      const totalCost = materialCost + laborCost;

      const itemData = {
        project_id: projectId,
        category: newItem.category,
        item_name: newItem.item_name,
        description: newItem.description || null,
        location: newItem.location || null,
        quantity: parseFloat(newItem.quantity) || 1,
        unit_of_measure: newItem.unit_of_measure || "each",
        material_cost: materialCost,
        labor_cost: laborCost,
        total_cost: totalCost,
        priority: newItem.priority || "medium",
        days_required: parseInt(newItem.days_required) || 1,
        included: true,
        completed: false,
      };

      if (editingItem) {
        const { error } = await supabase
          .from("rehab_scope_items")
          .update(itemData)
          .eq("id", editingItem.id);

        if (error) throw error;
        toast.success("Scope item updated!");
      } else {
        const { error } = await supabase.from("rehab_scope_items").insert(itemData);

        if (error) throw error;
        toast.success("Scope item added!");
      }

      setShowAddDialog(false);
      setEditingItem(null);
      setNewItem(initialNewItem);
      loadScopeItems();
    } catch (err) {
      console.error("Error saving scope item:", err);
      toast.error("Failed to save scope item");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase.from("rehab_scope_items").delete().eq("id", id);

      if (error) throw error;
      toast.success("Scope item deleted");
      loadScopeItems();
    } catch (err) {
      console.error("Error deleting scope item:", err);
      toast.error("Failed to delete scope item");
    }
  };

  const handleToggleIncluded = async (id: string, included: boolean) => {
    try {
      const { error } = await supabase
        .from("rehab_scope_items")
        .update({ included })
        .eq("id", id);

      if (error) throw error;
      loadScopeItems();
    } catch (err) {
      console.error("Error updating scope item:", err);
    }
  };

  const handleToggleCompleted = async (id: string, completed: boolean) => {
    try {
      const { error } = await supabase
        .from("rehab_scope_items")
        .update({ completed })
        .eq("id", id);

      if (error) throw error;
      loadScopeItems();
    } catch (err) {
      console.error("Error updating scope item:", err);
    }
  };

  const handleEditItem = (item: ScopeItem) => {
    setEditingItem(item);
    setNewItem({
      category: item.category,
      item_name: item.item_name,
      description: item.description || "",
      location: item.location || "",
      quantity: item.quantity?.toString() || "1",
      unit_of_measure: item.unit_of_measure || "each",
      material_cost: item.material_cost?.toString() || "",
      labor_cost: item.labor_cost?.toString() || "",
      priority: item.priority || "medium",
      days_required: item.days_required?.toString() || "1",
    });
    setShowAddDialog(true);
  };

  const getCategoryInfo = (categoryId: string) => {
    return CATEGORIES.find((c) => c.id === categoryId) || CATEGORIES[CATEGORIES.length - 1];
  };

  const getPriorityInfo = (priorityId: string | null) => {
    return PRIORITY_LEVELS.find((p) => p.id === priorityId) || PRIORITY_LEVELS[2];
  };

  if (projectLoading || loading) {
    return (
      <>
        <ProjectPageHeader section="Scope" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <ProjectPageHeader section="Scope" />
      <main className="flex-1 p-6">
        <div className="max-w-6xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconClipboardList className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold">Scope Items</h1>
                <p className="text-muted-foreground">
                  Define what you&apos;re renovating for{" "}
                  <span className="font-medium">{project?.project_name || "this project"}</span>
                </p>
              </div>
            </div>
            <Button onClick={() => setShowAddDialog(true)}>
              <IconPlus className="mr-2 h-4 w-4" />
              Add Scope Item
            </Button>
          </div>

          {/* Summary Cards */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Items</p>
                    <p className="text-2xl font-bold">{totals.includedItems}</p>
                  </div>
                  <IconClipboardList className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Cost</p>
                    <p className="text-2xl font-bold">${totals.totalCost.toLocaleString()}</p>
                  </div>
                  <IconCurrencyDollar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Materials</p>
                    <p className="text-2xl font-bold">${totals.materialCost.toLocaleString()}</p>
                  </div>
                  <IconCurrencyDollar className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Est. Days</p>
                    <p className="text-2xl font-bold">{totals.totalDays}</p>
                  </div>
                  <IconClock className="h-8 w-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Filters */}
          <div className="flex gap-4">
            <div className="relative flex-1">
              <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search scope items..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <Select value={filterCategory} onValueChange={setFilterCategory}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="All Categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {CATEGORIES.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Scope Items List */}
          {filteredItems.length === 0 ? (
            <Card className="border-dashed">
              <CardContent className="flex flex-col items-center justify-center py-16">
                <IconClipboardList className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {scopeItems.length === 0 ? "No scope items yet" : "No matching items"}
                </h3>
                <p className="text-muted-foreground text-center mb-4">
                  {scopeItems.length === 0
                    ? "Add your first scope item to start planning"
                    : "Try adjusting your filters"}
                </p>
                {scopeItems.length === 0 && (
                  <Button onClick={() => setShowAddDialog(true)}>
                    <IconPlus className="mr-2 h-4 w-4" />
                    Add Scope Item
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {filteredItems.map((item) => {
                const category = getCategoryInfo(item.category);
                const priority = getPriorityInfo(item.priority);
                return (
                  <Card
                    key={item.id}
                    className={cn(
                      "transition-all",
                      item.included === false && "opacity-50",
                      item.completed && "bg-muted/50"
                    )}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-center gap-4">
                        {/* Checkbox for included */}
                        <Checkbox
                          checked={item.included !== false}
                          onCheckedChange={(checked) =>
                            handleToggleIncluded(item.id, checked as boolean)
                          }
                        />

                        {/* Category badge */}
                        <div
                          className={cn(
                            "w-3 h-12 rounded-full",
                            category.color
                          )}
                        />

                        {/* Main content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h3
                              className={cn(
                                "font-semibold",
                                item.completed && "line-through text-muted-foreground"
                              )}
                            >
                              {item.item_name}
                            </h3>
                            <Badge variant="outline" className="text-xs">
                              {category.label}
                            </Badge>
                            <Badge
                              variant="outline"
                              className={cn(
                                "text-xs",
                                priority.id === "critical" && "border-red-500 text-red-500",
                                priority.id === "high" && "border-orange-500 text-orange-500"
                              )}
                            >
                              {priority.label}
                            </Badge>
                          </div>
                          {item.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1">
                              {item.description}
                            </p>
                          )}
                          {item.location && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Location: {item.location}
                            </p>
                          )}
                        </div>

                        {/* Cost */}
                        <div className="text-right">
                          <p className="font-semibold">
                            ${(item.total_cost || 0).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {item.days_required} day{item.days_required !== 1 ? "s" : ""}
                          </p>
                        </div>

                        {/* Completed checkbox */}
                        <div className="flex items-center gap-2">
                          <Checkbox
                            checked={item.completed === true}
                            onCheckedChange={(checked) =>
                              handleToggleCompleted(item.id, checked as boolean)
                            }
                          />
                          <span className="text-xs text-muted-foreground">Done</span>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEditItem(item)}
                          >
                            <IconEdit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive"
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            <IconTrash className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </main>

      {/* Add/Edit Dialog */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(open) => {
          setShowAddDialog(open);
          if (!open) {
            setEditingItem(null);
            setNewItem(initialNewItem);
          }
        }}
      >
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? "Edit Scope Item" : "Add Scope Item"}
            </DialogTitle>
            <DialogDescription>
              {editingItem
                ? "Update the details for this scope item"
                : "Add a new renovation task to your project"}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Category *</Label>
                <Select
                  value={newItem.category}
                  onValueChange={(value) =>
                    setNewItem((prev) => ({ ...prev, category: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Priority</Label>
                <Select
                  value={newItem.priority}
                  onValueChange={(value) =>
                    setNewItem((prev) => ({ ...prev, priority: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    {PRIORITY_LEVELS.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Item Name *</Label>
              <Input
                placeholder="e.g., Replace kitchen countertops"
                value={newItem.item_name}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, item_name: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Description</Label>
              <Textarea
                placeholder="Additional details about this item..."
                value={newItem.description}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, description: e.target.value }))
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Location</Label>
              <Input
                placeholder="e.g., Kitchen, Master Bath"
                value={newItem.location}
                onChange={(e) =>
                  setNewItem((prev) => ({ ...prev, location: e.target.value }))
                }
              />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input
                  type="number"
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, quantity: e.target.value }))
                  }
                />
              </div>
              <div className="space-y-2">
                <Label>Unit</Label>
                <Select
                  value={newItem.unit_of_measure}
                  onValueChange={(value) =>
                    setNewItem((prev) => ({ ...prev, unit_of_measure: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="each">Each</SelectItem>
                    <SelectItem value="sq_ft">Sq Ft</SelectItem>
                    <SelectItem value="linear_ft">Linear Ft</SelectItem>
                    <SelectItem value="lump_sum">Lump Sum</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Days Required</Label>
                <Input
                  type="number"
                  value={newItem.days_required}
                  onChange={(e) =>
                    setNewItem((prev) => ({ ...prev, days_required: e.target.value }))
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Material Cost</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    value={newItem.material_cost}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, material_cost: e.target.value }))
                    }
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Labor Cost</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <Input
                    type="number"
                    className="pl-7"
                    placeholder="0"
                    value={newItem.labor_cost}
                    onChange={(e) =>
                      setNewItem((prev) => ({ ...prev, labor_cost: e.target.value }))
                    }
                  />
                </div>
              </div>
            </div>

            {/* Total preview */}
            {(newItem.material_cost || newItem.labor_cost) && (
              <div className="p-3 bg-muted rounded-lg">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Total Cost</span>
                  <span className="font-semibold">
                    $
                    {(
                      (parseFloat(newItem.material_cost) || 0) +
                      (parseFloat(newItem.labor_cost) || 0)
                    ).toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowAddDialog(false);
                setEditingItem(null);
                setNewItem(initialNewItem);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveItem} disabled={saving}>
              {saving ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              {editingItem ? "Save Changes" : "Add Item"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
