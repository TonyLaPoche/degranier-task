# 6️⃣ Tests et Déploiement

## Objectif

Tester la migration complète et déployer sur Vercel avec Firebase.

## 🧪 Tests Locaux

### 1. Tester l'authentification

```bash
# Démarrer le serveur
npm run dev
```

**Tests à effectuer :**
- ✅ **Inscription** : Créer un compte avec email/mot de passe
- ✅ **Connexion** : Se connecter avec les identifiants
- ✅ **Google OAuth** : Tester la connexion Google
- ✅ **Rôles** : Vérifier admin vs client
- ✅ **Protection** : Accès aux routes protégées

### 2. Tester les fonctionnalités

#### Pour Admin :
- ✅ **Créer une tâche** avec checklists
- ✅ **Modifier une tâche**
- ✅ **Ajouter/modifier/supprimer** des checklists
- ✅ **Gérer les utilisateurs**
- ✅ **Voir toutes les tâches**

#### Pour Client :
- ✅ **Voir ses tâches** assignées
- ✅ **Voir les checklists** en lecture seule
- ✅ **Ajouter des commentaires**
- ✅ **Voir l'historique**
- ✅ **Ne pas pouvoir modifier** les checklists

### 3. Tester les données

**Vérifier dans Firebase Console :**
- ✅ Collections créées : `users`, `tasks`, `taskChecklists`, etc.
- ✅ Données présentes et cohérentes
- ✅ Relations entre documents correctes
- ✅ Permissions de sécurité appliquées

---

## 🔧 Déploiement sur Vercel

### 1. Préparer le déploiement

**Variables d'environnement sur Vercel :**

```bash
# Firebase (obligatoire)
NEXT_PUBLIC_FIREBASE_API_KEY=votre_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=degranier-task.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=degranier-task
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=degranier-task.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=votre_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=votre_app_id

# NextAuth (optionnel, pour compatibilité)
NEXTAUTH_URL=https://degranier-task.vercel.app
NEXTAUTH_SECRET=production-secret-key
```

### 2. Configurer Firebase pour production

**Dans Firebase Console :**

1. **Firestore Database** :
   - ✅ Mode production activé
   - ✅ Règles de sécurité :
   ```javascript
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       // Règles de base pour commencer
       match /{document=**} {
         allow read, write: if true;
       }
     }
   }
   ```

2. **Authentication** :
   - ✅ Domaines autorisés : `degranier-task.vercel.app`
   - ✅ Méthodes : Email/Password + Google

### 3. Déployer sur Vercel

```bash
# Commiter les changements
git add .
git commit -m "feat: Migration complète vers Firebase

- ✅ Authentification Firebase
- ✅ Firestore Database
- ✅ Hooks et services Firebase
- ✅ Composants mis à jour
- ✅ Permissions admin/client
- ✅ Déploiement prêt"

# Pousser vers GitHub
git push origin main
```

### 4. Initialiser les données de production

Après le déploiement, accéder à :
```
https://degranier-task.vercel.app/api/init
```

**Résultat attendu :**
```json
{
  "success": true,
  "message": "Base de données initialisée avec succès",
  "users": {
    "admin": {
      "email": "aurore@degranier.fr",
      "password": "admin123"
    },
    "clients": [
      { "email": "marie@example.com", "password": "client123" },
      { "email": "jean@example.com", "password": "client123" }
    ]
  }
}
```

---

## 🔐 Règles de sécurité Firestore (Production)

**IMPORTANT :** Avant la production, renforcer les règles de sécurité.

**Créer le fichier** : `firestore.rules`

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Fonction helper pour vérifier l'authentification
    function isAuthenticated() {
      return request.auth != null;
    }

    // Fonction helper pour vérifier le rôle admin
    function isAdmin() {
      return isAuthenticated() &&
             exists(/databases/$(database)/documents/users/$(request.auth.uid)) &&
             get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == 'ADMIN';
    }

    // Fonction helper pour vérifier l'accès à une tâche
    function canAccessTask(taskId) {
      return isAdmin() ||
             (exists(/databases/$(database)/documents/tasks/$(taskId)) &&
              get(/databases/$(database)/documents/tasks/$(taskId)).data.clientIds.hasAny([request.auth.uid]));
    }

    // Règles pour les utilisateurs
    match /users/{userId} {
      allow read: if isAuthenticated();
      allow write: if request.auth.uid == userId || isAdmin();
    }

    // Règles pour les tâches
    match /tasks/{taskId} {
      allow read: if canAccessTask(taskId);
      allow write: if isAdmin();
      allow create: if isAuthenticated();
      allow update: if isAdmin() || canAccessTask(taskId);
    }

    // Règles pour les checklists
    match /taskChecklists/{checklistId} {
      allow read: if canAccessTask(resource.data.taskId);
      allow write: if isAdmin(); // Seuls les admins peuvent modifier
      allow create: if isAuthenticated();
    }

    // Règles pour les commentaires
    match /taskComments/{commentId} {
      allow read: if canAccessTask(resource.data.taskId);
      allow write: if request.auth.uid == resource.data.authorId;
      allow create: if isAuthenticated();
    }

    // Règles pour l'historique
    match /taskHistory/{historyId} {
      allow read: if canAccessTask(resource.data.taskId);
      allow write: if isAuthenticated();
    }

    // Règles pour les horaires de contact
    match /contactHours/{contactId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Règles pour les informations de contact
    match /contactInfo/{infoId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }

    // Règles pour les réseaux sociaux
    match /socialMedia/{mediaId} {
      allow read: if isAuthenticated();
      allow write: if isAdmin();
    }
  }
}
```

**Déployer les règles :**
```bash
firebase deploy --only firestore:rules
```

---

## 📊 Monitoring et Analytics

### 1. Firebase Analytics (optionnel)

```bash
# Activer Analytics dans Firebase Console
# Ajouter le script dans _app.tsx ou layout.tsx
```

### 2. Performance Monitoring

```typescript
// Dans src/lib/firebase.ts
import { getPerformance } from 'firebase/performance'

const perf = getPerformance(app)
```

### 3. Logs et débogage

**Vérifier les logs :**
- Vercel Dashboard → Functions → Logs
- Firebase Console → Firestore → Requêtes récentes
- Firebase Console → Authentication → Utilisateurs

---

## 🚀 Checklist de déploiement

- ✅ **Firebase configuré** (API keys, Firestore, Auth)
- ✅ **Variables Vercel** définies
- ✅ **Code migré** (hooks, services, composants)
- ✅ **Règles de sécurité** appliquées
- ✅ **Tests locaux** réussis
- ✅ **Données de production** initialisées
- ✅ **Authentification** testée
- ✅ **Permissions** vérifiées

---

## 🎯 Post-déploiement

### 1. Tests en production
- Tester toutes les fonctionnalités
- Vérifier les performances
- Tester sur différents appareils

### 2. Optimisations
- Activer la compression
- Configurer le cache
- Optimiser les images

### 3. Monitoring
- Surveiller les erreurs
- Analyser les performances
- Monitorer l'utilisation

---

## 🎉 Migration terminée !

Votre application est maintenant :
- ✅ **Plus simple** à maintenir
- ✅ **Plus scalable** avec Firebase
- ✅ **Plus économique** (forfait Spark gratuit)
- ✅ **Plus rapide** à développer
- ✅ **Plus sécurisée** avec Firebase Auth

**Félicitations pour la migration réussie !** 🚀

---

## 📞 Support

Si vous rencontrez des problèmes :
1. Vérifiez les logs Vercel/Firebase
2. Testez localement d'abord
3. Vérifiez les variables d'environnement
4. Consultez la documentation Firebase
