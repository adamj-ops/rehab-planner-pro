/**
 * Scope Recommendations Engine
 * 
 * Rule-based recommendation system for renovation scope items.
 * Recommends items based on:
 * - Room conditions from Step 2
 * - Investment strategy from Step 3
 * - Target buyer from Step 3
 * - Budget constraints
 */

// =============================================================================
// TYPES
// =============================================================================

type InvestmentStrategy = 'flip' | 'rental' | 'wholesale';
type TargetMarket = 'first_time_buyer' | 'move_up' | 'investor' | 'luxury';
type ConditionLevel = 'excellent' | 'good' | 'fair' | 'poor' | 'gut_needed';

interface RoomCondition {
  room_type: string;
  overall_condition?: ConditionLevel;
  needs_renovation: boolean;
  components?: Record<string, {
    rating: number;
    action: string;
  }>;
}

interface RecommendationContext {
  strategy: InvestmentStrategy;
  targetMarket: TargetMarket;
  rooms: RoomCondition[];
  budget?: number;
  propertyType?: string;
}

interface ScopeRecommendation {
  itemId: string;
  itemName: string;
  category: string;
  priority: 'must' | 'should' | 'could' | 'nice';
  score: number;
  reasons: string[];
  estimatedCost: number;
  expectedROI: number;
}

// =============================================================================
// RECOMMENDATION RULES
// =============================================================================

interface RecommendationRule {
  id: string;
  name: string;
  itemPattern: string | RegExp;
  category?: string;
  conditions: (ctx: RecommendationContext, room?: RoomCondition) => boolean;
  priorityBoost: number;
  reasons: (ctx: RecommendationContext) => string[];
}

const RECOMMENDATION_RULES: RecommendationRule[] = [
  // Kitchen Rules
  {
    id: 'kitchen_counters_flip',
    name: 'Kitchen Countertops for Flip',
    itemPattern: /countertop.*quartz|granite/i,
    category: 'kitchen',
    conditions: (ctx) => 
      ctx.strategy === 'flip' && 
      ctx.rooms.some(r => r.room_type === 'kitchen' && r.needs_renovation),
    priorityBoost: 30,
    reasons: () => ['High ROI for flip buyers', 'Kitchen is top selling point'],
  },
  {
    id: 'kitchen_cabinets_refinish',
    name: 'Cabinet Refinishing',
    itemPattern: /cabinet.*refinish/i,
    category: 'kitchen',
    conditions: (ctx) =>
      ctx.strategy === 'flip' &&
      ctx.targetMarket !== 'luxury' &&
      ctx.rooms.some(r => r.room_type === 'kitchen'),
    priorityBoost: 25,
    reasons: () => ['Cost-effective kitchen update', 'Better ROI than replacement'],
  },
  {
    id: 'kitchen_appliances_stainless',
    name: 'Stainless Appliances',
    itemPattern: /appliance.*stainless/i,
    category: 'kitchen',
    conditions: (ctx) =>
      (ctx.strategy === 'flip' || ctx.targetMarket === 'move_up') &&
      ctx.rooms.some(r => r.room_type === 'kitchen'),
    priorityBoost: 20,
    reasons: (ctx) => [
      'Expected by move-up buyers',
      ctx.strategy === 'flip' ? 'Photos well for listing' : 'Attracts quality tenants',
    ],
  },

  // Bathroom Rules
  {
    id: 'bathroom_vanity_poor',
    name: 'Vanity for Poor Condition Bath',
    itemPattern: /vanity/i,
    category: 'bathroom',
    conditions: (ctx) =>
      ctx.rooms.some(
        r => r.room_type === 'bathroom' && 
        (r.overall_condition === 'poor' || r.overall_condition === 'gut_needed')
      ),
    priorityBoost: 35,
    reasons: () => ['Bathroom in poor condition', 'High impact visual update'],
  },
  {
    id: 'bathroom_tile_surround',
    name: 'Tile Surround',
    itemPattern: /tile surround/i,
    category: 'bathroom',
    conditions: (ctx) =>
      ctx.rooms.some(r => r.room_type === 'bathroom' && r.needs_renovation) &&
      ctx.targetMarket !== 'investor',
    priorityBoost: 25,
    reasons: () => ['Modern update buyers expect', 'Eliminates dated tub surrounds'],
  },

  // Flooring Rules
  {
    id: 'lvp_rental',
    name: 'LVP for Rentals',
    itemPattern: /vinyl.*plank|lvp/i,
    category: 'flooring',
    conditions: (ctx) =>
      ctx.strategy === 'rental',
    priorityBoost: 30,
    reasons: () => ['Durable for tenants', 'Water resistant', 'Easy maintenance'],
  },
  {
    id: 'hardwood_flip',
    name: 'Hardwood for Flips',
    itemPattern: /hardwood/i,
    category: 'flooring',
    conditions: (ctx) =>
      ctx.strategy === 'flip' && 
      (ctx.targetMarket === 'move_up' || ctx.targetMarket === 'luxury'),
    priorityBoost: 25,
    reasons: () => ['Premium finish buyers expect', 'High perceived value'],
  },
  {
    id: 'hardwood_refinish',
    name: 'Refinish Existing Hardwood',
    itemPattern: /hardwood.*refinish/i,
    category: 'flooring',
    conditions: (ctx) =>
      ctx.strategy === 'flip',
    priorityBoost: 40,
    reasons: () => ['Highest ROI renovation', 'Reveals hidden value'],
  },

  // Paint Rules
  {
    id: 'interior_paint_always',
    name: 'Interior Paint',
    itemPattern: /interior.*paint/i,
    category: 'paint',
    conditions: () => true, // Always recommend
    priorityBoost: 50,
    reasons: () => ['Essential refresh', 'Highest ROI item', 'Sets canvas for everything else'],
  },
  {
    id: 'exterior_paint_flip',
    name: 'Exterior Paint for Curb Appeal',
    itemPattern: /exterior.*paint/i,
    category: 'paint',
    conditions: (ctx) =>
      ctx.strategy === 'flip' &&
      ctx.rooms.some(r => r.room_type === 'exterior'),
    priorityBoost: 35,
    reasons: () => ['Critical for first impressions', 'Affects listing photos'],
  },

  // Exterior Rules
  {
    id: 'landscaping_flip',
    name: 'Landscaping for Flips',
    itemPattern: /landscaping/i,
    category: 'exterior',
    conditions: (ctx) => ctx.strategy === 'flip',
    priorityBoost: 45,
    reasons: () => ['100%+ ROI typical', 'Curb appeal drives offers', 'Photos sell homes'],
  },
  {
    id: 'entry_door_flip',
    name: 'Entry Door',
    itemPattern: /entry.*door|exterior.*door/i,
    category: 'exterior',
    conditions: (ctx) =>
      ctx.strategy === 'flip' &&
      (ctx.targetMarket === 'move_up' || ctx.targetMarket === 'luxury'),
    priorityBoost: 25,
    reasons: () => ['First impression item', 'High perceived value'],
  },

  // Systems - Lower priority but necessary
  {
    id: 'hvac_poor_condition',
    name: 'HVAC Replacement',
    itemPattern: /hvac.*replacement/i,
    category: 'systems',
    conditions: (ctx) =>
      ctx.rooms.some(
        r => r.room_type === 'basement' && 
        (r.overall_condition === 'poor' || r.overall_condition === 'gut_needed')
      ),
    priorityBoost: 20,
    reasons: () => ['Aging system liability', 'Inspection red flag'],
  },
  {
    id: 'water_heater',
    name: 'Water Heater',
    itemPattern: /water heater/i,
    category: 'systems',
    conditions: () => true, // Often needed
    priorityBoost: 10,
    reasons: () => ['Common inspection item', 'Peace of mind for buyers'],
  },
];

// =============================================================================
// RECOMMENDATION ENGINE
// =============================================================================

interface CostItemForRecommendation {
  id: string;
  name: string;
  category: string;
  base_cost_mid: number;
  typical_roi_percentage: number;
  buyer_appeal_score: number;
}

export function generateScopeRecommendations(
  context: RecommendationContext,
  availableItems: CostItemForRecommendation[]
): ScopeRecommendation[] {
  const recommendations: ScopeRecommendation[] = [];

  for (const item of availableItems) {
    let score = 0;
    const reasons: string[] = [];

    // Base score from item metrics
    score += item.typical_roi_percentage * 0.3;
    score += item.buyer_appeal_score * 3;

    // Apply recommendation rules
    for (const rule of RECOMMENDATION_RULES) {
      const matchesPattern =
        typeof rule.itemPattern === 'string'
          ? item.name.toLowerCase().includes(rule.itemPattern.toLowerCase())
          : rule.itemPattern.test(item.name);

      const matchesCategory = !rule.category || item.category === rule.category;

      if (matchesPattern && matchesCategory) {
        // Check conditions for each relevant room
        let ruleApplies = false;

        if (rule.conditions(context)) {
          ruleApplies = true;
        }

        // Also check room-specific conditions
        for (const room of context.rooms) {
          if (
            room.room_type === item.category ||
            item.category === 'paint' ||
            item.category === 'flooring'
          ) {
            if (rule.conditions(context, room)) {
              ruleApplies = true;
            }
          }
        }

        if (ruleApplies) {
          score += rule.priorityBoost;
          reasons.push(...rule.reasons(context));
        }
      }
    }

    // Room condition boosts
    const relevantRooms = context.rooms.filter(
      r => r.room_type === item.category || item.category === 'flooring' || item.category === 'paint'
    );

    for (const room of relevantRooms) {
      if (room.needs_renovation) {
        score += 15;
        if (!reasons.some(r => r.includes('renovation'))) {
          reasons.push(`${room.room_type} marked for renovation`);
        }
      }
      if (room.overall_condition === 'poor' || room.overall_condition === 'gut_needed') {
        score += 20;
      }
    }

    // Strategy adjustments
    if (context.strategy === 'flip') {
      // Boost high-ROI items for flips
      if (item.typical_roi_percentage >= 75) {
        score += 10;
      }
    } else if (context.strategy === 'rental') {
      // Boost durable items for rentals
      if (item.category === 'flooring' && item.name.toLowerCase().includes('vinyl')) {
        score += 15;
      }
    }

    // Target market adjustments
    if (context.targetMarket === 'luxury' && item.buyer_appeal_score >= 8) {
      score += 10;
    } else if (context.targetMarket === 'investor' && item.typical_roi_percentage >= 60) {
      score += 10;
    }

    // Only include items with meaningful scores
    if (score >= 30 || reasons.length > 0) {
      // Determine priority tier
      let priority: ScopeRecommendation['priority'];
      if (score >= 70) priority = 'must';
      else if (score >= 50) priority = 'should';
      else if (score >= 35) priority = 'could';
      else priority = 'nice';

      recommendations.push({
        itemId: item.id,
        itemName: item.name,
        category: item.category,
        priority,
        score,
        reasons: [...new Set(reasons)], // Deduplicate
        estimatedCost: item.base_cost_mid,
        expectedROI: item.typical_roi_percentage,
      });
    }
  }

  // Sort by score descending
  recommendations.sort((a, b) => b.score - a.score);

  return recommendations;
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  InvestmentStrategy,
  TargetMarket,
  ConditionLevel,
  RoomCondition,
  RecommendationContext,
  ScopeRecommendation,
  CostItemForRecommendation,
};
