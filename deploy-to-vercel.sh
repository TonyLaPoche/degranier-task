#!/bin/bash

echo "🚀 Déploiement vers Vercel avec migration Prisma"

# 1. Créer la migration pour PostgreSQL
echo "📝 Création de la migration Prisma..."
npx prisma migrate dev --name production-deployment

# 2. Générer le client Prisma
echo "⚙️ Génération du client Prisma..."
npx prisma generate

# 3. Commiter les changements
echo "💾 Commit des changements..."
git add .
git commit -m "feat: Migration vers production avec checklists

- Migration Prisma pour PostgreSQL
- Mise à jour du schéma pour production
- Client Prisma régénéré"

# 4. Push vers GitHub
echo "⬆️ Push vers GitHub..."
git push origin main

echo "✅ Déploiement terminé !"
echo "🔗 Vérifiez le déploiement sur https://vercel.com"
echo "📊 Les migrations seront appliquées automatiquement"
