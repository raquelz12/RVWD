// Datos de prueba de Estadísticas. Se generan con una semilla fija para que
// cada periodo dé siempre los mismos números (y el periodo anterior, para comparar).
import { MOCK_TODAY } from '@/app/lib/adminFilters';

export type Period = '7d' | '30d' | '90d' | '12m';

export const PERIODS: { value: Period; label: string; previous: string }[] = [
    { value: '7d', label: '7 días', previous: 'la semana anterior' },
    { value: '30d', label: '30 días', previous: 'los 30 días anteriores' },
    { value: '90d', label: '90 días', previous: 'los 90 días anteriores' },
    { value: '12m', label: '12 meses', previous: 'los 12 meses anteriores' },
];

export const DEFAULT_PERIOD: Period = '30d';

export const isPeriod = (value: string | null): value is Period => PERIODS.some((p) => p.value === value);

// 7 y 30 días: un punto por día; 90 días: por semana; 12 meses: por mes
const POINTS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 13, '12m': 12 };
const DAYS_PER_POINT: Record<Period, number> = { '7d': 1, '30d': 1, '90d': 7, '12m': 30 };
const PERIOD_DAYS: Record<Period, number> = { '7d': 7, '30d': 30, '90d': 91, '12m': 365 };

const WEEKDAYS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MONTHS = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const DAY_MS = 24 * 60 * 60 * 1000;

export const periodLabels = (period: Period): string[] =>
    Array.from({ length: POINTS[period] }, (_, i) => {
        const back = POINTS[period] - 1 - i;
        if (period === '12m') {
            const d = new Date(MOCK_TODAY.getFullYear(), MOCK_TODAY.getMonth() - back, 1);
            return MONTHS[d.getMonth()];
        }
        const d = new Date(MOCK_TODAY.getTime() - back * DAYS_PER_POINT[period] * DAY_MS);
        if (period === '7d') return WEEKDAYS[d.getDay()];
        return `${d.getDate()}/${d.getMonth() + 1}`;
    });

// Generador pseudoaleatorio con semilla (mulberry32)
const seeded = (key: string) => {
    let h = 1779033703 ^ key.length;
    for (let i = 0; i < key.length; i++) {
        h = Math.imul(h ^ key.charCodeAt(i), 3432918353);
        h = (h << 13) | (h >>> 19);
    }
    let a = h >>> 0;
    return () => {
        a = (a + 0x6d2b79f5) | 0;
        let t = Math.imul(a ^ (a >>> 15), 1 | a);
        t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
        return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
};

export interface Metric {
    values: number[];
    previous: number[];
    total: number;
    previousTotal: number;
}

/** Serie de un valor diario (perDay) con algo de tendencia y ruido. */
const metric = (key: string, period: Period, perDay: number, growth = 0.15): Metric => {
    const build = (seedKey: string, factor: number) => {
        const rand = seeded(`${seedKey}-${period}`);
        const n = POINTS[period];
        return Array.from({ length: n }, (_, i) => {
            const trend = 1 + growth * (i / Math.max(1, n - 1) - 0.5);
            const noise = 0.65 + rand() * 0.7;
            return Math.max(0, Math.round(perDay * DAYS_PER_POINT[period] * trend * noise * factor));
        });
    };
    const values = build(key, 1);
    const previous = build(`${key}-prev`, 1 - growth * 0.8);
    const sum = (list: number[]) => list.reduce((a, b) => a + b, 0);
    return { values, previous, total: sum(values), previousTotal: sum(previous) };
};

/** Valor medio (nota, horas, %) con su valor del periodo anterior. */
const average = (key: string, period: Period, base: number, spread: number, decimals = 1) => {
    const rand = seeded(`${key}-${period}`);
    const round = (n: number) => Number(n.toFixed(decimals));
    const values = Array.from({ length: POINTS[period] }, () => round(base + (rand() - 0.5) * spread));
    return {
        values,
        total: round(values.reduce((a, b) => a + b, 0) / values.length),
        previousTotal: round(base + (rand() - 0.3) * spread),
    };
};

// Rankings: se escalan con la duración del periodo
const scaled = (period: Period, items: { label: string; value: number; href?: string; sub?: string }[]) => {
    const factor = PERIOD_DAYS[period] / 30;
    return items.map((item) => ({ ...item, value: Math.max(1, Math.round(item.value * factor)) }));
};

export const getStats = (period: Period) => {
    const labels = periodLabels(period);

    const newUsers = metric('new-users', period, 9, 0.3);
    const activeUsers = metric('active-users', period, 140, 0.2);
    const rvws = metric('rvws', period, 38, 0.25);
    const comments = metric('comments', period, 95, 0.2);
    const likes = metric('likes', period, 610, 0.25);
    const reportsIn = metric('reports-in', period, 4, -0.1);
    const reportsDone = metric('reports-done', period, 3.8, 0.1);
    const sanctions = metric('sanctions', period, 0.9, -0.15);
    const contact = metric('contact', period, 1.6, 0.05);
    const suggestions = metric('suggestions', period, 1.1, 0.2);
    const albumReviews = metric('album-reviews', period, 29, 0.25);
    const songReviews = metric('song-reviews', period, 9, 0.35);

    const totalUsers = 4820;

    return {
        labels,
        community: {
            totalUsers: { total: totalUsers, previousTotal: totalUsers - newUsers.total, values: newUsers.values.map((_, i) => totalUsers - newUsers.values.slice(i + 1).reduce((a, b) => a + b, 0)) },
            newUsers,
            // usuarios activos medios por día del periodo
            activeUsers: { ...activeUsers, total: Math.round(activeUsers.total / PERIOD_DAYS[period]), previousTotal: Math.round(activeUsers.previousTotal / PERIOD_DAYS[period]) },
            retention: average('retention', period, 41, 6, 0),
        },
        content: {
            rvws,
            comments,
            likes,
            averageScore: average('avg-score', period, 7.3, 0.6),
            // RVWs con cada nota, de 0 a 10
            scoreDistribution: [2, 3, 5, 9, 16, 31, 58, 104, 141, 96, 47].map((v, score) => ({
                label: String(score),
                value: Math.round(v * (PERIOD_DAYS[period] / 30)),
            })),
            topReviews: scaled(period, [
                { label: '«Una obra maestra»', sub: 'Clarent · @raquelz.12204', value: 312, href: '/admin/content/post124' },
                { label: '«Para el verano»', sub: 'Un verano sin ti · @sara.vinilos', value: 168, href: '/admin/content/post130' },
                { label: '«Arriesgado y redondo»', sub: 'Motomami · @lucia.music', value: 121, href: '/admin/content/post126' },
                { label: '«Correcto sin más»', sub: 'Clarent · @lucia.music', value: 33, href: '/admin/content/post128' },
            ]),
            topUsers: scaled(period, [
                { label: '@lucia.music', sub: 'Lucía Martín', value: 23, href: '/admin/users/2' },
                { label: '@raquelz.12204', sub: 'Raquel Arnaiz', value: 19, href: '/admin/users/1' },
                { label: '@marcos_rvw', sub: 'Marcos Gil', value: 14, href: '/admin/users/3' },
                { label: '@sara.vinilos', sub: 'Sara Vidal', value: 11, href: '/admin/users/4' },
                { label: '@quevedo.20', sub: 'Quevedo', value: 6, href: '/admin/users/5' },
            ]),
        },
        music: {
            albumReviews,
            songReviews,
            artists: { ...metric('artists', period, 6, 0.2) },
            topArtists: scaled(period, [
                { label: 'Rosalía', value: 64 },
                { label: 'Bad Bunny', value: 51 },
                { label: 'Clarent', value: 43 },
                { label: 'Karol G', value: 29 },
                { label: 'C. Tangana', value: 22 },
            ]),
            topAlbums: scaled(period, [
                { label: 'Motomami', sub: 'Rosalía', value: 38, href: '/album/3' },
                { label: 'Clarent', sub: 'Clarent', value: 31, href: '/album/1' },
                { label: 'Un verano sin ti', sub: 'Bad Bunny', value: 27, href: '/album/5' },
                { label: 'El mal querer', sub: 'Rosalía', value: 19, href: '/album/4' },
                { label: 'Mañana será bonito', sub: 'Karol G', value: 15, href: '/album/2' },
            ]),
            bestRated: [
                { label: 'El mal querer', sub: 'Rosalía · 19 reseñas', value: 9.1, href: '/album/4' },
                { label: 'Motomami', sub: 'Rosalía · 38 reseñas', value: 8.6, href: '/album/3' },
                { label: 'Clarent', sub: 'Clarent · 31 reseñas', value: 8.2, href: '/album/1' },
            ],
            worstRated: [
                { label: 'Mañana será bonito', sub: 'Karol G · 15 reseñas', value: 5.4, href: '/album/2' },
                { label: 'Un verano sin ti', sub: 'Bad Bunny · 27 reseñas', value: 6.3, href: '/album/5' },
                { label: 'El madrileño', sub: 'C. Tangana · 9 reseñas', value: 6.8, href: '/album/6' },
            ],
        },
        moderation: {
            reportsIn,
            reportsDone,
            resolutionHours: average('resolution', period, 14, 8),
            sanctions,
            applied: Math.round(reportsDone.total * 0.62),
            dismissed: reportsDone.total - Math.round(reportsDone.total * 0.62),
            suspensions: Math.max(0, Math.round(sanctions.total * 0.3)),
            bans: Math.max(0, Math.round(sanctions.total * 0.1)),
            reasons: scaled(period, [
                { label: 'Spam', value: 52 },
                { label: 'Palabras inapropiadas', value: 33 },
                { label: 'Mal uso', value: 21 },
                { label: 'Acoso', value: 9 },
            ]).map((r) => ({ ...r, value: Math.round(r.value / 4) })),
        },
        inbox: {
            contact,
            suggestions,
            firstReplyHours: average('first-reply', period, 20, 12),
            unanswered: 3,
            contactReasons: scaled(period, [
                { label: 'Duda', value: 18 },
                { label: 'Problema con mi cuenta', value: 14 },
                { label: 'Colaboración', value: 6 },
                { label: 'Queja', value: 5 },
                { label: 'Otra', value: 4 },
            ]).map((r) => ({ ...r, value: Math.max(1, Math.round(r.value / 1.5)) })),
            // embudo: cuántas sugerencias del periodo están en cada estado
            suggestionFunnel: [
                { label: 'Recibidas', value: suggestions.total },
                { label: 'En estudio', value: Math.round(suggestions.total * 0.55) },
                { label: 'En desarrollo', value: Math.round(suggestions.total * 0.25) },
                { label: 'Implementadas', value: Math.round(suggestions.total * 0.12) },
            ],
            suggestionsDismissed: Math.round(suggestions.total * 0.2),
        },
    };
};

export type Stats = ReturnType<typeof getStats>;
