'use client'

import React, { useState, useEffect, createContext, useContext, ReactNode } from 'react'
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
