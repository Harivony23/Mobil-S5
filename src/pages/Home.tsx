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
        <IonToolbar style={{ '--background': '#000000', '--padding-top': '15px', '--padding-bottom': '15px' }}>
          <div slot="start" style={{ paddingLeft: '15px', display: 'flex', alignItems: 'center' }}>
            <img src="/assets/logo.png" alt="Logo" style={{ height: '150px', width: 'auto' }} />
          </div>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout} style={{ '--color': '#ffffff', '--padding-end': '15px' }}>
              <IonIcon icon={logOutOutline} slot="icon-only" style={{ fontSize: '28px' }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#000000' }}>
        <div style={{ padding: '10px 0 30px 0' }}>
           <h1 style={{ fontWeight: 800, fontSize: '2.4rem', margin: 0, letterSpacing: '-1.5px', color: '#ffffff' }}>Bonjour,</h1>
           <p style={{ fontSize: '1.2rem', color: 'rgba(255,255,255,0.6)', margin: '5px 0 0 0', fontWeight: 600 }}>
             {auth.currentUser?.email ? (auth.currentUser.email.split('@')[0].charAt(0).toUpperCase() + auth.currentUser.email.split('@')[0].slice(1)) : 'Miary'}
           </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '15px', marginBottom: '40px' }}>
           <div 
             onClick={() => history.push('/add-breakdown')}
             style={{ 
               gridColumn: '1 / -1',
               background: 'var(--brand-orange)', 
               borderRadius: '24px', 
               padding: '24px', 
               display: 'flex', 
               alignItems: 'center', 
               justifyContent: 'space-between',
               boxShadow: '0 15px 35px rgba(255, 107, 0, 0.3)'
             }}
           >
              <div>
                <h3 style={{ margin: 0, fontWeight: 800, fontSize: '1.3rem', color: '#ffffff' }}>Nouvelle demande</h3>
                <p style={{ opacity: 0.9, margin: '6px 0 0 0', fontSize: '0.95rem', color: '#ffffff', fontWeight: 500 }}>Démarrer une réparation</p>
              </div>
              <div style={{ background: 'rgba(255,255,255,0.25)', padding: '12px', borderRadius: '16px' }}>
                <IonIcon icon={addOutline} style={{ fontSize: '26px', color: '#ffffff' }} />
              </div>
           </div>

           <div 
             onClick={() => history.push('/repairs')}
             style={{ 
               background: '#121212', 
               borderRadius: '24px', 
               padding: '20px', 
               display: 'flex', 
               flexDirection: 'column',
               gap: '12px',
               border: '1px solid #1a1a1a'
             }}
           >
              <div style={{ background: '#1a1a1a', width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <IonIcon icon={hammerOutline} style={{ color: '#ffffff', fontSize: '22px' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Suivi live</span>
           </div>

           <div 
             onClick={() => history.push('/history')}
             style={{ 
               background: '#121212', 
               borderRadius: '24px', 
               padding: '20px', 
               display: 'flex', 
               flexDirection: 'column',
               gap: '12px',
               border: '1px solid #1a1a1a'
             }}
           >
              <div style={{ background: '#1a1a1a', width: '44px', height: '44px', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                 <IonIcon icon={archiveOutline} style={{ color: '#ffffff', fontSize: '22px' }} />
              </div>
              <span style={{ fontWeight: 700, fontSize: '1rem', color: '#ffffff' }}>Archives</span>
           </div>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.3rem', margin: 0, color: '#ffffff' }}>Mes véhicules</h3>
            {userCars.length > 0 && <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 600 }}>{userCars.length} total</IonText>}
          </div>

          {loading ? (
            <div style={{ textAlign: 'center', padding: '40px' }}><IonSpinner name="crescent" color="warning" /></div>
          ) : (
            <div style={{ display: 'grid', gap: '15px' }}>
              {userCars.filter(c => c.status !== 'paid').length === 0 ? (
                <div style={{ textAlign: 'center', padding: '60px 20px', background: '#0a0a0a', borderRadius: '30px', border: '2px dashed #1a1a1a' }}>
                  <IonIcon icon={carOutline} style={{ fontSize: '48px', color: '#222' }} />
                  <p style={{ color: '#555', marginTop: '15px', fontWeight: 500 }}>Aucune réparation en cours</p>
                </div>
              ) : (
                userCars.filter(c => c.status !== 'paid').map((car) => {
                  const status = getStatusDisplay(car.status);
                  return (
                    <div 
                      key={car.id} 
                      onClick={() => history.push(car.status === 'ready' ? `/payment/${car.id}` : `/repair/${car.id}`)}
                      style={{ 
                        background: '#121212', 
                        borderRadius: '24px', 
                        padding: '20px', 
                        display: 'flex',
                        alignItems: 'center',
                        border: '1px solid #1a1a1a',
                        cursor: 'pointer'
                      }}
                    >
                      <div style={{ background: '#1a1a1a', padding: '14px', borderRadius: '18px', marginRight: '18px' }}>
                        <IonIcon icon={carOutline} style={{ fontSize: '28px', color: '#ffffff' }} />
                      </div>
                      <div style={{ flex: 1 }}>
                        <h2 style={{ fontSize: '1.1rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>{car.model}</h2>
                        <p style={{ fontSize: '0.9rem', color: 'rgba(255,255,255,0.4)', margin: '4px 0 0 0', fontWeight: 600 }}>{car.licensePlate}</p>
                      </div>
                      <div style={{ 
                        background: status.bg, 
                        color: status.color, 
                        padding: '6px 14px', 
                        borderRadius: '12px', 
                        fontSize: '0.78rem', 
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
