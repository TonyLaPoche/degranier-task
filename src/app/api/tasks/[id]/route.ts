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

    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    const { title, description, status, priority, dueDate, clientIds } = await request.json()
    const resolvedParams = await params
    const taskId = resolvedParams.id

    // Vérifier que la tâche existe
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        clients: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        history: { take: 1, orderBy: { createdAt: 'desc' } }
      }
    })

    if (!existingTask) {
      return NextResponse.json(
        { message: "Tâche non trouvée" },
        { status: 404 }
      )
    }

    // Seuls les admins peuvent modifier les tâches
    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {}
    const historyEntries: Array<{
      taskId: string
      field: string
      oldValue: string | null
      newValue: string | null
      changedById: string
    }> = []

    // Vérifier chaque champ et créer des entrées d'historique si nécessaire
    if (title !== undefined && title !== existingTask.title) {
      updateData.title = title
      historyEntries.push({
        taskId,
        field: "title",
        oldValue: existingTask.title,
        newValue: title,
        changedById: session.user.id,
      })
    }

    if (description !== undefined && description !== existingTask.description) {
      updateData.description = description
      historyEntries.push({
        taskId,
        field: "description",
        oldValue: existingTask.description,
        newValue: description,
        changedById: session.user.id,
      })
    }

    if (status !== undefined && status !== existingTask.status) {
      updateData.status = status
      historyEntries.push({
        taskId,
        field: "status",
        oldValue: existingTask.status,
        newValue: status,
        changedById: session.user.id,
      })
    }

    if (priority !== undefined && priority !== existingTask.priority) {
      updateData.priority = priority
      historyEntries.push({
        taskId,
        field: "priority",
        oldValue: existingTask.priority,
        newValue: priority,
        changedById: session.user.id,
      })
    }

    if (dueDate !== undefined) {
      const newDueDate = dueDate ? new Date(dueDate) : null
      const existingDueDate = existingTask.dueDate

      if ((newDueDate && existingDueDate && newDueDate.getTime() !== existingDueDate.getTime()) ||
          (newDueDate && !existingDueDate) ||
          (!newDueDate && existingDueDate)) {
        updateData.dueDate = newDueDate
        historyEntries.push({
          taskId,
          field: "dueDate",
          oldValue: existingDueDate ? existingDueDate.toISOString() : null,
          newValue: newDueDate ? newDueDate.toISOString() : null,
          changedById: session.user.id,
        })
      }
    }

    // Gérer les changements de clients si clientIds est fourni
    if (clientIds !== undefined && Array.isArray(clientIds)) {
      const existingClientIds = existingTask.clients.map(tc => tc.userId)
      const newClientIds = clientIds

      // Trouver les clients ajoutés
      const addedClients = newClientIds.filter(id => !existingClientIds.includes(id))
      // Trouver les clients supprimés
      const removedClients = existingClientIds.filter(id => !newClientIds.includes(id))

      if (addedClients.length > 0 || removedClients.length > 0) {
        // Supprimer les anciennes relations
        await prisma.taskClient.deleteMany({
          where: { taskId }
        })

        // Créer les nouvelles relations
        await prisma.taskClient.createMany({
          data: newClientIds.map(clientId => ({
            taskId,
            userId: clientId,
          })),
        })

        // Ajouter une entrée d'historique pour les changements de clients
        const oldClientNames = existingTask.clients.map(tc => tc.user.name || tc.user.email).join(", ")
        const newClientNames = await prisma.user.findMany({
          where: { id: { in: newClientIds } },
          select: { name: true, email: true }
        }).then(users => users.map(u => u.name || u.email).join(", "))

        historyEntries.push({
          taskId,
          field: "clients",
          oldValue: oldClientNames,
          newValue: newClientNames,
          changedById: session.user.id,
        })
      }
    }

    // Appliquer les mises à jour et créer l'historique
    const result = await prisma.$transaction(async (tx) => {
      // Mettre à jour la tâche
      await tx.task.update({
        where: { id: taskId },
        data: updateData,
      })

      // Créer les entrées d'historique
      if (historyEntries.length > 0) {
        await tx.taskHistory.createMany({
          data: historyEntries,
        })
      }

      // Retourner la tâche mise à jour avec toutes les relations
      return await tx.task.findUnique({
        where: { id: taskId },
        include: {
          clients: {
            include: {
              user: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
          },
          history: {
            include: {
              changedBy: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                },
              },
            },
            orderBy: {
              createdAt: "desc",
            },
          },
          comments: {
            include: {
              author: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  role: true,
                },
              },
            },
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      })
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error)
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
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    const resolvedParams = await params
    const taskId = resolvedParams.id

    // Vérifier que la tâche existe
    const existingTask = await prisma.task.findUnique({
      where: { id: taskId }
    })

    if (!existingTask) {
      return NextResponse.json(
        { message: "Tâche non trouvée" },
        { status: 404 }
      )
    }

    // Supprimer la tâche (les relations seront supprimées automatiquement grâce aux contraintes de clé étrangère)
    await prisma.task.delete({
      where: { id: taskId }
    })

    return NextResponse.json({ message: "Tâche supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
