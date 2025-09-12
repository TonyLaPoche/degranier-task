# 5️⃣ Mise à jour Composants

## Objectif

Remplacer tous les appels API Prisma par les hooks Firebase dans les composants.

## 🔧 Étape 1 : Mettre à jour CreateTaskForm

**Avant (API Prisma)** :
```typescript
const handleSubmit = async (e) => {
  const response = await fetch('/api/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData)
  })
  const result = await response.json()
}
```

**Après (Firebase)** :
```typescript
'use client'

import { useTasks } from '@/hooks/useFirebaseData'
import { useAuth } from '@/hooks/useAuth'

export default function CreateTaskForm({ onSuccess }) {
  const { user } = useAuth()
  const { createTask } = useTasks()

  const handleSubmit = async (e) => {
    e.preventDefault()

    try {
      await createTask({
        title,
        description,
        status,
        priority,
        dueDate,
        clientIds,
        allowComments
      })

      onSuccess?.()
    } catch (error) {
      setError('Erreur lors de la création')
    }
  }
}
```

---

## 🔧 Étape 2 : Mettre à jour TaskDetails

**Avant** :
```typescript
const [task, setTask] = useState(null)

useEffect(() => {
  fetch(`/api/tasks/${taskId}`)
    .then(res => res.json())
    .then(setTask)
}, [taskId])
```

**Après** :
```typescript
'use client'

import { useState } from 'react'
import { useTaskChecklists, useTaskComments } from '@/hooks/useFirebaseData'
import { useAuth } from '@/hooks/useAuth'

export default function TaskDetails({ task }) {
  const { user } = useAuth()
  const { checklists, updateChecklist, createChecklist } = useTaskChecklists(task.id)
  const { comments, createComment } = useTaskComments(task.id)

  const handleChecklistToggle = async (checklistId, isCompleted) => {
    try {
      await updateChecklist(checklistId, { isCompleted: !isCompleted })
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const handleAddComment = async (content) => {
    try {
      await createComment(content)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }
}
```

---

## 🔧 Étape 3 : Mettre à jour ClientProjectCard

**Avant** :
```typescript
const handleChecklistToggle = async (checklistId, isCompleted) => {
  await fetch(`/api/tasks/${task.id}/checklists/${checklistId}`, {
    method: 'PUT',
    body: JSON.stringify({ isCompleted: !isCompleted })
  })
}
```

**Après** :
```typescript
// NE RIEN FAIRE - Les clients ne peuvent plus modifier les checklists
// Le composant doit afficher les checklists en lecture seule
```

---

## 🔧 Étape 4 : Mettre à jour TaskComments

**Avant** :
```typescript
const addComment = async (content) => {
  await fetch(`/api/tasks/${taskId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ content })
  })
}
```

**Après** :
```typescript
const { createComment } = useTaskComments(taskId)

const addComment = async (content) => {
  try {
    await createComment(content)
  } catch (error) {
    console.error('Erreur:', error)
  }
}
```

---

## 🔧 Étape 5 : Mettre à jour les composants d'administration

### Gestion des utilisateurs :
```typescript
'use client'

import { useUsers } from '@/hooks/useFirebaseData'

export default function UserManagement() {
  const { users, loading } = useUsers()

  if (loading) return <div>Chargement...</div>

  return (
    <div>
      {users.map(user => (
        <div key={user.id}>
          <p>{user.name} - {user.email}</p>
          <span>Rôle: {user.role}</span>
        </div>
      ))}
    </div>
  )
}
```

### Gestion des horaires :
```typescript
'use client'

import { useState, useEffect } from 'react'
import { contactService } from '@/services/firebaseServices'

export default function ContactHoursManager() {
  const [hours, setHours] = useState([])

  useEffect(() => {
    contactService.getContactHours().then(setHours)
  }, [])

  const updateHours = async (newHours) => {
    try {
      await contactService.updateContactHours(newHours)
      setHours(newHours)
    } catch (error) {
      console.error('Erreur:', error)
    }
  }
}
```

---

## 🔧 Étape 6 : Mettre à jour les pages principales

### Dashboard Admin :
```typescript
'use client'

import { useTasks, useUsers } from '@/hooks/useFirebaseData'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function AdminDashboard() {
  const { tasks, loading: tasksLoading } = useTasks()
  const { users, loading: usersLoading } = useUsers()

  return (
    <ProtectedRoute requireAdmin={true}>
      <div>
        <h1>Dashboard Admin</h1>

        <div>
          <h2>Statistiques</h2>
          <p>Tâches: {tasks.length}</p>
          <p>Utilisateurs: {users.length}</p>
        </div>

        <div>
          <h2>Gestion des tâches</h2>
          {tasksLoading ? (
            <p>Chargement...</p>
          ) : (
            tasks.map(task => (
              <div key={task.id}>
                <h3>{task.title}</h3>
                <p>Status: {task.status}</p>
                <p>Priorité: {task.priority}</p>
              </div>
            ))
          )}
        </div>
      </div>
    </ProtectedRoute>
  )
}
```

### Dashboard Client :
```typescript
'use client'

import { useTasks } from '@/hooks/useFirebaseData'
import ProtectedRoute from '@/components/ProtectedRoute'

export default function ClientDashboard() {
  const { tasks, loading } = useTasks()

  return (
    <ProtectedRoute>
      <div>
        <h1>Mes projets</h1>

        {loading ? (
          <p>Chargement...</p>
        ) : (
          tasks.map(task => (
            <div key={task.id} className="border p-4 rounded">
              <h3>{task.title}</h3>
              <p>{task.description}</p>
              <span className={`badge ${task.status}`}>
                {task.status}
              </span>
            </div>
          ))
        )}
      </div>
    </ProtectedRoute>
  )
}
```

---

## 🔧 Étape 7 : Créer un layout avec navigation

**Créer** : `src/components/Layout.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export default function Layout({ children }) {
  const { user, signOut } = useAuth()

  if (!user) {
    return <>{children}</>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/" className="text-xl font-bold">
                Degranier Task
              </Link>
            </div>

            <div className="flex items-center space-x-4">
              <span>Bonjour, {user.displayName || user.email}</span>

              {user.role === 'ADMIN' ? (
                <Link href="/admin/dashboard">
                  <Button variant="outline">Admin</Button>
                </Link>
              ) : (
                <Link href="/client/dashboard">
                  <Button variant="outline">Mes projets</Button>
                </Link>
              )}

              <Button onClick={signOut} variant="outline">
                Déconnexion
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
```

---

## 🔧 Étape 8 : Mettre à jour le layout principal

**Modifier** : `src/app/layout.tsx`

```typescript
import { AuthProvider } from '@/hooks/useAuth'
import Layout from '@/components/Layout'
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
          <Layout>
            {children}
          </Layout>
        </AuthProvider>
      </body>
    </html>
  )
}
```

---

## 🔧 Étape 9 : Créer une page d'accueil

**Modifier** : `src/app/page.tsx`

```typescript
'use client'

import { useAuth } from '@/hooks/useAuth'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

export default function Home() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (user) {
        // Rediriger vers le bon dashboard
        if (user.role === 'ADMIN') {
          router.push('/admin/dashboard')
        } else {
          router.push('/client/dashboard')
        }
      } else {
        router.push('/login')
      }
    }
  }, [user, loading, router])

  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Chargement...</p>
      </div>
    </div>
  )
}
```

---

## ✅ Vérification

Après ces mises à jour :

1. **Tester l'authentification** : Connexion/déconnexion
2. **Tester les tâches** : CRUD complet
3. **Tester les checklists** : Création/modification (admin seulement)
4. **Tester les commentaires** : Ajout et affichage
5. **Tester la navigation** : Redirections automatiques
6. **Vérifier les rôles** : Permissions admin/client

---

## 🎯 Prochaine étape

Les composants sont mis à jour ! Passez à [06-testing.md](./06-testing.md) pour les tests.
