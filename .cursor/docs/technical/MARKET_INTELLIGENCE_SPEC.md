# Market Intelligence Module - Technical Specification

**Version**: 1.0.0  
**Last Updated**: December 28, 2025  
**Status**: Ready for Implementation  
**Epic**: Phase 3 - Advanced Features  
**Priority**: MEDIUM - Competitive Advantage  

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Data Sources](#data-sources)
3. [Feature Modules](#feature-modules)
4. [API Design](#api-design)
5. [Database Schema](#database-schema)
6. [Component Architecture](#component-architecture)
7. [Implementation Plan](#implementation-plan)

---

## 🎯 Overview

### Purpose

The Market Intelligence Module provides real estate market data and analysis to help investors make informed decisions about property purchases, renovation scopes, and pricing strategies.

### Business Value

```
┌────────────────────────────────────────────────────────────────┐
│                  MARKET INTELLIGENCE VALUE                       │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  1. COMP ANALYSIS                                                │
│     ├── Find comparable sales automatically                     │
│     ├── Validate ARV estimates                                  │
│     └── Identify renovation standards in area                  │
│                                                                  │
│  2. MARKET TIMING                                                │
│     ├── Seasonal price trends                                   │
│     ├── Days on market analysis                                 │
│     └── Buyer activity indicators                               │
│                                                                  │
│  3. NEIGHBORHOOD INSIGHTS                                        │
│     ├── Price per sqft by neighborhood                          │
│     ├── Appreciation trends                                     │
│     └── Investment opportunity scores                           │
│                                                                  │
│  4. RENOVATION ROI DATA                                          │
│     ├── What renovations add value in this market               │
│     ├── Price premiums for specific upgrades                    │
│     └── Over-improvement warnings                               │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### User Stories

| As a... | I want to... | So that... |
|---------|--------------|------------|
| Investor | See comparable sales | I can validate my ARV estimate |
| Investor | Understand price trends | I know if it's a good time to buy/sell |
| Investor | See what renovations add value | I prioritize high-ROI improvements |
| Investor | Get neighborhood insights | I identify good investment areas |

---

## 🔌 Data Sources

### Primary Data Sources

| Source | Data Type | Integration Method | Cost |
|--------|-----------|-------------------|------|
| **Zillow API** | Property data, Zestimates | REST API | Free tier available |
| **Redfin Data** | Comparable sales, DOM | Web scraping / API | Free data |
| **ATTOM Data** | Property details, sales history | REST API | Paid ($) |
| **Realtor.com API** | Listings, market trends | Partner API | Paid ($$) |
| **Census Bureau** | Demographics, housing stats | Public API | Free |
| **Google Places** | Location amenities, schools | REST API | Pay-per-use |

### Data Strategy

```
┌────────────────────────────────────────────────────────────────┐
│                    DATA AGGREGATION STRATEGY                     │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  TIER 1: ESSENTIAL (MVP)                                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Property valuation estimates (Zillow/Redfin)           │  │
│  │ • Recent comparable sales (public records)               │  │
│  │ • Basic neighborhood stats (Census)                      │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  TIER 2: ENHANCED                                                │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Days on market trends                                  │  │
│  │ • Price history and appreciation                         │  │
│  │ • School ratings and amenities                           │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  TIER 3: PREMIUM                                                 │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ • Investor activity in area                              │  │
│  │ • Rental rate analysis                                   │  │
│  │ • Foreclosure/distressed property data                   │  │
│  │ • Permit activity and development trends                 │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 🧩 Feature Modules

### 1. Comparable Sales Analysis

```
┌────────────────────────────────────────────────────────────────┐
│                    COMPARABLE SALES ANALYSIS                     │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Subject Property: 1234 Oak Street                               │
│  Est. ARV: $325,000    Your Estimate: $320,000                   │
│                                                                  │
│  COMPARABLE SALES (within 0.5 mi, last 6 months)                 │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  [MAP VIEW showing subject + comps]                        │ │
│  │                                                            │ │
│  │    📍 Subject Property                                     │ │
│  │    🏠 Comp 1 - $315,000                                   │ │
│  │    🏠 Comp 2 - $328,000                                   │ │
│  │    🏠 Comp 3 - $335,000                                   │ │
│  │    🏠 Comp 4 - $310,000                                   │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  COMP DETAILS                                                    │
│  ┌──────────┬─────────┬──────┬──────┬───────┬────────┬───────┐ │
│  │ Address  │ Price   │ Beds │ Bath │ Sqft  │ $/Sqft │ DOM   │ │
│  ├──────────┼─────────┼──────┼──────┼───────┼────────┼───────┤ │
│  │ 1256 Oak │$315,000 │ 3    │ 2    │ 1,820 │ $173   │ 12    │ │
│  │ 1198 Oak │$328,000 │ 3    │ 2.5  │ 1,900 │ $173   │ 8     │ │
│  │ 1302 Elm │$335,000 │ 4    │ 2    │ 2,050 │ $163   │ 15    │ │
│  │ 1145 Oak │$310,000 │ 3    │ 1.5  │ 1,750 │ $177   │ 22    │ │
│  └──────────┴─────────┴──────┴──────┴───────┴────────┴───────┘ │
│                                                                  │
│  ANALYSIS SUMMARY                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Average Comp Price: $322,000                               │ │
│  │ Average $/Sqft: $172                                       │ │
│  │ Your ARV at $172/sqft: $318,200                           │ │
│  │                                                            │ │
│  │ ✅ Your estimate is within 2% of market average           │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 2. Market Trends Dashboard

```
┌────────────────────────────────────────────────────────────────┐
│                    MARKET TRENDS - 55401                         │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  PRICE TRENDS                          MARKET HEALTH             │
│  ┌─────────────────────────────┐      ┌──────────────────────┐  │
│  │      [LINE CHART]           │      │ Market: Seller's     │  │
│  │                             │      │ Trend: ↑ Appreciating│  │
│  │  ────────────────────       │      │ DOM: 18 days         │  │
│  │                 /           │      │ Inventory: Low       │  │
│  │           /----'            │      │                      │  │
│  │      /---'                  │      │ Price Change (YoY)   │  │
│  │  ---'                       │      │ +8.5%                │  │
│  │                             │      │                      │  │
│  │  Q1   Q2   Q3   Q4   Q1    │      │ Forecast: +5-7%     │  │
│  └─────────────────────────────┘      └──────────────────────┘  │
│                                                                  │
│  SEASONAL PATTERNS                                               │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │        [BAR CHART - Avg DOM by Month]                      │ │
│  │                                                            │ │
│  │  Best to LIST: April-June (lowest DOM)                     │ │
│  │  Best to BUY: Nov-Feb (less competition)                   │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  PRICE SEGMENTS                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Price Range      │ Avg DOM │ Inventory │ Price Trend       │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ Under $250k      │ 8 days  │ Very Low  │ ↑ +12%           │ │
│  │ $250k - $350k    │ 15 days │ Low       │ ↑ +8%            │ │
│  │ $350k - $500k    │ 25 days │ Moderate  │ ↑ +5%            │ │
│  │ Over $500k       │ 45 days │ High      │ → +2%            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  💡 INSIGHT: Properties in your price range ($300-350k) are    │
│     moving quickly. Buyers in this segment value updated        │
│     kitchens and bathrooms most highly.                         │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 3. Renovation Value Analysis

```
┌────────────────────────────────────────────────────────────────┐
│                 RENOVATION VALUE ANALYSIS - 55401                │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  What renovations add most value in this neighborhood?          │
│                                                                  │
│  TOP ROI IMPROVEMENTS                                            │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Improvement          │ Avg Cost │ Value Add │ ROI         │ │
│  ├────────────────────────────────────────────────────────────┤ │
│  │ 🏆 Minor Kitchen     │ $15,000  │ $18,000   │ 120%        │ │
│  │ 🥈 Bathroom Update   │ $8,000   │ $9,500    │ 119%        │ │
│  │ 🥉 New Flooring      │ $6,000   │ $7,000    │ 117%        │ │
│  │ 4. Exterior Paint    │ $4,000   │ $4,500    │ 113%        │ │
│  │ 5. Landscaping       │ $2,500   │ $2,700    │ 108%        │ │
│  │ 6. New Roof          │ $12,000  │ $12,500   │ 104%        │ │
│  │ 7. Major Kitchen     │ $45,000  │ $38,000   │ 84%         │ │
│  │ 8. Addition          │ $80,000  │ $60,000   │ 75%         │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  PRICE PREMIUMS IN THIS MARKET                                   │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Feature                 Premium over Non-Renovated        │ │
│  │  ─────────────────────────────────────────────────────    │ │
│  │  Updated Kitchen         +$12,000 to +$18,000             │ │
│  │  Updated Bathrooms       +$6,000 to +$10,000 per bath     │ │
│  │  Finished Basement       +$15,000 to +$25,000             │ │
│  │  New HVAC                +$4,000 to +$6,000               │ │
│  │  Hardwood Floors         +$5,000 to +$8,000               │ │
│  │  Open Floor Plan         +$8,000 to +$12,000              │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  ⚠️ OVER-IMPROVEMENT WARNING                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ At your ARV of $325,000, avoid these:                      │ │
│  │ • High-end appliances (>$8k) - market won't pay premium   │ │
│  │ • Custom cabinetry - standard upgraded is sufficient      │ │
│  │ • Premium countertops - mid-range quartz is optimal       │ │
│  │                                                            │ │
│  │ Max renovation spend for this ARV: ~$55,000               │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

### 4. Neighborhood Scorecard

```
┌────────────────────────────────────────────────────────────────┐
│                    NEIGHBORHOOD SCORECARD                        │
│                    Kingfield (55419)                             │
├────────────────────────────────────────────────────────────────┤
│                                                                  │
│  OVERALL INVESTMENT SCORE: 82/100                                │
│  [████████████████████░░░░] Good                                │
│                                                                  │
│  FACTOR BREAKDOWN                                                │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │                                                            │ │
│  │  Appreciation Potential    ████████░░  85/100             │ │
│  │  5-year trend: +45%                                       │ │
│  │                                                            │ │
│  │  Rental Demand             █████████░  90/100             │ │
│  │  Vacancy rate: 2.1%                                       │ │
│  │                                                            │ │
│  │  Buyer Activity            ████████░░  80/100             │ │
│  │  Avg DOM: 15 days                                         │ │
│  │                                                            │ │
│  │  School Quality            ███████░░░  70/100             │ │
│  │  Avg rating: 7/10                                         │ │
│  │                                                            │ │
│  │  Crime Safety              ████████░░  78/100             │ │
│  │  Below city average                                       │ │
│  │                                                            │ │
│  │  Walkability               █████████░  88/100             │ │
│  │  Walk score: 82                                           │ │
│  │                                                            │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  DEMOGRAPHICS                                                    │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ Median Household Income: $78,500                           │ │
│  │ Population Trend: Growing (+3% YoY)                        │ │
│  │ Median Age: 34                                             │ │
│  │ Owner-Occupied: 62%                                        │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
│  BEST FOR:                                                       │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │ ✅ Fix & Flip - Strong buyer demand, quick sales          │ │
│  │ ✅ Long-term Rental - Low vacancy, strong rents           │ │
│  │ ⚠️ Airbnb - Check local regulations                       │ │
│  └────────────────────────────────────────────────────────────┘ │
│                                                                  │
└────────────────────────────────────────────────────────────────┘
```

---

## 💾 Data Model

### Core Entities

```typescript
// src/types/market-intelligence.ts

export interface MarketData {
  zipCode: string;
  city: string;
  state: string;
  
  // Price metrics
  medianPrice: number;
  pricePerSqft: number;
  priceChange1Year: number;
  priceChange3Year: number;
  priceChange5Year: number;
  
  // Market activity
  averageDaysOnMarket: number;
  activeListings: number;
  soldLast30Days: number;
  newListingsLast30Days: number;
  
  // Market type
  marketType: 'buyers' | 'sellers' | 'balanced';
  inventoryMonths: number;
  
  // Forecast
  forecastedChange1Year: number;
  confidenceLevel: number;
  
  // Timestamps
  updatedAt: Date;
}

export interface ComparableSale {
  id: string;
  
  // Property info
  address: string;
  city: string;
  state: string;
  zipCode: string;
  
  // Property details
  propertyType: string;
  bedrooms: number;
  bathrooms: number;
  squareFeet: number;
  lotSize: number;
  yearBuilt: number;
  
  // Sale info
  salePrice: number;
  saleDate: Date;
  pricePerSqft: number;
  daysOnMarket: number;
  
  // Location
  latitude: number;
  longitude: number;
  distanceFromSubject: number; // miles
  
  // Condition/features
  condition: 'excellent' | 'good' | 'fair' | 'poor';
  hasPool: boolean;
  hasGarage: boolean;
  garageSpaces: number;
  isRenovated: boolean;
  renovationYear?: number;
  
  // Adjustments
  adjustedPrice?: number;
  adjustments?: PriceAdjustment[];
}

export interface PriceAdjustment {
  factor: string;
  description: string;
  amount: number;
  direction: 'add' | 'subtract';
}

export interface RenovationValueData {
  zipCode: string;
  
  improvements: ImprovementROI[];
  
  // Price premiums
  premiums: {
    updatedKitchen: { min: number; max: number };
    updatedBathroom: { min: number; max: number };
    finishedBasement: { min: number; max: number };
    newHVAC: { min: number; max: number };
    hardwoodFloors: { min: number; max: number };
    openFloorPlan: { min: number; max: number };
  };
  
  // Over-improvement thresholds
  maxRenovationByARV: {
    under250k: number;
    under350k: number;
    under500k: number;
    over500k: number;
  };
  
  updatedAt: Date;
}

export interface ImprovementROI {
  name: string;
  category: string;
  averageCost: number;
  averageValueAdd: number;
  roi: number;
  rank: number;
}

export interface NeighborhoodScore {
  zipCode: string;
  name: string;
  
  // Overall
  overallScore: number;
  
  // Factor scores (0-100)
  appreciationScore: number;
  rentalDemandScore: number;
  buyerActivityScore: number;
  schoolQualityScore: number;
  crimeScore: number;
  walkabilityScore: number;
  
  // Demographics
  medianIncome: number;
  populationGrowth: number;
  medianAge: number;
  ownerOccupiedPercent: number;
  
  // Recommendations
  bestFor: ('flip' | 'rental' | 'airbnb' | 'brrrr')[];
  warnings: string[];
  
  updatedAt: Date;
}
```

---

## 🔌 API Design

### Market Data Endpoints

```typescript
// src/app/api/market/comparables/route.ts

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getComparableSales } from '@/lib/market/comparables-service';

const requestSchema = z.object({
  address: z.string(),
  propertyType: z.string().optional(),
  beds: z.number().optional(),
  baths: z.number().optional(),
  sqft: z.number().optional(),
  radius: z.number().min(0.1).max(5).default(0.5), // miles
  months: z.number().min(1).max(12).default(6),
  limit: z.number().min(1).max(20).default(10),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const params = requestSchema.parse(body);
    
    const comparables = await getComparableSales({
      address: params.address,
      filters: {
        propertyType: params.propertyType,
        bedroomsRange: params.beds ? [params.beds - 1, params.beds + 1] : undefined,
        bathroomsRange: params.baths ? [params.baths - 0.5, params.baths + 0.5] : undefined,
        sqftRange: params.sqft ? [params.sqft * 0.8, params.sqft * 1.2] : undefined,
      },
      radius: params.radius,
      monthsBack: params.months,
      limit: params.limit,
    });
    
    // Calculate statistics
    const stats = {
      count: comparables.length,
      averagePrice: comparables.reduce((sum, c) => sum + c.salePrice, 0) / comparables.length,
      averagePricePerSqft: comparables.reduce((sum, c) => sum + c.pricePerSqft, 0) / comparables.length,
      priceRange: {
        min: Math.min(...comparables.map(c => c.salePrice)),
        max: Math.max(...comparables.map(c => c.salePrice)),
      },
      averageDaysOnMarket: comparables.reduce((sum, c) => sum + c.daysOnMarket, 0) / comparables.length,
    };
    
    return NextResponse.json({
      comparables,
      stats,
      subjectEstimate: params.sqft ? params.sqft * stats.averagePricePerSqft : null,
    });
    
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: 'Invalid request', details: error.errors }, { status: 400 });
    }
    console.error('Comparables error:', error);
    return NextResponse.json({ error: 'Failed to fetch comparables' }, { status: 500 });
  }
}
```

```typescript
// src/app/api/market/trends/route.ts

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  
  if (!zipCode) {
    return NextResponse.json({ error: 'Zip code required' }, { status: 400 });
  }
  
  const trends = await getMarketTrends(zipCode);
  
  return NextResponse.json(trends);
}

async function getMarketTrends(zipCode: string): Promise<MarketData> {
  // Check cache first
  const cached = await getCachedMarketData(zipCode);
  if (cached && isRecent(cached.updatedAt, 24)) {
    return cached;
  }
  
  // Fetch from external sources
  const [zillow, redfin, census] = await Promise.all([
    fetchZillowData(zipCode),
    fetchRedfinData(zipCode),
    fetchCensusData(zipCode),
  ]);
  
  // Aggregate and normalize
  const marketData: MarketData = {
    zipCode,
    city: zillow.city || redfin.city,
    state: zillow.state || redfin.state,
    
    medianPrice: average([zillow.medianPrice, redfin.medianPrice]),
    pricePerSqft: average([zillow.pricePerSqft, redfin.pricePerSqft]),
    priceChange1Year: average([zillow.priceChange1Year, redfin.priceChange1Year]),
    
    averageDaysOnMarket: redfin.averageDaysOnMarket || zillow.averageDaysOnMarket,
    activeListings: redfin.activeListings,
    soldLast30Days: redfin.soldLast30Days,
    
    marketType: determineMarketType(redfin),
    inventoryMonths: redfin.inventoryMonths,
    
    forecastedChange1Year: zillow.forecastedChange1Year,
    confidenceLevel: 0.75,
    
    updatedAt: new Date(),
  };
  
  // Cache the result
  await cacheMarketData(zipCode, marketData);
  
  return marketData;
}
```

```typescript
// src/app/api/market/renovation-roi/route.ts

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  const arv = searchParams.get('arv');
  
  if (!zipCode) {
    return NextResponse.json({ error: 'Zip code required' }, { status: 400 });
  }
  
  const roiData = await getRenovationROIData(zipCode);
  
  // Add personalized recommendations based on ARV
  if (arv) {
    const arvNumber = parseFloat(arv);
    roiData.recommendations = generateRecommendations(roiData, arvNumber);
    roiData.maxRenovation = calculateMaxRenovation(arvNumber, roiData);
    roiData.overImprovementWarnings = getOverImprovementWarnings(arvNumber, roiData);
  }
  
  return NextResponse.json(roiData);
}
```

```typescript
// src/app/api/market/neighborhood/route.ts

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const zipCode = searchParams.get('zipCode');
  
  if (!zipCode) {
    return NextResponse.json({ error: 'Zip code required' }, { status: 400 });
  }
  
  const [marketData, censusData, schoolData, crimeData, walkScore] = await Promise.all([
    getMarketTrends(zipCode),
    fetchCensusData(zipCode),
    fetchSchoolRatings(zipCode),
    fetchCrimeData(zipCode),
    fetchWalkScore(zipCode),
  ]);
  
  const score: NeighborhoodScore = {
    zipCode,
    name: censusData.neighborhoodName,
    
    overallScore: calculateOverallScore({
      appreciation: marketData.priceChange5Year,
      vacancy: censusData.vacancyRate,
      dom: marketData.averageDaysOnMarket,
      schools: schoolData.averageRating,
      crime: crimeData.safetyScore,
      walkability: walkScore.score,
    }),
    
    appreciationScore: scoreFromAppreciation(marketData.priceChange5Year),
    rentalDemandScore: scoreFromVacancy(censusData.vacancyRate),
    buyerActivityScore: scoreFromDOM(marketData.averageDaysOnMarket),
    schoolQualityScore: schoolData.averageRating * 10,
    crimeScore: crimeData.safetyScore,
    walkabilityScore: walkScore.score,
    
    medianIncome: censusData.medianHouseholdIncome,
    populationGrowth: censusData.populationGrowthRate,
    medianAge: censusData.medianAge,
    ownerOccupiedPercent: censusData.ownerOccupiedPercent,
    
    bestFor: determineBestStrategies(marketData, censusData),
    warnings: generateWarnings(marketData, censusData),
    
    updatedAt: new Date(),
  };
  
  return NextResponse.json(score);
}
```

---

## 💾 Database Schema

```sql
-- Market Intelligence Cache Tables

-- Cached market data by zip code
CREATE TABLE market_data_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zip_code TEXT NOT NULL,
    city TEXT,
    state TEXT,
    
    -- Price metrics
    median_price NUMERIC,
    price_per_sqft NUMERIC,
    price_change_1_year NUMERIC,
    price_change_3_year NUMERIC,
    price_change_5_year NUMERIC,
    
    -- Market activity
    avg_days_on_market INTEGER,
    active_listings INTEGER,
    sold_last_30_days INTEGER,
    
    -- Market type
    market_type TEXT,
    inventory_months NUMERIC,
    
    -- Forecast
    forecasted_change_1_year NUMERIC,
    
    -- Metadata
    data_sources JSONB,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(zip_code)
);

CREATE INDEX idx_market_data_zip ON market_data_cache(zip_code);
CREATE INDEX idx_market_data_updated ON market_data_cache(updated_at);

-- Cached comparable sales
CREATE TABLE comparable_sales_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Property info
    address TEXT NOT NULL,
    city TEXT,
    state TEXT,
    zip_code TEXT NOT NULL,
    
    -- Property details
    property_type TEXT,
    bedrooms INTEGER,
    bathrooms NUMERIC,
    square_feet INTEGER,
    lot_size NUMERIC,
    year_built INTEGER,
    
    -- Sale info
    sale_price NUMERIC NOT NULL,
    sale_date DATE NOT NULL,
    price_per_sqft NUMERIC,
    days_on_market INTEGER,
    
    -- Location
    latitude NUMERIC,
    longitude NUMERIC,
    
    -- Features
    condition TEXT,
    features JSONB,
    
    -- Metadata
    source TEXT,
    fetched_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    
    UNIQUE(address, sale_date)
);

CREATE INDEX idx_comps_zip ON comparable_sales_cache(zip_code);
CREATE INDEX idx_comps_sale_date ON comparable_sales_cache(sale_date);
CREATE INDEX idx_comps_location ON comparable_sales_cache(latitude, longitude);

-- Neighborhood scores
CREATE TABLE neighborhood_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    zip_code TEXT NOT NULL UNIQUE,
    name TEXT,
    
    overall_score INTEGER,
    appreciation_score INTEGER,
    rental_demand_score INTEGER,
    buyer_activity_score INTEGER,
    school_quality_score INTEGER,
    crime_score INTEGER,
    walkability_score INTEGER,
    
    demographics JSONB,
    best_for TEXT[],
    warnings TEXT[],
    
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- User-saved market research
CREATE TABLE user_market_research (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    
    zip_code TEXT NOT NULL,
    notes TEXT,
    is_favorite BOOLEAN DEFAULT false,
    
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_user_research_user ON user_market_research(user_id);
```

---

## 🧩 Component Architecture

### File Structure

```
src/
├── lib/
│   └── market/
│       ├── index.ts                    # Barrel export
│       ├── comparables-service.ts      # Comp fetching/analysis
│       ├── trends-service.ts           # Market trend analysis
│       ├── renovation-roi-service.ts   # ROI data
│       ├── neighborhood-service.ts     # Neighborhood scoring
│       ├── data-sources/
│       │   ├── zillow.ts               # Zillow API integration
│       │   ├── redfin.ts               # Redfin data
│       │   ├── census.ts               # Census Bureau API
│       │   └── walk-score.ts           # Walk Score API
│       └── cache.ts                    # Caching utilities
│
├── components/
│   └── market/
│       ├── ComparablesList.tsx         # Comp display table
│       ├── ComparablesMap.tsx          # Map with markers
│       ├── MarketTrendsDashboard.tsx   # Trends overview
│       ├── PriceTrendChart.tsx         # Price over time
│       ├── SeasonalPatterns.tsx        # Seasonal analysis
│       ├── RenovationROITable.tsx      # ROI rankings
│       ├── NeighborhoodScorecard.tsx   # Score visualization
│       ├── MarketInsightCard.tsx       # AI-style insights
│       └── ARVValidator.tsx            # ARV comparison
│
├── hooks/
│   ├── use-comparables.ts              # Fetch comps hook
│   ├── use-market-trends.ts            # Trends hook
│   └── use-neighborhood.ts             # Neighborhood hook
│
└── app/
    ├── (app)/
    │   └── market/
    │       ├── page.tsx                # Market research page
    │       ├── [zipCode]/
    │       │   └── page.tsx            # Zip-specific details
    │       └── comparables/
    │           └── page.tsx            # Comp search tool
    │
    └── api/
        └── market/
            ├── comparables/route.ts
            ├── trends/route.ts
            ├── renovation-roi/route.ts
            └── neighborhood/route.ts
```

---

## 📅 Implementation Plan

### Phase 1: Data Infrastructure (3-4 days)

| Task | Description | Est. |
|------|-------------|------|
| Type definitions | All TypeScript interfaces | 2h |
| Database schema | Cache tables and indexes | 3h |
| Zillow integration | Basic property data | 6h |
| Caching layer | Redis/Supabase caching | 4h |

### Phase 2: Comparables Feature (3 days)

| Task | Description | Est. |
|------|-------------|------|
| Comps API endpoint | Fetch and filter | 4h |
| ComparablesList component | Table display | 3h |
| ComparablesMap component | Map visualization | 5h |
| ARV validation logic | Compare to comps | 3h |

### Phase 3: Market Trends (2 days)

| Task | Description | Est. |
|------|-------------|------|
| Trends API endpoint | Aggregate data | 4h |
| MarketTrendsDashboard | Main UI | 4h |
| Price charts | Recharts visualizations | 4h |

### Phase 4: Renovation ROI (2 days)

| Task | Description | Est. |
|------|-------------|------|
| ROI data service | Fetch/calculate ROI | 4h |
| RenovationROITable | Ranked improvements | 3h |
| Over-improvement warnings | Alert logic | 2h |

### Phase 5: Neighborhood Scoring (2 days)

| Task | Description | Est. |
|------|-------------|------|
| Multi-source aggregation | Combine data sources | 4h |
| NeighborhoodScorecard | Score visualization | 4h |
| Investment recommendations | Strategy matching | 3h |

**Total Estimated Time: 12-15 days**

---

## 📊 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| Data freshness | < 24 hours | Cache age |
| Comp accuracy | Within 10% of actual | User feedback |
| API response time | < 2 seconds | Performance logs |
| Feature adoption | > 40% of active users | Usage tracking |

---

## 🔗 Related Documentation

- [AI Recommendations Spec](./AI_RECOMMENDATIONS_SPEC.md)
- [ROI Calculator Spec](./ROI_CALCULATOR_SPEC.md)
- [PRD - Market Intelligence](../PRD.md#phase-3-collaboration)
