// Gráficas hechas a mano (SVG + CSS), sin librerías: tarjeta de número con tendencia,
// barras, líneas, ranking en barras horizontales y barra repartida.
import Link from 'next/link';

/** 1234567 -> "1.234.567" (Intl en es-ES no agrupa los números de 4 cifras) */
export const formatNumber = (n: number, decimals = 0) => {
    const [int, dec] = n.toFixed(decimals).split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return dec ? `${grouped},${dec}` : grouped;
};

const percentChange = (current: number, previous: number) =>
    previous === 0 ? (current === 0 ? 0 : 100) : ((current - previous) / previous) * 100;

/* ---------- Tarjeta de número ---------- */

interface StatCardProps {
    label: string;
    value: number;
    previous?: number;
    decimals?: number;
    suffix?: string;
    /** Para métricas en las que bajar es bueno (denuncias, tiempo de respuesta...) */
    invert?: boolean;
    trend?: number[];
    hint?: string;
    comparedTo?: string;
    /** Con href, toda la tarjeta es un enlace (p. ej. en el dashboard, a su listado) */
    href?: string;
}

export function StatCard({ label, value, previous, decimals = 0, suffix = '', invert, trend, hint, comparedTo, href }: StatCardProps) {
    const change = previous === undefined ? null : percentChange(value, previous);
    const rounded = change === null ? 0 : Math.round(change);
    const tone = rounded === 0 ? 'neutral' : (rounded > 0) !== Boolean(invert) ? 'good' : 'bad';

    const content = (
        <>
            <span className="stat-card-label">{label}</span>
            <span className="stat-card-value">
                {formatNumber(value, decimals)}
                {suffix && <span className="stat-card-suffix">{suffix}</span>}
            </span>
            <div className="stat-card-foot">
                {change !== null && (
                    <span
                        className={`stat-delta ${tone}`}
                        title={comparedTo ? `Frente a ${comparedTo}: ${formatNumber(previous ?? 0, decimals)}${suffix}` : undefined}
                    >
                        <span aria-hidden="true">
                            {rounded > 0 ? '↑' : rounded < 0 ? '↓' : '='} {Math.abs(rounded)} %
                        </span>
                        <span className="sr-only">
                            {rounded === 0 ? 'Igual que' : `${Math.abs(rounded)} % ${rounded > 0 ? 'más' : 'menos'} que`}{' '}
                            {comparedTo ?? 'el periodo anterior'}
                        </span>
                    </span>
                )}
                {hint && <span className="stat-card-hint">{hint}</span>}
                {trend && trend.length > 1 && <Sparkline values={trend} />}
            </div>
        </>
    );

    return href ? (
        <Link href={href} className="stat-card stat-card-link">
            {content}
        </Link>
    ) : (
        <div className="stat-card">{content}</div>
    );
}

/* ---------- Mini gráfica de tendencia ---------- */

export function Sparkline({ values }: { values: number[] }) {
    const max = Math.max(...values);
    const min = Math.min(...values);
    const range = max - min || 1;
    const points = values
        .map((v, i) => `${(i / (values.length - 1)) * 100},${28 - ((v - min) / range) * 24 - 2}`)
        .join(' ');
    return (
        <svg className="sparkline" viewBox="0 0 100 28" preserveAspectRatio="none" aria-hidden="true">
            <polyline points={points} vectorEffect="non-scaling-stroke" />
        </svg>
    );
}

/* ---------- Barras verticales ---------- */

interface BarChartProps {
    data: { label: string; value: number }[];
    /** Muestra solo una de cada N etiquetas del eje (muchos puntos) */
    labelEvery?: number;
    highlightMax?: boolean;
    unit?: string;
}

export function BarChart({ data, labelEvery = 1, highlightMax = true, unit = '' }: BarChartProps) {
    const max = Math.max(...data.map((d) => d.value), 1);
    const maxIndex = data.findIndex((d) => d.value === max);
    const tip = (d: { label: string; value: number }) => `${d.label}: ${formatNumber(d.value)}${unit}`;
    return (
        <div className="stats-bars" role="img" aria-label={data.map(tip).join(', ')}>
            <div className="stats-bars-plot">
                {data.map((d, i) => (
                    <div key={i} className="stats-bar-col" data-tip={tip(d)}>
                        <div
                            className={`stats-bar ${highlightMax && i === maxIndex ? 'peak' : ''}`}
                            style={{ height: `${Math.max(2, (d.value / max) * 100)}%` }}
                        />
                    </div>
                ))}
            </div>
            <div className="stats-axis">
                {data.map((d, i) => (
                    <span key={i} className="stats-axis-label">
                        {i % labelEvery === 0 || i === data.length - 1 ? d.label : ''}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ---------- Líneas ---------- */

interface LineChartProps {
    labels: string[];
    series: { name: string; values: number[]; tone: 'light' | 'red' }[];
    labelEvery?: number;
}

export function LineChart({ labels, series, labelEvery = 1 }: LineChartProps) {
    const W = 600;
    const H = 200;
    const max = Math.max(...series.flatMap((s) => s.values), 1) * 1.1;
    const x = (i: number) => (labels.length === 1 ? W / 2 : (i / (labels.length - 1)) * W);
    const y = (v: number) => H - (v / max) * H;
    // líneas guía al 25, 50, 75 y 100 % de la escala, cada una a su altura real
    const gridLines = [0.25, 0.5, 0.75, 1];
    const sum = (values: number[]) => values.reduce((a, b) => a + b, 0);
    const label = series.map((s) => `${s.name}: ${formatNumber(sum(s.values))} en total`).join('; ');

    return (
        <div className="stats-line">
            <div className="stats-legend">
                {series.map((s) => (
                    <span key={s.name} className={`stats-legend-item ${s.tone}`}>
                        {s.name}
                    </span>
                ))}
            </div>
            <div className="stats-line-plot">
                <div className="stats-line-grid" aria-hidden="true">
                    {gridLines.map((f) => (
                        <span key={f} style={{ bottom: `${f * 100}%` }}>
                            {formatNumber(Math.round(max * f))}
                        </span>
                    ))}
                </div>
                <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={label}>
                    {series.map((s, si) => {
                        const points = s.values.map((v, i) => `${x(i)},${y(v)}`).join(' ');
                        return (
                            <g key={s.name} className={`stats-series ${s.tone}`}>
                                {si === 0 && <polygon points={`0,${H} ${points} ${W},${H}`} className="stats-area" />}
                                <polyline points={points} vectorEffect="non-scaling-stroke" />
                            </g>
                        );
                    })}
                </svg>
            </div>
            <div className="stats-axis stats-line-axis">
                {labels.map((l, i) => (
                    <span key={i} className="stats-axis-label">
                        {i % labelEvery === 0 || i === labels.length - 1 ? l : ''}
                    </span>
                ))}
            </div>
        </div>
    );
}

/* ---------- Ranking en barras horizontales ---------- */

export interface RankItem {
    label: string;
    value: number;
    sub?: string;
    href?: string;
}

interface RankListProps {
    items: RankItem[];
    unit?: string;
    decimals?: number;
    /** Escala de las barras: por defecto, el valor más alto de la lista */
    max?: number;
    numbered?: boolean;
}

export function RankList({ items, unit = '', decimals = 0, max, numbered }: RankListProps) {
    // nunca 0: con un máximo 0 las barras saldrían con ancho NaN
    const top = Math.max(max ?? Math.max(...items.map((i) => i.value)), 1);
    return (
        <ol className={`stats-rank ${numbered ? 'numbered' : ''}`}>
            {items.map((item) => {
                const content = (
                    <>
                        <span className="stats-rank-text">
                            <span className="stats-rank-label">{item.label}</span>
                            {item.sub && <span className="stats-rank-sub">{item.sub}</span>}
                        </span>
                        <span className="stats-rank-value">
                            {formatNumber(item.value, decimals)}
                            {unit}
                        </span>
                        <span className="stats-rank-track" aria-hidden="true">
                            <span className="stats-rank-fill" style={{ width: `${(item.value / top) * 100}%` }} />
                        </span>
                    </>
                );
                return (
                    <li key={item.label}>
                        {item.href ? (
                            <Link href={item.href} className="stats-rank-row">
                                {content}
                            </Link>
                        ) : (
                            <div className="stats-rank-row">{content}</div>
                        )}
                    </li>
                );
            })}
        </ol>
    );
}

/* ---------- Barra repartida (p. ej. aplicadas / descartadas) ---------- */

export function SplitBar({ parts }: { parts: { label: string; value: number; tone: 'light' | 'red' | 'muted' }[] }) {
    const total = parts.reduce((a, p) => a + p.value, 0) || 1;
    return (
        <div className="stats-split">
            <div className="stats-split-bar" role="img" aria-label={parts.map((p) => `${p.label}: ${p.value}`).join(', ')}>
                {parts.map((p) => (
                    <span key={p.label} className={`stats-split-part ${p.tone}`} style={{ width: `${(p.value / total) * 100}%` }} />
                ))}
            </div>
            <div className="stats-legend">
                {parts.map((p) => (
                    <span key={p.label} className={`stats-legend-item ${p.tone}`}>
                        {p.label}: <strong>{formatNumber(p.value)}</strong> ({Math.round((p.value / total) * 100)} %)
                    </span>
                ))}
            </div>
        </div>
    );
}
