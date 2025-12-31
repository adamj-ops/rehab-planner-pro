/**
 * @file index.ts
 * @description Export barrel for scenario management utilities
 */

export { ScenarioManager } from './scenario-manager';
export { ScenarioTemplates } from './scenario-templates';

// Re-export types for convenience
export type {
  BudgetScenario,
  ScenarioType,
  ScenarioStatus,
  ScenarioComparison,
  ScenarioTemplate,
  CreateScenarioParams,
  UpdateScenarioParams,
  ComparisonItemDetail,
  WizardScenarioData,
} from '@/types/scenario';