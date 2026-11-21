'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
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
    const navRef = useRef<HTMLElement>(null);
    const closeMore = () => setIsMoreOpen(false);

    // El menú "Más" se cierra al cambiar de página...
    useEffect(() => {
        setIsMoreOpen(false);
    }, [pathname]);

    // ...y al tocar fuera de la barra o pulsar Escape
    useEffect(() => {
        if (!isMoreOpen) return;
        const handlePointerDown = (event: PointerEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsMoreOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsMoreOpen(false);
        };
        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isMoreOpen]);

    const isMoreActive = ADMIN_MORE_LINKS.some((l) => isActivePath(pathname, l.href));

    const handleLogout = () => {
        setIsMoreOpen(false);
        router.push('/');
    };

    return (
        <nav className="bottom-nav bottom-nav-admin" aria-label="Navegación de admin" ref={navRef}>
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
                type="button"
                className={`bottom-item ${isMoreActive || isMoreOpen ? 'active' : ''}`}
                onClick={() => setIsMoreOpen(!isMoreOpen)}
                aria-label="Más opciones"
                aria-controls="admin-more-menu"
                aria-expanded={isMoreOpen}
            >
                <span className="icon-ellipsis"></span>
            </button>
            {/* Desplegable encima de los tres puntos, como el de notificaciones */}
            {isMoreOpen && (
                <div className="admin-more-menu" id="admin-more-menu">
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
                </div>
            )}
        </nav>
    );
}
