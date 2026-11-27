'use client';

import { Suspense, type ReactNode } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { BarChart, LineChart, RankList, SplitBar, StatCard } from './charts';
import { DEFAULT_PERIOD, PERIODS, getStats, isPeriod, type Period, type Stats } from './mockStats';
import '../admin-shared.css';
import './stats.css';

type Tab = 'community' | 'content' | 'music' | 'moderation' | 'inbox';

const TABS: { value: Tab; label: string }[] = [
    { value: 'community', label: 'Comunidad' },
    { value: 'content', label: 'Contenido' },
    { value: 'music', label: 'Música' },
    { value: 'moderation', label: 'Moderación' },
    { value: 'inbox', label: 'Bandeja' },
];

const isTab = (value: string | null): value is Tab => TABS.some((t) => t.value === value);

// Con muchos puntos (30 días) se muestra solo una de cada 5 etiquetas del eje
const labelEveryFor = (period: Period) => (period === '30d' ? 5 : period === '90d' ? 2 : 1);

// useSearchParams necesita un Suspense para que la build de producción no falle
export default function AdminStatsPage() {
    return (
        <Suspense fallback={null}>
            <AdminStats />
        </Suspense>
    );
}

// La pestaña y el periodo van en la URL (?tab=moderation&period=90d) para poder enlazarlos
function AdminStats() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const tabParam = searchParams.get('tab');
    const periodParam = searchParams.get('period');
    const tab: Tab = isTab(tabParam) ? tabParam : 'community';
    const period: Period = isPeriod(periodParam) ? periodParam : DEFAULT_PERIOD;

    const navigate = (next: { tab?: Tab; period?: Period }) => {
        const params = new URLSearchParams();
        const nextTab = next.tab ?? tab;
        const nextPeriod = next.period ?? period;
        if (nextTab !== 'community') params.set('tab', nextTab);
        if (nextPeriod !== DEFAULT_PERIOD) params.set('period', nextPeriod);
        const query = params.toString();
        router.replace(query ? `/admin/stats?${query}` : '/admin/stats', { scroll: false });
    };

    const stats = getStats(period);
    const periodInfo = PERIODS.find((p) => p.value === period)!;
    const ctx: SectionProps = { stats, period, comparedTo: periodInfo.previous };

    return (
        <div className="admin-list-container stats-container">
            <header className="stats-header">
                <div className="admin-list-header">
                    <h1 className="page-title">Estadísticas</h1>
                    <p>Comparado con {periodInfo.previous}</p>
                </div>
                <div className="stats-period" role="group" aria-label="Periodo">
                    {PERIODS.map((p) => (
                        <button
                            key={p.value}
                            type="button"
                            className={`stats-period-btn ${period === p.value ? 'active' : ''}`}
                            aria-pressed={period === p.value}
                            onClick={() => navigate({ period: p.value })}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
            </header>

            <nav className="admin-tabs" aria-label="Secciones de estadísticas">
                {TABS.map((t) => (
                    <button
                        key={t.value}
                        type="button"
                        className={`admin-tab ${tab === t.value ? 'active' : ''}`}
                        aria-pressed={tab === t.value}
                        onClick={() => navigate({ tab: t.value })}
                    >
                        {t.label}
                    </button>
                ))}
            </nav>

            {tab === 'community' && <CommunitySection {...ctx} />}
            {tab === 'content' && <ContentSection {...ctx} />}
            {tab === 'music' && <MusicSection {...ctx} />}
            {tab === 'moderation' && <ModerationSection {...ctx} />}
            {tab === 'inbox' && <InboxSection {...ctx} />}
        </div>
    );
}

interface SectionProps {
    stats: Stats;
    period: Period;
    comparedTo: string;
}

function Panel({ title, subtitle, children, className = '' }: { title: string; subtitle?: string; children: ReactNode; className?: string }) {
    return (
        <section className={`stats-panel ${className}`}>
            <header className="stats-panel-head">
                <h2 className="block-title">{title}</h2>
                {subtitle && <span className="stats-panel-sub">{subtitle}</span>}
            </header>
            {children}
        </section>
    );
}

const seriesData = (labels: string[], values: number[]) => labels.map((label, i) => ({ label, value: values[i] }));

/* ---------- Comunidad ---------- */

function CommunitySection({ stats, period, comparedTo }: SectionProps) {
    const c = stats.community;
    return (
        <>
            <div className="stats-cards">
                <StatCard label="Usuarios totales" value={c.totalUsers.total} previous={c.totalUsers.previousTotal} trend={c.totalUsers.values} comparedTo={comparedTo} />
                <StatCard label="Usuarios nuevos" value={c.newUsers.total} previous={c.newUsers.previousTotal} trend={c.newUsers.values} comparedTo={comparedTo} />
                <StatCard label="Activos al día" value={c.activeUsers.total} previous={c.activeUsers.previousTotal} trend={c.activeUsers.values} comparedTo={comparedTo} hint="de media" />
                <StatCard label="Retención a 30 días" value={c.retention.total} previous={c.retention.previousTotal} suffix=" %" trend={c.retention.values} comparedTo={comparedTo} />
            </div>
            <div className="stats-grid">
                <Panel title="Usuarios nuevos" subtitle={period === '12m' ? 'Por mes' : period === '90d' ? 'Por semana' : 'Por día'} className="wide">
                    <BarChart data={seriesData(stats.labels, c.newUsers.values)} labelEvery={labelEveryFor(period)} />
                </Panel>
                <Panel title="Usuarios activos" subtitle="Han entrado o publicado" className="wide">
                    <LineChart
                        labels={stats.labels}
                        labelEvery={labelEveryFor(period)}
                        series={[
                            { name: 'Este periodo', values: c.activeUsers.values, tone: 'light' },
                            { name: 'Periodo anterior', values: c.activeUsers.previous, tone: 'red' },
                        ]}
                    />
                </Panel>
                <Panel title="¿Qué es la retención?" className="wide stats-note">
                    <p>
                        De los usuarios que se registraron hace un mes, el <strong>{c.retention.total} %</strong> ha vuelto a
                        entrar en los últimos 30 días. Es la cifra que dice si la gente se queda en la web después de probarla.
                    </p>
                </Panel>
            </div>
        </>
    );
}

/* ---------- Contenido ---------- */

function ContentSection({ stats, period, comparedTo }: SectionProps) {
    const c = stats.content;
    return (
        <>
            <div className="stats-cards">
                <StatCard label="RVWs publicadas" value={c.rvws.total} previous={c.rvws.previousTotal} trend={c.rvws.values} comparedTo={comparedTo} />
                <StatCard label="Comentarios" value={c.comments.total} previous={c.comments.previousTotal} trend={c.comments.values} comparedTo={comparedTo} />
                <StatCard label="Likes" value={c.likes.total} previous={c.likes.previousTotal} trend={c.likes.values} comparedTo={comparedTo} />
                <StatCard label="Nota media" value={c.averageScore.total} previous={c.averageScore.previousTotal} decimals={1} trend={c.averageScore.values} comparedTo={comparedTo} />
            </div>
            <div className="stats-grid">
                <Panel title="Actividad" subtitle="RVWs y comentarios" className="wide">
                    <LineChart
                        labels={stats.labels}
                        labelEvery={labelEveryFor(period)}
                        series={[
                            { name: 'Comentarios', values: c.comments.values, tone: 'light' },
                            { name: 'RVWs', values: c.rvws.values, tone: 'red' },
                        ]}
                    />
                </Panel>
                <Panel title="Reparto de notas" subtitle="RVWs con cada nota" className="wide">
                    <BarChart data={c.scoreDistribution} unit=" RVWs" />
                </Panel>
                <Panel title="RVWs con más likes">
                    <RankList items={c.topReviews} numbered />
                </Panel>
                <Panel title="Usuarios más activos" subtitle="RVWs publicadas">
                    <RankList items={c.topUsers} numbered />
                </Panel>
            </div>
        </>
    );
}

/* ---------- Música ---------- */

function MusicSection({ stats, comparedTo }: SectionProps) {
    const m = stats.music;
    return (
        <>
            <div className="stats-cards three">
                <StatCard label="Reseñas de álbumes" value={m.albumReviews.total} previous={m.albumReviews.previousTotal} trend={m.albumReviews.values} comparedTo={comparedTo} />
                <StatCard label="Reseñas de canciones" value={m.songReviews.total} previous={m.songReviews.previousTotal} trend={m.songReviews.values} comparedTo={comparedTo} />
                <StatCard label="Artistas reseñados" value={m.artists.total} previous={m.artists.previousTotal} trend={m.artists.values} comparedTo={comparedTo} hint="distintos" />
            </div>
            <div className="stats-grid">
                <Panel title="Álbumes y canciones" subtitle="Qué se reseña más" className="wide">
                    <SplitBar
                        parts={[
                            { label: 'Álbumes', value: m.albumReviews.total, tone: 'light' },
                            { label: 'Canciones', value: m.songReviews.total, tone: 'red' },
                        ]}
                    />
                </Panel>
                <Panel title="Artistas más reseñados">
                    <RankList items={m.topArtists} numbered />
                </Panel>
                <Panel title="Álbumes más reseñados">
                    <RankList items={m.topAlbums} numbered />
                </Panel>
                <Panel title="Mejor valorados" subtitle="Mínimo 5 reseñas">
                    <RankList items={m.bestRated} decimals={1} max={10} />
                </Panel>
                <Panel title="Peor valorados" subtitle="Mínimo 5 reseñas">
                    <RankList items={m.worstRated} decimals={1} max={10} />
                </Panel>
            </div>
        </>
    );
}

/* ---------- Moderación ---------- */

function ModerationSection({ stats, period, comparedTo }: SectionProps) {
    const m = stats.moderation;
    return (
        <>
            <div className="stats-cards">
                <StatCard label="Denuncias recibidas" value={m.reportsIn.total} previous={m.reportsIn.previousTotal} trend={m.reportsIn.values} invert comparedTo={comparedTo} />
                <StatCard label="Denuncias resueltas" value={m.reportsDone.total} previous={m.reportsDone.previousTotal} trend={m.reportsDone.values} comparedTo={comparedTo} />
                <StatCard label="Tiempo de resolución" value={m.resolutionHours.total} previous={m.resolutionHours.previousTotal} decimals={1} suffix=" h" trend={m.resolutionHours.values} invert comparedTo={comparedTo} hint="de media" />
                <StatCard label="Sanciones" value={m.sanctions.total} previous={m.sanctions.previousTotal} trend={m.sanctions.values} invert comparedTo={comparedTo} />
            </div>
            <div className="stats-grid">
                <Panel title="Recibidas y resueltas" className="wide">
                    <LineChart
                        labels={stats.labels}
                        labelEvery={labelEveryFor(period)}
                        series={[
                            { name: 'Resueltas', values: m.reportsDone.values, tone: 'light' },
                            { name: 'Recibidas', values: m.reportsIn.values, tone: 'red' },
                        ]}
                    />
                </Panel>
                <Panel title="Resultado de las denuncias">
                    <SplitBar
                        parts={[
                            { label: 'Aplicadas', value: m.applied, tone: 'red' },
                            { label: 'Descartadas', value: m.dismissed, tone: 'muted' },
                        ]}
                    />
                    <ul className="stats-mini-list">
                        <li>
                            Suspensiones: <strong>{m.suspensions}</strong>
                        </li>
                        <li>
                            Baneos: <strong>{m.bans}</strong>
                        </li>
                    </ul>
                </Panel>
                <Panel title="Motivos más denunciados">
                    <RankList items={m.reasons} />
                </Panel>
            </div>
        </>
    );
}

/* ---------- Bandeja ---------- */

function InboxSection({ stats, comparedTo }: SectionProps) {
    const b = stats.inbox;
    return (
        <>
            <div className="stats-cards">
                <StatCard label="Mensajes de contacto" value={b.contact.total} previous={b.contact.previousTotal} trend={b.contact.values} comparedTo={comparedTo} />
                <StatCard label="Sugerencias" value={b.suggestions.total} previous={b.suggestions.previousTotal} trend={b.suggestions.values} comparedTo={comparedTo} />
                <StatCard label="Primera respuesta" value={b.firstReplyHours.total} previous={b.firstReplyHours.previousTotal} decimals={1} suffix=" h" trend={b.firstReplyHours.values} invert comparedTo={comparedTo} hint="de media" />
                <StatCard label="Sin responder" value={b.unanswered} hint="ahora mismo" />
            </div>
            <div className="stats-grid">
                <Panel title="Motivos de contacto">
                    <RankList items={b.contactReasons} />
                </Panel>
                <Panel title="Recorrido de las sugerencias" subtitle={`${b.suggestionsDismissed} descartadas`}>
                    <RankList items={b.suggestionFunnel} max={b.suggestionFunnel[0].value} />
                </Panel>
            </div>
        </>
    );
}
