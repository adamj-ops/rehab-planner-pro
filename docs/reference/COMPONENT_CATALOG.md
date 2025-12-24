# Phase 2A Component Catalog

> **Purpose:** Quick lookup for all Phase 2A components. Find any component's location, purpose, and status at a glance.

---

## Table of Contents

1. [Color System Components](#color-system-components)
2. [Material System Components](#material-system-components)
3. [Moodboard Components](#moodboard-components)
4. [Shared Components](#shared-components)
5. [Store Hooks](#store-hooks)
6. [Utility Functions](#utility-functions)

---

## Color System Components

| Component | File Path | Status | Purpose |
|-----------|-----------|--------|---------|
| `ColorSwatch` | `src/components/design/color-swatch.tsx` | ✅ Exists | Single color display with optional label |
| `ColorSwatchGrid` | `src/components/design/color-swatch.tsx` | ✅ Exists | Grid of color swatches |
| `ColorLibraryBrowser` | `src/components/design/color-library-browser.tsx` | ✅ Exists | Full color browsing with search/filter |
| `ColorLibrarySheet` | `src/components/design/color-library-browser.tsx` | ✅ Exists | Sheet variant for inline selection |
| `ColorDetailDialog` | `src/components/design/color-detail-dialog.tsx` | ✅ Exists | Full color information modal |
| `ProjectColorPlanner` | `src/components/design/project-color-planner.tsx` | ✅ Exists | Room-by-room color selection |

### ColorSwatch

```typescript
interface ColorSwatchProps {
  color: Color
  size?: 'sm' | 'md' | 'lg' | 'xl'
  selected?: boolean
  showName?: boolean
  showCode?: boolean
  showActions?: boolean
  onClick?: (color: Color) => void
  onFavorite?: (color: Color) => void
  onInfo?: (color: Color) => void
  className?: string
}
```

**Dependencies:**
- `@/types/design` - `Color` type
- `@/components/ui/tooltip`
- `@/components/ui/button`

---

### ColorSwatchGrid

```typescript
interface ColorSwatchGridProps {
  colors: Color[]
  selectedIds?: string[]
  favoriteIds?: string[]
  onSelect?: (color: Color) => void
  onFavorite?: (color: Color) => void
  onInfo?: (color: Color) => void
  columns?: 4 | 6 | 8 | 10
  swatchSize?: 'sm' | 'md' | 'lg'
  showNames?: boolean
  showCodes?: boolean
  className?: string
}
```

**Dependencies:**
- `ColorSwatch`

---

### ColorLibraryBrowser

```typescript
interface ColorLibraryBrowserProps {
  colors: Color[]
  loading?: boolean
  selectedColorIds?: string[]
  favoriteColorIds?: string[]
  onColorSelect?: (color: Color) => void
  onColorFavorite?: (color: Color) => void
  onColorInfo?: (color: Color) => void
  maxSelections?: number
  className?: string
}
```

**Dependencies:**
- `ColorSwatchGrid`
- `@/components/ui/input`
- `@/components/ui/select`
- `@/components/ui/tabs`
- `@/components/ui/scroll-area`

---

### ColorDetailDialog

```typescript
interface ColorDetailDialogProps {
  color: Color | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (color: Color) => void
  onFavorite?: (color: Color) => void
  isFavorite?: boolean
}
```

**Dependencies:**
- `@/components/ui/dialog`
- `@/components/ui/badge`
- `@/components/ui/button`

---

### ProjectColorPlanner

```typescript
interface ProjectColorPlannerProps {
  projectId: string
  onSave?: () => void
}
```

**Dependencies:**
- `ColorLibrarySheet`
- `ColorSwatch`
- `useDesignStore`
- API: `/api/projects/{id}/colors`

---

## Material System Components

| Component | File Path | Status | Purpose |
|-----------|-----------|--------|---------|
| `MaterialCard` | `src/components/design/material-card.tsx` | ✅ Exists | Single material display with image |
| `MaterialGrid` | `src/components/design/material-card.tsx` | ✅ Exists | Grid of material cards |
| `MaterialLibraryBrowser` | `src/components/design/material-library-browser.tsx` | ✅ Exists | Material browsing with filters |
| `MaterialLibrarySheet` | `src/components/design/material-library-browser.tsx` | ✅ Exists | Sheet variant for inline selection |
| `MaterialDetailDialog` | `src/components/design/material-detail-dialog.tsx` | ✅ Exists | Full material information modal |
| `ProjectMaterialSelector` | `src/components/design/project-material-selector.tsx` | ✅ Exists | Room material selection |

### MaterialCard

```typescript
interface MaterialCardProps {
  material: Material
  selected?: boolean
  onSelect?: (material: Material) => void
  onInfo?: (material: Material) => void
  showPrice?: boolean
  showSpecs?: boolean
  className?: string
}
```

**Dependencies:**
- `@/types/design` - `Material` type
- `@/components/ui/card`
- `@/components/ui/badge`
- `next/image`

---

### MaterialLibraryBrowser

```typescript
interface MaterialLibraryBrowserProps {
  materials: Material[]
  loading?: boolean
  selectedMaterialIds?: string[]
  onMaterialSelect?: (material: Material) => void
  onMaterialInfo?: (material: Material) => void
  category?: MaterialType
  maxSelections?: number
  className?: string
}
```

**Dependencies:**
- `MaterialGrid`
- `@/components/ui/input`
- `@/components/ui/select`
- `@/components/ui/tabs`

---

### MaterialDetailDialog

```typescript
interface MaterialDetailDialogProps {
  material: Material | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelect?: (material: Material) => void
}
```

**Dependencies:**
- `@/components/ui/dialog`
- `@/components/ui/badge`
- `@/components/ui/table`
- `next/image`

---

### ProjectMaterialSelector

```typescript
interface ProjectMaterialSelectorProps {
  projectId: string
  roomType?: RoomType
  applications?: string[]
  onSave?: () => void
}
```

**Dependencies:**
- `MaterialLibrarySheet`
- `MaterialCard`
- `useDesignStore`
- API: `/api/materials/selections`

---

## Moodboard Components

| Component | File Path | Status | Purpose |
|-----------|-----------|--------|---------|
| `MoodboardCanvas` | `src/components/design/moodboard-canvas.tsx` | ✅ Exists | Main canvas with DnD |
| `MoodboardElement` | `src/components/design/moodboard-element.tsx` | ✅ Exists | Individual draggable element |
| `MoodboardToolbar` | `src/components/design/moodboard-toolbar.tsx` | ✅ Exists | Top toolbar with actions |
| `MoodboardElementInspector` | `src/components/design/moodboard-element-inspector.tsx` | ✅ Exists | Right panel property editor |
| `MoodboardShareDialog` | `src/components/design/moodboard-share-dialog.tsx` | ✅ Exists | Export and share modal |

### MoodboardCanvas

```typescript
interface MoodboardCanvasProps {
  moodboard: Moodboard
  elements: MoodboardElement[]
  colors?: Color[]
  materials?: Material[]
  selectedElementId?: string | null
  onElementSelect?: (id: string | null) => void
  onElementUpdate?: (id: string, updates: Partial<MoodboardElement>) => void
  onElementDelete?: (id: string) => void
  onElementDuplicate?: (element: MoodboardElement) => void
  onElementCreate?: (type: MoodboardElementType, position: { x: number; y: number }) => void
  onMoodboardUpdate?: (updates: Partial<Moodboard>) => void
  onSave?: () => void
  onExport?: () => void
  onShare?: () => void
  className?: string
}
```

**Dependencies:**
- `MoodboardElement`
- `@dnd-kit/core`
- `@dnd-kit/sortable`
- `@/components/ui/button`
- `@/components/ui/dropdown-menu`
- `@/components/ui/tooltip`

---

### MoodboardElement

```typescript
interface MoodboardElementProps {
  element: MoodboardElementType
  selected?: boolean
  onSelect?: () => void
  onUpdate?: (updates: Partial<MoodboardElementType>) => void
  onDelete?: () => void
  onDuplicate?: () => void
  color?: Color
  material?: Material
  editable?: boolean
  className?: string
}
```

**Element Types:**
- `image` - Image with optional crop
- `color_swatch` - Color swatch with label
- `text` - Editable text block
- `material_sample` - Material image with label
- `shape` - Rectangle, circle, line, arrow

---

### MoodboardToolbar

```typescript
interface MoodboardToolbarProps {
  moodboard: Moodboard
  zoom: number
  showGrid: boolean
  snapToGrid: boolean
  canUndo: boolean
  canRedo: boolean
  onZoomIn: () => void
  onZoomOut: () => void
  onZoomFit: () => void
  onToggleGrid: () => void
  onToggleSnap: () => void
  onUndo: () => void
  onRedo: () => void
  onSave: () => void
  onExport: () => void
  onShare: () => void
  onAddElement: (type: MoodboardElementType) => void
}
```

---

### MoodboardElementInspector

```typescript
interface MoodboardElementInspectorProps {
  element: MoodboardElement | null
  onUpdate: (updates: Partial<MoodboardElement>) => void
  onDelete: () => void
  onDuplicate: () => void
  onBringToFront: () => void
  onSendToBack: () => void
  onLock: () => void
}
```

**Editable Properties:**
- Position (x, y)
- Size (width, height)
- Rotation
- Opacity
- Border (width, color, radius)
- Shadow
- Type-specific properties

---

### MoodboardShareDialog

```typescript
interface MoodboardShareDialogProps {
  moodboard: Moodboard
  open: boolean
  onOpenChange: (open: boolean) => void
  onShare: (options: ShareOptions) => Promise<ShareResult>
}
```

**Export Options:**
- PNG, JPG, PDF
- Resolution: Low, Medium, High, Print
- Public link generation
- Password protection
- Expiration date

---

## Shared Components

| Component | File Path | Status | Purpose |
|-----------|-----------|--------|---------|
| Re-exports | `src/components/design/index.ts` | ✅ Exists | Central export point |

### Import Pattern

```typescript
// Import from index for convenience
import { 
  ColorSwatch, 
  ColorLibraryBrowser,
  MaterialCard,
  MoodboardCanvas 
} from '@/components/design'

// Or import directly for tree-shaking
import { ColorSwatch } from '@/components/design/color-swatch'
```

---

## Store Hooks

| Hook | File Path | Purpose |
|------|-----------|---------|
| `useDesignStore` | `src/stores/design-store.ts` | Main design state store |
| `useSelectedColor` | `src/stores/design-store.ts` | Get currently selected color |
| `useSelectedMaterial` | `src/stores/design-store.ts` | Get currently selected material |
| `useRoomColorSelections` | `src/stores/design-store.ts` | Get colors for specific room |
| `useRoomMaterialSelections` | `src/stores/design-store.ts` | Get materials for specific room |

### useDesignStore

```typescript
// State selection
const colorLibrary = useDesignStore(state => state.colorLibrary)
const loading = useDesignStore(state => state.colorLibraryLoading)

// Actions
const setColorLibrary = useDesignStore(state => state.setColorLibrary)
const addColorSelection = useDesignStore(state => state.addColorSelection)
```

### useSelectedColor

```typescript
// Returns ColorLibraryItem | null
const selectedColor = useSelectedColor()
```

### useRoomColorSelections

```typescript
// Returns ProjectColorSelection[]
const kitchenColors = useRoomColorSelections('kitchen')
const masterBathColors = useRoomColorSelections('bathroom', 'Master Bath')
```

---

## Utility Functions

| Function | File Path | Purpose |
|----------|-----------|---------|
| `hexToHsl` | `src/lib/design/color-harmony.ts` | Convert hex to HSL |
| `hslToHex` | `src/lib/design/color-harmony.ts` | Convert HSL to hex |
| `getComplementaryColor` | `src/lib/design/color-harmony.ts` | Calculate complementary color |
| `getAnalogousColors` | `src/lib/design/color-harmony.ts` | Calculate analogous colors |
| `calculatePaintCoverage` | `src/lib/design/paint-calculations.ts` | Calculate wall area |
| `calculateGallonsNeeded` | `src/lib/design/paint-calculations.ts` | Calculate paint quantity |
| `calculatePaintCost` | `src/lib/design/paint-calculations.ts` | Calculate paint total cost |
| `calculateCountertopQuantity` | `src/lib/design/quantity-calculations.ts` | Calculate countertop sqft |
| `calculateFlooringQuantity` | `src/lib/design/quantity-calculations.ts` | Calculate flooring sqft |
| `syncColorToScope` | `src/lib/design/color-scope-sync.ts` | Sync color selection to scope |
| `syncMaterialToScope` | `src/lib/design/material-scope-sync.ts` | Sync material selection to scope |

---

## Component Status Legend

| Icon | Meaning |
|------|---------|
| ✅ | Component exists and is functional |
| 🚧 | Component exists but needs work |
| ❌ | Component needs to be created |
| ⚠️ | Component has known issues |

---

## Quick Reference: Common Patterns

### Using ColorLibraryBrowser

```tsx
import { ColorLibraryBrowser } from '@/components/design'
import { useDesignStore } from '@/stores/design-store'
import { useEffect } from 'react'

function MyColorPicker() {
  const { colorLibrary, colorLibraryLoading, setColorLibrary } = useDesignStore()
  const [selectedIds, setSelectedIds] = useState<string[]>([])
  
  useEffect(() => {
    async function loadColors() {
      const response = await fetch('/api/colors')
      const data = await response.json()
      setColorLibrary(data.data)
    }
    loadColors()
  }, [])
  
  return (
    <ColorLibraryBrowser
      colors={colorLibrary}
      loading={colorLibraryLoading}
      selectedColorIds={selectedIds}
      onColorSelect={(color) => setSelectedIds([color.id])}
    />
  )
}
```

### Using MoodboardCanvas

```tsx
import { MoodboardCanvas } from '@/components/design'
import { useDesignStore } from '@/stores/design-store'

function MyMoodboard() {
  const {
    activeMoodboard,
    moodboardElements,
    selectedElementId,
    setSelectedElementId,
    updateElement,
    removeElement,
    addElement,
  } = useDesignStore()
  
  if (!activeMoodboard) return null
  
  return (
    <MoodboardCanvas
      moodboard={activeMoodboard}
      elements={moodboardElements}
      selectedElementId={selectedElementId}
      onElementSelect={setSelectedElementId}
      onElementUpdate={updateElement}
      onElementDelete={removeElement}
      onElementCreate={(type, pos) => {
        addElement({
          id: crypto.randomUUID(),
          moodboardId: activeMoodboard.id,
          elementType: type,
          positionX: pos.x,
          positionY: pos.y,
          // ... other defaults
        })
      }}
    />
  )
}
```

---

## Related Documentation

- [Component Architecture](../implementation/COMPONENT_ARCHITECTURE.md) - Detailed component structure
- [API Endpoints](./API_ENDPOINTS.md) - Backend routes
- [Type Definitions](./TYPE_DEFINITIONS_INDEX.md) - TypeScript types

