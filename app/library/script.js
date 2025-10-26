// Elementos do DOM
const welcomeTitle = document.getElementById('welcome-title');
const welcomeMessage = document.getElementById('welcome-message');
const currentTime = document.getElementById('current-time');
const visitCounter = document.getElementById('visit-counter');
const themeToggle = document.getElementById('theme-toggle');
const changeColorBtn = document.getElementById('change-color');
const footerText = document.getElementById('footer-text');

// Variáveis
let seconds = 0;
let timer;
const messages = [
    "É um prazer ter você aqui!",
    "Que bom ver você!",
    "Seja muito bem-vindo!",
    "Ficamos felizes com sua visita!",
    "Que honra tê-lo conosco!"
];

// Inicialização
document.addEventListener('DOMContentLoaded', function() {
    startTimer();
    updateTime();
    setInterval(updateTime, 1000);
    setInterval(changeWelcomeMessage, 5000);
    
    // Verifica preferência de tema salva
    if (localStorage.getItem('darkMode') === 'true') {
        document.body.classList.add('dark-mode');
        themeToggle.textContent = '☀️ Modo Claro';
    }
});

// Timer de visita
function startTimer() {
    timer = setInterval(() => {
        seconds++;
        visitCounter.textContent = seconds;
        
        // Mensagem especial a cada 30 segundos
        if (seconds % 30 === 0) {
            showSpecialMessage();
        }
    }, 1000);
}

// Atualiza horário atual
function updateTime() {
    const now = new Date();
    const timeString = now.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
    });
    const dateString = now.toLocaleDateString('pt-BR', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    
    currentTime.textContent = `${dateString} - ${timeString}`;
}

// Alterna mensagens de boas-vindas
function changeWelcomeMessage() {
    const randomIndex = Math.floor(Math.random() * messages.length);
    welcomeMessage.style.opacity = '0';
    
    setTimeout(() => {
        welcomeMessage.textContent = messages[randomIndex];
        welcomeMessage.style.opacity = '1';
    }, 500);
}

// Mensagem especial
function showSpecialMessage() {
    const originalMessage = welcomeMessage.textContent;
    welcomeMessage.textContent = "🎉 Obrigado por ficar conosco!";
    welcomeMessage.style.color = '#e74c3c';
    
    setTimeout(() => {
        welcomeMessage.textContent = originalMessage;
        welcomeMessage.style.color = '';
    }, 3000);
}

// Alternar tema claro/escuro
themeToggle.addEventListener('click', function() {
    document.body.classList.toggle('dark-mode');
    
    if (document.body.classList.contains('dark-mode')) {
        this.textContent = '☀️ Modo Claro';
        localStorage.setItem('darkMode', 'true');
    } else {
        this.textContent = '🌙 Modo Escuro';
        localStorage.setItem('darkMode', 'false');
    }
});

// Mudar cor de fundo
changeColorBtn.addEventListener('click', function() {
    const colors = [
        'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
        'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
        'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
        'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
        'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)'
    ];
    
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    document.body.style.background = randomColor;
});

// Efeito de digitação no título (opcional)
function typeWriter(element, text, speed = 100) {
    let i = 0;
    element.innerHTML = '';
    
    function type() {
        if (i < text.length) {
            element.innerHTML += text.charAt(i);
            i++;
            setTimeout(type, speed);
        }
    }
    type();
}

// Reiniciar animação do título ao clicar
welcomeTitle.addEventListener('click', function() {
    typeWriter(this, 'Bem-vindo!', 100);
});

// Efeito de confete (simples)
function createConfetti() {
    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.style.cssText = `
                position: fixed;
                width: 10px;
                height: 10px;
                background: hsl(${Math.random() * 360}, 100%, 50%);
                top: -10px;
                left: ${Math.random() * 100}vw;
                border-radius: 50%;
                pointer-events: none;
                animation: fall linear forwards;
            `;
            
            const style = document.createElement('style');
            style.textContent = `
                @keyframes fall {
                    to {
                        transform: translateY(100vh) rotate(${Math.random() * 360}deg);
                        opacity: 0;
                    }
                }
            `;
            
            document.head.appendChild(style);
            document.body.appendChild(confetti);
            
            setTimeout(() => confetti.remove(), 2000);
        }, i * 100);
    }
}

// Confetti no primeiro clique em qualquer lugar
document.addEventListener('click', function firstClick() {
    createConfetti();
    document.removeEventListener('click', firstClick);
});

// Mensagem do footer baseada no horário
function updateFooterMessage() {
    const hour = new Date().getHours();
    let message;
    
    if (hour < 12) {
        message = "Bom dia! ☀️";
    } else if (hour < 18) {
        message = "Boa tarde! 🌤️";
    } else {
        message = "Boa noite! 🌙";
    }
    
    footerText.textContent = message;
}

// Atualizar mensagem do footer a cada minuto
setInterval(updateFooterMessage, 60000);
updateFooterMessage();
