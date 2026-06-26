import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged,
    signOut 
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Глобальная проверка авторизации
let authCheckInterval = null;

onAuthStateChanged(auth, (user) => {
    console.log('Auth state changed:', user ? user.email : 'null');
    
    if (user) {
        // Пользователь авторизован
        const protectedPages = ['login.html', 'register.html', 'index.html'];
        const currentPage = window.location.pathname;
        
        if (protectedPages.some(page => currentPage.includes(page))) {
            window.location.href = 'room.html';
        }
    } else {
        // Не авторизован
        const protectedPages = ['room.html', 'profile.html'];
        const currentPage = window.location.pathname;
        
        if (protectedPages.some(page => currentPage.includes(page))) {
            window.location.href = 'login.html';
        }
    }
});

// Форма входа
const loginForm = document.getElementById('loginForm');
if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        const submitBtn = e.target.querySelector('button[type="submit"]');
        
        // Блокируем кнопку
        if (submitBtn) submitBtn.disabled = true;
        
        try {
            console.log('Попытка входа:', email);
            
            // Очищаем перед входом
            localStorage.clear();
            
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            console.log('Успешный вход:', userCredential.user.email);
            
            // Сохраняем данные
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
            // Редирект
            setTimeout(() => {
                window.location.href = 'room.html';
            }, 100);
            
        } catch (error) {
            console.error('Ошибка входа:', error.code, error.message);
            
            let message = 'Ошибка входа';
            if (error.code === 'auth/user-not-found') {
                message = 'Пользователь не найден. Зарегистрируйтесь!';
            } else if (error.code === 'auth/wrong-password') {
                message = 'Неверный пароль!';
            } else if (error.code === 'auth/invalid-credential') {
                message = 'Неверный email или пароль! Попробуйте зарегистрироваться заново.';
            } else if (error.code === 'auth/too-many-requests') {
                message = 'Слишком много попыток. Подождите немного.';
            } else if (error.code === 'auth/invalid-email') {
                message = 'Некорректный email!';
            }
            
            alert(message);
        } finally {
            if (submitBtn) submitBtn.disabled = false;
        }
    });
}

// Форма регистрации
const registerForm = document.getElementById('registerForm');
if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value.trim();
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value;
        
        if (password.length < 6) {
            alert('Пароль должен быть не менее 6 символов!');
            return;
        }
        
        if (!username) {
            alert('Введите никнейм!');
            return;
        }
        
        try {
            console.log('Регистрация:', email, username);
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            
            // Создаём документ пользователя
            await setDoc(doc(db, 'users', uid), {
                username: username,
                email: email,
                coins: 0,
                level: 1,
                createdAt: Date.now(),
                lastLogin: Date.now()
            });
            
            console.log('Пользователь создан:', uid);
            
            // Сохраняем
            localStorage.setItem('userLoggedIn', 'true');
            localStorage.setItem('userEmail', email);
            
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
document.getElementById('loginBtn')?.addEventListener('click', () => {
    window.location.href = 'login.html';
});

document.getElementById('registerBtn')?.addEventListener('click', () => {
    window.location.href = 'register.html';
});
