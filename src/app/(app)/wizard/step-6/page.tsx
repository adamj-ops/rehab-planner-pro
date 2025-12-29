import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-6 (Timeline) is now at /project/[id]/timeline
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/timeline
export default function Step6Redirect() {
  redirect("/dashboard");
}
