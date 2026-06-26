import { auth, db } from './firebase-config.js';
import { doc, getDoc, updateDoc, setDoc, onSnapshot, collection } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const canvas = document.getElementById('roomCanvas');
const ctx = canvas.getContext('2d');

let currentUser = null;
let users = {};
let FLOOR_Y = 0;

// Адаптация canvas
function resizeCanvas() {
    const container = canvas.parentElement;
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
    FLOOR_Y = canvas.height * 0.6; // Пол на 60% высоты
    drawRoom();
}

// Инициализация
auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    currentUser = user;
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('userName').textContent = userData.username || 'Пупс';
        document.getElementById('userCoins').textContent = '💰 ' + (userData.coins || 0);
    }
    
    await addUserToRoom(user.uid);
    listenToRoom();
    
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();
});

async function addUserToRoom(uid) {
    const userRef = doc(db, 'rooms', 'room1', 'users', uid);
    try {
        await updateDoc(userRef, {
            x: canvas.width / 2 || 400,
            lastUpdate: Date.now()
        });
    } catch {
        await setDoc(userRef, {
            x: canvas.width / 2 || 400,
            lastUpdate: Date.now()
        });
    }
}

function listenToRoom() {
    onSnapshot(collection(db, 'rooms', 'room1', 'users'), (snapshot) => {
        users = {};
        snapshot.forEach(doc => {
            users[doc.id] = doc.data();
        });
        drawRoom();
    });
}

function drawRoom() {
    // Небо
    const skyGradient = ctx.createLinearGradient(0, 0, 0, FLOOR_Y);
    skyGradient.addColorStop(0, '#87CEEB');
    skyGradient.addColorStop(1, '#E0F6FF');
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, FLOOR_Y);
    
    // Трава
    const grassGradient = ctx.createLinearGradient(0, FLOOR_Y, 0, canvas.height);
    grassGradient.addColorStop(0, '#90EE90');
    grassGradient.addColorStop(1, '#228B22');
    ctx.fillStyle = grassGradient;
    ctx.fillRect(0, FLOOR_Y, canvas.width, canvas.height - FLOOR_Y);
    
    // Солнце
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.arc(canvas.width - 100, 80, 50, 0, Math.PI * 2);
    ctx.fill();
    
    // Облака
    ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
    drawCloud(150, 100, 40);
    drawCloud(400, 150, 50);
    drawCloud(700, 80, 35);
    
    // Пупсы
    for (const uid in users) {
        const user = users[uid];
        if (user.x !== undefined) {
            drawPup(user.x, FLOOR_Y - 40, uid === currentUser?.uid);
        }
    }
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.9, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

function drawPup(x, y, isMe) {
    // Тень
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.beginPath();
    ctx.ellipse(x, FLOOR_Y + 5, 25, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    
    // Тело
    ctx.fillStyle = isMe ? '#FF1493' : '#4169E1';
    ctx.beginPath();
    ctx.arc(x, y, 35, 0, Math.PI * 2);
    ctx.fill();
    
    // Обводка
    ctx.strokeStyle = 'white';
    ctx.lineWidth = 4;
    ctx.stroke();
    
    // Смайлик
    ctx.font = '32px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('😊', x, y);
    
    // Имя
    ctx.font = 'bold 16px Arial';
    ctx.fillStyle = '#333';
    ctx.fillText(isMe ? 'Ты' : 'Пупс', x, y - 50);
}

// Движение
canvas.addEventListener('click', async (e) => {
    if (!currentUser) return;
    
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const x = (e.clientX - rect.left) * scaleX;
    
    const minX = 45;
    const maxX = canvas.width - 45;
    const clampedX = Math.max(minX, Math.min(maxX, x));
    
    const userRef = doc(db, 'rooms', 'room1', 'users', currentUser.uid);
    await updateDoc(userRef, {
        x: clampedX,
        lastUpdate: Date.now()
    });
});

// Кнопка выхода
const logoutBtn = document.getElementById('logoutBtn');
if (logoutBtn) {
    logoutBtn.addEventListener('click', async () => {
        try {
            // 1. Удаляем пупса из комнаты
            if (currentUser) {
                const userRef = doc(db, 'rooms', 'room1', 'users', currentUser.uid);
                await updateDoc(userRef, {
                    x: -9999, // Убираем за пределы экрана
                    lastUpdate: Date.now()
                }).catch(() => {
                    // Если не получилось обновить, пробуем удалить
                    console.log('Не удалось обновить позицию, пробуем удалить');
                });
            }
            
            // 2. Выход из Firebase Auth
            await auth.signOut();
            
            // 3. Очищаем всё
            localStorage.clear();
            sessionStorage.clear();
            
            // 4. Принудительный редирект
            window.location.href = 'index.html';
            
        } catch (error) {
            console.error('Ошибка выхода:', error);
            // Даже если ошибка - очищаем и уходим
            localStorage.clear();
            sessionStorage.clear();
            window.location.href = 'index.html';
        }
    });
}

// Кнопки
document.getElementById('profileBtn')?.addEventListener('click', () => {
    window.location.href = 'profile.html';
});

document.getElementById('logoutBtn')?.addEventListener('click', async () => {
    try {
        await auth.signOut();
        window.location.href = 'index.html';
    } catch (error) {
        console.error('Ошибка выхода:', error);
        window.location.href = 'index.html';
    }
});
