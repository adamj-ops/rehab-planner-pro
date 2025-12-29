import { redirect } from "next/navigation";

// DEPRECATED: Wizard step-1 is now replaced by /project/new
// This redirect ensures old bookmarks and links continue to work
export default function Step1Redirect() {
  redirect("/project/new");
}
