import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    return NextResponse.json({
      message: "API de test fonctionne",
      timestamp: new Date().toISOString(),
      success: true
    })
  } catch (error) {
    console.error("Erreur dans /api/test:", error)
    return NextResponse.json(
      { message: "Erreur interne", error: error.message },
      { status: 500 }
    )
  }
}
