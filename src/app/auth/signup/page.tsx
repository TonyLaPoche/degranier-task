'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/hooks/useAuth.tsx'
import AuthForm from '@/components/AuthForm'

export default function SignUp() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      // Redirection basée sur le rôle
      if (user.role === 'ADMIN') {
        router.push('/admin/dashboard')
      } else {
        router.push('/client/dashboard')
      }
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  // Le composant AuthForm commence en mode inscription
  return <AuthForm defaultMode="signup" />
}
