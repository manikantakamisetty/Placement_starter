// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getStorage } from "firebase/storage";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
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
const analytics = getAnalytics(app);
const db = getFirestore(app);
const auth = getAuth(app);
const storage = getStorage(app);

// Export Firebase services
export { db, auth, storage };