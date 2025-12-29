import { redirect } from "next/navigation";

// DEPRECATED: /projects is now merged into /dashboard
// The dashboard will display the projects grid
export default function ProjectsRedirect() {
  redirect("/dashboard");
}
