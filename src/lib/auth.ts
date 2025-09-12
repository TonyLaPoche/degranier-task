// TEMPORAIRE: Configuration d'authentification mock pour permettre au serveur de démarrer
// À remplacer par la vraie configuration Firebase plus tard

export const authOptions = {
  // Configuration temporaire vide
}

// Fonction mock pour getServerSession
export async function getServerSession() {
  return {
    user: {
      id: 'temp-user-id',
      email: 'temp@example.com',
      name: 'Utilisateur Temporaire',
      role: 'ADMIN'
    }
  }
}
