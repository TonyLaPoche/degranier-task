// Test des imports pour diagnostiquer les erreurs
console.log('🧪 Test des imports...\n')

try {
  console.log('✅ Test 1: Node.js fonctionne')
} catch (error) {
  console.error('❌ Erreur Node.js:', error.message)
}

try {
  const { PrismaClient } = require('@prisma/client')
  console.log('✅ Test 2: Prisma Client importé')
} catch (error) {
  console.error('❌ Erreur Prisma:', error.message)
}

try {
  const { initializeApp } = require('firebase/app')
  console.log('✅ Test 3: Firebase importé')
} catch (error) {
  console.error('❌ Erreur Firebase:', error.message)
}

console.log('\n🎯 Tests terminés')
