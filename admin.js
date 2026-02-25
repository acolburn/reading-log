import { initializeApp } from "https://www.gstatic.com/firebasejs/9.15.0/firebase-app.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "https://www.gstatic.com/firebasejs/9.15.0/firebase-auth.js";

export const appSettings = {
  apiKey: "AIzaSyCK6qpeB-3TfIPoyQ2cQZ_kp7QJrOs4RD4",
  authDomain: "test-project-b83e9.firebaseapp.com",
  databaseURL: "https://test-project-b83e9-default-rtdb.firebaseio.com",
  projectId: "test-project-b83e9",
  storageBucket: "test-project-b83e9.firebasestorage.app",
  messagingSenderId: "1072857068612",
  appId: "1:1072857068612:web:75e89df3d722d593cfb811",
};

export const app = initializeApp(appSettings);
export const auth = getAuth(app);

// Centralized error messages
const ERROR_MESSAGES = {
  "auth/email-already-in-use":
    "This email is already registered. Try signing in or use a different email.",
  "auth/invalid-email": "Please enter a valid email address.",
  "auth/weak-password":
    "Password is too weak. Use at least 6 characters with a mix of letters and numbers.",
  "auth/operation-not-allowed":
    "This sign-up method is not enabled. Contact support.",
  "auth/user-not-found":
    "No account found with that email. Please sign up first.",
  "auth/wrong-password":
    "Incorrect password. Try again or reset your password.",
  "auth/too-many-requests":
    "Too many attempts. Please wait a moment and try again.",
  "auth/user-disabled": "This account has been disabled. Contact support.",
  "auth/missing-email": "Please provide an email address.",
};

function handleAuthError(error) {
  const message =
    ERROR_MESSAGES[error?.code] ||
    error?.message ||
    "An unexpected error occurred. Please try again.";
  alert(`Error: ${message}`);
  return false;
}

export async function authCreateAccountWithEmail(email, password) {
  try {
    await createUserWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    return handleAuthError(error);
  }
}

export async function authSignInWithEmail(email, password) {
  try {
    await signInWithEmailAndPassword(auth, email, password);
    return true;
  } catch (error) {
    return handleAuthError(error);
  }
}
