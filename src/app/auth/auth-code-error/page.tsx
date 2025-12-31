"use client";

import Link from "next/link";
import { IconAlertCircle, IconRefresh } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { AuthFormPanel } from "@/components/auth/auth-form-panel";

export default function AuthCodeErrorPage() {
  return (
    <SplitAuthLayout
      variant="reset"
      marketingContent={<AuthMarketingPanel variant="reset" />}
    >
      <AuthFormPanel>
        <div className="text-center space-y-4">
          {/* Error Icon */}
          <div className="mx-auto w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center">
            <IconAlertCircle className="h-8 w-8 text-destructive" />
          </div>

          {/* Title and Description */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight">
              Authentication Error
            </h2>
            <p className="text-muted-foreground">
              We couldn&apos;t complete the authentication process
            </p>
          </div>

          {/* Explanation */}
          <div className="text-left space-y-2 py-2">
            <p className="text-sm text-muted-foreground">
              This could happen if:
            </p>
            <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
              <li>The link has expired</li>
              <li>The link has already been used</li>
              <li>There was a network issue</li>
            </ul>
          </div>

          {/* Action Buttons */}
          <div className="pt-4 space-y-3">
            <Button
              className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
              asChild
            >
              <Link href="/login">
                <IconRefresh className="mr-2 h-4 w-4" />
                Try again
              </Link>
            </Button>
            <Button
              variant="outline"
              className="w-full"
              asChild
            >
              <Link href="/">← Go to home</Link>
            </Button>
          </div>
        </div>
      </AuthFormPanel>
    </SplitAuthLayout>
  );
}
