# Aurore De Granier - Espace Client

Application PWA Next.js pour la gestion des projets de la journaliste Aurore De Granier avec système de collaboration client, alimentée par Firebase.

## ✨ Fonctionnalités

- 🔐 **Authentification Firebase** : Connexion sécurisée avec email/mot de passe
- 👨‍💼 **Dashboard Admin** : Gestion complète des projets et clients
- 👥 **Dashboard Client** : Vue personnalisée des projets assignés
- 📱 **Progressive Web App** : Installation sur mobile et desktop
- 🎨 **Interface moderne** : Design responsive avec Tailwind CSS et shadcn/ui
- 📊 **Gestion des projets** : Système de projets avec assignation multi-clients
- ✅ **Checklists** : Suivi détaillé des tâches avec validation admin/client
- 📞 **Contact intégré** : Horaires, vacances et réseaux sociaux
- 🗑️ **CRUD complet** : Création, lecture, mise à jour et suppression pour toutes les entités
- 🔄 **Temps réel** : Synchronisation instantanée avec Firestore

## 🚀 Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd degranier-task
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration Firebase**
   
   Créer un fichier `.env.local` avec vos clés Firebase :
   ```env
   NEXT_PUBLIC_FIREBASE_API_KEY="your-api-key"
   NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN="your-project.firebaseapp.com"
   NEXT_PUBLIC_FIREBASE_PROJECT_ID="your-project-id"
   NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET="your-project.appspot.com"
   NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID="your-sender-id"
   NEXT_PUBLIC_FIREBASE_APP_ID="your-app-id"
   ```

4. **Démarrer l'application**
   ```bash
   npm run dev
   ```

## 👤 Comptes de test

### Administrateur
- **Email** : `aurore@degranier.fr`
- **Mot de passe** : `admin123`
- **Rôle** : Administrateur (accès complet)

### Clients de test
- **Email** : `marie@example.com`
- **Mot de passe** : `client123`
- **Email** : `jean@example.com`
- **Mot de passe** : `client123`

## 📁 Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── admin/dashboard/    # Dashboard administrateur
│   ├── client/dashboard/   # Dashboard client
│   ├── auth/               # Pages d'authentification
│   └── api/firebase/       # API routes Firebase
├── components/             # Composants réutilisables
│   ├── ui/                 # Composants UI (shadcn/ui)
│   ├── admin-dashboard/    # Composants dashboard admin
│   └── providers.tsx       # Providers React
├── hooks/                  # Custom hooks
│   ├── useAuth.tsx        # Hook d'authentification Firebase
│   └── useAdminDashboard.ts # Hook dashboard admin
├── lib/                    # Utilitaires
│   ├── firebase.ts        # Configuration Firebase
│   └── firebase-admin.ts  # Firebase Admin SDK
├── services/               # Services Firebase
│   └── firebaseServices.ts # Services Firestore
└── types/                  # Types TypeScript
```

## 🛠️ Technologies utilisées

- **Next.js 15** - Framework React avec App Router
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS utilitaire
- **Firebase** - Backend-as-a-Service
  - **Firebase Auth** - Authentification
  - **Firestore** - Base de données NoSQL
- **shadcn/ui** - Composants UI modernes
- **Lucide React** - Icônes
- **@ducanh2912/next-pwa** - Support PWA

## 🔌 API Routes Firebase

### Authentification
- Gérée automatiquement par Firebase Auth

### Tâches/Projets
- `GET /api/firebase/tasks` - Récupérer les projets
- `POST /api/firebase/tasks` - Créer un projet
- `GET /api/firebase/tasks/[id]` - Récupérer un projet
- `PUT /api/firebase/tasks/[id]` - Modifier un projet
- `DELETE /api/firebase/tasks/[id]` - Supprimer un projet

### Checklists
- `GET /api/firebase/tasks/[id]/checklists` - Récupérer les checklists
- `POST /api/firebase/tasks/[id]/checklists` - Ajouter une checklist
- `PUT /api/firebase/tasks/[id]/checklists/[itemId]` - Modifier une checklist
- `DELETE /api/firebase/tasks/[id]/checklists/[itemId]` - Supprimer une checklist

### Utilisateurs
- `GET /api/firebase/users` - Récupérer les utilisateurs
- `GET /api/firebase/users/[id]` - Récupérer un utilisateur
- `PUT /api/firebase/users/[id]` - Modifier un utilisateur
- `DELETE /api/firebase/users/[id]` - Supprimer un utilisateur

### Contact & Configuration
- `GET/POST /api/firebase/contact-info` - Informations de contact
- `GET/POST /api/firebase/contact-hours` - Horaires de contact
- `GET/POST /api/firebase/vacations` - Périodes de vacances
- `GET/POST /api/firebase/social-media` - Réseaux sociaux
- `GET/POST /api/firebase/categories` - Catégories

## Configuration PWA

L'application est configurée comme PWA avec :
- Manifest personnalisé
- Service Worker pour le cache hors ligne
- Icônes d'installation
- Mode standalone

### Icônes
Remplacer les fichiers dans `/public/` :
- `icon-192x192.png` (192x192px)
- `icon-512x512.png` (512x512px)

## Développement

### Scripts disponibles
```bash
npm run dev          # Démarrer le serveur de développement
npm run build        # Build de production
npm run start        # Démarrer le serveur de production
npm run lint         # Vérification ESLint
```

### Base de données

Le projet utilise Firebase Firestore, une base de données NoSQL en temps réel. Aucune configuration de base de données locale n'est nécessaire.

## Déploiement

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Configuration des variables d'environnement**
   - Configurer les clés Firebase pour la production
   - Vérifier les règles de sécurité Firestore
   - Configurer les domaines autorisés dans Firebase Console

3. **Déploiement**
   L'application peut être déployée sur :
   - **Vercel** (recommandé pour Next.js)
   - Netlify
   - Railway
   - VPS personnalisé

## 🔒 Sécurité

- **Authentification Firebase** : Sécurité enterprise-grade
- **Règles Firestore** : Contrôle d'accès granulaire
- **Validation des entrées** : Validation côté serveur et client
- **HTTPS obligatoire** : Chiffrement de bout en bout
- **Rate limiting** : Intégré dans Firebase

## 🎨 Personnalisation

### Thème
Modifier les couleurs dans `tailwind.config.js` et les classes CSS.

### Fonctionnalités possibles
- ✅ Checklists avec validation par rôle
- ✅ Gestion des horaires et vacances
- ✅ CRUD complet sur toutes les entités
- 🔄 Notifications push (à implémenter)
- 📎 Pièces jointes aux tâches (à implémenter)
- 💬 Système de messagerie temps réel (à implémenter)

## 📞 Support

Pour toute question ou problème, contacter l'équipe de développement.

---

## 🎉 Migration terminée !

Cette application a été entièrement migrée de Prisma/SQLite vers Firebase/Firestore avec succès. Toutes les fonctionnalités sont opérationnelles et prêtes pour la production.