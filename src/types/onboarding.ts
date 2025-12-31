// ============================================================================
// ONBOARDING TYPE DEFINITIONS
// ============================================================================

/**
 * Investor experience level
 */
export type InvestorType = "beginner" | "experienced" | "professional";

/**
 * Primary investment strategy
 */
export type InvestmentStrategy = "fix_flip" | "brrrr" | "buy_hold" | "wholesale";

/**
 * Property types that an investor focuses on
 */
export type PropertyType = "single_family" | "multi_family" | "commercial" | "mixed";

/**
 * Typical project budget range
 */
export type TypicalBudget = "under_50k" | "50_150k" | "150_300k" | "300k_plus";

/**
 * Number of projects managed per year
 */
export type ProjectsPerYear = "1_2" | "3_5" | "6_10" | "10_plus";

/**
 * Onboarding step numbers
 */
export type OnboardingStep = 1 | 2 | 3 | 4 | 5 | 6;

/**
 * Complete onboarding data collected across all steps
 */
export interface OnboardingData {
  // Step 1: Investor Type
  investorType: InvestorType | null;
  
  // Step 2: Investment Strategy
  investmentStrategy: InvestmentStrategy | null;
  
  // Step 3: Property Types (multi-select)
  propertyTypes: PropertyType[];
  
  // Step 4: Typical Budget
  typicalBudget: TypicalBudget | null;
  
  // Step 5: Projects Per Year
  projectsPerYear: ProjectsPerYear | null;
  
  // Step 6: Profile Completion
  firstName: string;
  lastName: string;
  company: string;
  phone: string;
  city: string;
  state: string;
}

/**
 * Default/initial onboarding data
 */
export const defaultOnboardingData: OnboardingData = {
  investorType: null,
  investmentStrategy: null,
  propertyTypes: [],
  typicalBudget: null,
  projectsPerYear: null,
  firstName: "",
  lastName: "",
  company: "",
  phone: "",
  city: "",
  state: "",
};

/**
 * Onboarding status for a user
 */
export interface OnboardingStatus {
  completed: boolean;
  completedAt: string | null;
  currentStep: OnboardingStep | null;
}

/**
 * Selection option for onboarding cards
 */
export interface SelectionOption<T = string> {
  value: T;
  label: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
}

/**
 * Investor type options for Step 1
 */
export const investorTypeOptions: SelectionOption<InvestorType>[] = [
  {
    value: "beginner",
    label: "Beginner",
    description: "New to real estate investing",
  },
  {
    value: "experienced",
    label: "Experienced",
    description: "1-5 years of experience",
  },
  {
    value: "professional",
    label: "Professional",
    description: "5+ years, full-time investor",
  },
];

/**
 * Investment strategy options for Step 2
 */
export const investmentStrategyOptions: SelectionOption<InvestmentStrategy>[] = [
  {
    value: "fix_flip",
    label: "Fix & Flip",
    description: "Buy, renovate, sell quickly",
  },
  {
    value: "brrrr",
    label: "BRRRR",
    description: "Buy, Rehab, Rent, Refinance, Repeat",
  },
  {
    value: "buy_hold",
    label: "Buy & Hold",
    description: "Long-term rental properties",
  },
  {
    value: "wholesale",
    label: "Wholesale",
    description: "Find deals for other investors",
  },
];

/**
 * Property type options for Step 3
 */
export const propertyTypeOptions: SelectionOption<PropertyType>[] = [
  {
    value: "single_family",
    label: "Single Family",
    description: "Houses, townhomes",
  },
  {
    value: "multi_family",
    label: "Multi-Family",
    description: "Duplexes, triplexes, apartments",
  },
  {
    value: "commercial",
    label: "Commercial",
    description: "Retail, office, industrial",
  },
  {
    value: "mixed",
    label: "Mixed Use",
    description: "Multiple property types",
  },
];

/**
 * Budget options for Step 4
 */
export const typicalBudgetOptions: SelectionOption<TypicalBudget>[] = [
  {
    value: "under_50k",
    label: "Under $50K",
    description: "Small-scale renovations",
  },
  {
    value: "50_150k",
    label: "$50K - $150K",
    description: "Mid-range projects",
  },
  {
    value: "150_300k",
    label: "$150K - $300K",
    description: "Large renovations",
  },
  {
    value: "300k_plus",
    label: "$300K+",
    description: "Major rehabs",
  },
];

/**
 * Projects per year options for Step 5
 */
export const projectsPerYearOptions: SelectionOption<ProjectsPerYear>[] = [
  {
    value: "1_2",
    label: "1-2 projects",
    description: "Part-time investor",
  },
  {
    value: "3_5",
    label: "3-5 projects",
    description: "Active investor",
  },
  {
    value: "6_10",
    label: "6-10 projects",
    description: "Very active",
  },
  {
    value: "10_plus",
    label: "10+ projects",
    description: "Full-time professional",
  },
];

/**
 * Step configuration for progress stepper
 */
export interface OnboardingStepConfig {
  step: OnboardingStep;
  title: string;
  description: string;
}

export const onboardingSteps: OnboardingStepConfig[] = [
  { step: 1, title: "Investor Type", description: "Your experience level" },
  { step: 2, title: "Strategy", description: "Investment approach" },
  { step: 3, title: "Properties", description: "Property types" },
  { step: 4, title: "Budget", description: "Typical project budget" },
  { step: 5, title: "Volume", description: "Projects per year" },
  { step: 6, title: "Profile", description: "Complete your profile" },
];
