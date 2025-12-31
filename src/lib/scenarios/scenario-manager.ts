/**
 * @file scenario-manager.ts
 * @description Utility class for managing budget optimization scenarios
 * 
 * Provides CRUD operations, comparison logic, and persistence for scenarios.
 * Integrates with BudgetOptimizer to generate optimized scenarios.
 */

import { v4 as uuidv4 } from 'uuid';
import { BudgetOptimizer, type OptimizableItem } from '@/lib/priority-engine';
import type {
  BudgetScenario,
  ScenarioType,
  ScenarioStatus,
  ScenarioComparison,
  CreateScenarioParams,
  UpdateScenarioParams,
  ComparisonItemDetail,
} from '@/types/scenario';

// =============================================================================
// CONSTANTS
// =============================================================================

const STORAGE_KEY = 'rehab_scenarios';
const MAX_SCENARIOS_PER_PROJECT = 10;

// =============================================================================
// SCENARIO MANAGER CLASS
// =============================================================================

export class ScenarioManager {
  private static scenarios: Map<string, BudgetScenario> = new Map();
  private static isInitialized = false;

  /**
   * Initialize the scenario manager
   * Loads scenarios from localStorage on first use
   */
  private static initialize(): void {
    if (this.isInitialized) return;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const scenarioData = JSON.parse(stored) as BudgetScenario[];
        scenarioData.forEach(scenario => {
          // Convert date strings back to Date objects
          scenario.createdAt = new Date(scenario.createdAt);
          scenario.updatedAt = new Date(scenario.updatedAt);
          this.scenarios.set(scenario.id, scenario);
        });
      }
    } catch (error) {
      console.error('Failed to load scenarios from localStorage:', error);
    }
    
    this.isInitialized = true;
  }

  /**
   * Persist scenarios to localStorage
   */
  private static persist(): void {
    try {
      const scenarioArray = Array.from(this.scenarios.values());
      localStorage.setItem(STORAGE_KEY, JSON.stringify(scenarioArray));
    } catch (error) {
      console.error('Failed to persist scenarios to localStorage:', error);
    }
  }

  // =============================================================================
  // CRUD OPERATIONS
  // =============================================================================

  /**
   * Create a new scenario from parameters
   */
  static async createScenario(params: CreateScenarioParams): Promise<BudgetScenario> {
    this.initialize();

    // Check scenario limit
    if (this.scenarios.size >= MAX_SCENARIOS_PER_PROJECT) {
      throw new Error(`Maximum of ${MAX_SCENARIOS_PER_PROJECT} scenarios allowed`);
    }

    // Validate name uniqueness
    const existingNames = Array.from(this.scenarios.values()).map(s => s.name.toLowerCase());
    if (existingNames.includes(params.name.toLowerCase())) {
      throw new Error('Scenario name already exists');
    }

    // Run optimization
    const optimizationOptions = {
      budget: params.budget,
      prioritizeMustHaves: true,
      respectDependencies: true,
      ...params.options,
    };

    const optimizationResult = BudgetOptimizer.optimize(params.items, optimizationOptions);

    // Create scenario
    const scenario: BudgetScenario = {
      id: uuidv4(),
      name: params.name,
      description: params.description,
      type: params.type,
      status: 'draft',
      createdAt: new Date(),
      updatedAt: new Date(),
      budget: params.budget,
      options: optimizationOptions,
      result: {
        selectedItemIds: optimizationResult.selectedItems.map(item => item.id),
        totalCost: optimizationResult.totalCost,
        totalValue: optimizationResult.totalValue,
        itemCount: optimizationResult.summary.itemCount,
        budgetUsed: optimizationResult.summary.budgetUsed,
        budgetRemaining: optimizationResult.summary.budgetRemaining,
        averageROI: optimizationResult.summary.averageROI,
        mustHavesCovered: optimizationResult.summary.mustHavesCovered,
      },
      isDefault: false,
      isApplied: false,
    };

    // Store and persist
    this.scenarios.set(scenario.id, scenario);
    this.persist();

    return scenario;
  }

  /**
   * Update an existing scenario
   */
  static updateScenario(id: string, updates: UpdateScenarioParams): BudgetScenario {
    this.initialize();

    const scenario = this.scenarios.get(id);
    if (!scenario) {
      throw new Error(`Scenario with id ${id} not found`);
    }

    // Validate name uniqueness if changing name
    if (updates.name && updates.name !== scenario.name) {
      const existingNames = Array.from(this.scenarios.values())
        .filter(s => s.id !== id)
        .map(s => s.name.toLowerCase());
      if (existingNames.includes(updates.name.toLowerCase())) {
        throw new Error('Scenario name already exists');
      }
    }

    // Update scenario
    const updatedScenario: BudgetScenario = {
      ...scenario,
      ...updates,
      updatedAt: new Date(),
    };

    this.scenarios.set(id, updatedScenario);
    this.persist();

    return updatedScenario;
  }

  /**
   * Delete a scenario
   */
  static deleteScenario(id: string): boolean {
    this.initialize();

    const existed = this.scenarios.has(id);
    this.scenarios.delete(id);
    
    if (existed) {
      this.persist();
    }
    
    return existed;
  }

  /**
   * Get a single scenario by ID
   */
  static getScenario(id: string): BudgetScenario | undefined {
    this.initialize();
    return this.scenarios.get(id);
  }

  /**
   * Get all scenarios
   */
  static getAllScenarios(): BudgetScenario[] {
    this.initialize();
    return Array.from(this.scenarios.values()).sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  /**
   * Get scenarios by type
   */
  static getScenariosByType(type: ScenarioType): BudgetScenario[] {
    this.initialize();
    return this.getAllScenarios().filter(scenario => scenario.type === type);
  }

  /**
   * Get applied scenario (if any)
   */
  static getAppliedScenario(): BudgetScenario | undefined {
    this.initialize();
    return Array.from(this.scenarios.values()).find(scenario => scenario.isApplied);
  }

  /**
   * Mark a scenario as applied
   */
  static applyScenario(id: string): BudgetScenario {
    this.initialize();

    const scenario = this.scenarios.get(id);
    if (!scenario) {
      throw new Error(`Scenario with id ${id} not found`);
    }

    // Mark all other scenarios as not applied
    this.scenarios.forEach((s, sId) => {
      if (s.isApplied) {
        this.scenarios.set(sId, { ...s, isApplied: false, status: 'draft' });
      }
    });

    // Mark this scenario as applied
    const appliedScenario = { ...scenario, isApplied: true, status: 'active' as ScenarioStatus };
    this.scenarios.set(id, appliedScenario);
    this.persist();

    return appliedScenario;
  }

  // =============================================================================
  // COMPARISON LOGIC
  // =============================================================================

  /**
   * Compare multiple scenarios
   */
  static compareScenarios(scenarioIds: string[], allItems: OptimizableItem[]): ScenarioComparison {
    this.initialize();

    if (scenarioIds.length < 2 || scenarioIds.length > 3) {
      throw new Error('Can only compare 2-3 scenarios at a time');
    }

    const scenarios = scenarioIds.map(id => {
      const scenario = this.scenarios.get(id);
      if (!scenario) {
        throw new Error(`Scenario with id ${id} not found`);
      }
      return scenario;
    });

    // Calculate metrics
    const costs = scenarios.map(s => s.result.totalCost);
    const values = scenarios.map(s => s.result.totalValue);
    const itemCounts = scenarios.map(s => s.result.itemCount);

    const metrics = {
      costRange: { min: Math.min(...costs), max: Math.max(...costs) },
      valueRange: { min: Math.min(...values), max: Math.max(...values) },
      itemCountRange: { min: Math.min(...itemCounts), max: Math.max(...itemCounts) },
      averageCost: costs.reduce((sum, cost) => sum + cost, 0) / costs.length,
      averageValue: values.reduce((sum, value) => sum + value, 0) / values.length,
      averageItemCount: itemCounts.reduce((sum, count) => sum + count, 0) / itemCounts.length,
    };

    // Generate item comparison
    const allUniqueItemIds = Array.from(
      new Set(
        scenarios.flatMap(scenario => scenario.result.selectedItemIds)
      )
    );

    const itemComparison = allUniqueItemIds.map(itemId => {
      const item = allItems.find(i => i.id === itemId);
      const includedInScenarios = scenarios
        .filter(scenario => scenario.result.selectedItemIds.includes(itemId))
        .map(scenario => scenario.id);

      return {
        itemId,
        itemName: item?.name || 'Unknown Item',
        includedInScenarios,
      };
    });

    // Find difference items (items only in one scenario)
    const differenceItems = itemComparison
      .filter(item => item.includedInScenarios.length === 1)
      .map(item => ({
        itemId: item.itemId,
        itemName: item.itemName,
        onlyInScenario: item.includedInScenarios[0],
      }));

    // Generate recommendation
    let recommendation: { scenarioId: string; reason: string } | undefined;
    
    // Simple recommendation logic: highest value-to-cost ratio
    let bestRatio = 0;
    let bestScenarioId = '';
    
    scenarios.forEach(scenario => {
      const ratio = scenario.result.totalValue / Math.max(scenario.result.totalCost, 1);
      if (ratio > bestRatio) {
        bestRatio = ratio;
        bestScenarioId = scenario.id;
      }
    });

    if (bestScenarioId) {
      const bestScenario = scenarios.find(s => s.id === bestScenarioId);
      recommendation = {
        scenarioId: bestScenarioId,
        reason: `Best value-to-cost ratio (${bestRatio.toFixed(2)})${
          bestScenario?.result.mustHavesCovered ? ' with all must-haves covered' : ''
        }`,
      };
    }

    return {
      scenarios,
      metrics,
      itemComparison,
      allUniqueItemIds,
      differenceItems,
      recommendation,
    };
  }

  /**
   * Get detailed comparison for display
   */
  static getDetailedComparison(
    scenarioIds: string[], 
    allItems: OptimizableItem[]
  ): ComparisonItemDetail[] {
    this.initialize();

    const comparison = this.compareScenarios(scenarioIds, allItems);
    
    return comparison.allUniqueItemIds.map(itemId => {
      const item = allItems.find(i => i.id === itemId);
      if (!item) {
        return {
          id: itemId,
          name: 'Unknown Item',
          cost: 0,
          value: 0,
          category: 'unknown',
          includedIn: {},
        };
      }

      const includedIn: { [scenarioId: string]: boolean } = {};
      comparison.scenarios.forEach(scenario => {
        includedIn[scenario.id] = scenario.result.selectedItemIds.includes(itemId);
      });

      return {
        id: item.id,
        name: item.name,
        cost: item.cost,
        value: item.value,
        category: item.category,
        includedIn,
      };
    });
  }

  // =============================================================================
  // UTILITY METHODS
  // =============================================================================

  /**
   * Clear all scenarios (for testing/reset)
   */
  static clearAll(): void {
    this.scenarios.clear();
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear scenarios from localStorage:', error);
    }
  }

  /**
   * Get scenario count
   */
  static getScenarioCount(): number {
    this.initialize();
    return this.scenarios.size;
  }

  /**
   * Check if scenario name exists
   */
  static isNameTaken(name: string, excludeId?: string): boolean {
    this.initialize();
    return Array.from(this.scenarios.values())
      .filter(scenario => excludeId ? scenario.id !== excludeId : true)
      .some(scenario => scenario.name.toLowerCase() === name.toLowerCase());
  }

  /**
   * Generate unique scenario name
   */
  static generateUniqueName(baseName: string): string {
    this.initialize();
    
    if (!this.isNameTaken(baseName)) {
      return baseName;
    }

    let counter = 1;
    let name = `${baseName} ${counter}`;
    while (this.isNameTaken(name)) {
      counter++;
      name = `${baseName} ${counter}`;
    }
    
    return name;
  }

  /**
   * Export scenarios as JSON
   */
  static exportScenarios(): string {
    this.initialize();
    return JSON.stringify(Array.from(this.scenarios.values()), null, 2);
  }

  /**
   * Import scenarios from JSON
   */
  static importScenarios(jsonData: string): number {
    this.initialize();
    
    try {
      const scenarios = JSON.parse(jsonData) as BudgetScenario[];
      let imported = 0;
      
      scenarios.forEach(scenario => {
        // Ensure dates are Date objects
        scenario.createdAt = new Date(scenario.createdAt);
        scenario.updatedAt = new Date(scenario.updatedAt);
        
        // Generate unique name if needed
        scenario.name = this.generateUniqueName(scenario.name);
        
        // Generate new ID to avoid conflicts
        scenario.id = uuidv4();
        
        this.scenarios.set(scenario.id, scenario);
        imported++;
      });
      
      if (imported > 0) {
        this.persist();
      }
      
      return imported;
    } catch (error) {
      console.error('Failed to import scenarios:', error);
      throw new Error('Invalid scenario data');
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ScenarioManager;