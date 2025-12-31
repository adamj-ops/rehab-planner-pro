"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { WizardProvider, useWizard } from "@/components/wizard/wizard-context";
import { WizardModal } from "@/components/wizard/wizard-modal";

function WizardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isModalOpen, openModal, closeModal } = useWizard();
  
  // Auto-open modal when navigating to wizard routes
  useEffect(() => {
    if (pathname.startsWith('/wizard') && !isModalOpen) {
      openModal();
    }
  }, [pathname, isModalOpen, openModal]);
  
  return (
    <WizardModal open={isModalOpen} onOpenChange={(open) => {
      if (!open) {
        closeModal();
        // Navigate back to projects or dashboard when modal closes
        window.history.back();
      }
    }}>
      {children}
    </WizardModal>
  );
}

export default function WizardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WizardProvider>
      <WizardLayoutContent>{children}</WizardLayoutContent>
    </WizardProvider>
  );
}
