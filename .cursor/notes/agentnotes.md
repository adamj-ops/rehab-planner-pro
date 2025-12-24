# Rehab Planner Pro - Agent Notes

## Project Overview
**Project Name**: Rehab Planner Pro (formerly Strategic Rehab Estimator)  
**Type**: Fix & Flip Real Estate Investment Analysis Tool  
**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui (Mira theme), Supabase, Zustand  
**Repository**: https://github.com/adamj-ops/rehab-planner-pro  
**Status**: Phase 2A Design Intelligence - UI Complete

---

## Current Project State (Updated Dec 23, 2024)

### ✅ Recently Completed: Mira Theme Implementation

The application now uses a custom **Mira shadcn/ui theme** with the following configuration:

| Setting | Value | Details |
|---------|-------|---------|
| **Style** | new-york (CLI) / Mira (visual) | Closest shadcn CLI option to Mira |
| **Base Color** | zinc | Cool gray tones |
| **Primary Color** | blue (OKLCH) | Accent/primary color |
| **Border Radius** | 0.375rem | Subtle polish |
| **Icon Library** | @tabler/icons-react | NOT lucide-react |
| **Font** | Roboto + Roboto Mono | Via next/font/google |
| **Dark Mode** | Full support | Deep contrast with card pop |

#### Theme Files
- `components.json` - shadcn/ui configuration
- `src/app/globals.css` - CSS variables (OKLCH colors)
- `src/app/layout.tsx` - Font imports and application
- `src/lib/icons.ts` - Centralized Tabler icon exports

#### Dark Mode Contrast Hierarchy
```
Layer 1 (Bottom): Page Background = 0.09 OKLCH (very dark)
Layer 2 (Middle): Cards = 0.18 OKLCH (medium dark - pops!)
Layer 3 (Top):    Text = Zinc-50 (bright)
```

---

## Application Structure

### Route Groups
```
/app
  /(app)               # Main application with sidebar
    /dashboard         # Dashboard overview
    /projects          # Project listing
    /wizard            # 7-step project creation wizard
      /step-1          # Property Details
      /step-2          # Condition Assessment
      /step-3          # Strategy Selection
      /step-4          # Design Intelligence (tabbed)
        /color         # Color selection
        /materials     # Material selection
        /moodboard     # Moodboard builder
      /step-5          # Priority Matrix
      /step-6          # Action Plan
      /step-7          # Final Review
    /test-theme        # Theme verification page
  /(dashboard)         # Legacy dashboard layout
  /api                 # API routes
  /auth                # Authentication pages
```

### Key Components
- `src/components/app-sidebar.tsx` - Main navigation sidebar
- `src/components/wizard/step-navigation.tsx` - Wizard step indicators
- `src/components/wizard/wizard-footer.tsx` - Navigation buttons
- `src/components/design/ColorLibrary/` - Color selection components
- `src/components/ui/` - shadcn/ui components (themed)

---

## Phase 2A: Design Intelligence

### Features Implemented
1. **Color Library Browser** - Sherwin Williams colors with search/filter
2. **Material Library Browser** - Flooring, countertops, fixtures
3. **Moodboard Builder** - Drag-and-drop design board with sharing

### Database Schema (Supabase)
Tables created via migration `20250101000000_phase_2a_initial.sql`:
- `color_library` - Sherwin Williams color data
- `project_color_selections` - Project-specific colors
- `material_library` - Materials with categories
- `project_material_selections` - Project materials
- `color_palettes` - Saved color schemes
- `moodboards` - Moodboard metadata
- `moodboard_elements` - Individual elements
- `moodboard_shares` - Sharing configuration

### TypeScript Types
Location: `src/types/database.ts`
- All Phase 2A table interfaces
- Enums for element_type, surface_type, status
- Utility types for common patterns

---

## Environment Variables

```env
# .env.local (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key (optional)
```

---

## Development Commands

```bash
# Start development server
npm run dev

# Build for production
npm run build

# Lint code
npm run lint

# Generate Supabase types
npx supabase gen types typescript --project-id <id> > src/types/supabase.ts
```

---

## Critical Icon Usage

**ALWAYS use Tabler icons, NOT Lucide:**
```typescript
// ❌ WRONG
import { Home, Settings } from 'lucide-react'

// ✅ CORRECT
import { IconHome, IconSettings } from '@/lib/icons'
// or
import { IconHome, IconSettings } from '@tabler/icons-react'
```

---

## Key Design Decisions

1. **Tailwind v4**: Uses CSS-based config in `globals.css`, no `tailwind.config.ts`
2. **OKLCH Colors**: All colors use OKLCH for better perceptual uniformity
3. **Route Groups**: `(app)` for sidebar layout, `(dashboard)` for legacy
4. **Sidebar-07**: Using shadcn's sidebar-07 template for navigation
5. **Wizard Pattern**: 7-step horizontal navigation for project creation
6. **Supabase MCP**: Direct database access via MCP for development

---

## Documentation Locations

| Type | Location |
|------|----------|
| Product Requirements | `docs/PRD.md` |
| Database Schema | `docs/DATABASE_SCHEMA_COMPLETE.sql` |
| Expansion Plan | `docs/REFINED_EXPANSION_PLAN.md` |
| Component Architecture | `docs/implementation/COMPONENT_ARCHITECTURE.md` |
| Testing Strategy | `docs/testing/TESTING_STRATEGY.md` |
| API Endpoints | `docs/reference/API_ENDPOINTS.md` |

---

## Common Issues & Solutions

### Hydration Errors
Browser extensions (like Cursor IDE) can cause hydration mismatches. These are harmless in development.

### Font Issues
If fonts don't apply, check:
1. `layout.tsx` imports Roboto/Roboto_Mono from next/font/google
2. `globals.css` has `--font-sans` and `--font-mono` variables
3. No Geist font references remain

### Dark Mode Contrast
Cards should pop off background. If blending:
- Background: 0.09 OKLCH (very dark)
- Cards: 0.18 OKLCH (medium dark)

### Supabase RLS
Tables use Row Level Security. Ensure:
- User is authenticated for write operations
- Public read enabled for color_library, material_library

---

## Next Session Startup Checklist

1. [ ] Read this file (`agentnotes.md`)
2. [ ] Check `project_checklist.md` for current priorities
3. [ ] Verify dev server runs: `npm run dev`
4. [ ] Check `/test-theme` page for theme verification
5. [ ] Review recent git commits for context

---

## Git Workflow

```bash
# Create feature branch
git checkout -b feature/name

# Commit changes
git add -A
git commit -m "type(scope): description"

# Push and merge
git push origin feature/name
# Then create PR or merge to main
```

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`

---

## Recent Commits

- `ec2d56e` - feat(theme): implement Mira shadcn theme with Tabler icons and Roboto font
  - 315 files changed
  - Full theme implementation
  - Sidebar-07 app shell
  - 7-step wizard structure
  - Phase 2A database schema
