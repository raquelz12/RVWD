'use client';

import { useState } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import './BottomNav.css';
import { useModal } from '@/context/ModalContext';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';

export default function BottomNav() {
    const { openModal } = useModal();
    const pathname = usePathname();
    const isAdmin = false; 

    const [isNotifOpen, setIsNotifOpen] = useState(false);

    const toggleNotifMenu = (e: React.MouseEvent) => {
        e.stopPropagation();
        setIsNotifOpen(!isNotifOpen);
    };

    const isActive = (path: string) => {
        if (!pathname) return false;
        return pathname.includes(path);
    };

    return (
        <nav className="bottom-nav">
            
            {/* INICIO / FEED */}
            <Link href="/feed" className={`bottom-item ${isActive('/feed') ? 'active' : ''}`}>
                <span className="icon-home"></span>
            </Link>
            
            {/* BUSCAR */}
            <Link href="/buscar" className={`bottom-item ${isActive('/buscar') ? 'active' : ''}`}>
                <span className="icon-search"></span>
            </Link>
            
            {/* BOTÓN CENTRAL CREAR */}
            {!isAdmin && (
                <button className="bottom-item primary-action" onClick={() => openModal('add')}>
                    <img src="/Logo.svg" alt="Crear" className="icon-logo-img" />
                </button>
            )}
            
            {/* PERFIL */}
            <Link href="/profile" className={`bottom-item ${isActive('/profile') ? 'active' : ''}`}>
                <span className="icon-user"></span>
            </Link>
            
            {/* NOTIFICACIONES */}
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