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
