import { initializeApp, getApps } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAU4H1aB_KDWhSA2WafN52vJYSL5PfU78I",
  authDomain: "financial-oversight-977e1.firebaseapp.com",
  projectId: "financial-oversight-977e1",
  storageBucket: "financial-oversight-977e1.firebasestorage.app",
  messagingSenderId: "386487613674",
  appId: "1:386487613674:web:9dd7617ed3c9955d723f93",
  measurementId: "G-XD84T3D936"
};

// Initialize Firebase only once
let app;
if (getApps().length === 0) {
  console.log('Initializing Firebase with new config...');
  app = initializeApp(firebaseConfig);
} else {
  console.log('Using existing Firebase app');
  app = getApps()[0];
}

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const analytics = getAnalytics(app);
export const storage = getStorage(app);

// Set auth persistence to LOCAL (survives page refreshes)
setPersistence(auth, browserLocalPersistence)
  .then(() => {
    console.log('Auth persistence set to LOCAL - sessions will survive refreshes');
  })
  .catch((error) => {
    console.error('Error setting auth persistence:', error);
  });

console.log('Firebase initialized with project:', firebaseConfig.projectId);