"use client";

import { use } from "react";
import { ProjectHeader } from "@/components/scheduler/project-header";

export default function SchedulerProjectLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = use(params);

  return (
    <div className="flex h-full flex-col text-[14px] [letter-spacing:-0.01em]">
      <ProjectHeader projectId={projectId} />
      <div className="min-h-0 flex-1 overflow-hidden">{children}</div>
    </div>
  );
}
