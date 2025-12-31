"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { Mail } from "lucide-react";
import { IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import {
  AuthFormPanel,
  AuthFormHeader,
  AuthFormFooter,
} from "@/components/auth/auth-form-panel";
import { useAuth } from "@/lib/auth/auth-context";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuth();

  // Generate unique ID for email input
  const emailId = useId();

  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const { error } = await resetPassword(email);

      if (error) {
        setError(error.message);
      } else {
        setIsSubmitted(true);
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Success State
  if (isSubmitted) {
    return (
      <SplitAuthLayout
        variant="reset"
        marketingContent={<AuthMarketingPanel variant="reset" />}
      >
        <AuthFormPanel>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <IconCheck className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">
                Check your email
              </h2>
              <p className="text-muted-foreground">
                We sent a password reset link to{" "}
                <span className="font-medium text-foreground">{email}</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Click the link in your email to reset your password. If you
              don&apos;t see it, check your spam folder.
            </p>
            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setIsSubmitted(false);
                  setEmail("");
                }}
              >
                Send another link
              </Button>
              <Button
                variant="ghost"
                className="w-full text-foreground/70 hover:text-foreground"
                asChild
              >
                <Link href="/login">← Back to sign in</Link>
              </Button>
            </div>
          </div>
        </AuthFormPanel>
      </SplitAuthLayout>
    );
  }

  return (
    <SplitAuthLayout
      variant="reset"
      marketingContent={<AuthMarketingPanel variant="reset" />}
    >
      <AuthFormPanel>
        <AuthFormHeader
          title="Forgot password?"
          description="Enter your email and we'll send you a reset link"
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Reset Password Form */}
        <form onSubmit={handleResetPassword} className="space-y-4">
          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id={emailId}
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
                disabled={isLoading}
                autoFocus
                autoComplete="email"
              />
            </div>
          </div>

          {/* Submit Button - High Contrast */}
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
            disabled={isLoading || !email}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Sending link...
              </>
            ) : (
              "Send reset link"
            )}
          </Button>
        </form>

        {/* Back to Sign In Link */}
        <AuthFormFooter>
          <Link
            href="/login"
            className="text-foreground/70 hover:text-foreground hover:underline transition-colors"
          >
            ← Back to sign in
          </Link>
        </AuthFormFooter>
      </AuthFormPanel>
    </SplitAuthLayout>
  );
}
