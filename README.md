# Aurore De Granier - Espace Client

Application PWA Next.js pour la gestion des projets de la journaliste Aurore De Granier avec système de collaboration client.

## Fonctionnalités

- 🔐 **Authentification** : Connexion avec email/mot de passe ou Google OAuth
- 👨‍💼 **Dashboard Admin** : Gestion complète des projets et clients
- 👥 **Dashboard Client** : Vue personnalisée des projets assignés
- 📱 **Progressive Web App** : Installation sur mobile et desktop
- 🎨 **Interface moderne** : Design responsive avec Tailwind CSS
- 📊 **Gestion des projets** : Système de projets avec assignation multi-clients
- 💬 **Système de commentaires** : Discussion sur les projets en cours
- 📞 **Contact intégré** : Horaires et réseaux sociaux
- 📋 **Historique complet** : Traçabilité de toutes les modifications

## Installation

1. **Cloner le projet**
   ```bash
   git clone <repository-url>
   cd degranier-task
   ```

2. **Installer les dépendances**
   ```bash
   npm install
   ```

3. **Configuration de la base de données**
   ```bash
   # Générer le client Prisma
   npm run db:generate

   # Créer et peupler la base de données
   npm run db:reset
   ```

4. **Configuration des variables d'environnement**

   Créer un fichier `.env.local` avec :
   ```env
   DATABASE_URL="file:./dev.db"
   NEXTAUTH_URL="http://localhost:3000"
   NEXTAUTH_SECRET="votre-secret-super-securise"
   GOOGLE_CLIENT_ID="votre-google-client-id"
   GOOGLE_CLIENT_SECRET="votre-google-client-secret"
   ```

5. **Démarrer l'application**
   ```bash
   npm run dev
   ```

## Comptes de test

Après l'exécution de `npm run db:reset`, les comptes suivants sont disponibles :

### Administrateur
- **Email** : `aurore@degranier.fr`
- **Mot de passe** : `admin123`
- **Rôle** : Administrateur (accès complet)

### Clients de test
- **Email** : `marie@example.com`
- **Mot de passe** : `client123`
- **Email** : `jean@example.com`
- **Mot de passe** : `client123`

## Structure du projet

```
src/
├── app/                    # Pages Next.js (App Router)
│   ├── admin/dashboard/    # Dashboard administrateur
│   ├── client/dashboard/   # Dashboard client
│   ├── auth/               # Pages d'authentification
│   └── api/                # API routes
├── components/             # Composants réutilisables
│   ├── ui/                 # Composants UI (shadcn/ui)
│   └── providers.tsx       # Providers React
├── lib/                    # Utilitaires
│   ├── auth.ts            # Configuration NextAuth
│   ├── db.ts              # Client Prisma
│   └── seed.ts            # Script de seeding
└── types/                  # Types TypeScript
```

## Technologies utilisées

- **Next.js 15** - Framework React
- **TypeScript** - Typage statique
- **Tailwind CSS** - Framework CSS
- **Prisma** - ORM de base de données
- **SQLite** - Base de données (facilement remplaçable par PostgreSQL)
- **NextAuth.js** - Authentification
- **shadcn/ui** - Composants UI
- **Lucide React** - Icônes
- **@ducanh2912/next-pwa** - Support PWA

## API Routes

### Authentification
- `POST /api/auth/signup` - Inscription d'un nouveau client
- `GET/POST /api/auth/[...nextauth]` - Gestion NextAuth

### Projets
- `GET /api/tasks` - Récupérer les projets (filtrées par rôle)
- `POST /api/tasks` - Créer un nouveau projet (admin uniquement)
- `PUT /api/tasks/[id]` - Modifier un projet (admin uniquement)
- `DELETE /api/tasks/[id]` - Supprimer un projet (admin uniquement)

### Commentaires
- `GET /api/tasks/[id]/comments` - Récupérer les commentaires d'un projet
- `POST /api/tasks/[id]/comments` - Ajouter un commentaire à un projet

### Contact
- `GET /api/contact` - Récupérer horaires et réseaux sociaux

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
npm run db:generate  # Générer le client Prisma
npm run db:push      # Appliquer le schéma Prisma
npm run db:seed      # Peupler la base de données
npm run db:reset     # Reset complet de la base de données
```

### Base de données

Le projet utilise SQLite par défaut pour la simplicité. Pour la production, modifier le `DATABASE_URL` dans le fichier `.env.local` pour pointer vers PostgreSQL.

## Déploiement

1. **Build de production**
   ```bash
   npm run build
   ```

2. **Configuration des variables d'environnement**
   - Définir `DATABASE_URL` pour la base de données de production
   - Configurer `NEXTAUTH_SECRET` avec une valeur sécurisée
   - Configurer les credentials Google OAuth

3. **Déploiement**
   L'application peut être déployée sur :
   - Vercel
   - Netlify
   - Railway
   - Heroku
   - VPS personnalisé

## Sécurité

- **Hash des mots de passe** : bcrypt avec 12 rounds
- **Sessions sécurisées** : NextAuth.js avec JWT
- **Validation des entrées** : Validation côté serveur
- **Protection CSRF** : Intégrée dans NextAuth
- **Rate limiting** : À implémenter selon les besoins

## Personnalisation

### Thème
Modifier les couleurs dans `tailwind.config.js` et les classes CSS.

### Fonctionnalités
- Ajouter des statuts de tâches personnalisés
- Implémenter des notifications
- Ajouter des pièces jointes aux tâches
- Intégrer un système de messagerie

## Support

Pour toute question ou problème, contacter l'équipe de développement.