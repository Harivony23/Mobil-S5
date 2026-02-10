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
} from '@ionic/react';
import { useHistory } from 'react-router-dom';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';
import { toast } from 'react-hot-toast';
import { carOutline, mailOutline, lockClosedOutline } from 'ionicons/icons';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showLoading, setShowLoading] = useState(false);
  const history = useHistory();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }

    setShowLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      toast.success('Connexion réussie');
      history.push('/home');
    } catch (error: any) {
      toast.error('Erreur: ' + error.message);
    } finally {
      setShowLoading(false);
    }
  };

  return (
    <IonPage>
      <IonContent className="ion-padding" style={{ '--background': '#ffffff' }}>
        <div style={{ padding: '60px 20px 40px 20px', textAlign: 'center' }}>
          <div style={{ 
            background: '#1a1a1a', 
            width: '80px', 
            height: '80px', 
            borderRadius: '24px', 
            display: 'flex', 
            alignItems: 'center', 
            justifyContent: 'center',
            margin: '0 auto 20px auto',
            boxShadow: '0 8px 30px rgba(0,0,0,0.15)'
          }}>
            <IonIcon icon={carOutline} style={{ fontSize: '40px', color: '#fff' }} />
          </div>
          <h1 style={{ fontWeight: 800, fontSize: '2rem', margin: 0, letterSpacing: '-1px' }}>Garage S5</h1>
          <p style={{ color: '#666', marginTop: '5px' }}>Votre mécanicien connecté</p>
        </div>

        <div style={{ padding: '0 10px' }}>
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '20px' }}>
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

            <div style={{ marginBottom: '35px' }}>
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

            <IonButton expand="block" type="submit" style={{ height: '64px', '--border-radius': '18px', '--box-shadow': '0 10px 25px rgba(0,0,0,0.08)', fontWeight: 700, fontSize: '1.05rem' }}>
              Se connecter
            </IonButton>
          </form>

          <div style={{ textAlign: 'center', marginTop: '45px' }}>
            <IonText color="medium" style={{ fontSize: '0.9rem', fontWeight: 500 }}>
              Nouveau sur Garage S5 ?
            </IonText>
            <div>
              <IonButton fill="clear" onClick={() => history.push('/register')} color="dark" style={{ fontWeight: 800, textTransform: 'none', fontSize: '1rem' }}>
                Créer un compte
              </IonButton>
            </div>
          </div>
        </div>
        <IonLoading isOpen={showLoading} message={'Identification...'} spinner="crescent" />
      </IonContent>
    </IonPage>
  );
};

export default Login;
