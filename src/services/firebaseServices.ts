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
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
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
          createdAt: docSnap.data().createdAt?.toDate() || new Date(),
          updatedAt: docSnap.data().updatedAt?.toDate() || new Date(),
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
      let q = collection(db, this.collectionName) 
      // Filtrage selon le rôle
      if (userRole === 'CLIENT' && userId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        q = query(q, where('clientIds', 'array-contains', userId)) as any
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      q = query(q, orderBy('createdAt', 'desc')) as any

      const snapshot = await getDocs(q)
      return snapshot.docs.map(doc => {
        const data = doc.data()
        return {
          id: doc.id,
          title: data.title,
          description: data.description,
          status: data.status,
          priority: data.priority,
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || null,
          clientIds: data.clientIds || [],
          allowComments: data.allowComments || true,
          checklistItems: data.checklists || [],
        }
      })
    } catch (error) {
      console.error('Erreur lors de la récupération des tâches:', error)
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
          createdAt: data.createdAt?.toDate() || new Date(),
          updatedAt: data.updatedAt?.toDate() || new Date(),
          dueDate: data.dueDate?.toDate() || null,
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
      const docRef = await addDoc(collection(db, this.collectionName), {
        ...taskData,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        checklistItems: taskData.checklistItems || [],
      })

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