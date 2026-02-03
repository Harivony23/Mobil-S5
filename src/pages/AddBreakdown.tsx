import React, { useState } from 'react';
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
import { ref, push, set } from 'firebase/database';
import { db, auth } from '../firebase';
import { toast } from 'react-hot-toast';

const REPAIR_TYPES = [
  'Frein',
  'Vidange',
  'Filtre',
  'Batterie',
  'Amortisseurs',
  'Embrayage',
  'Pneus',
  'Système de refroidissement',
];

const AddBreakdown: React.FC = () => {
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedRepairs, setSelectedRepairs] = useState<string[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();

  const toggleRepair = (repair: string) => {
    if (selectedRepairs.includes(repair)) {
      setSelectedRepairs(selectedRepairs.filter((r) => r !== repair));
    } else {
      setSelectedRepairs([...selectedRepairs, repair]);
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
      const carsRef = ref(db, 'cars');
      const newCarRef = push(carsRef);
      await set(newCarRef, {
        ownerId: user.uid,
        ownerEmail: user.email,
        model,
        licensePlate,
        repairs: selectedRepairs.map((type) => ({
          type,
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
              <IonLabel>Réparations nécessaires</IonLabel>
            </IonListHeader>
            {REPAIR_TYPES.map((repair) => (
              <IonItem key={repair} onClick={() => toggleRepair(repair)}>
                <IonLabel>{repair}</IonLabel>
                <IonCheckbox
                  checked={selectedRepairs.includes(repair)}
                  slot="end"
                />
              </IonItem>
            ))}
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
