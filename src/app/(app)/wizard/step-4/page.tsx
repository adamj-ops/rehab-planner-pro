import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-4 (Design) is now at /project/[id]/design
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/design/style
export default function Step4Redirect() {
  redirect("/dashboard");
}
