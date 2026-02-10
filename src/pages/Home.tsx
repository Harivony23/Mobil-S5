import React, { useEffect, useState, useRef } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonIcon,
  IonList,
  IonItem,
  IonLabel,
  IonButtons,
  IonBadge,
  IonText,
  IonSpinner,
} from '@ionic/react';
import { addOutline, logOutOutline, carOutline, hammerOutline, archiveOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { requestNotificationPermission } from '../services/notificationService';

const Home: React.FC = () => {
  const [userCars, setUserCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        history.push('/login');
      } else {
        requestNotificationPermission().then(token => {
          if (token) {
            setDoc(doc(db, 'users', user.uid), {
              fcmToken: token,
              email: user.email,
              updatedAt: new Date().toISOString()
            }, { merge: true });
          }
        });

        const carsQuery = query(
          collection(db, 'cars'),
          where('ownerId', '==', user.uid)
        );

        const unsubscribeCars = onSnapshot(carsQuery, (snapshot) => {
          const carList = snapshot.docs.map((snapshotDoc) => {
            const data = snapshotDoc.data();
            const carId = snapshotDoc.id;
            
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
                updateDoc(doc(db, 'cars', carId), { status: newStatus });
                data.status = newStatus;
              }
            }
            return { id: carId, ...data };
          });

          setUserCars(carList);
          setLoading(false);
        });

        return () => unsubscribeCars();
      }
    });

    return () => unsubscribeAuth();
  }, [history]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      toast.success('À bientôt !');
      history.push('/login');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case 'pending': return { label: 'En attente', color: '#f39c12', bg: '#fef5e7' };
      case 'repairing': return { label: 'En cours', color: '#3498db', bg: '#ebf5fb' };
      case 'ready': return { label: 'Prêt', color: '#27ae60', bg: '#eafaf1' };
      case 'paid': return { label: 'Archivé', color: '#7f8c8d', bg: '#f2f4f4' };
      default: return { label: status, color: '#1a1a1a', bg: '#f8f8f8' };
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#fff', '--padding-top': '10px' }}>
          <IonTitle style={{ fontWeight: 800, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>Garage S5</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} style={{ '--color': '#1a1a1a' }}>
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#fff' }}>
        <div style={{ padding: '10px 0 30px 0' }}>
           <h1 style={{ fontWeight: 800, fontSize: '2.2rem', margin: 0, letterSpacing: '-1px' }}>Bonjour,</h1>
           <p style={{ fontSize: '1.1rem', color: '#888', margin: '5px 0 0 0', fontWeight: 500 }}>
             {auth.currentUser?.email ? (auth.currentUser.email.split('@')[0].charAt(0).toUpperCase() + auth.currentUser.email.split('@')[0].slice(1)) : 'Client'}
           </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '40px' }}>
           <div 
             onClick={() => history.push('/add-breakdown')}
             className="dark-card"
             style={{ 
               gridColumn: '1 / -1',
               borderRadius: '24px', 
               padding: '24px', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'space-between',
               boxShadow: '0 15px 30px rgba(0,0,0,0.15)'
             }}
           >
              <div>
                <h3 style={{ margin: 0, fontWeight: 700, fontSize: '1.2rem' }}>Nouvelle demande</h3>
                <p style={{ opacity: 0.8, margin: '6px 0 0 0', fontSize: '0.9rem' }}>Démarrer une réparation</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.15)', padding: '12px', borderRadius: '16px' }}>
                <IonIcon icon={addOutline} style={{ fontSize: '24px' }} />
              </div>
           </div>

           <div 
             onClick={() => history.push('/repairs')}
             style={{ 
               background: '#f8f8f8', 
               borderRadius: '24px', 
               padding: '20px', 
               display: 'flex', 
               flexDirection: 'column',
               gap: '12px',
               border: '1px solid #f0f0f0'
             }}
           >
              <div style={{ background: '#ffffff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                 <IonIcon icon={hammerOutline} style={{ color: '#1a1a1a', fontSize: '20px' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>Suivi live</span>
           </div>

           <div 
             onClick={() => history.push('/history')}
             style={{ 
               background: '#f8f8f8', 
               borderRadius: '24px', 
               padding: '20px', 
               display: 'flex', 
               flexDirection: 'column',
               gap: '12px',
               border: '1px solid #f0f0f0'
             }}
           >
              <div style={{ background: '#ffffff', width: '40px', height: '40px', borderRadius: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 10px rgba(0,0,0,0.03)' }}>
                 <IonIcon icon={archiveOutline} style={{ color: '#1a1a1a', fontSize: '20px' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '0.95rem', color: '#1a1a1a' }}>Archives</span>
           </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: 0, color: '#1a1a1a' }}>Mes véhicules</h3>
            {userCars.length > 0 && <IonText color="medium" style={{ fontSize: '0.85rem', fontWeight: 600 }}>{userCars.length} total</IonText>}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><IonSpinner name="crescent" color="dark" /></div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {userCars.filter(c => c.status !== 'paid').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#fcfcfc', borderRadius: '30px', border: '2px dashed #eee' }}>
                  <IonIcon icon={carOutline} style={{ fontSize: '48px', color: '#ddd' }} />
                  <p style={{ color: '#aaa', marginTop: '15px', fontWeight: 500 }}>Aucune réparation en cours</p>
                </div>
              ) : (
                userCars.filter(c => c.status !== 'paid').map((car) => {
                  const status = getStatusDisplay(car.status);
                  return (
                    <div 
                      key={car.id} 
                      onClick={() => history.push(car.status === 'ready' ? `/payment/${car.id}` : `/repair/${car.id}`)}
                      style={{ 
                        background: '#ffffff', 
                        borderRadius: '24px', 
                        padding: '20px', 
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.03)',
                        border: '1px solid rgba(0,0,0,0.02)',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ background: '#f8f8f8', padding: '14px', borderRadius: '18px', marginRight: '18px' }}>
                        <IonIcon icon={carOutline} style={{ fontSize: '26px', color: '#1a1a1a' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.05rem', fontWeight: 800, margin: 0, color: '#1a1a1a' }}>{car.model}</h2>
                        <p style={{ fontSize: '0.85rem', color: '#999', margin: '4px 0 0 0', fontWeight: 600 }}>{car.licensePlate}</p>
                      </div>
                      <div style={{ 
                        background: status.bg, 
                        color: status.color, 
                        padding: '6px 14px', 
                        borderRadius: '12px', 
                        fontSize: '0.75rem', 
                        fontWeight: 800,
                        textTransform: 'uppercase'
                      }}>
                        {status.label}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}
        </div>
        <div style={{ height: '40px' }} />
      </IonContent>
    </IonPage>
  );
};

export default Home;
