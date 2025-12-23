# Rehab Estimator - Product Requirements Document (PRD)

## Executive Summary

**Rehab Estimator** is a professional renovation planning and cost estimation SaaS platform designed for real estate investors. The application enables users to build data-driven renovation scopes that maximize ROI through comprehensive workflow management, AI-powered recommendations, and interactive timeline visualization.

### Product Vision
To become the industry-standard tool for real estate investors to plan, estimate, and execute renovation projects with maximum profitability and minimal risk.

### Target Market
- Real estate investors (flippers, landlords, Airbnb hosts)
- Real estate investment groups
- Property management companies
- Wholesale investors
- Fix-and-flip lenders evaluating deals

---

## Problem Statement

### Current Pain Points

1. **Inaccurate Cost Estimation**: Investors often underestimate renovation costs by 20-40%, leading to budget overruns and reduced profits.

2. **No ROI-Driven Planning**: Current tools don't connect renovation decisions to investment returns or help prioritize work based on ROI impact.

3. **Poor Timeline Management**: Renovation projects frequently run over schedule due to poor dependency management and sequencing.

4. **Strategy Misalignment**: Different investment strategies (flip vs. rental vs. Airbnb) require different renovation approaches, but most tools are one-size-fits-all.

5. **Scattered Workflows**: Investors use multiple disconnected tools (spreadsheets, contractors' estimates, photo apps) with no unified workflow.

6. **Lack of Market Intelligence**: Decisions are made without understanding what the local market values or what comparable renovations achieved.

---

## Solution Overview

Rehab Estimator provides a unified 7-step workflow that guides investors from property assessment to final action plan:

```
Property Details → Condition Assessment → Strategy & Goals →
Scope Building → Priority Analysis → Action Plan → Final Review
```

### Core Value Propositions

1. **Data-Driven Cost Estimation**: Regional cost databases with quality tiers, market conditions, and difficulty multipliers for accurate estimates.

2. **ROI-First Decision Making**: Every renovation item is scored for ROI impact, helping investors focus on high-value improvements.

3. **Strategy-Specific Optimization**: Different algorithms for flip, rental, wholetail, and Airbnb investments.

4. **Visual Project Management**: Interactive React Flow timelines with dependency mapping, critical path analysis, and conflict detection.

5. **AI-Powered Recommendations**: Smart suggestions for cost savings, missing items, timing optimizations, and upgrades.

6. **Vendor Management**: Comprehensive contractor/supplier tracking with performance history and bid management.

---

## User Personas

### Primary Persona: The Active Flipper
**Name**: Marcus Chen
**Age**: 38
**Experience**: 5-10 years flipping houses
**Volume**: 4-8 flips per year

**Goals**:
- Maximize profit per flip
- Minimize holding time
- Accurate budgeting for hard money lenders
- Efficient contractor coordination

**Pain Points**:
- Spreadsheets are error-prone and time-consuming
- Struggles to prioritize which renovations add most value
- Often surprised by scope creep
- Needs professional documentation for investors/lenders

---

### Secondary Persona: The Landlord Investor
**Name**: Sarah Thompson
**Age**: 45
**Experience**: 15 years building rental portfolio
**Properties**: 12 rental units

**Goals**:
- Maximize monthly cash flow
- Minimize tenant turnover
- Balance renovation cost vs. rent increases
- Plan for long-term appreciation

**Pain Points**:
- Over-improving properties for the rental market
- Prioritizing tenant comfort vs. ROI
- Scheduling renovations between tenants
- Managing multiple contractors across properties

---

### Tertiary Persona: The Airbnb Host
**Name**: James Martinez
**Age**: 32
**Experience**: 3 years in short-term rentals
**Properties**: 3 Airbnb listings

**Goals**:
- Create photo-worthy properties
- Maximize nightly rates
- Minimize maintenance issues
- Fast turnovers between guests

**Pain Points**:
- Knowing which amenities increase bookings
- Balancing aesthetics vs. durability
- Understanding seasonal renovation timing
- Managing unique Airbnb requirements (smart locks, etc.)

---

## Functional Requirements

### 1. Property Details Module

#### 1.1 Property Information Capture
- **Address**: Street, city, state, zip code
- **Property Specs**: Square footage, lot size, year built
- **Property Type**: Single family, multi-family, condo, townhouse
- **Room Count**: Bedrooms, bathrooms
- **Project Metadata**: Project name, status

#### 1.2 Financial Data Entry
- **Purchase Price**: Acquisition cost
- **ARV (After Repair Value)**: Estimated post-renovation value
- **Maximum Budget**: Investment ceiling
- **Neighborhood Comparables**: Average comparable sale price

---

### 2. Condition Assessment Module

#### 2.1 Room-by-Room Evaluation
- **Room Types**: Kitchen, bathroom, bedroom, living room, exterior, garage, etc.
- **Condition Rating**: Excellent, good, fair, poor, terrible (5-point scale)
- **Component Assessment**: Per-room component evaluation
  - Flooring
  - Walls/paint
  - Ceiling
  - Electrical
  - Plumbing fixtures
  - Windows/doors
  - HVAC
  - Appliances (where applicable)

#### 2.2 Assessment Actions
- **Action Types**: Repair, replace, upgrade, none
- **Notes**: Free-text notes per room
- **Photo Upload**: Visual documentation per room

---

### 3. Strategy & Goals Module

#### 3.1 Investment Strategy Selection
- **Flip**: Renovate and resell for profit
- **Rental**: Renovate for long-term hold
- **Wholetail**: Light cosmetic updates for quick sale
- **Airbnb**: Short-term rental optimization

#### 3.2 Target Market Definition
- **First-Time Buyer**: Budget-conscious, move-in ready focus
- **Move-Up Buyer**: Quality upgrades, lifestyle features
- **Investor**: Durability, low maintenance
- **Luxury**: High-end finishes, premium materials

#### 3.3 Financial Targets
- **Target ROI**: Minimum acceptable return percentage
- **Hold Period**: Months until sale/stabilization
- **Contingency**: Budget buffer percentage (recommended 10-20%)

---

### 4. Scope Building Module

#### 4.1 Cost Database
- **Categories**: Exterior, interior, systems, structural
- **Subcategories**:
  - Exterior: Roofing, siding, windows, doors, landscaping, driveway, fencing
  - Interior: Kitchen, bathroom, flooring, paint, lighting, trim, stairs
  - Systems: HVAC, electrical, plumbing, security, smart home
  - Structural: Foundation, framing, insulation, drywall, demo

#### 4.2 Cost Calculation Engine
- **Base Costs**: Per-item pricing with labor hours and material ratios
- **Quality Tiers**: Budget (0.75x), Standard (1.0x), Premium (1.5x), Luxury (2.2x)
- **Regional Multipliers**: Cost-of-living index, labor/material adjustments by zip code
- **Difficulty Multipliers**: Simple, moderate, complex job factors
- **Market Conditions**: Material shortages, labor availability, seasonal factors

#### 4.3 Scope Item Management
- **Add Items**: From cost database or custom entries
- **Edit Items**: Quantity, quality tier, location
- **Priority Assignment**: Must, Should, Could, Nice (MoSCoW method)
- **ROI Impact**: Automatic calculation based on strategy
- **Dependencies**: Link items that must be done in sequence
- **Phase Assignment**: Group items into project phases

#### 4.4 Smart Scope Generation
- **Assessment Integration**: Auto-generate scope from condition assessments
- **Strategy Optimization**: Adjust recommendations based on investment strategy
- **Budget Optimization**: Fit scope within maximum budget

---

### 5. Priority Analysis Module

#### 5.1 Priority Matrix Visualization
- **X-Axis**: ROI Impact (0-100)
- **Y-Axis**: Urgency (0-100)
- **Quadrants**:
  - High ROI + High Urgency = "Must Do"
  - High ROI + Low Urgency = "Should Do"
  - Low ROI + High Urgency = "Could Do"
  - Low ROI + Low Urgency = "Nice to Have"

#### 5.2 Priority Scoring Engine
**Component Scores (0-100 each)**:
- **Urgency Score**: Priority level, category urgency, dependency impact, timeline pressure, seasonal factors
- **ROI Impact Score**: Base ROI, strategy multipliers, cost efficiency
- **Risk Mitigation Score**: Safety/structural importance, code compliance
- **Dependency Score**: Items blocking others, phase positioning
- **Market Timing Score**: Seasonal factors, market conditions
- **Complexity Score**: Timeline, cost, technical difficulty

**Strategy Weights**:
| Component | Flip | Rental | Wholetail | Airbnb |
|-----------|------|--------|-----------|--------|
| Urgency | 15% | 20% | 25% | 10% |
| ROI Impact | 35% | 25% | 30% | 30% |
| Risk Mitigation | 15% | 25% | 20% | 15% |
| Dependencies | 20% | 15% | 15% | 20% |
| Market Timing | 10% | 5% | 5% | 15% |
| Complexity | 5% | 10% | 5% | 10% |

---

### 6. Action Plan Module

#### 6.1 Interactive Timeline (React Flow)
- **Node Types**:
  - Task nodes (individual work items)
  - Phase nodes (phase groupings)
  - Milestone nodes (key dates)
  - Contractor nodes (resource assignments)
- **Edge Types**:
  - Dependency edges (FS, SS, FF relationships)
  - Timeline edges

#### 6.2 Critical Path Analysis
- **CPM Algorithm**: Calculate earliest/latest start/finish dates
- **Slack Calculation**: Identify float for each task
- **Critical Path Highlighting**: Visual emphasis on critical items

#### 6.3 Conflict Detection
- **Resource Conflicts**: Same contractor scheduled concurrently
- **Dependency Violations**: Tasks scheduled before dependencies complete
- **Timeline Conflicts**: Overlapping work in same location

#### 6.4 Auto-Layout
- **Topological Sorting**: Order nodes by dependencies
- **Phase Grouping**: Visual grouping of related tasks
- **Contractor Lanes**: Group by resource assignment

#### 6.5 Drag-and-Drop Scheduling
- **Reschedule Tasks**: Drag to new dates
- **Reorder Phases**: Reorganize project structure
- **Dependency Creation**: Connect tasks visually

---

### 7. Final Review Module

#### 7.1 Summary Dashboard
- **Total Cost Breakdown**: Material vs. labor
- **Budget Usage**: Percentage of max budget
- **ROI Projection**: Expected return on investment
- **Timeline Summary**: Total project duration

#### 7.2 Visualizations
- **Cost Breakdown Chart**: Pie/bar charts by category
- **ROI Analysis Chart**: Scenario comparison
- **Cash Flow Schedule**: Payment timeline
- **Phase Timeline**: Gantt-style overview

#### 7.3 Export Capabilities
- **PDF Report**: Professional summary document
- **Excel Export**: Detailed line items
- **Image Export**: Timeline visualization

---

### 8. AI Recommendations Module

#### 8.1 Recommendation Types
- **Add**: Missing items that should be included
- **Remove**: Items that could be cut to save budget
- **Upgrade**: Items worth upgrading for better ROI
- **Downgrade**: Items where cheaper options suffice
- **Timing**: Scheduling optimizations

#### 8.2 Recommendation Engine Rules
- **Cost Savings**: High-cost + low-ROI items → suggest downgrade
- **Contractor Bundling**: 3+ items for same trade → suggest bundle discount
- **Missing Critical Items**: Check for electrical, curb appeal, etc.
- **Timing Optimization**: Items with no dependencies → suggest earlier phase
- **Worthwhile Upgrades**: High ARV + basic kitchen → suggest upgrade

#### 8.3 Confidence Scoring
- Each recommendation includes confidence score (0.0-1.0)
- Higher confidence for rules with more data points
- Sorted by confidence for prioritization

---

### 9. Vendor Management Module

#### 9.1 Vendor Information
- **Basic Info**: Name, company, contact details
- **Address**: Full mailing address
- **Specialties**: Trade categories (plumbing, electrical, etc.)
- **Vendor Type**: Contractor, supplier, service provider

#### 9.2 Verification & Compliance
- **License Number**: State/local license
- **License Expiration**: Compliance tracking
- **Insurance Coverage**: Policy details and expiration
- **Insurance Expiration**: Renewal tracking

#### 9.3 Performance Tracking
- **Rating**: 0-5 star rating
- **Completed Projects**: Count with this vendor
- **Total Spent**: Lifetime payment total
- **Notes**: Free-text performance notes

#### 9.4 Financial Information
- **Hourly Rate**: Standard hourly billing
- **Markup Percentage**: Materials markup
- **Payment Terms**: Net 30, on completion, etc.

#### 9.5 Vendor Status
- **Active/Inactive**: Current availability
- **Preferred**: Flagged as preferred vendor
- **Documents**: Attached files (contracts, W-9, etc.)

---

### 10. ROI Calculator Module

#### 10.1 Calculation Inputs
- **Property Financials**: Purchase price, ARV, rehab cost
- **Holding Costs**: Monthly carrying costs
- **Selling Costs**: Commission, closing costs, staging
- **Rental Data**: Monthly rent, vacancy rate, management fee
- **Financing**: Down payment, loan amount, interest rate

#### 10.2 Calculation Outputs
- **Basic Metrics**: Total investment, net profit, ROI percentage
- **Cash Flow**: Monthly, annual, cumulative projections
- **Investment Metrics**: Cap rate, cash-on-cash return, IRR
- **Break-Even**: Months to break even, payback period

#### 10.3 Scenario Analysis
- **Conservative**: +15% costs, -10% ARV
- **Realistic**: Base case
- **Optimistic**: -10% costs, +5% ARV
- **Probability Weighting**: Each scenario probability

#### 10.4 Risk Assessment
- **Market Risk**: Low/medium/high based on market conditions
- **Liquidity Risk**: Based on days on market data
- **Execution Risk**: Based on scope complexity
- **Overall Risk**: Weighted composite

---

## Non-Functional Requirements

### Performance
- Page load time: < 2 seconds
- API response time: < 500ms
- Cost calculations: < 100ms
- Flow rendering: < 16ms frame rate

### Scalability
- Support 10,000+ concurrent users
- Handle projects with 500+ scope items
- Store 1M+ projects per tenant

### Security
- Row-level security on all data
- Authentication via Supabase Auth
- HTTPS only
- Data encryption at rest

### Availability
- 99.9% uptime SLA
- Automatic failover
- Data backup every 6 hours

### Usability
- Mobile-responsive design
- Keyboard navigation support
- Screen reader compatible
- < 5 clicks to any feature

---

## Success Metrics

### Primary KPIs
1. **User Activation Rate**: % of signups that complete first project > 60%
2. **Project Completion Rate**: % of started projects completed > 75%
3. **Time to First Estimate**: Average time < 15 minutes
4. **Estimate Accuracy**: User-reported accuracy > 85%

### Secondary KPIs
1. **Monthly Active Users (MAU)**: Growth rate > 10% MoM
2. **Projects Created per User**: Average > 3 per year
3. **Feature Adoption**: Priority matrix usage > 50%
4. **Net Promoter Score (NPS)**: Target > 40

### Business Metrics
1. **Customer Acquisition Cost (CAC)**: < $50
2. **Monthly Recurring Revenue (MRR)**: Growth target
3. **Churn Rate**: < 5% monthly
4. **Lifetime Value (LTV)**: > 12x CAC

---

## Pricing Tiers (Proposed)

### Free Tier
- 1 active project
- Basic cost database
- No AI recommendations
- Community support

### Pro Tier ($29/month)
- Unlimited projects
- Full cost database with regional data
- AI recommendations
- Priority matrix
- Email support

### Team Tier ($79/month)
- Everything in Pro
- 5 team members
- Vendor management
- Custom cost items
- API access
- Priority support

### Enterprise (Custom)
- Unlimited team members
- Custom integrations
- Dedicated account manager
- SLA guarantee
- White-label options

---

## Roadmap

### Phase 1: Core Platform (MVP)
- 7-step workflow
- Cost calculation engine
- Priority matrix
- Basic action plan
- Supabase integration

### Phase 2: AI & Intelligence
- AI recommendation engine (OpenAI integration)
- Market data integration
- Comparable analysis
- Smart scope generation

### Phase 3: Collaboration
- Team workspaces
- Contractor portal
- Bid management
- Real-time collaboration

### Phase 4: Advanced Features
- Mobile app (React Native)
- Photo AI analysis
- Material ordering integration
- Accounting integration (QuickBooks)

### Phase 5: Platform Expansion
- Marketplace for contractors
- Lender integrations
- MLS data integration
- API ecosystem

---

## Appendix

### Glossary
- **ARV**: After Repair Value - estimated property value post-renovation
- **ROI**: Return on Investment - profit as percentage of investment
- **CPM**: Critical Path Method - project scheduling technique
- **MoSCoW**: Must/Should/Could/Won't - prioritization framework
- **Wholetail**: Light renovation for quick resale to investors/flippers

### Competitive Landscape
- **Excel/Google Sheets**: Manual, error-prone, no intelligence
- **REI/FLIP**: Limited cost databases, no workflow
- **Buildertrend**: Construction-focused, not investor ROI
- **CoConstruct**: Too complex for individual investors

### Technical Constraints
- React Flow performance with 100+ nodes
- Cost database freshness (quarterly updates)
- Regional data coverage gaps
- AI API rate limits and costs
