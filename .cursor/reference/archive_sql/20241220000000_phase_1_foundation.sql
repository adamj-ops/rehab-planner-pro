-- ============================================================================
-- PHASE 1 FOUNDATION MIGRATION
-- Core tables that all other features depend on
-- Deploy this BEFORE Phase 2A design intelligence migration
-- ============================================================================

-- ============================================================================
-- USERS TABLE
-- ============================================================================

CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_id UUID UNIQUE NOT NULL, -- Links to auth.users from Supabase Auth
  
  -- Profile
  email VARCHAR(255) NOT NULL,
  full_name VARCHAR(100),
  company_name VARCHAR(100),
  phone VARCHAR(20),
  
  -- Preferences
  default_location VARCHAR(100), -- Default property location
  timezone VARCHAR(100) DEFAULT 'America/Chicago',
  
  -- Subscription (for future)
  subscription_tier VARCHAR(50) DEFAULT 'free', -- free, pro, team, enterprise
  subscription_status VARCHAR(50) DEFAULT 'active',
  trial_ends_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);

-- ============================================================================
-- PROJECTS TABLE (CORE ENTITY)
-- ============================================================================

CREATE TABLE projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  project_name VARCHAR(200) NOT NULL,
  status VARCHAR(50) DEFAULT 'draft', -- draft, planning, active, paused, completed, archived
  completion_percentage INT DEFAULT 0, -- 0-100
  
  -- Property Details
  address_street VARCHAR(200),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  address_full TEXT, -- Computed full address for display
  
  property_type VARCHAR(50), -- single_family, multi_family, condo, townhome
  square_footage INT,
  lot_size_sqft INT,
  year_built INT,
  bedrooms INT,
  bathrooms DECIMAL(3,1),
  
  -- Property Condition
  overall_condition VARCHAR(50), -- excellent, good, fair, poor, gut_needed
  condition_notes TEXT,
  
  -- Strategy & Goals
  investment_strategy VARCHAR(50), -- flip, rental, wholetail, airbnb, personal_residence
  target_market VARCHAR(50), -- first_time_buyer, move_up, investor, luxury, family
  design_style VARCHAR(50), -- modern_farmhouse, contemporary, traditional, transitional
  
  -- Financials
  purchase_price DECIMAL(12,2),
  arv DECIMAL(12,2), -- After Repair Value
  max_budget DECIMAL(12,2),
  actual_total_cost DECIMAL(12,2),
  estimated_sale_price DECIMAL(12,2),
  
  target_roi_percentage DECIMAL(5,2),
  actual_roi_percentage DECIMAL(5,2),
  
  -- Budget Breakdown
  acquisition_cost DECIMAL(12,2),
  rehab_budget DECIMAL(12,2),
  holding_costs DECIMAL(12,2),
  selling_costs DECIMAL(12,2),
  financing_costs DECIMAL(12,2),
  
  contingency_percentage DECIMAL(5,2) DEFAULT 15,
  contingency_amount DECIMAL(12,2),
  
  -- Timeline
  start_date DATE,
  target_completion_date DATE,
  actual_completion_date DATE,
  duration_days INT,
  
  -- Workflow Progress (7-step wizard)
  current_step INT DEFAULT 1, -- Which wizard step user is on
  property_details_complete BOOLEAN DEFAULT false,
  condition_assessment_complete BOOLEAN DEFAULT false,
  strategy_goals_complete BOOLEAN DEFAULT false,
  scope_building_complete BOOLEAN DEFAULT false,
  priority_analysis_complete BOOLEAN DEFAULT false,
  action_plan_complete BOOLEAN DEFAULT false,
  final_review_complete BOOLEAN DEFAULT false,
  
  -- Media
  hero_image_url VARCHAR(500),
  property_images JSONB, -- Array of image URLs
  
  -- Metadata
  notes TEXT,
  tags TEXT[], -- For filtering/searching
  is_template BOOLEAN DEFAULT false, -- Can be used as template for new projects
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_projects_user ON projects(user_id);
CREATE INDEX idx_projects_status ON projects(status);
CREATE INDEX idx_projects_strategy ON projects(investment_strategy);
CREATE INDEX idx_projects_created ON projects(created_at DESC);

-- ============================================================================
-- SCOPE ITEMS (Renovation Work Items)
-- ============================================================================

CREATE TABLE scope_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Item Classification
  category VARCHAR(50) NOT NULL, -- exterior, interior, systems, structural, landscaping
  subcategory VARCHAR(50), -- More specific grouping
  item_name VARCHAR(200) NOT NULL,
  description TEXT,
  
  -- Location
  room_type VARCHAR(50), -- kitchen, bathroom, bedroom, living_room, exterior
  room_name VARCHAR(100), -- Custom room name if needed
  
  -- Specifications
  quantity DECIMAL(10,2) DEFAULT 1,
  unit_type VARCHAR(50) DEFAULT 'each', -- sq_ft, linear_ft, each, room, unit
  
  quality_tier VARCHAR(50) DEFAULT 'standard', -- budget, standard, premium, luxury
  
  -- Costing
  cost_per_unit DECIMAL(10,2),
  labor_cost DECIMAL(10,2),
  material_cost DECIMAL(10,2),
  permit_cost DECIMAL(10,2),
  total_cost DECIMAL(10,2) NOT NULL,
  
  -- Cost Notes
  cost_notes TEXT,
  cost_breakdown JSONB, -- Detailed cost breakdown if needed
  
  -- Prioritization
  priority VARCHAR(50) DEFAULT 'should', -- must, should, could, nice_to_have
  urgency_score INT DEFAULT 50, -- 0-100
  roi_impact_score INT DEFAULT 50, -- 0-100
  buyer_appeal_score INT DEFAULT 50, -- 0-100
  
  -- ROI Data
  estimated_value_add DECIMAL(10,2), -- How much this adds to property value
  estimated_roi_percentage DECIMAL(5,2), -- (value_add / cost) * 100
  
  -- Timeline
  estimated_duration_days INT DEFAULT 1,
  earliest_start_date DATE,
  latest_finish_date DATE,
  actual_start_date DATE,
  actual_completion_date DATE,
  
  -- Dependencies
  depends_on_item_ids UUID[], -- Array of scope_item IDs that must complete first
  blocks_item_ids UUID[], -- Array of scope_item IDs that are blocked by this
  
  -- Assignment
  assigned_vendor_id UUID, -- Will reference vendors table
  vendor_bid_amount DECIMAL(10,2),
  vendor_notes TEXT,
  
  -- Status Tracking
  is_approved BOOLEAN DEFAULT false,
  approved_by_client BOOLEAN DEFAULT false,
  is_in_progress BOOLEAN DEFAULT false,
  is_completed BOOLEAN DEFAULT false,
  completed_date DATE,
  
  -- Photos/Documentation
  before_images JSONB, -- Array of image URLs
  after_images JSONB,
  documentation_urls JSONB, -- Permits, receipts, warranties
  
  -- Display
  sort_order INT DEFAULT 0, -- For manual ordering
  is_hidden BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_scope_items_project ON scope_items(project_id);
CREATE INDEX idx_scope_items_category ON scope_items(category);
CREATE INDEX idx_scope_items_priority ON scope_items(priority);
CREATE INDEX idx_scope_items_status ON scope_items(is_completed);
CREATE INDEX idx_scope_items_vendor ON scope_items(assigned_vendor_id) WHERE assigned_vendor_id IS NOT NULL;

-- ============================================================================
-- VENDORS (Contractors, Suppliers, Service Providers)
-- ============================================================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(200) NOT NULL,
  company_name VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(20),
  website VARCHAR(255),
  
  -- Address
  address_street VARCHAR(200),
  address_city VARCHAR(100),
  address_state VARCHAR(2),
  address_zip VARCHAR(10),
  
  -- Vendor Details
  vendor_type VARCHAR(50), -- general_contractor, specialty_contractor, supplier, service_provider
  specialties TEXT[], -- Array: ['plumbing', 'electrical', 'hvac', 'flooring', etc.]
  
  -- Compliance
  license_number VARCHAR(100),
  license_state VARCHAR(2),
  license_expiration DATE,
  is_licensed BOOLEAN DEFAULT false,
  
  insurance_provider VARCHAR(200),
  insurance_policy_number VARCHAR(100),
  insurance_coverage_amount DECIMAL(12,2),
  insurance_expiration DATE,
  is_insured BOOLEAN DEFAULT false,
  
  bonded BOOLEAN DEFAULT false,
  bond_amount DECIMAL(12,2),
  
  -- Performance Tracking
  rating DECIMAL(3,2), -- 0-5 stars
  completed_projects INT DEFAULT 0,
  on_time_percentage DECIMAL(5,2),
  on_budget_percentage DECIMAL(5,2),
  
  total_spent DECIMAL(12,2) DEFAULT 0,
  total_savings DECIMAL(12,2) DEFAULT 0, -- Came in under budget
  
  -- Financials
  hourly_rate DECIMAL(8,2),
  markup_percentage DECIMAL(5,2),
  payment_terms VARCHAR(100), -- Net 30, 50% upfront, etc.
  accepts_credit_card BOOLEAN DEFAULT false,
  
  -- Contact Preferences
  preferred_contact_method VARCHAR(50), -- email, phone, text
  availability_notes TEXT,
  timezone VARCHAR(100),
  
  -- Relationships
  referred_by VARCHAR(200), -- Who referred this vendor
  has_contract BOOLEAN DEFAULT false,
  contract_expiration DATE,
  
  -- Status
  is_active BOOLEAN DEFAULT true,
  is_preferred BOOLEAN DEFAULT false,
  is_blacklisted BOOLEAN DEFAULT false,
  blacklist_reason TEXT,
  
  -- Notes & Documents
  notes TEXT,
  documents JSONB, -- Array of document URLs (licenses, insurance, contracts)
  
  -- Metadata
  tags TEXT[], -- For categorization
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_vendors_user ON vendors(user_id);
CREATE INDEX idx_vendors_type ON vendors(vendor_type);
CREATE INDEX idx_vendors_active ON vendors(is_active) WHERE is_active = true;
CREATE INDEX idx_vendors_preferred ON vendors(is_preferred) WHERE is_preferred = true;
CREATE INDEX idx_vendors_specialties ON vendors USING GIN(specialties);

-- ============================================================================
-- PROJECT ROOMS (Detailed room inventory)
-- ============================================================================

CREATE TABLE project_rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Room Identity
  room_type VARCHAR(50) NOT NULL, -- kitchen, bathroom, bedroom, living_room, etc.
  room_name VARCHAR(100), -- Custom name: "Primary Bedroom", "Guest Bath #2"
  floor_level VARCHAR(50), -- basement, main, upper, attic
  
  -- Dimensions
  length_ft DECIMAL(5,2),
  width_ft DECIMAL(5,2),
  height_ft DECIMAL(5,2),
  square_footage DECIMAL(8,2),
  
  -- Condition Assessment
  overall_condition VARCHAR(50), -- excellent, good, fair, poor
  condition_notes TEXT,
  
  -- Features
  has_window BOOLEAN DEFAULT false,
  window_count INT,
  has_closet BOOLEAN DEFAULT false,
  
  -- Existing Finishes
  existing_flooring VARCHAR(100),
  existing_walls VARCHAR(100),
  existing_ceiling VARCHAR(100),
  existing_fixtures TEXT[],
  
  -- Planned Updates
  needs_renovation BOOLEAN DEFAULT false,
  renovation_scope TEXT,
  estimated_room_budget DECIMAL(10,2),
  
  -- Priority
  renovation_priority VARCHAR(50), -- high, medium, low
  
  -- Photos
  condition_photos JSONB, -- Array of before photos
  inspiration_photos JSONB, -- Reference images
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_rooms_project ON project_rooms(project_id);
CREATE INDEX idx_rooms_type ON project_rooms(room_type);

-- ============================================================================
-- PROJECT FINANCIALS (Detailed cost tracking)
-- ============================================================================

CREATE TABLE project_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Transaction Details
  transaction_type VARCHAR(50) NOT NULL, -- expense, income, deposit, refund
  category VARCHAR(50) NOT NULL, -- materials, labor, permit, inspection, etc.
  
  description TEXT NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  
  -- Related Entities
  vendor_id UUID REFERENCES vendors(id),
  scope_item_id UUID REFERENCES scope_items(id),
  
  -- Payment Details
  payment_method VARCHAR(50), -- cash, check, credit_card, bank_transfer
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, overdue
  
  -- Dates
  transaction_date DATE NOT NULL,
  due_date DATE,
  paid_date DATE,
  
  -- Documentation
  receipt_url VARCHAR(500),
  invoice_number VARCHAR(100),
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_transactions_project ON project_transactions(project_id);
CREATE INDEX idx_transactions_vendor ON project_transactions(vendor_id) WHERE vendor_id IS NOT NULL;
CREATE INDEX idx_transactions_date ON project_transactions(transaction_date DESC);
CREATE INDEX idx_transactions_status ON project_transactions(payment_status);

-- ============================================================================
-- HELPER FUNCTIONS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at 
  BEFORE UPDATE ON users 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_projects_updated_at 
  BEFORE UPDATE ON projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_scope_items_updated_at 
  BEFORE UPDATE ON scope_items 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendors_updated_at 
  BEFORE UPDATE ON vendors 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_rooms_updated_at 
  BEFORE UPDATE ON project_rooms 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_transactions_updated_at 
  BEFORE UPDATE ON project_transactions 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_transactions ENABLE ROW LEVEL SECURITY;

-- Users: Can only see/modify their own profile
CREATE POLICY "Users can view own profile" 
  ON users FOR SELECT 
  TO authenticated 
  USING (auth_id = auth.uid());

CREATE POLICY "Users can update own profile" 
  ON users FOR UPDATE 
  TO authenticated 
  USING (auth_id = auth.uid());

-- Projects: Users can only see/modify their own projects
CREATE POLICY "Users can view own projects" 
  ON projects FOR SELECT 
  TO authenticated 
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can create projects" 
  ON projects FOR INSERT 
  TO authenticated 
  WITH CHECK (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can update own projects" 
  ON projects FOR UPDATE 
  TO authenticated 
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can delete own projects" 
  ON projects FOR DELETE 
  TO authenticated 
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Scope Items: Via project ownership
CREATE POLICY "Users can view scope items for own projects" 
  ON scope_items FOR SELECT 
  TO authenticated 
  USING (project_id IN (
    SELECT id FROM projects WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  ));

CREATE POLICY "Users can manage scope items for own projects" 
  ON scope_items FOR ALL 
  TO authenticated 
  USING (project_id IN (
    SELECT id FROM projects WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  ));

-- Vendors: Users can only see/modify their own vendors
CREATE POLICY "Users can view own vendors" 
  ON vendors FOR SELECT 
  TO authenticated 
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

CREATE POLICY "Users can manage own vendors" 
  ON vendors FOR ALL 
  TO authenticated 
  USING (user_id IN (SELECT id FROM users WHERE auth_id = auth.uid()));

-- Project Rooms: Via project ownership
CREATE POLICY "Users can manage rooms for own projects" 
  ON project_rooms FOR ALL 
  TO authenticated 
  USING (project_id IN (
    SELECT id FROM projects WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  ));

-- Transactions: Via project ownership
CREATE POLICY "Users can manage transactions for own projects" 
  ON project_transactions FOR ALL 
  TO authenticated 
  USING (project_id IN (
    SELECT id FROM projects WHERE user_id IN (SELECT id FROM users WHERE auth_id = auth.uid())
  ));

-- ============================================================================
-- SEED DATA (Optional - for development)
-- ============================================================================

-- Seed some common scope item categories for reference
-- (Can be used to populate dropdowns in UI)

-- ============================================================================
-- END OF PHASE 1 FOUNDATION MIGRATION
-- ============================================================================
