"use client"

import { useEffect } from "react"
import { useAuth } from "@/hooks/useAuth"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (loading) return

    if (!user) {
      // Utilisateur non connecté → page de connexion
      router.push("/auth/signin")
      return
    }

    // Redirection selon le rôle
    if (user.role === "ADMIN") {
      router.push("/admin/dashboard")
    } else if (user.role === "CLIENT") {
      router.push("/client/dashboard")
    } else {
      // Rôle non défini → page de connexion
      router.push("/auth/signin")
    }
  }, [user, loading, router])

  // Page de chargement pendant la vérification
  return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <h2 className="text-xl font-semibold mb-2">Chargement...</h2>
        <p className="text-muted-foreground">Redirection en cours</p>
      </div>
    </div>
  )
}
