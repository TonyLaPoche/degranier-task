const { PrismaClient } = require('@prisma/client')
const { initializeApp } = require('firebase/app')
const { getFirestore, collection, doc, setDoc, Timestamp } = require('firebase/firestore')
// Forcer l'utilisation de la base de données locale pour la migration
process.env.DATABASE_URL = 'file:./dev.db'

const prisma = new PrismaClient()

// Charger les vraies variables d'environnement Firebase
require('dotenv').config({ path: '.env.local' })

// Configuration Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
}

const app = initializeApp(firebaseConfig)
const db = getFirestore(app)

async function migrateData() {
  console.log('🚀 Migration des données Prisma vers Firebase...')

  try {
    // Migrer les utilisateurs
    console.log('👤 Migration des utilisateurs...')
    const users = await prisma.user.findMany({
      include: {
        category: true
      }
    })

    for (const user of users) {
      await setDoc(doc(db, 'users', user.id), {
        email: user.email,
        name: user.name,
        role: user.role,
        createdAt: Timestamp.fromDate(user.createdAt),
        updatedAt: Timestamp.fromDate(user.updatedAt)
      })
      console.log(`  ✅ ${user.email}`)
    }

    // Migrer les tâches
    console.log('📋 Migration des tâches...')
    const tasks = await prisma.task.findMany({
      include: {
        clients: true,
        checklists: true,
        comments: true,
        history: true
      }
    })

    for (const task of tasks) {
      // Créer la tâche
      await setDoc(doc(db, 'tasks', task.id), {
        title: task.title,
        description: task.description,
        status: task.status,
        priority: task.priority,
        dueDate: task.dueDate ? Timestamp.fromDate(task.dueDate) : null,
        allowComments: task.allowComments,
        clientIds: task.clients.map(tc => tc.userId),
        createdAt: Timestamp.fromDate(task.createdAt),
        updatedAt: Timestamp.fromDate(task.updatedAt)
      })

      // Migrer les checklists
      for (const checklist of task.checklists) {
        await setDoc(doc(db, 'taskChecklists', checklist.id), {
          taskId: checklist.taskId,
          title: checklist.title,
          isCompleted: checklist.isCompleted,
          order: checklist.order,
          createdAt: Timestamp.fromDate(checklist.createdAt),
          updatedAt: Timestamp.fromDate(checklist.updatedAt)
        })
      }

      // Migrer les commentaires
      for (const comment of task.comments) {
        await setDoc(doc(db, 'taskComments', comment.id), {
          taskId: comment.taskId,
          authorId: comment.authorId,
          content: comment.content,
          isFromClient: comment.isFromClient,
          createdAt: Timestamp.fromDate(comment.createdAt),
          updatedAt: Timestamp.fromDate(comment.updatedAt)
        })
      }

      // Migrer l'historique
      for (const entry of task.history) {
        await setDoc(doc(db, 'taskHistory', entry.id), {
          taskId: entry.taskId,
          field: entry.field,
          oldValue: entry.oldValue,
          newValue: entry.newValue,
          changedById: entry.changedById,
          createdAt: Timestamp.fromDate(entry.createdAt)
        })
      }

      console.log(`  ✅ ${task.title} (${task.checklists.length} checklists)`)
    }

    // Migrer les horaires de contact
    console.log('📞 Migration des horaires...')
    const contactHours = await prisma.contactHours.findMany()
    for (const hour of contactHours) {
      await setDoc(doc(db, 'contactHours', hour.id), {
        dayOfWeek: hour.dayOfWeek,
        startTime: hour.startTime,
        endTime: hour.endTime,
        isActive: hour.isActive,
        createdAt: Timestamp.fromDate(hour.createdAt),
        updatedAt: Timestamp.fromDate(hour.updatedAt)
      })
    }

    console.log('✅ Migration terminée avec succès!')
    console.log('')
    console.log('📊 Résumé:')
    console.log(`  👤 ${users.length} utilisateurs migrés`)
    console.log(`  📋 ${tasks.length} tâches migrées`)
    console.log(`  ✅ ${tasks.reduce((sum, t) => sum + t.checklists.length, 0)} checklists migrées`)
    console.log(`  💬 ${tasks.reduce((sum, t) => sum + t.comments.length, 0)} commentaires migrés`)

  } catch (error) {
    console.error('❌ Erreur lors de la migration:', error)
    console.log('')
    console.log('💡 Conseils:')
    console.log('  • Vérifie que Firebase est correctement configuré')
    console.log('  • Vérifie que les variables d\'environnement sont bonnes')
    console.log('  • Vérifie que Prisma peut accéder à la base de données')
  } finally {
    await prisma.$disconnect()
  }
}

migrateData()
