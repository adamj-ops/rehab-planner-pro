'use client';

import * as React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';
import { IconCheck, IconAlertCircle } from '@tabler/icons-react';

// =============================================================================
// TYPES
// =============================================================================

interface WizardStepContainerProps {
  children: React.ReactNode;
  className?: string;
}

interface WizardStepHeaderProps {
  title: string;
  description?: string;
  stepNumber?: number;
  badge?: string;
}

interface WizardStepContentProps {
  children: React.ReactNode;
  className?: string;
}

interface WizardStepSectionProps {
  id: string;
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  isComplete?: boolean;
  hasError?: boolean;
  className?: string;
}

interface WizardStepSectionsProps {
  children: React.ReactNode;
  defaultValue?: string | string[];
  type?: 'single' | 'multiple';
  className?: string;
}

// =============================================================================
// STEP CONTAINER
// Main wrapper for each wizard step - handles scrolling within modal
// =============================================================================

export function WizardStepContainer({
  children,
  className,
}: WizardStepContainerProps) {
  return (
    <div className={cn('h-full flex flex-col', className)}>
      <ScrollArea className="flex-1">
        <div className="p-6 pb-8">{children}</div>
      </ScrollArea>
    </div>
  );
}

// =============================================================================
// STEP HEADER
// Title and description for the step
// =============================================================================

export function WizardStepHeader({
  title,
  description,
  stepNumber,
  badge,
}: WizardStepHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mb-6"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            {stepNumber && (
              <span className="text-sm font-medium text-muted-foreground">
                Step {stepNumber}
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
          </div>
          {description && (
            <p className="mt-1 text-muted-foreground">{description}</p>
          )}
        </div>
        {badge && (
          <Badge variant="outline" className="shrink-0">
            {badge}
          </Badge>
        )}
      </div>
    </motion.div>
  );
}

// =============================================================================
// STEP CONTENT
// Main content area with proper spacing
// =============================================================================

export function WizardStepContent({
  children,
  className,
}: WizardStepContentProps) {
  return (
    <div className={cn('space-y-6', className)}>
      {children}
    </div>
  );
}

// =============================================================================
// STEP SECTIONS (Accordion wrapper)
// For grouping related form sections
// =============================================================================

export function WizardStepSections({
  children,
  defaultValue,
  type = 'multiple',
  className,
}: WizardStepSectionsProps) {
  return (
    <Accordion
      type={type as 'multiple'}
      defaultValue={
        Array.isArray(defaultValue)
          ? defaultValue
          : defaultValue
          ? [defaultValue]
          : undefined
      }
      className={cn('space-y-4', className)}
    >
      {children}
    </Accordion>
  );
}

// =============================================================================
// STEP SECTION
// Individual collapsible section within the accordion
// =============================================================================

export function WizardStepSection({
  id,
  title,
  description,
  icon,
  children,
  defaultOpen = true,
  isComplete = false,
  hasError = false,
  className,
}: WizardStepSectionProps) {
  return (
    <AccordionItem
      value={id}
      className={cn(
        'border rounded-none shadow-sm overflow-hidden',
        hasError && 'border-destructive',
        isComplete && 'border-green-500/50',
        className
      )}
    >
      <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50 transition-colors">
        <div className="flex items-center gap-3 w-full">
          {/* Icon */}
          {icon && (
            <div
              className={cn(
                'flex h-8 w-8 shrink-0 items-center justify-center border',
                hasError && 'border-destructive text-destructive',
                isComplete && 'border-green-500 bg-green-500/10 text-green-600',
                !hasError && !isComplete && 'border-border text-muted-foreground'
              )}
            >
              {hasError ? (
                <IconAlertCircle className="h-4 w-4" />
              ) : isComplete ? (
                <IconCheck className="h-4 w-4" />
              ) : (
                icon
              )}
            </div>
          )}

          {/* Title and description */}
          <div className="flex-1 text-left">
            <div className="flex items-center gap-2">
              <span className="font-medium">{title}</span>
              {isComplete && (
                <Badge
                  variant="outline"
                  className="text-xs border-green-500/50 text-green-600 bg-green-500/10"
                >
                  Complete
                </Badge>
              )}
              {hasError && (
                <Badge variant="destructive" className="text-xs">
                  Has Errors
                </Badge>
              )}
            </div>
            {description && (
              <p className="text-sm text-muted-foreground">{description}</p>
            )}
          </div>
        </div>
      </AccordionTrigger>
      <AccordionContent className="px-4 pb-4 pt-2">
        {children}
      </AccordionContent>
    </AccordionItem>
  );
}

// =============================================================================
// TWO COLUMN LAYOUT
// For split panel views (e.g., room list + room details)
// =============================================================================

interface TwoColumnLayoutProps {
  left: React.ReactNode;
  right: React.ReactNode;
  leftWidth?: string;
  className?: string;
}

export function TwoColumnLayout({
  left,
  right,
  leftWidth = 'w-1/3',
  className,
}: TwoColumnLayoutProps) {
  return (
    <div className={cn('flex h-full gap-4', className)}>
      <div
        className={cn(
          'shrink-0 border-r pr-4 overflow-y-auto',
          leftWidth
        )}
      >
        {left}
      </div>
      <div className="flex-1 overflow-y-auto">{right}</div>
    </div>
  );
}

// =============================================================================
// CARD GRID
// Responsive grid for card-based content
// =============================================================================

interface CardGridProps {
  children: React.ReactNode;
  columns?: 1 | 2 | 3 | 4;
  className?: string;
}

export function CardGrid({ children, columns = 2, className }: CardGridProps) {
  const colsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-1 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colsClass[columns], className)}>
      {children}
    </div>
  );
}

// =============================================================================
// STICKY SUMMARY BAR
// For showing running totals/status at bottom of scrollable content
// =============================================================================

interface StickySummaryBarProps {
  children: React.ReactNode;
  className?: string;
}

export function StickySummaryBar({ children, className }: StickySummaryBarProps) {
  return (
    <div
      className={cn(
        'sticky bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/75',
        'px-4 py-3 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]',
        className
      )}
    >
      {children}
    </div>
  );
}

// =============================================================================
// FORM SECTION (non-collapsible)
// Simple section for grouping form fields
// =============================================================================

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export function FormSection({
  title,
  description,
  icon,
  children,
  className,
}: FormSectionProps) {
  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 shrink-0 items-center justify-center border text-muted-foreground">
            {icon}
          </div>
        )}
        <div>
          <h3 className="font-medium">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground">{description}</p>
          )}
        </div>
      </div>
      <div className="pl-11">{children}</div>
    </div>
  );
}

// =============================================================================
// INLINE FIELD GROUP
// For compact horizontal field layouts
// =============================================================================

interface InlineFieldGroupProps {
  children: React.ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}

export function InlineFieldGroup({
  children,
  columns = 3,
  className,
}: InlineFieldGroupProps) {
  const colsClass = {
    2: 'grid-cols-2',
    3: 'grid-cols-3',
    4: 'grid-cols-4',
  };

  return (
    <div className={cn('grid gap-4', colsClass[columns], className)}>
      {children}
    </div>
  );
}

// =============================================================================
// EXPORTS
// =============================================================================

export type {
  WizardStepContainerProps,
  WizardStepHeaderProps,
  WizardStepContentProps,
  WizardStepSectionProps,
  WizardStepSectionsProps,
  TwoColumnLayoutProps,
  CardGridProps,
  StickySummaryBarProps,
  FormSectionProps,
  InlineFieldGroupProps,
};
