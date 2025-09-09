import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const vacation = await prisma.vacation.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!vacation) {
      return NextResponse.json(
        { message: "Période de vacances non trouvée" },
        { status: 404 }
      )
    }

    return NextResponse.json(vacation)
  } catch (error) {
    console.error("Erreur lors de la récupération de la période de vacances:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions)
    if (!session || session.user.role !== "ADMIN") {
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const resolvedParams = await params
    const { title, description, startDate, endDate, isActive } = await request.json()

    if (!title || !startDate || !endDate) {
      return NextResponse.json(
        { message: "Le titre et les dates sont requis" },
        { status: 400 }
      )
    }

    const start = new Date(startDate)
    const end = new Date(endDate)

    // Validation des dates
    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return NextResponse.json(
        { message: "Dates invalides" },
        { status: 400 }
      )
    }

    if (start >= end) {
      return NextResponse.json(
        { message: "La date de fin doit être après la date de début" },
        { status: 400 }
      )
    }

    const existingVacation = await prisma.vacation.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingVacation) {
      return NextResponse.json(
        { message: "Période de vacances non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier les conflits avec d'autres périodes de vacances (sauf la période actuelle)
    const conflictingVacations = await prisma.vacation.findMany({
      where: {
        id: { not: resolvedParams.id },
        OR: [
          {
            AND: [
              { startDate: { lte: start } },
              { endDate: { gte: start } }
            ]
          },
          {
            AND: [
              { startDate: { lte: end } },
              { endDate: { gte: end } }
            ]
          },
          {
            AND: [
              { startDate: { gte: start } },
              { endDate: { lte: end } }
            ]
          }
        ]
      }
    })

    if (conflictingVacations.length > 0) {
      return NextResponse.json(
        { message: "Cette période chevauche une autre période de vacances" },
        { status: 400 }
      )
    }

    const updatedVacation = await prisma.vacation.update({
      where: { id: resolvedParams.id },
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startDate: start,
        endDate: end,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(updatedVacation)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la période de vacances:", error)
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
      return NextResponse.json({ message: "Non autorisé" }, { status: 401 })
    }

    const resolvedParams = await params

    const existingVacation = await prisma.vacation.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!existingVacation) {
      return NextResponse.json(
        { message: "Période de vacances non trouvée" },
        { status: 404 }
      )
    }

    await prisma.vacation.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: "Période de vacances supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la période de vacances:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
