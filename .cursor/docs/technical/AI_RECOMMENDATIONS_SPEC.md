# AI Recommendations & Smart Scope Generation - Technical Specification

**Version**: 1.0.0  
**Last Updated**: December 28, 2025  
**Status**: Ready for Implementation  
**Epic**: Phase 2 - Core Business Logic  
**Priority**: 🚨 CORE DIFFERENTIATOR  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Data Flow](#data-flow)
4. [Recommendation Engine](#recommendation-engine)
5. [Smart Scope Generation](#smart-scope-generation)
6. [API Design](#api-design)
7. [Database Schema](#database-schema)
8. [Component Architecture](#component-architecture)
9. [Implementation Plan](#implementation-plan)
10. [Testing Strategy](#testing-strategy)

---

## 🎯 Overview

### Purpose

The AI Recommendations module is the **primary differentiator** of Rehab Estimator. No competitor offers AI-driven scope recommendations based on:

1. Property condition assessment data
2. Investment strategy selection
3. Target buyer persona
4. Market conditions and comparable sales
5. Budget constraints
6. ROI optimization goals

### Business Value

```
┌────────────────────────────────────────────────────────────────┐
│                    AI RECOMMENDATIONS VALUE                      │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. REDUCE ESTIMATION TIME                                       │
│     ├── Manual scope building: 2-4 hours                        │
│     └── With AI recommendations: 15-30 minutes                  │
│                                                                  │
│  2. IMPROVE ROI ACCURACY                                         │
│     ├── User estimates: ±30% variance                           │
│     └── AI-optimized scope: ±10% variance                       │
│                                                                  │
│  3. PREVENT COMMON MISTAKES                                      │
│     ├── Missing critical items (electrical, permits)            │
│     ├── Over-improving for market                               │
│     └── Under-budgeting contingency                             │
│                                                                  │
│  4. OPTIMIZE BUDGET ALLOCATION                                   │
│     ├── Prioritize high-ROI items                               │
│     └── Cut low-impact items when budget-constrained            │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🏗️ Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         AI RECOMMENDATIONS SYSTEM                         │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐ │
│  │   Client    │───▶│  API Route  │───▶│ AI Service  │───▶│  OpenAI   │ │
│  │   (React)   │    │ (Next.js)   │    │  (Server)   │    │    API    │ │
│  └─────────────┘    └─────────────┘    └─────────────┘    └───────────┘ │
│        ▲                   │                  │                          │
│        │                   ▼                  ▼                          │
│        │            ┌─────────────┐    ┌─────────────┐                   │
│        │            │  Supabase   │    │    Rule     │                   │
│        └────────────│  Database   │◀───│   Engine    │                   │
│                     └─────────────┘    └─────────────┘                   │
│                                                                           │
└─────────────────────────────────────────────────────────────────────────┘
```

### Hybrid Architecture (Rule-Based + AI)

We use a **hybrid approach** for reliability and cost optimization:

| Layer | Technology | Purpose | Fallback |
|-------|------------|---------|----------|
| **Layer 1** | Rule Engine | Deterministic recommendations | Primary |
| **Layer 2** | OpenAI GPT-4 | Complex contextual insights | Fallback to Layer 1 |
| **Layer 3** | Fine-tuned Model | Future: Domain-specific model | N/A |

```
┌────────────────────────────────────────────────────────────────┐
│                    RECOMMENDATION PIPELINE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Input Data                                                      │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    RULE ENGINE (Layer 1)                │    │
│  │  • Missing critical items detection                     │    │
│  │  • Budget constraint optimization                       │    │
│  │  • Strategy-specific recommendations                    │    │
│  │  • Dependency conflict resolution                       │    │
│  └────────────────────────────────────────────────────────┘    │
│     │                                                           │
│     ▼                                                           │
│  ┌────────────────────────────────────────────────────────┐    │
│  │                    AI ENHANCEMENT (Layer 2)             │    │
│  │  • Natural language explanations                        │    │
│  │  • Market context insights                              │    │
│  │  • Creative upgrade suggestions                         │    │
│  │  • Confidence scoring                                   │    │
│  └────────────────────────────────────────────────────────┘    │
│     │                                                           │
│     ▼                                                           │
│  Output: Ranked Recommendations with Explanations               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow

### Input Data Model

```typescript
// src/types/ai-recommendations.ts

export interface RecommendationInput {
  // Project context
  projectId: string;
  
  // Property data (from Step 1)
  property: {
    address: string;
    propertyType: PropertyType;
    squareFeet: number;
    yearBuilt: number;
    bedrooms: number;
    bathrooms: number;
  };
  
  // Condition assessment (from Step 2)
  assessment: {
    rooms: RoomAssessment[];
    overallCondition: ConditionRating;
    photos?: string[]; // URLs to uploaded photos
  };
  
  // Strategy & goals (from Step 3)
  strategy: {
    investmentType: InvestmentStrategy;
    targetBuyer: TargetBuyerPersona;
    targetROI: number;
    maxBudget: number;
    holdPeriodMonths: number;
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
  };
  
  // Financial context
  financials: {
    purchasePrice: number;
    arv: number;
    neighborhoodCompAvg: number;
    marketCondition: 'hot' | 'balanced' | 'slow';
  };
  
  // Current scope (for optimization)
  currentScope?: ScopeItem[];
}

export interface RoomAssessment {
  roomId: string;
  roomType: RoomType;
  roomName: string;
  overallCondition: ConditionRating;
  components: ComponentAssessment[];
  notes?: string;
  photoUrls?: string[];
}

export interface ComponentAssessment {
  componentType: ComponentType;
  condition: ConditionRating;
  actionNeeded: 'none' | 'repair' | 'replace' | 'upgrade';
  notes?: string;
}

export type ConditionRating = 1 | 2 | 3 | 4 | 5; // 1=Terrible, 5=Excellent

export type InvestmentStrategy = 
  | 'flip'
  | 'rental'
  | 'wholetail'
  | 'airbnb'
  | 'brrrr';

export type TargetBuyerPersona =
  | 'first_time_buyer'
  | 'move_up_buyer'
  | 'investor'
  | 'luxury_buyer'
  | 'young_professional'
  | 'family';

export type RoomType =
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'living_room'
  | 'dining_room'
  | 'basement'
  | 'garage'
  | 'exterior'
  | 'utility'
  | 'other';

export type ComponentType =
  | 'flooring'
  | 'walls'
  | 'ceiling'
  | 'electrical'
  | 'plumbing'
  | 'hvac'
  | 'windows'
  | 'doors'
  | 'cabinets'
  | 'countertops'
  | 'appliances'
  | 'fixtures'
  | 'roofing'
  | 'siding'
  | 'landscaping';
```

### Output Data Model

```typescript
// src/types/ai-recommendations.ts (continued)

export interface RecommendationOutput {
  // Unique identifier
  id: string;
  projectId: string;
  generatedAt: Date;
  
  // Recommendations array
  recommendations: Recommendation[];
  
  // Summary metrics
  summary: RecommendationSummary;
  
  // Generation metadata
  metadata: {
    rulesApplied: number;
    aiEnhanced: boolean;
    processingTimeMs: number;
    modelVersion: string;
  };
}

export interface Recommendation {
  id: string;
  
  // Recommendation type
  type: RecommendationType;
  
  // What the recommendation applies to
  target: {
    type: 'scope_item' | 'room' | 'category' | 'project';
    id?: string;
    name: string;
  };
  
  // The recommendation itself
  action: {
    verb: 'add' | 'remove' | 'upgrade' | 'downgrade' | 'bundle' | 'reschedule';
    description: string;
    shortTitle: string;
  };
  
  // Impact analysis
  impact: {
    costChange: number;         // +/- dollars
    roiChange: number;          // +/- percentage points
    timelineChange: number;     // +/- days
    riskChange: 'increase' | 'decrease' | 'neutral';
  };
  
  // Scoring
  confidence: number;           // 0.0 - 1.0
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Explanation
  reasoning: string;            // Human-readable explanation
  
  // Action buttons
  actions: RecommendationAction[];
  
  // Status
  status: 'pending' | 'accepted' | 'rejected' | 'deferred';
}

export type RecommendationType =
  | 'missing_critical'      // Critical item not in scope
  | 'cost_savings'          // Opportunity to reduce cost
  | 'roi_optimization'      // Upgrade that improves ROI
  | 'bundle_opportunity'    // Combine items for savings
  | 'timeline_conflict'     // Scheduling issue
  | 'dependency_warning'    // Missing dependency
  | 'market_insight'        // Market-specific advice
  | 'budget_alert';         // Budget constraint warning

export interface RecommendationAction {
  label: string;
  action: 'accept' | 'reject' | 'defer' | 'customize';
  payload?: Record<string, unknown>;
}

export interface RecommendationSummary {
  totalRecommendations: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  
  potentialSavings: number;
  potentialROIImprovement: number;
  
  byType: Record<RecommendationType, number>;
}
```

---

## 🧠 Recommendation Engine

### Rule-Based Engine (Layer 1)

The rule engine provides fast, deterministic recommendations:

```typescript
// src/lib/ai/rule-engine.ts

export interface Rule {
  id: string;
  name: string;
  category: RecommendationType;
  priority: number; // Higher = more important
  
  // Condition function
  condition: (input: RecommendationInput) => boolean;
  
  // Generate recommendation if condition is true
  generate: (input: RecommendationInput) => Recommendation | null;
}

// Example rules:

export const RECOMMENDATION_RULES: Rule[] = [
  // ═══════════════════════════════════════════════════════════════
  // MISSING CRITICAL ITEMS
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'missing_electrical_panel',
    name: 'Missing Electrical Panel Upgrade',
    category: 'missing_critical',
    priority: 100,
    condition: (input) => {
      const hasOldElectrical = input.assessment.rooms.some(room =>
        room.components.some(c => 
          c.componentType === 'electrical' && c.condition <= 2
        )
      );
      const hasElectricalInScope = input.currentScope?.some(item =>
        item.category === 'electrical' && item.subcategory === 'panel'
      );
      return hasOldElectrical && !hasElectricalInScope;
    },
    generate: (input) => ({
      id: generateId(),
      type: 'missing_critical',
      target: { type: 'category', name: 'Electrical' },
      action: {
        verb: 'add',
        shortTitle: 'Add Electrical Panel Upgrade',
        description: 'Property has outdated electrical with poor condition rating. Panel upgrade should be included for safety and insurance compliance.',
      },
      impact: {
        costChange: 3500,
        roiChange: 2.5,
        timelineChange: 3,
        riskChange: 'decrease',
      },
      confidence: 0.95,
      priority: 'critical',
      reasoning: 'Electrical systems rated 2 or below require attention. Buyers/inspectors will flag this, and it\'s a safety hazard. Including panel upgrade prevents deal-killing inspection items.',
      actions: [
        { label: 'Add to Scope', action: 'accept' },
        { label: 'Not Needed', action: 'reject' },
      ],
      status: 'pending',
    }),
  },
  
  {
    id: 'missing_curb_appeal',
    name: 'Missing Curb Appeal for Flip',
    category: 'missing_critical',
    priority: 90,
    condition: (input) => {
      const isFlip = input.strategy.investmentType === 'flip';
      const poorExterior = input.assessment.rooms.some(room =>
        room.roomType === 'exterior' && room.overallCondition <= 2
      );
      const hasExteriorInScope = input.currentScope?.some(item =>
        item.category === 'exterior' && ['landscaping', 'paint', 'siding'].includes(item.subcategory)
      );
      return isFlip && poorExterior && !hasExteriorInScope;
    },
    generate: (input) => ({
      id: generateId(),
      type: 'missing_critical',
      target: { type: 'category', name: 'Exterior' },
      action: {
        verb: 'add',
        shortTitle: 'Add Curb Appeal Package',
        description: 'Flip properties need strong first impressions. Exterior is rated poor but no curb appeal items in scope.',
      },
      impact: {
        costChange: 2500,
        roiChange: 8.0,
        timelineChange: 2,
        riskChange: 'decrease',
      },
      confidence: 0.92,
      priority: 'high',
      reasoning: 'Studies show curb appeal improvements return 100%+ ROI on flips. First impressions drive buyer offers. Landscaping, exterior paint, and front door update are high-impact, low-cost.',
      actions: [
        { label: 'Add Basic Package', action: 'accept', payload: { tier: 'standard' } },
        { label: 'Add Premium Package', action: 'accept', payload: { tier: 'premium' } },
        { label: 'Skip', action: 'reject' },
      ],
      status: 'pending',
    }),
  },
  
  // ═══════════════════════════════════════════════════════════════
  // COST SAVINGS OPPORTUNITIES
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'overbuilt_rental_kitchen',
    name: 'Over-Improved Kitchen for Rental',
    category: 'cost_savings',
    priority: 80,
    condition: (input) => {
      const isRental = input.strategy.investmentType === 'rental';
      const hasPremiumKitchen = input.currentScope?.some(item =>
        item.roomId && item.roomType === 'kitchen' && item.qualityTier === 'premium'
      );
      return isRental && hasPremiumKitchen;
    },
    generate: (input) => {
      const kitchenItems = input.currentScope?.filter(item =>
        item.roomType === 'kitchen' && item.qualityTier === 'premium'
      ) || [];
      const potentialSavings = kitchenItems.reduce((sum, item) => 
        sum + (item.cost * 0.4), 0
      );
      
      return {
        id: generateId(),
        type: 'cost_savings',
        target: { type: 'room', name: 'Kitchen' },
        action: {
          verb: 'downgrade',
          shortTitle: 'Downgrade Kitchen to Standard',
          description: `Premium kitchen finishes in rental property. Standard tier is more appropriate for the market and saves $${Math.round(potentialSavings).toLocaleString()}.`,
        },
        impact: {
          costChange: -potentialSavings,
          roiChange: 3.5,
          timelineChange: 0,
          riskChange: 'neutral',
        },
        confidence: 0.88,
        priority: 'medium',
        reasoning: 'Rental properties don\'t recoup premium finishes through higher rents. Tenants care about functionality, not luxury. Standard cabinets and laminate counters are durable and cost-effective.',
        actions: [
          { label: 'Downgrade All', action: 'accept' },
          { label: 'Keep Premium', action: 'reject' },
        ],
        status: 'pending',
      };
    },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // ROI OPTIMIZATION
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'bathroom_upgrade_opportunity',
    name: 'Bathroom Upgrade High ROI',
    category: 'roi_optimization',
    priority: 85,
    condition: (input) => {
      const isFlip = ['flip', 'wholetail'].includes(input.strategy.investmentType);
      const hasBathroomRepairs = input.currentScope?.some(item =>
        item.roomType === 'bathroom' && item.action === 'repair'
      );
      const hasSpace = (input.financials.arv - input.financials.purchasePrice - 
        (input.currentScope?.reduce((sum, i) => sum + i.cost, 0) || 0)) > 5000;
      
      return isFlip && hasBathroomRepairs && hasSpace;
    },
    generate: (input) => ({
      id: generateId(),
      type: 'roi_optimization',
      target: { type: 'room', name: 'Bathroom' },
      action: {
        verb: 'upgrade',
        shortTitle: 'Upgrade Bathroom Repairs to Full Reno',
        description: 'Bathroom repairs in scope. Full renovation has higher ROI for flip strategy.',
      },
      impact: {
        costChange: 4500,
        roiChange: 12.0,
        timelineChange: 5,
        riskChange: 'decrease',
      },
      confidence: 0.85,
      priority: 'high',
      reasoning: 'Bathroom renovations return 60-70% on flips. Replacing fixtures, vanity, and tile creates a "new bathroom" feel that commands premium offers. Partial repairs look unfinished.',
      actions: [
        { label: 'Upgrade to Full Reno', action: 'accept' },
        { label: 'Keep Repairs Only', action: 'reject' },
      ],
      status: 'pending',
    }),
  },
  
  // ═══════════════════════════════════════════════════════════════
  // BUNDLE OPPORTUNITIES
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'flooring_bundle',
    name: 'Flooring Bundle Discount',
    category: 'bundle_opportunity',
    priority: 70,
    condition: (input) => {
      const flooringItems = input.currentScope?.filter(item =>
        item.componentType === 'flooring'
      ) || [];
      return flooringItems.length >= 3;
    },
    generate: (input) => {
      const flooringItems = input.currentScope?.filter(item =>
        item.componentType === 'flooring'
      ) || [];
      const totalCost = flooringItems.reduce((sum, i) => sum + i.cost, 0);
      const savings = totalCost * 0.12; // 12% bundle discount
      
      return {
        id: generateId(),
        type: 'bundle_opportunity',
        target: { type: 'category', name: 'Flooring' },
        action: {
          verb: 'bundle',
          shortTitle: 'Bundle Flooring for 12% Savings',
          description: `${flooringItems.length} flooring items can be bundled for contractor discount.`,
        },
        impact: {
          costChange: -savings,
          roiChange: 1.5,
          timelineChange: -2,
          riskChange: 'neutral',
        },
        confidence: 0.90,
        priority: 'medium',
        reasoning: 'Contractors offer 10-15% discounts for whole-house flooring jobs. Single material type (LVP) across multiple rooms reduces waste and labor. Negotiate bundle pricing.',
        actions: [
          { label: 'Bundle Items', action: 'accept' },
          { label: 'Keep Separate', action: 'reject' },
        ],
        status: 'pending',
      };
    },
  },
  
  // ═══════════════════════════════════════════════════════════════
  // BUDGET ALERTS
  // ═══════════════════════════════════════════════════════════════
  
  {
    id: 'budget_exceeded',
    name: 'Budget Exceeded Warning',
    category: 'budget_alert',
    priority: 100,
    condition: (input) => {
      const totalCost = input.currentScope?.reduce((sum, i) => sum + i.cost, 0) || 0;
      return totalCost > input.strategy.maxBudget;
    },
    generate: (input) => {
      const totalCost = input.currentScope?.reduce((sum, i) => sum + i.cost, 0) || 0;
      const overAmount = totalCost - input.strategy.maxBudget;
      
      // Find low-priority items that could be cut
      const cuttableItems = input.currentScope
        ?.filter(item => item.priority === 'could' || item.priority === 'nice')
        .sort((a, b) => a.cost - b.cost) || [];
      
      return {
        id: generateId(),
        type: 'budget_alert',
        target: { type: 'project', name: 'Overall Budget' },
        action: {
          verb: 'remove',
          shortTitle: 'Budget Exceeded - Review Scope',
          description: `Scope is $${overAmount.toLocaleString()} over budget. Review optional items.`,
        },
        impact: {
          costChange: -overAmount,
          roiChange: 0,
          timelineChange: 0,
          riskChange: 'decrease',
        },
        confidence: 1.0,
        priority: 'critical',
        reasoning: `Total scope cost ($${totalCost.toLocaleString()}) exceeds maximum budget ($${input.strategy.maxBudget.toLocaleString()}). Consider removing ${cuttableItems.length} lower-priority items or downgrading quality tiers.`,
        actions: [
          { label: 'Auto-Optimize', action: 'accept' },
          { label: 'Review Manually', action: 'defer' },
        ],
        status: 'pending',
      };
    },
  },
];
```

### AI Enhancement Layer (Layer 2)

```typescript
// src/lib/ai/openai-service.ts

import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function enhanceRecommendations(
  input: RecommendationInput,
  ruleBasedRecommendations: Recommendation[]
): Promise<Recommendation[]> {
  const systemPrompt = `You are an expert real estate renovation advisor with 20+ years of experience in fix-and-flip, rental, and investment properties.

Your role is to review renovation scope recommendations and provide:
1. Enhanced explanations with market context
2. Creative suggestions the rule engine might have missed
3. Confidence scoring based on the specific property context
4. Warnings about common mistakes for this property type/strategy

Property Context:
- Type: ${input.property.propertyType}
- Year Built: ${input.property.yearBuilt}
- Location: ${input.property.address}
- Strategy: ${input.strategy.investmentType}
- Target Buyer: ${input.strategy.targetBuyer}
- Budget: $${input.strategy.maxBudget.toLocaleString()}
- ARV: $${input.financials.arv.toLocaleString()}

Respond in JSON format matching the Recommendation interface.`;

  const userPrompt = `Review these renovation recommendations and enhance them:

${JSON.stringify(ruleBasedRecommendations, null, 2)}

Room Assessments:
${JSON.stringify(input.assessment.rooms, null, 2)}

For each recommendation:
1. Enhance the "reasoning" field with market-specific insights
2. Adjust "confidence" based on property specifics
3. Add any missing critical recommendations
4. Flag any recommendations that might not apply to this specific property`;

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo-preview',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 4000,
    });

    const enhanced = JSON.parse(response.choices[0].message.content || '{}');
    return enhanced.recommendations || ruleBasedRecommendations;
  } catch (error) {
    console.error('OpenAI enhancement failed, using rule-based only:', error);
    return ruleBasedRecommendations;
  }
}

// Vision API for photo analysis (future enhancement)
export async function analyzePropertyPhotos(
  photoUrls: string[]
): Promise<PhotoAnalysis[]> {
  const analyses: PhotoAnalysis[] = [];
  
  for (const url of photoUrls.slice(0, 5)) { // Limit to 5 photos
    try {
      const response = await openai.chat.completions.create({
        model: 'gpt-4-vision-preview',
        messages: [
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text: 'Analyze this property photo for renovation needs. Identify: 1) Visible damage or wear, 2) Estimated condition (1-5), 3) Recommended repairs/upgrades, 4) Quality tier of existing finishes. Respond in JSON.',
              },
              {
                type: 'image_url',
                image_url: { url },
              },
            ],
          },
        ],
        max_tokens: 500,
      });
      
      analyses.push(JSON.parse(response.choices[0].message.content || '{}'));
    } catch (error) {
      console.error('Photo analysis failed:', error);
    }
  }
  
  return analyses;
}

interface PhotoAnalysis {
  photoUrl: string;
  roomType: RoomType;
  condition: ConditionRating;
  visibleIssues: string[];
  recommendations: string[];
  qualityTier: QualityTier;
}
```

---

## 🔮 Smart Scope Generation

### Auto-Generate Scope from Assessment

```typescript
// src/lib/ai/scope-generator.ts

export interface ScopeGeneratorConfig {
  strategy: InvestmentStrategy;
  targetBuyer: TargetBuyerPersona;
  maxBudget: number;
  qualityPreference: QualityTier;
  priorityFocus: 'roi' | 'speed' | 'quality' | 'balanced';
}

export async function generateSmartScope(
  input: RecommendationInput,
  config: ScopeGeneratorConfig
): Promise<GeneratedScope> {
  const scopeItems: ScopeItem[] = [];
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Convert assessments to scope items
  // ═══════════════════════════════════════════════════════════════
  
  for (const room of input.assessment.rooms) {
    for (const component of room.components) {
      if (component.actionNeeded !== 'none') {
        const item = await createScopeItemFromAssessment(
          room,
          component,
          config
        );
        scopeItems.push(item);
      }
    }
  }
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Apply strategy-specific additions
  // ═══════════════════════════════════════════════════════════════
  
  const strategyItems = getStrategySpecificItems(input, config);
  scopeItems.push(...strategyItems);
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Calculate costs and priorities
  // ═══════════════════════════════════════════════════════════════
  
  const pricedItems = await calculateItemCosts(scopeItems, input);
  const prioritizedItems = calculatePriorities(pricedItems, input);
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Budget optimization
  // ═══════════════════════════════════════════════════════════════
  
  const optimizedItems = optimizeForBudget(
    prioritizedItems,
    config.maxBudget,
    config.priorityFocus
  );
  
  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Generate summary
  // ═══════════════════════════════════════════════════════════════
  
  return {
    items: optimizedItems,
    summary: {
      totalCost: optimizedItems.reduce((sum, i) => sum + i.cost, 0),
      itemCount: optimizedItems.length,
      byCategory: groupByCategory(optimizedItems),
      byPriority: groupByPriority(optimizedItems),
      estimatedROI: calculateProjectedROI(optimizedItems, input),
      estimatedDays: calculateProjectDuration(optimizedItems),
    },
    recommendations: await generateRecommendations(input),
  };
}

// Strategy-specific item additions
function getStrategySpecificItems(
  input: RecommendationInput,
  config: ScopeGeneratorConfig
): ScopeItem[] {
  const items: ScopeItem[] = [];
  
  switch (input.strategy.investmentType) {
    case 'flip':
      // Flips always need staging consideration
      items.push({
        id: generateId(),
        name: 'Pre-Listing Deep Clean',
        category: 'general',
        subcategory: 'cleaning',
        cost: 500,
        priority: 'must',
        phase: 'finish',
      });
      
      // Curb appeal is critical for flips
      if (!input.currentScope?.some(i => i.category === 'exterior')) {
        items.push({
          id: generateId(),
          name: 'Basic Curb Appeal Package',
          category: 'exterior',
          subcategory: 'landscaping',
          cost: 1500,
          priority: 'should',
          phase: 'finish',
        });
      }
      break;
      
    case 'rental':
      // Rentals need durable, low-maintenance options
      items.push({
        id: generateId(),
        name: 'Smoke & CO Detectors (Code Compliance)',
        category: 'safety',
        subcategory: 'detectors',
        cost: 200,
        priority: 'must',
        phase: 'finish',
      });
      break;
      
    case 'airbnb':
      // Airbnb needs smart features
      items.push({
        id: generateId(),
        name: 'Smart Lock Installation',
        category: 'smart_home',
        subcategory: 'access',
        cost: 350,
        priority: 'must',
        phase: 'finish',
      });
      items.push({
        id: generateId(),
        name: 'WiFi Router Upgrade',
        category: 'smart_home',
        subcategory: 'network',
        cost: 200,
        priority: 'should',
        phase: 'finish',
      });
      break;
  }
  
  return items;
}

// Budget optimization algorithm
function optimizeForBudget(
  items: ScopeItem[],
  maxBudget: number,
  focus: 'roi' | 'speed' | 'quality' | 'balanced'
): ScopeItem[] {
  // Sort by priority and ROI
  const sorted = [...items].sort((a, b) => {
    const priorityOrder = { must: 0, should: 1, could: 2, nice: 3 };
    const priorityDiff = priorityOrder[a.priority] - priorityOrder[b.priority];
    if (priorityDiff !== 0) return priorityDiff;
    
    // Within same priority, sort by focus
    switch (focus) {
      case 'roi':
        return (b.roiImpact || 0) - (a.roiImpact || 0);
      case 'speed':
        return (a.duration || 0) - (b.duration || 0);
      case 'quality':
        return (b.qualityScore || 0) - (a.qualityScore || 0);
      default:
        return 0;
    }
  });
  
  // Include items until budget is reached
  const included: ScopeItem[] = [];
  let runningTotal = 0;
  
  for (const item of sorted) {
    if (item.priority === 'must') {
      // Must-haves are always included
      included.push(item);
      runningTotal += item.cost;
    } else if (runningTotal + item.cost <= maxBudget) {
      included.push(item);
      runningTotal += item.cost;
    }
  }
  
  return included;
}
```

---

## 🔌 API Design

### API Routes

```typescript
// src/app/api/ai/recommendations/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { generateRecommendations } from '@/lib/ai/recommendation-engine';
import { z } from 'zod';

const requestSchema = z.object({
  projectId: z.string().uuid(),
  includeAI: z.boolean().optional().default(true),
  focusAreas: z.array(z.enum([
    'missing_critical',
    'cost_savings',
    'roi_optimization',
    'bundle_opportunity',
    'timeline_conflict',
  ])).optional(),
});

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    
    // Verify authentication
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Parse and validate request
    const body = await request.json();
    const { projectId, includeAI, focusAreas } = requestSchema.parse(body);
    
    // Fetch project data
    const { data: project, error } = await supabase
      .from('projects')
      .select(`
        *,
        rooms:project_rooms(*),
        scope_items:project_scope_items(*)
      `)
      .eq('id', projectId)
      .eq('user_id', user.id)
      .single();
    
    if (error || !project) {
      return NextResponse.json(
        { error: 'Project not found' },
        { status: 404 }
      );
    }
    
    // Generate recommendations
    const startTime = Date.now();
    const recommendations = await generateRecommendations({
      project,
      includeAI,
      focusAreas,
    });
    const processingTime = Date.now() - startTime;
    
    // Store recommendations in database
    await supabase
      .from('ai_recommendations')
      .upsert({
        project_id: projectId,
        recommendations: recommendations.recommendations,
        summary: recommendations.summary,
        generated_at: new Date().toISOString(),
        processing_time_ms: processingTime,
        ai_enhanced: includeAI,
      });
    
    return NextResponse.json(recommendations);
    
  } catch (error) {
    console.error('Recommendation generation failed:', error);
    return NextResponse.json(
      { error: 'Failed to generate recommendations' },
      { status: 500 }
    );
  }
}
```

```typescript
// src/app/api/ai/recommendations/[id]/route.ts

// Accept/reject/defer recommendation
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { action, payload } = z.object({
    action: z.enum(['accept', 'reject', 'defer']),
    payload: z.record(z.unknown()).optional(),
  }).parse(body);
  
  // Update recommendation status
  const { error } = await supabase
    .from('ai_recommendation_actions')
    .insert({
      recommendation_id: params.id,
      action,
      payload,
      actioned_at: new Date().toISOString(),
    });
  
  if (action === 'accept' && payload) {
    // Apply the recommendation to the project scope
    await applyRecommendation(params.id, payload);
  }
  
  return NextResponse.json({ success: true });
}
```

```typescript
// src/app/api/ai/smart-scope/route.ts

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const body = await request.json();
  
  const { projectId, config } = z.object({
    projectId: z.string().uuid(),
    config: z.object({
      strategy: z.enum(['flip', 'rental', 'wholetail', 'airbnb', 'brrrr']),
      targetBuyer: z.string(),
      maxBudget: z.number().positive(),
      qualityPreference: z.enum(['budget', 'standard', 'premium', 'luxury']),
      priorityFocus: z.enum(['roi', 'speed', 'quality', 'balanced']),
    }),
  }).parse(body);
  
  const generatedScope = await generateSmartScope(projectId, config);
  
  return NextResponse.json(generatedScope);
}
```

---

## 💾 Database Schema

```sql
-- AI Recommendations Tables

-- Store generated recommendations
CREATE TABLE ai_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    recommendations JSONB NOT NULL DEFAULT '[]',
    summary JSONB NOT NULL DEFAULT '{}',
    generated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    processing_time_ms INTEGER,
    ai_enhanced BOOLEAN DEFAULT false,
    model_version TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast project lookups
CREATE INDEX idx_ai_recommendations_project ON ai_recommendations(project_id);
CREATE INDEX idx_ai_recommendations_generated ON ai_recommendations(generated_at DESC);

-- Store user actions on recommendations
CREATE TABLE ai_recommendation_actions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    recommendation_id UUID NOT NULL,
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL,
    action TEXT NOT NULL CHECK (action IN ('accept', 'reject', 'defer')),
    payload JSONB,
    actioned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    actioned_by UUID NOT NULL REFERENCES auth.users(id)
);

-- Index for analytics
CREATE INDEX idx_recommendation_actions_project ON ai_recommendation_actions(project_id);
CREATE INDEX idx_recommendation_actions_type ON ai_recommendation_actions(recommendation_type);

-- RLS Policies
ALTER TABLE ai_recommendations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_recommendation_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project recommendations"
    ON ai_recommendations FOR SELECT
    USING (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert recommendations for own projects"
    ON ai_recommendations FOR INSERT
    WITH CHECK (
        project_id IN (
            SELECT id FROM projects WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Users can action own project recommendations"
    ON ai_recommendation_actions FOR ALL
    USING (actioned_by = auth.uid());
```

---

## 🧩 Component Architecture

### File Structure

```
src/
├── lib/
│   └── ai/
│       ├── index.ts                    # Barrel export
│       ├── recommendation-engine.ts    # Main engine orchestrator
│       ├── rule-engine.ts              # Rule-based recommendations
│       ├── rules/
│       │   ├── missing-critical.ts     # Missing item rules
│       │   ├── cost-savings.ts         # Cost optimization rules
│       │   ├── roi-optimization.ts     # ROI improvement rules
│       │   ├── bundle-opportunities.ts # Bundle discount rules
│       │   └── budget-alerts.ts        # Budget warning rules
│       ├── openai-service.ts           # OpenAI API integration
│       ├── scope-generator.ts          # Smart scope generation
│       └── photo-analyzer.ts           # Vision API integration
│
├── components/
│   └── ai/
│       ├── RecommendationPanel.tsx     # Main recommendations UI
│       ├── RecommendationCard.tsx      # Single recommendation
│       ├── RecommendationBadge.tsx     # Priority/type badge
│       ├── RecommendationActions.tsx   # Accept/reject buttons
│       ├── SmartScopeWizard.tsx        # Auto-generate scope UI
│       └── AIInsightsSidebar.tsx       # Persistent insights panel
│
├── hooks/
│   └── use-recommendations.ts          # React Query hook
│
└── app/
    └── api/
        └── ai/
            ├── recommendations/
            │   ├── route.ts            # Generate recommendations
            │   └── [id]/route.ts       # Action on recommendation
            └── smart-scope/
                └── route.ts            # Generate smart scope
```

### React Components

```tsx
// src/components/ai/RecommendationPanel.tsx

'use client';

import { useState } from 'react';
import { useRecommendations } from '@/hooks/use-recommendations';
import { RecommendationCard } from './RecommendationCard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  IconSparkles, 
  IconRefresh,
  IconAlertTriangle,
  IconPigMoney,
  IconTrendingUp,
  IconStack,
} from '@tabler/icons-react';
import type { Recommendation, RecommendationType } from '@/types/ai-recommendations';

interface RecommendationPanelProps {
  projectId: string;
  onApply: (recommendation: Recommendation) => void;
}

const TYPE_ICONS: Record<RecommendationType, React.ReactNode> = {
  missing_critical: <IconAlertTriangle className="h-4 w-4" />,
  cost_savings: <IconPigMoney className="h-4 w-4" />,
  roi_optimization: <IconTrendingUp className="h-4 w-4" />,
  bundle_opportunity: <IconStack className="h-4 w-4" />,
  timeline_conflict: <IconAlertTriangle className="h-4 w-4" />,
  dependency_warning: <IconAlertTriangle className="h-4 w-4" />,
  market_insight: <IconSparkles className="h-4 w-4" />,
  budget_alert: <IconAlertTriangle className="h-4 w-4" />,
};

export function RecommendationPanel({ 
  projectId, 
  onApply 
}: RecommendationPanelProps) {
  const [activeTab, setActiveTab] = useState<'all' | RecommendationType>('all');
  
  const {
    recommendations,
    summary,
    isLoading,
    isRefreshing,
    refresh,
    acceptRecommendation,
    rejectRecommendation,
  } = useRecommendations(projectId);
  
  if (isLoading) {
    return <RecommendationPanelSkeleton />;
  }
  
  const filteredRecommendations = activeTab === 'all'
    ? recommendations
    : recommendations.filter(r => r.type === activeTab);
  
  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <div className="flex items-center gap-2">
          <IconSparkles className="h-5 w-5 text-primary" />
          <h2 className="font-semibold">AI Recommendations</h2>
          <Badge variant="secondary">
            {recommendations.length}
          </Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={refresh}
          disabled={isRefreshing}
        >
          <IconRefresh className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
        </Button>
      </div>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-4 gap-2 p-4 border-b bg-muted/50">
        <SummaryCard
          label="Potential Savings"
          value={`$${summary.potentialSavings.toLocaleString()}`}
          color="green"
        />
        <SummaryCard
          label="ROI Boost"
          value={`+${summary.potentialROIImprovement.toFixed(1)}%`}
          color="blue"
        />
        <SummaryCard
          label="Critical"
          value={summary.criticalCount.toString()}
          color="red"
        />
        <SummaryCard
          label="Pending"
          value={recommendations.filter(r => r.status === 'pending').length.toString()}
          color="yellow"
        />
      </div>
      
      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
        <TabsList className="w-full justify-start p-2 bg-transparent border-b">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="missing_critical">
            <IconAlertTriangle className="h-3 w-3 mr-1" />
            Critical
          </TabsTrigger>
          <TabsTrigger value="cost_savings">
            <IconPigMoney className="h-3 w-3 mr-1" />
            Savings
          </TabsTrigger>
          <TabsTrigger value="roi_optimization">
            <IconTrendingUp className="h-3 w-3 mr-1" />
            ROI
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value={activeTab} className="flex-1 overflow-y-auto p-4">
          <div className="space-y-3">
            {filteredRecommendations.map((rec) => (
              <RecommendationCard
                key={rec.id}
                recommendation={rec}
                onAccept={() => {
                  acceptRecommendation(rec.id);
                  onApply(rec);
                }}
                onReject={() => rejectRecommendation(rec.id)}
              />
            ))}
            
            {filteredRecommendations.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                <IconSparkles className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No recommendations in this category</p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
```

```tsx
// src/components/ai/RecommendationCard.tsx

'use client';

import { useState } from 'react';
import { Card, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Collapsible, 
  CollapsibleContent, 
  CollapsibleTrigger 
} from '@/components/ui/collapsible';
import { 
  IconChevronDown, 
  IconCheck, 
  IconX,
  IconArrowUp,
  IconArrowDown,
  IconClock,
} from '@tabler/icons-react';
import type { Recommendation } from '@/types/ai-recommendations';

interface RecommendationCardProps {
  recommendation: Recommendation;
  onAccept: () => void;
  onReject: () => void;
}

const PRIORITY_COLORS = {
  critical: 'bg-red-500',
  high: 'bg-orange-500',
  medium: 'bg-yellow-500',
  low: 'bg-green-500',
};

export function RecommendationCard({
  recommendation,
  onAccept,
  onReject,
}: RecommendationCardProps) {
  const [isOpen, setIsOpen] = useState(false);
  
  return (
    <Card className={`
      border-l-4 
      ${recommendation.priority === 'critical' ? 'border-l-red-500' : ''}
      ${recommendation.priority === 'high' ? 'border-l-orange-500' : ''}
      ${recommendation.priority === 'medium' ? 'border-l-yellow-500' : ''}
      ${recommendation.priority === 'low' ? 'border-l-green-500' : ''}
      ${recommendation.status !== 'pending' ? 'opacity-60' : ''}
    `}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardContent className="p-4">
          {/* Header */}
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge 
                  variant="outline" 
                  className={`text-xs ${PRIORITY_COLORS[recommendation.priority]} text-white border-0`}
                >
                  {recommendation.priority}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  {Math.round(recommendation.confidence * 100)}% confidence
                </span>
              </div>
              <h4 className="font-medium">{recommendation.action.shortTitle}</h4>
              <p className="text-sm text-muted-foreground mt-1">
                {recommendation.action.description}
              </p>
            </div>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm">
                <IconChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
              </Button>
            </CollapsibleTrigger>
          </div>
          
          {/* Impact Summary */}
          <div className="flex gap-4 mt-3 text-sm">
            <div className="flex items-center gap-1">
              {recommendation.impact.costChange >= 0 ? (
                <IconArrowUp className="h-3 w-3 text-red-500" />
              ) : (
                <IconArrowDown className="h-3 w-3 text-green-500" />
              )}
              <span className={recommendation.impact.costChange >= 0 ? 'text-red-600' : 'text-green-600'}>
                ${Math.abs(recommendation.impact.costChange).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <IconTrendingUp className="h-3 w-3 text-blue-500" />
              <span className="text-blue-600">
                {recommendation.impact.roiChange >= 0 ? '+' : ''}
                {recommendation.impact.roiChange.toFixed(1)}% ROI
              </span>
            </div>
            {recommendation.impact.timelineChange !== 0 && (
              <div className="flex items-center gap-1">
                <IconClock className="h-3 w-3 text-gray-500" />
                <span className="text-gray-600">
                  {recommendation.impact.timelineChange >= 0 ? '+' : ''}
                  {recommendation.impact.timelineChange} days
                </span>
              </div>
            )}
          </div>
        </CardContent>
        
        <CollapsibleContent>
          <div className="px-4 pb-4">
            <div className="bg-muted rounded-lg p-3 text-sm">
              <h5 className="font-medium mb-1">Why this recommendation?</h5>
              <p className="text-muted-foreground">
                {recommendation.reasoning}
              </p>
            </div>
          </div>
        </CollapsibleContent>
        
        {recommendation.status === 'pending' && (
          <CardFooter className="p-4 pt-0 gap-2">
            <Button 
              size="sm" 
              className="flex-1"
              onClick={onAccept}
            >
              <IconCheck className="h-4 w-4 mr-1" />
              Apply
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={onReject}
            >
              <IconX className="h-4 w-4" />
            </Button>
          </CardFooter>
        )}
      </Collapsible>
    </Card>
  );
}
```

---

## 📅 Implementation Plan

### Phase 1: Rule Engine Foundation (3-4 days)

| Task | Description | Est. |
|------|-------------|------|
| Create type definitions | TypeScript interfaces for all data structures | 2h |
| Implement base rule engine | Rule registration, execution, and prioritization | 4h |
| Create missing critical rules | Electrical, plumbing, HVAC, permits | 4h |
| Create cost savings rules | Downgrade opportunities, bundle detection | 4h |
| Create ROI optimization rules | Upgrade recommendations, strategy-specific | 4h |
| Build recommendation API route | POST /api/ai/recommendations | 3h |
| Create database tables | ai_recommendations, ai_recommendation_actions | 2h |

### Phase 2: UI Components (2-3 days)

| Task | Description | Est. |
|------|-------------|------|
| RecommendationPanel | Main container with tabs and summary | 4h |
| RecommendationCard | Individual recommendation display | 3h |
| useRecommendations hook | React Query integration | 2h |
| Integrate into Step 4 | Add panel to Scope Building page | 2h |
| Accept/reject actions | Apply recommendations to scope | 3h |

### Phase 3: OpenAI Integration (2-3 days)

| Task | Description | Est. |
|------|-------------|------|
| OpenAI service setup | API client, error handling, rate limiting | 3h |
| Enhancement prompts | System prompts for recommendation enhancement | 4h |
| Fallback handling | Graceful degradation when API fails | 2h |
| Photo analysis (optional) | Vision API for property photos | 4h |

### Phase 4: Smart Scope Generation (2 days)

| Task | Description | Est. |
|------|-------------|------|
| Scope generator service | Auto-generate scope from assessment | 4h |
| Budget optimizer | Fit scope to budget constraints | 3h |
| SmartScopeWizard UI | Configuration and preview | 4h |
| Integration with Step 4 | "Auto-Generate" button | 2h |

### Phase 5: Testing & Polish (2 days)

| Task | Description | Est. |
|------|-------------|------|
| Unit tests for rules | Test each rule condition and generation | 4h |
| Integration tests | End-to-end recommendation flow | 3h |
| Performance optimization | Caching, memoization | 2h |
| Documentation | Usage guide, rule authoring | 2h |

**Total Estimated Time: 12-14 days**

---

## 🧪 Testing Strategy

### Unit Tests

```typescript
// src/lib/ai/__tests__/rule-engine.test.ts

import { describe, it, expect } from 'vitest';
import { executeRules } from '../rule-engine';
import { RECOMMENDATION_RULES } from '../rules';

describe('Rule Engine', () => {
  describe('missing_electrical_panel', () => {
    it('should recommend electrical upgrade when condition is poor', () => {
      const input = {
        assessment: {
          rooms: [{
            roomId: '1',
            roomType: 'utility',
            components: [{
              componentType: 'electrical',
              condition: 2,
              actionNeeded: 'replace',
            }],
          }],
        },
        currentScope: [],
      };
      
      const recommendations = executeRules(input, RECOMMENDATION_RULES);
      
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'missing_critical',
          target: expect.objectContaining({ name: 'Electrical' }),
        })
      );
    });
    
    it('should not recommend if electrical already in scope', () => {
      const input = {
        assessment: {
          rooms: [{
            roomId: '1',
            roomType: 'utility',
            components: [{
              componentType: 'electrical',
              condition: 2,
            }],
          }],
        },
        currentScope: [{
          category: 'electrical',
          subcategory: 'panel',
        }],
      };
      
      const recommendations = executeRules(input, RECOMMENDATION_RULES);
      
      expect(recommendations).not.toContainEqual(
        expect.objectContaining({
          type: 'missing_critical',
          target: expect.objectContaining({ name: 'Electrical' }),
        })
      );
    });
  });
  
  describe('budget_exceeded', () => {
    it('should alert when scope exceeds max budget', () => {
      const input = {
        strategy: { maxBudget: 50000 },
        currentScope: [
          { cost: 30000 },
          { cost: 25000 },
        ],
      };
      
      const recommendations = executeRules(input, RECOMMENDATION_RULES);
      
      expect(recommendations).toContainEqual(
        expect.objectContaining({
          type: 'budget_alert',
          priority: 'critical',
        })
      );
    });
  });
});
```

### Integration Tests

```typescript
// src/app/api/ai/recommendations/__tests__/route.test.ts

import { describe, it, expect, beforeEach } from 'vitest';
import { POST } from '../route';
import { createMockRequest } from '@/lib/test-utils';

describe('POST /api/ai/recommendations', () => {
  beforeEach(async () => {
    // Setup test project in database
  });
  
  it('should generate recommendations for valid project', async () => {
    const request = createMockRequest({
      method: 'POST',
      body: { projectId: 'test-project-id' },
    });
    
    const response = await POST(request);
    const data = await response.json();
    
    expect(response.status).toBe(200);
    expect(data.recommendations).toBeInstanceOf(Array);
    expect(data.summary).toHaveProperty('totalRecommendations');
  });
  
  it('should return 401 for unauthenticated requests', async () => {
    // ... test implementation
  });
  
  it('should return 404 for non-existent project', async () => {
    // ... test implementation
  });
});
```

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Recommendation acceptance rate | > 40% | Track accepts vs rejects |
| Time to generate | < 2 seconds | API response time |
| Rule coverage | 100% of PRD scenarios | Audit against PRD |
| AI enhancement success rate | > 95% | OpenAI API success rate |
| User satisfaction | > 4.0/5.0 | In-app feedback |

---

## 🔗 Related Documentation

- [Property Details Form Spec](./PROPERTY_DETAILS_FORM_SPEC.md)
- [PRD - AI Recommendations Module](../PRD.md#8-ai-recommendations-module)
- [Cost Calculator Spec](./COST_CALCULATOR_SPEC.md) (to be created)
- [Scope Building Spec](./SCOPE_BUILDING_SPEC.md) (to be created)
