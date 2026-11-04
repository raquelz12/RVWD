'use client';

import { useRef, useEffect } from 'react';
import Link from 'next/link';
import './NotificationDropdown.css';
import Dot from '../Dot/Dot';

interface Props {
    onClose: () => void;
}

export default function NotificationDropdown({ onClose }: Props) {
    const menuRef = useRef<HTMLDivElement>(null);

    const recentNotifications = [
        { id: 1, user: '@raquelz.12204', time: 'Hace 5m', text: <>Puso un comentario en tu RVW de <strong>No pasa nada hombre.</strong></>, read: false },
        { id: 2, user: '@clarent', time: 'Hace 1h', text: <>Dio fav a tu comentario en tu RVW de <strong>No pasa nada hombre.</strong></>, read: false },
        { id: 3, user: '@juanp', time: 'Hace 2h', text: <>Dio fav a tu RVW de <strong>No pasa nada hombre.</strong></>, read: true },
    ];

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
                onClose();
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, [onClose]);

    return (
        <div className="notif-dropdown-menu edit-anim" ref={menuRef}>
            <div className="notif-header">
                <h3>Notificaciones</h3>
            </div>
            <div className="notif-list">
                {recentNotifications.map(notif => (
                    <div key={notif.id} className="notif-item">
                        <img src="/placeholder.png" alt="Avatar" className="notif-avatar" />
                        <div className="notif-content-wrapper">
                            <div className="notif-item-header">
                                <span className="notif-username">{notif.user}</span>
                                <span className="notif-time">{notif.time}</span>
                                {notif.read === false ? (
                                    <div className="notif-icon">
                                        <Dot type="filled" />
                                    </div>
                                ) : null}
                            </div>
                            <p className="notif-text">{notif.text}</p>
                        </div>
                    </div>
                ))}
            </div>
            <Link href="/notificaciones" className="notif-see-all" onClick={onClose}>
                Ver todas
            </Link>
        </div>
    );
}