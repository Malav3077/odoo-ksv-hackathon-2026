'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/context/AuthContext'

// Send already-authenticated users away from login/signup to their own area.
const HOME_FOR = { admin: '/dashboard', vendor: '/dashboard', customer: '/shop' }

export default function AuthLayout({ children }) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.replace(HOME_FOR[user.role] || '/shop')
    }
  }, [loading, user, router])

  if (!loading && user) return null
  return <>{children}</>
}
