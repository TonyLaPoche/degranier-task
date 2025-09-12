const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Charger les variables d'environnement de Vercel
require('dotenv').config({ path: '.env.development.local' });

console.log('🚀 Migration de la base de données Vercel...');

// Vérifier que DATABASE_URL est défini
if (!process.env.DATABASE_URL) {
  console.error('❌ DATABASE_URL non trouvé dans .env.development.local');
  process.exit(1);
}

console.log('📊 URL de base de données:', process.env.DATABASE_URL.substring(0, 50) + '...');

// Créer un schéma temporaire pour PostgreSQL
const tempSchemaPath = path.join(__dirname, '..', 'prisma', 'schema-temp.prisma');
const originalSchemaPath = path.join(__dirname, '..', 'prisma', 'schema.prisma');

const originalSchema = fs.readFileSync(originalSchemaPath, 'utf8');
const tempSchema = originalSchema.replace(
  'provider = "sqlite"',
  'provider = "postgresql"'
);

fs.writeFileSync(tempSchemaPath, tempSchema);
console.log('📝 Schéma temporaire créé pour PostgreSQL');

// Appliquer la migration avec le schéma temporaire
try {
  console.log('⚙️ Application de la migration...');
  execSync(`DATABASE_URL="${process.env.DATABASE_URL}" npx prisma migrate deploy --schema=${tempSchemaPath}`, {
    stdio: 'inherit',
    cwd: path.join(__dirname, '..')
  });

  console.log('✅ Migration appliquée avec succès!');
} catch (error) {
  console.error('❌ Erreur lors de la migration:', error.message);
} finally {
  // Nettoyer le fichier temporaire
  if (fs.existsSync(tempSchemaPath)) {
    fs.unlinkSync(tempSchemaPath);
    console.log('🧹 Fichier temporaire supprimé');
  }
}

console.log('🎉 Migration terminée!');
