"use client";

import Link from 'next/link';
import { useState, useId, useRef, Suspense } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import './Header.css';
import GlobalSearch from '../GlobalSearch/GlobalSearch';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import AdminHeader from './AdminHeader';
import { isAdminPath } from '@/app/lib/adminNav';
import { parseSearchQuery } from '@/app/lib/search';

function HeaderContent() {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    // En /search el buscador enseña lo buscado; la key lo vacía al irse de ahí o buscar otra cosa
    const currentQuery = pathname === '/search' ? parseSearchQuery(searchParams.get('q')) : '';

    // Se guarda la ruta en la que se abrió el desplegable: al cambiar de página
    // (p. ej. con el botón atrás del navegador) deja de coincidir y queda cerrado
    const [notifOpenOn, setNotifOpenOn] = useState<string | null>(null);
    const isNotifOpen = notifOpenOn !== null && notifOpenOn === pathname;
    const setIsNotifOpen = (open: boolean) => setNotifOpenOn(open ? pathname : null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);
    const notifMenuId = useId();

    const isActive = (path: string) => !!pathname && pathname.startsWith(path);
    const isFeed = isActive('/feed');
    const isProfile = isActive('/profile');

    // En /admin el header es el del panel de admin
    if (isAdminPath(pathname)) {
        return <AdminHeader pathname={pathname} />;
    }

    return (
        <header className="header">
            <div className="logo"><Link href="/"><span className="red">Я</span>VWD</Link></div>
            {/* Hasta 1024px todo esto lo da la barra inferior (BottomNav) */}
            <div className="nav-links">
                <GlobalSearch key={currentQuery} initialQuery={currentQuery} />

                <div className="user-profile">
                    <Link
                        href="/feed"
                        className={`nav-button ${isFeed ? 'active' : ''}`}
                        aria-label="Feed"
                        aria-current={isFeed ? 'page' : undefined}
                    >
                        <span className="icon-home"></span>
                    </Link>
                    <div style={{ position: 'relative' }}>
                        <button
                            type="button"
                            ref={notifButtonRef}
                            className={`nav-button ${isNotifOpen || isActive('/notifications') ? 'active' : ''}`}
                            aria-label="Notificaciones"
                            aria-expanded={isNotifOpen}
                            aria-controls={notifMenuId}
                            onClick={() => setIsNotifOpen(!isNotifOpen)}
                        >
                            <span className="icon-bell"></span>
                        </button>
                        {isNotifOpen && (
                            <NotificationDropdown
                                id={notifMenuId}
                                triggerRef={notifButtonRef}
                                onClose={() => setIsNotifOpen(false)}
                            />
                        )}
                    </div>
                    <Link
                        href="/profile"
                        className={`nav-button ${isProfile ? 'active' : ''}`}
                        aria-label="Perfil"
                        aria-current={isProfile ? 'page' : undefined}
                    >
                        <span className="icon-user"></span>
                    </Link>
                </div>
            </div>
        </header>
    );
}

// usePathname y useSearchParams con cacheComponents necesitan un Suspense en rutas dinámicas
function HeaderFallback() {
    return (
        <header className="header">
            <div className="logo"><Link href="/"><span className="red">Я</span>VWD</Link></div>
        </header>
    );
}

export default function Header() {
    return (
        <Suspense fallback={<HeaderFallback />}>
            <HeaderContent />
        </Suspense>
    );
}
