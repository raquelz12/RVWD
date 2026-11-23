'use client';

import { useRef, useEffect, type RefObject } from 'react';
import Link from 'next/link';
import './NotificationDropdown.css';
import Dot from '../Dot/Dot';
import NotificationText from './NotificationText';
import { recentNotifications } from '@/app/lib/mockNotifications';
import { formatRelativeDate } from '@/app/lib/adminFilters';
import { useNowMinute } from '@/app/lib/useNowMinute';

interface Props {
    /** id del desplegable: la campana lo apunta con aria-controls */
    id: string;
    /** Botón de la campana: su clic no cuenta como "fuera" y recibe el foco al cerrar con Escape */
    triggerRef: RefObject<HTMLButtonElement | null>;
    onClose: () => void;
}

export default function NotificationDropdown({ id, triggerRef, onClose }: Props) {
    const menuRef = useRef<HTMLDivElement>(null);
    const nowMinute = useNowMinute();
    const titleId = `${id}-title`;

    // Se cierra al pulsar fuera (la campana ya lo abre y cierra con su clic) o con Escape
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as Node;
            if (menuRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
            onClose();
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape') return;
            onClose();
            triggerRef.current?.focus();
        };
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [onClose, triggerRef]);

    return (
        <div className="notif-dropdown-menu" id={id} ref={menuRef} role="region" aria-labelledby={titleId}>
            <div className="notif-header">
                <h2 className="notif-header-title" id={titleId}>Notificaciones</h2>
            </div>
            <ul className="notif-list">
                {recentNotifications.map(notif => (
                    <li key={notif.id}>
                        <Link href={notif.href} className="notif-item" onClick={onClose}>
                            <img src="/placeholder.png" alt="" className="notif-avatar" />
                            <div className="notif-content-wrapper">
                                <div className="notif-item-header">
                                    <span className="notif-username">{notif.user}</span>
                                    <time className="notif-date" dateTime={notif.date}>
                                        {nowMinute === null ? '' : formatRelativeDate(notif.date, nowMinute * 60_000)}
                                    </time>
                                    {!notif.read && (
                                        <span className="notif-unread">
                                            <Dot type="filled" />
                                            <span className="sr-only">No leída</span>
                                        </span>
                                    )}
                                </div>
                                <NotificationText notif={notif} className="notif-text" />
                            </div>
                        </Link>
                    </li>
                ))}
            </ul>
            <Link href="/notifications" className="notif-see-all" onClick={onClose}>
                Ver todas
            </Link>
        </div>
    );
}
