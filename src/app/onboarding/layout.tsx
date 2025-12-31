"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { IconLoader2 } from "@tabler/icons-react";
import { OnboardingProvider } from "@/components/onboarding";
import { useAuth } from "@/lib/auth/auth-context";
import type { OnboardingData, OnboardingStep } from "@/types/onboarding";

interface SavedOnboardingData extends Partial<OnboardingData> {
  currentStep?: OnboardingStep | null;
}

interface OnboardingStatusData {
  completed: boolean;
  completedAt: string | null;
}

export default function OnboardingRootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading: authLoading } = useAuth();

  const [savedData, setSavedData] = useState<SavedOnboardingData | null>(null);
  const [onboardingStatus, setOnboardingStatus] = useState<OnboardingStatusData | null>(null);
  const [dataLoading, setDataLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirectTo=/onboarding/step-1");
    }
  }, [user, authLoading, router]);

  // Fetch saved onboarding data and status
  useEffect(() => {
    async function fetchSavedData() {
      if (!user) return;

      try {
        // Fetch both data and status in parallel
        const [dataResponse, statusResponse] = await Promise.all([
          fetch("/api/onboarding/data"),
          fetch("/api/onboarding/status"),
        ]);

        if (dataResponse.status === 401 || statusResponse.status === 401) {
          // Not authenticated, will be handled by auth redirect
          return;
        }

        if (!dataResponse.ok) {
          throw new Error("Failed to fetch onboarding data");
        }

        const data = await dataResponse.json();
        setSavedData(data);

        if (statusResponse.ok) {
          const status = await statusResponse.json();
          setOnboardingStatus(status);
        }
      } catch (err) {
        console.error("Error fetching onboarding data:", err);
        setDataError(
          err instanceof Error ? err.message : "Failed to load saved data"
        );
        // Fallback to defaults on error
        setSavedData({});
      } finally {
        setDataLoading(false);
      }
    }

    if (user) {
      fetchSavedData();
    }
  }, [user]);

  // Redirect to dashboard if onboarding is already completed
  useEffect(() => {
    if (onboardingStatus?.completed) {
      router.replace("/dashboard");
    }
  }, [onboardingStatus, router]);

  // Redirect to saved step if user is on base onboarding path
  useEffect(() => {
    if (savedData?.currentStep && pathname === "/onboarding" && !onboardingStatus?.completed) {
      router.replace(`/onboarding/step-${savedData.currentStep}`);
    }
  }, [savedData, pathname, router, onboardingStatus]);

  // Show loading while checking auth or fetching data
  if (authLoading || dataLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if not authenticated
  if (!user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render if onboarding already completed (redirect in progress)
  if (onboardingStatus?.completed) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Log data error but continue with defaults
  if (dataError) {
    console.warn("Onboarding data error:", dataError);
  }

  // Determine initial step - prefer saved step, fallback to 1
  const initialStep: OnboardingStep = savedData?.currentStep ?? 1;

  // Merge saved data with user metadata
  const initialData: Partial<OnboardingData> = {
    firstName:
      savedData?.firstName || user.user_metadata?.first_name || "",
    lastName:
      savedData?.lastName || user.user_metadata?.last_name || "",
    investorType: savedData?.investorType ?? null,
    investmentStrategy: savedData?.investmentStrategy ?? null,
    propertyTypes: savedData?.propertyTypes ?? [],
    typicalBudget: savedData?.typicalBudget ?? null,
    projectsPerYear: savedData?.projectsPerYear ?? null,
    company: savedData?.company ?? "",
    phone: savedData?.phone ?? "",
  };

  return (
    <OnboardingProvider initialData={initialData} initialStep={initialStep}>
      {children}
    </OnboardingProvider>
  );
}
