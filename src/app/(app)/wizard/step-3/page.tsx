import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-3 (Strategy) is now at /project/[id]/strategy
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/strategy
export default function Step3Redirect() {
  redirect("/dashboard");
}
