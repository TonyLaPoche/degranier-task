import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedContactHours() {
  console.log('Création des horaires de contact par défaut...')

  const defaultHours = [
    { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true }, // Lundi
    { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true }, // Mardi
    { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true }, // Mercredi
    { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true }, // Jeudi
    { dayOfWeek: 5, startTime: '09:00', endTime: '17:00', isActive: true }, // Vendredi
    { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isActive: false }, // Samedi (inactif)
    { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false }, // Dimanche (inactif)
  ]

  // Vérifier si des horaires existent déjà
  const existingHours = await prisma.contactHours.findMany({
    select: { dayOfWeek: true }
  })

  const existingDays = new Set(existingHours.map(h => h.dayOfWeek))

  // Filtrer les horaires qui n'existent pas encore
  const newHours = defaultHours.filter(hour => !existingDays.has(hour.dayOfWeek))

  if (newHours.length > 0) {
    await prisma.contactHours.createMany({
      data: newHours
    })

    for (const hour of newHours) {
      const dayName = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][hour.dayOfWeek]
      console.log(`✓ Horaires créés pour ${dayName}: ${hour.startTime} - ${hour.endTime} (${hour.isActive ? 'Actif' : 'Inactif'})`)
    }
  } else {
    console.log('Tous les horaires de contact existent déjà')
  }

  console.log('Horaires de contact initialisés avec succès !')
}

async function seedVacations() {
  console.log('Création des périodes de vacances exemple...')

  const exampleVacations = [
    {
      title: 'Vacances d\'été 2024',
      description: 'Période de congés annuels',
      startDate: new Date('2024-07-15'),
      endDate: new Date('2024-08-15'),
      isActive: true,
    },
    {
      title: 'Noël 2024',
      description: 'Fermeture pour les fêtes de fin d\'année',
      startDate: new Date('2024-12-23'),
      endDate: new Date('2025-01-02'),
      isActive: true,
    },
  ]

  for (const vacation of exampleVacations) {
    // Vérifier si cette période existe déjà
    const existingVacation = await prisma.vacation.findFirst({
      where: {
        title: vacation.title,
        startDate: vacation.startDate,
        endDate: vacation.endDate,
      }
    })

    if (!existingVacation) {
      await prisma.vacation.create({
        data: vacation
      })
      console.log(`✓ Période "${vacation.title}" créée`)
    } else {
      console.log(`- Période "${vacation.title}" existe déjà`)
    }
  }

  console.log('Périodes de vacances initialisées avec succès !')
}

async function main() {
  try {
    await seedContactHours()
    console.log('')
    await seedVacations()
  } catch (error) {
    console.error('Erreur lors de l\'initialisation:', error)
    process.exit(1)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
