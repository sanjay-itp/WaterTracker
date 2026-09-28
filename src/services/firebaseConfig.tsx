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

// getReactNativePersistence isn't in the web typings, so load it via require
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { getReactNativePersistence } = require("firebase/auth");

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "watertracker-46278.firebaseapp.com",
  projectId: "watertracker-46278",
  storageBucket: "watertracker-46278.firebasestorage.app",
  messagingSenderId: "410271363753",
  appId: "1:410271363753:web:a552fcd1831ebd4e8cefb8",
  measurementId: "G-SJM5ZVW23K",
};

// Initialize immediately so `auth` is never undefined
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

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