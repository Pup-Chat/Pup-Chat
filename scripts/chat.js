import { auth, db } from './firebase-config.js';
import { collection, addDoc, onSnapshot, query, orderBy, serverTimestamp, getDoc, doc } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const chatMessages = document.getElementById('chatMessages');
const chatForm = document.getElementById('chatForm');
const chatInput = document.getElementById('chatInput');

let currentUser = null;

auth.onAuthStateChanged((user) => {
    currentUser = user;
    if (user) {
        listenToChat();
    }
});

// Слушатель чата
function listenToChat() {
    const q = query(collection(db, 'rooms', 'room1', 'messages'), orderBy('timestamp'));
    
    onSnapshot(q, (snapshot) => {
        chatMessages.innerHTML = '';
        snapshot.forEach(doc => {
            const msg = doc.data();
            const msgEl = document.createElement('div');
            msgEl.className = 'chat-message';
            msgEl.innerHTML = `
                <span class="username">${msg.username}:</span>
                <span class="text"> ${msg.text}</span>
            `;
            chatMessages.appendChild(msgEl);
        });
        chatMessages.scrollTop = chatMessages.scrollHeight;
    });
}

// Отправка сообщения
chatForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    if (!currentUser || !chatInput.value.trim()) return;
    
    const userDoc = await getDoc(doc(db, 'users', currentUser.uid));
    const username = userDoc.exists() ? userDoc.data().username : 'Пупс';
    
    await addDoc(collection(db, 'rooms', 'room1', 'messages'), {
        uid: currentUser.uid,
        username: username,
        text: chatInput.value.trim(),
        timestamp: serverTimestamp()
    });
    
    chatInput.value = '';
});
