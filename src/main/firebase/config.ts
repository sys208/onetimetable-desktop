import { initializeApp, type FirebaseApp } from "firebase/app";

const firebaseConfig = {
  apiKey: "AIzaSyCsEUK-YmENB6yD1hatCKS3MDAuD5emXA8",
  authDomain: "today-s-schedule-6c241.firebaseapp.com",
  projectId: "today-s-schedule-6c241",
  storageBucket: "today-s-schedule-6c241.appspot.com",
};

let firebaseApp: FirebaseApp | null = null;

export function getFirebaseApp(): FirebaseApp {
  if (!firebaseApp) {
    firebaseApp = initializeApp(firebaseConfig);
  }
  return firebaseApp;
}
