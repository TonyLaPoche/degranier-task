import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const contactHours = await prisma.contactHours.findMany({
      orderBy: { dayOfWeek: 'asc' }
    })

    return NextResponse.json(contactHours)
  } catch (error) {
    console.error("Erreur lors de la récupération des horaires de contact:", error)
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

    const { dayOfWeek, startTime, endTime, isActive } = await request.json()

    if (typeof dayOfWeek !== 'number' || !startTime || !endTime) {
      return NextResponse.json(
        { message: "Le jour de la semaine et les horaires sont requis" },
        { status: 400 }
      )
    }

    // Validation du format des heures (HH:MM)
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/
    if (!timeRegex.test(startTime) || !timeRegex.test(endTime)) {
      return NextResponse.json(
        { message: "Format d'heure invalide (HH:MM)" },
        { status: 400 }
      )
    }

    // Vérifier que l'heure de fin est après l'heure de début
    if (startTime >= endTime) {
      return NextResponse.json(
        { message: "L'heure de fin doit être après l'heure de début" },
        { status: 400 }
      )
    }

    // Vérifier que le jour de la semaine est valide (0-6)
    if (dayOfWeek < 0 || dayOfWeek > 6) {
      return NextResponse.json(
        { message: "Jour de la semaine invalide" },
        { status: 400 }
      )
    }

    // Vérifier s'il existe déjà des horaires pour ce jour
    const existingHours = await prisma.contactHours.findFirst({
      where: { dayOfWeek }
    })

    if (existingHours) {
      return NextResponse.json(
        { message: "Des horaires existent déjà pour ce jour de la semaine" },
        { status: 400 }
      )
    }

    const contactHours = await prisma.contactHours.create({
      data: {
        dayOfWeek,
        startTime,
        endTime,
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(contactHours, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création des horaires de contact:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
