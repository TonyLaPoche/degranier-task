import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, getDocs } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBDV9scgvwkndF3rWp1vaRdfsbuM05LAJM",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.firebasestorage.app",
  messagingSenderId: "183738125412",
  appId: "1:183738125412:web:54e4e06cb8f9323657a371"
}

console.log('🧪 Test de la migration Firebase...\n')

async function testMigration() {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    console.log('✅ Firebase initialisé')

    // Tester la connexion à Firestore
    console.log('🔍 Test de connexion à Firestore...')
    const usersRef = collection(db, 'users')
    const usersSnapshot = await getDocs(usersRef)

    console.log(`📊 Nombre d'utilisateurs dans Firestore: ${usersSnapshot.size}`)

    if (usersSnapshot.size === 0) {
      console.log('⚠️ Aucun utilisateur trouvé dans Firestore')
      console.log('💡 Vous devez créer des utilisateurs via l\'application ou migrer vos données existantes')
    } else {
      console.log('✅ Utilisateurs trouvés dans Firestore:')
      usersSnapshot.forEach((doc) => {
        console.log(`  - ${doc.id}: ${JSON.stringify(doc.data(), null, 2)}`)
      })
    }

    // Tester les autres collections
    const collections = ['tasks', 'taskChecklists', 'categories', 'contact-info']
    for (const collName of collections) {
      try {
        const collRef = collection(db, collName)
        const snapshot = await getDocs(collRef)
        console.log(`📊 Collection '${collName}': ${snapshot.size} documents`)
      } catch (error) {
        console.log(`❌ Erreur collection '${collName}': ${error.message}`)
      }
    }

    console.log('\n🎉 Test terminé avec succès!')
    console.log('📝 Si vous voyez "permission-denied", vérifiez:')
    console.log('   1. Que les règles Firestore sont déployées')
    console.log('   2. Que vous êtes authentifié')
    console.log('   3. Que les données existent dans Firestore')

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
    console.log('🔍 Détails de l\'erreur:', error)
  }
}

testMigration()
