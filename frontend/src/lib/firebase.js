import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

// VITE_* values let each deployment point at its own Firebase project. The
// bundled values keep the existing AI Studio Firebase project working locally.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'AIzaSyA2kqxGS6Mt5UU9EUWNhtCVM_1niiqsFC0',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'dependable-deck-h6shk.firebaseapp.com',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'dependable-deck-h6shk',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'dependable-deck-h6shk.firebasestorage.app',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '891200403514',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:891200403514:web:11c670c4da2017085d5d03',
};

const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
