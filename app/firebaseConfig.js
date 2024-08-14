// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';


// Replace this config object with your Firebase project config
const firebaseConfig = {
  apiKey: ,
  authDomain:,
  projectId:,
  storageBucket:,
  messagingSenderId:,
  appId:
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
