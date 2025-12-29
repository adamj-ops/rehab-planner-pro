"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";
import { IconBrandGoogle, IconHome, IconLoader2, IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { useAuth } from "@/lib/auth/auth-context";

export default function SignupPage() {
  const router = useRouter();
  const { user, loading: authLoading, signUp, signInWithOAuth } = useAuth();
  
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    agreeToTerms: false,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-xl font-semibold">
            <IconHome className="h-6 w-6 text-primary" />
            <span>Rehab Planner Pro</span>
          </Link>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold">Create account</CardTitle>
            <CardDescription>
              Get started with Rehab Planner Pro
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success ? (
              <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
                <IconCheck className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800 dark:text-green-200">
                  <strong>Check your email!</strong> We&apos;ve sent you a verification link. 
                  Please click it to activate your account, then{" "}
                  <Link href="/login" className="underline font-medium">
                    sign in
                  </Link>.
                </AlertDescription>
              </Alert>
            ) : (
              <>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="firstName">First Name</Label>
                      <Input
                        id="firstName"
                        placeholder="John"
                        value={formData.firstName}
                        onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="lastName">Last Name</Label>
                      <Input
                        id="lastName"
                        placeholder="Doe"
                        value={formData.lastName}
                        onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                        required
                        disabled={isLoading}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Create a password"
                      value={formData.password}
                      onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                      required
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      At least 8 characters
                    </p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="terms"
                      checked={formData.agreeToTerms}
                      onCheckedChange={(checked) => 
                        setFormData({ ...formData, agreeToTerms: checked as boolean })
                      }
                      disabled={isLoading}
                    />
                    <label
                      htmlFor="terms"
                      className="text-sm text-muted-foreground"
                    >
                      I agree to the{" "}
                      <Link href="/terms" className="text-primary hover:underline">
                        terms
                      </Link>
                    </label>
                  </div>

                  <Button
                    type="submit"
                    className="w-full"
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

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-card px-2 text-muted-foreground">
                      Or continue with
                    </span>
                  </div>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  className="w-full"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                >
                  <IconBrandGoogle className="mr-2 h-4 w-4" />
                  Google
                </Button>
              </>
            )}

            <div className="text-sm text-center text-muted-foreground">
              Already have an account?{" "}
              <Link href="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </CardContent>
        </Card>
      </main>

      <footer className="border-t py-4">
        <div className="container mx-auto px-4">
          <p className="text-center text-sm text-muted-foreground">
            © {new Date().getFullYear()} Rehab Planner Pro
          </p>
        </div>
      </footer>
    </div>
  );
}
