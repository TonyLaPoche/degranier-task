import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

// GET /api/tasks/[id]/checklists - Récupérer toutes les checklists d'une tâche
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const { id: taskId } = await params

    // Vérifier que la tâche existe et que l'utilisateur y a accès
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          // Admin peut voir toutes les tâches
          { clients: { some: { user: { role: "ADMIN" } } } },
          // Client peut voir ses propres tâches
          { clients: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!task) {
      return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 })
    }

    // Récupérer les checklists triées par ordre
    const checklists = await prisma.taskChecklist.findMany({
      where: { taskId },
      orderBy: { order: "asc" }
    })

    return NextResponse.json(checklists)
  } catch (error) {
    console.error("Erreur lors de la récupération des checklists:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// POST /api/tasks/[id]/checklists - Créer une nouvelle checklist
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const { id: taskId } = await params
    const { title } = await request.json()

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { message: "Le titre est requis" },
        { status: 400 }
      )
    }

    // Vérifier que la tâche existe et que l'utilisateur y a accès
    const task = await prisma.task.findFirst({
      where: {
        id: taskId,
        OR: [
          // Admin peut modifier toutes les tâches
          { clients: { some: { user: { role: "ADMIN" } } } },
          // Client peut modifier ses propres tâches
          { clients: { some: { userId: session.user.id } } }
        ]
      }
    })

    if (!task) {
      return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 })
    }

    // Récupérer le dernier ordre pour cette tâche
    const lastItem = await prisma.taskChecklist.findFirst({
      where: { taskId },
      orderBy: { order: "desc" }
    })

    const nextOrder = lastItem ? lastItem.order + 1 : 0

    // Créer la nouvelle checklist
    const checklist = await prisma.taskChecklist.create({
      data: {
        taskId,
        title: title.trim(),
        order: nextOrder
      }
    })

    return NextResponse.json(checklist, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la checklist:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
