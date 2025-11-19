// app/static/js/portal.js (COM CORREÇÃO DE MENSAGENS)
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Portal carregado - Inicializando...');
    
    const loginContainer = document.getElementById('login-container');
    const registerContainer = document.getElementById('register-container');
    const showRegisterLink = document.getElementById('show-register');
    const showLoginLink = document.getElementById('show-login');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');
    const messageContainer = document.getElementById('message-container');

    // Inicializar toggle de senha
    initPasswordToggle();
    console.log('✅ Toggle de senha inicializado');

    // Alternar entre login e cadastro
    showRegisterLink.addEventListener('click', function(e) {
        e.preventDefault();
        loginContainer.style.display = 'none';
        registerContainer.style.display = 'block';
        clearMessages();
        console.log('🔄 Mudou para cadastro');
    });

    showLoginLink.addEventListener('click', function(e) {
        e.preventDefault();
        registerContainer.style.display = 'none';
        loginContainer.style.display = 'block';
        clearMessages();
        console.log('🔄 Mudou para login');
    });

    // Login
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('login-username').value.trim();
        const password = document.getElementById('login-password').value.trim();

        if (!username || !password) {
            showMessage('Preencha todos os campos', 'error');
            return;
        }

        loginUser(username, password);
    });

    // Cadastro
    registerForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const username = document.getElementById('register-username').value.trim();
        const password = document.getElementById('register-password').value.trim();

        if (!username || !password) {
            showMessage('Preencha todos os campos', 'error');
            return;
        }

        if (username.length < 3) {
            showMessage('Nome de usuário deve ter pelo menos 3 caracteres', 'error');
            return;
        }

        const passwordValidation = validatePassword(password);
        if (!passwordValidation.isValid) {
            showMessage(passwordValidation.message, 'error');
            return;
        }

        registerUser(username, password);
    });

    // VALIDAÇÃO DE SENHA FORTE
    function validatePassword(password) {
        const requirements = {
            length: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password),
            hasSpecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)
        };

        // Verificar quais requisitos falharam
        const failedRequirements = [];
        
        if (!requirements.length) failedRequirements.push('pelo menos 8 caracteres');
        if (!requirements.hasUpper) failedRequirements.push('uma letra maiúscula');
        if (!requirements.hasLower) failedRequirements.push('uma letra minúscula');
        if (!requirements.hasNumber) failedRequirements.push('um número');
        if (failedRequirements.length > 0) {
            return {
                isValid: false,
                message: `Senha deve conter: ${failedRequirements.join(', ')}`
            };
        }

        return { isValid: true, message: 'Senha válida' };
    }
    
    // Função para inicializar os toggles de senha
    function initPasswordToggle() {
        console.log('🔧 Inicializando toggles de senha...');
        
        // Toggle para senha do login
        const toggleLoginPassword = document.getElementById('toggle-login-password');
        const loginPasswordInput = document.getElementById('login-password');
        const loginPasswordGroup = loginPasswordInput.parentElement;
        
        if (toggleLoginPassword && loginPasswordInput) {
            toggleLoginPassword.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Clicou no toggle do login');
                togglePasswordVisibility(loginPasswordInput, toggleLoginPassword, loginPasswordGroup);
            });
        }

        // Toggle para senha do cadastro
        const toggleRegisterPassword = document.getElementById('toggle-register-password');
        const registerPasswordInput = document.getElementById('register-password');
        const registerPasswordGroup = registerPasswordInput.parentElement;
        
        if (toggleRegisterPassword && registerPasswordInput) {
            toggleRegisterPassword.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                console.log('🎯 Clicou no toggle do cadastro');
                togglePasswordVisibility(registerPasswordInput, toggleRegisterPassword, registerPasswordGroup);
            });
        }

        console.log('✅ Toggles configurados');
    }

    function setupPasswordValidation() {
        const passwordInput = document.getElementById('register-password');
        const passwordGroup = passwordInput.parentElement;
        
        // Criar elemento para mostrar requisitos
        let requirementsElement = document.getElementById('password-requirements');
        if (!requirementsElement) {
            requirementsElement = document.createElement('div');
            requirementsElement.id = 'password-requirements';
            requirementsElement.className = 'password-requirements';
            passwordGroup.appendChild(requirementsElement);
        }

        passwordInput.addEventListener('input', function() {
            const password = this.value;
            const validation = validatePassword(password);
            
            updatePasswordRequirements(requirementsElement, password);
        });

        // Esconder requisitos quando não estiver focado
        passwordInput.addEventListener('blur', function() {
            setTimeout(() => {
                requirementsElement.style.display = 'none';
            }, 200);
        });

        passwordInput.addEventListener('focus', function() {
            requirementsElement.style.display = 'block';
        });
    }

    function updatePasswordRequirements(element, password) {
        const requirements = {
            length: password.length >= 8,
            hasUpper: /[A-Z]/.test(password),
            hasLower: /[a-z]/.test(password),
            hasNumber: /[0-9]/.test(password)
        };

        element.innerHTML = `
            <div class="requirement ${requirements.length ? 'valid' : 'invalid'}">
                ${requirements.length ? '✅' : '❌'} Pelo menos 8 caracteres
            </div>
            <div class="requirement ${requirements.hasUpper ? 'valid' : 'invalid'}">
                ${requirements.hasUpper ? '✅' : '❌'} Uma letra maiúscula
            </div>
            <div class="requirement ${requirements.hasLower ? 'valid' : 'invalid'}">
                ${requirements.hasLower ? '✅' : '❌'} Uma letra minúscula
            </div>
            <div class="requirement ${requirements.hasNumber ? 'valid' : 'invalid'}">
                ${requirements.hasNumber ? '✅' : '❌'} Um número
            </div>
        `;
    }

    // Chamar a função no DOMContentLoaded, depois de initPasswordToggle()
    setTimeout(setupPasswordValidation, 1000);

    // Função para alternar a visibilidade da senha
    function togglePasswordVisibility(passwordInput, toggleButton, passwordGroup) {
        console.log('🔄 Alternando visibilidade da senha...');
        
        if (passwordInput.type === 'password') {
            passwordInput.type = 'text';
            toggleButton.querySelector('.eye-icon').textContent = '🙈';
            toggleButton.classList.add('active');
            passwordGroup.classList.add('password-visible');
            console.log('👀 Senha agora está VISÍVEL');
        } else {
            passwordInput.type = 'password';
            toggleButton.querySelector('.eye-icon').textContent = '👁️';
            toggleButton.classList.remove('active');
            passwordGroup.classList.remove('password-visible');
            console.log('🔒 Senha agora está OCULTA');
        }
        
        // Manter o foco no campo de senha
        setTimeout(() => {
            passwordInput.focus();
        }, 10);
    }

    function loginUser(username, password) {
        console.log('🔐 Tentando login para:', username);
        showMessage('Entrando...', 'info');

        fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => {
            console.log('📨 Resposta do login - Status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📦 Dados da resposta do login:', data);
            
            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                showMessage(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('💥 Erro no login:', error);
            showMessage('Erro de conexão', 'error');
        });
    }

    function registerUser(username, password) {
        console.log('📝 Tentando cadastrar usuário:', username);
        showMessage('Criando conta...', 'info');

        fetch('/cadastrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then(response => {
            console.log('📨 Resposta do cadastro - Status:', response.status);
            return response.json();
        })
        .then(data => {
            console.log('📦 Dados da resposta do cadastro:', data);
            
            if (data.success) {
                showMessage(data.message, 'success');
                setTimeout(() => {
                    window.location.href = '/home';
                }, 1000);
            } else {
                showMessage(data.error, 'error');
            }
        })
        .catch(error => {
            console.error('💥 Erro no cadastro:', error);
            showMessage('Erro de conexão', 'error');
        });
    }

    function showMessage(message, type) {
        console.log(`💬 Exibindo mensagem: ${message} (${type})`);
        
        // Garantir que o container está visível
        messageContainer.style.display = 'block';
        messageContainer.textContent = message;
        messageContainer.className = `message-container ${type}`;
        
        // Scroll para a mensagem
        messageContainer.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        
        // Auto-esconder mensagens de sucesso/erro após 5 segundos
        if (type !== 'info') {
            setTimeout(() => {
                if (messageContainer.textContent === message) {
                    clearMessages();
                }
            }, 5000);
        }
    }

    function clearMessages() {
        messageContainer.style.display = 'none';
        messageContainer.textContent = '';
        messageContainer.className = 'message-container';
    }
    
    // Debug: Verificar se tudo carregou corretamente
    console.log('✅ Portal totalmente inicializado');
    console.log('🔍 Elementos encontrados:', {
        loginContainer: !!loginContainer,
        registerContainer: !!registerContainer,
        loginForm: !!loginForm,
        registerForm: !!registerForm,
        messageContainer: !!messageContainer,
        toggleLogin: !!document.getElementById('toggle-login-password'),
        toggleRegister: !!document.getElementById('toggle-register-password')
    });
    
    // Teste da função showMessage
    console.log('🧪 Testando função showMessage...');
    setTimeout(() => {
        showMessage('Teste de mensagem - Portal carregado!', 'info');
        setTimeout(() => clearMessages(), 2000);
    }, 1000);
});