import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc, collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const categoryRef = doc(db, "categories", resolvedParams.id)
    const categorySnap = await getDoc(categoryRef)

    if (!categorySnap.exists()) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    const data = categorySnap.data()
    const category = {
      id: categorySnap.id,
      name: data.name,
      description: data.description,
      color: data.color,
      clientCount: data.clientCount || 0,
      createdAt: data.createdAt,
    }

    return NextResponse.json(category)
  } catch (error) {
    console.error("Erreur lors de la récupération de la catégorie:", error)
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
    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: "Le nom de la catégorie est requis" },
        { status: 400 }
      )
    }

    const categoryRef = doc(db, "categories", resolvedParams.id)
    const categorySnap = await getDoc(categoryRef)

    if (!categorySnap.exists()) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    // Vérifier si une autre catégorie avec ce nom existe
    const categoriesRef = collection(db, "categories")
    const snapshot = await getDocs(categoriesRef)
    const existingCategory = snapshot.docs.find(doc =>
      doc.data().name === name && doc.id !== resolvedParams.id
    )

    if (existingCategory) {
      return NextResponse.json(
        { message: "Une catégorie avec ce nom existe déjà" },
        { status: 400 }
      )
    }

    const updateData = {
      name,
      description: description || "",
      color: color || "#3B82F6",
    }

    await updateDoc(categoryRef, updateData)

    const updatedCategory = {
      id: resolvedParams.id,
      ...updateData,
      clientCount: categorySnap.data().clientCount || 0,
      createdAt: categorySnap.data().createdAt,
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la catégorie:", error)
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
    const categoryRef = doc(db, "categories", resolvedParams.id)
    const categorySnap = await getDoc(categoryRef)

    if (!categorySnap.exists()) {
      return NextResponse.json(
        { message: "Catégorie non trouvée" },
        { status: 404 }
      )
    }

    await deleteDoc(categoryRef)

    return NextResponse.json({ message: "Catégorie supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la catégorie:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
