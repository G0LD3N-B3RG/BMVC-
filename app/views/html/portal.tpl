<!-- app/views/html/portal.tpl (COM VISUALIZAÇÃO DE SENHA) -->
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Portal - Chat Online</title>
    <link rel="stylesheet" href="/static/css/portal.css">
</head>
<body>
    <div class="portal-container">
        <div class="portal-header">
            <h1>💬 Chat Online</h1>
            <p>Conecte-se com amigos e colegas</p>
        </div>

        <div class="auth-forms">
            <!-- Formulário de Login -->
            <div class="form-container" id="login-container">
                <h2>Login</h2>
                <form id="login-form">
                    <div class="form-group">
                        <input type="text" id="login-username" placeholder="Seu nome de usuário" required>
                    </div>
                    <div class="form-group password-group">
                        <input type="password" id="login-password" placeholder="Sua senha" required>
                        <button type="button" class="toggle-password" id="toggle-login-password">
                            <span class="eye-icon">👁️</span>
                        </button>
                    </div>
                    <button type="submit" class="btn-primary">Entrar</button>
                </form>
                <p class="switch-form">
                    Não tem conta? <a href="#" id="show-register">Cadastre-se</a>
                </p>
            </div>

            <!-- Formulário de Cadastro -->
            <div class="form-container" id="register-container" style="display: none;">
                <h2>Cadastro</h2>
                <form id="register-form">
                    <div class="form-group">
                        <input type="text" id="register-username" placeholder="Nome de usuário" required>
                    </div>
                    <div class="form-group password-group">
                        <input type="password" id="register-password" placeholder="Sua senha" required>
                        <button type="button" class="toggle-password" id="toggle-register-password">
                            <span class="eye-icon">👁️</span>
                        </button>
                    </div>
                    <button type="submit" class="btn-primary">Cadastrar</button>
                </form>
                <p class="switch-form">
                    Já tem conta? <a href="#" id="show-login">Faça login</a>
                </p>
            </div>
        </div>

        <div id="message-container" class="message-container"></div>
    </div>

    <script src="/static/js/portal.js"></script>
</body>
</html>