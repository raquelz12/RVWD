'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Select from '../../../../../components/Select/Select';
import TextArea from '../../../../../components/TextArea/TextArea';
import Button from '../../../../../components/Button/Button';
import MoreMenu, { type MoreMenuItem } from '../../../../../components/MoreMenu/MoreMenu';
import Rvw from '../../../../../components/Rvw/Rvw';
import SanctionDots from '../../SanctionDots';
import AdminDialog, { NotifyCheckbox } from '../../AdminDialog';
import { addDays, formatDate, timeAgo } from '@/app/lib/adminFilters';
import {
    AUTO_SUSPEND_DAYS,
    BAN_REASONS,
    MAX_SANCTIONS,
    SANCTION_EXPIRY_DAYS,
    SANCTION_REASONS,
    SUSPEND_DURATIONS,
    nextSanction,
    sanctionHint,
} from '@/app/lib/adminModeration';
import { MOCK_USERS, STATUS_CLASS, type AdminUser, type UserRole, type UserSanction } from '../mockUsers';
import '../../admin-shared.css';

const ROLE_OPTIONS: { value: UserRole; label: string }[] = [
    { value: 'Usuario', label: 'Usuario' },
    { value: 'Moderador', label: 'Moderador' },
    { value: 'Admin', label: 'Admin' },
];

type ModalId = 'sanction' | 'removeSanction' | 'ban' | 'unban' | 'suspend' | 'liftSuspension' | 'role' | 'delete';

// Con cacheComponents, useParams() solo se conoce en runtime, así que va dentro de un Suspense
export default function AdminUserDetailPage() {
    return (
        <Suspense fallback={null}>
            <AdminUserDetailWithParams />
        </Suspense>
    );
}

// La key recrea la ficha al pasar de un usuario a otro, porque Next conserva el estado de las rutas ya visitadas
function AdminUserDetailWithParams() {
    const { id } = useParams<{ id: string }>();
    const initial = MOCK_USERS.find((u) => u.id === id);
    if (!initial) return <UserNotFound />;
    return <AdminUserDetail key={id} initial={initial} />;
}

function BackToUsers() {
    const router = useRouter();
    return (
        <div className="admin-detail-topbar">
            <Button className="back-btn" onClick={() => router.push('/admin/users')} variant="text">
                Volver a usuarios
            </Button>
        </div>
    );
}

function UserNotFound() {
    return (
        <div className="admin-detail-container">
            <BackToUsers />
            <p className="admin-empty-message">No se ha encontrado este usuario. Puede que el enlace sea incorrecto.</p>
        </div>
    );
}

function AdminUserDetail({ initial }: { initial: AdminUser }) {
    const router = useRouter();
    const [user, setUser] = useState<AdminUser>(initial);
    const [sanctions, setSanctions] = useState<UserSanction[]>(initial.sanctions);
    const firstName = user.name.split(' ')[0];

    const [activeModal, setActiveModal] = useState<ModalId | null>(null);
    const [error, setError] = useState('');
    // TODO: con backend, el aviso por correo se enviará con la acción
    const [notify, setNotify] = useState(false);

    const [sanctionReason, setSanctionReason] = useState('');
    const [sanctionNote, setSanctionNote] = useState('');
    const [sanctionToRemove, setSanctionToRemove] = useState<UserSanction | null>(null);
    const [banReason, setBanReason] = useState('');
    const [suspendDuration, setSuspendDuration] = useState(`${AUTO_SUSPEND_DAYS} días`);
    const [selectedRole, setSelectedRole] = useState<UserRole>(user.role);

    const openModal = (id: ModalId) => {
        setError('');
        setNotify(false);
        setActiveModal(id);
    };

    const closeModal = () => {
        setActiveModal(null);
        setError('');
        setSanctionToRemove(null);
    };

    const openSanctionModal = () => {
        setSanctionReason('');
        setSanctionNote('');
        openModal('sanction');
    };

    // La penúltima sanción suspende la cuenta unos días y la última la banea
    const handleAddSanction = () => {
        if (!sanctionReason || !sanctionNote.trim()) {
            setError('Debes completar todos los campos para añadir la sanción.');
            return;
        }
        const { banned, suspended, type } = nextSanction(sanctions.length);

        const newSanction: UserSanction = {
            id: `s-${Date.now()}`,
            daysAgo: 0,
            reason: sanctionReason,
            type,
            internalNote: sanctionNote.trim(),
        };
        setSanctions((prev) => [newSanction, ...prev]);

        if (banned) {
            setUser((prev) => ({ ...prev, status: 'Baneado', suspendedUntil: undefined }));
        } else if (suspended) {
            setUser((prev) => ({ ...prev, status: 'Suspendido', suspendedUntil: addDays(AUTO_SUSPEND_DAYS) }));
        }
        closeModal();
    };

    const handleConfirmRemoveSanction = () => {
        if (!sanctionToRemove) return;
        setSanctions((prev) => prev.filter((s) => s.id !== sanctionToRemove.id));
        closeModal();
    };

    const handleConfirmBan = () => {
        if (!banReason) {
            setError('Elige un motivo para banear la cuenta.');
            return;
        }
        setUser((prev) => ({ ...prev, status: 'Baneado', suspendedUntil: undefined }));
        setBanReason('');
        closeModal();
    };

    const reactivate = () => {
        setUser((prev) => ({ ...prev, status: 'Activo', suspendedUntil: undefined }));
        closeModal();
    };

    const handleConfirmSuspend = () => {
        setUser((prev) => ({ ...prev, status: 'Suspendido', suspendedUntil: addDays(parseInt(suspendDuration, 10)) }));
        closeModal();
    };

    const handleSaveRole = () => {
        setUser((prev) => ({ ...prev, role: selectedRole }));
        closeModal();
    };

    // TODO: con backend, borrar la cuenta antes de volver al listado
    const handleDeleteAccount = () => {
        closeModal();
        router.push('/admin/users');
    };

    const menuItems: MoreMenuItem[] = [
        // TODO: enlazar al perfil público de este usuario cuando exista la ruta
        { label: 'Ver perfil público', href: '/profile' },
        {
            label: 'Cambiar rol',
            onClick: () => {
                setSelectedRole(user.role);
                openModal('role');
            },
        },
        'divider',
        ...(user.status === 'Activo'
            ? [{ label: 'Suspender cuenta', warning: true, onClick: () => openModal('suspend') }]
            : []),
        ...(user.status === 'Suspendido'
            ? [{ label: 'Levantar suspensión', onClick: () => openModal('liftSuspension') }]
            : []),
        { label: 'Eliminar cuenta', danger: true, onClick: () => openModal('delete') },
    ];

    return (
        <div className="admin-detail-container">
            <BackToUsers />

            <header className="admin-detail-header-row">
                <div className="admin-detail-person">
                    <img src={user.avatar} alt="" className="admin-detail-avatar" />
                    <div className="admin-detail-info">
                        <div className="admin-detail-name-row">
                            <h1 className="page-title">{user.name}</h1>
                            <MoreMenu items={menuItems} label={`Más opciones para ${user.name}`} />
                        </div>
                        <span className="admin-detail-handle">{user.username}</span>
                        <span className={`admin-detail-status ${STATUS_CLASS[user.status]}`}>
                            {user.status}
                            {user.status === 'Suspendido' && user.suspendedUntil
                                ? ` hasta el ${formatDate(user.suspendedUntil)}`
                                : ''}
                        </span>
                    </div>
                </div>
                <div className="admin-detail-actions">
                    <Button
                        className="admin-detail-action-btn"
                        onClick={openSanctionModal}
                        disabled={user.status === 'Baneado'}
                        variant="primary"
                    >
                        Añadir sanción
                    </Button>
                    {user.status === 'Baneado' ? (
                        <Button className="admin-detail-action-btn" onClick={() => openModal('unban')} variant="outline">
                            Desbanear
                        </Button>
                    ) : (
                        <Button
                            className="admin-detail-action-btn"
                            onClick={() => {
                                setBanReason('');
                                openModal('ban');
                            }}
                            variant="danger"
                        >
                            Banear
                        </Button>
                    )}
                </div>
            </header>

            <div className="admin-detail-grid">
                <section>
                    <h2 className="block-title section-heading">Datos de la cuenta</h2>
                    <ul className="admin-data-list">
                        <li>Email: {user.email}</li>
                        <li>Alta: {formatDate(user.createdAt)}</li>
                        <li>Última conexión: {formatDate(user.lastLogin)}</li>
                        <li>Rol: {user.role}</li>
                        <li>
                            <Rvw>RVWS</Rvw>: {user.rvwsCount}
                        </li>
                        <li>
                            {user.reportsReceived > 0 ? (
                                <Link
                                    href={`/admin/reports?q=${encodeURIComponent(user.username)}`}
                                    className="admin-data-link"
                                >
                                    Denuncias recibidas: {user.reportsReceived}
                                    <span className="admin-chevron" aria-hidden="true">›</span>
                                </Link>
                            ) : (
                                'Denuncias recibidas: 0'
                            )}
                        </li>
                        <li>Denuncias realizadas: {user.reportsMade}</li>
                    </ul>
                </section>
                <section>
                    <div className="sanctions-header">
                        <h2 className="block-title section-heading">Sanciones</h2>
                        <SanctionDots count={sanctions.length} className="sanctions-counter" />
                    </div>
                    {sanctions.length === 0 ? (
                        <p className="empty-sanctions">Este usuario no tiene sanciones activas.</p>
                    ) : (
                        <ul className="sanctions-list">
                            {sanctions.map((s) => (
                                <li key={s.id} className="sanction-row">
                                    <div className="sanction-info">
                                        <span className="sanction-time">
                                            {timeAgo(s.daysAgo)} · Caduca en {Math.max(0, SANCTION_EXPIRY_DAYS - s.daysAgo)} días
                                        </span>
                                        <span className="sanction-reason">{s.reason}</span>
                                        <span className="sanction-type">{s.type}</span>
                                        {s.internalNote && <span className="sanction-note">Nota: {s.internalNote}</span>}
                                    </div>
                                    <div className="sanction-actions">
                                        {s.contentId && (
                                            <Link href={`/admin/content/${s.contentId}`} className="sanction-link">
                                                Ver contenido
                                            </Link>
                                        )}
                                        <Button
                                            className="sanction-btn"
                                            onClick={() => {
                                                setSanctionToRemove(s);
                                                openModal('removeSanction');
                                            }}
                                        >
                                            Quitar sanción
                                        </Button>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                    <p className="sanctions-footnote">
                        Al llegar a {MAX_SANCTIONS} sanciones se banea y se avisa al usuario.
                    </p>
                </section>
            </div>

            <AdminDialog
                isOpen={activeModal === 'sanction'}
                title={`Añadir sanción a ${firstName}`}
                text={`${sanctions.length}/${MAX_SANCTIONS} · ${sanctionHint(sanctions.length, firstName)}`}
                confirmLabel="Añadir sanción"
                error={error}
                onClose={closeModal}
                onConfirm={handleAddSanction}
            >
                <div className="modal-field">
                    <span className="admin-dialog-label">Motivo</span>
                    <Select
                        options={SANCTION_REASONS}
                        value={sanctionReason}
                        onChange={(val) => {
                            setSanctionReason(val);
                            setError('');
                        }}
                        placeholder="Seleccionar motivo"
                    />
                </div>
                <div className="modal-field">
                    <label htmlFor="user-sanction-note" className="admin-dialog-label">
                        Nota interna
                    </label>
                    <TextArea
                        id="user-sanction-note"
                        value={sanctionNote}
                        onChange={(e) => {
                            setSanctionNote(e.target.value);
                            setError('');
                        }}
                        rows={4}
                        placeholder="Escribe el contexto para el equipo de moderación..."
                    />
                </div>
                <NotifyCheckbox checked={notify} onChange={setNotify} />
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'removeSanction' && !!sanctionToRemove}
                title="¿Quitar esta sanción?"
                text={
                    sanctionToRemove && (
                        <>
                            Se eliminará la sanción por <strong>{sanctionToRemove.reason}</strong> ({sanctionToRemove.type}) del
                            historial activo de {firstName}.
                        </>
                    )
                }
                confirmLabel="Quitar sanción"
                onClose={closeModal}
                onConfirm={handleConfirmRemoveSanction}
            >
                <NotifyCheckbox checked={notify} onChange={setNotify} />
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'ban'}
                title={`¿Banear a ${firstName}?`}
                text="No podrá iniciar sesión hasta que se desbanee la cuenta."
                confirmLabel="Confirmar baneo"
                danger
                error={error}
                onClose={closeModal}
                onConfirm={handleConfirmBan}
            >
                <div className="modal-field">
                    <span className="admin-dialog-label">Motivo</span>
                    <Select
                        options={BAN_REASONS}
                        value={banReason}
                        onChange={(val) => {
                            setBanReason(val);
                            setError('');
                        }}
                        placeholder="Seleccionar motivo"
                    />
                </div>
                <NotifyCheckbox checked={notify} onChange={setNotify} />
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'unban'}
                title={`¿Desbanear a ${firstName}?`}
                text="La cuenta volverá a estar activa y el usuario podrá iniciar sesión, publicar y comentar de nuevo."
                confirmLabel="Confirmar desbaneo"
                onClose={closeModal}
                onConfirm={reactivate}
            >
                <NotifyCheckbox checked={notify} onChange={setNotify} />
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'suspend'}
                title={`Suspender a ${firstName}`}
                text="El usuario no podrá publicar ni comentar durante el periodo elegido."
                confirmLabel="Confirmar suspensión"
                onClose={closeModal}
                onConfirm={handleConfirmSuspend}
            >
                <div className="modal-field">
                    <span className="admin-dialog-label">Duración</span>
                    <Select
                        options={SUSPEND_DURATIONS}
                        value={suspendDuration}
                        onChange={setSuspendDuration}
                        placeholder="Seleccionar duración"
                    />
                </div>
                <NotifyCheckbox checked={notify} onChange={setNotify} />
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'liftSuspension'}
                title={`¿Levantar la suspensión de ${firstName}?`}
                text="La cuenta volverá a estar activa antes de que acabe el periodo de suspensión."
                confirmLabel="Levantar suspensión"
                onClose={closeModal}
                onConfirm={reactivate}
            >
                <NotifyCheckbox checked={notify} onChange={setNotify} />
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'role'}
                title={`Cambiar rol de ${firstName}`}
                confirmLabel="Guardar rol"
                onClose={closeModal}
                onConfirm={handleSaveRole}
            >
                <div className="modal-field">
                    <span className="admin-dialog-label">Nuevo rol</span>
                    <Select
                        options={ROLE_OPTIONS}
                        value={selectedRole}
                        onChange={(val) => setSelectedRole(val as UserRole)}
                        placeholder="Seleccionar rol"
                    />
                </div>
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'delete'}
                title={`¿Eliminar la cuenta de ${firstName}?`}
                text="Se borrarán la cuenta y todas sus RVWs y comentarios. No se puede deshacer."
                confirmLabel="Eliminar cuenta"
                danger
                onClose={closeModal}
                onConfirm={handleDeleteAccount}
            />
        </div>
    );
}
