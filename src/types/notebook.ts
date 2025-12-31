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
  | 'inspection-checklist'
  | 'contractor-bid-comparison'
  | 'change-order-log'
  | 'permit-tracker'
  | 'material-selection'
  | 'punch-list'
  | 'investor-update'

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
  {
    type: 'inspection-checklist',
    label: 'Inspection Checklist',
    description: 'Pre-purchase property inspection with room-by-room checklist',
    icon: '🔍',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Property Inspection Checklist' }] },
      { type: 'p', children: [{ text: 'Date: ' }] },
      { type: 'p', children: [{ text: 'Inspector: ' }] },
      { type: 'h2', children: [{ text: 'Exterior' }] },
      { type: 'p', children: [{ text: '[ ] Roof condition' }] },
      { type: 'p', children: [{ text: '[ ] Siding/exterior walls' }] },
      { type: 'p', children: [{ text: '[ ] Foundation visible issues' }] },
      { type: 'p', children: [{ text: '[ ] Windows and doors' }] },
      { type: 'p', children: [{ text: '[ ] Landscaping/drainage' }] },
      { type: 'p', children: [{ text: 'Notes: ' }] },
      { type: 'h2', children: [{ text: 'Kitchen' }] },
      { type: 'p', children: [{ text: '[ ] Cabinets condition' }] },
      { type: 'p', children: [{ text: '[ ] Countertops' }] },
      { type: 'p', children: [{ text: '[ ] Appliances working' }] },
      { type: 'p', children: [{ text: '[ ] Plumbing/faucets' }] },
      { type: 'p', children: [{ text: '[ ] Flooring' }] },
      { type: 'p', children: [{ text: 'Notes: ' }] },
      { type: 'h2', children: [{ text: 'Bathrooms' }] },
      { type: 'p', children: [{ text: '[ ] Toilet condition' }] },
      { type: 'p', children: [{ text: '[ ] Shower/tub' }] },
      { type: 'p', children: [{ text: '[ ] Vanity/sink' }] },
      { type: 'p', children: [{ text: '[ ] Tile condition' }] },
      { type: 'p', children: [{ text: '[ ] Ventilation' }] },
      { type: 'p', children: [{ text: 'Notes: ' }] },
      { type: 'h2', children: [{ text: 'Systems' }] },
      { type: 'p', children: [{ text: '[ ] HVAC age and condition' }] },
      { type: 'p', children: [{ text: '[ ] Water heater' }] },
      { type: 'p', children: [{ text: '[ ] Electrical panel' }] },
      { type: 'p', children: [{ text: '[ ] Plumbing (water pressure, leaks)' }] },
      { type: 'p', children: [{ text: 'Notes: ' }] },
      { type: 'h2', children: [{ text: 'Red Flags' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Estimated Repair Costs' }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
  {
    type: 'contractor-bid-comparison',
    label: 'Bid Comparison',
    description: 'Side-by-side vendor bid analysis',
    icon: '⚖️',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Contractor Bid Comparison' }] },
      { type: 'h2', children: [{ text: 'Scope of Work' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Contractor 1' }] },
      { type: 'p', children: [{ text: 'Name: ' }] },
      { type: 'p', children: [{ text: 'Bid Amount: $' }] },
      { type: 'p', children: [{ text: 'Timeline: ' }] },
      { type: 'p', children: [{ text: 'References: ' }] },
      { type: 'p', children: [{ text: 'Notes: ' }] },
      { type: 'h2', children: [{ text: 'Contractor 2' }] },
      { type: 'p', children: [{ text: 'Name: ' }] },
      { type: 'p', children: [{ text: 'Bid Amount: $' }] },
      { type: 'p', children: [{ text: 'Timeline: ' }] },
      { type: 'p', children: [{ text: 'References: ' }] },
      { type: 'p', children: [{ text: 'Notes: ' }] },
      { type: 'h2', children: [{ text: 'Contractor 3' }] },
      { type: 'p', children: [{ text: 'Name: ' }] },
      { type: 'p', children: [{ text: 'Bid Amount: $' }] },
      { type: 'p', children: [{ text: 'Timeline: ' }] },
      { type: 'p', children: [{ text: 'References: ' }] },
      { type: 'p', children: [{ text: 'Notes: ' }] },
      { type: 'h2', children: [{ text: 'Comparison Summary' }] },
      { type: 'p', children: [{ text: 'Lowest bid: ' }] },
      { type: 'p', children: [{ text: 'Best value: ' }] },
      { type: 'p', children: [{ text: 'Fastest timeline: ' }] },
      { type: 'h2', children: [{ text: 'Decision' }] },
      { type: 'p', children: [{ text: 'Selected contractor: ' }] },
      { type: 'p', children: [{ text: 'Reason: ' }] },
    ],
  },
  {
    type: 'change-order-log',
    label: 'Change Order',
    description: 'Track scope changes with cost/timeline impact',
    icon: '📝',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Change Order' }] },
      { type: 'p', children: [{ text: 'Change Order #: ' }] },
      { type: 'p', children: [{ text: 'Date: ' }] },
      { type: 'p', children: [{ text: 'Requested by: ' }] },
      { type: 'h2', children: [{ text: 'Original Scope' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Requested Change' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Reason for Change' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Cost Impact' }] },
      { type: 'p', children: [{ text: 'Original cost: $' }] },
      { type: 'p', children: [{ text: 'Additional cost: $' }] },
      { type: 'p', children: [{ text: 'New total: $' }] },
      { type: 'h2', children: [{ text: 'Timeline Impact' }] },
      { type: 'p', children: [{ text: 'Additional days: ' }] },
      { type: 'p', children: [{ text: 'New completion date: ' }] },
      { type: 'h2', children: [{ text: 'Approval' }] },
      { type: 'p', children: [{ text: '[ ] Approved  [ ] Denied  [ ] Pending' }] },
      { type: 'p', children: [{ text: 'Approved by: ' }] },
      { type: 'p', children: [{ text: 'Date: ' }] },
    ],
  },
  {
    type: 'permit-tracker',
    label: 'Permit Tracker',
    description: 'Log permit applications, inspections, approvals',
    icon: '📋',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Permit Tracker' }] },
      { type: 'h2', children: [{ text: 'Permits Required' }] },
      { type: 'h3', children: [{ text: 'Building Permit' }] },
      { type: 'p', children: [{ text: 'Status: [ ] Not needed  [ ] Applied  [ ] Approved  [ ] Closed' }] },
      { type: 'p', children: [{ text: 'Permit #: ' }] },
      { type: 'p', children: [{ text: 'Applied date: ' }] },
      { type: 'p', children: [{ text: 'Approved date: ' }] },
      { type: 'p', children: [{ text: 'Cost: $' }] },
      { type: 'h3', children: [{ text: 'Electrical Permit' }] },
      { type: 'p', children: [{ text: 'Status: [ ] Not needed  [ ] Applied  [ ] Approved  [ ] Closed' }] },
      { type: 'p', children: [{ text: 'Permit #: ' }] },
      { type: 'p', children: [{ text: 'Applied date: ' }] },
      { type: 'p', children: [{ text: 'Approved date: ' }] },
      { type: 'p', children: [{ text: 'Cost: $' }] },
      { type: 'h3', children: [{ text: 'Plumbing Permit' }] },
      { type: 'p', children: [{ text: 'Status: [ ] Not needed  [ ] Applied  [ ] Approved  [ ] Closed' }] },
      { type: 'p', children: [{ text: 'Permit #: ' }] },
      { type: 'p', children: [{ text: 'Applied date: ' }] },
      { type: 'p', children: [{ text: 'Approved date: ' }] },
      { type: 'p', children: [{ text: 'Cost: $' }] },
      { type: 'h2', children: [{ text: 'Inspections' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Notes' }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
  {
    type: 'material-selection',
    label: 'Material Selection',
    description: 'Document material choices with costs and suppliers',
    icon: '🪵',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Material Selection' }] },
      { type: 'h2', children: [{ text: 'Category' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Room/Area' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Selected Material' }] },
      { type: 'p', children: [{ text: 'Product name: ' }] },
      { type: 'p', children: [{ text: 'Brand/Manufacturer: ' }] },
      { type: 'p', children: [{ text: 'SKU/Model #: ' }] },
      { type: 'p', children: [{ text: 'Color/Finish: ' }] },
      { type: 'h2', children: [{ text: 'Supplier' }] },
      { type: 'p', children: [{ text: 'Store: ' }] },
      { type: 'p', children: [{ text: 'Contact: ' }] },
      { type: 'h2', children: [{ text: 'Pricing' }] },
      { type: 'p', children: [{ text: 'Unit price: $' }] },
      { type: 'p', children: [{ text: 'Quantity needed: ' }] },
      { type: 'p', children: [{ text: 'Total cost: $' }] },
      { type: 'h2', children: [{ text: 'Lead Time' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Alternatives Considered' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Photos' }] },
      { type: 'p', children: [{ text: '' }] },
    ],
  },
  {
    type: 'punch-list',
    label: 'Punch List',
    description: 'Final walkthrough items before closing',
    icon: '✅',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Punch List' }] },
      { type: 'p', children: [{ text: 'Date: ' }] },
      { type: 'p', children: [{ text: 'Walkthrough with: ' }] },
      { type: 'h2', children: [{ text: 'Kitchen' }] },
      { type: 'p', children: [{ text: '[ ] ' }] },
      { type: 'h2', children: [{ text: 'Bathrooms' }] },
      { type: 'p', children: [{ text: '[ ] ' }] },
      { type: 'h2', children: [{ text: 'Bedrooms' }] },
      { type: 'p', children: [{ text: '[ ] ' }] },
      { type: 'h2', children: [{ text: 'Living Areas' }] },
      { type: 'p', children: [{ text: '[ ] ' }] },
      { type: 'h2', children: [{ text: 'Exterior' }] },
      { type: 'p', children: [{ text: '[ ] ' }] },
      { type: 'h2', children: [{ text: 'General/Touch-ups' }] },
      { type: 'p', children: [{ text: '[ ] Paint touch-ups' }] },
      { type: 'p', children: [{ text: '[ ] Caulking' }] },
      { type: 'p', children: [{ text: '[ ] Hardware tightened' }] },
      { type: 'p', children: [{ text: '[ ] Cleaning complete' }] },
      { type: 'p', children: [{ text: '[ ] All fixtures working' }] },
      { type: 'h2', children: [{ text: 'Sign-off' }] },
      { type: 'p', children: [{ text: 'All items complete: [ ] Yes  [ ] No' }] },
      { type: 'p', children: [{ text: 'Date completed: ' }] },
    ],
  },
  {
    type: 'investor-update',
    label: 'Investor Update',
    description: 'Weekly/monthly progress report for stakeholders',
    icon: '📈',
    defaultContent: [
      { type: 'h1', children: [{ text: 'Investor Update' }] },
      { type: 'p', children: [{ text: 'Report period: ' }] },
      { type: 'p', children: [{ text: 'Report date: ' }] },
      { type: 'h2', children: [{ text: 'Project Summary' }] },
      { type: 'p', children: [{ text: 'Property: ' }] },
      { type: 'p', children: [{ text: 'Phase: ' }] },
      { type: 'p', children: [{ text: 'Overall status: [ ] On Track  [ ] Behind  [ ] Ahead' }] },
      { type: 'h2', children: [{ text: 'Progress This Period' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Budget Status' }] },
      { type: 'p', children: [{ text: 'Original budget: $' }] },
      { type: 'p', children: [{ text: 'Spent to date: $' }] },
      { type: 'p', children: [{ text: 'Remaining: $' }] },
      { type: 'p', children: [{ text: 'Variance: ' }] },
      { type: 'h2', children: [{ text: 'Timeline Status' }] },
      { type: 'p', children: [{ text: 'Original completion: ' }] },
      { type: 'p', children: [{ text: 'Current estimate: ' }] },
      { type: 'p', children: [{ text: 'Days ahead/behind: ' }] },
      { type: 'h2', children: [{ text: 'Key Milestones' }] },
      { type: 'p', children: [{ text: '[ ] Completed: ' }] },
      { type: 'p', children: [{ text: '[ ] Upcoming: ' }] },
      { type: 'h2', children: [{ text: 'Issues & Risks' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Next Steps' }] },
      { type: 'p', children: [{ text: '' }] },
      { type: 'h2', children: [{ text: 'Photos' }] },
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
