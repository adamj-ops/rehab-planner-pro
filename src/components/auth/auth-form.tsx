'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Separator } from '@/components/ui/separator'
import { Checkbox } from '@/components/ui/checkbox'
import { Eye, EyeOff, Mail, Lock, AlertCircle, CheckCircle2 } from 'lucide-react'
import { Icons } from '@/components/ui/icons'
import { useAuth } from '@/lib/auth/auth-context'
import { cn } from '@/lib/utils'

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  agreedToTerms: z.boolean().refine((val) => val === true, {
    message: 'You must agree to the terms and conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

const signInSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
})

type SignUpFormData = z.infer<typeof signUpSchema>
type SignInFormData = z.infer<typeof signInSchema>

interface AuthFormProps {
  mode: 'signin' | 'signup'
  onModeChange: (mode: 'signin' | 'signup') => void
}

export function AuthForm({ mode, onModeChange }: AuthFormProps) {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  
  const { signIn, signUp, signInWithOAuth } = useAuth()

  const signUpForm = useForm<SignUpFormData>({
    resolver: zodResolver(signUpSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      password: '',
      confirmPassword: '',
      agreedToTerms: false,
    },
  })

  const signInForm = useForm<SignInFormData>({
    resolver: zodResolver(signInSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  })

  // Password strength calculator
  const getPasswordStrength = (password: string) => {
    let strength = 0
    if (password.length >= 8) strength++
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) strength++
    if (/\d/.test(password)) strength++
    if (/[!@#$%^&*]/.test(password)) strength++
    return strength
  }

  const passwordStrength = getPasswordStrength(signUpForm.watch('password') || '')

  const onSubmitSignUp = async (data: SignUpFormData) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      const { user, error } = await signUp(data.email, data.password)
      
      if (error) {
        setError(error.message)
      } else if (user) {
        setSuccess('Account created successfully! Please check your email to verify your account.')
        signUpForm.reset()
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const onSubmitSignIn = async (data: SignInFormData) => {
    setIsLoading(true)
    setError(null)

    try {
      const { user, error } = await signIn(data.email, data.password)
      
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuthSignIn = async (provider: 'google') => {
    setIsLoading(true)
    setError(null)
    
    try {
      const { error } = await signInWithOAuth(provider)
      if (error) {
        setError(error.message)
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleModeChange = () => {
    setError(null)
    setSuccess(null)
    signUpForm.reset()
    signInForm.reset()
    onModeChange(mode === 'signin' ? 'signup' : 'signin')
  }

  // Success state for sign-up
  if (success && mode === 'signup') {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-green-100">
            <CheckCircle2 className="h-6 w-6 text-green-600" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Check your email</CardTitle>
          <CardDescription className="mt-2">
            We've sent a verification link to your email address
          </CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-sm text-muted-foreground">
            Click the link in your email to verify your account.
            If you don't see it, check your spam folder.
          </p>
        </CardContent>
        <CardFooter>
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              setSuccess(null)
              onModeChange('signin')
            }}
          >
            Back to sign in
          </Button>
        </CardFooter>
      </Card>
    )
  }

  if (mode === 'signup') {
    return (
      <Card className="border-0 shadow-xl">
        <CardHeader className="space-y-1 pb-6">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Create an account
          </CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your information to get started
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          <form onSubmit={signUpForm.handleSubmit(onSubmitSignUp)} className="space-y-4">
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First name</Label>
                <Input
                  id="firstName"
                  placeholder="John"
                  {...signUpForm.register('firstName')}
                  disabled={isLoading}
                />
                {signUpForm.formState.errors.firstName && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.firstName.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last name</Label>
                <Input
                  id="lastName"
                  placeholder="Doe"
                  {...signUpForm.register('lastName')}
                  disabled={isLoading}
                />
                {signUpForm.formState.errors.lastName && (
                  <p className="text-sm text-destructive">
                    {signUpForm.formState.errors.lastName.message}
                  </p>
                )}
              </div>
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-9"
                  {...signUpForm.register('email')}
                  disabled={isLoading}
                />
              </div>
              {signUpForm.formState.errors.email && (
                <p className="text-sm text-destructive">
                  {signUpForm.formState.errors.email.message}
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Create a strong password"
                  className="pl-9 pr-9"
                  {...signUpForm.register('password')}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
              
              {/* Password Strength Indicator */}
              {signUpForm.watch('password') && (
                <div className="space-y-2">
                  <div className="flex gap-1">
                    {[1, 2, 3, 4].map((level) => (
                      <div
                        key={level}
                        className={cn(
                          "h-1 flex-1 rounded-full transition-colors",
                          level <= passwordStrength
                            ? passwordStrength <= 2
                              ? "bg-yellow-500"
                              : "bg-green-500"
                            : "bg-gray-200"
                        )}
                      />
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {passwordStrength <= 1 && "Weak password"}
                    {passwordStrength === 2 && "Fair password"}
                    {passwordStrength === 3 && "Good password"}
                    {passwordStrength === 4 && "Strong password"}
                  </p>
                </div>
              )}
              
              {signUpForm.formState.errors.password && (
                <p className="text-sm text-destructive">
                  {signUpForm.formState.errors.password.message}
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirm your password"
                  className="pl-9"
                  {...signUpForm.register('confirmPassword')}
                  disabled={isLoading}
                />
              </div>
              {signUpForm.formState.errors.confirmPassword && (
                <p className="text-sm text-destructive">
                  {signUpForm.formState.errors.confirmPassword.message}
                </p>
              )}
            </div>

            {/* Terms Checkbox */}
            <div className="flex items-start space-x-2">
              <Checkbox
                id="terms"
                checked={signUpForm.watch('agreedToTerms')}
                onCheckedChange={(checked) => 
                  signUpForm.setValue('agreedToTerms', checked === true)
                }
                disabled={isLoading}
              />
              <Label
                htmlFor="terms"
                className="text-sm font-normal leading-relaxed"
              >
                I agree to the{' '}
                <Link href="/terms" className="font-medium underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="font-medium underline">
                  Privacy Policy
                </Link>
              </Label>
            </div>
            {signUpForm.formState.errors.agreedToTerms && (
              <p className="text-sm text-destructive">
                {signUpForm.formState.errors.agreedToTerms.message}
              </p>
            )}

            {/* Error Alert */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                  Creating account...
                </>
              ) : (
                'Create account'
              )}
            </Button>
          </form>
        </CardContent>

        <CardFooter className="pt-6">
          <div className="text-sm text-center text-muted-foreground w-full">
            Already have an account?{' '}
            <button
              type="button"
              onClick={handleModeChange}
              className="font-medium text-primary hover:underline"
            >
              Sign in
            </button>
          </div>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className="border-0 shadow-xl">
      <CardHeader className="space-y-1 pb-6">
        <CardTitle className="text-2xl font-bold tracking-tight">
          Welcome back
        </CardTitle>
        <CardDescription className="text-sm text-muted-foreground">
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* OAuth Buttons */}
        <div className="grid grid-cols-3 gap-4">
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('google')}
            disabled={isLoading}
            className="w-full"
          >
            <Icons.google className="mr-2 h-4 w-4" />
            Google
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('github')}
            disabled={isLoading}
            className="w-full"
          >
            <Icons.github className="mr-2 h-4 w-4" />
            GitHub
          </Button>
          <Button
            variant="outline"
            onClick={() => handleOAuthSignIn('microsoft')}
            disabled={isLoading}
            className="w-full"
          >
            <Icons.microsoft className="mr-2 h-4 w-4" />
            Microsoft
          </Button>
        </div>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <Separator />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or continue with email
            </span>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Email/Password Form */}
        <form onSubmit={signInForm.handleSubmit(onSubmitSignIn)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                className="pl-9"
                {...signInForm.register('email')}
                disabled={isLoading}
              />
            </div>
            {signInForm.formState.errors.email && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.email.message}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-primary hover:underline"
              >
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                className="pl-9 pr-9"
                {...signInForm.register('password')}
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-muted-foreground hover:text-foreground"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>
            {signInForm.formState.errors.password && (
              <p className="text-sm text-destructive">
                {signInForm.formState.errors.password.message}
              </p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
                Signing in...
              </>
            ) : (
              'Sign in'
            )}
          </Button>
        </form>
      </CardContent>

      <CardFooter className="flex flex-col space-y-4 pt-6">
        <div className="text-sm text-center text-muted-foreground">
          Don't have an account?{' '}
          <button
            type="button"
            onClick={handleModeChange}
            className="font-medium text-primary hover:underline"
          >
            Sign up
          </button>
        </div>
      </CardFooter>
    </Card>
  )
}
