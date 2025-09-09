import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
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

    const resolvedParams = await params
    const taskId = resolvedParams.id

    // Vérifier que la tâche existe et que l'utilisateur y a accès
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        clients: {
          where: { userId: session.user.id },
          select: { userId: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { message: "Tâche non trouvée" },
        { status: 404 }
      )
    }

    // Seuls les admins ou les clients assignés peuvent voir les commentaires
    if (session.user.role !== "ADMIN" && task.clients.length === 0) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    // Vérifier que les commentaires sont autorisés pour cette tâche
    if (!task.allowComments) {
      return NextResponse.json(
        { message: "Les commentaires ne sont pas autorisés pour cette tâche" },
        { status: 403 }
      )
    }

    const comments = await prisma.taskComment.findMany({
      where: { taskId },
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
    })

    return NextResponse.json(comments)
  } catch (error) {
    console.error("Erreur lors de la récupération des commentaires:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(
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

    const resolvedParams = await params
    const taskId = resolvedParams.id
    const { content } = await request.json()

    // Validation
    if (!content || !content.trim()) {
      return NextResponse.json(
        { message: "Le contenu du commentaire est requis" },
        { status: 400 }
      )
    }

    // Vérifier que la tâche existe et que l'utilisateur y a accès
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        clients: {
          where: { userId: session.user.id },
          select: { userId: true }
        }
      }
    })

    if (!task) {
      return NextResponse.json(
        { message: "Tâche non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier que l'utilisateur peut commenter cette tâche
    if (session.user.role !== "ADMIN" && task.clients.length === 0) {
      return NextResponse.json(
        { message: "Non autorisé" },
        { status: 401 }
      )
    }

    // Vérifier que les commentaires sont autorisés pour cette tâche
    if (!task.allowComments) {
      return NextResponse.json(
        { message: "Les commentaires ne sont pas autorisés pour cette tâche" },
        { status: 403 }
      )
    }

    // Vérifier que la tâche n'est pas terminée (seulement pour les clients)
    if (session.user.role === "CLIENT" && task.status === "COMPLETED") {
      return NextResponse.json(
        { message: "Impossible de commenter une tâche terminée" },
        { status: 400 }
      )
    }

    const comment = await prisma.taskComment.create({
      data: {
        taskId,
        authorId: session.user.id,
        content: content.trim(),
        isFromClient: session.user.role === "CLIENT",
      },
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
    })

    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du commentaire:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
