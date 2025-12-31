# Rehab Planner Pro - Agent Notes

## Project Overview
**Project Name**: Rehab Planner Pro (formerly Strategic Rehab Estimator)  
**Type**: Fix & Flip Real Estate Investment Analysis Tool  
**Tech Stack**: Next.js 15, TypeScript, Tailwind CSS v4, shadcn/ui (Mira theme), Supabase, Zustand, React Query  
**Repository**: https://github.com/adamj-ops/rehab-planner-pro  
**Status**: Phase 3 Multi-Project Workspaces - 85% Complete (Final Integration remaining)

---

## Current Project State (Updated Dec 30, 2024)

### ✅ Recently Completed: Caching & Database Webhooks (Dec 30, 2024)

Implemented comprehensive server-side caching with automatic invalidation:

#### Caching Infrastructure (`src/lib/cache.ts`)
| Function | TTL | Tags |
|----------|-----|------|
| `getCachedMaterialPrices` | 10 min | materials, material-prices |
| `getCachedLaborRates` | 30 min | labor-rates |
| `getCachedScopeCatalog` | 30 min | scope-catalog |
| `getCachedVendorDirectory` | 10 min | vendors |
| `getCachedProjectStats` | 5 min | project-stats |
| `getCachedAIResponse` | 1 hour | ai-response |

#### Supabase Database Webhooks
- **Extension**: `pg_net` enabled for HTTP requests
- **Trigger Function**: `supabase_functions.notify_cache_invalidation()`
- **Revalidation Endpoint**: `/api/revalidate`
- **Tables with Triggers**: vendors, material_library, color_library, scope_catalog, labor_rates, material_prices, rehab_projects

#### New Reference Tables Created
| Table | Rows | Purpose |
|-------|------|---------|
| `scope_catalog` | 24 | Renovation items with costs, durations, ROI |
| `labor_rates` | 10 | Trade types with regional hourly rates |
| `material_prices` | 20 | Materials with quality tier pricing |

---

### ✅ Recently Completed: Gantt Chart Enhancements (Dec 30, 2024)

Enhanced the Step 6 Action Plan with interactive features:

- **Drag-and-Drop**: Horizontal drag to reschedule tasks
- **Manual Overrides**: Persist user's date changes
- **Undo/Redo**: Cmd+Z / Cmd+Shift+Z keyboard shortcuts
- **Reset Schedule**: Button to revert to auto-calculated dates
- **Toast Feedback**: Notifications for drag operations

**File**: `src/components/wizard/steps/action-plan-form.tsx`

---

### ✅ Code Quality: Store Relocations (Dec 30, 2024)

Zustand stores moved from `src/stores/` to `src/hooks/` for consistency:
- `workspace-store.ts` → `src/hooks/use-workspace-store.ts`
- `notebook-store.ts` → `src/hooks/use-notebook-store.ts`

All imports updated across the codebase.

---

## Linear Project Status

### Project: Rehab Planner Pro

**Epics Status:**

| Epic | Status | Notes |
|------|--------|-------|
| EVE-5: Authentication | ✅ Done | Email + Google OAuth |
| EVE-10: App Shell | ✅ Done | Sidebar-07 |
| EVE-14: Project Dashboard | ✅ Done | CRUD operations |
| EVE-15: Step 1 Property Details | ✅ Done | Google Places, accordion |
| EVE-16: Step 2 Condition | ✅ Done | Room photos, ratings |
| EVE-18: Step 4 Scope Building | ✅ Done | Cost catalog, AI recs |
| EVE-19: Step 5 Priority Matrix | ✅ Done | 6D scoring, optimizer |
| EVE-20: Step 6 Timeline | ✅ Done | Gantt, drag-drop, undo |
| EVE-21: Step 7 Final Review | Backlog | Not started |
| EVE-22-24: Design Intelligence | ✅ Done | Colors, materials, moodboard |
| EVE-44: Multi-Project Workspaces | 🔄 In Progress | Phase 3.4 remaining |
| EVE-72: Acquisition Foundation | ✅ Done | Database + types |
| EVE-73: Market Analysis UI | 🔄 In Progress | EVE-79 remaining |
| EVE-87: Caching & Webhooks | ✅ Done | Just created |

---

## Application Structure

### Route Groups
```
/app
  /(app)               # Main application with sidebar
    /dashboard         # Dashboard overview
    /projects          # Project listing
    /projects/[projectId]  # Project workspace
      /dashboard       # Construction execution dashboard
      /planning        # Planning phase dashboard
      /tasks           # Task Kanban board
      /photos          # Photo gallery
      /reports         # Daily site reports
      /portfolio       # Before/after showcase
    /wizard            # 7-step project creation wizard
    /deals             # Acquisition pipeline (new)
    /onboarding        # User onboarding flow
  /api                 # API routes
  /auth                # Authentication pages
```

### Key Hooks
| Hook | Purpose |
|------|---------|
| `use-workspace-store` | Active project state (Zustand) |
| `use-notebook-store` | Notebook pages state (Zustand) |
| `use-project-tasks` | Task CRUD (React Query) |
| `use-project-photos` | Photo CRUD (React Query) |
| `use-daily-reports` | Report CRUD (React Query) |
| `use-task-mutations` | Task update mutations |
| `use-photo-upload` | Photo upload with Supabase Storage |

---

## Database Tables (Supabase)

### Phase 1: Core
| Table | Purpose |
|-------|---------|
| `users` | User profiles |
| `rehab_projects` | Projects with phase, emoji, wizard state |
| `scope_items` | Renovation work items |
| `vendors` | Contractor/supplier management |
| `project_rooms` | Room-by-room details |
| `project_transactions` | Financial tracking |

### Phase 2A: Design
| Table | Purpose |
|-------|---------|
| `color_library` | Sherwin Williams colors (20 seeded) |
| `material_library` | Flooring, countertops (19 seeded) |
| `moodboards` | Design boards |
| `moodboard_elements` | Board elements |

### Phase 3: Workspaces
| Table | Purpose |
|-------|---------|
| `user_preferences` | User settings, last project |
| `project_members` | Collaboration (schema only) |
| `project_activity` | Activity log |
| `project_tasks` | Kanban tasks |
| `project_photos` | Photo metadata |
| `daily_site_reports` | Daily reports |
| `wizard_progress` | Wizard step tracking |
| `planning_notes` | Planning phase notes |
| `project_notebooks` | AI notebook per project |
| `notebook_pages` | Notebook content |

### Phase 3.6: Reference Data
| Table | Purpose |
|-------|---------|
| `scope_catalog` | 24 renovation items |
| `labor_rates` | 10 trade rates |
| `material_prices` | 20 material prices |

### Phase 5: Acquisition
| Table | Purpose |
|-------|---------|
| `acquisition_leads` | Deal pipeline leads |
| `market_analysis` | Neighborhood health metrics |
| `comparable_sales` | Comp data with adjustments |

---

## Environment Variables

```env
# .env.local (required)
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
OPENAI_API_KEY=your_openai_key
GOOGLE_PLACES_API_KEY=your_places_key
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
import { IconHome, IconSettings } from '@tabler/icons-react'
```

---

## Key Architecture Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-29 | Notion-style workspaces | Each project = workspace |
| 2024-12-29 | Supabase Storage for photos | Simpler, integrated |
| 2024-12-30 | Next.js unstable_cache | Server-side caching |
| 2024-12-30 | pg_net webhooks | Auto cache invalidation |
| 2024-12-30 | Stores → hooks folder | Consistency with hooks pattern |

---

## Next Session Startup Checklist

1. [ ] Read this file (`agentnotes.md`)
2. [ ] Check `project_checklist.md` for current priorities
3. [ ] Verify dev server runs: `npm run dev`
4. [ ] Review Linear issues at https://linear.app/everyday-co/project/rehab-planner-pro-e7ab2aed0216
5. [ ] Check recent git commits for context

---

## Documentation Locations

| Type | Location |
|------|----------|
| Product Requirements | `docs/PRD.md` |
| Database Schema | `docs/DATABASE_SCHEMA_COMPLETE.sql` |
| Supabase Webhooks | `docs/SUPABASE_WEBHOOKS.md` |
| Component Architecture | `docs/implementation/COMPONENT_ARCHITECTURE.md` |
| API Endpoints | `docs/reference/API_ENDPOINTS.md` |

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
```

Commit types: `feat`, `fix`, `docs`, `style`, `refactor`, `test`, `chore`
