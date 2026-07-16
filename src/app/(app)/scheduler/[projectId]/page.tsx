import { redirect } from "next/navigation";

export default async function SchedulerProjectIndex({
  params,
}: {
  params: Promise<{ projectId: string }>;
}) {
  const { projectId } = await params;
  redirect(`/scheduler/${projectId}/timeline`);
}
