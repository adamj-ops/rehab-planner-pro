"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { WizardFooter } from "@/components/wizard/wizard-footer";
import { Paintbrush, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";

const designStyles = [
  {
    id: "modern-farmhouse",
    name: "Modern Farmhouse",
    description: "Clean lines, shiplap, barn doors, neutral palettes",
    image: "🏡",
    popular: true,
  },
  {
    id: "contemporary",
    name: "Contemporary",
    description: "Sleek finishes, open layouts, minimal ornamentation",
    image: "🏢",
    popular: true,
  },
  {
    id: "transitional",
    name: "Transitional",
    description: "Blend of traditional and modern, timeless appeal",
    image: "🏠",
    popular: true,
  },
  {
    id: "traditional",
    name: "Traditional",
    description: "Classic details, rich colors, elegant finishes",
    image: "🏛️",
    popular: false,
  },
  {
    id: "coastal",
    name: "Coastal",
    description: "Light colors, natural textures, relaxed feel",
    image: "🏖️",
    popular: false,
  },
  {
    id: "industrial",
    name: "Industrial",
    description: "Exposed elements, metal accents, urban aesthetic",
    image: "🏭",
    popular: false,
  },
];

export default function Step4Style() {
  const [selectedStyle, setSelectedStyle] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Paintbrush className="h-5 w-5" />
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
                  "relative p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md",
                  selectedStyle === style.id
                    ? "border-primary bg-primary/5 shadow-md"
                    : "border-border hover:border-primary/50"
                )}
                onClick={() => setSelectedStyle(style.id)}
              >
                {style.popular && (
                  <span className="absolute top-2 right-2 text-xs bg-primary/10 text-primary px-2 py-0.5 rounded">
                    Popular
                  </span>
                )}
                {selectedStyle === style.id && (
                  <div className="absolute top-2 left-2 h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="h-3 w-3 text-primary-foreground" />
                  </div>
                )}
                <div className="text-4xl mb-3">{style.image}</div>
                <h3 className="font-semibold">{style.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  {style.description}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <WizardFooter canProceed={!!selectedStyle} />
    </div>
  );
}

