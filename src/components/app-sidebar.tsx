"use client";

import * as React from "react";
import { AppLogo } from "@/components/app-logo";
import { NavSimple } from "@/components/nav-simple";
import { NavAction } from "@/components/nav-action";
import { NavUserAuth } from "@/components/nav-user-auth";
import { ThemeSwitcherToggle } from "@/components/elements/theme-switcher-toggle";
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
            <ThemeSwitcherToggle />
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarSeparator />
        <NavUserAuth />
      </SidebarFooter>
      
      <SidebarRail />
    </Sidebar>
  );
}
