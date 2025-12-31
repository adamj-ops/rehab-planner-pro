'use client'

import { useState, useEffect, useRef } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { IconLoader2, IconUpload, IconTrash, IconCheck, IconAlertCircle } from '@tabler/icons-react'
import { useAuth } from '@/lib/auth/auth-context'
import { getProfile, updateProfile, uploadAvatar, deleteAvatar, type UserProfile } from '@/lib/services/profile-service'
import { InvestmentPreferencesSection } from '@/components/settings/investment-preferences-section'
import { toast } from 'sonner'

const profileSchema = z.object({
  first_name: z.string().min(1, 'First name is required'),
  last_name: z.string().min(1, 'Last name is required'),
  display_name: z.string().optional(),
  phone: z.string().optional(),
  company: z.string().optional(),
  job_title: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  country: z.string().optional(),
  bio: z.string().max(500, 'Bio must be 500 characters or less').optional(),
})

type ProfileFormData = z.infer<typeof profileSchema>

export default function ProfilePage() {
  const { user } = useAuth()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      first_name: '',
      last_name: '',
      display_name: '',
      phone: '',
      company: '',
      job_title: '',
      city: '',
      state: '',
      country: '',
      bio: '',
    },
  })

  useEffect(() => {
    async function loadProfile() {
      if (!user) return

      setIsLoading(true)
      const profileData = await getProfile(user.id)
      if (profileData) {
        setProfile(profileData)
        form.reset({
          first_name: profileData.first_name || '',
          last_name: profileData.last_name || '',
          display_name: profileData.display_name || '',
          phone: profileData.phone || '',
          company: profileData.company || '',
          job_title: profileData.job_title || '',
          city: profileData.city || '',
          state: profileData.state || '',
          country: profileData.country || '',
          bio: profileData.bio || '',
        })
      }
      setIsLoading(false)
    }

    loadProfile()
  }, [user, form])

  const onSubmit = async (data: ProfileFormData) => {
    if (!user) return

    setIsSaving(true)
    setError(null)

    const { data: updatedProfile, error: updateError } = await updateProfile(user.id, {
      first_name: data.first_name || null,
      last_name: data.last_name || null,
      display_name: data.display_name || null,
      phone: data.phone || null,
      company: data.company || null,
      job_title: data.job_title || null,
      city: data.city || null,
      state: data.state || null,
      country: data.country || null,
      bio: data.bio || null,
    })

    if (updateError) {
      setError('Failed to update profile. Please try again.')
      toast.error('Failed to update profile')
    } else {
      setProfile(updatedProfile)
      toast.success('Profile updated successfully')
    }

    setIsSaving(false)
  }

  const handleAvatarUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file || !user) return

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please upload an image file')
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image must be less than 5MB')
      return
    }

    setIsUploadingAvatar(true)

    const { url, error } = await uploadAvatar(user.id, file)

    if (error) {
      toast.error('Failed to upload avatar')
    } else if (url) {
      setProfile((prev) => (prev ? { ...prev, avatar_url: url } : null))
      toast.success('Avatar updated successfully')
    }

    setIsUploadingAvatar(false)

    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  const handleAvatarDelete = async () => {
    if (!user) return

    setIsUploadingAvatar(true)

    const { error } = await deleteAvatar(user.id)

    if (error) {
      toast.error('Failed to delete avatar')
    } else {
      setProfile((prev) => (prev ? { ...prev, avatar_url: null } : null))
      toast.success('Avatar deleted')
    }

    setIsUploadingAvatar(false)
  }

  const getInitials = () => {
    const first = profile?.first_name?.[0] || user?.user_metadata?.first_name?.[0] || ''
    const last = profile?.last_name?.[0] || user?.user_metadata?.last_name?.[0] || ''
    return (first + last).toUpperCase() || user?.email?.[0]?.toUpperCase() || 'U'
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <IconLoader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Avatar Section */}
      <Card>
        <CardHeader>
          <CardTitle>Profile Photo</CardTitle>
          <CardDescription>
            Upload a photo to personalize your account.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center gap-6">
          <Avatar className="h-20 w-20">
            <AvatarImage src={profile?.avatar_url || undefined} alt="Profile" />
            <AvatarFallback className="text-lg">{getInitials()}</AvatarFallback>
          </Avatar>
          <div className="flex gap-2">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleAvatarUpload}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingAvatar}
            >
              {isUploadingAvatar ? (
                <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <IconUpload className="mr-2 h-4 w-4" />
              )}
              Upload
            </Button>
            {profile?.avatar_url && (
              <Button
                variant="outline"
                onClick={handleAvatarDelete}
                disabled={isUploadingAvatar}
              >
                <IconTrash className="mr-2 h-4 w-4" />
                Remove
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Profile Form */}
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Update your personal details.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {error && (
              <Alert variant="destructive">
                <IconAlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">First name</Label>
                <Input
                  id="first_name"
                  {...form.register('first_name')}
                  disabled={isSaving}
                />
                {form.formState.errors.first_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.first_name.message}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="last_name">Last name</Label>
                <Input
                  id="last_name"
                  {...form.register('last_name')}
                  disabled={isSaving}
                />
                {form.formState.errors.last_name && (
                  <p className="text-sm text-destructive">
                    {form.formState.errors.last_name.message}
                  </p>
                )}
              </div>
            </div>

            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Display name</Label>
              <Input
                id="display_name"
                placeholder="How you want to be addressed"
                {...form.register('display_name')}
                disabled={isSaving}
              />
              <p className="text-xs text-muted-foreground">
                This is how your name will appear in the app.
              </p>
            </div>

            <Separator />

            {/* Contact */}
            <div className="space-y-2">
              <Label htmlFor="phone">Phone number</Label>
              <Input
                id="phone"
                type="tel"
                placeholder="+1 (555) 000-0000"
                {...form.register('phone')}
                disabled={isSaving}
              />
            </div>

            <Separator />

            {/* Professional */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="company">Company</Label>
                <Input
                  id="company"
                  placeholder="Your company name"
                  {...form.register('company')}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="job_title">Job title</Label>
                <Input
                  id="job_title"
                  placeholder="Your role"
                  {...form.register('job_title')}
                  disabled={isSaving}
                />
              </div>
            </div>

            <Separator />

            {/* Location */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  placeholder="City"
                  {...form.register('city')}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="state">State / Province</Label>
                <Input
                  id="state"
                  placeholder="State"
                  {...form.register('state')}
                  disabled={isSaving}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  {...form.register('country')}
                  disabled={isSaving}
                />
              </div>
            </div>

            <Separator />

            {/* Bio */}
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                placeholder="Tell us a little about yourself..."
                className="min-h-[100px]"
                {...form.register('bio')}
                disabled={isSaving}
              />
              <div className="flex justify-between">
                <p className="text-xs text-muted-foreground">
                  Brief description for your profile.
                </p>
                <p className="text-xs text-muted-foreground">
                  {form.watch('bio')?.length || 0}/500
                </p>
              </div>
              {form.formState.errors.bio && (
                <p className="text-sm text-destructive">
                  {form.formState.errors.bio.message}
                </p>
              )}
            </div>

            {/* Submit Button */}
            <div className="flex justify-end">
              <Button type="submit" disabled={isSaving}>
                {isSaving ? (
                  <>
                    <IconLoader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <IconCheck className="mr-2 h-4 w-4" />
                    Save changes
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Investment Preferences Section */}
      <Card>
        <CardHeader>
          <CardTitle>Investment Preferences</CardTitle>
          <CardDescription>
            Update your investment profile to personalize your experience.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <InvestmentPreferencesSection />
        </CardContent>
      </Card>
    </div>
  )
}
