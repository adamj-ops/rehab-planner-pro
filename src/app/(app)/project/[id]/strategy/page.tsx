"use client";

import { useState, useEffect } from "react";
import { ProjectPageHeader, useProject } from "@/components/project";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconTarget,
  IconHome,
  IconBuildingSkyscraper,
  IconCash,
  IconUsers,
  IconDeviceFloppy,
  IconLoader2,
  IconTrendingUp,
} from "@tabler/icons-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const INVESTMENT_STRATEGIES = [
  {
    id: "flip",
    title: "Fix & Flip",
    description: "Renovate and sell quickly for profit",
    icon: IconTrendingUp,
    holdPeriod: "3-6 months",
    targetRoi: "20-30%",
  },
  {
    id: "rental",
    title: "Buy & Hold Rental",
    description: "Renovate for long-term rental income",
    icon: IconBuildingSkyscraper,
    holdPeriod: "5+ years",
    targetRoi: "8-12% annually",
  },
  {
    id: "wholetail",
    title: "Wholetail",
    description: "Light cosmetic updates, quick turnaround",
    icon: IconCash,
    holdPeriod: "1-3 months",
    targetRoi: "10-15%",
  },
  {
    id: "airbnb",
    title: "Short-Term Rental",
    description: "Optimize for vacation/Airbnb rental",
    icon: IconUsers,
    holdPeriod: "5+ years",
    targetRoi: "15-25% annually",
  },
];

const TARGET_BUYERS = [
  { id: "first_time", label: "First-Time Homebuyers" },
  { id: "family", label: "Growing Families" },
  { id: "young_professional", label: "Young Professionals" },
  { id: "investor", label: "Investors" },
  { id: "downsizer", label: "Downsizers/Retirees" },
  { id: "luxury", label: "Luxury Buyers" },
];

export default function StrategyPage() {
  const { project, isLoading, updateProject } = useProject();
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    investment_strategy: "",
    target_buyer: "",
    target_roi: "",
    hold_period_months: "",
  });

  useEffect(() => {
    if (project) {
      setFormData({
        investment_strategy: project.investment_strategy || "",
        target_buyer: project.target_buyer || "",
        target_roi: project.target_roi?.toString() || "",
        hold_period_months: project.hold_period_months?.toString() || "",
      });
    }
  }, [project]);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateProject({
        investment_strategy: formData.investment_strategy || null,
        target_buyer: formData.target_buyer || null,
        target_roi: formData.target_roi ? parseFloat(formData.target_roi) : null,
        hold_period_months: formData.hold_period_months ? parseInt(formData.hold_period_months) : null,
      });
      toast.success("Strategy saved!");
    } catch {
      toast.error("Failed to save strategy");
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <ProjectPageHeader section="Strategy" />
        <main className="flex-1 p-6 flex items-center justify-center">
          <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
        </main>
      </>
    );
  }

  return (
    <>
      <ProjectPageHeader section="Strategy" />
      <main className="flex-1 p-6">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <IconTarget className="h-8 w-8 text-muted-foreground" />
              <div>
                <h1 className="text-2xl font-bold">Investment Strategy</h1>
                <p className="text-muted-foreground">
                  Define your investment approach and target buyer
                </p>
              </div>
            </div>
            <Button onClick={handleSave} disabled={saving}>
              {saving ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
              )}
              Save Strategy
            </Button>
          </div>

          {/* Investment Strategy Selection */}
          <Card>
            <CardHeader>
              <CardTitle>Investment Strategy</CardTitle>
              <CardDescription>
                Choose your primary investment strategy for this property
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                {INVESTMENT_STRATEGIES.map((strategy) => {
                  const Icon = strategy.icon;
                  const isSelected = formData.investment_strategy === strategy.id;
                  return (
                    <div
                      key={strategy.id}
                      className={cn(
                        "relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                        isSelected
                          ? "border-primary bg-primary/5 shadow-md"
                          : "border-border hover:border-primary/50"
                      )}
                      onClick={() => handleChange("investment_strategy", strategy.id)}
                    >
                      {isSelected && (
                        <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                          <svg className="h-3 w-3 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      <div className="flex items-start gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Icon className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{strategy.title}</h3>
                          <p className="text-sm text-muted-foreground mt-1">
                            {strategy.description}
                          </p>
                          <div className="flex gap-4 mt-2 text-xs text-muted-foreground">
                            <span>Hold: {strategy.holdPeriod}</span>
                            <span>Target ROI: {strategy.targetRoi}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Target Buyer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconUsers className="h-5 w-5" />
                Target Buyer Profile
              </CardTitle>
              <CardDescription>
                Who is your ideal buyer or renter for this property?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Select
                value={formData.target_buyer}
                onValueChange={(value) => handleChange("target_buyer", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select target buyer" />
                </SelectTrigger>
                <SelectContent>
                  {TARGET_BUYERS.map((buyer) => (
                    <SelectItem key={buyer.id} value={buyer.id}>
                      {buyer.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Financial Goals */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <IconCash className="h-5 w-5" />
                Financial Goals
              </CardTitle>
              <CardDescription>
                Set your target ROI and expected hold period
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="target_roi">Target ROI (%)</Label>
                  <div className="relative">
                    <Input
                      id="target_roi"
                      type="number"
                      placeholder="25"
                      value={formData.target_roi}
                      onChange={(e) => handleChange("target_roi", e.target.value)}
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      %
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="hold_period">Hold Period (months)</Label>
                  <Input
                    id="hold_period"
                    type="number"
                    placeholder="6"
                    value={formData.hold_period_months}
                    onChange={(e) => handleChange("hold_period_months", e.target.value)}
                  />
                </div>
              </div>

              {/* Quick presets based on strategy */}
              {formData.investment_strategy && (
                <div className="pt-2">
                  <p className="text-sm text-muted-foreground mb-2">Quick presets:</p>
                  <div className="flex gap-2">
                    {formData.investment_strategy === "flip" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleChange("target_roi", "20");
                            handleChange("hold_period_months", "6");
                          }}
                        >
                          Conservative (20%, 6mo)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleChange("target_roi", "30");
                            handleChange("hold_period_months", "4");
                          }}
                        >
                          Aggressive (30%, 4mo)
                        </Button>
                      </>
                    )}
                    {formData.investment_strategy === "rental" && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleChange("target_roi", "8");
                            handleChange("hold_period_months", "60");
                          }}
                        >
                          5-Year Hold (8% annual)
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => {
                            handleChange("target_roi", "12");
                            handleChange("hold_period_months", "120");
                          }}
                        >
                          10-Year Hold (12% annual)
                        </Button>
                      </>
                    )}
                    {formData.investment_strategy === "wholetail" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleChange("target_roi", "12");
                          handleChange("hold_period_months", "2");
                        }}
                      >
                        Quick Turnaround (12%, 2mo)
                      </Button>
                    )}
                    {formData.investment_strategy === "airbnb" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          handleChange("target_roi", "18");
                          handleChange("hold_period_months", "60");
                        }}
                      >
                        STR Standard (18% annual, 5yr)
                      </Button>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Save Button (Bottom) */}
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={saving} size="lg">
              {saving ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconDeviceFloppy className="mr-2 h-4 w-4" />
              )}
              Save Strategy
            </Button>
          </div>
        </div>
      </main>
    </>
  );
}
