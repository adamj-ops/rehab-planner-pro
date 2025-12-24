# Phase 2A Quality Checklist

> **Purpose:** Pre-completion checklist before marking any story, epic, or phase complete. Use this to ensure consistent quality.

---

## Table of Contents

1. [How to Use This Checklist](#how-to-use-this-checklist)
2. [Story Completion Checklist](#story-completion-checklist)
3. [Epic Completion Checklist](#epic-completion-checklist)
4. [Phase Completion Checklist](#phase-completion-checklist)
5. [Epic-Specific Checklists](#epic-specific-checklists)
6. [Accessibility Checklist](#accessibility-checklist)
7. [Performance Checklist](#performance-checklist)

---

## How to Use This Checklist

### Before Starting Work
1. Review the relevant checklist section
2. Understand what "done" means for this work
3. Set up testing environment

### During Development
1. Check items off as you complete them
2. Don't skip items - each exists for a reason
3. If you can't complete an item, document why

### Before Marking Complete
1. Go through entire checklist
2. All items must be checked or have documented exceptions
3. Get review if any items are skipped

---

## Story Completion Checklist

Use for **every user story** before marking it complete.

### Code Quality

- [ ] **No TypeScript errors** - `npm run build` succeeds
- [ ] **No ESLint errors** - `npm run lint` passes
- [ ] **No console errors** - Check browser DevTools
- [ ] **No console warnings** - Check browser DevTools
- [ ] **Code follows project conventions** - Matches existing patterns

### Functionality

- [ ] **Acceptance criteria met** - Every criterion checked
- [ ] **Happy path works** - Primary use case functional
- [ ] **Error handling works** - Errors display appropriately
- [ ] **Loading states work** - Spinners/skeletons show during load
- [ ] **Empty states work** - Appropriate message when no data

### Data Integrity

- [ ] **Data saves correctly** - Check database after action
- [ ] **Data loads correctly** - Refresh page, data persists
- [ ] **Data updates correctly** - Edit works as expected
- [ ] **Data deletes correctly** - Delete removes from DB
- [ ] **No orphaned data** - Related records handled

### Testing

- [ ] **Unit tests written** - For new functions/utils
- [ ] **Component tests written** - For new components
- [ ] **Tests pass** - `npm test` succeeds
- [ ] **Manual testing done** - Tested in browser

### UI/UX

- [ ] **Matches design** - Follows shadcn/ui patterns
- [ ] **Responsive on mobile** - Test at 375px width
- [ ] **Responsive on tablet** - Test at 768px width
- [ ] **Responsive on desktop** - Test at 1280px+ width
- [ ] **Dark mode works** - If applicable
- [ ] **Animations smooth** - No janky transitions

### Documentation

- [ ] **Code commented** - Complex logic explained
- [ ] **Types documented** - JSDoc for public interfaces
- [ ] **README updated** - If new setup required

---

## Epic Completion Checklist

Use for **every epic** before marking it complete.

### All Stories Complete

- [ ] **Story 1 complete** - All story checklist items done
- [ ] **Story 2 complete** - All story checklist items done
- [ ] **Story 3 complete** - All story checklist items done
- [ ] **(Continue for all stories in epic)**

### Integration

- [ ] **Components work together** - No conflicts
- [ ] **Data flows correctly** - Store → API → DB and back
- [ ] **No regressions** - Previous features still work
- [ ] **Navigation works** - Can reach all new pages

### Testing

- [ ] **Integration tests pass** - Feature-level tests
- [ ] **E2E tests pass** - User journey tests
- [ ] **Cross-browser tested** - Chrome, Firefox, Safari
- [ ] **Performance acceptable** - Page loads < 3s

### Documentation

- [ ] **Component architecture updated** - If new components added
- [ ] **API documentation updated** - If new endpoints added
- [ ] **User documentation updated** - If user-facing changes

---

## Phase Completion Checklist

Use before marking **Phase 2A complete**.

### All Epics Complete

- [ ] **Epic 1: Color System** - All stories and epic checklist done
- [ ] **Epic 2: Material Selection** - All stories and epic checklist done
- [ ] **Epic 3: Moodboard Builder** - All stories and epic checklist done
- [ ] **Epic 4: Integration** - All stories and epic checklist done

### System-Wide Quality

- [ ] **Build succeeds** - `npm run build` with no errors
- [ ] **All tests pass** - `npm test` with no failures
- [ ] **No security vulnerabilities** - `npm audit` clean
- [ ] **Dependencies up to date** - No critical updates pending

### Performance

- [ ] **Lighthouse score > 80** - Performance, Accessibility, Best Practices
- [ ] **Core Web Vitals pass** - LCP, FID, CLS within limits
- [ ] **Bundle size acceptable** - No unexpected large imports

### Database

- [ ] **Migrations applied** - All new tables created
- [ ] **Seed data loaded** - Required data present
- [ ] **RLS policies active** - Security enforced
- [ ] **Indexes optimized** - Common queries fast

### Deployment Ready

- [ ] **Environment variables documented** - All new vars listed
- [ ] **Production build works** - `npm run build` succeeds
- [ ] **No development-only code** - No console.log, debug flags
- [ ] **Error tracking configured** - Errors will be captured

---

## Epic-Specific Checklists

### Epic 1: Color System

#### Color Library Browser
- [ ] Colors load from database
- [ ] Search filters colors by name
- [ ] Search filters colors by code
- [ ] Family filter works
- [ ] Room filter works
- [ ] LRV range filter works
- [ ] Popular colors tab works
- [ ] Grid displays at least 50 colors
- [ ] Color detail dialog opens
- [ ] Color detail shows all info (hex, RGB, LRV)

#### Room Color Selector
- [ ] Room list displays correctly
- [ ] Surface selection works (walls, trim, ceiling)
- [ ] Color picker opens for each surface
- [ ] Selected color displays in room
- [ ] Finish selector works
- [ ] Coat number adjustable
- [ ] Primer toggle works
- [ ] Notes field saves

#### Color Palette Generator
- [ ] Primary color selection works
- [ ] Complementary colors generate
- [ ] Analogous colors generate
- [ ] Triadic colors generate
- [ ] Palette saves to project
- [ ] Palette applies to rooms

#### Color-Scope Integration
- [ ] Color selection creates scope item
- [ ] Scope item has correct description
- [ ] Scope item has correct cost
- [ ] Changing color updates scope
- [ ] Deleting color removes scope item

---

### Epic 2: Material Selection

#### Material Catalog Browser
- [ ] Materials load from database
- [ ] Category tabs work (countertops, flooring, etc.)
- [ ] Search filters materials
- [ ] Brand filter works
- [ ] Price range filter works
- [ ] Material detail dialog opens
- [ ] Material images display

#### Room Material Selector
- [ ] Room selection works
- [ ] Application selection works
- [ ] Material picker opens
- [ ] Quantity input works
- [ ] Unit type correct for material
- [ ] Waste factor applied

#### Material Cost Calculator
- [ ] Material cost calculates correctly
- [ ] Labor cost calculates correctly
- [ ] Delivery fee adds correctly
- [ ] Tax calculates correctly
- [ ] Total accurate
- [ ] Budget/Standard/Premium comparison works

#### Material-Scope Integration
- [ ] Material selection creates scope item
- [ ] Scope item has correct costs
- [ ] Changing material updates scope
- [ ] Multiple rooms share material correctly

---

### Epic 3: Moodboard Builder

#### Canvas Foundation
- [ ] Canvas renders at correct size
- [ ] Zoom in/out works
- [ ] Pan works
- [ ] Grid toggle works
- [ ] Snap to grid works
- [ ] Background color changeable

#### Element Library
- [ ] Add text element works
- [ ] Add shape element works
- [ ] Add image element works
- [ ] Add color swatch works
- [ ] Add material sample works

#### Element Manipulation
- [ ] Select element works
- [ ] Move element works
- [ ] Resize element works
- [ ] Rotate element works
- [ ] Delete element works
- [ ] Duplicate element works
- [ ] Bring to front works
- [ ] Send to back works
- [ ] Lock element works

#### Undo/Redo
- [ ] Undo reverts last action
- [ ] Redo restores undone action
- [ ] Keyboard shortcuts work (Ctrl+Z, Ctrl+Shift+Z)
- [ ] History limited to reasonable size

#### Image Upload
- [ ] File picker opens
- [ ] Drag and drop works
- [ ] Image uploads to storage
- [ ] Image displays on canvas
- [ ] Image resizes correctly
- [ ] Invalid file types rejected

#### Export & Share
- [ ] PNG export works
- [ ] JPG export works
- [ ] PDF export works
- [ ] Quality/resolution options work
- [ ] Public link generates
- [ ] Password protection works
- [ ] Link expires correctly
- [ ] View count tracks

---

### Epic 4: Integration

#### Step 4 Layout
- [ ] Tab navigation works
- [ ] Tab state persists
- [ ] Progress indicator accurate
- [ ] Next/Previous step navigation works

#### Design Style Selector
- [ ] All styles display
- [ ] Style selection saves
- [ ] Recommendations update based on style

#### Cross-Step Data Flow
- [ ] Design selections visible in Step 5
- [ ] Scope items link to selections
- [ ] Changes propagate correctly
- [ ] No orphaned data

---

## Accessibility Checklist

### Keyboard Navigation
- [ ] All interactive elements focusable
- [ ] Focus order logical
- [ ] Focus visible (outline)
- [ ] No keyboard traps
- [ ] Escape closes modals/dialogs

### Screen Readers
- [ ] Images have alt text
- [ ] Buttons have accessible names
- [ ] Form inputs have labels
- [ ] Error messages announced
- [ ] Loading states announced
- [ ] Page regions labeled (nav, main, aside)

### Visual
- [ ] Color contrast ratio ≥ 4.5:1 (text)
- [ ] Color contrast ratio ≥ 3:1 (large text, UI)
- [ ] Information not conveyed by color alone
- [ ] Text resizes up to 200%
- [ ] No horizontal scroll at 320px

### Motion
- [ ] Animations respect prefers-reduced-motion
- [ ] No auto-playing video/audio
- [ ] No flashing content

---

## Performance Checklist

### Loading
- [ ] Initial page load < 3 seconds
- [ ] Time to interactive < 5 seconds
- [ ] No layout shift during load
- [ ] Above-fold content prioritized

### Images
- [ ] Images optimized (WebP where supported)
- [ ] Images lazy loaded (below fold)
- [ ] Images properly sized (not oversized)
- [ ] Placeholder/blur shown during load

### JavaScript
- [ ] Code split by route
- [ ] Large dependencies lazy loaded
- [ ] No memory leaks (check DevTools)
- [ ] Event listeners cleaned up

### Network
- [ ] API calls batched where possible
- [ ] Data cached appropriately
- [ ] No duplicate requests
- [ ] Proper error handling for network failures

### Database
- [ ] Queries use indexes
- [ ] No N+1 query problems
- [ ] Pagination implemented for lists
- [ ] Reasonable limits on query results

---

## Quick Reference Card

### Before Every Commit
```
✓ No TypeScript errors
✓ No ESLint errors  
✓ Tests pass
✓ Manual test done
```

### Before Every PR
```
✓ Story checklist complete
✓ Code reviewed self
✓ No console.log statements
✓ Documentation updated
```

### Before Every Deploy
```
✓ Epic checklist complete
✓ Build succeeds
✓ All tests pass
✓ Staging tested
```

---

## Related Documentation

- [Testing Strategy](./TESTING_STRATEGY.md) - How to write and run tests
- [Troubleshooting Guide](./TROUBLESHOOTING_GUIDE.md) - When things fail
- [Integration Sequences](../implementation/INTEGRATION_SEQUENCES.md) - Build order

