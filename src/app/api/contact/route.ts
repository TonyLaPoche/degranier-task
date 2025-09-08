import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    const [contactHours, socialMedia] = await Promise.all([
      prisma.contactHours.findMany({
        where: { isActive: true },
        orderBy: { dayOfWeek: "asc" },
      }),
      prisma.socialMedia.findMany({
        where: { isActive: true },
        orderBy: { platform: "asc" },
      }),
    ])

    return NextResponse.json({
      contactHours,
      socialMedia,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de contact:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
