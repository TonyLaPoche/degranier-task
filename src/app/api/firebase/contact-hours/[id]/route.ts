import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ContactHours {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isActive: boolean
  createdAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const { id } = resolvedParams

    const contactHoursRef = doc(db, "contact-hours", id)
    const contactHoursSnap = await getDoc(contactHoursRef)

    if (!contactHoursSnap.exists()) {
      return NextResponse.json({ message: "Horaires non trouvés" }, { status: 404 })
    }

    const data = contactHoursSnap.data()
    const contactHours: ContactHours = {
      id: contactHoursSnap.id,
      dayOfWeek: data.dayOfWeek,
      openTime: data.openTime,
      closeTime: data.closeTime,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt,
    }

    return NextResponse.json(contactHours)
  } catch (error) {
    console.error("Erreur lors de la récupération des horaires:", error)
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
    const body = await request.json()

    console.log("🔥 API PUT /api/firebase/contact-hours/[id] appelée")
    console.log("📝 Payload reçu:", JSON.stringify(body, null, 2))

    // Accepter à la fois les anciens et nouveaux noms de propriétés
    const { 
      dayOfWeek, 
      openTime, 
      closeTime, 
      startTime, 
      endTime, 
      isActive 
    } = body

    // Utiliser les nouvelles propriétés si disponibles, sinon les anciennes
    const finalOpenTime = openTime || startTime
    const finalCloseTime = closeTime || endTime

    if (dayOfWeek === undefined || !finalOpenTime || !finalCloseTime) {
      console.log("❌ Validation échouée:", { dayOfWeek, finalOpenTime, finalCloseTime })
      return NextResponse.json(
        { message: "Le jour de la semaine, l'heure d'ouverture et de fermeture sont requis" },
        { status: 400 }
      )
    }

    const contactHoursRef = doc(db, "contact-hours", id)
    
    // Vérifier que les horaires existent
    const contactHoursSnap = await getDoc(contactHoursRef)
    if (!contactHoursSnap.exists()) {
      return NextResponse.json({ message: "Horaires non trouvés" }, { status: 404 })
    }

    console.log("✅ Validation passée, mise à jour des horaires...")

    const updatedContactHours = {
      dayOfWeek,
      openTime: finalOpenTime,
      closeTime: finalCloseTime,
      isActive: isActive ?? true,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(contactHoursRef, updatedContactHours)

    const updatedData: ContactHours = {
      id,
      ...updatedContactHours,
      createdAt: contactHoursSnap.data().createdAt,
    }

    console.log("✅ Horaires mis à jour avec succès:", id)
    return NextResponse.json(updatedData)
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour des horaires:", error)
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

    console.log("🔥 API DELETE /api/firebase/contact-hours/[id] appelée")
    console.log("📝 ID à supprimer:", id)

    const contactHoursRef = doc(db, "contact-hours", id)
    
    // Vérifier que les horaires existent
    const contactHoursSnap = await getDoc(contactHoursRef)
    if (!contactHoursSnap.exists()) {
      console.log("❌ Horaires non trouvés:", id)
      return NextResponse.json({ message: "Horaires non trouvés" }, { status: 404 })
    }

    console.log("✅ Horaires trouvés, suppression en cours...")
    await deleteDoc(contactHoursRef)

    console.log("✅ Horaires supprimés avec succès:", id)
    return NextResponse.json({ message: "Horaires supprimés avec succès" })
  } catch (error) {
    console.error("❌ Erreur lors de la suppression des horaires:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
