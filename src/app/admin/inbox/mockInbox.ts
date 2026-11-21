// Datos de prueba de la Bandeja: mensajes de /contact y sugerencias de /suggestions.

export type InboxType = 'contact' | 'suggestion';

export const CONTACT_STATUSES = ['Recibido', 'En curso', 'Resuelto', 'Descartado'] as const;
export const SUGGESTION_STATUSES = ['Recibida', 'En estudio', 'En desarrollo', 'Implementada', 'Descartada'] as const;

export type ContactStatus = (typeof CONTACT_STATUSES)[number];
export type SuggestionStatus = (typeof SUGGESTION_STATUSES)[number];
export type InboxStatus = ContactStatus | SuggestionStatus;

// Los que todavía hay que atender (filtro "Abiertos", el de por defecto)
const OPEN_STATUSES: InboxStatus[] = ['Recibido', 'En curso', 'Recibida', 'En estudio', 'En desarrollo'];
const DONE_STATUSES: InboxStatus[] = ['Resuelto', 'Implementada'];
const DISMISSED_STATUSES: InboxStatus[] = ['Descartado', 'Descartada'];

export const isOpen = (status: InboxStatus) => OPEN_STATUSES.includes(status);
export const isDone = (status: InboxStatus) => DONE_STATUSES.includes(status);
export const isDismissed = (status: InboxStatus) => DISMISSED_STATUSES.includes(status);

export const statusesFor = (type: InboxType): readonly InboxStatus[] =>
    type === 'contact' ? CONTACT_STATUSES : SUGGESTION_STATUSES;

// Mismas opciones que los formularios públicos
export const CONTACT_REASONS = ['Duda', 'Problema con mi cuenta', 'Colaboración', 'Queja', 'Otra'];
export const SUGGESTION_CATEGORIES = ['Mejora', 'Nueva funcionalidad', 'Error', 'Otra'];

export const TYPE_LABEL: Record<InboxType, string> = {
    contact: 'Contacto',
    suggestion: 'Sugerencia',
};

export interface InboxMessage {
    id: string;
    type: InboxType;
    // las sugerencias no piden nombre
    name?: string;
    email: string;
    // si el email es de un usuario registrado
    user?: { id: string; username: string; avatar: string };
    // motivo (contacto) o categoría (sugerencia)
    category: string;
    message: string;
    status: InboxStatus;
    read: boolean;
    createdAt: string; // YYYY-MM-DD
}

const RAQUEL = { id: '1', username: '@raquelz.12204', avatar: '/placeholderCards.png' };
const LUCIA = { id: '2', username: '@lucia.music', avatar: '/placeholderCards.png' };
const MARCOS = { id: '3', username: '@marcos_rvw', avatar: '/placeholderCards.png' };

export const MOCK_INBOX: InboxMessage[] = [
    { id: 'c1', type: 'contact', name: 'Raquel Arnaiz', email: 'raquel@email.com', user: RAQUEL, category: 'Problema con mi cuenta', message: 'No puedo cambiar mi nombre de usuario, me sale un error al guardar desde ajustes.', status: 'Recibido', read: false, createdAt: '2026-11-21' },
    { id: 's1', type: 'suggestion', email: 'lucia@email.com', user: LUCIA, category: 'Nueva funcionalidad', message: 'Estaría genial poder crear listas de álbumes favoritos y compartirlas con otros usuarios.', status: 'Recibida', read: false, createdAt: '2026-11-21' },
    { id: 'c2', type: 'contact', name: 'Pablo Ruiz', email: 'pablo.ruiz@discografica.com', category: 'Colaboración', message: 'Hola, somos una discográfica independiente y nos gustaría colaborar con vosotros en el lanzamiento de un disco.', status: 'Recibido', read: false, createdAt: '2026-11-20' },
    { id: 's2', type: 'suggestion', email: 'marcos@email.com', user: MARCOS, category: 'Error', message: 'En el móvil, al abrir los comentarios de una RVW el teclado tapa el cuadro de texto.', status: 'En estudio', read: false, createdAt: '2026-11-19' },
    { id: 's3', type: 'suggestion', email: 'anonimo123@email.com', category: 'Mejora', message: 'Que se pueda ordenar el feed por fecha además de por relevancia.', status: 'Recibida', read: false, createdAt: '2026-11-19' },
    { id: 'c3', type: 'contact', name: 'Ana López', email: 'ana.lopez@email.com', category: 'Duda', message: '¿Cómo se calcula la nota RVWD de un álbum? ¿Cuentan igual todas las reseñas?', status: 'En curso', read: true, createdAt: '2026-11-18' },
    { id: 'c4', type: 'contact', name: 'Raquel Arnaiz', email: 'raquel@email.com', user: RAQUEL, category: 'Queja', message: 'Me han ocultado un comentario y no entiendo el motivo, no he insultado a nadie.', status: 'En curso', read: true, createdAt: '2026-11-17' },
    { id: 's4', type: 'suggestion', email: 'lucia@email.com', user: LUCIA, category: 'Mejora', message: 'Modo claro para la web, a veces de día cuesta leer.', status: 'En desarrollo', read: true, createdAt: '2026-11-12' },
    { id: 'c5', type: 'contact', name: 'Empresa SEO', email: 'ventas@seo-rapido.biz', category: 'Otra', message: 'Posicionamos tu web en el primer puesto de Google en 7 días. Precios imbatibles.', status: 'Descartado', read: true, createdAt: '2026-11-10' },
    { id: 's5', type: 'suggestion', email: 'sara@email.com', category: 'Nueva funcionalidad', message: 'Poder seguir a artistas y recibir aviso cuando saquen algo nuevo.', status: 'Implementada', read: true, createdAt: '2026-10-30' },
    { id: 'c6', type: 'contact', name: 'Leo Martín', email: 'leo.martin@email.com', category: 'Problema con mi cuenta', message: 'No me llega el correo para recuperar la contraseña.', status: 'Resuelto', read: true, createdAt: '2026-10-25' },
    { id: 's6', type: 'suggestion', email: 'ines@email.com', category: 'Otra', message: 'Añadir podcasts además de música.', status: 'Descartada', read: true, createdAt: '2026-10-20' },
];

export const UNREAD_INBOX_COUNT = MOCK_INBOX.filter((m) => !m.read).length;

// ---------- Detalle: hilo de respuestas y actividad ----------

export const CURRENT_ADMIN = '@admin';

export interface InboxReply {
    id: string;
    admin: string;
    daysAgo: number;
    text: string;
}

// Notas internas y cambios (estado, respuestas) en una sola línea de tiempo
export interface InboxActivity {
    id: string;
    kind: 'note' | 'event';
    admin: string;
    daysAgo: number;
    text: string;
}

export interface InboxThread {
    replies: InboxReply[];
    activity: InboxActivity[];
}

export const MOCK_THREADS: Record<string, InboxThread> = {
    c3: {
        replies: [
            { id: 'r1', admin: '@mod.ana', daysAgo: 2, text: 'Hola Ana,\n\nLa nota RVWD es la media de todas las reseñas, pero las de usuarios con menos de 5 reseñas cuentan la mitad para evitar abusos.\n\nUn saludo,\nEl equipo de RVWD' },
        ],
        activity: [
            { id: 'a1', kind: 'event', admin: '@mod.ana', daysAgo: 2, text: 'Respuesta enviada · Recibido → En curso' },
            { id: 'a2', kind: 'note', admin: '@mod.ana', daysAgo: 2, text: 'Si pregunta por el peso exacto, pasárselo a Raquel, que lleva el cálculo.' },
        ],
    },
    c4: {
        replies: [
            { id: 'r2', admin: CURRENT_ADMIN, daysAgo: 3, text: 'Hola Raquel,\n\nEstamos revisando el caso y te respondemos en cuanto lo tengamos.\n\nUn saludo,\nEl equipo de RVWD' },
        ],
        activity: [
            { id: 'a3', kind: 'note', admin: CURRENT_ADMIN, daysAgo: 3, text: 'Es el comentario post125, ocultado por @mod.ana por falta de respeto. Tiene 3 denuncias aplicadas.' },
            { id: 'a4', kind: 'event', admin: CURRENT_ADMIN, daysAgo: 3, text: 'Respuesta enviada · Recibido → En curso' },
        ],
    },
    s4: {
        replies: [],
        activity: [
            { id: 'a5', kind: 'event', admin: CURRENT_ADMIN, daysAgo: 4, text: 'Estado: En estudio → En desarrollo' },
            { id: 'a6', kind: 'note', admin: CURRENT_ADMIN, daysAgo: 4, text: 'Se hará junto con el rediseño de ajustes (issue #42).' },
            { id: 'a7', kind: 'event', admin: '@mod.ana', daysAgo: 8, text: 'Estado: Recibida → En estudio' },
        ],
    },
    c6: {
        replies: [
            { id: 'r3', admin: '@mod.ana', daysAgo: 26, text: 'Hola Leo,\n\nEra un problema con el proveedor de correo, ya está solucionado. Prueba de nuevo y nos dices.\n\nUn saludo,\nEl equipo de RVWD' },
        ],
        activity: [
            { id: 'a8', kind: 'event', admin: '@mod.ana', daysAgo: 26, text: 'Respuesta enviada · Recibido → Resuelto' },
        ],
    },
    s5: {
        replies: [
            { id: 'r4', admin: CURRENT_ADMIN, daysAgo: 5, text: '¡Hola!\n\nYa puedes seguir a artistas desde su página. Gracias por la idea.\n\nUn saludo,\nEl equipo de RVWD' },
        ],
        activity: [
            { id: 'a9', kind: 'event', admin: CURRENT_ADMIN, daysAgo: 5, text: 'Respuesta enviada · En desarrollo → Implementada' },
        ],
    },
};

export const getThread = (id: string): InboxThread => MOCK_THREADS[id] ?? { replies: [], activity: [] };

// Plantillas de respuesta rápida (el saludo y la firma se añaden aparte)
export const REPLY_TEMPLATES: Record<InboxType, { value: string; label: string; text: string }[]> = {
    contact: [
        { value: 'thanks', label: 'Gracias por escribir', text: 'Gracias por escribirnos. Hemos recibido tu mensaje y lo estamos revisando; te respondemos lo antes posible.' },
        { value: 'more-info', label: 'Pedir más información', text: 'Para poder ayudarte necesitamos un poco más de información: ¿podrías indicarnos tu nombre de usuario y, si puedes, una captura del problema?' },
        { value: 'solved', label: 'Problema resuelto', text: 'Ya hemos solucionado el problema. Prueba de nuevo y, si sigue pasando, responde a este correo.' },
        { value: 'collab', label: 'Colaboración: lo estudiamos', text: 'Gracias por tu propuesta de colaboración. La estudiaremos con el equipo y te diremos algo en los próximos días.' },
    ],
    suggestion: [
        { value: 'thanks', label: 'Gracias, la estudiaremos', text: 'Gracias por tu sugerencia. La hemos apuntado y la estudiaremos con el equipo.' },
        { value: 'in-progress', label: 'Ya está en desarrollo', text: 'Buenas noticias: tu sugerencia ya está en desarrollo. Te avisaremos cuando esté disponible.' },
        { value: 'done', label: 'Ya está disponible', text: 'Tu sugerencia ya está disponible en la web. ¡Gracias por la idea!' },
        { value: 'declined', label: 'No encaja por ahora', text: 'Gracias por tu sugerencia. Por ahora no encaja en lo que tenemos planeado, pero la tendremos en cuenta más adelante.' },
    ],
};

export const REPLY_SIGNATURE = 'Un saludo,\nEl equipo de RVWD';

// Al responder, un mensaje nuevo pasa a "en marcha"
export const statusAfterReply = (status: InboxStatus): InboxStatus =>
    status === 'Recibido' ? 'En curso' : status === 'Recibida' ? 'En estudio' : status;

// Clase de color del estado (nuevo, en marcha, terminado, descartado)
export const statusClass = (status: InboxStatus) =>
    isOpen(status)
        ? status === 'Recibido' || status === 'Recibida'
            ? 'is-new'
            : 'is-progress'
        : isDone(status)
          ? 'is-done'
          : 'is-dismissed';
