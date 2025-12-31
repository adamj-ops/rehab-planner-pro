/**
 * @file scenario-templates.ts
 * @description Pre-defined scenario templates for quick scenario creation
 * 
 * Templates provide common optimization strategies with pre-configured
 * parameters for Conservative, Optimal, and Maximum Value approaches.
 */

import { BudgetOptimizer, type OptimizableItem } from '@/lib/priority-engine';
import type { ScenarioTemplate, ScenarioType } from '@/types/scenario';

// =============================================================================
// TEMPLATE DEFINITIONS
// =============================================================================

/**
 * Conservative template: Minimal budget, must-haves only
 */
const CONSERVATIVE_TEMPLATE: ScenarioTemplate = {
  type: 'conservative',
  name: 'Conservative Budget',
  description: 'Covers must-have items only with minimal budget allocation',
  getBudget: (items: OptimizableItem[]) => {
    const mustHaves = items.filter(item => item.priority === 'must');
    const mustHaveCost = mustHaves.reduce((sum, item) => sum + item.cost, 0);
    return Math.ceil(mustHaveCost * 1.05); // 5% buffer for must-haves
  },
  getOptions: () => ({
    prioritizeMustHaves: true,
    respectDependencies: true,
    maxItems: undefined,
    categoryWeights: undefined,
  }),
};

/**
 * Optimal template: Balanced approach targeting 80% of maximum value
 */
const OPTIMAL_TEMPLATE: ScenarioTemplate = {
  type: 'optimal',
  name: 'Optimal ROI',
  description: 'Balanced approach achieving 80% of maximum value with efficient spend',
  getBudget: (items: OptimizableItem[], currentBudget: number) => {
    // Use budget suggestions from BudgetOptimizer
    const suggestions = BudgetOptimizer.suggestBudgetAdjustments(items, currentBudget);
    return suggestions.optimal.budget;
  },
  getOptions: () => ({
    prioritizeMustHaves: true,
    respectDependencies: true,
    maxItems: undefined,
    categoryWeights: {
      'kitchen': 1.2,      // Higher weight for high-impact areas
      'bathroom': 1.1,
      'exterior': 1.0,
      'flooring': 1.0,
      'other': 0.9,
    },
  }),
};

/**
 * Maximum Value template: All items with maximum budget
 */
const MAXIMUM_TEMPLATE: ScenarioTemplate = {
  type: 'maximum',
  name: 'Maximum Value',
  description: 'All items included with full budget allocation and contingency',
  getBudget: (items: OptimizableItem[]) => {
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    return Math.ceil(totalCost * 1.1); // 10% contingency for all items
  },
  getOptions: () => ({
    prioritizeMustHaves: false, // Include all items regardless of priority
    respectDependencies: true,
    maxItems: undefined,
    categoryWeights: undefined,
  }),
};

// =============================================================================
// SCENARIO TEMPLATES CLASS
// =============================================================================

export class ScenarioTemplates {
  /**
   * Get all available templates
   */
  static getAllTemplates(): ScenarioTemplate[] {
    return [
      CONSERVATIVE_TEMPLATE,
      OPTIMAL_TEMPLATE,
      MAXIMUM_TEMPLATE,
    ];
  }

  /**
   * Get a template by type
   */
  static getTemplate(type: ScenarioType): ScenarioTemplate | undefined {
    switch (type) {
      case 'conservative':
        return CONSERVATIVE_TEMPLATE;
      case 'optimal':
        return OPTIMAL_TEMPLATE;
      case 'maximum':
        return MAXIMUM_TEMPLATE;
      case 'custom':
        return undefined; // Custom scenarios don't have templates
      default:
        return undefined;
    }
  }

  /**
   * Generate a scenario from a template
   */
  static generateFromTemplate(
    templateType: ScenarioType,
    items: OptimizableItem[],
    currentBudget: number,
    customName?: string
  ): {
    name: string;
    description: string;
    type: ScenarioType;
    budget: number;
    options: Record<string, unknown>;
  } {
    const template = this.getTemplate(templateType);
    if (!template) {
      throw new Error(`Template for type ${templateType} not found`);
    }

    return {
      name: customName || template.name,
      description: template.description,
      type: template.type,
      budget: template.getBudget(items, currentBudget),
      options: template.getOptions(),
    };
  }

  /**
   * Get template recommendations based on current selection
   */
  static getRecommendations(
    items: OptimizableItem[],
    currentBudget: number,
    selectedItemIds: string[]
  ): {
    template: ScenarioTemplate;
    reasoning: string;
    estimatedCost: number;
    estimatedValue: number;
  }[] {
    const recommendations = [];
    
    const mustHaves = items.filter(item => item.priority === 'must');
    const currentSelection = items.filter(item => selectedItemIds.includes(item.id));
    const currentCost = currentSelection.reduce((sum, item) => sum + item.cost, 0);
    
    // Conservative recommendation
    const conservativeTemplate = CONSERVATIVE_TEMPLATE;
    const conservativeBudget = conservativeTemplate.getBudget(items, currentBudget);
    recommendations.push({
      template: conservativeTemplate,
      reasoning: `Minimal risk approach covering all must-haves (${mustHaves.length} items) for ${((conservativeBudget / currentBudget) * 100).toFixed(0)}% of budget`,
      estimatedCost: conservativeBudget,
      estimatedValue: mustHaves.reduce((sum, item) => sum + item.value, 0),
    });

    // Optimal recommendation (if different from current)
    const optimalTemplate = OPTIMAL_TEMPLATE;
    const optimalBudget = optimalTemplate.getBudget(items, currentBudget);
    if (Math.abs(optimalBudget - currentCost) > currentBudget * 0.1) { // >10% difference
      recommendations.push({
        template: optimalTemplate,
        reasoning: `Balanced approach targeting 80% of maximum value with efficient budget allocation`,
        estimatedCost: optimalBudget,
        estimatedValue: items.reduce((sum, item) => sum + item.value, 0) * 0.8, // Approximate
      });
    }

    // Maximum recommendation (if budget allows)
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    if (totalCost <= currentBudget * 1.2) { // Within 20% of budget
      const maximumTemplate = MAXIMUM_TEMPLATE;
      const maximumBudget = maximumTemplate.getBudget(items, currentBudget);
      recommendations.push({
        template: maximumTemplate,
        reasoning: `Complete renovation with all ${items.length} items and full contingency buffer`,
        estimatedCost: maximumBudget,
        estimatedValue: items.reduce((sum, item) => sum + item.value, 0),
      });
    }

    return recommendations;
  }

  /**
   * Quick create methods for each template type
   */
  static createConservativeScenario(
    items: OptimizableItem[],
    currentBudget: number,
    customName?: string
  ) {
    return this.generateFromTemplate('conservative', items, currentBudget, customName);
  }

  static createOptimalScenario(
    items: OptimizableItem[],
    currentBudget: number,
    customName?: string
  ) {
    return this.generateFromTemplate('optimal', items, currentBudget, customName);
  }

  static createMaximumScenario(
    items: OptimizableItem[],
    currentBudget: number,
    customName?: string
  ) {
    return this.generateFromTemplate('maximum', items, currentBudget, customName);
  }

  /**
   * Suggest template based on current project state
   */
  static suggestTemplate(
    items: OptimizableItem[],
    currentBudget: number,
    investmentStrategy?: string
  ): ScenarioType {
    const totalCost = items.reduce((sum, item) => sum + item.cost, 0);
    const mustHaveCost = items
      .filter(item => item.priority === 'must')
      .reduce((sum, item) => sum + item.cost, 0);

    // If budget is tight, suggest conservative
    if (currentBudget < mustHaveCost * 1.2) {
      return 'conservative';
    }

    // If budget is very high, suggest maximum
    if (currentBudget >= totalCost * 0.9) {
      return 'maximum';
    }

    // For flips, suggest optimal ROI
    if (investmentStrategy === 'flip') {
      return 'optimal';
    }

    // For rental/personal, might want maximum value
    if (investmentStrategy === 'rental' || investmentStrategy === 'personal_residence') {
      return 'maximum';
    }

    // Default to optimal
    return 'optimal';
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export default ScenarioTemplates;