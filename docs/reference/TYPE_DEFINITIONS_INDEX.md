# Phase 2A Type Definitions Index

> **Purpose:** Cross-reference of all TypeScript types for Phase 2A. Use this to quickly find type definitions and understand data structures.

---

## Table of Contents

1. [Overview](#overview)
2. [Core Enums](#core-enums)
3. [Color Types](#color-types)
4. [Material Types](#material-types)
5. [Moodboard Types](#moodboard-types)
6. [Portfolio Types](#portfolio-types)
7. [Recommendation Types](#recommendation-types)
8. [API Response Types](#api-response-types)
9. [Database Type Mapping](#database-type-mapping)
10. [Type Generation](#type-generation)

---

## Overview

### Primary Type File

All Phase 2A types are defined in:

```
src/types/design.ts
```

### Import Pattern

```typescript
import type {
  ColorLibraryItem,
  ProjectColorSelection,
  MaterialLibraryItem,
  Moodboard,
  MoodboardElement,
} from '@/types/design'
```

---

## Core Enums

### DesignStyle

```typescript
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
```

**Usage:** Design style selection, filtering, recommendations

---

### TargetBuyer

```typescript
export type TargetBuyer = 'first_time' | 'move_up' | 'investor' | 'luxury'
```

**Usage:** Project target market, palette recommendations

---

### RoomType

```typescript
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
```

**Usage:** Room selection, color/material assignments

---

### SurfaceType

```typescript
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
```

**Usage:** Paint color surface assignments

---

### PaintFinish

```typescript
export type PaintFinish = 
  | 'flat'
  | 'matte'
  | 'eggshell'
  | 'satin'
  | 'semi-gloss'
  | 'high-gloss'
```

**Usage:** Paint finish selection per surface

---

### MaterialType

```typescript
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
```

**Usage:** Material categorization and filtering

---

### ColorFamily

```typescript
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
```

**Usage:** Color grouping and filtering

---

### Undertone

```typescript
export type Undertone = 'warm' | 'cool' | 'neutral'
```

**Usage:** Color undertone classification

---

## Color Types

### ColorLibraryItem

Primary color entity from the library.

```typescript
export interface ColorLibraryItem {
  id: string
  
  // Brand & Identification
  brand: string                      // e.g., "Sherwin Williams"
  colorCode: string | null           // e.g., "SW 7005"
  colorName: string                  // e.g., "Pure White"
  
  // Color Data
  hexCode: string                    // e.g., "#F2EEE5"
  rgbValues: {
    r: number                        // 0-255
    g: number
    b: number
  }
  
  // Technical Specs
  lrv: number | null                 // Light Reflectance Value (0-100)
  undertones: Undertone[]            // e.g., ["warm", "neutral"]
  colorFamily: ColorFamily | null
  
  // Application
  finishOptions: PaintFinish[]       // Available finishes
  recommendedRooms: RoomType[]
  recommendedSurfaces: SurfaceType[]
  
  // Design Style Associations
  designStyles: DesignStyle[]
  
  // Metadata
  imageUrl: string | null
  popular: boolean
  yearIntroduced: number | null
  isActive: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

**Database Table:** `color_library`

---

### ProjectColorSelection

User's color selection for a specific room/surface.

```typescript
export interface ProjectColorSelection {
  id: string
  projectId: string
  
  // Location in Property
  roomType: RoomType               // e.g., "kitchen"
  roomName: string | null          // Custom name, e.g., "Master Bedroom"
  surfaceType: SurfaceType         // e.g., "walls"
  
  // Color Selection (one of these)
  colorId: string | null           // Reference to color_library
  customColorName: string | null   // For custom colors
  customHexCode: string | null
  
  // Resolved color (populated via join)
  color?: ColorLibraryItem
  
  // Application Details
  finish: PaintFinish | null       // e.g., "eggshell"
  coats: number                    // Default: 2
  primerNeeded: boolean            // Default: false
  
  // Scope Linking
  linkedScopeItemId: string | null // Links to scope_items
  
  // Notes
  notes: string | null
  applicationInstructions: string | null
  
  // Status
  isPrimary: boolean               // Primary color for this room
  isApproved: boolean              // Approved by user
  approvedByClient: boolean        // Approved by end client
  
  createdAt: Date
  updatedAt: Date
}
```

**Database Table:** `project_color_selections`

---

### ColorSearchFilters

Filter parameters for color library queries.

```typescript
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
```

**Usage:** `ColorLibraryBrowser` filtering, API query params

---

### ColorPalette

Curated set of colors that work together.

```typescript
export interface ColorPalette {
  id: string
  name: string
  description: string | null
  designStyle: DesignStyle | null
  
  // Color IDs
  primaryColorId: string | null
  secondaryColorId: string | null
  accentColorIds: string[]
  
  // Resolved colors (populated via join)
  primaryColor?: ColorLibraryItem
  secondaryColor?: ColorLibraryItem
  accentColors?: ColorLibraryItem[]
  
  // Recommendations
  recommendedFor: TargetBuyer[]
  priceRange: 'budget' | 'standard' | 'premium' | 'luxury' | null
  
  // Metadata
  isTrending: boolean
  usageCount: number
  createdBySystem: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

---

## Material Types

### MaterialLibraryItem

Primary material entity from the library.

```typescript
export interface MaterialLibraryItem {
  id: string
  
  // Categorization
  materialType: MaterialType         // e.g., "countertop"
  materialCategory: string | null    // e.g., "Quartz"
  
  // Product Details
  brand: string | null              // e.g., "Caesarstone"
  productName: string               // e.g., "White Attica"
  modelNumber: string | null        // e.g., "5143"
  sku: string | null
  
  // Description
  description: string | null
  colorDescription: string | null   // e.g., "White with gray veins"
  finish: string | null             // e.g., "Polished"
  
  // Specifications
  dimensions: string | null         // e.g., "130\" x 65\" slab"
  thickness: string | null          // e.g., "3cm"
  materialComposition: string | null
  
  // Pricing
  avgCostPerUnit: number | null     // e.g., 85.00
  unitType: string | null           // e.g., "sqft"
  
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
```

**Database Table:** `material_library`

---

### MaterialSupplier

Supplier information for a material.

```typescript
export interface MaterialSupplier {
  name: string                    // e.g., "Home Depot"
  url?: string                    // Product page URL
  price?: number                  // Price at this supplier
  inStock?: boolean
}
```

**Storage:** JSONB array in `material_library.suppliers`

---

### ProjectMaterialSelection

User's material selection for a specific application.

```typescript
export interface ProjectMaterialSelection {
  id: string
  projectId: string
  
  // Location
  roomType: RoomType | null        // e.g., "kitchen"
  roomName: string | null
  application: string              // e.g., "countertops"
  
  // Material Selection
  materialId: string | null        // Reference to material_library
  customMaterialName: string | null
  customDescription: string | null
  
  // Resolved material (populated via join)
  material?: MaterialLibraryItem
  
  // Quantity & Pricing
  quantity: number | null          // e.g., 32
  unitType: string | null          // e.g., "sqft"
  costPerUnit: number | null       // e.g., 85.00
  totalCost: number | null         // Calculated: quantity * costPerUnit
  
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
```

**Database Table:** `project_material_selections`

---

### MaterialSearchFilters

```typescript
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
```

---

## Moodboard Types

### Moodboard

Container for moodboard elements.

```typescript
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
  isPrimary: boolean               // Primary moodboard for project
  
  // Layout Configuration
  templateUsed: string | null
  layoutType: MoodboardLayoutType
  canvasWidth: number              // Default: 1275 (8.5" at 150dpi)
  canvasHeight: number             // Default: 1650 (11" at 150dpi)
  backgroundColor: string          // Hex color
  backgroundImageUrl: string | null
  
  // Editor Settings
  showGrid: boolean
  gridSize: number                 // Grid cell size in pixels
  snapToGrid: boolean
  
  // Sharing
  isPublic: boolean
  publicSlug: string | null        // URL-friendly identifier
  passwordProtected: boolean
  
  // Analytics
  viewCount: number
  shareCount: number
  
  // Elements (populated via join)
  elements?: MoodboardElement[]
  
  createdAt: Date
  updatedAt: Date
}
```

**Database Table:** `moodboards`

---

### MoodboardElement

Individual element on a moodboard canvas.

```typescript
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
  elementType: MoodboardElementType
  
  // Layout & Position
  positionX: number
  positionY: number
  width: number
  height: number
  rotation: number                 // Degrees
  zIndex: number                   // Stacking order
  
  // Common Styling
  opacity: number                  // 0-1
  borderWidth: number
  borderColor: string | null
  borderRadius: number
  shadowEnabled: boolean
  shadowConfig: ShadowConfig | null
  
  // === TYPE-SPECIFIC FIELDS ===
  
  // FOR IMAGE ELEMENTS
  imageUrl: string | null
  imageSource: string | null       // "upload", "unsplash", etc.
  imageAttribution: string | null
  originalImageWidth: number | null
  originalImageHeight: number | null
  cropConfig: CropConfig | null
  
  // FOR COLOR SWATCH ELEMENTS
  colorId: string | null           // Reference to color_library
  swatchShape: SwatchShape
  showColorName: boolean
  showColorCode: boolean
  color?: ColorLibraryItem         // Populated via join
  
  // FOR TEXT ELEMENTS
  textContent: string | null
  fontFamily: string               // Default: "Inter"
  fontSize: number                 // Default: 16
  fontWeight: string               // e.g., "normal", "bold", "600"
  fontStyle: string                // "normal", "italic"
  textColor: string                // Hex color
  textAlign: 'left' | 'center' | 'right' | 'justify'
  lineHeight: number               // e.g., 1.5
  
  // FOR MATERIAL SAMPLE ELEMENTS
  materialId: string | null        // Reference to material_library
  materialSampleImageUrl: string | null
  showMaterialName: boolean
  showMaterialSpecs: boolean
  material?: MaterialLibraryItem   // Populated via join
  
  // FOR SHAPE ELEMENTS
  shapeType: ShapeType | null
  fillColor: string | null
  strokeColor: string | null
  strokeWidth: number | null
  
  // Linking (for scope integration)
  linkedScopeItemId: string | null
  linkedColorSelectionId: string | null
  linkedMaterialSelectionId: string | null
  
  // Metadata
  notes: string | null
  tags: string[]
  isLocked: boolean                // Prevent editing
  isVisible: boolean               // Show/hide
  
  createdAt: Date
  updatedAt: Date
}
```

**Database Table:** `moodboard_elements`

---

### Supporting Moodboard Types

```typescript
export interface ShadowConfig {
  offsetX: number
  offsetY: number
  blur: number
  spread: number
  color: string                    // Hex with alpha, e.g., "#00000033"
}

export interface CropConfig {
  x: number                        // Crop region left
  y: number                        // Crop region top
  width: number                    // Crop region width
  height: number                   // Crop region height
}
```

---

### MoodboardShare

Share/export record for a moodboard.

```typescript
export type ShareType = 'link' | 'email' | 'social' | 'export'
export type ExportFormat = 'png' | 'jpg' | 'pdf'
export type ExportResolution = 'low' | 'medium' | 'high' | 'print'

export interface MoodboardShare {
  id: string
  moodboardId: string
  shareType: ShareType
  
  // Platform (for social shares)
  platform: string | null          // "instagram", "pinterest", etc.
  
  // Access Control
  shareUrl: string | null
  shortCode: string | null         // e.g., "abc123xy"
  passwordProtected: boolean
  expiresAt: Date | null
  
  // Recipient (for direct shares)
  recipientEmail: string | null
  recipientName: string | null
  recipientType: 'client' | 'contractor' | 'partner' | null
  
  // Export Settings
  exportFormat: ExportFormat | null
  exportResolution: ExportResolution | null
  exportDimensions: { width: number; height: number } | null
  
  // Social Media
  socialCaption: string | null
  socialHashtags: string[]
  postedUrl: string | null         // URL where it was posted
  
  // Analytics
  viewCount: number
  lastViewedAt: Date | null
  
  createdAt: Date
}
```

**Database Table:** `moodboard_shares`

---

## Portfolio Types

### PortfolioSettings

User's portfolio configuration.

```typescript
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
  publicSlug: string | null
  
  // Contact
  contactEmail: string | null
  contactPhone: string | null
  showContactInfo: boolean
  
  createdAt: Date
  updatedAt: Date
}
```

---

### PortfolioProject

Published project for portfolio display.

```typescript
export interface PortfolioProject {
  id: string
  projectId: string
  userId: string
  
  // Publishing
  isPublished: boolean
  publishDate: Date | null
  featured: boolean
  sortOrder: number
  
  // Display Info
  displayAddress: string | null
  showFullAddress: boolean
  projectType: string | null
  completionDate: Date | null
  durationDays: number | null
  
  // Financials (optional display)
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
  
  // Story
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
```

---

## Recommendation Types

### ColorRecommendation

```typescript
export interface ColorRecommendation {
  color: ColorLibraryItem
  score: number                    // 0-100 relevance score
  reason: string                   // Why this color was recommended
  complementaryColors: ColorLibraryItem[]
  suggestedRooms: RoomType[]
}
```

### MaterialRecommendation

```typescript
export interface MaterialRecommendation {
  material: MaterialLibraryItem
  score: number
  reason: string
  alternatives: MaterialLibraryItem[]
  suggestedApplications: string[]
}
```

### DesignStyleRecommendation

```typescript
export interface DesignStyleRecommendation {
  style: DesignStyle
  score: number
  reason: string
  keyCharacteristics: string[]
  suggestedColors: ColorLibraryItem[]
  suggestedMaterials: MaterialLibraryItem[]
}
```

---

## API Response Types

### List Responses

```typescript
export interface ColorLibraryResponse {
  colors: ColorLibraryItem[]       // Note: "colors" not "data"
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
```

### Combined Types

```typescript
export interface MoodboardWithElements extends Moodboard {
  elements: MoodboardElement[]
}

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
```

---

## Database Type Mapping

### Column Name Conventions

| TypeScript | Database | Notes |
|------------|----------|-------|
| `camelCase` | `snake_case` | Auto-transformed by Supabase |
| `Date` | `TIMESTAMPTZ` | Stored as UTC |
| `string[]` | `TEXT[]` | PostgreSQL array |
| `object` | `JSONB` | For complex nested data |

### Example Mapping

```typescript
// TypeScript
interface ColorLibraryItem {
  colorName: string
  hexCode: string
  rgbValues: { r: number; g: number; b: number }
  undertones: Undertone[]
  createdAt: Date
}

// Database
CREATE TABLE color_library (
  color_name VARCHAR(100),
  hex_code VARCHAR(7),
  rgb_r INT,
  rgb_g INT,
  rgb_b INT,
  undertones TEXT[],
  created_at TIMESTAMPTZ
);
```

---

## Type Generation

### Generate from Database

```bash
npx supabase gen types typescript --local > src/types/database.ts
```

### Manual Type Sync

When database schema changes:

1. Update migration file
2. Run migration: `npx supabase db push`
3. Regenerate types: `npx supabase gen types typescript`
4. Update `src/types/design.ts` if needed
5. Run TypeScript check: `npm run build`

---

## Related Documentation

- [Component Architecture](../implementation/COMPONENT_ARCHITECTURE.md) - How types are used
- [API Endpoints](./API_ENDPOINTS.md) - Request/response schemas
- [Integration Sequences](../implementation/INTEGRATION_SEQUENCES.md) - Database setup

