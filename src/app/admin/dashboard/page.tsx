'use client';

import Link from 'next/link';
import './dashboard.css';

export default function AdminDashboard() {
    // Datos de prueba basados en tu diseño
    const stats = [
        { label: 'Usuarios nuevos', value: 67 },
        { label: 'Mensajes de contacto', value: 7 },
        { label: 'Sugerencias', value: 9 },
        { label: 'Denuncias abiertas', value: 12 },
    ];

    const denuncias = [
        { id: 1, title: 'Publicación ofensiva', user: '@quevedo', time: 'Hace 10 min' },
        { id: 2, title: 'Spam', user: '@quevedo', time: 'Hace 10 min' },
        { id: 3, title: 'Publicación ofensiva', user: '@quevedo', time: 'Hace 10 min' },
        { id: 4, title: 'Publicación ofensiva', user: '@quevedo', time: 'Hace 10 min' },
        { id: 5, title: 'Publicación ofensiva', user: '@quevedo', time: 'Hace 10 min' },
    ];

    const sugerencias = [
        { id: 1, title: 'Modo oscuro', user: '@quevedo', time: 'Hace 10 min', status: 'En estudio', highlighted: false },
        { id: 2, title: 'Carita sonriente', user: '@quevedo', time: 'Hace 10 min', status: 'En desarrollo', highlighted: false },
        { id: 3, title: 'Filtro por etiquetas', user: '@quevedo', time: 'Hace 10 min', status: 'En desarrollo', highlighted: false },
    ];

    // Alturas en porcentaje para el gráfico de los últimos 7 días
    const chartData = [
        { day: 'Lun', height: 48, isPeak: false },
        { day: 'Mar', height: 78, isPeak: false },
        { day: 'Mié', height: 24, isPeak: false },
        { day: 'Jue', height: 100, isPeak: true },
        { day: 'Vie', height: 62, isPeak: false },
        { day: 'Sáb', height: 48, isPeak: false },
        { day: 'Dom', height: 78, isPeak: false },
    ];

    return (
        <div className="admin-dashboard-container">
            <header className="admin-greeting">
                <h1>Buenos días, Raquel.</h1>
                <p>¿Buen día para ser admin verdad?</p>
            </header>
            <section className="admin-kpis-grid">
                {stats.map((stat, index) => (
                    <div key={index} className="kpi-item">
                        <span className="kpi-label">{stat.label}</span>
                        <span className="kpi-value">{stat.value}</span>
                    </div>
                ))}
            </section>
            <section className="admin-lists-grid">
                <div className="admin-list-column">
                    <h2 className="admin-section-title">Cola de denuncias</h2>
                    <div className="admin-list-items">
                        {denuncias.map((item) => (
                            <div key={item.id} className="admin-list-row">
                                <div className="row-info">
                                    <span className="row-title">{item.title}</span>
                                    <span className="row-meta">{item.user} &nbsp; {item.time}</span>
                                </div>
                                <div className="row-actions">
                                    <button className="icon-action-btn" title="Ocultar publicación">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path>
                                            <line x1="1" y1="1" x2="23" y2="23"></line>
                                        </svg>
                                    </button>
                                    <button className="icon-action-btn" title="Ver usuario">
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                                            <circle cx="12" cy="7" r="4"></circle>
                                        </svg>
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="list-footer">
                        <Link href="/admin/denuncias" className="ver-todas-link">Ver Todas</Link>
                    </div>
                </div>
                <div className="admin-list-column">
                    <h2 className="admin-section-title">Sugerencias recientes</h2>
                    <div className="admin-list-items">
                        {sugerencias.map((item) => (
                            <div key={item.id} className={`admin-list-row ${item.highlighted ? 'highlighted' : ''}`}>
                                <div className="row-info">
                                    <span className="row-title">{item.title}</span>
                                    <span className="row-meta">{item.user} &nbsp; {item.time}</span>
                                </div>
                                <div className="row-status">
                                    <span>{item.status}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="list-footer">
                        <Link href="/admin/sugerencias" className="ver-todas-link">Ver Todas</Link>
                    </div>
                </div>
            </section>
            <section className="admin-chart-section">
                <div className="chart-header">
                    <h2 className="admin-section-title">Usuarios nuevos</h2>
                    <span className="chart-subtitle">Últimos 7 días</span>
                </div>
                <div className="bar-chart-container">
                    {chartData.map((bar, index) => (
                        <div key={index} className="bar-column" title={`${bar.day}: ${bar.height}%`}>
                            <div
                                className={`bar-fill ${bar.isPeak ? 'peak' : ''}`}
                                style={{ height: `${bar.height}%` }}
                            ></div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}