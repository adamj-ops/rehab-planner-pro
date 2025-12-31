import { NextResponse } from "next/server";
import { getOnboardingStatus } from "@/lib/services/onboarding-service";

export async function GET() {
  try {
    const result = await getOnboardingStatus();

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in onboarding status API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
