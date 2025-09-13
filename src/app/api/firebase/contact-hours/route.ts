import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ContactHours {
  id: string
  dayOfWeek: number
  openTime: string
  closeTime: string
  isActive: boolean
  createdAt: string
}

export async function GET() {
  try {
    const contactHoursRef = collection(db, "contact-hours")
    const q = query(contactHoursRef, orderBy("dayOfWeek", "asc"))
    const snapshot = await getDocs(q)

    const contactHours: ContactHours[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      contactHours.push({
        id: doc.id,
        dayOfWeek: data.dayOfWeek,
        openTime: data.openTime,
        closeTime: data.closeTime,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt,
      })
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
    const { dayOfWeek, openTime, closeTime, isActive } = await request.json()

    if (dayOfWeek === undefined || !openTime || !closeTime) {
      return NextResponse.json(
        { message: "Le jour de la semaine, l'heure d'ouverture et de fermeture sont requis" },
        { status: 400 }
      )
    }

    const contactHoursRef = collection(db, "contact-hours")
    const newContactHours = {
      dayOfWeek,
      openTime,
      closeTime,
      isActive: isActive ?? true,
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(contactHoursRef, newContactHours)

    const formattedContactHours: ContactHours = {
      id: docRef.id,
      ...newContactHours,
    }

    return NextResponse.json(formattedContactHours, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création des horaires de contact:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
