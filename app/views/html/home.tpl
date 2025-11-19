<!-- app/views/html/home.tpl (MODIFICADO - COM CHAT INTEGRADO) -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Online - Conversas</title>
    <link rel="stylesheet" href="/static/css/home.css">
    <link rel="stylesheet" href="/static/css/chat.css">
</head>
<body>
    <!-- Conteúdo Principal COM CHAT INTEGRADO -->
    <div class="home-container" id="home-container">
        <!-- Sidebar de conversas (40% da tela) -->
        <div class="conversations-sidebar" id="conversations-sidebar">
            <!-- Header da sidebar -->
            <div class="sidebar-header">
                <div class="user-profile">
                    <div class="user-avatar" id="user-avatar">U</div>
                    <span class="user-name" id="user-name">Usuário</span>
                </div>
                <div class="header-actions">
                    <button id="status-btn" title="Status">●</button>
                    <button id="new-chat-btn" title="Nova conversa">💬</button>
                    <button id="delete-account-btn" title="Excluir minha conta" style="color: #dc3545;">🗑️</button>
                    <button id="logout-btn" title="Sair">🚪</button>
                </div>
            </div>

            <!-- Guias de Navegação -->
            <div class="navigation-tabs">
                <button class="tab-button active" data-tab="chats">💬 Chats</button>
                <button class="tab-button" data-tab="friends">👥 Amigos</button>
            </div>

            <!-- Barra de pesquisa -->
            <div class="search-bar">
                <div class="search-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="search-input" placeholder="Pesquisar conversas...">
                </div>
            </div>

            <!-- Conteúdo das Guias -->
            <div class="tab-content">
                <!-- Guia de Chats -->
                <div id="chats-tab" class="tab-pane active">
                    <div class="conversations-list" id="conversations-list">
                        <div class="conversation-item" data-chat-type="group" data-chat-id="general">
                            <div class="conversation-avatar group-avatar">👥</div>
                            <div class="conversation-info">
                                <div class="conversation-name">Chat Geral</div>
                                <div class="conversation-preview">Conversa pública com todos os usuários</div>
                            </div>
                            <div class="conversation-meta">
                                <div class="conversation-time">Agora</div>
                                <div class="unread-count" style="display: none;">0</div>
                            </div>
                        </div>
                        <!-- Outras conversas serão carregadas aqui -->
                    </div>

                    <!-- Botão flutuante para novo grupo -->
                    <button class="floating-action-button" id="new-group-btn">
                        <span>+</span>
                        Criar grupo
                    </button>
                </div>

                <!-- Guia de Amigos -->
                <div id="friends-tab" class="tab-pane">
                    <div class="friends-header">
                        <button id="view-requests-btn" class="view-requests-btn">
                            📨 Ver Pedidos de Amizade
                        </button>
                    </div>
                    
                    <div class="friends-list" id="friends-list">
                        <!-- Lista de amigos será carregada aqui -->
                        <div class="empty-state">
                            <div class="empty-icon">👥</div>
                            <h3>Nenhum amigo adicionado</h3>
                            <p>Comece adicionando amigos para conversar</p>
                            <button id="add-first-friend" class="welcome-btn">
                                <span>➕</span>
                                Adicionar Primeiro Amigo
                            </button>
                        </div>
                    </div>

                    <!-- Botão flutuante para adicionar amigo -->
                    <button class="floating-action-button" id="add-friend-btn">
                        <span>+</span>
                        Adicionar Amigo
                    </button>
                </div>
            </div>
        </div>

        <!-- Área do Chat Integrado (60% da tela) -->
        <div class="chat-integrated-area" id="chat-integrated-area">
            <!-- Estado inicial: Mensagem de boas-vindas -->
            <div class="welcome-chat-state" id="welcome-chat-state">
                <div class="welcome-icon">💬</div>
                <h1>Bem-vindo ao Chat Online</h1>
                <p>Selecione uma conversa para começar a mensagem</p>
                <p>ou inicie um chat privado com um amigo.</p>
                
                <div class="welcome-actions">
                    <button id="create-group-welcome" class="welcome-btn">
                        <span>👥</span>
                        Criar Grupo
                    </button>
                    <button id="start-private-chat-welcome" class="welcome-btn">
                        <span>🔒</span>
                        Chat Privado
                    </button>
                </div>
            </div>

            <!-- Chat ativo (inicialmente oculto) -->
            <div class="active-chat" id="active-chat" style="display: none;">
                <!-- Header do Chat -->
                <div class="chat-header">
                    <div class="chat-header-info">
                        <button id="back-to-list" class="back-btn">←</button>
                        <div class="chat-title-container">
                            <h1 id="chat-title">Chat</h1>
                            <div id="chat-info" class="chat-info"></div>
                        </div>
                    </div>
                    <div class="online-users">
                        <h3>Usuários online:</h3>
                        <ul id="online-list"></ul>
                    </div>
                </div>
                
                <!-- Área de Mensagens -->
                <div id="messages" class="messages"></div>
                
                <!-- Área de Input -->
                <div class="input-area">
                    <button id="attach-btn" title="Anexar imagem">📎</button>
                    <button id="record-btn" title="Gravar áudio">🎤</button>
                    <button id="emoji-btn" title="Emojis">😀</button>
                    <input type="text" id="msg-input" placeholder="Digite sua mensagem..." autocomplete="off">
                    <button id="send-btn">Enviar</button>
                    
                    <input type="file" id="file-input" accept="image/*" style="display: none">
                </div>
            </div>
        </div>
    </div>

    <!-- Modal para criar novo grupo -->
    <div id="create-group-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Criar Novo Grupo</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="group-name">Nome do Grupo</label>
                    <input type="text" id="group-name" placeholder="Digite o nome do grupo">
                </div>
                <div class="form-group">
                    <label for="group-members">Adicionar Membros</label>
                    <div class="members-list" id="members-list">
                        <!-- Lista de membros online será carregada aqui -->
                        <div class="empty-state">
                            <div class="empty-icon">👤</div>
                            <p>Nenhum usuário online no momento</p>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-group">Cancelar</button>
                <button id="create-group">Criar Grupo</button>
            </div>
        </div>
    </div>

    <!-- Modal para chat privado -->
    <div id="private-chat-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Iniciar Chat Privado</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="users-list" id="users-list">
                    <!-- Lista de usuários online será carregada aqui -->
                    <div class="empty-state">
                        <div class="empty-icon">👤</div>
                        <p>Nenhum usuário online no momento</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-private">Cancelar</button>
            </div>
        </div>
    </div>

    <!-- Modal para adicionar amigo -->
    <div id="add-friend-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Adicionar Amigo</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div class="form-group">
                    <label for="friend-username">Nome de usuário</label>
                    <input type="text" id="friend-username" placeholder="Digite o nome de usuário do amigo">
                    <div class="form-hint">Digite o nome exato do usuário que deseja adicionar</div>
                </div>
                <div id="friend-search-results" class="search-results">
                    <!-- Resultados da busca aparecerão aqui -->
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-add-friend">Cancelar</button>
                <button id="send-friend-request">Enviar Pedido de Amizade</button>
            </div>
        </div>
    </div>

    <!-- Modal de Pedidos de Amizade -->
    <div id="friend-requests-modal" class="modal" style="display: none;">
        <div class="modal-content">
            <div class="modal-header">
                <h3>Pedidos de Amizade</h3>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div id="friend-requests-list" class="requests-list">
                    <!-- Lista de pedidos será carregada aqui -->
                    <div class="empty-state">
                        <div class="empty-icon">📭</div>
                        <p>Nenhum pedido de amizade pendente</p>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <button id="close-requests">Fechar</button>
            </div>
        </div>
    </div>

    <!-- Modal Popup de Emojis -->
    <div id="emoji-modal" class="emoji-modal" style="display: none;">
        <div class="emoji-modal-content">
            <div class="emoji-header">
                <h3>Escolha um Emoji</h3>
                <span id="close-emoji-modal">&times;</span>
            </div>
            <div class="emoji-search">
                <input type="text" id="emoji-search" placeholder="Pesquisar emojis..." autocomplete="off">
            </div>
            <div id="emoji-grid" class="emoji-grid">
                <!-- Emojis serão injetados via JS -->
            </div>
            <div class="emoji-footer">
                <small id="emoji-count">Total: 0 emojis</small>
            </div>
        </div>
    </div>

    <!-- Preview de imagem -->
    <div id="image-preview-modal" class="image-preview-modal" style="display: none;">
        <div class="image-preview-content">
            <div class="image-preview-header">
                <h3>Pré-visualização da Imagem</h3>
                <span id="close-preview-modal">&times;</span>
            </div>
            <div class="image-preview-body">
                <img id="preview-image" src="" alt="Pré-visualização">
            </div>
            <div class="image-preview-footer">
                <button id="cancel-preview">Cancelar</button>
                <button id="send-image">Enviar Imagem</button>
            </div>
        </div>
    </div>

    <!-- Modal de gravação de áudio -->
    <div id="audio-record-modal" class="audio-record-modal" style="display: none;">
        <div class="audio-record-content">
            <div class="audio-record-header">
                <h3>Gravar Áudio</h3>
                <span id="close-audio-modal">&times;</span>
            </div>
            <div class="audio-record-body">
                <div id="audio-record-visualizer">Clique em "Iniciar Gravação"</div>
                <div id="audio-record-timer">00:00</div>
                <div class="audio-record-controls">
                    <button id="start-record-btn">🎤 Iniciar Gravação</button>
                    <button id="stop-record-btn" disabled>⏹️ Parar Gravação</button>
                </div>
                <div id="audio-preview" style="display: none;">
                    <audio controls></audio>
                </div>
            </div>
            <div class="audio-record-footer">
                <button id="cancel-audio">Cancelar</button>
                <button id="send-audio" disabled>Enviar Áudio</button>
            </div>
        </div>
    </div>

    <!-- Modal de imagem ampliada -->
    <div id="image-fullscreen-modal" class="image-fullscreen-modal" style="display: none;">
        <div class="image-fullscreen-content">
            <img src="" alt="Imagem em tela cheia">
        </div>
    </div>

    <!-- Modal de Exclusão de Conta -->
    <div id="delete-account-modal" class="modal" style="display: none;">
        <div class="modal-content" style="max-width: 500px;">
            <div class="modal-header" style="background: #dc3545; color: white;">
                <h3>🚨 Excluir Conta Permanentemente</h3>
                <span class="close-modal" id="close-delete-modal">&times;</span>
            </div>
            <div class="modal-body">
                <div style="color: #721c24; background: #f8d7da; padding: 15px; border-radius: 5px; margin-bottom: 20px;">
                    <strong>ATENÇÃO: Esta ação é IRREVERSÍVEL!</strong>
                    <ul style="margin: 10px 0; padding-left: 20px;">
                        <li>Todas as suas mensagens serão excluídas</li>
                        <li>Seus grupos serão removidos</li>
                        <li>Suas amizades serão perdidas</li>
                        <li>Seus dados serão apagados permanentemente</li>
                    </ul>
                </div>
                
                <div class="form-group">
                    <label for="delete-confirmation-input">
                        Digite <strong>CONFIRMAR EXCLUSÃO</strong> para prosseguir:
                    </label>
                    <input type="text" id="delete-confirmation-input" 
                        placeholder="CONFIRMAR EXCLUSÃO" 
                        style="border: 2px solid #dc3545; text-align: center; font-weight: bold;">
                </div>
                
                <div style="font-size: 12px; color: #666; text-align: center;">
                    ⚠️ Esta ação não pode ser desfeita
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-delete-account" style="background: #6c757d;">Cancelar</button>
                <button id="confirm-delete-account" disabled style="background: #dc3545;">
                    🗑️ Excluir Minha Conta Permanentemente
                </button>
            </div>
        </div>
    </div>

    <script src="/static/js/home.js"></script>
    <script src="/static/js/chat-integrated.js"></script>
</body>
</html>