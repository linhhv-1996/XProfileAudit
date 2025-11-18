import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

// Config Public của Firebase (Lấy trong Console > Project Settings)
const firebaseConfig = {
  apiKey: "AIzaSyBWG4FV5wUhB-FCumQVdgD2HW2jY5YGlD0",
  authDomain: "xprofilebooster.firebaseapp.com",
  projectId: "xprofilebooster",
  storageBucket: "xprofilebooster.firebasestorage.app",
  messagingSenderId: "892430824956",
  appId: "1:892430824956:web:3f75ed7245b7555d84ee79",
  measurementId: "G-61VRM1TCD4"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const loginWithGoogle = async () => {
  return await signInWithPopup(auth, googleProvider);
};
