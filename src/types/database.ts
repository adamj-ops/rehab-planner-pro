/**
 * @file database.ts
 * @description TypeScript types generated from actual Supabase schema for Phase 2A
 * 
 * These types match the ACTUAL database structure, not documentation.
 * Generated: 2025-12-23
 * 
 * Tables covered:
 * - rehab_projects (main project table)
 * - color_library
 * - project_color_selections
 * - material_library
 * - project_material_selections
 * - color_palettes
 * - moodboards
 * - moodboard_elements
 * - moodboard_shares
 */

// ============================================================================
// UTILITY TYPES
// ============================================================================

/** UUID string type for better semantic clarity */
export type UUID = string;

/** ISO 8601 timestamp string */
export type Timestamp = string;

/** Common timestamp fields for all tables */
export interface TimestampFields {
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

/** RGB color values stored as JSONB */
export interface RGBValues {
  r: number;
  g: number;
  b: number;
}

/** Supplier information stored as JSONB in material_library */
export interface SupplierInfo {
  name: string;
  contact?: string;
  lead_time?: string;
  price?: number;
}

/** Shadow configuration for moodboard elements */
export interface ShadowConfig {
  offsetX: number;
  offsetY: number;
  blur: number;
  spread?: number;
  color: string;
}

/** Crop configuration for image elements */
export interface CropConfig {
  x: number;
  y: number;
  width: number;
  height: number;
}

/** Export dimensions for moodboard shares */
export interface ExportDimensions {
  width: number;
  height: number;
}

// ============================================================================
// REHAB PROJECTS (Main Project Table)
// ============================================================================

/** Row type for rehab_projects table */
export interface RehabProject {
  id: UUID;
  user_id: UUID | null;
  property_id: UUID | null;
  project_name: string;
  address_street: string;
  address_city: string;
  address_state: string;
  address_zip: string;
  square_feet: number | null;
  year_built: number | null;
  property_type: string | null;
  bedrooms: number | null;
  bathrooms: number | null;
  investment_strategy: string | null;
  target_buyer: string | null;
  hold_period_months: number | null;
  target_roi: number | null;
  max_budget: number | null;
  arv: number | null;
  purchase_price: number | null;
  neighborhood_comp_avg: number | null;
  status: ProjectStatus | null;
  total_estimated_cost: number | null;
  total_actual_cost: number | null;
  estimated_days: number | null;
  priority_score: number | null;
  roi_score: number | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ProjectStatus = 'draft' | 'active' | 'in_progress' | 'completed' | 'on_hold';

export type RehabProjectInsert = Omit<RehabProject, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type RehabProjectUpdate = Partial<Omit<RehabProject, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// COLOR LIBRARY
// ============================================================================

/** 
 * Row type for color_library table
 * Contains Sherwin-Williams color catalog data
 */
export interface ColorLibrary {
  id: UUID;
  /** Paint brand (e.g., "Sherwin-Williams") */
  brand: string;
  /** Brand color code (e.g., "SW 7015") */
  color_code: string | null;
  /** Human-readable color name (e.g., "Repose Gray") */
  color_name: string;
  /** Hex color code (e.g., "#C2BFB8") */
  hex_code: string;
  /** RGB values as JSONB {r, g, b} */
  rgb_values: RGBValues;
  /** Light Reflectance Value (0-100) - higher = brighter */
  lrv: number | null;
  /** Color undertones (e.g., ["warm", "neutral"]) */
  undertones: string[] | null;
  /** Color family (e.g., "gray", "white", "blue") */
  color_family: string | null;
  /** Available paint finishes (e.g., ["flat", "eggshell", "semi-gloss"]) */
  finish_options: string[] | null;
  /** Recommended rooms (e.g., ["living_room", "bedroom"]) */
  recommended_rooms: string[] | null;
  /** Recommended surfaces (e.g., ["walls", "trim", "cabinets"]) */
  recommended_surfaces: string[] | null;
  /** URL to color swatch image */
  image_url: string | null;
  /** Whether this is a popular/trending color */
  popular: boolean | null;
  /** Year the color was introduced */
  year_introduced: number | null;
  /** Whether the color is currently available */
  is_active: boolean | null;
  /** Compatible design styles (e.g., ["modern_farmhouse", "transitional"]) */
  design_styles: string[] | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ColorLibraryInsert = Omit<ColorLibrary, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ColorLibraryUpdate = Partial<Omit<ColorLibrary, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// PROJECT COLOR SELECTIONS
// ============================================================================

/**
 * Row type for project_color_selections table
 * Links colors to specific rooms/surfaces in a project
 */
export interface ProjectColorSelection {
  id: UUID;
  /** Reference to rehab_projects.id */
  project_id: UUID;
  /** Room type (e.g., "kitchen", "primary_bedroom") */
  room_type: string;
  /** Optional custom room name */
  room_name: string | null;
  /** Surface type (e.g., "walls", "trim", "cabinets") */
  surface_type: string;
  /** Reference to color_library.id (null if custom color) */
  color_id: UUID | null;
  /** Custom color name (if not from library) */
  custom_color_name: string | null;
  /** Custom hex code (if not from library) */
  custom_hex_code: string | null;
  /** Paint finish (e.g., "eggshell", "semi-gloss") */
  finish: string | null;
  /** Number of coats recommended */
  coats: number | null;
  /** Whether primer is needed */
  primer_needed: boolean | null;
  /** Reference to rehab_scope_items.id */
  linked_scope_item_id: UUID | null;
  /** Additional notes */
  notes: string | null;
  /** Application instructions */
  application_instructions: string | null;
  /** Whether this is the primary color for the room */
  is_primary: boolean | null;
  /** Whether internally approved */
  is_approved: boolean | null;
  /** Whether client has approved */
  approved_by_client: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ProjectColorSelectionInsert = Omit<ProjectColorSelection, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ProjectColorSelectionUpdate = Partial<Omit<ProjectColorSelection, 'id' | 'created_at' | 'updated_at'>>;

/** Color selection with joined color library data */
export interface ProjectColorSelectionWithColor extends ProjectColorSelection {
  color_library?: ColorLibrary | null;
}

// ============================================================================
// MATERIAL LIBRARY
// ============================================================================

/**
 * Row type for material_library table
 * Contains catalog of countertops, flooring, tile, hardware, etc.
 */
export interface MaterialLibrary {
  id: UUID;
  /** Material type (e.g., "countertop", "flooring", "tile") */
  material_type: string;
  /** Material category (e.g., "quartz", "lvp", "porcelain") */
  material_category: string | null;
  /** Brand name */
  brand: string | null;
  /** Product name */
  product_name: string;
  /** Model or SKU number */
  model_number: string | null;
  /** Store SKU */
  sku: string | null;
  /** Product description */
  description: string | null;
  /** Color description */
  color_description: string | null;
  /** Surface finish */
  finish: string | null;
  /** Product dimensions */
  dimensions: string | null;
  /** Material thickness */
  thickness: string | null;
  /** Material composition */
  material_composition: string | null;
  /** Average cost per unit */
  avg_cost_per_unit: number | null;
  /** Unit type (e.g., "sq_ft", "linear_ft", "each") */
  unit_type: string | null;
  /** Supplier information as JSONB array */
  suppliers: SupplierInfo[] | null;
  /** Typical lead time in days */
  typical_lead_time_days: number | null;
  /** Main product image URL */
  image_url: string | null;
  /** Swatch/sample image URL */
  swatch_image_url: string | null;
  /** Additional images as JSONB array */
  additional_images: string[] | null;
  /** Recommended applications (e.g., ["kitchen", "bathroom"]) */
  recommended_for: string[] | null;
  /** Compatible design styles */
  design_styles: string[] | null;
  /** Whether this is a popular product */
  popular: boolean | null;
  /** Whether the product is currently available */
  is_active: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type MaterialType = 
  | 'countertop' 
  | 'flooring' 
  | 'tile' 
  | 'hardware' 
  | 'fixture' 
  | 'cabinetry' 
  | 'lighting' 
  | 'appliance';

export type MaterialLibraryInsert = Omit<MaterialLibrary, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type MaterialLibraryUpdate = Partial<Omit<MaterialLibrary, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// PROJECT MATERIAL SELECTIONS
// ============================================================================

/**
 * Row type for project_material_selections table
 * Links materials to specific rooms/applications in a project
 */
export interface ProjectMaterialSelection {
  id: UUID;
  /** Reference to rehab_projects.id */
  project_id: UUID;
  /** Room type */
  room_type: string | null;
  /** Custom room name */
  room_name: string | null;
  /** Application (e.g., "countertop", "flooring", "backsplash") */
  application: string;
  /** Reference to material_library.id (null if custom) */
  material_id: UUID | null;
  /** Custom material name */
  custom_material_name: string | null;
  /** Custom material description */
  custom_description: string | null;
  /** Quantity needed */
  quantity: number | null;
  /** Unit type for quantity */
  unit_type: string | null;
  /** Cost per unit */
  cost_per_unit: number | null;
  /** Total cost (quantity * cost_per_unit) */
  total_cost: number | null;
  /** Selected supplier */
  selected_supplier: string | null;
  /** Order date */
  order_date: string | null;
  /** Expected delivery date */
  expected_delivery_date: string | null;
  /** Reference to rehab_scope_items.id */
  linked_scope_item_id: UUID | null;
  /** Additional notes */
  notes: string | null;
  /** Installation notes */
  installation_notes: string | null;
  /** Whether internally approved */
  is_approved: boolean | null;
  /** Whether ordered */
  is_ordered: boolean | null;
  /** Whether received */
  is_received: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ProjectMaterialSelectionInsert = Omit<ProjectMaterialSelection, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ProjectMaterialSelectionUpdate = Partial<Omit<ProjectMaterialSelection, 'id' | 'created_at' | 'updated_at'>>;

/** Material selection with joined material library data */
export interface ProjectMaterialSelectionWithMaterial extends ProjectMaterialSelection {
  material_library?: MaterialLibrary | null;
}

// ============================================================================
// COLOR PALETTES
// ============================================================================

/**
 * Row type for color_palettes table
 * Pre-defined or user-created color palettes
 */
export interface ColorPalette {
  id: UUID;
  /** Palette name */
  name: string;
  /** Palette description */
  description: string | null;
  /** Associated design style */
  design_style: string | null;
  /** Primary color reference */
  primary_color_id: UUID | null;
  /** Secondary color reference */
  secondary_color_id: UUID | null;
  /** Array of accent color IDs */
  accent_color_ids: UUID[] | null;
  /** Recommended use cases */
  recommended_for: string[] | null;
  /** Price range (e.g., "budget", "mid", "luxury") */
  price_range: string | null;
  /** Whether currently trending */
  is_trending: boolean | null;
  /** Number of times used */
  usage_count: number | null;
  /** Whether created by system or user */
  created_by_system: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ColorPaletteInsert = Omit<ColorPalette, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ColorPaletteUpdate = Partial<Omit<ColorPalette, 'id' | 'created_at' | 'updated_at'>>;

/** Color palette with joined color data */
export interface ColorPaletteWithColors extends ColorPalette {
  primary_color?: ColorLibrary | null;
  secondary_color?: ColorLibrary | null;
  accent_colors?: ColorLibrary[] | null;
}

// ============================================================================
// MOODBOARDS
// ============================================================================

/**
 * Row type for moodboards table
 * Visual design boards for projects
 */
export interface Moodboard {
  id: UUID;
  /** Reference to rehab_projects.id */
  project_id: UUID;
  /** Moodboard name */
  name: string;
  /** Moodboard description */
  description: string | null;
  /** Type (e.g., "custom", "kitchen", "bathroom") */
  moodboard_type: string | null;
  /** Whether this is the primary moodboard */
  is_primary: boolean | null;
  /** Template used to create */
  template_used: string | null;
  /** Layout type (e.g., "free", "grid") */
  layout_type: string | null;
  /** Canvas width in pixels */
  canvas_width: number | null;
  /** Canvas height in pixels */
  canvas_height: number | null;
  /** Background color hex */
  background_color: string | null;
  /** Background image URL */
  background_image_url: string | null;
  /** Whether to show grid */
  show_grid: boolean | null;
  /** Grid size in pixels */
  grid_size: number | null;
  /** Whether to snap to grid */
  snap_to_grid: boolean | null;
  /** Whether publicly viewable */
  is_public: boolean | null;
  /** Public URL slug (unique) */
  public_slug: string | null;
  /** Whether password protected */
  password_protected: boolean | null;
  /** Password hash (if protected) */
  password_hash: string | null;
  /** View count */
  view_count: number | null;
  /** Share count */
  share_count: number | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type MoodboardInsert = Omit<Moodboard, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type MoodboardUpdate = Partial<Omit<Moodboard, 'id' | 'created_at' | 'updated_at'>>;

/** Moodboard with elements loaded */
export interface MoodboardWithElements extends Moodboard {
  moodboard_elements?: MoodboardElement[];
}

// ============================================================================
// MOODBOARD ELEMENTS
// ============================================================================

/** Element types for moodboard */
export type MoodboardElementType = 
  | 'image' 
  | 'color_swatch' 
  | 'text' 
  | 'material_sample' 
  | 'shape' 
  | 'icon';

/**
 * Row type for moodboard_elements table
 * Individual elements within a moodboard
 */
export interface MoodboardElement {
  id: UUID;
  /** Reference to moodboards.id */
  moodboard_id: UUID;
  /** Element type */
  element_type: string;
  /** X position on canvas */
  position_x: number;
  /** Y position on canvas */
  position_y: number;
  /** Element width */
  width: number;
  /** Element height */
  height: number;
  /** Rotation in degrees */
  rotation: number | null;
  /** Z-index for layering */
  z_index: number | null;
  /** Opacity (0-1) */
  opacity: number | null;
  /** Border width */
  border_width: number | null;
  /** Border color hex */
  border_color: string | null;
  /** Border radius */
  border_radius: number | null;
  /** Whether shadow is enabled */
  shadow_enabled: boolean | null;
  /** Shadow configuration */
  shadow_config: ShadowConfig | null;
  /** Image URL (for image elements) */
  image_url: string | null;
  /** Image source (e.g., "upload", "unsplash") */
  image_source: string | null;
  /** Image attribution text */
  image_attribution: string | null;
  /** Original image width */
  original_image_width: number | null;
  /** Original image height */
  original_image_height: number | null;
  /** Crop configuration */
  crop_config: CropConfig | null;
  /** Reference to color_library.id (for color swatches) */
  color_id: UUID | null;
  /** Swatch shape (e.g., "square", "circle") */
  swatch_shape: string | null;
  /** Whether to show color name */
  show_color_name: boolean | null;
  /** Whether to show color code */
  show_color_code: boolean | null;
  /** Text content (for text elements) */
  text_content: string | null;
  /** Font family */
  font_family: string | null;
  /** Font size */
  font_size: number | null;
  /** Font weight */
  font_weight: string | null;
  /** Font style */
  font_style: string | null;
  /** Text color hex */
  text_color: string | null;
  /** Text alignment */
  text_align: string | null;
  /** Line height */
  line_height: number | null;
  /** Reference to material_library.id (for material samples) */
  material_id: UUID | null;
  /** Material sample image URL */
  material_sample_image_url: string | null;
  /** Whether to show material name */
  show_material_name: boolean | null;
  /** Whether to show material specs */
  show_material_specs: boolean | null;
  /** Shape type (for shape elements) */
  shape_type: string | null;
  /** Fill color hex */
  fill_color: string | null;
  /** Stroke color hex */
  stroke_color: string | null;
  /** Stroke width */
  stroke_width: number | null;
  /** Reference to rehab_scope_items.id */
  linked_scope_item_id: UUID | null;
  /** Reference to project_color_selections.id */
  linked_color_selection_id: UUID | null;
  /** Reference to project_material_selections.id */
  linked_material_selection_id: UUID | null;
  /** Element notes */
  notes: string | null;
  /** Element tags */
  tags: string[] | null;
  /** Whether element is locked */
  is_locked: boolean | null;
  /** Whether element is visible */
  is_visible: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type MoodboardElementInsert = Omit<MoodboardElement, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type MoodboardElementUpdate = Partial<Omit<MoodboardElement, 'id' | 'created_at' | 'updated_at'>>;

/** Element with linked color/material data */
export interface MoodboardElementWithRefs extends MoodboardElement {
  color_library?: ColorLibrary | null;
  material_library?: MaterialLibrary | null;
}

// ============================================================================
// MOODBOARD SHARES
// ============================================================================

/** Share types for moodboards */
export type ShareType = 'link' | 'email' | 'export' | 'social';

/** Recipient types */
export type RecipientType = 'client' | 'contractor' | 'team' | 'public';

/**
 * Row type for moodboard_shares table
 * Tracks sharing history and exports
 */
export interface MoodboardShare {
  id: UUID;
  /** Reference to moodboards.id */
  moodboard_id: UUID;
  /** Type of share */
  share_type: string;
  /** Social platform (if social share) */
  platform: string | null;
  /** Share URL */
  share_url: string | null;
  /** Short code for URL (unique) */
  short_code: string | null;
  /** Whether password protected */
  password_protected: boolean | null;
  /** Password hash */
  password_hash: string | null;
  /** Expiration timestamp */
  expires_at: Timestamp | null;
  /** Recipient email */
  recipient_email: string | null;
  /** Recipient name */
  recipient_name: string | null;
  /** Recipient type */
  recipient_type: string | null;
  /** Export format (e.g., "png", "pdf") */
  export_format: string | null;
  /** Export resolution */
  export_resolution: string | null;
  /** Export dimensions */
  export_dimensions: ExportDimensions | null;
  /** Social media caption */
  social_caption: string | null;
  /** Social media hashtags */
  social_hashtags: string[] | null;
  /** URL where posted (for social shares) */
  posted_url: string | null;
  /** View count */
  view_count: number | null;
  /** Last viewed timestamp */
  last_viewed_at: Timestamp | null;
  created_at: Timestamp | null;
}

export type MoodboardShareInsert = Omit<MoodboardShare, 'id' | 'created_at'> & {
  id?: UUID;
};

export type MoodboardShareUpdate = Partial<Omit<MoodboardShare, 'id' | 'created_at'>>;

// ============================================================================
// DATABASE TYPE NAMESPACE (Supabase-style)
// ============================================================================

/**
 * Complete database type definitions for Supabase client
 */
export interface Database {
  public: {
    Tables: {
      rehab_projects: {
        Row: RehabProject;
        Insert: RehabProjectInsert;
        Update: RehabProjectUpdate;
      };
      color_library: {
        Row: ColorLibrary;
        Insert: ColorLibraryInsert;
        Update: ColorLibraryUpdate;
      };
      project_color_selections: {
        Row: ProjectColorSelection;
        Insert: ProjectColorSelectionInsert;
        Update: ProjectColorSelectionUpdate;
      };
      material_library: {
        Row: MaterialLibrary;
        Insert: MaterialLibraryInsert;
        Update: MaterialLibraryUpdate;
      };
      project_material_selections: {
        Row: ProjectMaterialSelection;
        Insert: ProjectMaterialSelectionInsert;
        Update: ProjectMaterialSelectionUpdate;
      };
      color_palettes: {
        Row: ColorPalette;
        Insert: ColorPaletteInsert;
        Update: ColorPaletteUpdate;
      };
      moodboards: {
        Row: Moodboard;
        Insert: MoodboardInsert;
        Update: MoodboardUpdate;
      };
      moodboard_elements: {
        Row: MoodboardElement;
        Insert: MoodboardElementInsert;
        Update: MoodboardElementUpdate;
      };
      moodboard_shares: {
        Row: MoodboardShare;
        Insert: MoodboardShareInsert;
        Update: MoodboardShareUpdate;
      };
      property_assessments: {
        Row: PropertyAssessment;
        Insert: PropertyAssessmentInsert;
        Update: PropertyAssessmentUpdate;
      };
      contractors: {
        Row: Contractor;
        Insert: ContractorInsert;
        Update: ContractorUpdate;
      };
      cost_items: {
        Row: CostItem;
        Insert: CostItemInsert;
        Update: CostItemUpdate;
      };
      scope_items: {
        Row: ScopeItem;
        Insert: ScopeItemInsert;
        Update: ScopeItemUpdate;
      };
      project_timeline: {
        Row: ProjectTimeline;
        Insert: ProjectTimelineInsert;
        Update: ProjectTimelineUpdate;
      };
      regional_multipliers: {
        Row: RegionalMultiplier;
      };
      project_contractors: {
        Row: ProjectContractor;
        Insert: ProjectContractorInsert;
        Update: ProjectContractorUpdate;
      };
    };
  };
}

// ============================================================================
// PROPERTY ASSESSMENTS
// ============================================================================

/** Condition rating options */
export type ConditionRating = 'excellent' | 'good' | 'fair' | 'poor' | 'terrible';

/** Room types for assessments */
export type RoomType =
  | 'kitchen'
  | 'bathroom'
  | 'bedroom'
  | 'living_room'
  | 'dining_room'
  | 'garage'
  | 'exterior'
  | 'basement'
  | 'attic'
  | 'laundry'
  | 'office'
  | 'hallway';

/** Component conditions stored as JSONB */
export interface ComponentConditions {
  flooring?: ConditionRating;
  walls?: ConditionRating;
  ceiling?: ConditionRating;
  electrical?: ConditionRating;
  plumbing?: ConditionRating;
  windows?: ConditionRating;
  doors?: ConditionRating;
  hvac?: ConditionRating;
  appliances?: ConditionRating;
  cabinets?: ConditionRating;
  countertops?: ConditionRating;
}

/** Action needed for a component */
export interface ActionNeeded {
  component: string;
  action: 'repair' | 'replace' | 'upgrade' | 'none';
  notes?: string;
}

/**
 * Row type for property_assessments table
 * Room-by-room condition assessment
 */
export interface PropertyAssessment {
  id: UUID;
  project_id: UUID;
  room_type: string;
  room_name: string | null;
  floor_level: string | null;
  overall_condition: ConditionRating | null;
  components: ComponentConditions;
  actions_needed: ActionNeeded[];
  length_ft: number | null;
  width_ft: number | null;
  sqft: number | null;
  ceiling_height_ft: number | null;
  notes: string | null;
  photos: string[] | null;
  assessed_by: string | null;
  assessed_at: Timestamp | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type PropertyAssessmentInsert = Omit<PropertyAssessment, 'id' | 'created_at' | 'updated_at' | 'assessed_at'> & {
  id?: UUID;
  assessed_at?: Timestamp;
};

export type PropertyAssessmentUpdate = Partial<Omit<PropertyAssessment, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// CONTRACTORS
// ============================================================================

/** Contractor specialties */
export type ContractorSpecialty =
  | 'plumbing'
  | 'electrical'
  | 'hvac'
  | 'roofing'
  | 'flooring'
  | 'painting'
  | 'kitchen'
  | 'bathroom'
  | 'general'
  | 'landscaping'
  | 'concrete'
  | 'masonry'
  | 'windows'
  | 'siding'
  | 'insulation'
  | 'demolition'
  | 'foundation'
  | 'carpentry'
  | 'drywall'
  | 'tile';

/** Vendor types */
export type VendorType = 'contractor' | 'supplier' | 'service_provider';

/**
 * Row type for contractors table
 * User's contractor/vendor Rolodex
 */
export interface Contractor {
  id: UUID;
  user_id: UUID;
  name: string;
  company: string | null;
  email: string | null;
  phone: string | null;
  address_street: string | null;
  address_city: string | null;
  address_state: string | null;
  address_zip: string | null;
  specialties: string[] | null;
  vendor_type: VendorType | null;
  license_number: string | null;
  license_expiration: string | null;
  insurance_coverage: string | null;
  insurance_expiration: string | null;
  hourly_rate: number | null;
  markup_percent: number | null;
  payment_terms: string | null;
  rating: number | null;
  completed_projects: number | null;
  total_spent: number | null;
  is_active: boolean | null;
  is_preferred: boolean | null;
  notes: string | null;
  tags: string[] | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ContractorInsert = Omit<Contractor, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ContractorUpdate = Partial<Omit<Contractor, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// COST ITEMS CATALOG
// ============================================================================

/** Cost item categories */
export type CostCategory = 'exterior' | 'interior' | 'systems' | 'structural';

/** Difficulty levels */
export type DifficultyLevel = 'simple' | 'moderate' | 'complex';

/**
 * Row type for cost_items table
 * Renovation cost catalog
 */
export interface CostItem {
  id: UUID;
  category: CostCategory;
  subcategory: string;
  name: string;
  description: string | null;
  unit: string;
  base_cost: number;
  labor_percent: number | null;
  budget_multiplier: number | null;
  standard_multiplier: number | null;
  premium_multiplier: number | null;
  luxury_multiplier: number | null;
  difficulty: DifficultyLevel | null;
  difficulty_multiplier: number | null;
  estimated_hours: number | null;
  typical_duration_days: number | null;
  typical_roi: number | null;
  buyer_appeal_score: number | null;
  common_dependencies: string[] | null;
  is_active: boolean | null;
  notes: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type CostItemInsert = Omit<CostItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type CostItemUpdate = Partial<Omit<CostItem, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// SCOPE ITEMS
// ============================================================================

/** Quality tiers for scope items */
export type QualityTier = 'budget' | 'standard' | 'premium' | 'luxury';

/** Priority levels (MoSCoW method) */
export type PriorityLevel = 'must' | 'should' | 'could' | 'nice';

/** Scope item status */
export type ScopeItemStatus = 'planned' | 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'on_hold';

/**
 * Row type for scope_items table
 * Individual renovation tasks for a project
 */
export interface ScopeItem {
  id: UUID;
  project_id: UUID;
  name: string;
  description: string | null;
  category: CostCategory;
  subcategory: string | null;
  room_id: UUID | null;
  room_type: string | null;
  room_name: string | null;
  cost_item_id: UUID | null;
  quantity: number | null;
  unit: string | null;
  quality_tier: QualityTier | null;
  labor_cost: number | null;
  material_cost: number | null;
  total_cost: number | null;
  priority: PriorityLevel | null;
  urgency_score: number | null;
  roi_score: number | null;
  risk_score: number | null;
  overall_score: number | null;
  phase: number | null;
  estimated_days: number | null;
  start_date: string | null;
  end_date: string | null;
  dependencies: UUID[] | null;
  contractor_id: UUID | null;
  assigned_at: Timestamp | null;
  status: ScopeItemStatus | null;
  completed_at: Timestamp | null;
  actual_cost: number | null;
  notes: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ScopeItemInsert = Omit<ScopeItem, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ScopeItemUpdate = Partial<Omit<ScopeItem, 'id' | 'created_at' | 'updated_at'>>;

/** Scope item with joined data */
export interface ScopeItemWithDetails extends ScopeItem {
  room?: PropertyAssessment | null;
  cost_item?: CostItem | null;
  contractor?: Contractor | null;
}

// ============================================================================
// PROJECT TIMELINE
// ============================================================================

/** Timeline phase structure */
export interface TimelinePhase {
  name: string;
  phase_number: number;
  start: string;
  end: string;
  scope_item_ids: UUID[];
  status: 'pending' | 'in_progress' | 'completed';
}

/**
 * Row type for project_timeline table
 * Project schedule data
 */
export interface ProjectTimeline {
  id: UUID;
  project_id: UUID;
  start_date: string | null;
  target_end_date: string | null;
  actual_end_date: string | null;
  phases: TimelinePhase[];
  critical_path: UUID[] | null;
  total_estimated_days: number | null;
  total_actual_days: number | null;
  is_locked: boolean | null;
  notes: string | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ProjectTimelineInsert = Omit<ProjectTimeline, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ProjectTimelineUpdate = Partial<Omit<ProjectTimeline, 'id' | 'created_at' | 'updated_at'>>;

// ============================================================================
// REGIONAL MULTIPLIERS
// ============================================================================

/**
 * Row type for regional_multipliers table
 * Location-based pricing adjustments
 */
export interface RegionalMultiplier {
  id: UUID;
  zip_code: string;
  city: string | null;
  state: string;
  metro_area: string | null;
  labor_multiplier: number | null;
  material_multiplier: number | null;
  overall_multiplier: number | null;
  market_temperature: 'hot' | 'warm' | 'neutral' | 'cool' | 'cold' | null;
  avg_days_on_market: number | null;
  data_source: string | null;
  last_updated: Timestamp | null;
}

// ============================================================================
// PROJECT CONTRACTORS (Junction table)
// ============================================================================

/**
 * Row type for project_contractors table
 * Links contractors to specific projects
 */
export interface ProjectContractor {
  id: UUID;
  project_id: UUID;
  contractor_id: UUID;
  role: string | null;
  agreed_rate: number | null;
  contract_amount: number | null;
  payment_status: 'pending' | 'partial' | 'paid' | null;
  amount_paid: number | null;
  notes: string | null;
  is_active: boolean | null;
  created_at: Timestamp | null;
  updated_at: Timestamp | null;
}

export type ProjectContractorInsert = Omit<ProjectContractor, 'id' | 'created_at' | 'updated_at'> & {
  id?: UUID;
};

export type ProjectContractorUpdate = Partial<Omit<ProjectContractor, 'id' | 'created_at' | 'updated_at'>>;

/** Project contractor with joined contractor data */
export interface ProjectContractorWithDetails extends ProjectContractor {
  contractor?: Contractor | null;
}

// ============================================================================
// CONVENIENCE TYPE EXPORTS
// ============================================================================

/** Type for Supabase table names */
export type TableName = keyof Database['public']['Tables'];

/** Get Row type for a table */
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];

/** Get Insert type for a table */
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];

/** Get Update type for a table */
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];
