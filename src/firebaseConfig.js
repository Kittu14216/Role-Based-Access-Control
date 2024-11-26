// firebaseConfig.js
import firebase from "firebase/compat/app";
import "firebase/compat/firestore";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCUW7b8H2qKvjIf4-vVpX4_GWgTQb2rmVA",
  authDomain: "rbac-cb2a0.firebaseapp.com",
  projectId: "rbac-cb2a0",
  storageBucket: "rbac-cb2a0.firebasestorage.app",
  messagingSenderId: "1038611561699",
  appId: "1:1038611561699:web:3319926187d521356959d6",
};

// Initialize Firebase
const firebaseApp = !firebase.apps.length
  ? firebase.initializeApp(firebaseConfig)
  : firebase.app();

const db = firebaseApp.firestore();

export { db };
