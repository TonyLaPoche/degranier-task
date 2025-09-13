import { initializeApp } from 'firebase/app'
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBDV9scgvwkndF3rWp1vaRdfsbuM05LAJM",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.firebasestorage.app",
  messagingSenderId: "183738125412",
  appId: "1:183738125412:web:54e4e06cb8f9323657a371"
}

console.log('🧪 Test de création de tâche...\n')

async function testCreateTask() {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const db = getFirestore(app)

    console.log('✅ Firebase initialisé')

    // Créer une tâche de test
    const taskData = {
      title: "Tâche de test Firebase",
      description: "Test direct avec Firebase SDK",
      status: "TODO",
      priority: "HIGH",
      dueDate: Timestamp.fromDate(new Date("2025-12-31")),
      allowComments: true,
      clientIds: ["jPXR9ZUAkWdJvzPCa8hGSqUbbHG3"],
      checklistItems: []
    }

    console.log('📝 Création de la tâche avec les données:', taskData)

    // Créer la tâche dans Firestore
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    })

    console.log('✅ Tâche créée avec succès!')
    console.log('🆔 ID de la tâche:', docRef.id)

    console.log('\n🎉 Test terminé avec succès! La création fonctionne côté Firebase.')

  } catch (error) {
    console.error('❌ Erreur lors de la création:', error.message)
    console.log('🔍 Code d\'erreur:', error.code)
    console.log('📋 Détails complets:', error)
  }
}

testCreateTask()
