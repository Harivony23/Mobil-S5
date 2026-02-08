/**
 * Firebase Cloud Function pour envoyer automatiquement des notifications
 * quand une voiture passe au statut "ready"
 * 
 * Installation :
 * 1. npm install -g firebase-tools
 * 2. firebase login
 * 3. firebase init functions
 * 4. Copiez ce code dans functions/index.js
 * 5. firebase deploy --only functions
 */

const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

const db = admin.firestore();

/**
 * Envoie une notification quand le statut d'une voiture change à "ready"
 */
exports.sendRepairCompleteNotification = functions.firestore
  .document('cars/{carId}')
  .onUpdate(async (change, context) => {
    const newData = change.after.data();
    const oldData = change.before.data();
    const carId = context.params.carId;

    // Vérifier si le statut vient de passer à "ready"
    if (newData.status === 'ready' && oldData.status !== 'ready') {
      console.log(`Car ${carId} is now ready!`);

      try {
        const ownerId = newData.ownerId;
        const model = newData.model || 'Votre voiture';

        // Récupérer le token FCM du propriétaire
        const userDoc = await db.collection('users').doc(ownerId).get();
        
        if (!userDoc.exists) {
          console.log('User not found:', ownerId);
          return null;
        }

        const fcmToken = userDoc.data().fcmToken;

        if (!fcmToken) {
          console.log('No FCM token found for user:', ownerId);
          return null;
        }

        // Préparer le message de notification
        const message = {
          notification: {
            title: '🔧 Réparation terminée !',
            body: `Votre ${model} est prête à être récupérée. Passez au paiement.`,
            icon: '/favicon.png',
          },
          data: {
            carId: carId,
            action: 'repair_complete',
            click_action: `/payment/${carId}`
          },
          token: fcmToken
        };

        // Envoyer la notification
        const response = await admin.messaging().send(message);
        console.log('Successfully sent notification:', response);
        
        return response;
      } catch (error) {
        console.error('Error sending notification:', error);
        return null;
      }
    }

    return null;
  });

/**
 * Envoie une notification de bienvenue quand un nouvel utilisateur s'inscrit
 */
exports.sendWelcomeNotification = functions.firestore
  .document('users/{userId}')
  .onCreate(async (snapshot, context) => {
    const userData = snapshot.data();
    const userId = context.params.userId;
    const fcmToken = userData.fcmToken;

    if (!fcmToken) {
      console.log('No FCM token provided');
      return null;
    }

    const message = {
      notification: {
        title: '👋 Bienvenue au Garage S5 !',
        body: 'Nous sommes ravis de vous accueillir. Décrivez votre première panne pour commencer.',
        icon: '/favicon.png',
      },
      token: fcmToken
    };

    try {
      const response = await admin.messaging().send(message);
      console.log('Welcome notification sent to user:', userId);
      return response;
    } catch (error) {
      console.error('Error sending welcome notification:', error);
      return null;
    }
  });

/**
 * Fonction HTTP pour envoyer une notification manuelle
 * Utile pour tester ou pour envoyer depuis votre backend Laravel
 * 
 * Utilisation :
 * POST https://YOUR_REGION-YOUR_PROJECT.cloudfunctions.net/sendManualNotification
 * Body: {
 *   "userId": "user-uid-here",
 *   "title": "Titre de la notification",
 *   "body": "Corps de la notification"
 * }
 */
exports.sendManualNotification = functions.https.onRequest(async (req, res) => {
  // Vérifier la méthode HTTP
  if (req.method !== 'POST') {
    return res.status(405).send('Method Not Allowed');
  }

  const { userId, title, body } = req.body;

  if (!userId || !title || !body) {
    return res.status(400).send('Missing required fields: userId, title, body');
  }

  try {
    // Récupérer le token FCM de l'utilisateur
    const userDoc = await db.collection('users').doc(userId).get();
    
    if (!userDoc.exists) {
      return res.status(404).send('User not found');
    }

    const fcmToken = userDoc.data().fcmToken;

    if (!fcmToken) {
      return res.status(404).send('FCM token not found for user');
    }

    const message = {
      notification: {
        title: title,
        body: body,
        icon: '/favicon.png',
      },
      token: fcmToken
    };

    const response = await admin.messaging().send(message);
    
    return res.status(200).json({
      success: true,
      messageId: response
    });
  } catch (error) {
    console.error('Error sending notification:', error);
    return res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * Envoie une notification quand une nouvelle voiture est ajoutée
 * (notification pour l'admin du garage via le jeu)
 */
exports.notifyNewCarAdded = functions.firestore
  .document('cars/{carId}')
  .onCreate(async (snapshot, context) => {
    const car = snapshot.data();
    const carId = context.params.carId;

    console.log('New car added:', carId, car);

    // Ici, vous pouvez envoyer une notification aux admins/mécaniciens
    // Pour l'instant, on log juste l'événement
    // Vous pouvez étendre cette fonction pour notifier le jeu Godot
    
    return null;
  });
