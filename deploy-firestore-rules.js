import { readFileSync } from 'fs'
import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth } from 'firebase/auth'

console.log('🚀 Déploiement des règles Firestore...')

try {
  // Lire le fichier de règles
  const rules = readFileSync('./firestore.rules', 'utf8')
  console.log('✅ Règles Firestore lues avec succès')

  // Afficher les règles (pour vérification)
  console.log('\n📋 Règles à déployer:')
  console.log('=' .repeat(50))
  console.log(rules)
  console.log('=' .repeat(50))

  console.log('\n🔗 Pour déployer ces règles:')
  console.log('1. Allez sur https://console.firebase.google.com/')
  console.log('2. Sélectionnez votre projet "degranier-task"')
  console.log('3. Allez dans Firestore > Règles')
  console.log('4. Remplacez les règles actuelles par celles ci-dessus')
  console.log('5. Cliquez sur "Publier"')

  console.log('\n⚠️ ATTENTION: Les règles actuelles permettent tout (allow read, write: if true;)')
  console.log('Cela signifie que TOUTES les données sont publiques actuellement!')
  console.log('Vous DEVEZ remplacer ces règles par celles générées ci-dessus.')

  console.log('\n✅ Script terminé avec succès!')

} catch (error) {
  console.error('❌ Erreur lors du déploiement des règles:', error.message)
  process.exit(1)
}
