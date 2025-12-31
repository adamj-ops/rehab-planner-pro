/**
 * PDF Export Utility
 * Handles data mapping and PDF generation for project plans
 */

import { pdf } from "@react-pdf/renderer";
import { ProjectPDFDocument, type ProjectPDFData } from "@/components/wizard/pdf";
import type {
  PropertyDetailsFormData,
  ConditionAssessmentFormData,
  StrategyFormData,
  PriorityMatrixFormData,
  ActionPlanFormData,
} from "@/lib/validations/project-wizard";

// =============================================================================
// TYPES
// =============================================================================

export interface WizardStepData {
  step1?: Partial<PropertyDetailsFormData>;
  step2?: Partial<ConditionAssessmentFormData>;
  step3?: Partial<StrategyFormData>;
  step5?: Partial<PriorityMatrixFormData>;
  step6?: Partial<ActionPlanFormData>;
}

// =============================================================================
// DATA MAPPING
// =============================================================================

/**
 * Maps wizard step data to the PDF data format
 */
export function mapWizardDataToPDF(data: WizardStepData): ProjectPDFData {
  const step1 = data.step1 || {};
  const step3 = data.step3 || {};
  const step5 = data.step5 || {};
  const step6 = data.step6 || {};

  // Get included scope items
  const includedItems = (step5.scope_items || []).filter((item) => item.is_included);

  // Calculate totals
  const baseCost = includedItems.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const contingencyPercentage = step3.contingency_percentage || 15;
  const contingencyAmount = baseCost * (contingencyPercentage / 100);
  const grandTotal = baseCost + contingencyAmount;

  // Calculate phase data
  const phaseMap: Record<string, { items: typeof includedItems; days: number }> = {};
  for (const item of includedItems) {
    const priority = item.priority || "should";
    const phaseName = getPhaseName(priority);
    if (!phaseMap[phaseName]) {
      phaseMap[phaseName] = { items: [], days: 0 };
    }
    phaseMap[phaseName].items.push(item);
    phaseMap[phaseName].days += item.estimated_duration_days || 1;
  }

  const phases = Object.entries(phaseMap).map(([name, data]) => ({
    name,
    days: data.days,
    itemCount: data.items.length,
  }));

  // Calculate total days from step 6 or sum from items
  const totalDays =
    step6.total_duration_days ||
    includedItems.reduce((sum, item) => sum + (item.estimated_duration_days || 1), 0);

  // Parse start date
  let startDate: Date | null = null;
  if (step3.start_date) {
    try {
      startDate = new Date(step3.start_date);
    } catch {
      startDate = null;
    }
  }

  return {
    projectName: step1.project_name || "Untitled Project",
    address: {
      street: step1.address_street || "",
      city: step1.address_city || "",
      state: step1.address_state || "",
      zip: step1.address_zip || "",
    },
    property: {
      type: step1.property_type || "single_family",
      sqft: step1.square_footage || 0,
      yearBuilt: step1.year_built || 0,
      beds: step1.bedrooms || 0,
      baths: step1.bathrooms || 0,
    },
    strategy: {
      type: step3.investment_strategy || "flip",
      targetMarket: step3.target_market || "first_time_buyer",
      arv: step3.arv || 0,
      maxBudget: step3.max_budget || 0,
      targetRoi: step3.target_roi_percentage || 0,
      contingency: contingencyPercentage,
    },
    scopeItems: includedItems.map((item) => ({
      name: item.item_name || "Unnamed Item",
      category: item.category || "Other",
      priority: item.priority || "should",
      cost: item.total_cost || 0,
      durationDays: item.estimated_duration_days || 1,
    })),
    timeline: {
      startDate,
      totalDays,
      phases,
    },
    totals: {
      baseCost,
      contingencyAmount,
      grandTotal,
    },
    generatedAt: new Date(),
  };
}

/**
 * Get human-readable phase name from priority
 */
function getPhaseName(priority: string): string {
  const phaseMap: Record<string, string> = {
    must: "Phase 1: Must-Haves",
    should: "Phase 2: Should-Haves",
    could: "Phase 3: Could-Haves",
    nice_to_have: "Phase 4: Nice-to-Haves",
  };
  return phaseMap[priority] || "Phase 2: Should-Haves";
}

// =============================================================================
// PDF GENERATION
// =============================================================================

/**
 * Generates a PDF blob from wizard data
 */
export async function generateProjectPDF(data: WizardStepData): Promise<Blob> {
  const pdfData = mapWizardDataToPDF(data);
  const document = ProjectPDFDocument({ data: pdfData });
  const blob = await pdf(document).toBlob();
  return blob;
}

/**
 * Generates a PDF blob from pre-mapped PDF data
 */
export async function generateProjectPDFFromData(data: ProjectPDFData): Promise<Blob> {
  const document = ProjectPDFDocument({ data });
  const blob = await pdf(document).toBlob();
  return blob;
}

// =============================================================================
// DOWNLOAD
// =============================================================================

/**
 * Triggers a download of the PDF blob
 */
export function downloadPDF(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Generates a sanitized filename for the PDF
 */
export function generatePDFFilename(projectName: string): string {
  const sanitized = projectName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
  
  const date = new Date().toISOString().split("T")[0];
  return `${sanitized || "project"}-sow-${date}.pdf`;
}

// =============================================================================
// COMBINED EXPORT FUNCTION
// =============================================================================

/**
 * Complete export flow: maps data, generates PDF, and triggers download
 */
export async function exportProjectAsPDF(
  data: WizardStepData,
  projectName?: string
): Promise<void> {
  const blob = await generateProjectPDF(data);
  const filename = generatePDFFilename(projectName || data.step1?.project_name || "project");
  downloadPDF(blob, filename);
}
