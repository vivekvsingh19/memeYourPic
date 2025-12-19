import { db } from "../firebaseConfig";
import { doc, getDoc, setDoc, updateDoc, increment, runTransaction } from "firebase/firestore";
import { User } from "../types";

const COLLECTION_NAME = "users";

export const UserService = {
  /**
   * Syncs user with Firestore. If user doesn't exist, create profile with initial credits.
   * IF user exists, return their current credits.
   */
  async syncUser(user: User): Promise<number> {
    if (!user.uid) throw new Error("User UID is required");

    const userRef = doc(db, COLLECTION_NAME, user.uid);
    const userSnap = await getDoc(userRef);

    if (userSnap.exists()) {
      return userSnap.data().credits || 0;
    } else {
      // New User Bonus: 50 Credits (more than guest)
      const initialCredits = 50;

      await setDoc(userRef, {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName,
        photoURL: user.photoURL,
        credits: initialCredits,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      });

      return initialCredits;
    }
  },

  /**
   * Add credits to a user's account (e.g. after purchase)
   */
  async addCredits(uid: string, amount: number): Promise<number> {
    const userRef = doc(db, COLLECTION_NAME, uid);

    await updateDoc(userRef, {
      credits: increment(amount)
    });

    // Fetch updated balance to be sure
    const snap = await getDoc(userRef);
    return snap.data()?.credits || 0;
  },

  /**
   * Deduct credits transactionally to prevent race conditions or negative balance.
   */
  async deductCredits(uid: string, amount: number): Promise<number> {
    const userRef = doc(db, COLLECTION_NAME, uid);

    try {
      const newBalance = await runTransaction(db, async (transaction) => {
        const userDoc = await transaction.get(userRef);

        if (!userDoc.exists()) {
          throw new Error("User does not exist!");
        }

        const currentCredits = userDoc.data().credits || 0;

        if (currentCredits < amount) {
          throw new Error("Insufficient credits!");
        }

        const nextCredits = currentCredits - amount;
        transaction.update(userRef, { credits: nextCredits });
        return nextCredits;
      });

      return newBalance;
    } catch (e) {
      console.error("Transaction failed: ", e);
      throw e;
    }
  }
};
