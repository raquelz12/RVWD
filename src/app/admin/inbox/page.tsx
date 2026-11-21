'use client';

import { useState, useRef, useEffect, useCallback, Suspense, type MouseEvent as ReactMouseEvent, type PointerEvent as ReactPointerEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import FilterSheet from '../../../../components/FilterSheet/FilterSheet';
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
import { DATE_OPTIONS, formatDate, matchesDate } from '@/app/lib/adminFilters';
import '../admin-shared.css';
import './inbox.css';

type Tab = 'all' | InboxType;

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

const statusOptionsFor = (tab: Tab) =>
    tab === 'all'
        ? ALL_TAB_STATUS_OPTIONS
        : [...BASE_STATUS_OPTIONS, ...statusesFor(tab).map((s) => ({ value: s, label: s }))];

const categoryOptionsFor = (tab: Tab) => {
    const list = tab === 'contact' ? CONTACT_REASONS : SUGGESTION_CATEGORIES;
    return [{ value: 'all', label: 'Todos' }, ...list.map((c) => ({ value: c, label: c }))];
};

const matchesStatus = (m: InboxMessage, filter: string) => {
    if (filter === 'open') return isOpen(m.status);
    if (filter === 'unread') return !m.read;
    if (filter === 'done') return isDone(m.status);
    if (filter === 'dismissed') return isDismissed(m.status);
    if (filter === 'all') return true;
    return m.status === filter;
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
// La key recrea el listado al cambiar los parámetros.
function AdminInboxWithQuery() {
    const searchParams = useSearchParams();
    const query = searchParams.get('q') ?? '';
    const tabParam = searchParams.get('tab');
    const tab: Tab = tabParam === 'contact' || tabParam === 'suggestion' ? tabParam : 'all';
    return <AdminInboxList key={`${query}|${tab}`} initialQuery={query} initialTab={tab} />;
}

function AdminInboxList({ initialQuery, initialTab }: { initialQuery: string; initialTab: Tab }) {
    const router = useRouter();
    const [messages, setMessages] = useState<InboxMessage[]>(MOCK_INBOX);
    const [tab, setTab] = useState<Tab>(initialTab);
    const [searchQuery, setSearchQuery] = useState(initialQuery);
    const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS);
    const [categoryFilter, setCategoryFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [sortDir, setSortDir] = useState<'desc' | 'asc'>('desc');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // selección múltiple
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
    const [mobileSelecting, setMobileSelecting] = useState(false);
    const longPressTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
    const longPressStart = useRef<{ x: number; y: number } | null>(null);
    const longPressFired = useRef(false);

    // menú de 3 puntos por fila
    const [openMenuId, setOpenMenuId] = useState<string | null>(null);
    const menuRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setOpenMenuId(null);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => () => {
        if (longPressTimer.current) clearTimeout(longPressTimer.current);
    }, []);

    const unreadCount = (t: Tab) => messages.filter((m) => !m.read && (t === 'all' || m.type === t)).length;

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

    const selectedMessages = messages.filter((m) => selectedIds.has(m.id));
    const selectedType = selectedMessages.every((m) => m.type === selectedMessages[0]?.type)
        ? selectedMessages[0]?.type
        : undefined;
    const allVisibleSelected = visibleMessages.length > 0 && visibleMessages.every((m) => selectedIds.has(m.id));
    const someVisibleSelected = visibleMessages.some((m) => selectedIds.has(m.id));

    const activeFiltersCount = [statusFilter !== DEFAULT_STATUS, categoryFilter, dateFilter].filter(Boolean).length;
    const closeFilters = useCallback(() => setShowMobileFilters(false), []);
    const clearFilters = () => {
        setStatusFilter(DEFAULT_STATUS);
        setCategoryFilter('');
        setDateFilter('');
    };

    const changeTab = (next: Tab) => {
        setTab(next);
        setCategoryFilter('');
        // los estados concretos de una pestaña no existen en las demás
        if (!statusOptionsFor(next).some((o) => o.value === statusFilter)) setStatusFilter(DEFAULT_STATUS);
        clearSelection();
        setCurrentPage(1);
    };

    const updateMessages = (ids: Iterable<string>, changes: Partial<InboxMessage>) => {
        const set = new Set(ids);
        setMessages((prev) => prev.map((m) => (set.has(m.id) ? { ...m, ...changes } : m)));
    };

    const clearSelection = () => {
        setSelectedIds(new Set());
        setMobileSelecting(false);
    };

    const toggleSelected = (id: string) => {
        const next = new Set(selectedIds);
        if (next.has(id)) next.delete(id);
        else next.add(id);
        setSelectedIds(next);
        // al desmarcar el último, se sale del modo selección en móvil
        if (next.size === 0) setMobileSelecting(false);
    };

    const toggleAllVisible = () => {
        const next = new Set(selectedIds);
        visibleMessages.forEach((m) => (allVisibleSelected ? next.delete(m.id) : next.add(m.id)));
        setSelectedIds(next);
    };

    // TODO: con backend, abrir marca como leído en el servidor
    const openMessage = (m: InboxMessage) => {
        if (!m.read) updateMessages([m.id], { read: true });
        router.push(`/admin/inbox/${m.id}`);
    };

    const bulkUpdate = (changes: Partial<InboxMessage>) => {
        updateMessages(selectedIds, changes);
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

    const handleMobileClick = (m: InboxMessage, e: ReactMouseEvent) => {
        e.preventDefault();
        if (longPressFired.current) {
            longPressFired.current = false;
            return;
        }
        if (mobileSelecting) toggleSelected(m.id);
        else openMessage(m);
    };

    const senderName = (m: InboxMessage) => m.name ?? m.user?.username ?? m.email;

    const renderSender = (m: InboxMessage) => (
        <div className="user-cell inbox-sender">
            {m.user ? (
                <img src={m.user.avatar} alt="" className="user-avatar inbox-avatar" />
            ) : (
                <span className="user-avatar inbox-avatar inbox-avatar-initial" aria-hidden="true">
                    {senderName(m).replace('@', '').charAt(0).toUpperCase()}
                </span>
            )}
            <div className="user-names">
                <span className="user-fullname">
                    {!m.read && <span className="pending-dot inbox-unread-dot" aria-label="No leído" />}
                    {senderName(m)}
                </span>
                <span className="user-handle">{m.user && m.name ? m.user.username : m.email}</span>
            </div>
        </div>
    );

    const statusMenu = (m: InboxMessage) => (
        <>
            <span className="dropdown-label">Cambiar estado</span>
            {statusesFor(m.type).map((s) => (
                <button
                    key={s}
                    className={`dropdown-item ${m.status === s ? 'is-current' : ''}`}
                    onClick={() => {
                        updateMessages([m.id], { status: s });
                        setOpenMenuId(null);
                    }}
                >
                    {s}
                    {m.status === s && <span aria-hidden="true">✓</span>}
                </button>
            ))}
        </>
    );

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
    const isSelecting = selectedIds.size > 0;

    return (
        <div className="admin-list-container">
            <header className="admin-list-header">
                <h1>Bandeja</h1>
                <p>{visibleMessages.length} en total</p>
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
                                <span className="admin-tab-count" aria-label={`${count} sin leer`}>
                                    {count}
                                </span>
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
                    </div>
                </FilterSheet>
            </section>

            {isSelecting && (
                <div className="inbox-bulk-bar" role="toolbar" aria-label="Acciones para los seleccionados">
                    <span className="inbox-bulk-count">
                        {selectedIds.size} {selectedIds.size === 1 ? 'seleccionado' : 'seleccionados'}
                    </span>
                    <div className="inbox-bulk-actions">
                        <button type="button" className="inbox-bulk-btn" onClick={() => bulkUpdate({ read: true })}>
                            Marcar como leídos
                        </button>
                        <button type="button" className="inbox-bulk-btn" onClick={() => bulkUpdate({ read: false })}>
                            Marcar como no leídos
                        </button>
                        {selectedType ? (
                            <Select
                                className="inbox-bulk-status"
                                options={statusesFor(selectedType).map((s) => ({ value: s, label: s }))}
                                value=""
                                onChange={(val) => bulkUpdate({ status: val as InboxStatus })}
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
                                if (el) el.indeterminate = someVisibleSelected && !allVisibleSelected;
                            }}
                            onChange={toggleAllVisible}
                            aria-label="Seleccionar todos"
                        />
                    </span>
                    <span className="inbox-col-left">Autor</span>
                    {showType && <span className="center-col">Tipo</span>}
                    <span className="inbox-col-left">Mensaje</span>
                    <span className="center-col">{tab === 'contact' ? 'Motivo' : tab === 'suggestion' ? 'Categoría' : 'Motivo'}</span>
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
                    <span></span>
                </div>
                <div className="admin-table-body">
                    {visibleMessages.map((m) => (
                        <div
                            key={m.id}
                            className={`admin-table-row ${gridClass} ${m.read ? '' : 'is-unread'} ${selectedIds.has(m.id) ? 'is-selected' : ''}`}
                            onClick={() => openMessage(m)}
                        >
                            <span className="inbox-check-cell" onClick={(e) => e.stopPropagation()}>
                                <input
                                    type="checkbox"
                                    className="inbox-checkbox"
                                    checked={selectedIds.has(m.id)}
                                    onChange={() => toggleSelected(m.id)}
                                    aria-label={`Seleccionar mensaje de ${senderName(m)}`}
                                />
                            </span>
                            {renderSender(m)}
                            {showType && <span className="center-col cell-text inbox-type">{TYPE_LABEL[m.type]}</span>}
                            <span className="cell-text inbox-excerpt">{m.message}</span>
                            <span className="center-col cell-text">{m.category}</span>
                            <span className={`center-col cell-text inbox-status ${statusClass(m.status)}`}>{m.status}</span>
                            <span className="center-col cell-text col-date">{formatDate(m.createdAt)}</span>
                            <div
                                className="row-menu-wrapper"
                                ref={openMenuId === m.id ? menuRef : null}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="more-menu-btn"
                                    onClick={() => setOpenMenuId(openMenuId === m.id ? null : m.id)}
                                    aria-label="Acciones del mensaje"
                                >
                                    ⋮
                                </button>
                                {openMenuId === m.id && (
                                    <div className="more-menu-dropdown align-right inbox-menu">
                                        <button className="dropdown-item" onClick={() => openMessage(m)}>
                                            Ver mensaje
                                        </button>
                                        <Link href={`/admin/inbox/${m.id}#reply`} className="dropdown-item">
                                            Responder
                                        </Link>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                updateMessages([m.id], { read: !m.read });
                                                setOpenMenuId(null);
                                            }}
                                        >
                                            {m.read ? 'Marcar como no leído' : 'Marcar como leído'}
                                        </button>
                                        {m.user && (
                                            <Link href={`/admin/users/${m.user.id}`} className="dropdown-item">
                                                Ver usuario
                                            </Link>
                                        )}
                                        <div className="dropdown-divider" />
                                        {statusMenu(m)}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {visibleMessages.length === 0 && emptyMessage}
                </div>
            </section>

            <section className={`admin-list-mobile ${mobileSelecting ? 'is-selecting' : ''}`}>
                {visibleMessages.map((m) => (
                    <Link
                        href={`/admin/inbox/${m.id}`}
                        key={m.id}
                        className={`admin-mobile-row inbox-mobile-row ${m.read ? '' : 'is-unread'} ${selectedIds.has(m.id) ? 'is-selected' : ''}`}
                        onClick={(e) => handleMobileClick(m, e)}
                        onPointerDown={(e) => handlePressStart(m.id, e)}
                        onPointerMove={handlePressMove}
                        onPointerUp={cancelPress}
                        onPointerLeave={cancelPress}
                        onPointerCancel={cancelPress}
                        onContextMenu={(e) => e.preventDefault()}
                        aria-pressed={mobileSelecting ? selectedIds.has(m.id) : undefined}
                    >
                        <div className="admin-mobile-left">
                            {mobileSelecting && (
                                <span className={`inbox-mobile-check ${selectedIds.has(m.id) ? 'checked' : ''}`} aria-hidden="true">
                                    {selectedIds.has(m.id) ? '✓' : ''}
                                </span>
                            )}
                            <div className="user-names">
                                <span className="user-fullname">
                                    {!m.read && <span className="pending-dot inbox-unread-dot" aria-label="No leído" />}
                                    {senderName(m)}
                                </span>
                                <span className="user-handle">{m.message}</span>
                            </div>
                        </div>
                        <div className="admin-mobile-right">
                            <div className="admin-mobile-status inbox-mobile-status">
                                <span className="mobile-status-text">{m.category}</span>
                                <span className={`inbox-mobile-state inbox-status ${statusClass(m.status)}`}>{m.status}</span>
                            </div>
                            {!mobileSelecting && <span className="mobile-chevron">›</span>}
                        </div>
                    </Link>
                ))}
                {visibleMessages.length === 0 && emptyMessage}
            </section>

            <nav className="admin-pagination" aria-label="Paginación de la bandeja">
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
        </div>
    );
}
