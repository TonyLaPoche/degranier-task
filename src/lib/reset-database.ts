import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function resetDatabase() {
  console.log('🚨 Début du nettoyage de la base de données...')

  try {
    // Supprimer dans l'ordre inverse des dépendances pour éviter les erreurs de contraintes

    // 1. Supprimer les commentaires de tâches
    console.log('🗑️  Suppression des commentaires...')
    await prisma.taskComment.deleteMany()

    // 2. Supprimer l'historique des tâches
    console.log('🗑️  Suppression de l\'historique des tâches...')
    await prisma.taskHistory.deleteMany()

    // 3. Supprimer les relations tâche-client
    console.log('🗑️  Suppression des relations tâche-client...')
    await prisma.taskClient.deleteMany()

    // 4. Supprimer les tâches
    console.log('🗑️  Suppression des tâches...')
    await prisma.task.deleteMany()

    // 5. Supprimer les périodes de vacances
    console.log('🗑️  Suppression des périodes de vacances...')
    await prisma.vacation.deleteMany()

    // 6. Supprimer les horaires de contact
    console.log('🗑️  Suppression des horaires de contact...')
    await prisma.contactHours.deleteMany()

    // 7. Supprimer les informations de contact générales
    console.log('🗑️  Suppression des informations de contact...')
    await prisma.contactInfo.deleteMany()

    // 8. Supprimer les réseaux sociaux
    console.log('🗑️  Suppression des réseaux sociaux...')
    await prisma.socialMedia.deleteMany()

    // 9. Supprimer les catégories de clients
    console.log('🗑️  Suppression des catégories de clients...')
    await prisma.clientCategory.deleteMany()

    // 10. Supprimer les utilisateurs (sauf admin si souhaité)
    console.log('🗑️  Suppression des utilisateurs...')
    await prisma.user.deleteMany({
      where: {
        role: 'CLIENT' // Garde l'admin si il existe
      }
    })

    console.log('✅ Base de données nettoyée avec succès !')
    console.log('📊 Toutes les données de développement ont été supprimées.')
    console.log('🔄 La structure de la base reste intacte.')

  } catch (error) {
    console.error('❌ Erreur lors du nettoyage:', error)
    throw error
  }
}

resetDatabase()
  .catch((e) => {
    console.error('❌ Échec du nettoyage:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
