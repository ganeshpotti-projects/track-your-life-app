// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getFirestore } from "firebase/firestore";

// Your web app's Firebase configuration
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
