"use client";

import Link from 'next/link';
import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import './Header.css';
import SearchBar from '../SearchBar/SearchBar';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import AdminHeader from './AdminHeader';
import { isAdminPath } from '@/app/lib/adminNav';

function HeaderContent() {
    const pathname = usePathname();

    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const toggleNotifMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNotifOpen(!isNotifOpen);
    };

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
                <SearchBar placeholder="Busca canciones, usuarios, ..." value="" onChange={(): void => {}} />

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
                            className={`nav-button ${isNotifOpen || isActive('/notifications') ? 'active' : ''}`}
                            aria-label="Notificaciones"
                            aria-expanded={isNotifOpen}
                            onClick={toggleNotifMenu}
                            // Sin esto, el clic "fuera" del desplegable lo cerraría y el propio clic lo volvería a abrir
                            onMouseDown={(e) => e.stopPropagation()}
                        >
                            <span className="icon-bell"></span>
                        </button>
                        {isNotifOpen && (
                            <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
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

// usePathname con cacheComponents necesita un Suspense en rutas dinámicas
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
