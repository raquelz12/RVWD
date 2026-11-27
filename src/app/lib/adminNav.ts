// Navegación del panel de admin: una sola fuente para el header y la barra inferior.
import { UNREAD_INBOX_COUNT } from '@/app/admin/inbox/mockInbox';
import { PENDING_REPORTS_COUNT } from '@/app/admin/reports/mockReports';

export const isAdminPath = (pathname: string | null) =>
    !!pathname && (pathname === '/admin' || pathname.startsWith('/admin/'));

export const isActivePath = (pathname: string | null, href: string) =>
    !!pathname && (pathname === href || pathname.startsWith(`${href}/`));

export interface AdminNavLink {
    href: string;
    label: string;
    icon: string;
}

export const ADMIN_SETTINGS_LINK: AdminNavLink = { href: '/admin/settings', label: 'Ajustes', icon: 'icon-gear' };

export const ADMIN_LINKS: AdminNavLink[] = [
    { href: '/admin/dashboard', label: 'Dashboard', icon: 'icon-home' },
    { href: '/admin/users', label: 'Usuarios', icon: 'icon-users' },
    { href: '/admin/reports', label: 'Denuncias', icon: 'icon-flag' },
    { href: '/admin/content', label: 'Contenido', icon: 'icon-newspaper' },
    { href: '/admin/inbox', label: 'Bandeja', icon: 'icon-inbox' },
    { href: '/admin/stats', label: 'Estadísticas', icon: 'icon-chart' },
];

const byHref = (href: string) => ADMIN_LINKS.find((l) => l.href === href)!;

export const ADMIN_BOTTOM_LINKS: AdminNavLink[] = [
    { ...byHref('/admin/dashboard'), label: 'Inicio' },
    byHref('/admin/reports'),
    byHref('/admin/users'),
    byHref('/admin/inbox'),
];

export const ADMIN_MORE_LINKS: AdminNavLink[] = [
    byHref('/admin/content'),
    byHref('/admin/stats'),
    ADMIN_SETTINGS_LINK,
];

// TODO: con backend, vendrán de la API y se actualizarán al leer / resolver
export const ADMIN_BADGES = {
    pendingReports: PENDING_REPORTS_COUNT,
    unreadInbox: UNREAD_INBOX_COUNT,
};

export const getBadge = (href: string): { count?: number; dot?: boolean } | null => {
    if (href === '/admin/reports' && ADMIN_BADGES.pendingReports > 0) {
        return { count: ADMIN_BADGES.pendingReports };
    }
    if (href === '/admin/inbox' && ADMIN_BADGES.unreadInbox > 0) {
        return { dot: true };
    }
    return null;
};
