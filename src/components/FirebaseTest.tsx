'use client'

import { useAuth } from '@/hooks/useAuth'
import { useFirebaseAuth } from '@/hooks/useFirebaseAuth'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function FirebaseTest() {
  const { user, loading, signOut } = useAuth()
  const { isAuthenticated } = useFirebaseAuth()

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <Card className="w-full max-w-lg mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔄 Migration Firebase Terminée
        </CardTitle>
        <CardDescription>
          Authentification Firebase opérationnelle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <strong>Firebase:</strong>
            <span className={`ml-2 ${isAuthenticated ? 'text-green-600' : 'text-red-600'}`}>
              {isAuthenticated ? '✅ Connecté' : '❌ Déconnecté'}
            </span>
          </div>
          <div>
            <strong>Auth:</strong>
            <span className={`ml-2 ${user ? 'text-green-600' : 'text-red-600'}`}>
              {user ? '✅ Connecté' : '❌ Non connecté'}
            </span>
          </div>
        </div>

        {user ? (
          <div className="space-y-3 p-4 bg-green-50 rounded-lg">
            <h3 className="font-semibold text-green-800">👤 Utilisateur connecté</h3>
            <div className="space-y-1 text-sm">
              <div><strong>Nom:</strong> {user.displayName || 'Non défini'}</div>
              <div><strong>Email:</strong> {user.email}</div>
              <div><strong>Rôle:</strong> <span className="capitalize">{user.role}</span></div>
              <div><strong>Profil:</strong> {user.profileComplete ? 'Complet ✅' : 'Incomplet ⚠️'}</div>
            </div>
            <Button onClick={signOut} variant="outline" size="sm">
              Se déconnecter
            </Button>
          </div>
        ) : (
          <div className="space-y-3 p-4 bg-blue-50 rounded-lg">
            <h3 className="font-semibold text-blue-800">🔐 Connexion requise</h3>
            <p className="text-sm text-blue-600">
              Testez le nouveau système d&apos;authentification Firebase
            </p>
            <div className="flex gap-2">
              <Button asChild size="sm">
                <a href="/auth/signin">Se connecter</a>
              </Button>
              <Button asChild variant="outline" size="sm">
                <a href="/auth/signup">S&apos;inscrire</a>
              </Button>
            </div>
          </div>
        )}

        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-semibold text-gray-800 mb-2">🎯 Prochaines étapes:</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• Étape 4: Migrer les API routes vers Firebase</li>
            <li>• Étape 5: Mettre à jour les composants</li>
            <li>• Étape 6: Tests et validation</li>
            <li>• Étape 7: Nettoyage final</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
