import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { ProjectSidebar } from "@/components/project/project-sidebar";
import { ProjectProvider } from "@/components/project/project-provider";

export default async function ProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <ProjectProvider projectId={id}>
      <SidebarProvider>
        <ProjectSidebar projectId={id} />
        <SidebarInset>
          <div className="flex flex-1 flex-col">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </ProjectProvider>
  );
}
