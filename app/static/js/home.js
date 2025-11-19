// home.js
let currentUser = '';
let onlineUsers = [];
let friendsList = [];
let friendRequests = [];
let currentTab = 'chats';
let logoutHandler = null;
let conversations = [];

// ========== INICIALIZAÇÃO ==========

document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Home inicializada - Sistema de Conversas WhatsApp-like');
    fetchUserInfo();
});

function fetchUserInfo() {
    fetch('/user-info', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            window.location.href = '/portal';
            throw new Error('Não autenticado');
        }
        return response.json();
    })
    .then(data => {
        currentUser = data.username;
        initializeHome();
    })
    .catch(error => {
        console.error('Erro:', error);
        window.location.href = '/portal';
    });
}

function initializeHome() {
    // Atualizar interface
    document.getElementById('user-name').textContent = currentUser;
    document.getElementById('user-avatar').textContent = currentUser.charAt(0).toUpperCase();
    
    setupEventListeners();
    setupDeleteConfirmation();
    setupConversationContextMenu();
    loadConversations();
    loadOnlineUsers();
    loadFriends();
    loadFriendRequests();
    
    // Iniciar polling para atualizações
    setInterval(loadConversations, 5000);
    setInterval(loadFriendRequests, 10000);
    setInterval(loadFriends, 15000);
    setInterval(loadOnlineUsers, 10000);
    
    console.log('✅ Home inicializada com sistema de conversas');
}

// ========== CONFIGURAÇÃO DE EVENT LISTENERS ==========

function setupEventListeners() {
    console.log('🔧 Configurando event listeners...');
    
    setupLogoutListener();
    setupTabListeners();
    setupActionButtons();
    setupModalListeners();
    setupSearchListeners();
    
    console.log('✅ Event listeners configurados');
}

function setupLogoutListener() {
    const logoutBtn = document.getElementById('logout-btn');
    
    if (logoutHandler) {
        logoutBtn.removeEventListener('click', logoutHandler);
    }
    
    logoutHandler = function(event) {
        console.log('🎯 Logout clicado');
        event.stopPropagation();
        event.preventDefault();
        
        if (confirm('Tem certeza que deseja sair?')) {
            logoutUser();
        }
    };
    
    logoutBtn.addEventListener('click', logoutHandler);
}

function setupTabListeners() {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', function() {
            const tab = this.getAttribute('data-tab');
            switchTab(tab);
        });
    });
}

function setupActionButtons() {
    // Botões principais
    document.getElementById('new-chat-btn').addEventListener('click', showPrivateChatModal);
    document.getElementById('new-group-btn').addEventListener('click', showCreateGroupModal);
    document.getElementById('delete-account-btn').addEventListener('click', showDeleteAccountModal);
    
    // Botões de boas-vindas
    document.getElementById('create-group-welcome').addEventListener('click', showCreateGroupModal);
    document.getElementById('start-private-chat-welcome').addEventListener('click', showPrivateChatModal);
    
    // Botões de amigos
    document.getElementById('add-friend-btn').addEventListener('click', showAddFriendModal);
    document.getElementById('add-first-friend').addEventListener('click', showAddFriendModal);
    document.getElementById('view-requests-btn').addEventListener('click', showFriendRequestsModal);
    
    // Ações de formulário
    document.getElementById('create-group').addEventListener('click', createNewGroup);
    document.getElementById('send-friend-request').addEventListener('click', sendFriendRequest);
}

function setupModalListeners() {
    // Fechar modais
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    // Cancelar modais
    document.getElementById('cancel-group').addEventListener('click', closeAllModals);
    document.getElementById('cancel-private').addEventListener('click', closeAllModals);
    document.getElementById('cancel-add-friend').addEventListener('click', closeAllModals);
    document.getElementById('close-requests').addEventListener('click', closeAllModals);
    
    // Modal de exclusão de conta
    document.getElementById('confirm-delete-account').addEventListener('click', deleteUserAccount);
    document.getElementById('cancel-delete-account').addEventListener('click', closeDeleteAccountModal);
    document.getElementById('close-delete-modal').addEventListener('click', closeDeleteAccountModal);

    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
}

function setupSearchListeners() {
    document.getElementById('search-input').addEventListener('input', filterContent);
    document.getElementById('friend-username').addEventListener('input', searchUsers);
}

// ========== SISTEMA DE EXCLUSÃO DE CONTA ==========

function setupDeleteConfirmation() {
    const confirmationInput = document.getElementById('delete-confirmation-input');
    const confirmButton = document.getElementById('confirm-delete-account');
    
    if (confirmationInput && confirmButton) {
        confirmationInput.addEventListener('input', function() {
            confirmButton.disabled = this.value !== 'CONFIRMAR EXCLUSÃO';
        });
    }
}

function showDeleteAccountModal() {
    console.log('🗑️ Abrindo modal de exclusão de conta...');
    document.getElementById('delete-account-modal').style.display = 'flex';
    document.getElementById('delete-confirmation-input').value = '';
    document.getElementById('confirm-delete-account').disabled = true;
}

function closeDeleteAccountModal() {
    document.getElementById('delete-account-modal').style.display = 'none';
}

async function deleteUserAccount() {
    console.log('🗑️ Solicitando exclusão da conta...');
    
    const confirmation = document.getElementById('delete-confirmation-input').value;
    
    if (confirmation !== 'CONFIRMAR EXCLUSÃO') {
        alert('Por favor, digite exatamente: CONFIRMAR EXCLUSÃO');
        return;
    }
    
    if (!confirm('🚨 ATENÇÃO FINAL!\n\nEsta ação é PERMANENTE e IRREVERSÍVEL!\n\n✅ Todos suas mensagens serão excluídas\n✅ Seus grupos serão removidos\n✅ Suas amizades serão perdidas\n\nTem certeza ABSOLUTA?')) {
        return;
    }
    
    try {
        const response = await fetch('/delete-account', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                confirmation: confirmation
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message + '\n\nRedirecionando para a página inicial...');
            
            // Redirecionar para o portal após 2 segundos
            setTimeout(() => {
                window.location.href = '/portal';
            }, 2000);
            
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Erro ao excluir conta:', error);
        alert('❌ Erro de conexão ao excluir conta. Tente novamente.');
    }
}

// ========== SISTEMA DE EXCLUSÃO DE GRUPOS ==========

function setupConversationContextMenu() {
    const conversationsList = document.getElementById('conversations-list');
    
    conversationsList.addEventListener('contextmenu', function(e) {
        e.preventDefault();
        
        const conversationItem = e.target.closest('.conversation-item');
        if (!conversationItem) return;
        
        const conversaId = conversationItem.getAttribute('data-conversa-id');
        const conversaType = conversationItem.getAttribute('data-conversa-type');
        const conversaName = conversationItem.getAttribute('data-conversa-name');
        
        // Só mostrar menu de exclusão para grupos (não para Chat Geral ou conversas privadas)
        if (conversaType === 'group' && conversaId !== 'general') {
            showConversationContextMenu(e, conversaId, conversaName);
        }
    });
}

function showConversationContextMenu(event, conversaId, conversaName) {
    // Remover menu anterior se existir
    const existingMenu = document.getElementById('conversation-context-menu');
    if (existingMenu) {
        existingMenu.remove();
    }
    
    // Criar menu de contexto
    const contextMenu = document.createElement('div');
    contextMenu.id = 'conversation-context-menu';
    contextMenu.className = 'context-menu';
    contextMenu.style.position = 'fixed';
    contextMenu.style.left = event.pageX + 'px';
    contextMenu.style.top = event.pageY + 'px';
    contextMenu.style.background = '#2a3942';
    contextMenu.style.border = '1px solid #3a4952';
    contextMenu.style.borderRadius = '8px';
    contextMenu.style.padding = '8px 0';
    contextMenu.style.zIndex = '1000';
    contextMenu.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    contextMenu.style.minWidth = '150px';
    
    contextMenu.innerHTML = `
        <div class="context-menu-item" data-action="delete" style="padding: 8px 16px; cursor: pointer; color: #e9edef; display: flex; align-items: center; gap: 8px; transition: background 0.2s;">
            <span>🗑️</span>
            Excluir Grupo
        </div>
    `;
    
    document.body.appendChild(contextMenu);
    
    // Adicionar evento de clique no item de exclusão
    contextMenu.querySelector('.context-menu-item[data-action="delete"]').addEventListener('click', function() {
        excluirGrupo(conversaId, conversaName);
        contextMenu.remove();
    });
    
    // Fechar menu ao clicar fora
    setTimeout(() => {
        const closeMenu = function(e) {
            if (!contextMenu.contains(e.target)) {
                contextMenu.remove();
                document.removeEventListener('click', closeMenu);
            }
        };
        document.addEventListener('click', closeMenu);
    }, 100);
}

async function excluirGrupo(grupoId, grupoNome) {
    console.log(`🗑️ Solicitando exclusão do grupo: ${grupoNome} (ID: ${grupoId})`);
    
    if (!confirm(`🚨 ATENÇÃO!\n\nTem certeza que deseja excluir o grupo "${grupoNome}"?\n\n✅ Todas as mensagens serão perdidas\n✅ Todos os participantes serão removidos\n✅ Esta ação é PERMANENTE e IRREVERSÍVEL!`)) {
        return;
    }
    
    try {
        const response = await fetch('/excluir-grupo', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                grupo_id: parseInt(grupoId)
            })
        });
        
        const data = await response.json();
        
        if (data.success) {
            alert('✅ ' + data.message);
            
            // Recarregar a lista de conversas
            loadConversations();
            
            // Se o grupo excluído era o chat ativo, voltar para a tela inicial
            if (window.integratedChat && window.integratedChat.currentChat && 
                window.integratedChat.currentChat.id === grupoId) {
                window.integratedChat.showConversationList();
            }
            
        } else {
            alert('❌ Erro: ' + data.error);
        }
    } catch (error) {
        console.error('❌ Erro ao excluir grupo:', error);
        alert('❌ Erro de conexão ao excluir grupo. Tente novamente.');
    }
}

// ========== SISTEMA DE CONVERSAS ==========

function loadConversations() {
    console.log('💬 [FRONTEND] Carregando conversas...');
    
    fetch('/conversas')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('📨 [FRONTEND] Resposta da API /conversas:', data);
            
            if (data.conversas && Array.isArray(data.conversas)) {
                conversations = data.conversas;
                console.log(`✅ [FRONTEND] ${conversations.length} conversas recebidas da API`);
                renderConversations(conversations);
            } else {
                console.warn('⚠️ [FRONTEND] Nenhuma conversa encontrada ou formato inválido');
                conversations = [];
                renderConversations([]);
            }
        })
        .catch(error => {
            console.error('❌ [FRONTEND] Erro ao carregar conversas:', error);
            conversations = [];
            renderConversations([]);
        });
}

function renderConversations(conversas) {
    const conversationsList = document.getElementById('conversations-list');
    if (!conversationsList) {
        console.error('❌ [FRONTEND] Elemento conversations-list não encontrado');
        return;
    }

    // Limpar lista (mantendo apenas o Chat Geral)
    conversationsList.innerHTML = '';
    
    // SEMPRE CRIAR O CHAT GERAL
    const generalChatItem = document.createElement('div');
    generalChatItem.className = 'conversation-item';
    generalChatItem.setAttribute('data-chat-id', 'general');
    generalChatItem.setAttribute('data-chat-type', 'group');
    generalChatItem.setAttribute('data-chat-name', 'Chat Geral');
    generalChatItem.innerHTML = `
        <div class="conversation-avatar group-avatar">👥</div>
        <div class="conversation-info">
            <div class="conversation-name">Chat Geral</div>
        </div>
        <div class="conversation-meta">
            <div class="conversation-time">Agora</div>
        </div>
    `;
    generalChatItem.addEventListener('click', function() {
        openConversa('general', 'group', 'Chat Geral');
    });
    conversationsList.appendChild(generalChatItem);

    // Adicionar conversas do banco de dados
    if (conversas && conversas.length > 0) {
        console.log(`🎨 [FRONTEND] Renderizando ${conversas.length} conversas`);
        
        conversas.forEach((conversa, index) => {
            if (conversa.nome === 'Chat Geral') {
                console.log(`⏭️ [FRONTEND] Pulando conversa duplicada do Chat Geral`);
                return;
            }
            
            const conversationItem = createConversationItem(conversa);
            conversationsList.appendChild(conversationItem);
        });
    }
}

function createConversationItem(conversa) {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.setAttribute('data-conversa-id', conversa.id);
    item.setAttribute('data-conversa-type', conversa.tipo);
    item.setAttribute('data-conversa-name', conversa.nome);

    const avatar = conversa.tipo === 'private' ? '👤' : '👥';
    const time = formatTime(conversa.ultima_mensagem_em);
    const preview = conversa.ultima_mensagem || 'Nenhuma mensagem ainda';
    const unread = conversa.mensagens_nao_lidas > 0 ? 
        `<div class="unread-count">${conversa.mensagens_nao_lidas}</div>` : '';

    // ADICIONAR TITLE PARA GRUPOS (indica que pode clicar com botão direito)
    const titleAttr = conversa.tipo === 'group' && conversa.id !== 'general' ? 
        'title="Clique com o botão direito para opções do grupo"' : '';

    item.innerHTML = `
        <div class="conversation-avatar ${conversa.tipo === 'group' ? 'group-avatar' : ''}">
            ${avatar}
        </div>
        <div class="conversation-info">
            <div class="conversation-name">${conversa.nome}</div>
            <div class="conversation-preview">${preview}</div>
        </div>
        <div class="conversation-meta">
            <div class="conversation-time">${time}</div>
            ${unread}
        </div>
    `;

    item.addEventListener('click', function() {
        const conversaId = this.getAttribute('data-conversa-id');
        const conversaType = this.getAttribute('data-conversa-type');
        const conversaName = this.getAttribute('data-conversa-name');
        openConversa(conversaId, conversaType, conversaName);
    });

    return item;
}

function formatTime(isoString) {
    if (!isoString) return '';
    
    try {
        const date = new Date(isoString);
        const now = new Date();
        const diffMs = now - date;
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMins / 60);
        const diffDays = Math.floor(diffHours / 24);

        if (diffMins < 1) return 'Agora';
        if (diffMins < 60) return `${diffMins} min`;
        if (diffHours < 24) return `${diffHours} h`;
        if (diffDays < 7) return `${diffDays} d`;
        
        return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
    } catch (e) {
        return '';
    }
}

function openConversa(conversaId, conversaType, conversaName) {
    console.log(`💬 [OPEN_CONVERSA] Abrindo: ${conversaName} (${conversaType}) ID: ${conversaId}`);
    
    if (window.integratedChat && typeof window.integratedChat.openChat === 'function') {
        window.integratedChat.openChat(conversaId, conversaType, conversaName, []);
    } else {
        console.error('❌ [OPEN_CONVERSA] Chat integrado não disponível');
        const params = new URLSearchParams({
            chat: conversaId,
            type: conversaType,
            name: conversaName
        });
        window.open('/chat?' + params.toString(), '_blank');
    }
}

// ========== SISTEMA DE AMIZADES ==========

function loadFriends() {
    console.log('👥 Carregando amigos...');
    
    fetch('/friends')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data && Array.isArray(data.friends)) {
                friendsList = data.friends;
            } else {
                friendsList = [];
                console.warn('Formato inesperado da resposta:', data);
            }
            updateFriendsList();
        })
        .catch(error => {
            console.error('Erro ao carregar amigos:', error);
            friendsList = [];
            updateFriendsList();
        });
}

function updateFriendsList() {
    const friendsListContainer = document.getElementById('friends-list');
    
    if (!friendsListContainer) {
        console.error('❌ ERRO: Elemento #friends-list não encontrado no DOM!');
        return;
    }
    
    friendsListContainer.innerHTML = '';
    
    if (!friendsList || friendsList.length === 0) {
        friendsListContainer.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👥</div>
                <h3>Nenhum amigo adicionado</h3>
                <p>Comece adicionando amigos para conversar</p>
                <button id="add-first-friend" class="welcome-btn">
                    <span>➕</span>
                    Adicionar Primeiro Amigo
                </button>
            </div>
        `;
        
        document.getElementById('add-first-friend').addEventListener('click', showAddFriendModal);
        return;
    }
    
    friendsList.forEach((friend, index) => {
        if (!friend || !friend.username) {
            console.error(`❌ Amigo na posição ${index} é inválido:`, friend);
            return;
        }
        
        const friendItem = document.createElement('div');
        friendItem.className = 'friend-item';
        friendItem.setAttribute('data-friend-id', friend.id || 'unknown');
        friendItem.setAttribute('data-friend-username', friend.username);
        
        const avatarLetter = friend.username.charAt(0).toUpperCase();
        
        friendItem.innerHTML = `
            <div class="friend-avatar">${avatarLetter}</div>
            <div class="friend-info">
                <div class="friend-name">${friend.username}</div>
                <div class="friend-status">
                    <span class="status-dot ${friend.online ? 'online' : ''}"></span>
                    ${friend.online ? 'Online' : 'Offline'}
                </div>
            </div>
            <div class="friend-actions">
                <button class="friend-action-btn chat-with-friend" title="Conversar" data-username="${friend.username}">💬</button>
                <button class="friend-action-btn remove-friend" title="Remover amigo" data-friend-id="${friend.id || 'unknown'}" data-username="${friend.username}">❌</button>
            </div>
        `;
        
        friendItem.querySelector('.chat-with-friend').addEventListener('click', function() {
            const username = this.getAttribute('data-username');
            startPrivateChat(username);
        });
        
        friendItem.querySelector('.remove-friend').addEventListener('click', function(e) {
            e.stopPropagation();
            const friendId = this.getAttribute('data-friend-id');
            const friendUsername = this.getAttribute('data-username');
            removeFriend(friendId, friendUsername);
        });
        
        friendsListContainer.appendChild(friendItem);
    });
}

function removeFriend(friendId, friendUsername) {
    console.log(`🗑️ INICIANDO remoção: ID ${friendId}, Username ${friendUsername}`);
    
    if (!friendId || friendId === 'unknown') {
        alert('Erro: ID do amigo inválido');
        return;
    }
    
    if (!confirm(`Tem certeza que deseja remover ${friendUsername} da sua lista de amigos?`)) {
        return;
    }
    
    fetch('/remove-friend', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            friend_id: parseInt(friendId),
            friend_username: friendUsername
        })
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        if (data.success) {
            alert(data.message);
            loadFriends();
        } else {
            alert('Erro: ' + data.error);
        }
    })
    .catch(error => {
        console.error('❌ Erro ao remover amigo:', error);
        alert('Erro de conexão ao remover amigo. Tente novamente.');
    });
}

// ========== SISTEMA DE PEDIDOS DE AMIZADE ==========

function loadFriendRequests() {
    console.log('📨 Carregando pedidos de amizade...');
    
    fetch('/friend-requests')
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro na rede');
            }
            return response.json();
        })
        .then(data => {
            if (data.requests) {
                friendRequests = data.requests;
            } else {
                friendRequests = [];
            }
            
            updateFriendRequestsIndicator();
            updateFriendRequestsModal();
        })
        .catch(error => {
            console.error('❌ Erro ao carregar pedidos:', error);
            friendRequests = [];
            updateFriendRequestsIndicator();
        });
}

function updateFriendRequestsIndicator() {
    const friendsTab = document.querySelector('[data-tab="friends"]');
    
    if (friendRequests.length > 0) {
        friendsTab.classList.add('has-requests');
    } else {
        friendsTab.classList.remove('has-requests');
    }
}

function showFriendRequestsModal() {
    const modal = document.getElementById('friend-requests-modal');
    if (!modal) {
        console.error('❌ Modal de pedidos não encontrado');
        return;
    }
    
    modal.style.display = 'flex';
    updateFriendRequestsModal();
}

function updateFriendRequestsModal() {
    const requestsList = document.getElementById('friend-requests-list');
    if (!requestsList) {
        console.error('❌ Lista de pedidos não encontrada');
        return;
    }
    
    if (friendRequests.length === 0) {
        requestsList.innerHTML = `
            <div class="empty-requests">
                <div class="empty-icon">📭</div>
                <p>Nenhum pedido de amizade pendente</p>
            </div>
        `;
        return;
    }
    
    requestsList.innerHTML = '';
    
    friendRequests.forEach(request => {
        const requestItem = document.createElement('div');
        requestItem.className = 'friend-request-item';
        requestItem.innerHTML = `
            <div class="friend-request-avatar">
                ${request.from_username.charAt(0).toUpperCase()}
            </div>
            <div class="friend-request-info">
                <div class="friend-request-name">${request.from_username}</div>
                <div class="friend-request-time">${request.time}</div>
            </div>
            <div class="friend-request-actions">
                <button class="request-action-btn accept" data-request-id="${request.id}" data-username="${request.from_username}">
                    ✓ Aceitar
                </button>
                <button class="request-action-btn reject" data-request-id="${request.id}" data-username="${request.from_username}">
                    ✗ Recusar
                </button>
            </div>
        `;
        
        requestsList.appendChild(requestItem);
    });
    
    document.querySelectorAll('.request-action-btn.accept').forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            const username = this.getAttribute('data-username');
            acceptFriendRequest(requestId, username);
        });
    });
    
    document.querySelectorAll('.request-action-btn.reject').forEach(btn => {
        btn.addEventListener('click', function() {
            const requestId = this.getAttribute('data-request-id');
            const username = this.getAttribute('data-username');
            rejectFriendRequest(requestId, username);
        });
    });
}

function acceptFriendRequest(requestId, username) {
    console.log(`✅ Aceitando pedido ${requestId} de ${username}`);
    
    fetch('/accept-friend-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            request_id: requestId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            loadFriendRequests();
            loadFriends();
        } else {
            alert('Erro: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao aceitar pedido de amizade.');
    });
}

function rejectFriendRequest(requestId, username) {
    console.log(`❌ Rejeitando pedido ${requestId} de ${username}`);
    
    fetch('/reject-friend-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            request_id: requestId
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            loadFriendRequests();
        } else {
            alert('Erro: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao rejeitar pedido de amizade.');
    });
}

// ========== SISTEMA DE GRUPOS E CHATS PRIVADOS ==========

function startPrivateChat(username) {
    console.log(`🔒 Iniciando chat privado com ${username}`);
    
    const sortedUsers = [currentUser, username].sort();
    const chatId = 'private-' + sortedUsers.join('-');
    
    closeAllModals();
    openChat(chatId, 'private', username, [currentUser, username]);
}

function showCreateGroupModal() {
    document.getElementById('create-group-modal').style.display = 'flex';
    document.getElementById('group-name').focus();
    loadOnlineUsers();
}

function showPrivateChatModal() {
    document.getElementById('private-chat-modal').style.display = 'flex';
    loadOnlineUsers();
}

function createNewGroup() {
    const groupName = document.getElementById('group-name').value.trim();
    
    const selectedMembers = Array.from(document.querySelectorAll('.member-checkbox.selected'))
        .map(checkbox => {
            const memberItem = checkbox.closest('.member-item');
            return parseInt(memberItem.getAttribute('data-user-id'));
        })
        .filter(userId => !isNaN(userId));

    console.log('👥 [CRIAÇÃO] Membros selecionados (IDs):', selectedMembers);

    if (!groupName) {
        alert('Por favor, digite um nome para o grupo');
        return;
    }

    if (selectedMembers.length === 0) {
        alert('Selecione pelo menos um membro para o grupo');
        return;
    }

    const requestData = {
        nome: groupName,
        participantes: selectedMembers
    };

    console.log('🚀 [CRIAÇÃO] Enviando requisição para criar grupo:', requestData);

    fetch('/criar-grupo', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify(requestData)
    })
    .then(response => {
        console.log('📨 [CRIAÇÃO] Resposta do servidor - Status:', response.status);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log('📦 [CRIAÇÃO] Dados da resposta:', data);
        
        if (data.success) {
            alert('✅ ' + data.message);
            closeAllModals();
            document.getElementById('group-name').value = '';
            document.querySelectorAll('.member-checkbox').forEach(cb => cb.classList.remove('selected'));
            
            console.log('🔄 [CRIAÇÃO] Recarregando conversas...');
            setTimeout(() => {
                loadConversations();
                
                if (data.conversa && data.conversa.id) {
                    console.log('🎯 [CRIAÇÃO] Abrindo grupo criado:', data.conversa);
                    setTimeout(() => {
                        openConversa(data.conversa.id, 'group', data.conversa.nome);
                    }, 500);
                }
            }, 1000);
            
        } else {
            alert('❌ Erro: ' + data.error);
        }
    })
    .catch(error => {
        console.error('💥 [CRIAÇÃO] Erro na requisição:', error);
        alert('❌ Erro de conexão ao criar grupo: ' + error.message);
    });
}

// ========== SISTEMA DE BUSCA E ADIÇÃO DE AMIGOS ==========

function showAddFriendModal() {
    document.getElementById('add-friend-modal').style.display = 'flex';
    document.getElementById('friend-username').focus();
    document.getElementById('friend-search-results').innerHTML = '';
}

function searchUsers() {
    const username = document.getElementById('friend-username').value.trim();
    const resultsContainer = document.getElementById('friend-search-results');
    
    if (username.length < 2) {
        resultsContainer.innerHTML = '';
        return;
    }
    
    fetch(`/search-users?q=${encodeURIComponent(username)}`)
        .then(response => response.json())
        .then(data => {
            resultsContainer.innerHTML = '';
            
            if (data.users && data.users.length === 0) {
                resultsContainer.innerHTML = '<div class="search-result-item">Nenhum usuário encontrado</div>';
                return;
            }
            
            if (data.users) {
                data.users.forEach(user => {
                    const resultItem = document.createElement('div');
                    resultItem.className = 'search-result-item';
                    resultItem.innerHTML = `
                        <div class="search-result-avatar">${user.username.charAt(0).toUpperCase()}</div>
                        <div class="search-result-info">
                            <div class="search-result-name">${user.username}</div>
                            <div class="search-result-status">${user.online ? 'Online' : 'Offline'}</div>
                        </div>
                    `;
                    
                    resultItem.addEventListener('click', () => {
                        document.getElementById('friend-username').value = user.username;
                        resultsContainer.innerHTML = '';
                    });
                    
                    resultsContainer.appendChild(resultItem);
                });
            }
        })
        .catch(error => {
            console.error('Erro na busca:', error);
            resultsContainer.innerHTML = '<div class="search-result-item">Erro na busca</div>';
        });
}

function sendFriendRequest() {
    const username = document.getElementById('friend-username').value.trim();
    
    if (!username) {
        alert('Por favor, digite um nome de usuário.');
        return;
    }
    
    if (username === currentUser) {
        alert('Você não pode adicionar a si mesmo como amigo.');
        return;
    }
    
    fetch('/send-friend-request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            username: username
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            closeAllModals();
            document.getElementById('friend-username').value = '';
            loadFriendRequests();
        } else {
            alert('Erro: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro de conexão ao enviar pedido de amizade.');
    });
}

// ========== SISTEMA DE USUÁRIOS ONLINE ==========

function loadOnlineUsers() {
    if (!currentUser) return;
    
    fetch('/messages?name=' + encodeURIComponent(currentUser))
        .then(response => response.json())
        .then(data => {
            if (data.online) {
                onlineUsers = Array.isArray(data.online) 
                    ? data.online.filter(user => user !== currentUser && user !== null && user !== undefined)
                    : [];
                updateUsersList();
            } else {
                onlineUsers = [];
                updateUsersList();
            }
        })
        .catch(error => {
            console.error('Erro ao carregar usuários online:', error);
            onlineUsers = [];
            updateUsersList();
        });
}

function updateUsersList() {
    const usersList = document.getElementById('users-list');
    const membersList = document.getElementById('members-list');
    
    fetch('/user-list')
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.users && Array.isArray(data.users)) {
                updateUsersListUI(usersList, data.users, 'user');
                updateUsersListUI(membersList, data.users, 'member');
            } else {
                updateUsersListFallback(usersList, membersList);
            }
        })
        .catch(error => {
            console.error('❌ Erro ao buscar lista de usuários:', error);
            updateUsersListFallback(usersList, membersList);
        });
}

function updateUsersListUI(container, users, type) {
    if (!container) return;
    
    container.innerHTML = '';
    
    if (!users || users.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <p>Nenhum usuário disponível</p>
            </div>
        `;
        return;
    }
    
    const filteredUsers = users.filter(user => 
        user && user.username && user.username !== currentUser
    );
    
    if (filteredUsers.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">👤</div>
                <p>Nenhum outro usuário disponível</p>
            </div>
        `;
        return;
    }
    
    filteredUsers.forEach(user => {
        const item = document.createElement('div');
        item.className = type === 'member' ? 'member-item' : 'user-item';
        
        const userId = user.id;
        const username = user.username;
        const avatar = username.charAt(0).toUpperCase();
        const onlineStatus = user.online ? 'online' : 'offline';
        
        if (type === 'member') {
            item.setAttribute('data-user-id', userId);
            item.setAttribute('data-username', username);
            item.innerHTML = `
                <div class="user-avatar ${onlineStatus}">${avatar}</div>
                <div class="member-info">
                    <div class="member-name">${username}</div>
                    <div class="member-status">${user.online ? 'Online' : 'Offline'}</div>
                </div>
                <div class="member-checkbox"></div>
            `;
            item.addEventListener('click', function() {
                this.querySelector('.member-checkbox').classList.toggle('selected');
            });
        } else {
            item.setAttribute('data-user-id', userId);
            item.innerHTML = `
                <div class="user-avatar ${onlineStatus}">${avatar}</div>
                <div class="user-info">
                    <div class="user-name">${username}</div>
                    <div class="user-status">${user.online ? 'Online' : 'Offline'}</div>
                </div>
            `;
            item.addEventListener('click', function() {
                startPrivateChat(username);
            });
        }
        
        container.appendChild(item);
    });
}

function updateUsersListFallback(usersList, membersList) {
    if (usersList) {
        usersList.innerHTML = '';
        if (onlineUsers.length === 0) {
            usersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👤</div>
                    <p>Nenhum usuário online no momento</p>
                </div>
            `;
        } else {
            onlineUsers.forEach(username => {
                if (!username) return;
                
                const userItem = document.createElement('div');
                userItem.className = 'user-item';
                userItem.setAttribute('data-username', username);
                userItem.innerHTML = `
                    <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                    <div class="user-name">${username}</div>
                `;
                userItem.addEventListener('click', function() {
                    startPrivateChat(username);
                });
                usersList.appendChild(userItem);
            });
        }
    }
    
    if (membersList) {
        membersList.innerHTML = '';
        if (onlineUsers.length === 0) {
            membersList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-icon">👤</div>
                    <p>Nenhum usuário online no momento</p>
                </div>
            `;
        } else {
            onlineUsers.forEach(username => {
                if (!username) return;
                
                const memberItem = document.createElement('div');
                memberItem.className = 'member-item';
                memberItem.setAttribute('data-username', username);
                memberItem.innerHTML = `
                    <div class="user-avatar">${username.charAt(0).toUpperCase()}</div>
                    <div class="member-name">${username}</div>
                    <div class="member-checkbox"></div>
                `;
                memberItem.addEventListener('click', function() {
                    this.querySelector('.member-checkbox').classList.toggle('selected');
                });
                membersList.appendChild(memberItem);
            });
        }
    }
}

// ========== FUNÇÕES UTILITÁRIAS ==========

function switchTab(tab) {
    currentTab = tab;
    
    document.querySelectorAll('.tab-button').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
    
    document.querySelectorAll('.tab-pane').forEach(pane => {
        pane.classList.remove('active');
    });
    document.getElementById(`${tab}-tab`).classList.add('active');
    
    const searchInput = document.getElementById('search-input');
    if (tab === 'chats') {
        searchInput.placeholder = 'Pesquisar conversas...';
    } else {
        searchInput.placeholder = 'Pesquisar amigos...';
    }
    
    console.log(`📁 Guia alterada para: ${tab}`);
}

function filterContent() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    
    if (currentTab === 'chats') {
        const conversationItems = document.querySelectorAll('.conversation-item');
        conversationItems.forEach(item => {
            const conversationName = item.querySelector('.conversation-name').textContent.toLowerCase();
            item.style.display = conversationName.includes(searchTerm) ? 'flex' : 'none';
        });
    } else {
        const friendItems = document.querySelectorAll('.friend-item');
        friendItems.forEach(item => {
            const friendName = item.querySelector('.friend-name').textContent.toLowerCase();
            item.style.display = friendName.includes(searchTerm) ? 'flex' : 'none';
        });
    }
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function logoutUser() {
    console.log('🚪 Iniciando logout...');
    
    fetch('/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            console.log('✅ Logout realizado, redirecionando...');
            window.location.href = '/portal';
        } else {
            alert('Erro ao fazer logout: ' + data.error);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro de conexão ao tentar fazer logout.');
    });
}

function openChat(chatId, chatType, chatName, participants = []) {
    console.log(`💬 Abrindo chat: ${chatName} (${chatType})`);
    
    if (window.integratedChat && typeof window.integratedChat.openChat === 'function') {
        window.integratedChat.openChat(chatId, chatType, chatName, participants);
    } else {
        console.error('❌ Chat integrado não disponível. Redirecionando para página separada...');
        const params = new URLSearchParams({
            chat: chatId,
            type: chatType,
            name: chatName
        });
        window.open('/chat?' + params.toString(), '_blank');
    }
}

// ========== INTEGRAÇÃO COM CHAT INTEGRADO ==========

window.getCurrentUser = function() {
    return currentUser;
};

function checkIntegratedChat() {
    if (window.integratedChat && typeof window.integratedChat.openChat === 'function') {
        console.log('✅ Chat integrado disponível');
        return true;
    } else {
        console.log('⚠️ Chat integrado não disponível');
        return false;
    }
}

setTimeout(checkIntegratedChat, 2000);