import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface User {
  id: string
  name: string | null
  email: string
  role: 'ADMIN' | 'CLIENT'
  profileComplete: boolean
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

    const userRef = doc(db, "users", id)
    const userSnap = await getDoc(userRef)

    if (!userSnap.exists()) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 })
    }

    const data = userSnap.data()
    const user: User = {
      id: userSnap.id,
      name: data.name || null,
      email: data.email,
      role: data.role || 'CLIENT',
      profileComplete: data.profileComplete ?? false,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur:", error)
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
    const { name, email, role, profileComplete } = await request.json()

    console.log("🔥 API PUT /api/firebase/users/[id] appelée")
    console.log("📝 Payload reçu:", JSON.stringify({ name, email, role, profileComplete }, null, 2))

    if (!email) {
      return NextResponse.json(
        { message: "L'email est requis" },
        { status: 400 }
      )
    }

    const userRef = doc(db, "users", id)
    
    // Vérifier que l'utilisateur existe
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 })
    }

    console.log("✅ Validation passée, mise à jour de l'utilisateur...")

    const updatedUser = {
      name: name || null,
      email: email.trim(),
      role: role || 'CLIENT',
      profileComplete: profileComplete ?? false,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(userRef, updatedUser)

    const updatedData: User = {
      id,
      ...updatedUser,
      createdAt: userSnap.data().createdAt,
    }

    console.log("✅ Utilisateur mis à jour avec succès:", id)
    return NextResponse.json(updatedData)
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour de l'utilisateur:", error)
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

    console.log("🔥 API DELETE /api/firebase/users/[id] appelée")
    console.log("📝 ID à supprimer:", id)

    const userRef = doc(db, "users", id)
    
    // Vérifier que l'utilisateur existe
    const userSnap = await getDoc(userRef)
    if (!userSnap.exists()) {
      console.log("❌ Utilisateur non trouvé:", id)
      return NextResponse.json({ message: "Utilisateur non trouvé" }, { status: 404 })
    }

    console.log("✅ Utilisateur trouvé, suppression en cours...")
    await deleteDoc(userRef)

    console.log("✅ Utilisateur supprimé avec succès:", id)
    return NextResponse.json({ message: "Utilisateur supprimé avec succès" })
  } catch (error) {
    console.error("❌ Erreur lors de la suppression de l'utilisateur:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
