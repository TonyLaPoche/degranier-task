import { NextRequest, NextResponse } from "next/server"
import { collection, addDoc, getDocs, query, where, orderBy, doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface TaskComment {
  id: string
  content: string
  isFromClient: boolean
  createdAt: string
  taskId: string
  author: {
    id: string
    name: string | null
    email: string
    role: string
  }
}

// GET - Récupérer tous les commentaires d'une tâche
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id

    console.log(`🔍 GET comments pour la tâche ${taskId}`)

    // Récupérer les commentaires depuis la collection principale (sans orderBy)
    const commentsRef = collection(db, "taskComments")
    const q = query(
      commentsRef, 
      where("taskId", "==", taskId)
    )
    
    const snapshot = await getDocs(q)
    const comments: TaskComment[] = []

    snapshot.forEach((doc) => {
      const data = doc.data()
      comments.push({
        id: doc.id,
        content: data.content,
        isFromClient: data.isFromClient || false,
        createdAt: data.createdAt,
        taskId: data.taskId,
        author: data.author || {
          id: data.authorId || 'unknown',
          name: data.authorName || null,
          email: data.authorEmail || 'unknown',
          role: data.authorRole || 'CLIENT'
        }
      })
    })

    // Trier côté JavaScript
    comments.sort((a, b) => {
      const dateA = new Date(a.createdAt).getTime()
      const dateB = new Date(b.createdAt).getTime()
      return dateA - dateB // Plus ancien en premier
    })

    console.log(`✅ ${comments.length} commentaires trouvés`)
    return NextResponse.json(comments)
  } catch (error) {
    console.error("❌ Erreur lors de la récupération des commentaires:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

// POST - Ajouter un commentaire à une tâche
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const resolvedParams = await params
    const taskId = resolvedParams.id
    const { content } = await request.json()

    console.log(`💬 POST comment pour la tâche ${taskId}:`, content)

    if (!content || typeof content !== "string" || content.trim().length === 0) {
      return NextResponse.json(
        { message: "Le contenu du commentaire est requis" },
        { status: 400 }
      )
    }

    // Vérifier que la tâche existe
    const taskRef = doc(db, "tasks", taskId)
    const taskSnap = await getDoc(taskRef)

    if (!taskSnap.exists()) {
      return NextResponse.json(
        { message: "Tâche non trouvée" },
        { status: 404 }
      )
    }

    // Pour l'instant, utiliser un utilisateur par défaut
    // TODO: Récupérer l'utilisateur authentifié
    const defaultAuthor = {
      id: "admin-user",
      name: "Administrateur",
      email: "admin@example.com",
      role: "ADMIN"
    }

    // Créer le commentaire
    const newComment = {
      taskId,
      content: content.trim(),
      isFromClient: false, // Par défaut admin
      createdAt: new Date().toISOString(),
      author: defaultAuthor,
      // Champs de compatibilité
      authorId: defaultAuthor.id,
      authorName: defaultAuthor.name,
      authorEmail: defaultAuthor.email,
      authorRole: defaultAuthor.role
    }

    const commentsRef = collection(db, "taskComments")
    const docRef = await addDoc(commentsRef, newComment)

    const createdComment: TaskComment = {
      id: docRef.id,
      ...newComment
    }

    console.log(`✅ Commentaire créé avec l'ID: ${docRef.id}`)
    return NextResponse.json(createdComment, { status: 201 })
  } catch (error) {
    console.error("❌ Erreur lors de la création du commentaire:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
