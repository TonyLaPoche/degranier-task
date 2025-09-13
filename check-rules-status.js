import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, collection, addDoc, doc, setDoc, Timestamp } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBDV9scgvwkndF3rWp1vaRdfsbuM05LAJM",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.firebasestorage.app",
  messagingSenderId: "183738125412",
  appId: "1:183738125412:web:54e4e06cb8f9323657a371"
}

async function checkRulesStatus() {
  try {
    console.log('🔍 Vérification du statut des règles Firestore...\n')

    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    console.log('✅ Firebase initialisé')

    // Se connecter
    console.log('🔑 Connexion en cours...')
    await signInWithEmailAndPassword(auth, 'aurore@degranier.fr', 'admin123')
    console.log('✅ Connexion réussie !')

    // Test 1: Création sans authentification simulée (devrait échouer avec les bonnes règles)
    console.log('\n🧪 Test 1: Création sans restriction d\'authentification...')
    try {
      await addDoc(collection(db, 'test-rules'), {
        test: 'without-auth-check',
        timestamp: Timestamp.now()
      })
      console.log('❌ ÉCHEC: La création a réussi sans vérification d\'authentification!')
      console.log('📋 Cela signifie que les règles permettent TOUT (allow read, write: if true;)')
    } catch (error) {
      if (error.code === 'permission-denied') {
        console.log('✅ SUCCÈS: Les règles bloquent correctement la création sans authentification')
      } else {
        console.log('⚠️ Erreur inattendue:', error.code, error.message)
      }
    }

    // Test 2: Création avec authentification (devrait réussir avec les bonnes règles)
    console.log('\n🧪 Test 2: Création avec authentification...')
    try {
      const docRef = await addDoc(collection(db, 'test-rules'), {
        test: 'with-auth',
        timestamp: Timestamp.now(),
        userId: auth.currentUser.uid
      })
      console.log('✅ SUCCÈS: La création a réussi avec authentification')
      console.log('📄 Document créé:', docRef.id)

      // Nettoyer le document de test
      await setDoc(doc(db, 'test-rules', docRef.id), { deleted: true }, { merge: true })
    } catch (error) {
      console.log('❌ ÉCHEC: La création a échoué même avec authentification')
      console.log('📋 Code d\'erreur:', error.code)

      if (error.code === 'permission-denied') {
        console.log('🚫 PROBLÈME: Les règles Firestore ne permettent pas la création aux utilisateurs authentifiés')
        console.log('💡 Solution: Vérifiez que les règles déployées correspondent à celles dans firestore.rules')
      }
    }

    // Test 3: Test de la collection tasks spécifiquement
    console.log('\n🧪 Test 3: Test spécifique de la collection tasks...')
    try {
      const taskData = {
        title: 'Test Règles Tasks',
        description: 'Test des règles pour la collection tasks',
        status: 'TODO',
        priority: 'MEDIUM',
        dueDate: Timestamp.fromDate(new Date('2025-10-09')),
        clientIds: ['test-client'],
        allowComments: true,
        checklistItems: []
      }

      const docRef = await addDoc(collection(db, 'tasks'), taskData)
      console.log('✅ SUCCÈS: La tâche a été créée dans la collection tasks')
      console.log('📄 ID de la tâche:', docRef.id)
    } catch (error) {
      console.log('❌ ÉCHEC: Impossible de créer une tâche')
      console.log('📋 Code d\'erreur:', error.code)

      if (error.code === 'permission-denied') {
        console.log('\n🚨 PROBLÈME IDENTIFIÉ:')
        console.log('Les règles Firestore déployées ne correspondent pas aux règles attendues.')
        console.log('Vérifiez dans Firebase Console → Firestore → Règles')
        console.log('Les règles actuelles ne permettent pas la création aux utilisateurs authentifiés.')
      }
    }

  } catch (error) {
    console.error('❌ Erreur lors du test:', error.code, '-', error.message)
  }
}

checkRulesStatus()
