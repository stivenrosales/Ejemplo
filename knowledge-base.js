/**
 * Elysiva Knowledge Base
 * Contains all company information for the AI chatbot responses.
 */

const ELYSIVA_KB = {
    empresa: {
        nombre: "Elysiva",
        descripcion: "Empresa dedicada a la construcción y venta de inmuebles de alta calidad.",
        slogan: "Transformamos tu sueño en realidad",
        valores: [
            "Exclusividad en cada proyecto",
            "Tecnología de punta en construcción",
            "Materiales de alta calidad",
            "Diseño innovador y funcional",
            "Compromiso con nuestros clientes"
        ],
        web: "https://www.elysiva.org",
        email: "admin@elysiva.org",
        redes: {
            tiktok: "@elysiva_desarrolladora"
        }
    },

    proyectos: {
        jade: {
            nombre: "Proyecto Jade",
            estado: "En venta",
            descripcion: "Exclusivo proyecto residencial con acabados de primera calidad y diseño moderno.",
            unidades: [
                {
                    nombre: "Departamento 501",
                    habitaciones: 3,
                    banos: 3,
                    area: "162.30 m²",
                    caracteristicas: "Amplio departamento con vista privilegiada, acabados de lujo y distribución funcional."
                },
                {
                    nombre: "Departamento 502",
                    habitaciones: 3,
                    banos: 2,
                    area: "152.23 m²",
                    caracteristicas: "Departamento moderno con espacios amplios y diseño contemporáneo."
                }
            ]
        },
        rubi: {
            nombre: "Proyecto Rubí",
            estado: "En venta",
            descripcion: "Proyecto residencial ubicado en una zona de alto potencial de crecimiento.",
            unidades: [
                {
                    nombre: "Departamentos variados",
                    habitaciones: "2-3",
                    banos: "1-5",
                    area: "Desde 48.52 m² hasta 163 m²",
                    caracteristicas: "Diversas opciones de departamentos para adaptarse a distintas necesidades familiares."
                }
            ]
        }
    },

    servicios: [
        {
            nombre: "Construcción de Inmuebles",
            descripcion: "Construimos viviendas con los más altos estándares de calidad, utilizando materiales premium y tecnología de última generación."
        },
        {
            nombre: "Venta de Departamentos",
            descripcion: "Ofrecemos departamentos nuevos en proyectos exclusivos, con diferentes opciones de tamaño y distribución."
        },
        {
            nombre: "Asesoría Inmobiliaria",
            descripcion: "Te acompañamos en todo el proceso de compra, brindándote asesoría personalizada para encontrar el departamento ideal."
        },
        {
            nombre: "Separación de Departamentos",
            descripcion: "Puedes separar tu departamento de manera sencilla. Contáctanos para conocer los requisitos y el proceso."
        }
    ],

    ubicaciones: {
        principal: "Chorrillos, Palian",
        descripcion: "Nuestros proyectos están ubicados en zonas estratégicas con alto potencial de valorización."
    },

    faq: [
        {
            pregunta: "¿Cómo puedo separar un departamento?",
            respuesta: "Para separar tu departamento, puedes contactarnos a través de nuestro correo admin@elysiva.org o visitar nuestra web www.elysiva.org. Un asesor te guiará en todo el proceso."
        },
        {
            pregunta: "¿Ofrecen financiamiento?",
            respuesta: "Te recomendamos contactarnos directamente para conocer las opciones de financiamiento disponibles. Escríbenos a admin@elysiva.org para más información."
        },
        {
            pregunta: "¿Cuáles son las formas de pago?",
            respuesta: "Para conocer las formas de pago y planes de financiamiento disponibles, contáctanos a admin@elysiva.org y un asesor te brindará toda la información."
        },
        {
            pregunta: "¿Dónde están ubicados los proyectos?",
            respuesta: "Nuestros proyectos se encuentran en zonas estratégicas como Chorrillos y Palian, áreas con alto potencial de crecimiento y valorización inmobiliaria."
        },
        {
            pregunta: "¿Puedo visitar los proyectos?",
            respuesta: "¡Por supuesto! Agenda una visita contactándonos a admin@elysiva.org y con gusto te mostraremos nuestros proyectos disponibles."
        }
    ],

    mensajes: {
        bienvenida: "¡Hola! Bienvenido a Elysiva. Soy tu asistente virtual y estoy aquí para ayudarte a encontrar el departamento de tus sueños. ¿En qué puedo ayudarte?",
        despedida: "¡Gracias por tu interés en Elysiva! Si necesitas más información, no dudes en volver a escribirnos o contactarnos a admin@elysiva.org. ¡Que tengas un excelente día!",
        noEntendido: [
            "Disculpa, no estoy seguro de entender tu consulta. ¿Podrías reformularla? Puedo ayudarte con información sobre nuestros proyectos, servicios, ubicaciones o proceso de compra.",
            "No logré entender exactamente lo que necesitas. Puedo ayudarte con: proyectos disponibles, precios, ubicaciones, servicios o proceso de separación de departamento.",
            "Lo siento, no tengo información sobre eso. ¿Te gustaría saber sobre nuestros proyectos, servicios, o cómo contactarnos? También puedes escribir a admin@elysiva.org para consultas específicas."
        ],
        contacto: "Puedes contactarnos a través de:\n\n• Email: admin@elysiva.org\n• Web: www.elysiva.org\n• TikTok: @elysiva_desarrolladora\n\nNuestro equipo estará encantado de atenderte.",
        agradecimiento: "¡Gracias a ti por tu interés en Elysiva! Recuerda que estamos aquí para ayudarte en todo el proceso. ¿Hay algo más en lo que pueda asistirte?"
    }
};
