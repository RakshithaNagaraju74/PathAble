import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAV82u9G3syIfrsixb0bHQNEFwXGAd1yVI",
  authDomain: "accessmap-99473.firebaseapp.com",
  projectId: "accessmap-99473",
  storageBucket: "accessmap-99473.firebasestorage.app",
  messagingSenderId: "411618514003",
  appId: "1:411618514003:web:f50b3fa679aa9ba3dba2a6"
};
const app = initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
