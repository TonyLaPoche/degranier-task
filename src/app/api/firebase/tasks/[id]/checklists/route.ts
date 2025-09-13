import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, addDoc, query, where } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface ChecklistItem {
  id: string
  taskId: string
  title: string
  isCompleted: boolean
  order: number
  createdAt: string
  updatedAt: string
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id

    const checklistsRef = collection(db, "taskChecklists")

    // Pour éviter l'erreur d'index, on récupère d'abord tous les checklists de cette tâche
    // puis on les trie en mémoire
    const q = query(checklistsRef, where("taskId", "==", taskId))
    const snapshot = await getDocs(q)

    // Trier par ordre en mémoire
    const checklists: ChecklistItem[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      checklists.push({
        id: doc.id,
        taskId: data.taskId,
        title: data.title,
        isCompleted: data.isCompleted ?? false,
        order: data.order ?? 0,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt,
      })
    })

    // Trier par ordre
    checklists.sort((a, b) => a.order - b.order)

    return NextResponse.json(checklists)
  } catch (error) {
    console.error("Erreur lors de la récupération des checklists:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id
    const { title } = await request.json()

    if (!title || typeof title !== "string" || title.trim().length === 0) {
      return NextResponse.json(
        { message: "Le titre est requis" },
        { status: 400 }
      )
    }

    const checklistsRef = collection(db, "taskChecklists")

    // Récupérer tous les checklists de cette tâche pour déterminer le prochain ordre
    const q = query(checklistsRef, where("taskId", "==", taskId))
    const snapshot = await getDocs(q)

    // Trouver le plus grand ordre
    let maxOrder = -1
    snapshot.forEach((doc) => {
      const data = doc.data()
      if (data.order > maxOrder) {
        maxOrder = data.order
      }
    })
    const nextOrder = maxOrder + 1

    // Créer la nouvelle checklist
    const newChecklist = {
      taskId,
      title: title.trim(),
      isCompleted: false,
      order: nextOrder,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const docRef = await addDoc(checklistsRef, newChecklist)

    const formattedChecklist: ChecklistItem = {
      id: docRef.id,
      ...newChecklist,
    }

    return NextResponse.json(formattedChecklist, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de la checklist:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
