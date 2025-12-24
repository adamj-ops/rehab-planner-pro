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
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

// Main navigation items
export const mainNavItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: IconLayoutDashboard,
  },
  {
    title: "My Projects",
    href: "/projects",
    icon: IconHome,
  },
];

// Quick actions
export const actionNavItems: NavItem[] = [
  {
    title: "New Project",
    href: "/wizard/step-1",
    icon: IconPlus,
  },
];

// Tools section
export const toolNavItems: NavItem[] = [
  {
    title: "Color Library",
    href: "/colors",
    icon: IconPalette,
  },
  {
    title: "Materials",
    href: "/materials",
    icon: IconBuildingWarehouse,
  },
  {
    title: "Vendors",
    href: "/vendors",
    icon: IconBriefcase,
  },
];

// Settings section
export const settingsNavItems: NavItem[] = [
  {
    title: "Settings",
    href: "/settings",
    icon: IconSettings,
  },
  {
    title: "Help & Docs",
    href: "/help",
    icon: IconHelp,
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
