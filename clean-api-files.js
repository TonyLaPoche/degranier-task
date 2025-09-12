// Script pour nettoyer tous les fichiers API
const fs = require('fs')
const path = require('path')

console.log('🧹 Nettoyage des fichiers API...\n')

const apiDir = 'src/app/api'

// Fonction récursive pour trouver tous les fichiers .ts
function findTsFiles(dir) {
  const files = []
  const items = fs.readdirSync(dir)

  for (const item of items) {
    const fullPath = path.join(dir, item)
    const stat = fs.statSync(fullPath)

    if (stat.isDirectory()) {
      files.push(...findTsFiles(fullPath))
    } else if (item.endsWith('.ts')) {
      files.push(fullPath)
    }
  }

  return files
}

const tsFiles = findTsFiles(apiDir)

tsFiles.forEach(filePath => {
  console.log(`📝 Nettoyage de ${filePath}...`)

  let content = fs.readFileSync(filePath, 'utf8')

  // Supprimer les imports next-auth
  content = content.replace(/import\s*{\s*getServerSession\s*}\s*from\s*["']next-auth["']\s*;\s*/g, '')
  content = content.replace(/import\s*{\s*authOptions\s*}\s*from\s*["']@\/lib\/auth["']\s*;\s*/g, '')

  // Nettoyer les commentaires et code dupliqué dans les fonctions
  content = content.replace(
    /\/\/ TEMPORAIRE: Désactiver la vérification d'authentification pour les tests[\s\S]*?const session = { user: { role: 'ADMIN', id: 'temp-user-id' } } \/\/ Mock session/g,
    '// TEMPORAIRE: Session mockée pour les tests\n    const session = { user: { role: \'ADMIN\', id: \'temp-user-id\' } }'
  )

  // Supprimer les commentaires de vérification d'authentification
  content = content.replace(/\/\/ TEMPORAIRE: Vérification de session désactivée\s*\/\/ TEMPORAIRE: Vérification d'autorisation désactivée\s*/g, '')

  fs.writeFileSync(filePath, content)
  console.log(`✅ ${filePath} nettoyé`)
})

console.log('\n🎉 Tous les fichiers API ont été nettoyés !')
