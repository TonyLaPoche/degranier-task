import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBDV9scgvwkndF3rWp1vaRdfsbuM05LAJM",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.firebasestorage.app",
  messagingSenderId: "183738125412",
  appId: "1:183738125412:web:54e4e06cb8f9323657a371"
}

async function testFirestoreRules() {
  try {
    console.log('🔥 Test des règles Firestore...\n')

    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    console.log('✅ Firebase initialisé')

    // Se connecter
    console.log('🔑 Connexion en cours...')
    await signInWithEmailAndPassword(auth, 'aurore@degranier.fr', 'admin123')
    console.log('✅ Connexion réussie !')

    // Tester la création d'une tâche simple
    console.log('📝 Création d\'une tâche de test...')
    const taskData = {
      title: 'Tâche de test simple',
      description: 'Test des règles Firestore',
      status: 'TODO',
      priority: 'MEDIUM',
      dueDate: Timestamp.fromDate(new Date('2025-10-11')),
      clientIds: ['cmffa5z450001srn5l3zaed6k'],
      allowComments: true,
      checklistItems: []
    }

    const docRef = await addDoc(collection(db, 'tasks'), taskData)
    console.log('✅ Tâche créée avec succès !')
    console.log('📄 ID du document:', docRef.id)

  } catch (error) {
    console.error('❌ Erreur:', error.code, '-', error.message)

    if (error.code === 'permission-denied') {
      console.log('\n🚫 PROBLÈME: Les règles Firestore ne sont pas encore actives!')
      console.log('📋 Solutions:')
      console.log('   1. Attendez 10-15 minutes supplémentaires')
      console.log('   2. Vérifiez https://console.firebase.google.com/ → Firestore → Règles')
      console.log('   3. Cliquez sur "Modifier" puis "Publier" pour forcer le déploiement')
    }
  }
}

testFirestoreRules()
