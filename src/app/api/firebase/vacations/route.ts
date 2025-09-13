import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"
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

export async function GET() {
  try {
    const vacationsRef = collection(db, "vacations")
    const q = query(vacationsRef, orderBy("startDate", "asc"))
    const snapshot = await getDocs(q)

    const vacations: Vacation[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      vacations.push({
        id: doc.id,
        startDate: data.startDate,
        endDate: data.endDate,
        reason: data.reason,
        description: data.description || null,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt,
      })
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
    const body = await request.json()
    console.log("🔥 API POST /api/firebase/vacations appelée")
    console.log("📝 Payload reçu:", JSON.stringify(body, null, 2))

    // Accepter à la fois les anciens et nouveaux noms de propriétés
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

    console.log("✅ Validation passée, création des vacances...")

    const vacationsRef = collection(db, "vacations")
    const newVacation = {
      startDate,
      endDate,
      reason: finalReason.trim ? finalReason.trim() : finalReason,
      description: description || null,
      isActive: isActive ?? true,
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(vacationsRef, newVacation)

    const formattedVacation: Vacation = {
      id: docRef.id,
      ...newVacation,
    }

    console.log("✅ Vacances créées avec succès:", docRef.id)
    return NextResponse.json(formattedVacation, { status: 201 })
  } catch (error) {
    console.error("❌ Erreur lors de la création des vacances:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
