// === login.js (para login.html) ===
// Este archivo se carga como módulo en login.html

import { initializeApp } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js';
import { getAuth, signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-auth.js';
import { getFirestore, doc, getDoc } from 'https://www.gstatic.com/firebasejs/12.2.1/firebase-firestore.js';

// 🔐 Configuración de Firebase
const firebaseConfig = {
    apiKey: "AIzaSyAQYm3bnopb82-l_0zpejACXCz3xFD0wys",
    authDomain: "stock-go-e5919.firebaseapp.com",
    projectId: "stock-go-e5919",
    storageBucket: "stock-go-e5919.firebasestorage.app",
    messagingSenderId: "1076533357182",
    appId: "1:1076533357182:web:6d432216677def2edfc62f",
    measurementId: "G-D46G6XMEQY"
};

// Inicializar Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

// Manejar el login
document.getElementById('loginForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const user = userCredential.user;

        // Leer rol desde Firestore
        const userDocRef = doc(db, 'users', user.uid);
        const userDocSnap = await getDoc(userDocRef);

        if (userDocSnap.exists()) {
            const userData = userDocSnap.data();
            const role = userData.role || 'user';

            // Guardar en sesión
            sessionStorage.setItem('userRole', role);
            sessionStorage.setItem('userName', userData.name || 'Usuario');
            sessionStorage.setItem('userEmail', email);

            // Redirigir
            if (role === 'admin') {
                window.location.href = 'admin.html';
            } else {
                window.location.href = 'user.html';
            }
        } else {
            showAlert('danger', '❌ No tienes permisos. Contacta al administrador.');
        }
    } catch (error) {
        let message = 'Error al iniciar sesión.';
        switch (error.code) {
            case 'auth/user-not-found':
                message = 'No se encontró una cuenta.';
                break;
            case 'auth/wrong-password':
                message = 'Contraseña incorrecta.';
                break;
            default:
                message = error.message;
        }
        showAlert('danger', '❌ ' + message);
    }
});

// === Alertas ===
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    const container = document.querySelector('.content') || document.body;
    container.insertBefore(alert, container.firstChild);
    setTimeout(() => alert.remove(), 5000);
}

// === Tema y Partículas (opcional en index.html) ===
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('themeToggle')?.textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    const count = window.innerWidth > 768 ? 20 : 8;
    const create = () => {
        const p = document.createElement('div');
        p.classList.add('particle');
        const size = Math.random() * 6 + 2;
        p.style.width = `${size}px`;
        p.style.height = `${size}px`;
        p.style.left = `${Math.random() * 100}vw`;
        p.style.animationDelay = `${Math.random() * 5}s`;
        p.style.animationDuration = `${Math.random() * 10 + 10}s`;
        container.appendChild(p);
        setTimeout(() => {
            if (p.parentElement === container) container.removeChild(p);
        }, 20000);
    };
    for (let i = 0; i < count; i++) setTimeout(create, i * 1000);
    setInterval(() => {
        document.querySelectorAll('#particles .particle').forEach(p => p.remove());
        for (let i = 0; i < count; i++) setTimeout(create, i * 500);
    }, 30000);
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});