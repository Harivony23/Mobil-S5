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
  IonIcon,
} from '@ionic/react';
import { useParams, useHistory } from 'react-router-dom';
import { doc, onSnapshot, updateDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { carOutline, hammerOutline, checkmarkCircleOutline, timeOutline } from 'ionicons/icons';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';

const RepairDetail: React.FC = () => {
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
            toast.error("Accès refusé.");
            history.push('/home');
            return;
          }

          setCar({ id: snapshot.id, ...data });

          if (data.repairs && data.repairs.length > 0) {
            const allDone = data.repairs.every((r: any) => r.status === 'done');
            const anyInProgress = data.repairs.some((r: any) => r.status === 'in_progress');
            
            let newStatus = data.status;
            if (allDone && data.status !== 'ready' && data.status !== 'paid') {
              newStatus = 'ready';
            } else if (anyInProgress && data.status === 'pending') {
              newStatus = 'repairing';
            }

            if (newStatus !== data.status) {
              updateDoc(carRef, { status: newStatus });
            }
          }
        } else {
          setCar(null);
        }
        setLoading(false);
      });

      return () => unsubscribeCar();
    });

    return () => unsubscribeAuth();
  }, [id, history]);

  useEffect(() => {
    if (!car || !car.repairs) return;

    const interval = setInterval(() => {
      const updatedRepairs = car.repairs.map((repair: any) => {
        if (repair.status === 'in_progress' && repair.startTime) {
            const startTime = new Date(repair.startTime).getTime();
            const now = new Date().getTime();
            const durationMs = (repair.duration || 1) * 60 * 1000;
            
            let progress = (now - startTime) / durationMs;
            if (progress > 1) progress = 1;
            
            return { ...repair, progress };
        }
        return repair;
      });
      
      setCar((prev: any) => prev ? ({ ...prev, repairs: updatedRepairs }) : null);

    }, 1000);

    return () => clearInterval(interval);
  }, [car]);

  if (loading) return <IonPage><IonContent className="ion-padding ion-text-center"><IonSpinner name="crescent" color="dark" /></IonContent></IonPage>;
  if (!car) return <IonPage><IonContent className="ion-padding ion-text-center">Véhicule non trouvé</IonContent></IonPage>;

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'En attente', color: '#f39c12', bg: '#fef5e7' };
      case 'repairing': return { label: 'En cours', color: '#3498db', bg: '#ebf5fb' };
      case 'ready': return { label: 'Prêt', color: '#27ae60', bg: '#eafaf1' };
      case 'paid': return { label: 'Réglé', color: '#7f8c8d', bg: '#f2f4f4' };
      default: return { label: status, color: '#1a1a1a', bg: '#f8f8f8' };
    }
  };

  const statusInfo = getStatusDisplay(car.status);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/repairs" color="dark" />
          </IonButtons>
          <IonTitle style={{ color: '#121212' }}>Suivi détaillé</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
        <div style={{ background: '#121212', padding: '30px 24px', borderRadius: '30px', color: '#ffffff', marginBottom: '35px', boxShadow: '0 20px 40px rgba(0,0,0,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
            <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '14px', marginRight: '18px' }}>
              <IonIcon icon={carOutline} style={{ fontSize: '28px' }} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>{car.model}</h2>
              <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.6)', margin: '2px 0 0 0', fontWeight: 600 }}>{car.licensePlate}</p>
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.08)', padding: '12px 20px', borderRadius: '16px' }}>
            <span style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', fontWeight: 600 }}>État actuel</span>
            <span style={{ fontSize: '0.8rem', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{statusInfo.label}</span>
          </div>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 20px 5px', color: '#cfcfcf' }}>Liste des travaux</h3>
        </div>

        <div style={{ display: 'grid', gap: '15px' }}>
          {car.repairs.map((repair: any, index: number) => (
            <div 
              key={index} 
              style={{ 
                background: '#ffffff', 
                borderRadius: '24px', 
                padding: '24px', 
                boxShadow: '0 8px 25px rgba(0,0,0,0.03)',
                border: '1px solid rgba(0,0,0,0.02)'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '15px' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: 0, fontSize: '1.05rem', fontWeight: 800, color: '#121212' }}>{repair.type}</h3>
                  <div style={{ display: 'flex', alignItems: 'center', marginTop: '6px', color: '#626262' }}>
                    <IonIcon icon={timeOutline} style={{ fontSize: '14px', marginRight: '5px' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{repair.duration} min</span>
                  </div>
                </div>
                <div style={{ 
                  padding: '6px 12px', 
                  borderRadius: '10px', 
                  fontSize: '0.7rem', 
                  fontWeight: 800, 
                  background: repair.status === 'done' ? '#eafaf1' : (repair.status === 'in_progress' ? '#ebf5fb' : '#fef5e7'),
                  color: repair.status === 'done' ? '#27ae60' : (repair.status === 'in_progress' ? '#3498db' : '#f39c12'),
                  textTransform: 'uppercase'
                }}>
                  {repair.status === 'done' ? 'Terminé' : (repair.status === 'in_progress' ? 'En cours' : 'En attente')}
                </div>
              </div>
              
              {repair.status === 'in_progress' && (
                <div style={{ marginTop: '20px' }}>
                  <div style={{ height: '8px', background: '#f8f8f8', borderRadius: '10px', overflow: 'hidden' }}>
                    <div style={{ width: `${Math.round(repair.progress * 100)}%`, height: '100%', background: '#121212', transition: 'width 0.4s ease' }} />
                  </div>
                  <p style={{ textAlign: 'right', fontSize: '0.8rem', fontWeight: 700, color: '#121212', marginTop: '10px' }}>
                    {Math.round(repair.progress * 100)}% complété
                  </p>
                </div>
              )}

              {repair.status === 'done' && (
                 <div style={{ display: 'flex', alignItems: 'center', marginTop: '15px', color: '#27ae60', fontSize: '0.85rem', fontWeight: 700 }}>
                    <IonIcon icon={checkmarkCircleOutline} style={{ fontSize: '18px', marginRight: '8px' }} />
                    Prêt pour récupération
                 </div>
              )}
            </div>
          ))}
        </div>

        {car.status === 'ready' && (
          <IonButton 
            expand="block" 
            style={{ 
                marginTop: '45px', 
                height: '64px', 
                '--border-radius': '18px', 
                '--background': 'var(--brand-orange)', 
                color: '#ffffff',
                fontSize: '1.18rem', 
                fontWeight: 800,
                boxShadow: '0 10px 25px rgba(255, 107, 0, 0.2)'
            }} 
            onClick={() => history.push(`/payment/${id}`)}
          >
            Régler la facture
          </IonButton>
        )}
        <div style={{ height: '40px' }} />
      </IonContent>
    </IonPage>
  );
};

export default RepairDetail;

