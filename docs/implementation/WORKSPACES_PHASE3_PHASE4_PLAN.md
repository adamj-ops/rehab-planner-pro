# Multi-Project Workspaces + Phase 3/4 Implementation Plan

**Created**: December 29, 2024  
**Status**: Active Development  
**Owner**: Agent Session

---

## Executive Summary

This document defines the implementation plan to pivot from a design-heavy product (Phases 1-2) to a construction-execution-first product (Phases 3-4) using a **Notion-style multi-project workspace** architecture.

### Key Decisions (Locked)
- **Separate execution dashboard** from the wizard
- **Multi-project workspaces** from day one (not single-project MVP)
- **Hybrid data model**: structured tables for analytics + docs for narrative
- **Supabase Storage** for photos
- **Planning Dashboard per project** (not wizard-only)

---

## North Star UX

Each project is a self-contained workspace with phase-specific hubs:

| Project Phase | Primary View | Key Features |
|---------------|--------------|--------------|
| **Planning** | Planning Dashboard | Wizard progress, planning photos, notes, budget estimates |
| **Construction** | Execution Dashboard | Tasks Kanban, photos, daily reports, activity feed |
| **Completed** | Portfolio View | Before/after, estimate vs actual, lessons learned |

### Sidebar Structure (Notion-style)

```
▼ Active (3)          ← Execution dashboards
  🏠 12407 65th St NE, Otsego
  🏠 1534 Maple St SE
  🏠 8821 Pine Ridge Ct

▼ Planning (1)        ← Planning dashboards
  📋 2145 Oak Forest Dr

▼ Completed (2)       ← Portfolio views
  ✅ 456 Lake Shore Blvd
  ✅ 789 River Rd

+ New Project
───────────
Resources
• Colors
• Materials
• Vendors
```

---

## Route Architecture

### Workspace-Scoped Routes

```
/projects/[projectId]/
├── planning/                 # Planning phase hub
│   ├── (default)            # Planning dashboard
│   ├── photos/              # Pre-demo photos
│   ├── notes/               # Planning notes
│   ├── budget/              # Budget estimates
│   └── wizard/              # Resume wizard redirect
│
├── dashboard/               # Construction phase hub (execution dashboard)
├── tasks/                   # Kanban board
├── photos/                  # Construction photos
├── reports/                 # Daily site reports
├── issues/                  # (Phase 3 expansion) Issues/punch list
├── budget/                  # (Phase 3 expansion) Budget vs actual
├── timeline/                # (Phase 3 expansion) Schedule/Gantt
│
└── portfolio/               # Completed phase hub (read-only)
```

### Wizard Routes (Enhanced)

```
/wizard/step-1?project=[projectId]
/wizard/step-2?project=[projectId]
...
/wizard/step-7?project=[projectId]
```

---

## Data Model

### Hybrid Approach

**Structured Tables** (queryable, for analytics):
- `rehab_projects` (enhanced with phase tracking)
- `project_tasks` (Kanban + dependencies)
- `project_photos` (metadata + storage paths)
- `project_issues` (Phase 3 expansion)
- `budget_items` / `expenses` (Phase 3 expansion)

**Documents System** (narrative content):
- `document_templates` (Daily Report, Meeting Notes, Change Order, etc.)
- `document_instances` (created from templates, per project)
- Linking: instances can reference tasks, photos, issues, vendors

### Database Schema Additions

#### 1. Enhance `rehab_projects`

```sql
-- Add to existing rehab_projects table
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS phase VARCHAR(20) DEFAULT 'planning';
-- Values: 'planning', 'construction', 'paused', 'completed', 'archived'

ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS emoji VARCHAR(10) DEFAULT '🏠';
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS color VARCHAR(7); -- Hex color
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS sort_order INT DEFAULT 0;

-- Cached aggregates for sidebar indicators
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS tasks_total INT DEFAULT 0;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS tasks_completed INT DEFAULT 0;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS days_ahead_behind INT DEFAULT 0;

-- Phase transition dates
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS planning_started_at TIMESTAMPTZ;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS construction_started_at TIMESTAMPTZ;
ALTER TABLE rehab_projects ADD COLUMN IF NOT EXISTS completed_at TIMESTAMPTZ;
```

#### 2. User Preferences

```sql
CREATE TABLE user_preferences (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  active_project_id UUID REFERENCES rehab_projects(id) ON DELETE SET NULL,
  sidebar_collapsed BOOLEAN DEFAULT false,
  active_section_expanded BOOLEAN DEFAULT true,
  planning_section_expanded BOOLEAN DEFAULT true,
  completed_section_expanded BOOLEAN DEFAULT false,
  default_task_view VARCHAR(20) DEFAULT 'kanban',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 3. Project Members (Future-proofing)

```sql
CREATE TABLE project_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role VARCHAR(20) DEFAULT 'viewer', -- 'owner', 'editor', 'viewer'
  invited_by UUID REFERENCES auth.users(id),
  invited_at TIMESTAMPTZ DEFAULT NOW(),
  accepted_at TIMESTAMPTZ,
  UNIQUE(project_id, user_id)
);
```

#### 4. Wizard Progress

```sql
CREATE TABLE wizard_progress (
  project_id UUID PRIMARY KEY REFERENCES rehab_projects(id) ON DELETE CASCADE,
  last_completed_step INT DEFAULT 0,
  step_1_completed BOOLEAN DEFAULT false,
  step_2_completed BOOLEAN DEFAULT false,
  step_3_completed BOOLEAN DEFAULT false,
  step_4_completed BOOLEAN DEFAULT false,
  step_5_completed BOOLEAN DEFAULT false,
  step_6_completed BOOLEAN DEFAULT false,
  step_7_completed BOOLEAN DEFAULT false,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 5. Planning Notes

```sql
CREATE TABLE planning_notes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  category VARCHAR(50), -- 'budget', 'scope', 'contractor', 'permit', 'general'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

#### 6. Project Tasks (Phase 3 MVP)

```sql
CREATE TABLE project_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status VARCHAR(20) DEFAULT 'to_do', -- 'to_do', 'in_progress', 'blocked', 'done'
  priority VARCHAR(20) DEFAULT 'medium', -- 'low', 'medium', 'high', 'urgent'
  assigned_vendor_id UUID, -- References vendors table
  room_id UUID, -- References project_rooms
  scope_item_id UUID, -- References scope_items
  start_date DATE,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE task_dependencies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  depends_on_task_id UUID NOT NULL REFERENCES project_tasks(id) ON DELETE CASCADE,
  UNIQUE(task_id, depends_on_task_id)
);
```

#### 7. Project Photos (Phase 3 MVP)

```sql
CREATE TABLE project_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES rehab_projects(id) ON DELETE CASCADE,
  storage_path TEXT NOT NULL, -- e.g., 'abc-123/original/xyz.jpg'
  room_id UUID, -- References project_rooms
  category VARCHAR(20) DEFAULT 'during', -- 'planning', 'before', 'during', 'after', 'issue'
  tags TEXT[], -- ['plumbing', 'master-bath', 'leak']
  caption TEXT,
  taken_at TIMESTAMPTZ DEFAULT NOW(),
  uploaded_by UUID REFERENCES auth.users(id),
  file_size_bytes INT,
  width_px INT,
  height_px INT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## Implementation Phases

### Phase 1 (Week 1): Multi-Project Workspace Foundation

**Goals**:
- Workspace routing scaffold
- Notion-style sidebar with project grouping
- Project switching (route change + persisted selection)
- DB/RLS groundwork

**Deliverables**:
1. DB migration with schema additions
2. Workspace store (Zustand) with `activeProjectId` and switching logic
3. Workspace sidebar component (grouped by phase)
4. Route group under `src/app/(app)/projects/[projectId]/...`
5. Layout with project context provider

**Acceptance Criteria**:
- [ ] Switching projects never leaks data across workspaces
- [ ] Planning/Construction/Completed projects route to correct hub
- [ ] Sidebar shows at-a-glance indicators (tasks, schedule)

### Phase 2 (Week 2): Phase 3 MVP — Photos + Tasks + Daily Reports

**Goals**:
- Make construction execution usable daily

**Deliverables**:
1. **Photos**
   - Supabase Storage bucket `project-photos` + policies
   - `project_photos` table
   - Upload flow (multi-upload)
   - Tagging (room, category, tags)
   - Timeline/grid view
   - Signed URLs + thumbnail transform

2. **Tasks (Kanban)**
   - `project_tasks` table + `task_dependencies`
   - Kanban board: To Do / In Progress / Blocked / Done
   - Drag/drop status changes
   - Quick add/edit drawer
   - Basic dependency indicator

3. **Daily Site Reports (Docs)**
   - Daily report template
   - Create/list/detail views
   - Link tasks + photos into report

4. **Execution Dashboard**
   - `/projects/[projectId]/dashboard`
   - Quick actions (Upload Photos, Daily Report, Add Task)
   - Today's tasks
   - Recent photos
   - Activity feed

**Acceptance Criteria**:
- [ ] Can run construction daily: upload photos, update tasks, file daily report
- [ ] Activity feed shows recent changes

### Phase 3 (Week 3): Planning Dashboard

**Goals**:
- Planning is continuous, not wizard-only

**Deliverables**:
1. `/projects/[projectId]/planning` overview
   - Wizard progress widget + "Resume Wizard" CTA
   - Quick actions
   - Planning photo gallery (category=planning)
   - Planning notes
2. `/projects/[projectId]/planning/photos`
3. `/projects/[projectId]/planning/notes`
4. `/projects/[projectId]/planning/budget` (estimates view)
5. `wizard_progress` table
6. `planning_notes` table

**Acceptance Criteria**:
- [ ] Planning is usable without being forced through wizard
- [ ] Wizard remains the structured planning path

### Phase 4 (Week 4): Transitions + Polish + Portfolio MVP

**Goals**:
- Full lifecycle product

**Deliverables**:
1. **Planning → Construction transition**
   - "Start Construction" action changes phase
   - Redirects to execution dashboard

2. **Construction → Completed transition**
   - "Complete Project" marks completed
   - Project becomes read-only

3. **Portfolio MVP**
   - `/projects/[projectId]/portfolio`
   - Before/after photos
   - Summary metrics
   - Lessons learned doc

4. **Quality Gates**
   - RLS verification
   - Switching regression tests
   - Storage policy tests

---

## State Management

### Workspace Store

```typescript
// src/stores/workspace-store.ts
interface WorkspaceStore {
  activeProjectId: string | null;
  
  // Actions
  setActiveProject: (projectId: string) => void;
  clearActiveProject: () => void;
  
  // Derived (from React Query)
  // projects grouped by phase are fetched separately
}
```

### React Query Keys

All project-scoped queries must include `activeProjectId`:

```typescript
// Example patterns
['projects', 'all'] // All user projects (sidebar)
['project', projectId] // Single project details
['tasks', projectId] // Tasks for a project
['photos', projectId] // Photos for a project
['reports', projectId] // Reports for a project
```

---

## Security (RLS Policies)

### Projects

```sql
-- Users can view projects they own or are members of
CREATE POLICY "project_read" ON rehab_projects FOR SELECT
  USING (
    user_id = auth.uid() 
    OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
  );

-- Only owners can modify
CREATE POLICY "project_write" ON rehab_projects FOR ALL
  USING (user_id = auth.uid());
```

### Project-Scoped Tables

All tables (tasks, photos, notes, etc.) inherit project access:

```sql
CREATE POLICY "tasks_access" ON project_tasks FOR ALL
  USING (
    project_id IN (
      SELECT id FROM rehab_projects 
      WHERE user_id = auth.uid()
      OR id IN (SELECT project_id FROM project_members WHERE user_id = auth.uid())
    )
  );
```

### Storage

```sql
CREATE POLICY "photo_storage_access" ON storage.objects FOR ALL
  USING (
    bucket_id = 'project-photos'
    AND (storage.foldername(name))[1] IN (
      SELECT id::text FROM rehab_projects WHERE user_id = auth.uid()
    )
  );
```

---

## Follow-on Work (Post Week 4)

### Phase 3 Expansion
- Issues/punch list
- Vendor communication log
- Budget vs actual + payments
- Timeline/Gantt

### Phase 4 Depth
- Post-project analysis (estimate vs actual ROI)
- Vendor performance reviews
- Export/share portfolio

---

## Appendix: Component Architecture

### Sidebar

```
components/
├── workspace-sidebar.tsx       # Main sidebar
├── project-sidebar-item.tsx    # Individual project item
├── project-section.tsx         # Collapsible section (Active/Planning/Completed)
└── sidebar-resources.tsx       # Resources links (Colors/Materials/Vendors)
```

### Dashboard

```
components/
├── execution-dashboard/
│   ├── quick-actions.tsx
│   ├── todays-tasks.tsx
│   ├── recent-photos.tsx
│   └── activity-feed.tsx
├── planning-dashboard/
│   ├── wizard-progress.tsx
│   ├── planning-notes.tsx
│   └── planning-photos.tsx
└── portfolio-view/
    ├── before-after-gallery.tsx
    ├── summary-metrics.tsx
    └── lessons-learned.tsx
```

### Tasks

```
components/tasks/
├── task-board.tsx              # Kanban container
├── task-column.tsx             # Single column (To Do, etc.)
├── task-card.tsx               # Draggable card
├── task-form.tsx               # Add/edit form
└── task-dependency-badge.tsx   # Dependency indicator
```

### Photos

```
components/photos/
├── photo-uploader.tsx          # Multi-upload with progress
├── photo-grid.tsx              # Grid view
├── photo-timeline.tsx          # Date-grouped timeline
├── photo-detail-sheet.tsx      # Full photo view
└── photo-tagger.tsx            # Room/category/tag UI
```
