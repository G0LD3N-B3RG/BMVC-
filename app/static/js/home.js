// app/static/js/home.js

let currentUser = '';
let onlineUsers = [];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    initializeHome();
});

function initializeHome() {
    // Verificar se o usuário está logado
    const username = localStorage.getItem('chatUsername');
    if (!username) {
        // Redirecionar para o chat para definir nome (ou criar página de login)
        window.location.href = '/chat';
        return;
    }
    
    currentUser = username;
    document.getElementById('user-name').textContent = username;
    document.getElementById('user-avatar').textContent = username.charAt(0).toUpperCase();
    
    setupEventListeners();
    loadConversations();
    loadOnlineUsers();
}

function setupEventListeners() {
    // Botões de ação
    document.getElementById('new-chat-btn').addEventListener('click', showPrivateChatModal);
    document.getElementById('new-group-btn').addEventListener('click', showCreateGroupModal);
    document.getElementById('create-group-welcome').addEventListener('click', showCreateGroupModal);
    document.getElementById('start-private-chat').addEventListener('click', showPrivateChatModal);
    
    // Modais
    document.querySelectorAll('.close-modal').forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });
    
    document.getElementById('cancel-group').addEventListener('click', closeAllModals);
    document.getElementById('cancel-private').addEventListener('click', closeAllModals);
    document.getElementById('create-group').addEventListener('click', createNewGroup);
    
    // Conversas
    document.querySelectorAll('.conversation-item').forEach(item => {
        item.addEventListener('click', function() {
            const chatId = this.getAttribute('data-chat-id');
            const chatType = this.getAttribute('data-chat-type');
            openChat(chatId, chatType);
        });
    });
    
    // Pesquisa
    document.getElementById('search-input').addEventListener('input', filterConversations);
    
    // Fechar modais ao clicar fora
    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', function(e) {
            if (e.target === this) {
                closeAllModals();
            }
        });
    });
}

function loadConversations() {
    // Por enquanto, vamos carregar apenas o chat geral
    // Em uma implementação real, buscaríamos do servidor
    const conversationsList = document.getElementById('conversations-list');
    
    // Adicionar conversas de exemplo
    const exampleConversations = [
        {
            id: 'general',
            name: 'Chat Geral',
            type: 'group',
            preview: 'Bem-vindo ao chat geral!',
            time: 'Agora',
            unread: 0
        }
    ];
    
    exampleConversations.forEach(conv => {
        const existing = document.querySelector(`[data-chat-id="${conv.id}"]`);
        if (!existing) {
            const conversationItem = createConversationItem(conv);
            conversationsList.appendChild(conversationItem);
        }
    });
}

function createConversationItem(conversation) {
    const item = document.createElement('div');
    item.className = 'conversation-item';
    item.setAttribute('data-chat-id', conversation.id);
    item.setAttribute('data-chat-type', conversation.type);
    
    const avatarClass = conversation.type === 'group' ? 'group-avatar' : '';
    
    item.innerHTML = `
        <div class="conversation-avatar ${avatarClass}">
            ${conversation.type === 'group' ? '👥' : conversation.name.charAt(0).toUpperCase()}
        </div>
        <div class="conversation-info">
            <div class="conversation-name">${conversation.name}</div>
            <div class="conversation-preview">${conversation.preview}</div>
        </div>
        <div class="conversation-meta">
            <div class="conversation-time">${conversation.time}</div>
            ${conversation.unread > 0 ? 
                `<div class="unread-count">${conversation.unread}</div>` : 
                '<div class="unread-count" style="display: none;">0</div>'
            }
        </div>
    `;
    
    item.addEventListener('click', function() {
        openChat(conversation.id, conversation.type);
    });
    
    return item;
}

function loadOnlineUsers() {
    // Buscar usuários online do servidor
    fetch('/messages?name=' + encodeURIComponent(currentUser))
        .then(response => response.json())
        .then(data => {
            onlineUsers = data.online.filter(user => user !== currentUser);
            updateUsersList();
        })
        .catch(error => {
            console.error('Erro ao carregar usuários online:', error);
        });
}

function updateUsersList() {
    const usersList = document.getElementById('users-list');
    const membersList = document.getElementById('members-list');
    
    usersList.innerHTML = '';
    membersList.innerHTML = '';
    
    onlineUsers.forEach(user => {
        // Lista para chat privado
        const userItem = document.createElement('div');
        userItem.className = 'user-item';
        userItem.innerHTML = `
            <div class="user-avatar">${user.charAt(0).toUpperCase()}</div>
            <div class="user-name">${user}</div>
        `;
        userItem.addEventListener('click', function() {
            startPrivateChat(user);
        });
        usersList.appendChild(userItem);
        
        // Lista para seleção de membros do grupo
        const memberItem = document.createElement('div');
        memberItem.className = 'member-item';
        memberItem.innerHTML = `
            <div class="user-avatar">${user.charAt(0).toUpperCase()}</div>
            <div class="member-name">${user}</div>
            <div class="member-checkbox"></div>
        `;
        memberItem.addEventListener('click', function() {
            this.querySelector('.member-checkbox').classList.toggle('selected');
        });
        membersList.appendChild(memberItem);
    });
}

function showCreateGroupModal() {
    document.getElementById('create-group-modal').style.display = 'flex';
    document.getElementById('group-name').focus();
}

function showPrivateChatModal() {
    document.getElementById('private-chat-modal').style.display = 'flex';
}

function closeAllModals() {
    document.querySelectorAll('.modal').forEach(modal => {
        modal.style.display = 'none';
    });
}

function createNewGroup() {
    const groupName = document.getElementById('group-name').value.trim();
    const selectedMembers = Array.from(document.querySelectorAll('.member-checkbox.selected'))
        .map(checkbox => {
            const memberItem = checkbox.closest('.member-item');
            return memberItem.querySelector('.member-name').textContent;
        });
    
    if (!groupName) {
        alert('Por favor, digite um nome para o grupo');
        return;
    }
    
    if (selectedMembers.length === 0) {
        alert('Selecione pelo menos um membro para o grupo');
        return;
    }
    
    // Em uma implementação real, enviaríamos para o servidor
    console.log('Criando grupo:', groupName, 'com membros:', selectedMembers);
    
    // Adicionar à lista de conversas
    const newConversation = {
        id: 'group-' + Date.now(),
        name: groupName,
        type: 'group',
        preview: 'Grupo criado por ' + currentUser,
        time: 'Agora',
        unread: 0
    };
    
    const conversationItem = createConversationItem(newConversation);
    document.getElementById('conversations-list').prepend(conversationItem);
    
    closeAllModals();
    document.getElementById('group-name').value = '';
    document.querySelectorAll('.member-checkbox').forEach(cb => cb.classList.remove('selected'));
    
    alert(`Grupo "${groupName}" criado com sucesso!`);
}

function startPrivateChat(username) {
    // Em uma implementação real, criaríamos/entraríamos em um chat privado
    const chatId = 'private-' + [currentUser, username].sort().join('-');
    
    const existingConversation = document.querySelector(`[data-chat-id="${chatId}"]`);
    if (!existingConversation) {
        const newConversation = {
            id: chatId,
            name: username,
            type: 'private',
            preview: 'Chat privado com ' + username,
            time: 'Agora',
            unread: 0
        };
        
        const conversationItem = createConversationItem(newConversation);
        document.getElementById('conversations-list').prepend(conversationItem);
    }
    
    openChat(chatId, 'private');
    closeAllModals();
}

function openChat(chatId, chatType) {
    // Por enquanto, vamos apenas redirecionar para o chat geral
    // Em uma implementação real, carregaríamos o chat específico
    window.location.href = '/chat?chat=' + encodeURIComponent(chatId) + '&type=' + chatType;
}

function filterConversations() {
    const searchTerm = document.getElementById('search-input').value.toLowerCase();
    const conversationItems = document.querySelectorAll('.conversation-item');
    
    conversationItems.forEach(item => {
        const conversationName = item.querySelector('.conversation-name').textContent.toLowerCase();
        if (conversationName.includes(searchTerm)) {
            item.style.display = 'flex';
        } else {
            item.style.display = 'none';
        }
    });
}

// Atualizar lista de usuários online periodicamente
setInterval(loadOnlineUsers, 10000);