import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyAiJmoP5AXAY4ZjcyWjFerJwv-I_Tq5Ca8",
  authDomain: "youth-sports-tracker.firebaseapp.com",
  projectId: "youth-sports-tracker",
  storageBucket: "youth-sports-tracker.firebasestorage.app",
  messagingSenderId: "1005911976087",
  appId: "1:1005911976087:web:0d2d07b6d6678ffc95a1d2"
};

const app = initializeApp(firebaseConfig);

export const db = getFirestore(app);