// ============================================================================
// DESIGN INTELLIGENCE TYPES
// Phase 2A: Color Planner, Material Palette, Moodboard Builder
// ============================================================================

// ----------------------------------------------------------------------------
// CORE ENUMS & CONSTANTS
// ----------------------------------------------------------------------------

export type DesignStyle = 
  | 'modern'
  | 'transitional'
  | 'traditional'
  | 'contemporary'
  | 'farmhouse'
  | 'industrial'
  | 'coastal'
  | 'mid-century'
  | 'scandinavian'
  | 'bohemian'
  | 'minimalist'
  | 'rustic'

export type TargetBuyer = 'first_time' | 'move_up' | 'investor' | 'luxury'

export type RoomType = 
  | 'living_room'
  | 'kitchen'
  | 'primary_bedroom'
  | 'bedroom'
  | 'bathroom'
  | 'primary_bathroom'
  | 'dining_room'
  | 'office'
  | 'laundry'
  | 'garage'
  | 'basement'
  | 'exterior'
  | 'entryway'
  | 'hallway'

export type SurfaceType = 
  | 'walls'
  | 'ceiling'
  | 'trim'
  | 'cabinets'
  | 'doors'
  | 'accent_wall'
  | 'exterior_body'
  | 'exterior_trim'
  | 'exterior_accent'

export type PaintFinish = 
  | 'flat'
  | 'matte'
  | 'eggshell'
  | 'satin'
  | 'semi-gloss'
  | 'high-gloss'

export type MaterialType = 
  | 'countertop'
  | 'flooring'
  | 'tile'
  | 'backsplash'
  | 'cabinet'
  | 'hardware'
  | 'fixture'
  | 'appliance'
  | 'lighting'

export type ColorFamily = 
  | 'white'
  | 'gray'
  | 'beige'
  | 'blue'
  | 'green'
  | 'yellow'
  | 'orange'
  | 'red'
  | 'purple'
  | 'pink'
  | 'brown'
  | 'black'
  | 'neutral'

export type Undertone = 'warm' | 'cool' | 'neutral'

// ----------------------------------------------------------------------------
// COLOR LIBRARY
// ----------------------------------------------------------------------------

export interface ColorLibraryItem {
  id: string
  
  // Brand & Identification
  brand: string
  colorCode: string | null
  colorName: string
  
  // Color Data
  hexCode: string
  rgbValues: {
    r: number
    g: number
    b: number
  }
  
  // Technical Specs
  lrv: number | null // Light Reflectance Value (0-100)
  undertones: Undertone[]
  colorFamily: ColorFamily | null
  
  // Application
  finishOptions: PaintFinish[]
  recommendedRooms: RoomType[]
  recommendedSurfaces: SurfaceType[]
  
  // Metadata
  imageUrl: string | null
  popular: boolean
  yearIntroduced: number | null
  isActive: boolean
  
  // Design Style Associations
  designStyles: DesignStyle[]
  
  createdAt: Date
  updatedAt: Date
}

export interface ColorSearchFilters {
  brand?: string
  colorFamily?: ColorFamily
  lrvMin?: number
  lrvMax?: number
  undertone?: Undertone
  designStyle?: DesignStyle
  roomType?: RoomType
  popular?: boolean
  searchTerm?: string
}

// ----------------------------------------------------------------------------
// PROJECT COLOR SELECTIONS
// ----------------------------------------------------------------------------

export interface ProjectColorSelection {
  id: string
  projectId: string
  
  // Location in Property
  roomType: RoomType
  roomName: string | null
  surfaceType: SurfaceType
  
  // Color Selection
  colorId: string | null
  customColorName: string | null
  customHexCode: string | null
  
  // Resolved color (from library or custom)
  color?: ColorLibraryItem
  
  // Application Details
  finish: PaintFinish | null
  coats: number
  primerNeeded: boolean
  
  // Scope Linking
  linkedScopeItemId: string | null
  
  // Notes
  notes: string | null
  applicationInstructions: string | null
  
  // Status
  isPrimary: boolean
  isApproved: boolean
  approvedByClient: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface ColorSelectionInput {
  projectId: string
  roomType: RoomType
  roomName?: string
  surfaceType: SurfaceType
  colorId?: string
  customColorName?: string
  customHexCode?: string
  finish?: PaintFinish
  coats?: number
  primerNeeded?: boolean
  linkedScopeItemId?: string
  notes?: string
  applicationInstructions?: string
  isPrimary?: boolean
}

// ----------------------------------------------------------------------------
// COLOR PALETTES
// ----------------------------------------------------------------------------

export interface ColorPalette {
  id: string
  
  // Palette Info
  name: string
  description: string | null
  designStyle: DesignStyle | null
  
  // Colors in Palette
  primaryColorId: string | null
  secondaryColorId: string | null
  accentColorIds: string[]
  
  // Resolved colors
  primaryColor?: ColorLibraryItem
  secondaryColor?: ColorLibraryItem
  accentColors?: ColorLibraryItem[]
  
  // Usage Recommendations
  recommendedFor: TargetBuyer[]
  priceRange: 'budget' | 'standard' | 'premium' | 'luxury' | null
  
  // Metadata
  isTrending: boolean
  usageCount: number
  createdBySystem: boolean
  
  createdAt: Date
  updatedAt: Date
}

// ----------------------------------------------------------------------------
// MATERIAL LIBRARY
// ----------------------------------------------------------------------------

export interface MaterialLibraryItem {
  id: string
  
  // Material Identification
  materialType: MaterialType
  materialCategory: string | null
  
  // Product Details
  brand: string | null
  productName: string
  modelNumber: string | null
  sku: string | null
  
  // Description
  description: string | null
  colorDescription: string | null
  finish: string | null
  
  // Specifications
  dimensions: string | null
  thickness: string | null
  materialComposition: string | null
  
  // Pricing
  avgCostPerUnit: number | null
  unitType: string | null
  
  // Sourcing
  suppliers: MaterialSupplier[]
  typicalLeadTimeDays: number | null
  
  // Visual Assets
  imageUrl: string | null
  swatchImageUrl: string | null
  additionalImages: string[]
  
  // Compatibility
  recommendedFor: RoomType[]
  designStyles: DesignStyle[]
  
  // Metadata
  popular: boolean
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface MaterialSupplier {
  name: string
  url?: string
  price?: number
  inStock?: boolean
}

export interface MaterialSearchFilters {
  materialType?: MaterialType
  materialCategory?: string
  brand?: string
  designStyle?: DesignStyle
  roomType?: RoomType
  priceMin?: number
  priceMax?: number
  popular?: boolean
  searchTerm?: string
}

// ----------------------------------------------------------------------------
// PROJECT MATERIAL SELECTIONS
// ----------------------------------------------------------------------------

export interface ProjectMaterialSelection {
  id: string
  projectId: string
  
  // Location
  roomType: RoomType | null
  roomName: string | null
  application: string
  
  // Material Selection
  materialId: string | null
  customMaterialName: string | null
  customDescription: string | null
  
  // Resolved material
  material?: MaterialLibraryItem
  
  // Quantity & Pricing
  quantity: number | null
  unitType: string | null
  costPerUnit: number | null
  totalCost: number | null
  
  // Sourcing
  selectedSupplier: string | null
  orderDate: Date | null
  expectedDeliveryDate: Date | null
  
  // Scope Linking
  linkedScopeItemId: string | null
  
  // Notes
  notes: string | null
  installationNotes: string | null
  
  // Status
  isApproved: boolean
  isOrdered: boolean
  isReceived: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface MaterialSelectionInput {
  projectId: string
  roomType?: RoomType
  roomName?: string
  application: string
  materialId?: string
  customMaterialName?: string
  customDescription?: string
  quantity?: number
  unitType?: string
  costPerUnit?: number
  selectedSupplier?: string
  linkedScopeItemId?: string
  notes?: string
  installationNotes?: string
}

// ----------------------------------------------------------------------------
// MOODBOARDS
// ----------------------------------------------------------------------------

export type MoodboardLayoutType = 'free' | 'grid' | 'masonry' | 'collage'
export type MoodboardType = 'custom' | 'template' | 'ai-generated'

export interface Moodboard {
  id: string
  projectId: string
  
  // Basic Info
  name: string
  description: string | null
  
  // Type & Purpose
  moodboardType: MoodboardType
  isPrimary: boolean
  
  // Layout Configuration
  templateUsed: string | null
  layoutType: MoodboardLayoutType
  canvasWidth: number
  canvasHeight: number
  backgroundColor: string
  backgroundImageUrl: string | null
  
  // Settings
  showGrid: boolean
  gridSize: number
  snapToGrid: boolean
  
  // Sharing & Export
  isPublic: boolean
  publicSlug: string | null
  passwordProtected: boolean
  
  // Usage Tracking
  viewCount: number
  shareCount: number
  
  // Elements
  elements?: MoodboardElement[]
  
  createdAt: Date
  updatedAt: Date
}

export interface MoodboardInput {
  projectId: string
  name: string
  description?: string
  moodboardType?: MoodboardType
  isPrimary?: boolean
  templateUsed?: string
  layoutType?: MoodboardLayoutType
  canvasWidth?: number
  canvasHeight?: number
  backgroundColor?: string
  backgroundImageUrl?: string
  showGrid?: boolean
  gridSize?: number
  snapToGrid?: boolean
}

// ----------------------------------------------------------------------------
// MOODBOARD ELEMENTS
// ----------------------------------------------------------------------------

export type MoodboardElementType = 
  | 'image'
  | 'color_swatch'
  | 'text'
  | 'material_sample'
  | 'shape'

export type SwatchShape = 'square' | 'circle' | 'rounded'
export type ShapeType = 'rectangle' | 'circle' | 'line' | 'arrow'

export interface MoodboardElement {
  id: string
  moodboardId: string
  
  // Element Type
  elementType: MoodboardElementType
  
  // Layout & Position
  positionX: number
  positionY: number
  width: number
  height: number
  rotation: number
  zIndex: number
  
  // Styling
  opacity: number
  borderWidth: number
  borderColor: string | null
  borderRadius: number
  shadowEnabled: boolean
  shadowConfig: ShadowConfig | null
  
  // FOR IMAGE ELEMENTS
  imageUrl: string | null
  imageSource: string | null
  imageAttribution: string | null
  originalImageWidth: number | null
  originalImageHeight: number | null
  cropConfig: CropConfig | null
  
  // FOR COLOR SWATCH ELEMENTS
  colorId: string | null
  swatchShape: SwatchShape
  showColorName: boolean
  showColorCode: boolean
  color?: ColorLibraryItem
  
  // FOR TEXT ELEMENTS
  textContent: string | null
  fontFamily: string
  fontSize: number
  fontWeight: string
  fontStyle: string
  textColor: string
  textAlign: 'left' | 'center' | 'right' | 'justify'
  lineHeight: number
  
  // FOR MATERIAL SAMPLE ELEMENTS
  materialId: string | null
  materialSampleImageUrl: string | null
  showMaterialName: boolean
  showMaterialSpecs: boolean
  material?: MaterialLibraryItem
  
  // FOR SHAPE ELEMENTS
  shapeType: ShapeType | null
  fillColor: string | null
  strokeColor: string | null
  strokeWidth: number | null
  
  // Linking
  linkedScopeItemId: string | null
  linkedColorSelectionId: string | null
  linkedMaterialSelectionId: string | null
  
  // Notes & Metadata
  notes: string | null
  tags: string[]
  
  // Lock & Visibility
  isLocked: boolean
  isVisible: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface ShadowConfig {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string
}

export interface CropConfig {
  x: number
  y: number
  width: number
  height: number
}

export interface MoodboardElementInput {
  moodboardId: string
  elementType: MoodboardElementType
  positionX?: number
  positionY?: number
  width?: number
  height?: number
  rotation?: number
  zIndex?: number
  opacity?: number
  
  // Type-specific fields
  imageUrl?: string
  colorId?: string
  textContent?: string
  materialId?: string
  shapeType?: ShapeType
  
  // Linking
  linkedScopeItemId?: string
  linkedColorSelectionId?: string
  linkedMaterialSelectionId?: string
}

// ----------------------------------------------------------------------------
// MOODBOARD SHARING
// ----------------------------------------------------------------------------

export type ShareType = 'link' | 'email' | 'social' | 'export'
export type ExportFormat = 'png' | 'jpg' | 'pdf'
export type ExportResolution = 'low' | 'medium' | 'high' | 'print'

export interface MoodboardShare {
  id: string
  moodboardId: string
  
  // Share Type
  shareType: ShareType
  
  // Platform (for social shares)
  platform: string | null
  
  // Access Control
  shareUrl: string | null
  shortCode: string | null
  passwordProtected: boolean
  expiresAt: Date | null
  
  // Recipient (for direct shares)
  recipientEmail: string | null
  recipientName: string | null
  recipientType: 'client' | 'contractor' | 'partner' | null
  
  // Export Settings
  exportFormat: ExportFormat | null
  exportResolution: ExportResolution | null
  exportDimensions: {
    width: number
    height: number
  } | null
  
  // Social Media Optimization
  socialCaption: string | null
  socialHashtags: string[]
  postedUrl: string | null
  
  // Tracking
  viewCount: number
  lastViewedAt: Date | null
  
  createdAt: Date
}

// ----------------------------------------------------------------------------
// PORTFOLIO SYSTEM
// ----------------------------------------------------------------------------

export type PortfolioTheme = 'minimalist' | 'modern' | 'classic' | 'bold'

export interface PortfolioSettings {
  id: string
  userId: string
  
  // Branding
  portfolioName: string | null
  tagline: string | null
  bio: string | null
  logoUrl: string | null
  primaryColor: string
  secondaryColor: string
  
  // Display Preferences
  theme: PortfolioTheme
  showRoiData: boolean
  showBeforeAfter: boolean
  showMoodboards: boolean
  showContactForm: boolean
  projectsPerPage: number
  
  // SEO
  metaTitle: string | null
  metaDescription: string | null
  metaKeywords: string[]
  
  // Social Links
  instagramUrl: string | null
  facebookUrl: string | null
  linkedinUrl: string | null
  websiteUrl: string | null
  
  // Custom Domain
  customDomain: string | null
  customDomainVerified: boolean
  
  // Public URL
  publicSlug: string | null
  
  // Contact
  contactEmail: string | null
  contactPhone: string | null
  showContactInfo: boolean
  
  createdAt: Date
  updatedAt: Date
}

export interface PortfolioProject {
  id: string
  projectId: string
  userId: string
  
  // Publishing Status
  isPublished: boolean
  publishDate: Date | null
  featured: boolean
  sortOrder: number
  
  // Project Display Info
  displayAddress: string | null
  showFullAddress: boolean
  projectType: string | null
  completionDate: Date | null
  durationDays: number | null
  
  // Financial Performance
  showFinancials: boolean
  purchasePrice: number | null
  rehabCost: number | null
  salePrice: number | null
  rentalIncomeMonthly: number | null
  roiPercentage: number | null
  profit: number | null
  
  // Design Details
  designStyle: DesignStyle | null
  targetBuyer: TargetBuyer | null
  squareFootage: number | null
  bedrooms: number | null
  bathrooms: number | null
  
  // Story & Features
  projectStory: string | null
  projectTagline: string | null
  keyFeatures: string[]
  challengesOvercome: string[]
  favoriteAspect: string | null
  
  // Media
  heroImageUrl: string
  heroImageAlt: string | null
  beforeImages: BeforeAfterImage[]
  afterImages: BeforeAfterImage[]
  moodboardId: string | null
  videoUrl: string | null
  virtualTourUrl: string | null
  
  // SEO
  seoTitle: string | null
  seoDescription: string | null
  seoSlug: string | null
  tags: string[]
  
  // Social Sharing
  socialImageUrl: string | null
  
  // Analytics
  viewCount: number
  shareCount: number
  
  createdAt: Date
  updatedAt: Date
}

export interface BeforeAfterImage {
  url: string
  alt?: string
  caption?: string
  room?: RoomType
}

// ----------------------------------------------------------------------------
// DESIGN RECOMMENDATIONS
// ----------------------------------------------------------------------------

export interface ColorRecommendation {
  color: ColorLibraryItem
  score: number
  reason: string
  complementaryColors: ColorLibraryItem[]
  suggestedRooms: RoomType[]
}

export interface MaterialRecommendation {
  material: MaterialLibraryItem
  score: number
  reason: string
  alternatives: MaterialLibraryItem[]
  suggestedApplications: string[]
}

export interface DesignStyleRecommendation {
  style: DesignStyle
  score: number
  reason: string
  keyCharacteristics: string[]
  suggestedColors: ColorLibraryItem[]
  suggestedMaterials: MaterialLibraryItem[]
}

// ----------------------------------------------------------------------------
// ROOM-BASED DESIGN SUMMARY
// ----------------------------------------------------------------------------

export interface RoomDesignSummary {
  roomType: RoomType
  roomName: string | null
  colorSelections: ProjectColorSelection[]
  materialSelections: ProjectMaterialSelection[]
  totalEstimatedCost: number
  isComplete: boolean
}

export interface ProjectDesignSummary {
  projectId: string
  rooms: RoomDesignSummary[]
  totalColorSelections: number
  totalMaterialSelections: number
  totalEstimatedCost: number
  moodboards: Moodboard[]
  designStyle: DesignStyle | null
  colorPalette: ColorPalette | null
  completionPercentage: number
}

// ----------------------------------------------------------------------------
// API RESPONSE TYPES
// ----------------------------------------------------------------------------

export interface ColorLibraryResponse {
  colors: ColorLibraryItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface MaterialLibraryResponse {
  materials: MaterialLibraryItem[]
  total: number
  page: number
  limit: number
  hasMore: boolean
}

export interface MoodboardWithElements extends Moodboard {
  elements: MoodboardElement[]
}

