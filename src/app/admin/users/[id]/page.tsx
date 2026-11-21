'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Dot from '../../../../../components/Dot/Dot';
import Select from '../../../../../components/Select/Select';
import TextArea from '../../../../../components/TextArea/TextArea';
import '../../admin-shared.css';
import './user.css';
import Button from '../../../../../components/Button/Button';

interface Sanction {
    id: string;
    daysAgo: number;
    reason: string;
    type: string;
    internalNote: string;
    contentId: string;
}

const SANCTION_REASONS = [
    { value: 'Spam', label: 'Spam' },
    { value: 'Lenguaje inapropiado', label: 'Lenguaje inapropiado' },
    { value: 'Acoso', label: 'Acoso o falta de respeto' },
    { value: 'Plagio', label: 'Plagio de contenido' },
    { value: 'Contenido inapropiado', label: 'Contenido inapropiado' },
];

const BAN_REASONS = [
    { value: '3 strikes', label: '3 strikes' },
    { value: 'Discurso de odio', label: 'Discurso de odio' },
    { value: 'Amenazas / Estafa', label: 'Amenazas o estafa' },
    { value: 'Bots / Review bombing', label: 'Bots / Review bombing' },
];

const ROLE_OPTIONS = [
    { value: 'Usuario', label: 'Usuario' },
    { value: 'Moderador', label: 'Moderador' },
    { value: 'Administrador', label: 'Administrador' },
];

const SUSPEND_DURATIONS = [
    { value: '3 días', label: '3 días' },
    { value: '7 días', label: '7 días' },
    { value: '15 días', label: '15 días' },
    { value: '30 días', label: '30 días' },
];

export default function AdminUserDetailPage() {
    const [user, setUser] = useState({
        id: '1',
        name: 'Raquel Arnaiz',
        username: '@raquelz.12204',
        avatar: '/placeholderCards.png',
        status: 'Activo' as 'Activo' | 'Suspendido' | 'Baneado',
        suspendedUntil: '' as string,
        email: 'raquel@email.com',
        createdAt: '12/03/2027',
        lastLogin: '20/04/2027',
        role: 'Administrador',
        rvwsCount: 502,
        reportsReceived: 10,
        reportsMade: 1,
    });

    const [sanctions, setSanctions] = useState<Sanction[]>([
        {
            id: 's1',
            daysAgo: 5,
            reason: 'Lenguaje inapropiado',
            type: 'Aviso al usuario',
            internalNote: 'Comentario insultando a otro usuario en la reseña de Clarent.',
            contentId: 'post123',
        },
        {
            id: 's2',
            daysAgo: 5,
            reason: 'Lenguaje inapropiado',
            type: 'Aviso al usuario',
            internalNote: 'Reincidencia en hilo de discusión.',
            contentId: 'post456',
        },
    ]);

    // Menú de 3 puntos
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Control de modales
    const [activeModal, setActiveModal] = useState<'sanction' | 'ban' | 'unban' | 'removeSanction' | 'role' | 'suspend' | null>(null);

    // Estados del modal Añadir Sanción
    const [sanctionReason, setSanctionReason] = useState('');
    const [sanctionNote, setSanctionNote] = useState('');
    const [notifySanction, setNotifySanction] = useState(false);
    const [sanctionError, setSanctionError] = useState(false);

    // Estados del modal Banear
    const [banReason, setBanReason] = useState('');
    const [notifyBan, setNotifyBan] = useState(false);
    const [banError, setBanError] = useState(false);

    // Estados de modales secundarios (Rol y Suspender)
    const [selectedRole, setSelectedRole] = useState(user.role);
    const [suspendDuration, setSuspendDuration] = useState('7 días');

    // Estados para desbanear y quitar sanción
    const [notifyUnban, setNotifyUnban] = useState(false);
    const [sanctionToRemove, setSanctionToRemove] = useState<Sanction | null>(null);
    const [notifyRemoveSanction, setNotifyRemoveSanction] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const closeModal = () => {
        setActiveModal(null);
        setSanctionError(false);
        setBanError(false);
        setSanctionToRemove(null);
    };

    const handleAddSanction = () => {
        if (!sanctionReason || !sanctionNote.trim()) {
            setSanctionError(true);
            return;
        }

        const newSanction: Sanction = {
            id: `s-${Date.now()}`,
            daysAgo: 0,
            reason: sanctionReason,
            type: sanctions.length === 1 ? 'Suspensión temporal (7 días)' : 'Aviso al usuario',
            internalNote: sanctionNote.trim(),
            contentId: 'post789',
        };

        const updated = [newSanction, ...sanctions];
        setSanctions(updated);

        // Si llega a 3 sanciones, baneo automático según normas
        if (updated.length >= 3) {
            setUser((prev) => ({ ...prev, status: 'Baneado' }));
        }

        setSanctionReason('');
        setSanctionNote('');
        setNotifySanction(false);
        closeModal();
    };

    const handleRemoveSanction = (id: string) => {
        setSanctions((prev) => prev.filter((s) => s.id !== id));
    };

    const handleConfirmBan = () => {
        if (!banReason) {
            setBanError(true);
            return;
        }
        setUser((prev) => ({ ...prev, status: 'Baneado', suspendedUntil: '' }));
        setBanReason('');
        setNotifyBan(false);
        closeModal();
    };

    const handleConfirmUnban = () => {
        setUser((prev) => ({ ...prev, status: 'Activo', suspendedUntil: '' }));
        setNotifyUnban(false);
        closeModal();
    };

    const handleConfirmRemoveSanction = () => {
        if (!sanctionToRemove) return;
        setSanctions((prev) => prev.filter((s) => s.id !== sanctionToRemove.id));
        setNotifyRemoveSanction(false);
        closeModal();
    };

    const handleSaveRole = () => {
        setUser((prev) => ({ ...prev, role: selectedRole }));
        closeModal();
    };

    const handleConfirmSuspend = () => {
        setUser((prev) => ({
            ...prev,
            status: 'Suspendido',
            suspendedUntil: suspendDuration,
        }));
        closeModal();
    };

    const handleDeleteAccount = () => {
        if (window.confirm(`¿Seguro que quieres eliminar permanentemente la cuenta de ${user.name}?`)) {
            window.location.href = '/admin/users';
        }
    };

    return (
        <div className="user-detail-container">
            <Button className="back-btn" onClick={() => window.history.back()} variant="text">
                Volver a usuarios
            </Button>
            <header className="user-detail-header">
                <div className="user-header-left">
                    <img src={user.avatar} alt={user.name} className="user-detail-avatar" />
                    <div className="user-header-info">
                        <div className="user-name-row">
                            <h1>{user.name}</h1>
                            <div className="more-menu-wrapper" ref={menuRef}>
                                <button
                                    className="more-menu-btn"
                                    onClick={() => setIsMenuOpen(!isMenuOpen)}
                                    aria-label="Más opciones"
                                >
                                    ⋮
                                </button>
                                {isMenuOpen && (
                                    <div className="more-menu-dropdown">
                                        <Link href={`/profile`} className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                                            Ver perfil público
                                        </Link>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setActiveModal('sanction');
                                            }}
                                        >
                                            Avisar
                                        </button>
                                        <button
                                            className="dropdown-item"
                                            onClick={() => {
                                                setSelectedRole(user.role);
                                                setIsMenuOpen(false);
                                                setActiveModal('role');
                                            }}
                                        >
                                            Cambiar rol
                                        </button>
                                        <div className="dropdown-divider" />
                                        <button
                                            className="dropdown-item warning"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                setActiveModal('suspend');
                                            }}
                                        >
                                            Suspender cuenta
                                        </button>
                                        <button
                                            className="dropdown-item danger"
                                            onClick={() => {
                                                setIsMenuOpen(false);
                                                handleDeleteAccount();
                                            }}
                                        >
                                            Eliminar cuenta
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                        <span className="user-detail-handle">{user.username}</span>
                        <span className={`user-detail-status status-${user.status.toLowerCase()}`}>
                            {user.status}
                            {user.status === 'Suspendido' && user.suspendedUntil ? ` (${user.suspendedUntil})` : ''}
                        </span>
                    </div>
                </div>
                <div className="user-header-actions">
                    <Button
                        className="user-action-btn"
                        onClick={() => setActiveModal('sanction')}
                        disabled={user.status === 'Baneado'}
                        variant="primary"
                    >
                        Añadir sanción
                    </Button>
                    {user.status === 'Baneado' ? (
                        <Button className="user-action-btn" onClick={() => setActiveModal('unban')} variant="outline">
                            Desbanear
                        </Button>
                    ) : (
                        <Button className="user-action-btn" onClick={() => setActiveModal('ban')} variant="danger">
                            Banear
                        </Button>
                    )}
                </div>
            </header>
            <div className="user-detail-grid">
                <section className="account-data-section">
                    <h2 className="section-heading">Datos de la Cuenta</h2>
                    <ul className="account-data-list">
                        <li><span>Email:</span> {user.email}</li>
                        <li><span>Alta:</span> {user.createdAt}</li>
                        <li><span>Última conexión:</span> {user.lastLogin}</li>
                        <li><span>Rol:</span> {user.role}</li>
                        <li><span className="RVWS">RVWS:</span> {user.rvwsCount}</li>
                        <li>
                            <Link href={`/admin/reports?q=${encodeURIComponent(user.username)}`} className="admin-data-link">
                                <span>Denuncias recibidas:</span> {user.reportsReceived}
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>
                        </li>
                        <li><span>Denuncias realizadas:</span> {user.reportsMade}</li>
                    </ul>
                </section>
                <section className="sanctions-section">
                    <div className="sanctions-header">
                        <h2 className="section-heading">Sanciones</h2>
                        <div className="sanctions-counter">
                            <div className="sanctions-dots">
                                {[0, 1, 2].map((i) => (
                                    <Dot key={i} type={i < sanctions.length ? 'filled' : 'empty'} />
                                ))}
                            </div>
                            <span>{Math.min(sanctions.length, 3)}/3</span>
                        </div>
                    </div>
                    <div className="sanctions-list">
                        {sanctions.length === 0 ? (
                            <p className="empty-sanctions">Este usuario no tiene sanciones activas.</p>
                        ) : (
                            sanctions.map((s) => (
                                <div key={s.id} className="sanction-row">
                                    <div className="sanction-info">
                                        <span className="sanction-time">
                                            {s.daysAgo === 0 ? 'Hoy' : `Hace ${s.daysAgo} días`} · Caduca en {Math.max(0, 90 - s.daysAgo)} días
                                        </span>
                                        <span className="sanction-reason">{s.reason}</span>
                                        <span className="sanction-type">{s.type}</span>
                                        {s.internalNote && (
                                            <span className="sanction-note">Nota: {s.internalNote}</span>
                                        )}
                                    </div>
                                    <div className="sanction-actions">
                                        <Link href={`/admin/content/${s.contentId}`} className="sanction-link">
                                            Ver contenido
                                        </Link>
                                        <Button
                                            className="sanction-btn"
                                            onClick={() => {
                                                setSanctionToRemove(s);
                                                setActiveModal('removeSanction');
                                            }}
                                        >
                                            Quitar sanción
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                    <p className="sanctions-footnote">
                        Al llegar a 3 sanciones se banea y se avisa al usuario.
                    </p>
                </section>
            </div>
            {/* modal: añadir sanción */}
            {activeModal === 'sanction' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>Añadir Sanción a {user.name.split(' ')[0]}</h3>
                        <p className="modal-subtitle">
                            {sanctions.length}/3{' '}
                            {sanctions.length >= 2
                                ? `Con uno más se deberá banear a ${user.name.split(' ')[0]}`
                                : 'Selecciona el motivo y añade una nota interna'}
                        </p>
                        <div className="modal-field">
                            <label>Motivo</label>
                            <Select
                                options={SANCTION_REASONS}
                                value={sanctionReason}
                                onChange={(val) => {
                                    setSanctionReason(val);
                                    setSanctionError(false);
                                }}
                                placeholder="Seleccionar motivo"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Nota interna</label>
                            <TextArea
                                value={sanctionNote}
                                onChange={(e) => {
                                    setSanctionNote(e.target.value);
                                    setSanctionError(false);
                                }}
                                rows={4}
                                placeholder="Escribe el contexto para el equipo de moderación..."
                            />
                        </div>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifySanction}
                                onChange={(e) => setNotifySanction(e.target.checked)}
                            />
                            <span>Avisar al usuario por correo.</span>
                        </label>
                        <button className="modal-submit-btn" onClick={handleAddSanction}>
                            Añadir sanción
                        </button>
                        {sanctionError && (
                            <p className="modal-error-text">
                                Debes completar todos los campos para añadir la sanción.
                            </p>
                        )}
                    </div>
                </div>
            )}
            {/* modal: banear usuario */}
            {activeModal === 'ban' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>¿Banear a {user.name.split(' ')[0]}?</h3>

                        <div className="modal-field">
                            <label>Motivo</label>
                            <Select
                                options={BAN_REASONS}
                                value={banReason}
                                onChange={(val) => {
                                    setBanReason(val);
                                    setBanError(false);
                                }}
                                placeholder="Seleccionar motivo"
                            />
                        </div>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifyBan}
                                onChange={(e) => setNotifyBan(e.target.checked)}
                            />
                            <span>Avisar al usuario por correo.</span>
                        </label>
                        <button className="modal-submit-btn" onClick={handleConfirmBan}>
                            Confirmar baneo
                        </button>
                        {banError && (
                            <p className="modal-error-text">
                                Debes completar todos los campos para banearle.
                            </p>
                        )}
                    </div>
                </div>
            )}
            {/* modal: cambiar rol */}
            {activeModal === 'role' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>Cambiar rol de {user.name.split(' ')[0]}</h3>
                        <div className="modal-field">
                            <label>Nuevo rol</label>
                            <Select
                                options={ROLE_OPTIONS}
                                value={selectedRole}
                                onChange={setSelectedRole}
                                placeholder="Seleccionar rol"
                            />
                        </div>
                        <button className="modal-submit-btn" onClick={handleSaveRole}>
                            Guardar rol
                        </button>
                    </div>
                </div>
            )}
            {/* modal: suspender cuenta */}
            {activeModal === 'suspend' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>Suspender a {user.name.split(' ')[0]}</h3>
                        <p className="modal-subtitle">
                            El usuario no podrá publicar ni comentar durante el periodo elegido.
                        </p>
                        <div className="modal-field">
                            <label>Duración</label>
                            <Select
                                options={SUSPEND_DURATIONS}
                                value={suspendDuration}
                                onChange={setSuspendDuration}
                                placeholder="Seleccionar duración"
                            />
                        </div>
                        <button className="modal-submit-btn" onClick={handleConfirmSuspend}>
                            Confirmar suspensión
                        </button>
                    </div>
                </div>
            )}
            {/* modal: desbanear cuenta */}
            {activeModal === 'unban' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>¿Desbanear a {user.name.split(' ')[0]}?</h3>
                        <p className="modal-subtitle">
                            La cuenta volverá a estar activa y el usuario podrá iniciar sesión, publicar y comentar de nuevo.
                        </p>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifyUnban}
                                onChange={(e) => setNotifyUnban(e.target.checked)}
                            />
                            <span>Avisar al usuario por correo.</span>
                        </label>
                        <div className="modal-actions-row">
                            <Button variant="text" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleConfirmUnban}>
                                Confirmar desbaneo
                            </Button>
                        </div>
                    </div>
                </div>
            )}
            {/* modal: quitar sanción */}
            {activeModal === 'removeSanction' && sanctionToRemove && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>¿Quitar esta sanción?</h3>
                        <p className="modal-subtitle">
                            Se eliminará la sanción por <strong>{sanctionToRemove.reason}</strong> ({sanctionToRemove.type}) del historial activo de {user.name.split(' ')[0]}.
                        </p>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifyRemoveSanction}
                                onChange={(e) => setNotifyRemoveSanction(e.target.checked)}
                            />
                            <span>Avisar al usuario por correo.</span>
                        </label>
                        <div className="modal-actions-row">
                            <Button variant="text" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleConfirmRemoveSanction}>
                                Quitar sanción
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}