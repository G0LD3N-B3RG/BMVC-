// BMVC_chat/static/js/pagina.js
let lastSince = '';
let username = localStorage.getItem('chat_username') || '';

// Elementos DOM
const nameSetup = document.getElementById('name-setup');
const chatArea = document.getElementById('chat-area');
const messagesDiv = document.getElementById('messages');
const onlineUl = document.getElementById('online-list');
const input = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const nameInput = document.getElementById('name-input');
const setNameBtn = document.getElementById('set-name-btn');

// Funções auxiliares
function formatTime(iso) {
    return new Date(iso).toTimeString().substring(0, 8);  // HH:MM:SS
}

function appendMessage(msg) {
    const p = document.createElement('p');
    p.textContent = `[${formatTime(msg.timestamp)}] ${msg.nome}: ${msg.conteudo}`;
    if (msg.nome === username) {
        p.style.fontWeight = 'bold';
        p.style.color = '#007bff';
    }
    messagesDiv.appendChild(p);
    messagesDiv.scrollTop = messagesDiv.scrollHeight;
}

function updateOnline(list) {
    onlineUl.innerHTML = '';
    list.forEach(nome => {
        const li = document.createElement('li');
        li.textContent = nome + (nome === username ? ' (você)' : '');
        onlineUl.appendChild(li);
    });
}

// Poll de dados (mensagens + online)
function poll() {
    let url = '/messages';
    if (lastSince) url += `?since=${encodeURIComponent(lastSince)}`;
    if (username) url += `${lastSince ? '&' : '?'}name=${encodeURIComponent(username)}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            data.messages.forEach(appendMessage);
            updateOnline(data.online);
            if (data.messages.length > 0) {
                lastSince = data.messages[data.messages.length - 1].timestamp;
            }
        })
        .catch(console.error);
}

// Enviar mensagem
function send() {
    let content = input.value.trim();
    if (!content || !username) return;
    input.value = '';

    // Exibe imediatamente (aproximado)
    const approxIso = new Date().toISOString();
    appendMessage({nome: username, conteudo: content, timestamp: approxIso});

    fetch('/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: username, content})
    });
}

// Setar nome
function setName() {
    let name = nameInput.value.trim();
    if (!name) return;
    username = name;
    localStorage.setItem('chat_username', username);
    nameSetup.style.display = 'none';
    chatArea.style.display = 'block';
    poll();  // Inicia poll após setar nome
}

// Eventos
setNameBtn.addEventListener('click', setName);
nameInput.addEventListener('keypress', e => { if (e.key === 'Enter') setName(); });
sendBtn.addEventListener('click', send);
input.addEventListener('keypress', e => { if (e.key === 'Enter') send(); });

// Início: Verifica se nome já setado
if (username) {
    nameSetup.style.display = 'none';
    chatArea.style.display = 'block';
    poll();
    setInterval(poll, 1000);
} else {
    nameSetup.style.display = 'block';
}