'use client';

import { useState, useEffect, useRef, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './BottomNav.css';
import { useModal } from '@/context/ModalContext';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import SearchBar from '../SearchBar/SearchBar';
import BottomNavAdmin from '../BottomNavAdmin/BottomNavAdmin';
import { isAdminPath } from '@/app/lib/adminNav';

function BottomNavContent() {
    const { openModal } = useModal();
    const pathname = usePathname();

    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navRef = useRef<HTMLElement>(null);

    const toggleNotifMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsSearchOpen(false);
        setIsNotifOpen(!isNotifOpen);
    };

    const toggleSearch = () => {
        setIsNotifOpen(false);
        setIsSearchOpen(!isSearchOpen);
    };

    // La barra de búsqueda se cierra al cambiar de página
    useEffect(() => {
        setIsSearchOpen(false);
    }, [pathname]);

    // ...y al tocar fuera de la barra inferior o pulsar Escape
    useEffect(() => {
        if (!isSearchOpen) return;
        const handlePointerDown = (event: PointerEvent) => {
            if (navRef.current && !navRef.current.contains(event.target as Node)) {
                setIsSearchOpen(false);
            }
        };
        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setIsSearchOpen(false);
        };
        document.addEventListener('pointerdown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('pointerdown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [isSearchOpen]);

    const isActive = (path: string) => {
        if (!pathname) return false;
        return pathname.includes(path);
    };

    // En /admin la barra es la del panel de admin
    if (isAdminPath(pathname)) {
        return <BottomNavAdmin pathname={pathname} />;
    }

    return (
        <nav className="bottom-nav" ref={navRef} aria-label="Navegación principal">
            {isSearchOpen && (
                <div className="bottom-search-panel">
                    <SearchBar
                        placeholder="Busca canciones, usuarios, ..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                        className="bottom-search-bar"
                    />
                </div>
            )}
            <Link
                href="/feed"
                className={`bottom-item ${isActive('/feed') ? 'active' : ''}`}
                aria-label="Feed"
                aria-current={isActive('/feed') ? 'page' : undefined}
            >
                <span className="icon-home"></span>
            </Link>
            <button
                type="button"
                className={`bottom-item bottom-search-btn ${isSearchOpen ? 'active' : ''}`}
                onClick={toggleSearch}
                aria-label={isSearchOpen ? 'Cerrar búsqueda' : 'Buscar'}
                aria-expanded={isSearchOpen}
            >
                <span className="icon-search"></span>
            </button>
            <button type="button" className="primary-action" onClick={() => openModal('add')} aria-label="Crear RVW">
                <img src="/Logo.svg" alt="" className="icon-logo-img" />
            </button>
            <button
                type="button"
                className={`bottom-item ${isNotifOpen || isActive('/notifications') ? 'active' : ''}`}
                onClick={toggleNotifMenu}
                // Sin esto, el clic "fuera" del desplegable lo cerraría y el propio clic lo volvería a abrir
                onMouseDown={(e) => e.stopPropagation()}
                aria-label="Notificaciones"
                aria-expanded={isNotifOpen}
            >
                <span className="icon-bell"></span>
            </button>
            <Link
                href="/profile"
                className={`bottom-item ${isActive('/profile') ? 'active' : ''}`}
                aria-label="Perfil"
                aria-current={isActive('/profile') ? 'page' : undefined}
            >
                <span className="icon-user"></span>
            </Link>
            {/* Se abre encima de la barra, con su mismo ancho (igual que la búsqueda) */}
            {isNotifOpen && (
                <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
            )}

        </nav>
    );
}

export default function BottomNav() {
    return (
        <Suspense fallback={<nav className="bottom-nav"></nav>}>
            <BottomNavContent />
        </Suspense>
    );
}
