"use client";

import { useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  IconFileText, 
  IconDownload,
  IconShare,
  IconHome,
  IconClipboardCheck,
  IconTarget,
  IconPalette,
  IconListNumbers,
  IconCalendarEvent,
  IconCheck,
  IconEdit,
  IconCurrencyDollar,
  IconClock,
  IconAlertCircle,
} from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { useWizard } from "@/components/wizard/wizard-context";
import {
  finalReviewSchema,
  FinalReviewFormData,
  PropertyDetailsFormData,
  ConditionAssessmentFormData,
  StrategyFormData,
  PriorityMatrixFormData,
  ActionPlanFormData,
} from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";

const STEP_ICONS = {
  1: IconHome,
  2: IconClipboardCheck,
  3: IconTarget,
  4: IconPalette,
  5: IconListNumbers,
  6: IconCalendarEvent,
};

const STEP_TITLES = {
  1: "Property Details",
  2: "Condition Assessment",
  3: "Investment Strategy",
  4: "Design Intelligence",
  5: "Priority Matrix",
  6: "Action Plan",
};

export function ReviewSummary() {
  const router = useRouter();
  const { 
    getStepData, 
    setStepData, 
    completedSteps,
    submitProject,
    saveDraft,
    isSaving,
    isSubmitting,
    goToStep,
  } = useWizard();

  // Get all step data
  const step1Data = getStepData<PropertyDetailsFormData>(1);
  const step2Data = getStepData<ConditionAssessmentFormData>(2);
  const step3Data = getStepData<StrategyFormData>(3);
  const step5Data = getStepData<PriorityMatrixFormData>(5);
  const step6Data = getStepData<ActionPlanFormData>(6);
  const storedData = getStepData<FinalReviewFormData>(7);

  // Calculate totals
  const scopeItems = step5Data?.scope_items?.filter((item) => item.is_included) || [];
  const totalCost = scopeItems.reduce((sum, item) => sum + (item.total_cost || 0), 0);
  const totalDays = step6Data?.total_duration_days || 0;
  const contingency = step3Data?.contingency_percentage || 15;
  const contingencyAmount = totalCost * (contingency / 100);
  const grandTotal = totalCost + contingencyAmount;

  // Check which steps are incomplete
  const incompleteSteps = [1, 2, 3].filter((step) => !completedSteps.includes(step));
  const hasRequiredSteps = incompleteSteps.length === 0;

  const form = useForm<FinalReviewFormData>({
    resolver: zodResolver(finalReviewSchema),
    defaultValues: {
      confirm_details_accurate: false,
      confirm_budget_approved: false,
      final_notes: "",
      status: "planning",
      ...storedData,
    },
    mode: "onChange",
  });

  // Auto-save on changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      setStepData(7, data as Partial<FinalReviewFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepData]);

  const onSubmit = async (data: FinalReviewFormData) => {
    setStepData(7, data);
    await submitProject();
  };

  const handleSave = async () => {
    const data = form.getValues();
    setStepData(7, data);
    await saveDraft();
  };

  const handleExportPDF = () => {
    toast.info("PDF export coming soon!");
  };

  const handleExportExcel = () => {
    toast.info("Excel export coming soon!");
  };

  const handleShare = () => {
    toast.info("Sharing coming soon!");
  };

  const confirmations = form.watch(["confirm_details_accurate", "confirm_budget_approved"]);
  const canSubmit = hasRequiredSteps && confirmations.every(Boolean);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Review & Export</h1>
          <p className="text-muted-foreground">
            Review your complete project estimate and save to your dashboard.
          </p>
        </div>

        {/* Incomplete Steps Warning */}
        {!hasRequiredSteps && (
          <Alert variant="destructive">
            <IconAlertCircle className="h-4 w-4" />
            <AlertTitle>Missing Required Information</AlertTitle>
            <AlertDescription>
              Please complete the following steps before submitting:
              <ul className="mt-2 list-disc list-inside">
                {incompleteSteps.map((step) => (
                  <li key={step}>
                    <Button
                      type="button"
                      variant="link"
                      className="p-0 h-auto text-destructive underline"
                      onClick={() => goToStep(step)}
                    >
                      Step {step}: {STEP_TITLES[step as keyof typeof STEP_TITLES]}
                    </Button>
                  </li>
                ))}
              </ul>
            </AlertDescription>
          </Alert>
        )}

        {/* Project Summary */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg">
                  <IconCurrencyDollar className="h-5 w-5 text-green-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Budget</p>
                  <p className="text-2xl font-bold">${grandTotal.toLocaleString()}</p>
                  <p className="text-xs text-muted-foreground">
                    (incl. {contingency}% contingency)
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg">
                  <IconClock className="h-5 w-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Timeline</p>
                  <p className="text-2xl font-bold">{totalDays} days</p>
                  <p className="text-xs text-muted-foreground">
                    estimated duration
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg">
                  <IconListNumbers className="h-5 w-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Scope Items</p>
                  <p className="text-2xl font-bold">{scopeItems.length}</p>
                  <p className="text-xs text-muted-foreground">
                    renovation tasks
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Step Summary Cards */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconFileText className="h-5 w-5" />
                Project Summary
              </CardTitle>
              <CardDescription>
                Review all project details by step
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Step 1: Property */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={cn(
                  "p-2 rounded-lg",
                  completedSteps.includes(1) ? "bg-green-500/10" : "bg-muted"
                )}>
                  <IconHome className={cn(
                    "h-4 w-4",
                    completedSteps.includes(1) ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Property Details</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => goToStep(1)}
                    >
                      <IconEdit className="h-3 w-3" />
                    </Button>
                  </div>
                  {step1Data?.project_name ? (
                    <div className="text-sm text-muted-foreground mt-1">
                      <p className="font-medium text-foreground">{step1Data.project_name}</p>
                      <p className="truncate">
                        {step1Data.address_street}, {step1Data.address_city}, {step1Data.address_state}
                      </p>
                      <p>
                        {step1Data.bedrooms} bed / {step1Data.bathrooms} bath · {step1Data.square_footage?.toLocaleString()} sqft
                      </p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not completed</p>
                  )}
                </div>
              </div>

              {/* Step 2: Condition */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={cn(
                  "p-2 rounded-lg",
                  completedSteps.includes(2) ? "bg-green-500/10" : "bg-muted"
                )}>
                  <IconClipboardCheck className={cn(
                    "h-4 w-4",
                    completedSteps.includes(2) ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Condition Assessment</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => goToStep(2)}
                    >
                      <IconEdit className="h-3 w-3" />
                    </Button>
                  </div>
                  {step2Data?.overall_condition ? (
                    <div className="text-sm text-muted-foreground mt-1">
                      <p>Overall: <span className="capitalize">{step2Data.overall_condition.replace("_", " ")}</span></p>
                      <p>{step2Data.rooms?.length || 0} rooms assessed</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not completed</p>
                  )}
                </div>
              </div>

              {/* Step 3: Strategy */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={cn(
                  "p-2 rounded-lg",
                  completedSteps.includes(3) ? "bg-green-500/10" : "bg-muted"
                )}>
                  <IconTarget className={cn(
                    "h-4 w-4",
                    completedSteps.includes(3) ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Investment Strategy</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => goToStep(3)}
                    >
                      <IconEdit className="h-3 w-3" />
                    </Button>
                  </div>
                  {step3Data?.investment_strategy ? (
                    <div className="text-sm text-muted-foreground mt-1">
                      <p className="capitalize">{step3Data.investment_strategy.replace("_", " ")}</p>
                      <p>ARV: ${step3Data.arv?.toLocaleString()} · Budget: ${step3Data.max_budget?.toLocaleString()}</p>
                      <p>Target ROI: {step3Data.target_roi_percentage}%</p>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">Not completed</p>
                  )}
                </div>
              </div>

              {/* Step 5: Scope Summary */}
              <div className="flex items-start gap-3 p-3 border rounded-lg">
                <div className={cn(
                  "p-2 rounded-lg",
                  completedSteps.includes(5) ? "bg-green-500/10" : "bg-muted"
                )}>
                  <IconListNumbers className={cn(
                    "h-4 w-4",
                    completedSteps.includes(5) ? "text-green-500" : "text-muted-foreground"
                  )} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium text-sm">Scope of Work</h4>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6"
                      onClick={() => goToStep(5)}
                    >
                      <IconEdit className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="text-sm text-muted-foreground mt-1">
                    <p>{scopeItems.length} items · ${totalCost.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Export & Confirmation */}
          <div className="space-y-6">
            {/* Export Options */}
            <Card>
              <CardHeader>
                <CardTitle>Export Options</CardTitle>
                <CardDescription>
                  Generate and share reports
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button 
                  type="button"
                  className="w-full justify-start rounded-none" 
                  variant="outline"
                  onClick={handleExportPDF}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export as PDF
                </Button>
                <Button 
                  type="button"
                  className="w-full justify-start rounded-none" 
                  variant="outline"
                  onClick={handleExportExcel}
                >
                  <IconDownload className="mr-2 h-4 w-4" />
                  Export to Excel
                </Button>
                <Button 
                  type="button"
                  className="w-full justify-start rounded-none" 
                  variant="outline"
                  onClick={handleShare}
                >
                  <IconShare className="mr-2 h-4 w-4" />
                  Share with Team
                </Button>
              </CardContent>
            </Card>

            {/* Confirmations */}
            <Card>
              <CardHeader>
                <CardTitle>Final Confirmation</CardTitle>
                <CardDescription>
                  Confirm details before saving your project
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="confirm_details_accurate"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="cursor-pointer">
                          I confirm all project details are accurate
                        </FormLabel>
                        <FormDescription>
                          You can edit the project later from your dashboard
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="confirm_budget_approved"
                  render={({ field }) => (
                    <FormItem className="flex items-start gap-3">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1">
                        <FormLabel className="cursor-pointer">
                          I approve the budget of ${grandTotal.toLocaleString()}
                        </FormLabel>
                        <FormDescription>
                          Including {contingency}% contingency buffer
                        </FormDescription>
                      </div>
                    </FormItem>
                  )}
                />

                <Separator />

                <FormField
                  control={form.control}
                  name="final_notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Additional Notes (Optional)</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Any final notes or reminders for this project..."
                          className="min-h-[80px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
          </div>
        </div>

        <WizardFooter
          onSave={handleSave}
          isSaving={isSaving}
          canProceed={canSubmit}
          form={form}
          isSubmitting={isSubmitting}
        />
      </form>
    </Form>
  );
}
