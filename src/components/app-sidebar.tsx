"use client";

import * as React from "react";
import { AppLogo } from "@/components/app-logo";
import { NavSimple } from "@/components/nav-simple";
import { NavAction } from "@/components/nav-action";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import {
  mainNavItems,
  actionNavItems,
  settingsNavItems,
  helpNavItems,
} from "@/lib/navigation";

// Placeholder user data - will be replaced with auth context
const userData = {
  name: "Property Investor",
  email: "investor@example.com",
  avatar: "",
};

/**
 * Global Sidebar - Used outside of project context
 * Shows: Dashboard, New Project, Settings (with Libraries & Contractors), Help
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>

      <SidebarContent>
        {/* Main Navigation - Dashboard */}
        <NavSimple items={mainNavItems} label="Navigation" />

        {/* New Project CTA */}
        <NavAction items={actionNavItems} />

        <SidebarSeparator />

        {/* Settings - includes Libraries & Contractors */}
        <NavSimple items={settingsNavItems} label="Settings" />

        <SidebarSeparator />

        {/* Help */}
        <NavSimple items={helpNavItems} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={userData} />
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
