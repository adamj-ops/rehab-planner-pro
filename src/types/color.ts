/**
 * @file color.ts
 * @description Color-related types for the Color Wall feature
 * 
 * Re-exports ColorLibrary from database.ts and adds convenience types
 * for the Color Wall UI components.
 */

// Re-export the main color type from database.ts
export type { 
  ColorLibrary as Color,
  ColorLibraryInsert,
  ColorLibraryUpdate,
  ProjectColorSelection,
  ProjectColorSelectionInsert,
  ProjectColorSelectionUpdate,
  ProjectColorSelectionWithColor,
  RGBValues,
} from './database';

// ============================================================================
// COLOR WALL UI TYPES
// ============================================================================

/**
 * Color family filter options
 * Maps to color_family column in color_library table
 */
export type ColorFamily = 
  | "all" 
  | "white" 
  | "gray" 
  | "beige" 
  | "blue" 
  | "green" 
  | "red" 
  | "yellow" 
  | "orange"
  | "purple"
  | "brown"
  | "black";

/**
 * Design style filter options
 * Maps to design_styles array in color_library table
 */
export type DesignStyle = 
  | "modern_farmhouse"
  | "contemporary"
  | "traditional"
  | "transitional"
  | "coastal"
  | "industrial"
  | "rustic"
  | "minimalist"
  | "bohemian";

/**
 * View mode for the Color Wall
 */
export type ViewMode = "wall" | "grid";

/**
 * Surface types for color application
 */
export type SurfaceType = 
  | "walls"
  | "trim"
  | "ceiling"
  | "cabinets"
  | "doors"
  | "accent";

/**
 * Room types for color recommendations
 */
export type RoomType = 
  | "living_room"
  | "bedroom"
  | "kitchen"
  | "bathroom"
  | "dining_room"
  | "hallway"
  | "office"
  | "basement"
  | "garage";

// ============================================================================
// COLOR FAMILY CONFIGURATION
// ============================================================================

export interface ColorFamilyConfig {
  value: ColorFamily;
  label: string;
  gradient: string;
}

export const COLOR_FAMILIES: readonly ColorFamilyConfig[] = [
  { 
    value: "all", 
    label: "All Colors",
    gradient: "from-zinc-100 to-zinc-200 dark:from-zinc-800 dark:to-zinc-700"
  },
  { 
    value: "white", 
    label: "Whites",
    gradient: "from-white to-zinc-50 dark:from-zinc-100 dark:to-zinc-200"
  },
  { 
    value: "gray", 
    label: "Grays",
    gradient: "from-zinc-300 to-zinc-500 dark:from-zinc-600 dark:to-zinc-400"
  },
  { 
    value: "beige", 
    label: "Beiges",
    gradient: "from-amber-50 to-amber-200 dark:from-amber-900/30 dark:to-amber-800/30"
  },
  { 
    value: "blue", 
    label: "Blues",
    gradient: "from-blue-300 to-blue-500 dark:from-blue-600 dark:to-blue-400"
  },
  { 
    value: "green", 
    label: "Greens",
    gradient: "from-green-300 to-green-500 dark:from-green-600 dark:to-green-400"
  },
  { 
    value: "red", 
    label: "Reds",
    gradient: "from-red-300 to-red-500 dark:from-red-600 dark:to-red-400"
  },
  { 
    value: "yellow", 
    label: "Yellows",
    gradient: "from-yellow-300 to-yellow-500 dark:from-yellow-600 dark:to-yellow-400"
  },
  { 
    value: "brown", 
    label: "Browns",
    gradient: "from-amber-700 to-amber-900 dark:from-amber-600 dark:to-amber-800"
  },
] as const;

// ============================================================================
// DESIGN STYLE CONFIGURATION
// ============================================================================

export interface DesignStyleConfig {
  value: DesignStyle;
  label: string;
}

export const DESIGN_STYLES: readonly DesignStyleConfig[] = [
  { value: "modern_farmhouse", label: "Modern Farmhouse" },
  { value: "contemporary", label: "Contemporary" },
  { value: "traditional", label: "Traditional" },
  { value: "transitional", label: "Transitional" },
  { value: "coastal", label: "Coastal" },
  { value: "industrial", label: "Industrial" },
  { value: "rustic", label: "Rustic" },
] as const;
