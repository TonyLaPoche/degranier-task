import { NextRequest, NextResponse } from "next/server"
import { taskService } from "@/services/firebaseServices"

// Route Firebase pour les tâches
export async function GET(request: NextRequest) {
  try {
    console.log("🔍 GET /api/firebase/tasks appelé")
    
    // Récupérer les paramètres de requête pour le filtrage
    const { searchParams } = new URL(request.url)
    const userRole = searchParams.get('role')
    const userId = searchParams.get('userId')
    
    console.log(`📋 Paramètres: role=${userRole}, userId=${userId}`)

    // Test simple d'abord
    console.log("🔥 Tentative d'appel du service Firebase...")
    const tasks = await taskService.getTasks(userRole || undefined, userId || undefined)
    console.log(`✅ Service Firebase réussi, ${tasks.length} tâches trouvées`)

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des tâches Firebase:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : String(error))
    return NextResponse.json(
      { message: "Erreur interne du serveur", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log("🔥 API POST /api/firebase/tasks appelée")

    // Pour le développement : accepter toutes les requêtes authentifiées
    // TODO: Ajouter une vérification d'authentification complète en production
    const body = await request.json()
    console.log("📝 Payload reçu:", JSON.stringify(body, null, 2))

    // Accepter à la fois "checklists" et "checklistItems" pour la compatibilité
    const { title, description, status, priority, dueDate, clientIds, allowComments, checklistItems, checklists } = body

    // Validation
    if (!title || !clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      console.log("❌ Validation échouée:", { title, clientIds })
      return NextResponse.json(
        { message: "Le titre et au moins un client sont requis" },
        { status: 400 }
      )
    }

    console.log("✅ Validation passée, création de la tâche...")

    // Convertir les checklists en checklistItems si nécessaire
    const processedChecklistItems = checklistItems || (checklists ? checklists.map((item: string, index: number) => ({
      id: `item-${index}`,
      title: item,
      completed: false,
      createdAt: new Date(),
      updatedAt: new Date(),
      order: index
    })) : [])

    console.log("📝 ChecklistItems traités:", processedChecklistItems)

    // Créer la tâche dans Firebase
    const newTask = await taskService.createTask({
      title,
      description: description || null,
      status: status || 'TODO',
      priority: priority || 'MEDIUM',
      dueDate: dueDate ? new Date(dueDate) : null,
      allowComments: allowComments || false,
      clientIds,
      checklistItems: processedChecklistItems,
    })

    console.log("✅ Tâche créée avec succès:", newTask.id)
    return NextResponse.json(newTask, { status: 201 })
  } catch (error) {
    console.error("❌ Erreur lors de la création de la tâche Firebase:", error)
    console.error("Stack trace:", error instanceof Error ? error.stack : String(error))
    return NextResponse.json(
      { message: "Erreur interne du serveur", error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
