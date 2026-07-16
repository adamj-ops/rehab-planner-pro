"use client";

import { use } from "react";
import { CalendarView } from "@/components/scheduler/views/calendar-view";

export default function Page({ params }: { params: Promise<{ projectId: string }> }) {
  const { projectId } = use(params);
  return <CalendarView projectId={projectId} />;
}
