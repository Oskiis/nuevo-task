// src/config/firebase.js
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth'; // Asegúrate de importar el auth
import { getFirestore } from 'firebase/firestore';

// Tu configuración de Firebase
const firebaseConfig = {
  apiKey: "AIzaSyDiRJy_u1ofvCPMBSbk6jzViUWha33Iqns",
  authDomain: "agenda-denedig.firebaseapp.com",
  databaseURL: "https://agenda-denedig-default-rtdb.firebaseio.com",
  projectId: "agenda-denedig",
  storageBucket: "agenda-denedig.appspot.com",
  messagingSenderId: "353268840262",
  appId: "1:353268840262:web:f18a282db4cfba52df5747"
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);

// Inicializa Auth
const auth = getAuth(app); // Inicializa el servicio de autenticación

// Inicializa Firestore
const db = getFirestore(app);

// Exporta 'db' y 'auth'
export { auth, db };

