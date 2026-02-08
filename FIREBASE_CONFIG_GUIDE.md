# Configuration Firebase - Étapes détaillées

## ✅ Ce qui est déjà fait

- Firebase SDK installé dans le projet
- Configuration Firebase avec vos clés
- Firebase Cloud Messaging (FCM) configuré avec la clé VAPID
- Service Worker pour les notifications en arrière-plan

## 🔧 Ce que vous devez configurer dans Firebase Console

### 1. Règles de sécurité Realtime Database

Allez dans **Realtime Database** → **Règles** et utilisez ces règles :

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    },
    "cars": {
      ".read": true,
      ".write": "auth != null",
      "$carId": {
        ".read": true,
        ".write": "auth != null"
      }
    }
  }
}
```

**Explication :**

- Les utilisateurs peuvent lire/écrire uniquement leurs propres données
- Les voitures sont lisibles par tous (pour le jeu et l'app web)
- Seuls les utilisateurs authentifiés peuvent créer/modifier des voitures

### 2. Activer l'authentification Email/Password

1. Allez dans **Authentication** → **Sign-in method**
2. Activez **Email/Password**
3. Cliquez sur **Enregistrer**

### 3. Configuration Cloud Messaging (déjà fait ✅)

Vous avez déjà :

- ✅ Généré la clé VAPID
- ✅ Activé l'API Firebase Cloud Messaging

### 4. (Optionnel) Déployer les Cloud Functions

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

### 5. Récupérer la Server Key (pour backend Laravel/PHP)

1. Allez dans **Paramètres du projet** (⚙️)
2. Onglet **Cloud Messaging**
3. Copiez la **Clé du serveur** (Server Key)
4. Utilisez-la dans votre backend Laravel pour envoyer des notifications

## 🧪 Test de l'implémentation

### Test 1 : Vérifier l'enregistrement du token

1. Lancez l'app mobile : `npm run dev`
2. Ouvrez la console du navigateur (F12)
3. Connectez-vous avec un compte
4. Acceptez les notifications
5. Vous devriez voir : `FCM token saved for user: [uid]`
6. Vérifiez dans Firebase Console → Realtime Database → `users/{uid}/fcmToken`

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
2. Dans Firebase Console, allez dans Realtime Database
3. Trouvez votre voiture dans `cars/{carId}`
4. Changez manuellement `status` de `pending` à `ready`
5. Si les Cloud Functions sont déployées, vous recevrez une notification !

## 📱 Structure de la base de données

```
garage-s5-default-rtdb/
├── users/
│   └── {userId}/
│       ├── email: "user@example.com"
│       ├── createdAt: "2026-02-04T..."
│       └── fcmToken: "eXaMpLeToKeN..."
│
└── cars/
    └── {carId}/
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

## 🔐 Sécurité

### Règles de sécurité recommandées pour production

```json
{
  "rules": {
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid || root.child('admins').child(auth.uid).exists()",
        ".write": "$uid === auth.uid",
        "fcmToken": {
          ".write": "$uid === auth.uid"
        }
      }
    },
    "cars": {
      ".read": "auth != null",
      "$carId": {
        ".write": "auth != null && (!data.exists() || data.child('ownerId').val() === auth.uid || root.child('admins').child(auth.uid).exists())",
        "ownerId": {
          ".validate": "newData.val() === auth.uid"
        }
      }
    },
    "admins": {
      ".read": "root.child('admins').child(auth.uid).exists()",
      ".write": false
    }
  }
}
```

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
```

### Problèmes courants

1. **"Notification permission denied"**
   - L'utilisateur a refusé les notifications
   - Demandez-lui de réactiver dans les paramètres du navigateur

2. **"Service Worker not found"**
   - Vérifiez que `firebase-messaging-sw.js` est dans `/public`
   - Vérifiez que le fichier est accessible via HTTP

3. **"Token not saved"**
   - Vérifiez les règles de sécurité Firebase
   - Vérifiez que l'utilisateur est authentifié

4. **"Notifications not received"**
   - Vérifiez que le token FCM est valide
   - Vérifiez les logs dans Firebase Console → Functions
   - Testez avec la Console Firebase d'abord

## 🎯 Prochaines étapes

1. ✅ Tester les notifications manuellement
2. ⬜ Déployer les Cloud Functions
3. ⬜ Intégrer avec le backend Laravel
4. ⬜ Intégrer avec le jeu Godot
5. ⬜ Tester le flux complet end-to-end
