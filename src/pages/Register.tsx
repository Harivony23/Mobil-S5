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
  IonText,
  IonLoading,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { ref, set } from 'firebase/database';
import { toast } from 'react-hot-toast';

const Register: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    if (password !== confirmPassword) {
      toast.error('Les mots de passe ne correspondent pas');
      return;
    }

    setShowLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Initialize user in RTDB
      await set(ref(db, `users/${user.uid}`), {
        email: user.email,
        createdAt: new Date().toISOString()
      });

      toast.success('Compte créé avec succès');
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
          <IonTitle>Inscription Garage</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <form onSubmit={handleRegister}>
          <IonItem lines="full">
            <IonLabel position="floating">Email</IonLabel>
            <IonInput
              type="email"
              value={email}
              onIonChange={(e) => setEmail(e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem lines="full">
            <IonLabel position="floating">Mot de passe</IonLabel>
            <IonInput
              type="password"
              value={password}
              onIonChange={(e) => setPassword(e.detail.value!)}
              required
            />
          </IonItem>
          <IonItem lines="full">
            <IonLabel position="floating">Confirmer mot de passe</IonLabel>
            <IonInput
              type="password"
              value={confirmPassword}
              onIonChange={(e) => setConfirmPassword(e.detail.value!)}
              required
            />
          </IonItem>
          <IonButton expand="block" type="submit" className="ion-margin-top">
            S'inscrire
          </IonButton>
        </form>
        <div className="ion-text-center ion-margin-top">
          <IonText color="medium">
            Déjà un compte ?{' '}
            <IonButton fill="clear" onClick={() => history.push('/login')}>
              Se connecter
            </IonButton>
          </IonText>
        </div>
        <IonLoading isOpen={showLoading} message={'Création du compte...'} />
      </IonContent>
    </IonPage>
  );
};

export default Register;
