// Script pour créer des utilisateurs de test dans Firebase Auth
const { initializeApp } = require('firebase/app')
const { getAuth, createUserWithEmailAndPassword, updateProfile } = require('firebase/auth')
const { getFirestore, doc, setDoc, Timestamp } = require('firebase/firestore')

require('dotenv').config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

console.log('👥 Création des utilisateurs de test Firebase')
console.log('===========================================')

const testUsers = [
  {
    email: 'aurore@degranier.fr',
    password: 'admin123',
    name: 'Aurore De Granier',
    role: 'ADMIN'
  },
  {
    email: 'loulou@loulou.fr',
    password: 'client123',
    name: 'Client Test 1',
    role: 'CLIENT'
  },
  {
    email: 'mimou@test.fr',
    password: 'client123',
    name: 'Client Test 2',
    role: 'CLIENT'
  }
]

async function createTestUsers() {
  try {
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    console.log('✅ Firebase initialisé')

    for (const userData of testUsers) {
      try {
        console.log(`\n👤 Création de ${userData.email}...`)

        // Créer l'utilisateur dans Firebase Auth
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          userData.email,
          userData.password
        )

        // Mettre à jour le profil
        await updateProfile(userCredential.user, {
          displayName: userData.name
        })

        // Créer le document dans Firestore
        await setDoc(doc(db, 'users', userCredential.user.uid), {
          email: userData.email,
          name: userData.name,
          role: userData.role,
          createdAt: Timestamp.now(),
          updatedAt: Timestamp.now()
        })

        console.log(`✅ ${userData.email} créé avec succès`)

      } catch (error) {
        if (error.code === 'auth/email-already-in-use') {
          console.log(`⚠️  ${userData.email} existe déjà`)
        } else {
          console.error(`❌ Erreur pour ${userData.email}:`, error.message)
        }
      }
    }

    console.log('\n🎉 Utilisateurs de test créés !')
    console.log('\n🔑 Comptes disponibles :')
    testUsers.forEach(user => {
      console.log(`  ${user.email} / ${user.password} (${user.role})`)
    })

  } catch (error) {
    console.error('❌ Erreur générale:', error.message)
  }
}

createTestUsers()
