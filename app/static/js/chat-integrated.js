// static/js/chat-integrated.js
class IntegratedChat {
    constructor() {
        this.lastSince = '';
        this.username = '';
        this.pendingMessageId = null;
        this.seenMessageIds = new Set();
        this.currentChat = null;
        this.chatHistory = {};
        this.pollInterval = null;
        
        // Variáveis para controle de mídia
        this.selectedImageFile = null;
        this.imageFullscreenModal = null;
        this.mediaRecorder = null;
        this.audioChunks = [];
        this.audioBlob = null;
        this.recordingInterval = null;
        this.recordingTime = 0;
        
        this.initialize();
    }

    async initialize() {
        console.log('🚀 Inicializando Chat Integrado...');
        await this.loadUserInfo();
        this.initializeElements();
        this.initializeEventListeners();
        this.enableMessageEditing();
        console.log('✅ Chat integrado inicializado para:', this.username);
    }

    async loadUserInfo() {
        try {
            console.log('🔐 Buscando informações do usuário...');
            const response = await fetch('/user-info');
            const data = await response.json();
            
            if (data.error) {
                console.error('❌ Usuário não autenticado:', data.error);
                window.location.href = '/portal';
                return;
            }
            
            this.username = data.username;
            console.log('✅ Usuário da sessão:', this.username);
        } catch (error) {
            console.error('💥 Erro ao carregar user-info:', error);
            window.location.href = '/portal';
        }
    }

    initializeElements() {
        console.log('🔧 Inicializando elementos do chat integrado...');
        
        // Elementos principais
        this.messagesDiv = document.getElementById('messages');
        this.onlineUl = document.getElementById('online-list');
        this.input = document.getElementById('msg-input');
        this.sendBtn = document.getElementById('send-btn');
        this.chatTitle = document.getElementById('chat-title');
        this.chatInfo = document.getElementById('chat-info');
        this.backToListBtn = document.getElementById('back-to-list');
        this.activeChat = document.getElementById('active-chat');
        this.welcomeState = document.getElementById('welcome-chat-state');
        
        // Elementos de mídia
        this.attachBtn = document.getElementById('attach-btn');
        this.recordBtn = document.getElementById('record-btn');
        this.emojiBtn = document.getElementById('emoji-btn');
        this.fileInput = document.getElementById('file-input');
        
        // Modais
        this.emojiModal = document.getElementById('emoji-modal');
        this.emojiSearch = document.getElementById('emoji-search');
        this.emojiGrid = document.getElementById('emoji-grid');
        this.emojiCount = document.getElementById('emoji-count');
        this.closeEmojiModal = document.getElementById('close-emoji-modal');
        
        this.imagePreviewModal = document.getElementById('image-preview-modal');
        this.previewImage = document.getElementById('preview-image');
        this.closePreviewModal = document.getElementById('close-preview-modal');
        this.cancelPreview = document.getElementById('cancel-preview');
        this.sendImageBtn = document.getElementById('send-image');
        
        this.audioRecordModal = document.getElementById('audio-record-modal');
        this.closeAudioModal = document.getElementById('close-audio-modal');
        this.cancelAudio = document.getElementById('cancel-audio');
        this.startRecordBtn = document.getElementById('start-record-btn');
        this.stopRecordBtn = document.getElementById('stop-record-btn');
        this.sendAudioBtn = document.getElementById('send-audio');
        this.audioPreview = document.getElementById('audio-preview');
        this.audioRecordTimer = document.getElementById('audio-record-timer');
        this.audioRecordVisualizer = document.getElementById('audio-record-visualizer');

        console.log('✅ Elementos inicializados:', {
            messagesDiv: !!this.messagesDiv,
            input: !!this.input,
            sendBtn: !!this.sendBtn,
            activeChat: !!this.activeChat,
            welcomeState: !!this.welcomeState
        });
    }

    initializeEventListeners() {
        console.log('🎯 Configurando event listeners...');
        
        // Event listeners básicos
        if (this.sendBtn) {
            this.sendBtn.addEventListener('click', () => this.send());
        }
        
        if (this.input) {
            this.input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.send();
            });
        }

        if (this.backToListBtn) {
            this.backToListBtn.addEventListener('click', () => this.showConversationList());
        }

        // Event listeners de mídia
        if (this.attachBtn) {
            this.attachBtn.addEventListener('click', () => this.fileInput?.click());
        }
        
        if (this.fileInput) {
            this.fileInput.addEventListener('change', (e) => this.handleImageSelect(e));
        }

        if (this.recordBtn) {
            this.recordBtn.addEventListener('click', () => this.showAudioModal());
        }

        // Inicializar modais
        this.initializeModals();
        
        console.log('✅ Event listeners configurados');
    }

    initializeModals() {
        console.log('🎪 Inicializando modais...');
        
        // Emoji modal
        if (this.emojiBtn && this.emojiModal) {
            this.emojiBtn.addEventListener('click', () => this.showEmojiModal());
        }
        
        if (this.closeEmojiModal) {
            this.closeEmojiModal.addEventListener('click', () => this.closeEmojiModalFunc());
        }
        
        if (this.emojiModal) {
            this.emojiModal.addEventListener('click', (e) => {
                if (e.target === this.emojiModal) this.closeEmojiModalFunc();
            });
        }
        
        if (this.emojiSearch) {
            this.emojiSearch.addEventListener('input', (e) => this.injectEmojis(e.target.value));
        }

        // Image preview modal
        if (this.closePreviewModal) {
            this.closePreviewModal.addEventListener('click', () => this.closeImagePreview());
        }
        
        if (this.cancelPreview) {
            this.cancelPreview.addEventListener('click', () => this.closeImagePreview());
        }
        
        if (this.sendImageBtn) {
            this.sendImageBtn.addEventListener('click', () => this.sendImage());
        }
        
        if (this.imagePreviewModal) {
            this.imagePreviewModal.addEventListener('click', (e) => {
                if (e.target === this.imagePreviewModal) this.closeImagePreview();
            });
        }

        // Audio record modal
        if (this.closeAudioModal) {
            this.closeAudioModal.addEventListener('click', () => this.closeAudioModalFunc());
        }
        
        if (this.cancelAudio) {
            this.cancelAudio.addEventListener('click', () => this.closeAudioModalFunc());
        }
        
        if (this.startRecordBtn) {
            this.startRecordBtn.addEventListener('click', () => this.startRecording());
        }
        
        if (this.stopRecordBtn) {
            this.stopRecordBtn.addEventListener('click', () => this.stopRecording());
        }
        
        if (this.sendAudioBtn) {
            this.sendAudioBtn.addEventListener('click', () => this.sendAudio());
        }
        
        if (this.audioRecordModal) {
            this.audioRecordModal.addEventListener('click', (e) => {
                if (e.target === this.audioRecordModal) this.closeAudioModalFunc();
            });
        }

        // Fechar modais com ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.emojiModal?.style.display === 'flex') this.closeEmojiModalFunc();
                if (this.imagePreviewModal?.style.display === 'flex') this.closeImagePreview();
                if (this.audioRecordModal?.style.display === 'flex') this.closeAudioModalFunc();
                if (this.imageFullscreenModal?.style.display === 'flex') this.closeImageFullscreen();
            }
        });

        console.log('✅ Modais inicializados');
    }

    openChat(chatId, chatType, chatName, participants = []) {
        console.log(`💬 [OPEN_CHAT] Abrindo chat: ${chatName} (${chatType}) ID: ${chatId}`);
        
        this.currentChat = {
            id: chatId,
            type: chatType,
            name: chatName,
            participants: participants
        };

        // INICIALIZAR HISTÓRICO CORRETAMENTE
        if (!this.chatHistory[chatId]) {
            this.chatHistory[chatId] = { messages: [], lastSince: '' };
        }

        // Mostrar chat ativo
        if (this.activeChat) this.activeChat.style.display = 'flex';
        if (this.welcomeState) this.welcomeState.style.display = 'none';

        // Atualizar interface
        this.updateChatHeader();
        
        // Carregar mensagens
        this.loadChatMessages();
        
        // Iniciar polling
        this.startPolling();

        console.log('✅ [OPEN_CHAT] Chat aberto:', this.currentChat);
        
        // LOG ESPECIAL PARA GRUPOS
        if (chatType === 'group' && chatId !== 'general') {
            console.log(`🎯 [OPEN_CHAT] GRUPO IDENTIFICADO - conversa_id: ${chatId}`);
            console.log(`📝 [OPEN_CHAT] As mensagens enviadas aqui devem usar conversa_id: ${chatId}`);
        }
    }

    showConversationList() {
        console.log('📋 Voltando para lista de conversas');
        
        if (this.activeChat) this.activeChat.style.display = 'none';
        if (this.welcomeState) this.welcomeState.style.display = 'flex';
        this.currentChat = null;
        this.stopPolling();
        
        // Limpar área de mensagens
        if (this.messagesDiv) this.messagesDiv.innerHTML = '';
        
        // Limpar input
        if (this.input) this.input.value = '';
    }

    updateChatHeader() {
        if (!this.currentChat) return;
        
        console.log('🏷️ Atualizando header do chat:', this.currentChat);
        
        if (this.chatTitle) {
            this.chatTitle.textContent = this.currentChat.name;
        }
        
        if (this.chatInfo) {
            if (this.currentChat.type === 'group') {
                this.chatInfo.textContent = `Grupo • ${this.currentChat.participants.length} participantes`;
            } else if (this.currentChat.type === 'private') {
                this.chatInfo.textContent = 'Chat privado';
            } else {
                this.chatInfo.textContent = 'Chat público';
            }
        }
    }

    loadChatMessages() {
        if (!this.messagesDiv || !this.currentChat) return;
        
        console.log('📨 Carregando mensagens do chat:', this.currentChat.id);
        
        // Limpar mensagens atuais
        this.messagesDiv.innerHTML = '';
        
        // Carregar mensagens do histórico local
        const chatData = this.chatHistory[this.currentChat.id];
        if (chatData && chatData.messages.length > 0) {
            chatData.messages.forEach(msg => {
                this.appendMessage(msg);
            });
            this.scrollToBottom();
        }
        
        // Iniciar polling para este chat específico
        this.lastSince = chatData?.lastSince || '';
    }

    startPolling() {
        this.stopPolling();
        this.pollInterval = setInterval(() => this.poll(), 1000);
        console.log('🔄 Polling iniciado para chat:', this.currentChat?.id);
    }

    stopPolling() {
        if (this.pollInterval) {
            clearInterval(this.pollInterval);
            this.pollInterval = null;
            console.log('🛑 Polling parado');
        }
    }

    async poll() {
        if (!this.username || !this.currentChat) return;
        
        let url = `/messages?chat=${encodeURIComponent(this.currentChat.id)}&type=${encodeURIComponent(this.currentChat.type)}`;
        if (this.lastSince) url += `&since=${encodeURIComponent(this.lastSince)}`;
        
        try {
            const response = await fetch(url);
            const data = await response.json();
            
            let newMsgs = 0;
            data.messages.forEach(msg => {
                if (msg.chat_id !== this.currentChat.id) return;
                
                if (this.seenMessageIds.has(msg.id) || (this.pendingMessageId && msg.id === this.pendingMessageId)) {
                    return;
                }
                
                this.appendMessage(msg);
                this.seenMessageIds.add(msg.id);
                newMsgs++;
                
                // Salvar no histórico local
                if (!this.chatHistory[this.currentChat.id].messages.some(m => m.id === msg.id)) {
                    this.chatHistory[this.currentChat.id].messages.push(msg);
                }
            });
            
            this.updateOnline(data.online);
            
            if (newMsgs > 0) {
                this.lastSince = data.messages[data.messages.length - 1].timestamp;
                this.chatHistory[this.currentChat.id].lastSince = this.lastSince;
                
                if (newMsgs === 1) {
                    console.log(`📩 Nova mensagem recebida no chat ${this.currentChat.id}`);
                } else {
                    console.log(`📩 ${newMsgs} novas mensagens recebidas no chat ${this.currentChat.id}`);
                }
            }
        } catch (err) {
            console.error('❌ Erro no poll:', err);
        }
    }

    async send() {
        let content = this.input?.value.trim();
        if (!content || !this.username || !this.currentChat) {
            console.log('⚠️ Não é possível enviar mensagem: conteúdo vazio ou chat não selecionado');
            return;
        }
        
        this.input.value = '';

        // DETERMINAR CONVERSA_ID - VERSÃO CORRIGIDA
        let conversaId = null;
        
        console.log('🔍 [SEND] Analisando currentChat:', {
            id: this.currentChat.id,
            type: this.currentChat.type, 
            name: this.currentChat.name
        });

        // REGRA CLARA: Grupos (exceto Chat Geral) usam conversa_id
        if (this.currentChat.type === 'group' && this.currentChat.id !== 'general') {
            // CONVERTER PARA NÚMERO (IMPORTANTE!)
            conversaId = parseInt(this.currentChat.id);
            console.log(`🎯 [SEND] GRUPO IDENTIFICADO - conversa_id: ${conversaId} (tipo: ${typeof conversaId})`);
        } else {
            console.log(`🎯 [SEND] ${this.currentChat.id === 'general' ? 'Chat Geral' : 'Chat Privado'} - SEM conversa_id`);
        }

        const approxIso = new Date().toISOString();
        const tempMsgId = 'txt-' + Date.now();
        const tempMsg = {
            id: tempMsgId, 
            nome: this.username, 
            conteudo: content, 
            timestamp: approxIso,
            isTemp: true,
            chat_id: this.currentChat.id,
            chat_type: this.currentChat.type
        };
        
        this.seenMessageIds.add(tempMsgId);
        this.appendMessage(tempMsg, true);

        // Mostrar loading no botão
        if (this.sendBtn) {
            this.sendBtn.classList.add('sending');
            this.sendBtn.disabled = true;
        }

        try {
            // MONTAR DADOS
            const requestData = {
                content: content,
                type: 'texto', 
                chat_id: this.currentChat.id,
                chat_type: this.currentChat.type,
                participants: this.currentChat.participants || []
            };

            // ADICIONAR CONVERSA_ID APENAS PARA GRUPOS
            if (conversaId) {
                requestData.conversa_id = conversaId;
                console.log(`📤 [SEND] ENVIANDO COM conversa_id: ${conversaId} (tipo: ${typeof conversaId})`);
            } else {
                console.log(`📤 [SEND] ENVIANDO SEM conversa_id`);
            }

            console.log('🚀 [SEND] Dados completos enviados:', requestData);

            const response = await fetch('/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify(requestData)
            });
            
            const data = await response.json();
            
            // Remover loading do botão
            if (this.sendBtn) {
                this.sendBtn.classList.remove('sending');
                this.sendBtn.disabled = false;
            }

            if (data.id && data.timestamp) {
                console.log('✅ [SEND] Mensagem confirmada:', data.id);
                
                this.lastSince = data.timestamp;
                this.pendingMessageId = data.id;
                this.seenMessageIds.add(data.id);
                
                this.updateTempMessage(tempMsgId, data);
                
                if (!this.chatHistory[this.currentChat.id].messages.some(m => m.id === data.id)) {
                    this.chatHistory[this.currentChat.id].messages.push(data);
                }
                
                // FORÇAR ATUALIZAÇÃO DA LISTA DE CONVERSAS APÓS ENVIAR MENSAGEM
                setTimeout(() => {
                    if (window.loadConversations) {
                        console.log('🔄 [SEND] Atualizando lista de conversas...');
                        window.loadConversations();
                    }
                }, 1000);
                
            } else if (data.error) {
                console.error('❌ [SEND] Erro:', data.error);
                this.markMessageAsFailed(tempMsgId);
                this.pendingMessageId = null;
                this.seenMessageIds.delete(tempMsgId);
            }
        } catch (err) {
            console.error('❌ [SEND] Erro na requisição:', err);
            if (this.sendBtn) {
                this.sendBtn.classList.remove('sending');
                this.sendBtn.disabled = false;
            }
            this.markMessageAsFailed(tempMsgId);
            this.pendingMessageId = null;
            this.seenMessageIds.delete(tempMsgId);
        }
    }

    appendMessage(msg, isSelf = false) {
        if (!this.messagesDiv) return;
        
        const existingMessage = this.messagesDiv.querySelector(`[data-message-id="${msg.id}"]`) || 
                               this.messagesDiv.querySelector(`[data-temp-id="${msg.id}"]`);
        if (existingMessage) {
            return;
        }
        
        const isSelfMsg = isSelf || msg.nome === this.username;
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
                    <img src="${imageUrl}" alt="Imagem enviada" class="message-image" onclick="window.integratedChat.openImageFullscreen('${imageUrl}')">
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
                    <span class="timestamp">${this.formatTime(msg.timestamp)}</span>
                </div>
                ${contentHTML}
            `;
        } else {
            div.innerHTML = `
                <div class="message-header">
                    <span class="timestamp">${this.formatTime(msg.timestamp)}</span>
                    <strong>${msg.nome}</strong>
                </div>
                ${contentHTML}
            `;
        }
        
        this.messagesDiv.appendChild(div);
        this.scrollToBottom();
    }

    enableMessageEditing() {
        console.log('🔧 Habilitando edição de mensagens...');
        
        // Event listener para clicar em mensagens próprias
        if (this.messagesDiv) {
            this.messagesDiv.addEventListener('click', (e) => {
                const messageElement = e.target.closest('.message.self');
                if (messageElement && !messageElement.classList.contains('has-actions')) {
                    this.showMessageActions(messageElement);
                }
            });
        }
    }

    showMessageActions(messageElement) {
        const messageId = messageElement.dataset.messageId || messageElement.dataset.tempId;
        const currentContent = messageElement.querySelector('.message-content')?.textContent || '';
        
        if (!messageId) return;
        
        // Criar menu de ações
        const actionsDiv = document.createElement('div');
        actionsDiv.className = 'message-actions';
        actionsDiv.innerHTML = `
            <button class="edit-btn" onclick="window.integratedChat.startEditMessage('${messageId}', '${this.escapeHtml(currentContent)}')">
                ✏️ Editar
            </button>
            <button class="delete-btn" onclick="window.integratedChat.deleteMessage('${messageId}')">
                🗑️ Excluir
            </button>
        `;
        
        messageElement.appendChild(actionsDiv);
        messageElement.classList.add('has-actions');
        
        // Auto-remover após 5 segundos
        setTimeout(() => {
            if (actionsDiv.parentNode === messageElement) {
                actionsDiv.remove();
                messageElement.classList.remove('has-actions');
            }
        }, 5000);
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    async startEditMessage(messageId, currentContent) {
        console.log('✏️ Iniciando edição da mensagem:', messageId);
        
        const newContent = prompt('Editar mensagem:', currentContent);
        if (newContent && newContent !== currentContent) {
            await this.editMessage(messageId, newContent);
        }
        
        // Remover menu de ações
        this.removeMessageActions();
    }

    async editMessage(messageId, newContent) {
        try {
            console.log('📤 Enviando edição para servidor...');
            
            const response = await fetch('/edit-message', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    message_id: parseInt(messageId),
                    content: newContent
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ Mensagem editada com sucesso');
                this.updateMessageInUI(messageId, newContent, true);
            } else {
                alert('Erro: ' + data.error);
            }
        } catch (error) {
            console.error('❌ Erro ao editar mensagem:', error);
            alert('Erro de conexão ao editar mensagem.');
        }
    }

    async deleteMessage(messageId) {
        console.log('🗑️ Solicitando exclusão da mensagem:', messageId);
        
        if (confirm('Tem certeza que deseja excluir esta mensagem?')) {
            try {
                const response = await fetch('/delete-message', {
                    method: 'POST',
                    headers: {'Content-Type': 'application/json'},
                    body: JSON.stringify({ 
                        message_id: parseInt(messageId) 
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    console.log('✅ Mensagem excluída com sucesso');
                    this.removeMessageFromUI(messageId);
                } else {
                    alert('Erro: ' + data.error);
                }
            } catch (error) {
                console.error('❌ Erro ao excluir mensagem:', error);
                alert('Erro de conexão ao excluir mensagem.');
            }
        }
    }

    updateMessageInUI(messageId, newContent, isEdited = false) {
        const messageElement = this.messagesDiv.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            const contentElement = messageElement.querySelector('.message-content');
            if (contentElement) {
                contentElement.textContent = newContent;
                
                // Adicionar indicador de edição
                if (isEdited) {
                    let editIndicator = messageElement.querySelector('.edit-indicator');
                    if (!editIndicator) {
                        editIndicator = document.createElement('span');
                        editIndicator.className = 'edit-indicator';
                        editIndicator.textContent = ' (editado)';
                        editIndicator.style.fontSize = '0.8em';
                        editIndicator.style.color = 'rgba(255, 255, 255, 0.6)';
                        editIndicator.style.marginLeft = '5px';
                        contentElement.appendChild(editIndicator);
                    }
                }
            }
        }
    }

    removeMessageFromUI(messageId) {
        const messageElement = this.messagesDiv.querySelector(`[data-message-id="${messageId}"]`);
        if (messageElement) {
            messageElement.style.opacity = '0';
            messageElement.style.maxHeight = '0';
            messageElement.style.marginBottom = '0';
            messageElement.style.overflow = 'hidden';
            messageElement.style.transition = 'all 0.3s ease';
            
            setTimeout(() => {
                messageElement.remove();
            }, 300);
        }
    }

    removeMessageActions() {
        document.querySelectorAll('.message-actions').forEach(actions => {
            actions.remove();
        });
        document.querySelectorAll('.message').forEach(msg => {
            msg.classList.remove('has-actions');
        });
    }

    updateOnline(list) {
        if (!this.onlineUl) return;
        this.onlineUl.innerHTML = '';
        list.forEach(nome => {
            const li = document.createElement('li');
            li.textContent = nome + (nome === this.username ? ' (você)' : '');
            this.onlineUl.appendChild(li);
        });
    }

    scrollToBottom() {
        if (!this.messagesDiv) return;
        this.messagesDiv.scrollTo({
            top: this.messagesDiv.scrollHeight,
            behavior: 'smooth'
        });
    }

    formatTime(iso) {
        const date = new Date(iso);
        return date.toTimeString().substring(0, 5);
    }

    // ========== EMOJIS ==========
    showEmojiModal() {
        if (!this.emojiModal) return;
        
        this.emojiModal.style.display = 'flex';
        if (this.emojiSearch) {
            this.emojiSearch.value = '';
        }
        this.injectEmojis('');
        setTimeout(() => {
            if (this.emojiSearch) {
                this.emojiSearch.focus();
            }
        }, 100);
    }

    closeEmojiModalFunc() {
        if (this.emojiModal) {
            this.emojiModal.style.display = 'none';
        }
        if (this.emojiSearch) {
            this.emojiSearch.value = '';
        }
    }

    injectEmojis(searchTerm = '') {
        if (!this.emojiGrid) return;
        
        this.emojiGrid.innerHTML = '';
        
        const term = searchTerm.toLowerCase().trim();
        const filteredEmojis = this.getEmojisWithNames().filter(item => 
            item.name.toLowerCase().includes(term) || 
            item.emoji.includes(term)
        );
        
        if (filteredEmojis.length === 0) {
            const noResults = document.createElement('div');
            noResults.classList.add('no-results');
            noResults.textContent = 'Nenhum emoji encontrado';
            this.emojiGrid.appendChild(noResults);
        } else {
            filteredEmojis.forEach(item => {
                const btn = document.createElement('button');
                btn.classList.add('emoji-btn');
                btn.textContent = item.emoji;
                btn.type = 'button';
                btn.title = item.name;
                btn.addEventListener('click', () => {
                    if (this.input) {
                        this.input.value += item.emoji;
                        this.input.focus();
                    }
                    this.closeEmojiModalFunc();
                });
                this.emojiGrid.appendChild(btn);
            });
        }
        
        if (this.emojiCount) {
            this.emojiCount.textContent = `${filteredEmojis.length} emojis${term ? ' encontrados' : ' no total'}`;
        }
    }

    getEmojisWithNames() {
        return [
            // Smileys & Emotion
            { emoji: '😀', name: 'sorriso' }, { emoji: '😃', name: 'sorriso grande' }, { emoji: '😄', name: 'sorriso olhos felizes' },
            { emoji: '😁', name: 'sorriso com olhos brilhantes' }, { emoji: '😆', name: 'sorriso fechado olhos' }, { emoji: '😅', name: 'suando sorriso' },
            { emoji: '😂', name: 'chorando de rir' }, { emoji: '🤣', name: 'rolando de rir' }, { emoji: '😊', name: 'sorriso tímido' },
            { emoji: '😇', name: 'sorriso angelical' }, { emoji: '🙂', name: 'sorriso suave' }, { emoji: '🙃', name: 'cabeça para baixo' },
            { emoji: '😉', name: 'piscar' }, { emoji: '😌', name: 'aliviado' }, { emoji: '😍', name: 'apaixonado' },
            { emoji: '🥰', name: 'sorriso com corações' }, { emoji: '😘', name: 'beijo' }, { emoji: '😗', name: 'beijando' },
            { emoji: '😙', name: 'beijo com olhos felizes' }, { emoji: '😚', name: 'beijo com olhos fechados' }, { emoji: '😋', name: 'saboroso' },
            { emoji: '😛', name: 'língua para fora' }, { emoji: '😝', name: 'língua olhos fechados' }, { emoji: '😜', name: 'piscar com língua' },
            { emoji: '🤪', name: 'maluco' }, { emoji: '🤨', name: 'sobrancelha levantada' }, { emoji: '🧐', name: 'monóculo' },
            { emoji: '🤓', name: 'nerd' }, { emoji: '😎', name: 'descolado' }, { emoji: '🤩', name: 'estrelas nos olhos' },
            { emoji: '🥳', name: 'festa' }, { emoji: '😏', name: 'smirk' }, { emoji: '😒', name: 'entediado' },
            { emoji: '😞', name: 'decepcionado' }, { emoji: '😔', name: 'abatido' }, { emoji: '😟', name: 'preocupado' },
            { emoji: '😕', name: 'confuso' }, { emoji: '🙁', name: 'levemente triste' }, { emoji: '☹️', name: 'triste' },
            { emoji: '😣', name: 'sofrendo' }, { emoji: '😖', name: 'confuso' }, { emoji: '😫', name: 'cansado' },
            { emoji: '😩', name: 'exausto' }, { emoji: '🥺', name: 'suplicante' }, { emoji: '😢', name: 'chorando' },
            { emoji: '😭', name: 'chorando muito' }, { emoji: '😤', name: 'triumfante' }, { emoji: '😠', name: 'zangado' },
            { emoji: '😡', name: 'furioso' }, { emoji: '🤬', name: 'xingando' }, { emoji: '😳', name: 'corado' },
            { emoji: '🥵', name: 'calor' }, { emoji: '🥶', name: 'frio' }, { emoji: '😱', name: 'gritando' },
            { emoji: '😨', name: 'amedrontado' }, { emoji: '😰', name: 'ansioso' }, { emoji: '😥', name: 'decepcionado mas aliviado' },
            { emoji: '😓', name: 'suando frio' }, { emoji: '🤥', name: 'mentiroso' }, { emoji: '🤤', name: 'babando' },
            { emoji: '😶', name: 'sem boca' }, { emoji: '😐', name: 'neutro' }, { emoji: '😑', name: 'sem expressão' },
            { emoji: '😬', name: 'envergonhado' }, { emoji: '🙄', name: 'revirando olhos' }, { emoji: '😯', name: 'silêncio' },
            { emoji: '😦', name: 'carrancudo' }, { emoji: '😧', name: 'angustiado' }, { emoji: '😮', name: 'boca aberta' },
            { emoji: '😲', name: 'espantado' }, { emoji: '🥱', name: 'bocejando' }, { emoji: '😴', name: 'dormindo' },
            { emoji: '😪', name: 'sonolento' }, { emoji: '😵', name: 'tonto' }, { emoji: '🤯', name: 'explodindo' },
            { emoji: '😷', name: 'máscara' }, { emoji: '🤒', name: 'termômetro' }, { emoji: '🤕', name: 'cabeça enfaixada' },
            { emoji: '🤢', name: 'enjoado' },
            // Pessoas
            { emoji: '👋', name: 'acenando' }, { emoji: '🤚', name: 'levantando mão' }, { emoji: '🖐️', name: 'mão aberta' },
            { emoji: '✋', name: 'mão levantada' }, { emoji: '🖖', name: 'saudações vulcanas' }, { emoji: '👌', name: 'ok' },
            { emoji: '🤏', name: 'pinça' }, { emoji: '✌️', name: 'paz' }, { emoji: '🤞', name: 'dedos cruzados' },
            { emoji: '🤟', name: 'eu te amo' }, { emoji: '🤘', name: 'chifres' }, { emoji: '🤙', name: 'me liga' },
            { emoji: '👈', name: 'apontar esquerda' }, { emoji: '👉', name: 'apontar direita' }, { emoji: '👆', name: 'apontar cima' },
            { emoji: '🖕', name: 'dedo médio' }, { emoji: '👇', name: 'apontar baixo' }, { emoji: '☝️', name: 'apontar para cima' },
            { emoji: '👍', name: 'joinha' }, { emoji: '👎', name: 'polegar baixo' }, { emoji: '✊', name: 'punho' },
            { emoji: '👊', name: 'soco' }, { emoji: '🤛', name: 'punho esquerda' }, { emoji: '🤜', name: 'punho direita' },
            { emoji: '👏', name: 'palmas' }, { emoji: '🙌', name: 'mãos para cima' }, { emoji: '👐', name: 'mãos abertas' },
            { emoji: '🤲', name: 'palmas juntas' }, { emoji: '🤝', name: 'aperto de mãos' }, { emoji: '🙏', name: 'orar' },
            // Corações
            { emoji: '❤️', name: 'coração vermelho' }, { emoji: '🧡', name: 'coração laranja' }, { emoji: '💛', name: 'coração amarelo' },
            { emoji: '💚', name: 'coração verde' }, { emoji: '💙', name: 'coração azul' }, { emoji: '💜', name: 'coração roxo' },
            { emoji: '🖤', name: 'coração preto' }, { emoji: '🤍', name: 'coração branco' }, { emoji: '🤎', name: 'coração marrom' },
            { emoji: '💔', name: 'coração partido' },
            // Animais
            { emoji: '🐵', name: 'macaco' }, { emoji: '🐶', name: 'cachorro' }, { emoji: '🐱', name: 'gato' },
            { emoji: '🐭', name: 'rato' }, { emoji: '🐹', name: 'hamster' }, { emoji: '🐰', name: 'coelho' },
            { emoji: '🦊', name: 'raposa' }, { emoji: '🐻', name: 'urso' }, { emoji: '🐼', name: 'panda' },
            { emoji: '🐨', name: 'coala' }, { emoji: '🐯', name: 'tigre' }, { emoji: '🦁', name: 'leão' },
            { emoji: '🐮', name: 'vaca' }, { emoji: '🐷', name: 'porco' }, { emoji: '🐸', name: 'sapo' },
            { emoji: '🐙', name: 'polvo' },
            // Comidas
            { emoji: '🍎', name: 'maçã' }, { emoji: '🍐', name: 'pera' }, { emoji: '🍊', name: 'laranja' },
            { emoji: '🍋', name: 'limão' }, { emoji: '🍌', name: 'banana' }, { emoji: '🍉', name: 'melancia' },
            { emoji: '🍇', name: 'uva' }, { emoji: '🍓', name: 'morango' }, { emoji: '🫐', name: 'mirtilo' },
            { emoji: '🍈', name: 'melão' }, { emoji: '🍒', name: 'cereja' }, { emoji: '🍑', name: 'pêssego' },
            { emoji: '🥭', name: 'manga' }, { emoji: '🍍', name: 'abacaxi' }, { emoji: '🥥', name: 'coco' },
            { emoji: '🥑', name: 'abacate' }, { emoji: '🍆', name: 'berinjela' }, { emoji: '🥔', name: 'batata' },
            { emoji: '🥕', name: 'cenoura' }, { emoji: '🌽', name: 'milho' }, { emoji: '🌶️', name: 'pimenta' },
            { emoji: '🫑', name: 'pimentão' },
            // Objetos
            { emoji: '⌚', name: 'relógio' }, { emoji: '📱', name: 'celular' }, { emoji: '💻', name: 'notebook' },
            { emoji: '🖥️', name: 'computador' }, { emoji: '🖨️', name: 'impressora' }, { emoji: '🎮', name: 'videogame' },
            { emoji: '👾', name: 'alien' },
            // Símbolos
            { emoji: '💯', name: 'cem pontos' }, { emoji: '✨', name: 'brilho' }, { emoji: '🎉', name: 'festa' },
            { emoji: '🎊', name: 'confete' }, { emoji: '🔥', name: 'fogo' }, { emoji: '💥', name: 'explosão' },
            { emoji: '⭐', name: 'estrela' }, { emoji: '🌟', name: 'estrela brilhante' }, { emoji: '🙈', name: 'não vejo mal' },
            { emoji: '🙉', name: 'não ouço mal' }, { emoji: '🙊', name: 'não falo mal' }
        ];
    }

    // ========== IMAGENS ==========
    handleImageSelect(event) {
        const file = event.target.files[0];
        if (!file) return;

        if (!file.type.match('image.*')) {
            alert('Por favor, selecione apenas arquivos de imagem.');
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert('A imagem é muito grande. Por favor, selecione uma imagem menor que 5MB.');
            return;
        }

        this.selectedImageFile = file;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (this.previewImage) {
                this.previewImage.src = e.target.result;
            }
            if (this.imagePreviewModal) {
                this.imagePreviewModal.style.display = 'flex';
            }
        };
        reader.readAsDataURL(file);
    }

    closeImagePreview() {
        if (this.imagePreviewModal) {
            this.imagePreviewModal.style.display = 'none';
        }
        if (this.fileInput) {
            this.fileInput.value = '';
        }
        this.selectedImageFile = null;
    }

    sendImage() {
        if (!this.selectedImageFile || !this.username || !this.currentChat) {
            this.closeImagePreview();
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const imageData = e.target.result;
            
            const approxIso = new Date().toISOString();
            const tempMsgId = 'img-' + Date.now();
            const tempMsg = {
                id: tempMsgId, 
                nome: this.username, 
                conteudo: '📷 Enviando imagem...', 
                timestamp: approxIso,
                type: 'imagem',
                isTemp: true
            };
            
            this.seenMessageIds.add(tempMsgId);
            this.appendMessage(tempMsg, true);
            
            fetch('/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    content: 'Imagem',
                    type: 'imagem',
                    image_data: imageData,
                    chat_id: this.currentChat.id,
                    chat_type: this.currentChat.type
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                this.seenMessageIds.add(data.id);
                this.pendingMessageId = data.id;
                this.updateTempMessage(tempMsgId, data);
            })
            .catch(err => {
                console.error('❌ Erro ao enviar imagem:', err);
                this.updateTempMessageWithError(tempMsgId, err.message);
                this.seenMessageIds.delete(tempMsgId);
            });
            
            this.closeImagePreview();
        };
        reader.readAsDataURL(this.selectedImageFile);
    }

    openImageFullscreen(imageSrc) {
        if (!this.imageFullscreenModal) {
            this.imageFullscreenModal = document.getElementById('image-fullscreen-modal');
            if (!this.imageFullscreenModal) {
                this.imageFullscreenModal = document.createElement('div');
                this.imageFullscreenModal.id = 'image-fullscreen-modal';
                this.imageFullscreenModal.className = 'image-fullscreen-modal';
                this.imageFullscreenModal.innerHTML = `
                    <div class="image-fullscreen-content">
                        <img src="" alt="Imagem em tela cheia">
                    </div>
                `;
                document.body.appendChild(this.imageFullscreenModal);
                
                this.imageFullscreenModal.addEventListener('click', () => {
                    this.closeImageFullscreen();
                });
            }
        }
        
        const img = this.imageFullscreenModal.querySelector('img');
        img.src = imageSrc;
        this.imageFullscreenModal.style.display = 'flex';
    }

    closeImageFullscreen() {
        if (this.imageFullscreenModal) {
            this.imageFullscreenModal.style.display = 'none';
        }
    }

    // ========== ÁUDIO ==========
    showAudioModal() {
        if (this.audioRecordModal) {
            this.audioRecordModal.style.display = 'flex';
            this.resetAudioRecording();
        }
    }

    closeAudioModalFunc() {
        if (this.audioRecordModal) {
            this.audioRecordModal.style.display = 'none';
        }
        this.resetAudioRecording();
    }

    resetAudioRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
        }
        
        this.audioChunks = [];
        this.audioBlob = null;
        this.recordingTime = 0;
        
        if (this.audioRecordTimer) {
            this.audioRecordTimer.textContent = '00:00';
        }
        
        if (this.audioRecordVisualizer) {
            this.audioRecordVisualizer.innerHTML = 'Clique em "Iniciar Gravação"';
            this.audioRecordVisualizer.style.background = 'rgba(0, 0, 0, 0.2)';
        }
        
        if (this.startRecordBtn) this.startRecordBtn.disabled = false;
        if (this.stopRecordBtn) this.stopRecordBtn.disabled = true;
        if (this.sendAudioBtn) this.sendAudioBtn.disabled = true;
        if (this.audioPreview) this.audioPreview.style.display = 'none';
        
        if (this.recordingInterval) {
            clearInterval(this.recordingInterval);
        }
    }

    startRecording() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            alert('Seu navegador não suporta gravação de áudio.');
            return;
        }

        navigator.mediaDevices.getUserMedia({ audio: true })
            .then(stream => {
                this.mediaRecorder = new MediaRecorder(stream);
                this.audioChunks = [];

                this.mediaRecorder.ondataavailable = event => {
                    this.audioChunks.push(event.data);
                };

                this.mediaRecorder.onstop = () => {
                    this.audioBlob = new Blob(this.audioChunks, { type: 'audio/wav' });
                    const audioUrl = URL.createObjectURL(this.audioBlob);
                    const audioElement = this.audioPreview?.querySelector('audio');
                    if (audioElement) {
                        audioElement.src = audioUrl;
                    }
                    if (this.audioPreview) {
                        this.audioPreview.style.display = 'block';
                    }
                    if (this.sendAudioBtn) {
                        this.sendAudioBtn.disabled = false;
                    }
                };

                this.mediaRecorder.start();
                if (this.startRecordBtn) this.startRecordBtn.disabled = true;
                if (this.stopRecordBtn) this.stopRecordBtn.disabled = false;
                
                if (this.audioRecordVisualizer) {
                    this.audioRecordVisualizer.innerHTML = '🎤 Gravando...';
                    this.audioRecordVisualizer.style.background = 'linear-gradient(120deg, #c9302c, #d9534f)';
                    this.audioRecordVisualizer.classList.add('recording-animation');
                }

                this.recordingTime = 0;
                this.recordingInterval = setInterval(() => {
                    this.recordingTime++;
                    const minutes = Math.floor(this.recordingTime / 60).toString().padStart(2, '0');
                    const seconds = (this.recordingTime % 60).toString().padStart(2, '0');
                    if (this.audioRecordTimer) {
                        this.audioRecordTimer.textContent = `${minutes}:${seconds}`;
                    }
                }, 1000);
            })
            .catch(err => {
                console.error('❌ Erro ao acessar microfone:', err);
                alert('Erro ao acessar o microfone. Verifique as permissões.');
            });
    }

    stopRecording() {
        if (this.mediaRecorder && this.mediaRecorder.state === 'recording') {
            this.mediaRecorder.stop();
            this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
            
            if (this.startRecordBtn) this.startRecordBtn.disabled = false;
            if (this.stopRecordBtn) this.stopRecordBtn.disabled = true;
            
            if (this.audioRecordVisualizer) {
                this.audioRecordVisualizer.innerHTML = '✅ Gravação concluída';
                this.audioRecordVisualizer.style.background = 'linear-gradient(120deg, #248A52, #257287)';
                this.audioRecordVisualizer.classList.remove('recording-animation');
            }
            
            if (this.recordingInterval) {
                clearInterval(this.recordingInterval);
            }
        }
    }

    sendAudio() {
        if (!this.audioBlob || !this.username || !this.currentChat) {
            this.closeAudioModalFunc();
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            const audioData = e.target.result;
            
            const approxIso = new Date().toISOString();
            const tempMsgId = 'audio-' + Date.now();
            const tempMsg = {
                id: tempMsgId, 
                nome: this.username, 
                conteudo: '🎤 Áudio...', 
                timestamp: approxIso,
                type: 'audio',
                isTemp: true
            };
            
            this.seenMessageIds.add(tempMsgId);
            this.appendMessage(tempMsg, true);
            
            fetch('/send', {
                method: 'POST',
                headers: {'Content-Type': 'application/json'},
                body: JSON.stringify({
                    content: 'Áudio',
                    type: 'audio',
                    audio_data: audioData,
                    audio_duration: this.recordingTime,
                    chat_id: this.currentChat.id,
                    chat_type: this.currentChat.type
                })
            })
            .then(res => res.json())
            .then(data => {
                if (data.error) {
                    throw new Error(data.error);
                }
                this.seenMessageIds.add(data.id);
                this.pendingMessageId = data.id;
                this.updateTempMessage(tempMsgId, data);
            })
            .catch(err => {
                console.error('❌ Erro ao enviar áudio:', err);
                this.updateTempMessageWithError(tempMsgId, err.message);
                this.seenMessageIds.delete(tempMsgId);
            });
            
            this.closeAudioModalFunc();
        };
        reader.readAsDataURL(this.audioBlob);
    }

    // ========== FUNÇÕES AUXILIARES ==========
    updateTempMessage(tempId, serverMsg) {
        const messageDiv = this.messagesDiv?.querySelector(`[data-temp-id="${tempId}"]`);
        if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            
            if (serverMsg.type === 'imagem' && serverMsg.image_filename) {
                const imageUrl = `/uploads/images/${serverMsg.image_filename}`;
                contentDiv.innerHTML = `
                    <div class="message-image-container">
                        <img src="${imageUrl}" alt="Imagem enviada" class="message-image" onclick="window.integratedChat.openImageFullscreen('${imageUrl}')">
                        <div class="message-image-caption">Imagem enviada</div>
                    </div>
                `;
            } else if (serverMsg.type === 'audio' && serverMsg.audio_filename) {
                const audioUrl = `/uploads/audios/${serverMsg.audio_filename}`;
                contentDiv.innerHTML = `
                    <div class="message-audio">
                        <audio controls src="${audioUrl}"></audio>
                        <div class="message-audio-caption">Áudio ${serverMsg.audio_duration ? `- ${serverMsg.audio_duration}s` : ''}</div>
                    </div>
                `;
            } else {
                contentDiv.textContent = serverMsg.conteudo;
            }
            
            messageDiv.removeAttribute('data-temp-id');
            messageDiv.classList.remove('temp');
            messageDiv.dataset.messageId = serverMsg.id;
        }
    }

    updateTempMessageWithError(tempId, error) {
        const messageDiv = this.messagesDiv?.querySelector(`[data-temp-id="${tempId}"]`);
        if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.innerHTML = `<span style="color: #ff6b6b;">❌ Erro: ${error}</span>`;
            }
            messageDiv.removeAttribute('data-temp-id');
            messageDiv.classList.remove('temp');
        }
    }

    markMessageAsFailed(tempId) {
        const messageDiv = this.messagesDiv?.querySelector(`[data-temp-id="${tempId}"]`);
        if (messageDiv) {
            const contentDiv = messageDiv.querySelector('.message-content');
            if (contentDiv) {
                contentDiv.innerHTML = '<span style="color: #ff6b6b;">❌ Falha ao enviar mensagem</span>';
            }
            messageDiv.removeAttribute('data-temp-id');
            messageDiv.classList.remove('temp');
        }
    }

    // Método para integração com home.js
    openChatFromHome(chatId, chatType, chatName, participants = []) {
        this.openChat(chatId, chatType, chatName, participants);
    }
}

// Inicializar quando DOM estiver pronto
document.addEventListener('DOMContentLoaded', () => {
    window.integratedChat = new IntegratedChat();
    console.log('🎉 IntegratedChat inicializado e disponível como window.integratedChat');
});

// Exportar para uso global
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntegratedChat;
}