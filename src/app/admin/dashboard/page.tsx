import Link from 'next/link';
import { BarChart, StatCard } from '../stats/charts';
import { PERIODS, getStats } from '../stats/mockStats';
import { MOCK_INBOX, isOpen, statusClass } from '../inbox/mockInbox';
import { MOCK_REPORTS } from '../reports/mockReports';
import { MOCK_USERS } from '../users/mockUsers';
import { formatDate } from '@/app/lib/adminFilters';
import '../admin-shared.css';
import '../stats/stats.css';
import './dashboard.css';

const MAX_ROWS = 5;

const usernameOf = (userId: string) => MOCK_USERS.find((u) => u.id === userId)?.username ?? '';

const byNewest =(a: { createdAt: string }, b: { createdAt: string }) => b.createdAt.localeCompare(a.createdAt);

// Resumen del panel: todo sale de los mismos datos de prueba que Denuncias, Bandeja y Estadísticas
export default function AdminDashboard() {
    const pendingReports = MOCK_REPORTS.filter((r) => r.status === 'En revisión').sort(byNewest);
    const openSuggestions = MOCK_INBOX.filter((m) => m.type === 'suggestion' && isOpen(m.status)).sort(byNewest);
    const unreadContact = MOCK_INBOX.filter((m) => m.type === 'contact' && !m.read).length;
    const unreadSuggestions = MOCK_INBOX.filter((m) => m.type === 'suggestion' && !m.read).length;

    const week = getStats('7d');
    const newUsers = week.community.newUsers;
    const comparedTo = PERIODS.find((p) => p.value === '7d')!.previous;

    return (
        <div className="admin-list-container">
            <header className="admin-list-header">
                {/* TODO: con sesión, el nombre del admin conectado */}
                <h1 className="page-title">Hola, Raquel.</h1>
                <p>¿Buen día para ser admin, verdad?</p>
            </header>

            <div className="stats-cards">
                <StatCard label="Denuncias pendientes" value={pendingReports.length} href="/admin/reports" />
                <StatCard label="Mensajes sin leer" value={unreadContact} href="/admin/inbox?tab=contact" />
                <StatCard label="Sugerencias sin leer" value={unreadSuggestions} href="/admin/inbox?tab=suggestion" />
                <StatCard
                    label="Usuarios nuevos (7 días)"
                    value={newUsers.total}
                    previous={newUsers.previousTotal}
                    trend={newUsers.values}
                    comparedTo={comparedTo}
                    href="/admin/stats?period=7d"
                />
            </div>

            <div className="stats-grid">
                <section className="stats-panel">
                    <header className="stats-panel-head">
                        <h2 className="block-title">Cola de denuncias</h2>
                        <span className="stats-panel-sub">En revisión</span>
                    </header>
                    {pendingReports.length > 0 ? (
                        <ul className="dash-list">
                            {pendingReports.slice(0, MAX_ROWS).map((r) => (
                                <li key={r.id}>
                                    <Link href={`/admin/reports/${r.id}`} className="dash-row">
                                        <span className="dash-row-info">
                                            <span className="dash-row-title">{r.reason}</span>
                                            <span className="dash-row-meta">
                                                {r.contentType} de {usernameOf(r.userId)} · {formatDate(r.createdAt)}
                                            </span>
                                        </span>
                                        <span className="admin-chevron" aria-hidden="true">›</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="admin-empty-message">No hay denuncias pendientes.</p>
                    )}
                    <div className="dash-panel-foot">
                        <Link href="/admin/reports" className="admin-next-link">Ver todas las denuncias</Link>
                    </div>
                </section>

                <section className="stats-panel">
                    <header className="stats-panel-head">
                        <h2 className="block-title">Sugerencias recientes</h2>
                        <span className="stats-panel-sub">Abiertas</span>
                    </header>
                    {openSuggestions.length > 0 ? (
                        <ul className="dash-list">
                            {openSuggestions.slice(0, MAX_ROWS).map((m) => (
                                <li key={m.id}>
                                    <Link href={`/admin/inbox/${m.id}`} className="dash-row">
                                        <span className="dash-row-info">
                                            <span className="dash-row-title">{m.message}</span>
                                            <span className="dash-row-meta">
                                                {m.user?.username ?? m.email} · {formatDate(m.createdAt)}
                                            </span>
                                        </span>
                                        <span className={`dash-row-status inbox-status ${statusClass(m.status)}`}>{m.status}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <p className="admin-empty-message">No hay sugerencias abiertas.</p>
                    )}
                    <div className="dash-panel-foot">
                        <Link href="/admin/inbox?tab=suggestion" className="admin-next-link">Ver todas las sugerencias</Link>
                    </div>
                </section>

                <section className="stats-panel wide">
                    <header className="stats-panel-head">
                        <h2 className="block-title">Usuarios nuevos</h2>
                        <span className="stats-panel-sub">Últimos 7 días</span>
                    </header>
                    <BarChart data={week.labels.map((label, i) => ({ label, value: newUsers.values[i] }))} />
                </section>
            </div>
        </div>
    );
}
