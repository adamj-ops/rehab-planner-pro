'use client'

import { useAuth } from '@/lib/auth/auth-context'
import { NavUser } from '@/components/nav-user'
import { Skeleton } from '@/components/ui/skeleton'

export function NavUserAuth() {
  const { user, loading, signOut } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center gap-2 p-2">
        <Skeleton className="size-8 rounded-none" />
        <div className="space-y-1">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-32" />
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  // Extract display name from user metadata or email
  const displayName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'

  const userData = {
    name: displayName,
    email: user.email || '',
    avatar: user.user_metadata?.avatar_url || '',
  }

  return <NavUser user={userData} onSignOut={signOut} />
}
