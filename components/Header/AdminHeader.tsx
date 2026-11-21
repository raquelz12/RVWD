'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import NotificationDropdown from '../NotificationDropdown/NotificationDropdown';
import { ADMIN_LINKS, ADMIN_SETTINGS_LINK, getBadge, isActivePath } from '@/app/lib/adminNav';
import './Header.css';

interface Props {
    pathname: string | null;
}

export default function AdminHeader({ pathname }: Props) {
    const router = useRouter();
    const [isNotifOpen, setIsNotifOpen] = useState(false);
    const [isAccountOpen, setIsAccountOpen] = useState(false);
    const accountRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (accountRef.current && !accountRef.current.contains(e.target as Node)) {
                setIsAccountOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleLogout = () => {
        setIsAccountOpen(false);
        router.push('/');
    };

    return (
        <header className="header admin-header">
            <div className="logo admin-logo">
                <Link href="/admin/dashboard">
                    <span className="red">Я</span>VWD
                </Link>
                <span className="admin-pill">Admin</span>
            </div>
            <nav className="admin-nav-links" aria-label="Secciones de admin">
                {ADMIN_LINKS.map((link) => {
                    const badge = getBadge(link.href);
                    return (
                        <Link
                            key={link.href}
                            href={link.href}
                            className={`nav-link admin-nav-link ${isActivePath(pathname, link.href) ? 'active' : ''}`}
                        >
                            {link.label}
                            {badge?.count ? <span className="admin-nav-count">{badge.count}</span> : null}
                            {badge?.dot ? <span className="admin-nav-dot" aria-label="Nuevos mensajes" /> : null}
                        </Link>
                    );
                })}
            </nav>

            <div className="admin-header-actions">
                <div style={{ position: 'relative' }}>
                    <button
                        className="nav-button"
                        aria-label="Notificaciones"
                        onClick={(e) => {
                            e.stopPropagation();
                            setIsNotifOpen(!isNotifOpen);
                        }}
                    >
                        <span className="icon-bell"></span>
                    </button>
                    {isNotifOpen && <NotificationDropdown onClose={() => setIsNotifOpen(false)} />}
                </div>
                <div className="admin-account" ref={accountRef}>
                    <button
                        className={`nav-button ${isActivePath(pathname, ADMIN_SETTINGS_LINK.href) ? 'active' : ''}`}
                        aria-label="Cuenta de admin"
                        aria-haspopup="menu"
                        aria-expanded={isAccountOpen}
                        onClick={() => setIsAccountOpen(!isAccountOpen)}
                    >
                        <span className="icon-user"></span>
                    </button>
                    {isAccountOpen && (
                        <div className="admin-account-menu" role="menu">
                            <Link
                                href={ADMIN_SETTINGS_LINK.href}
                                className="admin-account-item"
                                role="menuitem"
                                onClick={() => setIsAccountOpen(false)}
                            >
                                Ajustes
                            </Link>
                            <button className="admin-account-item danger" role="menuitem" onClick={handleLogout}>
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
