import { NextResponse } from "next/server";
import { getOnboardingData } from "@/lib/services/onboarding-service";

export async function GET() {
  try {
    const result = await getOnboardingData();

    if (result.error) {
      // Return 401 for authentication errors
      const status = result.error === "Not authenticated" ? 401 : 400;
      return NextResponse.json({ error: result.error }, { status });
    }

    return NextResponse.json(result.data);
  } catch (error) {
    console.error("Error in onboarding data API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
