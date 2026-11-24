'use client';

import { useEffect, useState, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import Button from '../../../../components/Button/Button';
import Toggle from '../../../../components/Toggle/Toggle';
import Select from '../../../../components/Select/Select';
import Input from '../../../../components/Input/Input';
import TextArea from '../../../../components/TextArea/TextArea';
import { REPLY_SIGNATURE, REPLY_TEMPLATES, TYPE_LABEL, type InboxType } from '../inbox/mockInbox';
import { MAX_SANCTIONS } from '@/app/lib/adminModeration';
import { formatDate, MOCK_TODAY } from '@/app/lib/adminFilters';
import { DEFAULT_MAINTENANCE } from '@/app/lib/siteSettings';
import OptionRow from '../../settings/OptionRow';
import SettingsShell from '../../settings/SettingsShell';
import AdminDialog from '../AdminDialog';
import LegalEditor from './LegalEditor';
import { LEGAL_DOCS, type LegalDoc } from './mockLegal';
import '../../settings/settings.css';
import '../admin-shared.css';
import './admin-settings.css';

type SectionId = 'account' | 'notifications' | 'moderation' | 'inbox' | 'site' | 'legal' | 'session';

const SECTIONS: { id: SectionId; title: string; desc: string; icon: string }[] = [
    { id: 'account', title: 'Cuenta', desc: 'Nombre · Email · Seguridad', icon: '/user-regular-full.svg' },
    { id: 'notifications', title: 'Notificaciones', desc: 'Campana · Email · Resumen diario', icon: '/bell-regular-full.svg' },
    { id: 'moderation', title: 'Moderación', desc: 'Sanciones · Suspensiones · Palabras', icon: '/flag-regular-full.svg' },
    { id: 'inbox', title: 'Bandeja', desc: 'Plantillas · Firma', icon: '/inbox-regular-full.svg' },
    { id: 'site', title: 'Web', desc: 'Mantenimiento · Registro · Aviso', icon: '/house-regular-full.svg' },
    { id: 'legal', title: 'Textos legales', desc: 'Aviso legal · Privacidad · Normas', icon: '/newspaper-solid-full.svg' },
    { id: 'session', title: 'Sesión', desc: 'Cerrar sesión', icon: '/arrow-right-from-bracket-solid-full.svg' },
];

// Cada sección avisa con un toast al guardar
type Notify = (message: string) => void;

export default function AdminSettingsPage() {
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(''), 2200);
        return () => clearTimeout(timer);
    }, [toast]);

    const content: Record<SectionId, ReactNode> = {
        account: <AccountSection notify={setToast} />,
        notifications: <NotificationsSection notify={setToast} />,
        moderation: <ModerationSection notify={setToast} />,
        inbox: <InboxSection notify={setToast} />,
        site: <SiteSection notify={setToast} />,
        legal: <LegalSectionSettings notify={setToast} />,
        session: <SessionSection />,
    };

    return (
        <SettingsShell sections={SECTIONS.map((s) => ({ ...s, content: content[s.id] }))}>
            {/* Siempre en el DOM: los lectores de pantalla solo anuncian cambios en una región que ya existía */}
            <div role="status">{toast && <div className="admin-toast">{toast}</div>}</div>
        </SettingsShell>
    );
}

/* =========================================
   PIEZAS COMUNES
   (OptionRow es común con los ajustes de usuario: ../../settings/OptionRow;
   los modales son AdminDialog, como en el resto de admin)
   ========================================= */

/** Lista de valores en "pastillas" con ✕ y un campo para añadir */
function ChipEditor({
    items,
    onChange,
    placeholder,
    inputLabel,
    format = (v) => v,
    normalize = (v) => v.trim().toLowerCase(),
    validate,
    addLabel = 'Añadir',
    emptyText,
}: {
    items: string[];
    onChange: (items: string[]) => void;
    placeholder: string;
    /** Nombre del campo para lectores de pantalla (no tiene etiqueta visible) */
    inputLabel: string;
    format?: (value: string) => string;
    normalize?: (value: string) => string;
    validate?: (value: string) => string | null;
    addLabel?: string;
    emptyText?: string;
}) {
    const [draft, setDraft] = useState('');
    const [error, setError] = useState('');

    const add = () => {
        if (!draft.trim()) return;
        // normalize puede dejarlo vacío (p. ej. "abc" en días): lo dice validate
        const value = normalize(draft);
        const problem = validate?.(value) ?? (items.includes(value) ? 'Ya está en la lista.' : null);
        if (problem) {
            setError(problem);
            return;
        }
        onChange([...items, value]);
        setDraft('');
        setError('');
    };

    return (
        <div className="admin-chip-editor">
            {items.length === 0 ? (
                emptyText && <p className="admin-chip-empty">{emptyText}</p>
            ) : (
                <ul className="admin-chips">
                    {items.map((item) => (
                        <li key={item} className="admin-chip">
                            {format(item)}
                            <button type="button" onClick={() => onChange(items.filter((i) => i !== item))} aria-label={`Quitar ${format(item)}`}>
                                ✕
                            </button>
                        </li>
                    ))}
                </ul>
            )}
            <form
                className="admin-chip-add"
                onSubmit={(e) => {
                    e.preventDefault();
                    add();
                }}
            >
                <Input
                    type="text"
                    placeholder={placeholder}
                    aria-label={inputLabel}
                    value={draft}
                    onChange={(e) => {
                        setDraft(e.target.value);
                        setError('');
                    }}
                />
                <Button variant="outline" type="submit">
                    {addLabel}
                </Button>
            </form>
            {error && (
                <p className="modal-error-text" role="alert">
                    {error}
                </p>
            )}
        </div>
    );
}

/* =========================================
   CUENTA
   ========================================= */

interface Session {
    id: string;
    device: string;
    place: string;
    lastActive: string;
    current?: boolean;
}

const MOCK_SESSIONS: Session[] = [
    { id: 'se1', device: 'Chrome en Windows', place: 'Madrid, España', lastActive: 'Ahora', current: true },
    { id: 'se2', device: 'Safari en iPhone', place: 'Madrid, España', lastActive: 'Hace 2 horas' },
    { id: 'se3', device: 'Firefox en macOS', place: 'Valencia, España', lastActive: 'Hace 5 días' },
];

type AccountModal = 'name' | 'email' | 'password' | '2fa-on' | '2fa-off' | 'sessions' | null;

const PASSWORD_FIELDS = [
    { field: 'current', label: 'Contraseña actual', autoComplete: 'current-password' },
    { field: 'next', label: 'Nueva contraseña', autoComplete: 'new-password' },
    { field: 'repeat', label: 'Repite la nueva contraseña', autoComplete: 'new-password' },
] as const;

function AccountSection({ notify }: { notify: Notify }) {
    const [name, setName] = useState('Raquel Arnaiz');
    const [email, setEmail] = useState('admin@rvwd.com');
    const [passwordChanged, setPasswordChanged] = useState('Hace 3 meses');
    const [twoFactor, setTwoFactor] = useState(false);
    const [sessions, setSessions] = useState<Session[]>(MOCK_SESSIONS);

    const [modal, setModal] = useState<AccountModal>(null);
    const [draft, setDraft] = useState('');
    const [passwords, setPasswords] = useState({ current: '', next: '', repeat: '' });
    const [error, setError] = useState('');

    const open = (m: AccountModal, initial = '') => {
        setModal(m);
        setDraft(initial);
        setPasswords({ current: '', next: '', repeat: '' });
        setError('');
    };
    const close = () => setModal(null);

    const saveName = () => {
        if (!draft.trim()) return setError('El nombre no puede estar vacío.');
        setName(draft.trim());
        close();
        notify('Nombre guardado');
    };

    const saveEmail = () => {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(draft.trim())) return setError('Escribe un email válido.');
        setEmail(draft.trim());
        close();
        notify('Te hemos enviado un correo para confirmar el nuevo email');
    };

    const savePassword = () => {
        if (!passwords.current) return setError('Escribe tu contraseña actual.');
        if (passwords.next.length < 8) return setError('La nueva contraseña debe tener al menos 8 caracteres.');
        if (passwords.next !== passwords.repeat) return setError('Las contraseñas nuevas no coinciden.');
        setPasswordChanged('Hoy');
        close();
        notify('Contraseña cambiada');
    };

    const enable2fa = () => {
        if (!/^\d{6}$/.test(draft.trim())) return setError('El código tiene 6 números.');
        setTwoFactor(true);
        close();
        notify('Verificación en dos pasos activada');
    };

    const closeOtherSessions = () => {
        setSessions((prev) => prev.filter((s) => s.current));
        close();
        notify('Se han cerrado las demás sesiones');
    };

    return (
        <>
            <OptionRow label="Nombre" value={name} description="Es el que ve el equipo en notas e historiales." onClick={() => open('name', name)} />
            <OptionRow label="Email" value={email} description="Lo usamos para avisos y para recuperar la cuenta." onClick={() => open('email', email)} />
            <OptionRow label="Contraseña" value={`Último cambio: ${passwordChanged.toLowerCase()}`} onClick={() => open('password')} />
            <OptionRow
                label="Verificación en dos pasos"
                value={twoFactor ? 'Activada' : 'Desactivada'}
                description="Además de la contraseña, se pide un código de tu app de autenticación. Muy recomendable en una cuenta de admin."
                control={<Toggle checked={twoFactor} onChange={(on) => open(on ? '2fa-on' : '2fa-off')} label="Verificación en dos pasos" />}
            />

            <div className="settings-block">
                <div className="settings-block-head">
                    <div>
                        <span className="settings-option-label">Sesiones abiertas</span>
                        <span className="settings-option-description">Dispositivos donde está iniciada tu cuenta de admin.</span>
                    </div>
                    {sessions.length > 1 && (
                        <Button variant="outline" className="admin-block-btn" onClick={() => open('sessions')}>
                            Cerrar las demás
                        </Button>
                    )}
                </div>
                <ul className="admin-sessions">
                    {sessions.map((s) => (
                        <li key={s.id} className="admin-session">
                            <span className="admin-session-device">
                                {s.device}
                                {s.current && <span className="admin-session-current">Este dispositivo</span>}
                            </span>
                            <span className="admin-session-meta">
                                {s.place} · {s.lastActive}
                            </span>
                        </li>
                    ))}
                </ul>
            </div>

            <AdminDialog isOpen={modal === 'name'} title="Cambiar nombre" confirmLabel="Guardar" error={error} onClose={close} onConfirm={saveName}>
                <div className="modal-field">
                    <label htmlFor="admin-settings-name" className="admin-dialog-label">Nombre</label>
                    <Input
                        id="admin-settings-name"
                        type="text"
                        autoComplete="name"
                        value={draft}
                        onChange={(e) => { setDraft(e.target.value); setError(''); }}
                    />
                </div>
            </AdminDialog>
            <AdminDialog
                isOpen={modal === 'email'}
                title="Cambiar email"
                text="Te enviaremos un correo al nuevo email para confirmarlo."
                confirmLabel="Guardar"
                error={error}
                onClose={close}
                onConfirm={saveEmail}
            >
                <div className="modal-field">
                    <label htmlFor="admin-settings-email" className="admin-dialog-label">Nuevo email</label>
                    <Input
                        id="admin-settings-email"
                        type="email"
                        autoComplete="email"
                        value={draft}
                        onChange={(e) => { setDraft(e.target.value); setError(''); }}
                    />
                </div>
            </AdminDialog>
            <AdminDialog isOpen={modal === 'password'} title="Cambiar contraseña" confirmLabel="Guardar" error={error} onClose={close} onConfirm={savePassword}>
                {PASSWORD_FIELDS.map(({ field, label, autoComplete }) => (
                    <div className="modal-field" key={field}>
                        <label htmlFor={`admin-settings-password-${field}`} className="admin-dialog-label">{label}</label>
                        <Input
                            id={`admin-settings-password-${field}`}
                            type="password"
                            autoComplete={autoComplete}
                            value={passwords[field]}
                            onChange={(e) => {
                                setPasswords((p) => ({ ...p, [field]: e.target.value }));
                                setError('');
                            }}
                        />
                    </div>
                ))}
            </AdminDialog>
            <AdminDialog
                isOpen={modal === '2fa-on'}
                title="Activar verificación en dos pasos"
                text="Escanea el código con tu app de autenticación (Google Authenticator, 1Password…) y escribe el código de 6 números que te muestre."
                confirmLabel="Activar"
                error={error}
                onClose={close}
                onConfirm={enable2fa}
            >
                <div className="admin-qr-placeholder" role="img" aria-label="Código QR de ejemplo">QR</div>
                <div className="modal-field">
                    <label htmlFor="admin-settings-2fa" className="admin-dialog-label">Código</label>
                    <Input
                        id="admin-settings-2fa"
                        type="text"
                        inputMode="numeric"
                        autoComplete="one-time-code"
                        maxLength={6}
                        placeholder="123456"
                        value={draft}
                        onChange={(e) => { setDraft(e.target.value); setError(''); }}
                    />
                </div>
            </AdminDialog>
            <AdminDialog
                isOpen={modal === '2fa-off'}
                title="¿Desactivar la verificación en dos pasos?"
                text="Tu cuenta de admin quedará protegida solo con la contraseña."
                confirmLabel="Desactivar"
                danger
                onClose={close}
                onConfirm={() => {
                    setTwoFactor(false);
                    close();
                    notify('Verificación en dos pasos desactivada');
                }}
            />
            <AdminDialog
                isOpen={modal === 'sessions'}
                title="¿Cerrar las demás sesiones?"
                text={`Se cerrará la sesión en ${sessions.length - 1} ${sessions.length - 1 === 1 ? 'dispositivo' : 'dispositivos'}. Este seguirá conectado.`}
                confirmLabel="Cerrar sesiones"
                danger
                onClose={close}
                onConfirm={closeOtherSessions}
            />
        </>
    );
}

/* =========================================
   NOTIFICACIONES
   ========================================= */

type NotifKey = 'reports' | 'contact' | 'suggestions';

const NOTIF_ROWS: { key: NotifKey; label: string }[] = [
    { key: 'reports', label: 'Nueva denuncia' },
    { key: 'contact', label: 'Mensaje de contacto' },
    { key: 'suggestions', label: 'Nueva sugerencia' },
];

const URGENT_OPTIONS = [3, 5, 10].map((n) => ({ value: String(n), label: `${n} denuncias` }));
const DIGEST_OPTIONS = ['08:00', '09:00', '14:00', '20:00'].map((h) => ({ value: h, label: `A las ${h}` }));

function NotificationsSection({ notify }: { notify: Notify }) {
    const [channels, setChannels] = useState<Record<NotifKey, { bell: boolean; email: boolean }>>({
        reports: { bell: true, email: false },
        contact: { bell: true, email: true },
        suggestions: { bell: true, email: false },
    });
    const [urgent, setUrgent] = useState(true);
    const [urgentThreshold, setUrgentThreshold] = useState('5');
    const [digest, setDigest] = useState(true);
    const [digestTime, setDigestTime] = useState('09:00');

    const setChannel = (key: NotifKey, channel: 'bell' | 'email', on: boolean) => {
        setChannels((prev) => ({ ...prev, [key]: { ...prev[key], [channel]: on } }));
        notify('Guardado');
    };

    return (
        <>
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

            <OptionRow
                label="Aviso urgente"
                description="Si un contenido llega a este número de denuncias, te avisamos por la campana y por email aunque tengas el resto apagado."
                control={
                    <>
                        {urgent && (
                            <Select
                                className="settings-inline-select"
                                ariaLabel="Denuncias para el aviso urgente"
                                options={URGENT_OPTIONS}
                                value={urgentThreshold}
                                onChange={(v) => {
                                    setUrgentThreshold(v);
                                    notify('Guardado');
                                }}
                            />
                        )}
                        <Toggle checked={urgent} onChange={(on) => { setUrgent(on); notify('Guardado'); }} label="Aviso urgente" />
                    </>
                }
            />
            <OptionRow
                label="Resumen diario por email"
                description="Un correo al día con lo pendiente: denuncias, mensajes y sugerencias."
                control={
                    <>
                        {digest && (
                            <Select
                                className="settings-inline-select"
                                ariaLabel="Hora del resumen diario"
                                options={DIGEST_OPTIONS}
                                value={digestTime}
                                onChange={(v) => {
                                    setDigestTime(v);
                                    notify('Guardado');
                                }}
                            />
                        )}
                        <Toggle checked={digest} onChange={(on) => { setDigest(on); notify('Guardado'); }} label="Resumen diario por email" />
                    </>
                }
            />
        </>
    );
}

/* =========================================
   MODERACIÓN
   ========================================= */

const BAN_AT_OPTIONS = [2, 3, 4, 5].map((n) => ({ value: String(n), label: `${n} sanciones` }));
const EXPIRY_OPTIONS = [
    { value: '30', label: '30 días' },
    { value: '60', label: '60 días' },
    { value: '90', label: '90 días' },
    { value: '180', label: '180 días' },
    { value: 'never', label: 'No caducan' },
];
const AUTO_HIDE_OPTIONS = [3, 5, 10].map((n) => ({ value: String(n), label: `${n} denuncias` }));

const daysLabel = (d: string) => `${d} ${d === '1' ? 'día' : 'días'}`;

function ModerationSection({ notify }: { notify: Notify }) {
    const [banAt, setBanAt] = useState(String(MAX_SANCTIONS));
    const [banDraft, setBanDraft] = useState(banAt);
    const [isBanModalOpen, setIsBanModalOpen] = useState(false);
    const [expiry, setExpiry] = useState('90');
    const [durations, setDurations] = useState(['3', '7', '15', '30']);
    const [autoHide, setAutoHide] = useState(false);
    const [autoHideAt, setAutoHideAt] = useState('5');
    const [words, setWords] = useState(['compra seguidores', 'seguidores gratis', 'gana dinero']);

    return (
        <>
            <OptionRow
                label="Sanciones para banear"
                value={`${banAt} sanciones activas`}
                description="Al llegar a este número, la cuenta se banea automáticamente."
                onClick={() => {
                    setBanDraft(banAt);
                    setIsBanModalOpen(true);
                }}
            />
            <OptionRow
                label="Caducidad de las sanciones"
                description="Pasado este tiempo, una sanción deja de contar para el baneo."
                control={
                    <Select
                        className="settings-inline-select"
                        ariaLabel="Caducidad de las sanciones"
                        options={EXPIRY_OPTIONS}
                        value={expiry}
                        onChange={(v) => {
                            setExpiry(v);
                            notify('Guardado');
                        }}
                    />
                }
            />

            <div className="settings-block">
                <div className="settings-block-head">
                    <div>
                        <span className="settings-option-label">Duraciones de suspensión</span>
                        <span className="settings-option-description">Las opciones que salen al suspender una cuenta.</span>
                    </div>
                </div>
                <ChipEditor
                    items={durations}
                    onChange={(list) => {
                        setDurations([...list].sort((a, b) => Number(a) - Number(b)));
                        notify('Guardado');
                    }}
                    placeholder="Días (p. ej. 14)"
                    inputLabel="Añadir duración en días"
                    format={daysLabel}
                    normalize={(v) => String(parseInt(v, 10) || '')}
                    validate={(v) =>
                        Number(v) < 1 || Number(v) > 365
                            ? 'Escribe un número de días entre 1 y 365.'
                            : durations.includes(v)
                              ? 'Esa duración ya está.'
                              : null
                    }
                    emptyText="Sin duraciones: solo se podrá banear."
                />
            </div>

            <OptionRow
                label="Ocultar automáticamente"
                description="Oculta un contenido cuando llega a este número de denuncias pendientes, hasta que lo revises."
                control={
                    <>
                        {autoHide && (
                            <Select
                                className="settings-inline-select"
                                ariaLabel="Denuncias para ocultar"
                                options={AUTO_HIDE_OPTIONS}
                                value={autoHideAt}
                                onChange={(v) => {
                                    setAutoHideAt(v);
                                    notify('Guardado');
                                }}
                            />
                        )}
                        <Toggle checked={autoHide} onChange={(on) => { setAutoHide(on); notify('Guardado'); }} label="Ocultar automáticamente" />
                    </>
                }
            />

            <div className="settings-block">
                <div className="settings-block-head">
                    <div>
                        <span className="settings-option-label">Palabras prohibidas</span>
                        <span className="settings-option-description">
                            El contenido que contenga alguna se marca para revisión. También sirven frases.
                        </span>
                    </div>
                    <span className="admin-block-count">{words.length}</span>
                </div>
                <ChipEditor
                    items={words}
                    onChange={(list) => {
                        setWords(list);
                        notify('Guardado');
                    }}
                    placeholder="Añadir palabra o frase"
                    inputLabel="Añadir palabra o frase prohibida"
                    emptyText="No hay palabras prohibidas."
                />
            </div>

            <AdminDialog
                isOpen={isBanModalOpen}
                title="Sanciones para banear"
                text="Cambia la regla para todos los usuarios. Quien ya tenga ese número de sanciones se baneará con su próxima sanción, no ahora."
                confirmLabel="Cambiar regla"
                danger
                onClose={() => setIsBanModalOpen(false)}
                onConfirm={() => {
                    setBanAt(banDraft);
                    setIsBanModalOpen(false);
                    notify('Regla de baneo cambiada');
                }}
            >
                <div className="modal-field">
                    <span id="admin-settings-ban-label" className="admin-dialog-label">Banear al llegar a</span>
                    <Select labelledBy="admin-settings-ban-label" options={BAN_AT_OPTIONS} value={banDraft} onChange={setBanDraft} />
                </div>
            </AdminDialog>
        </>
    );
}

/* =========================================
   BANDEJA
   ========================================= */

interface Template {
    id: string;
    type: InboxType;
    label: string;
    text: string;
}

const INITIAL_TEMPLATES: Template[] = (Object.keys(REPLY_TEMPLATES) as InboxType[]).flatMap((type) =>
    REPLY_TEMPLATES[type].map((t) => ({ id: `${type}-${t.value}`, type, label: t.label, text: t.text }))
);

const TEMPLATE_TYPE_OPTIONS = (Object.keys(TYPE_LABEL) as InboxType[]).map((t) => ({ value: t, label: TYPE_LABEL[t] }));

function InboxSection({ notify }: { notify: Notify }) {
    const [templates, setTemplates] = useState<Template[]>(INITIAL_TEMPLATES);
    const [editing, setEditing] = useState<Template | null>(null);
    const [toDelete, setToDelete] = useState<Template | null>(null);
    const [templateError, setTemplateError] = useState('');
    const [signature, setSignature] = useState(REPLY_SIGNATURE);
    const [signatureDraft, setSignatureDraft] = useState<string | null>(null);
    const [signatureError, setSignatureError] = useState('');

    const startNew = () => {
        setEditing({ id: '', type: 'contact', label: '', text: '' });
        setTemplateError('');
    };

    const saveTemplate = () => {
        if (!editing) return;
        if (!editing.label.trim() || !editing.text.trim()) return setTemplateError('Pon un nombre y el texto de la plantilla.');
        const clean = { ...editing, label: editing.label.trim(), text: editing.text.trim() };
        setTemplates((prev) =>
            clean.id ? prev.map((t) => (t.id === clean.id ? clean : t)) : [...prev, { ...clean, id: `tpl-${Date.now()}` }]
        );
        setEditing(null);
        notify(clean.id ? 'Plantilla guardada' : 'Plantilla creada');
    };

    return (
        <>
            <div className="settings-block">
                <div className="settings-block-head">
                    <div>
                        <span className="settings-option-label">Plantillas de respuesta</span>
                        <span className="settings-option-description">
                            Salen en «Usar plantilla» al responder. El saludo y la firma se añaden solos.
                        </span>
                    </div>
                    <Button variant="outline" className="admin-block-btn" onClick={startNew}>
                        Nueva plantilla
                    </Button>
                </div>
                {TEMPLATE_TYPE_OPTIONS.map(({ value: type, label }) => {
                    const list = templates.filter((t) => t.type === type);
                    return (
                        <div key={type} className="admin-template-group">
                            <span className="admin-template-group-title">{label}</span>
                            {list.length === 0 ? (
                                <p className="admin-chip-empty">Sin plantillas.</p>
                            ) : (
                                <ul className="admin-templates">
                                    {list.map((t) => (
                                        <li key={t.id} className="admin-template">
                                            <span className="admin-template-text">
                                                <span className="admin-template-label">{t.label}</span>
                                                <span className="admin-template-preview">{t.text}</span>
                                            </span>
                                            <span className="admin-template-actions">
                                                <button
                                                    type="button"
                                                    className="admin-text-btn"
                                                    onClick={() => { setEditing(t); setTemplateError(''); }}
                                                    aria-label={`Editar la plantilla «${t.label}»`}
                                                >
                                                    Editar
                                                </button>
                                                <button
                                                    type="button"
                                                    className="admin-text-btn danger"
                                                    onClick={() => setToDelete(t)}
                                                    aria-label={`Borrar la plantilla «${t.label}»`}
                                                >
                                                    Borrar
                                                </button>
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    );
                })}
            </div>

            <OptionRow
                label="Firma"
                value={<span className="admin-signature-preview">{signature}</span>}
                description="Se añade al final de cada respuesta."
                onClick={() => {
                    setSignatureDraft(signature);
                    setSignatureError('');
                }}
            />

            {/* Montados solo con datos: su contenido lee editing / toDelete / signatureDraft */}
            {editing && (
                <AdminDialog
                    isOpen
                    title={editing.id ? 'Editar plantilla' : 'Nueva plantilla'}
                    confirmLabel="Guardar"
                    error={templateError}
                    onClose={() => setEditing(null)}
                    onConfirm={saveTemplate}
                >
                    <div className="modal-field">
                        <span id="admin-settings-template-type-label" className="admin-dialog-label">Para</span>
                        <Select
                            labelledBy="admin-settings-template-type-label"
                            options={TEMPLATE_TYPE_OPTIONS}
                            value={editing.type}
                            onChange={(v) => setEditing({ ...editing, type: v as InboxType })}
                        />
                    </div>
                    <div className="modal-field">
                        <label htmlFor="admin-settings-template-label" className="admin-dialog-label">Nombre</label>
                        <Input
                            id="admin-settings-template-label"
                            type="text"
                            placeholder="p. ej. Gracias por escribir"
                            value={editing.label}
                            onChange={(e) => { setEditing({ ...editing, label: e.target.value }); setTemplateError(''); }}
                        />
                    </div>
                    <div className="modal-field">
                        <label htmlFor="admin-settings-template-text" className="admin-dialog-label">Texto</label>
                        <TextArea
                            id="admin-settings-template-text"
                            value={editing.text}
                            onChange={(e) => { setEditing({ ...editing, text: e.target.value }); setTemplateError(''); }}
                            rows={5}
                            placeholder="Escribe la respuesta, sin saludo ni firma..."
                        />
                    </div>
                </AdminDialog>
            )}
            {toDelete && (
                <AdminDialog
                    isOpen
                    title="¿Borrar esta plantilla?"
                    text={<>Se borrará «{toDelete.label}». No afecta a las respuestas ya enviadas.</>}
                    confirmLabel="Borrar"
                    danger
                    onClose={() => setToDelete(null)}
                    onConfirm={() => {
                        setTemplates((prev) => prev.filter((t) => t.id !== toDelete.id));
                        setToDelete(null);
                        notify('Plantilla borrada');
                    }}
                />
            )}
            {signatureDraft !== null && (
                <AdminDialog
                    isOpen
                    title="Cambiar firma"
                    confirmLabel="Guardar"
                    error={signatureError}
                    onClose={() => setSignatureDraft(null)}
                    onConfirm={() => {
                        if (!signatureDraft.trim()) return setSignatureError('La firma no puede estar vacía.');
                        setSignature(signatureDraft.trim());
                        setSignatureDraft(null);
                        notify('Firma guardada');
                    }}
                >
                    <div className="modal-field">
                        <label htmlFor="admin-settings-signature" className="admin-dialog-label">Firma</label>
                        <TextArea
                            id="admin-settings-signature"
                            value={signatureDraft}
                            onChange={(e) => { setSignatureDraft(e.target.value); setSignatureError(''); }}
                            rows={3}
                        />
                    </div>
                </AdminDialog>
            )}
        </>
    );
}

/* =========================================
   WEB
   ========================================= */

const NOTICE_TONES = [
    { value: 'info', label: 'Informativo' },
    { value: 'warning', label: 'Importante' },
];

type SiteModal = 'maintenance-on' | 'maintenance-edit' | 'registration-off' | 'notice' | null;

function SiteSection({ notify }: { notify: Notify }) {
    const [maintenance, setMaintenance] = useState(false);
    const [maintenanceInfo, setMaintenanceInfo] = useState(DEFAULT_MAINTENANCE);
    const [maintenanceDraft, setMaintenanceDraft] = useState(DEFAULT_MAINTENANCE);
    const [registration, setRegistration] = useState(true);
    const [notice, setNotice] = useState<{ text: string; tone: string } | null>(null);
    const [noticeDraft, setNoticeDraft] = useState({ text: '', tone: 'info' });
    const [modal, setModal] = useState<SiteModal>(null);
    const [error, setError] = useState('');
    const close = () => setModal(null);

    return (
        <>
            <OptionRow
                label="Modo mantenimiento"
                value={
                    maintenance ? (
                        <span className="admin-value-alert">
                            Activado: la web está cerrada
                            {maintenanceInfo.returnTime && ` · vuelta prevista a las ${maintenanceInfo.returnTime}`}
                        </span>
                    ) : (
                        'Desactivado'
                    )
                }
                description="Manda a todo el mundo a la página de mantenimiento, menos a admin."
                control={
                    <>
                        {maintenance ? (
                            <button
                                type="button"
                                className="admin-text-btn"
                                onClick={() => {
                                    setMaintenanceDraft(maintenanceInfo);
                                    setError('');
                                    setModal('maintenance-edit');
                                }}
                            >
                                Editar mensaje
                            </button>
                        ) : (
                            <a href="/maintenance" target="_blank" rel="noopener noreferrer" className="admin-text-btn">
                                Ver página ↗
                            </a>
                        )}
                        <Toggle
                            checked={maintenance}
                            onChange={(on) => {
                                if (on) {
                                    setMaintenanceDraft(maintenanceInfo);
                                    setError('');
                                    setModal('maintenance-on');
                                }
                                else {
                                    setMaintenance(false);
                                    notify('La web vuelve a estar abierta');
                                }
                            }}
                            label="Modo mantenimiento"
                        />
                    </>
                }
            />
            <OptionRow
                label="Registro de usuarios"
                value={registration ? 'Abierto' : <span className="admin-value-alert">Cerrado</span>}
                description="Ciérralo si hay una ola de cuentas de spam. Quien ya tiene cuenta puede seguir entrando."
                control={
                    <Toggle
                        checked={registration}
                        onChange={(on) => {
                            if (!on) setModal('registration-off');
                            else {
                                setRegistration(true);
                                notify('Registro abierto');
                            }
                        }}
                        label="Registro de usuarios abierto"
                    />
                }
            />
            <OptionRow
                label="Aviso general"
                value={notice ? `«${notice.text}»` : 'Sin aviso'}
                description="Un mensaje que sale arriba en toda la web."
                actionLabel={notice ? 'Cambiar' : 'Añadir'}
                onClick={() => {
                    setNoticeDraft(notice ?? { text: '', tone: 'info' });
                    setError('');
                    setModal('notice');
                }}
            />

            <AdminDialog
                isOpen={modal === 'maintenance-on' || modal === 'maintenance-edit'}
                title={modal === 'maintenance-on' ? '¿Activar el modo mantenimiento?' : 'Mensaje de mantenimiento'}
                text={
                    modal === 'maintenance-on'
                        ? 'Nadie salvo admin podrá usar la web hasta que lo desactives. Esto es lo que verán:'
                        : 'Lo que ven los usuarios en la página de mantenimiento.'
                }
                confirmLabel={modal === 'maintenance-on' ? 'Activar' : 'Guardar'}
                danger={modal === 'maintenance-on'}
                error={error}
                onClose={close}
                onConfirm={() => {
                    if (!maintenanceDraft.message.trim()) return setError('Escribe el mensaje que verán los usuarios.');
                    setMaintenanceInfo({ message: maintenanceDraft.message.trim(), returnTime: maintenanceDraft.returnTime.trim() });
                    const activating = modal === 'maintenance-on';
                    setMaintenance(true);
                    close();
                    notify(activating ? 'Modo mantenimiento activado' : 'Mensaje guardado');
                }}
            >
                <div className="modal-field">
                    <label htmlFor="admin-settings-maintenance-message" className="admin-dialog-label">Mensaje</label>
                    <TextArea
                        id="admin-settings-maintenance-message"
                        value={maintenanceDraft.message}
                        onChange={(e) => {
                            setMaintenanceDraft({ ...maintenanceDraft, message: e.target.value });
                            setError('');
                        }}
                        rows={3}
                    />
                </div>
                <div className="modal-field">
                    <label htmlFor="admin-settings-maintenance-time" className="admin-dialog-label">Vuelta prevista (opcional)</label>
                    <Input
                        id="admin-settings-maintenance-time"
                        type="time"
                        value={maintenanceDraft.returnTime}
                        onChange={(e) => setMaintenanceDraft({ ...maintenanceDraft, returnTime: e.target.value })}
                    />
                </div>
            </AdminDialog>
            <AdminDialog
                isOpen={modal === 'registration-off'}
                title="¿Cerrar el registro?"
                text="No se podrán crear cuentas nuevas hasta que lo vuelvas a abrir."
                confirmLabel="Cerrar registro"
                danger
                onClose={close}
                onConfirm={() => {
                    setRegistration(false);
                    close();
                    notify('Registro cerrado');
                }}
            />
            <AdminDialog
                isOpen={modal === 'notice'}
                title={notice ? 'Cambiar aviso general' : 'Añadir aviso general'}
                confirmLabel="Publicar aviso"
                error={error}
                onClose={close}
                onConfirm={() => {
                    if (!noticeDraft.text.trim()) return setError('Escribe el texto del aviso.');
                    setNotice({ ...noticeDraft, text: noticeDraft.text.trim() });
                    close();
                    notify('Aviso publicado');
                }}
            >
                <div className="modal-field">
                    <label htmlFor="admin-settings-notice-text" className="admin-dialog-label">Texto</label>
                    <TextArea
                        id="admin-settings-notice-text"
                        value={noticeDraft.text}
                        onChange={(e) => { setNoticeDraft({ ...noticeDraft, text: e.target.value }); setError(''); }}
                        rows={3}
                        placeholder="p. ej. Mañana de 2 a 4 h habrá mantenimiento."
                    />
                </div>
                <div className="modal-field">
                    <span id="admin-settings-notice-tone-label" className="admin-dialog-label">Tipo</span>
                    <Select
                        labelledBy="admin-settings-notice-tone-label"
                        options={NOTICE_TONES}
                        value={noticeDraft.tone}
                        onChange={(v) => setNoticeDraft({ ...noticeDraft, tone: v })}
                    />
                </div>
                {notice && (
                    <button
                        type="button"
                        className="admin-text-btn danger admin-remove-notice"
                        onClick={() => {
                            setNotice(null);
                            close();
                            notify('Aviso quitado');
                        }}
                    >
                        Quitar el aviso
                    </button>
                )}
            </AdminDialog>
        </>
    );
}

/* =========================================
   TEXTOS LEGALES
   ========================================= */

// Fecha de "hoy" en YYYY-MM-DD (con datos de ejemplo, la fecha de referencia)
const todayIso = () => {
    const d = MOCK_TODAY;
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

function LegalSectionSettings({ notify }: { notify: Notify }) {
    const [docs, setDocs] = useState<LegalDoc[]>(LEGAL_DOCS);
    const [editing, setEditing] = useState<LegalDoc | null>(null);

    // TODO: con backend, guardar el documento y (si se marca) avisar a los usuarios
    const handlePublish = (doc: LegalDoc, notifyUsers: boolean) => {
        setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...doc, updatedAt: todayIso() } : d)));
        setEditing(null);
        notify(notifyUsers ? 'Cambios publicados. Avisaremos a los usuarios' : 'Cambios publicados');
    };

    return (
        <>
            {docs.map((doc) => (
                <OptionRow
                    key={doc.id}
                    label={doc.title}
                    value={`Actualizado el ${formatDate(doc.updatedAt)} · ${doc.sections.length} apartados`}
                    description={`Se muestra en ${doc.href}.`}
                    actionLabel="Editar"
                    onClick={() => setEditing(doc)}
                />
            ))}
            {editing && <LegalEditor doc={editing} onClose={() => setEditing(null)} onPublish={handlePublish} />}
        </>
    );
}

/* =========================================
   SESIÓN
   ========================================= */

function SessionSection() {
    const router = useRouter();
    // TODO: cerrar sesión de verdad cuando haya autenticación
    return (
        <OptionRow
            label="Cerrar sesión"
            description="Saldrás de la cuenta de admin en este dispositivo."
            actionLabel="Cerrar sesión"
            danger
            onClick={() => router.push('/')}
        />
    );
}
