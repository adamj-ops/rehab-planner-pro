import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type {
  ColorLibraryItem,
  ProjectColorSelection,
  ProjectMaterialSelection,
  MaterialLibraryItem,
  Moodboard,
  MoodboardElement,
  ColorPalette,
  DesignStyle,
  RoomType,
  ColorSearchFilters,
  MaterialSearchFilters,
  RoomDesignSummary,
} from '@/types/design'

// ----------------------------------------------------------------------------
// STATE TYPES
// ----------------------------------------------------------------------------

interface DesignUIState {
  // Active selections
  selectedColorId: string | null
  selectedMaterialId: string | null
  selectedMoodboardId: string | null
  selectedElementId: string | null
  
  // Active room for color/material selection
  activeRoom: RoomType | null
  
  // Modals and panels
  isColorBrowserOpen: boolean
  isMaterialBrowserOpen: boolean
  isPaletteGeneratorOpen: boolean
  isShareDialogOpen: boolean
  
  // Search/filter state
  colorFilters: ColorSearchFilters
  materialFilters: MaterialSearchFilters
  
  // View settings
  colorViewMode: 'grid' | 'list'
  materialViewMode: 'grid' | 'list'
  showColorNames: boolean
  showColorCodes: boolean
}

interface DesignDataState {
  // Project context
  projectId: string | null
  designStyle: DesignStyle | null
  
  // Color data
  colorLibrary: ColorLibraryItem[]
  colorLibraryLoading: boolean
  projectColorSelections: ProjectColorSelection[]
  colorSelectionsLoading: boolean
  selectedPalette: ColorPalette | null
  popularColors: ColorLibraryItem[]
  
  // Material data
  materialLibrary: MaterialLibraryItem[]
  materialLibraryLoading: boolean
  projectMaterialSelections: ProjectMaterialSelection[]
  materialSelectionsLoading: boolean
  
  // Moodboard data
  moodboards: Moodboard[]
  moodboardsLoading: boolean
  activeMoodboard: Moodboard | null
  moodboardElements: MoodboardElement[]
  elementsLoading: boolean
  
  // Undo/redo for moodboard
  moodboardHistory: MoodboardElement[][]
  moodboardHistoryIndex: number
}

interface DesignActions {
  // Project actions
  setProjectId: (projectId: string | null) => void
  setDesignStyle: (style: DesignStyle | null) => void
  
  // Color library actions
  setColorLibrary: (colors: ColorLibraryItem[]) => void
  setColorLibraryLoading: (loading: boolean) => void
  setPopularColors: (colors: ColorLibraryItem[]) => void
  
  // Color selection actions
  setProjectColorSelections: (selections: ProjectColorSelection[]) => void
  setColorSelectionsLoading: (loading: boolean) => void
  addColorSelection: (selection: ProjectColorSelection) => void
  updateColorSelection: (id: string, updates: Partial<ProjectColorSelection>) => void
  removeColorSelection: (id: string) => void
  
  // Color palette actions
  setSelectedPalette: (palette: ColorPalette | null) => void
  
  // Material library actions
  setMaterialLibrary: (materials: MaterialLibraryItem[]) => void
  setMaterialLibraryLoading: (loading: boolean) => void
  
  // Material selection actions
  setProjectMaterialSelections: (selections: ProjectMaterialSelection[]) => void
  setMaterialSelectionsLoading: (loading: boolean) => void
  addMaterialSelection: (selection: ProjectMaterialSelection) => void
  updateMaterialSelection: (id: string, updates: Partial<ProjectMaterialSelection>) => void
  removeMaterialSelection: (id: string) => void
  
  // Moodboard actions
  setMoodboards: (moodboards: Moodboard[]) => void
  setMoodboardsLoading: (loading: boolean) => void
  setActiveMoodboard: (moodboard: Moodboard | null) => void
  addMoodboard: (moodboard: Moodboard) => void
  updateMoodboard: (id: string, updates: Partial<Moodboard>) => void
  removeMoodboard: (id: string) => void
  
  // Moodboard element actions
  setMoodboardElements: (elements: MoodboardElement[]) => void
  setElementsLoading: (loading: boolean) => void
  addElement: (element: MoodboardElement) => void
  updateElement: (id: string, updates: Partial<MoodboardElement>) => void
  removeElement: (id: string) => void
  moveElement: (id: string, x: number, y: number) => void
  resizeElement: (id: string, width: number, height: number) => void
  bringToFront: (id: string) => void
  sendToBack: (id: string) => void
  
  // Undo/redo
  saveHistorySnapshot: () => void
  undo: () => void
  redo: () => void
  canUndo: () => boolean
  canRedo: () => boolean
  
  // UI actions
  setSelectedColorId: (id: string | null) => void
  setSelectedMaterialId: (id: string | null) => void
  setSelectedMoodboardId: (id: string | null) => void
  setSelectedElementId: (id: string | null) => void
  setActiveRoom: (room: RoomType | null) => void
  setColorBrowserOpen: (open: boolean) => void
  setMaterialBrowserOpen: (open: boolean) => void
  setPaletteGeneratorOpen: (open: boolean) => void
  setShareDialogOpen: (open: boolean) => void
  setColorFilters: (filters: Partial<ColorSearchFilters>) => void
  setMaterialFilters: (filters: Partial<MaterialSearchFilters>) => void
  setColorViewMode: (mode: 'grid' | 'list') => void
  setMaterialViewMode: (mode: 'grid' | 'list') => void
  setShowColorNames: (show: boolean) => void
  setShowColorCodes: (show: boolean) => void
  
  // Computed/derived
  getRoomDesignSummaries: () => RoomDesignSummary[]
  getCompletionPercentage: () => number
  
  // Reset
  resetDesignState: () => void
}

type DesignStore = DesignUIState & DesignDataState & DesignActions

// ----------------------------------------------------------------------------
// INITIAL STATE
// ----------------------------------------------------------------------------

const initialUIState: DesignUIState = {
  selectedColorId: null,
  selectedMaterialId: null,
  selectedMoodboardId: null,
  selectedElementId: null,
  activeRoom: null,
  isColorBrowserOpen: false,
  isMaterialBrowserOpen: false,
  isPaletteGeneratorOpen: false,
  isShareDialogOpen: false,
  colorFilters: {},
  materialFilters: {},
  colorViewMode: 'grid',
  materialViewMode: 'grid',
  showColorNames: true,
  showColorCodes: true,
}

const initialDataState: DesignDataState = {
  projectId: null,
  designStyle: null,
  colorLibrary: [],
  colorLibraryLoading: false,
  projectColorSelections: [],
  colorSelectionsLoading: false,
  selectedPalette: null,
  popularColors: [],
  materialLibrary: [],
  materialLibraryLoading: false,
  projectMaterialSelections: [],
  materialSelectionsLoading: false,
  moodboards: [],
  moodboardsLoading: false,
  activeMoodboard: null,
  moodboardElements: [],
  elementsLoading: false,
  moodboardHistory: [],
  moodboardHistoryIndex: -1,
}

// ----------------------------------------------------------------------------
// STORE IMPLEMENTATION
// ----------------------------------------------------------------------------

export const useDesignStore = create<DesignStore>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialUIState,
        ...initialDataState,

        // Project actions
        setProjectId: (projectId) => set({ projectId }),
        setDesignStyle: (designStyle) => set({ designStyle }),

        // Color library actions
        setColorLibrary: (colorLibrary) => set({ colorLibrary }),
        setColorLibraryLoading: (colorLibraryLoading) => set({ colorLibraryLoading }),
        setPopularColors: (popularColors) => set({ popularColors }),

        // Color selection actions
        setProjectColorSelections: (projectColorSelections) => set({ projectColorSelections }),
        setColorSelectionsLoading: (colorSelectionsLoading) => set({ colorSelectionsLoading }),
        addColorSelection: (selection) => set((state) => ({
          projectColorSelections: [...state.projectColorSelections, selection],
        })),
        updateColorSelection: (id, updates) => set((state) => ({
          projectColorSelections: state.projectColorSelections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
        removeColorSelection: (id) => set((state) => ({
          projectColorSelections: state.projectColorSelections.filter((s) => s.id !== id),
        })),

        // Color palette actions
        setSelectedPalette: (selectedPalette) => set({ selectedPalette }),

        // Material library actions
        setMaterialLibrary: (materialLibrary) => set({ materialLibrary }),
        setMaterialLibraryLoading: (materialLibraryLoading) => set({ materialLibraryLoading }),

        // Material selection actions
        setProjectMaterialSelections: (projectMaterialSelections) => set({ projectMaterialSelections }),
        setMaterialSelectionsLoading: (materialSelectionsLoading) => set({ materialSelectionsLoading }),
        addMaterialSelection: (selection) => set((state) => ({
          projectMaterialSelections: [...state.projectMaterialSelections, selection],
        })),
        updateMaterialSelection: (id, updates) => set((state) => ({
          projectMaterialSelections: state.projectMaterialSelections.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        })),
        removeMaterialSelection: (id) => set((state) => ({
          projectMaterialSelections: state.projectMaterialSelections.filter((s) => s.id !== id),
        })),

        // Moodboard actions
        setMoodboards: (moodboards) => set({ moodboards }),
        setMoodboardsLoading: (moodboardsLoading) => set({ moodboardsLoading }),
        setActiveMoodboard: (activeMoodboard) => set({ activeMoodboard }),
        addMoodboard: (moodboard) => set((state) => ({
          moodboards: [...state.moodboards, moodboard],
        })),
        updateMoodboard: (id, updates) => set((state) => ({
          moodboards: state.moodboards.map((m) =>
            m.id === id ? { ...m, ...updates } : m
          ),
          activeMoodboard: state.activeMoodboard?.id === id
            ? { ...state.activeMoodboard, ...updates }
            : state.activeMoodboard,
        })),
        removeMoodboard: (id) => set((state) => ({
          moodboards: state.moodboards.filter((m) => m.id !== id),
          activeMoodboard: state.activeMoodboard?.id === id ? null : state.activeMoodboard,
        })),

        // Moodboard element actions
        setMoodboardElements: (moodboardElements) => set({ moodboardElements }),
        setElementsLoading: (elementsLoading) => set({ elementsLoading }),
        addElement: (element) => {
          get().saveHistorySnapshot()
          set((state) => ({
            moodboardElements: [...state.moodboardElements, element],
          }))
        },
        updateElement: (id, updates) => {
          get().saveHistorySnapshot()
          set((state) => ({
            moodboardElements: state.moodboardElements.map((e) =>
              e.id === id ? { ...e, ...updates } : e
            ),
          }))
        },
        removeElement: (id) => {
          get().saveHistorySnapshot()
          set((state) => ({
            moodboardElements: state.moodboardElements.filter((e) => e.id !== id),
            selectedElementId: state.selectedElementId === id ? null : state.selectedElementId,
          }))
        },
        moveElement: (id, x, y) => {
          set((state) => ({
            moodboardElements: state.moodboardElements.map((e) =>
              e.id === id ? { ...e, positionX: x, positionY: y } : e
            ),
          }))
        },
        resizeElement: (id, width, height) => {
          set((state) => ({
            moodboardElements: state.moodboardElements.map((e) =>
              e.id === id ? { ...e, width, height } : e
            ),
          }))
        },
        bringToFront: (id) => {
          const { moodboardElements } = get()
          const maxZ = Math.max(...moodboardElements.map((e) => e.zIndex), 0)
          set((state) => ({
            moodboardElements: state.moodboardElements.map((e) =>
              e.id === id ? { ...e, zIndex: maxZ + 1 } : e
            ),
          }))
        },
        sendToBack: (id) => {
          const { moodboardElements } = get()
          const minZ = Math.min(...moodboardElements.map((e) => e.zIndex), 0)
          set((state) => ({
            moodboardElements: state.moodboardElements.map((e) =>
              e.id === id ? { ...e, zIndex: minZ - 1 } : e
            ),
          }))
        },

        // Undo/redo
        saveHistorySnapshot: () => {
          const { moodboardElements, moodboardHistory, moodboardHistoryIndex } = get()
          const newHistory = moodboardHistory.slice(0, moodboardHistoryIndex + 1)
          newHistory.push([...moodboardElements])
          
          // Keep only last 50 snapshots
          if (newHistory.length > 50) {
            newHistory.shift()
          }
          
          set({
            moodboardHistory: newHistory,
            moodboardHistoryIndex: newHistory.length - 1,
          })
        },
        undo: () => {
          const { moodboardHistory, moodboardHistoryIndex } = get()
          if (moodboardHistoryIndex > 0) {
            set({
              moodboardElements: [...moodboardHistory[moodboardHistoryIndex - 1]],
              moodboardHistoryIndex: moodboardHistoryIndex - 1,
            })
          }
        },
        redo: () => {
          const { moodboardHistory, moodboardHistoryIndex } = get()
          if (moodboardHistoryIndex < moodboardHistory.length - 1) {
            set({
              moodboardElements: [...moodboardHistory[moodboardHistoryIndex + 1]],
              moodboardHistoryIndex: moodboardHistoryIndex + 1,
            })
          }
        },
        canUndo: () => get().moodboardHistoryIndex > 0,
        canRedo: () => {
          const { moodboardHistory, moodboardHistoryIndex } = get()
          return moodboardHistoryIndex < moodboardHistory.length - 1
        },

        // UI actions
        setSelectedColorId: (selectedColorId) => set({ selectedColorId }),
        setSelectedMaterialId: (selectedMaterialId) => set({ selectedMaterialId }),
        setSelectedMoodboardId: (selectedMoodboardId) => set({ selectedMoodboardId }),
        setSelectedElementId: (selectedElementId) => set({ selectedElementId }),
        setActiveRoom: (activeRoom) => set({ activeRoom }),
        setColorBrowserOpen: (isColorBrowserOpen) => set({ isColorBrowserOpen }),
        setMaterialBrowserOpen: (isMaterialBrowserOpen) => set({ isMaterialBrowserOpen }),
        setPaletteGeneratorOpen: (isPaletteGeneratorOpen) => set({ isPaletteGeneratorOpen }),
        setShareDialogOpen: (isShareDialogOpen) => set({ isShareDialogOpen }),
        setColorFilters: (filters) => set((state) => ({
          colorFilters: { ...state.colorFilters, ...filters },
        })),
        setMaterialFilters: (filters) => set((state) => ({
          materialFilters: { ...state.materialFilters, ...filters },
        })),
        setColorViewMode: (colorViewMode) => set({ colorViewMode }),
        setMaterialViewMode: (materialViewMode) => set({ materialViewMode }),
        setShowColorNames: (showColorNames) => set({ showColorNames }),
        setShowColorCodes: (showColorCodes) => set({ showColorCodes }),

        // Computed/derived
        getRoomDesignSummaries: () => {
          const { projectColorSelections, projectMaterialSelections } = get()
          
          // Get unique rooms from selections
          const roomsMap = new Map<string, RoomDesignSummary>()
          
          projectColorSelections.forEach((selection) => {
            const key = `${selection.roomType}-${selection.roomName || 'default'}`
            const existing = roomsMap.get(key) || {
              roomType: selection.roomType,
              roomName: selection.roomName,
              colorSelections: [],
              materialSelections: [],
              totalEstimatedCost: 0,
              isComplete: false,
            }
            existing.colorSelections.push(selection)
            roomsMap.set(key, existing)
          })
          
          projectMaterialSelections.forEach((selection) => {
            if (!selection.roomType) return
            const key = `${selection.roomType}-${selection.roomName || 'default'}`
            const existing = roomsMap.get(key) || {
              roomType: selection.roomType,
              roomName: selection.roomName,
              colorSelections: [],
              materialSelections: [],
              totalEstimatedCost: 0,
              isComplete: false,
            }
            existing.materialSelections.push(selection)
            if (selection.totalCost) {
              existing.totalEstimatedCost += selection.totalCost
            }
            roomsMap.set(key, existing)
          })
          
          return Array.from(roomsMap.values())
        },
        
        getCompletionPercentage: () => {
          const { projectColorSelections, projectMaterialSelections, moodboards } = get()
          
          // Simple completion calculation
          let totalItems = 0
          let completedItems = 0
          
          // Colors: at least one approved
          totalItems++
          if (projectColorSelections.some((s) => s.isApproved)) completedItems++
          
          // Materials: at least one approved
          totalItems++
          if (projectMaterialSelections.some((s) => s.isApproved)) completedItems++
          
          // Moodboard: at least one exists
          totalItems++
          if (moodboards.length > 0) completedItems++
          
          return Math.round((completedItems / totalItems) * 100)
        },

        // Reset
        resetDesignState: () => set({
          ...initialUIState,
          ...initialDataState,
        }),
      }),
      {
        name: 'design-store',
        partialize: (state) => ({
          // Only persist UI preferences, not data
          colorViewMode: state.colorViewMode,
          materialViewMode: state.materialViewMode,
          showColorNames: state.showColorNames,
          showColorCodes: state.showColorCodes,
        }),
      }
    ),
    { name: 'DesignStore' }
  )
)

// ----------------------------------------------------------------------------
// SELECTOR HOOKS
// ----------------------------------------------------------------------------

export const useSelectedColor = () => {
  const selectedColorId = useDesignStore((state) => state.selectedColorId)
  const colorLibrary = useDesignStore((state) => state.colorLibrary)
  return colorLibrary.find((c) => c.id === selectedColorId) || null
}

export const useSelectedMaterial = () => {
  const selectedMaterialId = useDesignStore((state) => state.selectedMaterialId)
  const materialLibrary = useDesignStore((state) => state.materialLibrary)
  return materialLibrary.find((m) => m.id === selectedMaterialId) || null
}

export const useRoomColorSelections = (roomType: RoomType, roomName?: string) => {
  const selections = useDesignStore((state) => state.projectColorSelections)
  return selections.filter(
    (s) => s.roomType === roomType && (!roomName || s.roomName === roomName)
  )
}

export const useRoomMaterialSelections = (roomType: RoomType, roomName?: string) => {
  const selections = useDesignStore((state) => state.projectMaterialSelections)
  return selections.filter(
    (s) => s.roomType === roomType && (!roomName || s.roomName === roomName)
  )
}

