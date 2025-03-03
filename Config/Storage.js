// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBCGT81AdVFMY-1wxF9aF2lrkzHYtR7Un4",
  authDomain: "voyagevoyage-9d1d2.firebaseapp.com",
  databaseURL:
    "https://voyagevoyage-9d1d2-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "voyagevoyage-9d1d2",
  storageBucket: "voyagevoyage-9d1d2.appspot.com",
  messagingSenderId: "908694614496",
  appId: "1:908694614496:web:9f4638a4f95cef1fc17b85",
  measurementId: "G-MPHL3YZN6L",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
