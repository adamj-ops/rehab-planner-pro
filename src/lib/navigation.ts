import {
  IconLayoutDashboard,
  IconHome,
  IconPlus,
  IconSettings,
  IconHelp,
  IconPalette,
  IconBuildingWarehouse,
  IconBriefcase,
  IconWand,
  IconColorPicker,
  IconPhoto,
  IconUser,
  IconArrowLeft,
  IconClipboardList,
  IconTarget,
  IconCalendar,
  IconUsers,
  IconFileCheck,
  IconDownload,
  IconEye,
  IconChartBar,
  IconRuler,
  IconBrush,
  type TablerIconsProps,
} from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";

// Tabler icon type
type TablerIcon = ForwardRefExoticComponent<TablerIconsProps & RefAttributes<SVGSVGElement>>;

export interface NavItem {
  title: string;
  href: string;
  icon: TablerIcon;
  isActive?: boolean;
  badge?: string;
  isComplete?: boolean;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// ============================================================================
// GLOBAL SIDEBAR NAVIGATION (Outside Projects)
// ============================================================================

// Main navigation items
export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
  },
];

// Quick actions
export const actionNavItems: NavItem[] = [
  {
    title: "New Project",
    href: "/project/new",
    icon: IconPlus,
  },
];

// Settings section (includes Libraries and Contractors)
export const settingsNavItems: NavItem[] = [
  {
    title: "My Profile",
    href: "/settings/profile",
    icon: IconUser,
  },
  {
    title: "Libraries",
    href: "/settings/libraries",
    icon: IconPalette,
  },
  {
    title: "Contractors",
    href: "/settings/contractors",
    icon: IconBriefcase,
  },
  {
    title: "Preferences",
    href: "/settings/preferences",
    icon: IconSettings,
  },
];

// Help section
export const helpNavItems: NavItem[] = [
  {
    title: "Help & Docs",
    href: "/help",
    icon: IconHelp,
  },
];

// ============================================================================
// PROJECT SIDEBAR NAVIGATION (Inside a Project)
// ============================================================================

export interface ProjectSection {
  label: string;
  items: {
    title: string;
    path: string; // relative path like 'details', 'condition'
    icon: TablerIcon;
  }[];
}

// Project sections for the conveyor belt
export const projectSections: ProjectSection[] = [
  {
    label: "Property",
    items: [
      { title: "Details", path: "details", icon: IconHome },
      { title: "Condition", path: "condition", icon: IconEye },
    ],
  },
  {
    label: "Planning",
    items: [
      { title: "Strategy", path: "strategy", icon: IconTarget },
      { title: "Scope", path: "scope", icon: IconClipboardList },
    ],
  },
  {
    label: "Design",
    items: [
      { title: "Style", path: "design/style", icon: IconWand },
      { title: "Colors", path: "design/colors", icon: IconColorPicker },
      { title: "Materials", path: "design/materials", icon: IconBuildingWarehouse },
      { title: "Moodboard", path: "design/moodboard", icon: IconPhoto },
    ],
  },
  {
    label: "Execution",
    items: [
      { title: "Priority", path: "priority", icon: IconChartBar },
      { title: "Timeline", path: "timeline", icon: IconCalendar },
      { title: "Team", path: "team", icon: IconUsers },
    ],
  },
  {
    label: "Complete",
    items: [
      { title: "Review", path: "review", icon: IconFileCheck },
      { title: "Export", path: "export", icon: IconDownload },
    ],
  },
];

// Generate full nav items for a specific project
export function getProjectNavItems(projectId: string): NavGroup[] {
  return projectSections.map((section) => ({
    label: section.label,
    items: section.items.map((item) => ({
      title: item.title,
      href: `/project/${projectId}/${item.path}`,
      icon: item.icon,
    })),
  }));
}

// ============================================================================
// LEGACY: Wizard navigation (for backwards compatibility / redirects)
// ============================================================================

// @deprecated - Use projectSections instead
export const toolNavItems: NavItem[] = [
  {
    title: "Color Library",
    href: "/settings/libraries/colors",
    icon: IconPalette,
  },
  {
    title: "Materials",
    href: "/settings/libraries/materials",
    icon: IconBuildingWarehouse,
  },
  {
    title: "Vendors",
    href: "/settings/contractors",
    icon: IconBriefcase,
  },
];

// Wizard steps for step navigation
export interface WizardStep {
  number: number;
  title: string;
  shortTitle: string;
  path: string;
  description: string;
}

export const wizardSteps: WizardStep[] = [
  {
    number: 1,
    title: "Property Details",
    shortTitle: "Property",
    path: "/wizard/step-1",
    description: "Enter property address and basic details",
  },
  {
    number: 2,
    title: "Current Condition",
    shortTitle: "Condition",
    path: "/wizard/step-2",
    description: "Assess the current state of the property",
  },
  {
    number: 3,
    title: "Investment Strategy",
    shortTitle: "Strategy",
    path: "/wizard/step-3",
    description: "Define your investment approach and target buyer",
  },
  {
    number: 4,
    title: "Design Intelligence",
    shortTitle: "Design",
    path: "/wizard/step-4",
    description: "Select colors, materials, and create moodboards",
  },
  {
    number: 5,
    title: "Priority Matrix",
    shortTitle: "Priority",
    path: "/wizard/step-5",
    description: "Prioritize renovations by ROI impact",
  },
  {
    number: 6,
    title: "Action Plan",
    shortTitle: "Action",
    path: "/wizard/step-6",
    description: "Create timeline and assign tasks",
  },
  {
    number: 7,
    title: "Review & Export",
    shortTitle: "Review",
    path: "/wizard/step-7",
    description: "Review estimates and export reports",
  },
];

// Step 4 tabs for Design Intelligence
export interface TabItem {
  value: string;
  label: string;
  path: string;
  icon?: TablerIcon;
}

export const step4Tabs: TabItem[] = [
  { value: "style", label: "Style", path: "/wizard/step-4", icon: IconWand },
  { value: "color", label: "Colors", path: "/wizard/step-4/color", icon: IconColorPicker },
  { value: "materials", label: "Materials", path: "/wizard/step-4/materials", icon: IconBuildingWarehouse },
  { value: "moodboard", label: "Moodboard", path: "/wizard/step-4/moodboard", icon: IconPhoto },
];

// App info
export const appInfo = {
  name: "Rehab Planner Pro",
  shortName: "RPP",
  description: "Fix & Flip Investment Estimator",
  version: "1.0.0",
};
