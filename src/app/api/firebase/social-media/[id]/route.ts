import { NextRequest, NextResponse } from "next/server"
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SocialMedia {
  id: string
  platform: string
  url: string
  isActive: boolean
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

    const socialMediaRef = doc(db, "social-media", id)
    const socialMediaSnap = await getDoc(socialMediaRef)

    if (!socialMediaSnap.exists()) {
      return NextResponse.json({ message: "Réseau social non trouvé" }, { status: 404 })
    }

    const data = socialMediaSnap.data()
    const socialMedia: SocialMedia = {
      id: socialMediaSnap.id,
      platform: data.platform,
      url: data.url,
      isActive: data.isActive ?? true,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
    }

    return NextResponse.json(socialMedia)
  } catch (error) {
    console.error("Erreur lors de la récupération du réseau social:", error)
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
    const { platform, url, isActive } = await request.json()

    console.log("🔥 API PUT /api/firebase/social-media/[id] appelée")
    console.log("📝 Payload reçu:", JSON.stringify({ platform, url, isActive }, null, 2))

    if (!platform || !url) {
      return NextResponse.json(
        { message: "La plateforme et l'URL sont requis" },
        { status: 400 }
      )
    }

    const socialMediaRef = doc(db, "social-media", id)
    
    // Vérifier que le réseau social existe
    const socialMediaSnap = await getDoc(socialMediaRef)
    if (!socialMediaSnap.exists()) {
      return NextResponse.json({ message: "Réseau social non trouvé" }, { status: 404 })
    }

    console.log("✅ Validation passée, mise à jour du réseau social...")

    const updatedSocialMedia = {
      platform: platform.trim(),
      url: url.trim(),
      isActive: isActive ?? true,
      updatedAt: new Date().toISOString(),
    }

    await updateDoc(socialMediaRef, updatedSocialMedia)

    const updatedData: SocialMedia = {
      id,
      ...updatedSocialMedia,
      createdAt: socialMediaSnap.data().createdAt,
    }

    console.log("✅ Réseau social mis à jour avec succès:", id)
    return NextResponse.json(updatedData)
  } catch (error) {
    console.error("❌ Erreur lors de la mise à jour du réseau social:", error)
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

    console.log("🔥 API DELETE /api/firebase/social-media/[id] appelée")
    console.log("📝 ID à supprimer:", id)

    const socialMediaRef = doc(db, "social-media", id)
    
    // Vérifier que le réseau social existe
    const socialMediaSnap = await getDoc(socialMediaRef)
    if (!socialMediaSnap.exists()) {
      console.log("❌ Réseau social non trouvé:", id)
      return NextResponse.json({ message: "Réseau social non trouvé" }, { status: 404 })
    }

    console.log("✅ Réseau social trouvé, suppression en cours...")
    await deleteDoc(socialMediaRef)

    console.log("✅ Réseau social supprimé avec succès:", id)
    return NextResponse.json({ message: "Réseau social supprimé avec succès" })
  } catch (error) {
    console.error("❌ Erreur lors de la suppression du réseau social:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
