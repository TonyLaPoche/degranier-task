import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

export async function GET() {
  return NextResponse.json({
    message: "Initialisation de la base de données de production",
    warning: "Cet endpoint est temporaire et sera supprimé en production",
    usage: "Visitez cette URL pour initialiser: /api/init/setup"
  })
}

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Initialisation de la base de données de production...')

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

    // Créer quelques tâches de test avec checklists
    const task1 = await prisma.task.create({
      data: {
        title: 'Article sur l\'économie circulaire',
        description: 'Rédaction d\'un article de 1500 mots sur les enjeux de l\'économie circulaire dans l\'industrie textile.',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        dueDate: new Date('2024-12-15'),
      },
    })

    // Ajouter des checklists à la tâche 1
    await prisma.taskChecklist.createMany({
      data: [
        { taskId: task1.id, title: 'Recherche documentaire', order: 0 },
        { taskId: task1.id, title: 'Rédaction du brouillon', order: 1 },
        { taskId: task1.id, title: 'Relecture et corrections', order: 2 },
        { taskId: task1.id, title: 'Mise en page finale', order: 3 },
      ],
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

    // Ajouter des checklists à la tâche 2
    await prisma.taskChecklist.createMany({
      data: [
        { taskId: task2.id, title: 'Préparation des questions', order: 0 },
        { taskId: task2.id, title: 'Rendez-vous avec l\'invité', order: 1 },
        { taskId: task2.id, title: 'Enregistrement de l\'interview', order: 2 },
        { taskId: task2.id, title: 'Montage et diffusion', order: 3 },
      ],
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

    return NextResponse.json({
      success: true,
      message: 'Base de données initialisée avec succès',
      users: {
        admin: {
          email: 'aurore@degranier.fr',
          password: 'admin123'
        },
        clients: [
          { email: 'marie@example.com', password: 'client123' },
          { email: 'jean@example.com', password: 'client123' }
        ]
      },
      next_steps: [
        'Testez la connexion admin: https://degranier-task.vercel.app/auth/signin',
        'Email: aurore@degranier.fr',
        'Password: admin123'
      ]
    })

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    return NextResponse.json(
      {
        success: false,
        message: "Erreur lors de l'initialisation de la base de données",
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
