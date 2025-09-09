import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedSocialMedia() {
  console.log('Création des réseaux sociaux par défaut...')

  const socialMedia = [
    {
      platform: 'LinkedIn',
      url: 'https://linkedin.com/in/aurore-de-granier',
      isActive: true,
    },
    {
      platform: 'Twitter',
      url: 'https://twitter.com/AuroreDG',
      isActive: true,
    },
    {
      platform: 'Instagram',
      url: 'https://instagram.com/aurore.degranier',
      isActive: true,
    },
    {
      platform: 'Facebook',
      url: 'https://facebook.com/aurore.degranier',
      isActive: false,
    },
  ]

  // Vérifier si des réseaux existent déjà
  const existingSocialMedia = await prisma.socialMedia.findMany({
    select: { platform: true }
  })

  const existingPlatforms = new Set(existingSocialMedia.map(s => s.platform))

  // Filtrer les réseaux qui n'existent pas encore
  const newSocialMedia = socialMedia.filter(social => !existingPlatforms.has(social.platform))

  if (newSocialMedia.length > 0) {
    await prisma.socialMedia.createMany({
      data: newSocialMedia
    })

    for (const social of newSocialMedia) {
      console.log(`✓ Réseau "${social.platform}" créé`)
    }
  } else {
    console.log('Tous les réseaux sociaux existent déjà')
  }

  console.log('Tous les réseaux sociaux ont été créés avec succès !')
}

seedSocialMedia()
  .catch((e) => {
    console.error('Erreur lors de la création des réseaux sociaux:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
