import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-4/materials is now at /project/[id]/design/materials
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/design/materials
export default function Step4MaterialsRedirect() {
  redirect("/dashboard");
}
