import { auth, db } from './firebase-config.js';
import { doc, getDoc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

auth.onAuthStateChanged(async (user) => {
    if (!user) {
        window.location.href = 'login.html';
        return;
    }
    
    const userDoc = await getDoc(doc(db, 'users', user.uid));
    if (userDoc.exists()) {
        const userData = userDoc.data();
        document.getElementById('profileName').textContent = userData.username || 'Пупс';
        document.getElementById('profileEmail').textContent = userData.email || '';
        document.getElementById('statCoins').textContent = userData.coins || 0;
        document.getElementById('statLevel').textContent = userData.level || 1;
    }
});

// Кнопка назад
const backToRoomBtn = document.getElementById('backToRoomBtn');
if (backToRoomBtn) {
    backToRoomBtn.addEventListener('click', () => {
        window.location.href = 'room.html';
    });
}
