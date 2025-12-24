# Refined Expansion Plan: Complete Feature Specification

## 🎯 Executive Decisions Summary

✅ **Workflow Structure**: Option B (7 steps + tabbed interfaces)
✅ **Phase 2A Scope**: Design Intelligence + ROI Analytics (simultaneous build)
✅ **ROI Data Strategy**: All sources, build incrementally over time
✅ **Smart Home Approach**: Pre-built packages with product tier choices (Budget/Standard/Premium)
✅ **Collaboration Model**: All stakeholders with vendor-specific export packets
✅ **Mobile Strategy**: Fully functional mobile version from day one
✅ **Project Management**: Gantt timeline, calendar integration, Notion-style documentation

---

## 🏗️ New Feature Requirements

### 1. Sherwin Williams Color/Swatch Integration
### 2. Professional Moodboard Builder (Shareable)
### 3. Portfolio Builder
### 4. Project Management Suite (Gantt, Calendar, Notion-style Pages)
### 5. Vendor Export Packet System

---

## 📐 Design Module Timing: Where Does It Fit?

### ✅ RECOMMENDED: Design Planning BEFORE Scope Building

**Why This Makes Sense:**

```
Current Flow Problem:
Step 3: Strategy & Goals → "I want to flip to first-time buyers"
Step 4: Scope Building → "Okay, paint the cabinets" 
                       → But WHAT COLOR? WHAT STYLE?
                       → User has to guess or research externally

Better Flow with Design First:
Step 3: Strategy & Goals → "I want to flip to first-time buyers"
Step 4: Design & Modernization → "Based on that target, we recommend 
                                   Modern Farmhouse style with white 
                                   shaker cabinets and SW Pure White"
Step 5: Scope Building → Scope items now have SPECIFIC materials:
                        "Paint cabinets: SW Pure White (7005)"
                        "Quartz countertops: White with gray veining"
                        "Backsplash: 3x12 subway tile in Bright White"
```

**The Logic:**

1. **Strategy defines target buyer** (Step 3)
2. **Design defines aesthetic approach** (Step 4 - NEW)
   - This creates the "vision" for the property
   - Specific colors, materials, styles chosen
   - Moodboard captures the look
3. **Scope building executes the vision** (Step 5)
   - Line items now reference design decisions
   - No guesswork on "which white?" or "what style?"
   - Materials link back to moodboard

**User Experience Flow:**

```
Step 3: "I'm flipping to first-time buyers, $300K ARV"

Step 4: Design & Modernization
  ├─ Style Selector: "Modern Farmhouse recommended"
  ├─ Color Planner: Sherwin Williams palette generated
  ├─ Material Selections: Cabinets, counters, floors, etc.
  ├─ Moodboard Builder: Visual representation of design
  └─ Modernization Scoring: See where you stand vs. comps

Step 5: Scope Building
  ├─ [Build Scope] tab
  │   Items now inherit design decisions:
  │   ☑ Paint cabinets - SW Pure White (7005) - $1,200
  │   ☑ Quartz counters - White w/ gray vein - $3,800
  │   
  ├─ [ROI Analysis] tab
  │   Shows ROI for your specific design choices
  │   
  └─ [Smart Home] tab
      Packages that match your modernization target
```

**Benefits of This Order:**

✅ **Coherent Vision**: Design decisions are made holistically, not piecemeal
✅ **Faster Scope Building**: Materials pre-selected, just add quantities
✅ **Better Communication**: Contractors/vendors see the vision (moodboard)
✅ **Consistent Aesthetic**: All materials coordinate from the start
✅ **Marketing Ready**: Moodboard becomes listing asset later

---

## 🎨 Updated 7-Step Workflow with New Features

### FINAL WORKFLOW STRUCTURE:

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│  Step 1: Property Details                                  │
│  ├─ Address, specs, financials                            │
│  └─ Photo upload                                          │
│                                                             │
│  Step 2: Condition Assessment                              │
│  ├─ Room-by-room evaluation                               │
│  └─ Component assessment                                   │
│                                                             │
│  Step 3: Strategy & Goals                                  │
│  ├─ Investment strategy (Flip/Rental/etc.)                │
│  ├─ Target market selection                               │
│  ├─ Financial targets                                      │
│  └─ Modernization target score                            │
│                                                             │
│  Step 4: Design & Modernization ← NEW EXPANDED            │
│  ├─ [Design Style] tab                                    │
│  │   ├─ Style selector (Modern Farmhouse, etc.)          │
│  │   └─ Target buyer alignment scoring                   │
│  ├─ [Color & Materials] tab ← NEW                         │
│  │   ├─ Sherwin Williams color planner                   │
│  │   ├─ Material palette generator                       │
│  │   ├─ Room-by-room selections                          │
│  │   └─ Swatch library                                   │
│  ├─ [Moodboard Builder] tab ← NEW                         │
│  │   ├─ Drag-and-drop builder                            │
│  │   ├─ Photo uploads + stock images                     │
│  │   ├─ Material swatches                                │
│  │   ├─ Share to social/website                          │
│  │   └─ Export for vendors                               │
│  ├─ [Modernization] tab                                   │
│  │   ├─ 6-category scoring                               │
│  │   ├─ Competitive benchmarking                         │
│  │   └─ Gap analysis                                     │
│  └─ [Smart Home] tab                                      │
│      ├─ Package selector (4 tiers)                        │
│      ├─ Product tier choices (Budget/Standard/Premium)    │
│      └─ ROI per feature                                  │
│                                                             │
│  Step 5: Scope Building (Enhanced)                        │
│  ├─ [Build Scope] tab                                    │
│  │   ├─ Items inherit design decisions                   │
│  │   └─ Linked to moodboard elements                     │
│  ├─ [ROI Analysis] tab                                   │
│  │   ├─ Upgrade ranking dashboard                        │
│  │   ├─ Historical ROI data                              │
│  │   └─ Trend indicators                                 │
│  └─ [Project Docs] tab ← NEW                              │
│      └─ Notion-style pages for notes, specs, etc.        │
│                                                             │
│  Step 6: Priority Analysis (Enhanced)                     │
│  ├─ Priority matrix (ROI + Urgency)                      │
│  ├─ Modernization-driven priorities                       │
│  └─ AI recommendations                                    │
│                                                             │
│  Step 7: Action Plan & Project Management ← EXPANDED      │
│  ├─ [Timeline] tab                                        │
│  │   ├─ React Flow visual timeline                       │
│  │   ├─ Gantt chart view ← NEW                           │
│  │   └─ Calendar integration ← NEW                        │
│  ├─ [Team & Vendors] tab                                 │
│  │   ├─ Vendor assignments                               │
│  │   ├─ Generate vendor packets ← NEW                    │
│  │   └─ Communication log                                │
│  ├─ [Documents] tab                                       │
│  │   └─ Notion-style project documentation               │
│  └─ [Listing Prep] tab (appears late in project)         │
│      ├─ Staging strategy                                  │
│      ├─ Photography planning                              │
│      ├─ AI listing generator                             │
│      └─ Uses moodboard for marketing                     │
│                                                             │
│  Step 8: Final Review & Export ← ENHANCED                 │
│  ├─ Project summary dashboard                             │
│  ├─ Portfolio builder ← NEW                               │
│  │   ├─ Before/after showcase                            │
│  │   ├─ Moodboard + final photos                         │
│  │   ├─ ROI performance                                  │
│  │   └─ Share to website/social                          │
│  ├─ Export options                                        │
│  │   ├─ Professional PDF report                          │
│  │   ├─ Vendor-specific packets                          │
│  │   └─ Marketing materials                              │
│  └─ Post-project analysis (if completed) ← INCENTIVIZED  │
│                                                             │
└─────────────────────────────────────────────────────────────┘

SIDEBAR (Always Available):
├─ Project Dashboard
├─ Calendar View
├─ Task Management
├─ Vendor Directory
├─ Document Library (Notion-style)
└─ Portfolio Gallery
```

---

## 🎨 New Feature Specifications

### Feature 1: Sherwin Williams Color/Swatch Planner

#### 1.1 Integration Architecture

**API Integration**:
- Sherwin Williams Color Palette API (if available)
- Fallback: Curated database of 500+ SW colors with hex codes
- Color chip images from SW digital assets
- LRV (Light Reflectance Value) data for each color

**Database Schema**:
```sql
CREATE TABLE color_library (
  id UUID PRIMARY KEY,
  brand VARCHAR(50), -- 'sherwin_williams', 'benjamin_moore', etc.
  color_code VARCHAR(20), -- 'SW 7005', 'BM 2125-50'
  color_name VARCHAR(100), -- 'Pure White', 'Simply White'
  hex_code VARCHAR(7), -- '#FFFFFF'
  rgb_values JSONB, -- {r: 255, g: 255, b: 255}
  lrv INT, -- Light Reflectance Value (0-100)
  undertones TEXT[], -- ['warm', 'cool', 'neutral']
  color_family VARCHAR(50), -- 'white', 'gray', 'beige', 'blue', etc.
  finish_options TEXT[], -- ['flat', 'eggshell', 'satin', 'semi-gloss', 'gloss']
  recommended_rooms TEXT[], -- ['kitchen', 'bathroom', 'exterior', etc.]
  image_url VARCHAR(500), -- Color chip/swatch image
  popular BOOLEAN, -- Trending/popular colors flagged
  year_introduced INT,
  created_at TIMESTAMP
);

CREATE TABLE project_color_selections (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  room_type VARCHAR(50), -- 'kitchen', 'primary_bedroom', 'exterior', etc.
  surface_type VARCHAR(50), -- 'walls', 'trim', 'ceiling', 'cabinets', 'doors'
  color_id UUID REFERENCES color_library(id),
  finish VARCHAR(50), -- 'eggshell', 'satin', etc.
  notes TEXT,
  created_at TIMESTAMP
);
```

#### 1.2 Color Planner UI

**Room-by-Room Color Selection**:

```
┌──────────────────────────────────────────────────────┐
│ Step 4: Design & Modernization                       │
│ [Design Style] [Color & Materials] [Moodboard] [...] │
│                ═══════════════════                    │
│                                                       │
│ 🎨 Sherwin Williams Color Planner                    │
│                                                       │
│ Design Style: Modern Farmhouse                       │
│ → Recommended Palette: Light & Bright with Neutrals  │
│                                                       │
│ ┌──── Primary Colors ────────────────────────────┐  │
│ │                                                 │  │
│ │ Walls (Main Living Areas):                     │  │
│ │ [■■■■■] SW Pure White (7005)                   │  │
│ │ LRV: 84 | Undertone: Neutral                   │  │
│ │ Finish: Eggshell                               │  │
│ │ [Change Color] [View Alternatives]             │  │
│ │                                                 │  │
│ │ Trim & Doors:                                   │  │
│ │ [■■■■■] SW Extra White (7006)                  │  │
│ │ LRV: 86 | Undertone: Cool                      │  │
│ │ Finish: Semi-Gloss                             │  │
│ │                                                 │  │
│ │ Ceiling:                                        │  │
│ │ [■■■■■] SW Ceiling Bright White (7007)         │  │
│ │ LRV: 89 | Undertone: Neutral                   │  │
│ │ Finish: Flat                                   │  │
│ │                                                 │  │
│ └─────────────────────────────────────────────── │  │
│                                                       │
│ ┌──── Accent Colors ─────────────────────────────┐  │
│ │                                                 │  │
│ │ Kitchen Cabinets:                               │  │
│ │ [■■■■■] SW Pure White (7005)                   │  │
│ │ Hardware: Matte Black (trending ↑)             │  │
│ │                                                 │  │
│ │ Front Door:                                     │  │
│ │ [■■■■■] SW Iron Ore (7069)                     │  │
│ │ (Dark charcoal - popular for farmhouse style)  │  │
│ │                                                 │  │
│ │ Exterior:                                       │  │
│ │ [■■■■■] SW Alabaster (7008) - Main             │  │
│ │ [■■■■■] SW Pure White (7005) - Trim            │  │
│ │                                                 │  │
│ └─────────────────────────────────────────────── │  │
│                                                       │
│ ┌──── Room-Specific Overrides ───────────────────┐  │
│ │ Primary Bedroom:                                │  │
│ │ [■■■□□] SW Repose Gray (7015) - Calming        │  │
│ │                                                 │  │
│ │ Kids Bedrooms: [Use Primary Palette]           │  │
│ │ Bathrooms: [Use Primary Palette]               │  │
│ └─────────────────────────────────────────────── │  │
│                                                       │
│ [Browse SW Colors] [See Coordinating Palettes]      │
│ [Export Paint List] [Add to Moodboard]              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

**Color Browser Modal**:

```
┌──────────────────────────────────────────────────────┐
│ Browse Sherwin Williams Colors                       │
├──────────────────────────────────────────────────────┤
│                                                       │
│ Search: [________________] 🔍                        │
│                                                       │
│ Filter by:                                           │
│ ☐ Whites & Neutrals  ☐ Grays  ☐ Blues  ☐ Greens    │
│ ☐ Popular Colors Only                                │
│ LRV Range: [0────●─────●────100] (60-85)            │
│                                                       │
│ ┌──── Color Grid ─────────────────────────────────┐ │
│ │                                                   │ │
│ │ [■] Pure White    [■] Alabaster   [■] Snowbound │ │
│ │  7005  LRV: 84     7008  LRV: 82   7004  LRV: 83│ │
│ │                                                   │ │
│ │ [■] Extra White   [■] High Reflec [■] Eider Wht │ │
│ │  7006  LRV: 86     7757  LRV: 93   7014  LRV: 84│ │
│ │                                                   │ │
│ │ [■] Repose Gray   [■] Agreeable Gr [■] Mindful  │ │
│ │  7015  LRV: 58     7029  LRV: 60   7016  LRV: 57│ │
│ │                                                   │ │
│ │ ... (grid continues)                              │ │
│ │                                                   │ │
│ └─────────────────────────────────────────────────┘ │
│                                                       │
│ Click any color to see details and use              │
│                                                       │
└──────────────────────────────────────────────────────┘
```

#### 1.3 Smart Color Recommendations

**Algorithm**:
```typescript
function recommendColorPalette(
  designStyle: DesignStyle,
  targetMarket: TargetMarket,
  roomType: RoomType,
  naturalLight: 'high' | 'medium' | 'low'
) {
  // Modern Farmhouse + First-Time Buyer = Light neutrals
  if (designStyle === 'modern_farmhouse') {
    return {
      walls: 'SW Pure White (7005)', // High LRV, neutral
      trim: 'SW Extra White (7006)', // Crisp contrast
      ceiling: 'SW Ceiling Bright White (7007)',
      accentOptions: [
        'SW Repose Gray (7015)', // Soft gray for bedrooms
        'SW Iron Ore (7069)', // Bold front door
      ]
    };
  }
  
  // Adjust based on natural light
  if (naturalLight === 'low') {
    // Recommend higher LRV colors (brighter)
    // Avoid cool undertones (can feel sterile)
  }
  
  // Adjust based on target market
  if (targetMarket === 'luxury') {
    // Suggest more sophisticated colors
    // Coordinated accent walls
  }
}
```

#### 1.4 Integration with Scope Builder

**Auto-Population**:
```typescript
// When user selects colors in Color Planner...
// Automatically create/update scope items:

{
  category: 'Interior Paint',
  subcategory: 'Walls',
  item: 'Paint Main Living Areas',
  description: 'SW Pure White (7005) in Eggshell finish',
  material: 'Sherwin Williams Premium Paint',
  color: 'SW Pure White (7005)',
  finish: 'Eggshell',
  quantity: '1,200 sq ft',
  cost: calculatePaintCost(1200, 'eggshell', 2), // 2 coats
  labor_hours: 16,
  linked_to_design: true, // Flag that this came from design planner
  moodboard_reference: moodboard_id
}
```

---

### Feature 2: Professional Moodboard Builder

#### 2.1 Moodboard Architecture

**Purpose**: Visual design communication tool that:
- Captures the aesthetic vision for the property
- Shared with contractors, stagers, photographers
- Used in listing marketing materials
- Added to portfolio showcase

**Database Schema**:
```sql
CREATE TABLE moodboards (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  name VARCHAR(100), -- "Kitchen Inspiration", "Overall Design"
  description TEXT,
  is_primary BOOLEAN, -- Primary moodboard for project
  template_used VARCHAR(50), -- 'blank', 'kitchen', 'bathroom', 'whole_house'
  layout_type VARCHAR(50), -- 'grid', 'pinterest', 'magazine'
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE moodboard_elements (
  id UUID PRIMARY KEY,
  moodboard_id UUID REFERENCES moodboards(id),
  element_type VARCHAR(50), -- 'image', 'color_swatch', 'text', 'material_sample'
  
  -- For images
  image_url VARCHAR(500),
  image_source VARCHAR(50), -- 'upload', 'unsplash', 'pexels', 'stock'
  
  -- For color swatches
  color_id UUID REFERENCES color_library(id),
  
  -- For text
  text_content TEXT,
  font_size INT,
  
  -- For material samples
  material_type VARCHAR(50), -- 'flooring', 'countertop', 'tile', 'hardware'
  material_name VARCHAR(100),
  material_image_url VARCHAR(500),
  
  -- Layout
  position_x INT, -- X coordinate in grid
  position_y INT, -- Y coordinate in grid
  width INT, -- Element width
  height INT, -- Element height
  z_index INT, -- Layering
  
  -- Metadata
  notes TEXT,
  linked_scope_item_id UUID REFERENCES scope_items(id),
  created_at TIMESTAMP
);

CREATE TABLE moodboard_shares (
  id UUID PRIMARY KEY,
  moodboard_id UUID REFERENCES moodboards(id),
  share_type VARCHAR(50), -- 'public_link', 'social', 'vendor_packet'
  share_url VARCHAR(500), -- Generated shareable URL
  platform VARCHAR(50), -- 'instagram', 'facebook', 'pinterest', null
  recipient_email VARCHAR(255), -- If shared directly
  expires_at TIMESTAMP, -- Optional expiration
  view_count INT DEFAULT 0,
  created_at TIMESTAMP
);
```

#### 2.2 Moodboard Builder UI

**Main Builder Interface**:

```
┌──────────────────────────────────────────────────────────────┐
│ Moodboard Builder: Kitchen Design                            │
├──────────────────────────────────────────────────────────────┤
│ [Save] [Export] [Share] [Template ▼]                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─── Toolbar ───────────────────────────────────────────┐   │
│ │ [+ Add Image] [+ Color Swatch] [+ Text] [+ Material] │   │
│ │ [Layout ▼] [Background] [Grid: On/Off]               │   │
│ └─────────────────────────────────────────────────────  │   │
│                                                               │
│ ┌─── Canvas (Drag & Drop) ──────────────────────────────┐   │
│ │                                                         │   │
│ │  [Image: Kitchen Inspo]     [■] [■] [■]               │   │
│ │  ┌───────────────────┐      SW Pure White              │   │
│ │  │                   │      SW Iron Ore                │   │
│ │  │   Modern Kitchen  │      Matte Black                │   │
│ │  │   White Cabinets  │                                 │   │
│ │  │                   │      [Quartz Sample]            │   │
│ │  └───────────────────┘      White w/ Gray Vein         │   │
│ │                                                         │   │
│ │  "Modern Farmhouse Kitchen"                            │   │
│ │  Clean lines, warm whites,                             │   │
│ │  natural materials                                     │   │
│ │                                                         │   │
│ │  [Hardware Sample]         [Flooring Sample]           │   │
│ │  Matte Black Pulls         LVP Gray Oak                │   │
│ │                                                         │   │
│ │  [Lighting Fixture]        [Faucet Image]              │   │
│ │  Modern Black Pendant      Bridge Style Chrome         │   │
│ │                                                         │   │
│ └─────────────────────────────────────────────────────── │   │
│                                                               │
│ ┌─── Element Library (Sidebar) ─────────────────────────┐   │
│ │                                                         │   │
│ │ [Your Uploads] [Stock Images] [Materials] [Colors]    │   │
│ │                                                         │   │
│ │ Your Uploads:                                          │   │
│ │ [thumbnail] [thumbnail] [thumbnail]                    │   │
│ │                                                         │   │
│ │ Stock Images (Unsplash):                               │   │
│ │ Search: [farmhouse kitchen__________] 🔍              │   │
│ │ [img] [img] [img] [img] [img]                         │   │
│ │ [img] [img] [img] [img] [img]                         │   │
│ │                                                         │   │
│ │ Your Color Palette:                                    │   │
│ │ [■] SW Pure White                                      │   │
│ │ [■] SW Extra White                                     │   │
│ │ [■] SW Iron Ore                                        │   │
│ │ [+ Add Color]                                          │   │
│ │                                                         │   │
│ │ Materials from Scope:                                  │   │
│ │ • Quartz Countertop                                    │   │
│ │ • Subway Tile Backsplash                               │   │
│ │ • LVP Flooring                                         │   │
│ │ • Cabinet Hardware                                     │   │
│ │                                                         │   │
│ └─────────────────────────────────────────────────────── │   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### 2.3 Moodboard Templates

**Pre-Built Templates**:

1. **Whole House Moodboard**
   - Grid layout with sections for each room
   - Color palette at top
   - Key materials in center
   - Inspiration images around border

2. **Kitchen Focused**
   - Hero image of kitchen inspiration
   - Cabinet, countertop, backsplash swatches
   - Hardware and fixture samples
   - Appliance finish notes

3. **Bathroom Suite**
   - Vanity style reference
   - Tile selections (floor, shower, accent)
   - Fixture finish coordination
   - Lighting and mirror style

4. **Curb Appeal**
   - Exterior color scheme
   - Door, garage, trim colors
   - Landscaping inspiration
   - Lighting fixtures

5. **Social Media Optimized**
   - Instagram-ready 1:1 square
   - Before & After slots
   - Text overlay areas for branding
   - Portfolio-style layout

#### 2.4 Sharing & Export Features

**Share Options**:

```
┌──────────────────────────────────────┐
│ Share Moodboard                      │
├──────────────────────────────────────┤
│                                      │
│ Share Options:                       │
│                                      │
│ 🔗 Copy Link                         │
│    Anyone with link can view         │
│    ✓ Password protect                │
│    ✓ Set expiration date            │
│                                      │
│ 📱 Share to Social Media            │
│    [Instagram] [Pinterest] [Facebook]│
│    Auto-optimized for each platform  │
│                                      │
│ 📧 Email to Vendor                  │
│    Select vendor: [Dropdown ▼]      │
│    Include: ☑ Color codes           │
│             ☑ Material specs         │
│             ☑ Notes                  │
│    [Send Email]                      │
│                                      │
│ 💾 Download                          │
│    Format: [PNG ▼] [JPG] [PDF]      │
│    Resolution: [High ▼] [Web]       │
│    [Download]                        │
│                                      │
│ 🌐 Embed on Website                 │
│    [Generate Embed Code]             │
│                                      │
└──────────────────────────────────────┘
```

**Social Media Optimization**:
- Instagram: 1080x1080 square with your branding
- Pinterest: 1000x1500 tall pin with description
- Facebook: 1200x630 optimized for feed
- Auto-generates hashtags based on style (#ModernFarmhouse #KitchenReno)

#### 2.5 Integration Points

**Linked to Everything**:

1. **Color Planner** → Colors auto-populate moodboard
2. **Material Selections** → Materials available as moodboard elements
3. **Scope Items** → Click material in moodboard to see scope item details
4. **Vendor Packets** → Moodboard included in contractor exports
5. **Listing Prep** → Moodboard becomes marketing asset
6. **Portfolio** → Before/after with moodboard showcase
7. **AI Listing Generator** → Describes aesthetic based on moodboard

---

### Feature 3: Portfolio Builder

#### 3.1 Portfolio Architecture

**Purpose**: Professional showcase of completed projects for:
- Personal website display
- Social media marketing
- Pitching to investors/lenders
- Demonstrating ROI to future clients
- Building personal brand

**Database Schema**:
```sql
CREATE TABLE portfolio_projects (
  id UUID PRIMARY KEY,
  project_id UUID REFERENCES projects(id),
  is_published BOOLEAN DEFAULT false,
  publish_date TIMESTAMP,
  
  -- Project Details
  property_address VARCHAR(255), -- Optionally anonymized
  display_address VARCHAR(255), -- "Modern Farmhouse in Otsego, MN"
  project_type VARCHAR(50), -- 'flip', 'rental', 'airbnb', 'wholesale'
  completion_date DATE,
  duration_days INT,
  
  -- Financial Performance (optional to show publicly)
  show_financials BOOLEAN DEFAULT false,
  purchase_price DECIMAL(10,2),
  rehab_cost DECIMAL(10,2),
  sale_price DECIMAL(10,2),
  roi_percentage DECIMAL(5,2),
  profit DECIMAL(10,2),
  
  -- Design Story
  design_style VARCHAR(100),
  target_buyer VARCHAR(100),
  project_story TEXT, -- Narrative about the project
  key_features TEXT[], -- ['Kitchen remodel', 'Smart home', etc.]
  
  -- Media
  hero_image_url VARCHAR(500), -- Main showcase image
  before_images JSONB, -- Array of before photos
  after_images JSONB, -- Array of after photos
  moodboard_id UUID REFERENCES moodboards(id),
  video_url VARCHAR(500), -- Optional walkthrough video
  
  -- SEO & Marketing
  seo_title VARCHAR(100),
  seo_description TEXT,
  tags TEXT[], -- ['modern-farmhouse', 'kitchen-remodel', etc.]
  
  -- Social Sharing
  featured_on_social JSONB, -- Links to social posts
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);

CREATE TABLE portfolio_settings (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES users(id),
  
  -- Branding
  portfolio_name VARCHAR(100), -- "Smith Property Group"
  tagline VARCHAR(255),
  logo_url VARCHAR(500),
  primary_color VARCHAR(7), -- Hex code
  
  -- Display Preferences
  show_roi_data BOOLEAN DEFAULT false,
  show_before_after BOOLEAN DEFAULT true,
  show_moodboards BOOLEAN DEFAULT true,
  show_contact_form BOOLEAN DEFAULT true,
  
  -- SEO
  meta_title VARCHAR(100),
  meta_description TEXT,
  
  -- Custom Domain (Pro feature)
  custom_domain VARCHAR(255), -- portfolio.smithpropertygroup.com
  
  created_at TIMESTAMP,
  updated_at TIMESTAMP
);
```

#### 3.2 Portfolio Builder UI

**Portfolio Dashboard**:

```
┌──────────────────────────────────────────────────────────────┐
│ Portfolio Builder                                             │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ 🌐 Your Portfolio: https://rehabestimator.com/@username      │
│ [Visit Portfolio] [Share Link] [Customize Theme]             │
│                                                               │
│ ┌──── Published Projects (3) ────────────────────────────┐  │
│ │                                                          │  │
│ │ [Drag to reorder]                                        │  │
│ │                                                          │  │
│ │ 1. Modern Farmhouse Transformation                       │  │
│ │    [Before/After] 📸 12 photos | 💰 ROI: 18%            │  │
│ │    [Edit] [Unpublish] [Share]                           │  │
│ │                                                          │  │
│ │ 2. Downtown Condo Flip                                   │  │
│ │    [Before/After] 📸 8 photos | 💰 Private              │  │
│ │    [Edit] [Unpublish] [Share]                           │  │
│ │                                                          │  │
│ │ 3. Luxury Airbnb Conversion                              │  │
│ │    [Before/After] 📸 15 photos | 💰 ROI: 24%            │  │
│ │    [Edit] [Unpublish] [Share]                           │  │
│ │                                                          │  │
│ └────────────────────────────────────────────────────────  │  │
│                                                               │
│ ┌──── Draft Projects (2) ───────────────────────────────┐   │
│ │                                                          │  │
│ │ • 12407 65th St NE, Otsego (In Progress)                │  │
│ │   [Continue Editing] [Preview]                          │  │
│ │                                                          │  │
│ │ • Rental Property - Minneapolis (Not Published)          │  │
│ │   [Continue Editing] [Preview]                          │  │
│ │                                                          │  │
│ └────────────────────────────────────────────────────────  │  │
│                                                               │
│ [+ Add Project to Portfolio]                                 │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Project Portfolio Editor**:

```
┌──────────────────────────────────────────────────────────────┐
│ Edit Portfolio Project: Modern Farmhouse Transformation      │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ [Project Info] [Photos] [Story] [Settings] [Preview]        │
│  ════════════                                                 │
│                                                               │
│ Display Name:                                                │
│ [Modern Farmhouse Transformation in Otsego, MN]              │
│                                                               │
│ Project Type: ● Flip ○ Rental ○ Airbnb ○ Wholesale          │
│                                                               │
│ Completion Date: [May 2024 ▼]                                │
│ Project Duration: [6 months]                                 │
│                                                               │
│ Design Style: [Modern Farmhouse ▼]                           │
│ Target Buyer: [First-Time Buyer ▼]                           │
│                                                               │
│ Key Features (shown as tags):                                │
│ [Kitchen Remodel ×] [Smart Home ×] [New HVAC ×]              │
│ [+ Add Feature]                                              │
│                                                               │
│ Show Financial Performance?                                   │
│ ○ Yes, show all financials                                   │
│ ● Yes, but only ROI percentage                               │
│ ○ No, keep financials private                                │
│                                                               │
│ ┌──── Financial Summary ──────────────────────────────┐     │
│ │ Purchase Price: $225,000                             │     │
│ │ Rehab Cost: $46,500                                  │     │
│ │ Sale Price: $309,900                                 │     │
│ │ Net Profit: $10,700                                  │     │
│ │ ROI: 18.2%                                           │     │
│ └────────────────────────────────────────────────────  │     │
│                                                               │
│ [Previous: Settings] [Next: Photos]                          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Photo Management**:

```
┌──────────────────────────────────────────────────────────────┐
│ Edit Portfolio Project: Photos                               │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ [Project Info] [Photos] [Story] [Settings] [Preview]        │
│                ══════                                         │
│                                                               │
│ Hero Image (Main showcase photo):                            │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ [Large After Photo of Kitchen]                          │ │
│ │                                                          │ │
│ │                                                          │ │
│ └─────────────────────────────────────────────────────────┘ │
│ [Change Hero Image]                                          │
│                                                               │
│ Before Photos: (Drag to reorder)                             │
│ ┌──── Before Gallery ───────────────────────────────────┐   │
│ │ [thumb] [thumb] [thumb] [thumb] [thumb]               │   │
│ │ [thumb] [thumb] [+ Upload]                            │   │
│ └─────────────────────────────────────────────────────── │   │
│                                                               │
│ After Photos: (Drag to reorder)                              │
│ ┌──── After Gallery ────────────────────────────────────┐   │
│ │ [thumb] [thumb] [thumb] [thumb] [thumb]               │   │
│ │ [thumb] [thumb] [thumb] [+ Upload]                    │   │
│ └─────────────────────────────────────────────────────── │   │
│                                                               │
│ Moodboard:                                                   │
│ ☑ Include design moodboard in portfolio                      │
│ [Preview Moodboard]                                          │
│                                                               │
│ Video Walkthrough (Optional):                                │
│ [Upload Video] or [YouTube URL _________________]            │
│                                                               │
│ [Previous: Project Info] [Next: Story]                       │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

#### 3.3 Portfolio Website Themes

**Theme Options**:

1. **Minimalist Professional**
   - Clean white background
   - Large before/after sliders
   - Grid layout for multiple projects
   - Simple navigation

2. **Bold & Modern**
   - Dark background
   - Dramatic photo showcases
   - Animated transitions
   - Full-screen hero images

3. **Magazine Style**
   - Editorial layout
   - Story-focused presentation
   - Pull quotes and highlights
   - Rich typography

4. **Grid Portfolio**
   - Masonry grid of projects
   - Hover effects reveal details
   - Filter by project type/style
   - Quick preview modals

**Example Portfolio Page Structure**:

```
┌─────────────────────────────────────────────────────────┐
│ SMITH PROPERTY GROUP                        [Menu ≡]    │
│ Transforming Properties, Maximizing Value               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ ┌───── Hero Section ───────────────────────────────┐   │
│ │                                                    │   │
│ │   [Large Before/After Slider]                     │   │
│ │                                                    │   │
│ │   Modern Farmhouse Transformation                 │   │
│ │   Otsego, MN | 18% ROI | 6 Months                │   │
│ │                                                    │   │
│ └──────────────────────────────────────────────────  │   │
│                                                          │
│ ┌───── Project Grid ──────────────────────────────┐    │
│ │                                                   │    │
│ │ [Project 1]  [Project 2]  [Project 3]           │    │
│ │ [Photo]      [Photo]      [Photo]               │    │
│ │ Title        Title        Title                  │    │
│ │ ROI: 24%     ROI: 15%     ROI: 22%              │    │
│ │                                                   │    │
│ └─────────────────────────────────────────────────  │    │
│                                                          │
│ ┌───── About Section ─────────────────────────────┐    │
│ │ "I specialize in value-add renovations that      │    │
│ │  maximize ROI while creating beautiful spaces     │    │
│ │  buyers love. Every project is data-driven with   │    │
│ │  careful attention to design and market trends."  │    │
│ │                                                   │    │
│ │  — John Smith, Investor                          │    │
│ └─────────────────────────────────────────────────  │    │
│                                                          │
│ [Contact] [Instagram] [View All Projects]               │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

**Individual Project Page**:

```
┌─────────────────────────────────────────────────────────┐
│ ← Back to Portfolio                                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│ Modern Farmhouse Transformation                          │
│ Otsego, Minnesota                                        │
│                                                          │
│ ┌───── Hero Image ─────────────────────────────────┐   │
│ │ [Stunning After Photo - Kitchen]                  │   │
│ └─────────────────────────────────────────────────── │   │
│                                                          │
│ ┌───── Project Overview ──────────────────────────┐    │
│ │ Project Type: Flip                                │    │
│ │ Duration: 6 months                                │    │
│ │ Completed: May 2024                               │    │
│ │ ROI: 18.2%                                        │    │
│ │                                                   │    │
│ │ Key Features:                                     │    │
│ │ • Complete kitchen remodel                        │    │
│ │ • Smart home integration                          │    │
│ │ • New HVAC system                                 │    │
│ │ • LVP flooring throughout                         │    │
│ │ • Modern light fixtures                           │    │
│ └─────────────────────────────────────────────────  │    │
│                                                          │
│ The Story:                                               │
│                                                          │
│ This 1980s split-level had great bones but needed a     │
│ complete aesthetic refresh to appeal to modern first-   │
│ time buyers. We focused on creating an open, bright     │
│ space with a cohesive Modern Farmhouse design that      │
│ felt both stylish and approachable.                      │
│                                                          │
│ The kitchen transformation was the centerpiece...        │
│                                                          │
│ ┌───── Design Moodboard ──────────────────────────┐    │
│ │ [Moodboard Display]                               │    │
│ └─────────────────────────────────────────────────  │    │
│                                                          │
│ ┌───── Before & After Gallery ────────────────────┐    │
│ │                                                   │    │
│ │ Kitchen:                                          │    │
│ │ [Before Slider Image] ←→ [After Slider Image]    │    │
│ │                                                   │    │
│ │ Living Room:                                      │    │
│ │ [Before Slider Image] ←→ [After Slider Image]    │    │
│ │                                                   │    │
│ │ Primary Bathroom:                                 │    │
│ │ [Before Slider Image] ←→ [After Slider Image]    │    │
│ │                                                   │    │
│ │ ... (more rooms)                                  │    │
│ │                                                   │    │
│ └─────────────────────────────────────────────────  │    │
│                                                          │
│ [Share Project] [View Next Project →]                   │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

### Feature 4: Project Management Suite

#### 4.1 Gantt Chart View

**Addition to Action Plan Step**:

```
┌──────────────────────────────────────────────────────────────┐
│ Step 7: Action Plan & Project Management                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ [React Flow Timeline] [Gantt Chart] [Calendar] [Tasks]      │
│                        ════════════                           │
│                                                               │
│ ┌──── Gantt Chart View ──────────────────────────────────┐  │
│ │                                                          │  │
│ │ Week of: ◀ May 1-7, 2024 ▶        [Today] [Zoom ▼]     │  │
│ │                                                          │  │
│ │ Phase/Task          │ May │ Jun │ Jul │ Aug │ Sep │    │  │
│ │ ─────────────────────┼──1──┼──1──┼──1──┼──1──┼──1──┤    │  │
│ │                      │     │     │     │     │     │    │  │
│ │ ▼ Phase 1: Demo     │█████│     │     │     │     │    │  │
│ │   ├─ Interior Demo  │███  │     │     │     │     │    │  │
│ │   └─ Haul Away      │  ██ │     │     │     │     │    │  │
│ │                      │     │     │     │     │     │    │  │
│ │ ▼ Phase 2: Systems  │     │█████│     │     │     │    │  │
│ │   ├─ HVAC Install   │     │██   │     │     │     │    │  │
│ │   ├─ Electrical     │     │ ████│     │     │     │    │  │
│ │   └─ Plumbing       │     │  ███│     │     │     │    │  │
│ │                      │     │     │     │     │     │    │  │
│ │ ▼ Phase 3: Interior │     │     │█████│     │     │    │  │
│ │   ├─ Drywall        │     │     │██   │     │     │    │  │
│ │   ├─ Paint          │     │     │  ███│     │     │    │  │
│ │   ├─ Flooring       │     │     │   ██│██   │     │    │  │
│ │   ├─ Kitchen Cabs   │     │     │     │███  │     │    │  │
│ │   └─ Countertops    │     │     │     │  ██ │     │    │  │
│ │                      │     │     │     │     │     │    │  │
│ │ ▼ Phase 4: Final    │     │     │     │     │█████│    │  │
│ │   ├─ Fixtures       │     │     │     │     │██   │    │  │
│ │   ├─ Smart Home     │     │     │     │     │ ██  │    │  │
│ │   └─ Final Clean    │     │     │     │     │  ██ │    │  │
│ │                      │     │     │     │     │     │    │  │
│ │ ⚠ Critical Path     │█████│█████│█████│█████│     │    │  │
│ │                      │     │     │     │     │     │    │  │
│ │ Today ▼                   ↑                           │  │
│ │                      │     │     │     │     │     │    │  │
│ └────────────────────────────────────────────────────────  │  │
│                                                               │
│ Project Duration: 6 months | Days Remaining: 127             │
│ % Complete: 23% | On Track: ⚠ 3 days behind                  │
│                                                               │
│ [Export to PDF] [Share with Team] [Print]                   │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Gantt Features**:
- Drag bars to adjust timing
- Dependencies shown with arrows
- Critical path highlighted
- Actual vs. estimated tracking
- Milestone markers
- Color-coded by phase
- Resource allocation view (which vendor on which task)

#### 4.2 Calendar Integration

**Integration with External Calendars**:
- Google Calendar sync
- Outlook/Microsoft 365 sync
- Apple Calendar sync (.ics export)
- Two-way sync: Add events here → appear in your calendar

**Calendar View**:

```
┌──────────────────────────────────────────────────────────────┐
│ Step 7: Action Plan & Project Management                     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ [React Flow] [Gantt] [Calendar] [Tasks] [Documents]         │
│                       ════════                                │
│                                                               │
│ ┌──── Calendar View ─────────────────────────────────────┐  │
│ │                                                          │  │
│ │ ◀ May 2024 ▶                        [Month][Week][Day] │  │
│ │                                                          │  │
│ │ Sun    Mon    Tue    Wed    Thu    Fri    Sat          │  │
│ │ ────────────────────────────────────────────────────   │  │
│ │        1      2      3      4      5      6            │  │
│ │                                                          │  │
│ │ 7      8      9      10     11     12     13           │  │
│ │        [HVAC  [HVAC         [Elec  [Elec               │  │
│ │         Start] Cont]         Start] Insp]              │  │
│ │                                                          │  │
│ │ 14     15     16     17     18     19     20           │  │
│ │        [Plumb [Plumb        [Drywall                    │  │
│ │         Start] Insp]         Start]                     │  │
│ │                                     [Paint               │  │
│ │                                      Primer]             │  │
│ │                                                          │  │
│ │ 21     22     23     24     25     26     27           │  │
│ │                             [Paint  [Paint              │  │
│ │                              Day 1]  Day 2]              │  │
│ │                                     [Floor               │  │
│ │                                      Deliv]              │  │
│ │                                                          │  │
│ │ 28     29     30     31                                 │  │
│ │ [Floor [Floor [Floor [Kitchen                           │  │
│ │  Day 1] Day 2] Done]  Start]                           │  │
│ │                                                          │  │
│ └────────────────────────────────────────────────────────  │  │
│                                                               │
│ Upcoming This Week:                                          │
│ • Mon, May 8: HVAC Installation Starts (ABC Heating)         │
│ • Thu, May 11: Electrical Rough-In (Smith Electric)          │
│ • Fri, May 12: Electrical Inspection @ 2:00 PM               │
│                                                               │
│ [+ Add Event] [Sync to Google Calendar] [Subscribe]          │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Calendar Features**:
- Add inspections, vendor appointments, material deliveries
- Set reminders (email/SMS)
- Recurring events (weekly site visits)
- Invite vendors to events
- Sync with personal calendar
- iCal feed for subscription

#### 4.3 Notion-Style Documentation Pages

**Document Library**:

```
┌──────────────────────────────────────────────────────────────┐
│ Project Documents                         [+ New Page ▼]     │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ ┌─── Page Tree (Sidebar) ──────────┐  ┌─── Page Editor ───┐ │
│ │                                    │  │                    │ │
│ │ 📁 12407 65th St NE Project       │  │ Kitchen Notes      │ │
│ │   ├─ 📄 Project Overview           │  │ ═══════════════   │ │
│ │   ├─ 📁 Design Documents           │  │                    │ │
│ │   │   ├─ 📄 Kitchen Notes          │◀─│ Cabinet Specs:    │ │
│ │   │   ├─ 📄 Bathroom Plan          │  │ • Style: Shaker   │ │
│ │   │   └─ 📄 Color Selections       │  │ • Color: SW 7005  │ │
│ │   ├─ 📁 Vendor Information         │  │ • Hardware: Matte │ │
│ │   │   ├─ 📄 Contractor Contacts    │  │   Black pulls     │ │
│ │   │   ├─ 📄 Bids & Quotes          │  │                    │ │
│ │   │   └─ 📄 Warranties              │  │ Countertops:      │ │
│ │   ├─ 📁 Permits & Inspections      │  │ • Material: Quartz│ │
│ │   │   ├─ 📄 Permit Applications    │  │ • Color: White w/ │ │
│ │   │   └─ 📄 Inspection Reports     │  │   gray veining    │ │
│ │   ├─ 📁 Photos & Media             │  │ • Supplier: MSI   │ │
│ │   │   ├─ 📄 Before Photos          │  │ • Quote: $3,650   │ │
│ │   │   ├─ 📄 Progress Photos        │  │                    │ │
│ │   │   └─ 📄 Final Photos           │  │ [Image: Kitchen   │ │
│ │   ├─ 📄 Meeting Notes              │  │  Inspiration]     │ │
│ │   ├─ 📄 Change Orders              │  │                    │ │
│ │   ├─ 📄 Budget Tracking            │  │ Questions for GC: │ │
│ │   └─ 📄 Lessons Learned            │  │ ☐ Confirm outlet  │ │
│ │                                    │  │   placement        │ │
│ │ [+ New Page] [+ New Folder]        │  │ ☐ Backsplash      │ │
│ │                                    │  │   install timing  │ │
│ └────────────────────────────────────┘  │                    │ │
│                                         │ [Formatting ▼]    │ │
│                                         └────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Page Editor Features**:

```
┌──────────────────────────────────────────────────────────────┐
│ Page: Kitchen Notes                          [Share] [•••]   │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ / (slash commands):                                          │
│ /heading → Insert heading                                    │
│ /bullet → Bulleted list                                      │
│ /number → Numbered list                                      │
│ /todo → To-do checkbox                                       │
│ /table → Insert table                                        │
│ /image → Insert image                                        │
│ /code → Code block                                           │
│ /quote → Quote block                                         │
│ /divider → Horizontal line                                   │
│ /callout → Callout box                                       │
│ /scope → Link to scope item                                  │
│ /vendor → Link to vendor                                     │
│ /photo → Insert photo from project                           │
│                                                               │
│ Formatting:                                                   │
│ **bold** | *italic* | ~strikethrough~ | `code` | [link]()   │
│                                                               │
│ @ Mentions:                                                   │
│ @vendor → Mention/link vendor                                │
│ @teammate → Notify team member                               │
│ @scope-item → Link to specific scope item                    │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

**Templates Available**:
- Meeting Notes (with agenda, attendees, action items)
- Daily Site Report (weather, work completed, issues)
- Change Order Template (description, cost impact, approval)
- Vendor Contact Sheet (all contact info, specialties)
- Inspection Checklist (pass/fail items, photos)
- Budget Tracker (planned vs. actual by category)
- Warranty Registry (what, where, when expires)

---

### Feature 5: Vendor Export Packet System

#### 5.1 Packet Types & Contents

**Contractor Packet**:
```
Contents:
├─ Project Overview
│   ├─ Property address
│   ├─ Timeline (start/end dates)
│   └─ Key contacts
├─ Design Documents
│   ├─ Moodboard (visual aesthetic)
│   ├─ Color selections (SW paint codes)
│   ├─ Material specifications
│   └─ Fixture details
├─ Scope of Work (Filtered to their trade)
│   ├─ Line items they're responsible for
│   ├─ Quantities
│   ├─ Specifications
│   └─ Priority/timeline
├─ Site Information
│   ├─ Access instructions
│   ├─ Parking details
│   ├─ Utility shutoff locations
│   └─ Dumpster/material storage
└─ Expectations
    ├─ Work hours
    ├─ Clean-up requirements
    ├─ Communication preferences
    └─ Payment terms
```

**Stager Packet**:
```
Contents:
├─ Property Overview
│   ├─ Address & access
│   ├─ Photography date
│   └─ Listing date
├─ Design Aesthetic
│   ├─ Full moodboard
│   ├─ Target buyer profile
│   ├─ Color palette
│   └─ Style keywords
├─ Staging Budget: $X,XXX
├─ Room Priority List
│   ├─ Living room (high priority)
│   ├─ Kitchen (styling only)
│   ├─ Primary bedroom (high priority)
│   └─ Other bedrooms (minimal)
├─ Specific Needs
│   ├─ Emphasize smart home features
│   ├─ Show off modernized kitchen
│   └─ Create cozy retreat feel in primary
└─ Photos of Completed Renovation
```

**Photographer Packet**:
```
Contents:
├─ Property Information
│   ├─ Address
│   ├─ Square footage
│   └─ Key features
├─ Shoot Details
│   ├─ Preferred date/time
│   ├─ Best lighting times
│   └─ Access instructions
├─ Shot List (Room by room)
│   ├─ Living room: Wide angle, detail of fireplace
│   ├─ Kitchen: Island focal, appliances, backsplash detail
│   ├─ Bathrooms: Vanity, shower, details
│   └─ Exterior: Front curb appeal, backyard
├─ Feature Highlights
│   ├─ New quartz countertops (get close-up)
│   ├─ Smart thermostat (detail shot)
│   ├─ Modern light fixtures (in use, lights on)
│   └─ Refinished floors (angle to show continuity)
├─ Moodboard (for aesthetic reference)
└─ Deliverables Needed
    ├─ 25-30 edited photos
    ├─ Virtual staging options (if vacant)
    └─ Drone shots (exterior)
```

**Real Estate Agent Packet**:
```
Contents:
├─ Property Marketing Package
│   ├─ AI-generated listing description
│   ├─ Feature bullets
│   ├─ Headline options
│   └─ Keywords/SEO tags
├─ Competitive Analysis
│   ├─ Price positioning
│   ├─ Similar active listings
│   ├─ Recent comps
│   └─ Our competitive advantages
├─ Renovation Summary
│   ├─ Total investment
│   ├─ Major improvements list
│   ├─ Modernization upgrades
│   └─ Smart home features
├─ Visual Assets
│   ├─ Before & after photos
│   ├─ Moodboard
│   ├─ Virtual tour (if available)
│   └─ Floor plan
├─ Suggested Marketing Strategy
│   ├─ Pricing recommendation
│   ├─ Staging strategy (completed)
│   ├─ Photography (scheduled)
│   └─ Timeline to market
└─ Key Talking Points
    ├─ "Completely renovated kitchen..."
    ├─ "Smart home ready with..."
    └─ "Move-in ready condition..."
```

#### 5.2 Generate Packet UI

```
┌──────────────────────────────────────────────────────────────┐
│ Generate Vendor Packet                                        │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│ Select Packet Type:                                          │
│ ● Contractor/GC        ○ Stager                              │
│ ○ Photographer         ○ Real Estate Agent                   │
│                                                               │
│ ┌──── Contractor Packet Options ───────────────────────┐    │
│ │                                                        │    │
│ │ Select Trade(s):                                      │    │
│ │ ☑ General Contractor                                  │    │
│ │ ☑ Plumbing                                            │    │
│ │ ☐ Electrical                                          │    │
│ │ ☐ HVAC                                                │    │
│ │ ☑ Flooring                                            │    │
│ │ ☑ Painting                                            │    │
│ │                                                        │    │
│ │ Include:                                               │    │
│ │ ☑ Design moodboard                                    │    │
│ │ ☑ Color selections (paint codes)                      │    │
│ │ ☑ Material specifications                             │    │
│ │ ☑ Full scope of work (filtered to selected trades)   │    │
│ │ ☑ Timeline & dependencies                             │    │
│ │ ☑ Site access information                             │    │
│ │ ☑ Project overview                                    │    │
│ │                                                        │    │
│ │ Scope Filtering:                                       │    │
│ │ ● Include only items for selected trades              │    │
│ │ ○ Include all scope items (full project view)        │    │
│ │                                                        │    │
│ │ Pricing:                                               │    │
│ │ ○ Show estimated costs                                │    │
│ │ ● Hide costs (let them bid)                          │    │
│ │                                                        │    │
│ └──────────────────────────────────────────────────────  │    │
│                                                               │
│ Delivery Method:                                             │
│ ○ Download PDF                                               │
│ ● Email to vendor ([email@example.com])                      │
│ ○ Generate shareable link (password protected)              │
│                                                               │
│ Add Personal Message (optional):                             │
│ ┌─────────────────────────────────────────────────────────┐ │
│ │ Hi [Vendor Name],                                        │ │
│ │                                                          │ │
│ │ Attached is the project packet for 12407 65th St NE.   │ │
│ │ Please review and let me know if you have any           │ │
│ │ questions. Looking forward to working with you!          │ │
│ │                                                          │ │
│ │ Thanks,                                                  │ │
│ │ [Your Name]                                              │ │
│ └─────────────────────────────────────────────────────────┘ │
│                                                               │
│ [Preview Packet] [Generate & Send]                           │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

---

## 🗓️ Revised Development Roadmap

### Phase 2A: Design Intelligence (Weeks 1-8)

**Week 1-2: Color Planner Foundation**
- [ ] Build color_library table
- [ ] Seed with 500+ Sherwin Williams colors
- [ ] Create color browser UI
- [ ] Implement color picker component
- [ ] Build room-by-room color selection interface

**Week 3-4: Material Palette & Integration**
- [ ] Material palette generator logic
- [ ] Link colors to scope items
- [ ] Smart color recommendations by style
- [ ] Color validation (coordinates with other selections)
- [ ] Export paint list feature

**Week 5-6: Moodboard Builder**
- [ ] Build moodboard database schema
- [ ] Drag-and-drop canvas interface
- [ ] Element library (images, colors, materials, text)
- [ ] Integration with Unsplash/Pexels APIs
- [ ] Layout templates (5 pre-built)

**Week 7-8: Moodboard Sharing & Polish**
- [ ] Social media export (Instagram, Pinterest, Facebook)
- [ ] Public link sharing with password protection
- [ ] Vendor packet integration
- [ ] Link moodboard elements to scope items
- [ ] Mobile-responsive moodboard viewer

**Deliverables**:
✅ Sherwin Williams color planner functional
✅ Professional moodboard builder with templates
✅ Social sharing & vendor export
✅ Integrated with scope building

---

### Phase 2B: ROI Intelligence & Portfolio (Weeks 9-14)

**Week 9-10: ROI Database & Ranking**
- [ ] Build upgrade_roi_benchmarks table
- [ ] Seed with top 50 upgrades (national + regional data)
- [ ] Create ROI ranking dashboard
- [ ] Sort/filter functionality
- [ ] "Add to Scope" quick actions

**Week 11-12: Portfolio Builder Foundation**
- [ ] Build portfolio database schema
- [ ] Portfolio dashboard UI
- [ ] Project editor (info, photos, story)
- [ ] Portfolio theme selection (4 themes)
- [ ] Public portfolio page generation

**Week 13-14: Portfolio Polish & Integration**
- [ ] Before/after slider implementation
- [ ] Moodboard integration in portfolio
- [ ] Social sharing from portfolio
- [ ] SEO optimization
- [ ] Custom domain support (Pro tier)

**Deliverables**:
✅ ROI ranking dashboard live
✅ Portfolio builder functional
✅ Public portfolio pages
✅ Before/after showcases with moodboards

---

### Phase 3: Smart Home & Project Management (Weeks 15-20)

**Week 15-16: Smart Home Packages**
- [ ] Define 4 smart home tiers
- [ ] Create smart_home_packages table
- [ ] Product tier selection (Budget/Standard/Premium)
- [ ] Package selector UI
- [ ] ROI calculator per package

**Week 17-18: Gantt Chart & Calendar**
- [ ] Gantt chart implementation
- [ ] Drag-to-adjust timeline
- [ ] Critical path highlighting
- [ ] Calendar view (month/week/day)
- [ ] Google Calendar integration API

**Week 19-20: Notion-Style Documentation**
- [ ] Document library structure
- [ ] Rich text editor with slash commands
- [ ] Page templates (7 types)
- [ ] @mentions and linking
- [ ] Search across documents

**Deliverables**:
✅ Smart home packages with product tiers
✅ Gantt chart + calendar views
✅ Notion-style documentation system
✅ Calendar sync with Google/Outlook

---

### Phase 4: Vendor Collaboration & Export (Weeks 21-24)

**Week 21-22: Vendor Packet System**
- [ ] Define 4 packet types (contractor, stager, photographer, agent)
- [ ] Packet generation logic (filtering by trade)
- [ ] PDF export with branding
- [ ] Email delivery with personal message
- [ ] Shareable links with password protection

**Week 23-24: Mobile Optimization**
- [ ] Mobile-responsive design for all new features
- [ ] Touch-optimized moodboard builder
- [ ] Mobile calendar/task views
- [ ] Simplified scope building for mobile
- [ ] Camera integration for job site photos

**Deliverables**:
✅ Vendor packet system operational
✅ 4 packet types with smart filtering
✅ Fully functional mobile experience

---

### Phase 5: AI & Exit Strategy (Weeks 25-28)

**Week 25-26: AI Listing Generator**
- [ ] OpenAI API integration
- [ ] Prompt engineering for listings
- [ ] Uses moodboard + scope + design style
- [ ] Headline generator
- [ ] Feature bullets extraction
- [ ] SEO keyword suggestions

**Week 27-28: Post-Project & Incentives**
- [ ] Post-project analysis interface
- [ ] Actual vs. estimated tracking
- [ ] Vendor performance reviews
- [ ] Lessons learned capture
- [ ] Feature unlock incentives (complete post-project → unlock advanced ROI data)

**Deliverables**:
✅ AI-powered listing generation
✅ Post-project analysis system
✅ Incentivized feature unlocks

---

## 🎯 Summary of Expanded Scope

### Core Additions:

1. **Sherwin Williams Color Planner** ✨
   - 500+ colors with technical specs
   - Room-by-room selection
   - Smart recommendations by style
   - Auto-populates scope items

2. **Professional Moodboard Builder** 🎨
   - Drag-and-drop interface
   - Stock image integration
   - Social media sharing
   - Vendor packet inclusion
   - Portfolio integration

3. **Portfolio Builder** 📸
   - Public portfolio pages
   - Before/after showcases
   - Multiple themes
   - SEO optimized
   - Social sharing
   - Custom domains (Pro tier)

4. **Project Management Suite** 📅
   - Gantt chart visualization
   - Calendar integration (Google/Outlook)
   - Notion-style documentation
   - Task management
   - Team collaboration

5. **Vendor Export Packets** 📦
   - 4 packet types (contractor, stager, photographer, agent)
   - Smart filtering by trade
   - PDF export with branding
   - Email delivery
   - Shareable links

6. **Smart Home Product Tiers** 💡
   - Pre-built packages
   - Budget/Standard/Premium choices within packages
   - ROI per feature/tier
   - Installation requirements

### Your Questions - Answered:

1. **Design timing**: BEFORE scope building (Step 4 → Step 5)
2. **Smart home**: Packages with product tier choices ✅
3. **ROI data**: All sources, build over time ✅
4. **Listing prep**: Both early planning + final execution ✅
5. **Post-project**: Incentivized (unlock features) ✅
6. **Mobile**: Fully functional mobile version ✅
7. **Collaboration**: Everyone gets packets + exports ✅
8. **Project management**: Gantt + calendar + Notion docs ✅

---

## 🚀 Next Steps

**This Week**:
1. Review this refined plan
2. Prioritize any additional tweaks
3. Approve Phase 2A scope (Weeks 1-8)

**Next 8 Weeks (Phase 2A)**:
1. Build Sherwin Williams color planner
2. Create professional moodboard builder
3. Launch to beta users for feedback

**After Phase 2A**:
1. Gather user feedback
2. Iterate on designs
3. Begin Phase 2B (ROI + Portfolio)

Ready to build! 🎉
