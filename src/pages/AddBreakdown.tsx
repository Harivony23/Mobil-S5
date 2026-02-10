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
  IonSelect,
  IonSelectOption,
  IonProgressBar,
  IonText,
  IonIcon,
  IonSpinner,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { collection, addDoc, getDocs, query, where, orderBy } from 'firebase/firestore';
import { db, auth } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { toast } from 'react-hot-toast';
import { carOutline, hammerOutline, addOutline, chevronDownOutline } from 'ionicons/icons';

const AddBreakdown: React.FC = () => {
  const [model, setModel] = useState('');
  const [licensePlate, setLicensePlate] = useState('');
  const [selectedRepairs, setSelectedRepairs] = useState<any[]>([]);
  const [interventions, setInterventions] = useState<any[]>([]);
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        history.push('/login');
        return;
      }

      const fetchInterventions = async () => {
        try {
          const querySnapshot = await getDocs(collection(db, 'interventions'));
          setInterventions(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        } catch (error) {
          console.error("Error fetching interventions:", error);
        }
      };

      fetchInterventions();
    });

    return () => unsubscribeAuth();
  }, [history]);

  const toggleRepair = (intervention: any) => {
    const isSelected = selectedRepairs.find(r => r.name === intervention.name);
    if (isSelected) {
      setSelectedRepairs(selectedRepairs.filter((r) => r.name !== intervention.name));
    } else {
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
      toast.error('Connectez-vous pour continuer');
      return;
    }

    if (!model.trim() || !licensePlate.trim() || selectedRepairs.length === 0) {
      toast.error('Complétez les champs et choisissez au moins un service.');
      return;
    }

    setShowLoading(true);
    try {
      await addDoc(collection(db, 'cars'), {
        ownerId: user.uid,
        ownerEmail: user.email,
        model: model.trim(),
        licensePlate: licensePlate.trim().toUpperCase(),
        repairs: selectedRepairs.map((repair) => ({
          type: repair.name,
          duration: repair.duration,
          price: repair.price,
          status: 'pending',
          progress: 0,
        })),
        status: 'pending',
        createdAt: new Date().toISOString(),
      });

      toast.success('Demande enregistrée');
      history.push('/home');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ '--background': '#ffffff' }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Demande de réparation</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
        <div style={{ marginBottom: '30px' }}>
          <h1 style={{ fontWeight: 800, fontSize: '1.8rem', margin: '0 0 10px 0', color: '#000000', letterSpacing: '-0.5px' }}>Bonjour Miary,</h1>
          <p style={{ fontSize: '1rem', color: '#666', margin: 0 }}>Veuillez renseigner les détails du véhicule.</p>
        </div>

        <form onSubmit={handleSubmit}>
          <div style={{ background: '#f8f8f8', borderRadius: '24px', padding: '24px', marginBottom: '25px', boxShadow: '0 4px 15px rgba(0,0,0,0.02)' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px' }}>
                <div style={{ background: '#000000', padding: '8px', borderRadius: '10px', marginRight: '12px' }}>
                  <IonIcon icon={carOutline} style={{ color: '#ffffff', fontSize: '20px' }} />
                </div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem', color: '#000000' }}>Véhicule</span>
            </div>

            <div style={{ display: 'grid', gap: '15px' }}>
              <IonItem lines="none" style={{ background: '#ffffff', borderRadius: '18px', '--padding-start': '18px', marginBottom: '10px' }}>
                <IonLabel position="stacked" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Marque & Modèle</IonLabel>
                <IonInput
                  value={model}
                  onIonInput={(e) => setModel(e.detail.value!)}
                  required
                  style={{ fontWeight: 600, color: '#000000' }}
                  placeholder="Ex: Citroën C4"
                />
              </IonItem>
              <IonItem lines="none" style={{ background: '#ffffff', borderRadius: '18px', '--padding-start': '18px' }}>
                <IonLabel position="stacked" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', marginBottom: '8px' }}>Plaque d'immatriculation</IonLabel>
                <IonInput
                  value={licensePlate}
                  onIonInput={(e) => setLicensePlate(e.detail.value!)}
                  required
                  style={{ fontWeight: 600, color: '#000000' }}
                  placeholder="Ex: 1234 TAB"
                />
              </IonItem>
            </div>
          </div>

          <div style={{ marginBottom: '15px' }}>
            <h3 style={{ fontWeight: 800, fontSize: '1.2rem', margin: '0 0 15px 5px', color: '#f0f0f0' }}>Que faut-il faire ?</h3>
          </div>

          <div style={{ display: 'grid', gap: '12px' }}>
            {interventions.length === 0 ? (
                <div style={{ textAlign: 'center', padding: '20px' }}><IonSpinner name="crescent" color="dark" /></div>
            ) : (
                interventions.map((intervention) => {
                  const isChecked = selectedRepairs.some(r => r.name === intervention.name);
                  return (
                    <div 
                      key={intervention.id || intervention.name} 
                      onClick={() => toggleRepair(intervention)}
                      style={{ 
                        background: isChecked ? '#121212' : '#6d6d6d', 
                        borderRadius: '20px', 
                        padding: '18px', 
                        display: 'flex', 
                        alignItems: 'center',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.03)',
                        border: isChecked ? '1.5px solid #121212' : '1.5px solid #f0f0f0',
                        transition: 'all 0.2s ease',
                        cursor: 'pointer',
                        color: isChecked ? '#ffffff' : '#121212'
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 700 }}>{intervention.name}</h3>
                        <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: isChecked ? 'rgba(243, 243, 243, 0.7)' : '#fbfbfb' }}>
                          Estimation: {intervention.duration_minutes} min • {intervention.price || 0} Ar
                        </p>
                      </div>
                      <IonCheckbox
                        checked={isChecked}
                        slot="end"
                        style={{ '--size': '22px', '--checkbox-background-checked': '#fff', '--checkmark-color': '#121212', '--border-color': isChecked ? '#fff' : '#ddd' }}
                      />
                    </div>
                  );
                })
            )}
          </div>

          <IonButton 
          expand="block" 
          type="submit" 
          style={{ 
            marginTop: '40px', 
            height: '64px', 
            '--border-radius': '18px', 
            '--background': 'var(--brand-orange)', 
            color: '#ffffff',
            fontWeight: 800,
            fontSize: '1.1rem',
            boxShadow: '0 10px 25px rgba(255, 107, 0, 0.2)'
          }}
        >
          Envoyer ma demande
        </IonButton>
        </form>
        <div style={{ height: '40px' }} />
        <IonLoading isOpen={showLoading} message={'Enregistrement...'} spinner="crescent" />
      </IonContent>
    </IonPage>
  );
};

export default AddBreakdown;
