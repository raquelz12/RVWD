'use client';

import { useState, Suspense } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './BottomNav.css';
import { useModal } from '@/context/ModalContext';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import BottomNavAdmin from '../BottomNavAdmin/BottomNavAdmin';
import { isAdminPath } from '@/app/lib/adminNav';

function BottomNavContent() {
    const { openModal } = useModal();
    const pathname = usePathname();

    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const toggleNotifMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNotifOpen(!isNotifOpen);
    };

    const isActive = (path: string) => {
        if (!pathname) return false;
        return pathname.includes(path);
    };

    // En /admin la barra es la del panel de admin
    if (isAdminPath(pathname)) {
        return <BottomNavAdmin pathname={pathname} />;
    }

    return (
        <nav className="bottom-nav">
            <Link href="/feed" className={`bottom-item ${isActive('/feed') ? 'active' : ''}`}>
                <span className="icon-home"></span>
            </Link>
            <Link href="/buscar" className={`bottom-item ${isActive('/buscar') ? 'active' : ''}`}>
                <span className="icon-search"></span>
            </Link>
            <button className="bottom-item primary-action" onClick={() => openModal('add')}>
                <img src="/Logo.svg" alt="Crear" className="icon-logo-img" />
            </button>
            <Link href="/profile" className={`bottom-item ${isActive('/profile') ? 'active' : ''}`}>
                <span className="icon-user"></span>
            </Link>
            <div className="bottom-item" style={{ position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                <button
                    onClick={toggleNotifMenu}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '1rem', width: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}
                >
                    <span className={`icon-bell ${isNotifOpen ? 'active' : ''}`}></span>
                </button>
                {isNotifOpen && (
                    <NotificationDropdown onClose={() => setIsNotifOpen(false)} />
                )}
            </div>

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
