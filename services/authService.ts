import { 
  signInWithPopup, 
  GoogleAuthProvider, 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  UserCredential
} from "firebase/auth";
import { auth } from "../firebaseConfig";

const googleProvider = new GoogleAuthProvider();

export const authService = {
  // Login with Google
  loginWithGoogle: async (): Promise<UserCredential> => {
    try {
      return await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google", error);
      throw error;
    }
  },

  // Register with Email/Password
  register: async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error registering", error);
      throw error;
    }
  },

  // Login with Email/Password
  login: async (email: string, password: string): Promise<UserCredential> => {
    try {
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (error) {
      console.error("Error logging in", error);
      throw error;
    }
  },

  // Logout
  logout: async (): Promise<void> => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  },

  // Password Reset
  resetPassword: async (email: string): Promise<void> => {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      console.error("Error sending password reset email", error);
      throw error;
    }
  }
};