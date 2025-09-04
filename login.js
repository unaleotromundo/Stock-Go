// Configuración de Firebase (reemplazá con tus credenciales)
const firebaseConfig = {
    apiKey: "TU_API_KEY",
    authDomain: "TU_AUTH_DOMAIN",
    projectId: "TU_PROJECT_ID",
    storageBucket: "TU_STORAGE_BUCKET",
    messagingSenderId: "TU_MESSAGING_SENDER_ID",
    appId: "TU_APP_ID"
};

// Inicializar Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

// === Cargar partículas animadas ===
function createParticles() {
    const container = document.getElementById('particles');
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

    for (let i = 0; i < count; i++) {
        setTimeout(create, i * 1000);
    }

    setInterval(() => {
        document.querySelectorAll('#particles .particle').forEach(p => p.remove());
        for (let i = 0; i < count; i++) {
            setTimeout(create, i * 500);
        }
    }, 30000);
}

// === Cambiar tema ===
function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

// === Mostrar formulario de login o registro ===
function showLoginForm() {
    document.getElementById('loginForm').style.display = 'block';
    document.getElementById('registerForm').style.display = 'none';
}

function showRegisterForm() {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'block';
}

// === Manejar login ===
document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Obtener rol del usuario desde Firestore
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        showAlert('success', `¡Bienvenido, ${userData.name}!`);
                        // Redirigir a index.html
                        window.location.href = 'index.html';
                    } else {
                        showAlert('warning', 'No se encontraron datos de usuario.');
                    }
                })
                .catch((error) => {
                    console.error('Error al obtener datos de usuario:', error);
                    showAlert('danger', 'Error al iniciar sesión.');
                });
        })
        .catch((error) => {
            console.error('Error en login:', error);
            showAlert('danger', 'Correo o contraseña incorrectos.');
        });
});

// === Manejar registro ===
document.getElementById('registerForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const name = document.getElementById('registerName').value.trim();
    const email = document.getElementById('registerEmail').value;
    const password = document.getElementById('registerPassword').value;
    const role = document.getElementById('registerRole').value;

    if (!name || !email || !password || !role) {
        showAlert('warning', 'Por favor, completa todos los campos.');
        return;
    }

    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            // Guardar datos adicionales en Firestore
            return db.collection('users').doc(user.uid).set({
                name: name,
                email: email,
                role: role,
                createdAt: new Date().toLocaleString('es-AR')
            });
        })
        .then(() => {
            showAlert('success', `Cuenta creada para ${name}. ¡Inicia sesión!`);
            showLoginForm();
        })
        .catch((error) => {
            console.error('Error en registro:', error);
            showAlert('danger', 'Error al crear la cuenta. Inténtalo de nuevo.');
        });
});

// === Mostrar alertas ===
function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    const content = document.querySelector('.content');
    content.insertBefore(alert, content.firstChild);
    setTimeout(() => alert.remove(), 4000);
}

// === Inicializar al cargar la página ===
document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    showLoginForm();
});