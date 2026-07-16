"use client";

import { use } from "react";
import { TimelineView } from "@/components/scheduler/views/timeline-view";

export default function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  return <TimelineView projectId={projectId} />;
}
