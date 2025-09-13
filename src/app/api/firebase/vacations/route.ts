import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Vacation {
  id: string
  startDate: string
  endDate: string
  reason: string
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
    const { startDate, endDate, reason, isActive } = await request.json()

    if (!startDate || !endDate || !reason) {
      return NextResponse.json(
        { message: "La date de début, la date de fin et la raison sont requis" },
        { status: 400 }
      )
    }

    const vacationsRef = collection(db, "vacations")
    const newVacation = {
      startDate,
      endDate,
      reason: reason.trim(),
      isActive: isActive ?? true,
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(vacationsRef, newVacation)

    const formattedVacation: Vacation = {
      id: docRef.id,
      ...newVacation,
    }

    return NextResponse.json(formattedVacation, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création des vacances:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
