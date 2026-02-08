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
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../firebase';

const RepairList: React.FC = () => {
  const [cars, setCars] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const history = useHistory();

  useEffect(() => {
    const carsQuery = query(collection(db, 'cars'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(carsQuery, (snapshot) => {
      const carList = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setCars(carList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

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
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Voitures à réparer</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        {loading ? (
          <div className="ion-text-center ion-padding">
            <IonSpinner name="crescent" />
          </div>
        ) : (
          <IonList>
            {cars.length === 0 ? (
              <div className="ion-text-center ion-padding">
                <IonText color="medium">Aucune voiture pour le moment</IonText>
              </div>
            ) : (
              cars.map((car) => (
                <IonItem 
                  key={car.id} 
                  button 
                  onClick={() => history.push(`/repair/${car.id}`)}
                  detail={car.status !== 'paid'}
                >
                  <IonLabel>
                    <h2>{car.model}</h2>
                    <p>{car.licensePlate}</p>
                    <p>{car.repairs?.length || 0} réparations</p>
                  </IonLabel>
                  <IonBadge color={getStatusColor(car.status)} slot="end">
                    {car.status.toUpperCase()}
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

export default RepairList;
