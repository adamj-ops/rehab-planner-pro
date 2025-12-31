import { NextRequest, NextResponse } from "next/server";
import { completeOnboarding } from "@/lib/services/onboarding-service";
import type { OnboardingData } from "@/types/onboarding";

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as OnboardingData;

    const result = await completeOnboarding(body);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error in onboarding complete API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
