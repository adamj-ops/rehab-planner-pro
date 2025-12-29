import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-2 (Condition) is now at /project/[id]/condition
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/condition
export default function Step2Redirect() {
  redirect("/dashboard");
}
