// Datos de prueba de Contenido, compartidos por el listado y el detalle.
// Los ids de contenido y de denuncia coinciden con los de /admin/reports.

export type ContentStatus = 'Publicado' | 'Oculto' | 'Eliminado';
export type ContentReportStatus = 'En revisión' | 'Aplicada' | 'Descartada';
export type AuthorStatus = 'Activo' | 'Suspendido' | 'Baneado';

export interface ContentAuthor {
    id: string;
    name: string;
    username: string;
    avatar: string;
    status: AuthorStatus;
    sanctions: number;
}

export interface ContentReport {
    id: string;
    contentId: string;
    reporter: string;
    reporterId: string;
    reason: 'Spam' | 'Palabras inapropiadas' | 'Mal uso' | 'Acoso';
    status: ContentReportStatus;
    createdAt: string; // YYYY-MM-DD
}

export interface ModerationEntry {
    id: string;
    daysAgo: number;
    admin: string;
    action: string;
    note?: string;
}

interface ContentBase {
    id: string;
    type: 'RVW' | 'Comentario';
    // RVW: lo reseñado; comentario: lo reseñado en la RVW donde se comentó
    subject: string;
    subjectKind: 'Álbum' | 'Canción';
    subjectArtist: string;
    subjectHref: string;
    excerpt: string;
    text: string;
    authorId: string;
    status: ContentStatus;
    likes: number;
    createdAt: string; // YYYY-MM-DD
    edited?: boolean;
    // solo RVW
    title?: string;
    score?: number;
    commentsCount?: number; // calculado a partir de los comentarios con este reviewId
    // solo comentarios: la RVW donde está y, si es respuesta, a quién responde
    reviewId?: string;
    review?: { author: string; excerpt: string };
    replyTo?: { author: string; text: string };
    history: ModerationEntry[];
}

export interface AdminContent extends ContentBase {
    authorUsername: string;
    reports: number;
    pendingReports: number;
}

export const CURRENT_ADMIN = '@admin';

export const AUTHORS: Record<string, ContentAuthor> = {
    '1': { id: '1', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'Activo', sanctions: 2 },
    '2': { id: '2', name: 'Lucía Martín', username: '@lucia.music', avatar: '/placeholderCards.png', status: 'Activo', sanctions: 0 },
    '3': { id: '3', name: 'Marcos Gil', username: '@marcos_rvw', avatar: '/placeholderCards.png', status: 'Activo', sanctions: 1 },
    '4': { id: '4', name: 'Sara Vidal', username: '@sara.vinilos', avatar: '/placeholderCards.png', status: 'Activo', sanctions: 0 },
};

export const MOCK_CONTENT_REPORTS: ContentReport[] = [
    { id: '1', contentId: 'post123', reporter: '@quevedo.20', reporterId: '5', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-21' },
    { id: '7', contentId: 'post123', reporter: '@lucia.music', reporterId: '2', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-21' },
    { id: '8', contentId: 'post123', reporter: '@marcos_rvw', reporterId: '3', reason: 'Mal uso', status: 'Aplicada', createdAt: '2026-11-16' },
    { id: '9', contentId: 'post123', reporter: '@sara.vinilos', reporterId: '4', reason: 'Acoso', status: 'Descartada', createdAt: '2026-11-15' },
    { id: '2', contentId: 'post124', reporter: '@lucia.music', reporterId: '2', reason: 'Palabras inapropiadas', status: 'Descartada', createdAt: '2026-11-20' },
    { id: '3', contentId: 'post125', reporter: '@quevedo.20', reporterId: '5', reason: 'Palabras inapropiadas', status: 'Aplicada', createdAt: '2026-11-18' },
    { id: '10', contentId: 'post125', reporter: '@marcos_rvw', reporterId: '3', reason: 'Acoso', status: 'Aplicada', createdAt: '2026-11-18' },
    { id: '11', contentId: 'post125', reporter: '@sara.vinilos', reporterId: '4', reason: 'Palabras inapropiadas', status: 'Aplicada', createdAt: '2026-11-18' },
    { id: '4', contentId: 'post126', reporter: '@marcos_rvw', reporterId: '3', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-20' },
    { id: '12', contentId: 'post126', reporter: '@quevedo.20', reporterId: '5', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-19' },
    { id: '13', contentId: 'post126', reporter: '@sara.vinilos', reporterId: '4', reason: 'Mal uso', status: 'En revisión', createdAt: '2026-11-18' },
    { id: '14', contentId: 'post126', reporter: '@raquelz.12204', reporterId: '1', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-17' },
    { id: '15', contentId: 'post126', reporter: '@pablo.discos', reporterId: '6', reason: 'Spam', status: 'Aplicada', createdAt: '2026-11-16' },
    { id: '16', contentId: 'post126', reporter: '@ines_rvw', reporterId: '7', reason: 'Mal uso', status: 'Descartada', createdAt: '2026-11-16' },
    { id: '17', contentId: 'post126', reporter: '@leo.vinilo', reporterId: '8', reason: 'Acoso', status: 'Descartada', createdAt: '2026-11-15' },
    { id: '5', contentId: 'post127', reporter: '@lucia.music', reporterId: '2', reason: 'Spam', status: 'Aplicada', createdAt: '2026-11-03' },
    { id: '18', contentId: 'post127', reporter: '@quevedo.20', reporterId: '5', reason: 'Spam', status: 'Aplicada', createdAt: '2026-11-03' },
    { id: '6', contentId: 'post128', reporter: '@marcos_rvw', reporterId: '3', reason: 'Mal uso', status: 'En revisión', createdAt: '2026-11-01' },
    { id: '19', contentId: 'post128', reporter: '@quevedo.20', reporterId: '5', reason: 'Mal uso', status: 'Descartada', createdAt: '2026-10-30' },
];

const BASE_CONTENT: ContentBase[] = [
    {
        id: 'post123', type: 'Comentario', subject: 'Clarent', subjectKind: 'Álbum', subjectArtist: 'Clarent', subjectHref: '/album/1',
        reviewId: 'post128', review: { author: '@lucia.music', excerpt: 'No entiendo el hype, me parece un disco correcto sin más' },
        excerpt: 'Esto es spam, entra en mi perfil y gana seguidores gratis',
        text: 'Esto es spam, entra en mi perfil y gana seguidores gratis!! Sorteo cada semana, link en mi bio. Seguidme y os sigo de vuelta 🔥🔥',
        authorId: '1', status: 'Publicado', likes: 2, createdAt: '2026-11-21',
        history: [
            { id: 'h1', daysAgo: 5, admin: '@mod.ana', action: 'Sanción al autor: Lenguaje inapropiado', note: 'Comentario insultando a otro usuario en la reseña de Clarent.' },
        ],
    },
    {
        id: 'post124', type: 'RVW', subject: 'Clarent', subjectKind: 'Álbum', subjectArtist: 'Clarent', subjectHref: '/album/1',
        title: 'Una obra maestra', score: 9.2,
        excerpt: 'Un disco que no se parece a nada de lo anterior, y eso es lo mejor que tiene',
        text: 'Un disco que no se parece a nada de lo anterior, y eso es lo mejor que tiene. La primera mitad es casi perfecta: cada canción entra donde tiene que entrar y la producción deja respirar a la voz.\n\nLa segunda mitad baja un poco, pero el cierre lo compensa todo. De lo mejor del año sin duda.',
        authorId: '1', status: 'Publicado', likes: 1078, createdAt: '2026-11-20', edited: true,
        history: [],
    },
    {
        id: 'post125', type: 'Comentario', subject: 'Mañana será bonito', subjectKind: 'Álbum', subjectArtist: 'Karol G', subjectHref: '/album/2',
        reviewId: 'post131', review: { author: '@lucia.music', excerpt: 'Un disco muy disfrutable, aunque se hace largo' },
        replyTo: { author: '@lucia.music', text: 'Para mí es su mejor disco, aunque entiendo que no guste a todo el mundo.' },
        excerpt: 'Qué opinión más absurda, se nota que no tienes ni idea',
        text: 'Qué opinión más absurda, se nota que no tienes ni idea de música. Deja de escribir reseñas por favor.',
        authorId: '1', status: 'Oculto', likes: 0, createdAt: '2026-11-18',
        history: [
            { id: 'h2', daysAgo: 2, admin: '@mod.ana', action: '3 denuncias marcadas como aplicadas' },
            { id: 'h3', daysAgo: 2, admin: '@mod.ana', action: 'Ocultado', note: 'Falta de respeto directa a otra usuaria. Tres denuncias coinciden.' },
        ],
    },
    {
        id: 'post126', type: 'RVW', subject: 'Motomami', subjectKind: 'Álbum', subjectArtist: 'Rosalía', subjectHref: '/album/3',
        title: 'Arriesgado y redondo', score: 8.7,
        excerpt: 'La producción es arriesgada pero cada canción encuentra su sitio',
        text: 'La producción es arriesgada pero cada canción encuentra su sitio. Compra seguidores baratos en mi web, 100% reales, link en mi perfil.',
        authorId: '2', status: 'Publicado', likes: 345, createdAt: '2026-11-15',
        history: [],
    },
    {
        id: 'post127', type: 'RVW', subject: 'El mal querer', subjectKind: 'Álbum', subjectArtist: 'Rosalía', subjectHref: '/album/4',
        title: 'Sigue sonando actual', score: 9.5,
        excerpt: 'Cinco años después sigue sonando igual de actual',
        text: 'Cinco años después sigue sonando igual de actual. (Mismo texto publicado en 20 álbumes distintos.)',
        authorId: '3', status: 'Eliminado', likes: 234, createdAt: '2026-11-02',
        history: [
            { id: 'h4', daysAgo: 18, admin: CURRENT_ADMIN, action: '2 denuncias marcadas como aplicadas' },
            { id: 'h5', daysAgo: 18, admin: CURRENT_ADMIN, action: 'Eliminado', note: 'Texto copiado y pegado en 20 álbumes para posicionar el perfil.' },
        ],
    },
    {
        id: 'post128', type: 'RVW', subject: 'Clarent', subjectKind: 'Álbum', subjectArtist: 'Clarent', subjectHref: '/album/1',
        title: 'Correcto sin más', score: 5.5,
        excerpt: 'No entiendo el hype, me parece un disco correcto sin más',
        text: 'No entiendo el hype, me parece un disco correcto sin más. Tiene un par de buenos singles y el resto se olvida rápido.',
        authorId: '2', status: 'Publicado', likes: 89, createdAt: '2026-10-28',
        history: [],
    },
    {
        id: 'post129', type: 'Comentario', subject: 'Motomami', subjectKind: 'Álbum', subjectArtist: 'Rosalía', subjectHref: '/album/3',
        reviewId: 'post126', review: { author: '@lucia.music', excerpt: 'La producción es arriesgada pero cada canción encuentra su sitio' },
        excerpt: 'Totalmente de acuerdo con lo de la producción',
        text: 'Totalmente de acuerdo con lo de la producción, sobre todo en la segunda mitad.',
        authorId: '3', status: 'Publicado', likes: 12, createdAt: '2026-10-20',
        history: [],
    },
    {
        id: 'post130', type: 'RVW', subject: 'Un verano sin ti', subjectKind: 'Álbum', subjectArtist: 'Bad Bunny', subjectHref: '/album/5',
        title: 'Para el verano', score: 7.8,
        excerpt: 'Perfecto para el verano, aunque le sobran un par de canciones',
        text: 'Perfecto para el verano, aunque le sobran un par de canciones. Cuando acierta, acierta de lleno.',
        authorId: '4', status: 'Publicado', likes: 512, createdAt: '2026-09-30',
        history: [],
    },
    {
        id: 'post140', type: 'Comentario', subject: 'Clarent', subjectKind: 'Álbum', subjectArtist: 'Clarent', subjectHref: '/album/1',
        reviewId: 'post124', review: { author: '@raquelz.12204', excerpt: 'Un disco que no se parece a nada de lo anterior, y eso es lo mejor que tiene' },
        excerpt: 'La segunda mitad me parece de lo mejor del disco',
        text: 'La segunda mitad me parece de lo mejor del disco, no estoy de acuerdo en eso. Pero buena reseña.',
        authorId: '4', status: 'Publicado', likes: 31, createdAt: '2026-11-20',
        history: [],
    },
];

export const getContentReports = (contentId: string) =>
    MOCK_CONTENT_REPORTS.filter((r) => r.contentId === contentId);

export const MOCK_CONTENT: AdminContent[] = BASE_CONTENT.map((item) => {
    const reports = getContentReports(item.id);
    return {
        ...item,
        authorUsername: AUTHORS[item.authorId].username,
        reports: reports.length,
        pendingReports: reports.filter((r) => r.status === 'En revisión').length,
        commentsCount:
            item.type === 'RVW' ? BASE_CONTENT.filter((c) => c.reviewId === item.id).length : undefined,
    };
});

export const STATUS_CLASS: Record<ContentStatus, string> = {
    Publicado: 'status-published',
    Oculto: 'status-hidden',
    Eliminado: 'status-deleted',
};

export const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
};

// Enlace público: la RVW, o la RVW donde está el comentario
export const publicHref = (item: Pick<AdminContent, 'id' | 'type' | 'reviewId'>) =>
    item.type === 'RVW' ? `/reviews/${item.id}` : `/reviews/${item.reviewId}#comment-${item.id}`;
