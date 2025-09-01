import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const normalize = (value?: string) => (typeof value === 'string' ? value.trim() : '');

const firebaseConfig = {
  apiKey: normalize(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: normalize(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: normalize(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: normalize(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: normalize(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: normalize(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
  // measurementId is optional
  measurementId: normalize(process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID) || undefined
};

const requiredKeys = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'] as const;
const missing = requiredKeys.filter((key) => !firebaseConfig[key]);

if (missing.length > 0) {
  throw new Error(`Missing Firebase configuration values: ${missing.join(', ')}`);
}

// Avoid duplicate initialization during hot-reload/SSR
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export default app;