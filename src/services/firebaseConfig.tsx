import ReactNativeAsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import {
  Auth,
  createUserWithEmailAndPassword,
  getAuth,
  initializeAuth,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  updateProfile,
} from "firebase/auth";
import { Platform } from "react-native";
import { doc, getFirestore, setDoc } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

// getReactNativePersistence isn't in the web typings, so load it via require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "AIzaSyAmCTkz0mS6BKean94x4x9DQr_DMA0VGdA",
  authDomain: "watertracker-6aaee.firebaseapp.com",
  projectId: "watertracker-6aaee",
  storageBucket: "watertracker-6aaee.firebasestorage.app",
  messagingSenderId: "1082521389903",
  appId: "1:1082521389903:web:d0077cb4ceece7b815933a",
  measurementId: "G-R7C0J0M7E8"
};


// const app =initializeApp (firebaseConfig);

// export const auth=getAuth(app);
// export const db = getFirestore(app);

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const db = getFirestore(app);

let authInstance: Auth;
try {
  authInstance =
    Platform.OS === "web"
      ? getAuth(app)
      : initializeAuth(app, {
          persistence: getReactNativePersistence(ReactNativeAsyncStorage),
        });
} catch (error) {
  // Happens on fast refresh: auth was already initialized
  authInstance = getAuth(app);
}

export const auth = authInstance;
export { app };

export async function signUp(fullName: string, email: string, password: string) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: fullName });
  return userCredential;
}

export function signIn(email: string, password: string) {
  return signInWithEmailAndPassword(auth, email, password);
}

export function getCurrentUser() {
  return auth.currentUser;
}

export function signOut() {
  return firebaseSignOut(auth);
}