'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import FilterSheet from '../../../../components/FilterSheet/FilterSheet';
import SanctionDots from '../SanctionDots';
import { formatDate } from '@/app/lib/adminFilters';
import { MOCK_USERS, STATUS_CLASS, type AdminUser } from './mockUsers';
import '../admin-shared.css';
import './users.css';

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'Activo', label: 'Activo' },
    { value: 'Suspendido', label: 'Suspendido' },
    { value: 'Baneado', label: 'Baneado' },
];

const ROLE_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'Usuario', label: 'Usuario' },
    { value: 'Moderador', label: 'Moderador' },
    { value: 'Admin', label: 'Admin' },
];

const SANCTION_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: '0', label: '0/3' },
    { value: '1', label: '1/3' },
    { value: '2', label: '2/3' },
    { value: '3', label: '3/3' },
];

type SortKey = 'date' | 'reports' | 'sanctions';
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
    { value: 'reports-desc', label: 'Más denuncias' },
    { value: 'sanctions-desc', label: 'Más sanciones' },
];

const SORTABLE_COLUMNS: { key: SortKey; label: string; className?: string }[] = [
    { key: 'reports', label: 'Denuncias' },
    { key: 'sanctions', label: 'Sanciones' },
    { key: 'date', label: 'Fecha de alta', className: 'col-date' },
];

const sortValue = (user: AdminUser, key: SortKey) => {
    if (key === 'reports') return user.reportsReceived;
    if (key === 'sanctions') return user.sanctions.length;
    return new Date(user.createdAt).getTime();
};

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [sanctionFilter, setSanctionFilter] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [sort, setSort] = useState<SortState>(DEFAULT_SORT);

    const query = searchQuery.toLowerCase();
    const filteredUsers = MOCK_USERS.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(query) ||
            user.username.toLowerCase().includes(query) ||
            user.email.toLowerCase().includes(query);

        const matchesStatus = statusFilter ? user.status === statusFilter : true;
        const matchesRole = roleFilter ? user.role === roleFilter : true;
        const matchesSanction = sanctionFilter ? user.sanctions.length === Number(sanctionFilter) : true;

        return matchesSearch && matchesStatus && matchesRole && matchesSanction;
    }).sort((a, b) => {
        const diff = sortValue(a, sort.key) - sortValue(b, sort.key);
        return sort.dir === 'asc' ? diff : -diff;
    });

    // Primer clic: de mayor a menor; segundo clic en la misma columna: al revés
    const toggleSort = (key: SortKey) => {
        setSort((prev) =>
            prev.key === key ? { key, dir: prev.dir === 'desc' ? 'asc' : 'desc' } : { key, dir: 'desc' }
        );
    };

    const activeFiltersCount = [statusFilter, roleFilter, sanctionFilter].filter(Boolean).length;
    const closeFilters = useCallback(() => setShowMobileFilters(false), []);
    const clearFilters = () => {
        setStatusFilter('');
        setRoleFilter('');
        setSanctionFilter('');
    };

    return (
        <div className="admin-list-container">
            <header className="admin-list-header">
                <h1 className="page-title">Usuarios</h1>
                <p>{MOCK_USERS.length} usuarios en total</p>
            </header>
            <section className="admin-list-toolbar">
                <div className="search-and-mobile-filter">
                    <SearchBar
                        placeholder="Busca por usuario, email o nombre..."
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
                    resultCount={filteredUsers.length}
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
                            <span className="admin-filter-label">Rol</span>
                            <Select
                                options={ROLE_OPTIONS}
                                value={roleFilter}
                                onChange={(val) => setRoleFilter(val === 'all' ? '' : val)}
                                placeholder="Rol"
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
            <section className="admin-table-desktop">
                <div className="admin-table-header users-grid">
                    <span>Usuario</span>
                    <span className="center-col">Estado</span>
                    <span className="center-col">Rol</span>
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
                </div>

                <div className="admin-table-body">
                    {filteredUsers.map((user) => (
                        <Link href={`/admin/users/${user.id}`} key={user.id} className="admin-table-row users-grid">
                            <div className="user-cell">
                                <img src={user.avatar} alt="" className="user-avatar" />
                                <div className="user-names">
                                    <span className="user-fullname">{user.name}</span>
                                    <span className="user-handle">{user.username}</span>
                                </div>
                            </div>
                            <span className={`center-col cell-text user-status ${STATUS_CLASS[user.status]}`}>{user.status}</span>
                            <span className="center-col cell-text">{user.role}</span>
                            <span className="center-col cell-text">{user.reportsReceived}</span>
                            <div className="center-col">
                                <SanctionDots count={user.sanctions.length} />
                            </div>
                            <span className="center-col cell-text col-date">{formatDate(user.createdAt)}</span>
                        </Link>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="admin-empty-message">
                            <p>No se encontraron usuarios con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </section>
            <section className="admin-list-mobile">
                {filteredUsers.map((user) => (
                    <Link href={`/admin/users/${user.id}`} key={user.id} className="admin-mobile-row">
                        <div className="admin-mobile-left">
                            <img src={user.avatar} alt="" className="user-avatar" />
                            <div className="user-names">
                                <span className="user-fullname">{user.name}</span>
                                <span className="user-handle">{user.username}</span>
                            </div>
                        </div>

                        <div className="admin-mobile-right">
                            <div className="admin-mobile-status">
                                <span className={`mobile-status-text user-status ${STATUS_CLASS[user.status]}`}>{user.status}</span>
                                <SanctionDots count={user.sanctions.length} />
                            </div>
                            <span className="mobile-chevron" aria-hidden="true">›</span>
                        </div>
                    </Link>
                ))}
                {filteredUsers.length === 0 && (
                    <div className="admin-empty-message">
                        <p>No se encontraron usuarios con los filtros aplicados.</p>
                    </div>
                )}
            </section>
            {/* TODO: paginación de maqueta hasta que haya backend */}
            <nav className="admin-pagination" aria-label="Paginación de usuarios">
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
