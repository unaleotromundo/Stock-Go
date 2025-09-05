// login.js (opcional, si lo cargás con type="module" en el HTML)
import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

const firebaseConfig = {
    apiKey: "AIzaSyAQYm3bnopb82-l_0zpejACXCz3xFD0wys",
    authDomain: "stock-go-e5919.firebaseapp.com",
    projectId: "stock-go-e5919",
    storageBucket: "stock-go-e5919.firebasestorage.app",
    messagingSenderId: "1076533357182",
    appId: "1:1076533357182:web:6d432216677def2edfc62f"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// (resto del código de login va aquí si lo separás)