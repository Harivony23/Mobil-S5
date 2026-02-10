import React, { useEffect, useState } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { carOutline, cardOutline, receiptOutline } from 'ionicons/icons';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const Payment: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [car, setCar] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        history.push('/login');
        return;
      }

      const carRef = doc(db, 'cars', id);
      const unsubscribeCar = onSnapshot(carRef, (snapshot) => {
        if (snapshot.exists()) {
          const data = snapshot.data();

          if (data.ownerId !== user.uid) {
            toast.error("Vous n'avez pas accès à ce paiement.");
            history.push('/home');
            return;
          }

          setCar({ id: snapshot.id, ...data });
        } else {
          setCar(null);
        }
        setLoading(false);
      });

      return () => unsubscribeCar();
    });

    return () => unsubscribeAuth();
  }, [id, history]);

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

  if (loading) return <IonPage><IonContent className="ion-padding ion-text-center"><IonSpinner name="crescent" /></IonContent></IonPage>;
  if (!car) return <IonPage><IonContent className="ion-padding">Voiture non trouvée</IonContent></IonPage>;

  const totalPrice = car.repairs?.reduce((acc: number, repair: any) => acc + (repair.price || 0), 0) || 0;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref={`/repair/${id}`} color="dark" />
          </IonButtons>
          <IonTitle>Paiement</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div style={{ marginBottom: '30px' }}>
          <IonIcon icon={receiptOutline} style={{ fontSize: '48px', color: '#1a1a1a', marginBottom: '10px' }} />
          <IonText color="dark">
             <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0 }}>Récapitulatif</h1>
             <p style={{ fontSize: '1rem', color: '#666', marginTop: '5px' }}>Veuillez vérifier les détails avant de payer.</p>
          </IonText>
        </div>

        <div style={{ 
          background: '#fdfdfd', 
          borderRadius: '24px', 
          padding: '24px', 
          boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
          border: '1px solid rgba(0,0,0,0.03)',
          marginBottom: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
             <div style={{ background: '#080808', padding: '10px', borderRadius: '12px', marginRight: '15px' }}>
                <IonIcon icon={carOutline} style={{ fontSize: '20px' }} />
             </div>
             <div>
                <h2 style={{ fontSize: '1.15rem', fontWeight: 700, color: '#050505', margin: 0 }}>{car.model}</h2>
                <p style={{ fontSize: '1.3rem', color: '#050505', margin: 0 }}>{car.licensePlate}</p>
             </div>
          </div>
          
          <div style={{ borderTop: '1px dashed #060606', paddingTop: '20px' }}>
             {car.repairs.map((r: any, i: number) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                   <span style={{ color: '#0a0a0a', fontSize: '0.95rem' }}>{r.type}</span>
                   <span style={{ fontWeight: 600, color: '#050505' }}>{r.price || 0} Ar</span>
                </div>
             ))}
          </div>

          <div style={{ borderTop: '1px solid #1a1a1a', marginTop: '20px', paddingTop: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
             <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#050505' }}>Total à payer</span>
             <span style={{ fontSize: '1.6rem', fontWeight: 800, color: '#050505' }}>{totalPrice} Ar</span>
          </div>
        </div>

        <IonButton expand="block" color="dark" style={{ height: '60px', borderRadius: '16px' }} onClick={handlePayment}>
          <IonIcon icon={cardOutline} slot="start" />
          Payer la facture
        </IonButton>
        <p style={{ textAlign: 'center', color: '#999', fontSize: '0.8rem', marginTop: '15px' }}>
           Paiement sécurisé par Garage S5
        </p>
      </IonContent>
    </IonPage>
  );
};

export default Payment;
