import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardTitle,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { toast } from 'react-hot-toast';

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
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

  const handlePayment = async () => {
    try {
      await updateDoc(doc(db, 'cars', id), {
        status: 'paid',
        paidAt: new Date().toISOString(),
      });
      toast.success('Paiement effectué avec succès !');
      history.push('/home');
    } catch (error: any) {
      toast.error('Erreur lors du paiement: ' + error.message);
    }
  };

  if (loading) return <IonPage><IonContent className="ion-padding ion-text-center"><IonSpinner /></IonContent></IonPage>;
  if (!car) return <IonPage><IonContent className="ion-padding">Voiture non trouvée</IonContent></IonPage>;

  const pricePerRepair = 50; 
  const totalPrice = car.repairs.length * pricePerRepair;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/repair/${id}`} />
          </IonButtons>
          <IonTitle>Paiement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <IonCard>
          <IonCardHeader>
            <IonCardTitle>Récapitulatif - {car.model}</IonCardTitle>
          </IonCardHeader>
          <IonCardContent>
            <IonText color="dark">
              <p>Plaque: {car.licensePlate}</p>
              <p>Réparations effectuées: {car.repairs.length}</p>
              <hr />
              <h2 className="ion-text-right">Total: {totalPrice} €</h2>
            </IonText>
          </IonCardContent>
        </IonCard>

        <IonButton expand="block" color="success" className="ion-margin-top" onClick={handlePayment}>
          Payer maintenant
        </IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Payment;
