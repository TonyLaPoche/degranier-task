# 4️⃣ Mise à jour API Routes

## Objectif

Remplacer les API routes Prisma par des appels Firebase directs dans les composants.

## 📋 Changement d'approche

**Avant (Prisma)** : API routes côté serveur
```typescript
// GET /api/tasks
const tasks = await prisma.task.findMany({...})
return NextResponse.json(tasks)
```

**Après (Firebase)** : Appels directs côté client
```typescript
// Dans le composant
const tasks = await getTasksForUser(userId, userRole)
```

---

## 🔧 Étape 1 : Supprimer les anciennes API routes

```bash
# Supprimer toutes les API routes Prisma
rm -rf src/app/api/tasks/
rm -rf src/app/api/users/
rm -rf src/app/api/contact-hours/
rm -rf src/app/api/contact-info/
rm -rf src/app/api/social-media/
rm -rf src/app/api/vacations/
rm -rf src/app/api/categories/
rm src/app/api/seed/route.ts
```

---

## 🔧 Étape 2 : Créer les services Firebase

**Créer le fichier** : `src/services/firebaseServices.ts`

```typescript
import { db } from '@/lib/firebase'
import { getCollection, createDocument, updateDocument, deleteDocument } from '@/lib/firestore'
import { collection, query, where, orderBy } from 'firebase/firestore'

// Service pour les tâches
export const taskService = {
  // Récupérer toutes les tâches pour un utilisateur
  async getTasks(userId: string, userRole: string) {
    if (userRole === 'ADMIN') {
      return await getCollection('tasks', [orderBy('createdAt', 'desc')])
    } else {
      const allTasks = await getCollection('tasks')
      return allTasks.filter((task: any) =>
        task.clientIds && task.clientIds.includes(userId)
      )
    }
  },

  // Créer une nouvelle tâche
  async createTask(taskData: any, userId: string) {
    const task = await createDocument('tasks', {
      ...taskData,
      createdAt: new Date(),
      updatedAt: new Date()
    })

    // Créer l'entrée d'historique
    await createDocument('taskHistory', {
      taskId: task.id,
      field: 'created',
      oldValue: null,
      newValue: 'Tâche créée',
      changedById: userId
    })

    return task
  },

  // Mettre à jour une tâche
  async updateTask(taskId: string, updates: any, userId: string) {
    const oldTask = await getCollection('tasks', [
      where('__name__', '==', taskId)
    ]).then(tasks => tasks[0])

    const updatedTask = await updateDocument('tasks', taskId, updates)

    // Créer les entrées d'historique pour les changements
    for (const [field, newValue] of Object.entries(updates)) {
      if (oldTask[field] !== newValue) {
        await createDocument('taskHistory', {
          taskId,
          field,
          oldValue: oldTask[field],
          newValue,
          changedById: userId
        })
      }
    }

    return updatedTask
  },

  // Supprimer une tâche
  async deleteTask(taskId: string) {
    // Supprimer les checklists associées
    const checklists = await getCollection('taskChecklists', [
      where('taskId', '==', taskId)
    ])

    for (const checklist of checklists) {
      await deleteDocument('taskChecklists', checklist.id)
    }

    // Supprimer les commentaires
    const comments = await getCollection('taskComments', [
      where('taskId', '==', taskId)
    ])

    for (const comment of comments) {
      await deleteDocument('taskComments', comment.id)
    }

    // Supprimer l'historique
    const history = await getCollection('taskHistory', [
      where('taskId', '==', taskId)
    ])

    for (const entry of history) {
      await deleteDocument('taskHistory', entry.id)
    }

    // Supprimer la tâche
    await deleteDocument('tasks', taskId)

    return true
  }
}

// Service pour les checklists
export const checklistService = {
  // Récupérer les checklists d'une tâche
  async getTaskChecklists(taskId: string) {
    return await getCollection('taskChecklists', [
      where('taskId', '==', taskId),
      orderBy('order', 'asc')
    ])
  },

  // Créer une checklist
  async createChecklist(taskId: string, data: any) {
    const checklists = await this.getTaskChecklists(taskId)
    const maxOrder = checklists.length > 0
      ? Math.max(...checklists.map(c => c.order || 0))
      : -1

    return await createDocument('taskChecklists', {
      taskId,
      ...data,
      order: maxOrder + 1,
      isCompleted: false
    })
  },

  // Mettre à jour une checklist
  async updateChecklist(checklistId: string, updates: any) {
    return await updateDocument('taskChecklists', checklistId, updates)
  },

  // Supprimer une checklist
  async deleteChecklist(checklistId: string) {
    return await deleteDocument('taskChecklists', checklistId)
  },

  // Réorganiser les checklists
  async reorderChecklists(taskId: string, checklistIds: string[]) {
    const updates = checklistIds.map((id, index) =>
      updateDocument('taskChecklists', id, { order: index })
    )

    await Promise.all(updates)
    return true
  }
}

// Service pour les commentaires
export const commentService = {
  // Récupérer les commentaires d'une tâche
  async getTaskComments(taskId: string) {
    return await getCollection('taskComments', [
      where('taskId', '==', taskId),
      orderBy('createdAt', 'asc')
    ])
  },

  // Créer un commentaire
  async createComment(taskId: string, authorId: string, content: string, isFromClient: boolean = false) {
    return await createDocument('taskComments', {
      taskId,
      authorId,
      content,
      isFromClient
    })
  }
}

// Service pour les utilisateurs
export const userService = {
  // Récupérer tous les utilisateurs (admin seulement)
  async getUsers() {
    return await getCollection('users', [orderBy('createdAt', 'desc')])
  },

  // Récupérer un utilisateur par ID
  async getUser(userId: string) {
    return await getCollection('users', [
      where('__name__', '==', userId)
    ]).then(users => users[0] || null)
  },

  // Mettre à jour un utilisateur
  async updateUser(userId: string, updates: any) {
    return await updateDocument('users', userId, updates)
  }
}

// Service pour les horaires de contact
export const contactService = {
  // Récupérer tous les horaires
  async getContactHours() {
    return await getCollection('contactHours', [orderBy('dayOfWeek', 'asc')])
  },

  // Mettre à jour les horaires
  async updateContactHours(updates: any[]) {
    // Supprimer tous les horaires existants
    const existing = await getCollection('contactHours')
    await Promise.all(existing.map(h => deleteDocument('contactHours', h.id)))

    // Créer les nouveaux horaires
    const newHours = updates.map(hour => createDocument('contactHours', hour))
    return await Promise.all(newHours)
  },

  // Récupérer les informations de contact
  async getContactInfo() {
    const info = await getCollection('contactInfo')
    return info[0] || null
  },

  // Mettre à jour les informations de contact
  async updateContactInfo(info: any) {
    const existing = await getCollection('contactInfo')

    if (existing.length > 0) {
      return await updateDocument('contactInfo', existing[0].id, info)
    } else {
      return await createDocument('contactInfo', info)
    }
  }
}

// Service pour les réseaux sociaux
export const socialMediaService = {
  // Récupérer tous les réseaux sociaux
  async getSocialMedia() {
    return await getCollection('socialMedia', [orderBy('platform', 'asc')])
  },

  // Mettre à jour un réseau social
  async updateSocialMedia(mediaId: string, updates: any) {
    return await updateDocument('socialMedia', mediaId, updates)
  },

  // Créer un réseau social
  async createSocialMedia(data: any) {
    return await createDocument('socialMedia', data)
  },

  // Supprimer un réseau social
  async deleteSocialMedia(mediaId: string) {
    return await deleteDocument('socialMedia', mediaId)
  }
}
```

---

## 🔧 Étape 3 : Créer les hooks personnalisés

**Créer le fichier** : `src/hooks/useFirebaseData.ts`

```typescript
'use client'

import { useState, useEffect } from 'react'
import { useAuth } from './useAuth'
import { taskService, checklistService, commentService, userService } from '@/services/firebaseServices'

// Hook pour les tâches
export function useTasks() {
  const { user } = useAuth()
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshTasks = async () => {
    if (!user) return

    setLoading(true)
    try {
      const data = await taskService.getTasks(user.uid, user.role)
      setTasks(data)
    } catch (error) {
      console.error('Erreur chargement tâches:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshTasks()
  }, [user])

  const createTask = async (taskData: any) => {
    if (!user) return null

    try {
      const newTask = await taskService.createTask(taskData, user.uid)
      await refreshTasks() // Rafraîchir la liste
      return newTask
    } catch (error) {
      console.error('Erreur création tâche:', error)
      throw error
    }
  }

  const updateTask = async (taskId: string, updates: any) => {
    if (!user) return null

    try {
      const updatedTask = await taskService.updateTask(taskId, updates, user.uid)
      await refreshTasks() // Rafraîchir la liste
      return updatedTask
    } catch (error) {
      console.error('Erreur mise à jour tâche:', error)
      throw error
    }
  }

  const deleteTask = async (taskId: string) => {
    try {
      await taskService.deleteTask(taskId)
      await refreshTasks() // Rafraîchir la liste
      return true
    } catch (error) {
      console.error('Erreur suppression tâche:', error)
      throw error
    }
  }

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    deleteTask,
    refreshTasks
  }
}

// Hook pour les checklists d'une tâche
export function useTaskChecklists(taskId: string) {
  const [checklists, setChecklists] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshChecklists = async () => {
    setLoading(true)
    try {
      const data = await checklistService.getTaskChecklists(taskId)
      setChecklists(data)
    } catch (error) {
      console.error('Erreur chargement checklists:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) {
      refreshChecklists()
    }
  }, [taskId])

  const createChecklist = async (data: any) => {
    try {
      const newChecklist = await checklistService.createChecklist(taskId, data)
      await refreshChecklists()
      return newChecklist
    } catch (error) {
      console.error('Erreur création checklist:', error)
      throw error
    }
  }

  const updateChecklist = async (checklistId: string, updates: any) => {
    try {
      const updated = await checklistService.updateChecklist(checklistId, updates)
      await refreshChecklists()
      return updated
    } catch (error) {
      console.error('Erreur mise à jour checklist:', error)
      throw error
    }
  }

  const deleteChecklist = async (checklistId: string) => {
    try {
      await checklistService.deleteChecklist(checklistId)
      await refreshChecklists()
      return true
    } catch (error) {
      console.error('Erreur suppression checklist:', error)
      throw error
    }
  }

  return {
    checklists,
    loading,
    createChecklist,
    updateChecklist,
    deleteChecklist,
    refreshChecklists
  }
}

// Hook pour les commentaires d'une tâche
export function useTaskComments(taskId: string) {
  const { user } = useAuth()
  const [comments, setComments] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshComments = async () => {
    setLoading(true)
    try {
      const data = await commentService.getTaskComments(taskId)
      setComments(data)
    } catch (error) {
      console.error('Erreur chargement commentaires:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (taskId) {
      refreshComments()
    }
  }, [taskId])

  const createComment = async (content: string) => {
    if (!user) return null

    try {
      const newComment = await commentService.createComment(
        taskId,
        user.uid,
        content,
        user.role === 'CLIENT'
      )
      await refreshComments()
      return newComment
    } catch (error) {
      console.error('Erreur création commentaire:', error)
      throw error
    }
  }

  return {
    comments,
    loading,
    createComment,
    refreshComments
  }
}

// Hook pour les utilisateurs (admin seulement)
export function useUsers() {
  const { user } = useAuth()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  const refreshUsers = async () => {
    if (!user || user.role !== 'ADMIN') return

    setLoading(true)
    try {
      const data = await userService.getUsers()
      setUsers(data)
    } catch (error) {
      console.error('Erreur chargement utilisateurs:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    refreshUsers()
  }, [user])

  return {
    users,
    loading,
    refreshUsers
  }
}
```

---

## 🔧 Étape 4 : Exemple d'utilisation dans un composant

**Modifier** : `src/components/TaskList.tsx`

```typescript
'use client'

import { useTasks } from '@/hooks/useFirebaseData'
import { useAuth } from '@/hooks/useAuth'

export default function TaskList() {
  const { user } = useAuth()
  const { tasks, loading, createTask, updateTask, deleteTask } = useTasks()

  const handleCreateTask = async () => {
    try {
      await createTask({
        title: 'Nouvelle tâche',
        description: 'Description...',
        status: 'TODO',
        priority: 'MEDIUM',
        clientIds: user?.role === 'ADMIN' ? [] : [user.uid],
        allowComments: true
      })
    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  if (loading) return <div>Chargement...</div>

  return (
    <div>
      <button onClick={handleCreateTask}>Créer une tâche</button>
      {tasks.map(task => (
        <div key={task.id}>
          <h3>{task.title}</h3>
          <p>{task.description}</p>
          {/* Autres éléments */}
        </div>
      ))}
    </div>
  )
}
```

---

## ✅ Vérification

Après ces changements :

1. **Supprimer les appels API** : Plus d'appels `/api/tasks`
2. **Utiliser les hooks** : `useTasks()`, `useTaskChecklists()`, etc.
3. **Tester les fonctionnalités** :
   - ✅ Création de tâches
   - ✅ Modification de checklists
   - ✅ Ajout de commentaires
   - ✅ Synchronisation temps réel

---

## 🎯 Prochaine étape

Les API sont migrées ! Passez à [05-update-components.md](./05-update-components.md) pour mettre à jour les composants.
