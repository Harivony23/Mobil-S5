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
import { ref, onValue, update } from 'firebase/database';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

const RepairDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [repairingIndex, setRepairingIndex] = useState<number | null>(null);
  const history = useHistory();

  useEffect(() => {
    const carRef = ref(db, `cars/${id}`);
    const unsubscribe = onValue(carRef, (snapshot) => {
      setCar(snapshot.val());
      setLoading(false);
    });
    return () => unsubscribe();
  }, [id]);

  const startRepair = (index: number) => {
    if (repairingIndex !== null) return;
    
    setRepairingIndex(index);
    let progress = 0;
    const interval = setInterval(async () => {
      progress += 0.1;
      if (progress >= 1) {
        clearInterval(interval);
        setRepairingIndex(null);
        await finishRepair(index);
      } else {
        // Local progress update for UI smoothness
        const updatedRepairs = [...car.repairs];
        updatedRepairs[index].progress = progress;
        updatedRepairs[index].status = 'in_progress';
        setCar({ ...car, repairs: updatedRepairs });
      }
    }, 500); // 5 seconds total for 1.0 progress (10 steps of 0.5s)
  };

  const finishRepair = async (index: number) => {
    const updatedRepairs = [...car.repairs];
    updatedRepairs[index].status = 'done';
    updatedRepairs[index].progress = 1;

    const allDone = updatedRepairs.every((r) => r.status === 'done');
    const updates: any = {
      [`cars/${id}/repairs`]: updatedRepairs,
    };

    if (allDone) {
      updates[`cars/${id}/status`] = 'ready';
      toast.success('Toutes les réparations sont terminées !');
    }

    await update(ref(db), updates);
  };

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
                  <h3>{repair.type}</h3>
                  <p>{repair.status}</p>
                </IonLabel>
                {repair.status === 'pending' && (
                  <IonButton 
                    slot="end" 
                    onClick={() => startRepair(index)}
                    disabled={repairingIndex !== null}
                  >
                    Réparer
                  </IonButton>
                )}
                {repair.status === 'done' && (
                   <IonBadge color="success" slot="end">Terminé</IonBadge>
                )}
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
