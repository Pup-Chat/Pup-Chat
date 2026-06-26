import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const canvas = document.getElementById('roomCanvas');
const ctx = canvas.getContext('2d');

let currentUser = null;
let users = {};

// Инициализация комнаты
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    
    // Загрузка данных пользователя
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('userName').textContent = userData.username || 'Пупс';
        document.getElementById('userCoins').textContent = '💰 ' + (userData.coins || 0);
    }
    
    // Добавление в комнату
    await addUserToRoom(user.uid);
    
    // Слушатель изменений комнаты
    listenToRoom();
});

// Добавление пользователя в комнату
async function addUserToRoom(uid) {
    const userRef = doc(db, 'rooms', 'room1', 'users', uid);
    try {
        await updateDoc(userRef, {
            x: 400,
            y: 300,
            emotion: '😊',
            lastUpdate: Date.now()
        });
    } catch {
        await setDoc(userRef, {
            x: 400,
            y: 300,
            emotion: '😊',
            lastUpdate: Date.now()
        });
    }
}

// Слушатель изменений комнаты
function listenToRoom() {
    onSnapshot(collection(db, 'rooms', 'room1', 'users'), (snapshot) => {
        users = {};
        snapshot.forEach(doc => {
            users[doc.id] = doc.data();
        });
        drawRoom();
    });
}

// Отрисовка комнаты
function drawRoom() {
    // Фон
    ctx.fillStyle = '#2a2a3e';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Пол
    ctx.fillStyle = '#3a3a4e';
    ctx.fillRect(0, canvas.height - 100, canvas.width, 100);
    
    // Рисуем всех пользователей
    for (const uid in users) {
        const user = users[uid];
        drawPup(user.x, user.y, user.emotion, uid === currentUser?.uid);
    }
}

// Отрисовка пупса
function drawPup(x, y, emotion, isMe) {
    // Тело
    ctx.fillStyle = isMe ? '#ff006e' : '#3a86ff';
    ctx.beginPath();
    ctx.arc(x, y, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Эмоция
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.fillText(emotion, x, y + 10);
    
    // Имя
    ctx.font = '14px Arial';
    ctx.fillStyle = 'white';
    ctx.fillText(isMe ? 'Ты' : 'Пупс', x, y - 40);
}

// Клик по комнате — движение
canvas.addEventListener('click', async (e) => {
    if (!currentUser) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    
    const userRef = doc(db, 'rooms', 'room1', 'users', currentUser.uid);
    await updateDoc(userRef, {
        x: x,
        y: y,
        lastUpdate: Date.now()
    });
});

// Кнопка профиля
const profileBtn = document.getElementById('profileBtn');
if (profileBtn) {
    profileBtn.addEventListener('click', () => {
        window.location.href = 'profile.html';
    });
}

// Начальная отрисовка
drawRoom();
