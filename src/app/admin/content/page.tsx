'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import FilterSheet from '../../../../components/FilterSheet/FilterSheet';
import ModerateContentModal, { type ModerationAction, type ModerationResult } from './ModerateContentModal';
import { MOCK_CONTENT, STATUS_CLASS, formatDate, publicHref, type AdminContent, type ContentStatus } from './mockContent';
import '../admin-shared.css';
import './content.css';

// Fecha de referencia de los datos de ejemplo (con datos reales será la fecha actual)
const MOCK_TODAY = new Date('2026-11-21T12:00:00');
const DAY_MS = 24 * 60 * 60 * 1000;

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'Publicado', label: 'Publicado' },
    { value: 'Oculto', label: 'Oculto' },
    { value: 'Eliminado', label: 'Eliminado' },
];

const REPORTS_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: 'none', label: 'Sin denuncias' },
    { value: 'any', label: 'Con denuncias' },
    { value: 'pending', label: 'Con pendientes' },
];

const TYPE_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'RVW', label: 'RVW' },
    { value: 'Comentario', label: 'Comentario' },
];

const DATE_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Últimos 7 días' },
    { value: 'month', label: 'Último mes' },
];

type SortKey = 'date' | 'likes' | 'reports';
type SortDir = 'asc' | 'desc';
interface SortState {
    key: SortKey;
    dir: SortDir;
}

const DEFAULT_SORT: SortState = { key: 'date', dir: 'desc' };

// En móvil no hay cabeceras de columna: se ordena desde el panel de filtros
const SORT_OPTIONS = [
    { value: 'date-desc', label: 'Más recientes' },
    { value: 'date-asc', label: 'Más antiguos' },
    { value: 'likes-desc', label: 'Más likes' },
    { value: 'reports-desc', label: 'Más denuncias' },
];

const SORTABLE_COLUMNS: { key: SortKey; label: string; className?: string }[] = [
    { key: 'likes', label: 'Likes' },
    { key: 'reports', label: 'Denuncias' },
    { key: 'date', label: 'Fecha', className: 'col-date' },
];

const daysAgo = (iso: string) => (MOCK_TODAY.getTime() - new Date(`${iso}T12:00:00`).getTime()) / DAY_MS;

const matchesDate = (iso: string, filter: string) => {
    if (!filter) return true;
    const days = daysAgo(iso);
    if (filter === 'today') return days < 1;
    if (filter === 'week') return days < 7;
    if (filter === 'month') return days < 30;
    return true;
};

const matchesReports = (item: AdminContent, filter: string) => {
    if (filter === 'none') return item.reports === 0;
    if (filter === 'any') return item.reports > 0;
    if (filter === 'pending') return item.pendingReports > 0;
    return true;
};

const sortValue = (item: AdminContent, key: SortKey) => {
    if (key === 'likes') return item.likes;
    if (key === 'reports') return item.reports;
    return new Date(item.createdAt).getTime();
};

// useSearchParams necesita un Suspense para que la build de producción no falle
export default function AdminContentPage() {
    return (
        <Suspense fallback={null}>
            <AdminContentWithQuery />
        </Suspense>
    );
}

// /admin/content?q=@usuario precarga la búsqueda.
// /admin/content?review=post124 (desde el detalle de una RVW) muestra solo sus comentarios.
// La key recrea el listado al cambiar los parámetros.
function AdminContentWithQuery() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const reviewId = searchParams.get('review') ?? '';
    return <AdminContentList key={`${query}|${reviewId}`} initialQuery={query} reviewId={reviewId} />;
}

function AdminContentList({ initialQuery, reviewId }: { initialQuery: string; reviewId: string }) {
    const router = useRouter();
    const [items, setItems] = useState<AdminContent[]>(MOCK_CONTENT);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState('');
    const [reportsFilter, setReportsFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sort, setSort] = useState<SortState>(DEFAULT_SORT);
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // menú de 3 puntos por fila
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    // modal de ocultar / eliminar
    const [modal, setModal] = useState<{ action: ModerationAction; item: AdminContent } | null>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const search = searchQuery.trim().toLowerCase();
    const visibleItems = items
        .filter((item) => {
            const matchesSearch =
                !search ||
                item.authorUsername.toLowerCase().includes(search) ||
                item.excerpt.toLowerCase().includes(search) ||
                item.subject.toLowerCase().includes(search);
            const matchesStatus = statusFilter ? item.status === statusFilter : true;
            const matchesType = typeFilter ? item.type === typeFilter : true;
            const matchesReview = reviewId ? item.reviewId === reviewId : true;
            return (
                matchesSearch &&
                matchesReview &&
                matchesStatus &&
                matchesType &&
                matchesReports(item, reportsFilter) &&
                matchesDate(item.createdAt, dateFilter)
            );
        })
        .sort((a, b) => {
            const diff = sortValue(a, sort.key) - sortValue(b, sort.key);
            return sort.dir === 'asc' ? diff : -diff;
        });

    const activeFiltersCount = [statusFilter, reportsFilter, typeFilter, dateFilter].filter(Boolean).length;

    // Quita ?review= conservando la búsqueda si la había
    const clearReviewFilter = () => {
        router.replace(initialQuery ? `/admin/content?q=${encodeURIComponent(initialQuery)}` : '/admin/content');
    };
    const closeFilters = useCallback(() => setShowMobileFilters(false), []);
    const clearFilters = () => {
        setStatusFilter('');
        setReportsFilter('');
        setTypeFilter('');
        setDateFilter('');
    };

    // Primer clic: de mayor a menor; segundo clic en la misma columna: al revés
    const toggleSort = (key: SortKey) => {
        setSort((prev) =>
            prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }
        );
    };

    const setStatus = (id: string, status: ContentStatus) => {
        setItems((prev) => prev.map((item) => (item.id === id ? { ...item, status } : item)));
    };

    const openModal = (action: ModerationAction, item: AdminContent) => {
        setOpenMenuId(null);
        setModal({ action, item });
    };

    const closeModal = () => setModal(null);

    // TODO: enviar nota interna y aviso al autor cuando haya backend
    const handleConfirmModal = ({ markReportsApplied }: ModerationResult) => {
        if (!modal) return;
        const status: ContentStatus = modal.action === 'hide' ? 'Oculto' : 'Eliminado';
        setItems((prev) =>
            prev.map((item) =>
                item.id === modal.item.id
                    ? { ...item, status, pendingReports: markReportsApplied ? 0 : item.pendingReports }
                    : item
            )
        );
        closeModal();
    };

    // Mostrar y Restaurar deshacen una acción, así que se aplican sin confirmar
    const handleRestore = (item: AdminContent) => {
        setStatus(item.id, 'Publicado');
        setOpenMenuId(null);
    };

    const renderContentCell = (item: AdminContent) => (
        <div className="user-names content-cell">
            <span className="user-fullname content-excerpt">
                <span className="content-type">{item.type}</span>
                {' · '}
                {item.subject}: «{item.excerpt}»
            </span>
            <span className="user-handle">{item.authorUsername}</span>
        </div>
    );

    const renderReports = (item: AdminContent) => (
        <span
            className={`content-reports ${item.pendingReports > 0 ? 'has-pending' : ''}`}
            title={item.pendingReports > 0 ? `${item.pendingReports} pendientes` : undefined}
        >
            {item.pendingReports > 0 && <span className="pending-dot" aria-hidden="true" />}
            {item.reports}
            {item.pendingReports > 0 && <span className="visually-hidden"> ({item.pendingReports} pendientes)</span>}
        </span>
    );

    const emptyMessage = (
        <div className="admin-empty-message">
            <p>No se encontró contenido con los filtros aplicados.</p>
        </div>
    );

    return (
        <div className="admin-list-container">
            <header className="admin-list-header">
                <h1>Contenido</h1>
                <p>{visibleItems.length} en total</p>
            </header>
            <section className="admin-list-toolbar">
                <div className="search-and-mobile-filter">
                    <SearchBar
                        placeholder="Busca por autor o texto..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className={`mobile-filter-btn ${activeFiltersCount > 0 ? 'active' : ''}`}
                        onClick={() => setShowMobileFilters(true)}
                        aria-label="Mostrar filtros"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6L14 13.33V20a1 1 0 0 1-1.45.89l-2-1A1 1 0 0 1 10 19v-5.67L3.2 4.6A1 1 0 0 1 3 4z" />
                        </svg>
                        {activeFiltersCount > 0 && <span className="mobile-filter-badge">{activeFiltersCount}</span>}
                    </button>
                </div>
                <FilterSheet
                    open={showMobileFilters}
                    onClose={closeFilters}
                    onClear={clearFilters}
                    resultCount={visibleItems.length}
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
                            <span className="admin-filter-label">Denuncias</span>
                            <Select
                                options={REPORTS_OPTIONS}
                                value={reportsFilter}
                                onChange={(val) => setReportsFilter(val === 'all' ? '' : val)}
                                placeholder="Denuncias"
                            />
                        </div>
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Tipo</span>
                            <Select
                                options={TYPE_OPTIONS}
                                value={typeFilter}
                                onChange={(val) => setTypeFilter(val === 'all' ? '' : val)}
                                placeholder="Tipo"
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
                        <div className="admin-filter-field content-sort-field">
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
            {reviewId && (
                <div className="admin-active-chips">
                    <div className="admin-active-chip">
                        <span>
                            Comentarios de{' '}
                            <Link href={`/admin/content/${reviewId}`} className="admin-active-chip-link">
                                esta RVW
                            </Link>
                        </span>
                        <button
                            type="button"
                            className="admin-active-chip-x"
                            onClick={clearReviewFilter}
                            aria-label="Quitar filtro de RVW"
                        >
                            ✕
                        </button>
                    </div>
                </div>
            )}
            <section className="admin-table-desktop">
                <div className="admin-table-header content-grid">
                    <span className="content-col-head">Contenido</span>
                    <span className="center-col">Estado</span>
                    {SORTABLE_COLUMNS.map((col) => {
                        const isActive = sort.key === col.key;
                        return (
                            <span
                                key={col.key}
                                className={`center-col ${col.className ?? ''}`}
                                aria-sort={isActive ? (sort.dir === 'asc' ? 'ascending' : 'descending') : 'none'}
                            >
                                <button
                                    type="button"
                                    className={`sort-header-btn ${isActive ? 'active' : ''}`}
                                    onClick={() => toggleSort(col.key)}
                                >
                                    {col.label}
                                    <span className="sort-arrow" aria-hidden="true">
                                        {isActive ? (sort.dir === 'asc' ? '▲' : '▼') : '▾'}
                                    </span>
                                </button>
                            </span>
                        );
                    })}
                    <span></span>
                </div>
                <div className="admin-table-body">
                    {visibleItems.map((item) => (
                        <div
                            key={item.id}
                            className={`admin-table-row content-grid ${item.status === 'Eliminado' ? 'is-deleted' : ''}`}
                            onClick={() => router.push(`/admin/content/${item.id}`)}
                        >
                            {renderContentCell(item)}
                            <span className={`center-col cell-text content-status ${STATUS_CLASS[item.status]}`}>
                                {item.status}
                            </span>
                            <span className="center-col cell-text">{item.likes}</span>
                            <span className="center-col cell-text">{renderReports(item)}</span>
                            <span className="center-col cell-text col-date">{formatDate(item.createdAt)}</span>
                            <div
                                className="row-menu-wrapper"
                                ref={openMenuId === item.id ? menuRef : null}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="more-menu-btn"
                                    onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                                    aria-label="Acciones de contenido"
                                >
                                    ⋮
                                </button>
                                {openMenuId === item.id && (
                                    <div className="more-menu-dropdown align-right">
                                        <Link href={`/admin/content/${item.id}`} className="dropdown-item">
                                            Ver contenido
                                        </Link>
                                        {item.status !== 'Eliminado' && (
                                            <a
                                                href={publicHref(item)}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="dropdown-item"
                                            >
                                                Ver en la web ↗
                                            </a>
                                        )}
                                        <Link href={`/admin/users/${item.authorId}`} className="dropdown-item">
                                            Ver autor
                                        </Link>
                                        {item.reports > 0 && (
                                            <Link
                                                href={`/admin/reports?content=${encodeURIComponent(item.id)}`}
                                                className="dropdown-item"
                                            >
                                                Ver denuncias ({item.reports})
                                            </Link>
                                        )}
                                        <div className="dropdown-divider" />
                                        {item.status === 'Publicado' && (
                                            <button className="dropdown-item warning" onClick={() => openModal('hide', item)}>
                                                Ocultar
                                            </button>
                                        )}
                                        {item.status === 'Oculto' && (
                                            <button className="dropdown-item" onClick={() => handleRestore(item)}>
                                                Mostrar
                                            </button>
                                        )}
                                        {item.status === 'Eliminado' ? (
                                            <button className="dropdown-item" onClick={() => handleRestore(item)}>
                                                Restaurar
                                            </button>
                                        ) : (
                                            <button className="dropdown-item danger" onClick={() => openModal('delete', item)}>
                                                Eliminar
                                            </button>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {visibleItems.length === 0 && emptyMessage}
                </div>
            </section>
            <section className="admin-list-mobile">
                {visibleItems.map((item) => (
                    <Link
                        href={`/admin/content/${item.id}`}
                        key={item.id}
                        className={`admin-mobile-row ${item.status === 'Eliminado' ? 'is-deleted' : ''}`}
                    >
                        <div className="admin-mobile-left">{renderContentCell(item)}</div>
                        <div className="admin-mobile-right">
                            <div className="admin-mobile-status content-mobile-status">
                                <span className={`mobile-status-text content-status ${STATUS_CLASS[item.status]}`}>
                                    {item.status}
                                </span>
                                <span className={`content-mobile-reports ${item.pendingReports > 0 ? 'has-pending' : ''}`}>
                                    {item.pendingReports > 0 && <span className="pending-dot" aria-hidden="true" />}
                                    {item.reports} {item.reports === 1 ? 'denuncia' : 'denuncias'}
                                </span>
                            </div>
                            <span className="mobile-chevron">›</span>
                        </div>
                    </Link>
                ))}
                {visibleItems.length === 0 && emptyMessage}
            </section>
            <nav className="admin-pagination" aria-label="Paginación de contenido">
                <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                >
                    ‹
                </button>
                {[1, 2, 3].map((page) => (
                    <button
                        key={page}
                        className={`page-btn ${currentPage === page ? 'active' : ''}`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                ))}
                <span className="page-dots">..</span>
                <button className="page-btn" onClick={() => setCurrentPage((p) => p + 1)}>
                    ›
                </button>
            </nav>

            {/* modal: ocultar / eliminar contenido */}
            {modal && (
                <ModerateContentModal
                    action={modal.action}
                    item={modal.item}
                    pendingReports={modal.item.pendingReports}
                    onClose={closeModal}
                    onConfirm={handleConfirmModal}
                />
            )}
        </div>
    );
}
