import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function seedCategories() {
  console.log('Création des catégories par défaut...')

  const categories = [
    {
      name: 'Entreprise',
      description: 'Clients professionnels et entreprises',
      color: '#3b82f6', // Bleu
    },
    {
      name: 'Particulier',
      description: 'Clients individuels',
      color: '#10b981', // Vert
    },
    {
      name: 'VIP',
      description: 'Clients très importants',
      color: '#f59e0b', // Orange
    },
    {
      name: 'Prospect',
      description: 'Clients potentiels à convertir',
      color: '#8b5cf6', // Violet
    },
  ]

  for (const category of categories) {
    await prisma.clientCategory.upsert({
      where: { name: category.name },
      update: {},
      create: category,
    })
    console.log(`✓ Catégorie "${category.name}" créée`)
  }

  console.log('Toutes les catégories ont été créées avec succès !')
}

seedCategories()
  .catch((e) => {
    console.error('Erreur lors de la création des catégories:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
