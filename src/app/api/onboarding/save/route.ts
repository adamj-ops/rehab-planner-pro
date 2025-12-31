import { NextRequest, NextResponse } from "next/server";
import { saveOnboardingProgress } from "@/lib/services/onboarding-service";
import type { OnboardingData, OnboardingStep } from "@/types/onboarding";

interface SaveOnboardingRequest {
  data?: Partial<OnboardingData>;
  currentStep?: OnboardingStep;
}

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as SaveOnboardingRequest;
    
    // Support both legacy format (direct data) and new format (with currentStep)
    const partialData = body.data ?? (body as Partial<OnboardingData>);
    const currentStep = body.currentStep;

    const result = await saveOnboardingProgress(partialData, currentStep);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in onboarding save API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
