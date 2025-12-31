'use client';

import * as React from 'react';
import * as DialogPrimitive from '@radix-ui/react-dialog';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon, AlertTriangleIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { StepNavigation } from './step-navigation';
import { useWizard } from './wizard-context';
import { wizardSteps } from '@/lib/navigation';

// =============================================================================
// TYPES
// =============================================================================

interface WizardModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  children: React.ReactNode;
}

// =============================================================================
// WIZARD MODAL OVERLAY
// =============================================================================

const WizardModalOverlay = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Overlay>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Overlay>
>(({ className, ...props }, ref) => (
  <DialogPrimitive.Overlay
    ref={ref}
    className={cn(
      'fixed inset-0 z-50 bg-black/60 backdrop-blur-sm',
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      className
    )}
    {...props}
  />
));
WizardModalOverlay.displayName = 'WizardModalOverlay';

// =============================================================================
// WIZARD MODAL CONTENT
// =============================================================================

const WizardModalContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Content
    ref={ref}
    className={cn(
      // Positioning
      'fixed left-[50%] top-[50%] z-50 translate-x-[-50%] translate-y-[-50%]',
      // Sizing - 80% width, 90% height with max constraints
      'w-[90vw] max-w-[1200px] h-[90vh] max-h-[900px]',
      // Appearance
      'bg-background border shadow-2xl',
      // Layout
      'flex flex-col overflow-hidden',
      // Animations
      'data-[state=open]:animate-in data-[state=closed]:animate-out',
      'data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
      'data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
      'data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%]',
      'data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]',
      'duration-300',
      className
    )}
    {...props}
  >
    {children}
  </DialogPrimitive.Content>
));
WizardModalContent.displayName = 'WizardModalContent';

// =============================================================================
// WIZARD MODAL HEADER
// =============================================================================

interface WizardModalHeaderProps {
  onClose: () => void;
  completedSteps: number[];
}

function WizardModalHeader({ onClose, completedSteps }: WizardModalHeaderProps) {
  return (
    <div className="shrink-0 border-b bg-muted/30 px-6 py-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold">New Project Wizard</h2>
        <Button
          variant="ghost"
          size="icon"
          onClick={onClose}
          className="h-8 w-8 rounded-none"
        >
          <XIcon className="h-4 w-4" />
          <span className="sr-only">Close wizard</span>
        </Button>
      </div>
      <StepNavigation completedSteps={completedSteps} />
    </div>
  );
}

// =============================================================================
// WIZARD MODAL FOOTER
// =============================================================================

interface WizardModalFooterProps {
  currentStep: number;
  onBack: () => void;
  onNext: () => void;
  onSave: () => void;
  canProceed: boolean;
  isSaving: boolean;
  isSubmitting: boolean;
}

function WizardModalFooter({
  currentStep,
  onBack,
  onNext,
  onSave,
  canProceed,
  isSaving,
  isSubmitting,
}: WizardModalFooterProps) {
  const isFirstStep = currentStep === 1;
  const isLastStep = currentStep === wizardSteps.length;
  const nextStepTitle = !isLastStep
    ? wizardSteps.find((s) => s.number === currentStep + 1)?.shortTitle
    : null;

  return (
    <div className="shrink-0 border-t bg-muted/30 px-6 py-4">
      <div className="flex items-center justify-between">
        <Button
          type="button"
          variant="outline"
          onClick={onBack}
          disabled={isFirstStep}
          className="rounded-none min-w-[100px]"
        >
          Back
        </Button>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="ghost"
            onClick={onSave}
            disabled={isSaving}
            className="rounded-none"
          >
            {isSaving ? 'Saving...' : 'Save Draft'}
          </Button>

          <Button
            type="submit"
            disabled={!canProceed || isSubmitting}
            className="rounded-none min-w-[140px]"
          >
            {isSubmitting
              ? 'Processing...'
              : isLastStep
              ? 'Complete & Export'
              : `Continue to ${nextStepTitle || 'Next'}`}
          </Button>
        </div>
      </div>
    </div>
  );
}

// =============================================================================
// CLOSE CONFIRMATION DIALOG
// =============================================================================

interface CloseConfirmationProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  onSaveAndClose: () => void;
}

function CloseConfirmation({
  open,
  onOpenChange,
  onConfirm,
  onSaveAndClose,
}: CloseConfirmationProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <AlertTriangleIcon className="h-5 w-5 text-amber-500" />
            Unsaved Changes
          </AlertDialogTitle>
          <AlertDialogDescription>
            You have unsaved changes. Would you like to save your progress before
            closing, or discard your changes?
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-row gap-2">
          <AlertDialogCancel className="rounded-none">
            Keep Editing
          </AlertDialogCancel>
          <Button
            variant="outline"
            onClick={onConfirm}
            className="rounded-none"
          >
            Discard Changes
          </Button>
          <AlertDialogAction
            onClick={onSaveAndClose}
            className="rounded-none"
          >
            Save & Close
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// =============================================================================
// MAIN WIZARD MODAL COMPONENT
// =============================================================================

export function WizardModal({ open, onOpenChange, children }: WizardModalProps) {
  const [showCloseConfirm, setShowCloseConfirm] = React.useState(false);
  
  const {
    currentStepNumber,
    completedSteps,
    isFirstStep,
    goToPreviousStep,
    goToNextStep,
    saveDraft,
    isSaving,
    isSubmitting,
  } = useWizard();

  // Track if there are unsaved changes (simplified - could be enhanced)
  const [isDirty, setIsDirty] = React.useState(false);

  // Handle close request
  const handleCloseRequest = React.useCallback(() => {
    if (isDirty) {
      setShowCloseConfirm(true);
    } else {
      onOpenChange(false);
    }
  }, [isDirty, onOpenChange]);

  // Handle discard and close
  const handleDiscardAndClose = React.useCallback(() => {
    setShowCloseConfirm(false);
    onOpenChange(false);
  }, [onOpenChange]);

  // Handle save and close
  const handleSaveAndClose = React.useCallback(async () => {
    await saveDraft();
    setShowCloseConfirm(false);
    onOpenChange(false);
  }, [saveDraft, onOpenChange]);

  // Handle keyboard escape
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        e.preventDefault();
        handleCloseRequest();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, handleCloseRequest]);

  return (
    <>
      <DialogPrimitive.Root open={open} onOpenChange={(newOpen) => {
        if (!newOpen) {
          handleCloseRequest();
        } else {
          onOpenChange(true);
        }
      }}>
        <DialogPrimitive.Portal>
          <WizardModalOverlay />
          <WizardModalContent
            onPointerDownOutside={(e) => {
              // Prevent closing on outside click
              e.preventDefault();
            }}
            onInteractOutside={(e) => {
              e.preventDefault();
            }}
          >
            {/* Header with progress */}
            <WizardModalHeader
              onClose={handleCloseRequest}
              completedSteps={completedSteps}
            />

            {/* Scrollable content area */}
            <div className="flex-1 overflow-y-auto">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentStepNumber}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.2, ease: 'easeInOut' }}
                  className="h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Footer with navigation - Note: actual form submit happens in step content */}
            <WizardModalFooter
              currentStep={currentStepNumber}
              onBack={goToPreviousStep}
              onNext={async () => await goToNextStep()}
              onSave={saveDraft}
              canProceed={true}
              isSaving={isSaving}
              isSubmitting={isSubmitting}
            />
          </WizardModalContent>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>

      {/* Close confirmation dialog */}
      <CloseConfirmation
        open={showCloseConfirm}
        onOpenChange={setShowCloseConfirm}
        onConfirm={handleDiscardAndClose}
        onSaveAndClose={handleSaveAndClose}
      />
    </>
  );
}

// =============================================================================
// WIZARD MODAL TRIGGER (for convenience)
// =============================================================================

export function WizardModalTrigger({
  children,
  ...props
}: React.ComponentPropsWithoutRef<typeof DialogPrimitive.Trigger>) {
  return (
    <DialogPrimitive.Trigger {...props}>{children}</DialogPrimitive.Trigger>
  );
}

export { WizardModalContent, WizardModalOverlay };
