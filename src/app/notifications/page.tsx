'use client';

import { useState, type ReactNode } from 'react';
import Link from 'next/link';
import Dot from '../../../components/Dot/Dot';
import Button from '../../../components/Button/Button';
import './notifications.css';
import Rvw from '../../../components/Rvw/Rvw';

interface NotificationData {
    id: number;
    user: string;
    date: string;
    text: ReactNode;
    read: boolean;
    /** Reseña de la que habla la notificación */
    href: string;
}

const RVW = <Rvw>RVW</Rvw>;

// Las recientes son las mismas que enseña el desplegable de la campana
const recentNotifications: NotificationData[] = [
    { id: 1, user: '@raquelz.12204', date: 'Hace 5m', text: <>Puso un comentario en tu {RVW} de <strong>No pasa nada hombre.</strong></>, read: false, href: '/reviews/123' },
    { id: 2, user: '@clarent', date: 'Hace 1h', text: <>Dio fav a tu comentario en tu {RVW} de <strong>No pasa nada hombre.</strong></>, read: false, href: '/reviews/123' },
    { id: 3, user: '@juanp', date: 'Hace 2h', text: <>Dio fav a tu {RVW} de <strong>No pasa nada hombre.</strong></>, read: true, href: '/reviews/123' },
];

const olderNotifications: NotificationData[] = [
    { id: 4, user: '@raquelz.12204', date: '12 sep', text: <>Puso un comentario en tu {RVW} de <strong>No pasa nada hombre.</strong></>, read: true, href: '/reviews/123' },
    { id: 5, user: '@clarent', date: '3 sep', text: <>Dio fav a tu {RVW} de <strong>No pasa nada hombre.</strong></>, read: true, href: '/reviews/123' },
    { id: 6, user: '@juanp', date: '28 ago', text: <>Puso un comentario en tu {RVW} de <strong>No pasa nada hombre.</strong></>, read: true, href: '/reviews/123' },
];

const followRequests = [
    { id: 7, user: '@raquelz.12204', date: 'Hace 1h', read: false },
    { id: 8, user: '@clarent', date: 'Ayer', read: false },
    { id: 9, user: '@juanp', date: 'Hace 3 días', read: true },
];

function NotificationItem({ notif }: { notif: NotificationData }) {
    return (
        <Link href={notif.href} className="notif-item">
            <img src="/placeholderCards.png" alt="Portada" className="notif-cover" />
            <div className="notif-content-wrapper">
                <div className="notif-item-header">
                    <img src="/placeholder.png" alt="Avatar" className="notif-avatar" />
                    <span className="notif-username">{notif.user}</span>
                    <span className="notif-date">{notif.date}</span>
                    {!notif.read && <div className="notif-dot-wrapper"><Dot type="filled" /></div>}
                </div>
                <p className="notif-text">{notif.text}</p>
            </div>
        </Link>
    );
}

export default function Notifications() {
    // Estado para controlar la vista en MÓVIL ('main' = notificaciones, 'requests' = solicitudes)
    const [activeMobileView, setActiveMobileView] = useState<'main' | 'requests'>('main');
    const hasUnreadRequests = followRequests.some((req) => !req.read);

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1 className="page-title notifications-title">
                    {activeMobileView === 'requests' ? 'Solicitudes' : 'Tus notificaciones'}
                </h1>
                <p className="notifications-description">Se borrarán en 30 días una vez leídas</p>
            </div>
            {/* BOTONES DE NAVEGACIÓN MÓVIL */}
            {activeMobileView === 'main' ? (
                <button className="mobile-follow-requests" onClick={() => setActiveMobileView('requests')}>
                    Ver solicitudes de seguimiento{hasUnreadRequests && <Dot type="filled" />}
                </button>
            ) : (
                <button className="mobile-back-requests" onClick={() => setActiveMobileView('main')}>
                    ‹ Volver a notificaciones
                </button>
            )}
            <div className="notifications-columns-wrapper">
                {/* COLUMNA IZQUIERDA: Actividad (Se oculta en móvil si estamos viendo solicitudes) */}
                <div className={`notifications-main-column ${activeMobileView === 'requests' ? 'hide-on-mobile' : ''}`}>
                    <div className="notifications-column-section">
                        <h2 className="section-title notifications-column-title">Últimos 30 días</h2>
                        <div className="notifications-list">
                            {recentNotifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)}
                        </div>
                    </div>
                    <div className="notifications-column-section">
                        <h2 className="section-title notifications-column-title">Anteriores</h2>
                        <div className="notifications-list">
                            {olderNotifications.map(notif => <NotificationItem key={notif.id} notif={notif} />)}
                        </div>
                    </div>
                </div>
                {/* COLUMNA DERECHA: Solicitudes (Se oculta en móvil si estamos viendo notificaciones) */}
                <div className={`notifications-side-column ${activeMobileView === 'main' ? 'hide-on-mobile' : ''}`}>
                    <div className="notifications-column-section">
                        <h2 className="section-title notifications-column-title desktop-only-title">Solicitudes de seguimiento</h2>
                        <div className="notifications-list">
                            {followRequests.map(req => (
                                <div key={req.id} className="follow-request-item">
                                    <div className="notif-item-header">
                                        <img src="/placeholder.png" alt="Avatar" className="notif-avatar" />
                                        <span className="notif-username">{req.user}</span>
                                        <span className="notif-date">{req.date}</span>
                                        {!req.read && <div className="notif-dot-wrapper"><Dot type="filled" /></div>}
                                    </div>
                                    <p className="follow-request-text">Ha solicitado seguirte.</p>
                                    <div className="follow-request-actions">
                                        <Button variant="primary" className="btn-small">Aceptar</Button>
                                        <Button variant="text" className="btn-small">Rechazar</Button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
}