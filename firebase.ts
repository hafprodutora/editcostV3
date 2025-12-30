// src/firebase.ts
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBTSuzixVfo1ejBsG3guMQSic8uddz_uH4",
  authDomain: "editcost-web.firebaseapp.com",
  projectId: "editcost-web",
  storageBucket: "editcost-web.firebasestorage.app",
  messagingSenderId: "444938574748",
  appId: "1:444938574748:web:7b7385c03c0076e9ea4659"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
