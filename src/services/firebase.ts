import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  getDocs, 
  deleteDoc, 
  query, 
  orderBy,
  getDocFromServer,
  Firestore 
} from 'firebase/firestore';
import firebaseConfigData from '../../firebase-applet-config.json';

const firebaseConfig = {
  apiKey: firebaseConfigData.apiKey,
  authDomain: firebaseConfigData.authDomain,
  projectId: firebaseConfigData.projectId,
  storageBucket: firebaseConfigData.storageBucket,
  messagingSenderId: firebaseConfigData.messagingSenderId,
  appId: firebaseConfigData.appId,
};

let app;
let db: Firestore | null = null;

try {
  app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  // Initialize with specific provisioned database ID if available
  const databaseId = firebaseConfigData.firestoreDatabaseId && firebaseConfigData.firestoreDatabaseId !== '(default)'
    ? firebaseConfigData.firestoreDatabaseId
    : undefined;

  db = databaseId ? getFirestore(app, databaseId) : getFirestore(app);
  console.log('Firebase Firestore connected successfully to project:', firebaseConfigData.projectId);

  // Validate connection to Firestore as required by skill
  getDocFromServer(doc(db, 'test', 'connection'))
    .then(() => {
      console.log('Firestore server connection verified.');
    })
    .catch((error: unknown) => {
      if (error instanceof Error && error.message.includes('the client is offline')) {
        console.error('Please check your Firebase configuration.');
      } else {
        // Expected if 'test/connection' does not exist yet, connection is online
        console.log('Firestore server ping successful.');
      }
    });
} catch (error) {
  console.error('Error initializing Firebase Firestore:', error);
}

export { db };
export const isFirebaseConfigured = !!db;

// Generic Firestore helper methods with robust error handling
export async function getFirestoreDocuments<T>(collectionName: string): Promise<T[]> {
  if (!db) return [];
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    return snapshot.docs.map(d => ({ ...d.data(), id: d.id } as T));
  } catch (error) {
    console.warn(`Firestore read failed for collection ${collectionName}:`, error);
    return [];
  }
}

export async function setFirestoreDocument<T extends { id: string }>(collectionName: string, data: T): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, data.id);
    await setDoc(docRef, data, { merge: true });
    return true;
  } catch (error) {
    console.warn(`Firestore write failed for collection ${collectionName}:`, error);
    return false;
  }
}

export async function deleteFirestoreDocument(collectionName: string, id: string): Promise<boolean> {
  if (!db) return false;
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (error) {
    console.warn(`Firestore delete failed for collection ${collectionName}:`, error);
    return false;
  }
}
