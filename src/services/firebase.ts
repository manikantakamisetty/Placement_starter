import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDAc7-_okgkFC1grbu7xZjwzUTX5c0unzQ",
  authDomain: "getplacelikeapro-d6807.firebaseapp.com",
  projectId: "getplacelikeapro-d6807",
  storageBucket: "getplacelikeapro-d6807.firebasestorage.app",
  messagingSenderId: "905293781815",
  appId: "1:905293781815:web:0cd1a7b253958fcb3158b2",
  measurementId: "G-KYCDMWDL3J"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
