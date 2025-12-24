# Phase 2A Testing Strategy

> **Purpose:** Ensure testing happens during build, not after. This document defines the testing pyramid, test cases per story, and how to run tests.

---

## Table of Contents

1. [Testing Philosophy](#testing-philosophy)
2. [Testing Pyramid](#testing-pyramid)
3. [Test Configuration](#test-configuration)
4. [Epic 1: Color System Tests](#epic-1-color-system-tests)
5. [Epic 2: Material System Tests](#epic-2-material-system-tests)
6. [Epic 3: Moodboard Builder Tests](#epic-3-moodboard-builder-tests)
7. [Epic 4: Integration Tests](#epic-4-integration-tests)
8. [Mock Data Setup](#mock-data-setup)
9. [Testing Commands Reference](#testing-commands-reference)

---

## Testing Philosophy

### Test During Build, Not After

```
❌ WRONG: Build all features → Test at end → Find bugs → Fix bugs → Delay launch

✅ RIGHT: Build feature → Test feature → Fix immediately → Move to next feature
```

### Test What Matters

1. **Business Logic** - Cost calculations, quantity formulas, sync logic
2. **User Flows** - Can user complete the task?
3. **Data Integrity** - Is data saved correctly?
4. **Edge Cases** - What happens when things go wrong?

### Don't Test

- Library internals (shadcn/ui components work)
- Supabase SDK (assume it works)
- CSS styling (unless layout breaks functionality)

---

## Testing Pyramid

```
                    ┌─────────┐
                    │  E2E    │ 10%
                    │  Tests  │ Playwright
                    ├─────────┤
                    │         │
               ┌────┤ Integr- │ 30%
               │    │  ation  │ RTL + API
               │    ├─────────┤
               │    │         │
               │    │         │
          ┌────┴────┤  Unit   │ 60%
          │         │  Tests  │ Vitest
          │         └─────────┘
          │
    Fast, Cheap, Many ──────────────────► Slow, Expensive, Few
```

### Test Distribution

| Test Type | Coverage | Tools | Run Frequency |
|-----------|----------|-------|---------------|
| Unit | 60% | Vitest | Every save (watch mode) |
| Integration | 30% | RTL + MSW | Pre-commit |
| E2E | 10% | Playwright | Pre-deploy |

---

## Test Configuration

### Vitest Setup

**File:** `vitest.config.ts`

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/**/*.{test,spec}.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html'],
      exclude: [
        'node_modules/',
        'src/__tests__/',
        '**/*.d.ts',
        '**/*.stories.tsx',
      ],
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Test Setup File

**File:** `src/__tests__/setup.ts`

```typescript
import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock next/navigation
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
  }),
  useParams: () => ({}),
  useSearchParams: () => new URLSearchParams(),
}))

// Mock Supabase client
vi.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    from: () => ({
      select: vi.fn().mockReturnThis(),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      delete: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn(),
    }),
    auth: {
      getUser: vi.fn(),
    },
  }),
}))
```

---

## Epic 1: Color System Tests

### Unit Tests

**File:** `src/__tests__/lib/color-harmony.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  hexToHsl,
  hslToHex,
  getComplementaryColor,
  getAnalogousColors,
  getTriadicColors,
} from '@/lib/design/color-harmony'

describe('Color Harmony Calculations', () => {
  describe('hexToHsl', () => {
    it('converts white correctly', () => {
      const result = hexToHsl('#FFFFFF')
      expect(result).toEqual({ h: 0, s: 0, l: 100 })
    })

    it('converts pure red correctly', () => {
      const result = hexToHsl('#FF0000')
      expect(result).toEqual({ h: 0, s: 100, l: 50 })
    })

    it('handles lowercase hex', () => {
      const result = hexToHsl('#ff0000')
      expect(result.h).toBe(0)
    })
  })

  describe('getComplementaryColor', () => {
    it('returns opposite hue', () => {
      const primary = { h: 0, s: 100, l: 50 } // Red
      const complement = getComplementaryColor(primary)
      expect(complement.h).toBe(180) // Cyan
    })

    it('wraps around 360', () => {
      const primary = { h: 270, s: 100, l: 50 }
      const complement = getComplementaryColor(primary)
      expect(complement.h).toBe(90)
    })
  })

  describe('getAnalogousColors', () => {
    it('returns two colors ±30 degrees', () => {
      const primary = { h: 180, s: 50, l: 50 }
      const analogous = getAnalogousColors(primary)
      
      expect(analogous).toHaveLength(2)
      expect(analogous[0].h).toBe(150)
      expect(analogous[1].h).toBe(210)
    })
  })
})
```

**File:** `src/__tests__/lib/paint-calculations.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculatePaintCoverage,
  calculateGallonsNeeded,
  calculatePaintCost,
} from '@/lib/design/paint-calculations'

describe('Paint Calculations', () => {
  describe('calculatePaintCoverage', () => {
    it('calculates wall area correctly', () => {
      // 10x12 room, 8ft ceiling
      const sqft = calculatePaintCoverage({
        length: 10,
        width: 12,
        height: 8,
      })
      // Perimeter = 44ft, Area = 44 * 8 = 352 sqft
      expect(sqft).toBe(352)
    })

    it('subtracts window and door openings', () => {
      const sqft = calculatePaintCoverage({
        length: 10,
        width: 12,
        height: 8,
        windows: 2, // 15 sqft each
        doors: 1,   // 20 sqft each
      })
      // 352 - 30 - 20 = 302
      expect(sqft).toBe(302)
    })
  })

  describe('calculateGallonsNeeded', () => {
    it('calculates with default coverage rate', () => {
      // 400 sqft / 400 sqft per gallon = 1 gallon
      const gallons = calculateGallonsNeeded(400)
      expect(gallons).toBe(1)
    })

    it('rounds up to nearest gallon', () => {
      const gallons = calculateGallonsNeeded(450)
      expect(gallons).toBe(2) // Rounds up from 1.125
    })

    it('accounts for number of coats', () => {
      const gallons = calculateGallonsNeeded(400, { coats: 2 })
      expect(gallons).toBe(2)
    })

    it('adds waste factor', () => {
      const gallons = calculateGallonsNeeded(400, { wasteFactor: 1.1 })
      expect(gallons).toBe(2) // 1.1 gallons rounds to 2
    })
  })

  describe('calculatePaintCost', () => {
    it('calculates total with labor', () => {
      const cost = calculatePaintCost({
        gallons: 2,
        pricePerGallon: 50,
        sqft: 800,
        laborRatePerSqft: 1.5,
      })
      
      expect(cost.materialCost).toBe(100)  // 2 * $50
      expect(cost.laborCost).toBe(1200)    // 800 * $1.50
      expect(cost.totalCost).toBe(1300)
    })
  })
})
```

### Component Tests

**File:** `src/__tests__/components/ColorSwatch.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ColorSwatch } from '@/components/design/color-swatch'
import { mockColor } from '../mocks/colors'

describe('ColorSwatch', () => {
  it('renders color with correct background', () => {
    render(<ColorSwatch color={mockColor} />)
    
    const swatch = screen.getByRole('button')
    expect(swatch).toHaveStyle({ backgroundColor: mockColor.hexCode })
  })

  it('displays color name when showName is true', () => {
    render(<ColorSwatch color={mockColor} showName />)
    
    expect(screen.getByText(mockColor.colorName)).toBeInTheDocument()
  })

  it('displays color code when showCode is true', () => {
    render(<ColorSwatch color={mockColor} showCode />)
    
    expect(screen.getByText(mockColor.colorCode)).toBeInTheDocument()
  })

  it('calls onClick with color when clicked', () => {
    const handleClick = vi.fn()
    render(<ColorSwatch color={mockColor} onClick={handleClick} />)
    
    fireEvent.click(screen.getByRole('button'))
    
    expect(handleClick).toHaveBeenCalledWith(mockColor)
  })

  it('shows selected state', () => {
    render(<ColorSwatch color={mockColor} selected />)
    
    const swatch = screen.getByRole('button')
    expect(swatch).toHaveClass('ring-2') // Or whatever selected class
  })
})
```

**File:** `src/__tests__/components/ColorLibraryBrowser.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ColorLibraryBrowser } from '@/components/design/color-library-browser'
import { mockColors } from '../mocks/colors'

describe('ColorLibraryBrowser', () => {
  it('renders all colors in grid', () => {
    render(<ColorLibraryBrowser colors={mockColors} />)
    
    expect(screen.getAllByRole('button')).toHaveLength(mockColors.length)
  })

  it('filters colors by search', async () => {
    const user = userEvent.setup()
    render(<ColorLibraryBrowser colors={mockColors} />)
    
    const searchInput = screen.getByPlaceholderText(/search/i)
    await user.type(searchInput, 'Pure White')
    
    await waitFor(() => {
      expect(screen.getByText('Pure White')).toBeInTheDocument()
      expect(screen.queryByText('Iron Ore')).not.toBeInTheDocument()
    })
  })

  it('filters colors by family', async () => {
    const user = userEvent.setup()
    render(<ColorLibraryBrowser colors={mockColors} />)
    
    const familySelect = screen.getByRole('combobox', { name: /family/i })
    await user.click(familySelect)
    await user.click(screen.getByText('Grays'))
    
    await waitFor(() => {
      expect(screen.getByText('Repose Gray')).toBeInTheDocument()
      expect(screen.queryByText('Pure White')).not.toBeInTheDocument()
    })
  })

  it('shows loading state', () => {
    render(<ColorLibraryBrowser colors={[]} loading />)
    
    expect(screen.getByRole('status')).toBeInTheDocument() // Spinner
  })

  it('calls onColorSelect when color clicked', async () => {
    const handleSelect = vi.fn()
    const user = userEvent.setup()
    
    render(
      <ColorLibraryBrowser 
        colors={mockColors} 
        onColorSelect={handleSelect} 
      />
    )
    
    await user.click(screen.getByText('Pure White'))
    
    expect(handleSelect).toHaveBeenCalledWith(
      expect.objectContaining({ colorName: 'Pure White' })
    )
  })
})
```

### Integration Tests

**File:** `src/__tests__/integration/color-selection-flow.test.tsx`

```typescript
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ProjectColorPlanner } from '@/components/design/project-color-planner'
import { useDesignStore } from '@/stores/design-store'
import { server } from '../mocks/server'
import { http, HttpResponse } from 'msw'

describe('Color Selection Flow', () => {
  beforeEach(() => {
    useDesignStore.getState().resetDesignState()
  })

  it('completes full color selection flow', async () => {
    const user = userEvent.setup()
    
    render(<ProjectColorPlanner projectId="test-project-123" />)
    
    // 1. Select room
    await user.click(screen.getByText('Kitchen'))
    
    // 2. Select surface
    await user.click(screen.getByText('Walls'))
    
    // 3. Open color picker
    await user.click(screen.getByText('Choose Color'))
    
    // 4. Select color
    await user.click(screen.getByText('Pure White'))
    
    // 5. Verify selection displayed
    await waitFor(() => {
      expect(screen.getByText(/Pure White/)).toBeInTheDocument()
      expect(screen.getByText(/SW 7005/)).toBeInTheDocument()
    })
    
    // 6. Verify store updated
    const state = useDesignStore.getState()
    expect(state.projectColorSelections).toHaveLength(1)
    expect(state.projectColorSelections[0].colorId).toBeDefined()
  })

  it('syncs color selection to scope', async () => {
    const user = userEvent.setup()
    
    // Mock the scope sync endpoint
    let scopeItemCreated = false
    server.use(
      http.post('/api/color-selections', () => {
        scopeItemCreated = true
        return HttpResponse.json({ 
          success: true,
          scopeItemId: 'scope-123' 
        })
      })
    )
    
    render(<ProjectColorPlanner projectId="test-project-123" />)
    
    // Select color
    await user.click(screen.getByText('Kitchen'))
    await user.click(screen.getByText('Walls'))
    await user.click(screen.getByText('Choose Color'))
    await user.click(screen.getByText('Pure White'))
    
    // Save
    await user.click(screen.getByText('Save'))
    
    await waitFor(() => {
      expect(scopeItemCreated).toBe(true)
    })
  })
})
```

---

## Epic 2: Material System Tests

### Unit Tests

**File:** `src/__tests__/lib/quantity-calculations.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateCountertopQuantity,
  calculateFlooringQuantity,
  calculateTileQuantity,
  calculateBacksplashQuantity,
  calculateHardwareQuantity,
} from '@/lib/design/quantity-calculations'

describe('Quantity Calculations', () => {
  describe('calculateCountertopQuantity', () => {
    it('calculates with waste factor', () => {
      const result = calculateCountertopQuantity({
        linearFeet: 25,
        corners: 0,
      })
      // 25 * 1.10 = 27.5, rounded to 28
      expect(result.quantity).toBe(28)
      expect(result.unit).toBe('sqft')
    })

    it('adds extra for corners', () => {
      const result = calculateCountertopQuantity({
        linearFeet: 25,
        corners: 2,
      })
      // (25 + 2*2) * 1.10 = 31.9, rounded to 32
      expect(result.quantity).toBe(32)
    })
  })

  describe('calculateFlooringQuantity', () => {
    it('applies correct waste factor for LVP', () => {
      const result = calculateFlooringQuantity({
        sqft: 100,
        materialType: 'lvp',
      })
      // 100 * 1.05 = 105
      expect(result.quantity).toBe(105)
    })

    it('applies higher waste for tile', () => {
      const result = calculateFlooringQuantity({
        sqft: 100,
        materialType: 'tile',
      })
      // 100 * 1.10 = 110
      expect(result.quantity).toBe(110)
    })

    it('applies highest waste for hardwood', () => {
      const result = calculateFlooringQuantity({
        sqft: 100,
        materialType: 'hardwood',
      })
      // 100 * 1.07 = 107
      expect(result.quantity).toBe(107)
    })
  })

  describe('calculateTileQuantity', () => {
    it('varies by layout complexity', () => {
      const straight = calculateTileQuantity({ sqft: 100, layout: 'straight' })
      const diagonal = calculateTileQuantity({ sqft: 100, layout: 'diagonal' })
      const herringbone = calculateTileQuantity({ sqft: 100, layout: 'herringbone' })
      
      expect(straight.quantity).toBe(110)   // 10% waste
      expect(diagonal.quantity).toBe(115)   // 15% waste
      expect(herringbone.quantity).toBe(120) // 20% waste
    })
  })

  describe('calculateHardwareQuantity', () => {
    it('calculates pulls for doors and drawers', () => {
      const result = calculateHardwareQuantity({
        doors: 20,
        drawers: 10,
        pullsPerDoor: 1,
        pullsPerDrawer: 1,
      })
      expect(result.quantity).toBe(30)
    })

    it('accounts for double pulls on wide drawers', () => {
      const result = calculateHardwareQuantity({
        doors: 20,
        drawers: 10,
        pullsPerDoor: 1,
        pullsPerDrawer: 2,
      })
      expect(result.quantity).toBe(40)
    })
  })
})
```

**File:** `src/__tests__/lib/material-cost-calculations.test.ts`

```typescript
import { describe, it, expect } from 'vitest'
import {
  calculateMaterialCost,
  calculateInstallationCost,
  calculateTotalMaterialCost,
} from '@/lib/design/material-cost-calculations'

describe('Material Cost Calculations', () => {
  describe('calculateMaterialCost', () => {
    it('calculates based on quantity and unit price', () => {
      const cost = calculateMaterialCost({
        quantity: 32,
        pricePerUnit: 85,
      })
      expect(cost).toBe(2720)
    })
  })

  describe('calculateInstallationCost', () => {
    it('uses correct rate for countertops', () => {
      const cost = calculateInstallationCost({
        category: 'countertop',
        quantity: 32,
        materialType: 'quartz',
      })
      // 32 sqft * $45/sqft = $1440
      expect(cost).toBe(1440)
    })

    it('uses correct rate for flooring', () => {
      const cost = calculateInstallationCost({
        category: 'flooring',
        quantity: 800,
        materialType: 'lvp',
      })
      // 800 sqft * $3.50/sqft = $2800
      expect(cost).toBe(2800)
    })
  })

  describe('calculateTotalMaterialCost', () => {
    it('combines material, labor, and delivery', () => {
      const result = calculateTotalMaterialCost({
        materialCost: 2720,
        laborCost: 1440,
        deliveryFee: 150,
        taxRate: 0.07,
      })
      
      expect(result.subtotal).toBe(4310)
      expect(result.tax).toBeCloseTo(301.7)
      expect(result.total).toBeCloseTo(4611.7)
    })
  })
})
```

---

## Epic 3: Moodboard Builder Tests

### Unit Tests

**File:** `src/__tests__/stores/moodboard-undo-redo.test.ts`

```typescript
import { describe, it, expect, beforeEach } from 'vitest'
import { useDesignStore } from '@/stores/design-store'

describe('Moodboard Undo/Redo', () => {
  beforeEach(() => {
    useDesignStore.getState().resetDesignState()
  })

  it('saves history snapshot before changes', () => {
    const { saveHistorySnapshot, addElement, moodboardHistory } = useDesignStore.getState()
    
    saveHistorySnapshot()
    addElement({ id: '1', elementType: 'text', positionX: 0, positionY: 0 })
    
    expect(useDesignStore.getState().moodboardHistory.length).toBe(1)
  })

  it('undoes last action', () => {
    const store = useDesignStore.getState()
    
    // Add element
    store.saveHistorySnapshot()
    store.addElement({ id: '1', elementType: 'text', positionX: 0, positionY: 0 })
    
    // Undo
    store.undo()
    
    expect(useDesignStore.getState().moodboardElements).toHaveLength(0)
  })

  it('redoes undone action', () => {
    const store = useDesignStore.getState()
    
    store.saveHistorySnapshot()
    store.addElement({ id: '1', elementType: 'text', positionX: 0, positionY: 0 })
    store.undo()
    store.redo()
    
    expect(useDesignStore.getState().moodboardElements).toHaveLength(1)
  })

  it('canUndo returns correct value', () => {
    const store = useDesignStore.getState()
    
    expect(store.canUndo()).toBe(false)
    
    store.saveHistorySnapshot()
    store.addElement({ id: '1', elementType: 'text', positionX: 0, positionY: 0 })
    
    expect(useDesignStore.getState().canUndo()).toBe(true)
  })

  it('limits history to 50 snapshots', () => {
    const store = useDesignStore.getState()
    
    // Add 60 elements
    for (let i = 0; i < 60; i++) {
      store.saveHistorySnapshot()
      store.addElement({ id: String(i), elementType: 'text', positionX: i, positionY: 0 })
    }
    
    expect(useDesignStore.getState().moodboardHistory.length).toBeLessThanOrEqual(50)
  })
})
```

### Component Tests

**File:** `src/__tests__/components/MoodboardElement.test.tsx`

```typescript
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MoodboardElement } from '@/components/design/moodboard-element'
import { mockTextElement, mockColorSwatchElement, mockImageElement } from '../mocks/moodboard'

describe('MoodboardElement', () => {
  describe('Text Element', () => {
    it('renders text content', () => {
      render(<MoodboardElement element={mockTextElement} />)
      expect(screen.getByText(mockTextElement.textContent)).toBeInTheDocument()
    })

    it('applies text styling', () => {
      render(<MoodboardElement element={mockTextElement} />)
      const text = screen.getByText(mockTextElement.textContent)
      expect(text).toHaveStyle({
        fontSize: `${mockTextElement.fontSize}px`,
        fontFamily: mockTextElement.fontFamily,
      })
    })
  })

  describe('Color Swatch Element', () => {
    it('renders color with correct background', () => {
      const mockColor = { hexCode: '#F2EEE5', colorName: 'Pure White' }
      render(
        <MoodboardElement 
          element={mockColorSwatchElement} 
          color={mockColor}
        />
      )
      
      const swatch = screen.getByTestId('color-swatch')
      expect(swatch).toHaveStyle({ backgroundColor: '#F2EEE5' })
    })

    it('shows color name when enabled', () => {
      const mockColor = { hexCode: '#F2EEE5', colorName: 'Pure White' }
      const element = { ...mockColorSwatchElement, showColorName: true }
      
      render(<MoodboardElement element={element} color={mockColor} />)
      expect(screen.getByText('Pure White')).toBeInTheDocument()
    })
  })

  describe('Selection', () => {
    it('shows selection indicator when selected', () => {
      render(<MoodboardElement element={mockTextElement} selected />)
      expect(screen.getByTestId('element-container')).toHaveClass('ring-2')
    })

    it('calls onSelect when clicked', () => {
      const handleSelect = vi.fn()
      render(<MoodboardElement element={mockTextElement} onSelect={handleSelect} />)
      
      fireEvent.click(screen.getByTestId('element-container'))
      expect(handleSelect).toHaveBeenCalled()
    })
  })
})
```

---

## Epic 4: Integration Tests

### E2E Test Scenarios

**File:** `e2e/design-workflow.spec.ts` (Playwright)

```typescript
import { test, expect } from '@playwright/test'

test.describe('Design Workflow', () => {
  test.beforeEach(async ({ page }) => {
    // Login and navigate to project
    await page.goto('/auth')
    await page.fill('[name="email"]', 'test@example.com')
    await page.fill('[name="password"]', 'password123')
    await page.click('button[type="submit"]')
    await page.waitForURL('/dashboard')
    
    // Go to test project
    await page.click('text=Test Project')
    await page.click('text=Step 4: Design')
  })

  test('complete color selection for kitchen', async ({ page }) => {
    // Select Kitchen room
    await page.click('text=Kitchen')
    await page.click('text=Walls')
    
    // Open color picker
    await page.click('button:has-text("Choose Color")')
    
    // Search and select
    await page.fill('[placeholder="Search colors"]', 'Pure White')
    await page.click('.color-swatch:has-text("Pure White")')
    
    // Verify selection
    await expect(page.locator('.selected-color')).toContainText('Pure White')
    await expect(page.locator('.selected-color')).toContainText('SW 7005')
    
    // Save
    await page.click('button:has-text("Save")')
    await expect(page.locator('.toast-success')).toBeVisible()
  })

  test('create and export moodboard', async ({ page }) => {
    // Navigate to moodboard tab
    await page.click('text=Moodboard')
    
    // Create new moodboard
    await page.click('button:has-text("New Moodboard")')
    await page.fill('[name="name"]', 'Kitchen Vision')
    await page.click('button:has-text("Create")')
    
    // Add color swatch
    await page.click('button:has-text("Add")')
    await page.click('text=Color Swatch')
    await page.click('.color-swatch:has-text("Pure White")')
    
    // Add text
    await page.click('button:has-text("Add")')
    await page.click('text=Text')
    await page.fill('.text-element-input', 'Modern Farmhouse Kitchen')
    
    // Export to PDF
    await page.click('button:has-text("Export")')
    await page.click('text=Download PDF')
    
    // Verify download starts
    const download = await page.waitForEvent('download')
    expect(download.suggestedFilename()).toContain('.pdf')
  })

  test('design selections appear in scope', async ({ page }) => {
    // Make selections in Step 4
    await page.click('text=Kitchen')
    await page.click('text=Walls')
    await page.click('button:has-text("Choose Color")')
    await page.click('.color-swatch:has-text("Pure White")')
    await page.click('button:has-text("Save")')
    
    // Navigate to Step 5
    await page.click('text=Step 5: Scope')
    
    // Verify scope item exists
    await expect(page.locator('.scope-item')).toContainText('Paint Kitchen Walls')
    await expect(page.locator('.scope-item')).toContainText('Pure White')
  })
})
```

---

## Mock Data Setup

### Color Mocks

**File:** `src/__tests__/mocks/colors.ts`

```typescript
import type { ColorLibraryItem } from '@/types/design'

export const mockColor: ColorLibraryItem = {
  id: 'color-1',
  brand: 'Sherwin Williams',
  colorCode: 'SW 7005',
  colorName: 'Pure White',
  hexCode: '#F2EEE5',
  rgbValues: { r: 242, g: 238, b: 229 },
  lrv: 84,
  undertones: ['neutral'],
  colorFamily: 'white',
  finishOptions: ['flat', 'eggshell', 'satin', 'semi-gloss'],
  recommendedRooms: ['kitchen', 'living_room', 'bedroom'],
  designStyles: ['modern', 'farmhouse', 'transitional'],
  imageUrl: null,
  popular: true,
  yearIntroduced: null,
  isActive: true,
  createdAt: new Date(),
  updatedAt: new Date(),
}

export const mockColors: ColorLibraryItem[] = [
  mockColor,
  {
    ...mockColor,
    id: 'color-2',
    colorCode: 'SW 7015',
    colorName: 'Repose Gray',
    hexCode: '#C2BCB0',
    lrv: 58,
    colorFamily: 'gray',
  },
  {
    ...mockColor,
    id: 'color-3',
    colorCode: 'SW 7069',
    colorName: 'Iron Ore',
    hexCode: '#4A4845',
    lrv: 6,
    colorFamily: 'black',
  },
]
```

### MSW Server Setup

**File:** `src/__tests__/mocks/server.ts`

```typescript
import { setupServer } from 'msw/node'
import { handlers } from './handlers'

export const server = setupServer(...handlers)
```

**File:** `src/__tests__/mocks/handlers.ts`

```typescript
import { http, HttpResponse } from 'msw'
import { mockColors } from './colors'

export const handlers = [
  // GET colors
  http.get('/api/colors', () => {
    return HttpResponse.json({
      data: mockColors,
      total: mockColors.length,
      page: 1,
      limit: 50,
      hasMore: false,
    })
  }),

  // POST color selection
  http.post('/api/color-selections', async ({ request }) => {
    const body = await request.json()
    return HttpResponse.json({
      id: 'selection-1',
      ...body,
      createdAt: new Date().toISOString(),
    })
  }),

  // GET moodboards
  http.get('/api/moodboards', () => {
    return HttpResponse.json({
      data: [],
      total: 0,
    })
  }),
]
```

---

## Testing Commands Reference

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

```bash
npm test -- --watch
```

### Run Specific Test File

```bash
npm test -- src/__tests__/lib/color-harmony.test.ts
```

### Run Tests Matching Pattern

```bash
npm test -- --grep "Color"
```

### Run with Coverage

```bash
npm test -- --coverage
```

### Run E2E Tests

```bash
npx playwright test
```

### Run E2E Tests with UI

```bash
npx playwright test --ui
```

### Update Snapshots

```bash
npm test -- --update
```

### Debug Test

```bash
npm test -- --inspect-brk
```

---

## Test Checklist Per Story

Before marking any story complete:

- [ ] Unit tests written and passing
- [ ] Integration tests written and passing
- [ ] Manual testing completed
- [ ] Edge cases tested:
  - [ ] Empty state
  - [ ] Loading state
  - [ ] Error state
  - [ ] Maximum values
  - [ ] Invalid inputs
- [ ] Mobile responsiveness verified
- [ ] Accessibility tested (keyboard nav, screen reader)

---

## Related Documentation

- [Quality Checklist](./QUALITY_CHECKLIST.md) - Pre-completion verification
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) - When tests fail
- [Component Architecture](../implementation/COMPONENT_ARCHITECTURE.md) - What to test

