-- ============================================================================
-- PHASE 3: CONVEYOR BELT RESTRUCTURE - DATABASE MIGRATION
-- ============================================================================
-- This migration adds the missing core tables for the project-centric workflow:
--   1. property_assessments - Room-by-room condition assessment
--   2. scope_items - Renovation tasks with cost/priority/scheduling
--   3. contractors - User's contractor/vendor Rolodex
--   4. project_timeline - Project schedule data
--   5. cost_items - Renovation cost catalog
--   6. regional_multipliers - Location-based pricing adjustments
-- ============================================================================

-- ============================================================================
-- TABLE 1: PROPERTY ASSESSMENTS
-- Room-by-room condition assessment for properties
-- ============================================================================

CREATE TABLE IF NOT EXISTS property_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Room Identification
  room_type VARCHAR(50) NOT NULL, -- 'kitchen', 'bathroom', 'bedroom', 'living_room', 'dining_room', 'garage', 'exterior', 'basement', 'attic'
  room_name VARCHAR(100), -- Custom name like "Primary Bathroom", "Guest Bedroom 2"
  floor_level VARCHAR(20), -- 'basement', 'main', 'upper', 'attic'

  -- Overall Condition (5-point scale)
  overall_condition VARCHAR(20) CHECK (overall_condition IN ('excellent', 'good', 'fair', 'poor', 'terrible')),

  -- Component Conditions (JSONB for flexibility)
  -- Format: { "flooring": "fair", "walls": "good", "ceiling": "good", "electrical": "poor", "plumbing": "fair", "windows": "good", "doors": "good", "hvac": "fair", "appliances": "poor" }
  components JSONB DEFAULT '{}',

  -- Actions Needed (JSONB array)
  -- Format: [{ "component": "flooring", "action": "replace", "notes": "Water damage" }, { "component": "walls", "action": "repair", "notes": "Minor cracks" }]
  actions_needed JSONB DEFAULT '[]',

  -- Room Dimensions
  length_ft DECIMAL(10,2),
  width_ft DECIMAL(10,2),
  sqft DECIMAL(10,2),
  ceiling_height_ft DECIMAL(5,2) DEFAULT 8,

  -- Notes and Media
  notes TEXT,
  photos TEXT[], -- Array of photo URLs

  -- Assessment Metadata
  assessed_by VARCHAR(100),
  assessed_at TIMESTAMPTZ DEFAULT NOW(),

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for property_assessments
CREATE INDEX IF NOT EXISTS idx_assessment_project ON property_assessments(project_id);
CREATE INDEX IF NOT EXISTS idx_assessment_room_type ON property_assessments(room_type);
CREATE INDEX IF NOT EXISTS idx_assessment_condition ON property_assessments(overall_condition);

-- Trigger for updated_at
CREATE TRIGGER update_property_assessments_updated_at
  BEFORE UPDATE ON property_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 2: CONTRACTORS
-- User's contractor/vendor Rolodex (global, not project-specific)
-- ============================================================================

CREATE TABLE IF NOT EXISTS contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,

  -- Basic Info
  name VARCHAR(200) NOT NULL,
  company VARCHAR(200),
  email VARCHAR(255),
  phone VARCHAR(50),

  -- Address
  address_street VARCHAR(255),
  address_city VARCHAR(100),
  address_state VARCHAR(50),
  address_zip VARCHAR(20),

  -- Professional Info
  specialties TEXT[], -- ['plumbing', 'electrical', 'hvac', 'roofing', 'flooring', 'painting', 'kitchen', 'bathroom', 'general']
  vendor_type VARCHAR(50) CHECK (vendor_type IN ('contractor', 'supplier', 'service_provider')),
  license_number VARCHAR(100),
  license_expiration DATE,
  insurance_coverage VARCHAR(255),
  insurance_expiration DATE,

  -- Financial
  hourly_rate DECIMAL(10,2),
  markup_percent DECIMAL(5,2),
  payment_terms VARCHAR(100), -- 'net_30', 'on_completion', '50_50', 'milestone'

  -- Performance
  rating DECIMAL(3,2) CHECK (rating >= 0 AND rating <= 5),
  completed_projects INT DEFAULT 0,
  total_spent DECIMAL(12,2) DEFAULT 0,

  -- Status
  is_active BOOLEAN DEFAULT true,
  is_preferred BOOLEAN DEFAULT false,
  notes TEXT,

  -- Tags for easy filtering
  tags TEXT[],

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for contractors
CREATE INDEX IF NOT EXISTS idx_contractor_user ON contractors(user_id);
CREATE INDEX IF NOT EXISTS idx_contractor_active ON contractors(user_id, is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_contractor_preferred ON contractors(user_id, is_preferred) WHERE is_preferred = true;
CREATE INDEX IF NOT EXISTS idx_contractor_specialties ON contractors USING GIN(specialties);
CREATE INDEX IF NOT EXISTS idx_contractor_type ON contractors(vendor_type);

-- Trigger for updated_at
CREATE TRIGGER update_contractors_updated_at
  BEFORE UPDATE ON contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 3: COST ITEMS CATALOG
-- Renovation cost catalog with pricing tiers
-- ============================================================================

CREATE TABLE IF NOT EXISTS cost_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Categorization
  category VARCHAR(50) NOT NULL, -- 'exterior', 'interior', 'systems', 'structural'
  subcategory VARCHAR(100) NOT NULL, -- 'kitchen', 'bathroom', 'flooring', 'electrical', 'plumbing', etc.
  name VARCHAR(200) NOT NULL,
  description TEXT,

  -- Pricing
  unit VARCHAR(50) NOT NULL, -- 'sqft', 'lnft', 'each', 'hour', 'job'
  base_cost DECIMAL(12,2) NOT NULL,
  labor_percent DECIMAL(5,2) DEFAULT 40, -- % of cost that is labor

  -- Quality Tier Multipliers
  budget_multiplier DECIMAL(4,2) DEFAULT 0.75,
  standard_multiplier DECIMAL(4,2) DEFAULT 1.00,
  premium_multiplier DECIMAL(4,2) DEFAULT 1.50,
  luxury_multiplier DECIMAL(4,2) DEFAULT 2.20,

  -- Difficulty/Complexity
  difficulty VARCHAR(20) DEFAULT 'moderate' CHECK (difficulty IN ('simple', 'moderate', 'complex')),
  difficulty_multiplier DECIMAL(4,2) DEFAULT 1.00,

  -- Timing
  estimated_hours DECIMAL(6,2),
  typical_duration_days INT,

  -- ROI Data
  typical_roi DECIMAL(5,2), -- Expected ROI percentage
  buyer_appeal_score INT CHECK (buyer_appeal_score >= 0 AND buyer_appeal_score <= 100),

  -- Dependencies
  common_dependencies TEXT[], -- Other items typically needed with this

  -- Metadata
  is_active BOOLEAN DEFAULT true,
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for cost_items
CREATE INDEX IF NOT EXISTS idx_cost_category ON cost_items(category);
CREATE INDEX IF NOT EXISTS idx_cost_subcategory ON cost_items(subcategory);
CREATE INDEX IF NOT EXISTS idx_cost_active ON cost_items(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_cost_name_search ON cost_items(name);

-- Trigger for updated_at
CREATE TRIGGER update_cost_items_updated_at
  BEFORE UPDATE ON cost_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 4: SCOPE ITEMS
-- Individual renovation tasks for a project
-- ============================================================================

CREATE TABLE IF NOT EXISTS scope_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- What
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(50) NOT NULL, -- 'exterior', 'interior', 'systems', 'structural'
  subcategory VARCHAR(100), -- 'kitchen', 'bathroom', 'flooring', etc.

  -- Location
  room_id UUID REFERENCES property_assessments(id) ON DELETE SET NULL,
  room_type VARCHAR(50), -- Denormalized for convenience
  room_name VARCHAR(100),

  -- Cost Item Reference (optional - for catalog items)
  cost_item_id UUID REFERENCES cost_items(id) ON DELETE SET NULL,

  -- Quantity & Quality
  quantity DECIMAL(10,2) DEFAULT 1,
  unit VARCHAR(50) DEFAULT 'each', -- 'sqft', 'lnft', 'each', 'hour'
  quality_tier VARCHAR(20) DEFAULT 'standard' CHECK (quality_tier IN ('budget', 'standard', 'premium', 'luxury')),

  -- Costs (calculated or manually set)
  labor_cost DECIMAL(12,2),
  material_cost DECIMAL(12,2),
  total_cost DECIMAL(12,2),

  -- Priority (MoSCoW method)
  priority VARCHAR(20) DEFAULT 'should' CHECK (priority IN ('must', 'should', 'could', 'nice')),

  -- Scoring (0-100 each)
  urgency_score INT DEFAULT 50 CHECK (urgency_score >= 0 AND urgency_score <= 100),
  roi_score INT DEFAULT 50 CHECK (roi_score >= 0 AND roi_score <= 100),
  risk_score INT DEFAULT 50 CHECK (risk_score >= 0 AND risk_score <= 100),
  overall_score INT DEFAULT 50 CHECK (overall_score >= 0 AND overall_score <= 100),

  -- Scheduling
  phase INT DEFAULT 1, -- Which phase this belongs to
  estimated_days INT,
  start_date DATE,
  end_date DATE,
  dependencies UUID[], -- Array of scope_item IDs this depends on

  -- Assignment
  contractor_id UUID REFERENCES contractors(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,

  -- Status
  status VARCHAR(20) DEFAULT 'planned' CHECK (status IN ('planned', 'scheduled', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  completed_at TIMESTAMPTZ,
  actual_cost DECIMAL(12,2),

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for scope_items
CREATE INDEX IF NOT EXISTS idx_scope_project ON scope_items(project_id);
CREATE INDEX IF NOT EXISTS idx_scope_category ON scope_items(category);
CREATE INDEX IF NOT EXISTS idx_scope_room ON scope_items(room_id);
CREATE INDEX IF NOT EXISTS idx_scope_priority ON scope_items(priority);
CREATE INDEX IF NOT EXISTS idx_scope_status ON scope_items(status);
CREATE INDEX IF NOT EXISTS idx_scope_phase ON scope_items(project_id, phase);
CREATE INDEX IF NOT EXISTS idx_scope_contractor ON scope_items(contractor_id);
CREATE INDEX IF NOT EXISTS idx_scope_overall_score ON scope_items(overall_score DESC);

-- Trigger for updated_at
CREATE TRIGGER update_scope_items_updated_at
  BEFORE UPDATE ON scope_items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 5: PROJECT TIMELINE
-- Project schedule/timeline data
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,

  -- Schedule
  start_date DATE,
  target_end_date DATE,
  actual_end_date DATE,

  -- Phases (JSONB for flexibility)
  -- Format: [{ "name": "Demo", "phase_number": 1, "start": "2024-01-01", "end": "2024-01-07", "scope_item_ids": [...], "status": "completed" }]
  phases JSONB DEFAULT '[]',

  -- Critical Path (array of scope_item IDs on critical path)
  critical_path UUID[],

  -- Calculated totals
  total_estimated_days INT,
  total_actual_days INT,

  -- Status
  is_locked BOOLEAN DEFAULT false, -- Lock to prevent auto-recalculation

  -- Notes
  notes TEXT,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one timeline per project
  UNIQUE(project_id)
);

-- Indexes for project_timeline
CREATE INDEX IF NOT EXISTS idx_timeline_project ON project_timeline(project_id);

-- Trigger for updated_at
CREATE TRIGGER update_project_timeline_updated_at
  BEFORE UPDATE ON project_timeline
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- TABLE 6: REGIONAL MULTIPLIERS
-- Location-based pricing adjustments
-- ============================================================================

CREATE TABLE IF NOT EXISTS regional_multipliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Location
  zip_code VARCHAR(10) NOT NULL,
  city VARCHAR(100),
  state VARCHAR(50) NOT NULL,
  metro_area VARCHAR(100),

  -- Multipliers
  labor_multiplier DECIMAL(4,2) DEFAULT 1.00,
  material_multiplier DECIMAL(4,2) DEFAULT 1.00,
  overall_multiplier DECIMAL(4,2) DEFAULT 1.00,

  -- Market conditions (optional)
  market_temperature VARCHAR(20), -- 'hot', 'warm', 'neutral', 'cool', 'cold'
  avg_days_on_market INT,

  -- Data quality
  data_source VARCHAR(100),
  last_updated TIMESTAMPTZ DEFAULT NOW(),

  -- Ensure one entry per zip
  UNIQUE(zip_code)
);

-- Indexes for regional_multipliers
CREATE INDEX IF NOT EXISTS idx_regional_zip ON regional_multipliers(zip_code);
CREATE INDEX IF NOT EXISTS idx_regional_state ON regional_multipliers(state);
CREATE INDEX IF NOT EXISTS idx_regional_metro ON regional_multipliers(metro_area);

-- ============================================================================
-- TABLE 7: PROJECT CONTRACTORS (Junction table)
-- Links contractors to specific projects with project-specific notes
-- ============================================================================

CREATE TABLE IF NOT EXISTS project_contractors (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  contractor_id UUID NOT NULL REFERENCES contractors(id) ON DELETE CASCADE,

  -- Role in this project
  role VARCHAR(100), -- 'general_contractor', 'plumber', 'electrician', etc.

  -- Project-specific info
  agreed_rate DECIMAL(10,2),
  contract_amount DECIMAL(12,2),
  payment_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'partial', 'paid'
  amount_paid DECIMAL(12,2) DEFAULT 0,

  -- Notes
  notes TEXT,

  -- Status
  is_active BOOLEAN DEFAULT true,

  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- One contractor assignment per role per project
  UNIQUE(project_id, contractor_id)
);

-- Indexes for project_contractors
CREATE INDEX IF NOT EXISTS idx_proj_contractor_project ON project_contractors(project_id);
CREATE INDEX IF NOT EXISTS idx_proj_contractor_contractor ON project_contractors(contractor_id);

-- Trigger for updated_at
CREATE TRIGGER update_project_contractors_updated_at
  BEFORE UPDATE ON project_contractors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all new tables
ALTER TABLE property_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE contractors ENABLE ROW LEVEL SECURITY;
ALTER TABLE cost_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE scope_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE regional_multipliers ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_contractors ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS Policies: property_assessments (owner access via project)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their project assessments"
  ON property_assessments FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert assessments to their projects"
  ON property_assessments FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project assessments"
  ON property_assessments FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project assessments"
  ON property_assessments FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: contractors (owner access)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their contractors"
  ON contractors FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert contractors"
  ON contractors FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their contractors"
  ON contractors FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "Users can delete their contractors"
  ON contractors FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

-- ---------------------------------------------------------------------------
-- RLS Policies: cost_items (public read)
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can view active cost items"
  ON cost_items FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert cost items"
  ON cost_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update cost items"
  ON cost_items FOR UPDATE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- RLS Policies: scope_items (owner access via project)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their project scope items"
  ON scope_items FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert scope items to their projects"
  ON scope_items FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project scope items"
  ON scope_items FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project scope items"
  ON scope_items FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: project_timeline (owner access via project)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their project timeline"
  ON project_timeline FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert timeline for their projects"
  ON project_timeline FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project timeline"
  ON project_timeline FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project timeline"
  ON project_timeline FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: regional_multipliers (public read)
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can view regional multipliers"
  ON regional_multipliers FOR SELECT
  USING (true);

-- ---------------------------------------------------------------------------
-- RLS Policies: project_contractors (owner access via project)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their project contractors"
  ON project_contractors FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert contractors to their projects"
  ON project_contractors FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project contractors"
  ON project_contractors FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project contractors"
  ON project_contractors FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM projects WHERE user_id = auth.uid()
    )
  );

-- ============================================================================
-- UPDATE EXISTING TABLES: Add FK constraints now that scope_items exists
-- ============================================================================

-- Add foreign key for project_color_selections -> scope_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'project_color_selections_linked_scope_item_id_fkey'
  ) THEN
    ALTER TABLE project_color_selections
    ADD CONSTRAINT project_color_selections_linked_scope_item_id_fkey
    FOREIGN KEY (linked_scope_item_id) REFERENCES scope_items(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key for project_material_selections -> scope_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'project_material_selections_linked_scope_item_id_fkey'
  ) THEN
    ALTER TABLE project_material_selections
    ADD CONSTRAINT project_material_selections_linked_scope_item_id_fkey
    FOREIGN KEY (linked_scope_item_id) REFERENCES scope_items(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add foreign key for moodboard_elements -> scope_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE constraint_name = 'moodboard_elements_linked_scope_item_id_fkey'
  ) THEN
    ALTER TABLE moodboard_elements
    ADD CONSTRAINT moodboard_elements_linked_scope_item_id_fkey
    FOREIGN KEY (linked_scope_item_id) REFERENCES scope_items(id) ON DELETE SET NULL;
  END IF;
END $$;

-- ============================================================================
-- GRANTS
-- ============================================================================

GRANT ALL ON property_assessments TO service_role;
GRANT ALL ON contractors TO service_role;
GRANT ALL ON cost_items TO service_role;
GRANT ALL ON scope_items TO service_role;
GRANT ALL ON project_timeline TO service_role;
GRANT ALL ON regional_multipliers TO service_role;
GRANT ALL ON project_contractors TO service_role;

-- ============================================================================
-- SEED DATA: Cost Items Catalog
-- ============================================================================

INSERT INTO cost_items (category, subcategory, name, description, unit, base_cost, labor_percent, budget_multiplier, standard_multiplier, premium_multiplier, luxury_multiplier, difficulty, estimated_hours, typical_roi, buyer_appeal_score) VALUES
-- EXTERIOR
('exterior', 'roofing', 'Roof Replacement - Asphalt Shingles', 'Complete tear-off and replace with architectural shingles', 'sqft', 5.50, 45, 0.70, 1.00, 1.40, 2.00, 'complex', 0.15, 107, 85),
('exterior', 'roofing', 'Roof Repair - Shingles', 'Repair damaged shingles and flashing', 'sqft', 3.00, 60, 0.80, 1.00, 1.30, 1.50, 'moderate', 0.10, 150, 70),
('exterior', 'siding', 'Siding - Vinyl', 'Install new vinyl siding', 'sqft', 6.00, 50, 0.70, 1.00, 1.50, 2.20, 'moderate', 0.12, 80, 75),
('exterior', 'siding', 'Siding - Hardie Board', 'Install fiber cement siding', 'sqft', 10.00, 55, 0.80, 1.00, 1.30, 1.60, 'complex', 0.18, 85, 85),
('exterior', 'windows', 'Window Replacement - Vinyl', 'Replace with energy-efficient vinyl windows', 'each', 450.00, 35, 0.70, 1.00, 1.50, 2.50, 'moderate', 2.00, 73, 80),
('exterior', 'doors', 'Entry Door Replacement', 'Replace front entry door', 'each', 1200.00, 30, 0.60, 1.00, 1.80, 3.00, 'moderate', 4.00, 101, 90),
('exterior', 'garage', 'Garage Door Replacement', 'Replace garage door with opener', 'each', 1500.00, 25, 0.70, 1.00, 1.60, 2.50, 'moderate', 6.00, 94, 85),
('exterior', 'landscaping', 'Basic Landscaping', 'Lawn, shrubs, mulch, basic plantings', 'sqft', 3.00, 70, 0.60, 1.00, 1.80, 3.00, 'simple', 0.05, 100, 90),
('exterior', 'driveway', 'Driveway - Concrete', 'Pour new concrete driveway', 'sqft', 8.00, 55, 0.80, 1.00, 1.30, 1.50, 'complex', 0.08, 75, 70),
('exterior', 'fence', 'Privacy Fence - Wood', 'Install 6ft wood privacy fence', 'lnft', 35.00, 50, 0.70, 1.00, 1.50, 2.00, 'moderate', 0.20, 65, 75),

-- INTERIOR - KITCHEN
('interior', 'kitchen', 'Kitchen Cabinets - Stock', 'Install stock kitchen cabinets', 'lnft', 200.00, 40, 0.60, 1.00, 2.00, 3.50, 'complex', 1.50, 75, 95),
('interior', 'kitchen', 'Kitchen Cabinets - Semi-Custom', 'Install semi-custom cabinets', 'lnft', 350.00, 35, 0.70, 1.00, 1.50, 2.50, 'complex', 2.00, 80, 95),
('interior', 'kitchen', 'Cabinet Refacing', 'Reface existing cabinet doors and drawers', 'lnft', 150.00, 55, 0.80, 1.00, 1.30, 1.60, 'moderate', 1.00, 85, 80),
('interior', 'kitchen', 'Countertops - Laminate', 'Install laminate countertops', 'sqft', 25.00, 45, 0.80, 1.00, 1.20, 1.40, 'moderate', 0.30, 60, 60),
('interior', 'kitchen', 'Countertops - Quartz', 'Install quartz countertops', 'sqft', 75.00, 30, 0.80, 1.00, 1.30, 1.80, 'complex', 0.40, 85, 95),
('interior', 'kitchen', 'Countertops - Granite', 'Install granite countertops', 'sqft', 65.00, 30, 0.80, 1.00, 1.40, 2.00, 'complex', 0.40, 80, 90),
('interior', 'kitchen', 'Backsplash - Subway Tile', 'Install subway tile backsplash', 'sqft', 20.00, 60, 0.70, 1.00, 1.50, 2.00, 'moderate', 0.50, 90, 85),
('interior', 'kitchen', 'Kitchen Sink & Faucet', 'Replace sink and faucet', 'each', 450.00, 40, 0.60, 1.00, 2.00, 4.00, 'moderate', 3.00, 80, 80),
('interior', 'kitchen', 'Appliance Package - Standard', 'Replace all major appliances (basic)', 'job', 3500.00, 10, 0.70, 1.00, 1.80, 3.00, 'simple', 4.00, 75, 90),

-- INTERIOR - BATHROOM
('interior', 'bathroom', 'Bathroom Full Remodel - Basic', 'Complete bathroom remodel (basic fixtures)', 'job', 8000.00, 55, 0.70, 1.00, 1.60, 2.50, 'complex', 40.00, 70, 95),
('interior', 'bathroom', 'Vanity Replacement', 'Replace bathroom vanity with top', 'each', 600.00, 40, 0.60, 1.00, 2.00, 4.00, 'moderate', 4.00, 80, 85),
('interior', 'bathroom', 'Toilet Replacement', 'Replace toilet', 'each', 300.00, 35, 0.70, 1.00, 1.50, 3.00, 'simple', 2.00, 90, 70),
('interior', 'bathroom', 'Tub/Shower Surround', 'Install tub/shower surround', 'each', 800.00, 50, 0.70, 1.00, 1.80, 3.00, 'moderate', 8.00, 75, 80),
('interior', 'bathroom', 'Tile Floor - Bathroom', 'Install porcelain tile floor', 'sqft', 12.00, 60, 0.70, 1.00, 1.50, 2.00, 'moderate', 0.40, 85, 85),
('interior', 'bathroom', 'Walk-In Shower Conversion', 'Convert tub to walk-in shower', 'each', 5000.00, 55, 0.70, 1.00, 1.60, 2.50, 'complex', 24.00, 80, 90),

-- INTERIOR - FLOORING
('interior', 'flooring', 'LVP Flooring', 'Install luxury vinyl plank flooring', 'sqft', 6.00, 50, 0.70, 1.00, 1.40, 1.80, 'simple', 0.15, 95, 90),
('interior', 'flooring', 'Hardwood Flooring', 'Install engineered hardwood', 'sqft', 10.00, 45, 0.70, 1.00, 1.50, 2.20, 'moderate', 0.20, 90, 95),
('interior', 'flooring', 'Hardwood Refinishing', 'Sand and refinish existing hardwood', 'sqft', 4.00, 70, 0.80, 1.00, 1.30, 1.50, 'moderate', 0.10, 110, 90),
('interior', 'flooring', 'Carpet', 'Install new carpet with pad', 'sqft', 4.50, 40, 0.60, 1.00, 1.60, 2.50, 'simple', 0.08, 70, 70),
('interior', 'flooring', 'Tile Flooring', 'Install porcelain tile', 'sqft', 12.00, 55, 0.70, 1.00, 1.50, 2.20, 'moderate', 0.35, 85, 85),

-- INTERIOR - PAINT
('interior', 'paint', 'Interior Paint - Per Room', 'Prep, prime, and paint (walls and ceiling)', 'room', 400.00, 80, 0.70, 1.00, 1.40, 1.80, 'simple', 8.00, 107, 85),
('interior', 'paint', 'Interior Paint - Whole House', 'Paint entire interior', 'sqft', 2.50, 80, 0.70, 1.00, 1.40, 1.80, 'moderate', 0.04, 107, 85),
('interior', 'paint', 'Cabinet Painting', 'Prep and paint kitchen cabinets', 'lnft', 50.00, 85, 0.80, 1.00, 1.30, 1.50, 'complex', 0.80, 95, 90),
('interior', 'paint', 'Exterior Paint', 'Prep and paint exterior', 'sqft', 3.00, 75, 0.70, 1.00, 1.40, 1.80, 'moderate', 0.05, 55, 75),

-- INTERIOR - TRIM & FINISHES
('interior', 'trim', 'Baseboard - Install', 'Install new baseboards', 'lnft', 4.00, 55, 0.70, 1.00, 1.50, 2.00, 'simple', 0.08, 75, 70),
('interior', 'trim', 'Crown Molding', 'Install crown molding', 'lnft', 8.00, 60, 0.80, 1.00, 1.40, 2.00, 'moderate', 0.12, 70, 75),
('interior', 'trim', 'Interior Door Replacement', 'Replace interior door (hollow core)', 'each', 250.00, 45, 0.60, 1.00, 1.80, 3.00, 'simple', 2.00, 75, 70),
('interior', 'trim', 'Door Hardware Package', 'Replace all door knobs/levers', 'each', 35.00, 30, 0.60, 1.00, 2.00, 4.00, 'simple', 0.25, 85, 75),

-- SYSTEMS - ELECTRICAL
('systems', 'electrical', 'Electrical Panel Upgrade', 'Upgrade to 200 amp panel', 'each', 2500.00, 70, 0.80, 1.00, 1.20, 1.40, 'complex', 12.00, 65, 60),
('systems', 'electrical', 'Add Outlets/Switches', 'Add new electrical outlet or switch', 'each', 200.00, 75, 0.80, 1.00, 1.20, 1.40, 'moderate', 2.00, 70, 50),
('systems', 'electrical', 'Light Fixture Replacement', 'Replace light fixture', 'each', 150.00, 40, 0.50, 1.00, 2.00, 4.00, 'simple', 1.00, 85, 80),
('systems', 'electrical', 'Recessed Lighting', 'Install recessed lighting (per can)', 'each', 200.00, 60, 0.70, 1.00, 1.40, 2.00, 'moderate', 2.00, 90, 85),

-- SYSTEMS - PLUMBING
('systems', 'plumbing', 'Water Heater - Tank', 'Replace tank water heater', 'each', 1200.00, 45, 0.70, 1.00, 1.40, 2.00, 'moderate', 4.00, 60, 50),
('systems', 'plumbing', 'Water Heater - Tankless', 'Install tankless water heater', 'each', 3500.00, 50, 0.80, 1.00, 1.30, 1.60, 'complex', 8.00, 65, 70),
('systems', 'plumbing', 'Re-pipe House - PEX', 'Replace all supply lines with PEX', 'sqft', 4.00, 80, 0.80, 1.00, 1.20, 1.40, 'complex', 0.08, 60, 40),
('systems', 'plumbing', 'Drain Cleaning/Repair', 'Clean or repair drain lines', 'job', 500.00, 85, 0.80, 1.00, 1.20, 1.40, 'moderate', 4.00, 70, 40),

-- SYSTEMS - HVAC
('systems', 'hvac', 'HVAC System Replacement', 'Replace full HVAC system', 'each', 8000.00, 50, 0.80, 1.00, 1.30, 1.60, 'complex', 16.00, 71, 75),
('systems', 'hvac', 'AC Unit Replacement', 'Replace AC condenser unit', 'each', 4500.00, 45, 0.80, 1.00, 1.30, 1.60, 'complex', 8.00, 65, 70),
('systems', 'hvac', 'Furnace Replacement', 'Replace gas furnace', 'each', 3500.00, 50, 0.80, 1.00, 1.30, 1.60, 'complex', 8.00, 60, 65),
('systems', 'hvac', 'Ductwork - New/Replace', 'Install or replace ductwork', 'lnft', 35.00, 70, 0.80, 1.00, 1.20, 1.40, 'complex', 0.30, 55, 50),

-- STRUCTURAL
('structural', 'foundation', 'Foundation Crack Repair', 'Repair foundation cracks', 'lnft', 75.00, 75, 0.80, 1.00, 1.20, 1.40, 'complex', 0.50, 50, 30),
('structural', 'framing', 'Wall Removal - Non-Load Bearing', 'Remove non-load bearing wall', 'lnft', 50.00, 85, 0.80, 1.00, 1.20, 1.40, 'moderate', 0.50, 75, 70),
('structural', 'framing', 'Wall Removal - Load Bearing', 'Remove load bearing wall with beam', 'lnft', 250.00, 75, 0.80, 1.00, 1.20, 1.40, 'complex', 1.50, 80, 80),
('structural', 'drywall', 'Drywall Repair', 'Patch and repair drywall', 'sqft', 5.00, 70, 0.80, 1.00, 1.20, 1.40, 'simple', 0.15, 90, 50),
('structural', 'drywall', 'Drywall - New', 'Install new drywall', 'sqft', 3.50, 65, 0.80, 1.00, 1.20, 1.40, 'moderate', 0.10, 80, 45),
('structural', 'insulation', 'Attic Insulation', 'Add blown-in insulation', 'sqft', 2.00, 50, 0.80, 1.00, 1.20, 1.40, 'simple', 0.03, 117, 60),
('structural', 'demo', 'Demolition - General', 'General demolition and haul-off', 'sqft', 4.00, 90, 0.80, 1.00, 1.20, 1.40, 'simple', 0.05, 100, 0);

-- ============================================================================
-- SEED DATA: Regional Multipliers (Major US Markets)
-- ============================================================================

INSERT INTO regional_multipliers (zip_code, city, state, metro_area, labor_multiplier, material_multiplier, overall_multiplier, market_temperature) VALUES
-- High Cost Markets
('10001', 'New York', 'NY', 'New York-Newark-Jersey City', 1.85, 1.20, 1.52, 'hot'),
('94102', 'San Francisco', 'CA', 'San Francisco-Oakland-Berkeley', 1.90, 1.25, 1.58, 'hot'),
('90210', 'Los Angeles', 'CA', 'Los Angeles-Long Beach-Anaheim', 1.45, 1.15, 1.30, 'warm'),
('98101', 'Seattle', 'WA', 'Seattle-Tacoma-Bellevue', 1.40, 1.10, 1.25, 'warm'),
('02101', 'Boston', 'MA', 'Boston-Cambridge-Newton', 1.50, 1.15, 1.32, 'warm'),
('20001', 'Washington', 'DC', 'Washington-Arlington-Alexandria', 1.35, 1.10, 1.22, 'warm'),

-- Medium Cost Markets
('60601', 'Chicago', 'IL', 'Chicago-Naperville-Elgin', 1.20, 1.05, 1.12, 'neutral'),
('80202', 'Denver', 'CO', 'Denver-Aurora-Lakewood', 1.15, 1.05, 1.10, 'warm'),
('30301', 'Atlanta', 'GA', 'Atlanta-Sandy Springs-Alpharetta', 1.00, 1.00, 1.00, 'warm'),
('75201', 'Dallas', 'TX', 'Dallas-Fort Worth-Arlington', 0.95, 0.98, 0.96, 'warm'),
('33101', 'Miami', 'FL', 'Miami-Fort Lauderdale-Pompano Beach', 1.10, 1.05, 1.07, 'hot'),
('85001', 'Phoenix', 'AZ', 'Phoenix-Mesa-Chandler', 0.95, 1.00, 0.98, 'warm'),

-- Lower Cost Markets
('55401', 'Minneapolis', 'MN', 'Minneapolis-St. Paul-Bloomington', 1.05, 1.00, 1.02, 'neutral'),
('48201', 'Detroit', 'MI', 'Detroit-Warren-Dearborn', 0.90, 0.95, 0.92, 'cool'),
('63101', 'St. Louis', 'MO', 'St. Louis', 0.85, 0.95, 0.90, 'neutral'),
('44101', 'Cleveland', 'OH', 'Cleveland-Elyria', 0.85, 0.92, 0.88, 'cool'),
('15201', 'Pittsburgh', 'PA', 'Pittsburgh', 0.90, 0.95, 0.92, 'neutral'),
('46201', 'Indianapolis', 'IN', 'Indianapolis-Carmel-Anderson', 0.88, 0.95, 0.91, 'neutral');

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
