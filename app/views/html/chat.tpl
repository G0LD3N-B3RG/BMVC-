<!-- app/views/html/chat.tpl -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Chat Online</title>
    <link rel="stylesheet" href="/static/css/chat.css">
    <!-- CDN para emoji-picker -->
    <script src="https://cdn.jsdelivr.net/npm/emoji-picker-element@^1.0.0"></script>
</head>
<body>
    <div class="chat-container">
        <div id="name-setup" class="name-setup">
            <h2>Escolha um nome de usuário:</h2>
            <input type="text" id="name-input" placeholder="Seu nome..." required>
            <button id="set-name-btn">Entrar no Chat</button>
        </div>
        
        <div id="chat-area" class="chat-area" style="display: none;">
            <div class="chat-header">
                <h1>Chat Online</h1>
                <div class="online-users">
                    <h3>Usuários online:</h3>
                    <ul id="online-list"></ul>
                </div>
            </div>
            
            <div id="messages" class="messages"></div>
            
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
                <div id="audio-record-visualizer"></div>
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

    <script src="/static/js/chat.js"></script>
</body>
</html>