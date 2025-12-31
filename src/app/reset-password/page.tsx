"use client";

import { useState, useId } from "react";
import Link from "next/link";
import { IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import {
  AuthFormPanel,
  AuthFormHeader,
  AuthFormFooter,
} from "@/components/auth/auth-form-panel";
import {
  PasswordStrengthIndicator,
  usePasswordStrength,
} from "@/components/auth/password-strength-indicator";
import { useAuth } from "@/lib/auth/auth-context";

export default function ResetPasswordPage() {
  const { updatePassword } = useAuth();

  // Generate unique IDs for form inputs
  const passwordId = useId();
  const confirmPasswordId = useId();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const passwordStrength = usePasswordStrength(password);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (password.length < 8) {
      setError("Password must be at least 8 characters");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    // Check password strength
    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      return;
    }

    setIsLoading(true);

    try {
      const { error } = await updatePassword(password);

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
                Password updated
              </h2>
              <p className="text-muted-foreground">
                Your password has been successfully reset.
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              You can now sign in with your new password.
            </p>
            <div className="pt-4">
              <Button
                className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
                asChild
              >
                <Link href="/login">Sign in</Link>
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
          title="Set new password"
          description="Enter your new password below"
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
          {/* New Password Field */}
          <div className="space-y-2">
            <Label htmlFor={passwordId}>New password</Label>
            <PasswordInput
              id={passwordId}
              placeholder="Enter your new password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoFocus
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={password} />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor={confirmPasswordId}>Confirm new password</Label>
            <PasswordInput
              id={confirmPasswordId}
              placeholder="Confirm your new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
            {confirmPassword &&
              password === confirmPassword &&
              password.length > 0 && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <IconCheck className="h-3 w-3" />
                  Passwords match
                </p>
              )}
          </div>

          {/* Submit Button - High Contrast */}
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
            disabled={isLoading || !password || !confirmPassword}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Updating password...
              </>
            ) : (
              "Update password"
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
