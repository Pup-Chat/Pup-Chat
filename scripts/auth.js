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
        // Пользователь авторизован
        if (window.location.pathname.includes('login.html') || 
            window.location.pathname.includes('register.html') ||
            window.location.pathname === '/' || 
            window.location.pathname === '/index.html' ||
            window.location.pathname === '/Pup-Chat/' ||
            window.location.pathname === '/Pup-Chat/index.html') {
            window.location.href = 'room.html';
        }
    } else {
        // Не авторизован
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
            // Принудительный редирект после успешного входа
            window.location.href = 'room.html';
        } catch (error) {
            console.error('Ошибка входа:', error);
            let message = 'Ошибка входа';
            if (error.code === 'auth/user-not-found') {
                message = 'Пользователь не найден. Зарегистрируйтесь!';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Неверный пароль!';
            } else if (error.code === 'auth/invalid-credential') {
                message = 'Неверный email или пароль!';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Слишком много попыток. Попробуйте позже.';
            }
            alert(message);
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
        
        if (password.length < 6) {
            alert('Пароль должен быть не менее 6 символов!');
            return;
        }
        
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
            console.error('Ошибка регистрации:', error);
            let message = 'Ошибка регистрации';
            if (error.code === 'auth/email-already-in-use') {
                message = 'Этот email уже зарегистрирован!';
            } else if (error.code === 'auth/weak-password') {
                message = 'Пароль слишком слабый (минимум 6 символов)!';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Некорректный email!';
            }
            alert(message);
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
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        try {
            await signOut(auth);
            // Принудительная очистка и редирект
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Ошибка выхода:', error);
            // Даже если ошибка - перенаправляем на главную
            window.location.href = 'index.html';
        }
    });
}
