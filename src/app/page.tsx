"use client"

import { useState } from "react"
import FirebaseTest from "@/components/FirebaseTest"

export default function Home() {
  const [showFirebaseTest, setShowFirebaseTest] = useState(true)

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 Migration Firebase
          </h1>
          <p className="text-xl text-gray-600 mb-8">
            Degranier Task - Nouvelle version avec Firebase
          </p>

          <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
            <h2 className="text-2xl font-semibold mb-4">📋 État de la migration</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left">
              <div className="space-y-3">
                <h3 className="font-semibold text-green-600">✅ Terminé</h3>
                <ul className="text-sm space-y-1">
                  <li>• Installation Firebase SDK</li>
                  <li>• Configuration de base</li>
                  <li>• Composant de test créé</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold text-blue-600">🔄 À faire</h3>
                <ul className="text-sm space-y-1">
                  <li>✅ Configurer Firebase Console</li>
                  <li>• Migrer l&apos;authentification</li>
                  <li>• Migrer la base de données</li>
                  <li>• Tester les fonctionnalités</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Test Firebase */}
          <div className="mb-8">
            <button
              onClick={() => setShowFirebaseTest(!showFirebaseTest)}
              className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors mb-4"
            >
              {showFirebaseTest ? 'Masquer' : 'Afficher'} Test Firebase
            </button>

            {showFirebaseTest && (
              <div className="max-w-md mx-auto">
                <FirebaseTest />
              </div>
            )}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-yellow-800 mb-2">
              📖 Prochaines étapes
            </h3>
            <p className="text-yellow-700 text-sm">
              ✅ Firebase configuré ! Maintenant suis le guide dans <code className="bg-yellow-100 px-2 py-1 rounded">MIGRATION_TO_FIREBASE/</code>
            </p>
            <p className="text-yellow-700 text-sm mt-2">
              Prochaine étape : <code className="bg-yellow-100 px-2 py-1 rounded">02-migrate-database.md</code>
            </p>
            <div className="mt-3 text-sm text-yellow-700">
              <p>🔥 <strong>Commande utile :</strong></p>
              <code className="bg-yellow-100 px-2 py-1 rounded block mt-1">
                node scripts/migrate-to-firebase.js
              </code>
              <p className="text-xs mt-1">(Pour migrer tes données existantes)</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
