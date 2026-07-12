// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GithubAuthProvider, GoogleAuthProvider } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey:import.meta.env.VITE_FIREBASE_API_KEY ,
authDomain: "nexus-ai-ed8bf.firebaseapp.com",
  projectId: "nexus-ai-ed8bf",
  storageBucket: "nexus-ai-ed8bf.firebasestorage.app",
  messagingSenderId: "1055623391802",
  appId: "1:1055623391802:web:1ad72b82ce354dd4132303"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

export const auth=getAuth(app)
export const googleProvider =
  new GoogleAuthProvider();

export const githubProvider =
  new GithubAuthProvider();