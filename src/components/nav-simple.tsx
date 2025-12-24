"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { TablerIconsProps } from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import { cn } from "@/lib/utils";

import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";

// Tabler icon type
type TablerIcon = ForwardRefExoticComponent<TablerIconsProps & RefAttributes<SVGSVGElement>>;

export interface NavSimpleItem {
  title: string;
  href: string;
  icon: TablerIcon;
  badge?: string;
}

interface NavSimpleProps {
  items: NavSimpleItem[];
  label?: string;
}

export function NavSimple({ items, label }: NavSimpleProps) {
  const pathname = usePathname();

  return (
    <SidebarGroup>
      {label && <SidebarGroupLabel>{label}</SidebarGroupLabel>}
      <SidebarMenu>
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          
          return (
            <SidebarMenuItem key={item.title}>
              <SidebarMenuButton
                asChild
                tooltip={item.title}
                isActive={isActive}
              >
                <Link href={item.href}>
                  <Icon className={cn("size-4", isActive && "text-primary")} />
                  <span>{item.title}</span>
                  {item.badge && (
                    // NO rounded - sharp corners per Mira theme
                    <span className="ml-auto text-xs bg-primary/10 text-primary px-1.5 py-0.5">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
