'use client';

import { useEffect, useRef, useState, type ReactNode } from 'react';

/* Estructura común de los ajustes de usuario y de admin. Estilos en ./settings.css
   En escritorio se ven todas las secciones seguidas; en móvil, el menú o una sección */

export interface SettingsSectionData {
    id: string;
    title: string;
    /** Resumen que sale bajo el título en el menú móvil */
    desc: string;
    icon: string;
    content: ReactNode;
}

interface SettingsShellProps {
    sections: SettingsSectionData[];
    className?: string;
    /** Lo que va fuera de las secciones (avisos, etc.) */
    children?: ReactNode;
}

export default function SettingsShell({ sections, className = '', children }: SettingsShellProps) {
    const [activeId, setActiveId] = useState<string | null>(null);
    const active = sections.find((s) => s.id === activeId);

    const titleRef = useRef<HTMLHeadingElement>(null);
    const menuButtons = useRef<Record<string, HTMLButtonElement | null>>({});
    // Para devolver el foco a la entrada del menú de la que se vino
    const lastOpened = useRef<string | null>(null);

    const openSection = (id: string) => {
        lastOpened.current = id;
        setActiveId(id);
    };

    // El botón pulsado desaparece al cambiar de vista: el foco pasa al título (que dice la sección)
    // o, al volver, a la entrada del menú
    useEffect(() => {
        if (activeId) titleRef.current?.focus();
        else if (lastOpened.current) menuButtons.current[lastOpened.current]?.focus();
    }, [activeId]);

    // Escape vuelve al menú, salvo que haya un modal abierto (ese Escape es suyo)
    useEffect(() => {
        if (!activeId) return;
        const handleKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape' || e.defaultPrevented) return;
            if (document.querySelector('[aria-modal="true"]')) return;
            setActiveId(null);
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [activeId]);

    return (
        <div className={`settings-page-container ${className}`.trim()}>
            <div className="settings-header">
                {active && (
                    <button type="button" className="settings-back-btn" onClick={() => setActiveId(null)} aria-label="Volver a ajustes">
                        <span aria-hidden="true">‹</span>
                    </button>
                )}
                <h1 className="page-title settings-title" ref={titleRef} tabIndex={-1}>
                    <span className="settings-title-desktop">Ajustes</span>
                    <span className="settings-title-mobile">{active?.title ?? 'Ajustes'}</span>
                </h1>
            </div>

            <div className="settings-content">
                <nav className={`settings-menu ${active ? 'is-hidden' : ''}`} aria-label="Secciones de ajustes">
                    <ul className="settings-menu-list">
                        {sections.map((s) => (
                            <li key={s.id}>
                                <button
                                    type="button"
                                    className="settings-menu-item"
                                    ref={(el) => {
                                        menuButtons.current[s.id] = el;
                                    }}
                                    onClick={() => openSection(s.id)}
                                >
                                    <span className="settings-menu-icon">
                                        <img src={s.icon} alt="" />
                                    </span>
                                    <span className="settings-menu-text">
                                        <span className="settings-menu-title">{s.title}</span>
                                        <span className="settings-menu-desc">{s.desc}</span>
                                    </span>
                                    <span className="settings-menu-chevron" aria-hidden="true">›</span>
                                </button>
                            </li>
                        ))}
                    </ul>
                </nav>

                <div className={`settings-sections ${active ? 'is-open' : ''}`}>
                    {sections.map((s) => (
                        <section key={s.id} className={`settings-section ${activeId === s.id ? 'is-active' : ''}`} aria-labelledby={`settings-${s.id}`}>
                            <h2 className="section-title settings-subtitle" id={`settings-${s.id}`}>
                                {s.title}
                            </h2>
                            {s.content}
                        </section>
                    ))}
                </div>
            </div>

            {children}
        </div>
    );
}
