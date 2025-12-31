import { createClient } from "@/lib/supabase/server";
import type { OnboardingData, OnboardingStep } from "@/types/onboarding";

export interface OnboardingServiceResult<T = void> {
  data?: T;
  error?: string;
}

/**
 * Get onboarding status for the current user
 */
export async function getOnboardingStatus(): Promise<
  OnboardingServiceResult<{
    completed: boolean;
    completedAt: string | null;
  }>
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("users")
    .select("onboarding_completed, onboarding_completed_at")
    .eq("auth_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching onboarding status:", error);
    return { error: "Failed to fetch onboarding status" };
  }

  return {
    data: {
      completed: data?.onboarding_completed ?? false,
      completedAt: data?.onboarding_completed_at ?? null,
    },
  };
}

/**
 * Get saved onboarding data for the current user
 */
export async function getOnboardingData(): Promise<
  OnboardingServiceResult<Partial<OnboardingData> & { currentStep: OnboardingStep | null }>
> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  const { data, error } = await supabase
    .from("users")
    .select(
      `
      investor_type,
      investment_strategy,
      property_types,
      typical_budget,
      projects_per_year,
      full_name,
      company_name,
      phone,
      onboarding_current_step
    `
    )
    .eq("auth_id", user.id)
    .single();

  if (error) {
    console.error("Error fetching onboarding data:", error);
    return { error: "Failed to fetch onboarding data" };
  }

  // Parse full_name into first/last
  const nameParts = (data?.full_name || "").split(" ");
  const firstName = nameParts[0] || "";
  const lastName = nameParts.slice(1).join(" ") || "";

  // Validate and cast currentStep to OnboardingStep type
  const rawStep = data?.onboarding_current_step;
  const currentStep: OnboardingStep | null = 
    rawStep && rawStep >= 1 && rawStep <= 6 
      ? (rawStep as OnboardingStep) 
      : null;

  return {
    data: {
      investorType: data?.investor_type ?? null,
      investmentStrategy: data?.investment_strategy ?? null,
      propertyTypes: data?.property_types ?? [],
      typicalBudget: data?.typical_budget ?? null,
      projectsPerYear: data?.projects_per_year ?? null,
      firstName,
      lastName,
      company: data?.company_name ?? "",
      phone: data?.phone ?? "",
      currentStep,
    },
  };
}

/**
 * Complete onboarding and save all data
 */
export async function completeOnboarding(
  onboardingData: OnboardingData
): Promise<OnboardingServiceResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Combine first and last name
  const fullName = [onboardingData.firstName, onboardingData.lastName]
    .filter(Boolean)
    .join(" ");

  const { error } = await supabase
    .from("users")
    .update({
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
      investor_type: onboardingData.investorType,
      investment_strategy: onboardingData.investmentStrategy,
      property_types: onboardingData.propertyTypes,
      typical_budget: onboardingData.typicalBudget,
      projects_per_year: onboardingData.projectsPerYear,
      full_name: fullName || null,
      company_name: onboardingData.company || null,
      phone: onboardingData.phone || null,
      updated_at: new Date().toISOString(),
    })
    .eq("auth_id", user.id);

  if (error) {
    console.error("Error completing onboarding:", error);
    return { error: "Failed to complete onboarding" };
  }

  return {};
}

/**
 * Save partial onboarding progress
 */
export async function saveOnboardingProgress(
  partialData: Partial<OnboardingData>,
  currentStep?: OnboardingStep
): Promise<OnboardingServiceResult> {
  const supabase = await createClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return { error: "Not authenticated" };
  }

  // Build update object with only provided fields
  const updateData: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (partialData.investorType !== undefined) {
    updateData.investor_type = partialData.investorType;
  }
  if (partialData.investmentStrategy !== undefined) {
    updateData.investment_strategy = partialData.investmentStrategy;
  }
  if (partialData.propertyTypes !== undefined) {
    updateData.property_types = partialData.propertyTypes;
  }
  if (partialData.typicalBudget !== undefined) {
    updateData.typical_budget = partialData.typicalBudget;
  }
  if (partialData.projectsPerYear !== undefined) {
    updateData.projects_per_year = partialData.projectsPerYear;
  }
  if (currentStep !== undefined) {
    updateData.onboarding_current_step = currentStep;
  }
  
  // Profile fields (Step 6)
  if (partialData.firstName !== undefined || partialData.lastName !== undefined) {
    // Combine first and last name into full_name
    const fullName = [partialData.firstName, partialData.lastName]
      .filter(Boolean)
      .join(" ");
    if (fullName) {
      updateData.full_name = fullName;
    }
  }
  if (partialData.company !== undefined) {
    updateData.company_name = partialData.company || null;
  }
  if (partialData.phone !== undefined) {
    updateData.phone = partialData.phone || null;
  }

  const { error } = await supabase
    .from("users")
    .update(updateData)
    .eq("auth_id", user.id);

  if (error) {
    console.error("Error saving onboarding progress:", error);
    return { error: "Failed to save progress" };
  }

  return {};
}
