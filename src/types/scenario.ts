/**
 * @file scenario.ts
 * @description TypeScript interfaces for What-If Scenario Comparison system
 */

import type { OptimizableItem, OptimizationResult } from "@/lib/priority-engine/budget-optimizer";

// =============================================================================
// ENUMS & CONSTANTS
// =============================================================================

export const SCENARIO_STRATEGIES = {
  MAXIMIZE_ROI: 'maximize_roi',
  FASTEST_TIMELINE: 'fastest_timeline',
  ALL_MUST_HAVES: 'all_must_haves',
  BALANCED: 'balanced',
  CUSTOM: 'custom'
} as const;

export type ScenarioStrategy = typeof SCENARIO_STRATEGIES[keyof typeof SCENARIO_STRATEGIES];

export const STRATEGY_LABELS: Record<ScenarioStrategy, string> = {
  maximize_roi: 'Maximize ROI',
  fastest_timeline: 'Fastest Timeline',
  all_must_haves: 'All Must-Haves',
  balanced: 'Balanced Approach',
  custom: 'Custom Selection'
};

export const STRATEGY_DESCRIPTIONS: Record<ScenarioStrategy, string> = {
  maximize_roi: 'Prioritizes items with the highest value-to-cost ratio',
  fastest_timeline: 'Focuses on items that can be completed quickly',
  all_must_haves: 'Ensures all must-have items are included first',
  balanced: 'Balances cost, timeline, and value considerations',
  custom: 'User-defined item selection and priorities'
};

// =============================================================================
// CORE INTERFACES
// =============================================================================

/**
 * Parameters for creating a new scenario
 */
export interface CreateScenarioParams {
  name: string;
  description?: string;
  budgetAmount: number;
  priorityStrategy: ScenarioStrategy;
  customItemIds?: string[]; // For custom strategy
  projectId?: string; // Optional - can be inferred from context
}

/**
 * Parameters for updating an existing scenario
 */
export interface UpdateScenarioParams {
  name?: string;
  description?: string;
  budgetAmount?: number;
  priorityStrategy?: ScenarioStrategy;
  customItemIds?: string[];
}

/**
 * Core scenario interface matching the database schema
 */
export interface BudgetScenario {
  id: string;
  projectId: string;
  name: string;
  description?: string;
  
  // Parameters
  budgetAmount: number;
  priorityStrategy: ScenarioStrategy;
  
  // Cached results
  selectedItemIds: string[];
  totalCost: number;
  totalValue: number;
  itemCount: number;
  timelineDays?: number;
  
  // Metadata
  isActive: boolean;
  isBaseline: boolean;
  createdAt: string;
  updatedAt: string;
  createdBy: string;
}

/**
 * Results from scenario generation/optimization
 */
export interface ScenarioResult extends OptimizationResult {
  strategy: ScenarioStrategy;
  budgetAmount: number;
  budgetRemaining: number;
  timelineDays: number;
  metadata: {
    generatedAt: string;
    itemsExcluded: OptimizableItem[];
    warnings: string[];
  };
}

/**
 * Options for scenario generation
 */
export interface ScenarioGenerationOptions {
  budgetAmount: number;
  strategy: ScenarioStrategy;
  items: OptimizableItem[];
  customItemIds?: string[];
  respectDependencies?: boolean;
  maxItems?: number;
}

// =============================================================================
// COMPARISON INTERFACES
// =============================================================================

/**
 * Comparison between two or more scenarios
 */
export interface ScenarioComparison {
  scenarios: BudgetScenario[];
  metrics: {
    costRange: { min: number; max: number; average: number };
    valueRange: { min: number; max: number; average: number };
    itemCountRange: { min: number; max: number; average: number };
    timelineRange: { min: number; max: number; average: number };
  };
  recommendations: {
    bestValue: string; // scenario ID
    bestCost: string; // scenario ID
    bestTimeline: string; // scenario ID
    bestBalance: string; // scenario ID
  };
  tradeoffs: {
    scenarioId: string;
    vs: string; // comparison scenario ID
    costDifference: number;
    valueDifference: number;
    timelineDifference: number;
    itemsDifference: number;
    summary: string;
  }[];
}

/**
 * Detailed item-level comparison between scenarios
 */
export interface ScenarioItemComparison {
  itemId: string;
  itemName: string;
  cost: number;
  value: number;
  includedIn: string[]; // Array of scenario IDs that include this item
  excludedFrom: string[]; // Array of scenario IDs that exclude this item
  impact: 'high' | 'medium' | 'low'; // Impact level if toggled
}

/**
 * Trade-off analysis between scenarios
 */
export interface ScenarioTradeoff {
  scenarioA: string;
  scenarioB: string;
  costDifference: number; // B - A
  valueDifference: number; // B - A
  timelineDifference: number; // B - A (in days)
  itemsDifference: number; // B - A
  efficiency: number; // value gained per dollar spent
  recommendation: 'a' | 'b' | 'neutral';
  reasoning: string;
}

// =============================================================================
// STORE INTERFACES
// =============================================================================

/**
 * Scenario store state
 */
export interface ScenarioStoreState {
  scenarios: BudgetScenario[];
  activeScenarioId: string | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: string | null;
}

/**
 * Scenario store actions
 */
export interface ScenarioStoreActions {
  // Data fetching
  fetchScenarios: (projectId: string) => Promise<void>;
  refreshScenarios: () => Promise<void>;
  
  // CRUD operations
  createScenario: (params: CreateScenarioParams) => Promise<BudgetScenario>;
  updateScenario: (id: string, params: UpdateScenarioParams) => Promise<BudgetScenario>;
  deleteScenario: (id: string) => Promise<void>;
  duplicateScenario: (id: string, newName: string) => Promise<BudgetScenario>;
  
  // Scenario management
  applyScenario: (id: string) => Promise<void>;
  createBaseline: (projectId: string, items: OptimizableItem[], budget: number) => Promise<BudgetScenario>;
  
  // Comparison utilities
  compareScenarios: (scenarioIds: string[], items: OptimizableItem[]) => ScenarioComparison;
  getDetailedComparison: (scenarioIds: string[], items: OptimizableItem[]) => ScenarioItemComparison[];
  analyzeTradeoffs: (scenarioAId: string, scenarioBId: string, items: OptimizableItem[]) => ScenarioTradeoff;
  
  // Utilities
  clearError: () => void;
  reset: () => void;
}

// =============================================================================
// UI COMPONENT PROPS
// =============================================================================

/**
 * Props for ScenarioCard component
 */
export interface ScenarioCardProps {
  scenario: BudgetScenario;
  isActive?: boolean;
  isCompact?: boolean;
  onEdit?: (scenario: BudgetScenario) => void;
  onDelete?: (id: string) => void;
  onApply?: (id: string) => void;
  onDuplicate?: (id: string) => void;
}

/**
 * Props for ScenarioBuilder dialog
 */
export interface ScenarioBuilderProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (params: CreateScenarioParams) => Promise<void>;
  items: OptimizableItem[];
  currentBudget: number;
  existingScenario?: BudgetScenario;
  investmentStrategy?: string;
}

/**
 * Props for ScenarioComparison panel
 */
export interface ScenarioComparisonProps {
  scenarios: BudgetScenario[];
  onCreateScenario: () => void;
  onEditScenario: (scenario: BudgetScenario) => void;
  onDeleteScenario: (id: string) => void;
  onApplyScenario: (id: string) => void;
  onCompareScenarios: (scenarioIds: string[]) => void;
  maxScenarios?: number;
}

// =============================================================================
// UTILITY TYPES
// =============================================================================

/**
 * Scenario with computed properties for UI display
 */
export interface EnrichedScenario extends BudgetScenario {
  budgetUsedPercentage: number;
  budgetRemaining: number;
  averageItemValue: number;
  efficiency: number; // value per dollar
  strategyLabel: string;
  strategyDescription: string;
}

/**
 * Filter options for scenarios
 */
export interface ScenarioFilters {
  strategy?: ScenarioStrategy;
  budgetRange?: { min: number; max: number };
  dateRange?: { start: string; end: string };
  search?: string;
}

/**
 * Sort options for scenarios
 */
export interface ScenarioSort {
  field: 'name' | 'createdAt' | 'totalCost' | 'totalValue' | 'efficiency';
  direction: 'asc' | 'desc';
}

// =============================================================================
// ERROR TYPES
// =============================================================================

export class ScenarioError extends Error {
  constructor(
    message: string,
    public code: 'VALIDATION_ERROR' | 'OPTIMIZATION_ERROR' | 'STORAGE_ERROR' | 'NETWORK_ERROR',
    public details?: Record<string, any>
  ) {
    super(message);
    this.name = 'ScenarioError';
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  OptimizableItem,
  OptimizationResult
} from "@/lib/priority-engine/budget-optimizer";