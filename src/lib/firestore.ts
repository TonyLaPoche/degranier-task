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
  onSnapshot,
  type DocumentData,
  type QueryDocumentSnapshot
} from 'firebase/firestore'
import { db } from './firebase'

// Types pour Firestore
export interface FirestoreUser {
  id: string
  email: string
  name?: string
  role: 'ADMIN' | 'CLIENT'
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreTask {
  id: string
  title: string
  description?: string
  status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  dueDate?: Timestamp
  allowComments: boolean
  clientIds: string[]
  createdAt: Timestamp
  updatedAt: Timestamp
}

export interface FirestoreChecklist {
  id: string
  taskId: string
  title: string
  isCompleted: boolean
  order: number
  createdAt: Timestamp
  updatedAt: Timestamp
}

// Fonctions utilitaires générales
export const createDocument = async (
  collectionName: string,
  data: DocumentData
) => {
  try {
    const docRef = await addDoc(collection(db, collectionName), {
      ...data,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })
    return { id: docRef.id, ...data }
  } catch (error) {
    console.error(`Erreur création ${collectionName}:`, error)
    throw error
  }
}

export const updateDocument = async (
  collectionName: string,
  docId: string,
  data: Partial<DocumentData>
) => {
  try {
    const docRef = doc(db, collectionName, docId)
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    })
    return { id: docId, ...data }
  } catch (error) {
    console.error(`Erreur mise à jour ${collectionName}:`, error)
    throw error
  }
}

export const deleteDocument = async (
  collectionName: string,
  docId: string
) => {
  try {
    await deleteDoc(doc(db, collectionName, docId))
    return true
  } catch (error) {
    console.error(`Erreur suppression ${collectionName}:`, error)
    throw error
  }
}

export const getDocument = async (
  collectionName: string,
  docId: string
) => {
  try {
    const docRef = doc(db, collectionName, docId)
    const docSnap = await getDoc(docRef)

    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() }
    } else {
      return null
    }
  } catch (error) {
    console.error(`Erreur récupération ${collectionName}:`, error)
    throw error
  }
}

export const getCollection = async (
  collectionName: string,
  constraints: any[] = []
) => {
  try {
    const collectionRef = collection(db, collectionName)
    const q = query(collectionRef, ...constraints)
    const querySnapshot = await getDocs(q)

    return querySnapshot.docs.map((doc: QueryDocumentSnapshot) => ({
      id: doc.id,
      ...doc.data()
    }))
  } catch (error) {
    console.error(`Erreur récupération collection ${collectionName}:`, error)
    throw error
  }
}

// Fonctions spécifiques aux tâches
export const getTasksForUser = async (userId: string, userRole: string) => {
  try {
    if (userRole === 'ADMIN') {
      // Admin voit toutes les tâches
      return await getCollection('tasks', [orderBy('createdAt', 'desc')])
    } else {
      // Client voit seulement ses tâches
      const allTasks = await getCollection('tasks')
      return allTasks.filter((task: any) =>
        task.clientIds && task.clientIds.includes(userId)
      )
    }
  } catch (error) {
    console.error('Erreur récupération tâches:', error)
    throw error
  }
}

export const getTaskWithDetails = async (taskId: string) => {
  try {
    const task = await getDocument('tasks', taskId)
    if (!task) return null

    // Récupérer les checklists
    const checklists = await getCollection('taskChecklists', [
      where('taskId', '==', taskId),
      orderBy('order', 'asc')
    ])

    // Récupérer les commentaires avec auteurs
    const comments = await getCollection('taskComments', [
      where('taskId', '==', taskId),
      orderBy('createdAt', 'asc')
    ])

    // Récupérer l'historique
    const history = await getCollection('taskHistory', [
      where('taskId', '==', taskId),
      orderBy('createdAt', 'desc')
    ])

    return {
      ...task,
      checklists,
      comments,
      history
    }
  } catch (error) {
    console.error('Erreur récupération tâche détaillée:', error)
    throw error
  }
}

