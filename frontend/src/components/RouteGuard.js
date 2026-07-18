'use client'
import { useEffect } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Where each role lands when it tries to open a page it is not allowed to see.
const HOME_FOR = {
  admin: '/dashboard',
  vendor: '/dashboard',
  customer: '/shop',
}

function FullScreenLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-200 border-t-indigo-600" />
    </div>
  )
}

/**
 * Client-side role guard.
 *
 * - `allow`        roles permitted to view the wrapped pages.
 * - `publicPaths`  path prefixes anonymous visitors may still open (e.g. browse).
 *
 * Blocks direct URL access AND avoids flashing protected UI: while the decision
 * is pending (or a redirect is in flight) it renders a loader instead of the
 * children, so an unauthorized role never sees the page even for a moment.
 */
export default function RouteGuard({ allow, publicPaths = [], children }) {
  const { user, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()

  const isPublic = publicPaths.some(
    (p) => pathname === p || pathname.startsWith(p + '/')
  )
  const roleAllowed = user && (!allow || allow.includes(user.role))

  useEffect(() => {
    if (loading) return
    if (!user) {
      // Anonymous: allowed only on explicitly public paths.
      if (!isPublic) router.replace('/login')
      return
    }
    // Logged in but wrong role — send them to their own home, even on public paths.
    if (allow && !allow.includes(user.role)) {
      router.replace(HOME_FOR[user.role] || '/login')
    }
  }, [loading, user, isPublic, allow, pathname, router])

  if (loading) return <FullScreenLoader />
  if (!user) return isPublic ? children : <FullScreenLoader />
  if (!roleAllowed) return <FullScreenLoader />
  return children
}
