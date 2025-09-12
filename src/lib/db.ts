import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Configuration explicite pour SQLite
const prisma = globalForPrisma.prisma ?? new PrismaClient({
  datasourceUrl: "file:./prisma/dev.db"
})

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma

export { prisma }