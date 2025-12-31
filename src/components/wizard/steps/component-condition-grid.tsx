'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IconStar, IconStarFilled } from '@tabler/icons-react';

// =============================================================================
// TYPES
// =============================================================================

type ConditionRating = 1 | 2 | 3 | 4 | 5;
type ActionType = 'none' | 'repair' | 'replace' | 'upgrade';

interface ComponentCondition {
  rating: ConditionRating;
  action: ActionType;
  notes?: string;
}

interface RoomComponent {
  id: string;
  name: string;
  icon?: string;
}

interface ComponentConditionGridProps {
  roomType: string;
  conditions: Record<string, ComponentCondition>;
  onConditionsChange: (conditions: Record<string, ComponentCondition>) => void;
  disabled?: boolean;
}

// =============================================================================
// ROOM COMPONENT DEFINITIONS
// =============================================================================

const ROOM_COMPONENTS: Record<string, RoomComponent[]> = {
  kitchen: [
    { id: 'flooring', name: 'Flooring' },
    { id: 'walls', name: 'Walls' },
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'cabinets', name: 'Cabinets' },
    { id: 'countertops', name: 'Countertops' },
    { id: 'appliances', name: 'Appliances' },
    { id: 'sink', name: 'Sink/Faucet' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'backsplash', name: 'Backsplash' },
  ],
  bathroom: [
    { id: 'flooring', name: 'Flooring' },
    { id: 'walls', name: 'Walls' },
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'vanity', name: 'Vanity/Sink' },
    { id: 'toilet', name: 'Toilet' },
    { id: 'tub_shower', name: 'Tub/Shower' },
    { id: 'fixtures', name: 'Fixtures' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'mirror', name: 'Mirror' },
  ],
  bedroom: [
    { id: 'flooring', name: 'Flooring' },
    { id: 'walls', name: 'Walls' },
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'closet', name: 'Closet' },
    { id: 'windows', name: 'Windows' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'electrical', name: 'Electrical' },
  ],
  living_room: [
    { id: 'flooring', name: 'Flooring' },
    { id: 'walls', name: 'Walls' },
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'windows', name: 'Windows' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'fireplace', name: 'Fireplace' },
    { id: 'electrical', name: 'Electrical' },
  ],
  default: [
    { id: 'flooring', name: 'Flooring' },
    { id: 'walls', name: 'Walls' },
    { id: 'ceiling', name: 'Ceiling' },
    { id: 'windows', name: 'Windows' },
    { id: 'lighting', name: 'Lighting' },
    { id: 'electrical', name: 'Electrical' },
  ],
};

const ACTION_OPTIONS: { value: ActionType; label: string; color: string }[] = [
  { value: 'none', label: 'None', color: 'bg-muted' },
  { value: 'repair', label: 'Repair', color: 'bg-yellow-500' },
  { value: 'replace', label: 'Replace', color: 'bg-orange-500' },
  { value: 'upgrade', label: 'Upgrade', color: 'bg-blue-500' },
];

const RATING_LABELS: Record<ConditionRating, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Excellent',
};

// =============================================================================
// STAR RATING COMPONENT
// =============================================================================

interface StarRatingProps {
  value: ConditionRating;
  onChange: (value: ConditionRating) => void;
  disabled?: boolean;
}

function StarRating({ value, onChange, disabled }: StarRatingProps) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isFilled = rating <= value;
        return (
          <button
            key={rating}
            type="button"
            onClick={() => !disabled && onChange(rating as ConditionRating)}
            disabled={disabled}
            className={cn(
              'p-0.5 transition-colors',
              !disabled && 'hover:text-amber-400',
              disabled && 'cursor-not-allowed opacity-50'
            )}
            title={RATING_LABELS[rating as ConditionRating]}
          >
            {isFilled ? (
              <IconStarFilled className="h-4 w-4 text-amber-400" />
            ) : (
              <IconStar className="h-4 w-4 text-muted-foreground" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export function ComponentConditionGrid({
  roomType,
  conditions,
  onConditionsChange,
  disabled = false,
}: ComponentConditionGridProps) {
  // Get components for this room type
  const components = ROOM_COMPONENTS[roomType] || ROOM_COMPONENTS.default;

  // Update a single component's condition
  const updateComponent = (
    componentId: string,
    updates: Partial<ComponentCondition>
  ) => {
    const current = conditions[componentId] || { rating: 3, action: 'none' };
    onConditionsChange({
      ...conditions,
      [componentId]: { ...current, ...updates },
    });
  };

  // Calculate average rating
  const avgRating = React.useMemo(() => {
    const ratings = Object.values(conditions)
      .map((c) => c.rating)
      .filter((r) => r > 0);
    if (ratings.length === 0) return null;
    return (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1);
  }, [conditions]);

  // Count actions needed
  const actionsCount = React.useMemo(() => {
    return Object.values(conditions).filter((c) => c.action !== 'none').length;
  }, [conditions]);

  return (
    <div className="space-y-4">
      {/* Summary header */}
      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center gap-4">
          {avgRating && (
            <div className="flex items-center gap-1">
              <IconStarFilled className="h-4 w-4 text-amber-400" />
              <span className="font-medium">{avgRating}</span>
              <span className="text-muted-foreground">avg</span>
            </div>
          )}
          {actionsCount > 0 && (
            <Badge variant="secondary">
              {actionsCount} action{actionsCount !== 1 ? 's' : ''} needed
            </Badge>
          )}
        </div>
      </div>

      {/* Component grid */}
      <div className="grid gap-2">
        {components.map((component) => {
          const condition = conditions[component.id] || {
            rating: 3 as ConditionRating,
            action: 'none' as ActionType,
          };

          return (
            <div
              key={component.id}
              className="flex items-center gap-4 p-2 border bg-background rounded-none"
            >
              {/* Component name */}
              <div className="w-28 shrink-0">
                <span className="text-sm font-medium">{component.name}</span>
              </div>

              {/* Star rating */}
              <div className="shrink-0">
                <StarRating
                  value={condition.rating}
                  onChange={(rating) =>
                    updateComponent(component.id, { rating })
                  }
                  disabled={disabled}
                />
              </div>

              {/* Action selector */}
              <div className="w-32 shrink-0">
                <Select
                  value={condition.action}
                  onValueChange={(action: ActionType) =>
                    updateComponent(component.id, { action })
                  }
                  disabled={disabled}
                >
                  <SelectTrigger className="h-8 text-xs rounded-none">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center gap-2">
                          <div
                            className={cn('w-2 h-2 rounded-full', option.color)}
                          />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export type {
  ComponentCondition,
  RoomComponent,
  ComponentConditionGridProps,
  ConditionRating,
  ActionType,
};
