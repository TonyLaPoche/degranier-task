import { NextRequest, NextResponse } from "next/server"
import { taskService } from "@/services/firebaseServices"

// Route Firebase pour les tâches
export async function GET(request: NextRequest) {
  try {
    // Récupérer les paramètres de requête pour le filtrage
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('role')
    const userId = searchParams.get('userId')

    // Pour l'instant, on récupère toutes les tâches (filtrage côté service si nécessaire)
    // TODO: Ajouter l'authentification Firebase
    const tasks = await taskService.getTasks(userRole || undefined, userId || undefined)

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches Firebase:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TODO: Ajouter l'authentification Firebase
    const { title, description, status, priority, dueDate, clientIds, allowComments, checklistItems } = await request.json()

    // Validation
    if (!title || !clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { message: "Le titre et au moins un client sont requis" },
        { status: 400 }
      )
    }

    // Créer la tâche dans Firebase
    const newTask = await taskService.createTask({
      title,
      description: description || null,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      allowComments: allowComments || false,
      clientIds,
      checklistItems: checklistItems || [],
    })

    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la tâche Firebase:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
