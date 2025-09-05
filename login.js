const firebaseConfig = {
    apiKey: "AIzaSyAQYm3bnopb82-l_0zpejACXCz3xFD0wys",
    authDomain: "stock-go-e5919.firebaseapp.com",
    projectId: "stock-go-e5919",
    storageBucket: "stock-go-e5919.firebasestorage.app",
    messagingSenderId: "1076533357182",
    appId: "1:1076533357182:web:6d432216677def2edfc62f"
};

firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const db = firebase.firestore();

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

function toggleTheme() {
    const body = document.body;
    const currentTheme = body.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    body.setAttribute('data-theme', newTheme);
    document.getElementById('themeToggle').textContent = newTheme === 'dark' ? '☀️' : '🌙';
}

document.getElementById('loginForm').addEventListener('submit', (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;

    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            const user = userCredential.user;
            db.collection('users').doc(user.uid).get()
                .then((doc) => {
                    if (doc.exists) {
                        const userData = doc.data();
                        showAlert('success', `¡Bienvenido, ${userData.name}!`);
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

function showAlert(type, message) {
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    alert.textContent = message;
    const content = document.querySelector('.content');
    content.insertBefore(alert, content.firstChild);
    setTimeout(() => alert.remove(), 4000);
}

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
});