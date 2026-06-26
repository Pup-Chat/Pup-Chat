import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const canvas = document.getElementById('roomCanvas');
const ctx = canvas.getContext('2d');

let currentUser = null;
let users = {};

// Настройки комнаты (вид сбоку)
const FLOOR_Y = 500;  // Уровень пола (от верхнего края)
const PUP_RADIUS = 30;

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
    // Небо (фон)
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#1a1a2e');
    gradient.addColorStop(1, '#16213e');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Пол (трава/земля)
    ctx.fillStyle = '#3a3a4e';
    ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
    
    // Полоска травы сверху
    ctx.fillStyle = '#2d5a27';
    ctx.fillRect(0, FLOOR_Y, canvas.width, 10);
    
    // Рисуем всех пользователей
    for (const uid in users) {
        const user = users[uid];
        drawPup(user.x, FLOOR_Y - PUP_RADIUS, uid === currentUser?.uid);
    }
}

// Отрисовка пупса (вид сбоку)
function drawPup(x, y, isMe) {
    // Тень под пупсом
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.beginPath();
    ctx.ellipse(x, FLOOR_Y + 5, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Тело (круг)
    ctx.fillStyle = isMe ? '#ff006e' : '#3a86ff';
    ctx.beginPath();
    ctx.arc(x, y, PUP_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    
    // Обводка
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    // Эмоция (смайлик)
    ctx.font = '30px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😊', x, y);
    
    // Имя над головой
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = 'white';
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

// Начальная отрисовка
drawRoom();
