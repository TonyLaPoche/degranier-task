// Script de test rapide pour Firebase
const { initializeApp } = require('firebase/app')
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth')
const { getFirestore, doc, getDoc } = require('firebase/firestore')

require('dotenv').config({ path: '.env.local' })

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

console.log('🔥 Test Firebase Auth & Firestore')
console.log('================================')

async function testFirebase() {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    console.log('✅ Firebase initialisé')

    // Tester la connexion
    const userCredential = await signInWithEmailAndPassword(auth, 'aurore@degranier.fr', 'admin123')
    console.log('✅ Connexion réussie:', userCredential.user.email)

    // Tester Firestore
    const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid))
    if (userDoc.exists()) {
      console.log('✅ Firestore accessible')
      console.log('👤 Données utilisateur:', userDoc.data())
    } else {
      console.log('❌ Document utilisateur non trouvé')
    }

    console.log('\n🎉 Test réussi ! Firebase fonctionne correctement.')

  } catch (error) {
    console.error('❌ Erreur:', error.message)
    console.log('\n🔧 Vérifications à faire:')
    console.log('1. Variables d\'environnement dans .env.local')
    console.log('2. Règles Firestore dans Firebase Console')
    console.log('3. Configuration Firebase dans firebase.ts')
  }
}

testFirebase()
