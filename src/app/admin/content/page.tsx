'use client';

import { useState, useRef, useEffect, useCallback, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import FilterSheet from '../../../../components/FilterSheet/FilterSheet';
import TextArea from '../../../../components/TextArea/TextArea';
import Button from '../../../../components/Button/Button';
import '../admin-shared.css';
import './content.css';

type ContentStatus = 'Publicado' | 'Oculto' | 'Eliminado';

interface AdminContent {
    id: string;
    type: 'RVW' | 'Comentario';
    // RVW: lo reseñado; comentario: la RVW en la que se comentó
    subject: string;
    // comentario: id de la RVW donde está, para "Ver en la web"
    reviewId?: string;
    excerpt: string;
    authorId: string;
    authorUsername: string;
    status: ContentStatus;
    likes: number;
    reports: number;
    pendingReports: number;
    createdAt: string; // YYYY-MM-DD
}

const MOCK_CONTENT: AdminContent[] = [
    { id: 'post123', type: 'Comentario', subject: 'Clarent', reviewId: 'post130', excerpt: 'Esto es spam, entra en mi perfil y gana seguidores gratis', authorId: '1', authorUsername: '@raquelz.12204', status: 'Publicado', likes: 2, reports: 4, pendingReports: 2, createdAt: '2026-11-21' },
    { id: 'post124', type: 'RVW', subject: 'Clarent', excerpt: 'Un disco que no se parece a nada de lo anterior, y eso es lo mejor que tiene', authorId: '1', authorUsername: '@raquelz.12204', status: 'Publicado', likes: 1078, reports: 1, pendingReports: 0, createdAt: '2026-11-20' },
    { id: 'post125', type: 'Comentario', subject: 'Mañana será bonito', reviewId: 'post131', excerpt: 'Qué opinión más absurda, se nota que no tienes ni idea', authorId: '1', authorUsername: '@raquelz.12204', status: 'Oculto', likes: 0, reports: 3, pendingReports: 0, createdAt: '2026-11-18' },
    { id: 'post126', type: 'RVW', subject: 'Motomami', excerpt: 'La producción es arriesgada pero cada canción encuentra su sitio', authorId: '2', authorUsername: '@lucia.music', status: 'Publicado', likes: 345, reports: 17, pendingReports: 5, createdAt: '2026-11-15' },
    { id: 'post127', type: 'RVW', subject: 'El mal querer', excerpt: 'Cinco años después sigue sonando igual de actual', authorId: '3', authorUsername: '@marcos_rvw', status: 'Eliminado', likes: 234, reports: 6, pendingReports: 0, createdAt: '2026-11-02' },
    { id: 'post128', type: 'RVW', subject: 'Clarent', excerpt: 'No entiendo el hype, me parece un disco correcto sin más', authorId: '2', authorUsername: '@lucia.music', status: 'Publicado', likes: 89, reports: 2, pendingReports: 1, createdAt: '2026-10-28' },
    { id: 'post129', type: 'Comentario', subject: 'Motomami', reviewId: 'post126', excerpt: 'Totalmente de acuerdo con lo de la producción', authorId: '3', authorUsername: '@marcos_rvw', status: 'Publicado', likes: 12, reports: 0, pendingReports: 0, createdAt: '2026-10-20' },
    { id: 'post130', type: 'RVW', subject: 'Un verano sin ti', excerpt: 'Perfecto para el verano, aunque le sobran un par de canciones', authorId: '4', authorUsername: '@sara.vinilos', status: 'Publicado', likes: 512, reports: 0, pendingReports: 0, createdAt: '2026-09-30' },
];

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

const STATUS_CLASS: Record<ContentStatus, string> = {
    Publicado: 'status-published',
    Oculto: 'status-hidden',
    Eliminado: 'status-deleted',
};

const formatDate = (iso: string) => {
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
};

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

// Enlace público: la RVW, o la RVW donde está el comentario
const publicHref = (item: AdminContent) =>
    item.type === 'RVW' ? `/reviews/${item.id}` : `/reviews/${item.reviewId}#comment-${item.id}`;

type ModerationAction = 'hide' | 'delete';

// useSearchParams necesita un Suspense para que la build de producción no falle
export default function AdminContentPage() {
    return (
        <Suspense fallback={null}>
            <AdminContentWithQuery />
        </Suspense>
    );
}

// /admin/content?q=@usuario precarga la búsqueda; la key recrea el listado al cambiar ?q=
function AdminContentWithQuery() {
    const query = useSearchParams().get('q') ?? '';
    return <AdminContentList key={query} initialQuery={query} />;
}

function AdminContentList({ initialQuery }: { initialQuery: string }) {
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
    const [modalNote, setModalNote] = useState('');
    const [notifyAuthor, setNotifyAuthor] = useState(true);
    const [modalError, setModalError] = useState(false);

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
            return (
                matchesSearch &&
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
        setModalNote('');
        setNotifyAuthor(true);
        setModalError(false);
    };

    const closeModal = () => setModal(null);

    const handleConfirmModal = () => {
        if (!modal) return;
        if (!modalNote.trim()) {
            setModalError(true);
            return;
        }
        // TODO: enviar nota interna y aviso al autor cuando haya backend
        setStatus(modal.item.id, modal.action === 'hide' ? 'Oculto' : 'Eliminado');
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
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>{modal.action === 'hide' ? '¿Ocultar este contenido?' : '¿Eliminar este contenido?'}</h3>
                        <p className="modal-subtitle">
                            {modal.action === 'hide'
                                ? 'Dejará de verse en la web, pero el autor y el equipo de moderación seguirán teniéndolo. Puedes volver a mostrarlo cuando quieras.'
                                : 'Se quitará de la web y del perfil del autor. Podrás restaurarlo desde este listado.'}
                        </p>
                        <blockquote className="content-modal-preview">
                            <strong>{modal.item.type} · {modal.item.subject}</strong> «{modal.item.excerpt}»
                            <span>{modal.item.authorUsername}</span>
                        </blockquote>
                        <div className="modal-field">
                            <label>Nota interna</label>
                            <TextArea
                                value={modalNote}
                                onChange={(e) => {
                                    setModalNote(e.target.value);
                                    setModalError(false);
                                }}
                                rows={3}
                                placeholder={`Explica por qué se ${modal.action === 'hide' ? 'oculta' : 'elimina'} para el equipo de moderación...`}
                            />
                        </div>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifyAuthor}
                                onChange={(e) => setNotifyAuthor(e.target.checked)}
                            />
                            <span>Avisar al autor por correo.</span>
                        </label>
                        <div className="modal-actions-row">
                            <Button variant="text" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button variant={modal.action === 'hide' ? 'primary' : 'danger'} onClick={handleConfirmModal}>
                                {modal.action === 'hide' ? 'Ocultar' : 'Eliminar'}
                            </Button>
                        </div>
                        {modalError && (
                            <p className="modal-error-text">
                                Añade una nota interna para {modal.action === 'hide' ? 'ocultar' : 'eliminar'} el contenido.
                            </p>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
