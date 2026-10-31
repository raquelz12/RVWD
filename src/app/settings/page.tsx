'use client';

import { useState } from 'react';
import './settings.css';
import Button from '../../../components/Button/Button';
import Toggle from '../../../components/Toggle/Toggle';

export default function SettingsPage() {

    const [activeMobileTab, setActiveMobileTab] = useState('menu');

    return (
        <div className="settings-page-container">
            <div className="settings-header">
                {activeMobileTab !== 'menu' && (
                    <button className="mobile-back-btn" onClick={() => setActiveMobileTab('menu')}>
                        ‹
                    </button>
                )}
                <span className="settings-title">
                    <span className="desktop-title-text">Ajustes</span>
                    <span className="mobile-title-text">
                        {activeMobileTab === 'menu' ? 'Ajustes' : activeMobileTab}
                    </span>
                </span>
            </div>
            <div className="settings-content">
                {/* =========================================
                    MENÚ PRINCIPAL MÓVIL (Oculto en PC)
                    ========================================= */}
                <div className={`mobile-settings-menu ${activeMobileTab !== 'menu' ? 'hidden' : ''}`}>
                    <div className="mobile-menu-item" onClick={() => setActiveMobileTab('Cuenta')}>
                        <div className="menu-icon"><img src="/user-regular-full.svg" alt="User" /></div>
                        <div className="menu-text">
                            <span className="menu-title">Cuenta</span>
                            <span className="menu-desc">Nombre de usuario . Email . Datos</span>
                        </div>
                        <span className="menu-chevron">›</span>
                    </div>
                    <div className="mobile-menu-item" onClick={() => setActiveMobileTab('Privacidad')}>
                        <div className="menu-icon"><img src="/lock-solid-full.svg" alt="Privacy" /></div>
                        <div className="menu-text">
                            <span className="menu-title">Privacidad</span>
                            <span className="menu-desc">Visibilidad . Bloqueos</span>
                        </div>
                        <span className="menu-chevron">›</span>
                    </div>
                    <div className="mobile-menu-item" onClick={() => setActiveMobileTab('Notificaciones')}>
                        <div className="menu-icon"><img src="/bell-regular-full.svg" alt="Notifications" /></div>
                        <div className="menu-text">
                            <span className="menu-title">Notificaciones</span>
                            <span className="menu-desc">Email . Preferencias</span>
                        </div>
                        <span className="menu-chevron">›</span>
                    </div>
                    <div className="mobile-menu-item" onClick={() => setActiveMobileTab('Ayuda')}>
                        <div className="menu-icon"><img src="/info-solid-full.svg" alt="Help" /></div>
                        <div className="menu-text">
                            <span className="menu-title">Ayuda y soporte</span>
                            <span className="menu-desc">Reportes . Denuncias . Sugerencias</span>
                        </div>
                        <span className="menu-chevron">›</span>
                    </div>
                    <div className="mobile-menu-item" onClick={() => setActiveMobileTab('Sesión')}>
                        <div className="menu-icon"><img src="/arrow-right-from-bracket-solid-full.svg" alt="Session" /></div>
                        <div className="menu-text">
                            <span className="menu-title">Sesión</span>
                            <span className="menu-desc">Cerrar sesión . Eliminar perfil</span>
                        </div>
                        <span className="menu-chevron">›</span>
                    </div>
                </div>

                {/* =========================================
                    SECCIONES DE AJUSTES
                    ========================================= */}
                <div className={`settings-sections-wrapper ${activeMobileTab !== 'menu' ? 'show-section' : ''}`}>
                    
                    {/* --- CUENTA --- */}
                    <section className={`settings-section ${activeMobileTab === 'Cuenta' ? 'active-mobile' : ''}`}>
                        <span className="settings-subtitle">Cuenta</span>
                        
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Nombre usuario</span>
                                <span className="settings-option-value">@raquelz.12204</span>
                                <span className="settings-option-description">Puedes cambiar tu nombre de usuario cada 30 días.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Cambiar</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                        
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Email</span>
                                <span className="settings-option-value">email@email.com</span>
                                <span className="settings-option-description">Lo usamos para avisos y para recuperar tu cuenta.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Cambiar</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>

                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Descargar mis datos</span>
                                <span className="settings-option-description">Recibe una copia de tu perfil, reseñas y actividad.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Cambiar</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                    </section>

                    {/* --- PRIVACIDAD --- */}
                    <section className={`settings-section ${activeMobileTab === 'Privacidad' ? 'active-mobile' : ''}`}>
                        <span className="settings-subtitle">Privacidad</span>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Privacidad de la cuenta</span>
                                <span className="settings-option-description">Pública: cualquiera ve tu perfil y actividad. Privada: solo tus seguidores aprobados.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Pública</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Mostrar nombre completo</span>
                                <span className="settings-option-description">Si lo desactivas, los demás solo verán tu nombre de usuario.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Toggle />
                            </div>
                        </div>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Usuarios bloqueados</span>
                                <span className="settings-option-description">No pueden ver tu perfil ni interactuar contigo.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Ver usuarios</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                    </section>

                    {/* --- NOTIFICACIONES --- */}
                    <section className={`settings-section ${activeMobileTab === 'Notificaciones' ? 'active-mobile' : ''}`}>
                        <span className="settings-subtitle">Notificaciones</span>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Notificaciones por email</span>
                                <span className="settings-option-description">Elige lo que quieres recibir por email.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Ver</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Preferencias de notificaciones</span>
                                <span className="settings-option-description">Elige qué avisos recibes: comentarios, menciones, nuevos seguidores…</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Ver</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                    </section>

                    {/* --- AYUDA --- */}
                    <section className={`settings-section ${activeMobileTab === 'Ayuda' ? 'active-mobile' : ''}`}>
                        <span className="settings-subtitle">Ayuda y soporte</span>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Reportar un problema</span>
                                <span className="settings-option-description">Cuéntanos si algo no funciona bien en la app.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn" onClick={() => { window.location.href = '/contact';}}>Reportar</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Mis denuncias</span>
                                <span className="settings-option-description">Consulta las denuncias que has enviado y en qué estado están.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Ver denuncias</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Sugerencias</span>
                                <span className="settings-option-description">Envía una sugerencia al buzón y la leeremos lo antes posible.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Enviar sugerencia</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                    </section>

                    {/* --- SESIÓN --- */}
                    <section className={`settings-section ${activeMobileTab === 'Sesión' ? 'active-mobile' : ''}`}>
                        <span className="settings-subtitle">Sesión</span>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Cerrar sesión</span>
                                <span className="settings-option-description">Saldrás de tu cuenta en este dispositivo.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="outline" className="desktop-btn settings-option-btn">Cerrar sesión</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                        <div className="settings-option">
                            <div className="settings-options-text">
                                <span className="settings-option-label">Eliminar perfil</span>
                                <span className="settings-option-description">Se borrarán tu perfil, reseñas y datos de forma permanente. No se puede deshacer.</span>
                            </div>
                            <div className="settings-option-actions">
                                <Button variant="danger" className="desktop-btn settings-option-btn">Eliminar perfil</Button>
                                <span className="mobile-action-icon">›</span>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </div>
    );
}