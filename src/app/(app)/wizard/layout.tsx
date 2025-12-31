"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { WizardProvider, useWizard } from "@/components/wizard/wizard-context";
import { WizardModal } from "@/components/wizard/wizard-modal";

function WizardLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isModalOpen, openModal, closeModal } = useWizard();
  
  // Auto-open modal when navigating to wizard routes
  useEffect(() => {
    if (pathname.startsWith('/wizard') && !isModalOpen) {
      openModal();
    }
  }, [pathname, isModalOpen, openModal]);
  
  // Safe navigation handler for wizard close
  const handleWizardClose = (open: boolean) => {
    if (!open) {
      closeModal();
      
      // Navigate to a predictable, safe location when wizard closes
      // Instead of history.back() which could go anywhere
      if (typeof window !== 'undefined') {
        // Check if we have a referrer from within our app
        const referrer = document.referrer;
        const isInternalReferrer = referrer && 
          (referrer.includes('/projects') || 
           referrer.includes('/dashboard') ||
           referrer.includes(window.location.origin));
        
        if (isInternalReferrer && window.history.length > 1) {
          // Safe to go back - user came from within our app
          router.back();
        } else {
          // Default to projects page for safe navigation
          router.push('/projects');
        }
      } else {
        // Fallback for SSR/hydration cases
        router.push('/projects');
      }
    }
  };
  
  return (
    <WizardModal open={isModalOpen} onOpenChange={handleWizardClose}>
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
