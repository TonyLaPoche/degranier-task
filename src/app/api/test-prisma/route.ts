import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  try {
    console.log("Test Prisma - Début")

    // Créer une nouvelle instance Prisma spécifiquement pour ce test
    const prisma = new PrismaClient({
      datasourceUrl: "file:./prisma/dev.db"
    })

    // Test simple de connexion
    const userCount = await prisma.user.count()
    console.log("Test Prisma - Nombre d'utilisateurs:", userCount)

    await prisma.$disconnect()

    return NextResponse.json({
      message: "Prisma fonctionne",
      userCount,
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("Erreur Prisma dans /api/test-prisma:", error)
    return NextResponse.json(
      {
        message: "Erreur Prisma",
        error: error.message,
        stack: error.stack
      },
      { status: 500 }
    )
  }
}