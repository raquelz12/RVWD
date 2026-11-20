'use client';

import { useState } from 'react';
import Link from 'next/link';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import Dot from '../../../../components/Dot/Dot';
import './users.css';

interface AdminUser {
    id: string;
    name: string;
    username: string;
    email: string;
    avatar: string;
    status: 'Activo' | 'Suspendido' | 'Baneado';
    role: 'Usuario' | 'Admin' | 'Moderador';
    reports: number;
    sanctions: number;
    createdAt: string;
}

const MOCK_USERS: AdminUser[] = [
    { id: '1', name: 'Raquel Arnaiz', username: '@raquelz.12204', email: 'raquel@rvwd.com', avatar: '/placeholderCards.png', status: 'Activo', role: 'Usuario', reports: 3, sanctions: 2, createdAt: '12/03/2027' },
    { id: '2', name: 'Raquel Arnaiz', username: '@raquelz.12204', email: 'admin@rvwd.com', avatar: '/placeholderCards.png', status: 'Activo', role: 'Admin', reports: 3, sanctions: 2, createdAt: '12/03/2027' },
    { id: '3', name: 'Raquel Arnaiz', username: '@raquelz.12204', email: 'user3@rvwd.com', avatar: '/placeholderCards.png', status: 'Suspendido', role: 'Usuario', reports: 3, sanctions: 2, createdAt: '12/03/2027' },
    { id: '4', name: 'Raquel Arnaiz', username: '@raquelz.12204', email: 'mod@rvwd.com', avatar: '/placeholderCards.png', status: 'Activo', role: 'Moderador', reports: 3, sanctions: 2, createdAt: '12/03/2027' },
    { id: '5', name: 'Raquel Arnaiz', username: '@raquelz.12204', email: 'user5@rvwd.com', avatar: '/placeholderCards.png', status: 'Activo', role: 'Usuario', reports: 3, sanctions: 2, createdAt: '12/03/2027' },
    { id: '6', name: 'Raquel Arnaiz', username: '@raquelz.12204', email: 'banned@rvwd.com', avatar: '/placeholderCards.png', status: 'Baneado', role: 'Usuario', reports: 3, sanctions: 2, createdAt: '12/03/2027' },
];

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

export default function AdminUsersPage() {
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [sanctionFilter, setSanctionFilter] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    const filteredUsers = MOCK_USERS.filter((user) => {
        const matchesSearch =
            user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
            user.email.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter && statusFilter !== 'all' ? user.status === statusFilter : true;
        const matchesRole = roleFilter && roleFilter !== 'all' ? user.role === roleFilter : true;
        const matchesSanction = sanctionFilter && sanctionFilter !== 'all' ? user.sanctions === Number(sanctionFilter) : true;

        return matchesSearch && matchesStatus && matchesRole && matchesSanction;
    });

    const renderSanctions = (count: number) => (
        <div className="sanctions-wrapper">
            <div className="sanctions-dots">
                {[0, 1, 2].map((i) => (
                    <Dot key={i} type={i < count ? 'filled' : 'empty'} />
                ))}
            </div>
            <span className="sanctions-text">{count}/3</span>
        </div>
    );

    return (
        <div className="admin-users-container">
            <header className="admin-users-header">
                <h1>Usuarios</h1>
                <p>1.234 usuarios en total</p>
            </header>
            <section className="admin-users-toolbar">
                <div className="search-and-mobile-filter">
                    <SearchBar
                        placeholder="Busca por usuario, email o nombre..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                    <button
                        className={`mobile-filter-btn ${showMobileFilters ? 'active' : ''}`}
                        onClick={() => setShowMobileFilters(!showMobileFilters)}
                        aria-label="Mostrar filtros"
                    >
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3 4a1 1 0 0 1 1-1h16a1 1 0 0 1 .8 1.6L14 13.33V20a1 1 0 0 1-1.45.89l-2-1A1 1 0 0 1 10 19v-5.67L3.2 4.6A1 1 0 0 1 3 4z" />
                        </svg>
                    </button>
                </div>
                <div className={`users-filters-group ${showMobileFilters ? 'mobile-visible' : ''}`}>
                    <Select
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val === 'all' ? '' : val)}
                        placeholder="Estado"
                    />
                    <Select
                        options={ROLE_OPTIONS}
                        value={roleFilter}
                        onChange={(val) => setRoleFilter(val === 'all' ? '' : val)}
                        placeholder="Rol"
                    />
                    <Select
                        options={SANCTION_OPTIONS}
                        value={sanctionFilter}
                        onChange={(val) => setSanctionFilter(val === 'all' ? '' : val)}
                        placeholder="Sanción"
                    />
                </div>
            </section>
            <section className="users-table-desktop">
                <div className="users-table-header">
                    <span>Usuario</span>
                    <span className="center-col">Estado</span>
                    <span className="center-col">Rol</span>
                    <span className="center-col">Denuncias</span>
                    <span className="center-col">Sanciones</span>
                    <span className="center-col">Fecha creación</span>
                </div>

                <div className="users-table-body">
                    {filteredUsers.map((user) => (
                        <Link href={`/admin/users/${user.id}`} key={user.id} className="users-table-row">
                            <div className="user-cell">
                                <img src={user.avatar} alt={user.name} className="user-avatar" />
                                <div className="user-names">
                                    <span className="user-fullname">{user.name}</span>
                                    <span className="user-handle">{user.username}</span>
                                </div>
                            </div>
                            <span className="center-col cell-text">{user.status}</span>
                            <span className="center-col cell-text">{user.role}</span>
                            <span className="center-col cell-text">{user.reports}</span>
                            <div className="center-col">{renderSanctions(user.sanctions)}</div>
                            <span className="center-col cell-text">{user.createdAt}</span>
                        </Link>
                    ))}
                    {filteredUsers.length === 0 && (
                        <div className="no-users-message">
                            <p>No se encontraron usuarios con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </section>
            <section className="users-list-mobile">
                {filteredUsers.map((user) => (
                    <Link href={`/admin/users/${user.id}`} key={user.id} className="user-mobile-row">
                        <div className="user-mobile-left">
                            <img src={user.avatar} alt={user.name} className="user-avatar" />
                            <div className="user-names">
                                <span className="user-fullname">{user.name}</span>
                                <span className="user-handle">{user.username}</span>
                            </div>
                        </div>

                        <div className="user-mobile-right">
                            <div className="user-mobile-status">
                                <span className="mobile-status-text">{user.status}</span>
                                {renderSanctions(user.sanctions)}
                            </div>
                            <span className="mobile-chevron">›</span>
                        </div>
                    </Link>
                ))}
            </section>
            <nav className="users-pagination" aria-label="Paginación de usuarios">
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
                <button
                    className="page-btn"
                    onClick={() => setCurrentPage((p) => p + 1)}
                >
                    ›
                </button>
            </nav>
        </div>
    );
}