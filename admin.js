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

export const app = initializeApp(appSettings); // initialize firebase
export const auth = getAuth(app);

export async function authCreateAccountWithEmail(email, password) {
  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    return true; // Return true on successful sign-in
  } catch (error) {
    const code = error?.code || error?.message || "";
    switch (code) {
      // Sign up / create account
      case "auth/email-already-in-use":
        alert(
          "Error: This email is already registered. Try signing in or use a different email.",
        );
        break;
      case "auth/invalid-email":
        alert("Error: Please enter a valid email address.");
      case "auth/weak-password":
        alert(
          "Error: Password is too weak. Use at least 6 characters with a mix of letters and numbers.",
        );
        break;
      case "auth/operation-not-allowed":
        alert("Error: This sign-up method is not enabled. Contact support.");
        break;

      // Sign in
      case "auth/user-not-found":
        alert("Error: No account found with that email. Please sign up first.");
        break;
      case "auth/too-many-requests":
        alert("Error:Too many attempts. Please wait a moment and try again.");
        break;

      // Reset password / verify
      case "auth/user-disabled":
        alert("Error: This account has been disabled. Contact support.");
        break;
      case "auth/missing-email":
        alert("Error: Please provide an email address.");
        break;

      // Fallback
      default:
        // If Firebase provides a human-readable message, prefer it (but don't leak internal codes)
        return (
          error?.message || "An unexpected error occurred. Please try again."
        );
    }
    return false; // return false on error
  }
}

export async function authSignInWithEmail(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password,
    );
    const user = userCredential.user;
    return true; // Return true on successful sign-in
  } catch (error) {
    const code = error?.code || error?.message || "";

    switch (code) {
      // Sign up / create account
      case "auth/email-already-in-use":
        alert("Error: Please enter a valid email address.");
        break; // Add break to prevent fall-through
      case "auth/operation-not-allowed":
        alert("Error: This sign-up method is not enabled. Contact support.");
        break;

      // Sign in
      case "auth/user-not-found":
        alert("Error: No account found with that email. Please sign up first.");
        break;
      case "auth/wrong-password":
        alert("Error: Incorrect password. Try again or reset your password.");
        break;
      case "auth/invalid-email":
        alert("Error: Please enter a valid email address.");
        break;
      case "auth/too-many-requests":
        alert("Error: Too many attempts. Please wait a moment and try again.");
        break;

      // Reset password / verify
      case "auth/user-disabled":
        alert("Error: This account has been disabled. Contact support.");
        break;
      case "auth/missing-email":
        alert("Error: Please provide an email address.");
        break;

      // Fallback
      default:
        alert(error?.message) ||
          alert("An unexpected error occurred. Please try again.");
    }
    return false; // Return false on error
  }
}
