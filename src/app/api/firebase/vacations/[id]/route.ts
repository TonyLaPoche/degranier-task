import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Vacation {
  id: string
  startDate: string
  endDate: string
  reason: string
  description?: string | null
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

    const vacationRef = doc(db, "vacations", id)
    const vacationSnap = await getDoc(vacationRef)

    if (!vacationSnap.exists()) {
      return NextResponse.json({ message: "Vacation non trouvée" }, { status: 404 })
    }

    const data = vacationSnap.data()
    const vacation: Vacation = {
      id: vacationSnap.id,
      startDate: data.startDate,
      endDate: data.endDate,
      reason: data.reason,
      description: data.description || null,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt,
    }

    return NextResponse.json(vacation)
  } catch (error) {
    console.error("Erreur lors de la récupération de la vacation:", error)
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

    console.log("🔥 API PUT /api/firebase/vacations/[id] appelée")
    console.log("📝 Payload reçu:", JSON.stringify(body, null, 2))

    const { 
      startDate, 
      endDate, 
      reason, 
      title, 
      description, 
      isActive 
    } = body

    // Utiliser title si disponible, sinon reason
    const finalReason = reason || title

    if (!startDate || !endDate || !finalReason) {
      console.log("❌ Validation échouée:", { startDate, endDate, finalReason })
      return NextResponse.json(
        { message: "La date de début, la date de fin et le titre/raison sont requis" },
        { status: 400 }
      )
    }

    const vacationRef = doc(db, "vacations", id)
    
    // Vérifier que la vacation existe
    const vacationSnap = await getDoc(vacationRef)
    if (!vacationSnap.exists()) {
      return NextResponse.json({ message: "Vacation non trouvée" }, { status: 404 })
    }

    console.log("✅ Validation passée, mise à jour de la vacation...")

    const updatedVacation = {
      startDate,
      endDate,
      reason: finalReason.trim ? finalReason.trim() : finalReason,
      description: description || null,
      isActive: isActive ?? true,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(vacationRef, updatedVacation)

    const updatedData: Vacation = {
      id,
      ...updatedVacation,
      createdAt: vacationSnap.data().createdAt,
    }

    console.log("✅ Vacation mise à jour avec succès:", id)
    return NextResponse.json(updatedData)
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de la vacation:", error)
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

    console.log("🔥 API DELETE /api/firebase/vacations/[id] appelée")
    console.log("📝 ID à supprimer:", id)

    const vacationRef = doc(db, "vacations", id)
    
    // Vérifier que la vacation existe
    const vacationSnap = await getDoc(vacationRef)
    if (!vacationSnap.exists()) {
      console.log("❌ Vacation non trouvée:", id)
      return NextResponse.json({ message: "Vacation non trouvée" }, { status: 404 })
    }

    console.log("✅ Vacation trouvée, suppression en cours...")
    await deleteDoc(vacationRef)

    console.log("✅ Vacation supprimée avec succès:", id)
    return NextResponse.json({ message: "Vacation supprimée avec succès" })
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de la vacation:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
