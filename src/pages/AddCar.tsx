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
  IonButtons,
  IonBackButton,
  IonIcon,
  IonLoading,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { collection, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { carOutline, medalOutline, barcodeOutline } from 'ionicons/icons';
import { toast } from 'react-hot-toast';

const AddCar: React.FC = () => {
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();

  const handleAddCar = async (e: React.FormEvent) => {
    e.preventDefault();
    const user = auth.currentUser;
    if (!user) {
      toast.error('Session expirée. Reconnectez-vous.');
      return;
    }

    if (!model.trim() || !licensePlate.trim()) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setShowLoading(true);
    try {
      await addDoc(collection(db, 'cars'), {
        ownerId: user.uid,
        ownerEmail: user.email,
        model: model.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        status: 'none', // Just a vehicle entry without repair yet
        createdAt: new Date().toISOString(),
        repairs: []
      });

      toast.success('Véhicule ajouté avec succès');
      history.push('/add-breakdown');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/add-breakdown" color="dark" />
          </IonButtons>
          <IonTitle>Ajouter un véhicule</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
        <div style={{ padding: '20px', textAlign: 'center' }}>
          <div style={{ 
            background: '#f8f8f8', 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}>
            <IonIcon icon={carOutline} style={{ fontSize: '40px', color: '#121212' }} />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: 0, color: '#121212' }}>Nouveau véhicule</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Enregistrez votre voiture dans votre garage.</p>
        </div>

        <form onSubmit={handleAddCar} style={{ padding: '0 10px' }}>
          <div style={{ marginBottom: '15px' }}>
            <IonItem lines="none" style={{ background: '#f8f8f8', borderRadius: '18px', '--padding-start': '20px' }}>
              <IonIcon icon={medalOutline} slot="start" color="medium" style={{ fontSize: '18px' }} />
              <IonLabel position="floating" style={{ color: '#aaa' }}>Marque & Modèle</IonLabel>
              <IonInput
                value={model}
                onIonInput={(e) => setModel(e.detail.value!)}
                required
                placeholder="Ex: Citroën C4"
              />
            </IonItem>
          </div>

          <div style={{ marginBottom: '30px' }}>
            <IonItem lines="none" style={{ background: '#f8f8f8', borderRadius: '18px', '--padding-start': '20px' }}>
              <IonIcon icon={barcodeOutline} slot="start" color="medium" style={{ fontSize: '18px' }} />
              <IonLabel position="floating" style={{ color: '#aaa' }}>Plaque d'immatriculation</IonLabel>
              <IonInput
                value={licensePlate}
                onIonInput={(e) => setLicensePlate(e.detail.value!)}
                required
                placeholder="Ex: 5678 TAB"
              />
            </IonItem>
          </div>

          <IonButton expand="block" type="submit" style={{ height: '64px', '--border-radius': '18px', '--box-shadow': '0 10px 25px rgba(0,0,0,0.08)' }}>
            Ajouter au garage
          </IonButton>
        </form>
        <IonLoading isOpen={showLoading} message={'Enregistrement...'} spinner="crescent" />
      </IonContent>
    </IonPage>
  );
};

export default AddCar;
