# 1️⃣ Configuration Firebase

## Objectif

Préparer votre projet Firebase "Degranier-task" pour recevoir la migration.

## 📋 Prérequis

- ✅ Projet Firebase créé : "Degranier-task"
- ✅ Forfait Spark (gratuit) activé
- ✅ Accès à la console Firebase

---

## 🔧 Étape 1 : Installation des dépendances

```bash
# Installer Firebase
npm install firebase

# Supprimer Prisma
npm uninstall @prisma/client prisma

# Installer les types Firebase (optionnel mais recommandé)
npm install --save-dev @types/firebase
```

---

## 🔧 Étape 2 : Configuration Firebase Console

### 2.1 Activer Firestore Database

1. **Aller dans** : Firebase Console → Firestore Database
2. **Cliquer** : "Créer une base de données"
3. **Mode** : "Commencer en mode production"
4. **Région** : `europe-west` (ou celle de votre choix)
5. **Règles de sécurité** : Garder les règles par défaut pour l'instant

### 2.2 Activer Authentication

1. **Aller dans** : Firebase Console → Authentication
2. **Cliquer** : "Commencer"
3. **Méthodes de connexion** :
   - ✅ **Email/Password** : Activer
   - ✅ **Google** : Activer (optionnel mais recommandé)
4. **Paramètres Google** :
   - ID client : Votre Google OAuth ID
   - Secret client : Votre Google OAuth Secret

### 2.3 Récupérer la configuration

1. **Aller dans** : Firebase Console → Paramètres du projet (⚙️)
2. **Applications** → "Ajouter une application" → Web (</>)
3. **Nom** : "Degranier Task Web"
4. **Firebase Hosting** : Non (on utilise Next.js)
5. **Copier la configuration** :

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB...",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

---

## 🔧 Étape 3 : Configuration côté code

### 3.1 Créer la configuration Firebase

**Créer le fichier** : `src/lib/firebase.ts`

```typescript
import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
```

### 3.2 Variables d'environnement

**Créer/Mettre à jour** : `.env.local`

```bash
# Firebase Configuration (Public - peuvent être dans le client)
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=degranier-task.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=degranier-task
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=degranier-task.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id

# NextAuth (garder pour la transition)
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=dev-secret-key-change-in-production
```

---

## 🔧 Étape 4 : Tester la connexion

### 4.1 Créer un composant de test

**Créer le fichier** : `src/components/FirebaseTest.tsx`

```typescript
'use client'

import { useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '@/lib/firebase'

export default function FirebaseTest() {
  const [status, setStatus] = useState('Chargement...')
  const [user, setUser] = useState(null)

  useEffect(() => {
    // Test de connexion Firebase Auth
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUser(user)
        setStatus('✅ Firebase Auth connecté')
      } else {
        setStatus('⏳ En attente de connexion')
      }
    })

    // Test de connexion Firestore
    const testDocRef = doc(db, 'test', 'connection')
    getDoc(testDocRef).then(() => {
      setStatus(prev => prev + ' | ✅ Firestore connecté')
    }).catch(() => {
      setStatus(prev => prev + ' | ❌ Erreur Firestore')
    })

    return () => unsubscribe()
  }, [])

  return (
    <div className="p-4 border rounded">
      <h3>Test Firebase</h3>
      <p>{status}</p>
      {user && <p>Utilisateur: {user.email}</p>}
    </div>
  )
}
```

### 4.2 Ajouter dans une page

**Modifier** : `src/app/page.tsx`

```typescript
import FirebaseTest from '@/components/FirebaseTest'

export default function Home() {
  return (
    <main>
      <h1>Degranier Task</h1>
      <FirebaseTest />
    </main>
  )
}
```

---

## ✅ Vérification

Après ces étapes :

1. **Lancer le serveur** : `npm run dev`
2. **Vérifier la console** : Pas d'erreurs Firebase
3. **Voir le composant test** : "✅ Firebase Auth connecté | ✅ Firestore connecté"

---

## 🎯 Prochaine étape

Une fois Firebase configuré, passez à [02-migrate-database.md](./02-migrate-database.md) !
