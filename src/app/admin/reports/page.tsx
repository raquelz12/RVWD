'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import SearchBar from '../../../../components/SearchBar/SearchBar';
import Select from '../../../../components/Select/Select';
import Dot from '../../../../components/Dot/Dot';
import './reports.css';

interface AdminReport {
    id: string;
    userId: string;
    contentId: string;
    name: string;
    username: string;
    avatar: string;
    status: 'En revisión' | 'Descartada' | 'Suspendido' | 'Aplicada';
    reason: 'Spam' | 'Palabras inapropiadas' | 'Mal uso' | 'Acoso';
    sanctions: number;
    contentType: 'Comentario' | 'RVW' | 'Perfil';
    createdAt: string;
}

const MOCK_REPORTS: AdminReport[] = [
    { id: '1', userId: '1', contentId: 'post123', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'En revisión', reason: 'Spam', sanctions: 2, contentType: 'Comentario', createdAt: '12/03/2027' },
    { id: '2', userId: '1', contentId: 'post124', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'Descartada', reason: 'Palabras inapropiadas', sanctions: 2, contentType: 'RVW', createdAt: '12/03/2027' },
    { id: '3', userId: '1', contentId: 'post125', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'Suspendido', reason: 'Mal uso', sanctions: 2, contentType: 'Comentario', createdAt: '12/03/2027' },
    { id: '4', userId: '1', contentId: 'post126', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'En revisión', reason: 'Spam', sanctions: 2, contentType: 'RVW', createdAt: '12/03/2027' },
    { id: '5', userId: '1', contentId: 'post127', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'Aplicada', reason: 'Spam', sanctions: 2, contentType: 'RVW', createdAt: '12/03/2027' },
    { id: '6', userId: '1', contentId: 'post128', name: 'Raquel Arnaiz', username: '@raquelz.12204', avatar: '/placeholderCards.png', status: 'En revisión', reason: 'Mal uso', sanctions: 2, contentType: 'RVW', createdAt: '12/03/2027' },
];

const STATUS_OPTIONS = [
    { value: 'all', label: 'Todos' },
    { value: 'En revisión', label: 'En revisión' },
    { value: 'Aplicada', label: 'Aplicada' },
    { value: 'Descartada', label: 'Descartada' },
    { value: 'Suspendido', label: 'Suspendido' },
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

const DATE_OPTIONS = [
    { value: 'all', label: 'Todas' },
    { value: 'today', label: 'Hoy' },
    { value: 'week', label: 'Últimos 7 días' },
    { value: 'month', label: 'Último mes' },
];

export default function AdminReportsPage() {
    const router = useRouter();
    const [reports, setReports] = useState<AdminReport[]>(MOCK_REPORTS);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [reasonFilter, setReasonFilter] = useState('');
    const [sanctionFilter, setSanctionFilter] = useState('');
    const [contentFilter, setContentFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [showMobileFilters, setShowMobileFilters] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);

    // Control del menú de 3 puntos por fila
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

    const filteredReports = reports.filter((report) => {
        const matchesSearch =
            report.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            report.username.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter && statusFilter !== 'all' ? report.status === statusFilter : true;
        const matchesReason = reasonFilter && reasonFilter !== 'all' ? report.reason === reasonFilter : true;
        const matchesSanction = sanctionFilter && sanctionFilter !== 'all' ? report.sanctions === Number(sanctionFilter) : true;
        const matchesContent = contentFilter && contentFilter !== 'all' ? report.contentType === contentFilter : true;

        return matchesSearch && matchesStatus && matchesReason && matchesSanction && matchesContent;
    });

    const handleQuickStatusChange = (id: string, newStatus: AdminReport['status']) => {
        setReports((prev) =>
            prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
        );
        setOpenMenuId(null);
    };

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
        <div className="admin-reports-container">
            <header className="admin-reports-header">
                <h1>Denuncias</h1>
                <p>{filteredReports.length} en total</p>
            </header>
            <section className="admin-reports-toolbar">
                <div className="search-and-mobile-filter">
                    <SearchBar
                        placeholder="Busca por usuario o nombre..."
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
                <div className={`reports-filters-group ${showMobileFilters ? 'mobile-visible' : ''}`}>
                    <Select
                        options={STATUS_OPTIONS}
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val === 'all' ? '' : val)}
                        placeholder="Estado"
                    />
                    <Select
                        options={REASON_OPTIONS}
                        value={reasonFilter}
                        onChange={(val) => setReasonFilter(val === 'all' ? '' : val)}
                        placeholder="Motivo"
                    />
                    <Select
                        options={SANCTION_OPTIONS}
                        value={sanctionFilter}
                        onChange={(val) => setSanctionFilter(val === 'all' ? '' : val)}
                        placeholder="Sanción"
                    />
                    <Select
                        options={CONTENT_OPTIONS}
                        value={contentFilter}
                        onChange={(val) => setContentFilter(val === 'all' ? '' : val)}
                        placeholder="Contenido"
                    />
                    <Select
                        options={DATE_OPTIONS}
                        value={dateFilter}
                        onChange={(val) => setDateFilter(val === 'all' ? '' : val)}
                        placeholder="Fecha"
                    />
                </div>
            </section>
            <section className="reports-table-desktop">
                <div className="reports-table-header">
                    <span>Usuario</span>
                    <span className="center-col">Estado</span>
                    <span className="center-col">Motivo</span>
                    <span className="center-col">Sanciones</span>
                    <span className="center-col">Contenido</span>
                    <span className="center-col">Fecha</span>
                    <span></span>
                </div>
                <div className="reports-table-body">
                    {filteredReports.map((report) => (
                        <div
                            key={report.id}
                            className="reports-table-row"
                            onClick={() => router.push(`/admin/denuncias/${report.id}`)}
                        >
                            <div className="user-cell">
                                <img src={report.avatar} alt={report.name} className="user-avatar" />
                                <div className="user-names">
                                    <span className="user-fullname">{report.name}</span>
                                    <span className="user-handle">{report.username}</span>
                                </div>
                            </div>
                            <span className="center-col cell-text">{report.status}</span>
                            <span className="center-col cell-text">{report.reason}</span>
                            <div className="center-col">{renderSanctions(report.sanctions)}</div>
                            <span className="center-col cell-text">{report.contentType}</span>
                            <span className="center-col cell-text">{report.createdAt}</span>
                            <div
                                className="row-menu-wrapper"
                                ref={openMenuId === report.id ? menuRef : null}
                                onClick={(e) => e.stopPropagation()}
                            >
                                <button
                                    className="row-menu-btn"
                                    onClick={() => setOpenMenuId(openMenuId === report.id ? null : report.id)}
                                    aria-label="Acciones de denuncia"
                                >
                                    ⋮
                                </button>
                                {openMenuId === report.id && (
                                    <div className="row-menu-dropdown">
                                        <Link href={`/admin/users/${report.userId}`} className="dropdown-item">
                                            Ver usuario
                                        </Link>
                                        <Link href={`/admin/contenido/${report.contentId}`} className="dropdown-item">
                                            Ver contenido
                                        </Link>
                                        <div className="dropdown-divider" />
                                        <button
                                            className="dropdown-item"
                                            onClick={() => handleQuickStatusChange(report.id, 'Aplicada')}
                                        >
                                            Marcar aplicada
                                        </button>
                                        <button
                                            className="dropdown-item danger"
                                            onClick={() => handleQuickStatusChange(report.id, 'Descartada')}
                                        >
                                            Descartar
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                    {filteredReports.length === 0 && (
                        <div className="no-reports-message">
                            <p>No se encontraron denuncias con los filtros aplicados.</p>
                        </div>
                    )}
                </div>
            </section>
            <section className="reports-list-mobile">
                {filteredReports.map((report) => (
                    <Link href={`/admin/denuncias/${report.id}`} key={report.id} className="report-mobile-row">
                        <div className="report-mobile-left">
                            <img src={report.avatar} alt={report.name} className="user-avatar" />
                            <div className="user-names">
                                <span className="user-fullname">{report.name}</span>
                                <span className="user-handle">{report.username}</span>
                            </div>
                        </div>

                        <div className="report-mobile-right">
                            <div className="report-mobile-status">
                                <span className="mobile-status-text">{report.status}</span>
                                {renderSanctions(report.sanctions)}
                            </div>
                            <span className="mobile-chevron">›</span>
                        </div>
                    </Link>
                ))}
                {filteredReports.length === 0 && (
                    <div className="no-reports-message">
                        <p>No se encontraron denuncias con los filtros aplicados.</p>
                    </div>
                )}
            </section>
            <nav className="reports-pagination" aria-label="Paginación de denuncias">
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