import { redirect } from "next/navigation";

// Redirect wizard root to new project creation
export default function WizardPage() {
  redirect("/project/new");
}
