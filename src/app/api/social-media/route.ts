import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const socialMedia = await prisma.socialMedia.findMany({
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json(socialMedia)
  } catch (error) {
    console.error("Erreur lors de la récupération des réseaux sociaux:", error)
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

    const { platform, url, isActive } = await request.json()

    if (!platform || !url) {
      return NextResponse.json(
        { message: "Le nom de la plateforme et l'URL sont requis" },
        { status: 400 }
      )
    }

    // Validation de l'URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { message: "URL invalide" },
        { status: 400 }
      )
    }

    const socialMedia = await prisma.socialMedia.create({
      data: {
        platform: platform.trim(),
        url: url.trim(),
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(socialMedia, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du réseau social:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
