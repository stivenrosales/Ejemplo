/**
 * Elysiva AI Chatbot
 * Frontend chatbot powered by Gemini 2.5 Flash via OpenRouter.
 * Falls back to local pattern matching if the API is unavailable.
 */

(function () {
    'use strict';

    // ==========================================
    // DOM ELEMENTS
    // ==========================================

    const chatToggle = document.getElementById('chatToggle');
    const chatWindow = document.getElementById('chatWindow');
    const chatClose = document.getElementById('chatClose');
    const chatMessages = document.getElementById('chatMessages');
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendBtn');
    const quickReplies = document.getElementById('quickReplies');
    const notificationBadge = document.getElementById('notificationBadge');

    // ==========================================
    // STATE
    // ==========================================

    let isOpen = false;
    let isFirstOpen = true;
    let isSending = false;
    let aiMessages = []; // Conversation history for the AI API

    // ==========================================
    // AI API
    // ==========================================

    async function callAI(userMessage) {
        aiMessages.push({ role: 'user', content: userMessage });

        try {
            const response = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: aiMessages })
            });

            if (!response.ok) {
                throw new Error(`API error: ${response.status}`);
            }

            const data = await response.json();
            const reply = data.reply;

            aiMessages.push({ role: 'assistant', content: reply });

            return formatAIResponse(reply);
        } catch (error) {
            console.warn('AI API unavailable, using local fallback:', error.message);
            // Remove the failed message from history
            aiMessages.pop();
            return generateLocalResponse(userMessage);
        }
    }

    function formatAIResponse(text) {
        // Convert markdown-like formatting to HTML
        let html = text
            // Bold: **text** or __text__
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/__(.*?)__/g, '<strong>$1</strong>')
            // Italic: *text* or _text_
            .replace(/(?<!\*)\*(?!\*)(.*?)(?<!\*)\*(?!\*)/g, '<em>$1</em>')
            // Bullet points
            .replace(/^[-•]\s+(.+)/gm, '• $1')
            // Email links
            .replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g,
                '<a href="mailto:$1" class="message-link">$1</a>')
            // URL links (not already in href)
            .replace(/(?<!href=")(https?:\/\/[^\s<)]+)/g,
                '<a href="$1" class="message-link" target="_blank" rel="noopener">$1</a>')
            // www links
            .replace(/(?<!\/)(www\.[^\s<)]+)/g,
                '<a href="https://$1" class="message-link" target="_blank" rel="noopener">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br>');

        return html;
    }

    // ==========================================
    // LOCAL FALLBACK (pattern matching)
    // ==========================================

    function generateLocalResponse(message) {
        const normalized = message.toLowerCase()
            .normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();

        const patterns = [
            { re: /^(hola|hi|hello|buenas|buenos|hey|saludos)/i, fn: () => ELYSIVA_KB.mensajes.bienvenida },
            { re: /\b(adios|chao|chau|bye|hasta luego)\b/i, fn: () => ELYSIVA_KB.mensajes.despedida },
            { re: /\b(gracias|thanks|agradezco)\b/i, fn: () => ELYSIVA_KB.mensajes.agradecimiento },
            { re: /\b(jade)\b/i, fn: () => buildProjectCard(ELYSIVA_KB.proyectos.jade) },
            { re: /\b(rub[ii]|rubi)\b/i, fn: () => buildProjectCard(ELYSIVA_KB.proyectos.rubi) },
            { re: /\b(proyecto|inmueble|disponible|opciones)\b/i, fn: buildAllProjects },
            { re: /\b(precio|costo|cuanto|valor|cotiza)\b/i, fn: () =>
                'Los precios varían según el proyecto. Para una cotización personalizada, escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>' },
            { re: /\b(ubicacion|donde|direccion|chorrillos|palian)\b/i, fn: () =>
                'Nuestros proyectos están en <strong>Chorrillos</strong> y <strong>Palian</strong>, zonas con alto potencial de crecimiento.' },
            { re: /\b(contacto|email|correo|telefono|llamar)\b/i, fn: () => ELYSIVA_KB.mensajes.contacto },
            { re: /\b(servicio|ofrecen|hacen)\b/i, fn: buildServices },
            { re: /\b(separar|reservar|comprar|adquirir)\b/i, fn: () =>
                'Para separar tu departamento, contáctanos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>. Un asesor te guiará en todo el proceso.' },
            { re: /\b(financiamiento|credito|hipoteca|pago|cuotas)\b/i, fn: () =>
                'Contáctanos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a> para conocer las opciones de financiamiento disponibles.' },
            { re: /\b(visitar|visita|conocer|agendar|tour)\b/i, fn: () =>
                'Agenda una visita escribiéndonos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a> con tu nombre, proyecto de interés y horario preferido.' },
            { re: /\b(empresa|quienes son|mision|vision)\b/i, fn: () =>
                `<strong>Elysiva</strong> - ${ELYSIVA_KB.empresa.descripcion} "${ELYSIVA_KB.empresa.slogan}"` },
            { re: /\b(departamento|habitacion|dormitorio|bano|metros|area)\b/i, fn: buildAllProjects },
            { re: /\b(web|pagina|sitio|website)\b/i, fn: () =>
                'Visita nuestra web: <a href="https://www.elysiva.org" class="message-link" target="_blank" rel="noopener">www.elysiva.org</a>' }
        ];

        for (const p of patterns) {
            if (p.re.test(message) || p.re.test(normalized)) {
                return p.fn();
            }
        }

        const fallbacks = ELYSIVA_KB.mensajes.noEntendido;
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    function buildProjectCard(project) {
        let html = `<strong>${project.nombre}</strong> - ${project.descripcion}<br><br>`;
        project.unidades.forEach(u => {
            html += `<div class="project-card">
    <div class="project-card-title">${u.nombre}</div>
    <div class="project-card-detail">
        <strong>Habitaciones:</strong> ${u.habitaciones} | <strong>Baños:</strong> ${u.banos}<br>
        <strong>Área:</strong> ${u.area}<br>${u.caracteristicas}
    </div>
</div>`;
        });
        return html;
    }

    function buildAllProjects() {
        const jade = ELYSIVA_KB.proyectos.jade;
        const rubi = ELYSIVA_KB.proyectos.rubi;
        return `Proyectos disponibles:
<div class="project-card">
    <div class="project-card-title">${jade.nombre}</div>
    <div class="project-card-detail">${jade.descripcion} — Dptos de 3 hab, desde 152 m²</div>
</div>
<div class="project-card">
    <div class="project-card-title">${rubi.nombre}</div>
    <div class="project-card-detail">${rubi.descripcion} — Dptos de 2-3 hab, desde 48 m²</div>
</div>
¿Cuál te interesa?`;
    }

    function buildServices() {
        let html = 'Nuestros servicios:<br>';
        ELYSIVA_KB.servicios.forEach(s => {
            html += `<div class="project-card">
    <div class="project-card-title">${s.nombre}</div>
    <div class="project-card-detail">${s.descripcion}</div>
</div>`;
        });
        return html;
    }

    // ==========================================
    // UI FUNCTIONS
    // ==========================================

    function getCurrentTime() {
        return new Date().toLocaleTimeString('es-ES', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function createMessageElement(text, sender) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${sender}`;

        if (sender === 'bot') {
            const avatar = document.createElement('div');
            avatar.className = 'message-avatar';
            avatar.textContent = 'E';
            messageDiv.appendChild(avatar);
        }

        const contentDiv = document.createElement('div');
        contentDiv.className = 'message-content';

        const bubble = document.createElement('div');
        bubble.className = 'message-bubble';
        bubble.innerHTML = text.replace(/\n/g, '<br>');

        const time = document.createElement('div');
        time.className = 'message-time';
        time.textContent = getCurrentTime();

        contentDiv.appendChild(bubble);
        contentDiv.appendChild(time);
        messageDiv.appendChild(contentDiv);

        return messageDiv;
    }

    function createTypingIndicator() {
        const wrapper = document.createElement('div');
        wrapper.className = 'message bot';
        wrapper.id = 'typingIndicator';

        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'E';

        const indicator = document.createElement('div');
        indicator.className = 'typing-indicator';
        indicator.innerHTML = '<span></span><span></span><span></span>';

        wrapper.appendChild(avatar);
        wrapper.appendChild(indicator);

        return wrapper;
    }

    function scrollToBottom() {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
    }

    function addMessage(text, sender) {
        const messageEl = createMessageElement(text, sender);
        chatMessages.appendChild(messageEl);
        scrollToBottom();
    }

    function showTyping() {
        const typing = createTypingIndicator();
        chatMessages.appendChild(typing);
        scrollToBottom();
    }

    function hideTyping() {
        const typing = document.getElementById('typingIndicator');
        if (typing) {
            typing.remove();
        }
    }

    function setInputEnabled(enabled) {
        chatInput.disabled = !enabled;
        sendBtn.disabled = !enabled;
        sendBtn.style.opacity = enabled ? '1' : '0.5';
    }

    function updateQuickReplies(context) {
        const replyOptions = [
            { text: 'Proyectos', message: 'Quiero ver los proyectos disponibles' },
            { text: 'Precios', message: 'Quiero información sobre precios' },
            { text: 'Contacto', message: 'Cómo puedo contactarlos?' },
            { text: 'Servicios', message: 'Qué servicios ofrecen?' }
        ];

        quickReplies.innerHTML = '';
        replyOptions.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = opt.text;
            btn.addEventListener('click', () => handleQuickReply(opt.message));
            quickReplies.appendChild(btn);
        });
    }

    // ==========================================
    // EVENT HANDLERS
    // ==========================================

    function toggleChat() {
        isOpen = !isOpen;

        if (isOpen) {
            chatWindow.classList.remove('hidden');
            chatWindow.offsetHeight; // trigger reflow
            chatWindow.classList.add('visible');

            chatToggle.querySelector('.chat-icon').classList.add('hidden');
            chatToggle.querySelector('.close-icon').classList.remove('hidden');
            notificationBadge.classList.add('hidden');

            if (isFirstOpen) {
                isFirstOpen = false;
                setTimeout(() => {
                    const welcome = '¡Hola! Bienvenido a <strong>Elysiva</strong>. Soy tu asistente virtual potenciado por inteligencia artificial y estoy aquí para ayudarte a encontrar el departamento de tus sueños. ¿En qué puedo ayudarte?';
                    addMessage(welcome, 'bot');
                    aiMessages.push({
                        role: 'assistant',
                        content: '¡Hola! Bienvenido a Elysiva. Soy tu asistente virtual potenciado por inteligencia artificial y estoy aquí para ayudarte a encontrar el departamento de tus sueños. ¿En qué puedo ayudarte?'
                    });
                }, 500);
            }

            setTimeout(() => chatInput.focus(), 350);
        } else {
            chatWindow.classList.remove('visible');
            chatToggle.querySelector('.chat-icon').classList.remove('hidden');
            chatToggle.querySelector('.close-icon').classList.add('hidden');
        }
    }

    async function sendMessage() {
        const text = chatInput.value.trim();
        if (!text || isSending) return;

        isSending = true;
        setInputEnabled(false);

        addMessage(text, 'user');
        chatInput.value = '';

        showTyping();

        try {
            const response = await callAI(text);
            hideTyping();
            addMessage(response, 'bot');
        } catch (error) {
            hideTyping();
            addMessage('Lo siento, hubo un error al procesar tu mensaje. Por favor, intenta de nuevo o escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>.', 'bot');
        }

        isSending = false;
        setInputEnabled(true);
        chatInput.focus();
        updateQuickReplies();
    }

    function handleQuickReply(message) {
        chatInput.value = message;
        sendMessage();
    }

    // ==========================================
    // EVENT LISTENERS
    // ==========================================

    chatToggle.addEventListener('click', toggleChat);
    chatClose.addEventListener('click', toggleChat);
    sendBtn.addEventListener('click', sendMessage);

    chatInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });

    document.querySelectorAll('.quick-reply-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            handleQuickReply(btn.dataset.message);
        });
    });

    document.addEventListener('click', (e) => {
        if (isOpen &&
            !chatWindow.contains(e.target) &&
            !chatToggle.contains(e.target) &&
            window.innerWidth > 480) {
            toggleChat();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            toggleChat();
        }
    });

})();
