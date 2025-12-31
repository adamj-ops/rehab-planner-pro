/**
 * @file scenario-store.ts
 * @description Zustand store for managing budget optimization scenarios
 */

import React from 'react';
import { create } from 'zustand';
import { devtools, subscribeWithSelector } from 'zustand/middleware';
import { supabase } from '@/lib/supabase/client';
import { 
  BudgetScenario,
  CreateScenarioParams,
  UpdateScenarioParams,
  ScenarioStoreState,
  ScenarioStoreActions,
  ScenarioComparison,
  ScenarioItemComparison,
  ScenarioTradeoff,
  ScenarioError,
  SCENARIO_STRATEGIES
} from '@/types/scenario';
import { OptimizableItem } from '@/lib/priority-engine/budget-optimizer';

// =============================================================================
// DATABASE OPERATIONS
// =============================================================================

/**
 * Database service for scenario CRUD operations
 */
const scenarioDb = {
  async fetchAll(projectId: string): Promise<BudgetScenario[]> {
    const { data, error } = await supabase
      .from('project_scenarios')
      .select('*')
      .eq('project_id', projectId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new ScenarioError('Failed to fetch scenarios', 'STORAGE_ERROR', { error });
    }

    return data?.map(transformFromDb) || [];
  },

  async create(params: CreateScenarioParams & { projectId: string }): Promise<BudgetScenario> {
    const { data, error } = await supabase
      .from('project_scenarios')
      .insert({
        project_id: params.projectId,
        name: params.name,
        description: params.description || null,
        budget_amount: params.budgetAmount,
        priority_strategy: params.priorityStrategy,
        selected_item_ids: params.customItemIds || [],
        total_cost: 0, // Will be calculated by optimization engine
        total_value: 0, // Will be calculated by optimization engine
        item_count: params.customItemIds?.length || 0,
        timeline_days: null,
        created_by: (await supabase.auth.getUser()).data.user?.id
      })
      .select()
      .single();

    if (error) {
      throw new ScenarioError('Failed to create scenario', 'STORAGE_ERROR', { error });
    }

    return transformFromDb(data);
  },

  async update(id: string, params: UpdateScenarioParams): Promise<BudgetScenario> {
    const updateData: Record<string, any> = {};
    
    if (params.name !== undefined) updateData.name = params.name;
    if (params.description !== undefined) updateData.description = params.description;
    if (params.budgetAmount !== undefined) updateData.budget_amount = params.budgetAmount;
    if (params.priorityStrategy !== undefined) updateData.priority_strategy = params.priorityStrategy;
    if (params.customItemIds !== undefined) {
      updateData.selected_item_ids = params.customItemIds;
      updateData.item_count = params.customItemIds.length;
    }

    const { data, error } = await supabase
      .from('project_scenarios')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ScenarioError('Failed to update scenario', 'STORAGE_ERROR', { error });
    }

    return transformFromDb(data);
  },

  async updateResults(id: string, results: {
    selectedItemIds: string[];
    totalCost: number;
    totalValue: number;
    itemCount: number;
    timelineDays?: number;
  }): Promise<BudgetScenario> {
    const { data, error } = await supabase
      .from('project_scenarios')
      .update({
        selected_item_ids: results.selectedItemIds,
        total_cost: results.totalCost,
        total_value: results.totalValue,
        item_count: results.itemCount,
        timeline_days: results.timelineDays || null
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new ScenarioError('Failed to update scenario results', 'STORAGE_ERROR', { error });
    }

    return transformFromDb(data);
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('project_scenarios')
      .delete()
      .eq('id', id);

    if (error) {
      throw new ScenarioError('Failed to delete scenario', 'STORAGE_ERROR', { error });
    }
  },

  async setActive(scenarioId: string, projectId: string): Promise<void> {
    // First, deactivate all scenarios for the project
    await supabase
      .from('project_scenarios')
      .update({ is_active: false })
      .eq('project_id', projectId);

    // Then activate the selected scenario
    const { error } = await supabase
      .from('project_scenarios')
      .update({ is_active: true })
      .eq('id', scenarioId);

    if (error) {
      throw new ScenarioError('Failed to activate scenario', 'STORAGE_ERROR', { error });
    }
  }
};

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

/**
 * Transform database record to BudgetScenario interface
 */
function transformFromDb(data: any): BudgetScenario {
  return {
    id: data.id,
    projectId: data.project_id,
    name: data.name,
    description: data.description,
    budgetAmount: Number(data.budget_amount),
    priorityStrategy: data.priority_strategy,
    selectedItemIds: data.selected_item_ids || [],
    totalCost: Number(data.total_cost),
    totalValue: Number(data.total_value),
    itemCount: data.item_count,
    timelineDays: data.timeline_days,
    isActive: data.is_active,
    isBaseline: data.is_baseline,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    createdBy: data.created_by
  };
}

/**
 * Calculate scenario comparison metrics
 */
function calculateComparisonMetrics(scenarios: BudgetScenario[]): ScenarioComparison['metrics'] {
  const costs = scenarios.map(s => s.totalCost);
  const values = scenarios.map(s => s.totalValue);
  const itemCounts = scenarios.map(s => s.itemCount);
  const timelines = scenarios.map(s => s.timelineDays || 0);

  return {
    costRange: {
      min: Math.min(...costs),
      max: Math.max(...costs),
      average: costs.reduce((a, b) => a + b, 0) / costs.length
    },
    valueRange: {
      min: Math.min(...values),
      max: Math.max(...values),
      average: values.reduce((a, b) => a + b, 0) / values.length
    },
    itemCountRange: {
      min: Math.min(...itemCounts),
      max: Math.max(...itemCounts),
      average: itemCounts.reduce((a, b) => a + b, 0) / itemCounts.length
    },
    timelineRange: {
      min: Math.min(...timelines),
      max: Math.max(...timelines),
      average: timelines.reduce((a, b) => a + b, 0) / timelines.length
    }
  };
}

/**
 * Generate scenario recommendations
 */
function generateRecommendations(scenarios: BudgetScenario[]): ScenarioComparison['recommendations'] {
  if (scenarios.length === 0) {
    return { bestValue: '', bestCost: '', bestTimeline: '', bestBalance: '' };
  }

  // Find best by different criteria
  const bestValue = scenarios.reduce((a, b) => a.totalValue > b.totalValue ? a : b);
  const bestCost = scenarios.reduce((a, b) => a.totalCost < b.totalCost ? a : b);
  const bestTimeline = scenarios.reduce((a, b) => 
    (a.timelineDays || 0) < (b.timelineDays || 0) ? a : b
  );
  
  // Best balance: highest value per dollar
  const bestBalance = scenarios.reduce((a, b) => {
    const aRatio = a.totalCost > 0 ? a.totalValue / a.totalCost : 0;
    const bRatio = b.totalCost > 0 ? b.totalValue / b.totalCost : 0;
    return aRatio > bRatio ? a : b;
  });

  return {
    bestValue: bestValue.id,
    bestCost: bestCost.id,
    bestTimeline: bestTimeline.id,
    bestBalance: bestBalance.id
  };
}

// =============================================================================
// ZUSTAND STORE
// =============================================================================

type ScenarioStore = ScenarioStoreState & ScenarioStoreActions;

export const useScenarioStore = create<ScenarioStore>()(
  devtools(
    subscribeWithSelector(
      (set, get) => ({
        // Initial state
        scenarios: [],
        activeScenarioId: null,
        isLoading: false,
        error: null,
        lastUpdated: null,

        // Data fetching
        fetchScenarios: async (projectId: string) => {
          set({ isLoading: true, error: null });
          try {
            const scenarios = await scenarioDb.fetchAll(projectId);
            const activeScenario = scenarios.find(s => s.isActive);
            set({ 
              scenarios, 
              activeScenarioId: activeScenario?.id || null,
              lastUpdated: new Date().toISOString(),
              isLoading: false 
            });
          } catch (error) {
            set({ 
              error: error instanceof ScenarioError ? error.message : 'Failed to fetch scenarios',
              isLoading: false 
            });
          }
        },

        refreshScenarios: async () => {
          const currentScenarios = get().scenarios;
          if (currentScenarios.length === 0) return;
          
          const projectId = currentScenarios[0]?.projectId;
          if (!projectId) return;

          await get().fetchScenarios(projectId);
        },

        // CRUD operations
        createScenario: async (params: CreateScenarioParams) => {
          set({ isLoading: true, error: null });
          try {
            const currentScenarios = get().scenarios;
            const projectId = params.projectId || currentScenarios[0]?.projectId;
            
            if (!projectId) {
              throw new ScenarioError('No project ID available', 'VALIDATION_ERROR');
            }

            const scenario = await scenarioDb.create({ ...params, projectId });
            
            set(state => ({
              scenarios: [scenario, ...state.scenarios],
              isLoading: false,
              lastUpdated: new Date().toISOString()
            }));

            return scenario;
          } catch (error) {
            const errorMessage = error instanceof ScenarioError ? error.message : 'Failed to create scenario';
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        updateScenario: async (id: string, params: UpdateScenarioParams) => {
          set({ isLoading: true, error: null });
          try {
            const updatedScenario = await scenarioDb.update(id, params);
            
            set(state => ({
              scenarios: state.scenarios.map(s => 
                s.id === id ? updatedScenario : s
              ),
              isLoading: false,
              lastUpdated: new Date().toISOString()
            }));

            return updatedScenario;
          } catch (error) {
            const errorMessage = error instanceof ScenarioError ? error.message : 'Failed to update scenario';
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        deleteScenario: async (id: string) => {
          set({ isLoading: true, error: null });
          try {
            await scenarioDb.delete(id);
            
            set(state => ({
              scenarios: state.scenarios.filter(s => s.id !== id),
              activeScenarioId: state.activeScenarioId === id ? null : state.activeScenarioId,
              isLoading: false,
              lastUpdated: new Date().toISOString()
            }));
          } catch (error) {
            const errorMessage = error instanceof ScenarioError ? error.message : 'Failed to delete scenario';
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        duplicateScenario: async (id: string, newName: string) => {
          const original = get().scenarios.find(s => s.id === id);
          if (!original) {
            throw new ScenarioError('Scenario not found', 'VALIDATION_ERROR');
          }

          return get().createScenario({
            name: newName,
            description: `Copy of ${original.name}`,
            budgetAmount: original.budgetAmount,
            priorityStrategy: original.priorityStrategy,
            customItemIds: original.selectedItemIds,
            projectId: original.projectId
          });
        },

        // Scenario management
        applyScenario: async (id: string) => {
          const scenario = get().scenarios.find(s => s.id === id);
          if (!scenario) {
            throw new ScenarioError('Scenario not found', 'VALIDATION_ERROR');
          }

          set({ isLoading: true, error: null });
          try {
            await scenarioDb.setActive(id, scenario.projectId);
            
            set(state => ({
              scenarios: state.scenarios.map(s => ({
                ...s,
                isActive: s.id === id
              })),
              activeScenarioId: id,
              isLoading: false,
              lastUpdated: new Date().toISOString()
            }));
          } catch (error) {
            const errorMessage = error instanceof ScenarioError ? error.message : 'Failed to apply scenario';
            set({ error: errorMessage, isLoading: false });
            throw error;
          }
        },

        createBaseline: async (projectId: string, items: OptimizableItem[], budget: number) => {
          // Check if baseline already exists
          const existingBaseline = get().scenarios.find(s => s.isBaseline);
          if (existingBaseline) {
            return existingBaseline;
          }

          const includedItems = items.filter((_, index) => 
            // Default inclusion logic - can be customized
            items[index] // Just include all items by default
          );

          return get().createScenario({
            name: 'Baseline',
            description: 'Original project configuration',
            budgetAmount: budget,
            priorityStrategy: SCENARIO_STRATEGIES.CUSTOM,
            customItemIds: includedItems.map(item => item.id),
            projectId
          });
        },

        // Comparison utilities
        compareScenarios: (scenarioIds: string[], items: OptimizableItem[]): ScenarioComparison => {
          const scenarios = get().scenarios.filter(s => scenarioIds.includes(s.id));
          
          if (scenarios.length < 2) {
            throw new ScenarioError('At least 2 scenarios required for comparison', 'VALIDATION_ERROR');
          }

          const metrics = calculateComparisonMetrics(scenarios);
          const recommendations = generateRecommendations(scenarios);
          
          // Generate tradeoff analysis
          const tradeoffs = [];
          for (let i = 0; i < scenarios.length - 1; i++) {
            for (let j = i + 1; j < scenarios.length; j++) {
              const a = scenarios[i];
              const b = scenarios[j];
              
              tradeoffs.push({
                scenarioId: a.id,
                vs: b.id,
                costDifference: b.totalCost - a.totalCost,
                valueDifference: b.totalValue - a.totalValue,
                timelineDifference: (b.timelineDays || 0) - (a.timelineDays || 0),
                itemsDifference: b.itemCount - a.itemCount,
                summary: generateTradeoffSummary(a, b)
              });
            }
          }

          return { scenarios, metrics, recommendations, tradeoffs };
        },

        getDetailedComparison: (scenarioIds: string[], items: OptimizableItem[]): ScenarioItemComparison[] => {
          const scenarios = get().scenarios.filter(s => scenarioIds.includes(s.id));
          const itemComparisons: ScenarioItemComparison[] = [];

          for (const item of items) {
            const includedIn = scenarios
              .filter(s => s.selectedItemIds.includes(item.id))
              .map(s => s.id);
            
            const excludedFrom = scenarios
              .filter(s => !s.selectedItemIds.includes(item.id))
              .map(s => s.id);

            // Calculate impact level based on cost and value
            let impact: 'high' | 'medium' | 'low' = 'low';
            if (item.cost > 5000 || item.value > 80) impact = 'high';
            else if (item.cost > 2000 || item.value > 60) impact = 'medium';

            itemComparisons.push({
              itemId: item.id,
              itemName: item.name,
              cost: item.cost,
              value: item.value,
              includedIn,
              excludedFrom,
              impact
            });
          }

          return itemComparisons.sort((a, b) => {
            const impactOrder = { high: 3, medium: 2, low: 1 };
            return impactOrder[b.impact] - impactOrder[a.impact];
          });
        },

        analyzeTradeoffs: (scenarioAId: string, scenarioBId: string, items: OptimizableItem[]): ScenarioTradeoff => {
          const scenarioA = get().scenarios.find(s => s.id === scenarioAId);
          const scenarioB = get().scenarios.find(s => s.id === scenarioBId);

          if (!scenarioA || !scenarioB) {
            throw new ScenarioError('One or both scenarios not found', 'VALIDATION_ERROR');
          }

          const costDiff = scenarioB.totalCost - scenarioA.totalCost;
          const valueDiff = scenarioB.totalValue - scenarioA.totalValue;
          const timelineDiff = (scenarioB.timelineDays || 0) - (scenarioA.timelineDays || 0);
          const itemsDiff = scenarioB.itemCount - scenarioA.itemCount;
          
          let efficiency = 0;
          if (costDiff !== 0) {
            efficiency = valueDiff / Math.abs(costDiff);
          }

          let recommendation: 'a' | 'b' | 'neutral' = 'neutral';
          if (valueDiff > 0 && costDiff <= 0) recommendation = 'b';
          else if (valueDiff < 0 && costDiff >= 0) recommendation = 'a';
          else if (efficiency > 1) recommendation = 'b';
          else if (efficiency < -1) recommendation = 'a';

          return {
            scenarioA: scenarioAId,
            scenarioB: scenarioBId,
            costDifference: costDiff,
            valueDifference: valueDiff,
            timelineDifference: timelineDiff,
            itemsDifference: itemsDiff,
            efficiency,
            recommendation,
            reasoning: generateTradeoffSummary(scenarioA, scenarioB)
          };
        },

        // Utilities
        clearError: () => set({ error: null }),
        
        reset: () => set({
          scenarios: [],
          activeScenarioId: null,
          isLoading: false,
          error: null,
          lastUpdated: null
        })
      })
    ),
    { name: 'scenario-store' }
  )
);

// =============================================================================
// HELPER FUNCTIONS
// =============================================================================

function generateTradeoffSummary(a: BudgetScenario, b: BudgetScenario): string {
  const costDiff = b.totalCost - a.totalCost;
  const valueDiff = b.totalValue - a.totalValue;
  
  if (valueDiff > 0 && costDiff <= 0) {
    return `${b.name} provides ${valueDiff.toFixed(0)} more value for ${Math.abs(costDiff).toLocaleString()} less cost`;
  } else if (valueDiff > 0 && costDiff > 0) {
    const efficiency = valueDiff / costDiff;
    return `${b.name} costs $${costDiff.toLocaleString()} more but adds ${valueDiff.toFixed(0)} value (${efficiency.toFixed(1)}x return)`;
  } else if (valueDiff < 0) {
    return `${a.name} provides ${Math.abs(valueDiff).toFixed(0)} more value than ${b.name}`;
  } else {
    return `Similar value with ${Math.abs(costDiff).toLocaleString()} cost difference`;
  }
}

export default useScenarioStore;