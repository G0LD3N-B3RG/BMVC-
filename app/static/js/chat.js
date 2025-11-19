// static/js/chat.js 
let lastSince = '';
let username = '';
let pendingMessageId = null;
let seenMessageIds = new Set();

// VARIÁVEIS PARA MULTIPLOS CHATS
let currentChat = {
    id: 'general',
    type: 'group',
    name: 'Chat Geral',
    participants: []
};

let chatHistory = {
    'general': { messages: [], lastSince: '' }
};

// Elementos DOM 
const chatArea = document.getElementById('chat-area');
const messagesDiv = document.getElementById('messages');
const onlineUl = document.getElementById('online-list');
const input = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const emojiBtn = document.getElementById('emoji-btn');
const emojiModal = document.getElementById('emoji-modal');
const closeEmojiModal = document.getElementById('close-emoji-modal');
const emojiGrid = document.getElementById('emoji-grid');
const emojiSearch = document.getElementById('emoji-search');
const emojiCount = document.getElementById('emoji-count');
// Elementos DOM para imagens
const attachBtn = document.getElementById('attach-btn');
const fileInput = document.getElementById('file-input');
const imagePreviewModal = document.getElementById('image-preview-modal');
const closePreviewModal = document.getElementById('close-preview-modal');
const cancelPreview = document.getElementById('cancel-preview');
const sendImageBtn = document.getElementById('send-image');
const previewImage = document.getElementById('preview-image');
// Elementos DOM para áudio
const recordBtn = document.getElementById('record-btn');
const audioRecordModal = document.getElementById('audio-record-modal');
const closeAudioModal = document.getElementById('close-audio-modal');
const cancelAudio = document.getElementById('cancel-audio');
const startRecordBtn = document.getElementById('start-record-btn');
const stopRecordBtn = document.getElementById('stop-record-btn');
const sendAudioBtn = document.getElementById('send-audio');
const audioPreview = document.getElementById('audio-preview');
const audioRecordTimer = document.getElementById('audio-record-timer');
const audioRecordVisualizer = document.getElementById('audio-record-visualizer');
// ELEMENTOS DOM PARA INFO DO CHAT
const chatTitle = document.getElementById('chat-title');
const chatInfo = document.getElementById('chat-info');
const backToHomeBtn = document.getElementById('back-to-home');

// Variáveis para controle de imagem
let selectedImageFile = null;
let imageFullscreenModal = null;

// Variáveis para controle de áudio
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let recordingInterval;
let recordingTime = 0;

let pollInterval = null;

console.log('JS carregado! Elementos encontrados:', {
    chatArea: !!chatArea,
    messagesDiv: !!messagesDiv,
    input: !!input,
    sendBtn: !!sendBtn
});

// FUNÇÃO PARA INICIALIZAR O CHAT COM SESSÃO
async function initializeChat() {
    try {
        console.log('🔐 Buscando informações do usuário...');
        
        const response = await fetch('/user-info');
        const data = await response.json();
        
        if (data.error) {
            console.error('❌ Usuário não autenticado:', data.error);
            window.location.href = '/portal';
            return;
        }
        
        username = data.username;
        console.log('✅ Usuário da sessão:', username);
        
        // Obter parâmetros da URL
        const urlParams = new URLSearchParams(window.location.search);
        const chatId = urlParams.get('chat') || 'general';
        const chatType = urlParams.get('type') || 'group';
        const chatName = urlParams.get('name') || 'Chat Geral';
        
        currentChat = {
            id: chatId,
            type: chatType,
            name: chatName,
            participants: []
        };
        
        // Inicializar histórico se não existir
        if (!chatHistory[chatId]) {
            chatHistory[chatId] = { messages: [], lastSince: '' };
        }
        
        // Mostrar chat area
        if (chatArea) {
            chatArea.style.display = 'flex';
        }
        
        // Atualizar interface
        updateChatHeader();
        
        // Carregar mensagens do chat atual
        loadChatMessages();
        
        // Iniciar polling
        startPolling();
        
        console.log('🎉 Chat inicializado:', currentChat);
        
    } catch (error) {
        console.error('💥 Erro ao inicializar chat:', error);
        window.location.href = '/portal';
    }
}

function startPolling() {
    stopPolling();
    pollInterval = setInterval(poll, 1000);
    console.log('🔄 Polling iniciado');
}

function stopPolling() {
    if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
        console.log('🛑 Polling parado');
    }
}

function updateChatHeader() {
    console.log('Atualizando header do chat:', currentChat);
    
    // ATUALIZAR TÍTULO
    if (chatTitle) {
        chatTitle.textContent = currentChat.name;
    }
    
    // ATUALIZAR INFORMAÇÕES
    if (chatInfo) {
        if (currentChat.type === 'group') {
            chatInfo.textContent = `Grupo • ${currentChat.participants.length} participantes`;
        } else if (currentChat.type === 'private') {
            chatInfo.textContent = 'Chat privado';
        } else {
            chatInfo.textContent = 'Chat público';
        }
    }
    
    console.log('Header atualizado:', {
        title: chatTitle?.textContent,
        info: chatInfo?.textContent
    });
}

function loadChatMessages() {
    if (!messagesDiv) return;
    
    // Limpar mensagens atuais
    messagesDiv.innerHTML = '';
    
    // Carregar mensagens do histórico local
    const chatData = chatHistory[currentChat.id];
    if (chatData && chatData.messages.length > 0) {
        chatData.messages.forEach(msg => {
            appendMessage(msg);
        });
        scrollToBottom();
    }
    
    // Iniciar polling para este chat específico
    lastSince = chatData?.lastSince || '';
}

// Lista de emojis com nomes para busca (mantida igual)
const emojisWithNames = [
    // Smileys & Emotion
    { emoji: '😀', name: 'sorriso' },
    { emoji: '😃', name: 'sorriso grande' },
    { emoji: '😄', name: 'sorriso olhos felizes' },
    { emoji: '😁', name: 'sorriso com olhos brilhantes' },
    { emoji: '😆', name: 'sorriso fechado olhos' },
    { emoji: '😅', name: 'suando sorriso' },
    { emoji: '😂', name: 'chorando de rir' },
    { emoji: '🤣', name: 'rolando de rir' },
    { emoji: '😊', name: 'sorriso tímido' },
    { emoji: '😇', name: 'sorriso angelical' },
    { emoji: '🙂', name: 'sorriso suave' },
    { emoji: '🙃', name: 'cabeça para baixo' },
    { emoji: '😉', name: 'piscar' },
    { emoji: '😌', name: 'aliviado' },
    { emoji: '😍', name: 'apaixonado' },
    { emoji: '🥰', name: 'sorriso com corações' },
    { emoji: '😘', name: 'beijo' },
    { emoji: '😗', name: 'beijando' },
    { emoji: '😙', name: 'beijo com olhos felizes' },
    { emoji: '😚', name: 'beijo com olhos fechados' },
    { emoji: '😋', name: 'saboroso' },
    { emoji: '😛', name: 'língua para fora' },
    { emoji: '😝', name: 'língua olhos fechados' },
    { emoji: '😜', name: 'piscar com língua' },
    { emoji: '🤪', name: 'maluco' },
    { emoji: '🤨', name: 'sobrancelha levantada' },
    { emoji: '🧐', name: 'monóculo' },
    { emoji: '🤓', name: 'nerd' },
    { emoji: '😎', name: 'descolado' },
    { emoji: '🤩', name: 'estrelas nos olhos' },
    { emoji: '🥳', name: 'festa' },
    { emoji: '😏', name: 'smirk' },
    { emoji: '😒', name: 'entediado' },
    { emoji: '😞', name: 'decepcionado' },
    { emoji: '😔', name: 'abatido' },
    { emoji: '😟', name: 'preocupado' },
    { emoji: '😕', name: 'confuso' },
    { emoji: '🙁', name: 'levemente triste' },
    { emoji: '☹️', name: 'triste' },
    { emoji: '😣', name: 'sofrendo' },
    { emoji: '😖', name: 'confuso' },
    { emoji: '😫', name: 'cansado' },
    { emoji: '😩', name: 'exausto' },
    { emoji: '🥺', name: 'suplicante' },
    { emoji: '😢', name: 'chorando' },
    { emoji: '😭', name: 'chorando muito' },
    { emoji: '😤', name: 'triumfante' },
    { emoji: '😠', name: 'zangado' },
    { emoji: '😡', name: 'furioso' },
    { emoji: '🤬', name: 'xingando' },
    { emoji: '😳', name: 'corado' },
    { emoji: '🥵', name: 'calor' },
    { emoji: '🥶', name: 'frio' },
    { emoji: '😱', name: 'gritando' },
    { emoji: '😨', name: 'amedrontado' },
    { emoji: '😰', name: 'ansioso' },
    { emoji: '😥', name: 'decepcionado mas aliviado' },
    { emoji: '😓', name: 'suando frio' },
    { emoji: '🤥', name: 'mentiroso' },
    { emoji: '🤤', name: 'babando' },
    { emoji: '😶', name: 'sem boca' },
    { emoji: '😐', name: 'neutro' },
    { emoji: '😑', name: 'sem expressão' },
    { emoji: '😬', name: 'envergonhado' },
    { emoji: '🙄', name: 'revirando olhos' },
    { emoji: '😯', name: 'silêncio' },
    { emoji: '😦', name: 'carrancudo' },
    { emoji: '😧', name: 'angustiado' },
    { emoji: '😮', name: 'boca aberta' },
    { emoji: '😲', name: 'espantado' },
    { emoji: '🥱', name: 'bocejando' },
    { emoji: '😴', name: 'dormindo' },
    { emoji: '😪', name: 'sonolento' },
    { emoji: '😵', name: 'tonto' },
    { emoji: '🤯', name: 'explodindo' },
    { emoji: '😷', name: 'máscara' },
    { emoji: '🤒', name: 'termômetro' },
    { emoji: '🤕', name: 'cabeça enfaixada' },
    { emoji: '🤢', name: 'enjoado' },
    // Pessoas
    { emoji: '👋', name: 'acenando' },
    { emoji: '🤚', name: 'levantando mão' },
    { emoji: '🖐️', name: 'mão aberta' },
    { emoji: '✋', name: 'mão levantada' },
    { emoji: '🖖', name: 'saudações vulcanas' },
    { emoji: '👌', name: 'ok' },
    { emoji: '🤏', name: 'pinça' },
    { emoji: '✌️', name: 'paz' },
    { emoji: '🤞', name: 'dedos cruzados' },
    { emoji: '🤟', name: 'eu te amo' },
    { emoji: '🤘', name: 'chifres' },
    { emoji: '🤙', name: 'me liga' },
    { emoji: '👈', name: 'apontar esquerda' },
    { emoji: '👉', name: 'apontar direita' },
    { emoji: '👆', name: 'apontar cima' },
    { emoji: '🖕', name: 'dedo médio' },
    { emoji: '👇', name: 'apontar baixo' },
    { emoji: '☝️', name: 'apontar para cima' },
    { emoji: '👍', name: 'joinha' },
    { emoji: '👎', name: 'polegar baixo' },
    { emoji: '✊', name: 'punho' },
    { emoji: '👊', name: 'soco' },
    { emoji: '🤛', name: 'punho esquerda' },
    { emoji: '🤜', name: 'punho direita' },
    { emoji: '👏', name: 'palmas' },
    { emoji: '🙌', name: 'mãos para cima' },
    { emoji: '👐', name: 'mãos abertas' },
    { emoji: '🤲', name: 'palmas juntas' },
    { emoji: '🤝', name: 'aperto de mãos' },
    { emoji: '🙏', name: 'orar' },
    // Corações
    { emoji: '❤️', name: 'coração vermelho' },
    { emoji: '🧡', name: 'coração laranja' },
    { emoji: '💛', name: 'coração amarelo' },
    { emoji: '💚', name: 'coração verde' },
    { emoji: '💙', name: 'coração azul' },
    { emoji: '💜', name: 'coração roxo' },
    { emoji: '🖤', name: 'coração preto' },
    { emoji: '🤍', name: 'coração branco' },
    { emoji: '🤎', name: 'coração marrom' },
    { emoji: '💔', name: 'coração partido' },
    // Animais
    { emoji: '🐵', name: 'macaco' },
    { emoji: '🐶', name: 'cachorro' },
    { emoji: '🐱', name: 'gato' },
    { emoji: '🐭', name: 'rato' },
    { emoji: '🐹', name: 'hamster' },
    { emoji: '🐰', name: 'coelho' },
    { emoji: '🦊', name: 'raposa' },
    { emoji: '🐻', name: 'urso' },
    { emoji: '🐼', name: 'panda' },
    { emoji: '🐨', name: 'coala' },
    { emoji: '🐯', name: 'tigre' },
    { emoji: '🦁', name: 'leão' },
    { emoji: '🐮', name: 'vaca' },
    { emoji: '🐷', name: 'porco' },
    { emoji: '🐸', name: 'sapo' },
    { emoji: '🐙', name: 'polvo' },
    // Comidas
    { emoji: '🍎', name: 'maçã' },
    { emoji: '🍐', name: 'pera' },
    { emoji: '🍊', name: 'laranja' },
    { emoji: '🍋', name: 'limão' },
    { emoji: '🍌', name: 'banana' },
    { emoji: '🍉', name: 'melancia' },
    { emoji: '🍇', name: 'uva' },
    { emoji: '🍓', name: 'morango' },
    { emoji: '🫐', name: 'mirtilo' },
    { emoji: '🍈', name: 'melão' },
    { emoji: '🍒', name: 'cereja' },
    { emoji: '🍑', name: 'pêssego' },
    { emoji: '🥭', name: 'manga' },
    { emoji: '🍍', name: 'abacaxi' },
    { emoji: '🥥', name: 'coco' },
    { emoji: '🥑', name: 'abacate' },
    { emoji: '🍆', name: 'berinjela' },
    { emoji: '🥔', name: 'batata' },
    { emoji: '🥕', name: 'cenoura' },
    { emoji: '🌽', name: 'milho' },
    { emoji: '🌶️', name: 'pimenta' },
    { emoji: '🫑', name: 'pimentão' },
    // Objetos
    { emoji: '⌚', name: 'relógio' },
    { emoji: '📱', name: 'celular' },
    { emoji: '💻', name: 'notebook' },
    { emoji: '🖥️', name: 'computador' },
    { emoji: '🖨️', name: 'impressora' },
    { emoji: '🎮', name: 'videogame' },
    { emoji: '👾', name: 'alien' },
    // Símbolos
    { emoji: '💯', name: 'cem pontos' },
    { emoji: '✨', name: 'brilho' },
    { emoji: '🎉', name: 'festa' },
    { emoji: '🎊', name: 'confete' },
    { emoji: '🔥', name: 'fogo' },
    { emoji: '💥', name: 'explosão' },
    { emoji: '⭐', name: 'estrela' },
    { emoji: '🌟', name: 'estrela brilhante' },
    { emoji: '🙈', name: 'não vejo mal' },
    { emoji: '🙉', name: 'não ouço mal' },
    { emoji: '🙊', name: 'não falo mal' }
];

// Função para injetar emojis no grid com busca
function injectEmojis(searchTerm = '') {
    console.log('Injetando emojis...');
    
    if (!emojiGrid) {
        console.error('Elemento emoji-grid não encontrado!');
        return;
    }
    
    emojiGrid.innerHTML = '';
    
    const term = searchTerm.toLowerCase().trim();
    const filteredEmojis = emojisWithNames.filter(item => 
        item.name.toLowerCase().includes(term) || 
        item.emoji.includes(term)
    );
    
    if (filteredEmojis.length === 0) {
        const noResults = document.createElement('div');
        noResults.classList.add('no-results');
        noResults.textContent = 'Nenhum emoji encontrado';
        emojiGrid.appendChild(noResults);
    } else {
        filteredEmojis.forEach(item => {
            const btn = document.createElement('button');
            btn.classList.add('emoji-btn');
            btn.textContent = item.emoji;
            btn.type = 'button';
            btn.title = item.name; // Tooltip com o nome
            btn.addEventListener('click', () => {
                input.value += item.emoji;
                input.focus();
                closeEmojiModalFunc();
            });
            emojiGrid.appendChild(btn);
        });
    }
    
    // Atualiza contador
    if (emojiCount) {
        emojiCount.textContent = `${filteredEmojis.length} emojis${term ? ' encontrados' : ' no total'}`;
    }
    console.log('Emojis injetados:', filteredEmojis.length);
}

// Função para lidar com a seleção de imagem
function handleImageSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    // Verificar se é uma imagem
    if (!file.type.match('image.*')) {
        alert('Por favor, selecione apenas arquivos de imagem.');
        return;
    }

    // Verificar tamanho do arquivo (limite de 5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
        return;
    }

    selectedImageFile = file;

    // Criar preview
    const reader = new FileReader();
    reader.onload = function(e) {
        previewImage.src = e.target.result;
        imagePreviewModal.style.display = 'flex';
    };
    reader.readAsDataURL(file);
}

function closeImagePreview() {
    if (imagePreviewModal) {
        imagePreviewModal.style.display = 'none';
    }
    if (fileInput) {
        fileInput.value = '';
    }
    selectedImageFile = null;
}

// Função para enviar imagem
function sendImage() {
    if (!selectedImageFile || !username) {
        closeImagePreview();
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const imageData = e.target.result;
        
        // Criar mensagem temporária
        const approxIso = new Date().toISOString();
        const tempMsgId = 'img-' + Date.now();
        const tempMsg = {
            id: tempMsgId, 
            nome: username, 
            conteudo: '📷 Enviando imagem...', 
            timestamp: approxIso,
            type: 'imagem',
            isTemp: true
        };
        
        seenMessageIds.add(tempMsgId);
        appendMessage(tempMsg, true);
        
        // Enviar para o servidor
        fetch('/send', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: 'Imagem',
                type: 'imagem',
                image_data: imageData,
                chat_id: currentChat.id,
                chat_type: currentChat.type
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            seenMessageIds.add(data.id);
            pendingMessageId = data.id;
            
            // Atualizar a mensagem temporária com a resposta do servidor
            updateTempMessage(tempMsgId, data);
        })
        .catch(err => {
            console.error('Erro ao enviar imagem:', err);
            // Mostrar erro na mensagem temporária
            updateTempMessageWithError(tempMsgId, err.message);
            seenMessageIds.delete(tempMsgId);
        });
        
        closeImagePreview();
    };
    reader.readAsDataURL(selectedImageFile);
}

// atualizar mensagem temporária com sucesso
function updateTempMessage(tempId, serverMsg) {
    const messageDiv = messagesDiv.querySelector(`[data-temp-id="${tempId}"]`);
    if (messageDiv) {
        const contentDiv = messageDiv.querySelector('.message-content');
        
        if (serverMsg.type === 'imagem' && serverMsg.image_filename) {
            // Mensagem de imagem
            const imageUrl = `/uploads/images/${serverMsg.image_filename}`;
            contentDiv.innerHTML = `
                <div class="message-image-container">
                    <img src="${imageUrl}" alt="Imagem enviada" class="message-image" onclick="openImageFullscreen('${imageUrl}')">
                    <div class="message-image-caption">Imagem enviada</div>
                </div>
            `;
        } else if (serverMsg.type === 'audio' && serverMsg.audio_filename) {
            // Mensagem de áudio
            const audioUrl = `/uploads/audios/${serverMsg.audio_filename}`;
            contentDiv.innerHTML = `
                <div class="message-audio">
                    <audio controls src="${audioUrl}"></audio>
                    <div class="message-audio-caption">Áudio ${serverMsg.audio_duration ? `- ${serverMsg.audio_duration}s` : ''}</div>
                </div>
            `;
        } else {
            // Mensagem de texto normal
            contentDiv.textContent = serverMsg.conteudo;
        }
        
        messageDiv.removeAttribute('data-temp-id');
        messageDiv.classList.remove('temp');
        
        // Atualizar o ID real da mensagem
        messageDiv.dataset.messageId = serverMsg.id;
    }
}

// mostrar erro no upload
function updateTempMessageWithError(tempId, error) {
    const messageDiv = messagesDiv.querySelector(`[data-temp-id="${tempId}"]`);
    if (messageDiv) {
        const contentDiv = messageDiv.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.innerHTML = `<span style="color: #ff6b6b;">❌ Erro: ${error}</span>`;
        }
        messageDiv.removeAttribute('data-temp-id');
        messageDiv.classList.remove('temp');
    }
}

// abrir imagem em tela cheia
function openImageFullscreen(imageSrc) {
    // Criar modal de tela cheia se não existir
    if (!imageFullscreenModal) {
        imageFullscreenModal = document.createElement('div');
        imageFullscreenModal.className = 'image-fullscreen-modal';
        imageFullscreenModal.innerHTML = `
            <div class="image-fullscreen-content">
                <img src="" alt="Imagem em tela cheia">
            </div>
        `;
        document.body.appendChild(imageFullscreenModal);
        
        // Fechar ao clicar
        imageFullscreenModal.addEventListener('click', () => {
            imageFullscreenModal.style.display = 'none';
        });
    }
    
    // Mostrar imagem
    const img = imageFullscreenModal.querySelector('img');
    img.src = imageSrc;
    imageFullscreenModal.style.display = 'flex';
}

window.openImageFullscreen = openImageFullscreen;

// Funções para áudio
function closeAudioModalFunc() {
    if (audioRecordModal) {
        audioRecordModal.style.display = 'none';
    }
    resetAudioRecording();
}

function resetAudioRecording() {
    // Parar gravação se estiver ativa
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
    }
    
    // Limpar variáveis
    audioChunks = [];
    audioBlob = null;
    recordingTime = 0;
    audioRecordTimer.textContent = '00:00';
    audioRecordVisualizer.innerHTML = 'Clique em "Iniciar Gravação"';
    audioRecordVisualizer.style.background = 'rgba(0, 0, 0, 0.2)';
    
    // Resetar controles
    startRecordBtn.disabled = false;
    stopRecordBtn.disabled = true;
    sendAudioBtn.disabled = true;
    audioPreview.style.display = 'none';
    
    // Limpar intervalos
    if (recordingInterval) {
        clearInterval(recordingInterval);
    }
}

function startRecording() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        alert('Seu navegador não suporta gravação de áudio.');
        return;
    }

    navigator.mediaDevices.getUserMedia({ audio: true })
        .then(stream => {
            mediaRecorder = new MediaRecorder(stream);
            audioChunks = [];

            mediaRecorder.ondataavailable = event => {
                audioChunks.push(event.data);
            };

            mediaRecorder.onstop = () => {
                audioBlob = new Blob(audioChunks, { type: 'audio/wav' });
                const audioUrl = URL.createObjectURL(audioBlob);
                const audioElement = audioPreview.querySelector('audio');
                audioElement.src = audioUrl;
                audioPreview.style.display = 'block';
                sendAudioBtn.disabled = false;
            };

            mediaRecorder.start();
            startRecordBtn.disabled = true;
            stopRecordBtn.disabled = false;
            audioRecordVisualizer.innerHTML = '🎤 Gravando...';
            audioRecordVisualizer.style.background = 'linear-gradient(120deg, #c9302c, #d9534f)';
            audioRecordVisualizer.classList.add('recording-animation');

            // Iniciar timer
            recordingTime = 0;
            recordingInterval = setInterval(() => {
                recordingTime++;
                const minutes = Math.floor(recordingTime / 60).toString().padStart(2, '0');
                const seconds = (recordingTime % 60).toString().padStart(2, '0');
                audioRecordTimer.textContent = `${minutes}:${seconds}`;
            }, 1000);
        })
        .catch(err => {
            console.error('Erro ao acessar microfone:', err);
            alert('Erro ao acessar o microfone. Verifique as permissões.');
        });
}

function stopRecording() {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
        mediaRecorder.stop();
        mediaRecorder.stream.getTracks().forEach(track => track.stop());
        
        startRecordBtn.disabled = false;
        stopRecordBtn.disabled = true;
        audioRecordVisualizer.innerHTML = '✅ Gravação concluída';
        audioRecordVisualizer.style.background = 'linear-gradient(120deg, #248A52, #257287)';
        audioRecordVisualizer.classList.remove('recording-animation');
        
        if (recordingInterval) {
            clearInterval(recordingInterval);
        }
    }
}

function sendAudio() {
    if (!audioBlob || !username) {
        closeAudioModalFunc();
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const audioData = e.target.result;
        
        // Criar mensagem temporária
        const approxIso = new Date().toISOString();
        const tempMsgId = 'audio-' + Date.now();
        const tempMsg = {
            id: tempMsgId, 
            nome: username, 
            conteudo: '🎤 Áudio...', 
            timestamp: approxIso,
            type: 'audio',
            isTemp: true
        };
        
        seenMessageIds.add(tempMsgId);
        appendMessage(tempMsg, true);
        
        // Enviar para o servidor
        fetch('/send', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                content: 'Áudio',
                type: 'audio',
                audio_data: audioData,
                audio_duration: recordingTime,
                chat_id: currentChat.id,
                chat_type: currentChat.type
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            seenMessageIds.add(data.id);
            pendingMessageId = data.id;
            
            // Atualizar a mensagem temporária com a resposta do servidor
            updateTempMessage(tempMsgId, data);
        })
        .catch(err => {
            console.error('Erro ao enviar áudio:', err);
            updateTempMessageWithError(tempMsgId, err.message);
            seenMessageIds.delete(tempMsgId);
        });
        
        closeAudioModalFunc();
    };
    reader.readAsDataURL(audioBlob);
}

// Função para marcar mensagem como falha
function markMessageAsFailed(tempId) {
    const messageDiv = messagesDiv.querySelector(`[data-temp-id="${tempId}"]`);
    if (messageDiv) {
        const contentDiv = messageDiv.querySelector('.message-content');
        if (contentDiv) {
            contentDiv.innerHTML = '<span style="color: #ff6b6b;">❌ Falha ao enviar mensagem</span>';
        }
        messageDiv.removeAttribute('data-temp-id');
        messageDiv.classList.remove('temp');
    }
}

//EVENT LISTENER PARA VOLTAR À HOME
if (backToHomeBtn) {
    backToHomeBtn.addEventListener('click', () => {
        window.location.href = '/home';
    });
}

// Funções auxiliares
function formatTime(isoString) {
    if (!isoString) return '';
    
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) {
        return 'Agora';
    } else if (diffMins < 60) {
        return `${diffMins} min`;
    } else if (diffHours < 24) {
        return `${diffHours} h`;
    } else if (diffDays < 7) {
        return `${diffDays} d`;
    } else {
        return date.toLocaleDateString('pt-BR');
    }
}

function appendMessage(msg, isSelf = false) {
    if (!messagesDiv) return;
    
    const existingMessage = messagesDiv.querySelector(`[data-message-id="${msg.id}"]`) || 
                           messagesDiv.querySelector(`[data-temp-id="${msg.id}"]`);
    if (existingMessage) {
        return;
    }
    
    const isSelfMsg = isSelf || msg.nome === username;
    const div = document.createElement('div');
    div.classList.add('message');
    if (isSelfMsg) {
        div.classList.add('self');
    } else {
        div.classList.add('other');
    }
    
    // Adicionar ID temporário se for uma mensagem temporária
    if (msg.isTemp && msg.id) {
        div.dataset.tempId = msg.id;
        div.classList.add('temp');
    } else if (msg.id) {
        div.dataset.messageId = msg.id;
    }

    let contentHTML = '';

    // Verificar pelo campo 'type'
    if (msg.type === 'imagem' && msg.image_filename) {
        const imageUrl = `/uploads/images/${msg.image_filename}`;
        contentHTML = `
            <div class="message-image-container">
                <img src="${imageUrl}" alt="Imagem enviada" class="message-image" onclick="openImageFullscreen('${imageUrl}')">
                <div class="message-image-caption">Imagem enviada</div>
            </div>
        `;
    } else if (msg.type === 'audio' && msg.audio_filename) {
        const audioUrl = `/uploads/audios/${msg.audio_filename}`;
        contentHTML = `
            <div class="message-audio">
                <audio controls src="${audioUrl}"></audio>
                <div class="message-audio-caption">Áudio ${msg.audio_duration ? `- ${msg.audio_duration}s` : ''}</div>
            </div>
        `;
    } else if (msg.isTemp) {
        contentHTML = `
            <div class="message-content">
                <span class="image-loading"></span>${msg.conteudo}
            </div>
        `;
    } else {
        contentHTML = `<div class="message-content">${msg.conteudo}</div>`;
    }

    // Para mensagens próprias: nome → conteúdo → timestamp (à direita)
    // Para mensagens de outros: timestamp → nome → conteúdo (timestamp à esquerda)
    if (isSelfMsg) {
        div.innerHTML = `
            <div class="message-header">
                <strong>${msg.nome}</strong>
                <span class="timestamp">${formatTime(msg.timestamp)}</span>
            </div>
            ${contentHTML}
        `;
    } else {
        div.innerHTML = `
            <div class="message-header">
                <span class="timestamp">${formatTime(msg.timestamp)}</span>
                <strong>${msg.nome}</strong>
            </div>
            ${contentHTML}
        `;
    }
    
    messagesDiv.appendChild(div);
    scrollToBottom();
}

function updateOnline(list) {
    if (!onlineUl) return;
    onlineUl.innerHTML = '';
    list.forEach(nome => {
        const li = document.createElement('li');
        li.textContent = nome + (nome === username ? ' (você)' : '');
        onlineUl.appendChild(li);
    });
}

function scrollToBottom() {
    if (!messagesDiv) return;
    messagesDiv.scrollTo({
        top: messagesDiv.scrollHeight,
        behavior: 'smooth'
    });
}

// Poll
function poll() {
    if (!username || !currentChat) return;
    
    let url = `/messages?chat=${encodeURIComponent(currentChat.id)}&type=${encodeURIComponent(currentChat.type)}`;
    if (lastSince) url += `&since=${encodeURIComponent(lastSince)}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            let newMsgs = 0;
            data.messages.forEach(msg => {
                // VERIFICAR SE A MENSAGEM É DO CHAT ATUAL
                if (msg.chat_id !== currentChat.id) return;
                
                if (seenMessageIds.has(msg.id) || (pendingMessageId && msg.id === pendingMessageId)) {
                    return;
                }
                appendMessage(msg);
                seenMessageIds.add(msg.id);
                newMsgs++;
                
                // SALVAR NO HISTÓRICO LOCAL
                if (!chatHistory[currentChat.id].messages.some(m => m.id === msg.id)) {
                    chatHistory[currentChat.id].messages.push(msg);
                }
            });
            
            updateOnline(data.online);
            if (newMsgs > 0) {
                lastSince = data.messages[data.messages.length - 1].timestamp;
                chatHistory[currentChat.id].lastSince = lastSince;
            }
        })
        .catch(err => console.error('Erro no poll:', err));
}

// Send
function send() {
    let content = input.value.trim();
    if (!content || !username || !currentChat) return;
    input.value = '';

    const approxIso = new Date().toISOString();
    const tempMsgId = 'txt-' + Date.now();
    const tempMsg = {
        id: tempMsgId, 
        nome: username, 
        conteudo: content, 
        timestamp: approxIso,
        isTemp: true,
        chat_id: currentChat.id,
        chat_type: currentChat.type
    };
    
    seenMessageIds.add(tempMsgId);
    appendMessage(tempMsg, true);

    // Mostrar loading no botão
    if (sendBtn) {
        sendBtn.classList.add('sending');
        sendBtn.disabled = true;
    }

    fetch('/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            content: content,
            chat_id: currentChat.id,
            chat_type: currentChat.type
        })
    })
    .then(res => res.json())
    .then(data => {
        // Remover loading do botão
        if (sendBtn) {
            sendBtn.classList.remove('sending');
            sendBtn.disabled = false;
        }

        if (data.id && data.timestamp) {
            lastSince = data.timestamp;
            pendingMessageId = data.id;
            seenMessageIds.add(data.id);
            console.log('Mensagem confirmada por ID:', data.id);
            
            // Atualizar mensagem temporária com dados reais
            updateTempMessage(tempMsgId, data);
            
            if (!chatHistory[currentChat.id].messages.some(m => m.id === data.id)) {
                chatHistory[currentChat.id].messages.push(data);
            }
        } else if (data.error) {
            console.error('Erro ao enviar:', data.error);
            // Marcar mensagem como falha
            markMessageAsFailed(tempMsgId);
            pendingMessageId = null;
            seenMessageIds.delete(tempMsgId);
        }
    })
    .catch(err => {
        console.error('Erro ao enviar:', err);
        // Remover loading do botão mesmo em erro
        if (sendBtn) {
            sendBtn.classList.remove('sending');
            sendBtn.disabled = false;
        }
        
        // Marcar mensagem como falha
        markMessageAsFailed(tempMsgId);
        pendingMessageId = null;
        seenMessageIds.delete(tempMsgId);
    });
}

// Função para fechar modal de emojis
function closeEmojiModalFunc() {
    if (emojiModal) {
        emojiModal.style.display = 'none';
    }
    if (emojiSearch) {
        emojiSearch.value = ''; // Limpa a busca ao fechar
    }
}

// Eventos básicos
if (sendBtn) {
    sendBtn.addEventListener('click', send);
}

if (input) {
    input.addEventListener('keypress', e => { 
        if (e.key === 'Enter') { 
            send(); 
            closeEmojiModalFunc(); 
        } 
    });
}

// Eventos para emoji modal
if (emojiBtn) {
    emojiBtn.addEventListener('click', () => {
        if (emojiModal) {
            emojiModal.style.display = 'flex';
            if (emojiSearch) {
                emojiSearch.value = ''; // Limpa a busca
            }
            injectEmojis(''); // Mostra todos os emojis
            setTimeout(() => {
                if (emojiSearch) {
                    emojiSearch.focus(); // Foca na barra de busca
                }
            }, 100);
        }
    });
}

if (closeEmojiModal) {
    closeEmojiModal.addEventListener('click', closeEmojiModalFunc);
}

if (emojiModal) {
    emojiModal.addEventListener('click', (e) => {
        if (e.target === emojiModal) {
            closeEmojiModalFunc();
        }
    });
}

// Evento de busca em tempo real
if (emojiSearch) {
    emojiSearch.addEventListener('input', (e) => {
        injectEmojis(e.target.value);
    });
}

// Evento para o botão de anexar imagem
if (attachBtn) {
    attachBtn.addEventListener('click', () => {
        fileInput.click();
    });
}

// Evento para seleção de arquivo
if (fileInput) {
    fileInput.addEventListener('change', handleImageSelect);
}

// Eventos para o modal de preview
if (closePreviewModal) {
    closePreviewModal.addEventListener('click', closeImagePreview);
}

if (cancelPreview) {
    cancelPreview.addEventListener('click', closeImagePreview);
}

if (sendImageBtn) {
    sendImageBtn.addEventListener('click', sendImage);
}

// Evento para o botão de gravar áudio
if (recordBtn) {
    recordBtn.addEventListener('click', () => {
        if (audioRecordModal) {
            audioRecordModal.style.display = 'flex';
            resetAudioRecording();
        }
    });
}

// Eventos para o modal de áudio
if (closeAudioModal) {
    closeAudioModal.addEventListener('click', closeAudioModalFunc);
}

if (cancelAudio) {
    cancelAudio.addEventListener('click', closeAudioModalFunc);
}

if (startRecordBtn) {
    startRecordBtn.addEventListener('click', startRecording);
}

if (stopRecordBtn) {
    stopRecordBtn.addEventListener('click', stopRecording);
}

if (sendAudioBtn) {
    sendAudioBtn.addEventListener('click', sendAudio);
}

// Fechar modal de áudio ao clicar fora
if (audioRecordModal) {
    audioRecordModal.addEventListener('click', (e) => {
        if (e.target === audioRecordModal) {
            closeAudioModalFunc();
        }
    });
}

// Fechar preview ao clicar fora
if (imagePreviewModal) {
    imagePreviewModal.addEventListener('click', (e) => {
        if (e.target === imagePreviewModal) {
            closeImagePreview();
        }
    });
}

// Fechar modais com ESC
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        if (emojiModal && emojiModal.style.display === 'flex') {
            closeEmojiModalFunc();
        }
        if (imagePreviewModal && imagePreviewModal.style.display === 'flex') {
            closeImagePreview();
        }
        if (audioRecordModal && audioRecordModal.style.display === 'flex') {
            closeAudioModalFunc();
        }
        if (imageFullscreenModal && imageFullscreenModal.style.display === 'flex') {
            imageFullscreenModal.style.display = 'none';
        }
    }
});

//INICIALIZAR CHAT COM SESSÃO
console.log('🚀 Inicializando chat com sessão...');
if (chatArea) {
    chatArea.style.display = 'none';
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', initializeChat);

// Debug
console.log('=== DEBUG CHAT SEM LOGIN ===');
console.log('chat-area:', document.getElementById('chat-area'));
console.log('messages:', document.getElementById('messages'));