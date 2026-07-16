"use client";

import { use } from "react";
import { TableView } from "@/components/scheduler/views/table-view";

export default function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  return <TableView projectId={projectId} />;
}
