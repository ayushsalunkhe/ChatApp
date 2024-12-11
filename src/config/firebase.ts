import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: "AIzaSyC4H7M_V3FpZRcm6kjaLYA9k3vKiu_E5f4",
  authDomain: "chat-app-ayush-salunkhe.firebaseapp.com",
  projectId: "chat-app-ayush-salunkhe",
  storageBucket: "chat-app-ayush-salunkhe.firebasestorage.app",
  messagingSenderId: "170045624488",
  appId: "1:170045624488:web:665bed668d88c584df729d",
  measurementId: "G-PLRTC7VP99"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
