// firebase.ts
import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";
import { getFirestore } from "firebase/firestore";
import { getMessaging } from "firebase/messaging/sw";
import { getToken, onMessage } from "firebase/messaging";
// Firebase configuration object from your Firebase project settings
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_APIKEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTHDOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECTID,
  storageBucket: import.meta.env.VITE_FIREBASE_STOREGEBUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGINGSENDERID,
  appId: import.meta.env.VITE_FIREBASE_APPID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENTID,
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

export {
  firebaseConfig,
  imageDB,
  chatDB,
  message,
  generateToken,
};
