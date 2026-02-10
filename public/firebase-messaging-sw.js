importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyB8a3PudZR6CDr4ULhxuo5hER34Ezp61yc",
  authDomain: "garage-s5.firebaseapp.com",
  projectId: "garage-s5",
  storageBucket: "garage-s5.firebasestorage.app",
  messagingSenderId: "967270721767",
  appId: "1:967270721767:web:f4eaa4fe40cffed46f9a42"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title;
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/assets/icon/favicon.png'
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});
