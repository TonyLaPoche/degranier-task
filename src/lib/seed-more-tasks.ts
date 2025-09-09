import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedMoreTasks() {
  console.log('Création de tâches supplémentaires pour tester les filtres...')

  // Récupérer les clients existants
  const clients = await prisma.user.findMany({
    where: { role: 'CLIENT' },
    take: 2
  })

  if (clients.length < 2) {
    console.log('Pas assez de clients pour créer des tâches de test')
    return
  }

  const client1 = clients[0]
  const client2 = clients[1]

  // Créer des tâches variées pour tester les filtres
  const tasks = [
    {
      title: 'Rapport sur les tendances technologiques',
      description: 'Analyse approfondie des tendances technologiques émergentes pour 2024',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: new Date('2024-12-20'),
      allowComments: true,
    },
    {
      title: 'Interview avec expert en cybersécurité',
      description: 'Préparation et réalisation d\'une interview exclusive avec un expert en cybersécurité',
      status: 'TODO' as const,
      priority: 'URGENT' as const,
      dueDate: new Date('2024-12-15'),
      allowComments: true,
    },
    {
      title: 'Article sur l\'intelligence artificielle',
      description: 'Rédaction d\'un article détaillé sur les applications de l\'IA dans l\'industrie',
      status: 'REVIEW' as const,
      priority: 'MEDIUM' as const,
      dueDate: new Date('2024-12-25'),
      allowComments: false,
    },
    {
      title: 'Reportage photo événement sportif',
      description: 'Couverture photographique complète d\'un événement sportif régional',
      status: 'COMPLETED' as const,
      priority: 'LOW' as const,
      dueDate: new Date('2024-11-30'),
      allowComments: false,
    },
    {
      title: 'Podcast sur l\'environnement',
      description: 'Production d\'un podcast de 30 minutes sur les enjeux environnementaux locaux',
      status: 'TODO' as const,
      priority: 'MEDIUM' as const,
      dueDate: new Date('2025-01-10'),
      allowComments: true,
    },
    {
      title: 'Analyse de marché startup',
      description: 'Étude de marché complète pour une startup technologique innovante',
      status: 'IN_PROGRESS' as const,
      priority: 'HIGH' as const,
      dueDate: new Date('2024-12-18'),
      allowComments: true,
    },
  ]

  // Créer les tâches et les associer aux clients
  for (let i = 0; i < tasks.length; i++) {
    const taskData = tasks[i]
    const task = await prisma.task.create({
      data: taskData,
    })

    // Associer alternativement aux deux clients pour diversifier
    const assignedClient = i % 2 === 0 ? client1 : client2
    await prisma.taskClient.create({
      data: {
        taskId: task.id,
        userId: assignedClient.id,
      },
    })

    console.log(`✓ Tâche "${task.title}" créée pour ${assignedClient.name || assignedClient.email}`)
  }

  console.log('Toutes les tâches de test ont été créées avec succès !')
}

seedMoreTasks()
  .catch((e) => {
    console.error('Erreur lors de la création des tâches:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
