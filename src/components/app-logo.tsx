"use client";

import Link from "next/link";
import { IconHammer } from "@tabler/icons-react";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { appInfo } from "@/lib/navigation";

export function AppLogo() {
  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton size="lg" asChild>
          <Link href="/dashboard">
            {/* NO rounded-lg - sharp corners per Mira theme */}
            <div className="flex aspect-square size-8 items-center justify-center bg-primary text-primary-foreground">
              <IconHammer className="size-4" />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{appInfo.name}</span>
              <span className="truncate text-xs text-muted-foreground">
                {appInfo.description}
              </span>
            </div>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
