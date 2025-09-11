import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Initialisation de la base de données de production...')

  // Créer l'utilisateur admin
  const adminHashedPassword = await bcrypt.hash('admin123', 12)

  await prisma.user.upsert({
    where: { email: 'aurore@degranier.fr' },
    update: {},
    create: {
      email: 'aurore@degranier.fr',
      name: 'Aurore De Granier',
      password: adminHashedPassword,
      role: 'ADMIN',
    },
  })

  // Créer quelques clients de test
  const client1 = await prisma.user.upsert({
    where: { email: 'marie@example.com' },
    update: {},
    create: {
      email: 'marie@example.com',
      name: 'Marie Dupont',
      password: await bcrypt.hash('client123', 12),
      role: 'CLIENT',
    },
  })

  const client2 = await prisma.user.upsert({
    where: { email: 'jean@example.com' },
    update: {},
    create: {
      email: 'jean@example.com',
      name: 'Jean Martin',
      password: await bcrypt.hash('client123', 12),
      role: 'CLIENT',
    },
  })

  // Créer quelques tâches de test
  const task1 = await prisma.task.create({
    data: {
      title: 'Article sur l\'économie circulaire',
      description: 'Rédaction d\'un article de 1500 mots sur les enjeux de l\'économie circulaire dans l\'industrie textile.',
      status: 'IN_PROGRESS',
      priority: 'MEDIUM',
      dueDate: new Date('2024-12-15'),
    },
  })

  const task2 = await prisma.task.create({
    data: {
      title: 'Interview politique régionale',
      description: 'Préparation et réalisation d\'une interview avec le candidat aux élections régionales.',
      status: 'TODO',
      priority: 'HIGH',
      dueDate: new Date('2024-12-10'),
    },
  })

  // Associer les tâches aux clients
  await prisma.taskClient.createMany({
    data: [
      { taskId: task1.id, userId: client1.id },
      { taskId: task2.id, userId: client2.id },
    ],
  })

  // Créer les horaires de contact
  await prisma.contactHours.createMany({
    data: [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true }, // Lundi
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true }, // Mardi
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true }, // Mercredi
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true }, // Jeudi
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true }, // Vendredi
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isActive: true }, // Samedi
      { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false }, // Dimanche
    ],
  })

  console.log('✅ Base de données de production initialisée avec succès!')
  console.log('👤 Utilisateur admin créé:')
  console.log('   Email: aurore@degranier.fr')
  console.log('   Mot de passe: admin123')
  console.log('👥 Clients de test créés avec mot de passe: client123')
}

main()
  .catch((e) => {
    console.error('❌ Erreur lors de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })