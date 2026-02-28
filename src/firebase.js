// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getFirestore, collection, addDoc, query, where, getDocs, orderBy } from "firebase/firestore";
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

// User authentication storage
export async function saveUser(email, password, fullName) {
  try {
    const usersRef = collection(db, "users");
    const docRef = await addDoc(usersRef, {
      email,
      password, // Note: In production, use proper password hashing on backend
      fullName,
      createdAt: new Date(),
      userType: null,
      selectedDomains: []
    });
    return { success: true, uid: docRef.id };
  } catch (error) {
    console.error("Error saving user:", error);
    return { success: false, error: error.message };
  }
}

export async function getUserByEmail(email) {
  try {
    const usersRef = collection(db, "users");
    const q = query(usersRef, where("email", "==", email));
    const querySnapshot = await getDocs(q);
    if (querySnapshot.empty) return null;
    return { uid: querySnapshot.docs[0].id, ...querySnapshot.docs[0].data() };
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}

// Chat history storage
export async function saveChatMessage(userId, message) {
  try {
    const chatsRef = collection(db, "chats");
    const docRef = await addDoc(chatsRef, {
      userId,
      role: message.role,
      text: message.text,
      timestamp: new Date()
    });
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error("Error saving chat message:", error);
    return { success: false, error: error.message };
  }
}

export async function getChatHistory(userId) {
  try {
    const chatsRef = collection(db, "chats");
    const q = query(chatsRef, where("userId", "==", userId), orderBy("timestamp", "asc"));
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
}

// Export Firebase services
export { db, auth, storage };