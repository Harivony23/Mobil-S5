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
  IonBadge,
  IonButtons,
  IonBackButton,
  IonSpinner,
  IonText,
  IonIcon,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { carOutline, checkmarkCircleOutline, archiveOutline, chevronForwardOutline } from 'ionicons/icons';

const RepairHistory: React.FC = () => {
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const historyRouter = useHistory();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        historyRouter.push('/login');
        return;
      }

      const historyQuery = query(
        collection(db, 'cars'),
        where('ownerId', '==', user.uid),
        where('status', '==', 'paid'),
        orderBy('paidAt', 'desc')
      );

      const unsubscribeHistory = onSnapshot(historyQuery, (snapshot) => {
        const historyList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as any));
        setHistory(historyList);
        setLoading(false);
      }, (error) => {
        console.error("Error fetching history:", error);
        setLoading(false);
      });

      return () => unsubscribeHistory();
    });

    return () => unsubscribeAuth();
  }, [historyRouter]);

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Date inconnue';
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="dark" />
          </IonButtons>
          <IonTitle style={{ color: '#121212' }}>Archives</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
        <div style={{ marginBottom: '35px' }}>
          <div style={{ background: '#f8f8f8', width: '56px', height: '56px', borderRadius: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '20px' }}>
             <IonIcon icon={archiveOutline} style={{ fontSize: '28px', color: '#121212' }} />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, color: '#c3c3c3', letterSpacing: '-0.5px' }}>Historique</h1>
          <p style={{ fontSize: '1rem', color: '#666', marginTop: '5px' }}>Toutes vos interventions terminées et payées.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <IonSpinner name="crescent" color="dark" />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {history.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fcfcfc', borderRadius: '30px', border: '2px dashed #eee' }}>
                <p style={{ color: '#aaa', fontWeight: 500 }}>Aucune archive disponible</p>
              </div>
            ) : (
              history.map((item) => (
                <div 
                  key={item.id} 
                  onClick={() => historyRouter.push(`/repair/${item.id}`)}
                  style={{ 
                    background: '#fff', 
                    borderRadius: '24px', 
                    padding: '24px', 
                    boxShadow: '0 8px 25px rgba(0,0,0,0.03)',
                    border: '1px solid rgba(0,0,0,0.02)',
                    cursor: 'pointer'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                     <div style={{ display: 'flex', alignItems: 'center' }}>
                        <div style={{ background: '#f8f8f8', padding: '12px', borderRadius: '14px', marginRight: '15px' }}>
                           <IonIcon icon={carOutline} style={{ fontSize: '24px', color: '#121212' }} />
                        </div>
                        <div>
                           <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#121212' }}>{item.model}</h2>
                           <p style={{ fontSize: '0.85rem', color: '#999', margin: '2px 0 0 0', fontWeight: 600 }}>{item.licensePlate}</p>
                        </div>
                     </div>
                     <span style={{ background: '#eafaf1', color: '#27ae60', padding: '6px 14px', borderRadius: '10px', fontSize: '0.7rem', fontWeight: 800 }}>PAYÉ</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f5f5f5', paddingTop: '18px' }}>
                     <div>
                        <p style={{ fontSize: '0.7rem', color: '#bbb', margin: 0, textTransform: 'uppercase', fontWeight: 700, letterSpacing: '0.5px' }}>Date</p>
                        <p style={{ fontSize: '0.9rem', color: '#121212', fontWeight: 600, margin: '2px 0 0 0' }}>{formatDate(item.paidAt)}</p>
                     </div>
                     <div style={{ textAlign: 'right' }}>
                        <p style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#121212' }}>
                          {item.repairs?.reduce((acc: number, r: any) => acc + (r.price || 0), 0) || 0}€
                        </p>
                     </div>
                  </div>
                </div>
              ))
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default RepairHistory;
