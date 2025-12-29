import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-4/moodboard is now at /project/[id]/design/moodboard
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/design/moodboard
export default function Step4MoodboardRedirect() {
  redirect("/dashboard");
}
