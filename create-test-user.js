import { initializeApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { getFirestore, doc, setDoc } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: "AIzaSyBDV9scgvwkndF3rWp1vaRdfsbuM05LAJM",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.firebasestorage.app",
  messagingSenderId: "183738125412",
  appId: "1:183738125412:web:54e4e06cb8f9323657a371"
}

console.log('👤 Création d\'un utilisateur de test...\n')

async function createTestUser() {
  try {
    // Initialiser Firebase
    const app = initializeApp(firebaseConfig)
    const auth = getAuth(app)
    const db = getFirestore(app)

    console.log('✅ Firebase initialisé')

    // Créer un utilisateur de test
    const email = 'admin@test.com'
    const password = 'test123456'
    const role = 'ADMIN'

    console.log(`📧 Création de l'utilisateur: ${email}`)

    // Créer l'utilisateur dans Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password)
    const user = userCredential.user

    console.log(`✅ Utilisateur créé dans Firebase Auth: ${user.uid}`)

    // Créer le profil utilisateur dans Firestore
    const userData = {
      name: 'Admin Test',
      email: email,
      role: role,
      profileComplete: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    await setDoc(doc(db, 'users', user.uid), userData)

    console.log('✅ Profil utilisateur créé dans Firestore')
    console.log('📊 Données utilisateur:', userData)

    console.log('\n🎉 Utilisateur de test créé avec succès!')
    console.log('🔐 Identifiants de connexion:')
    console.log(`   Email: ${email}`)
    console.log(`   Mot de passe: ${password}`)
    console.log(`   Rôle: ${role}`)

    console.log('\n💡 Vous pouvez maintenant tester l\'application avec ces identifiants!')

  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.log('ℹ️ L\'utilisateur existe déjà. Utilisez ces identifiants:')
      console.log('   Email: admin@test.com')
      console.log('   Mot de passe: test123456')
    } else {
      console.error('❌ Erreur lors de la création:', error.message)
      console.log('🔍 Code d\'erreur:', error.code)
    }
  }
}

createTestUser()
