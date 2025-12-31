# Rehab Planner Pro - Project Checklist

## Current Status: Phase 3 Workspaces + Execution

**Last Updated**: December 30, 2024  
**Current Sprint**: Multi-Project Workspaces (Week 1)  
**Overall Progress**: Phase 2A Complete, Phase 3 Starting

---

## PHASE 1: Core Infrastructure ✅ COMPLETE

### 1.1 Authentication & User Management ✅
- [x] Supabase Auth with Next.js
- [x] User profile management
- [x] Role-based access control
- [x] Project sharing and collaboration

### 1.2 Data Persistence Layer ✅
- [x] Complete CRUD operations
- [x] Real-time subscriptions
- [x] Data validation and error handling
- [x] Zustand store with database integration

### 1.3 Cost Database Engine ✅
- [x] Comprehensive cost database
- [x] Regional pricing multipliers
- [x] Quality tier system (budget/standard/premium/luxury)
- [x] Confidence levels and cost ranges

---

## PHASE 2: Design Intelligence ✅ COMPLETE

### 2A.1 UI Theme Implementation ✅
- [x] Mira shadcn Theme (zinc base, tabler icons, OKLCH)
- [x] Sidebar-07 App Shell
- [x] Icon Migration (Lucide → Tabler)
- [x] Theme Switcher (light/dark toggle)

### 2A.2 Wizard Structure ✅
- [x] 7-step horizontal navigation
- [x] Step indicators with completion states
- [x] Footer navigation (Back/Next/Save)
- [x] Step 4 tabbed layout (Color/Materials/Moodboard)

### 2A.3 Color Library ✅
- [x] ColorWall, ColorWallView, ColorGridView
- [x] ColorCard, ColorSwatch, ColorFamilyPills
- [x] ColorDetailSheet, FilterSheet
- [x] AddToProjectDialog, EditSelectionDialog, ProjectPaletteBar
- [x] Search, filters, favorites, selections

### 2A.4 Material Library ✅
- [x] MaterialCard, MaterialGrid, MaterialLibraryBrowser
- [x] MaterialDetailDialog, API routes
- [x] Search, filters, favorites, selections

### 2A.5 Moodboard Builder ⏸️ PAUSED
- [ ] Set up @dnd-kit for drag-and-drop
- [ ] Create MoodboardCanvas component
- [ ] Element types (color swatch, material, image, text)
- *Deprioritized in favor of Phase 3 execution features*

### 2A.6 Database Schema ✅
- [x] Migration file created
- [x] Tables deployed to Supabase
- [x] Seed data for colors (Sherwin Williams)
- [x] Seed data for materials
- [x] RLS policies configured

### 2A.7 Design Store ✅
- [x] Color selection state and actions
- [x] Material selection state and actions
- [x] Moodboard state (ready for implementation)

---

## PHASE 3: Multi-Project Workspaces 🔄 IN PROGRESS

> **Goal**: Notion-style workspace architecture where each project is a self-contained workspace with phase-specific dashboards.

### 3.1 Workspace Foundation (Week 1) ✅ COMPLETE
- [x] **Database Migrations**
  - [x] Enhance `rehab_projects` with phase, emoji, color, sort_order
  - [x] Add cached aggregates (tasks_total, tasks_completed, days_ahead_behind)
  - [x] Create `user_preferences` table
  - [x] Create `project_members` table (schema only)
  - [x] Create `wizard_progress` table
  - [x] Create `planning_notes` table
  - [x] Create `project_photos` table
  - [x] Create `project_tasks` table
  - [x] Create `project_activity` table
  - [x] Add RLS policies for all new tables

- [x] **Workspace Store**
  - [x] Create `workspace-store.ts` with activeProjectId
  - [x] Implement project switching logic
  - [x] Helper functions for display name, status colors, progress

- [x] **Workspace Sidebar (Notion-style)**
  - [x] Create `workspace-sidebar.tsx`
  - [x] Create `project-sidebar-item.tsx`
  - [x] Group projects by phase: Active / Planning / Completed
  - [x] At-a-glance indicators (tasks, budget %, schedule)
  - [x] Project switching via route change
  - [x] Collapsible sections
  - [x] Resources links (Colors, Materials, Vendors)

- [x] **Workspace Routes**
  - [x] Add `/projects/[projectId]/` route group
  - [x] Create project context provider (layout.tsx)
  - [x] Add planning dashboard route (`/planning/page.tsx`)
  - [x] Add execution dashboard route (`/dashboard/page.tsx`)
  - [x] Add portfolio route placeholder (`/portfolio/page.tsx`)
  - [x] Add tasks route placeholder (`/tasks/page.tsx`)
  - [x] Add photos route placeholder (`/photos/page.tsx`)
  - [x] Add reports route placeholder (`/reports/page.tsx`)
  - [x] Fix route conflict ([id] vs [projectId])

### 3.2 Phase 3 MVP - Construction (Week 2) ✅ COMPLETE
- [x] **Photos System** ✅ COMPLETE
  - [x] Create Supabase Storage bucket `project-photos`
  - [x] Add storage policies (in migration)
  - [x] Create `project_photos` table
  - [x] Build photo uploader component (PhotoDropzone, PhotoUploadDialog, PhotoUploadPreview)
  - [x] Build photo timeline/grid view (PhotoGallery, PhotoCard)
  - [x] Implement tagging (room, category, tags)
  - [x] Signed URLs + thumbnail transform (photo-storage.ts)
  - [x] Photo lightbox viewer
  - [x] React Query setup (QueryClientProvider, mutations, queries)

- [x] **Tasks Kanban** ✅ COMPLETE
  - [x] Create `project_tasks` table (in migration)
  - [x] Task types and constants (src/types/task.ts)
  - [x] Task hooks (use-project-tasks.ts, use-task-mutations.ts)
  - [x] Build Kanban board component (Kibo UI kanban)
  - [x] Implement drag/drop status changes
  - [x] Table view with grouping
  - [x] Quick add/edit sheet (TaskDetailSheet)
  - [x] View toggle (Kanban/Table)

- [x] **Daily Site Reports** ✅ COMPLETE
  - [x] Create `daily_site_reports` table (migration)
  - [x] Report types and constants (src/types/report.ts)
  - [x] Report hooks (use-daily-reports.ts)
  - [x] Build DailyReportForm component (weather, crew, work summary, issues)
  - [x] Build ReportList component
  - [x] Create ReportPDFDocument with @react-pdf/renderer
  - [x] Reports list page with empty state
  - [x] New report page
  - [x] Report detail page with PDF export

- [x] **Execution Dashboard** ✅ COMPLETE
  - [x] Build `/projects/[projectId]/dashboard`
  - [x] Quick actions widget (Upload Photos, Daily Report, Add Task, Log Expense)
  - [x] Today's tasks widget with live data
  - [x] Recent photos placeholder
  - [x] Dashboard header with project stats

### 3.3 Planning Dashboard & Wizard Integration (Week 3) 🔄 IN PROGRESS
- [ ] `/projects/[projectId]/planning` overview
- [ ] Wizard progress widget
- [ ] "Resume Wizard" CTA
- [ ] Planning photos (category=planning)
- [ ] Planning notes CRUD
- [ ] Budget estimates view

### 3.3.1 Wizard Engine Integration ✅ COMPLETE (Option A)
- [x] **Step 5: Priority Scoring Integration**
  - [x] Create PriorityScoreCard component (visual score display)
  - [x] Integrate PriorityScoringEngine for automatic scoring
  - [x] Score breakdown by 6 dimensions (urgency, ROI, risk, dependencies, timing, complexity)
  - [x] Score reasoning display (hover for details)
  - [x] Budget Optimizer dialog with comparison view
  
- [x] **Step 6: Gantt Chart Integration**
  - [x] Integrate GanttChart component with React Flow
  - [x] Auto-scheduling via SchedulingEngine
  - [x] Critical path highlighting
  - [x] Schedule conflict detection and alerts
  - [x] Simple/Gantt view toggle
  
- [x] **Step 7: Budget Optimizer Integration**
  - [x] "Optimize Budget" button with AI analysis
  - [x] Before/after comparison dialog
  - [x] Budget suggestions (minimal/optimal/max value)
  - [x] Apply optimization to update Step 5 scope items

### 3.3.2 Wizard UX Enhancements 🔄 IN PROGRESS
> **Linear Issues Created**: EVE-61 through EVE-71

**High Priority:**
- [x] EVE-61: Add Dependency Mapping UI to Scope Items (Step 5) ✅
- [ ] EVE-62: Implement Drag-and-Drop Task Editing in Gantt Chart (Step 6)
- [x] EVE-63: Implement PDF Export for Project Plan (Step 7) ✅

**Medium Priority:**
- [ ] EVE-64: Add What-If Scenario Comparison for Budget Optimization
- [ ] EVE-65: Enhance Priority Score Card with Smart Explanations
- [ ] EVE-66: Add Filter/Sort Controls for Scope Items Table (Step 5)
- [ ] EVE-67: Add Real-Time Schedule Impact Preview When Toggling Items
- [ ] EVE-68: Add Vendor Assignment to Gantt Chart Tasks (Step 6)

**Low Priority:**
- [ ] EVE-69: Implement Inline Editing in Scope Items Table (Step 5)
- [ ] EVE-70: Add Visual Budget Gauge Component
- [ ] EVE-71: Add Undo/Redo for Budget Optimizations

### 3.4 Transitions + Portfolio (Week 4) ⏳
- [ ] **Phase Transitions**
  - [ ] "Start Construction" action
  - [ ] "Complete Project" action
  - [ ] Read-only mode for completed projects

- [ ] **Portfolio MVP**
  - [ ] Before/after photo gallery
  - [ ] Summary metrics
  - [ ] Lessons learned doc

- [ ] **Quality Gates**
  - [ ] RLS verification tests
  - [ ] Project switching tests
  - [ ] Storage policy tests

---

## PHASE 4: Phase 3 Expansion ⏳ FUTURE

### 4.1 Issues & Punch List
- [ ] `project_issues` table
- [ ] Issues list/detail views
- [ ] Status workflow
- [ ] Photo/task linking

### 4.2 Vendor Communications
- [ ] `project_comms` table
- [ ] Messages/decisions log
- [ ] Attachment support

### 4.3 Budget vs Actual
- [ ] `budget_items` table
- [ ] `expenses` / `payments` tables
- [ ] Log expense flow
- [ ] Dashboard rollups

---

## PHASE 5: Close & Learn ⏳ FUTURE

### 5.1 Post-Project Analysis
- [ ] Estimate vs actual comparison
- [ ] Timeline variance analysis
- [ ] ROI calculation (actual)

### 5.2 Vendor Performance
- [ ] Vendor rating system
- [ ] Performance notes

### 5.3 Portfolio Export
- [ ] PDF generation
- [ ] Marketing assets

---

## Progress Metrics

| Phase | Progress | Status |
|-------|----------|--------|
| Phase 1: Infrastructure | 100% | ✅ Complete |
| Phase 2A: Design Intelligence | 95% | ✅ Complete (Moodboard paused) |
| Phase 3.1: Workspace Foundation | 100% | ✅ Complete |
| Phase 3.2: Construction MVP | 35% | 🔄 In Progress (Photos ✅) |
| Phase 3.3: Planning Dashboard | 50% | ✅ Basic UI Complete |
| Phase 3.3.1: Wizard Engine Integration | 100% | ✅ Complete (Option A) |
| Phase 3.3.2: Wizard UX Enhancements | 18% | 🔄 In Progress (2/11 complete) |
| Phase 3.4: Transitions + Portfolio | 0% | ⏳ Week 4 |
| Phase 4: Expansion | 0% | ⏳ Future |
| Phase 5: Close & Learn | 0% | ⏳ Future |

---

## Key Architecture Decisions

| Date | Decision | Rationale |
|------|----------|-----------|
| 2024-12-29 | Notion-style workspaces | Each project = workspace with phase-specific dashboard |
| 2024-12-29 | Multi-project from day one | Scales naturally, professional UX |
| 2024-12-29 | Hybrid data model | Tables for analytics, docs for narrative |
| 2024-12-29 | Supabase Storage for photos | Simpler, integrated, cheaper |
| 2024-12-29 | Planning Dashboard per project | Flexible planning, not wizard-only |
| 2024-12-29 | Pause moodboard | Prioritize Phase 3 execution features |

---

## Session End Checklist

Before ending a session:
- [ ] Commit all changes with descriptive message
- [ ] Push to remote repository
- [ ] Update this checklist with progress
- [ ] Update agentnotes.md if significant changes
- [ ] Document any blockers or decisions in notebook.md
