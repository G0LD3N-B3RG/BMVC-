# 💬 Chat Online

Um sistema de chat em tempo real completo com interface moderna estilo WhatsApp, desenvolvido em Python com Bottle framework e PostgreSQL.

## 🚀 Funcionalidades

### 💎 **Funcionalidades Principais**
- **Chat em Tempo Real** - Mensagens instantâneas entre usuários
- **Múltiplos Tipos de Chat** - Geral, Grupos e Conversas Privadas
- **Sistema de Amizades** - Adicionar, aceitar e gerenciar amigos
- **Mídia Rich** - Envio de imagens e gravação de áudio
- **Interface Moderna** - Design inspirado no WhatsApp

### 🛡️ **Segurança & Autenticação**
- Cadastro e login seguro com bcrypt
- Sessões persistentes
- Validação de senha forte
- Logout seguro

### 📱 **Recursos de Mídia**
- 📷 **Upload de Imagens** - Preview e envio
- 🎤 **Gravação de Áudio** - Interface de gravação integrada
- 😀 **Emojis** - Biblioteca completa com busca
- 👥 **Status Online** - Visualização em tempo real

### 👥 **Sistema Social**
- ✅ **Pedidos de Amizade** - Enviar/aceitar/rejeitar
- 📞 **Chats Privados** - Conversas 1:1
- 🏢 **Grupos** - Criar e gerenciar grupos
- 🗑️ **Gerenciamento de Conta** - Exclusão segura

## 🛠️ Tecnologias

### **Backend**
- **Python 3.8+** - Linguagem principal
- **Bottle** - Framework web leve
- **PostgreSQL** - Banco de dados
- **bcrypt** - Criptografia de senhas
- **psycopg2** - Driver PostgreSQL

### **Frontend**
- **HTML5** - Estrutura
- **CSS3** - Estilos modernos
- **JavaScript Vanilla** - Interatividade
- **Design Responsivo** - Mobile-friendly

### **Arquitetura**
- **MVC Pattern** - Organização do código
- **RESTful APIs** - Comunicação front/back
- **WebSockets (Polling)** - Atualização em tempo real
- **File Upload** - Sistema de mídia

## 📦 Instalação

### 1. **Pré-requisitos**
```bash
# Instalar PostgreSQL (Ubuntu/Debian)
sudo apt update
sudo apt install postgresql postgresql-contrib

# Ou usando Docker
docker run --name chat-postgres -e POSTGRES_PASSWORD=chat_password -p 5432:5432 -d postgres:13
```

### 2. **Configurar Banco de Dados**
```sql
-- Conectar como postgres
sudo -u postgres psql

-- Criar usuário e banco
CREATE USER chat_user WITH PASSWORD 'chat_password';
CREATE DATABASE chat_online OWNER chat_user;
GRANT ALL PRIVILEGES ON DATABASE chat_online TO chat_user;

-- Sair
\q
```

### 3. **Clonar e Configurar Projeto**
```bash
# Clone o projeto
git clone <seu-repositorio>
cd Chat_Online

# Instalar dependências
pip install -r requirements.txt

# Configurar ambiente
cp .env.example .env
# Editar .env com suas credenciais
```

### 4. **Arquivo .env**
```env
DB_HOST=localhost
DB_NAME=chat_online
DB_USER=chat_user
DB_PASSWORD=chat_password
DB_PORT=5432
```

### 5. **Inicializar Sistema**
```bash
# Testar conexão com banco
python test_db.py

# Criar tabelas
python init_db.py

# Executar aplicação
python route.py
```

### 6. **Acessar Aplicação**
```
http://localhost:8080
```

## 🗂️ Estrutura do Projeto

```
Chat_Online/
├── app/
│   ├── controllers/          # Lógica da aplicação
│   │   ├── application.py   # Controlador principal
│   │   └── __init__.py
│   ├── models/              # Modelos de dados
│   │   ├── database.py      # Conexão com banco
│   │   ├── usuario.py       # Modelo de usuário
│   │   ├── mensagem.py      # Modelo de mensagem
│   │   ├── chat.py          # Gerenciamento de chat
│   │   ├── conversa.py      # Modelo de conversa
│   │   └── __init__.py
│   ├── static/              # Arquivos estáticos
│   │   ├── css/
│   │   │   ├── chat.css     # Estilos do chat
│   │   │   ├── home.css     # Estilos da home
│   │   │   └── portal.css   # Estilos do portal
│   │   ├── js/
│   │   │   ├── chat.js      # Lógica do chat
│   │   │   ├── home.js      # Lógica da home
│   │   │   ├── portal.js    # Lógica do portal
│   │   │   └── chat-integrated.js # Chat integrado
│   │   └── uploads/         # Arquivos de mídia
│   │       ├── images/      # Imagens enviadas
│   │       └── audios/      # Áudios gravados
│   └── views/               # Templates
│       └── html/
│           ├── chat.tpl     # Template do chat
│           ├── home.tpl     # Template da home
│           └── portal.tpl   # Template do portal
├── route.py                 # Rotas principais
├── init_db.py              # Inicializador do banco
├── test_db.py              # Teste de conexão
├── test_bcrypt.py          # Teste de criptografia
├── requirements.txt         # Dependências
└── .env                    # Variáveis de ambiente
```

## 🎯 Como Usar

### **Primeiro Acesso**
1. Acesse `http://localhost:8080`
2. Cadastre-se com usuário e senha forte
3. Faça login no sistema

### **Iniciando Conversas**
- **Chat Geral**: Disponível automaticamente para todos
- **Chat Privado**: Clique em "Nova conversa" → Selecione usuário
- **Grupos**: Clique em "Criar grupo" → Adicione membros

### **Enviando Mídia**
- **Imagens**: Clique no 📎 → Selecione arquivo
- **Áudio**: Clique no 🎤 → Grave e envie
- **Emojis**: Clique no 😀 → Escolha emoji

### **Gerenciando Amizades**
- **Adicionar**: Guia "Amigos" → "Adicionar Amigo"
- **Pedidos**: Notificação vermelha na guia
- **Remover**: Clique no ❌ ao lado do amigo

## 🔧 Desenvolvimento

### **Scripts Úteis**
```bash
# Desenvolvimento com auto-reload
python route.py

# Testar banco de dados
python test_db.py

# Recriar banco (cuidado!)
python init_db.py

# Testar criptografia
python test_bcrypt.py
```

### **API Endpoints Principais**

#### **Autenticação**
- `POST /cadastrar` - Criar conta
- `POST /login` - Fazer login  
- `POST /logout` - Sair

#### **Mensagens**
- `POST /send` - Enviar mensagem
- `GET /messages` - Buscar mensagens
- `POST /edit-message` - Editar mensagem
- `POST /delete-message` - Excluir mensagem

#### **Amizades**
- `POST /send-friend-request` - Enviar pedido
- `POST /accept-friend-request` - Aceitar pedido
- `GET /friends` - Listar amigos
- `POST /remove-friend` - Remover amigo

#### **Grupos**
- `POST /criar-grupo` - Criar grupo
- `GET /conversas` - Listar conversas
- `POST /excluir-grupo` - Excluir grupo

## 🐛 Solução de Problemas

### **Erros Comuns**

```bash
# Erro de conexão com banco
# Verifique: PostgreSQL rodando, credenciais no .env

# Erro de permissão
# Execute: sudo -u postgres psql

# Dependências faltando
pip install -r requirements.txt --force-reinstall
```

### **Logs e Debug**
- Console do navegador: `F12`
- Logs do servidor: Terminal onde `route.py` está rodando
- Logs de banco: Verifique PostgreSQL logs

## 📈 Próximas Melhorias

- [ ] **WebSockets** - Substituir polling por conexão real-time
- [ ] **Notificações Push** - Alertas do navegador
- [ ] **Histórico de Chat** - Busca e filtro de mensagens
- [ ] **Arquivos** - Upload de documentos
- [ ] **Canais** - Canais temáticos públicos
- [ ] **Moderação** - Sistema de admin e moderação

## 🤝 Contribuindo

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-funcionalidade`
3. Commit suas mudanças: `git commit -m 'Add nova funcionalidade'`
4. Push para a branch: `git push origin feature/nova-funcionalidade`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para detalhes.

## 👨‍💻 Autor

Desenvolvido para demonstrar um sistema completo de chat em tempo real.

---

**⭐ Se este projeto te ajudou, deixe uma estrela no repositório!**