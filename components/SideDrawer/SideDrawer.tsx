'use client';

import { useEffect, useId, useState } from 'react';
import Dot from '../Dot/Dot';
import './SideDrawer.css';

interface SideDrawerProps {
    /** Título del bloque (en escritorio encabeza la columna, en móvil el cajón) */
    title: string;
    /** Icono del botón flotante que abre el cajón en móvil / tablet */
    icon: string;
    /** Punto rojo en el botón flotante: hay algo nuevo dentro (solo móvil / tablet, que es donde se ve el botón) */
    dot?: boolean;
    children: React.ReactNode;
}

// En escritorio es una columna lateral fija; en móvil / tablet se abre como cajón desde la derecha
export default function SideDrawer({ title, icon, dot = false, children }: SideDrawerProps) {
    const [open, setOpen] = useState(false);
    const panelId = useId();

    // Escape cierra el cajón
    useEffect(() => {
        if (!open) return;
        const onKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setOpen(false);
        };
        document.addEventListener('keydown', onKey);
        return () => document.removeEventListener('keydown', onKey);
    }, [open]);

    return (
        <aside className={`side-drawer ${open ? 'is-open' : ''}`}>
            <button
                type="button"
                className="side-drawer-open-btn"
                onClick={() => setOpen(true)}
                aria-label={`Abrir ${title.toLowerCase()}${dot ? ' (hay nuevas)' : ''}`}
                aria-expanded={open}
                aria-controls={panelId}
            >
                <img src={icon} alt="" />
                {dot && (
                    <span className="side-drawer-dot">
                        <Dot type="filled" />
                    </span>
                )}
            </button>
            <div className="side-drawer-overlay" onClick={() => setOpen(false)} aria-hidden="true" />
            <div className="side-drawer-panel" id={panelId}>
                <div className="side-drawer-header">
                    <h2 className="section-title side-drawer-title">{title}</h2>
                    <button
                        type="button"
                        className="side-drawer-close-btn"
                        onClick={() => setOpen(false)}
                        aria-label="Cerrar"
                    >
                        ✕
                    </button>
                </div>
                <div className="side-drawer-content">{children}</div>
            </div>
        </aside>
    );
}
