<!-- app/views/html/home.tpl -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Online - Conversas</title>
    <link rel="stylesheet" href="/static/css/home.css">
</head>
<body>
    <div class="home-container">
        <!-- Sidebar de conversas -->
        <div class="conversations-sidebar">
            <!-- Header da sidebar -->
            <div class="sidebar-header">
                <div class="user-profile">
                    <div class="user-avatar" id="user-avatar">U</div>
                    <span class="user-name" id="user-name">Usuário</span>
                </div>
                <div class="header-actions">
                    <button id="status-btn" title="Status">●</button>
                    <button id="new-chat-btn" title="Nova conversa">💬</button>
                    <button id="menu-btn" title="Menu">⋮</button>
                </div>
            </div>

            <!-- Barra de pesquisa -->
            <div class="search-bar">
                <div class="search-container">
                    <span class="search-icon">🔍</span>
                    <input type="text" id="search-input" placeholder="Pesquisar ou começar uma nova conversa">
                </div>
            </div>

            <!-- Lista de conversas -->
            <div class="conversations-list" id="conversations-list">
                <!-- As conversas serão carregadas via JavaScript -->
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
            </div>

            <!-- Botão flutuante para novo grupo -->
            <button class="floating-new-group" id="new-group-btn">
                <span>+</span>
                Criar grupo
            </button>
        </div>

        <!-- Área de boas-vindas/conteúdo principal -->
        <div class="content-area">
            <div class="welcome-message">
                <div class="welcome-icon">💬</div>
                <h1>Bem-vindo ao Chat Online</h1>
                <p>Selecione uma conversa para começar a mensagem</p>
                <p>ou crie um novo grupo para conversar com amigos.</p>
                
                <div class="welcome-actions">
                    <button id="create-group-welcome" class="welcome-btn">
                        <span>👥</span>
                        Criar Grupo
                    </button>
                    <button id="start-private-chat" class="welcome-btn">
                        <span>🔒</span>
                        Chat Privado
                    </button>
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
                </div>
            </div>
            <div class="modal-footer">
                <button id="cancel-private">Cancelar</button>
            </div>
        </div>
    </div>

    <script src="/static/js/home.js"></script>
</body>
</html>