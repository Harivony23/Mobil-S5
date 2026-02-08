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

  // Timer pour mettre à jour la progression de manière fluide
  useEffect(() => {
    if (!car || !car.repairs) return;

    const interval = setInterval(() => {
      const updatedRepairs = car.repairs.map((repair: any, index: number) => {
        if (repair.status === 'in_progress' && repair.startTime) {
            // Calculer la progression réelle
            const startTime = new Date(repair.startTime).getTime();
            const now = new Date().getTime();
            const durationMs = (repair.duration || 1) * 60 * 1000; // minutes -> ms
            
            let progress = (now - startTime) / durationMs;
            
            if (progress >= 1) {
                progress = 1;
                // Si terminée mais pas encore marquée done, on le fera
                // Note: Idéalement on éviterait de faire ça dans le rendu, mais un effect pour déclencher finish serait mieux
                // Pour simplifier l'affichage de suite:
            }
            return { ...repair, progress };
        }
        return repair;
      });

      // Vérifier si des réparations sont terminées
      updatedRepairs.forEach((repair: any, index: number) => {
         if (repair.status === 'in_progress' && repair.progress >= 1) {
             finishRepair(index);
         }
      });
      
      // Mise à jour locale pour l'animation (ne pas sauvegarder en DB à chaque tick pour éviter spam)
      // Seulement si la progression a changé visuellement
      setCar((prev: any) => prev ? ({ ...prev, repairs: updatedRepairs }) : null);

    }, 1000); // Mise à jour chaque seconde

    return () => clearInterval(interval);
  }, [car]);


  const startRepair = async (index: number) => {
    if (repairingIndex !== null) return; // Empêcher double clic ou autre réparation si on veut limiter
    
    // On met à jour Firestore avec le temps de début
    const updatedRepairs = [...car.repairs];
    updatedRepairs[index].status = 'in_progress';
    updatedRepairs[index].startTime = new Date().toISOString();
    updatedRepairs[index].progress = 0;
    
    // Optimistic update
    setCar({ ...car, repairs: updatedRepairs });
    
    try {
        await updateDoc(doc(db, 'cars', id), { repairs: updatedRepairs });
        toast.success("Réparation commencée !");
    } catch (e) {
        console.error("Error starting repair", e);
        toast.error("Erreur au démarrage");
    }
  };

  const finishRepair = async (index: number) => {
    // Vérifier si déjà fini pour éviter boucles
    if (car.repairs[index].status === 'done') return;
      
    const updatedRepairs = [...car.repairs];
    updatedRepairs[index].status = 'done';
    updatedRepairs[index].progress = 1;
    // On garde startTime pour historique si voulu, ou on peut le laisser

    const allDone = updatedRepairs.every((r: any) => r.status === 'done');
    const updates: any = {
      repairs: updatedRepairs,
    };

    if (allDone) {
      updates.status = 'ready';
      // toast.success('Toutes les réparations sont terminées !'); // Déplacé pour éviter spam si re-render
    }

    // On met à jour Firestore. Cela va déclencher le snapshot listener qui mettra à jour l'UI proprement.
    await updateDoc(doc(db, 'cars', id), updates);
    if (allDone) toast.success('Toutes les réparations sont terminées !');
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
