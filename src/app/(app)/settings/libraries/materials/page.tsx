"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MaterialGrid } from "@/components/design/MaterialLibrary";
import { IconBuildingWarehouse } from "@tabler/icons-react";

export default function MaterialLibraryPage() {
  return (
    <>
      <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
        <SidebarTrigger className="-ml-1" />
        <Separator orientation="vertical" className="mr-2 h-4" />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/settings">Settings</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href="/settings/libraries">Libraries</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem>
              <BreadcrumbPage>Materials</BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </header>

      <main className="flex-1 p-6">
        <Card className="rounded-none border-zinc-200 dark:border-zinc-700">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-zinc-900 dark:text-zinc-100">
              <IconBuildingWarehouse className="h-5 w-5" />
              Material Library
            </CardTitle>
            <CardDescription className="text-zinc-600 dark:text-zinc-400">
              Browse countertops, flooring, tile, fixtures, and more. To assign materials to a project, navigate to the project&apos;s Design section.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <MaterialGrid
              selectedMaterialId={undefined}
              onMaterialSelect={() => {}}
            />
          </CardContent>
        </Card>
      </main>
    </>
  );
}
