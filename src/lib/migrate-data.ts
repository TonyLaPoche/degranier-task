import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function migrateExistingData() {
  console.log('Migration des données existantes...')

  try {
    // Récupérer toutes les tâches existantes
    const existingTasks = await prisma.$queryRaw<{ id: string; userId: string }[]>`
      SELECT id, userId FROM tasks WHERE userId IS NOT NULL
    `

    if (existingTasks.length === 0) {
      console.log('Aucune donnée existante à migrer.')
      return
    }

    console.log(`Migration de ${existingTasks.length} tâches...`)

    // Créer les relations TaskClient pour chaque tâche existante
    for (const task of existingTasks) {
      await prisma.taskClient.create({
        data: {
          taskId: task.id,
          userId: task.userId,
        },
      })
    }

    console.log('Migration terminée avec succès!')
  } catch (error) {
    console.error('Erreur lors de la migration:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

migrateExistingData()
