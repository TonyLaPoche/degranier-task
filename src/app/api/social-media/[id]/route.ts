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
    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!socialMedia) {
      return NextResponse.json(
        { message: "Réseau social non trouvé" },
        { status: 404 }
      )
    }

    return NextResponse.json(socialMedia)
  } catch (error) {
    console.error("Erreur lors de la récupération du réseau social:", error)
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

    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!socialMedia) {
      return NextResponse.json(
        { message: "Réseau social non trouvé" },
        { status: 404 }
      )
    }

    const updatedSocialMedia = await prisma.socialMedia.update({
      where: { id: resolvedParams.id },
      data: {
        platform: platform.trim(),
        url: url.trim(),
        isActive: isActive ?? true,
      },
    })

    return NextResponse.json(updatedSocialMedia)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du réseau social:", error)
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

    const socialMedia = await prisma.socialMedia.findUnique({
      where: { id: resolvedParams.id }
    })

    if (!socialMedia) {
      return NextResponse.json(
        { message: "Réseau social non trouvé" },
        { status: 404 }
      )
    }

    await prisma.socialMedia.delete({
      where: { id: resolvedParams.id }
    })

    return NextResponse.json({ message: "Réseau social supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du réseau social:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
