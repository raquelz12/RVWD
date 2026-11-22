// Filtros compartidos por los listados de admin.

export const DATE_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Últimos 7 días' },
    { value: 'month', label: 'Último mes' },
];

// Fecha de referencia de los datos de ejemplo (con datos reales será la fecha actual)
export const MOCK_TODAY = new Date('2026-11-21T12:00:00');
const DAY_MS = 24 * 60 * 60 * 1000;

const daysAgo = (iso: string) => (MOCK_TODAY.getTime() - new Date(`${iso}T12:00:00`).getTime()) / DAY_MS;

// iso: YYYY-MM-DD
export const matchesDate = (iso: string, filter: string) => {
    if (!filter) return true;
    const days = daysAgo(iso);
    if (filter === 'today') return days < 1;
    if (filter === 'week') return days < 7;
    if (filter === 'month') return days < 30;
    return true;
};

export const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
};

/** Fecha y hora ISO → "Hace 5 minutos" / "Hace 3 horas" durante las primeras 24 h; después, DD/MM/AAAA.
 *  `now` se pasa desde fuera (ms) para no leer la hora durante el prerender */
export const formatRelativeDate = (iso: string, now: number) => {
    const date = new Date(iso);
    const minutes = Math.floor((now - date.getTime()) / 60_000);
    if (minutes < 1) return 'Ahora mismo';
    if (minutes < 60) return `Hace ${minutes} ${minutes === 1 ? 'minuto' : 'minutos'}`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `Hace ${hours} ${hours === 1 ? 'hora' : 'horas'}`;
    const pad = (n: number) => String(n).padStart(2, '0');
    return formatDate(`${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`);
};

export const timeAgo =(days: number) => (days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`);
