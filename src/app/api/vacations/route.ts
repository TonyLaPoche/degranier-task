import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const vacations = await prisma.vacation.findMany({
      orderBy: { startDate: 'asc' }
    })

    return NextResponse.json(vacations)
  } catch (error) {
    console.error("Erreur lors de la récupération des vacances:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // TEMPORAIRE: Session mockée
    const session = { user: { role: 'ADMIN', id: 'temp-user-id' } }
    // TEMPORAIRE: Vérification d'autorisation désactivée

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

    // Vérifier les conflits avec d'autres périodes de vacances
    const conflictingVacations = await prisma.vacation.findMany({
      where: {
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

    const vacation = await prisma.vacation.create({
      data: {
        title: title.trim(),
        description: description?.trim() || null,
        startDate: start,
        endDate: end,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(vacation, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la période de vacances:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
