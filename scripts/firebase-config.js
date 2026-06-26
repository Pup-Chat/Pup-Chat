// Firebase конфигурация (замени на свои данные из Firebase Console)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAqTTdn0Tzw-XwzYdMmplzHjv2EyLyrwFM",
  authDomain: "pup-chat-3f5f9.firebaseapp.com",
  projectId: "pup-chat-3f5f9",
  storageBucket: "pup-chat-3f5f9.firebasestorage.app",
  messagingSenderId: "171121112414",
  appId: "1:171121112414:web:1faae251b5e444f9898bcf"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
