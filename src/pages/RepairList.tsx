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
import { carOutline, chevronForwardOutline } from 'ionicons/icons';
import { onAuthStateChanged } from 'firebase/auth';

const RepairList: React.FC = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        history.push('/login');
        return;
      }

      const carsQuery = query(
        collection(db, 'cars'), 
        where('ownerId', '==', user.uid),
        orderBy('createdAt', 'desc')
      );

      const unsubscribeCars = onSnapshot(carsQuery, (snapshot) => {
        const carList = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        } as any));
        setCars(carList.filter((c: any) => c.status !== 'paid'));
        setLoading(false);
      }, (error) => {
        console.error("Error fetching cars:", error);
        setLoading(false);
      });

      return () => unsubscribeCars();
    });

    return () => unsubscribeAuth();
  }, [history]);

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'En attente', color: '#f39c12', bg: '#fef5e7' };
      case 'repairing': return { label: 'En cours', color: '#3498db', bg: '#ebf5fb' };
      case 'ready': return { label: 'Prêt', color: '#27ae60', bg: '#eafaf1' };
      default: return { label: status, color: '#1a1a1a', bg: '#f8f8f8' };
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" color="dark" />
          </IonButtons>
          <IonTitle style={{ color: '#121212' }}>Suivi live</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
        <div style={{ marginBottom: '30px' }}>
           <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, color: '#dedede', letterSpacing: '-0.5px' }}>Réparations actives</h1>
           <p style={{ fontSize: '1rem', color: '#666', marginTop: '5px' }}>Consultez l'avancement de vos demandes.</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>
            <IonSpinner name="crescent" color="dark" />
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '15px' }}>
            {cars.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '60px 20px', background: '#cecece', borderRadius: '30px', border: '2px dashed #eee' }}>
                <IonIcon icon={carOutline} style={{ fontSize: '48px', color: '#ddd' }} />
                <p style={{ color: '#aaa', marginTop: '15px', fontWeight: 500 }}>Aucune voiture en réparation</p>
              </div>
            ) : (
              cars.map((car) => {
                const status = getStatusDisplay(car.status);
                return (
                  <div 
                    key={car.id} 
                    onClick={() => history.push(`/repair/${car.id}`)}
                    style={{ 
                      background: '#ffffff', 
                      borderRadius: '24px', 
                      padding: '20px', 
                      boxShadow: '0 8px 25px rgba(0,0,0,0.03)',
                      display: 'flex',
                      alignItems: 'center',
                      border: '1px solid rgba(0,0,0,0.02)',
                      cursor: 'pointer'
                    }}
                  >
                    <div style={{ 
                      background: '#f8f8f8', 
                      padding: '14px', 
                      borderRadius: '16px', 
                      marginRight: '18px' 
                    }}>
                      <IonIcon icon={carOutline} style={{ fontSize: '26px', color: '#1a1a1a' }} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#1a1a1a' }}>{car.model}</h2>
                      <p style={{ fontSize: '0.85rem', color: '#999', margin: '4px 0 0 0', fontWeight: 600 }}>{car.licensePlate}</p>
                      <div style={{ display: 'flex', alignItems: 'center', marginTop: '8px' }}>
                         <span style={{ 
                            fontSize: '0.75rem', 
                            fontWeight: 800, 
                            color: status.color, 
                            background: status.bg, 
                            padding: '4px 12px', 
                            borderRadius: '8px', 
                            textTransform: 'uppercase' 
                          }}>
                            {status.label}
                         </span>
                      </div>
                    </div>
                    <IonIcon icon={chevronForwardOutline} style={{ color: '#ccc', fontSize: '20px' }} />
                  </div>
                );
              })
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default RepairList;
