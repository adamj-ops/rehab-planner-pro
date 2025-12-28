import { supabase } from '@/lib/supabase/client'

export interface UserProfile {
  id: string
  user_id: string
  first_name: string | null
  last_name: string | null
  display_name: string | null
  phone: string | null
  company: string | null
  job_title: string | null
  city: string | null
  state: string | null
  country: string | null
  bio: string | null
  avatar_url: string | null
  timezone: string
  created_at: string
  updated_at: string
}

export type ProfileUpdateData = Partial<
  Omit<UserProfile, 'id' | 'user_id' | 'created_at' | 'updated_at'>
>

export async function getProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()

  if (error) {
    console.error('Error fetching profile:', error)
    return null
  }
  return data
}

export async function updateProfile(
  userId: string,
  updates: ProfileUpdateData
): Promise<{ data: UserProfile | null; error: Error | null }> {
  const { data, error } = await supabase
    .from('user_profiles')
    .update(updates)
    .eq('user_id', userId)
    .select()
    .single()

  if (error) {
    console.error('Error updating profile:', error)
    return { data: null, error }
  }
  return { data, error: null }
}

export async function uploadAvatar(
  userId: string,
  file: File
): Promise<{ url: string | null; error: Error | null }> {
  const fileExt = file.name.split('.').pop()
  const fileName = `${userId}-${Date.now()}.${fileExt}`
  const filePath = `avatars/${fileName}`

  const { error: uploadError } = await supabase.storage
    .from('avatars')
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error('Error uploading avatar:', uploadError)
    return { url: null, error: uploadError }
  }

  const { data } = supabase.storage.from('avatars').getPublicUrl(filePath)

  // Update profile with new avatar URL
  await updateProfile(userId, { avatar_url: data.publicUrl })

  return { url: data.publicUrl, error: null }
}

export async function deleteAvatar(userId: string): Promise<{ error: Error | null }> {
  // Get current profile to find avatar path
  const profile = await getProfile(userId)
  if (!profile?.avatar_url) {
    return { error: null }
  }

  // Extract file path from URL
  const url = new URL(profile.avatar_url)
  const pathMatch = url.pathname.match(/\/avatars\/(.+)$/)
  if (!pathMatch) {
    return { error: null }
  }

  const filePath = `avatars/${pathMatch[1]}`

  const { error: deleteError } = await supabase.storage
    .from('avatars')
    .remove([filePath])

  if (deleteError) {
    console.error('Error deleting avatar:', deleteError)
    return { error: deleteError }
  }

  // Clear avatar URL in profile
  await updateProfile(userId, { avatar_url: null })

  return { error: null }
}
