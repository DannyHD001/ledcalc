import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || '',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || '',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || ''
};

// Check if Firebase config is valid
const isFirebaseConfigValid = Object.values(firebaseConfig).every(value => value && value !== '');

let app: any = null;
let db: any = null;
let auth: any = null;

if (isFirebaseConfigValid) {
  try {
    // Initialize Firebase
    app = initializeApp(firebaseConfig);
    
    // Initialize Firestore
    db = getFirestore(app);
    
    // Initialize Auth
    auth = getAuth(app);
  } catch (error) {
    console.warn('Firebase initialization failed:', error);
  }
}

export { db, auth };
export const isFirebaseAvailable = isFirebaseConfigValid && app !== null;
export default app;
