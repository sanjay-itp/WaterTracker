import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { Auth, createUserWithEmailAndPassword, getAuth, initializeAuth, signInWithEmailAndPassword, updateProfile } from "firebase/auth";

const firebaseAuth = require("firebase/auth");
const persistence = typeof firebaseAuth?.getReactNativePersistence === "function" ? firebaseAuth.getReactNativePersistence(ReactNativeAsyncStorage) : undefined;


const firebaseConfig = {
  apiKey: "AIzaSyCb7fedlLlsw8vqnlsC9_Wn3eqNnzRreRM",
  authDomain: "watertracker-46278.firebaseapp.com",
  projectId: "watertracker-46278",
  storageBucket: "watertracker-46278.firebasestorage.app",
  messagingSenderId: "410271363753",
  appId: "1:410271363753:web:a552fcd1831ebd4e8cefb8",
  measurementId: "G-SJM5ZVW23K"
};


let app: FirebaseApp | null = null;
let auth: Auth;
// Initialize Firebase
export function initializeFirebase() {
  app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  try {
    auth = initializeAuth(app, { persistence });
  } catch (error) {
    console.error("Error initializing auth", error);
    auth = getAuth(app);
  }
  return { app, auth };
}


export async function signUp(fullName: string, email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password)
  await updateProfile(userCredential.user, { displayName: fullName })
  return userCredential;
}


export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function signOut() {
  return signOut();
}

export { app, auth };