// Datos de prueba de usuarios: los usan el listado y la ficha de admin.
// Mismos ids y handles que Contenido (que saca de aquí sus autores), Bandeja y Estadísticas.
import { addDays } from '@/app/lib/adminFilters';
import { MOCK_REPORTS } from '../reports/mockReports';

export type UserStatus = 'Activo' | 'Suspendido' | 'Baneado';
export type UserRole = 'Usuario' | 'Moderador' | 'Admin';

export interface UserSanction {
    id: string;
    daysAgo: number;
    reason: string;
    type: string;
    internalNote: string;
    /** Contenido por el que se sancionó; las que se ponen desde la ficha no tienen */
    contentId?: string;
}

export interface AdminUser {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    status: UserStatus;
    /** Fecha ISO en la que acaba la suspensión */
    suspendedUntil?: string;
    role: UserRole;
    rvwsCount: number;
    reportsReceived: number;
    reportsMade: number;
    /** Fechas ISO (YYYY-MM-DD) */
    createdAt: string;
    lastLogin: string;
    /** Sanciones activas, de la más reciente a la más antigua */
    sanctions: UserSanction[];
}

export const STATUS_CLASS: Record<UserStatus, string> = {
    Activo: 'status-activo',
    Suspendido: 'status-suspendido',
    Baneado: 'status-baneado',
};

const AVATAR = '/placeholderCards.png';

// Denuncias recibidas: las del listado de Denuncias para ese usuario
const reportsFor = (userId: string) => MOCK_REPORTS.filter((r) => r.userId === userId).length;

export const MOCK_USERS: AdminUser[] = [
    {
        id: '1', name: 'Raquel Arnaiz', username: '@raquelz.12204', email: 'raquel@email.com', avatar: AVATAR,
        status: 'Activo', role: 'Usuario', rvwsCount: 502, reportsReceived: reportsFor('1'), reportsMade: 1,
        createdAt: '2025-03-12', lastLogin: '2026-11-20',
        sanctions: [
            { id: 's2', daysAgo: 15, reason: 'Lenguaje inapropiado', type: 'Suspensión temporal (7 días)', internalNote: 'Reincidencia en hilo de discusión.' },
            { id: 's1', daysAgo: 40, reason: 'Spam', type: 'Aviso al usuario', internalNote: 'Enlaces a su canal en varias RVWs de Clarent.' },
        ],
    },
    {
        id: '2', name: 'Lucía Martín', username: '@lucia.music', email: 'lucia@email.com', avatar: AVATAR,
        status: 'Activo', role: 'Moderador', rvwsCount: 318, reportsReceived: reportsFor('2'), reportsMade: 4,
        createdAt: '2024-11-02', lastLogin: '2026-11-21', sanctions: [],
    },
    {
        id: '3', name: 'Marcos Gil', username: '@marcos_rvw', email: 'marcos@email.com', avatar: AVATAR,
        status: 'Activo', role: 'Usuario', rvwsCount: 127, reportsReceived: reportsFor('3'), reportsMade: 2,
        createdAt: '2025-06-21', lastLogin: '2026-11-18',
        sanctions: [
            { id: 's3', daysAgo: 19, reason: 'Spam', type: 'Aviso al usuario', internalNote: 'Mismo texto publicado en 20 álbumes.', contentId: 'post127' },
        ],
    },
    {
        id: '4', name: 'Sara Vidal', username: '@sara.vinilos', email: 'sara@rvwd.com', avatar: AVATAR,
        status: 'Activo', role: 'Admin', rvwsCount: 96, reportsReceived: reportsFor('4'), reportsMade: 0,
        createdAt: '2024-09-15', lastLogin: '2026-11-21', sanctions: [],
    },
    {
        id: '5', name: 'Quevedo', username: '@quevedo.20', email: 'quevedo@email.com', avatar: AVATAR,
        status: 'Suspendido', suspendedUntil: addDays(5), role: 'Usuario', rvwsCount: 41, reportsReceived: reportsFor('5'), reportsMade: 3,
        createdAt: '2025-10-08', lastLogin: '2026-11-19',
        sanctions: [
            { id: 's5', daysAgo: 2, reason: 'Acoso', type: 'Suspensión temporal (7 días)', internalNote: 'Mensajes repetidos a otro usuario tras un aviso.' },
            { id: 's4', daysAgo: 30, reason: 'Acoso', type: 'Aviso al usuario', internalNote: 'Respuestas ofensivas en comentarios.' },
        ],
    },
    {
        id: '6', name: 'Reseñas Gratis', username: '@resenas.gratis', email: 'promo@email.com', avatar: AVATAR,
        status: 'Baneado', role: 'Usuario', rvwsCount: 230, reportsReceived: reportsFor('6'), reportsMade: 0,
        createdAt: '2026-10-30', lastLogin: '2026-11-04',
        sanctions: [
            { id: 's8', daysAgo: 17, reason: 'Spam', type: 'Baneo (3 sanciones)', internalNote: 'Cuenta automatizada publicando el mismo texto.' },
            { id: 's7', daysAgo: 18, reason: 'Spam', type: 'Suspensión temporal (7 días)', internalNote: 'Sigue publicando enlaces de compra.' },
            { id: 's6', daysAgo: 20, reason: 'Spam', type: 'Aviso al usuario', internalNote: 'Enlaces a una web de seguidores.' },
        ],
    },
];
