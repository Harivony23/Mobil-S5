# Guide d'utilisation des Notifications Push - Garage Mobile

## Configuration terminée ✅

J'ai implémenté les notifications Push avec Firebase Cloud Messaging (FCM). Voici ce qui a été fait :

### Fichiers créés/modifiés :

1. **firebase.ts** - Ajout de Firebase Messaging
2. **services/notificationService.ts** - Service de gestion des notifications
3. **public/firebase-messaging-sw.js** - Service Worker pour les notifications en arrière-plan
4. **App.tsx** - Configuration des notifications au premier plan
5. **pages/Home.tsx** - Demande de permission et enregistrement du token FCM

## Comment ça fonctionne ?

### 1. Enregistrement du token

Quand un utilisateur se connecte :

- L'app demande la permission d'envoyer des notifications
- Si accepté, un token FCM unique est généré
- Ce token est sauvegardé dans Firebase : `users/{uid}/fcmToken`

### 2. Types de notifications

#### Notifications au premier plan (app ouverte)

- Gérées par `setupForegroundNotifications()` dans App.tsx
- Affichées comme des toasts via `react-hot-toast`

#### Notifications en arrière-plan (app fermée)

- Gérées par le Service Worker `firebase-messaging-sw.js`
- Affichées comme notifications système natives

## Comment envoyer des notifications ?

### Option 1 : Depuis la Console Firebase (Test rapide)

1. Allez sur [Firebase Console](https://console.firebase.google.com/)
2. Sélectionnez votre projet "garage-s5"
3. Dans le menu, allez à **Engagement** → **Cloud Messaging**
4. Cliquez sur **Send your first message**
5. Remplissez :
   - **Notification title** : "Réparation terminée"
   - **Notification text** : "Votre voiture est prête !"
6. Cliquez **Next**
7. Sélectionnez **Target** → **User segment** → **All users**
8. Envoyez !

### Option 2 : Depuis votre Backend (Laravel/Node.js)

#### Avec Node.js (Firebase Admin SDK)

```javascript
const admin = require("firebase-admin");

// Initialiser Firebase Admin
const serviceAccount = require("./path/to/serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://garage-s5-default-rtdb.firebaseio.com",
});

// Fonction pour envoyer une notification
async function sendNotificationToUser(userId, title, body) {
  // Récupérer le token FCM de l'utilisateur
  const tokenSnapshot = await admin
    .database()
    .ref(`users/${userId}/fcmToken`)
    .once("value");

  const fcmToken = tokenSnapshot.val();

  if (!fcmToken) {
    console.log("No FCM token for user:", userId);
    return;
  }

  const message = {
    notification: {
      title: title,
      body: body,
    },
    token: fcmToken,
  };

  try {
    const response = await admin.messaging().send(message);
    console.log("Successfully sent message:", response);
  } catch (error) {
    console.log("Error sending message:", error);
  }
}

// Exemple d'utilisation
sendNotificationToUser(
  "user-uid-here",
  "Réparation terminée",
  "Votre voiture est prête à être récupérée !",
);
```

#### Avec Laravel (HTTP API)

```php
<?php

use Illuminate\Support\Facades\Http;

class FirebaseNotificationService
{
    private $serverKey = 'YOUR_FIREBASE_SERVER_KEY'; // À récupérer dans Firebase Console

    public function sendNotification($fcmToken, $title, $body)
    {
        $response = Http::withHeaders([
            'Authorization' => 'key=' . $this->serverKey,
            'Content-Type' => 'application/json',
        ])->post('https://fcm.googleapis.com/fcm/send', [
            'to' => $fcmToken,
            'notification' => [
                'title' => $title,
                'body' => $body,
                'icon' => '/favicon.png',
                'click_action' => 'https://your-app-url.com'
            ]
        ]);

        return $response->json();
    }
}

// Utilisation
$service = new FirebaseNotificationService();
$service->sendNotification(
    $user->fcm_token,
    'Réparation terminée',
    'Votre voiture est prête !'
);
```

### Option 3 : Automatique depuis le Jeu Godot

Quand une réparation est terminée dans le jeu, vous pouvez déclencher une Cloud Function Firebase :

```javascript
// Firebase Cloud Function (functions/index.js)
const functions = require("firebase-functions");
const admin = require("firebase-admin");
admin.initializeApp();

exports.sendRepairCompleteNotification = functions.database
  .ref("/cars/{carId}/status")
  .onUpdate(async (change, context) => {
    const newStatus = change.after.val();
    const carId = context.params.carId;

    if (newStatus === "ready") {
      // Récupérer les infos de la voiture
      const carSnapshot = await admin
        .database()
        .ref(`/cars/${carId}`)
        .once("value");

      const car = carSnapshot.val();
      const ownerId = car.ownerId;

      // Récupérer le token FCM du propriétaire
      const tokenSnapshot = await admin
        .database()
        .ref(`/users/${ownerId}/fcmToken`)
        .once("value");

      const fcmToken = tokenSnapshot.val();

      if (fcmToken) {
        const message = {
          notification: {
            title: "🔧 Réparation terminée !",
            body: `Votre ${car.model} est prête à être récupérée.`,
          },
          token: fcmToken,
        };

        await admin.messaging().send(message);
        console.log("Notification sent for car:", carId);
      }
    }
  });
```

## Récupérer votre Server Key (pour Laravel/HTTP)

1. Allez dans Firebase Console
2. **Paramètres du projet** (⚙️) → **Cloud Messaging**
3. Copiez la **Clé du serveur** (Server Key)

## Test de l'implémentation

1. Lancez l'application mobile : `npm run dev`
2. Connectez-vous avec un compte
3. Acceptez les notifications quand demandé
4. Vérifiez dans la console que le token FCM est bien sauvegardé
5. Envoyez une notification test depuis la Console Firebase
6. Vous devriez recevoir la notification !

## Déploiement

Pour que les notifications fonctionnent en production :

1. Assurez-vous que le Service Worker est accessible à `/firebase-messaging-sw.js`
2. Votre site doit être en HTTPS
3. Les utilisateurs doivent accepter les notifications

## Troubleshooting

### Les notifications ne s'affichent pas ?

- Vérifiez que l'utilisateur a accepté les permissions
- Vérifiez dans la console du navigateur s'il y a des erreurs
- Assurez-vous que le Service Worker est bien enregistré

### Le token n'est pas sauvegardé ?

- Vérifiez les règles de sécurité Firebase Realtime Database
- Assurez-vous que l'utilisateur est bien authentifié

### Notifications en double ?

- C'est normal : une notification au premier plan (toast) + une notification système
- Vous pouvez désactiver l'une ou l'autre selon vos préférences
