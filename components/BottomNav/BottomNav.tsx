'use client';

import { useState, useEffect, useId, useRef, Suspense } from 'react';
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

    // Se guarda la ruta en la que se abrieron las notificaciones: al cambiar de página dejan de coincidir y quedan cerradas
    const [notifOpenOn, setNotifOpenOn] = useState<string | null>(null);
    const isNotifOpen = notifOpenOn !== null && notifOpenOn === pathname;
    const setIsNotifOpen = (open: boolean) => setNotifOpenOn(open ? pathname : null);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const navRef = useRef<HTMLElement>(null);
    const searchPanelRef = useRef<HTMLDivElement>(null);
    const notifButtonRef = useRef<HTMLButtonElement>(null);
    const notifMenuId = useId();

    const toggleNotifMenu = () => {
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

    // ...y al tocar fuera de la barra inferior y del buscador, o pulsar Escape
    useEffect(() => {
        if (!isSearchOpen) return;
        const handlePointerDown = (event: PointerEvent) => {
            const target = event.target as Node;
            if (navRef.current?.contains(target) || searchPanelRef.current?.contains(target)) return;
            setIsSearchOpen(false);
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

    // El buscador se apoya justo encima de lo que esté más arriba: el teclado o la barra inferior.
    // - Sin teclado: encima de la barra.
    // - iPhone con teclado: la zona visible acaba donde la página, y la barra sigue a la vista: encima de la barra.
    // - Android con teclado: la zona visible acaba en el teclado y la barra queda detrás: encima del teclado.
    // Todo en coordenadas de la página (las de position: fixed); --search-bottom es el borde de abajo del buscador
    useEffect(() => {
        const viewport = window.visualViewport;
        const panel = searchPanelRef.current;
        const nav = navRef.current;
        if (!isSearchOpen || !panel || !nav) return;

        const GAP = 10;
        const update = () => {
            const visibleBottom = viewport ? viewport.offsetTop + viewport.height : window.innerHeight;
            const navTop = window.innerHeight - parseFloat(getComputedStyle(nav).bottom) - nav.offsetHeight;
            panel.style.setProperty('--search-bottom', `${Math.round(Math.min(visibleBottom, navTop) - GAP)}px`);
        };

        update();
        viewport?.addEventListener('resize', update);
        viewport?.addEventListener('scroll', update);
        window.addEventListener('resize', update);
        return () => {
            viewport?.removeEventListener('resize', update);
            viewport?.removeEventListener('scroll', update);
            window.removeEventListener('resize', update);
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
        <>
        {/* Fuera del <nav>: la barra tiene transform y backdrop-filter, y con eso un hijo fijo
            se colocaría respecto a la barra y no respecto a la pantalla */}
        {isSearchOpen && (
            <div className="bottom-search-panel" ref={searchPanelRef}>
                <SearchBar
                    placeholder="Busca canciones, usuarios, ..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    autoFocus
                    className="bottom-search-bar"
                />
            </div>
        )}
        <nav className="bottom-nav" ref={navRef} aria-label="Navegación principal">
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
                <img src="/logo.svg" alt="" className="icon-logo-img" />
            </button>
            <button
                type="button"
                ref={notifButtonRef}
                className={`bottom-item ${isNotifOpen || isActive('/notifications') ? 'active' : ''}`}
                onClick={toggleNotifMenu}
                aria-label="Notificaciones"
                aria-expanded={isNotifOpen}
                aria-controls={notifMenuId}
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
                <NotificationDropdown
                    id={notifMenuId}
                    triggerRef={notifButtonRef}
                    onClose={() => setIsNotifOpen(false)}
                />
            )}

        </nav>
        </>
    );
}

export default function BottomNav() {
    return (
        <Suspense fallback={<nav className="bottom-nav"></nav>}>
            <BottomNavContent />
        </Suspense>
    );
}
