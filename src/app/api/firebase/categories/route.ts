import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface Category {
  id: string
  name: string
  description?: string
  color: string
  clientCount: number
  createdAt: string
}

export async function GET() {
  try {
    const categoriesRef = collection(db, "categories")
    const q = query(categoriesRef, orderBy("name", "asc"))
    const snapshot = await getDocs(q)

    const categories: Category[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      categories.push({
        id: doc.id,
        name: data.name,
        description: data.description,
        color: data.color,
        clientCount: data.clientCount || 0,
        createdAt: data.createdAt,
      })
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error("Erreur lors de la récupération des catégories:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, description, color } = await request.json()

    if (!name) {
      return NextResponse.json(
        { message: "Le nom de la catégorie est requis" },
        { status: 400 }
      )
    }

    // Vérifier si la catégorie existe déjà
    const categoriesRef = collection(db, "categories")
    const snapshot = await getDocs(categoriesRef)
    const existingCategory = snapshot.docs.find(doc => doc.data().name === name)

    if (existingCategory) {
      return NextResponse.json(
        { message: "Une catégorie avec ce nom existe déjà" },
        { status: 400 }
      )
    }

    // Créer la nouvelle catégorie
    const newCategory = {
      name,
      description: description || "",
      color: color || "#3B82F6",
      clientCount: 0,
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(categoriesRef, newCategory)

    const formattedCategory: Category = {
      id: docRef.id,
      ...newCategory,
    }

    return NextResponse.json(formattedCategory, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la catégorie:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
