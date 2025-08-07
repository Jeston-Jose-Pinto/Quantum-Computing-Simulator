import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyBvyRfGo48FJoMz41pkcMleQkQpyBrcfXQ",
  authDomain: "quantum-8efdf.firebaseapp.com",
  projectId: "quantum-8efdf",
  storageBucket: "quantum-8efdf.firebasestorage.app",
  messagingSenderId: "877222452690",
  appId: "1:877222452690:web:05904a209bdf8bbf313c0b",
  measurementId: "G-EL6X0B0V28"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
