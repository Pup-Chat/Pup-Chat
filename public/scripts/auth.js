import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
    if (user) {
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html') ||
            window.location.pathname === '/' || 
            window.location.pathname === '/index.html') {
            window.location.href = 'room.html';
        }
    } else {
        if (window.location.pathname.includes('room.html') ||
            window.location.pathname.includes('profile.html')) {
            window.location.href = 'login.html';
        }
    }
});

// Форма входа
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            await signInWithEmailAndPassword(auth, email, password);
            window.location.href = 'room.html';
        } catch (error) {
            alert('Ошибка входа: ' + error.message);
        }
    });
}

// Форма регистрации
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('username').value;
        const email = document.getElementById('email').value;
        const password = document.getElementById('password').value;
        
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            
            // Создаём документ пользователя
            await setDoc(doc(db, 'users', userCredential.user.uid), {
                username: username,
                email: email,
                coins: 0,
                level: 1,
                createdAt: Date.now()
            });
            
            window.location.href = 'room.html';
        } catch (error) {
            alert('Ошибка регистрации: ' + error.message);
        }
    });
}

// Кнопки на главной
const loginBtn = document.getElementById('loginBtn');
if (loginBtn) {
    loginBtn.addEventListener('click', () => {
        window.location.href = 'login.html';
    });
}

const registerBtn = document.getElementById('registerBtn');
if (registerBtn) {
    registerBtn.addEventListener('click', () => {
        window.location.href = 'register.html';
    });
}

// Выход
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        await signOut(auth);
        window.location.href = 'index.html';
    });
}
