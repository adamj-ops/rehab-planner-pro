# EVE-64: What-If Scenario Comparison for Budget Optimization
## Implementation Plan & Workflow Diagram

**Status**: Planning  
**Priority**: Medium  
**Estimated Effort**: 8-12 hours  
**Dependencies**: EVE-61 (Dependency Mapping), EVE-63 (PDF Export)

---

## 🎯 Objective

Enable users to create, save, and compare multiple budget optimization scenarios side-by-side before committing to a final selection. This allows users to explore different budget strategies (Conservative, Optimal ROI, Maximum Value) and make informed decisions.

---

## 📊 Current State Analysis

### What Exists
- ✅ `BudgetOptimizer` class with `optimize()`, `compareOptimizations()`, `suggestBudgetAdjustments()`
- ✅ `BudgetOptimizationDialog` component showing before/after comparison
- ✅ Single optimization application flow
- ✅ Budget suggestions (minimal/optimal/max value)

### What's Missing
- ❌ Scenario persistence/storage
- ❌ Multiple scenario management (create, name, delete, compare)
- ❌ Side-by-side comparison UI
- ❌ Scenario templates (Conservative, Optimal, Maximum Value)
- ❌ Visual comparison charts/tables

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    Step 7: Review Summary                        │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Budget Optimization Card                                │  │
│  │  ┌─────────────────────────────────────────────────────┐  │  │
│  │  │ [Optimize Budget] [Create Scenario] [View Scenarios]│  │  │
│  │  └─────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │  Saved Scenarios List                                     │  │
│  │  • Conservative Budget ($X)                               │  │
│  │  • Optimal ROI ($Y)                                        │  │
│  │  • Maximum Value ($Z)                                      │  │
│  │  [Compare Selected] [Delete]                               │  │
│  └───────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│              Scenario Comparison Dialog                          │
│                                                                   │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐          │
│  │ Conservative │ │   Optimal    │ │ Max Value   │          │
│  │              │ │              │ │             │          │
│  │ Cost: $X     │ │ Cost: $Y     │ │ Cost: $Z    │          │
│  │ Value: 100   │ │ Value: 150   │ │ Value: 200  │          │
│  │ Items: 12    │ │ Items: 18    │ │ Items: 24   │          │
│  │              │ │              │ │             │          │
│  │ [Apply]      │ │ [Apply]      │ │ [Apply]     │          │
│  └──────────────┘ └──────────────┘ └──────────────┘          │
│                                                                   │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │ Comparison Table                                          │  │
│  │ Item Name    │ Conservative │ Optimal │ Max Value │      │  │
│  │ Kitchen      │      ✓       │    ✓    │     ✓     │      │  │
│  │ Bathroom     │      ✓       │    ✓    │     ✓     │      │  │
│  │ Flooring     │      ✗       │    ✓    │     ✓     │      │  │
│  │ ...          │      ...     │   ...    │    ...    │      │  │
│  └───────────────────────────────────────────────────────────┘  │
│                                                                   │
│  [Close] [Export Comparison]                                     │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📋 Data Model

### Scenario Storage Structure

```typescript
// src/types/scenario.ts
export interface BudgetScenario {
  id: string;                    // UUID
  name: string;                  // User-defined name
  description?: string;          // Optional description
  type: 'conservative' | 'optimal' | 'maximum' | 'custom';
  createdAt: Date;
  updatedAt: Date;
  
  // Optimization parameters
  budget: number;
  options: {
    prioritizeMustHaves: boolean;
    respectDependencies: boolean;
    maxItems?: number;
    categoryWeights?: Record<string, number>;
  };
  
  // Result snapshot
  result: {
    selectedItemIds: string[];   // IDs of selected scope items
    totalCost: number;
    totalValue: number;
    itemCount: number;
    budgetUsed: number;
    budgetRemaining: number;
    averageROI: number;
    mustHavesCovered: boolean;
  };
  
  // Metadata
  isDefault?: boolean;           // Pre-defined scenarios
  projectId?: string;            // Link to project (future)
}

// Storage in wizard context
interface WizardData {
  // ... existing fields
  scenarios?: BudgetScenario[];  // Array of saved scenarios
  activeScenarioId?: string;     // Currently applied scenario
}
```

---

## 🔄 User Workflow

### Flow 1: Create New Scenario

```
1. User clicks "Create Scenario" button
   ↓
2. Dialog opens with:
   - Scenario name input
   - Scenario type selector (Conservative/Optimal/Maximum/Custom)
   - Budget input (pre-filled from Step 3)
   - Optimization options checkboxes
   ↓
3. User clicks "Generate Scenario"
   ↓
4. BudgetOptimizer.optimize() runs with selected parameters
   ↓
5. Result preview shown:
   - Total cost
   - Value score
   - Item count
   - Selected items list
   ↓
6. User clicks "Save Scenario"
   ↓
7. Scenario saved to wizardData.scenarios[]
   ↓
8. Success toast + scenario appears in list
```

### Flow 2: Compare Scenarios

```
1. User selects 2-3 scenarios from list (checkboxes)
   ↓
2. Clicks "Compare Selected"
   ↓
3. Comparison dialog opens:
   - Side-by-side scenario cards
   - Comparison table (items included/excluded)
   - Metrics comparison (cost, value, ROI)
   - Visual charts (optional)
   ↓
4. User reviews differences
   ↓
5. User clicks "Apply" on preferred scenario
   ↓
6. Scenario applied to Step 5 scope items
   ↓
7. Dialog closes, Step 7 updates
```

### Flow 3: Quick Apply Template

```
1. User clicks "Create Conservative Scenario"
   ↓
2. System auto-generates:
   - Name: "Conservative Budget"
   - Type: conservative
   - Budget: minimal suggestion from BudgetOptimizer
   - Options: prioritizeMustHaves=true, respectDependencies=true
   ↓
3. Optimization runs automatically
   ↓
4. Scenario saved and applied immediately
   ↓
5. User can compare with other scenarios later
```

---

## 🗂️ File Structure

```
src/
├── types/
│   └── scenario.ts                    # NEW - Scenario types
├── lib/
│   └── scenarios/
│       ├── scenario-manager.ts        # NEW - Scenario CRUD operations
│       ├── scenario-templates.ts       # NEW - Pre-defined scenarios
│       └── index.ts                   # NEW - Exports
├── components/
│   └── wizard/
│       └── steps/
│           ├── scenario-manager.tsx   # NEW - Scenario list & management
│           ├── scenario-dialog.tsx    # NEW - Create/edit scenario
│           ├── scenario-comparison-dialog.tsx  # NEW - Compare scenarios
│           └── review-summary.tsx    # MODIFY - Add scenario UI
└── hooks/
    └── use-scenarios.ts               # NEW - Scenario state management
```

---

## 📝 Implementation Tasks

### Task 1: Create Type Definitions
**File**: `src/types/scenario.ts`

**Steps**:
1. Define `BudgetScenario` interface
2. Define `ScenarioType` union type
3. Define `ScenarioComparison` interface
4. Export all types

**Acceptance Criteria**:
- [ ] All types properly defined
- [ ] Types exported correctly
- [ ] No TypeScript errors

---

### Task 2: Create Scenario Manager Utility
**File**: `src/lib/scenarios/scenario-manager.ts`

**Steps**:
1. Create `ScenarioManager` class with:
   - `createScenario(items, options, name, type)` - Generate and save
   - `updateScenario(id, updates)` - Update scenario metadata
   - `deleteScenario(id)` - Remove scenario
   - `getScenario(id)` - Retrieve single scenario
   - `getAllScenarios()` - Get all scenarios
   - `compareScenarios(scenarioIds)` - Generate comparison data
2. Integrate with `BudgetOptimizer`
3. Handle scenario persistence (localStorage for now, DB later)

**Acceptance Criteria**:
- [ ] All CRUD operations work
- [ ] Scenarios persist across page reloads
- [ ] Comparison logic generates accurate data

---

### Task 3: Create Scenario Templates
**File**: `src/lib/scenarios/scenario-templates.ts`

**Steps**:
1. Define template configurations:
   - `CONSERVATIVE_TEMPLATE`: Minimal budget, prioritize must-haves
   - `OPTIMAL_TEMPLATE`: 80% value target, balanced approach
   - `MAXIMUM_TEMPLATE`: All items, max budget
2. Create `generateTemplateScenario(items, budget, templateType)` function
3. Return pre-configured scenario ready to optimize

**Acceptance Criteria**:
- [ ] Three templates defined
- [ ] Templates generate correct optimization options
- [ ] Easy to extend with more templates

---

### Task 4: Create Scenario Manager Component
**File**: `src/components/wizard/steps/scenario-manager.tsx`

**Steps**:
1. Display list of saved scenarios
2. Show scenario cards with:
   - Name, type badge
   - Cost, value, item count
   - Created date
   - Actions (Compare, Delete, Apply)
3. Add "Create Scenario" button
4. Multi-select checkboxes for comparison
5. "Compare Selected" button (enabled when 2-3 selected)

**UI Mockup**:
```tsx
<Card>
  <CardHeader>
    <CardTitle>Saved Scenarios</CardTitle>
    <Button onClick={handleCreateScenario}>+ Create Scenario</Button>
  </CardHeader>
  <CardContent>
    {scenarios.map(scenario => (
      <ScenarioCard 
        key={scenario.id}
        scenario={scenario}
        onCompare={handleCompare}
        onDelete={handleDelete}
        onApply={handleApply}
        isSelected={selectedIds.has(scenario.id)}
        onToggleSelect={handleToggleSelect}
      />
    ))}
    {selectedIds.size >= 2 && (
      <Button onClick={handleCompareSelected}>
        Compare {selectedIds.size} Scenarios
      </Button>
    )}
  </CardContent>
</Card>
```

**Acceptance Criteria**:
- [ ] Scenarios display correctly
- [ ] Multi-select works
- [ ] Actions trigger correct handlers
- [ ] Empty state shown when no scenarios

---

### Task 5: Create Scenario Dialog Component
**File**: `src/components/wizard/steps/scenario-dialog.tsx`

**Steps**:
1. Form fields:
   - Name input (required)
   - Description textarea (optional)
   - Type selector (Conservative/Optimal/Maximum/Custom)
   - Budget input (pre-filled from Step 3)
   - Optimization options checkboxes
2. Preview section showing:
   - Estimated result (cost, value, items)
   - Selected items preview
3. "Generate Scenario" button
4. "Save Scenario" button (enabled after generation)
5. Loading states during optimization

**Acceptance Criteria**:
- [ ] Form validation works
- [ ] Optimization preview updates correctly
- [ ] Scenario saves successfully
- [ ] Dialog closes and updates parent

---

### Task 6: Create Scenario Comparison Dialog
**File**: `src/components/wizard/steps/scenario-comparison-dialog.tsx`

**Steps**:
1. Side-by-side scenario cards (2-3 columns)
2. Each card shows:
   - Scenario name and type
   - Key metrics (cost, value, items, ROI)
   - "Apply" button
3. Comparison table:
   - Rows: All unique items across scenarios
   - Columns: Each scenario
   - Cells: ✓ (included) or ✗ (excluded)
   - Highlight differences
4. Metrics comparison section:
   - Cost comparison bar chart
   - Value comparison bar chart
   - ROI comparison
5. "Export Comparison" button (PDF/CSV)
6. "Close" button

**Acceptance Criteria**:
- [ ] 2-3 scenarios compare correctly
- [ ] Table shows all items
- [ ] Differences highlighted
- [ ] Apply button works
- [ ] Export works (future)

---

### Task 7: Create useScenarios Hook
**File**: `src/hooks/use-scenarios.ts`

**Steps**:
1. Manage scenario state
2. Integrate with wizard context
3. Provide functions:
   - `scenarios` - Array of scenarios
   - `createScenario()` - Create new
   - `updateScenario()` - Update existing
   - `deleteScenario()` - Delete
   - `compareScenarios()` - Compare 2-3
   - `applyScenario()` - Apply to Step 5
4. Persist to wizardData.scenarios

**Acceptance Criteria**:
- [ ] State management works
- [ ] Persistence works
- [ ] All operations update UI correctly

---

### Task 8: Integrate into Review Summary
**File**: `src/components/wizard/steps/review-summary.tsx`

**Steps**:
1. Import `useScenarios` hook
2. Add "Create Scenario" button next to "Optimize Budget"
3. Add `ScenarioManager` component below Budget Optimization card
4. Update `handleApplyOptimization` to optionally create scenario
5. Show active scenario indicator if one is applied

**Acceptance Criteria**:
- [ ] Scenarios integrate seamlessly
- [ ] UI doesn't feel cluttered
- [ ] All functionality accessible

---

### Task 9: Add Scenario Persistence
**File**: `src/components/wizard/wizard-context.tsx`

**Steps**:
1. Add `scenarios` to `WizardData` type
2. Add `activeScenarioId` to `WizardData`
3. Initialize scenarios from stored data
4. Persist scenarios when updated
5. Load scenarios on wizard init

**Acceptance Criteria**:
- [ ] Scenarios persist across wizard navigation
- [ ] Scenarios persist across page reloads (localStorage)
- [ ] Active scenario persists

---

### Task 10: Testing & Polish
**Files**: All modified files

**Steps**:
1. Test scenario creation flow
2. Test scenario comparison (2 scenarios)
3. Test scenario comparison (3 scenarios)
4. Test scenario deletion
5. Test scenario application
6. Test persistence
7. Add loading states
8. Add error handling
9. Add empty states
10. Polish UI/UX

**Acceptance Criteria**:
- [ ] All flows work end-to-end
- [ ] No console errors
- [ ] Responsive on mobile
- [ ] Accessible (keyboard navigation, screen readers)

---

## 🎨 UI/UX Specifications

### Scenario Card Design
```
┌─────────────────────────────────────────┐
│ Conservative Budget          [Conservative]│
│                                          │
│ 💰 $75,000  │  ⭐ 120  │  📦 12 items   │
│                                          │
│ Created: Dec 30, 2024                   │
│                                          │
│ ☑ Compare  │  [Apply]  │  🗑️ Delete   │
└─────────────────────────────────────────┘
```

### Comparison Dialog Layout
```
┌─────────────────────────────────────────────────────────────┐
│  Compare Scenarios                              [Close] [X] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐    │
│  │ Conservative │  │   Optimal    │  │ Max Value   │    │
│  │              │  │              │  │             │    │
│  │ $75,000     │  │ $95,000     │  │ $120,000    │    │
│  │ Value: 120  │  │ Value: 180  │  │ Value: 240  │    │
│  │ Items: 12   │  │ Items: 18   │  │ Items: 24   │    │
│  │              │  │              │  │             │    │
│  │ [Apply]      │  │ [Apply]      │  │ [Apply]     │    │
│  └──────────────┘  └──────────────┘  └──────────────┘    │
│                                                             │
│  ┌─────────────────────────────────────────────────────┐  │
│  │ Comparison Table                                   │  │
│  │ Item          │ Conservative │ Optimal │ Max Value│  │
│  │─────────────────────────────────────────────────────│  │
│  │ Kitchen       │      ✓       │    ✓    │     ✓    │  │
│  │ Bathroom      │      ✓       │    ✓    │     ✓    │  │
│  │ Flooring      │      ✗       │    ✓    │     ✓    │  │
│  │ Windows       │      ✗       │    ✗    │     ✓    │  │
│  │ ...           │      ...     │   ...    │    ...   │  │
│  └─────────────────────────────────────────────────────┘  │
│                                                             │
│  [Export Comparison]                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## 🔗 Integration Points

### With Existing Components
- **BudgetOptimizer**: Used to generate scenario results
- **BudgetOptimizationDialog**: Can optionally create scenario after optimization
- **ReviewSummary**: Hosts scenario management UI
- **WizardContext**: Stores scenarios in wizardData

### Data Flow
```
User Action
    ↓
ScenarioManager.createScenario()
    ↓
BudgetOptimizer.optimize()
    ↓
Scenario saved to wizardData.scenarios
    ↓
UI updates (ScenarioManager component)
    ↓
Persistence (localStorage/Zustand)
```

---

## 📊 Success Metrics

- [ ] Users can create at least 3 scenarios
- [ ] Comparison dialog loads in < 500ms
- [ ] Scenarios persist across page reloads
- [ ] Zero console errors
- [ ] Mobile-responsive design works

---

## 🚀 Future Enhancements (Out of Scope)

- Database persistence (Supabase)
- Scenario sharing between projects
- Scenario templates marketplace
- AI-generated scenario suggestions
- Scenario version history
- Export comparison to PDF/Excel
- Scenario analytics (which performs best)

---

## 📝 Notes

1. **Persistence**: Start with localStorage/Zustand, upgrade to DB later
2. **Performance**: Limit to 10 scenarios per project initially
3. **Validation**: Ensure scenarios reference valid scope items
4. **Cleanup**: Delete scenarios when scope items change significantly
5. **UX**: Consider auto-naming scenarios (e.g., "Conservative Budget #1")

---

## ✅ Definition of Done

- [ ] Users can create scenarios from Step 7
- [ ] Users can compare 2-3 scenarios side-by-side
- [ ] Users can apply a scenario to update Step 5 scope items
- [ ] Scenarios persist across wizard navigation
- [ ] Scenario management UI is intuitive
- [ ] All code passes linting
- [ ] No TypeScript errors
- [ ] Mobile-responsive
- [ ] Accessible (keyboard navigation, ARIA labels)

---

**Ready for Implementation**: ✅  
**Next Steps**: Create Linear todos, start with Task 1 (Type Definitions)
