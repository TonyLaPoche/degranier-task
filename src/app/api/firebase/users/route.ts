import { NextRequest, NextResponse } from "next/server"
import { userService } from "@/services/firebaseServices"

// Route Firebase pour les utilisateurs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const role = searchParams.get("role") as 'ADMIN' | 'CLIENT' | undefined

    // Récupérer les utilisateurs depuis Firebase
    const users = await userService.getUsers(role)

    // Formater les données pour l'interface (similaire à Prisma)
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      category: null, // TODO: Implémenter les catégories
      projectCount: 0, // TODO: Compter les projets par utilisateur
      createdAt: user.createdAt,
    }))

    return NextResponse.json(formattedUsers)
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs Firebase:", error)
    return NextResponse.json(
      { message: "Erreur interne du serveur" },
      { status: 500 }
    )
  }
}
