'use client';

import Link from 'next/link';
import Dot from '../../../components/Dot/Dot';
import Button from '../../../components/Button/Button';
import SideDrawer from '../../../components/SideDrawer/SideDrawer';
import NotificationText from '../../../components/NotificationDropdown/NotificationText';
import {
    followRequests,
    olderNotifications,
    recentNotifications,
    type MockNotification,
} from '../lib/mockNotifications';
import { formatRelativeDate } from '../lib/adminFilters';
import { useNowMinute } from '../lib/useNowMinute';
import './notifications.css';

function RelativeDate({ iso, nowMinute }: { iso: string; nowMinute: number | null }) {
    return (
        <time className="notif-date" dateTime={iso}>
            {nowMinute === null ? '' : formatRelativeDate(iso, nowMinute * 60_000)}
        </time>
    );
}

function UnreadDot({ label }: { label: string }) {
    return (
        <span className="notif-unread">
            <Dot type="filled" />
            <span className="sr-only">{label}</span>
        </span>
    );
}

function NotificationItem({ notif, nowMinute }: { notif: MockNotification; nowMinute: number | null }) {
    return (
        <Link href={notif.href} className="notif-item">
            <img src="/placeholderCards.png" alt="" className="notif-cover" />
            <div className="notif-content-wrapper">
                <div className="notif-item-header">
                    <img src="/placeholder.png" alt="" className="notif-avatar" />
                    <span className="notif-username">{notif.user}</span>
                    <RelativeDate iso={notif.date} nowMinute={nowMinute} />
                    {!notif.read && <UnreadDot label="No leída" />}
                </div>
                <NotificationText notif={notif} className="notif-text" />
            </div>
        </Link>
    );
}

function NotificationSection({
    id,
    title,
    notifications,
    nowMinute,
}: {
    id: string;
    title: string;
    notifications: MockNotification[];
    nowMinute: number | null;
}) {
    return (
        <section className="notifications-column-section" aria-labelledby={id}>
            <h2 id={id} className="section-title notifications-column-title">{title}</h2>
            <ul className="notifications-list">
                {notifications.map((notif) => (
                    <li key={notif.id}>
                        <NotificationItem notif={notif} nowMinute={nowMinute} />
                    </li>
                ))}
            </ul>
        </section>
    );
}

export default function Notifications() {
    const nowMinute = useNowMinute();
    const hasUnreadRequests = followRequests.some((req) => !req.read);

    return (
        <div className="notifications-container">
            <div className="notifications-header">
                <h1 className="page-title notifications-title">Tus notificaciones</h1>
                <p className="notifications-description">Se borrarán en 30 días una vez leídas</p>
            </div>
            <div className="notifications-columns-wrapper">
                <div className="notifications-main-column">
                    <NotificationSection
                        id="notifications-recent-title"
                        title="Últimos 30 días"
                        notifications={recentNotifications}
                        nowMinute={nowMinute}
                    />
                    <NotificationSection
                        id="notifications-older-title"
                        title="Anteriores"
                        notifications={olderNotifications}
                        nowMinute={nowMinute}
                    />
                </div>
                {/* Columna lateral en escritorio; hasta 1024px, cajón con botón flotante */}
                <SideDrawer title="Solicitudes de seguimiento" icon="/users-regular-full.svg" dot={hasUnreadRequests}>
                    <ul className="notifications-list notifications-requests-list">
                        {followRequests.map((req) => (
                            <li key={req.id} className="follow-request-item">
                                <div className="notif-item-header">
                                    <img src="/placeholder.png" alt="" className="notif-avatar" />
                                    <span className="notif-username">{req.user}</span>
                                    <RelativeDate iso={req.date} nowMinute={nowMinute} />
                                    {!req.read && <UnreadDot label="Nueva" />}
                                </div>
                                <p className="follow-request-text">Ha solicitado seguirte.</p>
                                {/* Maqueta: sin acción hasta que haya backend */}
                                <div className="follow-request-actions">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        className="follow-request-button"
                                        aria-label={`Aceptar la solicitud de ${req.user}`}
                                    >
                                        Aceptar
                                    </Button>
                                    <Button
                                        type="button"
                                        variant="text"
                                        className="follow-request-button"
                                        aria-label={`Rechazar la solicitud de ${req.user}`}
                                    >
                                        Rechazar
                                    </Button>
                                </div>
                            </li>
                        ))}
                    </ul>
                </SideDrawer>
            </div>
        </div>
    );
}
