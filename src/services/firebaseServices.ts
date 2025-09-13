import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore'
import { db } from '@/lib/firebase'
// import { adminDb } from '@/lib/firebase-admin' // Unused for now

// Fonction utilitaire pour convertir les dates Firestore en objets Date
function convertFirestoreDate(value: unknown): Date {
  if (!value) return new Date()

  // Si c'est déjà un objet Date
  if (value instanceof Date) return value

  // Si c'est un Firestore Timestamp
  if (value && typeof value === 'object' && 'toDate' in value && typeof (value as { toDate: () => Date }).toDate === 'function') {
    return (value as { toDate: () => Date }).toDate()
  }

  // Si c'est une chaîne ISO
  if (typeof value === 'string') {
    const date = new Date(value)
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Si c'est un nombre (timestamp Unix)
  if (typeof value === 'number') {
    return new Date(value)
  }

  // Par défaut, retourner la date actuelle
  return new Date()
}

// Types pour Firestore
export interface FirebaseUser {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'CLIENT'
  createdAt: Date
  updatedAt: Date
}

export interface FirebaseTask {
  id: string
  title: string
  description: string | null
  status: string
  priority: string
  dueDate: Date | null
  allowComments: boolean
  createdAt: Date
  updatedAt: Date
  clientIds: string[]
  checklistItems: FirebaseChecklistItem[]
  checklists?: FirebaseChecklistItem[]  // Support des deux formats
  history?: FirebaseHistoryItem[]
  comments?: FirebaseComment[]
  clients?: FirebaseUser[]  // Informations complètes des clients
}

export interface FirebaseHistoryItem {
  id: string
  field: string
  oldValue: string | null
  newValue: string | null
  createdAt: Date
  changedBy: {
    id: string
    name: string | null
    email: string
  }
}

export interface FirebaseComment {
  id: string
  content: string
  isFromClient: boolean
  createdAt: Date
  author: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

export interface FirebaseChecklistItem {
  id: string
  content: string
  completed: boolean
  order: number
  createdAt: Date
  updatedAt: Date
}

// Service pour les utilisateurs
export class FirebaseUserService {
  private collectionName = 'users'

  async getUsers(role?: 'ADMIN' | 'CLIENT'): Promise<FirebaseUser[]> {
    try {
      let q = collection(db, this.collectionName)
      if (role) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        q = query(q, where('role', '==', role)) as any
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      q = query(q, orderBy('createdAt', 'desc')) as any

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          email: data.email,
          name: data.name,
          role: data.role,
          createdAt: convertFirestoreDate(data.createdAt),
          updatedAt: convertFirestoreDate(data.updatedAt),
        } as FirebaseUser
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des utilisateurs:', error)
      throw error
    }
  }

  async getUserById(id: string): Promise<FirebaseUser | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        return {
          id: docSnap.id,
          ...docSnap.data(),
          createdAt: convertFirestoreDate(docSnap.data().createdAt),
          updatedAt: convertFirestoreDate(docSnap.data().updatedAt),
        } as FirebaseUser
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de l\'utilisateur:', error)
      throw error
    }
  }

  async createUser(userData: Omit<FirebaseUser, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseUser> {
    try {
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...userData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      })

      return {
        id: docRef.id,
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    } catch (error) {
      console.error('Erreur lors de la création de l\'utilisateur:', error)
      throw error
    }
  }

  async updateUser(id: string, updates: Partial<Omit<FirebaseUser, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de l\'utilisateur:', error)
      throw error
    }
  }
}

// Service pour les tâches
export class FirebaseTaskService {
  private collectionName = 'tasks'

  async getTasks(userRole?: string, userId?: string): Promise<FirebaseTask[]> {
    try {
      console.log(`🔍 getTasks appelé avec userRole: ${userRole}, userId: ${userId}`)
      
      let snapshot
      
      // Filtrage selon le rôle - éviter l'index composite pour l'instant
      if (userRole === 'CLIENT' && userId) {
        console.log(`📋 Filtrage pour CLIENT avec userId: ${userId}`)
        // Requête simple sans orderBy pour éviter l'index composite
        const q = query(collection(db, this.collectionName), where('clientIds', 'array-contains', userId))
        snapshot = await getDocs(q)
        console.log(`📊 ${snapshot.docs.length} documents trouvés pour le client`)
      } else {
        console.log('📋 Récupération de toutes les tâches')
        // Pour les admins, récupérer toutes les tâches avec tri
        const q = query(collection(db, this.collectionName), orderBy('createdAt', 'desc'))
        snapshot = await getDocs(q)
        console.log(`📊 ${snapshot.docs.length} documents trouvés au total`)
      }

      console.log('🔥 Requête Firestore exécutée avec succès')

      const tasks = snapshot.docs.map((docSnapshot) => {
        const data = docSnapshot.data()
        const taskId = docSnapshot.id
        
        console.log(`📄 Traitement de la tâche ${taskId}:`, data.title)

        // Données de base uniquement pour éviter les erreurs
        const task: FirebaseTask = {
          id: taskId,
          title: data.title || 'Sans titre',
          description: data.description || null,
          status: data.status || 'TODO',
          priority: data.priority || 'MEDIUM',
          createdAt: convertFirestoreDate(data.createdAt),
          updatedAt: convertFirestoreDate(data.updatedAt),
          dueDate: data.dueDate ? convertFirestoreDate(data.dueDate) : null,
          clientIds: data.clientIds || [],
          allowComments: data.allowComments !== undefined ? data.allowComments : true,
          checklistItems: data.checklistItems || data.checklists || [],
          checklists: data.checklistItems || data.checklists || [],
          // Données simplifiées pour éviter les erreurs
          clients: [],
          history: data.history || [],
          comments: data.comments || [],
        }

        return task
      })

      console.log(`✅ ${tasks.length} tâches traitées avec succès`)
      
      // Trier côté JavaScript si nécessaire (pour les clients)
      if (userRole === 'CLIENT') {
        tasks.sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0
          return dateB - dateA // Tri décroissant (plus récent en premier)
        })
        console.log('🔄 Tâches triées côté JavaScript pour le client')
      }
      
      return tasks
    } catch (error) {
      console.error('❌ Erreur lors de la récupération des tâches:', error)
      console.error('Stack trace:', error instanceof Error ? error.stack : String(error))
      throw error
    }
  }

  async getTaskById(id: string): Promise<FirebaseTask | null> {
    try {
      const docRef = doc(db, this.collectionName, id)
      const docSnap = await getDoc(docRef)

      if (docSnap.exists()) {
        const data = docSnap.data()
        return {
          id: docSnap.id,
          ...data,
          createdAt: convertFirestoreDate(data.createdAt),
          updatedAt: convertFirestoreDate(data.updatedAt),
          dueDate: data.dueDate ? convertFirestoreDate(data.dueDate) : null,
          checklistItems: data.checklistItems || [],
        } as FirebaseTask
      }
      return null
    } catch (error) {
      console.error('Erreur lors de la récupération de la tâche:', error)
      throw error
    }
  }

  async createTask(taskData: Omit<FirebaseTask, 'id' | 'createdAt' | 'updatedAt'>): Promise<FirebaseTask> {
    try {
      console.log('🔥 FirebaseTaskService.createTask() - Création de tâche avec SDK client')
      
      // Pour le moment, utiliser le SDK client normal
      // TODO: Configurer Firebase Admin SDK avec les bonnes credentials
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...taskData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        checklistItems: taskData.checklistItems || [],
      })

      console.log('✅ Tâche créée avec SDK client, ID:', docRef.id)

      return {
        id: docRef.id,
        ...taskData,
        createdAt: new Date(),
        updatedAt: new Date(),
        checklistItems: taskData.checklistItems || [],
      }
    } catch (error) {
      console.error('Erreur lors de la création de la tâche:', error)
      throw error
    }
  }

  async updateTask(id: string, updates: Partial<Omit<FirebaseTask, 'id' | 'createdAt'>>): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await updateDoc(docRef, {
        ...updates,
        updatedAt: Timestamp.now(),
      })
    } catch (error) {
      console.error('Erreur lors de la mise à jour de la tâche:', error)
      throw error
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const docRef = doc(db, this.collectionName, id)
      await deleteDoc(docRef)
    } catch (error) {
      console.error('Erreur lors de la suppression de la tâche:', error)
      throw error
    }
  }
}

// Instances des services
export const userService = new FirebaseUserService()
export const taskService = new FirebaseTaskService()