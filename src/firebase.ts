import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDIviS3UdFaR851uCvvWq3d0nCmXYALzr0",
  authDomain: "luukyone-b17b7.firebaseapp.com",
  projectId: "luukyone-b17b7",
  storageBucket: "luukyone-b17b7.firebasestorage.app",
  messagingSenderId: "873286381157",
  appId: "1:873286381157:web:1d4d8b7bd0d5c17629a08c"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
