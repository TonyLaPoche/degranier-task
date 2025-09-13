import { initializeApp } from 'firebase/app'
import { getAuth, signInWithEmailAndPassword, onAuthStateChanged } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyBDV9scgvwkndF3rWp1vaRdfsbuM05LAJM",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.firebasestorage.app",
  messagingSenderId: "183738125412",
  appId: "1:183738125412:web:54e4e06cb8f9323657a371"
}

console.log('🔐 Test d\'authentification Firebase...\n')

async function testAuth() {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)

    console.log('✅ Firebase Auth initialisé')

    // Écouter les changements d'état d'authentification
    onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('✅ Utilisateur connecté:')
        console.log('  - UID:', user.uid)
        console.log('  - Email:', user.email)
        console.log('  - Email vérifié:', user.emailVerified)
        console.log('  - Token disponible:', !!user.getIdToken)
      } else {
        console.log('❌ Aucun utilisateur connecté')
      }
    })

    // Essayer de se connecter automatiquement
    try {
      console.log('🔑 Tentative de connexion automatique...')
      await signInWithEmailAndPassword(auth, 'aurore@degranier.fr', 'admin123')
      console.log('✅ Connexion réussie !')
    } catch (error) {
      console.log('❌ Échec de connexion automatique:', error.message)
      console.log('💡 Vous devez vous connecter manuellement dans l\'application.')
      console.log('   Allez sur http://localhost:3000/auth/signin')
      console.log('   Utilisez: aurore@degranier.fr / admin123')
    }

    // Attendre un peu pour que l'état d'auth soit détecté
    setTimeout(() => {
      console.log('\n💡 Si aucun utilisateur n\'est détecté, vous devez vous connecter dans l\'application.')
      console.log('   Allez sur http://localhost:3000/auth/signin')
      console.log('   Utilisez: aurore@degranier.fr / admin123')
    }, 3000)

  } catch (error) {
    console.error('❌ Erreur lors du test d\'auth:', error.message)
  }
}

testAuth()
