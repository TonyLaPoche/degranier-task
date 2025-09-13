import { NextRequest, NextResponse } from "next/server"
import { collection, getDocs, addDoc, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

interface SocialMedia {
  id: string
  platform: string
  url: string
  isActive: boolean
  createdAt: string
}

export async function GET() {
  try {
    const socialMediaRef = collection(db, "social-media")
    const q = query(socialMediaRef, orderBy("platform", "asc"))
    const snapshot = await getDocs(q)

    const socialMedia: SocialMedia[] = []
    snapshot.forEach((doc) => {
      const data = doc.data()
      socialMedia.push({
        id: doc.id,
        platform: data.platform,
        url: data.url,
        isActive: data.isActive ?? true,
        createdAt: data.createdAt,
      })
    })

    return NextResponse.json(socialMedia)
  } catch (error) {
    console.error("Erreur lors de la récupération des réseaux sociaux:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const { platform, url, isActive } = await request.json()

    if (!platform || !url) {
      return NextResponse.json(
        { message: "La plateforme et l'URL sont requis" },
        { status: 400 }
      )
    }

    // Validation de l'URL
    try {
      new URL(url)
    } catch {
      return NextResponse.json(
        { message: "URL invalide" },
        { status: 400 }
      )
    }

    const socialMediaRef = collection(db, "social-media")
    const newSocialMedia = {
      platform: platform.trim(),
      url: url.trim(),
      isActive: isActive ?? true,
      createdAt: new Date().toISOString(),
    }

    const docRef = await addDoc(socialMediaRef, newSocialMedia)

    const formattedSocialMedia: SocialMedia = {
      id: docRef.id,
      ...newSocialMedia,
    }

    return NextResponse.json(formattedSocialMedia, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du réseau social:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
