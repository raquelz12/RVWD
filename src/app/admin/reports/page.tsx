'use client';

import { useState, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import FilterSheet from '../../../../components/FilterSheet/FilterSheet';
import MoreMenu, { type MoreMenuItem } from '../../../../components/MoreMenu/MoreMenu';
import SanctionDots from '../SanctionDots';
import { DATE_OPTIONS, formatDate, matchesDate } from '@/app/lib/adminFilters';
import { MOCK_USERS, type AdminUser } from '../users/mockUsers';
import { MOCK_REPORTS, REPORT_STATUS_CLASS, reportContentHref, type AdminReport } from './mockReports';
import { useSeenReports } from './useSeenReports';
import '../admin-shared.css';
import './reports.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'En revisión', label: 'En revisión' },
    { value: 'Aplicada', label: 'Aplicada' },
    { value: 'Descartada', label: 'Descartada' },
];

const REASON_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'Spam', label: 'Spam' },
    { value: 'Palabras inapropiadas', label: 'Palabras inapropiadas' },
    { value: 'Mal uso', label: 'Mal uso' },
    { value: 'Acoso', label: 'Acoso' },
];

const SANCTION_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: '0', label: '0/3' },
    { value: '1', label: '1/3' },
    { value: '2', label: '2/3' },
    { value: '3', label: '3/3' },
];

const CONTENT_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'Comentario', label: 'Comentario' },
    { value: 'RVW', label: 'RVW' },
    { value: 'Perfil', label: 'Perfil' },
];

type SortKey = 'date' | 'sanctions';
type SortDir = 'asc' | 'desc';
interface SortState {
    key: SortKey;
    dir: SortDir;
}

const DEFAULT_SORT: SortState = { key: 'date', dir: 'desc' };

// En móvil no hay cabeceras de columna: se ordena desde el panel de filtros
const SORT_OPTIONS = [
    { value: 'date-desc', label: 'Más recientes' },
    { value: 'date-asc', label: 'Más antiguas' },
    { value: 'sanctions-desc', label: 'Más sanciones' },
];

interface SortColumn {
    key: SortKey;
    label: string;
    className?: string;
}

const SANCTIONS_COLUMN: SortColumn = { key: 'sanctions', label: 'Sanciones' };
const DATE_COLUMN: SortColumn = { key: 'date', label: 'Fecha', className: 'col-date' };

// Cada denuncia con su usuario denunciado (nombre, avatar y sanciones salen de Usuarios)
type ReportRow = AdminReport & { user: AdminUser };

const ROWS: ReportRow[] = MOCK_REPORTS.flatMap((report) => {
    const user = MOCK_USERS.find((u) => u.id === report.userId);
    return user ? [{ ...report, user }] : [];
});

const sortValue = (row: ReportRow, key: SortKey) =>
    key === 'sanctions' ? row.user.sanctions.length : new Date(row.createdAt).getTime();

// useSearchParams necesita un Suspense para que la build de producción no falle
export default function AdminReportsPage() {
    return (
        <Suspense fallback={null}>
            <AdminReportsWithQuery />
        </Suspense>
    );
}

// /admin/reports?q=@usuario (desde una denuncia o un perfil) precarga la búsqueda.
// /admin/reports?content=post123 (desde Contenido) muestra solo las denuncias de ese contenido.
// Con cacheComponents Next conserva el estado de las páginas ya visitadas, así que
// la key fuerza a recrear el listado cuando cambian los parámetros.
function AdminReportsWithQuery() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const contentId = searchParams.get('content') ?? '';
    return <AdminReportsContent key={`${query}|${contentId}`} initialQuery={query} contentId={contentId} />;
}

function AdminReportsContent({ initialQuery, contentId }: { initialQuery: string; contentId: string }) {
    const router = useRouter();
    const seen = useSeenReports();
    const [reports, setReports] = useState<ReportRow[]>(ROWS);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState('');
    const [reasonFilter, setReasonFilter] = useState('');
    const [sanctionFilter, setSanctionFilter] = useState('');
    const [contentFilter, setContentFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

    const query = searchQuery.toLowerCase();
    const filteredReports = reports
        .filter((report) => {
            const matchesSearch =
                report.user.name.toLowerCase().includes(query) || report.user.username.toLowerCase().includes(query);
            const matchesStatus = statusFilter ? report.status === statusFilter : true;
            const matchesReason = reasonFilter ? report.reason === reasonFilter : true;
            const matchesSanction = sanctionFilter ? report.user.sanctions.length === Number(sanctionFilter) : true;
            const matchesContent = contentFilter ? report.contentType === contentFilter : true;
            const matchesContentId = contentId ? report.contentId === contentId : true;

            return (
                matchesSearch &&
                matchesStatus &&
                matchesReason &&
                matchesSanction &&
                matchesContent &&
                matchesContentId &&
                matchesDate(report.createdAt, dateFilter)
            );
        })
        .sort((a, b) => {
            const diff = sortValue(a, sort.key) - sortValue(b, sort.key);
            return sort.dir === 'asc' ? diff : -diff;
        });

    const newCount = reports.filter((r) => !seen.has(r.id)).length;

    // Primer clic: de mayor a menor; segundo clic en la misma columna: al revés
    const toggleSort = (key: SortKey) => {
        setSort((prev) =>
            prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }
        );
    };

    // Quita ?content= conservando la búsqueda si la había
    const clearContentFilter = () => {
        router.replace(initialQuery ? `/admin/reports?q=${encodeURIComponent(initialQuery)}` : '/admin/reports');
    };

    const activeFiltersCount = [statusFilter, reasonFilter, sanctionFilter, contentFilter, dateFilter].filter(Boolean).length;
    const closeFilters = useCallback(() => setShowMobileFilters(false), []);
    const clearFilters = () => {
        setStatusFilter('');
        setReasonFilter('');
        setSanctionFilter('');
        setContentFilter('');
        setDateFilter('');
    };

    // TODO: con backend, descartar también desde aquí. Aplicar solo desde el detalle, porque pide una nota interna
    const discard = (id: string) => {
        setReports((prev) => prev.map((r) => (r.id === id ? { ...r, status: 'Descartada' } : r)));
    };

    const menuItems = (report: ReportRow): MoreMenuItem[] => [
        { label: 'Ver usuario', href: `/admin/users/${report.userId}` },
        { label: report.contentType === 'Perfil' ? 'Ver perfil' : 'Ver contenido', href: reportContentHref(report) },
        ...(report.status === 'En revisión'
            ? (['divider', { label: 'Descartar', danger: true, onClick: () => discard(report.id) }] as MoreMenuItem[])
            : []),
    ];

    // Punto rojo y texto para lectores de pantalla en las denuncias que aún no se han abierto
    const renderName = (report: ReportRow) => (
        <>
            {!seen.has(report.id) && <span className="pending-dot report-new-dot" aria-hidden="true" />}
            <span className="sr-only">Denuncia a </span>
            {report.user.name}
            {!seen.has(report.id) && <span className="sr-only"> (nueva)</span>}
        </>
    );

    return (
        <div className="admin-list-container">
            <header className="admin-list-header">
                <h1 className="page-title">Denuncias</h1>
                <p>
                    {reports.length} denuncias en total
                    {newCount > 0 && ` · ${newCount} ${newCount === 1 ? 'nueva' : 'nuevas'}`}
                </p>
            </header>
            <section className="admin-list-toolbar">
                <div className="search-and-mobile-filter">
                    <SearchBar
                        placeholder="Busca por usuario o nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        type="button"
                        className={`mobile-filter-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
                        onClick={() => setShowMobileFilters(true)}
                        aria-label="Mostrar filtros"
                        aria-expanded={showMobileFilters}
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                            <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6L14 13.33V20a1 1 0 0 1-1.45.89l-2-1A1 1 0 0 1 10 19v-5.67L3.2 4.6A1 1 0 0 1 3 4z" />
                        </svg>
                        {activeFiltersCount > 0 && <span className="mobile-filter-badge">{activeFiltersCount}</span>}
                    </button>
                </div>
                <FilterSheet
                    open={showMobileFilters}
                    onClose={closeFilters}
                    onClear={clearFilters}
                    resultCount={filteredReports.length}
                >
                    <div className="admin-filters-group">
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Estado</span>
                            <Select
                                options={STATUS_OPTIONS}
                                value={statusFilter}
                                onChange={(val) => setStatusFilter(val === 'all' ? '' : val)}
                                placeholder="Estado"
                            />
                        </div>
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Motivo</span>
                            <Select
                                options={REASON_OPTIONS}
                                value={reasonFilter}
                                onChange={(val) => setReasonFilter(val === 'all' ? '' : val)}
                                placeholder="Motivo"
                            />
                        </div>
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Sanción</span>
                            <Select
                                options={SANCTION_OPTIONS}
                                value={sanctionFilter}
                                onChange={(val) => setSanctionFilter(val === 'all' ? '' : val)}
                                placeholder="Sanción"
                            />
                        </div>
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Contenido</span>
                            <Select
                                options={CONTENT_OPTIONS}
                                value={contentFilter}
                                onChange={(val) => setContentFilter(val === 'all' ? '' : val)}
                                placeholder="Contenido"
                            />
                        </div>
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Fecha</span>
                            <Select
                                options={DATE_OPTIONS}
                                value={dateFilter}
                                onChange={(val) => setDateFilter(val === 'all' ? '' : val)}
                                placeholder="Fecha"
                            />
                        </div>
                        {/* solo en móvil: en escritorio se ordena con las cabeceras */}
                        <div className="admin-filter-field admin-sort-field">
                            <span className="admin-filter-label">Ordenar por</span>
                            <Select
                                options={SORT_OPTIONS}
                                value={`${sort.key}-${sort.dir}`}
                                onChange={(val) => {
                                    const [key, dir] = val.split('-') as [SortKey, SortDir];
                                    setSort({ key, dir });
                                }}
                                placeholder="Ordenar por"
                            />
                        </div>
                    </div>
                </FilterSheet>
            </section>
            {contentId && (
                <div className="admin-active-chips">
                    <div className="admin-active-chip">
                        <span>
                            Denuncias de{' '}
                            <Link href={`/admin/content/${encodeURIComponent(contentId)}`} className="admin-active-chip-link">
                                este contenido
                            </Link>
                        </span>
                        <button
                            type="button"
                            className="admin-active-chip-x"
                            onClick={clearContentFilter}
                            aria-label="Quitar filtro de contenido"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
            <section className="admin-table-desktop">
                <div className="admin-table-header reports-grid">
                    <span>Usuario</span>
                    <span className="center-col">Estado</span>
                    <span className="center-col">Motivo</span>
                    <SortHeader column={SANCTIONS_COLUMN} sort={sort} onSort={toggleSort} />
                    <span className="center-col">Contenido</span>
                    <SortHeader column={DATE_COLUMN} sort={sort} onSort={toggleSort} />
                    <span>
                        <span className="sr-only">Acciones</span>
                    </span>
                </div>
                <div className="admin-table-body">
                    {filteredReports.map((report) => (
                        // Fila con ⋮: el enlace del nombre cubre toda la fila (.admin-row-link) y el menú queda encima
                        <div
                            key={report.id}
                            className={`admin-table-row reports-grid ${seen.has(report.id) ? '' : 'report-is-new'}`}
                        >
                            <div className="user-cell">
                                <img src={report.user.avatar} alt="" className="user-avatar" />
                                <div className="user-names">
                                    <Link href={`/admin/reports/${report.id}`} className="user-fullname admin-row-link">
                                        {renderName(report)}
                                    </Link>
                                    <span className="user-handle">{report.user.username}</span>
                                </div>
                            </div>
                            <span className={`center-col cell-text report-status ${REPORT_STATUS_CLASS[report.status]}`}>
                                {report.status}
                            </span>
                            <span className="center-col cell-text">{report.reason}</span>
                            <div className="center-col">
                                <SanctionDots count={report.user.sanctions.length} />
                            </div>
                            <span className="center-col cell-text">{report.contentType}</span>
                            <span className="center-col cell-text col-date">{formatDate(report.createdAt)}</span>
                            <MoreMenu
                                className="admin-row-menu"
                                items={menuItems(report)}
                                label={`Acciones de la denuncia a ${report.user.name}`}
                            />
                        </div>
                    ))}
                    {filteredReports.length === 0 && (
                        <div className="admin-empty-message">
                            <p>No se encontraron denuncias con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </section>
            <section className="admin-list-mobile">
                {filteredReports.map((report) => (
                    <Link
                        href={`/admin/reports/${report.id}`}
                        key={report.id}
                        className={`admin-mobile-row ${seen.has(report.id) ? '' : 'report-is-new'}`}
                    >
                        <div className="admin-mobile-left">
                            <img src={report.user.avatar} alt="" className="user-avatar" />
                            <div className="user-names">
                                <span className="user-fullname">{renderName(report)}</span>
                                <span className="user-handle">{report.user.username}</span>
                            </div>
                        </div>

                        <div className="admin-mobile-right">
                            <div className="admin-mobile-status">
                                <span className={`mobile-status-text report-status ${REPORT_STATUS_CLASS[report.status]}`}>
                                    {report.status}
                                </span>
                                <SanctionDots count={report.user.sanctions.length} />
                            </div>
                            <span className="mobile-chevron" aria-hidden="true">›</span>
                        </div>
                    </Link>
                ))}
                {filteredReports.length === 0 && (
                    <div className="admin-empty-message">
                        <p>No se encontraron denuncias con los filtros aplicados.</p>
                    </div>
                )}
            </section>
            {/* TODO: paginación de maqueta hasta que haya backend */}
            <nav className="admin-pagination" aria-label="Paginación de denuncias">
                <button
                    type="button"
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    aria-label="Página anterior"
                >
                    ‹
                </button>
                {[1, 2, 3].map((page) => (
                    <button
                        type="button"
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                        aria-label={`Página ${page}`}
                        aria-current={currentPage === page ? 'page' : undefined}
                    >
                        {page}
                    </button>
                ))}
                <span className="page-dots" aria-hidden="true">..</span>
                <button
                    type="button"
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => p + 1)}
                    aria-label="Página siguiente"
                >
                    ›
                </button>
            </nav>
        </div>
    );
}

// Cabecera de columna ordenable, como en Usuarios
function SortHeader({ column, sort, onSort }: { column: SortColumn; sort: SortState; onSort: (key: SortKey) => void }) {
    const isActive = sort.key === column.key;
    return (
        <span
            className={`center-col ${column.className ?? ''}`}
            aria-sort={isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
        >
            <button type="button" className={`sort-header-btn ${isActive ? 'active' : ''}`} onClick={() => onSort(column.key)}>
                {column.label}
                <span className="sort-arrow" aria-hidden="true">
                    {isActive ? (sort.dir === 'asc' ? '▲' : '▼') : '▾'}
                </span>
            </button>
        </span>
    );
}
