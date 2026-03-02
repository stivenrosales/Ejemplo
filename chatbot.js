/**
 * Elysiva AI Chatbot
 * Frontend chatbot with NLP-like pattern matching for customer service.
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
    let conversationHistory = [];

    // ==========================================
    // INTENT RECOGNITION
    // ==========================================

    const intents = [
        {
            name: 'saludo',
            patterns: [
                /^(hola|hi|hello|buenas|buenos|hey|saludos|qué tal|que tal|buenas tardes|buenas noches|buenos días|buenos dias|buen dia|buen día)/i
            ],
            handler: handleGreeting
        },
        {
            name: 'despedida',
            patterns: [
                /\b(adiós|adios|chao|chau|bye|hasta luego|nos vemos|hasta pronto|me voy|gracias.*(todo|eso es|suficiente))\b/i
            ],
            handler: handleFarewell
        },
        {
            name: 'agradecimiento',
            patterns: [
                /\b(gracias|thanks|agradezco|muy amable|te agradezco)\b/i
            ],
            handler: handleThanks
        },
        {
            name: 'proyectos',
            patterns: [
                /\b(proyecto|proyectos|inmueble|inmuebles|disponible|disponibles|opciones|catálogo|catalogo|oferta|ofertas|portafolio)\b/i
            ],
            handler: handleProjects
        },
        {
            name: 'proyecto_jade',
            patterns: [
                /\b(jade)\b/i
            ],
            handler: handleProjectJade
        },
        {
            name: 'proyecto_rubi',
            patterns: [
                /\b(rub[ií]|rubi)\b/i
            ],
            handler: handleProjectRubi
        },
        {
            name: 'precios',
            patterns: [
                /\b(precio|precios|costo|costos|cuánto|cuanto|valor|inversión|inversion|presupuesto|cotización|cotizacion|cotizar)\b/i
            ],
            handler: handlePricing
        },
        {
            name: 'ubicacion',
            patterns: [
                /\b(ubicación|ubicacion|donde|dónde|dirección|direccion|zona|sector|localización|localizacion|mapa|chorrillos|palian|lugar)\b/i
            ],
            handler: handleLocation
        },
        {
            name: 'contacto',
            patterns: [
                /\b(contacto|contactar|comunicar|email|correo|teléfono|telefono|llamar|whatsapp|redes|celular|número|numero)\b/i
            ],
            handler: handleContact
        },
        {
            name: 'servicios',
            patterns: [
                /\b(servicio|servicios|ofrecen|hacen|dedicar|actividad|qué hacen|que hacen)\b/i
            ],
            handler: handleServices
        },
        {
            name: 'separar',
            patterns: [
                /\b(separar|separación|separacion|reservar|reserva|apartar|comprar|adquirir|proceso.*(compra|adquisición))\b/i
            ],
            handler: handleReservation
        },
        {
            name: 'financiamiento',
            patterns: [
                /\b(financiamiento|financiar|crédito|credito|hipoteca|hipotecario|banco|cuotas|pago|pagos|letra|letras|inicial)\b/i
            ],
            handler: handleFinancing
        },
        {
            name: 'visita',
            patterns: [
                /\b(visitar|visita|conocer|ver.*(departamento|proyecto|inmueble)|mostrar|recorrer|tour|agendar|agenda)\b/i
            ],
            handler: handleVisit
        },
        {
            name: 'empresa',
            patterns: [
                /\b(empresa|compañía|compania|quiénes son|quienes son|sobre ustedes|acerca|misión|mision|visión|vision|trayectoria|historia|experiencia)\b/i
            ],
            handler: handleCompanyInfo
        },
        {
            name: 'departamento_detalle',
            patterns: [
                /\b(departamento|depa|dpto|habitacion|habitaciones|cuartos|dormitorio|dormitorios|baño|baños|banos|metros|m²|área|area|tamaño|tamano|ambientes)\b/i
            ],
            handler: handleApartmentDetails
        },
        {
            name: 'web',
            patterns: [
                /\b(web|página|pagina|sitio|website|link|enlace|url)\b/i
            ],
            handler: handleWebsite
        }
    ];

    // ==========================================
    // INTENT HANDLERS
    // ==========================================

    function handleGreeting() {
        return ELYSIVA_KB.mensajes.bienvenida;
    }

    function handleFarewell() {
        return ELYSIVA_KB.mensajes.despedida;
    }

    function handleThanks() {
        return ELYSIVA_KB.mensajes.agradecimiento;
    }

    function handleProjects() {
        const jade = ELYSIVA_KB.proyectos.jade;
        const rubi = ELYSIVA_KB.proyectos.rubi;

        return `Actualmente tenemos estos proyectos disponibles:

<div class="project-card">
    <div class="project-card-title">${jade.nombre}</div>
    <div class="project-card-detail">
        ${jade.descripcion}<br>
        <strong>Estado:</strong> ${jade.estado}<br>
        <strong>Unidades:</strong> Departamentos de 3 hab. desde 152 m² hasta 162 m²
    </div>
</div>

<div class="project-card">
    <div class="project-card-title">${rubi.nombre}</div>
    <div class="project-card-detail">
        ${rubi.descripcion}<br>
        <strong>Estado:</strong> ${rubi.estado}<br>
        <strong>Unidades:</strong> Departamentos de 2-3 hab. desde 48.52 m² hasta 163 m²
    </div>
</div>

¿Te gustaría conocer más detalles sobre alguno de estos proyectos?`;
    }

    function handleProjectJade() {
        const jade = ELYSIVA_KB.proyectos.jade;
        let response = `<strong>${jade.nombre}</strong>\n${jade.descripcion}\n\nUnidades disponibles:\n`;

        jade.unidades.forEach(u => {
            response += `
<div class="project-card">
    <div class="project-card-title">${u.nombre}</div>
    <div class="project-card-detail">
        <strong>Habitaciones:</strong> ${u.habitaciones} | <strong>Baños:</strong> ${u.banos}<br>
        <strong>Área:</strong> ${u.area}<br>
        ${u.caracteristicas}
    </div>
</div>`;
        });

        response += '\n\n¿Te gustaría separar algún departamento o necesitas más información?';
        return response;
    }

    function handleProjectRubi() {
        const rubi = ELYSIVA_KB.proyectos.rubi;
        let response = `<strong>${rubi.nombre}</strong>\n${rubi.descripcion}\n\nUnidades disponibles:\n`;

        rubi.unidades.forEach(u => {
            response += `
<div class="project-card">
    <div class="project-card-title">${u.nombre}</div>
    <div class="project-card-detail">
        <strong>Habitaciones:</strong> ${u.habitaciones} | <strong>Baños:</strong> ${u.banos}<br>
        <strong>Área:</strong> ${u.area}<br>
        ${u.caracteristicas}
    </div>
</div>`;
        });

        response += '\n\n¿Deseas agendar una visita o conocer más detalles?';
        return response;
    }

    function handlePricing() {
        return `Los precios varían según el proyecto y la unidad. Para obtener una cotización personalizada y conocer las opciones de financiamiento disponibles, te recomiendo:

<div class="project-card">
    <div class="project-card-title">Solicitar cotización</div>
    <div class="project-card-detail">
        Escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a> con el proyecto de tu interés y te enviaremos toda la información de precios y planes de pago.
    </div>
</div>

También puedes visitar nuestra web <a href="https://www.elysiva.org/proyectos-en-venta/" class="message-link" target="_blank" rel="noopener">elysiva.org/proyectos-en-venta</a> para ver los proyectos actualizados.

¿Hay algún proyecto en particular que te interese?`;
    }

    function handleLocation() {
        return `Nuestros proyectos están ubicados en <strong>zonas estratégicas</strong> con alto potencial de crecimiento:

<div class="project-card">
    <div class="project-card-title">Ubicaciones</div>
    <div class="project-card-detail">
        Contamos con proyectos en la zona de <strong>Chorrillos</strong> y <strong>Palian</strong>, áreas con excelente conectividad y alto potencial de valorización inmobiliaria.
    </div>
</div>

¿Te gustaría agendar una visita para conocer alguno de nuestros proyectos en persona?`;
    }

    function handleContact() {
        return `Puedes comunicarte con nosotros a través de los siguientes canales:

<div class="project-card">
    <div class="project-card-title">Email</div>
    <div class="project-card-detail">
        <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>
    </div>
</div>

<div class="project-card">
    <div class="project-card-title">Página Web</div>
    <div class="project-card-detail">
        <a href="https://www.elysiva.org" class="message-link" target="_blank" rel="noopener">www.elysiva.org</a>
    </div>
</div>

<div class="project-card">
    <div class="project-card-title">TikTok</div>
    <div class="project-card-detail">
        @elysiva_desarrolladora
    </div>
</div>

¡Nuestro equipo estará encantado de atenderte!`;
    }

    function handleServices() {
        let response = 'En Elysiva ofrecemos los siguientes servicios:\n';

        ELYSIVA_KB.servicios.forEach(s => {
            response += `
<div class="project-card">
    <div class="project-card-title">${s.nombre}</div>
    <div class="project-card-detail">${s.descripcion}</div>
</div>`;
        });

        response += '\n\n¿Te gustaría más información sobre algún servicio en particular?';
        return response;
    }

    function handleReservation() {
        return `¡Excelente que estés interesado en adquirir un departamento con nosotros! El proceso es sencillo:

<div class="project-card">
    <div class="project-card-title">Paso 1: Elige tu proyecto</div>
    <div class="project-card-detail">Revisa nuestros proyectos disponibles (Jade y Rubí) y elige el que más se adapte a tus necesidades.</div>
</div>

<div class="project-card">
    <div class="project-card-title">Paso 2: Contáctanos</div>
    <div class="project-card-detail">Escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a> para recibir asesoría personalizada.</div>
</div>

<div class="project-card">
    <div class="project-card-title">Paso 3: Separa tu departamento</div>
    <div class="project-card-detail">Un asesor te guiará en el proceso de separación y te explicará las opciones de financiamiento disponibles.</div>
</div>

¿Te gustaría que te explique sobre algún proyecto en específico?`;
    }

    function handleFinancing() {
        return `Para conocer las opciones de financiamiento y planes de pago disponibles, te recomendamos comunicarte directamente con nuestro equipo:

<div class="project-card">
    <div class="project-card-title">Asesoría Financiera</div>
    <div class="project-card-detail">
        Nuestros asesores pueden explicarte las opciones de financiamiento, cuota inicial, y planes de pago que mejor se adapten a tu presupuesto.<br><br>
        Escríbenos a: <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a>
    </div>
</div>

Cada proyecto puede tener condiciones diferentes, por eso es importante una asesoría personalizada. ¿Hay algo más en lo que pueda ayudarte?`;
    }

    function handleVisit() {
        return `¡Nos encantaría mostrarte nuestros proyectos! Para agendar una visita:

<div class="project-card">
    <div class="project-card-title">Agendar visita</div>
    <div class="project-card-detail">
        Escríbenos a <a href="mailto:admin@elysiva.org" class="message-link">admin@elysiva.org</a> indicando:<br>
        • Tu nombre completo<br>
        • Proyecto de interés (Jade o Rubí)<br>
        • Fecha y hora de tu preferencia<br><br>
        Nuestro equipo coordinará la visita y te brindará toda la atención personalizada.
    </div>
</div>

¿Cuál proyecto te gustaría visitar?`;
    }

    function handleCompanyInfo() {
        const emp = ELYSIVA_KB.empresa;
        return `<strong>${emp.nombre}</strong> es una ${emp.descripcion}

Nuestro lema: <em>"${emp.slogan}"</em>

Nos distinguimos por:
${emp.valores.map(v => `• ${v}`).join('\n')}

Visita nuestra web para conocer más: <a href="${emp.web}" class="message-link" target="_blank" rel="noopener">${emp.web}</a>

¿Te gustaría conocer nuestros proyectos o servicios?`;
    }

    function handleApartmentDetails() {
        return `Tenemos departamentos con diversas configuraciones:

<div class="project-card">
    <div class="project-card-title">Proyecto Jade</div>
    <div class="project-card-detail">
        • Dpto. 501: 3 hab, 3 baños, 162.30 m²<br>
        • Dpto. 502: 3 hab, 2 baños, 152.23 m²<br>
        Acabados de lujo y diseño moderno
    </div>
</div>

<div class="project-card">
    <div class="project-card-title">Proyecto Rubí</div>
    <div class="project-card-detail">
        • 2 a 3 habitaciones<br>
        • 1 a 5 baños<br>
        • Desde 48.52 m² hasta 163 m²<br>
        Diversas opciones para toda la familia
    </div>
</div>

¿Qué tipo de departamento buscas? Puedo ayudarte a encontrar la mejor opción.`;
    }

    function handleWebsite() {
        return `Puedes visitar nuestra página web para ver toda la información actualizada de nuestros proyectos:

<div class="project-card">
    <div class="project-card-title">Sitio Web Oficial</div>
    <div class="project-card-detail">
        <a href="https://www.elysiva.org" class="message-link" target="_blank" rel="noopener">www.elysiva.org</a><br><br>
        <a href="https://www.elysiva.org/proyectos-en-venta/" class="message-link" target="_blank" rel="noopener">Ver proyectos en venta</a>
    </div>
</div>

¿Necesitas ayuda con algo más?`;
    }

    function handleDefault() {
        const responses = ELYSIVA_KB.mensajes.noEntendido;
        return responses[Math.floor(Math.random() * responses.length)];
    }

    // ==========================================
    // NLP-LIKE PROCESSING
    // ==========================================

    function normalizeText(text) {
        return text
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .trim();
    }

    function detectIntent(message) {
        const normalized = normalizeText(message);

        for (const intent of intents) {
            for (const pattern of intent.patterns) {
                if (pattern.test(message) || pattern.test(normalized)) {
                    return intent;
                }
            }
        }

        return null;
    }

    function generateResponse(message) {
        const intent = detectIntent(message);

        if (intent) {
            conversationHistory.push({ role: 'intent', name: intent.name });
            return intent.handler();
        }

        return handleDefault();
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

        conversationHistory.push({ role: sender, text: text });
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

    function updateQuickReplies(intent) {
        const replies = {
            proyectos: [
                { text: 'Cuéntame sobre el Proyecto Jade', message: 'Quiero saber sobre el Proyecto Jade' },
                { text: 'Cuéntame sobre el Proyecto Rubí', message: 'Quiero saber sobre el Proyecto Rubí' },
                { text: 'Precios', message: 'Quiero información sobre precios' },
                { text: 'Agendar visita', message: 'Quiero agendar una visita' }
            ],
            precios: [
                { text: 'Ver proyectos', message: 'Quiero ver los proyectos disponibles' },
                { text: 'Contactar asesor', message: 'Quiero contactar a un asesor' },
                { text: 'Financiamiento', message: 'Qué opciones de financiamiento tienen?' }
            ],
            contacto: [
                { text: 'Ver proyectos', message: 'Quiero ver los proyectos disponibles' },
                { text: 'Agendar visita', message: 'Quiero agendar una visita' }
            ],
            default: [
                { text: 'Proyectos', message: 'Quiero ver los proyectos disponibles' },
                { text: 'Precios', message: 'Quiero información sobre precios' },
                { text: 'Contacto', message: 'Cómo puedo contactarlos?' },
                { text: 'Servicios', message: 'Qué servicios ofrecen?' }
            ]
        };

        const options = replies[intent] || replies.default;

        quickReplies.innerHTML = '';
        options.forEach(opt => {
            const btn = document.createElement('button');
            btn.className = 'quick-reply-btn';
            btn.textContent = opt.text;
            btn.dataset.message = opt.message;
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
            // Trigger reflow for animation
            chatWindow.offsetHeight;
            chatWindow.classList.add('visible');

            chatToggle.querySelector('.chat-icon').classList.add('hidden');
            chatToggle.querySelector('.close-icon').classList.remove('hidden');
            notificationBadge.classList.add('hidden');

            if (isFirstOpen) {
                isFirstOpen = false;
                setTimeout(() => {
                    addMessage(ELYSIVA_KB.mensajes.bienvenida, 'bot');
                }, 500);
            }

            setTimeout(() => chatInput.focus(), 350);
        } else {
            chatWindow.classList.remove('visible');
            chatToggle.querySelector('.chat-icon').classList.remove('hidden');
            chatToggle.querySelector('.close-icon').classList.add('hidden');
        }
    }

    function sendMessage() {
        const text = chatInput.value.trim();
        if (!text) return;

        addMessage(text, 'user');
        chatInput.value = '';

        showTyping();

        const delay = 800 + Math.random() * 700;
        setTimeout(() => {
            hideTyping();
            const response = generateResponse(text);
            addMessage(response, 'bot');

            const lastIntent = conversationHistory
                .filter(c => c.role === 'intent')
                .pop();
            updateQuickReplies(lastIntent ? lastIntent.name : 'default');
        }, delay);
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

    // Close chat when clicking outside (only on desktop)
    document.addEventListener('click', (e) => {
        if (isOpen &&
            !chatWindow.contains(e.target) &&
            !chatToggle.contains(e.target) &&
            window.innerWidth > 480) {
            toggleChat();
        }
    });

    // Keyboard shortcut: Escape to close
    document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && isOpen) {
            toggleChat();
        }
    });

})();
