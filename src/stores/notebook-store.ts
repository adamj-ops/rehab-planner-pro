/**
 * Notebook Store
 * 
 * Zustand store managing all notebook-related data and operations.
 * Provides CRUD operations for pages, links, tags, and attachments.
 * 
 * @module stores/notebook-store
 */

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { createClient } from '@supabase/supabase-js'
import type { Value } from 'platejs'
import type {
  ProjectNotebook,
  NotebookPage,
  NotebookLink,
  NotebookAttachment,
  CreatePageData,
  UpdatePageData,
  NotebookTemplate,
  LinkType,
} from '@/types/notebook'
import type { Database } from '@/types/supabase'

// Create typed Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey)

// ============================================================================
// STATE TYPES
// ============================================================================

interface NotebookDataState {
  // Project context
  projectId: string | null

  // Notebook data
  notebook: ProjectNotebook | null
  notebookLoading: boolean

  // Pages
  pages: NotebookPage[]
  pagesLoading: boolean
  currentPage: NotebookPage | null

  // Tags (all unique tags across pages)
  allTags: string[]

  // Error state
  error: string | null
}

interface NotebookActions {
  // Project actions
  setProjectId: (projectId: string | null) => void

  // Notebook actions
  loadNotebook: (projectId: string) => Promise<void>
  getOrCreateNotebook: (projectId: string) => Promise<ProjectNotebook>

  // Page CRUD
  loadPages: (notebookId: string) => Promise<void>
  createPage: (data: CreatePageData) => Promise<NotebookPage>
  updatePage: (pageId: string, data: UpdatePageData) => Promise<void>
  deletePage: (pageId: string) => Promise<void>
  setCurrentPage: (page: NotebookPage | null) => void

  // Page content
  updatePageContent: (pageId: string, content: Value) => Promise<void>

  // Nested pages
  movePage: (pageId: string, newParentId: string | null, newSortOrder: number) => Promise<void>
  getPageTree: () => NotebookPage[]

  // Links
  addLink: (pageId: string, linkType: LinkType, linkId: string) => Promise<NotebookLink>
  removeLink: (linkId: string) => Promise<void>
  getLinkedPages: (linkType: LinkType, linkId: string) => NotebookPage[]

  // Tags
  addTag: (pageId: string, tag: string) => Promise<void>
  removeTag: (pageId: string, tag: string) => Promise<void>
  loadAllTags: () => void

  // Attachments
  uploadAttachment: (pageId: string, file: File) => Promise<NotebookAttachment>
  deleteAttachment: (attachmentId: string) => Promise<void>

  // Search
  searchPages: (query: string) => NotebookPage[]

  // UI state
  setError: (error: string | null) => void
  clearError: () => void

  // Reset
  reset: () => void
}

// Combined store type
type NotebookStore = NotebookUIState & NotebookDataState & NotebookActions

// ============================================================================
// INITIAL STATE
// ============================================================================

const initialUIState: NotebookUIState = {
  isSidebarOpen: true,
  isSidebarCollapsed: false,
  isSearchOpen: false,
  searchQuery: '',
  selectedTags: [],
  selectedTemplate: null,
}

const initialDataState: NotebookDataState = {
  projectId: null,
  notebook: null,
  notebookLoading: false,
  pages: [],
  pagesLoading: false,
  currentPage: null,
  allTags: [],
  error: null,
}

// ============================================================================
// STORE
// ============================================================================

export const useNotebookStore = create<NotebookStore>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        ...initialUIState,
        ...initialDataState,

        // --------------------------------------------------------------------
        // PROJECT ACTIONS
        // --------------------------------------------------------------------

        setProjectId: (projectId) => {
          set({ projectId })
        },

        // --------------------------------------------------------------------
        // NOTEBOOK ACTIONS
        // --------------------------------------------------------------------

        loadNotebook: async (projectId: string) => {
          set({ notebookLoading: true, error: null })
          try {
            const notebook = await get().getOrCreateNotebook(projectId)
            set({ notebook, projectId })
            await get().loadPages(notebook.id)
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load notebook'
            set({ error: message })
            throw error
          } finally {
            set({ notebookLoading: false })
          }
        },

        getOrCreateNotebook: async (projectId: string): Promise<ProjectNotebook> => {
          // Try to get existing notebook
          const { data: existing, error: selectError } = await supabase
            .from('project_notebooks')
            .select('*')
            .eq('project_id', projectId)
            .single()

          if (existing) {
            return existing as ProjectNotebook
          }

          if (selectError && selectError.code !== 'PGRST116') {
            throw selectError
          }

          // Create new notebook
          const { data: newNotebook, error: insertError } = await supabase
            .from('project_notebooks')
            .insert({ project_id: projectId })
            .select()
            .single()

          if (insertError) throw insertError
          return newNotebook as ProjectNotebook
        },

        // --------------------------------------------------------------------
        // PAGE CRUD
        // --------------------------------------------------------------------

        loadPages: async (notebookId: string) => {
          set({ pagesLoading: true })
          try {
            const { data, error } = await supabase
              .from('notebook_pages')
              .select(`
                *,
                notebook_tags(tag),
                notebook_links(*),
                notebook_attachments(*)
              `)
              .eq('notebook_id', notebookId)
              .order('sort_order', { ascending: true })

            if (error) throw error

            // Transform data to include nested tags array
            const pages: NotebookPage[] = (data || []).map((page) => ({
              ...page,
              content: page.content as Value,
              template_type: page.template_type as NotebookTemplate | null,
              tags: (page.notebook_tags as { tag: string }[])?.map((t) => t.tag) || [],
              links: page.notebook_links as NotebookLink[],
              attachments: page.notebook_attachments as NotebookAttachment[],
            }))

            set({ pages })
            get().loadAllTags()
          } catch (error) {
            const message = error instanceof Error ? error.message : 'Failed to load pages'
            set({ error: message })
          } finally {
            set({ pagesLoading: false })
          }
        },

        createPage: async (data: CreatePageData): Promise<NotebookPage> => {
          const { pages } = get()

          // Get default content based on template
          let content = data.content || [{ type: 'p', children: [{ text: '' }] }]
          if (data.template_type) {
            const { getTemplateDefaultContent } = await import('@/types/notebook')
            content = getTemplateDefaultContent(data.template_type)
          }

          // Calculate sort order
          const siblingPages = data.parent_page_id
            ? pages.filter((p) => p.parent_page_id === data.parent_page_id)
            : pages.filter((p) => !p.parent_page_id)
          const sortOrder = data.sort_order ?? siblingPages.length

          const { data: newPage, error } = await supabase
            .from('notebook_pages')
            .insert({
              notebook_id: data.notebook_id,
              title: data.title,
              icon: data.icon || null,
              content: content as unknown as Record<string, unknown>,
              template_type: data.template_type || null,
              parent_page_id: data.parent_page_id || null,
              sort_order: sortOrder,
            })
            .select()
            .single()

          if (error) throw error

          const page: NotebookPage = {
            ...newPage,
            content: newPage.content as Value,
            template_type: newPage.template_type as NotebookTemplate | null,
            tags: [],
            links: [],
            attachments: [],
          }

          set({ pages: [...pages, page] })
          return page
        },

        updatePage: async (pageId: string, data: UpdatePageData) => {
          const { data: updated, error } = await supabase
            .from('notebook_pages')
            .update({
              ...(data.title !== undefined && { title: data.title }),
              ...(data.icon !== undefined && { icon: data.icon }),
              ...(data.content !== undefined && { content: data.content as unknown as Record<string, unknown> }),
              ...(data.template_type !== undefined && { template_type: data.template_type }),
              ...(data.parent_page_id !== undefined && { parent_page_id: data.parent_page_id }),
              ...(data.sort_order !== undefined && { sort_order: data.sort_order }),
            })
            .eq('id', pageId)
            .select()
            .single()

          if (error) throw error

          set({
            pages: get().pages.map((p) =>
              p.id === pageId
                ? {
                    ...p,
                    ...data,
                    content: data.content ?? p.content,
                    updated_at: updated.updated_at,
                  }
                : p
            ),
            currentPage:
              get().currentPage?.id === pageId && get().currentPage
                ? { ...get().currentPage, ...data, updated_at: updated.updated_at }
                : get().currentPage,
          })
        },

        deletePage: async (pageId: string) => {
          const { error } = await supabase
            .from('notebook_pages')
            .delete()
            .eq('id', pageId)

          if (error) throw error

          const { pages, currentPage } = get()

          // Remove the page and any children
          const removePageAndChildren = (id: string): string[] => {
            const children = pages.filter((p) => p.parent_page_id === id)
            return [id, ...children.flatMap((c) => removePageAndChildren(c.id))]
          }

          const idsToRemove = removePageAndChildren(pageId)
          const remainingPages = pages.filter((p) => !idsToRemove.includes(p.id))

          // If we deleted the current page, select another page
          let newCurrentPage = currentPage
          if (currentPage?.id === pageId || idsToRemove.includes(currentPage?.id || '')) {
            // Try to select the first remaining page, or null if none left
            newCurrentPage = remainingPages.length > 0 
              ? remainingPages.sort((a, b) => a.sort_order - b.sort_order)[0]
              : null
          }

          set({
            pages: remainingPages,
            currentPage: newCurrentPage,
          })
        },

        setCurrentPage: (page) => {
          set({ currentPage: page })
        },

        // --------------------------------------------------------------------
        // PAGE CONTENT
        // --------------------------------------------------------------------

        updatePageContent: async (pageId: string, content: Value) => {
          await get().updatePage(pageId, { content })
        },

        // --------------------------------------------------------------------
        // NESTED PAGES
        // --------------------------------------------------------------------

        movePage: async (pageId: string, newParentId: string | null, newSortOrder: number) => {
          await get().updatePage(pageId, {
            parent_page_id: newParentId,
            sort_order: newSortOrder,
          })
        },

        getPageTree: (): NotebookPage[] => {
          const { pages } = get()

          const buildTree = (parentId: string | null): NotebookPage[] => {
            return pages
              .filter((p) => p.parent_page_id === parentId)
              .sort((a, b) => a.sort_order - b.sort_order)
              .map((page) => ({
                ...page,
                children: buildTree(page.id),
              }))
          }

          return buildTree(null)
        },

        // --------------------------------------------------------------------
        // LINKS
        // --------------------------------------------------------------------

        addLink: async (pageId: string, linkType: LinkType, linkId: string): Promise<NotebookLink> => {
          const { data, error } = await supabase
            .from('notebook_links')
            .insert({
              page_id: pageId,
              link_type: linkType,
              link_id: linkId,
            })
            .select()
            .single()

          if (error) throw error

          const link = data as NotebookLink

          set({
            pages: get().pages.map((p) =>
              p.id === pageId
                ? { ...p, links: [...(p.links || []), link] }
                : p
            ),
          })

          return link
        },

        removeLink: async (linkId: string) => {
          const { error } = await supabase
            .from('notebook_links')
            .delete()
            .eq('id', linkId)

          if (error) throw error

          set({
            pages: get().pages.map((p) => ({
              ...p,
              links: p.links?.filter((l) => l.id !== linkId),
            })),
          })
        },

        getLinkedPages: (linkType: LinkType, linkId: string): NotebookPage[] => {
          return get().pages.filter((p) =>
            p.links?.some((l) => l.link_type === linkType && l.link_id === linkId)
          )
        },

        // --------------------------------------------------------------------
        // TAGS
        // --------------------------------------------------------------------

        addTag: async (pageId: string, tag: string) => {
          const normalizedTag = tag.toLowerCase().trim()

          const { error } = await supabase
            .from('notebook_tags')
            .insert({
              page_id: pageId,
              tag: normalizedTag,
            })

          if (error) {
            // Ignore duplicate tag errors
            if (error.code !== '23505') throw error
            return
          }

          set({
            pages: get().pages.map((p) =>
              p.id === pageId
                ? { ...p, tags: [...(p.tags || []), normalizedTag] }
                : p
            ),
          })

          get().loadAllTags()
        },

        removeTag: async (pageId: string, tag: string) => {
          const { error } = await supabase
            .from('notebook_tags')
            .delete()
            .eq('page_id', pageId)
            .eq('tag', tag)

          if (error) throw error

          set({
            pages: get().pages.map((p) =>
              p.id === pageId
                ? { ...p, tags: p.tags?.filter((t) => t !== tag) }
                : p
            ),
          })

          get().loadAllTags()
        },

        loadAllTags: () => {
          const { pages } = get()
          const tags = new Set<string>()
          for (const p of pages) {
            if (p.tags) {
              for (const t of p.tags) {
                tags.add(t)
              }
            }
          }
          set({ allTags: Array.from(tags).sort() })
        },

        // --------------------------------------------------------------------
        // ATTACHMENTS
        // --------------------------------------------------------------------

        uploadAttachment: async (pageId: string, file: File): Promise<NotebookAttachment> => {
          const { notebook } = get()
          if (!notebook) throw new Error('No notebook loaded')

          // Upload to Supabase storage
          const fileName = `${Date.now()}-${file.name}`
          const storagePath = `notebooks/${notebook.id}/${pageId}/${fileName}`

          const { error: uploadError } = await supabase.storage
            .from('notebook-attachments')
            .upload(storagePath, file)

          if (uploadError) throw uploadError

          // Determine file type
          let fileType: 'image' | 'video' | 'audio' | 'document' = 'document'
          if (file.type.startsWith('image/')) fileType = 'image'
          else if (file.type.startsWith('video/')) fileType = 'video'
          else if (file.type.startsWith('audio/')) fileType = 'audio'

          // Create attachment record
          const { data, error } = await supabase
            .from('notebook_attachments')
            .insert({
              page_id: pageId,
              storage_path: storagePath,
              file_name: file.name,
              file_type: fileType,
              mime_type: file.type,
              file_size: file.size,
            })
            .select()
            .single()

          if (error) throw error

          const attachment = data as NotebookAttachment

          set({
            pages: get().pages.map((p) =>
              p.id === pageId
                ? { ...p, attachments: [...(p.attachments || []), attachment] }
                : p
            ),
          })

          return attachment
        },

        deleteAttachment: async (attachmentId: string) => {
          // Get attachment to find storage path
          const { pages } = get()
          let attachment: NotebookAttachment | undefined
          for (const page of pages) {
            attachment = page.attachments?.find((a) => a.id === attachmentId)
            if (attachment) break
          }

          if (attachment) {
            // Delete from storage
            await supabase.storage
              .from('notebook-attachments')
              .remove([attachment.storage_path])
          }

          // Delete record
          const { error } = await supabase
            .from('notebook_attachments')
            .delete()
            .eq('id', attachmentId)

          if (error) throw error

          set({
            pages: pages.map((p) => ({
              ...p,
              attachments: p.attachments?.filter((a) => a.id !== attachmentId),
            })),
          })
        },

        // --------------------------------------------------------------------
        // SEARCH
        // --------------------------------------------------------------------

        searchPages: (query: string): NotebookPage[] => {
          if (!query.trim()) return get().pages

          const lowerQuery = query.toLowerCase()
          return get().pages.filter((page) => {
            // Search in title
            if (page.title.toLowerCase().includes(lowerQuery)) return true

            // Search in tags
            if (page.tags?.some((t) => t.includes(lowerQuery))) return true

            // Search in content (simplified - just looks at text nodes)
            const contentStr = JSON.stringify(page.content).toLowerCase()
            if (contentStr.includes(lowerQuery)) return true

            return false
          })
        },

        // --------------------------------------------------------------------
        // UI STATE
        // --------------------------------------------------------------------

        setError: (error) => set({ error }),
        clearError: () => set({ error: null }),

        // --------------------------------------------------------------------
        // RESET
        // --------------------------------------------------------------------

        reset: () => {
          set({
            ...initialUIState,
            ...initialDataState,
          })
        },
      }),
      {
        name: 'notebook-store',
        partialize: (state) => ({
          // Only persist UI preferences
          isSidebarOpen: state.isSidebarOpen,
          isSidebarCollapsed: state.isSidebarCollapsed,
        }),
      }
    ),
    { name: 'NotebookStore' }
  )
)

// ============================================================================
// SELECTORS
// ============================================================================

export const useNotebook = () => useNotebookStore((state) => state.notebook)
export const useNotebookPages = () => useNotebookStore((state) => state.pages)
export const useCurrentPage = () => useNotebookStore((state) => state.currentPage)
export const useNotebookLoading = () =>
  useNotebookStore((state) => state.notebookLoading || state.pagesLoading)
export const useNotebookError = () => useNotebookStore((state) => state.error)
export const usePageTree = () => useNotebookStore((state) => state.getPageTree())
export const useAllTags = () => useNotebookStore((state) => state.allTags)
