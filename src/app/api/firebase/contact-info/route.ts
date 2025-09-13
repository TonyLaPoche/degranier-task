import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, addDoc, updateDoc, query, where, limit } from "firebase/firestore"
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

export async function GET() {
  try {
    const contactInfoRef = collection(db, "contact-info")
    const q = query(contactInfoRef, where("isActive", "==", true), limit(1))
    const snapshot = await getDocs(q)

    if (snapshot.empty) {
      return NextResponse.json(null)
    }

    const doc = snapshot.docs[0]
    const data = doc.data()

    const contactInfo: ContactInfo = {
      id: doc.id,
      phone: data.phone,
      email: data.email,
      address: data.address,
      isActive: data.isActive,
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

export async function POST(request: NextRequest) {
  try {
    const { phone, email, address } = await request.json()

    // Validation basique de l'email si fourni
    if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { message: "Format d'email invalide" },
        { status: 400 }
      )
    }

    const contactInfoRef = collection(db, "contact-info")

    // Vérifier s'il existe déjà des informations de contact
    const snapshot = await getDocs(contactInfoRef)
    const existingDoc = snapshot.docs[0]

    const contactData = {
      phone: phone?.trim() || null,
      email: email?.trim() || null,
      address: address?.trim() || null,
      isActive: true,
      updatedAt: new Date().toISOString(),
      createdAt: undefined as string | undefined,
    }

    if (existingDoc) {
      // Mettre à jour les informations existantes
      await updateDoc(existingDoc.ref, contactData)

      const updatedContact: ContactInfo = {
        id: existingDoc.id,
        ...contactData,
        createdAt: existingDoc.data().createdAt,
      }

      return NextResponse.json(updatedContact)
    } else {
      // Créer de nouvelles informations de contact
      const newContactData = {
        ...contactData,
        createdAt: new Date().toISOString(),
      }
      const docRef = await addDoc(contactInfoRef, newContactData)

      const newContact: ContactInfo = {
        id: docRef.id,
        ...newContactData,
      }

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
