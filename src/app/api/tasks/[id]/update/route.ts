import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const resolvedParams = await params
    const taskId = resolvedParams.id
    const { note, description, status } = await request.json()

    if (!note || typeof note !== "string" || note.trim().length === 0) {
      return NextResponse.json(
        { message: "Une note est requise" },
        { status: 400 }
      )
    }

    // Vérifier que la tâche existe
    const task = await prisma.task.findUnique({
      where: { id: taskId },
    })

    if (!task) {
      return NextResponse.json(
        { message: "Tâche non trouvée" },
        { status: 404 }
      )
    }

    // Préparer les données de mise à jour et l'historique
    const updateData: Record<string, unknown> = {}
    const historyEntries: Array<{
      taskId: string
      field: string
      oldValue: string | null
      newValue: string | null
      changedById: string
    }> = []

    // Vérifier les changements de description
    if (description !== undefined && description !== task.description) {
      updateData.description = description
      historyEntries.push({
        taskId,
        field: "description",
        oldValue: task.description || "",
        newValue: description || "",
        changedById: session.user.id,
      })
    }

    // Vérifier les changements de statut
    if (status !== undefined && status !== task.status) {
      updateData.status = status
      historyEntries.push({
        taskId,
        field: "status",
        oldValue: task.status,
        newValue: status,
        changedById: session.user.id,
      })
    }

    // Toujours créer une entrée d'historique pour la note de mise à jour
    historyEntries.push({
      taskId,
      field: "update",
      oldValue: null,
      newValue: note.trim(),
      changedById: session.user.id,
    })

    // Mettre à jour la tâche si des modifications ont été apportées
    if (Object.keys(updateData).length > 0) {
      await prisma.task.update({
        where: { id: taskId },
        data: updateData,
      })
    }

    // Créer toutes les entrées d'historique
    await prisma.taskHistory.createMany({
      data: historyEntries,
    })

    return NextResponse.json({ message: "Mise à jour enregistrée" })
  } catch (error) {
    console.error("Erreur lors de la mise à jour:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
