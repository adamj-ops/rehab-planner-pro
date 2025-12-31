'use client';

import * as React from 'react';
import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  IconSearch,
  IconPlus,
  IconCheck,
  IconTrendingUp,
  IconStar,
  IconClock,
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// =============================================================================
// TYPES
// =============================================================================

interface CostItem {
  id: string;
  name: string;
  description: string | null;
  category: string;
  subcategory: string | null;
  base_cost_low: number;
  base_cost_mid: number;
  base_cost_high: number;
  unit: string;
  typical_roi_percentage: number;
  buyer_appeal_score: number;
  complexity_score: number;
  typical_duration_days: number;
  requires_permit: boolean;
}

interface ScopeItem extends CostItem {
  quantity: number;
  quality_tier: 'basic' | 'standard' | 'premium' | 'luxury';
  selected_cost: number;
  notes?: string;
}

interface ScopeCatalogBrowserProps {
  selectedItems: ScopeItem[];
  onItemsChange: (items: ScopeItem[]) => void;
  budget?: number;
}

// =============================================================================
// CATEGORY DEFINITIONS
// =============================================================================

const CATEGORIES = [
  { id: 'all', label: 'All Items' },
  { id: 'kitchen', label: 'Kitchen' },
  { id: 'bathroom', label: 'Bathroom' },
  { id: 'flooring', label: 'Flooring' },
  { id: 'paint', label: 'Paint & Walls' },
  { id: 'exterior', label: 'Exterior' },
  { id: 'systems', label: 'Systems' },
  { id: 'windows', label: 'Windows & Doors' },
];

// =============================================================================
// COST ITEM CARD
// =============================================================================

interface CostItemCardProps {
  item: CostItem;
  isSelected: boolean;
  onToggle: () => void;
}

function CostItemCard({ item, isSelected, onToggle }: CostItemCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all hover:shadow-md',
        isSelected && 'border-primary bg-primary/5 ring-1 ring-primary'
      )}
      onClick={onToggle}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{item.name}</h4>
            <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
              {item.description || `${item.category} - ${item.subcategory}`}
            </p>
          </div>
          <Button
            size="icon"
            variant={isSelected ? 'default' : 'outline'}
            className="h-8 w-8 shrink-0 rounded-none"
            onClick={(e) => {
              e.stopPropagation();
              onToggle();
            }}
          >
            {isSelected ? (
              <IconCheck className="h-4 w-4" />
            ) : (
              <IconPlus className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Cost range */}
        <div className="mt-3 flex items-center justify-between text-xs">
          <span className="text-muted-foreground">
            ${item.base_cost_low.toLocaleString()} - $
            {item.base_cost_high.toLocaleString()}
          </span>
          <span className="text-muted-foreground">per {item.unit}</span>
        </div>

        {/* Metrics */}
        <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
          <div className="flex items-center gap-1" title="ROI">
            <IconTrendingUp className="h-3 w-3 text-green-500" />
            <span>{item.typical_roi_percentage}%</span>
          </div>
          <div className="flex items-center gap-1" title="Buyer Appeal">
            <IconStar className="h-3 w-3 text-amber-500" />
            <span>{item.buyer_appeal_score}/10</span>
          </div>
          <div className="flex items-center gap-1" title="Duration">
            <IconClock className="h-3 w-3" />
            <span>{item.typical_duration_days}d</span>
          </div>
        </div>

        {/* Badges */}
        <div className="mt-2 flex flex-wrap gap-1">
          {item.requires_permit && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              Permit Required
            </Badge>
          )}
          {item.complexity_score >= 4 && (
            <Badge variant="outline" className="text-[10px] px-1 py-0">
              Complex
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// SELECTED ITEMS SUMMARY
// =============================================================================

interface SelectedItemsSummaryProps {
  items: ScopeItem[];
  budget?: number;
  onRemove: (itemId: string) => void;
}

function SelectedItemsSummary({
  items,
  budget,
  onRemove,
}: SelectedItemsSummaryProps) {
  const totalCost = items.reduce((sum, item) => sum + item.selected_cost, 0);
  const budgetPercent = budget ? (totalCost / budget) * 100 : null;

  return (
    <Card className="h-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">Selected Scope</CardTitle>
          <Badge variant="secondary">{items.length} items</Badge>
        </div>
        <CardDescription>
          {budget && (
            <div className="flex items-center justify-between mt-2">
              <span>
                ${totalCost.toLocaleString()} of ${budget.toLocaleString()}
              </span>
              <span
                className={cn(
                  budgetPercent && budgetPercent > 100
                    ? 'text-destructive'
                    : budgetPercent && budgetPercent > 80
                    ? 'text-amber-500'
                    : 'text-green-500'
                )}
              >
                {budgetPercent?.toFixed(0)}%
              </span>
            </div>
          )}
          {!budget && (
            <span className="font-semibold">
              Total: ${totalCost.toLocaleString()}
            </span>
          )}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[400px]">
          {items.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              No items selected yet.
              <br />
              Browse the catalog to add scope items.
            </div>
          ) : (
            <div className="space-y-2">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between p-2 border rounded-none bg-muted/30"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium truncate">{item.name}</p>
                    <p className="text-xs text-muted-foreground">
                      ${item.selected_cost.toLocaleString()} · {item.quantity}{' '}
                      {item.unit}
                    </p>
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive hover:bg-destructive/10"
                    onClick={() => onRemove(item.id)}
                  >
                    ×
                  </Button>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ScopeCatalogBrowser({
  selectedItems,
  onItemsChange,
  budget,
}: ScopeCatalogBrowserProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  // Fetch cost items from database
  const { data: costItems, isLoading } = useQuery<CostItem[]>({
    queryKey: ['cost_items'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('cost_items')
        .select('*')
        .eq('is_active', true)
        .order('category')
        .order('sort_order');

      if (error) throw new Error(error.message);
      return data || [];
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Filter items based on search and category
  const filteredItems = useMemo(() => {
    if (!costItems) return [];

    return costItems.filter((item) => {
      const matchesCategory =
        activeCategory === 'all' || item.category === activeCategory;
      const matchesSearch =
        !searchQuery ||
        item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.category.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesCategory && matchesSearch;
    });
  }, [costItems, activeCategory, searchQuery]);

  // Selected item IDs for quick lookup
  const selectedIds = useMemo(
    () => new Set(selectedItems.map((i) => i.id)),
    [selectedItems]
  );

  // Toggle item selection
  const toggleItem = (item: CostItem) => {
    if (selectedIds.has(item.id)) {
      onItemsChange(selectedItems.filter((i) => i.id !== item.id));
    } else {
      const newScopeItem: ScopeItem = {
        ...item,
        quantity: 1,
        quality_tier: 'standard',
        selected_cost: item.base_cost_mid,
      };
      onItemsChange([...selectedItems, newScopeItem]);
    }
  };

  // Remove item
  const removeItem = (itemId: string) => {
    onItemsChange(selectedItems.filter((i) => i.id !== itemId));
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 gap-4">
        <div className="col-span-2 space-y-4">
          <Skeleton className="h-10 w-full" />
          <div className="grid grid-cols-2 gap-3">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        </div>
        <Skeleton className="h-[500px]" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-4 h-full">
      {/* Left: Catalog Browser */}
      <div className="col-span-2 space-y-4">
        {/* Search */}
        <div className="relative">
          <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search renovation items..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 rounded-none"
          />
        </div>

        {/* Category tabs */}
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="w-full justify-start overflow-x-auto">
            {CATEGORIES.map((cat) => (
              <TabsTrigger
                key={cat.id}
                value={cat.id}
                className="text-xs rounded-none"
              >
                {cat.label}
              </TabsTrigger>
            ))}
          </TabsList>

          <TabsContent value={activeCategory} className="mt-4">
            <ScrollArea className="h-[400px]">
              {filteredItems.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  No items found. Try a different search or category.
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3 pr-4">
                  {filteredItems.map((item) => (
                    <CostItemCard
                      key={item.id}
                      item={item}
                      isSelected={selectedIds.has(item.id)}
                      onToggle={() => toggleItem(item)}
                    />
                  ))}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right: Selected items summary */}
      <div>
        <SelectedItemsSummary
          items={selectedItems}
          budget={budget}
          onRemove={removeItem}
        />
      </div>
    </div>
  );
}

export type { CostItem, ScopeItem, ScopeCatalogBrowserProps };
