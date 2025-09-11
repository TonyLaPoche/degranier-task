import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// PUT /api/tasks/[id]/checklists/[itemId] - Mettre à jour une checklist
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const { id: taskId, itemId } = await params
    const { title, isCompleted, order } = await request.json()

    // Vérifier que la checklist existe et appartient à la tâche
    const checklist = await prisma.taskChecklist.findFirst({
      where: {
        id: itemId,
        taskId: taskId
      },
      include: {
        task: {
          include: {
            clients: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!checklist) {
      return NextResponse.json({ message: "Checklist non trouvée" }, { status: 404 })
    }

    // Vérifier les permissions : admin ou client propriétaire de la tâche
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = checklist.task.clients.some(tc => tc.userId === session.user.id)

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {}

    if (title !== undefined) {
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { message: "Le titre est requis" },
          { status: 400 }
        )
      }
      updateData.title = title.trim()
    }

    if (isCompleted !== undefined) {
      updateData.isCompleted = Boolean(isCompleted)
    }

    if (order !== undefined && typeof order === "number") {
      updateData.order = order
    }

    // Mettre à jour la checklist
    const updatedChecklist = await prisma.taskChecklist.update({
      where: { id: itemId },
      data: updateData
    })

    return NextResponse.json(updatedChecklist)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la checklist:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// DELETE /api/tasks/[id]/checklists/[itemId] - Supprimer une checklist
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const { id: taskId, itemId } = await params

    // Vérifier que la checklist existe et appartient à la tâche
    const checklist = await prisma.taskChecklist.findFirst({
      where: {
        id: itemId,
        taskId: taskId
      },
      include: {
        task: {
          include: {
            clients: {
              include: {
                user: true
              }
            }
          }
        }
      }
    })

    if (!checklist) {
      return NextResponse.json({ message: "Checklist non trouvée" }, { status: 404 })
    }

    // Vérifier les permissions : admin ou client propriétaire de la tâche
    const isAdmin = session.user.role === "ADMIN"
    const isOwner = checklist.task.clients.some(tc => tc.userId === session.user.id)

    if (!isAdmin && !isOwner) {
      return NextResponse.json({ message: "Accès non autorisé" }, { status: 403 })
    }

    // Supprimer la checklist
    await prisma.taskChecklist.delete({
      where: { id: itemId }
    })

    return NextResponse.json({ message: "Checklist supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la checklist:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
