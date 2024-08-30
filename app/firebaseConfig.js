// firebaseConfig.js
import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';


// Replace this config object with your Firebase project config
const firebaseConfig = {
  apiKey: "AIzaSyD7hrf77BY-3bme0XV3ELBVBy2e1bObpEE",
  authDomain: "ai-bot-751c3.firebaseapp.com",
  projectId: "ai-bot-751c3",
  storageBucket: "ai-bot-751c3.appspot.com",
  messagingSenderId: "790288159041",
  appId: "1:790288159041:web:8cd65cd6530751b65151c0"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export { auth, provider, signInWithPopup, signOut };
