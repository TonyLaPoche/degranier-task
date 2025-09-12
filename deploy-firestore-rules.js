// Script pour déployer les règles Firestore temporairement
const fs = require('fs')
const path = require('path')

console.log('📋 Règles Firestore temporaires créées dans firestore.temp.rules')
console.log('')
console.log('📝 Instructions :')
console.log('1. Va sur https://console.firebase.google.com')
console.log('2. Sélectionne ton projet "degranier-task"')
console.log('3. Va dans Firestore Database > Règles')
console.log('4. Remplace le contenu par celui du fichier firestore.temp.rules')
console.log('5. Clique sur "Publier"')
console.log('')
console.log('⚠️  IMPORTANT : Ces règles permettent TOUTES les écritures !')
console.log('🔒 Change-les après la migration pour plus de sécurité.')
console.log('')
console.log('✅ Après avoir appliqué les règles :')
console.log('node scripts/migrate-to-firebase.js')

