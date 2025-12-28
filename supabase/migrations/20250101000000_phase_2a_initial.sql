-- ============================================================================
-- PHASE 2A: DESIGN INTELLIGENCE - DATABASE MIGRATION
-- ============================================================================
-- This migration creates the schema for:
--   Part 1: Color & Material System
--   Part 2: Moodboard System
--   Part 3: Portfolio System (settings only)
-- ============================================================================

-- ============================================================================
-- HELPER FUNCTION: Update updated_at timestamp
-- ============================================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- PART 1: COLOR & MATERIAL SYSTEM
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table: color_library
-- Core color library (Sherwin Williams + others)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS color_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Brand & Identification
  brand VARCHAR(50) NOT NULL, -- 'sherwin_williams', 'benjamin_moore', 'custom'
  color_code VARCHAR(20), -- 'SW 7005', 'BM 2125-50', null for custom
  color_name VARCHAR(100) NOT NULL, -- 'Pure White', 'Simply White'
  
  -- Color Data
  hex_code VARCHAR(7) NOT NULL, -- '#FFFFFF'
  rgb_values JSONB NOT NULL, -- {r: 255, g: 255, b: 255}
  
  -- Technical Specs
  lrv INT, -- Light Reflectance Value (0-100)
  undertones TEXT[], -- ['warm', 'cool', 'neutral']
  color_family VARCHAR(50), -- 'white', 'gray', 'beige', 'blue', etc.
  
  -- Application
  finish_options TEXT[], -- ['flat', 'eggshell', 'satin', 'semi-gloss', 'gloss']
  recommended_rooms TEXT[], -- ['kitchen', 'bathroom', 'exterior', etc.]
  recommended_surfaces TEXT[], -- ['walls', 'trim', 'cabinets', 'doors']
  
  -- Metadata
  image_url VARCHAR(500), -- Color chip/swatch image
  popular BOOLEAN DEFAULT false, -- Trending/popular colors
  year_introduced INT,
  is_active BOOLEAN DEFAULT true,
  
  -- Design Style Associations
  design_styles TEXT[], -- ['modern_farmhouse', 'contemporary', etc.]
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for color_library
CREATE INDEX IF NOT EXISTS idx_color_brand ON color_library(brand);
CREATE INDEX IF NOT EXISTS idx_color_family ON color_library(color_family);
CREATE INDEX IF NOT EXISTS idx_color_popular ON color_library(popular) WHERE popular = true;
CREATE INDEX IF NOT EXISTS idx_color_styles ON color_library USING GIN(design_styles);
CREATE INDEX IF NOT EXISTS idx_color_name_search ON color_library(color_name);
CREATE INDEX IF NOT EXISTS idx_color_hex ON color_library(hex_code);

-- Trigger for updated_at
CREATE TRIGGER update_color_library_updated_at 
  BEFORE UPDATE ON color_library 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Table: color_palettes
-- Coordinated color schemes (curated palettes)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Palette Info
  name VARCHAR(100) NOT NULL, -- 'Modern Farmhouse Neutral', 'Bold Contemporary'
  description TEXT,
  design_style VARCHAR(50), -- 'modern_farmhouse', 'contemporary', etc.
  
  -- Colors in Palette (ordered)
  primary_color_id UUID REFERENCES color_library(id) ON DELETE SET NULL,
  secondary_color_id UUID REFERENCES color_library(id) ON DELETE SET NULL,
  accent_color_ids UUID[], -- Array of color IDs for accents
  
  -- Usage Recommendations
  recommended_for TEXT[], -- ['first_time_buyer', 'luxury', 'rental']
  price_range VARCHAR(50), -- 'under_300k', '300k_500k', 'over_500k'
  
  -- Metadata
  is_trending BOOLEAN DEFAULT false,
  usage_count INT DEFAULT 0, -- Track popularity
  created_by_system BOOLEAN DEFAULT true, -- vs. user-created
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for color_palettes
CREATE INDEX IF NOT EXISTS idx_palette_style ON color_palettes(design_style);
CREATE INDEX IF NOT EXISTS idx_palette_trending ON color_palettes(is_trending) WHERE is_trending = true;
CREATE INDEX IF NOT EXISTS idx_palette_primary_color ON color_palettes(primary_color_id);

-- Trigger for updated_at
CREATE TRIGGER update_color_palettes_updated_at 
  BEFORE UPDATE ON color_palettes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Table: project_color_selections
-- User's color selections for a project
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_color_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  -- Location in Property
  room_type VARCHAR(50) NOT NULL, -- 'kitchen', 'primary_bedroom', 'exterior'
  room_name VARCHAR(100), -- 'Kitchen', 'Primary Bedroom', custom name
  surface_type VARCHAR(50) NOT NULL, -- 'walls', 'trim', 'ceiling', 'cabinets', 'doors'
  
  -- Color Selection
  color_id UUID REFERENCES color_library(id) ON DELETE SET NULL,
  custom_color_name VARCHAR(100), -- If not from library
  custom_hex_code VARCHAR(7), -- If custom color
  
  -- Application Details
  finish VARCHAR(50), -- 'eggshell', 'satin', etc.
  coats INT DEFAULT 2,
  primer_needed BOOLEAN DEFAULT false,
  
  -- Scope Linking (optional - reference if scope_items table exists)
  linked_scope_item_id UUID,
  
  -- Notes
  notes TEXT,
  application_instructions TEXT,
  
  -- Status
  is_primary BOOLEAN DEFAULT false, -- Primary color for this room
  is_approved BOOLEAN DEFAULT false,
  approved_by_client BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for project_color_selections
CREATE INDEX IF NOT EXISTS idx_project_colors ON project_color_selections(project_id);
CREATE INDEX IF NOT EXISTS idx_color_room ON project_color_selections(project_id, room_type);
CREATE INDEX IF NOT EXISTS idx_color_selection_color ON project_color_selections(color_id);
CREATE INDEX IF NOT EXISTS idx_color_surface ON project_color_selections(surface_type);

-- Trigger for updated_at
CREATE TRIGGER update_project_color_selections_updated_at 
  BEFORE UPDATE ON project_color_selections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Table: material_library
-- Material library (countertops, flooring, tile, hardware, etc.)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS material_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Material Identification
  material_type VARCHAR(50) NOT NULL, -- 'countertop', 'flooring', 'tile', 'hardware', 'fixture'
  material_category VARCHAR(50), -- 'quartz', 'lvp', 'subway_tile', 'cabinet_pull'
  
  -- Product Details
  brand VARCHAR(100),
  product_name VARCHAR(200) NOT NULL,
  model_number VARCHAR(100),
  sku VARCHAR(100),
  
  -- Description
  description TEXT,
  color_description VARCHAR(200), -- 'White with gray veining'
  finish VARCHAR(100), -- 'Polished', 'Matte', 'Brushed nickel'
  
  -- Specifications
  dimensions VARCHAR(100), -- '3x12', '12x24', '1.5" diameter'
  thickness VARCHAR(50),
  material_composition VARCHAR(200), -- '93% quartz, 7% resin'
  
  -- Pricing (average, can be overridden per project)
  avg_cost_per_unit DECIMAL(10,2),
  unit_type VARCHAR(50), -- 'sq_ft', 'linear_ft', 'each', 'box'
  
  -- Sourcing
  suppliers JSONB, -- [{name: 'MSI', contact: '...', lead_time: '2-3 weeks'}]
  typical_lead_time_days INT,
  
  -- Visual Assets
  image_url VARCHAR(500),
  swatch_image_url VARCHAR(500), -- Close-up material sample
  additional_images JSONB, -- Array of image URLs
  
  -- Compatibility
  recommended_for TEXT[], -- ['kitchen_counter', 'bathroom_vanity']
  design_styles TEXT[], -- ['modern_farmhouse', 'contemporary']
  
  -- Metadata
  popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for material_library
CREATE INDEX IF NOT EXISTS idx_material_type ON material_library(material_type);
CREATE INDEX IF NOT EXISTS idx_material_category ON material_library(material_category);
CREATE INDEX IF NOT EXISTS idx_material_popular ON material_library(popular) WHERE popular = true;
CREATE INDEX IF NOT EXISTS idx_material_styles ON material_library USING GIN(design_styles);
CREATE INDEX IF NOT EXISTS idx_material_name_search ON material_library(product_name);
CREATE INDEX IF NOT EXISTS idx_material_brand ON material_library(brand);

-- Trigger for updated_at
CREATE TRIGGER update_material_library_updated_at 
  BEFORE UPDATE ON material_library 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Table: project_material_selections
-- User's material selections for a project
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS project_material_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  -- Location
  room_type VARCHAR(50), -- 'kitchen', 'bathroom', etc.
  room_name VARCHAR(100),
  application VARCHAR(100) NOT NULL, -- 'Kitchen countertops', 'Primary bath tile'
  
  -- Material Selection
  material_id UUID REFERENCES material_library(id) ON DELETE SET NULL,
  custom_material_name VARCHAR(200), -- If not from library
  custom_description TEXT,
  
  -- Quantity & Pricing
  quantity DECIMAL(10,2),
  unit_type VARCHAR(50),
  cost_per_unit DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  
  -- Sourcing
  selected_supplier VARCHAR(200),
  order_date DATE,
  expected_delivery_date DATE,
  
  -- Scope Linking (optional)
  linked_scope_item_id UUID,
  
  -- Notes
  notes TEXT,
  installation_notes TEXT,
  
  -- Status
  is_approved BOOLEAN DEFAULT false,
  is_ordered BOOLEAN DEFAULT false,
  is_received BOOLEAN DEFAULT false,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for project_material_selections
CREATE INDEX IF NOT EXISTS idx_project_materials ON project_material_selections(project_id);
CREATE INDEX IF NOT EXISTS idx_material_selection_material ON project_material_selections(material_id);
CREATE INDEX IF NOT EXISTS idx_material_room ON project_material_selections(project_id, room_type);
CREATE INDEX IF NOT EXISTS idx_material_status ON project_material_selections(is_ordered, is_received);

-- Trigger for updated_at
CREATE TRIGGER update_project_material_selections_updated_at 
  BEFORE UPDATE ON project_material_selections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- PART 2: MOODBOARD SYSTEM
-- ============================================================================

-- ---------------------------------------------------------------------------
-- Table: moodboards
-- Moodboard containers
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  
  -- Basic Info
  name VARCHAR(100) NOT NULL, -- 'Kitchen Inspiration', 'Overall Design'
  description TEXT,
  
  -- Type & Purpose
  moodboard_type VARCHAR(50) DEFAULT 'custom', -- 'whole_house', 'kitchen', 'bathroom', 'exterior', 'custom'
  is_primary BOOLEAN DEFAULT false, -- Primary moodboard for project
  
  -- Layout Configuration
  template_used VARCHAR(50), -- 'blank', 'grid_4x4', 'magazine', 'pinterest'
  layout_type VARCHAR(50) DEFAULT 'free', -- 'free', 'grid', 'magazine'
  canvas_width INT DEFAULT 1920,
  canvas_height INT DEFAULT 1080,
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  background_image_url VARCHAR(500),
  
  -- Settings
  show_grid BOOLEAN DEFAULT true,
  grid_size INT DEFAULT 20, -- pixels
  snap_to_grid BOOLEAN DEFAULT true,
  
  -- Sharing & Export
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(100) UNIQUE, -- For sharing: /moodboard/{slug}
  password_protected BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  
  -- Usage Tracking
  view_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for moodboards
CREATE INDEX IF NOT EXISTS idx_moodboard_project ON moodboards(project_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_public ON moodboards(is_public) WHERE is_public = true;
CREATE INDEX IF NOT EXISTS idx_moodboard_slug ON moodboards(public_slug) WHERE public_slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moodboard_type ON moodboards(moodboard_type);
CREATE INDEX IF NOT EXISTS idx_moodboard_primary ON moodboards(project_id, is_primary) WHERE is_primary = true;

-- Trigger for updated_at
CREATE TRIGGER update_moodboards_updated_at 
  BEFORE UPDATE ON moodboards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Table: moodboard_elements
-- Individual elements on a moodboard
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moodboard_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  
  -- Element Type
  element_type VARCHAR(50) NOT NULL, -- 'image', 'color_swatch', 'text', 'material_sample', 'shape'
  
  -- Layout & Position (absolute positioning)
  position_x INT NOT NULL DEFAULT 0, -- X coordinate (px)
  position_y INT NOT NULL DEFAULT 0, -- Y coordinate (px)
  width INT NOT NULL DEFAULT 200, -- Width (px)
  height INT NOT NULL DEFAULT 200, -- Height (px)
  rotation DECIMAL(5,2) DEFAULT 0, -- Degrees
  z_index INT DEFAULT 0, -- Layering
  
  -- Styling
  opacity DECIMAL(3,2) DEFAULT 1.0, -- 0.0 to 1.0
  border_width INT DEFAULT 0,
  border_color VARCHAR(7),
  border_radius INT DEFAULT 0,
  shadow_enabled BOOLEAN DEFAULT false,
  shadow_config JSONB, -- {offsetX, offsetY, blur, color}
  
  -- FOR IMAGE ELEMENTS
  image_url VARCHAR(500),
  image_source VARCHAR(50), -- 'upload', 'unsplash', 'pexels', 'stock', 'project_photo'
  image_attribution TEXT, -- For stock images
  original_image_width INT,
  original_image_height INT,
  crop_config JSONB, -- {x, y, width, height} for cropping
  
  -- FOR COLOR SWATCH ELEMENTS
  color_id UUID REFERENCES color_library(id) ON DELETE SET NULL,
  swatch_shape VARCHAR(50) DEFAULT 'square', -- 'square', 'circle', 'rounded'
  show_color_name BOOLEAN DEFAULT true,
  show_color_code BOOLEAN DEFAULT true,
  
  -- FOR TEXT ELEMENTS
  text_content TEXT,
  font_family VARCHAR(100) DEFAULT 'Inter',
  font_size INT DEFAULT 16,
  font_weight VARCHAR(20) DEFAULT 'normal', -- 'normal', 'bold', '600', etc.
  font_style VARCHAR(20) DEFAULT 'normal', -- 'normal', 'italic'
  text_color VARCHAR(7) DEFAULT '#000000',
  text_align VARCHAR(20) DEFAULT 'left', -- 'left', 'center', 'right'
  line_height DECIMAL(3,2) DEFAULT 1.5,
  
  -- FOR MATERIAL SAMPLE ELEMENTS
  material_id UUID REFERENCES material_library(id) ON DELETE SET NULL,
  material_sample_image_url VARCHAR(500),
  show_material_name BOOLEAN DEFAULT true,
  show_material_specs BOOLEAN DEFAULT false,
  
  -- FOR SHAPE ELEMENTS
  shape_type VARCHAR(50), -- 'rectangle', 'circle', 'line', 'arrow'
  fill_color VARCHAR(7),
  stroke_color VARCHAR(7),
  stroke_width INT,
  
  -- Linking (optional - scope_items may not exist yet)
  linked_scope_item_id UUID,
  linked_color_selection_id UUID REFERENCES project_color_selections(id) ON DELETE SET NULL,
  linked_material_selection_id UUID REFERENCES project_material_selections(id) ON DELETE SET NULL,
  
  -- Notes & Metadata
  notes TEXT,
  tags TEXT[], -- For filtering/searching within moodboard
  
  -- Lock & Visibility
  is_locked BOOLEAN DEFAULT false, -- Prevent editing
  is_visible BOOLEAN DEFAULT true, -- Show/hide
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for moodboard_elements
CREATE INDEX IF NOT EXISTS idx_moodboard_elem_board ON moodboard_elements(moodboard_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_elem_type ON moodboard_elements(element_type);
CREATE INDEX IF NOT EXISTS idx_moodboard_elem_z ON moodboard_elements(moodboard_id, z_index);
CREATE INDEX IF NOT EXISTS idx_moodboard_elem_color ON moodboard_elements(color_id) WHERE color_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moodboard_elem_material ON moodboard_elements(material_id) WHERE material_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moodboard_elem_visible ON moodboard_elements(moodboard_id, is_visible) WHERE is_visible = true;

-- Trigger for updated_at
CREATE TRIGGER update_moodboard_elements_updated_at 
  BEFORE UPDATE ON moodboard_elements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ---------------------------------------------------------------------------
-- Table: moodboard_shares
-- Moodboard sharing & exports
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS moodboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  
  -- Share Type
  share_type VARCHAR(50) NOT NULL, -- 'public_link', 'social', 'vendor_packet', 'email'
  
  -- Platform (for social shares)
  platform VARCHAR(50), -- 'instagram', 'facebook', 'pinterest', 'linkedin', null
  
  -- Access Control
  share_url VARCHAR(500), -- Generated shareable URL
  short_code VARCHAR(20) UNIQUE, -- Short code for URL: /s/{short_code}
  password_protected BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  expires_at TIMESTAMPTZ, -- Optional expiration
  
  -- Recipient (for direct shares)
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(100),
  recipient_type VARCHAR(50), -- 'contractor', 'stager', 'photographer', 'agent'
  
  -- Export Settings (for social/file exports)
  export_format VARCHAR(20), -- 'png', 'jpg', 'pdf'
  export_resolution VARCHAR(20), -- 'web', 'high', 'print'
  export_dimensions JSONB, -- {width: 1080, height: 1080} for Instagram, etc.
  
  -- Social Media Optimization
  social_caption TEXT,
  social_hashtags TEXT[],
  posted_url VARCHAR(500), -- If posted, link to the post
  
  -- Tracking
  view_count INT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for moodboard_shares
CREATE INDEX IF NOT EXISTS idx_moodboard_share_board ON moodboard_shares(moodboard_id);
CREATE INDEX IF NOT EXISTS idx_moodboard_share_code ON moodboard_shares(short_code) WHERE short_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_moodboard_share_type ON moodboard_shares(share_type);
CREATE INDEX IF NOT EXISTS idx_moodboard_share_expires ON moodboard_shares(expires_at) WHERE expires_at IS NOT NULL;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE color_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_color_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_material_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_shares ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- RLS Policies: color_library (public read, authenticated write)
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can view active colors"
  ON color_library FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert colors"
  ON color_library FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update colors"
  ON color_library FOR UPDATE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- RLS Policies: color_palettes (public read, authenticated write)
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can view color palettes"
  ON color_palettes FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can manage palettes"
  ON color_palettes FOR ALL
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- RLS Policies: project_color_selections (owner access via project)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their project color selections"
  ON project_color_selections FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert color selections to their projects"
  ON project_color_selections FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project color selections"
  ON project_color_selections FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project color selections"
  ON project_color_selections FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: material_library (public read, authenticated write)
-- ---------------------------------------------------------------------------
CREATE POLICY "Anyone can view active materials"
  ON material_library FOR SELECT
  USING (is_active = true);

CREATE POLICY "Authenticated users can insert materials"
  ON material_library FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update materials"
  ON material_library FOR UPDATE
  TO authenticated
  USING (true);

-- ---------------------------------------------------------------------------
-- RLS Policies: project_material_selections (owner access via project)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their project material selections"
  ON project_material_selections FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert material selections to their projects"
  ON project_material_selections FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their project material selections"
  ON project_material_selections FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their project material selections"
  ON project_material_selections FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: moodboards (owner access + public view for shared)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their own moodboards"
  ON moodboards FOR SELECT
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view public moodboards"
  ON moodboards FOR SELECT
  USING (is_public = true);

CREATE POLICY "Users can insert moodboards to their projects"
  ON moodboards FOR INSERT
  TO authenticated
  WITH CHECK (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their moodboards"
  ON moodboards FOR UPDATE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their moodboards"
  ON moodboards FOR DELETE
  TO authenticated
  USING (
    project_id IN (
      SELECT id FROM rehab_projects WHERE user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: moodboard_elements (owner access via moodboard)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their moodboard elements"
  ON moodboard_elements FOR SELECT
  TO authenticated
  USING (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view elements on public moodboards"
  ON moodboard_elements FOR SELECT
  USING (
    moodboard_id IN (
      SELECT id FROM moodboards WHERE is_public = true
    )
  );

CREATE POLICY "Users can insert elements to their moodboards"
  ON moodboard_elements FOR INSERT
  TO authenticated
  WITH CHECK (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their moodboard elements"
  ON moodboard_elements FOR UPDATE
  TO authenticated
  USING (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their moodboard elements"
  ON moodboard_elements FOR DELETE
  TO authenticated
  USING (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- RLS Policies: moodboard_shares (owner access via moodboard)
-- ---------------------------------------------------------------------------
CREATE POLICY "Users can view their moodboard shares"
  ON moodboard_shares FOR SELECT
  TO authenticated
  USING (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Anyone can view shares by short_code"
  ON moodboard_shares FOR SELECT
  USING (short_code IS NOT NULL);

CREATE POLICY "Users can create shares for their moodboards"
  ON moodboard_shares FOR INSERT
  TO authenticated
  WITH CHECK (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their moodboard shares"
  ON moodboard_shares FOR UPDATE
  TO authenticated
  USING (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their moodboard shares"
  ON moodboard_shares FOR DELETE
  TO authenticated
  USING (
    moodboard_id IN (
      SELECT m.id FROM moodboards m
      JOIN rehab_projects p ON m.project_id = p.id
      WHERE p.user_id = auth.uid()
    )
  );

-- ============================================================================
-- SEED DATA: Popular Sherwin Williams Colors
-- ============================================================================

INSERT INTO color_library (
  brand,
  color_code,
  color_name,
  hex_code,
  rgb_values,
  lrv,
  undertones,
  color_family,
  finish_options,
  recommended_rooms,
  recommended_surfaces,
  design_styles,
  popular
) VALUES
-- Pure White - SW 7005
(
  'sherwin_williams',
  'SW 7005',
  'Pure White',
  '#F2F0EB',
  '{"r": 242, "g": 240, "b": 235}',
  84,
  ARRAY['neutral'],
  'white',
  ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'],
  ARRAY['kitchen', 'living_room', 'bedroom', 'bathroom'],
  ARRAY['walls', 'trim', 'ceiling', 'cabinets'],
  ARRAY['modern_farmhouse', 'contemporary', 'transitional', 'minimalist'],
  true
),
-- Extra White - SW 7006
(
  'sherwin_williams',
  'SW 7006',
  'Extra White',
  '#F4F3F0',
  '{"r": 244, "g": 243, "b": 240}',
  86,
  ARRAY['cool'],
  'white',
  ARRAY['flat', 'eggshell', 'satin', 'semi-gloss', 'gloss'],
  ARRAY['trim', 'ceiling', 'cabinets'],
  ARRAY['trim', 'ceiling', 'doors'],
  ARRAY['modern_farmhouse', 'contemporary', 'modern'],
  true
),
-- Alabaster - SW 7008
(
  'sherwin_williams',
  'SW 7008',
  'Alabaster',
  '#EDEAE0',
  '{"r": 237, "g": 234, "b": 224}',
  82,
  ARRAY['warm'],
  'white',
  ARRAY['flat', 'eggshell', 'satin'],
  ARRAY['kitchen', 'living_room', 'dining_room', 'bedroom'],
  ARRAY['walls', 'cabinets'],
  ARRAY['traditional', 'transitional', 'farmhouse'],
  true
),
-- Repose Gray - SW 7015
(
  'sherwin_williams',
  'SW 7015',
  'Repose Gray',
  '#C2C0BB',
  '{"r": 194, "g": 192, "b": 187}',
  58,
  ARRAY['neutral', 'warm'],
  'gray',
  ARRAY['flat', 'eggshell', 'satin'],
  ARRAY['living_room', 'bedroom', 'hallway', 'office'],
  ARRAY['walls'],
  ARRAY['modern_farmhouse', 'contemporary', 'transitional'],
  true
),
-- Agreeable Gray - SW 7029
(
  'sherwin_williams',
  'SW 7029',
  'Agreeable Gray',
  '#D1CBC0',
  '{"r": 209, "g": 203, "b": 192}',
  60,
  ARRAY['warm'],
  'beige',
  ARRAY['flat', 'eggshell', 'satin'],
  ARRAY['living_room', 'bedroom', 'hallway', 'dining_room'],
  ARRAY['walls'],
  ARRAY['transitional', 'traditional', 'farmhouse'],
  true
),
-- Iron Ore - SW 7069
(
  'sherwin_williams',
  'SW 7069',
  'Iron Ore',
  '#4A4A4A',
  '{"r": 74, "g": 74, "b": 74}',
  6,
  ARRAY['neutral'],
  'gray',
  ARRAY['eggshell', 'satin', 'semi-gloss'],
  ARRAY['exterior', 'accent_wall', 'doors'],
  ARRAY['doors', 'trim', 'exterior', 'cabinets'],
  ARRAY['modern_farmhouse', 'modern', 'industrial'],
  true
);

-- ============================================================================
-- ADDITIONAL FUNCTIONS: Utility helpers
-- ============================================================================

-- Function to increment moodboard view count
CREATE OR REPLACE FUNCTION increment_moodboard_view_count(board_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE moodboards
  SET view_count = view_count + 1
  WHERE id = board_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment moodboard share count
CREATE OR REPLACE FUNCTION increment_moodboard_share_count(board_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE moodboards
  SET share_count = share_count + 1
  WHERE id = board_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment share view count
CREATE OR REPLACE FUNCTION increment_share_view_count(share_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE moodboard_shares
  SET 
    view_count = view_count + 1,
    last_viewed_at = NOW()
  WHERE id = share_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to increment palette usage count
CREATE OR REPLACE FUNCTION increment_palette_usage_count(palette_id UUID)
RETURNS void AS $$
BEGIN
  UPDATE color_palettes
  SET usage_count = usage_count + 1
  WHERE id = palette_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to generate unique short code for shares
CREATE OR REPLACE FUNCTION generate_short_code()
RETURNS TEXT AS $$
DECLARE
  chars TEXT := 'abcdefghjkmnpqrstuvwxyz23456789';
  result TEXT := '';
  i INT;
BEGIN
  FOR i IN 1..8 LOOP
    result := result || substr(chars, floor(random() * length(chars) + 1)::int, 1);
  END LOOP;
  RETURN result;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- GRANTS: Allow service role full access
-- ============================================================================

GRANT ALL ON color_library TO service_role;
GRANT ALL ON color_palettes TO service_role;
GRANT ALL ON project_color_selections TO service_role;
GRANT ALL ON material_library TO service_role;
GRANT ALL ON project_material_selections TO service_role;
GRANT ALL ON moodboards TO service_role;
GRANT ALL ON moodboard_elements TO service_role;
GRANT ALL ON moodboard_shares TO service_role;

-- Grant execute on functions
GRANT EXECUTE ON FUNCTION increment_moodboard_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_moodboard_share_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_share_view_count TO authenticated;
GRANT EXECUTE ON FUNCTION increment_palette_usage_count TO authenticated;
GRANT EXECUTE ON FUNCTION generate_short_code TO authenticated;

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================

