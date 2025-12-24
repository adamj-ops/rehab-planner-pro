"use client";

import Link from "next/link";
import type { TablerIconsProps } from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { Button } from "@/components/ui/button";
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Tabler icon type
type TablerIcon = ForwardRefExoticComponent<TablerIconsProps & RefAttributes<SVGSVGElement>>;

export interface NavActionItem {
  title: string;
  href: string;
  icon: TablerIcon;
}

interface NavActionProps {
  items: NavActionItem[];
}

export function NavAction({ items }: NavActionProps) {
  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <SidebarMenuItem key={item.title}>
              {/* Button with rounded-none for Mira theme */}
              <Button asChild className="w-full justify-start gap-2 rounded-none" size="sm">
                <Link href={item.href}>
                  <Icon className="h-4 w-4" />
                  <span>{item.title}</span>
                </Link>
              </Button>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
