import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-5 (Priority) is now at /project/[id]/priority
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/priority
export default function Step5Redirect() {
  redirect("/dashboard");
}
