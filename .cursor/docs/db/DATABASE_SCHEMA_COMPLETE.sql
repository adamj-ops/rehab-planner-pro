-- ============================================================================
-- COMPLETE DATABASE SCHEMA FOR REHAB ESTIMATOR EXPANSION
-- All New Features: Colors, Moodboards, Portfolio, Project Management, Vendors
-- ============================================================================

-- ============================================================================
-- PART 1: COLOR & MATERIAL SYSTEM
-- ============================================================================

-- Core color library (Sherwin Williams + others)
CREATE TABLE color_library (
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
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_color_brand ON color_library(brand);
CREATE INDEX idx_color_family ON color_library(color_family);
CREATE INDEX idx_color_popular ON color_library(popular) WHERE popular = true;
CREATE INDEX idx_color_styles ON color_library USING GIN(design_styles);

-- User's color selections for a project
CREATE TABLE project_color_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Location in Property
  room_type VARCHAR(50) NOT NULL, -- 'kitchen', 'primary_bedroom', 'exterior'
  room_name VARCHAR(100), -- 'Kitchen', 'Primary Bedroom', custom name
  surface_type VARCHAR(50) NOT NULL, -- 'walls', 'trim', 'ceiling', 'cabinets', 'doors'
  
  -- Color Selection
  color_id UUID REFERENCES color_library(id),
  custom_color_name VARCHAR(100), -- If not from library
  custom_hex_code VARCHAR(7), -- If custom color
  
  -- Application Details
  finish VARCHAR(50), -- 'eggshell', 'satin', etc.
  coats INT DEFAULT 2,
  primer_needed BOOLEAN DEFAULT false,
  
  -- Scope Linking
  linked_scope_item_id UUID REFERENCES scope_items(id) ON DELETE SET NULL,
  
  -- Notes
  notes TEXT,
  application_instructions TEXT,
  
  -- Status
  is_primary BOOLEAN DEFAULT false, -- Primary color for this room
  is_approved BOOLEAN DEFAULT false,
  approved_by_client BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_colors ON project_color_selections(project_id);
CREATE INDEX idx_color_room ON project_color_selections(project_id, room_type);
CREATE INDEX idx_color_scope_link ON project_color_selections(linked_scope_item_id);

-- Material library (countertops, flooring, tile, hardware, etc.)
CREATE TABLE material_library (
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
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_material_type ON material_library(material_type);
CREATE INDEX idx_material_category ON material_library(material_category);
CREATE INDEX idx_material_popular ON material_library(popular) WHERE popular = true;
CREATE INDEX idx_material_styles ON material_library USING GIN(design_styles);

-- User's material selections for a project
CREATE TABLE project_material_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Location
  room_type VARCHAR(50), -- 'kitchen', 'bathroom', etc.
  room_name VARCHAR(100),
  application VARCHAR(100) NOT NULL, -- 'Kitchen countertops', 'Primary bath tile'
  
  -- Material Selection
  material_id UUID REFERENCES material_library(id),
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
  
  -- Scope Linking
  linked_scope_item_id UUID REFERENCES scope_items(id) ON DELETE SET NULL,
  
  -- Notes
  notes TEXT,
  installation_notes TEXT,
  
  -- Status
  is_approved BOOLEAN DEFAULT false,
  is_ordered BOOLEAN DEFAULT false,
  is_received BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_materials ON project_material_selections(project_id);
CREATE INDEX idx_material_scope_link ON project_material_selections(linked_scope_item_id);

-- Color palettes (coordinated color schemes)
CREATE TABLE color_palettes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Palette Info
  name VARCHAR(100) NOT NULL, -- 'Modern Farmhouse Neutral', 'Bold Contemporary'
  description TEXT,
  design_style VARCHAR(50), -- 'modern_farmhouse', 'contemporary', etc.
  
  -- Colors in Palette (ordered)
  primary_color_id UUID REFERENCES color_library(id),
  secondary_color_id UUID REFERENCES color_library(id),
  accent_color_ids UUID[], -- Array of color IDs for accents
  
  -- Usage Recommendations
  recommended_for TEXT[], -- ['first_time_buyer', 'luxury', 'rental']
  price_range VARCHAR(50), -- 'under_300k', '300k_500k', 'over_500k'
  
  -- Metadata
  is_trending BOOLEAN DEFAULT false,
  usage_count INT DEFAULT 0, -- Track popularity
  created_by_system BOOLEAN DEFAULT true, -- vs. user-created
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_palette_style ON color_palettes(design_style);
CREATE INDEX idx_palette_trending ON color_palettes(is_trending) WHERE is_trending = true;

-- ============================================================================
-- PART 2: MOODBOARD SYSTEM
-- ============================================================================

-- Moodboard containers
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
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
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moodboard_project ON moodboards(project_id);
CREATE INDEX idx_moodboard_public ON moodboards(is_public) WHERE is_public = true;
CREATE INDEX idx_moodboard_slug ON moodboards(public_slug) WHERE public_slug IS NOT NULL;

-- Individual elements on a moodboard
CREATE TABLE moodboard_elements (
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
  color_id UUID REFERENCES color_library(id),
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
  material_id UUID REFERENCES material_library(id),
  material_sample_image_url VARCHAR(500),
  show_material_name BOOLEAN DEFAULT true,
  show_material_specs BOOLEAN DEFAULT false,
  
  -- FOR SHAPE ELEMENTS
  shape_type VARCHAR(50), -- 'rectangle', 'circle', 'line', 'arrow'
  fill_color VARCHAR(7),
  stroke_color VARCHAR(7),
  stroke_width INT,
  
  -- Linking
  linked_scope_item_id UUID REFERENCES scope_items(id) ON DELETE SET NULL,
  linked_color_selection_id UUID REFERENCES project_color_selections(id) ON DELETE SET NULL,
  linked_material_selection_id UUID REFERENCES project_material_selections(id) ON DELETE SET NULL,
  
  -- Notes & Metadata
  notes TEXT,
  tags TEXT[], -- For filtering/searching within moodboard
  
  -- Lock & Visibility
  is_locked BOOLEAN DEFAULT false, -- Prevent editing
  is_visible BOOLEAN DEFAULT true, -- Show/hide
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moodboard_elem_board ON moodboard_elements(moodboard_id);
CREATE INDEX idx_moodboard_elem_type ON moodboard_elements(element_type);
CREATE INDEX idx_moodboard_elem_z ON moodboard_elements(moodboard_id, z_index);

-- Moodboard sharing & exports
CREATE TABLE moodboard_shares (
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
  expires_at TIMESTAMP, -- Optional expiration
  
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
  last_viewed_at TIMESTAMP,
  
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_moodboard_share_board ON moodboard_shares(moodboard_id);
CREATE INDEX idx_moodboard_share_code ON moodboard_shares(short_code);
CREATE INDEX idx_moodboard_share_type ON moodboard_shares(share_type);

-- ============================================================================
-- PART 3: PORTFOLIO SYSTEM
-- ============================================================================

-- Portfolio settings (one per user)
CREATE TABLE portfolio_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE UNIQUE,
  
  -- Branding
  portfolio_name VARCHAR(100), -- 'Smith Property Group'
  tagline VARCHAR(255),
  bio TEXT,
  logo_url VARCHAR(500),
  primary_color VARCHAR(7) DEFAULT '#000000',
  secondary_color VARCHAR(7) DEFAULT '#FFFFFF',
  
  -- Display Preferences
  theme VARCHAR(50) DEFAULT 'minimalist', -- 'minimalist', 'bold', 'magazine', 'grid'
  show_roi_data BOOLEAN DEFAULT false,
  show_before_after BOOLEAN DEFAULT true,
  show_moodboards BOOLEAN DEFAULT true,
  show_contact_form BOOLEAN DEFAULT true,
  projects_per_page INT DEFAULT 9,
  
  -- SEO
  meta_title VARCHAR(100),
  meta_description TEXT,
  meta_keywords TEXT[],
  
  -- Social Links
  instagram_url VARCHAR(255),
  facebook_url VARCHAR(255),
  linkedin_url VARCHAR(255),
  website_url VARCHAR(255),
  
  -- Custom Domain (Pro feature)
  custom_domain VARCHAR(255) UNIQUE,
  custom_domain_verified BOOLEAN DEFAULT false,
  
  -- Public URL
  public_slug VARCHAR(100) UNIQUE, -- /portfolio/{slug} or custom domain
  
  -- Contact
  contact_email VARCHAR(255),
  contact_phone VARCHAR(50),
  show_contact_info BOOLEAN DEFAULT true,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_user ON portfolio_settings(user_id);
CREATE INDEX idx_portfolio_slug ON portfolio_settings(public_slug);
CREATE INDEX idx_portfolio_domain ON portfolio_settings(custom_domain) WHERE custom_domain IS NOT NULL;

-- Portfolio projects (published projects showcase)
CREATE TABLE portfolio_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  
  -- Publishing Status
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  featured BOOLEAN DEFAULT false, -- Featured project (shows first)
  sort_order INT DEFAULT 0, -- Manual sorting
  
  -- Project Display Info
  display_address VARCHAR(255), -- 'Modern Farmhouse in Otsego, MN' (can anonymize)
  show_full_address BOOLEAN DEFAULT false,
  project_type VARCHAR(50), -- 'flip', 'rental', 'airbnb', 'wholesale'
  completion_date DATE,
  duration_days INT,
  
  -- Financial Performance
  show_financials BOOLEAN DEFAULT false,
  purchase_price DECIMAL(10,2),
  rehab_cost DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  rental_income_monthly DECIMAL(10,2), -- For rentals
  roi_percentage DECIMAL(5,2),
  profit DECIMAL(10,2),
  
  -- Design Details
  design_style VARCHAR(100),
  target_buyer VARCHAR(100),
  square_footage INT,
  bedrooms INT,
  bathrooms DECIMAL(3,1),
  
  -- Story & Features
  project_story TEXT, -- Narrative about the project
  project_tagline VARCHAR(255), -- Short catchy description
  key_features TEXT[], -- ['Kitchen remodel', 'Smart home', etc.]
  challenges_overcome TEXT[],
  favorite_aspect TEXT,
  
  -- Media
  hero_image_url VARCHAR(500) NOT NULL, -- Main showcase image
  hero_image_alt TEXT,
  before_images JSONB, -- [{url, alt, caption, room}]
  after_images JSONB, -- [{url, alt, caption, room}]
  moodboard_id UUID REFERENCES moodboards(id),
  video_url VARCHAR(500), -- YouTube/Vimeo walkthrough
  virtual_tour_url VARCHAR(500), -- Matterport, etc.
  
  -- SEO
  seo_title VARCHAR(100),
  seo_description TEXT,
  seo_slug VARCHAR(150) UNIQUE, -- URL-friendly: modern-farmhouse-otsego-mn
  tags TEXT[], -- ['modern-farmhouse', 'kitchen-remodel', 'first-time-buyer']
  
  -- Social Sharing
  social_image_url VARCHAR(500), -- Optimized for social sharing
  featured_on_social JSONB, -- [{platform, url, date}]
  
  -- Analytics
  view_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_portfolio_proj_user ON portfolio_projects(user_id);
CREATE INDEX idx_portfolio_proj_published ON portfolio_projects(is_published, featured, sort_order);
CREATE INDEX idx_portfolio_proj_slug ON portfolio_projects(seo_slug);
CREATE INDEX idx_portfolio_proj_tags ON portfolio_projects USING GIN(tags);

-- ============================================================================
-- PART 4: PROJECT MANAGEMENT - GANTT & CALENDAR
-- ============================================================================

-- Project timeline (for Gantt chart)
CREATE TABLE project_timeline (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  
  -- Timeline Configuration
  start_date DATE NOT NULL,
  target_end_date DATE NOT NULL,
  actual_end_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'planning', -- 'planning', 'active', 'on_hold', 'completed'
  percent_complete INT DEFAULT 0, -- 0-100
  days_ahead_behind INT DEFAULT 0, -- Negative = behind, positive = ahead
  
  -- Critical Path
  critical_path_ids UUID[], -- Array of phase/task IDs on critical path
  
  -- Settings
  show_weekends BOOLEAN DEFAULT false,
  show_holidays BOOLEAN DEFAULT false,
  holidays JSONB, -- [{date, name}]
  working_days_per_week INT DEFAULT 5,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_timeline_project ON project_timeline(project_id);

-- Timeline phases (high-level groupings)
CREATE TABLE timeline_phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Phase Info
  name VARCHAR(100) NOT NULL, -- 'Demo', 'Systems', 'Interior Finish', etc.
  description TEXT,
  phase_number INT NOT NULL, -- Ordering: 1, 2, 3...
  
  -- Dates
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  
  -- Status
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'delayed'
  percent_complete INT DEFAULT 0,
  
  -- Dependencies
  depends_on_phase_ids UUID[], -- Must complete these phases first
  
  -- Display
  color VARCHAR(7) DEFAULT '#3B82F6', -- For Gantt visualization
  is_collapsed BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_phase_project ON timeline_phases(project_id);
CREATE INDEX idx_phase_order ON timeline_phases(project_id, phase_number);

-- Timeline tasks (granular work items)
CREATE TABLE timeline_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  phase_id UUID REFERENCES timeline_phases(id) ON DELETE CASCADE,
  
  -- Task Info
  name VARCHAR(200) NOT NULL, -- 'Install HVAC', 'Paint interior', etc.
  description TEXT,
  task_number INT NOT NULL, -- Ordering within phase
  
  -- Dates & Duration
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  duration_days INT NOT NULL,
  actual_start_date DATE,
  actual_end_date DATE,
  actual_duration_days INT,
  
  -- Status
  status VARCHAR(50) DEFAULT 'not_started', -- 'not_started', 'in_progress', 'completed', 'blocked', 'delayed'
  percent_complete INT DEFAULT 0,
  
  -- Dependencies
  depends_on_task_ids UUID[], -- Must complete these tasks first
  is_critical_path BOOLEAN DEFAULT false,
  
  -- Assignment
  assigned_vendor_id UUID REFERENCES vendors(id),
  assigned_team_member_id UUID REFERENCES users(id),
  
  -- Linking
  linked_scope_item_id UUID REFERENCES scope_items(id) ON DELETE SET NULL,
  linked_calendar_event_id UUID,
  
  -- Notes
  notes TEXT,
  blockers TEXT[], -- What's blocking this task
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_task_project ON timeline_tasks(project_id);
CREATE INDEX idx_task_phase ON timeline_tasks(phase_id);
CREATE INDEX idx_task_vendor ON timeline_tasks(assigned_vendor_id);
CREATE INDEX idx_task_critical ON timeline_tasks(is_critical_path) WHERE is_critical_path = true;

-- Calendar events (integrates with Google Calendar, etc.)
CREATE TABLE calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Event Info
  title VARCHAR(200) NOT NULL,
  description TEXT,
  location TEXT,
  
  -- Timing
  start_datetime TIMESTAMP NOT NULL,
  end_datetime TIMESTAMP NOT NULL,
  all_day BOOLEAN DEFAULT false,
  timezone VARCHAR(100) DEFAULT 'America/Chicago',
  
  -- Recurrence
  is_recurring BOOLEAN DEFAULT false,
  recurrence_rule TEXT, -- RRULE format (iCal standard)
  
  -- Type & Category
  event_type VARCHAR(50), -- 'inspection', 'vendor_appointment', 'material_delivery', 'meeting', 'milestone', 'reminder'
  category VARCHAR(50), -- 'hvac', 'plumbing', 'electrical', 'general'
  
  -- Participants
  organizer_id UUID REFERENCES users(id),
  attendees JSONB, -- [{email, name, status: 'pending/accepted/declined', vendor_id}]
  
  -- Reminders
  reminder_minutes_before INT[], -- [15, 60, 1440] = 15min, 1hr, 1day before
  email_reminders BOOLEAN DEFAULT true,
  sms_reminders BOOLEAN DEFAULT false,
  
  -- Linking
  linked_task_id UUID REFERENCES timeline_tasks(id) ON DELETE SET NULL,
  linked_vendor_id UUID REFERENCES vendors(id),
  
  -- External Calendar Sync
  google_calendar_event_id VARCHAR(255),
  outlook_event_id VARCHAR(255),
  last_synced_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'rescheduled'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_calendar_project ON calendar_events(project_id);
CREATE INDEX idx_calendar_datetime ON calendar_events(start_datetime, end_datetime);
CREATE INDEX idx_calendar_type ON calendar_events(event_type);
CREATE INDEX idx_calendar_vendor ON calendar_events(linked_vendor_id);

-- ============================================================================
-- PART 5: NOTION-STYLE DOCUMENTATION
-- ============================================================================

-- Document pages (Notion-style)
CREATE TABLE project_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Hierarchy
  parent_document_id UUID REFERENCES project_documents(id) ON DELETE CASCADE,
  is_root BOOLEAN DEFAULT false, -- Top-level document (no parent)
  path TEXT, -- Materialized path for tree structure: '/1/3/5'
  
  -- Document Info
  title VARCHAR(255) NOT NULL,
  icon VARCHAR(50), -- Emoji or icon name: '📄', 'document', 'folder'
  document_type VARCHAR(50) DEFAULT 'page', -- 'page', 'folder'
  
  -- Content (Rich Text in JSON format)
  content JSONB, -- Notion-like blocks: [{type: 'paragraph', content: '...'}]
  content_text TEXT, -- Plain text version for search
  
  -- Template
  is_template BOOLEAN DEFAULT false,
  template_type VARCHAR(50), -- 'meeting_notes', 'daily_report', 'change_order', etc.
  
  -- Access Control
  visibility VARCHAR(50) DEFAULT 'private', -- 'private', 'team', 'vendor', 'public'
  shared_with_vendor_ids UUID[], -- Array of vendor IDs with access
  
  -- Metadata
  created_by_id UUID REFERENCES users(id),
  last_edited_by_id UUID REFERENCES users(id),
  
  -- Display
  sort_order INT DEFAULT 0, -- For manual ordering
  is_collapsed BOOLEAN DEFAULT false,
  is_archived BOOLEAN DEFAULT false,
  
  -- Linking
  linked_scope_items UUID[], -- Links to scope items
  linked_vendors UUID[], -- Links to vendors
  linked_tasks UUID[], -- Links to timeline tasks
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_doc_project ON project_documents(project_id);
CREATE INDEX idx_doc_parent ON project_documents(parent_document_id);
CREATE INDEX idx_doc_path ON project_documents(path);
CREATE INDEX idx_doc_template ON project_documents(is_template) WHERE is_template = true;
CREATE INDEX idx_doc_text_search ON project_documents USING GIN(to_tsvector('english', content_text));

-- Document templates (pre-built templates)
CREATE TABLE document_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Info
  name VARCHAR(100) NOT NULL,
  description TEXT,
  template_type VARCHAR(50) NOT NULL, -- 'meeting_notes', 'daily_report', 'change_order', etc.
  category VARCHAR(50), -- 'project_management', 'vendor', 'design', 'financial'
  
  -- Content
  icon VARCHAR(50),
  default_title VARCHAR(255),
  content_template JSONB, -- Notion-like blocks with placeholders
  
  -- Metadata
  is_system_template BOOLEAN DEFAULT true, -- System vs. user-created
  usage_count INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_template_type ON document_templates(template_type);
CREATE INDEX idx_template_category ON document_templates(category);

-- ============================================================================
-- PART 6: VENDOR PACKET SYSTEM
-- ============================================================================

-- Vendor packet configurations
CREATE TABLE vendor_packet_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Template Info
  name VARCHAR(100) NOT NULL,
  packet_type VARCHAR(50) NOT NULL, -- 'contractor', 'stager', 'photographer', 'agent'
  description TEXT,
  
  -- Included Sections (checkboxes when generating)
  include_project_overview BOOLEAN DEFAULT true,
  include_property_details BOOLEAN DEFAULT true,
  include_timeline BOOLEAN DEFAULT true,
  include_design_moodboard BOOLEAN DEFAULT false,
  include_color_selections BOOLEAN DEFAULT false,
  include_material_selections BOOLEAN DEFAULT false,
  include_scope_of_work BOOLEAN DEFAULT false,
  include_budget BOOLEAN DEFAULT false,
  include_site_info BOOLEAN DEFAULT false,
  include_contact_info BOOLEAN DEFAULT true,
  include_expectations BOOLEAN DEFAULT true,
  
  -- Filtering Rules (for contractor packets)
  filter_scope_by_trade BOOLEAN DEFAULT false,
  
  -- Branding
  show_logo BOOLEAN DEFAULT true,
  show_branding BOOLEAN DEFAULT true,
  
  -- Template Content
  header_template TEXT,
  footer_template TEXT,
  custom_sections JSONB, -- [{title, content_template}]
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_packet_template_type ON vendor_packet_templates(packet_type);

-- Generated vendor packets (tracking)
CREATE TABLE vendor_packets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Packet Info
  packet_name VARCHAR(255) NOT NULL,
  packet_type VARCHAR(50) NOT NULL, -- 'contractor', 'stager', 'photographer', 'agent'
  template_id UUID REFERENCES vendor_packet_templates(id),
  
  -- Recipient
  vendor_id UUID REFERENCES vendors(id),
  recipient_name VARCHAR(100),
  recipient_email VARCHAR(255),
  recipient_company VARCHAR(100),
  
  -- Content Configuration
  included_sections JSONB, -- {project_overview: true, moodboard: true, ...}
  
  -- Scope Filtering (for contractor packets)
  filtered_trades TEXT[], -- ['plumbing', 'hvac'] - only show these
  filtered_scope_item_ids UUID[], -- Specific scope items included
  
  -- Generated Files
  pdf_url VARCHAR(500), -- Generated PDF on cloud storage
  pdf_filename VARCHAR(255),
  file_size_kb INT,
  
  -- Delivery
  delivery_method VARCHAR(50), -- 'email', 'link', 'download'
  share_url VARCHAR(500), -- Public/private link
  short_code VARCHAR(20) UNIQUE,
  password_protected BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  expires_at TIMESTAMP,
  
  -- Email Details (if sent via email)
  email_subject VARCHAR(255),
  email_body TEXT,
  email_sent_at TIMESTAMP,
  
  -- Tracking
  view_count INT DEFAULT 0,
  downloaded_count INT DEFAULT 0,
  last_viewed_at TIMESTAMP,
  
  -- Status
  status VARCHAR(50) DEFAULT 'generated', -- 'generated', 'sent', 'viewed', 'expired'
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_packet_project ON vendor_packets(project_id);
CREATE INDEX idx_vendor_packet_vendor ON vendor_packets(vendor_id);
CREATE INDEX idx_vendor_packet_code ON vendor_packets(short_code);
CREATE INDEX idx_vendor_packet_type ON vendor_packets(packet_type);

-- ============================================================================
-- PART 7: SMART HOME SYSTEM
-- ============================================================================

-- Smart home product catalog
CREATE TABLE smart_home_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Product Info
  product_name VARCHAR(200) NOT NULL,
  brand VARCHAR(100),
  model_number VARCHAR(100),
  category VARCHAR(50) NOT NULL, -- 'lock', 'thermostat', 'doorbell', 'camera', 'lights', 'hub', etc.
  
  -- Description
  description TEXT,
  key_features TEXT[],
  
  -- Pricing Tiers
  budget_price DECIMAL(10,2),
  standard_price DECIMAL(10,2),
  premium_price DECIMAL(10,2),
  
  -- Installation
  installation_difficulty VARCHAR(50), -- 'diy', 'easy', 'moderate', 'professional'
  installation_time_minutes INT,
  requires_hub BOOLEAN DEFAULT false,
  compatible_hubs TEXT[], -- ['amazon_alexa', 'google_home', 'apple_homekit']
  
  -- ROI Data
  avg_value_add DECIMAL(10,2), -- Average added property value
  avg_roi_percentage DECIMAL(5,2),
  buyer_appeal_score INT, -- 1-10
  market_demand_level VARCHAR(50), -- 'essential', 'expected', 'nice_to_have', 'luxury'
  
  -- Compatibility
  works_with TEXT[], -- Other products it integrates with
  requires_products TEXT[], -- Products needed for this to work
  
  -- Links
  purchase_url VARCHAR(500),
  manufacturer_url VARCHAR(500),
  installation_guide_url VARCHAR(500),
  image_url VARCHAR(500),
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  popular BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_smart_product_category ON smart_home_products(category);
CREATE INDEX idx_smart_product_popular ON smart_home_products(popular) WHERE popular = true;

-- Pre-built smart home packages
CREATE TABLE smart_home_packages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Package Info
  name VARCHAR(100) NOT NULL, -- 'Rental Essential', 'Flip Standard', 'Modern Buyer', 'Luxury Tech'
  description TEXT,
  tier_level INT NOT NULL, -- 1=Basic, 2=Standard, 3=Advanced, 4=Luxury
  
  -- Target
  recommended_for TEXT[], -- ['rental', 'flip_budget', 'flip_midrange', 'flip_luxury']
  price_range VARCHAR(50), -- '$500-1000', '$1500-2500', etc.
  
  -- Included Products (with tier choice)
  included_products JSONB, -- [{product_id, category, tier: 'budget'|'standard'|'premium', quantity}]
  
  -- Costs
  total_cost_budget DECIMAL(10,2),
  total_cost_standard DECIMAL(10,2),
  total_cost_premium DECIMAL(10,2),
  
  -- ROI
  estimated_value_add DECIMAL(10,2),
  estimated_roi_percentage DECIMAL(5,2),
  installation_time_hours INT,
  
  -- Metadata
  is_active BOOLEAN DEFAULT true,
  sort_order INT DEFAULT 0,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_package_tier ON smart_home_packages(tier_level);

-- User's smart home selections for a project
CREATE TABLE project_smart_home_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Package or Custom
  selection_type VARCHAR(50) DEFAULT 'custom', -- 'package', 'custom'
  package_id UUID REFERENCES smart_home_packages(id),
  
  -- Products Selected
  selected_products JSONB, -- [{product_id, tier: 'budget'|'standard'|'premium', quantity, cost}]
  
  -- Totals
  total_cost DECIMAL(10,2),
  estimated_value_add DECIMAL(10,2),
  estimated_roi_percentage DECIMAL(5,2),
  
  -- Installation
  installation_plan TEXT,
  installer_vendor_id UUID REFERENCES vendors(id),
  installation_scheduled_date DATE,
  
  -- Linked to Scope
  linked_scope_item_id UUID REFERENCES scope_items(id) ON DELETE SET NULL,
  
  -- Notes
  notes TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_project_smart_home ON project_smart_home_selections(project_id);
CREATE INDEX idx_smart_home_package ON project_smart_home_selections(package_id);

-- ============================================================================
-- PART 8: ROI BENCHMARKING DATA
-- ============================================================================

-- Historical ROI data for upgrades
CREATE TABLE upgrade_roi_benchmarks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Upgrade Info
  upgrade_category VARCHAR(100) NOT NULL, -- 'Kitchen', 'Bathroom', 'Flooring', 'Exterior', etc.
  upgrade_subcategory VARCHAR(100), -- 'Cabinet Reface', 'Quartz Counters', 'LVP Install'
  upgrade_name VARCHAR(200) NOT NULL, -- 'White Shaker Cabinet Reface'
  description TEXT,
  
  -- Cost Data (National Average)
  avg_cost DECIMAL(10,2) NOT NULL,
  cost_range_low DECIMAL(10,2),
  cost_range_high DECIMAL(10,2),
  
  -- Value Data (National Average)
  avg_value_add DECIMAL(10,2) NOT NULL,
  value_range_low DECIMAL(10,2),
  value_range_high DECIMAL(10,2),
  
  -- ROI Metrics
  avg_roi_percentage DECIMAL(5,2) NOT NULL, -- (value_add / cost) * 100
  recoup_rate DECIMAL(5,2) NOT NULL, -- % of cost recouped at sale
  
  -- Market Data
  buyer_appeal_score INT, -- 1-10: How much buyers care
  time_to_sell_impact_days INT, -- How many days faster it sells (+/-)
  
  -- Regional Variance
  regional_data JSONB, -- [{region: 'midwest', avg_roi: 74, recoup_rate: 82}, ...]
  
  -- Price Range Sensitivity
  price_range_data JSONB, -- [{range: 'under_300k', avg_roi: 78}, ...]
  
  -- Trend Data
  trend_direction VARCHAR(50), -- 'rising', 'stable', 'declining'
  trend_change_1yr DECIMAL(5,2), -- % change in ROI over 1 year
  trend_change_3yr DECIMAL(5,2), -- % change in ROI over 3 years
  
  -- Data Source
  data_source VARCHAR(100), -- 'remodeling_magazine', 'zillow', 'user_submitted', 'mls_analysis'
  sample_size INT, -- Number of data points
  last_updated DATE,
  confidence_level VARCHAR(50), -- 'high', 'medium', 'low'
  
  -- Metadata
  is_trending BOOLEAN DEFAULT false, -- Hot trend right now
  is_popular BOOLEAN DEFAULT false, -- Popular upgrade
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_roi_category ON upgrade_roi_benchmarks(upgrade_category);
CREATE INDEX idx_roi_roi ON upgrade_roi_benchmarks(avg_roi_percentage DESC);
CREATE INDEX idx_roi_trending ON upgrade_roi_benchmarks(is_trending) WHERE is_trending = true;

-- User's personal ROI tracking (post-project actuals)
CREATE TABLE project_roi_actuals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Actual Costs
  actual_purchase_price DECIMAL(10,2),
  actual_rehab_cost DECIMAL(10,2),
  actual_holding_costs DECIMAL(10,2),
  actual_selling_costs DECIMAL(10,2),
  actual_total_investment DECIMAL(10,2),
  
  -- Actual Results
  actual_sale_price DECIMAL(10,2),
  actual_sale_date DATE,
  actual_days_on_market INT,
  actual_net_profit DECIMAL(10,2),
  actual_roi_percentage DECIMAL(5,2),
  
  -- Comparison to Estimates
  estimated_roi_percentage DECIMAL(5,2),
  roi_variance DECIMAL(5,2), -- Actual vs. Estimated
  budget_variance DECIMAL(10,2), -- $ Over/Under budget
  timeline_variance_days INT, -- Days over/under timeline
  
  -- Upgrade-Specific ROI (what worked, what didn't)
  upgrade_performance JSONB, -- [{upgrade_name, estimated_value, actual_value, roi}]
  
  -- Lessons Learned
  what_went_well TEXT[],
  what_needs_improvement TEXT[],
  would_do_differently TEXT[],
  
  -- Contribute to Benchmarks
  share_anonymously BOOLEAN DEFAULT false, -- Allow data to improve benchmarks
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_roi_actual_project ON project_roi_actuals(project_id);

-- ============================================================================
-- PART 9: MODERNIZATION SCORING
-- ============================================================================

-- Modernization assessments (comparative scoring)
CREATE TABLE modernization_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  
  -- Category Scores (0-100)
  curb_appeal_score INT DEFAULT 0,
  interior_architecture_score INT DEFAULT 0,
  kitchen_score INT DEFAULT 0,
  bathroom_score INT DEFAULT 0,
  technology_score INT DEFAULT 0,
  energy_efficiency_score INT DEFAULT 0,
  
  -- Overall
  overall_score INT DEFAULT 0, -- Average of categories
  target_score INT DEFAULT 70, -- Goal set by user
  
  -- Competitive Benchmarking
  comparable_properties JSONB, -- [{address, overall_score, sale_price, days_on_market}]
  market_average_score INT, -- Average score of comps
  gap_to_market INT, -- How far behind market average
  
  -- Category Breakdowns (detailed scoring)
  curb_appeal_details JSONB, -- {siding: 20, landscaping: 15, door: 10, ...}
  interior_arch_details JSONB,
  kitchen_details JSONB,
  bathroom_details JSONB,
  technology_details JSONB,
  energy_details JSONB,
  
  -- Gap Analysis
  top_gaps JSONB, -- [{category, current_score, gap_points, recommended_upgrades}]
  
  -- Recommendations
  recommended_upgrades JSONB, -- [{upgrade_name, category, points_gained, cost, roi}]
  priority_order TEXT[], -- Ordered list of what to tackle first
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_modern_project ON modernization_assessments(project_id);

-- ============================================================================
-- PART 10: LISTING PREP & EXIT STRATEGY
-- ============================================================================

-- Staging plans
CREATE TABLE staging_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  
  -- Staging Strategy
  staging_type VARCHAR(50), -- 'vacant', 'occupied', 'partial', 'virtual_only'
  staging_tier VARCHAR(50), -- 'basic', 'standard', 'premium', 'luxury'
  
  -- Budget
  staging_budget DECIMAL(10,2),
  estimated_cost DECIMAL(10,2),
  actual_cost DECIMAL(10,2),
  
  -- Timeline
  staging_start_date DATE,
  staging_complete_date DATE,
  photography_date DATE,
  
  -- Vendor
  stager_vendor_id UUID REFERENCES vendors(id),
  stager_company VARCHAR(100),
  stager_contact VARCHAR(255),
  
  -- Room Priorities
  rooms_to_stage JSONB, -- [{room: 'living_room', priority: 'high', budget: 1200, notes: '...'}]
  
  -- Design Aesthetic (from moodboard)
  moodboard_id UUID REFERENCES moodboards(id),
  style_keywords TEXT[], -- ['modern', 'neutral', 'warm', 'inviting']
  target_buyer_profile TEXT,
  
  -- Specific Needs
  emphasize_features TEXT[], -- ['Smart home', 'Renovated kitchen', 'Natural light']
  
  -- ROI Expectations
  estimated_days_faster_sale INT, -- Expected impact on DOM
  estimated_price_premium_percent DECIMAL(5,2), -- Expected price boost %
  estimated_roi_net_benefit DECIMAL(10,2), -- Net benefit after costs
  
  -- Actual Results (post-sale)
  actual_days_faster_sale INT,
  actual_price_premium_percent DECIMAL(5,2),
  actual_roi_net_benefit DECIMAL(10,2),
  
  -- Notes
  staging_notes TEXT,
  special_instructions TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_staging_project ON staging_plans(project_id);
CREATE INDEX idx_staging_vendor ON staging_plans(stager_vendor_id);

-- Photography & listing assets
CREATE TABLE listing_assets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  
  -- Photography
  photographer_vendor_id UUID REFERENCES vendors(id),
  photo_shoot_date DATE,
  photo_shoot_time TIME,
  
  -- Shot List
  shot_list JSONB, -- [{room: 'kitchen', shots: ['wide angle', 'island close-up'], lighting: 'natural', notes: '...'}]
  
  -- Feature Highlights (for photographer)
  key_features_to_capture TEXT[],
  detail_shots_needed TEXT[],
  
  -- Deliverables
  expected_photo_count INT,
  include_drone BOOLEAN DEFAULT false,
  include_virtual_staging BOOLEAN DEFAULT false,
  include_twilight_photos BOOLEAN DEFAULT false,
  include_video_walkthrough BOOLEAN DEFAULT false,
  
  -- Photo Storage
  photos JSONB, -- [{url, room, type: 'wide'|'detail', is_primary, caption}]
  primary_listing_photo_url VARCHAR(500),
  
  -- Video
  video_walkthrough_url VARCHAR(500),
  virtual_tour_url VARCHAR(500), -- Matterport, etc.
  
  -- AI-Generated Listing Content
  ai_listing_description TEXT,
  ai_headline_options TEXT[], -- Multiple headline suggestions
  ai_feature_bullets TEXT[], -- Key selling points
  ai_seo_keywords TEXT[],
  
  -- Manual Overrides
  custom_listing_description TEXT,
  custom_headline VARCHAR(255),
  custom_feature_bullets TEXT[],
  
  -- Marketing Assets
  social_media_images JSONB, -- [{platform, image_url, dimensions}]
  flyer_url VARCHAR(500),
  brochure_url VARCHAR(500),
  
  -- Competitive Positioning
  competitive_analysis JSONB, -- [{address, price, dom, our_advantages}]
  pricing_recommendation DECIMAL(10,2),
  pricing_rationale TEXT,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_listing_project ON listing_assets(project_id);
CREATE INDEX idx_listing_photographer ON listing_assets(photographer_vendor_id);

-- ============================================================================
-- PART 11: POST-PROJECT ANALYSIS
-- ============================================================================

-- Vendor performance reviews
CREATE TABLE vendor_performance_reviews (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  
  -- Review Scores (1-10)
  quality_score INT, -- Quality of work
  timeliness_score INT, -- On-time completion
  communication_score INT, -- Responsiveness, clarity
  budget_adherence_score INT, -- Stayed within budget
  cleanliness_score INT, -- Job site cleanliness
  overall_score INT, -- Overall satisfaction
  
  -- Written Feedback
  what_went_well TEXT,
  what_needs_improvement TEXT,
  would_hire_again BOOLEAN,
  would_recommend BOOLEAN,
  
  -- Specific Issues
  issues_encountered TEXT[],
  change_orders_count INT,
  budget_variance DECIMAL(10,2),
  timeline_variance_days INT,
  
  -- Context
  scope_of_work TEXT, -- What they did
  contract_amount DECIMAL(10,2),
  actual_amount_paid DECIMAL(10,2),
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendor_review_project ON vendor_performance_reviews(project_id);
CREATE INDEX idx_vendor_review_vendor ON vendor_performance_reviews(vendor_id);
CREATE INDEX idx_vendor_review_score ON vendor_performance_reviews(overall_score DESC);

-- Project retrospective (lessons learned)
CREATE TABLE project_retrospectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE UNIQUE,
  
  -- Completion Info
  completed_date DATE,
  completed_by_id UUID REFERENCES users(id),
  
  -- Overall Reflection
  overall_satisfaction INT, -- 1-10
  would_do_again BOOLEAN,
  
  -- What Went Well
  successes TEXT[],
  unexpected_wins TEXT[],
  best_decisions TEXT[],
  
  -- What Didn't Go Well
  challenges TEXT[],
  mistakes TEXT[],
  costly_errors JSONB, -- [{mistake: '...', cost_impact: 2500, lesson: '...'}]
  
  -- Variance Analysis
  budget_breakdown JSONB, -- [{category, estimated, actual, variance, notes}]
  timeline_breakdown JSONB, -- [{phase, estimated_days, actual_days, variance, reason}]
  
  -- Key Lessons
  design_lessons TEXT[],
  construction_lessons TEXT[],
  vendor_lessons TEXT[],
  financial_lessons TEXT[],
  
  -- Process Improvements
  would_do_differently TEXT[],
  process_changes_for_next_time TEXT[],
  
  -- Knowledge Capture
  tips_for_future_projects TEXT[],
  resources_found_helpful JSONB, -- [{name, url, category}]
  
  -- Sharing
  share_anonymously_for_benchmarks BOOLEAN DEFAULT false,
  
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_retrospective_project ON project_retrospectives(project_id);

-- ============================================================================
-- HELPER FUNCTIONS & TRIGGERS
-- ============================================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to all tables with updated_at column
-- (Add for each table)
CREATE TRIGGER update_color_library_updated_at BEFORE UPDATE ON color_library 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_color_selections_updated_at BEFORE UPDATE ON project_color_selections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_material_library_updated_at BEFORE UPDATE ON material_library 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_material_selections_updated_at BEFORE UPDATE ON project_material_selections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_color_palettes_updated_at BEFORE UPDATE ON color_palettes 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moodboards_updated_at BEFORE UPDATE ON moodboards 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_moodboard_elements_updated_at BEFORE UPDATE ON moodboard_elements 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_settings_updated_at BEFORE UPDATE ON portfolio_settings 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_portfolio_projects_updated_at BEFORE UPDATE ON portfolio_projects 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_timeline_updated_at BEFORE UPDATE ON project_timeline 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_phases_updated_at BEFORE UPDATE ON timeline_phases 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_timeline_tasks_updated_at BEFORE UPDATE ON timeline_tasks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_calendar_events_updated_at BEFORE UPDATE ON calendar_events 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_documents_updated_at BEFORE UPDATE ON project_documents 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_document_templates_updated_at BEFORE UPDATE ON document_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_packet_templates_updated_at BEFORE UPDATE ON vendor_packet_templates 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_packets_updated_at BEFORE UPDATE ON vendor_packets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_home_products_updated_at BEFORE UPDATE ON smart_home_products 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_smart_home_packages_updated_at BEFORE UPDATE ON smart_home_packages 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_smart_home_selections_updated_at BEFORE UPDATE ON project_smart_home_selections 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_upgrade_roi_benchmarks_updated_at BEFORE UPDATE ON upgrade_roi_benchmarks 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_roi_actuals_updated_at BEFORE UPDATE ON project_roi_actuals 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_modernization_assessments_updated_at BEFORE UPDATE ON modernization_assessments 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_staging_plans_updated_at BEFORE UPDATE ON staging_plans 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_listing_assets_updated_at BEFORE UPDATE ON listing_assets 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_vendor_performance_reviews_updated_at BEFORE UPDATE ON vendor_performance_reviews 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_project_retrospectives_updated_at BEFORE UPDATE ON project_retrospectives 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE color_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_color_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE material_library ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_material_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE color_palettes ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboards ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE moodboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_timeline ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE timeline_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE document_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_packet_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_packets ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_home_products ENABLE ROW LEVEL SECURITY;
ALTER TABLE smart_home_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_smart_home_selections ENABLE ROW LEVEL SECURITY;
ALTER TABLE upgrade_roi_benchmarks ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_roi_actuals ENABLE ROW LEVEL SECURITY;
ALTER TABLE modernization_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE staging_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE listing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE vendor_performance_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_retrospectives ENABLE ROW LEVEL SECURITY;

-- Example RLS policies (assuming projects table has user_id)
-- Users can only see their own project data

-- Color selections
CREATE POLICY color_selections_policy ON project_color_selections
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Material selections  
CREATE POLICY material_selections_policy ON project_material_selections
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Moodboards
CREATE POLICY moodboards_policy ON moodboards
  USING (project_id IN (SELECT id FROM projects WHERE user_id = auth.uid()));

-- Portfolio (users can see their own, public portfolios visible to all)
CREATE POLICY portfolio_projects_owner_policy ON portfolio_projects
  USING (user_id = auth.uid());

CREATE POLICY portfolio_projects_public_policy ON portfolio_projects
  FOR SELECT
  USING (is_published = true);

-- Continue similar patterns for all tables...

-- ============================================================================
-- SEED DATA (Examples)
-- ============================================================================

-- Seed popular Sherwin Williams colors
INSERT INTO color_library (brand, color_code, color_name, hex_code, rgb_values, lrv, undertones, color_family, design_styles, popular) VALUES
('sherwin_williams', 'SW 7005', 'Pure White', '#F2F0EB', '{"r": 242, "g": 240, "b": 235}', 84, ARRAY['neutral'], 'white', ARRAY['modern_farmhouse', 'contemporary', 'transitional'], true),
('sherwin_williams', 'SW 7006', 'Extra White', '#F4F3F0', '{"r": 244, "g": 243, "b": 240}', 86, ARRAY['cool'], 'white', ARRAY['modern_farmhouse', 'contemporary'], true),
('sherwin_williams', 'SW 7008', 'Alabaster', '#EDEAE0', '{"r": 237, "g": 234, "b": 224}', 82, ARRAY['warm'], 'white', ARRAY['traditional', 'transitional'], true),
('sherwin_williams', 'SW 7015', 'Repose Gray', '#8C8B84', '{"r": 140, "g": 139, "b": 132}', 58, ARRAY['neutral', 'warm'], 'gray', ARRAY['modern_farmhouse', 'contemporary'], true),
('sherwin_williams', 'SW 7029', 'Agreeable Gray', '#9D9C93', '{"r": 157, "g": 156, "b": 147}', 60, ARRAY['warm'], 'beige', ARRAY['transitional', 'traditional'], true),
('sherwin_williams', 'SW 7069', 'Iron Ore', '#4E4F4F', '{"r": 78, "g": 79, "b": 79}', 6, ARRAY['neutral'], 'gray', ARRAY['modern_farmhouse', 'modern'], true);

-- Seed smart home packages
INSERT INTO smart_home_packages (name, description, tier_level, recommended_for, price_range) VALUES
('Rental Essential', 'Basic smart features for rental properties - focus on security and convenience for tenants', 1, ARRAY['rental'], '$500-1000'),
('Flip Standard', 'Modern buyer expectations - smart security, climate, and lighting that adds appeal without breaking budget', 2, ARRAY['flip_budget', 'flip_midrange'], '$1500-2500'),
('Modern Buyer', 'Comprehensive smart home for tech-savvy buyers - full automation and premium features', 3, ARRAY['flip_midrange', 'flip_luxury'], '$3000-5000'),
('Luxury Tech', 'High-end smart home integration - top-tier products and whole-home automation', 4, ARRAY['flip_luxury'], '$7000-15000');

-- Seed document templates
INSERT INTO document_templates (name, description, template_type, category, icon) VALUES
('Meeting Notes', 'Template for recording contractor meetings, site visits, and project discussions', 'meeting_notes', 'project_management', '📝'),
('Daily Site Report', 'Track daily progress, weather, workers on site, and issues', 'daily_report', 'project_management', '📋'),
('Change Order', 'Document scope changes, cost impacts, and approvals', 'change_order', 'project_management', '📄'),
('Vendor Contact Sheet', 'Organize all vendor information in one place', 'vendor_contacts', 'vendor', '📞'),
('Inspection Checklist', 'Pre-inspection checklist to ensure everything is ready', 'inspection_checklist', 'project_management', '✅'),
('Budget Tracker', 'Track planned vs. actual costs by category', 'budget_tracker', 'financial', '💰'),
('Warranty Registry', 'Keep track of all warranties and expiration dates', 'warranty_registry', 'project_management', '🛡️');

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================
