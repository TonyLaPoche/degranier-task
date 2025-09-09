import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('Migration des tâches existantes pour allowComments...')

  // Utiliser une requête SQL directe pour contourner les limitations de Prisma avec NULL
  const result = await prisma.$executeRaw`
    UPDATE tasks SET allowComments = 1 WHERE allowComments IS NULL
  `

  console.log(`${result} tâches mises à jour avec allowComments = true`)
  console.log('Migration terminée !')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
