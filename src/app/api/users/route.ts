import { NextRequest, NextResponse } from "next/server"
import { PrismaClient } from '@prisma/client'

export async function GET(request: NextRequest) {
  const prisma = new PrismaClient({
    datasourceUrl: "file:./prisma/dev.db"
  })

  try {
    // TEMPORAIRE: Session mockée pour les tests
    const session = { user: { role: 'ADMIN', id: 'temp-user-id' } }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role")

    const whereClause = role ? { role: role as "ADMIN" | "CLIENT" } : {}

    const users = await prisma.user.findMany({
      where: whereClause,
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            taskClients: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc", // Les plus récents en premier pour voir les nouveaux inscrits
      },
    })

    // Transformer les données pour l'interface
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      category: user.category,
      projectCount: user._count.taskClients,
      createdAt: user.createdAt,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}

export async function POST(request: NextRequest) {
  const prisma = new PrismaClient({
    datasourceUrl: "file:./prisma/dev.db"
  })

  try {
    // TEMPORAIRE: Session mockée
    const session = { user: { role: 'ADMIN', id: 'temp-user-id' } }

    // TEMPORAIRE: Vérification d'autorisation désactivée

    const { name, email, categoryId } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { message: "Le nom et l'email sont requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'email existe déjà
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { message: "Un utilisateur avec cet email existe déjà" },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        name,
        email,
        role: "CLIENT",
        categoryId: categoryId || null,
      },
      include: {
        category: {
          select: {
            id: true,
            name: true,
            color: true,
          },
        },
        _count: {
          select: {
            taskClients: true,
          },
        },
      },
    })

    const formattedUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      category: user.category,
      projectCount: user._count.taskClients,
      createdAt: user.createdAt,
    }

    return NextResponse.json(formattedUser, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'utilisateur:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  } finally {
    await prisma.$disconnect()
  }
}
