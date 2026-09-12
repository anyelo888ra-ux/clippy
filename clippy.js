// ============================
// CLIPPY AI - Cerebro + Personalidad
// Con Supabase: historial, stats, preferencias
// ============================

const chatContainer = document.getElementById('chatContainer');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');

// ============================
// SUPABASE CLIENT
// ============================
let supabase = null;
let currentUser = null;

// Esperar a que Supabase esté inicializado (viene de index.html)
async function initSupabase() {
    // Buscar el cliente de Supabase que se crea en index.html
    // Esperamos a que esté disponible globalmente
    let intentos = 0;
    while (!window.supabaseClient && intentos < 50) {
        await new Promise(r => setTimeout(r, 100));
        intentos++;
    }
    
    if (window.supabaseClient) {
        supabase = window.supabaseClient;
        
        // Verificar sesión actual
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
            currentUser = session.user;
            console.log('👤 Usuario logueado:', currentUser.email);
            await inicializarUsuario(currentUser);
            await cargarHistorial(currentUser);
        }
        
        // Escuchar cambios de sesión
        supabase.auth.onAuthStateChange(async (event, session) => {
            if (event === 'SIGNED_IN' && session) {
                currentUser = session.user;
                await inicializarUsuario(currentUser);
                await cargarHistorial(currentUser);
            } else if (event === 'SIGNED_OUT') {
                currentUser = null;
                chatContainer.innerHTML = '';
                agregarMensajeInicial();
            }
        });
    }
}

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
    for (const patron of patrones) {
        if (patron.regex.test(mensaje)) {
            const respuestas = patron.respuestas;
            return respuestas[Math.floor(Math.random() * respuestas.length)];
        }
    }
    return respuestasGenericas[Math.floor(Math.random() * respuestasGenericas.length)];
}

// ============================
// SUPABASE: INICIALIZAR USUARIO
// ============================
async function inicializarUsuario(user) {
    if (!supabase) return;
    
    try {
        // Verificar si ya existe en user_stats
        const { data: stats, error } = await supabase
            .from('user_stats')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        // Si no existe, crear stats iniciales
        if (error || !stats) {
            console.log('🆕 Creando stats para nuevo usuario...');
            await supabase
                .from('user_stats')
                .insert([{
                    user_id: user.id,
                    messages_count: 0,
                    level: 1,
                    badges: []
                }]);
        }
        
        // Verificar preferencias
        const { data: prefs, error: prefsError } = await supabase
            .from('preferences')
            .select('*')
            .eq('user_id', user.id)
            .single();
        
        if (prefsError || !prefs) {
            console.log('🆕 Creando preferencias para nuevo usuario...');
            await supabase
                .from('preferences')
                .insert([{
                    user_id: user.id,
                    theme: 'dark',
                    language: 'es',
                    notifications: true
                }]);
        }
        
        console.log('✅ Usuario inicializado');
    } catch (e) {
        console.error('❌ Error inicializando usuario:', e);
    }
}

// ============================
// SUPABASE: GUARDAR MENSAJE
// ============================
async function guardarMensaje(role, content) {
    if (!supabase || !currentUser) return;
    
    try {
        await supabase
            .from('chat_history')
            .insert([{
                user_id: currentUser.id,
                role: role,
                content: content
            }]);
    } catch (e) {
        console.error('❌ Error guardando mensaje:', e);
    }
}

// ============================
// SUPABASE: CARGAR HISTORIAL
// ============================
async function cargarHistorial(user) {
    if (!supabase) return;
    
    try {
        const { data, error } = await supabase
            .from('chat_history')
            .select('*')
            .eq('user_id', user.id)
            .order('created_at', { ascending: true })
            .limit(50);
        
        if (error) throw error;
        
        if (data && data.length > 0) {
            chatContainer.innerHTML = '';
            data.forEach(msg => {
                if (msg.role === 'user') {
                    agregarMensajeUsuario(msg.content);
                } else {
                    agregarMensajeClippy(msg.content);
                }
            });
            chatContainer.scrollTop = chatContainer.scrollHeight;
            console.log(`📚 ${data.length} mensajes cargados del historial`);
        }
    } catch (e) {
        console.error('❌ Error cargando historial:', e);
    }
}

// ============================
// SUPABASE: ACTUALIZAR STATS
// ============================
async function actualizarStats() {
    if (!supabase || !currentUser) return;
    
    try {
        // Obtener stats actuales
        const { data: stats } = await supabase
            .from('user_stats')
            .select('messages_count, level')
            .eq('user_id', currentUser.id)
            .single();
        
        if (stats) {
            const newCount = stats.messages_count + 1;
            const newLevel = Math.floor(newCount / 10) + 1;
            
            await supabase
                .from('user_stats')
                .update({
                    messages_count: newCount,
                    level: newLevel,
                    updated_at: new Date().toISOString()
                })
                .eq('user_id', currentUser.id);
            
            console.log(`📊 Stats: ${newCount} mensajes, nivel ${newLevel}`);
        }
    } catch (e) {
        console.error('❌ Error actualizando stats:', e);
    }
}

// ============================
// UI
// ============================
function agregarMensajeInicial() {
    chatContainer.innerHTML = `
        <div class="message-wrapper ai-wrapper">
            <div class="clippy-avatar">📎</div>
            <div class="message ai-message">
                ¡Hola! Soy <strong>Clippy</strong> 📎<br><br>
                El asistente más legendario de Microsoft Office ha vuelto.<br><br>
                Pero esta vez, <strong>sin ser tan molesto</strong>. 😊<br><br>
                ¿En qué te puedo ayudar hoy?
            </div>
        </div>
    `;
}

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
async function enviarMensaje() {
    const texto = userInput.value.trim();
    if (!texto) return;

    // Mostrar mensaje del usuario
    agregarMensajeUsuario(texto);
    userInput.value = '';
    userInput.style.height = 'auto';
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Guardar en Supabase (si está logueado)
    await guardarMensaje('user', texto);

    // Typing indicator
    const typingId = agregarEscribiendo();
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Simular retraso humano (300-800 ms)
    setTimeout(async () => {
        removerEscribiendo(typingId);
        const respuesta = buscarRespuesta(texto);
        agregarMensajeClippy(respuesta);
        chatContainer.scrollTop = chatContainer.scrollHeight;

        // Guardar respuesta en Supabase
        await guardarMensaje('assistant', respuesta);

        // Actualizar stats
        await actualizarStats();
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
console.log('💾 Integración con Supabase activada');

// Iniciar Supabase
initSupabase();
