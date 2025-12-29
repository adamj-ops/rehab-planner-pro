"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// Inner component that uses useSearchParams
function AuthRedirect() {
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

// Redirect old /auth route to new /login route
// Preserves redirectTo parameter for post-login navigation
export default function AuthPage() {
  return (
    <Suspense fallback={null}>
      <AuthRedirect />
    </Suspense>
  );
}
