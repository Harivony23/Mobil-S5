import { messaging, getToken, onMessage, VAPID_KEY } from '../firebase';
import { toast } from 'react-hot-toast';

export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      
      // Get FCM token
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY
      });
      
      if (token) {
        console.log('FCM Token:', token);
        return token;
      } else {
        console.log('No registration token available.');
        return null;
      }
    } else {
      console.log('Unable to get permission to notify.');
      toast.error('Notifications désactivées');
      return null;
    }
  } catch (error) {
    console.error('An error occurred while retrieving token:', error);
    return null;
  }
};

export const onMessageListener = () =>
  new Promise((resolve) => {
    onMessage(messaging, (payload) => {
      console.log('Message received. ', payload);
      resolve(payload);
    });
  });

export const setupForegroundNotifications = () => {
  onMessage(messaging, (payload) => {
    console.log('Foreground message received:', payload);
    
    if (payload.notification) {
      toast.success(
        `${payload.notification.title}\n${payload.notification.body}`,
        { duration: 5000 }
      );
    }
  });
};

/**
 * Envoie une notification locale (navigateur/système) sans passer par le serveur
 */
export const showLocalNotification = (title: string, body: string) => {
  if (Notification.permission === 'granted') {
    const notification = new Notification(title, {
      body: body,
      icon: '/assets/icon/favicon.png' // Assurez-vous que le chemin est correct
    });

    notification.onclick = () => {
      window.focus();
    };
  } else {
    // Si pas de permission système, on utilise au moins un toast
    toast.success(`${title}: ${body}`, { duration: 5000 });
  }
};

