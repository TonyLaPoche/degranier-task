import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: taskId, itemId } = resolvedParams
    const { title, isCompleted, order } = await request.json()

    const checklistRef = doc(db, "taskChecklists", itemId)
    const checklistSnap = await getDoc(checklistRef)

    if (!checklistSnap.exists()) {
      return NextResponse.json({ message: "Checklist non trouvée" }, { status: 404 })
    }

    const checklistData = checklistSnap.data()

    // Vérifier que la checklist appartient bien à la tâche
    if (checklistData.taskId !== taskId) {
      return NextResponse.json({ message: "Checklist non trouvée pour cette tâche" }, { status: 404 })
    }

    // Préparer les données de mise à jour
    const updateData: Record<string, unknown> = {
      updatedAt: new Date().toISOString(),
    }

    if (title !== undefined) {
      if (!title || typeof title !== "string" || title.trim().length === 0) {
        return NextResponse.json(
          { message: "Le titre est requis" },
          { status: 400 }
        )
      }
      updateData.title = title.trim()
    }

    if (isCompleted !== undefined) {
      updateData.isCompleted = Boolean(isCompleted)
    }

    if (order !== undefined && typeof order === "number") {
      updateData.order = order
    }

    // Mettre à jour la checklist
    await updateDoc(checklistRef, updateData)

    // Récupérer la checklist mise à jour
    const updatedChecklistSnap = await getDoc(checklistRef)
    const updatedData = updatedChecklistSnap.data()

    const updatedChecklist = {
      id: itemId,
      taskId: updatedData!.taskId,
      title: updatedData!.title,
      isCompleted: updatedData!.isCompleted ?? false,
      order: updatedData!.order ?? 0,
      createdAt: updatedData!.createdAt,
      updatedAt: updatedData!.updatedAt,
    }

    return NextResponse.json(updatedChecklist)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de la checklist:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; itemId: string }> }
) {
  try {
    const resolvedParams = await params
    const { id: taskId, itemId } = resolvedParams

    const checklistRef = doc(db, "taskChecklists", itemId)
    const checklistSnap = await getDoc(checklistRef)

    if (!checklistSnap.exists()) {
      return NextResponse.json({ message: "Checklist non trouvée" }, { status: 404 })
    }

    const checklistData = checklistSnap.data()

    // Vérifier que la checklist appartient bien à la tâche
    if (checklistData!.taskId !== taskId) {
      return NextResponse.json({ message: "Checklist non trouvée pour cette tâche" }, { status: 404 })
    }

    // Supprimer la checklist
    await deleteDoc(checklistRef)

    return NextResponse.json({ message: "Checklist supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de la checklist:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
