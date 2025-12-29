import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-7 (Review) is now at /project/[id]/review
// Since we don't have a project context here, redirect to dashboard
// Users should access this via /project/[id]/review
export default function Step7Redirect() {
  redirect("/dashboard");
}
