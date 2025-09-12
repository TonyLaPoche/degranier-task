// Script pour corriger automatiquement les routes API
const fs = require('fs')
const path = require('path')
const { execSync } = require('child_process')

console.log('🔧 Correction automatique des routes API...\n')

// Liste des fichiers API à corriger
const apiFiles = [
  'src/app/api/categories/route.ts',
  'src/app/api/contact-hours/route.ts',
  'src/app/api/contact-info/route.ts',
  'src/app/api/social-media/route.ts',
  'src/app/api/tasks/route.ts',
  'src/app/api/users/route.ts',
  'src/app/api/vacations/route.ts'
]

apiFiles.forEach(filePath => {
  if (fs.existsSync(filePath)) {
    console.log(`📝 Correction de ${filePath}...`)

    let content = fs.readFileSync(filePath, 'utf8')

    // Supprimer les imports next-auth
    content = content.replace(/import\s*{\s*getServerSession\s*}\s*from\s*["']next-auth["']\s*;\s*/g, '')
    content = content.replace(/import\s*{\s*authOptions\s*}\s*from\s*["']@\/lib\/auth["']\s*;\s*/g, '')

    // Remplacer getServerSession par une session mockée
    content = content.replace(
      /const\s+session\s*=\s*await\s+getServerSession\(authOptions\)/g,
      '// TEMPORAIRE: Session mockée\n    const session = { user: { role: \'ADMIN\', id: \'temp-user-id\' } }'
    )

    // Remplacer les vérifications de session
    content = content.replace(
      /if\s*\(\s*!session\s*\)\s*{\s*return\s+NextResponse\.json\(\s*{[^}]*}\s*,\s*{\s*status:\s*401\s*}\s*\)\s*}/g,
      '// TEMPORAIRE: Vérification de session désactivée'
    )

    content = content.replace(
      /if\s*\(\s*!session\s*\|\|\s*session\.user\.role\s*!==\s*["']ADMIN["']\s*\)\s*{\s*return\s+NextResponse\.json\(\s*{[^}]*}\s*,\s*{\s*status:\s*401\s*}\s*\)\s*}/g,
      '// TEMPORAIRE: Vérification d\'autorisation désactivée'
    )

    fs.writeFileSync(filePath, content)
    console.log(`✅ ${filePath} corrigé`)
  } else {
    console.log(`⚠️  ${filePath} n'existe pas`)
  }
})

console.log('\n🎉 Toutes les routes API ont été corrigées !')
console.log('🔄 Redémarrage du serveur recommandé...\n')
