'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Toggle from '../../../components/Toggle/Toggle';
import Select from '../../../components/Select/Select';
import Input from '../../../components/Input/Input';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';
import OptionRow from './OptionRow';
import SettingsShell from './SettingsShell';
import './settings.css';

// TODO: todo esto vendrá del backend (es el mismo usuario de prueba que en el perfil)
const MOCK_USER = { username: 'raquelz.12204', email: 'email@email.com' };

const PRIVACY_OPTIONS = [
    { value: 'public', label: 'Pública' },
    { value: 'private', label: 'Privada' },
];

type NotifKey = 'comments' | 'favs' | 'follows';

const NOTIF_ROWS: { key: NotifKey; label: string }[] = [
    { key: 'comments', label: 'Comentarios en tus RVWs' },
    { key: 'favs', label: 'Favs en tus RVWs y comentarios' },
    { key: 'follows', label: 'Solicitudes y nuevos seguidores' },
];

type ModalId = 'username' | 'email' | 'delete';

export default function SettingsPage() {
    const router = useRouter();

    const [username, setUsername] = useState(MOCK_USER.username);
    const [usernameChanged, setUsernameChanged] = useState(false);
    const [email, setEmail] = useState(MOCK_USER.email);
    const [privacy, setPrivacy] = useState('public');
    const [showFullName, setShowFullName] = useState(true);
    const [channels, setChannels] = useState<Record<NotifKey, { bell: boolean; email: boolean }>>({
        comments: { bell: true, email: false },
        favs: { bell: true, email: false },
        follows: { bell: true, email: true },
    });

    const [modal, setModal] = useState<ModalId | null>(null);
    const [draft, setDraft] = useState('');
    const [error, setError] = useState('');
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(''), 2200);
        return () => clearTimeout(timer);
    }, [toast]);

    const openModal = (id: ModalId, value = '') => {
        setModal(id);
        setDraft(value);
        setError('');
    };
    const closeModal = () => setModal(null);

    const saveUsername = () => {
        const value = draft.trim().replace(/^@/, '');
        if (!/^[a-z0-9._]{3,30}$/i.test(value)) {
            return setError('Entre 3 y 30 caracteres: letras, números, punto o guion bajo.');
        }
        if (value !== username) {
            setUsername(value);
            setUsernameChanged(true);
            setToast('Nombre de usuario guardado');
        }
        closeModal();
    };

    const saveEmail = () => {
        const value = draft.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return setError('Escribe un email válido.');
        setEmail(value);
        closeModal();
        setToast('Te hemos enviado un correo para confirmar el nuevo email');
    };

    const setChannel = (key: NotifKey, channel: 'bell' | 'email', on: boolean) => {
        setChannels((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: on } }));
        setToast('Guardado');
    };

    // TODO: cerrar sesión y borrar la cuenta de verdad cuando haya autenticación
    const logout = () => router.push('/');
    const deleteProfile = () => {
        closeModal();
        router.push('/');
    };

    const sections = [
        {
            id: 'account',
            title: 'Cuenta',
            desc: 'Nombre de usuario · Email · Datos',
            icon: '/user-regular-full.svg',
            content: (
                <>
                    <OptionRow
                        label="Nombre de usuario"
                        value={`@${username}`}
                        description={
                            usernameChanged
                                ? 'Lo has cambiado hoy. Podrás volver a cambiarlo dentro de 30 días.'
                                : 'Puedes cambiar tu nombre de usuario cada 30 días.'
                        }
                        disabled={usernameChanged}
                        onClick={() => openModal('username', username)}
                    />
                    <OptionRow
                        label="Email"
                        value={email}
                        description="Lo usamos para avisos y para recuperar tu cuenta."
                        onClick={() => openModal('email', email)}
                    />
                    <OptionRow
                        label="Descargar mis datos"
                        description="Recibe una copia de tu perfil, reseñas y actividad."
                        actionLabel="Descargar"
                        onClick={() => setToast('Te enviaremos tus datos por email cuando estén listos')}
                    />
                </>
            ),
        },
        {
            id: 'privacy',
            title: 'Privacidad',
            desc: 'Visibilidad · Bloqueos',
            icon: '/lock-solid-full.svg',
            content: (
                <>
                    <OptionRow
                        label="Privacidad de la cuenta"
                        description="Pública: cualquiera ve tu perfil y actividad. Privada: solo tus seguidores aprobados."
                        control={
                            <Select
                                className="settings-inline-select"
                                options={PRIVACY_OPTIONS}
                                value={privacy}
                                onChange={(v) => {
                                    setPrivacy(v);
                                    setToast(v === 'private' ? 'Tu cuenta ahora es privada' : 'Tu cuenta ahora es pública');
                                }}
                            />
                        }
                    />
                    <OptionRow
                        label="Mostrar nombre completo"
                        description="Si lo desactivas, los demás solo verán tu nombre de usuario."
                        control={
                            <Toggle
                                checked={showFullName}
                                onChange={(on) => {
                                    setShowFullName(on);
                                    setToast('Guardado');
                                }}
                                label="Mostrar nombre completo"
                            />
                        }
                    />
                    {/* TODO: pantalla de usuarios bloqueados */}
                    <OptionRow
                        label="Usuarios bloqueados"
                        description="No pueden ver tu perfil ni interactuar contigo."
                        actionLabel="Próximamente"
                        disabled
                    />
                </>
            ),
        },
        {
            id: 'notifications',
            title: 'Notificaciones',
            desc: 'Campana · Email',
            icon: '/bell-regular-full.svg',
            content: (
                <div className="settings-block">
                    <div className="settings-block-head">
                        <div>
                            <span className="settings-option-label">Avisos</span>
                            <span className="settings-option-description">Elige por dónde te llega cada aviso.</span>
                        </div>
                    </div>
                    <table className="settings-notif-table">
                        <thead>
                            <tr>
                                <th scope="col"><span className="sr-only">Aviso</span></th>
                                <th scope="col">Campana</th>
                                <th scope="col">Email</th>
                            </tr>
                        </thead>
                        <tbody>
                            {NOTIF_ROWS.map((row) => (
                                <tr key={row.key}>
                                    <th scope="row">{row.label}</th>
                                    <td>
                                        <Toggle checked={channels[row.key].bell} onChange={(on) => setChannel(row.key, 'bell', on)} label={`${row.label} en la campana`} />
                                    </td>
                                    <td>
                                        <Toggle checked={channels[row.key].email} onChange={(on) => setChannel(row.key, 'email', on)} label={`${row.label} por email`} />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            ),
        },
        {
            id: 'help',
            title: 'Ayuda y soporte',
            desc: 'Reportes · Denuncias · Sugerencias',
            icon: '/info-solid-full.svg',
            content: (
                <>
                    <OptionRow
                        label="Reportar un problema"
                        description="Cuéntanos si algo no funciona bien en la app."
                        actionLabel="Reportar"
                        href="/contact"
                    />
                    {/* TODO: pantalla de mis denuncias */}
                    <OptionRow
                        label="Mis denuncias"
                        description="Consulta las denuncias que has enviado y en qué estado están."
                        actionLabel="Próximamente"
                        disabled
                    />
                    <OptionRow
                        label="Sugerencias"
                        description="Envía una sugerencia al buzón y la leeremos lo antes posible."
                        actionLabel="Enviar sugerencia"
                        href="/suggestions"
                    />
                </>
            ),
        },
        {
            id: 'session',
            title: 'Sesión',
            desc: 'Cerrar sesión · Eliminar perfil',
            icon: '/arrow-right-from-bracket-solid-full.svg',
            content: (
                <>
                    <OptionRow label="Cerrar sesión" description="Saldrás de tu cuenta en este dispositivo." actionLabel="Cerrar sesión" onClick={logout} />
                    <OptionRow
                        label="Eliminar perfil"
                        description="Se borrarán tu perfil, reseñas y datos de forma permanente. No se puede deshacer."
                        actionLabel="Eliminar perfil"
                        danger
                        onClick={() => openModal('delete')}
                    />
                </>
            ),
        },
    ];

    return (
        <SettingsShell sections={sections}>
            <SettingsModal
                isOpen={modal === 'username'}
                title="Cambiar nombre de usuario"
                text="Después tendrás que esperar 30 días para volver a cambiarlo."
                error={error}
                onClose={closeModal}
                onConfirm={saveUsername}
            >
                <div className="settings-modal-field">
                    <label className="settings-modal-label" htmlFor="settings-username">Nombre de usuario</label>
                    <Input
                        id="settings-username"
                        type="text"
                        autoComplete="username"
                        value={draft}
                        onChange={(e) => {
                            setDraft(e.target.value);
                            setError('');
                        }}
                    />
                </div>
            </SettingsModal>

            <SettingsModal
                isOpen={modal === 'email'}
                title="Cambiar email"
                text="Te enviaremos un correo al nuevo email para confirmarlo."
                error={error}
                onClose={closeModal}
                onConfirm={saveEmail}
            >
                <div className="settings-modal-field">
                    <label className="settings-modal-label" htmlFor="settings-email">Nuevo email</label>
                    <Input
                        id="settings-email"
                        type="email"
                        autoComplete="email"
                        value={draft}
                        onChange={(e) => {
                            setDraft(e.target.value);
                            setError('');
                        }}
                    />
                </div>
            </SettingsModal>

            <SettingsModal
                isOpen={modal === 'delete'}
                title="¿Eliminar tu perfil?"
                text="Se borrarán tu perfil, tus RVWs, comentarios y datos de forma permanente. No se puede deshacer."
                confirmLabel="Eliminar perfil"
                danger
                onClose={closeModal}
                onConfirm={deleteProfile}
            />

            <div role="status">{toast && <div className="settings-toast">{toast}</div>}</div>
        </SettingsShell>
    );
}

/* Modal de confirmación o con un campo, sobre components/Modal */
function SettingsModal({
    isOpen,
    title,
    text,
    children,
    confirmLabel = 'Guardar',
    danger,
    error,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    title: string;
    text?: string;
    children?: ReactNode;
    confirmLabel?: string;
    danger?: boolean;
    error?: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} labelledBy="settings-modal-title">
            <form
                className="settings-modal"
                onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm();
                }}
                noValidate
            >
                <div className="settings-modal-header">
                    <h2 className="section-title" id="settings-modal-title">{title}</h2>
                    {text && <p className="settings-modal-text">{text}</p>}
                </div>
                {children}
                {error && (
                    <p className="settings-modal-error" role="alert">
                        {error}
                    </p>
                )}
                <div className="settings-modal-actions">
                    <Button type="button" variant="text" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant={danger ? 'danger' : 'primary'}>
                        {confirmLabel}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}
