"use client";

import { useState, useMemo } from "react";
import {
  IconLink,
  IconX,
  IconAlertTriangle,
  IconCheck,
} from "@tabler/icons-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import { detectCircularDependency, type DependencyItem } from "@/lib/utils/dependency-validation";

// =============================================================================
// TYPES
// =============================================================================

interface DependencySelectorProps {
  /** The ID of the current item (the one we're selecting dependencies FOR) */
  itemId: string;
  /** The name of the current item (for display) */
  itemName: string;
  /** All items available for selection (with their current dependencies) */
  allItems: DependencyItem[];
  /** Currently selected dependency IDs for this item */
  selectedDependencyIds: string[];
  /** Callback when dependencies change */
  onDependenciesChange: (dependencyIds: string[]) => void;
  /** Whether the selector is disabled */
  disabled?: boolean;
}

// =============================================================================
// COMPONENT
// =============================================================================

export function DependencySelector({
  itemId,
  itemName,
  allItems,
  selectedDependencyIds,
  onDependenciesChange,
  disabled = false,
}: DependencySelectorProps) {
  const [open, setOpen] = useState(false);
  const [circularWarning, setCircularWarning] = useState<string | null>(null);

  // Filter out the current item from the list of selectable items
  const selectableItems = useMemo(() => {
    return allItems.filter((item) => item.id !== itemId);
  }, [allItems, itemId]);

  // Get the names of selected dependencies for display
  const selectedDependencies = useMemo(() => {
    return selectedDependencyIds
      .map((id) => allItems.find((item) => item.id === id))
      .filter(Boolean) as DependencyItem[];
  }, [selectedDependencyIds, allItems]);

  // Check if adding a dependency would create a circular reference
  const wouldCreateCycle = (dependencyId: string): boolean => {
    // Build the items with the current item's potential new dependency
    const testItems = allItems.map((item) =>
      item.id === itemId
        ? { ...item, depends_on: [...selectedDependencyIds, dependencyId] }
        : item
    );
    return detectCircularDependency(itemId, dependencyId, testItems);
  };

  // Handle toggling a dependency
  const handleToggleDependency = (dependencyId: string) => {
    const isCurrentlySelected = selectedDependencyIds.includes(dependencyId);

    if (isCurrentlySelected) {
      // Remove the dependency
      onDependenciesChange(selectedDependencyIds.filter((id) => id !== dependencyId));
      setCircularWarning(null);
    } else {
      // Check for circular dependency before adding
      if (wouldCreateCycle(dependencyId)) {
        const depName = allItems.find((i) => i.id === dependencyId)?.name || dependencyId;
        setCircularWarning(
          `Cannot add "${depName}" as a dependency - it would create a circular reference.`
        );
        return;
      }
      // Add the dependency
      onDependenciesChange([...selectedDependencyIds, dependencyId]);
      setCircularWarning(null);
    }
  };

  // Handle removing a dependency (from the badge)
  const handleRemoveDependency = (dependencyId: string) => {
    onDependenciesChange(selectedDependencyIds.filter((id) => id !== dependencyId));
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <PopoverTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className={cn(
                  "h-8 gap-1.5 px-2",
                  selectedDependencyIds.length > 0 && "text-primary"
                )}
                disabled={disabled}
              >
                <IconLink className="h-4 w-4" />
                {selectedDependencyIds.length > 0 && (
                  <Badge
                    variant="secondary"
                    className="h-5 min-w-5 px-1.5 text-xs font-medium"
                  >
                    {selectedDependencyIds.length}
                  </Badge>
                )}
              </Button>
            </PopoverTrigger>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>
              {selectedDependencyIds.length > 0
                ? `${selectedDependencyIds.length} dependenc${selectedDependencyIds.length === 1 ? "y" : "ies"}`
                : "Add dependencies"}
            </p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>

      <PopoverContent className="w-80 p-0" align="start">
        <div className="p-3 border-b">
          <p className="text-sm font-medium">Dependencies for &ldquo;{itemName}&rdquo;</p>
          <p className="text-xs text-muted-foreground mt-1">
            Select items that must be completed before this one.
          </p>
        </div>

        {/* Selected dependencies */}
        {selectedDependencies.length > 0 && (
          <div className="p-3 border-b bg-muted/30">
            <p className="text-xs text-muted-foreground mb-2">Selected:</p>
            <div className="flex flex-wrap gap-1.5">
              {selectedDependencies.map((dep) => (
                <Badge
                  key={dep.id}
                  variant="secondary"
                  className="gap-1 pr-1"
                >
                  <span className="max-w-32 truncate">{dep.name}</span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveDependency(dep.id);
                    }}
                    className="ml-0.5 rounded-full p-0.5 hover:bg-muted-foreground/20"
                  >
                    <IconX className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Circular dependency warning */}
        {circularWarning && (
          <div className="p-3 border-b bg-destructive/10 text-destructive">
            <div className="flex items-start gap-2">
              <IconAlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
              <p className="text-xs">{circularWarning}</p>
            </div>
          </div>
        )}

        {/* Item list */}
        <Command>
          <CommandInput placeholder="Search items..." />
          <CommandList>
            <CommandEmpty>No items found.</CommandEmpty>
            <CommandGroup>
              {selectableItems.map((item) => {
                const isSelected = selectedDependencyIds.includes(item.id);
                const wouldCycle = !isSelected && wouldCreateCycle(item.id);

                return (
                  <CommandItem
                    key={item.id}
                    value={item.name}
                    onSelect={() => handleToggleDependency(item.id)}
                    disabled={wouldCycle}
                    className={cn(
                      "flex items-center gap-2",
                      wouldCycle && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <div
                      className={cn(
                        "flex h-4 w-4 items-center justify-center rounded-sm border",
                        isSelected
                          ? "bg-primary border-primary text-primary-foreground"
                          : "border-input"
                      )}
                    >
                      {isSelected && <IconCheck className="h-3 w-3" />}
                    </div>
                    <span className="flex-1 truncate">{item.name}</span>
                    {wouldCycle && (
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <IconAlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p className="text-xs">Would create circular dependency</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    )}
                  </CommandItem>
                );
              })}
            </CommandGroup>
          </CommandList>
        </Command>

        {/* Empty state */}
        {selectableItems.length === 0 && (
          <div className="p-6 text-center text-sm text-muted-foreground">
            No other items available
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
