import { auth, db } from './firebase-config.js';
import { 
    signInWithEmailAndPassword, 
    createUserWithEmailAndPassword,
    onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";
import { doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

// Проверка авторизации
onAuthStateChanged(auth, (user) => {
    if (user) {
        const path = window.location.pathname;
        if (path.includes('login.html') || path.includes('register.html') || path === '/' || path.endsWith('index.html')) {
            window.location.href = 'room.html';
        }
    } else {
        const path = window.location.pathname;
        if (path.includes('room.html') || path.includes('profile.html')) {
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
        const loginBtn = document.getElementById('loginBtn');
        const errorDiv = document.getElementById('errorMessage');
        
        // Показываем загрузку
        loginBtn.disabled = true;
        loginBtn.textContent = '⏳ Вход...';
        errorDiv.classList.remove('show');
        
        try {
            console.log(' Попытка входа:', email);
            
            await signInWithEmailAndPassword(auth, email, password);
            
            console.log('✅ Успешный вход!');
            window.location.href = 'room.html';
            
        } catch (error) {
            console.error('❌ Ошибка входа:', error.code, error.message);
            
            let message = '';
            if (error.code === 'auth/user-not-found') {
                message = '🔍 Пользователь не найден! Зарегистрируйтесь.';
            } else if (error.code === 'auth/wrong-password') {
                message = '🔑 Неверный пароль! Попробуйте ещё раз.';
            } else if (error.code === 'auth/invalid-credential') {
                message = '❌ Неверный email или пароль! Проверьте данные или зарегистрируйтесь.';
            } else if (error.code === 'auth/too-many-requests') {
                message = '⏳ Слишком много попыток. Подождите немного.';
            } else if (error.code === 'auth/invalid-email') {
                message = '📧 Некорректный email!';
            } else {
                message = '⚠️ Ошибка: ' + error.message;
            }
            
            errorDiv.textContent = message;
            errorDiv.classList.add('show');
        } finally {
            loginBtn.disabled = false;
            loginBtn.textContent = '🚀 Войти';
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
        
        if (!username) {
            alert('⚠️ Введите никнейм!');
            return;
        }
        
        if (password.length < 6) {
            alert('⚠️ Пароль должен быть не менее 6 символов!');
            return;
        }
        
        try {
            console.log('📝 Регистрация:', email, username);
            
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);
            const uid = userCredential.user.uid;
            
            await setDoc(doc(db, 'users', uid), {
                username: username,
                email: email,
                coins: 0,
                level: 1,
                createdAt: Date.now(),
                lastLogin: Date.now()
            });
            
            console.log('✅ Регистрация успешна!');
            window.location.href = 'room.html';
            
        } catch (error) {
            console.error('❌ Ошибка регистрации:', error);
            
            let message = '⚠️ Ошибка регистрации';
            if (error.code === 'auth/email-already-in-use') {
                message = '📧 Этот email уже зарегистрирован! Войдите вместо этого.';
            } else if (error.code === 'auth/weak-password') {
                message = '🔑 Пароль слишком слабый (минимум 6 символов)!';
            } else if (error.code === 'auth/invalid-email') {
                message = '📧 Некорректный email!';
            }
            
            alert(message);
        }
    });
}

// Кнопки
document.getElementById('loginBtn')?.addEventListener('click', () => {
    window.location.href = 'login.html';
});

document.getElementById('registerBtn')?.addEventListener('click', () => {
    window.location.href = 'register.html';
});
