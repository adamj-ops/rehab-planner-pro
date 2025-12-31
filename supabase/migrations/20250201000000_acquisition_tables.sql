-- ============================================================================
-- ACQUISITION MODULE TABLES
-- Deal Finder / Pre-Flip Acquisition Pipeline
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- ENUM TYPES
-- ============================================================================

-- Lead sources
CREATE TYPE lead_source AS ENUM (
  'wholesaler',
  'mls',
  'direct_mail',
  'driving_for_dollars',
  'referral',
  'cold_call',
  'online_marketing',
  'auction',
  'fsbo',
  'other'
);

-- Pipeline phases (matches our 5-phase methodology)
CREATE TYPE acquisition_phase AS ENUM (
  'phase_1_screening',
  'phase_2_market_analysis', 
  'phase_3_due_diligence',
  'phase_4_deal_analysis',
  'phase_5_contract',
  'passed',
  'closed'
);

-- Property condition ratings
CREATE TYPE condition_rating AS ENUM (
  'excellent',
  'good', 
  'fair',
  'poor',
  'critical'
);

-- Market temperature
CREATE TYPE market_temperature AS ENUM (
  'cold',
  'cool',
  'neutral',
  'warm',
  'hot'
);

-- Offer status
CREATE TYPE offer_status AS ENUM (
  'draft',
  'submitted',
  'countered',
  'accepted',
  'rejected',
  'expired',
  'withdrawn'
);

-- Contract milestone status
CREATE TYPE milestone_status AS ENUM (
  'pending',
  'in_progress',
  'completed',
  'blocked',
  'skipped'
);

-- ============================================================================
-- CORE TABLES
-- ============================================================================

-- Property Leads (main acquisition entity)
CREATE TABLE property_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  
  -- Basic Info
  address TEXT NOT NULL,
  city TEXT NOT NULL,
  state TEXT NOT NULL DEFAULT 'MN',
  zip TEXT NOT NULL,
  county TEXT,
  
  -- Property Details
  property_type TEXT, -- SFR, duplex, triplex, etc.
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  sqft INTEGER,
  lot_sqft INTEGER,
  year_built INTEGER,
  
  -- Lead Info
  source lead_source NOT NULL DEFAULT 'other',
  source_detail TEXT, -- specific wholesaler name, etc.
  asking_price NUMERIC(12,2),
  days_on_market INTEGER,
  seller_motivation TEXT,
  seller_name TEXT,
  seller_phone TEXT,
  seller_email TEXT,
  
  -- Pipeline Status
  current_phase acquisition_phase NOT NULL DEFAULT 'phase_1_screening',
  phase_entered_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Quick Screening Score (Phase 1)
  screening_score INTEGER, -- 0-100
  screening_notes TEXT,
  
  -- Pass/Archive Info
  pass_reason TEXT,
  passed_at TIMESTAMPTZ,
  
  -- Tracking
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  -- Indexes
  CONSTRAINT valid_screening_score CHECK (screening_score IS NULL OR (screening_score >= 0 AND screening_score <= 100))
);

-- Create indexes
CREATE INDEX idx_property_leads_user ON property_leads(user_id);
CREATE INDEX idx_property_leads_phase ON property_leads(current_phase);
CREATE INDEX idx_property_leads_created ON property_leads(created_at DESC);
CREATE INDEX idx_property_leads_address ON property_leads(address);

-- ============================================================================
-- PHASE 2: MARKET ANALYSIS
-- ============================================================================

CREATE TABLE market_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES property_leads(id) ON DELETE CASCADE,
  
  -- Neighborhood Health Metrics (0-10 scale)
  appreciation_rate NUMERIC(5,2), -- annual %
  avg_dom INTEGER,
  inventory_months NUMERIC(4,2),
  list_to_sale_ratio NUMERIC(5,2), -- as percentage
  crime_index INTEGER, -- 1-10, 10 being safest
  school_rating INTEGER, -- 1-10
  employment_score INTEGER, -- 1-10
  rental_demand_score INTEGER, -- 1-10
  
  -- Market Velocity Score (calculated 0-12)
  velocity_score INTEGER,
  market_temp market_temperature,
  
  -- Target Buyer Profile
  target_buyer TEXT, -- 'first_time', 'move_up', 'investor', 'downsizer'
  target_price_range_low NUMERIC(12,2),
  target_price_range_high NUMERIC(12,2),
  
  -- ARV Calculation
  arv_estimate NUMERIC(12,2),
  arv_confidence INTEGER, -- 0-100
  arv_method TEXT, -- 'comp_based', 'sqft_based', 'hybrid'
  arv_notes TEXT,
  
  -- Analysis metadata
  analyzed_at TIMESTAMPTZ DEFAULT NOW(),
  analyzed_by UUID REFERENCES auth.users(id),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(lead_id)
);

-- ============================================================================
-- COMPS (for ARV calculation)
-- ============================================================================

CREATE TABLE comps (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES property_leads(id) ON DELETE CASCADE,
  market_analysis_id UUID REFERENCES market_analysis(id) ON DELETE CASCADE,
  
  -- Comp Property Info
  address TEXT NOT NULL,
  sale_price NUMERIC(12,2) NOT NULL,
  sale_date DATE NOT NULL,
  
  -- Property Details
  bedrooms INTEGER,
  bathrooms NUMERIC(3,1),
  sqft INTEGER,
  year_built INTEGER,
  condition TEXT,
  
  -- Calculated
  price_per_sqft NUMERIC(8,2),
  
  -- Adjustments
  adjustment_sqft NUMERIC(10,2) DEFAULT 0,
  adjustment_bedrooms NUMERIC(10,2) DEFAULT 0,
  adjustment_bathrooms NUMERIC(10,2) DEFAULT 0,
  adjustment_condition NUMERIC(10,2) DEFAULT 0,
  adjustment_age NUMERIC(10,2) DEFAULT 0,
  adjustment_other NUMERIC(10,2) DEFAULT 0,
  adjustment_notes TEXT,
  
  -- Total adjusted value
  adjusted_value NUMERIC(12,2),
  
  -- Distance from subject
  distance_miles NUMERIC(4,2),
  
  -- Relevance score (how good a comp is this)
  relevance_score INTEGER, -- 0-100
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_comps_lead ON comps(lead_id);

-- ============================================================================
-- PHASE 3: DUE DILIGENCE
-- ============================================================================

CREATE TABLE due_diligence (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES property_leads(id) ON DELETE CASCADE,
  
  -- Inspection Checklist stored as JSONB for flexibility
  -- Structure: { "exterior": [...items], "interior": [...items] }
  inspection_checklist JSONB DEFAULT '{}',
  
  -- Overall condition
  overall_condition condition_rating,
  
  -- Rehab Estimate (summary from inspection)
  estimated_rehab_cost NUMERIC(12,2),
  rehab_confidence INTEGER, -- 0-100
  rehab_scope TEXT, -- 'cosmetic', 'moderate', 'major', 'gut'
  
  -- Red Flags
  red_flags JSONB DEFAULT '[]', -- array of {flag, severity, notes}
  
  -- Title & Legal
  title_status TEXT,
  liens_found BOOLEAN DEFAULT FALSE,
  liens_details TEXT,
  hoa_exists BOOLEAN,
  hoa_monthly NUMERIC(8,2),
  hoa_special_assessments TEXT,
  zoning TEXT,
  permits_required TEXT,
  
  -- Seller Assessment
  seller_timeline TEXT,
  seller_flexibility INTEGER, -- 1-10
  ownership_situation TEXT, -- 'owner_occupied', 'vacant', 'tenant', 'inherited'
  
  -- Photos/Documents stored as URLs
  photos JSONB DEFAULT '[]',
  documents JSONB DEFAULT '[]',
  
  -- Inspection metadata
  inspected_at TIMESTAMPTZ,
  inspected_by TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(lead_id)
);

-- ============================================================================
-- PHASE 4: DEAL ANALYSIS
-- ============================================================================

CREATE TABLE deal_analysis (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES property_leads(id) ON DELETE CASCADE,
  
  -- ARV (from market analysis or override)
  arv NUMERIC(12,2) NOT NULL,
  
  -- Acquisition Costs
  purchase_price NUMERIC(12,2),
  closing_costs_buy NUMERIC(10,2),
  
  -- Rehab Costs (can be detailed breakdown in JSONB)
  rehab_total NUMERIC(12,2),
  rehab_breakdown JSONB DEFAULT '{}', -- {category: amount}
  contingency_percent NUMERIC(4,2) DEFAULT 15,
  
  -- Holding Costs
  holding_months NUMERIC(4,2) DEFAULT 6,
  monthly_taxes NUMERIC(8,2),
  monthly_insurance NUMERIC(8,2),
  monthly_utilities NUMERIC(8,2),
  monthly_hoa NUMERIC(8,2),
  monthly_loan_payment NUMERIC(10,2),
  holding_total NUMERIC(12,2),
  
  -- Selling Costs
  agent_commission_percent NUMERIC(4,2) DEFAULT 5,
  closing_costs_sell NUMERIC(10,2),
  selling_total NUMERIC(12,2),
  
  -- Calculated Results
  total_investment NUMERIC(12,2),
  expected_profit NUMERIC(12,2),
  roi_percent NUMERIC(6,2),
  cash_on_cash NUMERIC(6,2),
  
  -- Rule Checks (stored for quick reference)
  passes_70_rule BOOLEAN,
  passes_75_rule BOOLEAN,
  passes_min_profit BOOLEAN, -- $30k minimum
  passes_min_roi BOOLEAN, -- 15% minimum
  
  -- Scenarios stored as JSONB
  -- {conservative: {...}, base: {...}, optimistic: {...}}
  scenarios JSONB DEFAULT '{}',
  
  -- Risk Assessment
  risk_factors JSONB DEFAULT '[]', -- [{factor, probability, impact, score}]
  overall_risk_score INTEGER, -- 0-100
  risk_level TEXT, -- 'low', 'medium', 'high'
  
  -- Maximum Allowable Offer calculation
  mao_70 NUMERIC(12,2),
  mao_75 NUMERIC(12,2),
  desired_profit NUMERIC(12,2),
  calculated_mao NUMERIC(12,2),
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(lead_id)
);

-- ============================================================================
-- OFFERS
-- ============================================================================

CREATE TABLE offers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES property_leads(id) ON DELETE CASCADE,
  deal_analysis_id UUID REFERENCES deal_analysis(id),
  
  -- Offer Details
  offer_amount NUMERIC(12,2) NOT NULL,
  earnest_money NUMERIC(10,2),
  
  -- Terms
  contingencies JSONB DEFAULT '[]', -- ['inspection', 'financing', 'appraisal']
  inspection_period_days INTEGER DEFAULT 10,
  closing_days INTEGER DEFAULT 30,
  financing_type TEXT, -- 'cash', 'conventional', 'hard_money', 'private'
  
  -- Strategy
  offer_round INTEGER DEFAULT 1, -- 1st offer, counter, etc.
  strategy_notes TEXT,
  justification TEXT,
  
  -- Status
  status offer_status NOT NULL DEFAULT 'draft',
  submitted_at TIMESTAMPTZ,
  response_at TIMESTAMPTZ,
  response_notes TEXT,
  
  -- Counter offer tracking
  counter_amount NUMERIC(12,2),
  counter_terms TEXT,
  
  -- Document
  offer_document_url TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_offers_lead ON offers(lead_id);
CREATE INDEX idx_offers_status ON offers(status);

-- ============================================================================
-- PHASE 5: CONTRACTS
-- ============================================================================

CREATE TABLE contracts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES property_leads(id) ON DELETE CASCADE,
  offer_id UUID REFERENCES offers(id),
  
  -- Contract Details
  contract_price NUMERIC(12,2) NOT NULL,
  earnest_money_amount NUMERIC(10,2),
  earnest_money_due_date DATE,
  earnest_money_received BOOLEAN DEFAULT FALSE,
  
  -- Key Dates
  effective_date DATE,
  inspection_deadline DATE,
  financing_deadline DATE,
  appraisal_deadline DATE,
  closing_date DATE,
  
  -- Parties
  title_company TEXT,
  title_company_contact TEXT,
  title_company_phone TEXT,
  
  -- Milestones tracked as JSONB for flexibility
  -- [{name, status, due_date, completed_date, notes}]
  milestones JSONB DEFAULT '[]',
  
  -- Pre-close Checklist
  -- {financing: [...], insurance: [...], contractors: [...], utilities: [...]}
  preclose_checklist JSONB DEFAULT '{}',
  
  -- Documents
  documents JSONB DEFAULT '[]', -- [{name, url, uploaded_at, type}]
  
  -- Status
  status TEXT DEFAULT 'active', -- 'active', 'closed', 'terminated'
  closed_at TIMESTAMPTZ,
  termination_reason TEXT,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  
  UNIQUE(lead_id)
);

-- ============================================================================
-- ACTIVITY LOG (for audit trail)
-- ============================================================================

CREATE TABLE lead_activity_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  lead_id UUID NOT NULL REFERENCES property_leads(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  
  activity_type TEXT NOT NULL, -- 'phase_change', 'note', 'offer', 'document', etc.
  description TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_lead_activity_lead ON lead_activity_log(lead_id);
CREATE INDEX idx_lead_activity_created ON lead_activity_log(created_at DESC);

-- ============================================================================
-- UPDATED_AT TRIGGERS
-- ============================================================================

-- Create trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Apply to all tables
CREATE TRIGGER update_property_leads_updated_at
  BEFORE UPDATE ON property_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_market_analysis_updated_at
  BEFORE UPDATE ON market_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_due_diligence_updated_at
  BEFORE UPDATE ON due_diligence
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_deal_analysis_updated_at
  BEFORE UPDATE ON deal_analysis
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_offers_updated_at
  BEFORE UPDATE ON offers
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_contracts_updated_at
  BEFORE UPDATE ON contracts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY
-- ============================================================================

ALTER TABLE property_leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE market_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE comps ENABLE ROW LEVEL SECURITY;
ALTER TABLE due_diligence ENABLE ROW LEVEL SECURITY;
ALTER TABLE deal_analysis ENABLE ROW LEVEL SECURITY;
ALTER TABLE offers ENABLE ROW LEVEL SECURITY;
ALTER TABLE contracts ENABLE ROW LEVEL SECURITY;
ALTER TABLE lead_activity_log ENABLE ROW LEVEL SECURITY;

-- Property Leads policies
CREATE POLICY "Users can view own leads"
  ON property_leads FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own leads"
  ON property_leads FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own leads"
  ON property_leads FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own leads"
  ON property_leads FOR DELETE
  USING (auth.uid() = user_id);

-- Related tables - access via lead ownership
CREATE POLICY "Users can manage market_analysis for own leads"
  ON market_analysis FOR ALL
  USING (lead_id IN (SELECT id FROM property_leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage comps for own leads"
  ON comps FOR ALL
  USING (lead_id IN (SELECT id FROM property_leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage due_diligence for own leads"
  ON due_diligence FOR ALL
  USING (lead_id IN (SELECT id FROM property_leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage deal_analysis for own leads"
  ON deal_analysis FOR ALL
  USING (lead_id IN (SELECT id FROM property_leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage offers for own leads"
  ON offers FOR ALL
  USING (lead_id IN (SELECT id FROM property_leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can manage contracts for own leads"
  ON contracts FOR ALL
  USING (lead_id IN (SELECT id FROM property_leads WHERE user_id = auth.uid()));

CREATE POLICY "Users can view activity for own leads"
  ON lead_activity_log FOR ALL
  USING (lead_id IN (SELECT id FROM property_leads WHERE user_id = auth.uid()));

-- ============================================================================
-- HELPFUL VIEWS
-- ============================================================================

-- Pipeline summary view
CREATE OR REPLACE VIEW pipeline_summary AS
SELECT 
  user_id,
  current_phase,
  COUNT(*) as count,
  SUM(asking_price) as total_value,
  AVG(screening_score) as avg_score
FROM property_leads
WHERE current_phase NOT IN ('passed', 'closed')
GROUP BY user_id, current_phase;

-- Deal metrics view  
CREATE OR REPLACE VIEW deal_metrics AS
SELECT 
  pl.id as lead_id,
  pl.address,
  pl.asking_price,
  pl.current_phase,
  ma.arv_estimate,
  ma.velocity_score,
  dd.estimated_rehab_cost,
  da.expected_profit,
  da.roi_percent,
  da.passes_70_rule,
  da.overall_risk_score
FROM property_leads pl
LEFT JOIN market_analysis ma ON ma.lead_id = pl.id
LEFT JOIN due_diligence dd ON dd.lead_id = pl.id
LEFT JOIN deal_analysis da ON da.lead_id = pl.id;

-- ============================================================================
-- COMMENTS
-- ============================================================================

COMMENT ON TABLE property_leads IS 'Main entity for acquisition pipeline - tracks properties from lead to close';
COMMENT ON TABLE market_analysis IS 'Phase 2 - neighborhood health, ARV calculation, market velocity';
COMMENT ON TABLE comps IS 'Comparable sales used for ARV calculation';
COMMENT ON TABLE due_diligence IS 'Phase 3 - inspection results, red flags, title/legal';
COMMENT ON TABLE deal_analysis IS 'Phase 4 - full financial analysis, ROI, scenarios';
COMMENT ON TABLE offers IS 'Offer history and negotiation tracking';
COMMENT ON TABLE contracts IS 'Phase 5 - contract execution, milestones, closing';
