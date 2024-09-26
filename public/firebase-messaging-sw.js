// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/9.18.0/firebase-messaging.js');


// Initialize Firebase
firebase.initializeApp({
    apiKey: "AIzaSyCFEtcwcAvcV_Hb_K6XxWWn_eFKVEJay94",
    authDomain: "apv-gateway-security.firebaseapp.com",
    projectId: "apv-gateway-security",
    storageBucket: "apv-gateway-security.appspot.com",
    messagingSenderId: "312706996675",
    appId: "1:312706996675:web:4f31dada64321656564576",
    measurementId: "G-3NF2N2QQ2P",
});

// Retrieve an instance of Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
    console.log('Received background message ', payload);
    const notificationTitle = payload.notification.title;
    const notificationOptions = {
        body: payload.notification.body,
        icon: '/firebase-logo.png' // Change to your icon path
    };

    return self.registration.showNotification(notificationTitle, notificationOptions);
});