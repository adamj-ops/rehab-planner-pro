"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Redirect old /auth route to new /login route
// Preserves redirectTo parameter for post-login navigation
export default function AuthPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    const redirectTo = searchParams.get('redirectTo');
    const loginUrl = redirectTo 
      ? `/login?redirectTo=${encodeURIComponent(redirectTo)}`
      : "/login";
    router.replace(loginUrl);
  }, [router, searchParams]);

  return null;
}
