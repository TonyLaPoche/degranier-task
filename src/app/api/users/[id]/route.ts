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
    const userId = resolvedParams.id
    const { name, email, categoryId } = await request.json()

    if (!email || !name) {
      return NextResponse.json(
        { message: "Le nom et l'email sont requis" },
        { status: 400 }
      )
    }

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Vérifier si l'email est déjà utilisé par un autre utilisateur
    if (email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      })

      if (emailExists) {
        return NextResponse.json(
          { message: "Un utilisateur avec cet email existe déjà" },
          { status: 400 }
        )
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name,
        email,
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
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      category: updatedUser.category,
      projectCount: updatedUser._count.taskClients,
      createdAt: updatedUser.createdAt,
    }

    return NextResponse.json(formattedUser)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur:", error)
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
    const userId = resolvedParams.id

    // Vérifier si l'utilisateur existe
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    })

    if (!existingUser) {
      return NextResponse.json(
        { message: "Utilisateur non trouvé" },
        { status: 404 }
      )
    }

    // Empêcher la suppression de l'utilisateur actuel
    if (userId === session.user.id) {
      return NextResponse.json(
        { message: "Vous ne pouvez pas supprimer votre propre compte" },
        { status: 400 }
      )
    }

    // Empêcher la suppression d'autres admins
    if (existingUser.role === "ADMIN") {
      return NextResponse.json(
        { message: "Vous ne pouvez pas supprimer un autre administrateur" },
        { status: 400 }
      )
    }

    await prisma.user.delete({
      where: { id: userId },
    })

    return NextResponse.json({ message: "Utilisateur supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
