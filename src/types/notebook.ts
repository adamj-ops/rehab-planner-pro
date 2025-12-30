// ============================================================================
// NOTEBOOK TYPES
// Types for the project notebook/journal feature with Plate.js editor
// ============================================================================

import type { Value } from 'platejs'

// ============================================================================
// TEMPLATE TYPES
// ============================================================================

export type NotebookTemplate =
  | 'walkthrough-notes'
  | 'vendor-meeting'
  | 'design-decision'
  | 'daily-log'
  | 'lessons-learned'
  | 'budget-variance-analysis'

export type LinkType =
  | 'room'
  | 'vendor'
  | 'scope_item'
  | 'material'
  | 'color'
  | 'timeline_phase'

export type AttachmentType = 'image' | 'video' | 'audio' | 'document'

// ============================================================================
// CORE ENTITIES
// ============================================================================

/**
 * Project notebook - one per project
 */
export interface ProjectNotebook {
  id: string
  project_id: string
  created_at: string
  updated_at: string
}

/**
 * Notebook page with nested structure support
 */
export interface NotebookPage {
  id: string
  notebook_id: string
  title: string
  icon?: string | null
  content: Value // Plate.js JSONB content
  template_type?: NotebookTemplate | null
  parent_page_id?: string | null
  sort_order: number
  created_at: string
  updated_at: string

  // Populated via joins or queries
  tags?: string[]
  links?: NotebookLink[]
  attachments?: NotebookAttachment[]
  children?: NotebookPage[]
}

/**
 * Contextual link from a page to project entities
 */
export interface NotebookLink {
  id: string
  page_id: string
  link_type: LinkType
  link_id: string
  created_at: string
}

/**
 * Tag associated with a notebook page
 */
export interface NotebookTag {
  id: string
  page_id: string
  tag: string
  created_at: string
}

/**
 * Media attachment linked to a page
 */
export interface NotebookAttachment {
  id: string
  page_id: string
  storage_path: string
  file_name: string
  file_type: AttachmentType
  mime_type?: string | null
  file_size?: number | null
  created_at: string
}

// ============================================================================
// INPUT TYPES (for create/update operations)
// ============================================================================

export interface CreateNotebookData {
  project_id: string
}

export interface CreatePageData {
  notebook_id: string
  title: string
  icon?: string
  content?: Value
  template_type?: NotebookTemplate
  parent_page_id?: string
  sort_order?: number
}

export interface UpdatePageData {
  title?: string
  icon?: string | null
  content?: Value
  template_type?: NotebookTemplate | null
  parent_page_id?: string | null
  sort_order?: number
}

export interface CreateLinkData {
  page_id: string
  link_type: LinkType
  link_id: string
}

export interface CreateAttachmentData {
  page_id: string
  storage_path: string
  file_name: string
  file_type: AttachmentType
  mime_type?: string
  file_size?: number
}

// ============================================================================
// UI STATE TYPES
// ============================================================================

export interface NotebookUIState {
  isSidebarOpen: boolean
  isSidebarCollapsed: boolean
  isSearchOpen: boolean
  searchQuery: string
  selectedTags: string[]
  selectedTemplate: NotebookTemplate | null
}

// ============================================================================
// TEMPLATE CONFIGS
// ============================================================================

export interface TemplateConfig {
  type: NotebookTemplate
  label: string
  description: string
  icon: string
  defaultContent: Value
}

export const NOTEBOOK_TEMPLATES: TemplateConfig[] = [
  {
    type: 'walkthrough-notes',
    label: 'Walkthrough Notes',
    description: 'Document property walkthrough observations',
    icon: '🏠',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Property Walkthrough' }] },
      { type: 'h2', children: [{ text: 'Property Overview' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Exterior Condition' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Room-by-Room Notes' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Major Issues Identified' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Initial Scope Notes' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Photos' }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
  {
    type: 'vendor-meeting',
    label: 'Vendor Meeting',
    description: 'Notes from vendor meetings and quotes',
    icon: '🤝',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Vendor Meeting Notes' }] },
      { type: 'h2', children: [{ text: 'Vendor Information' }] },
      { type: 'p', children: [{ text: 'Vendor: ' }] },
      { type: 'p', children: [{ text: 'Date/Time: ' }] },
      { type: 'p', children: [{ text: 'Attendees: ' }] },
      { type: 'h2', children: [{ text: 'Scope Discussed' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Quote/Estimate' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Timeline Discussed' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Follow-up Actions' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Decision: Hire?' }] },
      { type: 'p', children: [{ text: '[ ] Yes  [ ] No  [ ] Pending' }] },
    ],
  },
  {
    type: 'design-decision',
    label: 'Design Decision',
    description: 'Document design choices and rationale',
    icon: '🎨',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Design Decision' }] },
      { type: 'h2', children: [{ text: 'Decision Question' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Options Considered' }] },
      { type: 'h3', children: [{ text: 'Option 1' }] },
      { type: 'p', children: [{ text: 'Description: ' }] },
      { type: 'p', children: [{ text: 'Cost: ' }] },
      { type: 'p', children: [{ text: 'Pros: ' }] },
      { type: 'p', children: [{ text: 'Cons: ' }] },
      { type: 'h3', children: [{ text: 'Option 2' }] },
      { type: 'p', children: [{ text: 'Description: ' }] },
      { type: 'p', children: [{ text: 'Cost: ' }] },
      { type: 'p', children: [{ text: 'Pros: ' }] },
      { type: 'p', children: [{ text: 'Cons: ' }] },
      { type: 'h2', children: [{ text: 'Final Choice' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Rationale' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Budget Impact' }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
  {
    type: 'daily-log',
    label: 'Daily Log',
    description: 'Track daily progress and issues',
    icon: '📅',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Daily Log' }] },
      { type: 'p', children: [{ text: 'Date: ' }] },
      { type: 'p', children: [{ text: 'Weather: ' }] },
      { type: 'h2', children: [{ text: 'Crew on Site' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Work Completed' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Issues Encountered' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Photos' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: "Tomorrow's Plan" }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
  {
    type: 'lessons-learned',
    label: 'Lessons Learned',
    description: 'Post-project retrospective and insights',
    icon: '💡',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Lessons Learned' }] },
      { type: 'h2', children: [{ text: 'What Went Well' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'What Would I Change' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Budget Surprises' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Timeline Surprises' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Vendor Performance' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Design Choices to Repeat/Avoid' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Key Takeaways for Next Project' }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
  {
    type: 'budget-variance-analysis',
    label: 'Budget Variance',
    description: 'Analyze budget differences and causes',
    icon: '📊',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Budget Variance Analysis' }] },
      { type: 'h2', children: [{ text: 'Category' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Budgeted Amount' }] },
      { type: 'p', children: [{ text: '$' }] },
      { type: 'h2', children: [{ text: 'Actual Amount' }] },
      { type: 'p', children: [{ text: '$' }] },
      { type: 'h2', children: [{ text: 'Variance' }] },
      { type: 'p', children: [{ text: '$ (%)' }] },
      { type: 'h2', children: [{ text: 'Root Cause' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Prevention for Next Time' }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
]

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get template config by type
 */
export function getTemplateConfig(type: NotebookTemplate): TemplateConfig | undefined {
  return NOTEBOOK_TEMPLATES.find((t) => t.type === type)
}

/**
 * Get default content for a template
 */
export function getTemplateDefaultContent(type: NotebookTemplate): Value {
  const config = getTemplateConfig(type)
  return config?.defaultContent ?? [{ type: 'p', children: [{ text: '' }] }]
}

/**
 * Default empty page content
 */
export const DEFAULT_PAGE_CONTENT: Value = [
  { type: 'p', children: [{ text: '' }] },
]
