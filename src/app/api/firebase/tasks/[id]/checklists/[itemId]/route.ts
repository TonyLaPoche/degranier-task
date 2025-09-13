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
    const { isCompleted } = await request.json()

    console.log(`🔥 Toggle checklist ${itemId} pour la tâche ${taskId}, isCompleted: ${isCompleted}`)

    // Pour les checklists stockées dans la tâche (nouveau format)
    // On va mettre à jour directement dans le document de la tâche
    const taskRef = doc(db, "tasks", taskId)
    const taskSnap = await getDoc(taskRef)

    if (!taskSnap.exists()) {
      return NextResponse.json({ message: "Tâche non trouvée" }, { status: 404 })
    }

    const taskData = taskSnap.data()
    const checklistItems = taskData.checklistItems || []

    // Trouver l'item à mettre à jour
    const itemIndex = checklistItems.findIndex((item: { id: string }) => item.id === itemId)
    
    if (itemIndex === -1) {
      return NextResponse.json({ message: "Checklist item non trouvé" }, { status: 404 })
    }

    // Mettre à jour l'item
    checklistItems[itemIndex] = {
      ...checklistItems[itemIndex],
      completed: Boolean(isCompleted),
      updatedAt: new Date()
    }

    // Sauvegarder la tâche mise à jour
    await updateDoc(taskRef, {
      checklistItems: checklistItems,
      updatedAt: new Date()
    })

    console.log(`✅ Checklist ${itemId} mise à jour avec succès`)

    return NextResponse.json({
      id: itemId,
      ...checklistItems[itemIndex]
    })
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
