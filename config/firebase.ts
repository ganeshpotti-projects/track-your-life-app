// THIRD PARTY
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDwGmIXaCfLttwUGt_8HrYMwKmMv65LDDY",
  authDomain: "expense-tracker-123bc.firebaseapp.com",
  projectId: "expense-tracker-123bc",
  storageBucket: "expense-tracker-123bc.firebasestorage.app",
  messagingSenderId: "192331521653",
  appId: "1:192331521653:web:427899af51f47b710ee23c",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// auth
export const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage),
});

// db
export const firestore = getFirestore(app);
