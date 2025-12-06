
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyChNci7LONP_bpjM5w2CaGQLkNOA7SD5Nc",
  authDomain: "mememyphoto-3019b.firebaseapp.com",
  projectId: "mememyphoto-3019b",
  storageBucket: "mememyphoto-3019b.firebasestorage.app",
  messagingSenderId: "263641353588",
  appId: "1:263641353588:web:70bd5656ba16e7fd14b021",
  measurementId: "G-J0JCS98QFR"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
