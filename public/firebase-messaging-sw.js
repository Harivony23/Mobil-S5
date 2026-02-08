// firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

const firebaseConfig = {
  apiKey: "AIzaSyB8a3PudZR6CDr4ULhxuo5hER34Ezp61yc",
  authDomain: "garage-s5.firebaseapp.com",
  databaseURL: "https://garage-s5-default-rtdb.firebaseio.com",
  projectId: "garage-s5",
  storageBucket: "garage-s5.firebasestorage.app",
  messagingSenderId: "967270721767",
  appId: "1:967270721767:web:f4eaa4fe40cffed46f9a42"
};

firebase.initializeApp(firebaseConfig);

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'Garage Notification';
  const notificationOptions = {
    body: payload.notification.body || 'Vous avez une nouvelle notification',
    icon: '/favicon.png',
    badge: '/favicon.png',
    tag: 'garage-notification',
    requireInteraction: false,
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
