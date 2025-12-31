"use client";

import { useState, useEffect, Suspense, useId } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Mail } from "lucide-react";
import { IconBrandGoogle, IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { useAuth } from "@/lib/auth/auth-context";

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo") || "/dashboard";
  
  const { user, loading: authLoading, signIn, signInWithOAuth, resendVerificationEmail } = useAuth();
  
  // Generate unique IDs for form inputs
  const emailId = useId();
  const passwordId = useId();
  
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showResendVerification, setShowResendVerification] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Redirect if already logged in
  useEffect(() => {
    if (!authLoading && user) {
      router.push(redirectTo);
    }
  }, [user, authLoading, router, redirectTo]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);
    setShowResendVerification(false);
    
    const { error } = await signIn(email, password);
    
    if (error) {
      setError(error.message);
      if (error.message.includes("verify your email")) {
        setShowResendVerification(true);
      }
      setIsLoading(false);
      return;
    }
    
    // Successful login - redirect
    router.push(redirectTo);
  };

  const handleGoogleSignIn = async () => {
    setError(null);
    const { error } = await signInWithOAuth("google");
    if (error) {
      setError(error.message);
    }
    // OAuth will redirect to callback URL
  };

  const handleResendVerification = async () => {
    setResendLoading(true);
    setResendSuccess(false);
    
    const { error } = await resendVerificationEmail(email);
    
    if (error) {
      setError(error.message);
    } else {
      setResendSuccess(true);
    }
    setResendLoading(false);
  };

  // Show loading while checking auth state
  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // Don't render login form if already authenticated
  if (user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <SplitAuthLayout
      variant="login"
      marketingContent={<AuthMarketingPanel variant="login" />}
    >
      <AuthFormPanel>
        <AuthFormHeader
          title="Welcome back"
          description="Sign in to your account to continue"
        />

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive" className="mb-4">
            <IconAlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Success Alert */}
        {resendSuccess && (
          <Alert className="mb-4 border-green-500/50 bg-green-50 dark:bg-green-950/20">
            <IconCheck className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              Verification email sent! Please check your inbox.
            </AlertDescription>
          </Alert>
        )}

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
                required
                disabled={isLoading}
                className="pl-10"
                autoComplete="email"
              />
            </div>
          </div>
          
          {/* Password Field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor={passwordId}>Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm text-foreground/70 hover:text-foreground hover:underline transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <PasswordInput
              id={passwordId}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              autoComplete="current-password"
            />
          </div>

          {/* Resend Verification Button */}
          {showResendVerification && (
            <Button
              type="button"
              variant="outline"
              className="w-full border-amber-500/50 text-amber-700 hover:bg-amber-50 dark:text-amber-400 dark:hover:bg-amber-950/20"
              onClick={handleResendVerification}
              disabled={resendLoading}
            >
              {resendLoading ? (
                <>
                  <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                "Resend verification email"
              )}
            </Button>
          )}

          {/* Submit Button - High Contrast */}
          <Button
            type="submit"
            className="w-full bg-slate-900 hover:bg-slate-800 text-white dark:bg-white dark:text-slate-900 dark:hover:bg-slate-100 font-medium"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              "Sign in"
            )}
          </Button>
        </form>

        {/* Divider */}
        <AuthDivider />

        {/* Google Sign In - Clear Contrast */}
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

        {/* Sign Up Link */}
        <AuthFormFooter>
          Don&apos;t have an account?{" "}
          <Link 
            href="/signup" 
            className="text-foreground font-semibold hover:underline transition-colors"
          >
            Sign up
          </Link>
        </AuthFormFooter>
      </AuthFormPanel>
    </SplitAuthLayout>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-background flex items-center justify-center">
        <IconLoader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginPageContent />
    </Suspense>
  );
}
