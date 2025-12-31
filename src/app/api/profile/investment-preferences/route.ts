import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { z } from "zod";
import { createClient } from "@/lib/supabase/server";

/**
 * DATA SYNCHRONIZATION STRATEGY
 * 
 * This API manages investment preferences stored in the `users` table.
 * Personal profile data (name, phone, company, location, bio) is managed 
 * separately in the `user_profiles` table via the profile-service.
 * 
 * Overlapping fields (phone, company, full_name) exist in both tables:
 * - `user_profiles` is the source of truth for personal information
 * - `users` stores onboarding data and investment preferences
 * 
 * This API intentionally only updates investment-related fields to maintain
 * clean separation of concerns between personal info and investment preferences.
 */

// Validation schema for investment preferences
const investmentPreferencesSchema = z.object({
  investorType: z
    .enum(["beginner", "experienced", "professional"])
    .nullable()
    .optional(),
  investmentStrategy: z
    .enum(["fix_flip", "brrrr", "buy_hold", "wholesale"])
    .nullable()
    .optional(),
  propertyTypes: z
    .array(z.enum(["single_family", "multi_family", "commercial", "mixed"]))
    .optional(),
  typicalBudget: z
    .enum(["under_50k", "50_150k", "150_300k", "300k_plus"])
    .nullable()
    .optional(),
  projectsPerYear: z
    .enum(["1_2", "3_5", "6_10", "10_plus"])
    .nullable()
    .optional(),
});

type InvestmentPreferencesInput = z.infer<typeof investmentPreferencesSchema>;

/**
 * GET /api/profile/investment-preferences
 * Fetch the current user's investment preferences
 */
export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    // Query only investment preference fields (not dependent on other features)
    const { data, error } = await supabase
      .from("users")
      .select(
        `
        investor_type,
        investment_strategy,
        property_types,
        typical_budget,
        projects_per_year
      `
      )
      .eq("auth_id", user.id)
      .maybeSingle();

    // Handle case where user record doesn't exist yet
    if (error) {
      console.error("Error fetching investment preferences:", error);
      return NextResponse.json(
        { error: "Failed to fetch investment preferences" },
        { status: 400 }
      );
    }

    // If no user record exists, return empty preferences
    if (!data) {
      return NextResponse.json({
        investorType: null,
        investmentStrategy: null,
        propertyTypes: [],
        typicalBudget: null,
        projectsPerYear: null,
      });
    }

    // Return formatted investment preference fields
    const preferences = {
      investorType: data?.investor_type ?? null,
      investmentStrategy: data?.investment_strategy ?? null,
      propertyTypes: data?.property_types ?? [],
      typicalBudget: data?.typical_budget ?? null,
      projectsPerYear: data?.projects_per_year ?? null,
    };

    return NextResponse.json(preferences);
  } catch (error) {
    console.error("Error fetching investment preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/profile/investment-preferences
 * Update the current user's investment preferences
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const body = await request.json();

    // Validate input using zod schema
    const parseResult = investmentPreferencesSchema.safeParse(body);
    
    if (!parseResult.success) {
      const errors = parseResult.error.errors.map((e) => ({
        field: e.path.join("."),
        message: e.message,
      }));
      return NextResponse.json(
        { error: "Validation failed", details: errors },
        { status: 400 }
      );
    }

    const validatedData: InvestmentPreferencesInput = parseResult.data;

    // Build the update object with only provided fields (using database column names)
    const updateData: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    
    if (validatedData.investorType !== undefined) {
      updateData.investor_type = validatedData.investorType;
    }
    if (validatedData.investmentStrategy !== undefined) {
      updateData.investment_strategy = validatedData.investmentStrategy;
    }
    if (validatedData.propertyTypes !== undefined) {
      updateData.property_types = validatedData.propertyTypes;
    }
    if (validatedData.typicalBudget !== undefined) {
      updateData.typical_budget = validatedData.typicalBudget;
    }
    if (validatedData.projectsPerYear !== undefined) {
      updateData.projects_per_year = validatedData.projectsPerYear;
    }

    // First try to update existing record
    const { data: existingUser, error: selectError } = await supabase
      .from("users")
      .select("id")
      .eq("auth_id", user.id)
      .maybeSingle();

    if (selectError) {
      console.error("Error checking for existing user:", selectError);
      return NextResponse.json(
        { error: "Failed to update investment preferences" },
        { status: 400 }
      );
    }

    if (existingUser) {
      // Update existing record
      const { error: updateError } = await supabase
        .from("users")
        .update(updateData)
        .eq("auth_id", user.id);

      if (updateError) {
        console.error("Error updating investment preferences:", updateError);
        return NextResponse.json(
          { error: "Failed to update investment preferences" },
          { status: 400 }
        );
      }
    } else {
      // Create new user record with investment preferences
      const { error: insertError } = await supabase.from("users").insert({
        auth_id: user.id,
        email: user.email,
        ...updateData,
      });

      if (insertError) {
        console.error("Error creating user with investment preferences:", insertError);
        return NextResponse.json(
          { error: "Failed to save investment preferences" },
          { status: 400 }
        );
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error updating investment preferences:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/profile/investment-preferences
 * Partially update the current user's investment preferences
 */
export async function PATCH(request: NextRequest) {
  // PATCH behaves the same as PUT for partial updates
  return PUT(request);
}
