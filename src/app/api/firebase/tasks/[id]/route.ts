import { NextRequest, NextResponse } from "next/server"
import { taskService } from "@/services/firebaseServices"

// DELETE /api/firebase/tasks/[id] - Supprimer une tâche spécifique
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id

    if (!taskId) {
      return NextResponse.json(
        { message: "ID de tâche requis" },
        { status: 400 }
      )
    }

    // Supprimer la tâche
    await taskService.deleteTask(taskId)

    return NextResponse.json(
      { message: "Tâche supprimée avec succès" },
      { status: 200 }
    )
  } catch (error) {
    console.error("Erreur lors de la suppression de la tâche:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// PUT /api/firebase/tasks/[id] - Mettre à jour une tâche spécifique
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id
    const updateData = await request.json()

    if (!taskId) {
      return NextResponse.json(
        { message: "ID de tâche requis" },
        { status: 400 }
      )
    }

    // Mettre à jour la tâche
    const updatedTask = await taskService.updateTask(taskId, updateData)

    return NextResponse.json(updatedTask, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la tâche:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// GET /api/firebase/tasks/[id] - Récupérer une tâche spécifique
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id

    if (!taskId) {
      return NextResponse.json(
        { message: "ID de tâche requis" },
        { status: 400 }
      )
    }

    // Récupérer la tâche
    const task = await taskService.getTaskById(taskId)

    if (!task) {
      return NextResponse.json(
        { message: "Tâche non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(task, { status: 200 })
  } catch (error) {
    console.error("Erreur lors de la récupération de la tâche:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
