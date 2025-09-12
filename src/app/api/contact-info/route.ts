import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/db"

export async function GET() {
  try {
    const contactInfo = await prisma.contactInfo.findFirst({
      where: { isActive: true }
    })

    return NextResponse.json(contactInfo || null)
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de contact:", error)
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

    const { phone, email, address } = await request.json()

    // Validation basique de l'email si fourni
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Format d'email invalide" },
        { status: 400 }
      )
    }

    // Vérifier s'il existe déjà des informations de contact
    const existingContact = await prisma.contactInfo.findFirst()

    if (existingContact) {
      // Mettre à jour les informations existantes
      const updatedContact = await prisma.contactInfo.update({
        where: { id: existingContact.id },
        data: {
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          address: address?.trim() || null,
        },
      })
      return NextResponse.json(updatedContact)
    } else {
      // Créer de nouvelles informations de contact
      const newContact = await prisma.contactInfo.create({
        data: {
          phone: phone?.trim() || null,
          email: email?.trim() || null,
          address: address?.trim() || null,
          isActive: true,
        },
      })
      return NextResponse.json(newContact, { status: 201 })
    }
  } catch (error) {
    console.error("Erreur lors de la création/mise à jour des informations de contact:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
