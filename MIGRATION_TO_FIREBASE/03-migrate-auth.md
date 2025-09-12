# 3️⃣ Migration Authentification

## Objectif

Remplacer NextAuth.js par Firebase Authentication pour simplifier la gestion des utilisateurs.

## 🔑 Avantages Firebase Auth

- ✅ **Authentification prête à l'emploi**
- ✅ **Gestion automatique des sessions**
- ✅ **Sécurité intégrée** (JWT, refresh tokens)
- ✅ **Multi-fournisseurs** (Email/Password, Google, etc.)
- ✅ **Interface admin** dans Firebase Console
- ✅ **Pas de configuration serveur** complexe

---

## 🔧 Étape 1 : Supprimer NextAuth

```bash
# Supprimer NextAuth
npm uninstall next-auth

# Supprimer les dépendances liées
npm uninstall @auth/prisma-adapter
```

---

## 🔧 Étape 2 : Créer les hooks Firebase Auth

**Créer le fichier** : `src/hooks/useAuth.ts`

```typescript
'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import {
  User,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  signInWithPopup,
  updateProfile
} from 'firebase/auth'
import { doc, getDoc, setDoc, Timestamp } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

interface AuthUser extends User {
  role?: 'ADMIN' | 'CLIENT'
  profileComplete?: boolean
}

interface AuthContextType {
  user: AuthUser | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, name: string, role?: 'ADMIN' | 'CLIENT') => Promise<void>
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
  updateUserProfile: (data: { name?: string }) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)

  // Écouter les changements d'état d'authentification
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Récupérer les informations supplémentaires depuis Firestore
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid))
        const userData = userDoc.data()

        const authUser: AuthUser = {
          ...firebaseUser,
          role: userData?.role || 'CLIENT',
          profileComplete: !!userData?.name
        }

        setUser(authUser)
      } else {
        setUser(null)
      }
      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  // Connexion avec email/mot de passe
  const signIn = async (email: string, password: string) => {
    try {
      await signInWithEmailAndPassword(auth, email, password)
    } catch (error) {
      console.error('Erreur de connexion:', error)
      throw error
    }
  }

  // Inscription
  const signUp = async (
    email: string,
    password: string,
    name: string,
    role: 'ADMIN' | 'CLIENT' = 'CLIENT'
  ) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)

      // Mettre à jour le profil Firebase Auth
      await updateProfile(userCredential.user, {
        displayName: name
      })

      // Créer le document utilisateur dans Firestore
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        email,
        name,
        role,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now()
      })

    } catch (error) {
      console.error('Erreur d\'inscription:', error)
      throw error
    }
  }

  // Connexion avec Google
  const signInWithGoogle = async () => {
    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)

      // Vérifier si l'utilisateur existe déjà dans Firestore
      const userDoc = await getDoc(doc(db, 'users', result.user.uid))

      if (!userDoc.exists()) {
        // Créer le document utilisateur pour les connexions Google
        await setDoc(doc(db, 'users', result.user.uid), {
          email: result.user.email,
          name: result.user.displayName,
          role: 'CLIENT', // Par défaut CLIENT, peut être changé manuellement
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })
      }
    } catch (error) {
      console.error('Erreur connexion Google:', error)
      throw error
    }
  }

  // Déconnexion
  const signOut = async () => {
    try {
      await firebaseSignOut(auth)
    } catch (error) {
      console.error('Erreur de déconnexion:', error)
      throw error
    }
  }

  // Mise à jour du profil
  const updateUserProfile = async (data: { name?: string }) => {
    try {
      if (!user) throw new Error('Utilisateur non connecté')

      // Mettre à jour Firebase Auth
      if (data.name) {
        await updateProfile(user, { displayName: data.name })
      }

      // Mettre à jour Firestore
      await setDoc(doc(db, 'users', user.uid), {
        ...data,
        updatedAt: Timestamp.now()
      }, { merge: true })

    } catch (error) {
      console.error('Erreur mise à jour profil:', error)
      throw error
    }
  }

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signInWithGoogle,
    signOut,
    updateUserProfile
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}
```

---

## 🔧 Étape 3 : Créer le composant de connexion

**Créer le fichier** : `src/components/AuthForm.tsx`

```typescript
'use client'

import { useState } from 'react'
import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Loader2 } from 'lucide-react'

export default function AuthForm() {
  const { signIn, signUp, signInWithGoogle, loading: authLoading } = useAuth()
  const [isSignUp, setIsSignUp] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState<'ADMIN' | 'CLIENT'>('CLIENT')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      if (isSignUp) {
        await signUp(email, password, name, role)
      } else {
        await signIn(email, password)
      }
    } catch (error: any) {
      setError(error.message || 'Une erreur est survenue')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    setError('')

    try {
      await signInWithGoogle()
    } catch (error: any) {
      setError(error.message || 'Erreur de connexion Google')
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>
            {isSignUp ? 'Créer un compte' : 'Se connecter'}
          </CardTitle>
          <CardDescription>
            {isSignUp
              ? 'Créez votre compte pour accéder à Degranier Task'
              : 'Connectez-vous à votre compte'
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {isSignUp && (
              <div>
                <Label htmlFor="name">Nom complet</Label>
                <Input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {isSignUp && (
              <div>
                <Label htmlFor="role">Rôle</Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) => setRole(e.target.value as 'ADMIN' | 'CLIENT')}
                  className="w-full p-2 border rounded"
                >
                  <option value="CLIENT">Client</option>
                  <option value="ADMIN">Administrateur</option>
                </select>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSignUp ? 'Créer le compte' : 'Se connecter'}
            </Button>
          </form>

          <div className="mt-4">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Ou continuer avec
                </span>
              </div>
            </div>

            <Button
              variant="outline"
              onClick={handleGoogleSignIn}
              disabled={loading}
              className="w-full mt-4"
            >
              <svg className="mr-2 h-4 w-4" viewBox="0 0 24 24">
                <path
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  fill="#4285F4"
                />
                <path
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  fill="#34A853"
                />
                <path
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  fill="#FBBC05"
                />
                <path
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  fill="#EA4335"
                />
              </svg>
              Google
            </Button>
          </div>

          <div className="mt-4 text-center">
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-sm text-blue-600 hover:underline"
            >
              {isSignUp
                ? 'Déjà un compte ? Se connecter'
                : 'Pas de compte ? S\'inscrire'
              }
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

---

## 🔧 Étape 4 : Mettre à jour le layout principal

**Modifier** : `src/app/layout.tsx`

```typescript
import { AuthProvider } from '@/hooks/useAuth'
import './globals.css'

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## 🔧 Étape 5 : Créer une page de connexion

**Créer le fichier** : `src/app/login/page.tsx`

```typescript
import AuthForm from '@/components/AuthForm'

export default function LoginPage() {
  return <AuthForm />
}
```

---

## 🔧 Étape 6 : Protéger les routes

**Créer le fichier** : `src/components/ProtectedRoute.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
  requireAdmin?: boolean
}

export default function ProtectedRoute({
  children,
  requireAdmin = false
}: ProtectedRouteProps) {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login')
      } else if (requireAdmin && user.role !== 'ADMIN') {
        router.push('/client/dashboard') // Rediriger vers dashboard client
      }
    }
  }, [user, loading, requireAdmin, router])

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  if (!user) {
    return null // Sera redirigé par useEffect
  }

  if (requireAdmin && user.role !== 'ADMIN') {
    return null // Sera redirigé par useEffect
  }

  return <>{children}</>
}
```

---

## 🔧 Étape 7 : Mettre à jour les pages principales

**Modifier** : `src/app/admin/dashboard/page.tsx`

```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminDashboard() {
  return (
    <ProtectedRoute requireAdmin={true}>
      {/* Contenu du dashboard admin */}
    </ProtectedRoute>
  )
}
```

**Modifier** : `src/app/client/dashboard/page.tsx`

```typescript
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ClientDashboard() {
  return (
    <ProtectedRoute>
      {/* Contenu du dashboard client */}
    </ProtectedRoute>
  )
}
```

---

## ✅ Vérification

Après ces étapes :

1. **Tester l'inscription** : Créer un nouveau compte
2. **Tester la connexion** : Se connecter avec email/mot de passe
3. **Tester Google** : Connexion avec Google OAuth
4. **Vérifier les rôles** : Admin vs Client
5. **Tester la protection** : Accès aux routes protégées

---

## 🎯 Prochaine étape

L'authentification est migrée ! Passez à [04-update-api-routes.md](./04-update-api-routes.md) pour les API.
