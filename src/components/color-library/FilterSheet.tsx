"use client";

import { cn } from "@/lib/utils";
import { IconCheck, IconSparkles } from "@/lib/icons";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { DESIGN_STYLES } from "@/types/color";

interface FilterSheetProps {
  /** Whether the sheet is open */
  open: boolean;
  /** Handler for open state changes */
  onOpenChange: (open: boolean) => void;
  /** Currently selected design styles */
  selectedStyles: string[];
  /** Handler for design style changes */
  onStylesChange: (styles: string[]) => void;
  /** Whether to show only popular colors */
  showPopularOnly: boolean;
  /** Handler for popular filter changes */
  onPopularChange: (show: boolean) => void;
}

/**
 * FilterSheet - Slide-in panel with advanced filter options
 * 
 * Features:
 * - Design styles multi-select
 * - Popular colors toggle
 * - Clear all button
 */
export function FilterSheet({
  open,
  onOpenChange,
  selectedStyles,
  onStylesChange,
  showPopularOnly,
  onPopularChange,
}: FilterSheetProps) {
  const toggleStyle = (style: string) => {
    if (selectedStyles.includes(style)) {
      onStylesChange(selectedStyles.filter(s => s !== style));
    } else {
      onStylesChange([...selectedStyles, style]);
    }
  };

  const clearAll = () => {
    onStylesChange([]);
    onPopularChange(false);
  };

  const hasActiveFilters = selectedStyles.length > 0 || showPopularOnly;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-80">
        <SheetHeader>
          <div className="flex items-center justify-between">
            <SheetTitle>Filters</SheetTitle>
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAll}
                className="h-auto p-2 text-xs text-muted-foreground hover:text-foreground"
              >
                Clear all
              </Button>
            )}
          </div>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Design Styles */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Design Styles</h4>
            <div className="space-y-2">
              {DESIGN_STYLES.map((style) => {
                const isSelected = selectedStyles.includes(style.value);
                return (
                  <button
                    key={style.value}
                    onClick={() => toggleStyle(style.value)}
                    className={cn(
                      "flex w-full items-center justify-between p-3 text-left transition-all",
                      "border focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary",
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border hover:border-primary/50 hover:bg-accent"
                    )}
                  >
                    <span className="text-sm">{style.label}</span>
                    {isSelected && (
                      <IconCheck className="h-4 w-4 text-primary" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Popular Colors Toggle */}
          <div className="space-y-3">
            <h4 className="text-sm font-medium">Popular Colors</h4>
            <div className="flex items-center justify-between p-3 border border-border">
              <div className="flex items-center gap-2">
                <IconSparkles className="h-4 w-4 text-muted-foreground" />
                <Label htmlFor="popular-toggle" className="text-sm cursor-pointer">
                  Show popular only
                </Label>
              </div>
              <Switch
                id="popular-toggle"
                checked={showPopularOnly}
                onCheckedChange={onPopularChange}
              />
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}
