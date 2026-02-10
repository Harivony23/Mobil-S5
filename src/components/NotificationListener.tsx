import React, { useEffect, useRef } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { showLocalNotification } from '../services/notificationService';

const NotificationListener: React.FC = () => {
  const prevStatuses = useRef<{[key: string]: string}>({});

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (user) {
        // Surveiller toutes les voitures de l'utilisateur
        const carsQuery = query(
          collection(db, 'cars'),
          where('ownerId', '==', user.uid)
        );

        const unsubscribeCars = onSnapshot(carsQuery, (snapshot) => {
          snapshot.docChanges().forEach((change) => {
            if (change.type === 'modified') {
              const carId = change.doc.id;
              const data = change.doc.data();
              const oldStatus = prevStatuses.current[carId];
              
              // Déclencher si le statut passe à 'ready'
              if (oldStatus && oldStatus !== 'ready' && data.status === 'ready') {
                showLocalNotification(
                  '🔧 Réparation terminée !',
                  `Votre ${data.model || 'voiture'} est prête à être récupérée.`
                );
              }
              
              // Mettre à jour la mémoire du statut
              prevStatuses.current[carId] = data.status;
            } else if (change.type === 'added') {
              // Initialiser la mémoire pour les nouvelles voitures
              prevStatuses.current[change.doc.id] = change.doc.data().status;
            }
          });
        });

        return () => unsubscribeCars();
      }
    });

    return () => unsubscribeAuth();
  }, []);

  return null; // Ce composant ne dessine rien, il écoute juste
};

export default NotificationListener;
