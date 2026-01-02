/**
 * @file project-wizard.ts
 * @description Zod validation schemas for the 7-step project creation wizard
 * Aligned with Supabase database schema (snake_case field names)
 */

import { z } from "zod";

// =============================================================================
// SHARED ENUMS & CONSTANTS
// =============================================================================

export const US_STATES = [
  "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
  "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
  "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
  "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
  "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
] as const;

export const PROPERTY_TYPES = [
  "single_family",
  "multi_family", 
  "condo",
  "townhome",
] as const;

export const CONDITION_LEVELS = [
  "excellent",
  "good",
  "fair",
  "poor",
  "gut_needed",
] as const;

export const INVESTMENT_STRATEGIES = [
  "flip",
  "rental",
  "wholetail",
  "airbnb",
  "personal_residence",
] as const;

export const TARGET_MARKETS = [
  "first_time_buyer",
  "move_up",
  "investor",
  "luxury",
  "family",
] as const;

export const DESIGN_STYLES = [
  "modern_farmhouse",
  "contemporary",
  "traditional",
  "transitional",
  "industrial",
  "coastal",
  "minimalist",
] as const;

export const ROOM_TYPES = [
  "kitchen",
  "bathroom",
  "bedroom",
  "living_room",
  "dining_room",
  "family_room",
  "office",
  "laundry",
  "garage",
  "basement",
  "attic",
  "exterior",
  "other",
] as const;

export const FLOOR_LEVELS = [
  "basement",
  "main",
  "upper",
  "attic",
] as const;

export const PRIORITY_LEVELS = [
  "must",
  "should",
  "could",
  "nice_to_have",
] as const;

export const QUALITY_TIERS = [
  "budget",
  "standard",
  "premium",
  "luxury",
] as const;

// =============================================================================
// STEP 1: PROPERTY DETAILS SCHEMA
// =============================================================================

export const propertyDetailsSchema = z.object({
  // Basic Info
  project_name: z
    .string()
    .min(3, "Project name must be at least 3 characters")
    .max(200, "Project name must be under 200 characters"),
  
  // Address
  address_street: z
    .string()
    .min(5, "Street address is required")
    .max(200, "Street address must be under 200 characters"),
  address_city: z
    .string()
    .min(2, "City is required")
    .max(100, "City must be under 100 characters"),
  address_state: z.enum(US_STATES, {
    errorMap: () => ({ message: "Please select a state" }),
  }),
  address_zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code (e.g., 78701 or 78701-1234)"),

  // Optional Google Places enrichment
  address_place_id: z.string().min(1).optional(),
  address_formatted: z.string().min(1).optional(),
  address_lat: z.coerce.number().optional(),
  address_lng: z.coerce.number().optional(),
  
  // Property Details
  property_type: z.enum(PROPERTY_TYPES, {
    errorMap: () => ({ message: "Please select a property type" }),
  }),
  square_footage: z.coerce
    .number()
    .min(100, "Square footage must be at least 100")
    .max(50000, "Square footage must be under 50,000"),
  lot_size_sqft: z.coerce
    .number()
    .min(0, "Lot size cannot be negative")
    .max(5000000, "Lot size seems too large")
    .optional(),
  year_built: z.coerce
    .number()
    .min(1800, "Year built must be after 1800")
    .max(new Date().getFullYear(), "Year built cannot be in the future"),
  bedrooms: z.coerce
    .number()
    .min(0, "Bedrooms cannot be negative")
    .max(20, "Bedrooms must be 20 or less"),
  bathrooms: z.coerce
    .number()
    .min(0, "Bathrooms cannot be negative")
    .max(15, "Bathrooms must be 15 or less"),
  
  // Financial (optional at this step)
  purchase_price: z.coerce
    .number()
    .min(0, "Purchase price cannot be negative")
    .optional()
    .nullable(),
});

export type PropertyDetailsFormData = z.infer<typeof propertyDetailsSchema>;

// =============================================================================
// STEP 2: CONDITION ASSESSMENT SCHEMA
// =============================================================================

export const roomComponentSchema = z.object({
  name: z.string(),
  condition: z.enum(CONDITION_LEVELS).optional(),
  needs_work: z.boolean().default(false),
  action: z.enum(["repair", "replace", "upgrade"]).optional(),
  notes: z.string().optional(),
});

export const roomAssessmentSchema = z.object({
  id: z.string().optional(),
  room_type: z.enum(ROOM_TYPES),
  room_name: z.string().max(100).optional(),
  floor_level: z.enum(FLOOR_LEVELS).optional(),
  overall_condition: z.enum(CONDITION_LEVELS).optional(),
  condition_notes: z.string().max(1000).optional(),
  needs_renovation: z.boolean().default(false),
  components: z.array(roomComponentSchema).optional(),
  // Dimensions (optional)
  length_ft: z.coerce.number().min(0).max(200).optional(),
  width_ft: z.coerce.number().min(0).max(200).optional(),
  square_footage: z.coerce.number().min(0).max(10000).optional(),
});

export const conditionAssessmentSchema = z.object({
  overall_condition: z.enum(CONDITION_LEVELS, {
    errorMap: () => ({ message: "Please select the overall property condition" }),
  }),
  condition_notes: z
    .string()
    .max(2000, "Notes must be under 2000 characters")
    .optional(),
  rooms: z
    .array(roomAssessmentSchema)
    .min(1, "Add at least one room assessment")
    .max(50, "Maximum 50 rooms allowed"),
});

export type RoomComponentFormData = z.infer<typeof roomComponentSchema>;
export type RoomAssessmentFormData = z.infer<typeof roomAssessmentSchema>;
export type ConditionAssessmentFormData = z.infer<typeof conditionAssessmentSchema>;

// =============================================================================
// STEP 3: STRATEGY & GOALS SCHEMA
// =============================================================================

export const strategySchema = z.object({
  // Strategy Selection
  investment_strategy: z.enum(INVESTMENT_STRATEGIES, {
    errorMap: () => ({ message: "Please select an investment strategy" }),
  }),
  target_market: z.enum(TARGET_MARKETS, {
    errorMap: () => ({ message: "Please select a target market" }),
  }),
  design_style: z.enum(DESIGN_STYLES, {
    errorMap: () => ({ message: "Please select a design style" }),
  }),
  
  // Financial Goals
  arv: z.coerce
    .number()
    .min(0, "ARV cannot be negative")
    .max(100000000, "ARV seems too high"),
  max_budget: z.coerce
    .number()
    .min(0, "Budget cannot be negative")
    .max(10000000, "Budget seems too high"),
  target_roi_percentage: z.coerce
    .number()
    .min(0, "ROI cannot be negative")
    .max(500, "ROI percentage seems too high"),
  contingency_percentage: z.coerce
    .number()
    .min(0, "Contingency cannot be negative")
    .max(50, "Contingency should be 50% or less")
    .default(15),
  
  // Timeline (optional)
  start_date: z.string().optional(),
  target_completion_date: z.string().optional(),
});

export type StrategyFormData = z.infer<typeof strategySchema>;

// =============================================================================
// STEP 4: DESIGN INTELLIGENCE (minimal validation - existing UI)
// =============================================================================

export const designSelectionsSchema = z.object({
  // These are stored in separate tables, just tracking IDs
  selected_color_ids: z.array(z.string()).optional(),
  selected_material_ids: z.array(z.string()).optional(),
  moodboard_id: z.string().optional(),
});

export type DesignSelectionsFormData = z.infer<typeof designSelectionsSchema>;

// =============================================================================
// STEP 5: PRIORITY MATRIX / SCOPE ITEMS SCHEMA
// =============================================================================

export const scopeItemSchema = z.object({
  id: z.string().optional(),
  
  // Classification
  category: z.string().min(1, "Category is required"),
  subcategory: z.string().optional(),
  item_name: z.string().min(1, "Item name is required").max(200),
  description: z.string().max(1000).optional(),
  
  // Location
  room_type: z.enum(ROOM_TYPES).optional(),
  room_name: z.string().max(100).optional(),
  
  // Specifications
  quantity: z.coerce.number().min(0).default(1),
  unit_type: z.string().default("each"),
  quality_tier: z.enum(QUALITY_TIERS).default("standard"),
  
  // Costing
  cost_per_unit: z.coerce.number().min(0).optional(),
  labor_cost: z.coerce.number().min(0).optional(),
  material_cost: z.coerce.number().min(0).optional(),
  total_cost: z.coerce.number().min(0),
  
  // Prioritization
  priority: z.enum(PRIORITY_LEVELS).default("should"),
  urgency_score: z.coerce.number().min(0).max(100).default(50),
  roi_impact_score: z.coerce.number().min(0).max(100).default(50),
  buyer_appeal_score: z.coerce.number().min(0).max(100).default(50),
  
  // ROI
  estimated_value_add: z.coerce.number().min(0).optional(),
  
  // Timeline
  estimated_duration_days: z.coerce.number().min(0).max(365).default(1),
  
  // Status
  is_approved: z.boolean().default(false),
  is_included: z.boolean().default(true),
  
  // Dependencies
  depends_on: z.array(z.string()).optional().default([]),
});

export const priorityMatrixSchema = z.object({
  scope_items: z.array(scopeItemSchema),
});

export type ScopeItemFormData = z.infer<typeof scopeItemSchema>;
export type PriorityMatrixFormData = z.infer<typeof priorityMatrixSchema>;

// =============================================================================
// STEP 6: ACTION PLAN SCHEMA
// =============================================================================

export const actionPlanTaskSchema = z.object({
  id: z.string().optional(),
  scope_item_id: z.string().optional(),
  name: z.string(),
  assigned_vendor_id: z.string().optional(),
  phase: z.coerce.number().min(1).max(20).default(1),
  start_day: z.coerce.number().min(0).optional(),
  duration_days: z.coerce.number().min(1).default(1),
  depends_on: z.array(z.string()).optional(),
  // Manual scheduling overrides (for drag-and-drop editing)
  manual_start_date: z.string().optional(), // ISO date string
  manual_end_date: z.string().optional(), // ISO date string
  is_manually_scheduled: z.boolean().optional().default(false),
});

export const actionPlanSchema = z.object({
  tasks: z.array(actionPlanTaskSchema),
  total_duration_days: z.coerce.number().min(0).optional(),
  start_date: z.string().optional(),
  target_completion_date: z.string().optional(),
  // Track manual overrides separately for persistence
  manual_overrides: z
    .record(
      z.string(), // task ID
      z.object({
        start_date: z.string(),
        end_date: z.string(),
        modified_at: z.string().optional(),
      })
    )
    .optional(),
});

export type ActionPlanTaskFormData = z.infer<typeof actionPlanTaskSchema>;
export type ActionPlanFormData = z.infer<typeof actionPlanSchema>;

// =============================================================================
// STEP 7: REVIEW & FINAL SUBMISSION
// =============================================================================

export const finalReviewSchema = z.object({
  // Confirmation checkboxes
  confirm_details_accurate: z.boolean().refine((val) => val === true, {
    message: "Please confirm the details are accurate",
  }),
  confirm_budget_approved: z.boolean().refine((val) => val === true, {
    message: "Please confirm the budget is approved",
  }),
  
  // Optional notes
  final_notes: z.string().max(2000).optional(),
  
  // Project status on save
  status: z.enum(["draft", "planning", "active"]).default("planning"),

  // Scenario management (optional)
  scenarios: z.array(z.any()).optional(), // BudgetScenario[] - using any to avoid circular imports
  activeScenarioId: z.string().optional(),
});

export type FinalReviewFormData = z.infer<typeof finalReviewSchema>;

// =============================================================================
// COMBINED WIZARD DATA TYPE
// =============================================================================

export interface WizardData {
  step1?: Partial<PropertyDetailsFormData>;
  step2?: Partial<ConditionAssessmentFormData>;
  step3?: Partial<StrategyFormData>;
  step4?: Partial<DesignSelectionsFormData>;
  step5?: Partial<PriorityMatrixFormData>;
  step6?: Partial<ActionPlanFormData>;
  step7?: Partial<FinalReviewFormData>;
  currentStep: number;
  completedSteps: number[];
}

// =============================================================================
// UTILITY: Map wizard data to database insert format
// =============================================================================

export function mapWizardToProjectInsert(data: WizardData) {
  const step1 = data.step1 || {};
  const step2 = data.step2 || {};
  const step3 = data.step3 || {};

  return {
    // From Step 1
    project_name: step1.project_name,
    address_street: step1.address_street,
    address_city: step1.address_city,
    address_state: step1.address_state,
    address_zip: step1.address_zip,
    address_full: step1.address_street && step1.address_city && step1.address_state && step1.address_zip
      ? `${step1.address_street}, ${step1.address_city}, ${step1.address_state} ${step1.address_zip}`
      : undefined,
    property_type: step1.property_type,
    square_footage: step1.square_footage,
    lot_size_sqft: step1.lot_size_sqft,
    year_built: step1.year_built,
    bedrooms: step1.bedrooms,
    bathrooms: step1.bathrooms,
    purchase_price: step1.purchase_price,
    
    // From Step 2
    overall_condition: step2.overall_condition,
    condition_notes: step2.condition_notes,
    
    // From Step 3
    investment_strategy: step3.investment_strategy,
    target_market: step3.target_market,
    design_style: step3.design_style,
    arv: step3.arv,
    max_budget: step3.max_budget,
    rehab_budget: step3.max_budget, // Same as max_budget initially
    target_roi_percentage: step3.target_roi_percentage,
    contingency_percentage: step3.contingency_percentage,
    start_date: step3.start_date,
    target_completion_date: step3.target_completion_date,
    
    // Wizard progress
    current_step: data.currentStep,
    property_details_complete: data.completedSteps.includes(1),
    condition_assessment_complete: data.completedSteps.includes(2),
    strategy_goals_complete: data.completedSteps.includes(3),
    scope_building_complete: data.completedSteps.includes(5),
    priority_analysis_complete: data.completedSteps.includes(5),
    action_plan_complete: data.completedSteps.includes(6),
    final_review_complete: data.completedSteps.includes(7),
    
    // Default status
    status: "draft" as const,
  };
}
