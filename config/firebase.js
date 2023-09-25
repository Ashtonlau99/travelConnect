import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore, collection} from 'firebase/firestore'
import { getStorage } from 'firebase/storage';



const firebaseConfig = {
  apiKey: "AIzaSyDWS54FSuwATBe6nWPlAlbBPJJTwog_pIg",
  authDomain: "travelconnect-21388.firebaseapp.com",
  projectId: "travelconnect-21388",
  storageBucket: "travelconnect-21388.appspot.com",
  messagingSenderId: "185088237645",
  appId: "1:185088237645:web:e0856fc0d52073be55bc04",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
export const storage = getStorage(app);

export const userRef = collection(db, 'users')

export default app;

