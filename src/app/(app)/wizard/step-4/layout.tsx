"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { step4Tabs } from "@/lib/navigation";
import { 
  IconWand, 
  IconColorPicker, 
  IconBuildingWarehouse, 
  IconPhoto 
} from "@tabler/icons-react";

const tabIcons: Record<string, React.ReactNode> = {
  style: <IconWand className="h-4 w-4" />,
  color: <IconColorPicker className="h-4 w-4" />,
  materials: <IconBuildingWarehouse className="h-4 w-4" />,
  moodboard: <IconPhoto className="h-4 w-4" />,
};

export default function Step4Layout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Determine active tab from pathname
  const activeTab = step4Tabs.find((tab) => pathname === tab.path)?.value ?? "style";

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Design Intelligence
        </h1>
        <p className="text-zinc-600 dark:text-zinc-400">
          Select colors, materials, and create moodboards for your project.
        </p>
      </div>

      <Tabs value={activeTab} className="w-full">
        {/* TabsList with rounded-none for Mira theme */}
        <TabsList className="grid w-full grid-cols-4 rounded-none">
          {step4Tabs.map((tab) => (
            <TabsTrigger 
              key={tab.value} 
              value={tab.value} 
              asChild
              className="rounded-none"
            >
              <Link href={tab.path} className="flex items-center gap-2">
                {tabIcons[tab.value]}
                <span className="hidden sm:inline">{tab.label}</span>
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {/* Tab Content */}
      {children}
    </div>
  );
}
