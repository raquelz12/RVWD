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

    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const toggleNotifMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNotifOpen(!isNotifOpen);
    };

    // En /admin el header es el del panel de admin
    if (isAdminPath(pathname)) {
        return <AdminHeader pathname={pathname} />;
    }

    return (
        <header className="header">
            <div className="logo"><Link href="/"><span className="red">Я</span>VWD</Link></div>
            <button
                className="hamburger-btn"
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                aria-label="Abrir menú"
            >
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
                <span className={`hamburger-line ${isMenuOpen ? 'open' : ''}`}></span>
            </button>
            <div className={`nav-links ${isMenuOpen ? 'mobile-open' : ''}`}>
                <Link href="/feed" className="nav-link">Feed</Link>
                <a href="#" className="nav-link">Explorar</a>
                <a href="#" className="nav-link">Artistas</a>
                <a href="#" className="nav-link">Álbumes</a>
                <a href="#" className="nav-link">Canciones</a>

                <SearchBar placeholder="Busca canciones, usuarios, ..." value="" onChange={(): void => {}} />

                <div className="user-profile">
                    <div style={{ position: 'relative' }}>
                        <button className="nav-button" aria-label="Notificaciones" onClick={toggleNotifMenu}>
                            <span className="icon-bell"></span>
                        </button>
                        {isNotifOpen && (
                            <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
                        )}
                    </div>
                    <button className="nav-button" aria-label="Perfil" onClick={() => window.location.href = "/profile"}>
                        <span className="icon-user"></span>
                    </button>
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
