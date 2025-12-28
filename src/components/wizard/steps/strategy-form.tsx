"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { 
  IconTarget, 
  IconCurrencyDollar,
  IconHome,
  IconBuildingCommunity,
  IconTrendingUp,
  IconUsers,
  IconStar,
  IconPlant,
  IconBrandAirbnb,
  IconPalette,
  IconCalendar,
} from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { useWizard } from "@/components/wizard/wizard-context";
import {
  strategySchema,
  StrategyFormData,
  INVESTMENT_STRATEGIES,
  TARGET_MARKETS,
  DESIGN_STYLES,
} from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";

// Strategy configuration with icons and descriptions
const STRATEGY_CONFIG: Record<string, { label: string; description: string; icon: typeof IconHome }> = {
  flip: { 
    label: "Fix & Flip", 
    description: "Renovate and sell quickly for profit",
    icon: IconTrendingUp,
  },
  rental: { 
    label: "Rental Property", 
    description: "Long-term rental income strategy",
    icon: IconBuildingCommunity,
  },
  wholetail: { 
    label: "Wholetail", 
    description: "Light cosmetic updates and sell",
    icon: IconHome,
  },
  airbnb: { 
    label: "Short-Term Rental", 
    description: "Airbnb or vacation rental focus",
    icon: IconBrandAirbnb,
  },
  personal_residence: { 
    label: "Personal Residence", 
    description: "Owner-occupied home improvement",
    icon: IconPlant,
  },
};

const TARGET_CONFIG: Record<string, { label: string; description: string; icon: typeof IconUsers }> = {
  first_time_buyer: { 
    label: "First-Time Buyers", 
    description: "Entry-level market, value-focused",
    icon: IconUsers,
  },
  move_up: { 
    label: "Move-Up Buyers", 
    description: "Growing families, seeking upgrades",
    icon: IconTrendingUp,
  },
  investor: { 
    label: "Investors", 
    description: "Cash flow focused buyers",
    icon: IconCurrencyDollar,
  },
  luxury: { 
    label: "Luxury Buyers", 
    description: "High-end finishes, premium market",
    icon: IconStar,
  },
  family: { 
    label: "Families", 
    description: "Practical, durable, kid-friendly",
    icon: IconHome,
  },
};

const DESIGN_CONFIG: Record<string, { label: string; description: string }> = {
  modern_farmhouse: { label: "Modern Farmhouse", description: "Warm, rustic with modern touches" },
  contemporary: { label: "Contemporary", description: "Clean lines, minimalist" },
  traditional: { label: "Traditional", description: "Classic, timeless appeal" },
  transitional: { label: "Transitional", description: "Blend of traditional and modern" },
  industrial: { label: "Industrial", description: "Urban loft aesthetic" },
  coastal: { label: "Coastal", description: "Light, airy, beach-inspired" },
  minimalist: { label: "Minimalist", description: "Simple, uncluttered spaces" },
};

export function StrategyForm() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();

  const storedData = getStepData<StrategyFormData>(3);
  
  const form = useForm<StrategyFormData>({
    resolver: zodResolver(strategySchema),
    defaultValues: {
      investment_strategy: undefined,
      target_market: undefined,
      design_style: undefined,
      arv: undefined,
      max_budget: undefined,
      target_roi_percentage: 20,
      contingency_percentage: 15,
      ...storedData,
    },
    mode: "onBlur",
  });

  // Auto-save on changes
  useEffect(() => {
    const subscription = form.watch((data) => {
      setStepData(3, data as Partial<StrategyFormData>);
    });
    return () => subscription.unsubscribe();
  }, [form, setStepData]);

  const onSubmit = async (data: StrategyFormData) => {
    setStepData(3, data);
    markStepComplete(3);
    await goToNextStep();
  };

  const handleSave = async () => {
    const data = form.getValues();
    setStepData(3, data);
    await saveDraft();
  };

  const contingencyValue = form.watch("contingency_percentage") || 15;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Investment Strategy</h1>
          <p className="text-muted-foreground">
            Define your investment approach, target buyer, and financial goals.
          </p>
        </div>

        {/* Investment Strategy Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconTarget className="h-5 w-5" />
              Investment Strategy
            </CardTitle>
            <CardDescription>
              What&apos;s your primary goal for this property?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="investment_strategy"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {INVESTMENT_STRATEGIES.map((strategy) => {
                        const config = STRATEGY_CONFIG[strategy];
                        const Icon = config.icon;
                        const isSelected = field.value === strategy;
                        
                        return (
                          <FormItem key={strategy}>
                            <FormControl>
                              <label
                                className={cn(
                                  "flex flex-col p-4 border-2 cursor-pointer transition-all hover:border-primary/50",
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-zinc-200 dark:border-zinc-700"
                                )}
                              >
                                <RadioGroupItem value={strategy} className="sr-only" />
                                <div className="flex items-center gap-3 mb-2">
                                  <div className={cn(
                                    "p-2 rounded-lg",
                                    isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                  )}>
                                    <Icon className="h-5 w-5" />
                                  </div>
                                  <span className="font-medium">{config.label}</span>
                                </div>
                                <p className="text-sm text-muted-foreground">
                                  {config.description}
                                </p>
                              </label>
                            </FormControl>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Target Market Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconUsers className="h-5 w-5" />
              Target Market
            </CardTitle>
            <CardDescription>
              Who is your ideal buyer or tenant?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="target_market"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
                    >
                      {TARGET_MARKETS.map((market) => {
                        const config = TARGET_CONFIG[market];
                        const Icon = config.icon;
                        const isSelected = field.value === market;
                        
                        return (
                          <FormItem key={market}>
                            <FormControl>
                              <label
                                className={cn(
                                  "flex items-center gap-3 p-4 border-2 cursor-pointer transition-all hover:border-primary/50",
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-zinc-200 dark:border-zinc-700"
                                )}
                              >
                                <RadioGroupItem value={market} className="sr-only" />
                                <div className={cn(
                                  "p-2 rounded-lg shrink-0",
                                  isSelected ? "bg-primary text-primary-foreground" : "bg-muted"
                                )}>
                                  <Icon className="h-4 w-4" />
                                </div>
                                <div>
                                  <span className="font-medium block">{config.label}</span>
                                  <span className="text-sm text-muted-foreground">
                                    {config.description}
                                  </span>
                                </div>
                              </label>
                            </FormControl>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Design Style Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconPalette className="h-5 w-5" />
              Design Style
            </CardTitle>
            <CardDescription>
              What aesthetic will guide your renovation choices?
            </CardDescription>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="design_style"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      value={field.value}
                      className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3"
                    >
                      {DESIGN_STYLES.map((style) => {
                        const config = DESIGN_CONFIG[style];
                        const isSelected = field.value === style;
                        
                        return (
                          <FormItem key={style}>
                            <FormControl>
                              <label
                                className={cn(
                                  "flex flex-col items-center p-3 border-2 cursor-pointer transition-all text-center hover:border-primary/50",
                                  isSelected
                                    ? "border-primary bg-primary/5"
                                    : "border-zinc-200 dark:border-zinc-700"
                                )}
                              >
                                <RadioGroupItem value={style} className="sr-only" />
                                <span className="font-medium text-sm">{config.label}</span>
                                <span className="text-xs text-muted-foreground mt-1">
                                  {config.description}
                                </span>
                              </label>
                            </FormControl>
                          </FormItem>
                        );
                      })}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Financial Goals Card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <IconCurrencyDollar className="h-5 w-5" />
              Financial Goals
            </CardTitle>
            <CardDescription>
              Set your budget and profit targets
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="arv"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>After Repair Value (ARV)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          placeholder="350,000" 
                          className="pl-7"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Estimated value after all renovations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="max_budget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Maximum Renovation Budget</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                        <Input 
                          type="number" 
                          placeholder="75,000" 
                          className="pl-7"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                      </div>
                    </FormControl>
                    <FormDescription>
                      Maximum amount to spend on renovations
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="target_roi_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Target ROI (%)</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          type="number" 
                          placeholder="20" 
                          className="pr-8"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value === "" ? undefined : Number(e.target.value))}
                          value={field.value ?? ""}
                        />
                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">%</span>
                      </div>
                    </FormControl>
                    <FormDescription>
                      Desired return on investment
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contingency_percentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contingency Budget: {contingencyValue}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={5}
                        max={30}
                        step={1}
                        value={[field.value ?? 15]}
                        onValueChange={(value) => field.onChange(value[0])}
                        className="mt-2"
                      />
                    </FormControl>
                    <FormDescription>
                      Buffer for unexpected costs (recommended: 10-20%)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Timeline (Optional) */}
            <div className="grid gap-6 md:grid-cols-2">
              <FormField
                control={form.control}
                name="start_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      Start Date (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="target_completion_date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-1">
                      <IconCalendar className="h-3 w-3" />
                      Target Completion (Optional)
                    </FormLabel>
                    <FormControl>
                      <Input 
                        type="date" 
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <WizardFooter
          onSave={handleSave}
          isSaving={isSaving}
          canProceed={form.formState.isValid}
          form={form}
        />
      </form>
    </Form>
  );
}
