'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Toggle from '../../../components/Toggle/Toggle';
import OptionRow from './OptionRow';
import './settings.css';

type SectionId = 'account' | 'privacy' | 'notifications' | 'help' | 'session';

const SECTIONS: { id: SectionId; title: string; desc: string; icon: string }[] = [
    { id: 'account', title: 'Cuenta', desc: 'Nombre de usuario · Email · Datos', icon: '/user-regular-full.svg' },
    { id: 'privacy', title: 'Privacidad', desc: 'Visibilidad · Bloqueos', icon: '/lock-solid-full.svg' },
    { id: 'notifications', title: 'Notificaciones', desc: 'Email · Preferencias', icon: '/bell-regular-full.svg' },
    { id: 'help', title: 'Ayuda y soporte', desc: 'Reportes · Denuncias · Sugerencias', icon: '/info-solid-full.svg' },
    { id: 'session', title: 'Sesión', desc: 'Cerrar sesión · Eliminar perfil', icon: '/arrow-right-from-bracket-solid-full.svg' },
];

// Acciones que todavía no tienen pantalla ni backend: la fila responde, pero no abre nada aún
const pending = () => {};

export default function SettingsPage() {
    const router = useRouter();

    // En móvil se ve el menú o una sección; en escritorio, todas seguidas
    const [activeSection, setActiveSection] = useState<SectionId | null>(null);
    const activeTitle = SECTIONS.find((s) => s.id === activeSection)?.title;

    const sectionClass = (id: SectionId) => `settings-section ${activeSection === id ? 'active-mobile' : ''}`;

    return (
        <div className="settings-page-container">
            <div className="settings-header">
                {activeSection && (
                    <button className="mobile-back-btn" onClick={() => setActiveSection(null)} aria-label="Volver a ajustes">
                        ‹
                    </button>
                )}
                <h1 className="page-title">
                    <span className="desktop-title-text">Ajustes</span>
                    <span className="mobile-title-text">{activeTitle ?? 'Ajustes'}</span>
                </h1>
            </div>
            <div className="settings-content">
                <nav className={`mobile-settings-menu ${activeSection ? 'hidden' : ''}`} aria-label="Secciones de ajustes">
                    {SECTIONS.map((s) => (
                        <button key={s.id} type="button" className="mobile-menu-item settings-menu-button" onClick={() => setActiveSection(s.id)}>
                            <span className="menu-icon">
                                <img src={s.icon} alt="" />
                            </span>
                            <span className="menu-text">
                                <span className="menu-title">{s.title}</span>
                                <span className="menu-desc">{s.desc}</span>
                            </span>
                            <span className="menu-chevron" aria-hidden="true">›</span>
                        </button>
                    ))}
                </nav>

                <div className={`settings-sections-wrapper ${activeSection ? 'show-section' : ''}`}>
                    <section className={sectionClass('account')} aria-labelledby="settings-account">
                        <h2 className="section-title settings-subtitle" id="settings-account">Cuenta</h2>
                        <OptionRow
                            label="Nombre de usuario"
                            value="@raquelz.12204"
                            description="Puedes cambiar tu nombre de usuario cada 30 días."
                            onClick={pending}
                        />
                        <OptionRow
                            label="Email"
                            value="email@email.com"
                            description="Lo usamos para avisos y para recuperar tu cuenta."
                            onClick={pending}
                        />
                        <OptionRow
                            label="Descargar mis datos"
                            description="Recibe una copia de tu perfil, reseñas y actividad."
                            actionLabel="Descargar"
                            onClick={pending}
                        />
                    </section>

                    <section className={sectionClass('privacy')} aria-labelledby="settings-privacy">
                        <h2 className="section-title settings-subtitle" id="settings-privacy">Privacidad</h2>
                        <OptionRow
                            label="Privacidad de la cuenta"
                            value="Pública"
                            description="Pública: cualquiera ve tu perfil y actividad. Privada: solo tus seguidores aprobados."
                            onClick={pending}
                        />
                        <OptionRow
                            label="Mostrar nombre completo"
                            description="Si lo desactivas, los demás solo verán tu nombre de usuario."
                            control={<Toggle label="Mostrar nombre completo" />}
                        />
                        <OptionRow
                            label="Usuarios bloqueados"
                            description="No pueden ver tu perfil ni interactuar contigo."
                            actionLabel="Ver usuarios"
                            onClick={pending}
                        />
                    </section>

                    <section className={sectionClass('notifications')} aria-labelledby="settings-notifications">
                        <h2 className="section-title settings-subtitle" id="settings-notifications">Notificaciones</h2>
                        <OptionRow
                            label="Notificaciones por email"
                            description="Elige lo que quieres recibir por email."
                            actionLabel="Ver"
                            onClick={pending}
                        />
                        <OptionRow
                            label="Preferencias de notificaciones"
                            description="Elige qué avisos recibes: comentarios, menciones, nuevos seguidores…"
                            actionLabel="Ver"
                            onClick={pending}
                        />
                    </section>

                    <section className={sectionClass('help')} aria-labelledby="settings-help">
                        <h2 className="section-title settings-subtitle" id="settings-help">Ayuda y soporte</h2>
                        <OptionRow
                            label="Reportar un problema"
                            description="Cuéntanos si algo no funciona bien en la app."
                            actionLabel="Reportar"
                            onClick={() => router.push('/contact')}
                        />
                        <OptionRow
                            label="Mis denuncias"
                            description="Consulta las denuncias que has enviado y en qué estado están."
                            actionLabel="Ver denuncias"
                            onClick={pending}
                        />
                        <OptionRow
                            label="Sugerencias"
                            description="Envía una sugerencia al buzón y la leeremos lo antes posible."
                            actionLabel="Enviar sugerencia"
                            onClick={() => router.push('/suggestions')}
                        />
                    </section>

                    <section className={sectionClass('session')} aria-labelledby="settings-session">
                        <h2 className="section-title settings-subtitle" id="settings-session">Sesión</h2>
                        <OptionRow
                            label="Cerrar sesión"
                            description="Saldrás de tu cuenta en este dispositivo."
                            actionLabel="Cerrar sesión"
                            onClick={pending}
                        />
                        <OptionRow
                            label="Eliminar perfil"
                            description="Se borrarán tu perfil, reseñas y datos de forma permanente. No se puede deshacer."
                            actionLabel="Eliminar perfil"
                            danger
                            onClick={pending}
                        />
                    </section>
                </div>
            </div>
        </div>
    );
}
