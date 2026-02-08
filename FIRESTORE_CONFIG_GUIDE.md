# Configuration Firebase Firestore - Étapes détaillées

## ✅ Ce qui est déjà fait

- Firebase SDK installé dans le projet
- Configuration Firebase avec vos clés
- **Firestore** configuré (au lieu de Realtime Database)
- Firebase Cloud Messaging (FCM) configuré avec la clé VAPID
- Service Worker pour les notifications en arrière-plan

## 🔧 Ce que vous devez configurer dans Firebase Console

### 1. Activer Firestore

1. Allez sur [Firebase Console](https://console.firebase.google.com/u/0/project/garage-s5/overview)
2. Dans le menu, cliquez sur **Firestore Database**
3. Cliquez sur **Créer une base de données**
4. Choisissez **Mode production** (nous configurerons les règles après)
5. Sélectionnez une région (choisissez la plus proche de vos utilisateurs)
6. Cliquez sur **Activer**

### 2. Règles de sécurité Firestore

Allez dans **Firestore Database** → **Règles** et utilisez ces règles :

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Règles pour les utilisateurs
    match /users/{userId} {
      // Un utilisateur peut lire et écrire ses propres données
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Règles pour les voitures
    match /cars/{carId} {
      // Tout le monde peut lire (pour le jeu et l'app web)
      allow read: if true;

      // Seuls les utilisateurs authentifiés peuvent créer
      allow create: if request.auth != null;

      // Seul le propriétaire ou un admin peut modifier
      allow update: if request.auth != null &&
        (resource.data.ownerId == request.auth.uid ||
         exists(/databases/$(database)/documents/admins/$(request.auth.uid)));

      // Seul le propriétaire peut supprimer
      allow delete: if request.auth != null &&
        resource.data.ownerId == request.auth.uid;
    }

    // Collection des admins (optionnel)
    match /admins/{adminId} {
      allow read: if request.auth != null;
      allow write: if false; // Géré manuellement
    }
  }
}
```

**Explication :**

- Les utilisateurs peuvent lire/écrire uniquement leurs propres données
- Les voitures sont lisibles par tous (pour le jeu et l'app web)
- Seuls les utilisateurs authentifiés peuvent créer/modifier des voitures
- Le propriétaire a tous les droits sur sa voiture

### 3. Activer l'authentification Email/Password

1. Allez dans **Authentication** → **Sign-in method**
2. Activez **Email/Password**
3. Cliquez sur **Enregistrer**

### 4. Configuration Cloud Messaging (déjà fait ✅)

Vous avez déjà :

- ✅ Généré la clé VAPID
- ✅ Activé l'API Firebase Cloud Messaging

### 5. (Optionnel) Déployer les Cloud Functions

Si vous voulez des notifications automatiques :

```bash
# Installer Firebase CLI
npm install -g firebase-tools

# Se connecter à Firebase
firebase login

# Initialiser les functions dans votre projet
firebase init functions

# Sélectionnez :
# - Use an existing project → garage-s5
# - Language → JavaScript
# - ESLint → Yes
# - Install dependencies → Yes

# Copiez le contenu de firebase-functions-example.js dans functions/index.js

# Installer les dépendances
cd functions
npm install firebase-admin firebase-functions

# Déployer
firebase deploy --only functions
```

## 📊 Structure de la base de données Firestore

```
garage-s5 (Firestore)
│
├── users (collection)
│   └── {userId} (document)
│       ├── email: "user@example.com"
│       ├── fcmToken: "eXaMpLeToKeN..."
│       ├── createdAt: "2026-02-04T..."
│       └── updatedAt: "2026-02-04T..."
│
└── cars (collection)
    └── {carId} (document auto-généré)
        ├── ownerId: "userId"
        ├── ownerEmail: "user@example.com"
        ├── model: "Toyota Corolla"
        ├── licensePlate: "AB-123-CD"
        ├── status: "pending" | "repairing" | "ready" | "paid"
        ├── createdAt: "2026-02-04T..."
        ├── paidAt: "2026-02-04T..." (si payé)
        └── repairs: [
            {
              type: "Frein",
              status: "pending" | "in_progress" | "done",
              progress: 0.5
            },
            ...
          ]
```

## 🧪 Test de l'implémentation

### Test 1 : Vérifier l'enregistrement du token

1. Lancez l'app mobile : `npm run dev`
2. Ouvrez la console du navigateur (F12)
3. Connectez-vous avec un compte
4. Acceptez les notifications
5. Vous devriez voir : `FCM token saved for user: [uid]`
6. Vérifiez dans Firebase Console → Firestore → `users/{uid}` → `fcmToken`

### Test 2 : Envoyer une notification test

#### Option A : Depuis Firebase Console

1. **Cloud Messaging** → **Send your first message**
2. Titre : "Test notification"
3. Texte : "Ceci est un test"
4. **Next** → **All users** → **Publish**

#### Option B : Avec curl (HTTP API)

```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "USER_FCM_TOKEN",
    "notification": {
      "title": "Test notification",
      "body": "Ceci est un test depuis curl"
    }
  }'
```

### Test 3 : Notification automatique de réparation

1. Ajoutez une voiture dans l'app mobile
2. Dans Firebase Console, allez dans Firestore
3. Trouvez votre voiture dans `cars/{carId}`
4. Changez manuellement `status` de `pending` à `ready`
5. Si les Cloud Functions sont déployées, vous recevrez une notification !

## 🔄 Différences entre Firestore et Realtime Database

### Avantages de Firestore :

✅ **Requêtes plus puissantes** : Filtres multiples, tri, pagination
✅ **Meilleure scalabilité** : Conçu pour des millions d'utilisateurs
✅ **Transactions ACID** : Garanties de cohérence des données
✅ **Indexation automatique** : Performances optimales
✅ **Offline support** : Meilleure gestion hors ligne

### Structure des données :

- **Realtime Database** : Structure JSON hiérarchique
- **Firestore** : Collections et documents (NoSQL)

### Requêtes :

```javascript
// Realtime Database
const carsRef = query(
  ref(db, "cars"),
  orderByChild("ownerId"),
  equalTo(userId),
);

// Firestore (plus puissant)
const carsQuery = query(
  collection(db, "cars"),
  where("ownerId", "==", userId),
  where("status", "==", "pending"), // Filtres multiples !
  orderBy("createdAt", "desc"),
);
```

## 🔐 Sécurité

### Règles de sécurité recommandées pour production

Déjà fournies ci-dessus ! Les règles Firestore sont plus expressives et puissantes que celles de Realtime Database.

### Bonnes pratiques :

1. **Toujours valider côté serveur** : Utilisez Cloud Functions pour la logique critique
2. **Limiter les lectures** : Utilisez des index et des requêtes optimisées
3. **Protéger les données sensibles** : Ne stockez jamais de mots de passe en clair
4. **Utiliser des transactions** : Pour les opérations critiques (paiements, etc.)

## 🚀 Déploiement en production

### Pour l'application mobile (Ionic)

```bash
# Build de production
npm run build

# Pour Android
npx cap add android
npx cap sync
npx cap open android

# Pour iOS
npx cap add ios
npx cap sync
npx cap open ios
```

### Configuration HTTPS (obligatoire pour les notifications)

Les notifications Push nécessitent HTTPS. Options :

1. Déployer sur Firebase Hosting (gratuit)
2. Utiliser Netlify/Vercel
3. Configurer un certificat SSL sur votre serveur

## 📞 Support et Debugging

### Logs utiles

```javascript
// Dans la console du navigateur
// Vérifier si le Service Worker est enregistré
navigator.serviceWorker.getRegistrations().then((registrations) => {
  console.log("Service Workers:", registrations);
});

// Vérifier les permissions de notification
console.log("Notification permission:", Notification.permission);

// Vérifier les données Firestore
import { collection, getDocs } from "firebase/firestore";
const querySnapshot = await getDocs(collection(db, "cars"));
querySnapshot.forEach((doc) => {
  console.log(doc.id, " => ", doc.data());
});
```

### Problèmes courants

1. **"Missing or insufficient permissions"**
   - Vérifiez les règles de sécurité Firestore
   - Assurez-vous que l'utilisateur est authentifié

2. **"Firestore not enabled"**
   - Allez dans Firebase Console et activez Firestore
   - Attendez quelques minutes pour la propagation

3. **"Index required"**
   - Firestore vous donnera un lien pour créer l'index automatiquement
   - Cliquez sur le lien dans l'erreur de la console

4. **"Notifications not received"**
   - Vérifiez que le token FCM est valide
   - Vérifiez les logs dans Firebase Console → Functions
   - Testez avec la Console Firebase d'abord

## 🎯 Prochaines étapes

1. ✅ Activer Firestore dans Firebase Console
2. ✅ Configurer les règles de sécurité
3. ⬜ Tester les notifications manuellement
4. ⬜ Déployer les Cloud Functions
5. ⬜ Intégrer avec le backend Laravel
6. ⬜ Intégrer avec le jeu Godot
7. ⬜ Tester le flux complet end-to-end

## 💡 Conseils pour le jeu Godot

Pour que le jeu Godot puisse lire/écrire dans Firestore, vous aurez besoin :

1. D'utiliser l'API REST de Firestore
2. Ou d'utiliser un plugin Godot pour Firebase
3. Ou de passer par des Cloud Functions HTTP

Exemple d'appel REST depuis Godot :

```gdscript
var http_request = HTTPRequest.new()
add_child(http_request)
http_request.request_completed.connect(_on_request_completed)

var url = "https://firestore.googleapis.com/v1/projects/garage-s5/databases/(default)/documents/cars"
http_request.request(url)
```
