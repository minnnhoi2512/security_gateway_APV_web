// firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging/sw";
import { getToken } from "firebase/messaging";
// Firebase configuration object from your Firebase project settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: "apv-gateway-security.firebaseapp.com",
  projectId: "apv-gateway-security",
  storageBucket: "apv-gateway-security.appspot.com",
  messagingSenderId: "312706996675",
  appId: "1:312706996675:web:4f31dada64321656564576",
  measurementId: "G-3NF2N2QQ2P",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const imageDB = getStorage(app);
const chatDB = getFirestore(app);
const message = getMessaging(app);

const generateToken = async () => {
  const permission = await Notification.requestPermission();
  // console.log(permission)
  if (permission === "granted") {
    const token = await getToken(message, {
      vapidKey: import.meta.env.VITE_FIREBASE_VAPID_TOKEN,
    });
    console.log(token);
  }
};

export { firebaseConfig, imageDB, chatDB, message, generateToken };
