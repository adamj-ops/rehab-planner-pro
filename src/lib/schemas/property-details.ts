import { z } from 'zod'

// ============================================================================
// Constants
// ============================================================================

export const US_STATES = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
] as const

export const PROPERTY_TYPES = [
  'single_family',
  'multi_family', 
  'condo',
  'townhouse'
] as const

export const PROJECT_TYPES = [
  'flip',
  'rental',
  'wholesale'
] as const

export const LOAN_TYPES = [
  'cash',
  'conventional',
  'hard_money'
] as const

// ============================================================================
// Sub-Schemas
// ============================================================================

/**
 * Address validation schema
 */
export const addressSchema = z.object({
  street: z
    .string()
    .min(1, 'Street address is required')
    .max(200, 'Street address is too long'),
  city: z
    .string()
    .min(1, 'City is required')
    .max(100, 'City name is too long'),
  state: z.enum(US_STATES, {
    errorMap: () => ({ message: 'Please select a valid US state' })
  }),
  zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Please enter a valid ZIP code (e.g., 78701 or 78701-1234)')
})

/**
 * Property specifications schema
 */
export const propertySpecsSchema = z.object({
  propertyType: z.enum(PROPERTY_TYPES, {
    errorMap: () => ({ message: 'Please select a property type' })
  }),
  yearBuilt: z
    .number()
    .int('Year must be a whole number')
    .min(1800, 'Year built must be after 1800')
    .max(new Date().getFullYear(), `Year built cannot be in the future`),
  squareFeet: z
    .number()
    .int('Square footage must be a whole number')
    .min(100, 'Square footage must be at least 100')
    .max(100000, 'Square footage seems too large'),
  lotSize: z
    .number()
    .int('Lot size must be a whole number')
    .min(0, 'Lot size cannot be negative')
    .max(10000000, 'Lot size seems too large')
    .optional()
    .default(0),
  bedrooms: z
    .number()
    .int('Bedrooms must be a whole number')
    .min(0, 'Bedrooms cannot be negative')
    .max(20, 'Maximum 20 bedrooms'),
  bathrooms: z
    .number()
    .min(0, 'Bathrooms cannot be negative')
    .max(20, 'Maximum 20 bathrooms')
    .multipleOf(0.5, 'Bathrooms must be in increments of 0.5'),
  garageSpaces: z
    .number()
    .int('Garage spaces must be a whole number')
    .min(0, 'Garage spaces cannot be negative')
    .max(10, 'Maximum 10 garage spaces')
    .optional()
    .default(0),
  stories: z
    .number()
    .int('Stories must be a whole number')
    .min(1, 'Must have at least 1 story')
    .max(10, 'Maximum 10 stories')
    .optional()
    .default(1)
})

/**
 * Financial inputs schema (purchase and ARV)
 */
export const financialInputsSchema = z.object({
  purchasePrice: z
    .number()
    .min(1, 'Purchase price is required')
    .max(100000000, 'Purchase price seems too high'),
  arv: z
    .number()
    .min(0, 'ARV cannot be negative')
    .max(100000000, 'ARV seems too high')
    .optional()
    .default(0),
  closingCostsPercent: z
    .number()
    .min(0, 'Closing costs cannot be negative')
    .max(20, 'Closing costs percentage seems too high')
    .optional()
    .default(3),
  sellingCostsPercent: z
    .number()
    .min(0, 'Selling costs cannot be negative')
    .max(15, 'Selling costs percentage seems too high')
    .optional()
    .default(6)
})

/**
 * Financing details schema
 */
export const financingSchema = z.object({
  loanType: z.enum(LOAN_TYPES, {
    errorMap: () => ({ message: 'Please select a loan type' })
  }).default('conventional'),
  downPaymentPercent: z
    .number()
    .min(0, 'Down payment cannot be negative')
    .max(100, 'Down payment cannot exceed 100%')
    .default(20),
  interestRate: z
    .number()
    .min(0, 'Interest rate cannot be negative')
    .max(30, 'Interest rate seems too high')
    .default(7),
  loanTermMonths: z
    .number()
    .int('Loan term must be a whole number')
    .min(1, 'Loan term must be at least 1 month')
    .max(360, 'Maximum loan term is 30 years')
    .default(12),
  points: z
    .number()
    .min(0, 'Points cannot be negative')
    .max(10, 'Points percentage seems too high')
    .default(0),
  holdingPeriodMonths: z
    .number()
    .int('Holding period must be a whole number')
    .min(1, 'Holding period must be at least 1 month')
    .max(60, 'Maximum holding period is 5 years')
    .default(6)
})

/**
 * Monthly holding costs schema
 */
export const holdingCostsSchema = z.object({
  propertyTaxesMonthly: z
    .number()
    .min(0, 'Property taxes cannot be negative')
    .max(50000, 'Monthly property taxes seem too high')
    .default(0),
  insuranceMonthly: z
    .number()
    .min(0, 'Insurance cannot be negative')
    .max(10000, 'Monthly insurance seems too high')
    .default(0),
  utilitiesMonthly: z
    .number()
    .min(0, 'Utilities cannot be negative')
    .max(5000, 'Monthly utilities seem too high')
    .default(0),
  hoaMonthly: z
    .number()
    .min(0, 'HOA fees cannot be negative')
    .max(5000, 'Monthly HOA fees seem too high')
    .optional()
    .default(0),
  maintenanceMonthly: z
    .number()
    .min(0, 'Maintenance cannot be negative')
    .max(5000, 'Monthly maintenance seems too high')
    .optional()
    .default(0)
})

// ============================================================================
// Combined Property Details Schema
// ============================================================================

/**
 * Complete property details form schema
 * Combines all sub-schemas with cross-field validations
 */
export const propertyDetailsSchema = z.object({
  // Project identification
  projectName: z
    .string()
    .min(1, 'Project name is required')
    .max(100, 'Project name is too long'),
  projectType: z.enum(PROJECT_TYPES, {
    errorMap: () => ({ message: 'Please select a project type' })
  }).default('flip'),
  
  // Address
  address: addressSchema,
  
  // Property specs
  ...propertySpecsSchema.shape,
  
  // Financial inputs
  ...financialInputsSchema.shape,
  
  // Financing
  financing: financingSchema.optional(),
  
  // Holding costs
  holdingCosts: holdingCostsSchema.optional()
}).refine(
  (data) => {
    // If ARV is provided, it should generally be higher than purchase price
    // This is a warning, not a hard error
    if (data.arv && data.arv > 0 && data.arv < data.purchasePrice) {
      return true // Still valid, but we'll show a warning in the UI
    }
    return true
  },
  {
    message: 'ARV is typically higher than purchase price for profitable deals',
    path: ['arv']
  }
)

// ============================================================================
// Type Exports
// ============================================================================

export type PropertyDetailsFormData = z.infer<typeof propertyDetailsSchema>
export type AddressData = z.infer<typeof addressSchema>
export type PropertySpecsData = z.infer<typeof propertySpecsSchema>
export type FinancialInputsData = z.infer<typeof financialInputsSchema>
export type FinancingData = z.infer<typeof financingSchema>
export type HoldingCostsData = z.infer<typeof holdingCostsSchema>

export type PropertyType = typeof PROPERTY_TYPES[number]
export type ProjectType = typeof PROJECT_TYPES[number]
export type LoanType = typeof LOAN_TYPES[number]
export type USState = typeof US_STATES[number]

// ============================================================================
// Default Values
// ============================================================================

export const defaultPropertyDetails: Partial<PropertyDetailsFormData> = {
  projectName: '',
  projectType: 'flip',
  address: {
    street: '',
    city: '',
    state: 'TX',
    zip: ''
  },
  propertyType: 'single_family',
  yearBuilt: 2000,
  squareFeet: 0,
  lotSize: 0,
  bedrooms: 3,
  bathrooms: 2,
  garageSpaces: 2,
  stories: 1,
  purchasePrice: 0,
  arv: 0,
  closingCostsPercent: 3,
  sellingCostsPercent: 6,
  financing: {
    loanType: 'conventional',
    downPaymentPercent: 20,
    interestRate: 7,
    loanTermMonths: 12,
    points: 0,
    holdingPeriodMonths: 6
  },
  holdingCosts: {
    propertyTaxesMonthly: 0,
    insuranceMonthly: 0,
    utilitiesMonthly: 0,
    hoaMonthly: 0,
    maintenanceMonthly: 0
  }
}

export const defaultFinancing: FinancingData = {
  loanType: 'conventional',
  downPaymentPercent: 20,
  interestRate: 7,
  loanTermMonths: 12,
  points: 0,
  holdingPeriodMonths: 6
}

export const defaultHoldingCosts: HoldingCostsData = {
  propertyTaxesMonthly: 0,
  insuranceMonthly: 0,
  utilitiesMonthly: 0,
  hoaMonthly: 0,
  maintenanceMonthly: 0
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Validates property details and returns typed errors
 */
export function validatePropertyDetails(data: unknown): {
  success: boolean
  data?: PropertyDetailsFormData
  errors?: z.ZodError
} {
  const result = propertyDetailsSchema.safeParse(data)
  
  if (result.success) {
    return { success: true, data: result.data }
  }
  
  return { success: false, errors: result.error }
}

/**
 * Get field-level error message
 */
export function getFieldError(errors: z.ZodError | undefined, path: string): string | undefined {
  if (!errors) return undefined
  
  const fieldError = errors.errors.find(
    (err) => err.path.join('.') === path
  )
  
  return fieldError?.message
}

/**
 * Check if ARV warning should be shown
 */
export function shouldShowArvWarning(purchasePrice: number, arv: number): boolean {
  return arv > 0 && arv < purchasePrice
}

/**
 * Loan type specific defaults
 */
export function getFinancingDefaults(loanType: LoanType): Partial<FinancingData> {
  switch (loanType) {
    case 'cash':
      return {
        downPaymentPercent: 100,
        interestRate: 0,
        loanTermMonths: 1,
        points: 0
      }
    case 'hard_money':
      return {
        downPaymentPercent: 20,
        interestRate: 12,
        loanTermMonths: 12,
        points: 2
      }
    case 'conventional':
    default:
      return {
        downPaymentPercent: 20,
        interestRate: 7,
        loanTermMonths: 360,
        points: 0
      }
  }
}
