// static/js/chat.js (corrigido)
let lastSince = '';
let username = '';
let pendingMessageId = null;
let seenMessageIds = new Set();

// Elementos DOM
const nameSetup = document.getElementById('name-setup');
const chatArea = document.getElementById('chat-area');
const messagesDiv = document.getElementById('messages');
const onlineUl = document.getElementById('online-list');
const input = document.getElementById('msg-input');
const sendBtn = document.getElementById('send-btn');
const nameInput = document.getElementById('name-input');
const setNameBtn = document.getElementById('set-name-btn');
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

// Variáveis para controle de imagem
let selectedImageFile = null;
let imageFullscreenModal = null;

// Variáveis para controle de áudio
let mediaRecorder;
let audioChunks = [];
let audioBlob = null;
let recordingInterval;
let recordingTime = 0;

console.log('JS carregado! Elementos encontrados:', {
    nameSetup: !!nameSetup,
    chatArea: !!chatArea,
    nameInput: !!nameInput,
    setNameBtn: !!setNameBtn
});

// Lista de emojis com nomes para busca
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
        
        // ↓↓↓ ADICIONE O ID TEMPORÁRIO AO seenMessageIds PARA EVITAR DUPLICAÇÃO ↓↓↓
        seenMessageIds.add(tempMsgId);
        appendMessage(tempMsg, true);
        
        // Enviar para o servidor
        fetch('/send', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                name: username,
                content: 'Imagem',
                type: 'imagem',
                image_data: imageData
            })
        })
        .then(res => res.json())
        .then(data => {
            if (data.error) {
                throw new Error(data.error);
            }
            // ↓↓↓ ADICIONE O ID REAL AO seenMessageIds E ATUALIZE O pendingMessageId ↓↓↓
            seenMessageIds.add(data.id);
            pendingMessageId = data.id;
            
            // Atualizar a mensagem temporária com a resposta do servidor
            updateTempMessage(tempMsgId, data);
        })
        .catch(err => {
            console.error('Erro ao enviar imagem:', err);
            // Mostrar erro na mensagem temporária
            updateTempMessageWithError(tempMsgId, err.message);
            // ↓↓↓ REMOVA O ID TEMPORÁRIO EM CASO DE ERRO ↓↓↓
            seenMessageIds.delete(tempMsgId);
        });
        
        closeImagePreview();
    };
    reader.readAsDataURL(selectedImageFile);
}

// Função para atualizar mensagem temporária com sucesso
function updateTempMessage(tempId, serverMsg) {
    const messageDiv = messagesDiv.querySelector(`[data-temp-id="${tempId}"]`);
    if (messageDiv) {
        const contentDiv = messageDiv.querySelector('.message-content');
        
        if (serverMsg.type === 'imagem' && serverMsg.image_data) {
            // Mensagem de imagem
            contentDiv.innerHTML = `
                <div class="message-image-container">
                    <img src="${serverMsg.image_data}" alt="Imagem enviada" class="message-image" onclick="openImageFullscreen('${serverMsg.image_data}')">
                    <div class="message-image-caption">Imagem enviada</div>
                </div>
            `;
        } else if (serverMsg.type === 'audio' && serverMsg.audio_data) {
            // Mensagem de áudio
            contentDiv.innerHTML = `
                <div class="message-audio">
                    <audio controls src="${serverMsg.audio_data}"></audio>
                    <div class="message-audio-caption">Áudio ${serverMsg.audio_duration ? `- ${serverMsg.audio_duration}s` : ''}</div>
                </div>
            `;
        } else {
            // Mensagem de texto normal - apenas atualizar o conteúdo se necessário
            contentDiv.textContent = serverMsg.conteudo;
        }
        
        messageDiv.removeAttribute('data-temp-id');
        messageDiv.classList.remove('temp');
        
        // Atualizar o ID real da mensagem
        messageDiv.dataset.messageId = serverMsg.id;
    }
}

// Função para mostrar erro no upload
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

// Função para abrir imagem em tela cheia
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

// Adicionar função openImageFullscreen ao escopo global
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
                name: username,
                content: 'Áudio',
                type: 'audio',
                audio_data: audioData,
                audio_duration: recordingTime
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

// Funções auxiliares
function formatTime(iso) {
    const date = new Date(iso);
    // Formata para HH:MM (apenas horas e minutos)
    return date.toTimeString().substring(0, 5);
}

function appendMessage(msg, isSelf = false) {
    // Verificação extra: NÃO ADICIONAR SE JÁ EXISTIR
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

    let headerHTML = '';
    let contentHTML = '';

    // Verificar pelo campo 'type'
    if (msg.type === 'imagem' && msg.image_data) {
        contentHTML = `
            <div class="message-image-container">
                <img src="${msg.image_data}" alt="Imagem enviada" class="message-image" onclick="openImageFullscreen('${msg.image_data}')">
                <div class="message-image-caption">Imagem enviada</div>
            </div>
        `;
    } else if (msg.type === 'audio' && msg.audio_data) {
        contentHTML = `
            <div class="message-audio">
                <audio controls src="${msg.audio_data}"></audio>
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
    
    if (messagesDiv) {
        messagesDiv.appendChild(div);
        scrollToBottom();
    }
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
    if (!username) return;
    
    let url = '/messages';
    if (lastSince) url += `?since=${encodeURIComponent(lastSince)}`;
    if (username) url += `${lastSince ? '&' : '?'}name=${encodeURIComponent(username)}`;
    
    fetch(url)
        .then(res => res.json())
        .then(data => {
            let newMsgs = 0;
            data.messages.forEach(msg => {
                // ↓↓↓ VERIFICAÇÃO MAIS ROBUSTA PARA EVITAR DUPLICAÇÕES ↓↓↓
                if (seenMessageIds.has(msg.id) || 
                    (pendingMessageId && msg.id === pendingMessageId) ||
                    (msg.nome === username && Date.now() - new Date(msg.timestamp).getTime() < 2000)) {
                    return;
                }
                appendMessage(msg);
                seenMessageIds.add(msg.id);
                newMsgs++;
            });
            updateOnline(data.online);
            if (newMsgs > 0) {
                lastSince = data.messages[data.messages.length - 1].timestamp;
            }
        })
        .catch(err => console.error('Erro no poll:', err));
}

// Send
function send() {
    let content = input.value.trim();
    if (!content || !username) return;
    input.value = '';

    const approxIso = new Date().toISOString();
    const tempMsgId = 'txt-' + Date.now(); // ID temporário para texto também
    const tempMsg = {
        id: tempMsgId, 
        nome: username, 
        conteudo: content, 
        timestamp: approxIso,
        isTemp: true
    };
    
    // ↓↓↓ ADICIONE O ID TEMPORÁRIO AO seenMessageIds ↓↓↓
    seenMessageIds.add(tempMsgId);
    appendMessage(tempMsg, true);

    fetch('/send', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({name: username, content})
    })
    .then(res => res.json())
    .then(data => {
        if (data.id && data.timestamp) {
            // ↓↓↓ ADICIONE O ID REAL AO seenMessageIds ↓↓↓
            seenMessageIds.add(data.id);
            pendingMessageId = data.id;
            lastSince = data.timestamp;
            console.log('Mensagem confirmada por ID:', data.id);
            
            // Atualizar a mensagem temporária
            updateTempMessage(tempMsgId, data);
        } else if (data.error) {
            console.error('Erro ao enviar:', data.error);
            if (messagesDiv.lastChild) messagesDiv.removeChild(messagesDiv.lastChild);
            pendingMessageId = null;
            // ↓↓↓ REMOVA O ID TEMPORÁRIO EM CASO DE ERRO ↓↓↓
            seenMessageIds.delete(tempMsgId);
        }
    })
    .catch(err => {
        console.error('Erro ao enviar:', err);
        if (messagesDiv.lastChild) messagesDiv.removeChild(messagesDiv.lastChild);
        pendingMessageId = null;
        // ↓↓↓ REMOVA O ID TEMPORÁRIO EM CASO DE ERRO ↓↓↓
        seenMessageIds.delete(tempMsgId);
    });
}

// Setar nome - CORRIGIDA
function setName() {
    console.log('Função setName chamada');
    let name = nameInput.value.trim();
    console.log('Nome digitado:', name);
    
    if (!name) {
        console.log('Nome vazio, não entrando no chat');
        return;
    }
    
    username = name;
    seenMessageIds.clear();
    pendingMessageId = null;
    
    console.log('Escondendo nameSetup e mostrando chatArea');
    nameSetup.style.display = 'none';
    chatArea.style.display = 'flex';
    
    console.log('Nome setado:', username);
    
    // Iniciar polling
    poll();
    setInterval(poll, 1000);
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

// Eventos básicos - CORRIGIDOS
if (setNameBtn) {
    setNameBtn.addEventListener('click', setName);
    console.log('Evento do botão setName configurado');
} else {
    console.error('Botão setNameBtn não encontrado!');
}

if (nameInput) {
    nameInput.addEventListener('keypress', e => { 
        if (e.key === 'Enter') setName(); 
    });
}

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
        audioRecordModal.style.display = 'flex';
        resetAudioRecording();
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

// Início - VERIFICAR DISPLAY INICIAL
console.log('Inicializando display...');
if (nameSetup) {
    nameSetup.style.display = 'block';
} else {
    console.error('Elemento nameSetup não encontrado!');
}

if (chatArea) {
    chatArea.style.display = 'none';
} else {
    console.error('Elemento chatArea não encontrado!');
}

console.log('=== DEBUG IMAGENS ===');
console.log('attach-btn:', document.getElementById('attach-btn'));
console.log('file-input:', document.getElementById('file-input'));
console.log('imagePreviewModal:', document.getElementById('image-preview-modal'));

// Verificar se o botão está no DOM
setTimeout(() => {
    const attachBtn = document.getElementById('attach-btn');
    if (!attachBtn) {
        console.error('❌ BOTÃO attach-btn NÃO ENCONTRADO NO DOM!');
    } else {
        console.log('✅ Botão attach-btn encontrado');
        // Forçar estilos para garantir que é visível
        attachBtn.style.display = 'inline-block';
        attachBtn.style.visibility = 'visible';
        attachBtn.style.opacity = '1';
    }
}, 1000);
// ↑↑↑ CÓDIGO DE DEBUG ↑↑↑