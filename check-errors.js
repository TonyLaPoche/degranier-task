// Script pour vérifier les erreurs de compilation
const { exec } = require('child_process')
const path = require('path')

console.log('🔍 Vérification des erreurs de compilation...\n')

exec('npm run build 2>&1', { cwd: path.join(__dirname) }, (error, stdout, stderr) => {
  if (error) {
    console.log('❌ Erreurs de compilation trouvées:\n')
    console.log(stdout)
    console.log(stderr)
  } else {
    console.log('✅ Aucune erreur de compilation !')
  }
})
