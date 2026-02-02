// src/firebase.ts (or wherever you initialize Firebase)
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

// Your Firebase configuration (from your Firebase project settings)
const firebaseConfig = {
  apiKey: "AIzaSyDuqy3XywWhV-M5553HPossmlJ52UUbPo0",
  authDomain: "food-bud-c5d23.firebaseapp.com",
  projectId: "food-bud-c5d23",
  storageBucket: "food-bud-c5d23.firebasestorage.app",
  messagingSenderId: "778782395867",
  appId: "1:778782395867:web:376386201568e5076d6bfe",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Get a reference to the Firestore service
export const db = getFirestore(app);
