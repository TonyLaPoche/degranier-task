import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get("userId")

    // Si c'est un admin, il peut voir toutes les tâches ou filtrer par userId
    // Si c'est un client, il ne voit que ses propres tâches
    let whereClause = {}

    if (session.user.role === "CLIENT") {
      // Pour les clients, on filtre via la relation TaskClient
      const taskClients = await prisma.taskClient.findMany({
        where: { userId: session.user.id },
        select: { taskId: true },
      })
      const taskIds = taskClients.map(tc => tc.taskId)
      whereClause = { id: { in: taskIds } }
    } else if (userId) {
      // Pour les admins filtrant par userId
      const taskClients = await prisma.taskClient.findMany({
        where: { userId },
        select: { taskId: true },
      })
      const taskIds = taskClients.map(tc => tc.taskId)
      whereClause = { id: { in: taskIds } }
    }

    const tasks = await prisma.task.findMany({
      where: whereClause,
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
        checklists: {
          orderBy: {
            order: "asc",
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(tasks)
  } catch (error) {
    console.error("Erreur lors de la récupération des tâches:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    const { title, description, status, priority, dueDate, clientIds, allowComments, checklists } = await request.json()

    // Validation
    if (!title || !clientIds || !Array.isArray(clientIds) || clientIds.length === 0) {
      return NextResponse.json(
        { message: "Le titre et au moins un client sont requis" },
        { status: 400 }
      )
    }

    // Créer la tâche
    const task = await prisma.task.create({
      data: {
        title,
        description,
        status: status || "TODO",
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : null,
        allowComments: allowComments !== undefined ? allowComments : true,
      },
    })

    // Créer les relations TaskClient
    await prisma.taskClient.createMany({
      data: clientIds.map(clientId => ({
        taskId: task.id,
        userId: clientId,
      })),
    })

    // Créer les checklists si elles sont fournies
    if (checklists && Array.isArray(checklists) && checklists.length > 0) {
      await prisma.taskChecklist.createMany({
        data: checklists.map((item: string, index: number) => ({
          taskId: task.id,
          title: item,
          order: index,
        })),
      })
    }

    // Ajouter une entrée d'historique pour la création
    await prisma.taskHistory.create({
      data: {
        taskId: task.id,
        field: "created",
        oldValue: null,
        newValue: "Tâche créée",
        changedById: session.user.id,
      },
    })

    // Récupérer la tâche avec toutes les relations
    const taskWithRelations = await prisma.task.findUnique({
      where: { id: task.id },
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
        checklists: {
          orderBy: {
            order: "asc",
          },
        },
      },
    })

    return NextResponse.json(taskWithRelations, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la tâche:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
