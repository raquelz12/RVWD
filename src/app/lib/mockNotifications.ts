// Notificaciones de prueba: las usan la página /notifications y el desplegable de la campana

export type NotificationKind = 'comment' | 'fav-comment' | 'fav-review';

export interface MockNotification {
    id: number;
    user: string;
    /** Fecha y hora ISO: se enseña con formatRelativeDate */
    date: string;
    kind: NotificationKind;
    /** Título de la reseña de la que habla */
    reviewTitle: string;
    /** Reseña de la que habla */
    href: string;
    read: boolean;
}

export interface MockFollowRequest {
    id: number;
    user: string;
    date: string;
    read: boolean;
}

// Las recientes son también las que enseña el desplegable de la campana
export const recentNotifications: MockNotification[] = [
    { id: 1, user: '@raquelz.12204', date: '2026-11-23T09:55:00', kind: 'comment', reviewTitle: 'No pasa nada hombre.', href: '/reviews/123', read: false },
    { id: 2, user: '@clarent', date: '2026-11-23T09:00:00', kind: 'fav-comment', reviewTitle: 'No pasa nada hombre.', href: '/reviews/123', read: false },
    { id: 3, user: '@juanp', date: '2026-11-23T08:00:00', kind: 'fav-review', reviewTitle: 'No pasa nada hombre.', href: '/reviews/123', read: true },
];

export const olderNotifications: MockNotification[] = [
    { id: 4, user: '@raquelz.12204', date: '2026-09-12T18:20:00', kind: 'comment', reviewTitle: 'No pasa nada hombre.', href: '/reviews/123', read: true },
    { id: 5, user: '@clarent', date: '2026-09-03T11:45:00', kind: 'fav-review', reviewTitle: 'No pasa nada hombre.', href: '/reviews/123', read: true },
    { id: 6, user: '@juanp', date: '2026-08-28T22:10:00', kind: 'comment', reviewTitle: 'No pasa nada hombre.', href: '/reviews/123', read: true },
];

export const followRequests: MockFollowRequest[] = [
    { id: 7, user: '@raquelz.12204', date: '2026-11-23T09:00:00', read: false },
    { id: 8, user: '@clarent', date: '2026-11-22T17:30:00', read: false },
    { id: 9, user: '@juanp', date: '2026-11-20T12:00:00', read: true },
];
