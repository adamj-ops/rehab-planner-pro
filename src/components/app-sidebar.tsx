"use client";

import * as React from "react";
import { AppLogo } from "@/components/app-logo";
import { NavSimple } from "@/components/nav-simple";
import { NavAction } from "@/components/nav-action";
import { NavUser } from "@/components/nav-user";
import { ThemeSwitch } from "@/components/shadcn-studio/switch/switch-11";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
  SidebarSeparator,
  SidebarGroup,
  SidebarGroupContent,
} from "@/components/ui/sidebar";
import {
  mainNavItems,
  actionNavItems,
  toolNavItems,
  settingsNavItems,
} from "@/lib/navigation";

// Placeholder user data - will be replaced with auth context
const userData = {
  name: "Property Investor",
  email: "investor@example.com",
  avatar: "",
};

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <AppLogo />
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <NavSimple items={mainNavItems} label="Navigation" />
        
        {/* New Project CTA */}
        <NavAction items={actionNavItems} />
        
        <SidebarSeparator />
        
        {/* Tools */}
        <NavSimple items={toolNavItems} label="Tools" />
        
        <SidebarSeparator />
        
        {/* Settings */}
        <NavSimple items={settingsNavItems} label="Settings" />
      </SidebarContent>
      
      <SidebarFooter>
        <SidebarGroup>
          <SidebarGroupContent className="flex justify-center py-2">
            <ThemeSwitch />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <NavUser user={userData} />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
