// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDtpr1JSAiN8X3LQWhXKtUi-09bZFpEGNY",
  authDomain: "insurance-system-6427e.firebaseapp.com",
  projectId: "insurance-system-6427e",
  storageBucket: "insurance-system-6427e.firebasestorage.app",
  messagingSenderId: "1015316665701",
  appId: "1:1015316665701:web:57210f8bba5c98be8cbd8c",
  measurementId: "G-9FKK9EFLSV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);