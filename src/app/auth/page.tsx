"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

// Redirect old /auth route to new /login route
export default function AuthPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/login");
  }, [router]);

  return null;
}
