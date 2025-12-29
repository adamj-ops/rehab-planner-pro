import { redirect } from "next/navigation";

// Settings index page redirects to profile
export default function SettingsPage() {
  redirect("/settings/profile");
}
