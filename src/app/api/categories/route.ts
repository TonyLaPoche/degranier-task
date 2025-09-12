import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    // TEMPORAIRE: Session mockée
    const session = { user: { role: 'ADMIN', id: 'temp-user-id' } }

    // TEMPORAIRE: Vérification d'autorisation désactivée

    const categories = await prisma.clientCategory.findMany({
      include: {
        _count: {
          select: {
            clients: true,
          },
        },
      },
      orderBy: {
        name: "asc",
      },
    })

    const formattedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      clientCount: category._count.clients,
      createdAt: category.createdAt,
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TEMPORAIRE: Session mockée
    const session = { user: { role: 'ADMIN', id: 'temp-user-id' } }

    // TEMPORAIRE: Vérification d'autorisation désactivée

    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: "Le nom de la catégorie est requis" },
        { status: 400 }
      )
    }

    // Vérifier si la catégorie existe déjà
    const existingCategory = await prisma.clientCategory.findUnique({
      where: { name },
    })

    if (existingCategory) {
      return NextResponse.json(
        { message: "Une catégorie avec ce nom existe déjà" },
        { status: 400 }
      )
    }

    const category = await prisma.clientCategory.create({
      data: {
        name,
        description,
        color,
      },
      include: {
        _count: {
          select: {
            clients: true,
          },
        },
      },
    })

    const formattedCategory = {
      id: category.id,
      name: category.name,
      description: category.description,
      color: category.color,
      clientCount: category._count.clients,
      createdAt: category.createdAt,
    }

    return NextResponse.json(formattedCategory, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
