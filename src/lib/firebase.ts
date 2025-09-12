import { initializeApp } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

// Configuration Firebase - PROD
const firebaseConfig = {
  apiKey: "AIzaSyBDV9scgvwkndF3rWp1vaRdfsbuM05LAJM",
  authDomain: "degranier-task.firebaseapp.com",
  projectId: "degranier-task",
  storageBucket: "degranier-task.firebasestorage.app",
  messagingSenderId: "183738125412",
  appId: "1:183738125412:web:54e4e06cb8f9323657a371"
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)

export default app
