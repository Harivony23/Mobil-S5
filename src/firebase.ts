import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getMessaging, getToken, onMessage } from "firebase/messaging";

const firebaseConfig = {
  apiKey: "AIzaSyB8a3PudZR6CDr4ULhxuo5hER34Ezp61yc",
  authDomain: "garage-s5.firebaseapp.com",
  databaseURL: "https://garage-s5-default-rtdb.firebaseio.com",
  projectId: "garage-s5",
  storageBucket: "garage-s5.firebasestorage.app",
  messagingSenderId: "967270721767",
  appId: "1:967270721767:web:f4eaa4fe40cffed46f9a42",
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const messaging = getMessaging(app);

export const VAPID_KEY = "BNIRB_4pCxlToZSq8uj0z078Mh4VxLaF-Gzj9WVNtWmzJ9Aj34fQBJaBDl57BzhQk_eJVjUcxsFebyJ68imBHII";

export { getToken, onMessage };
export default app;
