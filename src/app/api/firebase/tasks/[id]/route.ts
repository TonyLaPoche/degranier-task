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
    console.log("🔄 API PUT /api/firebase/tasks/[id] appelée")
    
    const resolvedParams = await params
    const taskId = resolvedParams.id
    const updateData = await request.json()

    console.log(`📝 Données reçues pour la tâche ${taskId}:`, updateData)

    if (!taskId) {
      return NextResponse.json(
        { message: "ID de tâche requis" },
        { status: 400 }
      )
    }

    // Mettre à jour la tâche
    console.log("🔥 Appel du service de mise à jour...")
    await taskService.updateTask(taskId, updateData)
    console.log("✅ Service de mise à jour terminé")

    return NextResponse.json({ message: "Tâche mise à jour avec succès" }, { status: 200 })
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la tâche:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : String(error))
    return NextResponse.json(
      { 
        message: "Erreur interne du serveur", 
        error: error instanceof Error ? error.message : String(error),
        details: error instanceof Error ? error.stack : undefined
      },
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
