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
