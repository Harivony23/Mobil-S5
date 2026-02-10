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
