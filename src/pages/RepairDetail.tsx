import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonProgressBar,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonBadge,
  IonText,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

const RepairDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repairingIndex, setRepairingIndex] = useState<number | null>(null);
  const history = useHistory();

  useEffect(() => {
    const carRef = doc(db, 'cars', id);
    const unsubscribe = onSnapshot(carRef, (snapshot) => {
      if (snapshot.exists()) {
        setCar({ id: snapshot.id, ...snapshot.data() });
      } else {
        setCar(null);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  // Timer pour animer la progression de manière fluide (lecture seule)
  useEffect(() => {
    if (!car || !car.repairs) return;

    const interval = setInterval(() => {
      const updatedRepairs = car.repairs.map((repair: any) => {
        if (repair.status === 'in_progress' && repair.startTime) {
            // Calculer la progression réelle pour l'affichage
            const startTime = new Date(repair.startTime).getTime();
            const now = new Date().getTime();
            const durationMs = (repair.duration || 1) * 60 * 1000;
            
            let progress = (now - startTime) / durationMs;
            if (progress > 1) progress = 1;
            
            return { ...repair, progress };
        }
        return repair;
      });
      
      // Mise à jour locale pour l'animation seulement
      setCar((prev: any) => prev ? ({ ...prev, repairs: updatedRepairs }) : null);

    }, 1000);

    return () => clearInterval(interval);
  }, [car]);

  if (loading) return <IonPage><IonContent className="ion-padding ion-text-center"><IonSpinner /></IonContent></IonPage>;
  if (!car) return <IonPage><IonContent className="ion-padding">Voiture non trouvée</IonContent></IonPage>;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/repairs" />
          </IonButtons>
          <IonTitle>{car.model}</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-margin-bottom">
          <IonText color="dark">
            <h2>{car.model} - {car.licensePlate}</h2>
            <p>Statut global: <IonBadge>{car.status}</IonBadge></p>
          </IonText>
        </div>

        <IonList>
          {car.repairs.map((repair: any, index: number) => (
            <div key={index} className="ion-margin-bottom">
              <IonItem lines="none">
                <IonLabel>
                  <h3>{repair.type} ({repair.duration} min)</h3>
                  <p>
                    <IonBadge color={
                      repair.status === 'done' ? 'success' : 
                      repair.status === 'in_progress' ? 'primary' : 'medium'
                    }>
                      {repair.status === 'done' ? 'Terminé' : 
                       repair.status === 'in_progress' ? 'En cours' : 'En attente'}
                    </IonBadge>
                  </p>
                </IonLabel>
              </IonItem>
              {repair.status === 'in_progress' && (
                <IonProgressBar value={repair.progress} color="primary" />
              )}
            </div>
          ))}
        </IonList>

        {car.status === 'ready' && (
          <IonButton expand="block" color="success" onClick={() => history.push(`/payment/${id}`)}>
            Passer au paiement
          </IonButton>
        )}
      </IonContent>
    </IonPage>
  );
};

export default RepairDetail;

