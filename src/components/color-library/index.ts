/**
 * Color Library Components
 * 
 * Modern color wall interface with Wall/Grid views,
 * search, filters, favorites, and detail sheets.
 */

// Main container
export { ColorWall } from './ColorWall';

// View components
export { ColorWallView } from './ColorWallView';
export { ColorGridView } from './ColorGridView';

// Individual components
export { ColorSwatch } from './ColorSwatch';
export { ColorCard } from './ColorCard';
export { ColorFamilyPills } from './ColorFamilyPills';

// Project palette components
export { ProjectPaletteBar, SURFACE_LABELS, ROOM_LABELS } from './ProjectPaletteBar';
export { AddToProjectDialog, type AddToProjectConfig } from './AddToProjectDialog';
export { EditSelectionDialog, type EditSelectionConfig } from './EditSelectionDialog';

// Sheets
export { ColorDetailSheet } from './ColorDetailSheet';
export { FilterSheet } from './FilterSheet';
