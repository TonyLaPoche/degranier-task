import { PrismaClient } from '@prisma/client'
import * as bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function seedProduction() {
  console.log('🌱 Initialisation de la base de données en production...')

  try {
    // 1. Créer l'utilisateur admin principal
    console.log('👤 Création du compte administrateur...')
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

    // 2. Créer quelques catégories de clients par défaut
    console.log('📂 Création des catégories de clients...')
    const categories = [
      { name: 'Entreprise', description: 'Clients entreprise', color: '#3B82F6' },
      { name: 'Particulier', description: 'Clients particuliers', color: '#10B981' },
      { name: 'VIP', description: 'Clients importants', color: '#F59E0B' },
      { name: 'Prospect', description: 'Prospects potentiels', color: '#8B5CF6' },
    ]

    for (const category of categories) {
      await prisma.clientCategory.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      })
    }

    // 3. Créer les horaires de contact par défaut
    console.log('🕒 Configuration des horaires de contact...')
    const hours = [
      { dayOfWeek: 1, startTime: '09:00', endTime: '18:00', isActive: true }, // Lundi
      { dayOfWeek: 2, startTime: '09:00', endTime: '18:00', isActive: true }, // Mardi
      { dayOfWeek: 3, startTime: '09:00', endTime: '18:00', isActive: true }, // Mercredi
      { dayOfWeek: 4, startTime: '09:00', endTime: '18:00', isActive: true }, // Jeudi
      { dayOfWeek: 5, startTime: '09:00', endTime: '18:00', isActive: true }, // Vendredi
      { dayOfWeek: 6, startTime: '10:00', endTime: '16:00', isActive: true }, // Samedi
      { dayOfWeek: 0, startTime: '00:00', endTime: '00:00', isActive: false }, // Dimanche
    ]

    for (const hour of hours) {
      const existing = await prisma.contactHours.findFirst({
        where: { dayOfWeek: hour.dayOfWeek }
      })
      if (!existing) {
        await prisma.contactHours.create({ data: hour })
      }
    }

    // 4. Créer les informations de contact générales (vides pour l'instant)
    console.log('📞 Initialisation des informations de contact...')
    const existingContactInfo = await prisma.contactInfo.findFirst()
    if (!existingContactInfo) {
      await prisma.contactInfo.create({
        data: {
          phone: null,
          email: 'aurore@degranier.fr',
          address: null,
          isActive: true,
        },
      })
    }

    // 5. Créer les réseaux sociaux par défaut
    console.log('🌐 Configuration des réseaux sociaux...')
    const socialPlatforms = [
      {
        platform: 'LinkedIn',
        url: 'https://linkedin.com/in/aurore-de-granier',
        isActive: true,
      },
      {
        platform: 'Twitter',
        url: 'https://twitter.com/AuroreDG',
        isActive: false,
      },
      {
        platform: 'Instagram',
        url: 'https://instagram.com/aurore.degranier',
        isActive: false,
      },
      {
        platform: 'Facebook',
        url: 'https://facebook.com/aurore.degranier',
        isActive: false,
      },
    ]

    for (const social of socialPlatforms) {
      const existing = await prisma.socialMedia.findFirst({
        where: { platform: social.platform }
      })
      if (existing) {
        await prisma.socialMedia.update({
          where: { id: existing.id },
          data: { url: social.url, isActive: social.isActive }
        })
      } else {
        await prisma.socialMedia.create({ data: social })
      }
    }

    console.log('✅ Base de données de production initialisée avec succès !')
    console.log('')
    console.log('👤 Compte administrateur créé :')
    console.log('   Email: aurore@degranier.fr')
    console.log('   Mot de passe: admin123')
    console.log('')
    console.log('📂 Catégories créées : Entreprise, Particulier, VIP, Prospect')
    console.log('🕒 Horaires configurés : Lundi-Vendredi 9h-18h, Samedi 10h-16h')
    console.log('📞 Email de contact : aurore@degranier.fr')
    console.log('🌐 LinkedIn configuré (autres réseaux désactivés)')
    console.log('')
    console.log('🚀 Application prête pour la production !')

  } catch (error) {
    console.error('❌ Erreur lors de l\'initialisation:', error)
    throw error
  }
}

seedProduction()
  .catch((e) => {
    console.error('❌ Échec de l\'initialisation:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
