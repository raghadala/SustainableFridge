// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import {getFirestore} from 'firebase/firestore'
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAsKS5c6GifdD0uBU7l-m7UoNQBa31f9rg",
  authDomain: "sustainablefridge.firebaseapp.com",
  projectId: "sustainablefridge",
  storageBucket: "sustainablefridge.appspot.com",
  messagingSenderId: "443469599893",
  appId: "1:443469599893:web:6e38d07bd89f3c1301b79c",
  measurementId: "G-KMNJJNPNG5"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const firestore = getFirestore(app)

export {firestore}