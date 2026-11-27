'use client';

import { useState, useRef, useEffect, useCallback, Suspense, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import FilterSheet from '../../../../components/FilterSheet/FilterSheet';
import MoreMenu, { type MoreMenuItem } from '../../../../components/MoreMenu/MoreMenu';
import {
    CONTACT_REASONS,
    MOCK_INBOX,
    SUGGESTION_CATEGORIES,
    TYPE_LABEL,
    isDismissed,
    isDone,
    isOpen,
    statusClass,
    statusesFor,
    type InboxMessage,
    type InboxStatus,
    type InboxType,
} from './mockInbox';
import { markRead, markUnread, useReadInbox } from './useReadInbox';
import { DATE_OPTIONS, formatDate, matchesDate } from '@/app/lib/adminFilters';
import '../admin-shared.css';
import './inbox.css';

type Tab = 'all' | InboxType;
type SortDir = 'desc' | 'asc';

const TABS: { value: Tab; label: string }[] = [
    { value: 'all', label: 'Todo' },
    { value: 'contact', label: 'Contacto' },
    { value: 'suggestion', label: 'Sugerencias' },
];

// Opciones generales del filtro Estado; en cada pestaña se añaden sus estados
const BASE_STATUS_OPTIONS = [
    { value: 'open', label: 'Abiertos' },
    { value: 'all', label: 'Todos' },
    { value: 'unread', label: 'Solo no leídos' },
];

// En "Todo" se mezclan tipos, así que se agrupan los estados finales
const ALL_TAB_STATUS_OPTIONS = [
    ...BASE_STATUS_OPTIONS,
    { value: 'done', label: 'Resueltos / Implementadas' },
    { value: 'dismissed', label: 'Descartados' },
];

const DEFAULT_STATUS = 'open';

// En móvil no hay cabeceras de columna: se ordena desde el panel de filtros
const SORT_OPTIONS = [
    { value: 'desc', label: 'Más recientes' },
    { value: 'asc', label: 'Más antiguos' },
];

const statusOptionsFor = (tab: Tab) =>
    tab === 'all'
        ? ALL_TAB_STATUS_OPTIONS
        : [...BASE_STATUS_OPTIONS, ...statusesFor(tab).map((s) => ({ value: s, label: s }))];

const categoryOptionsFor = (tab: Tab) => {
    const list = tab === 'contact' ? CONTACT_REASONS : SUGGESTION_CATEGORIES;
    return [{ value: 'all', label: 'Todos' }, ...list.map((c) => ({ value: c, label: c }))];
};

const LONG_PRESS_MS = 500;

// useSearchParams necesita un Suspense para que la build de producción no falle
export default function AdminInboxPage() {
    return (
        <Suspense fallback={null}>
            <AdminInboxWithQuery />
        </Suspense>
    );
}

// /admin/inbox?tab=suggestion abre esa pestaña; ?q= precarga la búsqueda.
// La pestaña sale siempre de la URL. La key recrea el listado solo cuando cambia ?q=
// (Next conserva el estado de las páginas ya visitadas), así que al cambiar de pestaña
// o volver de un mensaje se mantienen los filtros.
function AdminInboxWithQuery() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const tabParam = searchParams.get('tab');
    const tab: Tab = tabParam === 'contact' || tabParam === 'suggestion' ? tabParam : 'all';
    return <AdminInboxList key={query} initialQuery={query} tab={tab} />;
}

function AdminInboxList({ initialQuery, tab }: { initialQuery: string; tab: Tab }) {
    const router = useRouter();
    const searchParams = useSearchParams();
    const read = useReadInbox();
    // TODO: con backend, los cambios de estado se guardarán en el servidor
    const [messages, setMessages] = useState<InboxMessage[]>(MOCK_INBOX);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortDir, setSortDir] = useState<SortDir>('desc');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // selección múltiple
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [mobileSelecting, setMobileSelecting] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressStart = useRef<{ x: number; y: number } | null>(null);
    const longPressFired = useRef(false);

    const clearSelection = () => {
        setSelectedIds(new Set());
        setMobileSelecting(false);
    };

    // Al cambiar de pestaña (desde aquí o con un enlace a ?tab=) se quitan los filtros
    // que no existen en la nueva pestaña y la selección
    const [prevTab, setPrevTab] = useState(tab);
    if (tab !== prevTab) {
        setPrevTab(tab);
        setCategoryFilter('');
        if (!statusOptionsFor(tab).some((o) => o.value === statusFilter)) setStatusFilter(DEFAULT_STATUS);
        clearSelection();
        setCurrentPage(1);
    }

    const changeTab = (next: Tab) => {
        const params = new URLSearchParams(searchParams.toString());
        if (next === 'all') params.delete('tab');
        else params.set('tab', next);
        const qs = params.toString();
        router.replace(qs ? `/admin/inbox?${qs}` : '/admin/inbox', { scroll: false });
    };

    useEffect(() => () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }, []);

    const isRead = (m: InboxMessage) => read.has(m.id);
    const unreadCount = (t: Tab) => messages.filter((m) => !read.has(m.id) && (t === 'all' || m.type === t)).length;

    const matchesStatus = (m: InboxMessage, filter: string) => {
        if (filter === 'open') return isOpen(m.status);
        if (filter === 'unread') return !read.has(m.id);
        if (filter === 'done') return isDone(m.status);
        if (filter === 'dismissed') return isDismissed(m.status);
        if (filter === 'all') return true;
        return m.status === filter;
    };

    const search = searchQuery.trim().toLowerCase();
    const visibleMessages = messages
        .filter((m) => {
            const matchesTab = tab === 'all' || m.type === tab;
            const matchesSearch =
                !search ||
                (m.name ?? '').toLowerCase().includes(search) ||
                m.email.toLowerCase().includes(search) ||
                (m.user?.username ?? '').toLowerCase().includes(search) ||
                m.message.toLowerCase().includes(search);
            const matchesCategory = categoryFilter ? m.category === categoryFilter : true;
            return (
                matchesTab &&
                matchesSearch &&
                matchesStatus(m, statusFilter) &&
                matchesCategory &&
                matchesDate(m.createdAt, dateFilter)
            );
        })
        .sort((a, b) => (sortDir === 'desc' ? b.createdAt.localeCompare(a.createdAt) : a.createdAt.localeCompare(b.createdAt)));

    // La selección solo cuenta lo que se ve: si un filtro oculta un mensaje marcado, no se le aplican las acciones
    const selectedVisible = visibleMessages.filter((m) => selectedIds.has(m.id));
    const isSelecting = selectedVisible.length > 0;
    const inMobileSelect = mobileSelecting && isSelecting;
    const selectedType = selectedVisible.every((m) => m.type === selectedVisible[0]?.type)
        ? selectedVisible[0]?.type
        : undefined;
    const allVisibleSelected = visibleMessages.length > 0 && selectedVisible.length === visibleMessages.length;

    // Escape quita la selección (salvo si se está cerrando un menú ⋮ o el panel de filtros)
    useEffect(() => {
        if (!isSelecting) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || showMobileFilters || document.querySelector('.more-menu.is-open')) return;
            setSelectedIds(new Set());
            setMobileSelecting(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [isSelecting, showMobileFilters]);

    const activeFiltersCount = [statusFilter !== DEFAULT_STATUS, categoryFilter, dateFilter].filter(Boolean).length;
    const closeFilters = useCallback(() => setShowMobileFilters(false), []);
    const clearFilters = () => {
        setStatusFilter(DEFAULT_STATUS);
        setCategoryFilter('');
        setDateFilter('');
    };

    const updateStatus = (ids: string[], status: InboxStatus) => {
        const set = new Set(ids);
        setMessages((prev) => prev.map((m) => (set.has(m.id) ? { ...m, status } : m)));
    };

    const toggleSelected = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
        // al desmarcar el último, se sale del modo selección en móvil
        if (!visibleMessages.some((m) => next.has(m.id))) setMobileSelecting(false);
    };

    const toggleAllVisible = () => {
        const next = new Set(selectedIds);
        visibleMessages.forEach((m) => (allVisibleSelected ? next.delete(m.id) : next.add(m.id)));
        setSelectedIds(next);
    };

    const selectedVisibleIds = selectedVisible.map((m) => m.id);

    const bulkMarkRead = (value: boolean) => {
        if (value) markRead(selectedVisibleIds);
        else markUnread(selectedVisibleIds);
        clearSelection();
    };

    const bulkStatus = (status: InboxStatus) => {
        updateStatus(selectedVisibleIds, status);
        clearSelection();
    };

    // Mantener pulsada una fila en móvil activa la selección
    const handlePressStart = (id: string, e: ReactPointerEvent) => {
        longPressFired.current = false;
        longPressStart.current = { x: e.clientX, y: e.clientY };
        longPressTimer.current = setTimeout(() => {
            longPressFired.current = true;
            setMobileSelecting(true);
            setSelectedIds((prev) => new Set(prev).add(id));
            navigator.vibrate?.(30);
        }, LONG_PRESS_MS);
    };

    const handlePressMove = (e: ReactPointerEvent) => {
        // si el dedo se mueve es que está haciendo scroll
        const start = longPressStart.current;
        if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 10) cancelPress();
    };

    const cancelPress = () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
        longPressStart.current = null;
    };

    // En móvil el enlace solo navega si no se está seleccionando
    const handleMobileClick = (m: InboxMessage, e: ReactMouseEvent) => {
        if (longPressFired.current) {
            e.preventDefault();
            longPressFired.current = false;
            return;
        }
        if (inMobileSelect) {
            e.preventDefault();
            toggleSelected(m.id);
            return;
        }
        markRead([m.id]);
    };

    const senderName = (m: InboxMessage) => m.name ?? m.user?.username ?? m.email;

    // Punto rojo y texto para lectores de pantalla en los no leídos
    const renderName = (m: InboxMessage) => (
        <>
            {!isRead(m) && <span className="pending-dot inbox-unread-dot" aria-hidden="true" />}
            {senderName(m)}
            {!isRead(m) && <span className="sr-only"> (no leído)</span>}
        </>
    );

    const renderAvatar = (m: InboxMessage) =>
        m.user ? (
            <img src={m.user.avatar} alt="" className="user-avatar inbox-avatar" />
        ) : (
            <span className="user-avatar inbox-avatar inbox-avatar-initial" aria-hidden="true">
                {senderName(m).replace('@', '').charAt(0).toUpperCase()}
            </span>
        );

    const menuItems = (m: InboxMessage): MoreMenuItem[] => [
        { label: 'Responder', href: `/admin/inbox/${m.id}#reply` },
        isRead(m)
            ? { label: 'Marcar como no leído', onClick: () => markUnread([m.id]) }
            : { label: 'Marcar como leído', onClick: () => markRead([m.id]) },
        ...(m.user ? [{ label: 'Ver usuario', href: `/admin/users/${m.user.id}` }] : []),
        'divider',
        { heading: 'Cambiar estado' },
        ...statusesFor(m.type).map((s) => ({
            label: s,
            checked: m.status === s,
            onClick: () => updateStatus([m.id], s),
        })),
    ];

    const emptyMessage = (
        <div className="admin-empty-message">
            <p>
                {statusFilter === 'open' && !search && !categoryFilter && !dateFilter
                    ? 'No hay mensajes abiertos. ¡Todo al día!'
                    : 'No se encontraron mensajes con los filtros aplicados.'}
            </p>
        </div>
    );

    const showType = tab === 'all';
    const gridClass = `inbox-grid ${showType ? 'with-type' : ''}`;
    const totalUnread = unreadCount('all');

    return (
        <div className="admin-list-container">
            <header className="admin-list-header">
                <h1 className="page-title">Bandeja</h1>
                <p>
                    {messages.length} mensajes en total
                    {totalUnread > 0 && ` · ${totalUnread} sin leer`}
                </p>
            </header>

            <nav className="admin-tabs" aria-label="Tipo de mensaje">
                {TABS.map((t) => {
                    const count = unreadCount(t.value);
                    return (
                        <button
                            key={t.value}
                            type="button"
                            className={`admin-tab ${tab === t.value ? 'active' : ''}`}
                            aria-pressed={tab === t.value}
                            onClick={() => changeTab(t.value)}
                        >
                            {t.label}
                            {count > 0 && (
                                <>
                                    <span className="admin-tab-count" aria-hidden="true">
                                        {count}
                                    </span>
                                    <span className="sr-only">({count} sin leer)</span>
                                </>
                            )}
                        </button>
                    );
                })}
            </nav>

            <section className="admin-list-toolbar">
                <div className="search-and-mobile-filter">
                    <SearchBar
                        placeholder="Busca por nombre, email o texto..."
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
                    resultCount={visibleMessages.length}
                >
                    <div className="admin-filters-group">
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Estado</span>
                            <Select
                                options={statusOptionsFor(tab)}
                                value={statusFilter}
                                onChange={setStatusFilter}
                                placeholder="Estado"
                            />
                        </div>
                        {tab !== 'all' && (
                            <div className="admin-filter-field">
                                <span className="admin-filter-label">{tab === 'contact' ? 'Motivo' : 'Categoría'}</span>
                                <Select
                                    options={categoryOptionsFor(tab)}
                                    value={categoryFilter}
                                    onChange={(val) => setCategoryFilter(val === 'all' ? '' : val)}
                                    placeholder={tab === 'contact' ? 'Motivo' : 'Categoría'}
                                />
                            </div>
                        )}
                        <div className="admin-filter-field">
                            <span className="admin-filter-label">Fecha</span>
                            <Select
                                options={DATE_OPTIONS}
                                value={dateFilter}
                                onChange={(val) => setDateFilter(val === 'all' ? '' : val)}
                                placeholder="Fecha"
                            />
                        </div>
                        {/* solo en móvil: en escritorio se ordena con la cabecera Fecha */}
                        <div className="admin-filter-field admin-sort-field">
                            <span className="admin-filter-label">Ordenar por</span>
                            <Select
                                options={SORT_OPTIONS}
                                value={sortDir}
                                onChange={(val) => setSortDir(val as SortDir)}
                                placeholder="Ordenar por"
                            />
                        </div>
                    </div>
                </FilterSheet>
            </section>

            {isSelecting && (
                <div className="inbox-bulk-bar" role="toolbar" aria-label="Acciones para los seleccionados">
                    <span className="inbox-bulk-count">
                        {selectedVisible.length} {selectedVisible.length === 1 ? 'seleccionado' : 'seleccionados'}
                    </span>
                    <div className="inbox-bulk-actions">
                        <button type="button" className="inbox-bulk-btn" onClick={() => bulkMarkRead(true)}>
                            Marcar como leídos
                        </button>
                        <button type="button" className="inbox-bulk-btn" onClick={() => bulkMarkRead(false)}>
                            Marcar como no leídos
                        </button>
                        {selectedType ? (
                            <Select
                                className="inbox-bulk-status"
                                options={statusesFor(selectedType).map((s) => ({ value: s, label: s }))}
                                value=""
                                onChange={(val) => bulkStatus(val as InboxStatus)}
                                placeholder="Cambiar estado"
                            />
                        ) : (
                            <span className="inbox-bulk-hint">Para cambiar el estado, elige mensajes del mismo tipo</span>
                        )}
                    </div>
                    <button type="button" className="inbox-bulk-close" onClick={clearSelection} aria-label="Quitar selección">
                        ✕
                    </button>
                </div>
            )}

            <section className="admin-table-desktop">
                <div className={`admin-table-header ${gridClass}`}>
                    <span className="inbox-check-cell">
                        <input
                            type="checkbox"
                            className="inbox-checkbox"
                            checked={allVisibleSelected}
                            ref={(el) => {
                                if (el) el.indeterminate = isSelecting && !allVisibleSelected;
                            }}
                            onChange={toggleAllVisible}
                            aria-label="Seleccionar todos"
                        />
                    </span>
                    <span className="inbox-col-left">Autor</span>
                    {showType && <span className="center-col">Tipo</span>}
                    <span className="inbox-col-left">Mensaje</span>
                    <span className="center-col">
                        {tab === 'contact' ? 'Motivo' : tab === 'suggestion' ? 'Categoría' : 'Motivo / categoría'}
                    </span>
                    <span className="center-col">Estado</span>
                    <span className="center-col col-date" aria-sort={sortDir === 'asc' ? 'ascending' : 'descending'}>
                        <button
                            type="button"
                            className="sort-header-btn active"
                            onClick={() => setSortDir((d) => (d === 'desc' ? 'asc' : 'desc'))}
                        >
                            Fecha
                            <span className="sort-arrow" aria-hidden="true">{sortDir === 'asc' ? '▲' : '▼'}</span>
                        </button>
                    </span>
                    <span>
                        <span className="sr-only">Acciones</span>
                    </span>
                </div>
                <div className="admin-table-body">
                    {visibleMessages.map((m) => (
                        // El enlace del nombre cubre toda la fila (.admin-row-link); la casilla y el ⋮ quedan encima
                        <div
                            key={m.id}
                            className={`admin-table-row ${gridClass} ${isRead(m) ? '' : 'is-unread'} ${selectedIds.has(m.id) ? 'is-selected' : ''}`}
                        >
                            <span className="inbox-check-cell">
                                <input
                                    type="checkbox"
                                    className="inbox-checkbox"
                                    checked={selectedIds.has(m.id)}
                                    onChange={() => toggleSelected(m.id)}
                                    aria-label={`Seleccionar mensaje de ${senderName(m)}`}
                                />
                            </span>
                            <div className="user-cell">
                                {renderAvatar(m)}
                                <div className="user-names">
                                    <Link
                                        href={`/admin/inbox/${m.id}`}
                                        className="user-fullname admin-row-link"
                                        onClick={() => markRead([m.id])}
                                    >
                                        {renderName(m)}
                                    </Link>
                                    <span className="user-handle">{m.user && m.name ? m.user.username : m.email}</span>
                                </div>
                            </div>
                            {showType && <span className="center-col cell-text inbox-type">{TYPE_LABEL[m.type]}</span>}
                            <span className="cell-text inbox-excerpt">{m.message}</span>
                            <span className="center-col cell-text">{m.category}</span>
                            <span className={`center-col cell-text inbox-status ${statusClass(m.status)}`}>{m.status}</span>
                            <span className="center-col cell-text col-date">{formatDate(m.createdAt)}</span>
                            <MoreMenu
                                className="admin-row-menu"
                                items={menuItems(m)}
                                label={`Acciones del mensaje de ${senderName(m)}`}
                            />
                        </div>
                    ))}
                    {visibleMessages.length === 0 && emptyMessage}
                </div>
            </section>

            <section className="admin-list-mobile">
                {visibleMessages.map((m) => {
                    const selected = selectedIds.has(m.id);
                    return (
                        <Link
                            href={`/admin/inbox/${m.id}`}
                            key={m.id}
                            className={`admin-mobile-row inbox-mobile-row ${isRead(m) ? '' : 'is-unread'} ${selected ? 'is-selected' : ''}`}
                            onClick={(e) => handleMobileClick(m, e)}
                            onPointerDown={(e) => handlePressStart(m.id, e)}
                            onPointerMove={handlePressMove}
                            onPointerUp={cancelPress}
                            onPointerLeave={cancelPress}
                            onPointerCancel={cancelPress}
                            onContextMenu={(e) => e.preventDefault()}
                        >
                            <div className="admin-mobile-left">
                                {/* al seleccionar, el avatar se cambia por el círculo de marcado */}
                                {inMobileSelect ? (
                                    <span className={`inbox-mobile-check ${selected ? 'checked' : ''}`} aria-hidden="true">
                                        {selected ? '✓' : ''}
                                    </span>
                                ) : (
                                    renderAvatar(m)
                                )}
                                <div className="user-names">
                                    <span className="user-fullname">
                                        {renderName(m)}
                                        {inMobileSelect && selected && <span className="sr-only"> (seleccionado)</span>}
                                    </span>
                                    <span className="user-handle">{m.message}</span>
                                </div>
                            </div>
                            <div className="admin-mobile-right">
                                <div className="admin-mobile-status inbox-mobile-status">
                                    <span className="mobile-status-text">{m.category}</span>
                                    <span className={`inbox-mobile-state inbox-status ${statusClass(m.status)}`}>{m.status}</span>
                                </div>
                                {!inMobileSelect && (
                                    <span className="mobile-chevron" aria-hidden="true">
                                        ›
                                    </span>
                                )}
                            </div>
                        </Link>
                    );
                })}
                {visibleMessages.length === 0 && emptyMessage}
            </section>

            {/* TODO: paginación de maqueta hasta que haya backend */}
            <nav className="admin-pagination" aria-label="Paginación de la bandeja">
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
