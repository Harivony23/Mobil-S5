import React, { useState, useEffect } from 'react';
import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonItem,
  IonLabel,
  IonInput,
  IonButton,
  IonCheckbox,
  IonList,
  IonListHeader,
  IonButtons,
  IonBackButton,
  IonLoading,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';

const AddBreakdown: React.FC = () => {
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedRepairs, setSelectedRepairs] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const fetchInterventions = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'interventions'));
        const data = querySnapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data()
        }));
        setInterventions(data);
      } catch (error) {
        console.error("Error fetching interventions:", error);
        toast.error("Erreur lors du chargement des interventions");
      }
    };
    fetchInterventions();
  }, []);

  const toggleRepair = (intervention: any) => {
    const isSelected = selectedRepairs.find(r => r.name === intervention.name);
    
    if (isSelected) {
      setSelectedRepairs(selectedRepairs.filter((r) => r.name !== intervention.name));
    } else {
      // On stocke le nom et la durée (en minutes)
      setSelectedRepairs([...selectedRepairs, {
        name: intervention.name,
        duration: intervention.duration_minutes,
        price: intervention.price || 0
      }]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error('Vous devez être connecté');
      return;
    }

    if (!model || !licensePlate || selectedRepairs.length === 0) {
      toast.error('Veuillez remplir tous les champs et sélectionner au moins une réparation');
      return;
    }

    setShowLoading(true);
    try {
      await addDoc(collection(db, 'cars'), {
        ownerId: user.uid,
        ownerEmail: user.email,
        model,
        licensePlate,
        repairs: selectedRepairs.map((repair) => ({
          type: repair.name,
          duration: repair.duration, // Stocké en minutes
          price: repair.price,
          status: 'pending',
          progress: 0,
        })),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      toast.success('Voiture ajoutée avec succès');
      history.push('/home');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar color="primary">
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Décrire une panne</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleSubmit}>
          <IonItem>
            <IonLabel position="floating">Modèle de la voiture</IonLabel>
            <IonInput
              value={model}
              onIonChange={(e) => setModel(e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem>
            <IonLabel position="floating">Plaque d'immatriculation</IonLabel>
            <IonInput
              value={licensePlate}
              onIonChange={(e) => setLicensePlate(e.detail.value!)}
              required
            />
          </IonItem>

          <IonList>
            <IonListHeader>
              <IonLabel>Réparations nécessaires (Durée estimée)</IonLabel>
            </IonListHeader>
            {interventions.length === 0 ? (
                <div className="ion-padding ion-text-center">Chargement des réparations...</div>
            ) : (
                interventions.map((intervention) => (
                <IonItem key={intervention.id || intervention.name} onClick={() => toggleRepair(intervention)}>
                    <IonLabel>
                        {intervention.name} ({intervention.duration_minutes} min)
                    </IonLabel>
                    <IonCheckbox
                    checked={selectedRepairs.some(r => r.name === intervention.name)}
                    slot="end"
                    />
                </IonItem>
                ))
            )}
          </IonList>

          <IonButton expand="block" type="submit" className="ion-margin-top">
            Envoyer au garage
          </IonButton>
        </form>
        <IonLoading isOpen={showLoading} message={'Enregistrement...'} />
      </IonContent>
    </IonPage>
  );
};

export default AddBreakdown;
