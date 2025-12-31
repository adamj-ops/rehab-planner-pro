"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function OnboardingIndexPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to step 1
    router.replace("/onboarding/step-1");
  }, [router]);

  return null;
}
