# 2️⃣ Migration Base de Données

## Objectif

Remplacer Prisma par Firestore pour la gestion des données.

## 📋 Structure Firestore

Au lieu des tables SQL, nous utiliserons des **collections** :

```
📁 Firestore Database
├── users/
│   ├── {userId}/
│   │   ├── email: "user@example.com"
│   │   ├── name: "John Doe"
│   │   ├── role: "CLIENT" | "ADMIN"
│   │   ├── createdAt: Timestamp
│   │   └── updatedAt: Timestamp
├── tasks/
│   ├── {taskId}/
│   │   ├── title: "Titre de la tâche"
│   │   ├── description: "Description..."
│   │   ├── status: "TODO" | "IN_PROGRESS" | "REVIEW" | "COMPLETED"
│   │   ├── priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT"
│   │   ├── dueDate: Timestamp | null
│   │   ├── allowComments: true
│   │   ├── clientIds: ["userId1", "userId2"]
│   │   ├── createdAt: Timestamp
│   │   └── updatedAt: Timestamp
├── taskChecklists/
│   ├── {checklistId}/
│   │   ├── taskId: "taskId"
│   │   ├── title: "Item checklist"
│   │   ├── isCompleted: false
│   │   ├── order: 0
│   │   ├── createdAt: Timestamp
│   │   └── updatedAt: Timestamp
├── taskComments/
│   ├── {commentId}/
│   │   ├── taskId: "taskId"
│   │   ├── authorId: "userId"
│   │   ├── content: "Contenu du commentaire"
│   │   ├── isFromClient: false
│   │   ├── createdAt: Timestamp
│   │   └── updatedAt: Timestamp
├── taskHistory/
│   ├── {historyId}/
│   │   ├── taskId: "taskId"
│   │   ├── field: "status"
│   │   ├── oldValue: "TODO"
│   │   ├── newValue: "IN_PROGRESS"
│   │   ├── changedById: "userId"
│   │   └── createdAt: Timestamp
├── contactHours/
│   ├── {id}/
│   │   ├── dayOfWeek: 1 (0=Dim, 1=Lun, ..., 6=Sam)
│   │   ├── startTime: "09:00"
│   │   ├── endTime: "18:00"
│   │   └── isActive: true
├── socialMedia/
│   ├── {id}/
│   │   ├── platform: "LinkedIn"
│   │   ├── url: "https://..."
│   │   └── isActive: true
└── contactInfo/
    ├── main/
    │   ├── phone: "+33123456789"
    │   ├── email: "contact@example.com"
    │   ├── address: "123 Rue Example"
    │   └── isActive: true
```

---

## 🔧 Étape 1 : Créer les utilitaires Firestore

**Créer le fichier** : `src/lib/firestore.ts`

```typescript
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
  limit,
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
```

---

## 🔧 Étape 2 : Script de migration des données

**Créer le fichier** : `scripts/migrate-to-firebase.js`

```javascript
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore')
require('dotenv').config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrateData() {
  console.log('🚀 Migration des données vers Firebase...')

  try {
    // Créer des utilisateurs de test
    console.log('👤 Création des utilisateurs...')

    await setDoc(doc(db, 'users', 'admin-user'), {
      email: 'aurore@degranier.fr',
      name: 'Aurore De Granier',
      role: 'ADMIN',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    await setDoc(doc(db, 'users', 'client-1'), {
      email: 'marie@example.com',
      name: 'Marie Dupont',
      role: 'CLIENT',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    await setDoc(doc(db, 'users', 'client-2'), {
      email: 'jean@example.com',
      name: 'Jean Martin',
      role: 'CLIENT',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // Créer des tâches de test
    console.log('📋 Création des tâches...')

    const task1Ref = doc(collection(db, 'tasks'))
    await setDoc(task1Ref, {
      title: 'Article sur l\'économie circulaire',
      description: 'Rédaction d\'un article de 1500 mots sur les enjeux de l\'économie circulaire.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: Timestamp.fromDate(new Date('2024-12-15')),
      allowComments: true,
      clientIds: ['client-1'],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    const task2Ref = doc(collection(db, 'tasks'))
    await setDoc(task2Ref, {
      title: 'Interview politique régionale',
      description: 'Préparation et réalisation d\'une interview.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: Timestamp.fromDate(new Date('2024-12-10')),
      allowComments: true,
      clientIds: ['client-2'],
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // Créer des checklists
    console.log('✅ Création des checklists...')

    await setDoc(doc(collection(db, 'taskChecklists')), {
      taskId: task1Ref.id,
      title: 'Recherche documentaire',
      isCompleted: false,
      order: 0,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    await setDoc(doc(collection(db, 'taskChecklists')), {
      taskId: task1Ref.id,
      title: 'Rédaction du brouillon',
      isCompleted: false,
      order: 1,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    // Créer les horaires de contact
    console.log('📞 Création des horaires...')

    await setDoc(doc(collection(db, 'contactHours')), {
      dayOfWeek: 1,
      startTime: '09:00',
      endTime: '18:00',
      isActive: true,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    console.log('✅ Migration terminée avec succès!')
    console.log('')
    console.log('📊 Données créées:')
    console.log('👤 3 utilisateurs (1 admin, 2 clients)')
    console.log('📋 2 tâches avec checklists')
    console.log('📞 Horaires de contact')

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    process.exit(1)
  }
}

migrateData()
```

---

## 🔧 Étape 3 : Exécuter la migration

```bash
# Exécuter le script de migration
node scripts/migrate-to-firebase.js
```

**Résultat attendu :**
```
🚀 Migration des données vers Firebase...
👤 Création des utilisateurs...
📋 Création des tâches...
✅ Création des checklists...
📞 Création des horaires...
✅ Migration terminée avec succès!
```

---

## 🔧 Étape 4 : Vérifier dans Firebase Console

1. **Aller dans** : Firebase Console → Firestore Database
2. **Vérifier les collections** :
   - ✅ `users` : 3 documents
   - ✅ `tasks` : 2 documents
   - ✅ `taskChecklists` : Documents avec les items
   - ✅ `contactHours` : Documents horaires

---

## ✅ Vérification

Après la migration :

1. **Vérifier Firebase Console** : Les données sont présentes
2. **Tester la récupération** : Les requêtes fonctionnent
3. **Vérifier les relations** : taskId correspond correctement

---

## 🎯 Prochaine étape

La base de données est migrée ! Passez à [03-migrate-auth.md](./03-migrate-auth.md) pour l'authentification.
