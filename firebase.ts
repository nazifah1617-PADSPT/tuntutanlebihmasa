
import { initializeApp } from "firebase/app";
import { 
  getFirestore, 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  deleteDoc, 
  doc,
  updateDoc
} from "firebase/firestore";
import { getAuth } from "firebase/auth";

// Firebase configuration using credentials provided by the user
const firebaseConfig = {
  apiKey: "AIzaSyDXuya9qCOQPidR6w0gwQwNudk8RF2et1s",
  authDomain: "tuntutan-ot.firebaseapp.com",
  projectId: "tuntutan-ot",
  storageBucket: "tuntutan-ot.firebasestorage.app",
  messagingSenderId: "403746578265",
  appId: "1:403746578265:web:5aed36abe9b5df2bf2f648",
  measurementId: "G-HL4XCV3M5Y"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export const saveClaim = async (claim: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Pengguna tidak log masuk");

  try {
    const docRef = await addDoc(collection(db, "claims"), {
      ...claim,
      userId: user.uid,
      createdAt: Date.now()
    });
    return docRef.id;
  } catch (error) {
    console.error("Error saving claim:", error);
    throw error;
  }
};

export const updateClaim = async (id: string, claim: any) => {
  const user = auth.currentUser;
  if (!user) throw new Error("Pengguna tidak log masuk");

  try {
    const claimRef = doc(db, "claims", id);
    await updateDoc(claimRef, {
      ...claim,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating claim:", error);
    throw error;
  }
};

export const getClaims = async () => {
  const user = auth.currentUser;
  if (!user) return [];

  try {
    const q = query(
      collection(db, "claims"), 
      where("userId", "==", user.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs.map(doc => ({
      ...doc.data(),
      id: doc.id
    })) as any[];

    // Sort client-side by createdAt descending
    return data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  } catch (error) {
    console.error("Error fetching claims:", error);
    throw error;
  }
};

export const deleteClaim = async (id: string) => {
  try {
    await deleteDoc(doc(db, "claims", id));
  } catch (error) {
    console.error("Error deleting claim:", error);
    throw error;
  }
};
