// Datos de prueba del listado de Denuncias (también los usa el dashboard).
// TODO: el detalle (reports/[id]) aún tiene su propio mock con los mismos ids.

export interface AdminReport {
    id: string;
    userId: string;
    contentId: string;
    name: string;
    username: string;
    avatar: string;
    status: 'En revisión' | 'Descartada' | 'Suspendido' | 'Aplicada';
    reason: 'Spam' | 'Palabras inapropiadas' | 'Mal uso' | 'Acoso';
    sanctions: number;
    contentType: 'Comentario' | 'RVW' | 'Perfil';
    createdAt: string; // YYYY-MM-DD
}

export const MOCK_REPORTS: AdminReport[] = [
    { id: '1', userId: '1', contentId: 'post123', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'En revisión', reason: 'Spam', sanctions: 2, contentType: 'Comentario', createdAt: '2026-11-21' },
    { id: '2', userId: '1', contentId: 'post124', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'Descartada', reason: 'Palabras inapropiadas', sanctions: 2, contentType: 'RVW', createdAt: '2026-11-20' },
    { id: '3', userId: '1', contentId: 'post125', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'Suspendido', reason: 'Mal uso', sanctions: 2, contentType: 'Comentario', createdAt: '2026-11-18' },
    { id: '4', userId: '1', contentId: 'post126', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'En revisión', reason: 'Spam', sanctions: 2, contentType: 'RVW', createdAt: '2026-11-19' },
    { id: '5', userId: '1', contentId: 'post127', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'Aplicada', reason: 'Spam', sanctions: 2, contentType: 'RVW', createdAt: '2026-11-10' },
    { id: '6', userId: '1', contentId: 'post128', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'En revisión', reason: 'Mal uso', sanctions: 2, contentType: 'RVW', createdAt: '2026-11-16' },
];
