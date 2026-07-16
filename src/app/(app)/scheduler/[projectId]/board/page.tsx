"use client";

import { use } from "react";
import { BoardView } from "@/components/scheduler/views/board-view";

export default function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  return <BoardView projectId={projectId} />;
}
