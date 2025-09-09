import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const resolvedParams = await params
    const categoryId = resolvedParams.id
    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: "Le nom de la catégorie est requis" },
        { status: 400 }
      )
    }

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.clientCategory.findUnique({
      where: { id: categoryId },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si le nouveau nom est déjà utilisé par une autre catégorie
    if (name !== existingCategory.name) {
      const nameExists = await prisma.clientCategory.findUnique({
        where: { name },
      })

      if (nameExists) {
        return NextResponse.json(
          { message: "Une catégorie avec ce nom existe déjà" },
          { status: 400 }
        )
      }
    }

    const updatedCategory = await prisma.clientCategory.update({
      where: { id: categoryId },
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
      id: updatedCategory.id,
      name: updatedCategory.name,
      description: updatedCategory.description,
      color: updatedCategory.color,
      clientCount: updatedCategory._count.clients,
      createdAt: updatedCategory.createdAt,
    }

    return NextResponse.json(formattedCategory)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const resolvedParams = await params
    const categoryId = resolvedParams.id

    // Vérifier si la catégorie existe
    const existingCategory = await prisma.clientCategory.findUnique({
      where: { id: categoryId },
      include: {
        _count: {
          select: {
            clients: true,
          },
        },
      },
    })

    if (!existingCategory) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si la catégorie contient des clients
    if (existingCategory._count.clients > 0) {
      return NextResponse.json(
        {
          message: "Impossible de supprimer une catégorie contenant des clients. Veuillez d'abord réassigner ou supprimer les clients.",
        },
        { status: 400 }
      )
    }

    await prisma.clientCategory.delete({
      where: { id: categoryId },
    })

    return NextResponse.json({ message: "Catégorie supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
