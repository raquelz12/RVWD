'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import BottomSheet from '../BottomSheet/BottomSheet';
import {
    ADMIN_BOTTOM_LINKS,
    ADMIN_MORE_LINKS,
    getBadge,
    isActivePath,
} from '@/app/lib/adminNav';
import '../BottomNav/BottomNav.css';
import './BottomNavAdmin.css';

interface Props {
    pathname: string | null;
}

export default function BottomNavAdmin({ pathname }: Props) {
    const router = useRouter();
    const [isMoreOpen, setIsMoreOpen] = useState(false);
    const closeMore = useCallback(() => setIsMoreOpen(false), []);

    const isMoreActive = ADMIN_MORE_LINKS.some((l) => isActivePath(pathname, l.href));

    const handleLogout = () => {
        setIsMoreOpen(false);
        router.push('/');
    };

    return (
        <>
            <nav className="bottom-nav bottom-nav-admin" aria-label="Navegación de admin">
                {ADMIN_BOTTOM_LINKS.map((link) => {
                    const badge = getBadge(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`bottom-item ${isActivePath(pathname, link.href) ? 'active' : ''}`}
                            aria-label={badge?.count ? `${link.label} (${badge.count} pendientes)` : link.label}
                        >
                            <span className={link.icon}></span>
                            {badge?.count ? <span className="bottom-badge">{badge.count}</span> : null}
                            {badge?.dot ? <span className="bottom-dot" aria-hidden="true" /> : null}
                        </Link>
                    );
                })}
                <button
                    className={`bottom-item ${isMoreActive || isMoreOpen ? 'active' : ''}`}
                    onClick={() => setIsMoreOpen(true)}
                    aria-label="Más opciones"
                    aria-haspopup="dialog"
                    aria-expanded={isMoreOpen}
                >
                    <span className="icon-ellipsis"></span>
                </button>
            </nav>
            <BottomSheet
                open={isMoreOpen}
                onClose={closeMore}
                title="Más"
                className="admin-more-sheet"
                closeAboveWidth={1124}
            >
                <ul className="admin-more-list">
                    {ADMIN_MORE_LINKS.map((link) => (
                        <li key={link.href}>
                            <Link
                                href={link.href}
                                className={`admin-more-item ${isActivePath(pathname, link.href) ? 'active' : ''}`}
                                onClick={closeMore}
                            >
                                <span className={link.icon}></span>
                                <span className="admin-more-label">{link.label}</span>
                                <span className="admin-more-chevron" aria-hidden="true">›</span>
                            </Link>
                        </li>
                    ))}
                    <li className="admin-more-divider" aria-hidden="true" />
                    <li>
                        <button className="admin-more-item danger" onClick={handleLogout}>
                            <span className="icon-logout"></span>
                            <span className="admin-more-label">Cerrar sesión</span>
                        </button>
                    </li>
                </ul>
            </BottomSheet>
        </>
    );
}
