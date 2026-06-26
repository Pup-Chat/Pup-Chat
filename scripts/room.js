import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const canvas = document.getElementById('roomCanvas');
const ctx = canvas.getContext('2d');

let currentUser = null;
let users = {};

// Настройки комнаты (вид сбоку)
let FLOOR_Y = 500;
const PUP_RADIUS = 30;

// Адаптация canvas под размер окна
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    FLOOR_Y = canvas.height - 100;
    drawRoom();
}

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
    
    // Адаптация при изменении размера окна
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});

// Добавление пользователя в комнату
async function addUserToRoom(uid) {
    const userRef = doc(db, 'rooms', 'room1', 'users', uid);
    try {
        await updateDoc(userRef, {
            x: 400,
            lastUpdate: Date.now()
        });
    } catch {
        await setDoc(userRef, {
            x: 400,
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

// Отрисовка комнаты (вид сбоку)
function drawRoom() {
    // Светлое небо (градиент)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');  // Голубое небо
    gradient.addColorStop(1, '#E0F6FF');  // Светло-голубой
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Облака
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(100, 80, 40);
    drawCloud(300, 120, 50);
    drawCloud(600, 60, 35);
    drawCloud(900, 100, 45);
    
    // Солнце
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 80, 40, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFA500';
    ctx.beginPath();
    ctx.arc(canvas.width - 80, 80, 30, 0, Math.PI * 2);
    ctx.fill();
    
    // Пол (трава)
    ctx.fillStyle = '#90EE90';
    ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
    
    // Полоска земли
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, FLOOR_Y + 20, canvas.width, canvas.height - FLOOR_Y - 20);
    
    // Рисуем всех пользователей
    for (const uid in users) {
        const user = users[uid];
        drawPup(user.x, FLOOR_Y - PUP_RADIUS, uid === currentUser?.uid);
    }
}

// Рисуем облако
function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.9, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

// Отрисовка пупса (вид сбоку)
function drawPup(x, y, isMe) {
    // Тень под пупсом
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x, FLOOR_Y + 5, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Тело (круг)
    ctx.fillStyle = isMe ? '#FF1493' : '#4169E1';
    ctx.beginPath();
    ctx.arc(x, y, PUP_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Обводка
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Эмоция (смайлик)
    ctx.font = '28px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😊', x, y);
    
    // Имя над головой
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(isMe ? 'Ты' : 'Пупс', x, y - PUP_RADIUS - 20);
}

// Клик по комнате — движение только влево-вправо
canvas.addEventListener('click', async (e) => {
    if (!currentUser) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    
    // Ограничиваем движение в пределах комнаты
    const minX = PUP_RADIUS + 10;
    const maxX = canvas.width - PUP_RADIUS - 10;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    
    const userRef = doc(db, 'rooms', 'room1', 'users', currentUser.uid);
    await updateDoc(userRef, {
        x: clampedX,
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

// Кнопка выхода
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async (e) => {
        e.preventDefault();
        e.stopPropagation();
        try {
            await auth.signOut();
            window.location.href = 'index.html';
        } catch (error) {
            console.error('Ошибка выхода:', error);
            window.location.href = 'index.html';
        }
    });
}
