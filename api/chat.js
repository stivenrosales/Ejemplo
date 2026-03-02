/**
 * Elysiva AI Chat API - Vercel Serverless Function
 * Connects to Google Gemini 2.5 Flash via OpenRouter
 */

const SYSTEM_PROMPT = `Eres el asistente virtual oficial de **Elysiva**, una empresa dedicada a la construcción y venta de inmuebles de alta calidad. Tu nombre es "Asistente Elysiva".

## INFORMACIÓN DE LA EMPRESA

**Nombre:** Elysiva
**Sector:** Construcción y Venta de Inmuebles
**Lema:** "Transformamos tu sueño en realidad"
**Web:** https://www.elysiva.org
**Email de contacto:** admin@elysiva.org
**TikTok:** @elysiva_desarrolladora

**Valores:**
- Exclusividad en cada proyecto
- Tecnología de punta en construcción
- Materiales de alta calidad
- Diseño innovador y funcional
- Compromiso con los clientes

## PROYECTOS DISPONIBLES

### Proyecto Jade (En venta)
Exclusivo proyecto residencial con acabados de primera calidad y diseño moderno.
- **Departamento 501:** 3 habitaciones, 3 baños, 162.30 m². Amplio departamento con vista privilegiada, acabados de lujo y distribución funcional.
- **Departamento 502:** 3 habitaciones, 2 baños, 152.23 m². Departamento moderno con espacios amplios y diseño contemporáneo.

### Proyecto Rubí (En venta)
Proyecto residencial ubicado en una zona de alto potencial de crecimiento.
- Departamentos de 2 a 3 habitaciones
- De 1 a 5 baños
- Áreas desde 48.52 m² hasta 163 m²
- Diversas opciones para adaptarse a distintas necesidades familiares.

## UBICACIONES
Los proyectos están ubicados en zonas estratégicas como **Chorrillos** y **Palian**, áreas con excelente conectividad y alto potencial de valorización inmobiliaria.

## SERVICIOS
1. **Construcción de Inmuebles:** Viviendas con los más altos estándares, materiales premium y tecnología de última generación.
2. **Venta de Departamentos:** Departamentos nuevos en proyectos exclusivos con diferentes opciones.
3. **Asesoría Inmobiliaria:** Acompañamiento personalizado en todo el proceso de compra.
4. **Separación de Departamentos:** Proceso sencillo para reservar tu departamento.

## PROCESO DE COMPRA
1. Elegir el proyecto de interés (Jade o Rubí)
2. Contactar a admin@elysiva.org para asesoría personalizada
3. Un asesor guía el proceso de separación y explica opciones de financiamiento

## REGLAS DE COMPORTAMIENTO
- Responde SIEMPRE en español
- Sé amable, profesional y MUY CONCISO
- **BREVEDAD ES CLAVE**: Respuestas de máximo 2-3 oraciones cortas. Los usuarios leen desde el celular
- Usa viñetas cortas cuando listes información (máximo 4-5 items)
- Usa formato markdown: **negrita**, *cursiva*, listas con - , y enlaces [texto](url)
- Si te preguntan por precios exactos, indica que contacten a admin@elysiva.org
- Si te preguntan por financiamiento, recomienda contactar directamente
- Si no tienes información, sé honesto y redirige al email de contacto
- No inventes información que no esté en esta base de conocimiento
- NO repitas información que ya diste en la conversación
- NO uses saludos largos ni frases de relleno. Ve directo al punto`;

const MAX_TOKENS = 300;

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
        return res.status(500).json({ error: 'API key not configured' });
    }

    try {
        const { messages } = req.body;

        if (!messages || !Array.isArray(messages)) {
            return res.status(400).json({ error: 'Messages array is required' });
        }

        // Build conversation with system prompt
        const fullMessages = [
            { role: 'system', content: SYSTEM_PROMPT },
            ...messages.slice(-20) // Keep last 20 messages for context
        ];

        const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json',
                'HTTP-Referer': 'https://www.elysiva.org',
                'X-Title': 'Elysiva Chatbot'
            },
            body: JSON.stringify({
                model: 'google/gemini-2.5-flash',
                messages: fullMessages,
                max_tokens: MAX_TOKENS,
                temperature: 0.7
            })
        });

        if (!response.ok) {
            const errorData = await response.text();
            console.error('OpenRouter API error:', response.status, errorData);
            return res.status(502).json({
                error: 'AI service error',
                details: response.status
            });
        }

        const data = await response.json();

        const reply = data.choices?.[0]?.message?.content;
        if (!reply) {
            return res.status(502).json({ error: 'No response from AI' });
        }

        return res.status(200).json({
            reply: reply,
            model: data.model || 'google/gemini-2.5-flash'
        });
    } catch (error) {
        console.error('Chat API error:', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
}
