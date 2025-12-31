"use client";

import { useState, useEffect, useId } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Mail, User } from "lucide-react";
import { IconBrandGoogle, IconLoader2, IconAlertCircle, IconCheck, IconMail } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { PasswordInput } from "@/components/ui/password-input";
import { SplitAuthLayout } from "@/components/auth/split-auth-layout";
import { AuthMarketingPanel } from "@/components/auth/auth-marketing-panel";
import { 
  AuthFormPanel, 
  AuthFormHeader, 
  AuthFormFooter, 
  AuthDivider 
} from "@/components/auth/auth-form-panel";
import { PasswordStrengthIndicator, usePasswordStrength } from "@/components/auth/password-strength-indicator";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading, signUp, signInWithOAuth } = useAuth();
  
  // Generate unique IDs for form inputs
  const firstNameId = useId();
  const lastNameId = useId();
  const emailId = useId();
  const passwordId = useId();
  const confirmPasswordId = useId();
  const termsId = useId();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const passwordStrength = usePasswordStrength(formData.password);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push("/dashboard");
    }
  }, [user, authLoading, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    // Validate password length
    if (formData.password.length < 8) {
      setError("Password must be at least 8 characters");
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setIsLoading(false);
      return;
    }

    // Check password strength
    if (passwordStrength < 2) {
      setError("Please choose a stronger password");
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(formData.email, formData.password, {
      firstName: formData.firstName,
      lastName: formData.lastName,
    });

    if (error) {
      setError(error.message);
      setIsLoading(false);
      return;
    }

    // Show success message - user needs to verify email
    setSuccess(true);
    setIsLoading(false);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithOAuth("google");
    if (error) {
      setError(error.message);
    }
    // OAuth will redirect to callback URL
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render signup form if already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Success State
  if (success) {
    return (
      <SplitAuthLayout
        variant="signup"
        marketingContent={<AuthMarketingPanel variant="signup" />}
      >
        <AuthFormPanel>
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
              <IconMail className="h-8 w-8 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold tracking-tight">Check your email</h2>
              <p className="text-muted-foreground">
                We&apos;ve sent a verification link to{" "}
                <span className="font-medium text-foreground">{formData.email}</span>
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              Click the link in your email to verify your account. If you don&apos;t see it, check your spam folder.
            </p>
            <div className="pt-4 space-y-3">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
                <Link href="/login">
                  Back to sign in
                </Link>
              </Button>
            </div>
          </div>
        </AuthFormPanel>
      </SplitAuthLayout>
    );
  }

  return (
    <SplitAuthLayout
      variant="signup"
      marketingContent={<AuthMarketingPanel variant="signup" />}
    >
      <AuthFormPanel>
        <AuthFormHeader
          title="Create an account"
          description="Get started with Rehab Planner Pro"
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Signup Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name Fields */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <Label htmlFor={firstNameId}>First name</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id={firstNameId}
                  placeholder="John"
                  value={formData.firstName}
                  onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                  required
                  disabled={isLoading}
                  className="pl-10"
                  autoComplete="given-name"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor={lastNameId}>Last name</Label>
              <Input
                id={lastNameId}
                placeholder="Doe"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
                disabled={isLoading}
                autoComplete="family-name"
              />
            </div>
          </div>

          {/* Email Field */}
          <div className="space-y-2">
            <Label htmlFor={emailId}>Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <Input
                id={emailId}
                type="email"
                placeholder="you@example.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor={passwordId}>Password</Label>
            <PasswordInput
              id={passwordId}
              placeholder="Create a strong password"
              value={formData.password}
              onChange={(e) => setFormData({ ...formData, password: e.target.value })}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            <PasswordStrengthIndicator password={formData.password} />
          </div>

          {/* Confirm Password Field */}
          <div className="space-y-2">
            <Label htmlFor={confirmPasswordId}>Confirm password</Label>
            <PasswordInput
              id={confirmPasswordId}
              placeholder="Confirm your password"
              value={formData.confirmPassword}
              onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
              required
              disabled={isLoading}
              autoComplete="new-password"
            />
            {formData.confirmPassword && formData.password !== formData.confirmPassword && (
              <p className="text-xs text-destructive">Passwords do not match</p>
            )}
            {formData.confirmPassword && formData.password === formData.confirmPassword && formData.password.length > 0 && (
              <p className="text-xs text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                <IconCheck className="h-3 w-3" />
                Passwords match
              </p>
            )}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start space-x-2">
            <Checkbox
              id={termsId}
              checked={formData.agreeToTerms}
              onCheckedChange={(checked) => 
                setFormData({ ...formData, agreeToTerms: checked as boolean })
              }
              disabled={isLoading}
              className="mt-0.5"
            />
            <label
              htmlFor={termsId}
              className="text-sm text-muted-foreground leading-relaxed cursor-pointer"
            >
              I agree to the{" "}
              <Link href="/terms" className="text-foreground font-medium hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-foreground font-medium hover:underline">
                Privacy Policy
              </Link>
            </label>
          </div>

          {/* Submit Button - High Contrast */}
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
            disabled={isLoading || !formData.agreeToTerms}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              "Create account"
            )}
          </Button>
        </form>

        {/* Divider */}
        <AuthDivider />

        {/* Google Sign Up - Clear Contrast */}
        <Button
          type="button"
          variant="outline"
          className="w-full border-border hover:bg-muted/50 font-medium"
          onClick={handleGoogleSignIn}
          disabled={isLoading}
        >
          <IconBrandGoogle className="mr-2 h-4 w-4" />
          Continue with Google
        </Button>

        {/* Sign In Link */}
        <AuthFormFooter>
          Already have an account?{" "}
          <Link 
            href="/login" 
            className="text-foreground font-semibold hover:underline transition-colors"
          >
            Sign in
          </Link>
        </AuthFormFooter>
      </AuthFormPanel>
    </SplitAuthLayout>
  );
}
