"use client";

import { useEffect, useState } from "react";
import { IconPaint, IconCheck } from "@tabler/icons-react";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { useWizard } from "@/components/wizard/wizard-context";
import { DesignSelectionsFormData } from "@/lib/validations/project-wizard";
import { cn } from "@/lib/utils";

const designStyles = [
  {
    id: "modern_farmhouse",
    name: "Modern Farmhouse",
    description: "Clean lines, shiplap, barn doors, neutral palettes",
    emoji: "🏡",
    popular: true,
  },
  {
    id: "contemporary",
    name: "Contemporary",
    description: "Sleek finishes, open layouts, minimal ornamentation",
    emoji: "🏢",
    popular: true,
  },
  {
    id: "transitional",
    name: "Transitional",
    description: "Blend of traditional and modern, timeless appeal",
    emoji: "🏠",
    popular: true,
  },
  {
    id: "traditional",
    name: "Traditional",
    description: "Classic details, rich colors, elegant finishes",
    emoji: "🏛️",
    popular: false,
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Light colors, natural textures, relaxed feel",
    emoji: "🏖️",
    popular: false,
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Exposed elements, metal accents, urban aesthetic",
    emoji: "🏭",
    popular: false,
  },
  {
    id: "minimalist",
    name: "Minimalist",
    description: "Simple, uncluttered, focus on function",
    emoji: "⬜",
    popular: false,
  },
];

export function DesignStyleSelector() {
  const { getStepData, setStepData, markStepComplete, goToNextStep, saveDraft, isSaving } = useWizard();

  const storedData = getStepData<DesignSelectionsFormData>(4);
  const step3Data = getStepData(3);
  
  // Get design style from Step 3 if set there, otherwise from Step 4
  const initialStyle = (step3Data as { design_style?: string })?.design_style || storedData?.selected_color_ids?.[0];
  const [selectedStyle, setSelectedStyle] = useState<string | null>(initialStyle || null);

  // Sync with wizard context
  useEffect(() => {
    if (selectedStyle) {
      setStepData(4, { 
        ...storedData,
        selected_color_ids: [selectedStyle],
      } as Partial<DesignSelectionsFormData>);
    }
  }, [selectedStyle, setStepData, storedData]);

  const handleNext = async () => {
    if (selectedStyle) {
      markStepComplete(4);
      await goToNextStep();
    }
  };

  const handleSave = async () => {
    await saveDraft();
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <IconPaint className="h-5 w-5" />
            Design Style
          </CardTitle>
          <CardDescription>
            Choose a design style to guide your color and material selections
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {designStyles.map((style) => (
              <div
                key={style.id}
                className={cn(
                  "relative p-4 border-2 cursor-pointer transition-all hover:shadow-md",
                  selectedStyle === style.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-zinc-200 dark:border-zinc-700 hover:border-primary/50"
                )}
                onClick={() => setSelectedStyle(style.id)}
              >
                {style.popular && (
                  <span className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-0.5">
                    Popular
                  </span>
                )}
                {selectedStyle === style.id && (
                  <div className="absolute top-2 left-2 h-5 w-5 bg-primary flex items-center justify-center">
                    <IconCheck className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className="text-4xl mb-3">{style.emoji}</div>
                <h3 className="font-semibold">{style.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {style.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <WizardFooter 
        canProceed={!!selectedStyle} 
        onSave={handleSave}
        isSaving={isSaving}
        onSubmit={handleNext}
      />
    </div>
  );
}
