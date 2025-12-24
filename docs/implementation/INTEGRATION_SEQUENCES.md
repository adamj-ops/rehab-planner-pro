# Phase 2A Integration Sequences

> **Purpose:** Step-by-step build order for each Epic with verification checkpoints. Follow this guide to build features in the correct sequence with testing at each step.

---

## Table of Contents

1. [Overview](#overview)
2. [Prerequisites Checklist](#prerequisites-checklist)
3. [Epic 1: Color System](#epic-1-color-system)
4. [Epic 2: Material Selection](#epic-2-material-selection)
5. [Epic 3: Moodboard Builder](#epic-3-moodboard-builder)
6. [Epic 4: Integration](#epic-4-integration)
7. [Cross-Epic Dependencies](#cross-epic-dependencies)
8. [Rollback Procedures](#rollback-procedures)

---

## Overview

### Build Philosophy

Build **bottom-up**: Database → Types → API → Store → Components → Integration

```
┌─────────────────────────────────────────────────────────────────┐
│                         Build Order                              │
├─────────────────────────────────────────────────────────────────┤
│ 1. DATABASE    │ Migrations, seed data, RLS policies           │
│ 2. TYPES       │ TypeScript interfaces from schema              │
│ 3. API         │ Route handlers with Supabase queries          │
│ 4. STORE       │ Zustand actions and state                     │
│ 5. COMPONENTS  │ UI components (leaf → container)              │
│ 6. INTEGRATION │ Connect components, test E2E                   │
└─────────────────────────────────────────────────────────────────┘
```

### Verification Pattern

After each step:
1. ✅ **Code compiles** - No TypeScript errors
2. ✅ **Tests pass** - Run related unit tests
3. ✅ **Manual check** - Verify in browser/database
4. ✅ **Commit** - Save progress with descriptive message

---

## Prerequisites Checklist

Before starting any Epic, verify:

```bash
# 1. Environment variables set
cat .env.local
# Should show:
# NEXT_PUBLIC_SUPABASE_URL=...
# NEXT_PUBLIC_SUPABASE_ANON_KEY=...
# SUPABASE_SERVICE_ROLE_KEY=...

# 2. Supabase running (if local)
npx supabase status

# 3. Dependencies installed
npm install

# 4. Dev server starts without errors
npm run dev

# 5. Existing tests pass
npm test
```

---

## Epic 1: Color System

**Total Steps:** 12  
**Estimated Time:** 3-4 days

### Step 1.1: Database - Color Library Table

**Status Check:** Does `color_library` table exist?

```sql
-- Run in Supabase SQL Editor
SELECT * FROM color_library LIMIT 1;
```

**If table doesn't exist:**

```bash
# Create migration
npx supabase migration new add_color_library

# Edit: supabase/migrations/[timestamp]_add_color_library.sql
```

```sql
-- Migration content
CREATE TABLE color_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  brand VARCHAR(50) NOT NULL DEFAULT 'Sherwin Williams',
  color_code VARCHAR(20),
  color_name VARCHAR(100) NOT NULL,
  hex_code VARCHAR(7) NOT NULL,
  rgb_r INT,
  rgb_g INT,
  rgb_b INT,
  lrv INT CHECK (lrv >= 0 AND lrv <= 100),
  undertones TEXT[] DEFAULT '{}',
  color_family VARCHAR(50),
  finish_options TEXT[] DEFAULT ARRAY['flat', 'eggshell', 'satin', 'semi-gloss'],
  recommended_rooms TEXT[] DEFAULT '{}',
  design_styles TEXT[] DEFAULT '{}',
  image_url VARCHAR(500),
  popular BOOLEAN DEFAULT false,
  year_introduced INT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Index for common queries
CREATE INDEX idx_color_library_family ON color_library(color_family);
CREATE INDEX idx_color_library_popular ON color_library(popular) WHERE popular = true;
CREATE INDEX idx_color_library_brand ON color_library(brand);

-- Enable RLS
ALTER TABLE color_library ENABLE ROW LEVEL SECURITY;

-- Public read access (colors are shared data)
CREATE POLICY "Colors are viewable by everyone" ON color_library
  FOR SELECT USING (true);
```

**Run migration:**
```bash
npx supabase db reset
# OR for remote:
npx supabase db push
```

**Verification:**
```sql
SELECT COUNT(*) FROM color_library; -- Should be 0 or seed count
\d color_library -- Check schema
```

---

### Step 1.2: Database - Seed Color Data

```sql
-- Seed 6 popular Sherwin Williams colors
INSERT INTO color_library (color_code, color_name, hex_code, rgb_r, rgb_g, rgb_b, lrv, undertones, color_family, popular, design_styles, recommended_rooms)
VALUES
  ('SW 7005', 'Pure White', '#F2EEE5', 242, 238, 229, 84, ARRAY['neutral'], 'white', true, ARRAY['modern', 'farmhouse', 'transitional'], ARRAY['kitchen', 'living_room', 'bedroom']),
  ('SW 7015', 'Repose Gray', '#C2BCB0', 194, 188, 176, 58, ARRAY['warm', 'neutral'], 'gray', true, ARRAY['transitional', 'contemporary'], ARRAY['living_room', 'bedroom', 'bathroom']),
  ('SW 7029', 'Agreeable Gray', '#D0CBC1', 208, 203, 193, 60, ARRAY['warm'], 'gray', true, ARRAY['transitional', 'farmhouse'], ARRAY['living_room', 'bedroom', 'office']),
  ('SW 7006', 'Extra White', '#F1F0EB', 241, 240, 235, 86, ARRAY['cool', 'neutral'], 'white', true, ARRAY['modern', 'contemporary'], ARRAY['trim', 'ceiling', 'bathroom']),
  ('SW 7069', 'Iron Ore', '#4A4845', 74, 72, 69, 6, ARRAY['neutral'], 'black', true, ARRAY['modern', 'industrial', 'farmhouse'], ARRAY['accent_wall', 'exterior', 'doors']),
  ('SW 7008', 'Alabaster', '#EEEBE2', 238, 235, 226, 82, ARRAY['warm'], 'white', true, ARRAY['farmhouse', 'traditional'], ARRAY['kitchen', 'living_room', 'exterior']);
```

**Verification:**
```sql
SELECT color_code, color_name, hex_code FROM color_library WHERE popular = true;
-- Should return 6 rows
```

---

### Step 1.3: Database - Project Color Selections Table

```sql
CREATE TABLE project_color_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  room_type VARCHAR(50) NOT NULL,
  room_name VARCHAR(100),
  surface_type VARCHAR(50) NOT NULL,
  color_id UUID REFERENCES color_library(id),
  custom_color_name VARCHAR(100),
  custom_hex_code VARCHAR(7),
  finish VARCHAR(50),
  coats INT DEFAULT 2,
  primer_needed BOOLEAN DEFAULT false,
  linked_scope_item_id UUID,
  notes TEXT,
  application_instructions TEXT,
  is_primary BOOLEAN DEFAULT false,
  is_approved BOOLEAN DEFAULT false,
  approved_by_client BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_color_selections_project ON project_color_selections(project_id);
CREATE INDEX idx_color_selections_room ON project_color_selections(project_id, room_type);

-- RLS
ALTER TABLE project_color_selections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own project selections" ON project_color_selections
  FOR SELECT USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can insert own project selections" ON project_color_selections
  FOR INSERT WITH CHECK (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can update own project selections" ON project_color_selections
  FOR UPDATE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can delete own project selections" ON project_color_selections
  FOR DELETE USING (
    project_id IN (SELECT id FROM projects WHERE user_id = auth.uid())
  );
```

**Verification:**
```sql
\d project_color_selections
SELECT * FROM pg_policies WHERE tablename = 'project_color_selections';
```

---

### Step 1.4: Types - Generate/Update TypeScript Types

**File:** `src/types/design.ts`

**Verification:** Types should already exist. Check they match database:

```typescript
// Verify these types exist in src/types/design.ts
export interface ColorLibraryItem {
  id: string
  brand: string
  colorCode: string | null
  colorName: string
  hexCode: string
  rgbValues: { r: number; g: number; b: number }
  lrv: number | null
  undertones: Undertone[]
  colorFamily: ColorFamily | null
  finishOptions: PaintFinish[]
  recommendedRooms: RoomType[]
  designStyles: DesignStyle[]
  imageUrl: string | null
  popular: boolean
  yearIntroduced: number | null
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface ProjectColorSelection {
  id: string
  projectId: string
  roomType: RoomType
  roomName: string | null
  surfaceType: SurfaceType
  colorId: string | null
  customColorName: string | null
  customHexCode: string | null
  color?: ColorLibraryItem
  finish: PaintFinish | null
  coats: number
  primerNeeded: boolean
  linkedScopeItemId: string | null
  notes: string | null
  applicationInstructions: string | null
  isPrimary: boolean
  isApproved: boolean
  approvedByClient: boolean
  createdAt: Date
  updatedAt: Date
}
```

**Verification:**
```bash
npm run build # No TypeScript errors
```

---

### Step 1.5: API - Colors Route

**File:** `src/app/api/colors/route.ts` (already exists)

**Verify route works:**
```bash
curl http://localhost:3000/api/colors
# Should return { data: [...], total: 6, page: 1, limit: 50, hasMore: false }
```

**Test filters:**
```bash
curl "http://localhost:3000/api/colors?colorFamily=gray"
curl "http://localhost:3000/api/colors?popular=true"
curl "http://localhost:3000/api/colors?search=Pure"
```

---

### Step 1.6: API - Color Selections Route

**File:** `src/app/api/color-selections/[id]/route.ts`

**Create if doesn't exist:**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET single selection
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { data, error } = await supabase
    .from('project_color_selections')
    .select('*, color:color_library(*)')
    .eq('id', params.id)
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 404 })
  }
  
  return NextResponse.json(data)
}

// PATCH update selection
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  const body = await request.json()
  
  const { data, error } = await supabase
    .from('project_color_selections')
    .update(body)
    .eq('id', params.id)
    .select('*, color:color_library(*)')
    .single()
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json(data)
}

// DELETE selection
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = await createClient()
  
  const { error } = await supabase
    .from('project_color_selections')
    .delete()
    .eq('id', params.id)
  
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 400 })
  }
  
  return NextResponse.json({ success: true })
}
```

---

### Step 1.7: Store - Verify Design Store

**File:** `src/stores/design-store.ts` (already exists)

**Verify these actions exist:**
- `setColorLibrary`
- `addColorSelection`
- `updateColorSelection`
- `removeColorSelection`
- `setColorFilters`

**Test store in browser console:**
```javascript
// In browser dev tools
const store = window.__ZUSTAND_DEVTOOLS__?.stores?.DesignStore
store?.getState()?.colorLibrary.length // Check if colors loaded
```

---

### Step 1.8: Components - Verify Existing Components

**Check these files exist and have no errors:**
- `src/components/design/color-swatch.tsx`
- `src/components/design/color-library-browser.tsx`
- `src/components/design/color-detail-dialog.tsx`
- `src/components/design/project-color-planner.tsx`

**Run component lint:**
```bash
npm run lint -- src/components/design/color*.tsx
```

---

### Step 1.9: Integration - Wire Color Browser to Store

**Verify the connection:**

1. Open the app in browser
2. Navigate to a project's design step
3. Open Color Browser
4. Check Redux DevTools for store updates
5. Select a color
6. Verify selection appears in store

**Debug checklist:**
- [ ] Colors loading from API?
- [ ] Filters working?
- [ ] Selection callback firing?
- [ ] Store updating?

---

### Step 1.10: Integration - Wire Color Planner to API

**Test flow:**

1. Select color for room
2. Check Network tab - POST request sent?
3. Check Supabase - row created in `project_color_selections`?
4. Refresh page - selection persists?

---

### Step 1.11: Integration - Color to Scope Sync

**Create sync service if doesn't exist:**

**File:** `src/lib/design/color-scope-sync.ts`

```typescript
import { createClient } from '@/lib/supabase/client'
import type { ProjectColorSelection } from '@/types/design'

export async function syncColorToScope(selection: ProjectColorSelection) {
  const supabase = createClient()
  
  // Find or create scope item for this room/surface
  const scopeTitle = `Paint ${selection.roomType} ${selection.surfaceType}`
  
  // Check if scope item exists
  const { data: existing } = await supabase
    .from('scope_items')
    .select('id')
    .eq('project_id', selection.projectId)
    .eq('title', scopeTitle)
    .single()
  
  const colorName = selection.color?.colorName || selection.customColorName || 'TBD'
  const colorCode = selection.color?.colorCode || ''
  
  const scopeData = {
    project_id: selection.projectId,
    category: 'interior',
    subcategory: 'paint',
    title: scopeTitle,
    description: `${colorName} ${colorCode} - ${selection.finish || 'eggshell'} finish`,
    linked_color_selection_id: selection.id,
  }
  
  if (existing) {
    await supabase
      .from('scope_items')
      .update(scopeData)
      .eq('id', existing.id)
  } else {
    await supabase
      .from('scope_items')
      .insert(scopeData)
  }
}
```

---

### Step 1.12: Testing - Color System Tests

```bash
# Run color-specific tests
npm test -- --grep "color"

# Manual E2E test
# 1. Create new project
# 2. Go to Step 4 (Design)
# 3. Open Color Browser
# 4. Search for "Pure White"
# 5. Select for Kitchen Walls
# 6. Verify in Step 5 (Scope) - paint line item exists
```

**Commit:**
```bash
git add .
git commit -m "feat(colors): complete color system integration"
```

---

## Epic 2: Material Selection

**Total Steps:** 10  
**Estimated Time:** 3 days

### Step 2.1: Database - Material Library Table

**Check if exists:**
```sql
SELECT * FROM material_library LIMIT 1;
```

**Migration if needed:**
```sql
CREATE TABLE material_library (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  material_type VARCHAR(50) NOT NULL,
  material_category VARCHAR(100),
  brand VARCHAR(100),
  product_name VARCHAR(200) NOT NULL,
  model_number VARCHAR(100),
  sku VARCHAR(100),
  description TEXT,
  color_description VARCHAR(200),
  finish VARCHAR(100),
  dimensions VARCHAR(200),
  thickness VARCHAR(50),
  material_composition TEXT,
  avg_cost_per_unit DECIMAL(10,2),
  unit_type VARCHAR(50),
  typical_lead_time_days INT,
  supplier_info JSONB DEFAULT '[]',
  image_url VARCHAR(500),
  swatch_image_url VARCHAR(500),
  additional_images TEXT[] DEFAULT '{}',
  recommended_rooms TEXT[] DEFAULT '{}',
  design_styles TEXT[] DEFAULT '{}',
  popular BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_material_type ON material_library(material_type);
CREATE INDEX idx_material_popular ON material_library(popular) WHERE popular = true;
```

---

### Step 2.2: Database - Seed Material Data

```sql
INSERT INTO material_library (material_type, brand, product_name, avg_cost_per_unit, unit_type, popular, design_styles)
VALUES
  ('countertop', 'Caesarstone', 'White Attica', 85.00, 'sqft', true, ARRAY['modern', 'transitional']),
  ('countertop', 'Silestone', 'Calacatta Gold', 95.00, 'sqft', true, ARRAY['traditional', 'transitional']),
  ('flooring', 'Shaw', 'Anvil Plus LVP - Greige', 3.50, 'sqft', true, ARRAY['modern', 'farmhouse']),
  ('flooring', 'COREtec', 'Pro Plus XL - Gray Oak', 4.25, 'sqft', true, ARRAY['transitional', 'contemporary']),
  ('tile', 'MSI', 'Subway Tile 3x12 White', 2.50, 'sqft', true, ARRAY['farmhouse', 'traditional']),
  ('hardware', 'Top Knobs', 'Matte Black Bar Pull', 12.00, 'piece', true, ARRAY['modern', 'farmhouse', 'industrial']);
```

---

### Step 2.3: Database - Project Material Selections Table

```sql
CREATE TABLE project_material_selections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  room_type VARCHAR(50),
  room_name VARCHAR(100),
  application VARCHAR(100) NOT NULL,
  material_id UUID REFERENCES material_library(id),
  custom_material_name VARCHAR(200),
  custom_description TEXT,
  quantity DECIMAL(10,2),
  unit_type VARCHAR(50),
  cost_per_unit DECIMAL(10,2),
  total_cost DECIMAL(10,2),
  selected_supplier VARCHAR(200),
  order_date DATE,
  expected_delivery_date DATE,
  linked_scope_item_id UUID,
  notes TEXT,
  installation_notes TEXT,
  is_approved BOOLEAN DEFAULT false,
  is_ordered BOOLEAN DEFAULT false,
  is_received BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS policies (similar to color_selections)
```

---

### Step 2.4 - 2.10: Follow Color System Pattern

Follow the same sequence as Color System:
- Types verification
- API routes
- Store verification
- Component verification
- Integration testing

---

## Epic 3: Moodboard Builder

**Total Steps:** 14  
**Estimated Time:** 5 days

### Step 3.1: Database - Moodboards Table

```sql
CREATE TABLE moodboards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  name VARCHAR(200) NOT NULL,
  description TEXT,
  moodboard_type VARCHAR(50) DEFAULT 'custom',
  is_primary BOOLEAN DEFAULT false,
  template_used VARCHAR(100),
  layout_type VARCHAR(50) DEFAULT 'free',
  canvas_width INT DEFAULT 1275,
  canvas_height INT DEFAULT 1650,
  background_color VARCHAR(7) DEFAULT '#FFFFFF',
  background_image_url VARCHAR(500),
  show_grid BOOLEAN DEFAULT true,
  grid_size INT DEFAULT 20,
  snap_to_grid BOOLEAN DEFAULT true,
  is_public BOOLEAN DEFAULT false,
  public_slug VARCHAR(50) UNIQUE,
  password_protected BOOLEAN DEFAULT false,
  view_count INT DEFAULT 0,
  share_count INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_moodboards_project ON moodboards(project_id);
CREATE INDEX idx_moodboards_public ON moodboards(public_slug) WHERE is_public = true;
```

---

### Step 3.2: Database - Moodboard Elements Table

```sql
CREATE TABLE moodboard_elements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  element_type VARCHAR(50) NOT NULL,
  position_x INT NOT NULL DEFAULT 0,
  position_y INT NOT NULL DEFAULT 0,
  width INT NOT NULL DEFAULT 100,
  height INT NOT NULL DEFAULT 100,
  rotation DECIMAL(5,2) DEFAULT 0,
  z_index INT DEFAULT 0,
  opacity DECIMAL(3,2) DEFAULT 1,
  border_width INT DEFAULT 0,
  border_color VARCHAR(7),
  border_radius INT DEFAULT 0,
  shadow_enabled BOOLEAN DEFAULT false,
  shadow_config JSONB,
  
  -- Image fields
  image_url VARCHAR(500),
  image_source VARCHAR(50),
  image_attribution TEXT,
  original_image_width INT,
  original_image_height INT,
  crop_config JSONB,
  
  -- Color swatch fields
  color_id UUID REFERENCES color_library(id),
  swatch_shape VARCHAR(20) DEFAULT 'square',
  show_color_name BOOLEAN DEFAULT true,
  show_color_code BOOLEAN DEFAULT true,
  
  -- Text fields
  text_content TEXT,
  font_family VARCHAR(100) DEFAULT 'Inter',
  font_size INT DEFAULT 16,
  font_weight VARCHAR(20) DEFAULT 'normal',
  font_style VARCHAR(20) DEFAULT 'normal',
  text_color VARCHAR(7) DEFAULT '#000000',
  text_align VARCHAR(20) DEFAULT 'left',
  line_height DECIMAL(3,2) DEFAULT 1.5,
  
  -- Material sample fields
  material_id UUID REFERENCES material_library(id),
  material_sample_image_url VARCHAR(500),
  show_material_name BOOLEAN DEFAULT true,
  show_material_specs BOOLEAN DEFAULT false,
  
  -- Shape fields
  shape_type VARCHAR(20),
  fill_color VARCHAR(7),
  stroke_color VARCHAR(7),
  stroke_width INT,
  
  -- Linking
  linked_scope_item_id UUID,
  linked_color_selection_id UUID,
  linked_material_selection_id UUID,
  
  notes TEXT,
  tags TEXT[] DEFAULT '{}',
  is_locked BOOLEAN DEFAULT false,
  is_visible BOOLEAN DEFAULT true,
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_elements_moodboard ON moodboard_elements(moodboard_id);
CREATE INDEX idx_elements_zindex ON moodboard_elements(moodboard_id, z_index);
```

---

### Step 3.3: Database - Moodboard Shares Table

```sql
CREATE TABLE moodboard_shares (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  moodboard_id UUID NOT NULL REFERENCES moodboards(id) ON DELETE CASCADE,
  share_type VARCHAR(50) NOT NULL,
  platform VARCHAR(50),
  share_url VARCHAR(500),
  short_code VARCHAR(20) UNIQUE,
  password_protected BOOLEAN DEFAULT false,
  password_hash VARCHAR(255),
  expires_at TIMESTAMPTZ,
  recipient_email VARCHAR(255),
  recipient_name VARCHAR(200),
  recipient_type VARCHAR(50),
  export_format VARCHAR(20),
  export_resolution VARCHAR(20),
  export_dimensions JSONB,
  social_caption TEXT,
  social_hashtags TEXT[] DEFAULT '{}',
  posted_url VARCHAR(500),
  view_count INT DEFAULT 0,
  last_viewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

### Step 3.4: Install Additional Dependencies

```bash
# Drag and drop
npm install @dnd-kit/core @dnd-kit/sortable @dnd-kit/utilities

# PDF export (if not installed)
npm install html2canvas jspdf

# Image cropping (optional)
npm install react-easy-crop
```

---

### Step 3.5 - 3.14: Follow Component Build Order

1. **MoodboardElement** (leaf component)
2. **MoodboardCanvas** (container with DnD)
3. **MoodboardToolbar** (actions)
4. **MoodboardElementInspector** (property editor)
5. **MoodboardShareDialog** (export/share)

**Test after each component:**
```bash
npm run build
npm run dev
# Manually test component in browser
```

---

## Epic 4: Integration

**Total Steps:** 6  
**Estimated Time:** 2 days

### Step 4.1: Create Step 4 Page Structure

```bash
# Verify route exists
ls src/app/project/\[id\]/
```

**Create Step 4 tabs if needed:**
```
src/app/project/[id]/step-4/
├── page.tsx              # Main layout with tabs
├── design-style/
│   └── page.tsx
├── color-materials/
│   └── page.tsx
├── moodboard/
│   └── page.tsx
├── modernization/
│   └── page.tsx
└── smart-home/
    └── page.tsx
```

---

### Step 4.2: Wire Design Style Selector

1. Create design style selection UI
2. Save selection to project
3. Trigger color/material recommendations

---

### Step 4.3: Wire Color & Materials Tab

1. Embed `ProjectColorPlanner` component
2. Embed `ProjectMaterialSelector` component
3. Add tabs for each room

---

### Step 4.4: Wire Moodboard Tab

1. Embed `MoodboardCanvas` component
2. Load project's moodboards
3. Enable create/edit/delete

---

### Step 4.5: Cross-Step Data Flow

1. Design selections update Scope Building (Step 5)
2. Scope items link back to design selections
3. Moodboard elements link to selections

---

### Step 4.6: Final Integration Test

```bash
# Full E2E test flow
1. Create new project
2. Complete Step 1-3
3. Enter Step 4
4. Select design style: "Modern Farmhouse"
5. Select colors for Kitchen (walls, cabinets, trim)
6. Select materials (countertop, flooring, backsplash)
7. Create moodboard with color swatches and materials
8. Export moodboard to PDF
9. Go to Step 5 - verify scope items created
10. Complete remaining steps
```

---

## Cross-Epic Dependencies

### Dependency Matrix

| Component | Depends On |
|-----------|------------|
| ColorSwatchGrid | ColorSwatch, types |
| ColorLibraryBrowser | ColorSwatchGrid, API |
| ProjectColorPlanner | ColorLibraryBrowser, Store |
| MaterialGrid | MaterialCard, types |
| MaterialLibraryBrowser | MaterialGrid, API |
| ProjectMaterialSelector | MaterialLibraryBrowser, Store |
| MoodboardElement | ColorSwatch, MaterialCard |
| MoodboardCanvas | MoodboardElement, @dnd-kit |
| Step4Layout | All above components |

### Build Order Summary

```
Week 1:
  Day 1-2: Color System (DB, Types, API)
  Day 3-4: Color System (Store, Components)
  Day 5: Color System (Integration, Testing)

Week 2:
  Day 1-2: Material System (DB, Types, API)
  Day 3: Material System (Store, Components)
  Day 4-5: Material System (Integration, Testing)

Week 3:
  Day 1-2: Moodboard (DB, Types, API)
  Day 3-4: Moodboard (Canvas, Elements)
  Day 5: Moodboard (Export, Share)

Week 4:
  Day 1-2: Step 4 Integration
  Day 3: Cross-Step Data Flow
  Day 4-5: Testing, Polish
```

---

## Rollback Procedures

### Database Rollback

```bash
# List migrations
npx supabase migration list

# Rollback to specific version
npx supabase db reset --version 20250101000000

# Or manually revert
psql -c "DROP TABLE IF EXISTS moodboard_elements CASCADE;"
psql -c "DROP TABLE IF EXISTS moodboards CASCADE;"
```

### Code Rollback

```bash
# Revert last commit
git revert HEAD

# Revert to specific commit
git checkout <commit-hash> -- src/components/design/
```

### Store Reset

```javascript
// In browser console
localStorage.removeItem('design-store')
location.reload()
```

---

## Related Documentation

- [Component Architecture](./COMPONENT_ARCHITECTURE.md) - Component details
- [Data Flow Diagrams](./DATA_FLOW_DIAGRAMS.md) - How data moves
- [Testing Strategy](../testing/TESTING_STRATEGY.md) - Test cases
- [Troubleshooting Guide](../testing/TROUBLESHOOTING_GUIDE.md) - When things break

