import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-4/color is now at /project/[id]/design/colors
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/design/colors
export default function Step4ColorRedirect() {
  redirect("/dashboard");
}
