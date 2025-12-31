/**
 * @file scenario-engine.ts
 * @description Engine for generating and optimizing budget scenarios with different strategies
 */

import { 
  BudgetOptimizer,
  OptimizableItem,
  OptimizationResult,
  OptimizationOptions
} from './budget-optimizer';
import { 
  ScenarioStrategy,
  ScenarioResult,
  ScenarioGenerationOptions,
  SCENARIO_STRATEGIES,
  ScenarioError
} from '@/types/scenario';

// =============================================================================
// STRATEGY PRESETS
// =============================================================================

/**
 * Configuration for each optimization strategy
 */
interface StrategyConfig {
  name: string;
  description: string;
  optimize: (items: OptimizableItem[], options: OptimizationOptions) => OptimizationResult;
}

/**
 * Predefined optimization strategies
 */
const STRATEGY_CONFIGS: Record<ScenarioStrategy, StrategyConfig> = {
  [SCENARIO_STRATEGIES.MAXIMIZE_ROI]: {
    name: 'Maximize ROI',
    description: 'Prioritizes items with highest value-to-cost ratio',
    optimize: (items: OptimizableItem[], options: OptimizationOptions) => {
      // Sort items by value-to-cost ratio (efficiency)
      const sortedItems = [...items].sort((a, b) => {
        const ratioA = a.cost > 0 ? a.value / a.cost : 0;
        const ratioB = b.cost > 0 ? b.value / b.cost : 0;
        return ratioB - ratioA;
      });

      return BudgetOptimizer.optimize(sortedItems, {
        ...options,
        prioritizeMustHaves: true,
        respectDependencies: true
      });
    }
  },

  [SCENARIO_STRATEGIES.FASTEST_TIMELINE]: {
    name: 'Fastest Timeline',
    description: 'Focuses on items that minimize total project duration',
    optimize: (items: OptimizableItem[], options: OptimizationOptions) => {
      // For fastest timeline, we need to consider item durations
      // Prioritize items that are quick to complete and high value
      const sortedItems = [...items].sort((a, b) => {
        // Estimate duration based on cost (simple heuristic)
        const daysA = Math.ceil(a.cost / 1000); // Rough estimate: $1000 per day
        const daysB = Math.ceil(b.cost / 1000);
        
        // Score: value per day (higher is better)
        const scoreA = daysA > 0 ? a.value / daysA : a.value;
        const scoreB = daysB > 0 ? b.value / daysB : b.value;
        
        return scoreB - scoreA;
      });

      return BudgetOptimizer.optimize(sortedItems, {
        ...options,
        prioritizeMustHaves: false, // Speed over must-haves
        respectDependencies: true,
        maxItems: Math.min(items.length, 10) // Limit items for speed
      });
    }
  },

  [SCENARIO_STRATEGIES.ALL_MUST_HAVES]: {
    name: 'All Must-Haves',
    description: 'Ensures all must-have items are included first, then optimizes remaining budget',
    optimize: (items: OptimizableItem[], options: OptimizationOptions) => {
      return BudgetOptimizer.optimize(items, {
        ...options,
        prioritizeMustHaves: true,
        respectDependencies: true
      });
    }
  },

  [SCENARIO_STRATEGIES.BALANCED]: {
    name: 'Balanced Approach',
    description: 'Balances cost, value, timeline, and risk considerations',
    optimize: (items: OptimizableItem[], options: OptimizationOptions) => {
      // Create a balanced score that considers multiple factors
      const scoredItems = items.map(item => {
        const efficiency = item.cost > 0 ? item.value / item.cost : 0;
        const priorityBonus = {
          must: 100,
          should: 75,
          could: 50,
          nice: 25
        }[item.priority] || 0;
        
        // Estimate risk penalty (higher cost = higher risk)
        const riskPenalty = Math.min(item.cost / 10000, 0.5); // Max 50% penalty
        
        return {
          ...item,
          balancedScore: (efficiency * 100) + priorityBonus - (riskPenalty * 50)
        };
      }).sort((a, b) => b.balancedScore - a.balancedScore);

      return BudgetOptimizer.optimize(scoredItems, {
        ...options,
        prioritizeMustHaves: true,
        respectDependencies: true
      });
    }
  },

  [SCENARIO_STRATEGIES.CUSTOM]: {
    name: 'Custom Selection',
    description: 'User-defined item selection',
    optimize: (items: OptimizableItem[], options: OptimizationOptions) => {
      // For custom strategy, just validate the selection
      return BudgetOptimizer.optimize(items, options);
    }
  }
};

// =============================================================================
// SCENARIO ENGINE CLASS
// =============================================================================

export class ScenarioEngine {
  /**
   * Generate a scenario using specified strategy and options
   */
  static generateScenario(options: ScenarioGenerationOptions): ScenarioResult {
    const { 
      budgetAmount, 
      strategy, 
      items, 
      customItemIds,
      respectDependencies = true,
      maxItems
    } = options;

    try {
      let optimizationResult: OptimizationResult;
      let timelineDays = 0;
      let itemsExcluded: OptimizableItem[] = [];
      const warnings: string[] = [];

      // Handle custom strategy differently
      if (strategy === SCENARIO_STRATEGIES.CUSTOM && customItemIds) {
        const customItems = items.filter(item => customItemIds.includes(item.id));
        const totalCost = customItems.reduce((sum, item) => sum + item.cost, 0);
        const totalValue = customItems.reduce((sum, item) => sum + item.value, 0);
        
        if (totalCost > budgetAmount) {
          warnings.push(`Custom selection exceeds budget by $${(totalCost - budgetAmount).toLocaleString()}`);
        }

        optimizationResult = {
          selectedItems: customItems,
          totalCost,
          totalValue,
          unselectedItems: items.filter(item => !customItemIds.includes(item.id)),
          summary: {
            itemCount: customItems.length,
            budgetUsed: totalCost,
            budgetRemaining: budgetAmount - totalCost,
            averageROI: customItems.length > 0 ? totalValue / customItems.length : 0,
            mustHavesCovered: items
              .filter(item => item.priority === 'must')
              .every(must => customItems.some(selected => selected.id === must.id))
          }
        };
        
        itemsExcluded = optimizationResult.unselectedItems;
      } else {
        // Use strategy-specific optimization
        const strategyConfig = STRATEGY_CONFIGS[strategy];
        if (!strategyConfig) {
          throw new ScenarioError(`Unknown strategy: ${strategy}`, 'VALIDATION_ERROR');
        }

        const optimizationOptions: OptimizationOptions = {
          budget: budgetAmount,
          respectDependencies,
          maxItems
        };

        optimizationResult = strategyConfig.optimize(items, optimizationOptions);
        itemsExcluded = optimizationResult.unselectedItems;
      }

      // Calculate timeline estimate
      timelineDays = this.estimateTimeline(optimizationResult.selectedItems);

      // Add warnings based on results
      if (optimizationResult.totalCost > budgetAmount) {
        warnings.push('Selection exceeds budget');
      }
      
      if (!optimizationResult.summary.mustHavesCovered) {
        warnings.push('Not all must-have items are included');
      }

      const mustHaveItems = items.filter(item => item.priority === 'must');
      const excludedMustHaves = mustHaveItems.filter(must => 
        !optimizationResult.selectedItems.some(selected => selected.id === must.id)
      );
      
      if (excludedMustHaves.length > 0) {
        warnings.push(`${excludedMustHaves.length} must-have item(s) excluded due to budget constraints`);
      }

      return {
        ...optimizationResult,
        strategy,
        budgetAmount,
        budgetRemaining: budgetAmount - optimizationResult.totalCost,
        timelineDays,
        metadata: {
          generatedAt: new Date().toISOString(),
          itemsExcluded,
          warnings
        }
      };

    } catch (error) {
      if (error instanceof ScenarioError) {
        throw error;
      }
      throw new ScenarioError(
        `Failed to generate scenario: ${error instanceof Error ? error.message : 'Unknown error'}`,
        'OPTIMIZATION_ERROR',
        { strategy, budgetAmount }
      );
    }
  }

  /**
   * Generate multiple scenarios with different strategies
   */
  static generateMultipleScenarios(
    items: OptimizableItem[],
    budgetAmount: number,
    strategies: ScenarioStrategy[] = [
      SCENARIO_STRATEGIES.MAXIMIZE_ROI,
      SCENARIO_STRATEGIES.FASTEST_TIMELINE,
      SCENARIO_STRATEGIES.ALL_MUST_HAVES,
      SCENARIO_STRATEGIES.BALANCED
    ]
  ): Record<ScenarioStrategy, ScenarioResult> {
    const results: Record<string, ScenarioResult> = {};

    for (const strategy of strategies) {
      try {
        results[strategy] = this.generateScenario({
          budgetAmount,
          strategy,
          items,
          respectDependencies: true
        });
      } catch (error) {
        console.warn(`Failed to generate ${strategy} scenario:`, error);
      }
    }

    return results;
  }

  /**
   * Compare different budget amounts for the same strategy
   */
  static generateBudgetVariations(
    items: OptimizableItem[],
    baseStrategy: ScenarioStrategy,
    budgetVariations: number[]
  ): ScenarioResult[] {
    return budgetVariations.map(budget => 
      this.generateScenario({
        budgetAmount: budget,
        strategy: baseStrategy,
        items,
        respectDependencies: true
      })
    );
  }

  /**
   * Estimate project timeline based on selected items
   */
  private static estimateTimeline(items: OptimizableItem[]): number {
    // Simple timeline estimation based on cost and complexity
    // In a real implementation, this would use more sophisticated scheduling
    
    const categoryTimeMultipliers = {
      structural: 2.0,   // Structural work takes longer
      roofing: 1.8,
      plumbing: 1.6,
      electrical: 1.5,
      hvac: 1.4,
      kitchen: 1.3,
      bathroom: 1.2,
      flooring: 1.0,
      interior: 0.8,
      exterior: 1.1,
      landscaping: 0.7,
      other: 1.0
    };

    let totalDays = 0;
    const categoryCounts: Record<string, number> = {};

    for (const item of items) {
      const baseDays = Math.ceil(item.cost / 1000); // Base: $1000 per day
      const multiplier = categoryTimeMultipliers[item.category as keyof typeof categoryTimeMultipliers] || 1.0;
      
      // Track category counts for overlap optimization
      categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1;
      
      totalDays += baseDays * multiplier;
    }

    // Apply overlap optimization (some work can be done in parallel)
    const overlapFactor = Math.max(0.6, 1 - (Object.keys(categoryCounts).length * 0.05));
    
    return Math.ceil(totalDays * overlapFactor);
  }

  /**
   * Validate scenario against constraints
   */
  static validateScenario(
    result: ScenarioResult, 
    items: OptimizableItem[],
    constraints?: {
      maxBudget?: number;
      maxTimeline?: number;
      requiredItems?: string[];
    }
  ): { isValid: boolean; violations: string[] } {
    const violations: string[] = [];

    // Budget validation
    if (constraints?.maxBudget && result.totalCost > constraints.maxBudget) {
      violations.push(`Budget exceeded by $${(result.totalCost - constraints.maxBudget).toLocaleString()}`);
    }

    // Timeline validation
    if (constraints?.maxTimeline && result.timelineDays > constraints.maxTimeline) {
      violations.push(`Timeline exceeded by ${result.timelineDays - constraints.maxTimeline} days`);
    }

    // Required items validation
    if (constraints?.requiredItems) {
      const selectedIds = new Set(result.selectedItems.map(item => item.id));
      const missingRequired = constraints.requiredItems.filter(id => !selectedIds.has(id));
      
      if (missingRequired.length > 0) {
        violations.push(`Missing ${missingRequired.length} required item(s)`);
      }
    }

    // Must-have items validation
    const mustHaveItems = items.filter(item => item.priority === 'must');
    const selectedIds = new Set(result.selectedItems.map(item => item.id));
    const missingMustHaves = mustHaveItems.filter(must => !selectedIds.has(must.id));
    
    if (missingMustHaves.length > 0) {
      violations.push(`Missing ${missingMustHaves.length} must-have item(s): ${missingMustHaves.map(i => i.name).join(', ')}`);
    }

    return {
      isValid: violations.length === 0,
      violations
    };
  }

  /**
   * Get strategy information
   */
  static getStrategyInfo(strategy: ScenarioStrategy): { name: string; description: string } {
    const config = STRATEGY_CONFIGS[strategy];
    return {
      name: config?.name || strategy,
      description: config?.description || 'Custom optimization strategy'
    };
  }

  /**
   * Get all available strategies
   */
  static getAvailableStrategies(): Array<{ key: ScenarioStrategy; name: string; description: string }> {
    return Object.entries(STRATEGY_CONFIGS).map(([key, config]) => ({
      key: key as ScenarioStrategy,
      name: config.name,
      description: config.description
    }));
  }

  /**
   * Suggest optimal budget based on items and strategy
   */
  static suggestOptimalBudget(
    items: OptimizableItem[],
    strategy: ScenarioStrategy = SCENARIO_STRATEGIES.BALANCED
  ): { 
    minimal: number; 
    recommended: number; 
    optimal: number; 
    reasoning: string 
  } {
    const mustHaveCost = items
      .filter(item => item.priority === 'must')
      .reduce((sum, item) => sum + item.cost, 0);

    const shouldHaveCost = items
      .filter(item => item.priority === 'should')
      .reduce((sum, item) => sum + item.cost, 0);

    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);

    // Strategy-specific recommendations
    const strategyMultipliers = {
      [SCENARIO_STRATEGIES.MAXIMIZE_ROI]: 1.2, // Buffer for optimization
      [SCENARIO_STRATEGIES.FASTEST_TIMELINE]: 0.9, // Less comprehensive
      [SCENARIO_STRATEGIES.ALL_MUST_HAVES]: 1.0, // Just enough
      [SCENARIO_STRATEGIES.BALANCED]: 1.15, // Good balance
      [SCENARIO_STRATEGIES.CUSTOM]: 1.1 // Moderate buffer
    };

    const multiplier = strategyMultipliers[strategy] || 1.0;

    return {
      minimal: Math.ceil(mustHaveCost * 1.05), // 5% buffer
      recommended: Math.ceil((mustHaveCost + shouldHaveCost) * multiplier),
      optimal: Math.ceil(totalCost * 1.1), // 10% contingency
      reasoning: `Based on ${STRATEGY_CONFIGS[strategy]?.name || strategy} strategy with ${items.length} items`
    };
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ScenarioEngine;