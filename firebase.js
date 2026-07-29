import { initializeApp } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/12.16.0/firebase-storage.js";

const firebaseConfig = {
  apiKey: "AIzaSyCJ_fqSqfni6mBojtjWGQogufE54kr9NRw",
  authDomain: "rohila-e-mitra.firebaseapp.com",
  projectId: "rohila-e-mitra",
  storageBucket: "rohila-e-mitra.firebasestorage.app",
  messagingSenderId: "630734393676",
  appId: "1:630734393676:web:1b1ef5130167f0c09ebfe9",
  measurementId: "G-TH1ELD0K1X"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
