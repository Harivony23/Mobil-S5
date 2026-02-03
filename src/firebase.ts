import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getDatabase } from "firebase/database";

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
export const db = getDatabase(app);
export default app;
