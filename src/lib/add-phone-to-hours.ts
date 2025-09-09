import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function addPhoneToHours() {
  console.log('Ajout de numéros de téléphone aux horaires existants...')

  const phoneNumbers = {
    1: '+33 6 12 34 56 78', // Lundi
    2: '+33 6 12 34 56 78', // Mardi
    3: '+33 6 12 34 56 78', // Mercredi
    4: '+33 6 12 34 56 78', // Jeudi
    5: '+33 6 12 34 56 78', // Vendredi
    6: '+33 6 98 76 54 32', // Samedi (différent pour le week-end)
  }

  for (const [dayOfWeek, phone] of Object.entries(phoneNumbers)) {
    const dayNumber = parseInt(dayOfWeek)

    // Vérifier si l'horaire existe pour ce jour
    const existingHours = await prisma.contactHours.findFirst({
      where: { dayOfWeek: dayNumber }
    })

    if (existingHours && !existingHours.phone) {
      await prisma.contactHours.update({
        where: { id: existingHours.id },
        data: { phone }
      })
      console.log(`✓ Numéro de téléphone ajouté pour le jour ${dayNumber}: ${phone}`)
    } else if (existingHours?.phone) {
      console.log(`- Le jour ${dayNumber} a déjà un numéro de téléphone`)
    } else {
      console.log(`- Aucun horaire trouvé pour le jour ${dayNumber}`)
    }
  }

  console.log('Mise à jour des numéros de téléphone terminée !')
}

addPhoneToHours()
  .catch((e) => {
    console.error('Erreur lors de l\'ajout des numéros de téléphone:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
