// Datos de prueba de Denuncias: la única lista de denuncias del panel.
// La usan el listado y el detalle de Denuncias, Contenido (MOCK_CONTENT_REPORTS),
// Usuarios (denuncias recibidas), el dashboard y el contador del menú.
// El usuario denunciado (userId) es el autor del contenido en mockContent.ts, y
// los ids de usuario (userId, reporterId) son los de mockUsers.ts.

export type ReportStatus = 'En revisión' | 'Aplicada' | 'Descartada';
export type ReportReason = 'Spam' | 'Palabras inapropiadas' | 'Mal uso' | 'Acoso';
export type ReportContentType = 'Comentario' | 'RVW' | 'Perfil';

export interface AdminReport {
    id: string;
    /** Contenido denunciado (en un perfil no se usa: se enlaza a la ficha del usuario) */
    contentId: string;
    contentType: ReportContentType;
    /** Usuario denunciado */
    userId: string;
    /** Usuario que denuncia */
    reporterId: string;
    reason: ReportReason;
    status: ReportStatus;
    createdAt: string; // YYYY-MM-DD
    /** El admin ya la ha abierto. TODO: con backend, se guardará por admin en el servidor */
    seen: boolean;
}

export const REPORT_STATUS_CLASS: Record<ReportStatus, string> = {
    'En revisión': 'status-en-revision',
    Aplicada: 'status-aplicada',
    Descartada: 'status-descartada',
};

// De la más reciente a la más antigua
export const MOCK_REPORTS: AdminReport[] = [
    { id: '1', contentId: 'post123', contentType: 'Comentario', userId: '1', reporterId: '5', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-21', seen: false },
    { id: '7', contentId: 'post123', contentType: 'Comentario', userId: '1', reporterId: '2', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-21', seen: false },
    { id: '2', contentId: 'post124', contentType: 'RVW', userId: '1', reporterId: '2', reason: 'Palabras inapropiadas', status: 'Descartada', createdAt: '2026-11-20', seen: true },
    { id: '4', contentId: 'post126', contentType: 'RVW', userId: '2', reporterId: '3', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-20', seen: true },
    { id: '12', contentId: 'post126', contentType: 'RVW', userId: '2', reporterId: '5', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-19', seen: false },
    { id: '3', contentId: 'post125', contentType: 'Comentario', userId: '1', reporterId: '5', reason: 'Palabras inapropiadas', status: 'Aplicada', createdAt: '2026-11-18', seen: true },
    { id: '10', contentId: 'post125', contentType: 'Comentario', userId: '1', reporterId: '3', reason: 'Acoso', status: 'Aplicada', createdAt: '2026-11-18', seen: true },
    { id: '11', contentId: 'post125', contentType: 'Comentario', userId: '1', reporterId: '4', reason: 'Palabras inapropiadas', status: 'Aplicada', createdAt: '2026-11-18', seen: true },
    { id: '13', contentId: 'post126', contentType: 'RVW', userId: '2', reporterId: '4', reason: 'Mal uso', status: 'En revisión', createdAt: '2026-11-18', seen: true },
    { id: '14', contentId: 'post126', contentType: 'RVW', userId: '2', reporterId: '1', reason: 'Spam', status: 'En revisión', createdAt: '2026-11-17', seen: true },
    { id: '8', contentId: 'post123', contentType: 'Comentario', userId: '1', reporterId: '3', reason: 'Mal uso', status: 'Aplicada', createdAt: '2026-11-16', seen: true },
    { id: '15', contentId: 'post126', contentType: 'RVW', userId: '2', reporterId: '6', reason: 'Spam', status: 'Aplicada', createdAt: '2026-11-16', seen: true },
    { id: '9', contentId: 'post123', contentType: 'Comentario', userId: '1', reporterId: '4', reason: 'Acoso', status: 'Descartada', createdAt: '2026-11-15', seen: true },
    { id: '5', contentId: 'post127', contentType: 'RVW', userId: '3', reporterId: '2', reason: 'Spam', status: 'Aplicada', createdAt: '2026-11-03', seen: true },
    { id: '16', contentId: 'post127', contentType: 'RVW', userId: '3', reporterId: '5', reason: 'Spam', status: 'Aplicada', createdAt: '2026-11-03', seen: true },
    { id: '6', contentId: 'post128', contentType: 'RVW', userId: '2', reporterId: '3', reason: 'Mal uso', status: 'En revisión', createdAt: '2026-11-01', seen: true },
    { id: '17', contentId: 'post128', contentType: 'RVW', userId: '2', reporterId: '5', reason: 'Mal uso', status: 'Descartada', createdAt: '2026-10-30', seen: true },
];

export const PENDING_REPORTS_COUNT = MOCK_REPORTS.filter((r) => r.status === 'En revisión').length;

/** Dónde está lo denunciado: el contenido en admin o, si es un perfil, la ficha del usuario */
export const reportContentHref = (report: Pick<AdminReport, 'contentType' | 'contentId' | 'userId'>) =>
    report.contentType === 'Perfil' ? `/admin/users/${report.userId}` : `/admin/content/${encodeURIComponent(report.contentId)}`;
