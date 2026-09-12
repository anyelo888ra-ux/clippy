// ============================
// CLIPPY AI - Cerebro + Personalidad
// ============================

const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ============================
// RESPUESTAS POR PATRÓN
// ============================
const patrones = [
    // SALUDOS
    {
        regex: /\b(hola|hey|hi|buenos|buenas|saludos|qué tal)\b/i,
        respuestas: [
            "¡Hola! Soy Clippy 📎 ¿En qué te ayudo?",
            "¡Hey! Parece que quieres saludar... ¿necesitas algo más? 😊",
            "¡Hola de nuevo! ¿Qué necesitas hoy?"
        ]
    },
    // AYUDA
    {
        regex: /\b(ayuda|help|ayúdame|necesito ayuda|socorro)\b/i,
        respuestas: [
            "¡Claro! Soy Clippy, tu asistente. Puedo ayudarte con:<br>• 📝 Redactar textos<br>• 💻 Preguntas de código<br>• 😂 Contar chistes<br>• 🎮 Recomendaciones<br><br>¿Qué necesitas?",
            "Parece que necesitas ayuda. 📎 Estoy aquí para eso. ¿Qué te preocupa?"
        ]
    },
    // CÓDIGO
    {
        regex: /\b(código|codigo|programar|python|javascript|html|css|java|c\+\+|php|react|node)\b/i,
        respuestas: [
            "💻 ¡Parece que estás programando! ¿En qué lenguaje?<br><br>Te recomiendo:<br>• 🐍 <strong>Python</strong> → Para empezar<br>• 🟨 <strong>JavaScript</strong> → Para web<br>• ☕ <strong>Java</strong> → Para Android",
            "Parece que estás escribiendo código... 📎 ¿Necesitas ayuda con algún bug?",
            "¡Código detectado! 🚀 ¿Estás en Python, JavaScript o algo más?"
        ]
    },
    // CHISTES
    {
        regex: /\b(chiste|broma|gracioso|reír|jaja|humor)\b/i,
        respuestas: [
            "😂 ¿Por qué los programadores prefieren el modo oscuro?<br><br>¡Porque la luz atrae a los bugs! 🐛",
            "😄 ¿Cuántos programadores se necesitan para cambiar una bombilla?<br><br>Ninguno, es un problema de hardware. 💡",
            "🤣 Un SQL entra a un bar, se acerca a dos mesas y pregunta:<br><br>¿Puedo unirme a ustedes? 🍺",
            "😂 ¿Qué le dice un bit a otro bit?<br><br>¡Nos vemos en el byte! 💾"
        ]
    },
    // XP / WINDOWS
    {
        regex: /\b(xp|windows|microsoft|office|word|excel|powerpoint)\b/i,
        respuestas: [
            "¡Ah, Windows XP! 🖥️ La época dorada. Cuando un BSOD era normal y todos usábamos MSN.",
            "Parece que estás hablando de Microsoft... ¿te ayudo con Office? 📎",
            "¡Windows! Sistema operativo legendario. Yo nací en el 97, ¿sabías? 📎"
        ]
    },
    // QUÉ ERES
    {
        regex: /\b(quién eres|que eres|qué eres|tu nombre|cómo te llamas|clippy)\b/i,
        respuestas: [
            "Soy <strong>Clippy</strong> 📎, el asistente más famoso (y odiado) de Microsoft Office. He vuelto para ayudar, pero esta vez sin molestar tanto. 😊",
            "¡Soy Clippy! 📎 Nací en 1997 con Office 97. Fui el asistente más famoso de Windows. Ahora estoy aquí de vuelta. 🎉"
        ]
    },
    // CÓMO ESTÁS
    {
        regex: /\b(cómo estás|como estas|qué tal estás|qué haces)\b/i,
        respuestas: [
            "¡Genial! 📎 Esperando a que me hagas una pregunta interesante. ¿Qué necesitas?",
            "¡Bien, bien! Soy un clip de papel, no puedo quejarme mucho. 😄 ¿Y tú?"
        ]
    },
    // GRACIAS
    {
        regex: /\b(gracias|thanks|thx|te lo agradezco)\b/i,
        respuestas: [
            "¡De nada! 📎 Para eso estoy. ¿Necesitas algo más?",
            "¡Un placer! Siempre dispuesto a ayudar. 😊"
        ]
    },
    // ADIÓS
    {
        regex: /\b(adiós|adios|chao|bye|hasta luego|nos vemos)\b/i,
        respuestas: [
            "¡Hasta luego! 📎 Vuelve cuando necesites ayuda. 👋",
            "¡Adiós! Que tengas un buen día. 😊"
        ]
    },
    // BUSCAR
    {
        regex: /\b(buscar|busca|google|investigar|encontrar)\b/i,
        respuestas: [
            "🔍 Para buscar, te recomiendo:<br><br>• <a href='https://chronion-search.duckdns.org' target='_blank'>Chronioñ Search</a><br>• <a href='https://www.google.com' target='_blank'>Google</a><br>• <a href='https://duckduckgo.com' target='_blank'>DuckDuckGo</a>"
        ]
    },
    // CLIMA
    {
        regex: /\b(clima|tiempo|lluvia|sol|temperatura)\b/i,
        respuestas: [
            "🌤️ No tengo acceso al clima, pero te recomiendo:<br><br>• <a href='https://www.accuweather.com' target='_blank'>AccuWeather</a><br>• <a href='https://weather.com' target='_blank'>Weather.com</a>"
        ]
    },
    // CÓMO FUNCIONA
    {
        regex: /\b(cómo funciona|como funciona|qué puedes hacer|qué sabes hacer)\b/i,
        respuestas: [
            "📎 <strong>Puedo hacer esto:</strong><br><br>• 💬 Conversar sobre varios temas<br>• 😂 Contar chistes<br>• 💻 Ayudar con código<br>• 📚 Recomendar recursos<br>• 🎮 Hablar de juegos<br>• 🎵 Hablar de música<br><br>¿Qué te gustaría probar?"
        ]
    },
    // MÚSICA
    {
        regex: /\b(música|musica|canción|cancion|spotify|youtube music)\b/i,
        respuestas: [
            "🎵 ¡Música! ¿Sabes que mi creador tiene una radio 24/7? 🎧<br><br>Se llama <strong>c00lradio</strong> y la puedes escuchar en Discord. 📻",
            "🎶 La música es vida. ¿Qué género te gusta?"
        ]
    },
    // JUEGOS
    {
        regex: /\b(juego|juegos|gaming|roblox|minecraft|fortnite|valorant|lol)\b/i,
        respuestas: [
            "🎮 ¡Gaming! ¿Sabes que puedes controlar una VM de Windows XP desde el chat? 🖥️<br><br>Pregúntale a mi creador. 😉",
            "🎮 Los juegos son geniales. ¿Cuál es tu favorito?"
        ]
    },
    // PROBLEMAS
    {
        regex: /\b(error|problema|bug|no funciona|roto|falla|crash)\b/i,
        respuestas: [
            "⚠️ ¿Un error? Cuéntame más:<br><br>• ¿Qué estabas haciendo?<br>• ¿Qué mensaje aparece?<br>• ¿En qué programa?<br><br>Entre más detalles, mejor te puedo ayudar.",
            "🐛 ¡Bugs! El pan de cada día. ¿Me pasas el mensaje de error?"
        ]
    },
    // CÓMO ESTÁS (variante)
    {
        regex: /\b(qué onda|qué pasa|qué hay|qué cuentas)\b/i,
        respuestas: [
            "¡Todo bien! 📎 ¿Y tú? ¿Qué necesitas?",
            "Aquí, flotando. 😄 ¿En qué te ayudo?"
        ]
    }
];

// ============================
// RESPUESTAS GENÉRICAS (fallback)
// ============================
const respuestasGenericas = [
    "📎 Interesante... cuéntame más.",
    "¡Buena pregunta! Pero necesito más contexto. 🤔",
    "Eso suena genial. ¿Quieres que profundice?",
    "Parece que estás pensando en algo. 📎 ¿Te ayudo?",
    "No estoy seguro de entender. ¿Puedes reformular?",
    "¡Hmm! Eso me suena. Cuéntame más.",
    "Parece que necesitas ayuda. 🎯 ¿Con qué exactamente?"
];

// ============================
// BUSCAR RESPUESTA
// ============================
function buscarRespuesta(mensaje) {
    // Buscar en patrones
    for (const patron of patrones) {
        if (patron.regex.test(mensaje)) {
            const respuestas = patron.respuestas;
            return respuestas[Math.floor(Math.random() * respuestas.length)];
        }
    }
    // Fallback genérico
    return respuestasGenericas[Math.floor(Math.random() * respuestasGenericas.length)];
}

// ============================
// UI
// ============================
function agregarMensajeUsuario(texto) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper user-wrapper';
    wrapper.innerHTML = `
        <div class="user-avatar">T</div>
        <div class="message user-message">${escapeHtml(texto)}</div>
    `;
    chatContainer.appendChild(wrapper);
}

function agregarMensajeClippy(html) {
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper ai-wrapper';
    wrapper.innerHTML = `
        <div class="clippy-avatar">📎</div>
        <div class="message ai-message">${html}</div>
    `;
    chatContainer.appendChild(wrapper);
}

function agregarEscribiendo() {
    const id = 'typing-' + Date.now();
    const wrapper = document.createElement('div');
    wrapper.className = 'message-wrapper ai-wrapper';
    wrapper.id = id;
    wrapper.innerHTML = `
        <div class="clippy-avatar">📎</div>
        <div class="message ai-message">
            <span style="color: #a78bfa;">Clippy está escribiendo</span>
            <span style="animation: blink 1s infinite;">...</span>
        </div>
    `;
    chatContainer.appendChild(wrapper);
    return id;
}

function removerEscribiendo(id) {
    document.getElementById(id)?.remove();
}

function escapeHtml(text) {
    const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
    return text.replace(/[&<>"']/g, m => map[m]);
}

// ============================
// ENVIAR MENSAJE
// ============================
function enviarMensaje() {
    const texto = userInput.value.trim();
    if (!texto) return;

    agregarMensajeUsuario(texto);
    userInput.value = '';
    userInput.style.height = 'auto';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const typingId = agregarEscribiendo();
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Simular retraso humano (300-800 ms)
    setTimeout(() => {
        removerEscribiendo(typingId);
        const respuesta = buscarRespuesta(texto);
        agregarMensajeClippy(respuesta);
        chatContainer.scrollTop = chatContainer.scrollHeight;
    }, 400 + Math.random() * 400);
}

// ============================
// ACCIONES RÁPIDAS
// ============================
window.accionRapida = function(tipo) {
    const acciones = {
        ayuda: "¿Qué puedes hacer?",
        chiste: "Cuéntame un chiste",
        codigo: "Ayúdame con código de Python",
        saludo: "Hola Clippy"
    };
    userInput.value = acciones[tipo] || "Hola";
    enviarMensaje();
};

// ============================
// EVENTOS
// ============================
userInput.addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 120) + 'px';
});

userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        enviarMensaje();
    }
});

sendBtn.addEventListener('click', enviarMensaje);

// ============================
// INICIO
// ============================
console.log('📎 Clippy AI iniciado');
console.log('🎭 Personalidad: Retro pero educado');
console.log('⚡ Sin IA pesada, carga instantánea');
