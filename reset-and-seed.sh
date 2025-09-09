#!/bin/bash

echo "🧹 Nettoyage et réinitialisation de la base de données..."
echo ""

# Nettoyer la base de données
echo "1️⃣ Nettoyage des données existantes..."
npx tsx src/lib/reset-database.ts

if [ $? -eq 0 ]; then
    echo ""
    echo "2️⃣ Initialisation avec les données de production..."
    npx tsx src/lib/seed-production.ts

    if [ $? -eq 0 ]; then
        echo ""
        echo "✅ Base de données réinitialisée avec succès !"
        echo ""
        echo "🔐 Informations de connexion :"
        echo "   Email: aurore@degranier.fr"
        echo "   Mot de passe: admin123"
        echo ""
        echo "🌐 Application disponible sur : http://localhost:3000"
    else
        echo "❌ Erreur lors de l'initialisation"
        exit 1
    fi
else
    echo "❌ Erreur lors du nettoyage"
    exit 1
fi
