import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ContactInfo {
  id: string
  phone?: string
  email?: string
  address?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    const contactInfoRef = doc(db, "contact-info", id)
    const contactInfoSnap = await getDoc(contactInfoRef)

    if (!contactInfoSnap.exists()) {
      return NextResponse.json({ message: "Informations de contact non trouvées" }, { status: 404 })
    }

    const data = contactInfoSnap.data()
    const contactInfo: ContactInfo = {
      id: contactInfoSnap.id,
      phone: data.phone,
      email: data.email,
      address: data.address,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }

    return NextResponse.json(contactInfo)
  } catch (error) {
    console.error("Erreur lors de la récupération des informations de contact:", error)
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
    const resolvedParams = await params
    const { id } = resolvedParams
    const { phone, email, address, isActive } = await request.json()

    console.log("🔥 API PUT /api/firebase/contact-info/[id] appelée")
    console.log("📝 Payload reçu:", JSON.stringify({ phone, email, address, isActive }, null, 2))

    const contactInfoRef = doc(db, "contact-info", id)
    
    // Vérifier que les informations existent
    const contactInfoSnap = await getDoc(contactInfoRef)
    if (!contactInfoSnap.exists()) {
      return NextResponse.json({ message: "Informations de contact non trouvées" }, { status: 404 })
    }

    console.log("✅ Validation passée, mise à jour des informations de contact...")

    const updatedContactInfo = {
      phone: phone || null,
      email: email || null,
      address: address || null,
      isActive: isActive ?? true,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(contactInfoRef, updatedContactInfo)

    const updatedData: ContactInfo = {
      id,
      ...updatedContactInfo,
      createdAt: contactInfoSnap.data().createdAt,
    }

    console.log("✅ Informations de contact mises à jour avec succès:", id)
    return NextResponse.json(updatedData)
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des informations de contact:", error)
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
    const resolvedParams = await params
    const { id } = resolvedParams

    console.log("🔥 API DELETE /api/firebase/contact-info/[id] appelée")
    console.log("📝 ID à supprimer:", id)

    const contactInfoRef = doc(db, "contact-info", id)
    
    // Vérifier que les informations existent
    const contactInfoSnap = await getDoc(contactInfoRef)
    if (!contactInfoSnap.exists()) {
      console.log("❌ Informations de contact non trouvées:", id)
      return NextResponse.json({ message: "Informations de contact non trouvées" }, { status: 404 })
    }

    console.log("✅ Informations de contact trouvées, suppression en cours...")
    await deleteDoc(contactInfoRef)

    console.log("✅ Informations de contact supprimées avec succès:", id)
    return NextResponse.json({ message: "Informations de contact supprimées avec succès" })
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des informations de contact:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
