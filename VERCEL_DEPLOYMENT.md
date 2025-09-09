# Déploiement Vercel - Guide complet

## ✅ Prérequis faits :
- Repo GitHub créé : https://github.com/TonyLaPoche/degranier-task
- Code poussé sur main
- Schéma Prisma configuré

## 🚀 Étapes de déploiement :

### 1. Connexion Vercel
1. Aller sur https://vercel.com
2. Se connecter avec GitHub
3. Autoriser l'accès au repo

### 2. Import du projet
1. Cliquer "Import Project"
2. Sélectionner "degranier-task"
3. Configurer :
   - Framework : Next.js
   - Root Directory : ./ (racine)
   - Build Command : npm run build
   - Output Directory : .next

### 3. Variables d'environnement
Dans Vercel → Project Settings → Environment Variables :
```
DATABASE_URL=postgresql://...
NEXTAUTH_SECRET=votre-secret-production
NEXTAUTH_URL=https://votredomaine.vercel.app
```

### 4. Déploiement
- Cliquer "Deploy"
- Attendre la fin du build
- ✅ Application en ligne !

## 🔧 Configuration Prisma pour Vercel :
- Garder provider = "postgresql"
- DATABASE_URL depuis Vercel Postgres
