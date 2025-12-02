// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: "foody-aa2a3.firebaseapp.com",
  projectId: "foody-aa2a3",
  storageBucket: "foody-aa2a3.firebasestorage.app",
  messagingSenderId: "440189623753",
  appId: "1:440189623753:web:be760905ba7824ac261c18"
};



// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export {app,auth};