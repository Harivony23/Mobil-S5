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
  IonIcon,
  IonSpinner,
  IonBackButton,
  IonButtons,
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '../firebase';
import { doc, setDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast';
import { personAddOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';

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
      
      await setDoc(doc(db, 'users', user.uid), {
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
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/login" color="dark" />
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
        <div style={{ padding: '20px 20px 40px 20px', textAlign: 'center' }}>
          <div style={{ 
            background: '#f5f5f5', 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px auto',
          }}>
            <IonIcon icon={personAddOutline} style={{ fontSize: '40px', color: '#1a1a1a' }} />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', margin: 0, letterSpacing: '-1px' }}>Rejoignez-nous</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Créez votre compte en quelques secondes</p>
        </div>

        <div style={{ padding: '0 10px' }}>
          <form onSubmit={handleRegister}>
            <div style={{ marginBottom: '15px' }}>
               <IonItem lines="none" style={{ background: '#f8f8f8', borderRadius: '18px', '--padding-start': '20px' }}>
                 <IonIcon icon={mailOutline} slot="start" color="medium" style={{ fontSize: '18px', marginTop: '10px' }} />
                 <IonLabel position="stacked" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Email</IonLabel>
                 <IonInput
                   type="email"
                   value={email}
                   onIonInput={(e) => setEmail(e.detail.value!)}
                   required
                   placeholder="votre@email.com"
                 />
               </IonItem>
            </div>

            <div style={{ marginBottom: '15px' }}>
               <IonItem lines="none" style={{ background: '#f8f8f8', borderRadius: '18px', '--padding-start': '20px' }}>
                 <IonIcon icon={lockClosedOutline} slot="start" color="medium" style={{ fontSize: '18px', marginTop: '10px' }} />
                 <IonLabel position="stacked" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Mot de passe</IonLabel>
                 <IonInput
                   type="password"
                   value={password}
                   onIonInput={(e) => setPassword(e.detail.value!)}
                   required
                   placeholder="••••••••"
                 />
               </IonItem>
            </div>

            <div style={{ marginBottom: '35px' }}>
               <IonItem lines="none" style={{ background: '#f8f8f8', borderRadius: '18px', '--padding-start': '20px' }}>
                 <IonIcon icon={lockClosedOutline} slot="start" color="medium" style={{ fontSize: '18px', marginTop: '10px' }} />
                 <IonLabel position="stacked" style={{ color: '#000000', fontWeight: 700, fontSize: '0.9rem', marginBottom: '4px' }}>Confirmer</IonLabel>
                 <IonInput
                   type="password"
                   value={confirmPassword}
                   onIonInput={(e) => setConfirmPassword(e.detail.value!)}
                   required
                   placeholder="••••••••"
                 />
               </IonItem>
            </div>

            <IonButton expand="block" type="submit" style={{ height: '64px', '--border-radius': '18px', '--box-shadow': '0 10px 25px rgba(0,0,0,0.08)', fontWeight: 700, fontSize: '1.05rem' }}>
              S'inscrire
            </IonButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '45px' }}>
            <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              Vous avez déjà un compte ?
            </IonText>
            <div>
              <IonButton fill="clear" onClick={() => history.push('/login')} color="dark" style={{ fontWeight: 800, textTransform: 'none', fontSize: '1rem' }}>
                Se connecter
              </IonButton>
            </div>
          </div>
        </div>
        <IonLoading isOpen={showLoading} message={'Création du compte...'} spinner="crescent" />
      </IonContent>
    </IonPage>
  );
};

export default Register;
