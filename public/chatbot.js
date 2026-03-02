/**
 * Elysiva AI Chatbot
 * Frontend chatbot powered by Gemini 2.5 Flash via OpenRouter.
 * Full markdown rendering. Falls back to local pattern matching if API unavailable.
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
    let aiMessages = [];

    // ==========================================
    // MARKDOWN PARSER
    // ==========================================

    function parseMarkdown(text) {
        if (!text) return '';

        let html = text;

        // Escape HTML to prevent XSS (preserve markdown chars)
        html = html
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');

        // Code blocks: ```lang\n...\n```
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, function (_, lang, code) {
            return '<pre><code>' + code.trim() + '</code></pre>';
        });

        // Inline code: `code`
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

        // Headers: ### h3, ## h2, # h1
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr>');

        // Bold: **text**
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

        // Italic: *text*
        html = html.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');

        // Blockquote: > text
        html = html.replace(/^&gt;\s?(.+)$/gm, '<blockquote>$1</blockquote>');

        // Images: ![alt](url) — show as link on mobile
        html = html.replace(/!\[([^\]]*)\]\(([^)]+)\)/g,
            '<a href="$2" class="message-link" target="_blank" rel="noopener">[$1]</a>');

        // Links: [text](url)
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" class="message-link" target="_blank" rel="noopener">$1</a>');

        // Auto-link emails
        html = html.replace(/(\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b)/g,
            '<a href="mailto:$1" class="message-link">$1</a>');

        // Auto-link URLs not already wrapped
        html = html.replace(/(?<!href="|">)(https?:\/\/[^\s<)]+)/g,
            '<a href="$1" class="message-link" target="_blank" rel="noopener">$1</a>');

        // Unordered lists: - item or * item
        html = html.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

        // Ordered lists: 1. item
        html = html.replace(/^\d+\.\s+(.+)$/gm, '<li>$1</li>');
        // Wrap consecutive <li> not inside <ul> into <ol>
        html = html.replace(/<\/ul>\s*<ul>/g, ''); // merge adjacent uls
        html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, function (match) {
            if (match.includes('<ul>') || match.includes('<ol>')) return match;
            return '<ul>' + match + '</ul>';
        });

        // Tables: | col | col |
        const tableRegex = /(?:^\|.+\|$\n?)+/gm;
        html = html.replace(tableRegex, function (tableBlock) {
            const rows = tableBlock.trim().split('\n').filter(r => r.trim());
            if (rows.length < 2) return tableBlock;

            let table = '<table>';
            rows.forEach((row, i) => {
                // Skip separator row (|---|---|)
                if (/^\|[\s\-:|]+\|$/.test(row)) return;

                const cells = row.split('|').filter(c => c.trim() !== '');
                const tag = i === 0 ? 'th' : 'td';
                table += '<tr>';
                cells.forEach(cell => {
                    table += `<${tag}>${cell.trim()}</${tag}>`;
                });
                table += '</tr>';
            });
            table += '</table>';
            return table;
        });

        // Paragraphs: double newlines
        html = html.replace(/\n\n/g, '</p><p>');

        // Single newlines to <br> (except inside pre/table/list)
        html = html.replace(/\n/g, '<br>');

        // Clean up empty tags
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<br><br>/g, '<br>');

        // Clean up blockquote merging
        html = html.replace(/<\/blockquote><br><blockquote>/g, '<br>');

        return html;
    }

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

            return parseMarkdown(reply);
        } catch (error) {
            console.warn('AI API unavailable, using local fallback:', error.message);
            aiMessages.pop();
            return generateLocalResponse(userMessage);
        }
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
                'Para una cotización personalizada, escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>' },
            { re: /\b(ubicacion|donde|direccion|chorrillos|palian)\b/i, fn: () =>
                'Nuestros proyectos: <strong>Chorrillos</strong> y <strong>Palian</strong>, zonas con alto potencial.' },
            { re: /\b(contacto|email|correo|telefono|llamar)\b/i, fn: () => ELYSIVA_KB.mensajes.contacto },
            { re: /\b(servicio|ofrecen|hacen)\b/i, fn: buildServices },
            { re: /\b(separar|reservar|comprar|adquirir)\b/i, fn: () =>
                'Contáctanos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a> para separar tu depa.' },
            { re: /\b(financiamiento|credito|hipoteca|pago|cuotas)\b/i, fn: () =>
                'Escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a> para opciones de financiamiento.' },
            { re: /\b(visitar|visita|conocer|agendar|tour)\b/i, fn: () =>
                'Agenda tu visita en <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>.' },
            { re: /\b(empresa|quienes son|mision|vision)\b/i, fn: () =>
                `<strong>Elysiva</strong> — ${ELYSIVA_KB.empresa.descripcion}` },
            { re: /\b(departamento|habitacion|dormitorio|bano|metros|area)\b/i, fn: buildAllProjects },
            { re: /\b(web|pagina|sitio|website)\b/i, fn: () =>
                '<a href="https://www.elysiva.org" class="message-link" target="_blank" rel="noopener">www.elysiva.org</a>' }
        ];

        for (const p of patterns) {
            if (p.re.test(message) || p.re.test(normalized)) return p.fn();
        }

        const fallbacks = ELYSIVA_KB.mensajes.noEntendido;
        return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }

    function buildProjectCard(project) {
        let html = `<strong>${project.nombre}</strong><br>`;
        project.unidades.forEach(u => {
            html += `<div class="project-card">
    <div class="project-card-title">${u.nombre}</div>
    <div class="project-card-detail">${u.habitaciones} hab · ${u.banos} baños · ${u.area}</div>
</div>`;
        });
        return html;
    }

    function buildAllProjects() {
        const j = ELYSIVA_KB.proyectos.jade;
        const r = ELYSIVA_KB.proyectos.rubi;
        return `<div class="project-card">
    <div class="project-card-title">${j.nombre}</div>
    <div class="project-card-detail">3 hab · desde 152 m²</div>
</div>
<div class="project-card">
    <div class="project-card-title">${r.nombre}</div>
    <div class="project-card-detail">2-3 hab · desde 48 m²</div>
</div>`;
    }

    function buildServices() {
        let html = '';
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
        bubble.innerHTML = text;

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
        requestAnimationFrame(() => {
            chatMessages.scrollTo({
                top: chatMessages.scrollHeight,
                behavior: 'smooth'
            });
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
        if (typing) typing.remove();
    }

    function setInputEnabled(enabled) {
        chatInput.disabled = !enabled;
        sendBtn.disabled = !enabled;
        sendBtn.style.opacity = enabled ? '1' : '0.5';
    }

    function updateQuickReplies() {
        const options = [
            { text: 'Proyectos', message: 'Quiero ver los proyectos disponibles' },
            { text: 'Precios', message: 'Cuánto cuestan los departamentos?' },
            { text: 'Contacto', message: 'Cómo puedo contactarlos?' },
            { text: 'Servicios', message: 'Qué servicios ofrecen?' }
        ];

        quickReplies.innerHTML = '';
        options.forEach(opt => {
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
            chatWindow.offsetHeight; // reflow
            chatWindow.classList.add('visible');

            chatToggle.querySelector('.chat-icon').classList.add('hidden');
            chatToggle.querySelector('.close-icon').classList.remove('hidden');
            notificationBadge.classList.add('hidden');

            if (isFirstOpen) {
                isFirstOpen = false;
                setTimeout(() => {
                    const welcome = '¡Hola! Soy el asistente de <strong>Elysiva</strong>. Te ayudo a encontrar tu departamento ideal. ¿Qué te gustaría saber?';
                    addMessage(welcome, 'bot');
                    aiMessages.push({
                        role: 'assistant',
                        content: '¡Hola! Soy el asistente de Elysiva. Te ayudo a encontrar tu departamento ideal. ¿Qué te gustaría saber?'
                    });
                }, 400);
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
            addMessage('Error al procesar tu mensaje. Intenta de nuevo o escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>.', 'bot');
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

    // Close on outside click (desktop only)
    document.addEventListener('click', (e) => {
        if (isOpen &&
            !chatWindow.contains(e.target) &&
            !chatToggle.contains(e.target) &&
            window.innerWidth > 480) {
            toggleChat();
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) toggleChat();
    });

    // Handle mobile keyboard resize
    if (window.visualViewport) {
        window.visualViewport.addEventListener('resize', () => {
            if (isOpen) scrollToBottom();
        });
    }

})();
