import {
  getAuth,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { getFirebaseApp } from "./config";
import type { User, IpcResult } from "../../shared/types";

let currentUser: User | null = null;

function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export async function login(email: string, password: string): Promise<IpcResult<User>> {
  try {
    const auth = getFirebaseAuth();
    const credential = await signInWithEmailAndPassword(auth, email, password);
    const fbUser = credential.user;

    const isAdmin = email === "syselec208@gmail.com" || email.endsWith("@korea.kr");

    currentUser = {
      id: fbUser.uid,
      email: fbUser.email || email,
      name: fbUser.displayName || email.split("@")[0],
      role: isAdmin ? "admin" : "teacher",
      homeroom: null,
      specialRoom: null,
      schoolId: "",
    };

    return { success: true, data: currentUser };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export async function logout(): Promise<IpcResult> {
  try {
    const auth = getFirebaseAuth();
    await signOut(auth);
    currentUser = null;
    return { success: true };
  } catch (error) {
    return { success: false, error: String(error) };
  }
}

export function getCurrentUser(): User | null {
  return currentUser;
}
