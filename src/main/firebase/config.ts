import { initializeApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCJIF15M0wVjb9QMBDJ87fmrk00VJp4ZOw",
  authDomain: "today-s-schedule-6c241.firebaseapp.com",
  projectId: "today-s-schedule-6c241",
  storageBucket: "today-s-schedule-6c241.firebasestorage.app",
  messagingSenderId: "812891804738",
  appId: "1:812891804738:web:2d371215502e3d158209db",
};

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
}
