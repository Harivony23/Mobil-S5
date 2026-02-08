import React, { useEffect, useState } from 'react';
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
import { addOutline, logOutOutline, carOutline, hammerOutline } from 'ionicons/icons';
import { useHistory } from 'react-router-dom';
import { auth, db } from '../firebase';
import { signOut, onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, onSnapshot, doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { requestNotificationPermission } from '../services/notificationService';

const Home: React.FC = () => {
  const [userCars, setUserCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
      if (!user) {
        history.push('/login');
      } else {
        // Request notification permission and get FCM token
        const fcmToken = await requestNotificationPermission();
        if (fcmToken) {
          // Save token to Firestore for this user
          await setDoc(doc(db, 'users', user.uid), {
            fcmToken,
            email: user.email,
            updatedAt: new Date().toISOString()
          }, { merge: true });
          console.log('FCM token saved for user:', user.uid);
        }

        // Query cars owned by this user
        const carsQuery = query(
          collection(db, 'cars'),
          where('ownerId', '==', user.uid)
        );

        const unsubscribeCars = onSnapshot(carsQuery, (snapshot) => {
          const carList = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
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
      toast.success('Déconnexion réussie');
      history.push('/login');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'warning';
      case 'repairing': return 'primary';
      case 'ready': return 'success';
      case 'paid': return 'medium';
      default: return 'light';
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonTitle>Mon Garage</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleLogout}>
              <IonIcon icon={logOutOutline} slot="icon-only" />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <div className="ion-text-center ion-margin-bottom">
          <IonText color="dark">
            <h1>Bienvenue, {auth.currentUser?.email?.split('@')[0]}</h1>
          </IonText>
        </div>

        <div className="ion-margin-bottom">
          <IonButton expand="block" onClick={() => history.push('/add-breakdown')}>
            <IonIcon icon={addOutline} slot="start" />
            Décrire une panne
          </IonButton>
          <IonButton expand="block" fill="outline" onClick={() => history.push('/repairs')}>
            <IonIcon icon={hammerOutline} slot="start" />
            Voir toutes les réparations
          </IonButton>
        </div>

        <IonText color="medium">
          <h3>Mes voitures</h3>
        </IonText>

        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner />
          </div>
        ) : (
          <IonList>
            {userCars.length === 0 ? (
              <IonItem lines="none">
                <IonLabel className="ion-text-center">
                  <p>Pas encore de voiture enregistrée</p>
                </IonLabel>
              </IonItem>
            ) : (
              userCars.map((car) => (
                <IonItem 
                  key={car.id} 
                  button 
                  onClick={() => history.push(car.status === 'ready' ? `/payment/${car.id}` : `/repair/${car.id}`)}
                >
                  <IonIcon icon={carOutline} slot="start" />
                  <IonLabel>
                    <h2>{car.model}</h2>
                    <p>{car.licensePlate}</p>
                  </IonLabel>
                  <IonBadge color={getStatusColor(car.status)} slot="end">
                    {car.status}
                  </IonBadge>
                </IonItem>
              ))
            )}
          </IonList>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;
