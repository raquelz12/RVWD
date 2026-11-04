'use client';

import { useState } from 'react';
import Dot from '../../../components/Dot/Dot';
import Button from '../../../components/Button/Button';
import './notifications.css';

export default function Notifications() {
    // Estado para controlar la vista en MÓVIL ('main' = notificaciones, 'requests' = solicitudes)
    const [activeMobileView, setActiveMobileView] = useState<'main' | 'requests'>('main');

    const recentNotifications = [
        { id: 1, user: '@raquelz.12204', date: '7 oct', text: <>Puso un comentario en tu RVW de <strong>No pasa nada hombre.</strong></>, read: false },
        { id: 2, user: '@raquelz.12204', date: '7 oct', text: <>Dio fav a tu comentario en tu RVW de <strong>No pasa nada hombre.</strong></>, read: true },
        { id: 3, user: '@raquelz.12204', date: '7 oct', text: <>Dio fav a tu RVW de <strong>No pasa nada hombre.</strong></>, read: true },
    ];

    const olderNotifications = [
        { id: 4, user: '@raquelz.12204', date: '7 oct', text: <>Puso un comentario en tu RVW de <strong>No pasa nada hombre.</strong></>, read: true },
        { id: 5, user: '@raquelz.12204', date: '7 oct', text: <>Puso un comentario en tu RVW de <strong>No pasa nada hombre.</strong></>, read: true },
        { id: 6, user: '@raquelz.12204', date: '7 oct', text: <>Puso un comentario en tu RVW de <strong>No pasa nada hombre.</strong></>, read: true },
    ];

    const followRequests = [
        { id: 7, user: '@raquelz.12204', date: '7 oct', read: false },
        { id: 8, user: '@raquelz.12204', date: '7 oct', read: false },
        { id: 9, user: '@raquelz.12204', date: '7 oct', read: false },
    ];

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1 className="notifications-title">
                    {activeMobileView === 'requests' ? 'Solicitudes' : 'Tus notificaciones'}
                </h1>
                <p className="notifications-description">Se borraran en 30 días una vez leídas</p>
            </div>
            {/* BOTONES DE NAVEGACIÓN MÓVIL */}
            {activeMobileView === 'main' ? (
                <button className="mobile-follow-requests" onClick={() => setActiveMobileView('requests')}>
                    Ver solicitudes de seguimiento<Dot type="filled" />
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
                        <h2 className="notifications-column-title">Últimos 30 días</h2>
                        <div className="notifications-list">
                            {recentNotifications.map(notif => (
                                <div key={notif.id} className="notif-item">
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
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="notifications-column-section">
                        <h2 className="notifications-column-title">Anteriores</h2>
                        <div className="notifications-list">
                            {olderNotifications.map(notif => (
                                <div key={notif.id} className="notif-item">
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
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
                {/* COLUMNA DERECHA: Solicitudes (Se oculta en móvil si estamos viendo notificaciones) */}
                <div className={`notifications-side-column ${activeMobileView === 'main' ? 'hide-on-mobile' : ''}`}>
                    <div className="notifications-column-section">
                        <h2 className="notifications-column-title desktop-only-title">Solicitudes de seguimiento</h2>
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
                                        <Button variant="text" className="btn-small">Eliminar</Button>
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