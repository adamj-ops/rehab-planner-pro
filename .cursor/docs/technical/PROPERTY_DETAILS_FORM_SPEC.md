# Technical Specification: Property Details Form (Epic 2.2 / EVE-15)

## Overview

**Epic**: EVE-15 - Wizard Step 1: Property Details  
**Project**: Epic 2.2: Wizard Step 1 - Property Details  
**Priority**: 🔴 Urgent (MVP)  
**Estimated Effort**: ~4-6 hours  
**Last Updated**: December 28, 2025

The Property Details form is Step 1 of the 7-step project creation wizard. It captures essential property information including address, specifications, and financial details that drive all downstream calculations (ROI, scope, costs, timeline).

---

## Table of Contents

1. [User Story](#user-story)
2. [Acceptance Criteria](#acceptance-criteria)
3. [Form Sections & Fields](#form-sections--fields)
4. [Technical Architecture](#technical-architecture)
5. [Zod Schema](#zod-schema)
6. [Component Structure](#component-structure)
7. [Database Integration](#database-integration)
8. [UI/UX Specifications](#uiux-specifications)
9. [Implementation Order](#implementation-order)
10. [Testing Checklist](#testing-checklist)

---

## User Story

> As an investor/flipper, I want to quickly enter my property's basic details so I can start planning my renovation scope and budget.

---

## Acceptance Criteria

### Must Have (MVP)
- [ ] Visual property type selector with icons (Tabler)
- [ ] Complete address entry (street, city, state, zip)
- [ ] Property specifications (sqft, beds, baths, year built)
- [ ] Financial inputs (purchase price, ARV)
- [ ] Financing details (type, down payment %)
- [ ] Form validation with helpful error messages
- [ ] Debounced auto-save (500ms delay)
- [ ] Save & Continue → Step 2 transition
- [ ] Load existing draft on return

### Should Have
- [ ] Google Places address autocomplete
- [ ] Financial calculator tooltips (70% rule, etc.)
- [ ] Investment strategy selector

### Could Have
- [ ] Property photo upload
- [ ] MLS data pre-fill
- [ ] Neighborhood comp auto-fetch

---

## Form Sections & Fields

### Section 1: Property Location

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `address_street` | text | ✅ | min 5 chars | Google Places autocomplete (future) |
| `address_city` | text | ✅ | min 2 chars | Auto-filled from Places API |
| `address_state` | select | ✅ | 2-letter code | US states only (MVP) |
| `address_zip` | text | ✅ | 5 digits | Validates format |

### Section 2: Property Type

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `property_type` | visual-select | ✅ | enum | Icon-based selector |

**Property Type Options:**
```typescript
const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family', icon: 'IconHome' },
  { value: 'multi_family', label: 'Multi Family (2-4)', icon: 'IconBuilding' },
  { value: 'condo', label: 'Condo', icon: 'IconBuildingCommunity' },
  { value: 'townhouse', label: 'Townhouse', icon: 'IconBuildingEstate' },
  { value: 'apartment', label: 'Apartment (5+)', icon: 'IconBuildingSkyscraper' },
  { value: 'commercial', label: 'Commercial', icon: 'IconBuildingStore' },
] as const;
```

### Section 3: Property Specifications

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `square_feet` | number | ✅ | 100-50,000 | Comma formatting |
| `bedrooms` | number | ✅ | 1-20 | Whole numbers |
| `bathrooms` | number | ✅ | 1-15 | Allows .5 (half baths) |
| `year_built` | number | ✅ | 1800-current | 4-digit year |
| `stories` | number | ❌ | 1-5 | Optional |
| `lot_size_sqft` | number | ❌ | 0-1,000,000 | Optional |
| `garage_spaces` | number | ❌ | 0-10 | Optional |

### Section 4: Financial Details

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `purchase_price` | currency | ✅ | $1,000-$50M | Auto-format with $ and commas |
| `arv` | currency | ✅ | > purchase_price | After Repair Value |
| `neighborhood_comp_avg` | currency | ❌ | > 0 | Optional reference |

### Section 5: Financing Details

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `financing_type` | select | ✅ | enum | Affects calculations |
| `down_payment_percent` | number | ✅* | 0-100 | Required if not cash |
| `interest_rate` | number | ❌ | 0-30 | For loan types |
| `loan_term_months` | select | ❌ | enum | 6, 12, 24, 30 year options |

**Financing Type Options:**
```typescript
const FINANCING_TYPES = [
  { value: 'cash', label: 'All Cash', description: 'No financing needed' },
  { value: 'conventional', label: 'Conventional Loan', description: '20%+ down, lower rates' },
  { value: 'fha', label: 'FHA Loan', description: '3.5% min down, owner-occupy' },
  { value: 'hard_money', label: 'Hard Money', description: 'Fast, high interest' },
  { value: 'private', label: 'Private Lending', description: 'Flexible terms' },
  { value: 'heloc', label: 'HELOC', description: 'Home equity line' },
  { value: 'other', label: 'Other', description: 'Custom financing' },
] as const;
```

### Section 6: Investment Strategy

| Field | Type | Required | Validation | Notes |
|-------|------|----------|------------|-------|
| `investment_strategy` | select | ✅ | enum | Drives scope recommendations |
| `target_buyer` | select | ❌ | enum | Optional persona |
| `hold_period_months` | number | ❌ | 1-360 | For rentals |
| `target_roi` | number | ❌ | 0-1000 | Percentage |
| `max_budget` | currency | ❌ | > 0 | Optional constraint |

**Investment Strategy Options:**
```typescript
const INVESTMENT_STRATEGIES = [
  { value: 'flip', label: 'Fix & Flip', description: 'Buy, renovate, sell quickly' },
  { value: 'rental', label: 'Buy & Hold', description: 'Long-term rental income' },
  { value: 'brrrr', label: 'BRRRR', description: 'Buy, Rehab, Rent, Refinance, Repeat' },
  { value: 'wholetail', label: 'Wholetail', description: 'Light cosmetic, quick sale' },
  { value: 'airbnb', label: 'Short-Term Rental', description: 'Airbnb/VRBO' },
  { value: 'section8', label: 'Section 8', description: 'Guaranteed rental income' },
  { value: 'live_flip', label: 'Live-In Flip', description: 'Tax-advantaged sale' },
] as const;
```

---

## Technical Architecture

### File Structure

```
src/
├── app/(app)/wizard/step-1/
│   └── page.tsx                    # Page component (uses PropertyDetailsForm)
├── components/wizard/
│   ├── step-navigation.tsx         # ✅ EXISTS
│   ├── wizard-footer.tsx           # ✅ EXISTS  
│   └── property-details/
│       ├── index.ts                # Barrel export
│       ├── PropertyDetailsForm.tsx # Main form component
│       ├── AddressSection.tsx      # Address inputs
│       ├── PropertyTypeSelector.tsx # Visual icon selector
│       ├── PropertySpecsSection.tsx # Sqft, beds, baths, year
│       ├── FinancialSection.tsx    # Price, ARV inputs
│       ├── FinancingSection.tsx    # Loan details
│       ├── StrategySection.tsx     # Investment strategy
│       └── hooks/
│           ├── usePropertyDetailsForm.ts  # Form logic
│           └── useAutoSave.ts             # Debounced save
├── lib/
│   ├── schemas/
│   │   └── property-details.ts     # Zod schema
│   └── services/
│       └── places-service.ts       # Google Places API (future)
└── types/
    └── property-details.ts         # Form types
```

### Dependencies

```json
{
  "dependencies": {
    "react-hook-form": "^7.x",
    "zod": "^3.x",
    "@hookform/resolvers": "^3.x",
    "@tabler/icons-react": "^3.x"
  }
}
```

---

## Zod Schema

```typescript
// src/lib/schemas/property-details.ts

import { z } from 'zod';

// Enums
export const PropertyTypeEnum = z.enum([
  'single_family', 'multi_family', 'condo', 'townhouse', 
  'apartment', 'commercial'
]);

export const FinancingTypeEnum = z.enum([
  'cash', 'conventional', 'fha', 'hard_money', 
  'private', 'heloc', 'other'
]);

export const InvestmentStrategyEnum = z.enum([
  'flip', 'rental', 'brrrr', 'wholetail', 
  'airbnb', 'section8', 'live_flip'
]);

export const USStateEnum = z.enum([
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY', 'DC'
]);

// Main Schema
export const PropertyDetailsSchema = z.object({
  // Project Info
  project_name: z.string().max(100).optional(),
  
  // Address
  address_street: z
    .string()
    .min(5, 'Enter a valid street address')
    .max(200),
  address_city: z
    .string()
    .min(2, 'Enter a valid city')
    .max(100),
  address_state: USStateEnum,
  address_zip: z
    .string()
    .regex(/^\d{5}(-\d{4})?$/, 'Enter a valid ZIP code (e.g., 55401 or 55401-1234)'),
  
  // Property Type
  property_type: PropertyTypeEnum,
  
  // Specifications
  square_feet: z
    .number({ invalid_type_error: 'Enter square footage' })
    .min(100, 'Minimum 100 sq ft')
    .max(50000, 'Maximum 50,000 sq ft'),
  bedrooms: z
    .number({ invalid_type_error: 'Enter number of bedrooms' })
    .min(1, 'At least 1 bedroom')
    .max(20, 'Maximum 20 bedrooms')
    .int('Must be a whole number'),
  bathrooms: z
    .number({ invalid_type_error: 'Enter number of bathrooms' })
    .min(1, 'At least 1 bathroom')
    .max(15, 'Maximum 15 bathrooms')
    .multipleOf(0.5, 'Use .5 for half baths'),
  year_built: z
    .number({ invalid_type_error: 'Enter year built' })
    .min(1800, 'Year must be after 1800')
    .max(new Date().getFullYear(), 'Year cannot be in the future')
    .int('Must be a 4-digit year'),
  stories: z
    .number()
    .min(1)
    .max(5)
    .int()
    .optional()
    .nullable(),
  lot_size_sqft: z
    .number()
    .min(0)
    .max(1000000)
    .optional()
    .nullable(),
  garage_spaces: z
    .number()
    .min(0)
    .max(10)
    .int()
    .optional()
    .nullable(),
  
  // Financials
  purchase_price: z
    .number({ invalid_type_error: 'Enter purchase price' })
    .min(1000, 'Minimum $1,000')
    .max(50000000, 'Maximum $50M'),
  arv: z
    .number({ invalid_type_error: 'Enter After Repair Value (ARV)' })
    .min(1000, 'Minimum $1,000')
    .max(100000000, 'Maximum $100M'),
  neighborhood_comp_avg: z
    .number()
    .min(0)
    .optional()
    .nullable(),
  
  // Financing
  financing_type: FinancingTypeEnum.default('cash'),
  down_payment_percent: z
    .number()
    .min(0, 'Minimum 0%')
    .max(100, 'Maximum 100%')
    .optional()
    .nullable(),
  interest_rate: z
    .number()
    .min(0, 'Minimum 0%')
    .max(30, 'Maximum 30%')
    .optional()
    .nullable(),
  loan_term_months: z
    .number()
    .int()
    .optional()
    .nullable(),
  
  // Strategy
  investment_strategy: InvestmentStrategyEnum.default('flip'),
  target_buyer: z.string().optional().nullable(),
  hold_period_months: z
    .number()
    .min(1)
    .max(360)
    .int()
    .optional()
    .nullable(),
  target_roi: z
    .number()
    .min(0)
    .max(1000)
    .optional()
    .nullable(),
  max_budget: z
    .number()
    .min(0)
    .optional()
    .nullable(),
})
.refine(
  (data) => data.arv >= data.purchase_price,
  {
    message: 'ARV should typically be higher than purchase price',
    path: ['arv'],
  }
)
.refine(
  (data) => {
    if (data.financing_type !== 'cash' && !data.down_payment_percent) {
      return false;
    }
    return true;
  },
  {
    message: 'Down payment is required for loan financing',
    path: ['down_payment_percent'],
  }
);

export type PropertyDetailsFormData = z.infer<typeof PropertyDetailsSchema>;

// Default values for new projects
export const defaultPropertyDetails: Partial<PropertyDetailsFormData> = {
  property_type: 'single_family',
  financing_type: 'cash',
  investment_strategy: 'flip',
  bedrooms: 3,
  bathrooms: 2,
  stories: 1,
};
```

---

## Component Structure

### PropertyDetailsForm.tsx (Main Component)

```tsx
// src/components/wizard/property-details/PropertyDetailsForm.tsx

"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IconLoader2, IconArrowRight } from "@tabler/icons-react";

import { PropertyDetailsSchema, PropertyDetailsFormData, defaultPropertyDetails } from "@/lib/schemas/property-details";
import { AddressSection } from "./AddressSection";
import { PropertyTypeSelector } from "./PropertyTypeSelector";
import { PropertySpecsSection } from "./PropertySpecsSection";
import { FinancialSection } from "./FinancialSection";
import { FinancingSection } from "./FinancingSection";
import { StrategySection } from "./StrategySection";
import { useAutoSave } from "./hooks/useAutoSave";

interface PropertyDetailsFormProps {
  projectId?: string;
  initialData?: Partial<PropertyDetailsFormData>;
  onSubmit: (data: PropertyDetailsFormData) => Promise<void>;
  onAutoSave?: (data: Partial<PropertyDetailsFormData>) => Promise<void>;
}

export function PropertyDetailsForm({
  projectId,
  initialData,
  onSubmit,
  onAutoSave,
}: PropertyDetailsFormProps) {
  const form = useForm<PropertyDetailsFormData>({
    resolver: zodResolver(PropertyDetailsSchema),
    defaultValues: {
      ...defaultPropertyDetails,
      ...initialData,
    },
    mode: "onBlur", // Validate on blur for better UX
  });

  const { isSubmitting } = form.formState;

  // Auto-save hook
  useAutoSave({
    watch: form.watch,
    onSave: onAutoSave,
    debounceMs: 500,
    enabled: !!projectId,
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        {/* Section 1: Property Type */}
        <Card>
          <CardHeader>
            <CardTitle>Property Type</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertyTypeSelector control={form.control} />
          </CardContent>
        </Card>

        {/* Section 2: Address */}
        <Card>
          <CardHeader>
            <CardTitle>Property Address</CardTitle>
          </CardHeader>
          <CardContent>
            <AddressSection control={form.control} />
          </CardContent>
        </Card>

        {/* Section 3: Specifications */}
        <Card>
          <CardHeader>
            <CardTitle>Property Specifications</CardTitle>
          </CardHeader>
          <CardContent>
            <PropertySpecsSection control={form.control} />
          </CardContent>
        </Card>

        {/* Section 4: Financials */}
        <Card>
          <CardHeader>
            <CardTitle>Financial Details</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancialSection control={form.control} />
          </CardContent>
        </Card>

        {/* Section 5: Financing */}
        <Card>
          <CardHeader>
            <CardTitle>Financing</CardTitle>
          </CardHeader>
          <CardContent>
            <FinancingSection 
              control={form.control} 
              watch={form.watch}
            />
          </CardContent>
        </Card>

        {/* Section 6: Strategy */}
        <Card>
          <CardHeader>
            <CardTitle>Investment Strategy</CardTitle>
          </CardHeader>
          <CardContent>
            <StrategySection control={form.control} />
          </CardContent>
        </Card>

        {/* Submit Button */}
        <div className="flex justify-end">
          <Button type="submit" size="lg" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                Save & Continue
                <IconArrowRight className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
```

### PropertyTypeSelector.tsx (Visual Selector)

```tsx
// src/components/wizard/property-details/PropertyTypeSelector.tsx

"use client";

import { Control, Controller } from "react-hook-form";
import { cn } from "@/lib/utils";
import {
  IconHome,
  IconBuilding,
  IconBuildingCommunity,
  IconBuildingEstate,
  IconBuildingSkyscraper,
  IconBuildingStore,
} from "@tabler/icons-react";
import { PropertyDetailsFormData } from "@/lib/schemas/property-details";

const PROPERTY_TYPES = [
  { value: 'single_family', label: 'Single Family', icon: IconHome },
  { value: 'multi_family', label: 'Multi Family (2-4)', icon: IconBuilding },
  { value: 'condo', label: 'Condo', icon: IconBuildingCommunity },
  { value: 'townhouse', label: 'Townhouse', icon: IconBuildingEstate },
  { value: 'apartment', label: 'Apartment (5+)', icon: IconBuildingSkyscraper },
  { value: 'commercial', label: 'Commercial', icon: IconBuildingStore },
] as const;

interface PropertyTypeSelectorProps {
  control: Control<PropertyDetailsFormData>;
}

export function PropertyTypeSelector({ control }: PropertyTypeSelectorProps) {
  return (
    <Controller
      name="property_type"
      control={control}
      render={({ field, fieldState }) => (
        <div className="space-y-2">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {PROPERTY_TYPES.map(({ value, label, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => field.onChange(value)}
                className={cn(
                  "flex flex-col items-center justify-center p-4 rounded-lg border-2 transition-all",
                  "hover:border-primary/50 hover:bg-accent/50",
                  field.value === value
                    ? "border-primary bg-primary/10 ring-2 ring-primary/20"
                    : "border-border bg-card"
                )}
              >
                <Icon 
                  className={cn(
                    "h-8 w-8 mb-2",
                    field.value === value ? "text-primary" : "text-muted-foreground"
                  )} 
                />
                <span className={cn(
                  "text-sm font-medium text-center",
                  field.value === value ? "text-primary" : "text-foreground"
                )}>
                  {label}
                </span>
              </button>
            ))}
          </div>
          {fieldState.error && (
            <p className="text-sm text-destructive">
              {fieldState.error.message}
            </p>
          )}
        </div>
      )}
    />
  );
}
```

### useAutoSave Hook

```tsx
// src/components/wizard/property-details/hooks/useAutoSave.ts

import { useEffect, useRef, useCallback } from "react";
import { UseFormWatch } from "react-hook-form";
import { PropertyDetailsFormData } from "@/lib/schemas/property-details";

interface UseAutoSaveOptions {
  watch: UseFormWatch<PropertyDetailsFormData>;
  onSave?: (data: Partial<PropertyDetailsFormData>) => Promise<void>;
  debounceMs?: number;
  enabled?: boolean;
}

export function useAutoSave({
  watch,
  onSave,
  debounceMs = 500,
  enabled = true,
}: UseAutoSaveOptions) {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const previousDataRef = useRef<string | null>(null);

  const debouncedSave = useCallback(
    async (data: PropertyDetailsFormData) => {
      if (!onSave || !enabled) return;

      const dataString = JSON.stringify(data);
      
      // Skip if data hasn't changed
      if (dataString === previousDataRef.current) return;
      previousDataRef.current = dataString;

      try {
        await onSave(data);
      } catch (error) {
        console.error("Auto-save failed:", error);
      }
    },
    [onSave, enabled]
  );

  useEffect(() => {
    if (!enabled) return;

    const subscription = watch((data) => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      timeoutRef.current = setTimeout(() => {
        debouncedSave(data as PropertyDetailsFormData);
      }, debounceMs);
    });

    return () => {
      subscription.unsubscribe();
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [watch, debouncedSave, debounceMs, enabled]);
}
```

---

## Database Integration

### Mapping Form → Database

```typescript
// Form field → rehab_projects column mapping

const formToDatabase = {
  // Direct mappings
  project_name: 'project_name',
  address_street: 'address_street',
  address_city: 'address_city',
  address_state: 'address_state',
  address_zip: 'address_zip',
  property_type: 'property_type',
  square_feet: 'square_feet',
  bedrooms: 'bedrooms',
  bathrooms: 'bathrooms',
  year_built: 'year_built',
  purchase_price: 'purchase_price',
  arv: 'arv',
  neighborhood_comp_avg: 'neighborhood_comp_avg',
  investment_strategy: 'investment_strategy',
  target_buyer: 'target_buyer',
  hold_period_months: 'hold_period_months',
  target_roi: 'target_roi',
  max_budget: 'max_budget',
  
  // Fields not in current schema (need migration or store elsewhere)
  // financing_type: → add to schema or store in metadata
  // down_payment_percent: → add to schema
  // interest_rate: → add to schema
  // loan_term_months: → add to schema
  // stories: → add to schema
  // lot_size_sqft: → add to schema
  // garage_spaces: → add to schema
};
```

### Database Migration (if needed)

```sql
-- Add missing columns to rehab_projects
ALTER TABLE rehab_projects
ADD COLUMN IF NOT EXISTS financing_type TEXT DEFAULT 'cash',
ADD COLUMN IF NOT EXISTS down_payment_percent NUMERIC(5,2),
ADD COLUMN IF NOT EXISTS interest_rate NUMERIC(5,3),
ADD COLUMN IF NOT EXISTS loan_term_months INTEGER,
ADD COLUMN IF NOT EXISTS stories INTEGER,
ADD COLUMN IF NOT EXISTS lot_size_sqft INTEGER,
ADD COLUMN IF NOT EXISTS garage_spaces INTEGER;

-- Add constraint for financing_type
ALTER TABLE rehab_projects
ADD CONSTRAINT chk_financing_type 
CHECK (financing_type IN ('cash', 'conventional', 'fha', 'hard_money', 'private', 'heloc', 'other'));
```

---

## UI/UX Specifications

### Layout

```
┌─────────────────────────────────────────────────────────────┐
│ ◀ Dashboard                    Step 1 of 7                  │
│                                ●───○───○───○───○───○───○    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Property Type                                        │   │
│  │  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐       │   │
│  │  │ 🏠   │ │ 🏢   │ │ 🏘️   │ │ 🏗️   │ │ 🏬   │       │   │
│  │  │Single│ │Multi │ │Condo │ │Town  │ │Apt   │       │   │
│  │  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘       │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Property Address                                     │   │
│  │  ┌─────────────────────────────────────────────┐    │   │
│  │  │ 1234 Oak Street                              │    │   │
│  │  └─────────────────────────────────────────────┘    │   │
│  │  ┌───────────────┐ ┌──────┐ ┌──────────────────┐   │   │
│  │  │ Minneapolis   │ │ MN ▼ │ │ 55401            │   │   │
│  │  └───────────────┘ └──────┘ └──────────────────┘   │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Property Specifications                              │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐  │   │
│  │  │ 2,450    │ │ 3        │ │ 2.5      │ │ 1978   │  │   │
│  │  │ Sq Ft    │ │ Beds     │ │ Baths    │ │ Year   │  │   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Financial Details                                    │   │
│  │  ┌────────────────────┐ ┌────────────────────────┐  │   │
│  │  │ $ 250,000          │ │ $ 375,000              │  │   │
│  │  │ Purchase Price     │ │ After Repair Value     │  │   │
│  │  └────────────────────┘ └────────────────────────┘  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│                              ┌───────────────────────────┐ │
│                              │  Save & Continue →        │ │
│                              └───────────────────────────┘ │
└─────────────────────────────────────────────────────────────┘
```

### Theme Compliance (Mira)

- **Colors**: Use zinc base, blue primary (from globals.css OKLCH)
- **Fonts**: Roboto (UI), Roboto Mono (numbers/currency)
- **Radius**: 0.375rem (subtle)
- **Icons**: Tabler only (no Lucide)
- **Cards**: Background contrast (0.18 OKLCH dark mode)

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| Mobile (<640px) | Stack all fields, 1 column |
| Tablet (640-1024px) | 2 column grid |
| Desktop (>1024px) | 3-4 column grid where applicable |

---

## Implementation Order

### Phase 1: Foundation (EVE-29)
1. Create Zod schema in `src/lib/schemas/property-details.ts`
2. Create type definitions
3. Set up form with react-hook-form

### Phase 2: Visual Components (EVE-34, EVE-35, EVE-36)
1. PropertyTypeSelector (visual icon grid)
2. PropertySpecsSection (sqft, beds, baths, year)
3. FinancialSection (price, ARV)

### Phase 3: Additional Fields (EVE-38)
1. FinancingSection (type, down payment, rates)
2. Conditional validation logic

### Phase 4: Integration (EVE-42)
1. Assemble PropertyDetailsForm
2. Connect all sections
3. Wire up form state

### Phase 5: Auto-Save (EVE-30)
1. Implement useAutoSave hook
2. Test debouncing
3. Add visual indicator (saving...)

### Phase 6: Navigation (EVE-40)
1. Save & Continue handler
2. Navigate to Step 2
3. Handle errors

### Phase 7: Draft Loading (EVE-41)
1. Check for existing draft on mount
2. Populate form fields
3. Show "Draft loaded" toast

### Phase 8: Testing (EVE-43)
1. Unit tests for schema
2. Integration tests for form
3. E2E test for complete flow

---

## Testing Checklist

### Unit Tests
- [ ] Zod schema validates correct data
- [ ] Zod schema rejects invalid data with correct errors
- [ ] ARV >= purchase_price refinement works
- [ ] Down payment required for non-cash financing
- [ ] All enums validate correctly

### Integration Tests
- [ ] Form renders all sections
- [ ] Field validation shows errors on blur
- [ ] Form submission calls onSubmit with correct data
- [ ] Auto-save triggers after 500ms debounce
- [ ] Draft loading populates all fields

### E2E Tests
- [ ] Create new project → fills form → navigates to Step 2
- [ ] Return to draft → form pre-populated
- [ ] Validation errors prevent submission
- [ ] Network failure shows error toast
- [ ] Mobile responsive layout works

---

## Dependencies & Blockers

### Before Starting
- [ ] Database migration for new columns (financing_type, etc.)
- [ ] Confirm rehab_projects table is correct
- [ ] Google API key for Places (optional, can defer)

### External Dependencies
- Google Places API (optional for MVP)
- Supabase project configured
- Environment variables set

---

## References

- [Linear Issues](https://linear.app/everyday-co/project/epic-22-wizard-step-1-property-details)
- [Database Types](../../../src/types/database.ts)
- [Mira Theme](../../../src/app/globals.css)
- [Wizard Components](../../../src/components/wizard/)
