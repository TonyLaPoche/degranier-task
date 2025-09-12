const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement de Vercel
require('dotenv').config({ path: '.env.development.local' });

console.log('🚀 Synchronisation de la base de données Vercel...');

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non trouvé dans .env.development.local');
  console.log('💡 Assurez-vous d\'avoir exécuté: npx vercel env pull .env.development.local');
  process.exit(1);
}

console.log('📊 URL de base de données:', process.env.DATABASE_URL.substring(0, 50) + '...');

// Chemins des fichiers
const schemaPath = path.join(__dirname, 'prisma', 'schema.prisma');
const schemaBackupPath = path.join(__dirname, 'prisma', 'schema.backup.prisma');

// Sauvegarder le schéma original
const originalSchema = fs.readFileSync(schemaPath, 'utf8');
fs.writeFileSync(schemaBackupPath, originalSchema);
console.log('💾 Sauvegarde du schéma original créée');

// Modifier le schéma pour PostgreSQL
const postgresSchema = originalSchema.replace(
  'provider = "sqlite"',
  'provider = "postgresql"'
);
fs.writeFileSync(schemaPath, postgresSchema);
console.log('📝 Schéma modifié pour PostgreSQL');

// Synchroniser la base de données
try {
  console.log('⚙️ Synchronisation du schéma...');
  execSync(`DATABASE_URL="${process.env.DATABASE_URL}" npx prisma db push --force-reset`, {
    stdio: 'inherit',
    cwd: __dirname
  });

  console.log('✅ Schéma synchronisé avec succès!');
  console.log('🎯 Vous pouvez maintenant utiliser /api/init pour initialiser les données');

} catch (error) {
  console.error('❌ Erreur lors de la synchronisation:', error.message);
} finally {
  // Restaurer le schéma original
  fs.writeFileSync(schemaPath, originalSchema);
  fs.unlinkSync(schemaBackupPath);
  console.log('🔄 Schéma original restauré');
}

console.log('🎉 Synchronisation terminée!');
