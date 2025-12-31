/**
 * Budget Optimizer
 * 
 * Implements a knapsack-style optimization algorithm to maximize ROI
 * within budget constraints. Uses dynamic programming for optimal selection.
 */

// =============================================================================
// TYPES
// =============================================================================

interface OptimizableItem {
  id: string;
  name: string;
  cost: number;
  value: number; // ROI or value score
  priority: 'must' | 'should' | 'could' | 'nice';
  category: string;
  dependencies?: string[];
}

interface OptimizationResult {
  selectedItems: OptimizableItem[];
  totalCost: number;
  totalValue: number;
  unselectedItems: OptimizableItem[];
  summary: {
    itemCount: number;
    budgetUsed: number;
    budgetRemaining: number;
    averageROI: number;
    mustHavesCovered: boolean;
  };
}

interface OptimizationOptions {
  budget: number;
  prioritizeMustHaves?: boolean;
  maxItems?: number;
  categoryWeights?: Record<string, number>;
  respectDependencies?: boolean;
}

// =============================================================================
// BUDGET OPTIMIZER CLASS
// =============================================================================

export class BudgetOptimizer {
  /**
   * Main optimization function
   * Uses dynamic programming knapsack algorithm with priority constraints
   */
  static optimize(
    items: OptimizableItem[],
    options: OptimizationOptions
  ): OptimizationResult {
    const { budget, prioritizeMustHaves = true, maxItems, respectDependencies = true } = options;

    // Separate must-haves (these are non-negotiable)
    const mustHaves = items.filter((item) => item.priority === 'must');
    const optionalItems = items.filter((item) => item.priority !== 'must');

    // Calculate must-have costs
    const mustHaveCost = mustHaves.reduce((sum, item) => sum + item.cost, 0);
    const remainingBudget = budget - mustHaveCost;

    // If must-haves exceed budget, we have a problem
    if (remainingBudget < 0 && prioritizeMustHaves) {
      return {
        selectedItems: mustHaves,
        totalCost: mustHaveCost,
        totalValue: mustHaves.reduce((sum, item) => sum + item.value, 0),
        unselectedItems: optionalItems,
        summary: {
          itemCount: mustHaves.length,
          budgetUsed: mustHaveCost,
          budgetRemaining: remainingBudget,
          averageROI: mustHaves.length > 0
            ? mustHaves.reduce((sum, item) => sum + item.value, 0) / mustHaves.length
            : 0,
          mustHavesCovered: false, // Budget exceeded
        },
      };
    }

    // Apply dependency ordering
    let orderedOptionals = respectDependencies
      ? this.orderByDependencies(optionalItems, mustHaves)
      : optionalItems;

    // Apply knapsack optimization to optional items
    const optimalSelection = prioritizeMustHaves
      ? this.knapsackOptimize(orderedOptionals, remainingBudget, maxItems)
      : this.knapsackOptimize([...mustHaves, ...orderedOptionals], budget, maxItems);

    // Combine results
    const selectedItems = prioritizeMustHaves
      ? [...mustHaves, ...optimalSelection]
      : optimalSelection;

    const totalCost = selectedItems.reduce((sum, item) => sum + item.cost, 0);
    const totalValue = selectedItems.reduce((sum, item) => sum + item.value, 0);

    const selectedIds = new Set(selectedItems.map((item) => item.id));
    const unselectedItems = items.filter((item) => !selectedIds.has(item.id));

    return {
      selectedItems,
      totalCost,
      totalValue,
      unselectedItems,
      summary: {
        itemCount: selectedItems.length,
        budgetUsed: totalCost,
        budgetRemaining: budget - totalCost,
        averageROI: selectedItems.length > 0 ? totalValue / selectedItems.length : 0,
        mustHavesCovered: mustHaves.every((must) =>
          selectedItems.some((sel) => sel.id === must.id)
        ),
      },
    };
  }

  /**
   * 0/1 Knapsack algorithm using dynamic programming
   * Time complexity: O(n * W) where n = items, W = budget (in cents/smallest unit)
   */
  private static knapsackOptimize(
    items: OptimizableItem[],
    budget: number,
    maxItems?: number
  ): OptimizableItem[] {
    if (items.length === 0 || budget <= 0) return [];

    // Scale costs to integers (handle decimals by multiplying by 100)
    const scaleFactor = 100;
    const scaledBudget = Math.floor(budget * scaleFactor);
    const scaledItems = items.map((item) => ({
      ...item,
      scaledCost: Math.ceil(item.cost * scaleFactor),
    }));

    // For memory efficiency, use a simplified greedy approach for large budgets
    if (scaledBudget > 1000000) {
      return this.greedyOptimize(items, budget, maxItems);
    }

    const n = scaledItems.length;
    
    // DP table: dp[i][w] = max value achievable with items 0..i-1 and budget w
    // Using 1D array optimization
    const dp: number[] = new Array(scaledBudget + 1).fill(0);
    const keep: boolean[][] = Array.from({ length: n }, () =>
      new Array(scaledBudget + 1).fill(false)
    );

    // Fill the DP table
    for (let i = 0; i < n; i++) {
      const item = scaledItems[i];
      // Iterate backwards to avoid using same item twice
      for (let w = scaledBudget; w >= item.scaledCost; w--) {
        const withItem = dp[w - item.scaledCost] + item.value;
        if (withItem > dp[w]) {
          dp[w] = withItem;
          keep[i][w] = true;
        }
      }
    }

    // Backtrack to find selected items
    const selected: OptimizableItem[] = [];
    let remainingBudget = scaledBudget;

    for (let i = n - 1; i >= 0; i--) {
      if (keep[i][remainingBudget]) {
        selected.push(items[i]);
        remainingBudget -= scaledItems[i].scaledCost;

        // Check max items constraint
        if (maxItems && selected.length >= maxItems) break;
      }
    }

    return selected;
  }

  /**
   * Greedy optimization for large budgets
   * Sorts by value/cost ratio and picks items greedily
   */
  private static greedyOptimize(
    items: OptimizableItem[],
    budget: number,
    maxItems?: number
  ): OptimizableItem[] {
    // Sort by value-to-cost ratio (efficiency)
    const sorted = [...items].sort((a, b) => {
      const ratioA = a.value / Math.max(a.cost, 1);
      const ratioB = b.value / Math.max(b.cost, 1);
      return ratioB - ratioA;
    });

    const selected: OptimizableItem[] = [];
    let remainingBudget = budget;

    for (const item of sorted) {
      if (item.cost <= remainingBudget) {
        selected.push(item);
        remainingBudget -= item.cost;

        if (maxItems && selected.length >= maxItems) break;
      }
    }

    return selected;
  }

  /**
   * Order items respecting dependencies
   * Items that are depended upon come first
   */
  private static orderByDependencies(
    items: OptimizableItem[],
    alreadySelected: OptimizableItem[]
  ): OptimizableItem[] {
    const selectedIds = new Set(alreadySelected.map((item) => item.id));
    const result: OptimizableItem[] = [];
    const processed = new Set<string>();

    const processItem = (item: OptimizableItem) => {
      if (processed.has(item.id)) return;

      // Process dependencies first
      if (item.dependencies) {
        for (const depId of item.dependencies) {
          // Skip if already selected or processed
          if (selectedIds.has(depId) || processed.has(depId)) continue;

          const depItem = items.find((i) => i.id === depId);
          if (depItem) processItem(depItem);
        }
      }

      processed.add(item.id);
      result.push(item);
    };

    // Calculate dependency count for sorting
    const dependencyCount = new Map<string, number>();
    for (const item of items) {
      const count = items.filter(
        (other) => other.dependencies?.includes(item.id)
      ).length;
      dependencyCount.set(item.id, count);
    }

    // Sort by dependency count (most depended upon first)
    const sortedItems = [...items].sort(
      (a, b) =>
        (dependencyCount.get(b.id) || 0) - (dependencyCount.get(a.id) || 0)
    );

    for (const item of sortedItems) {
      processItem(item);
    }

    return result;
  }

  /**
   * Compare two optimization results
   */
  static compareOptimizations(
    before: OptimizationResult,
    after: OptimizationResult
  ): {
    costDifference: number;
    valueDifference: number;
    itemsDifference: number;
    addedItems: OptimizableItem[];
    removedItems: OptimizableItem[];
    recommendation: string;
  } {
    const beforeIds = new Set(before.selectedItems.map((i) => i.id));
    const afterIds = new Set(after.selectedItems.map((i) => i.id));

    const addedItems = after.selectedItems.filter((i) => !beforeIds.has(i.id));
    const removedItems = before.selectedItems.filter((i) => !afterIds.has(i.id));

    const valueDiff = after.totalValue - before.totalValue;
    const costDiff = after.totalCost - before.totalCost;

    let recommendation = '';
    if (valueDiff > 0 && costDiff <= 0) {
      recommendation = 'Optimization improves value while reducing cost. Recommended.';
    } else if (valueDiff > 0 && costDiff > 0) {
      const efficiency = valueDiff / costDiff;
      recommendation =
        efficiency > 1
          ? 'Higher value for additional cost. Consider if budget allows.'
          : 'Marginal improvement. Current selection may be optimal.';
    } else if (valueDiff < 0) {
      recommendation = 'Reduces value. Not recommended.';
    } else {
      recommendation = 'No significant change.';
    }

    return {
      costDifference: costDiff,
      valueDifference: valueDiff,
      itemsDifference: after.selectedItems.length - before.selectedItems.length,
      addedItems,
      removedItems,
      recommendation,
    };
  }

  /**
   * Suggest budget adjustments
   */
  static suggestBudgetAdjustments(
    items: OptimizableItem[],
    currentBudget: number
  ): {
    minimal: { budget: number; description: string };
    optimal: { budget: number; description: string };
    maxValue: { budget: number; description: string };
  } {
    const mustHaveCost = items
      .filter((i) => i.priority === 'must')
      .reduce((sum, i) => sum + i.cost, 0);

    const shouldHaveCost = items
      .filter((i) => i.priority === 'should')
      .reduce((sum, i) => sum + i.cost, 0);

    const totalCost = items.reduce((sum, i) => sum + i.cost, 0);

    // Sort by efficiency for optimal calculation
    const sorted = [...items].sort((a, b) => b.value / b.cost - a.value / a.cost);

    // Find 80% of max value
    const totalValue = items.reduce((sum, i) => sum + i.value, 0);
    const targetValue = totalValue * 0.8;

    let optimalBudget = 0;
    let accumulatedValue = 0;
    for (const item of sorted) {
      optimalBudget += item.cost;
      accumulatedValue += item.value;
      if (accumulatedValue >= targetValue) break;
    }

    return {
      minimal: {
        budget: Math.ceil(mustHaveCost * 1.05), // 5% buffer
        description: 'Covers must-have items only',
      },
      optimal: {
        budget: Math.ceil(Math.max(mustHaveCost + shouldHaveCost, optimalBudget)),
        description: 'Covers must-haves and should-haves, achieves 80% of max value',
      },
      maxValue: {
        budget: Math.ceil(totalCost * 1.1), // 10% contingency
        description: 'All items plus 10% contingency',
      },
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export type { OptimizableItem, OptimizationResult, OptimizationOptions };
