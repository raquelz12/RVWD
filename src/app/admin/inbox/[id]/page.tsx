'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Select from '../../../../../components/Select/Select';
import TextArea from '../../../../../components/TextArea/TextArea';
import Button from '../../../../../components/Button/Button';
import MoreMenu, { type MoreMenuItem } from '../../../../../components/MoreMenu/MoreMenu';
import {
    CURRENT_ADMIN,
    MOCK_INBOX,
    REPLY_SIGNATURE,
    REPLY_TEMPLATES,
    TYPE_LABEL,
    getThread,
    statusClass,
    statusAfterReply,
    statusesFor,
    type InboxActivity,
    type InboxMessage,
    type InboxReply,
    type InboxStatus,
} from '../mockInbox';
import { markRead, markUnread, useReadInbox } from '../useReadInbox';
import { MAX_SANCTIONS } from '@/app/lib/adminModeration';
import { formatDate, timeAgo } from '@/app/lib/adminFilters';
import '../../admin-shared.css';
import './inbox-detail.css';

const REPLY_BOX_ID = 'inbox-reply-text';
const REPLY_TITLE_ID = 'inbox-reply-title';

// Baja al cuadro de respuesta y deja el cursor al final del texto
const focusReply = () => {
    const box = document.getElementById(REPLY_BOX_ID) as HTMLTextAreaElement | null;
    if (!box) return;
    box.scrollIntoView({ behavior: 'smooth', block: 'center' });
    box.focus({ preventScroll: true });
    box.setSelectionRange(box.value.length, box.value.length);
};

const greetingFor = (m: InboxMessage) => (m.name ? `Hola ${m.name.split(' ')[0]},` : '¡Hola!');

// Con cacheComponents, useParams() solo se conoce en runtime, así que va dentro de un Suspense
export default function AdminInboxDetailPage() {
    return (
        <Suspense fallback={null}>
            <AdminInboxDetailWithParams />
        </Suspense>
    );
}

// La key recrea la página al cambiar de mensaje ("Siguiente sin leer"),
// porque Next conserva el estado de las rutas ya visitadas
function AdminInboxDetailWithParams() {
    const { id } = useParams<{ id: string }>();
    const initial = MOCK_INBOX.find((m) => m.id === id);
    if (!initial) return <MessageNotFound />;
    return <AdminInboxDetail key={id} initial={initial} />;
}

function BackToInbox({ href, nextUnreadId }: { href: string; nextUnreadId?: string }) {
    const router = useRouter();
    return (
        <div className="admin-detail-topbar">
            <Button className="back-btn" onClick={() => router.push(href)} variant="text">
                Volver a la bandeja
            </Button>
            {nextUnreadId && (
                <Link href={`/admin/inbox/${nextUnreadId}`} className="admin-next-link">
                    Siguiente sin leer ›
                </Link>
            )}
        </div>
    );
}

function MessageNotFound() {
    return (
        <div className="admin-detail-container">
            <BackToInbox href="/admin/inbox" />
            <p className="admin-empty-message">No se ha encontrado este mensaje. Puede que el enlace sea incorrecto.</p>
        </div>
    );
}

function AdminInboxDetail({ initial }: { initial: InboxMessage }) {
    const router = useRouter();
    const read = useReadInbox();
    const thread = getThread(initial.id);

    // TODO: con backend, los cambios de estado se guardarán en el servidor
    const [message, setMessage] = useState<InboxMessage>(initial);
    const [replies, setReplies] = useState<InboxReply[]>(thread.replies);
    const [activity, setActivity] = useState<InboxActivity[]>(thread.activity);

    const isContact = message.type === 'contact';
    const backHref = `/admin/inbox?tab=${message.type}`;
    const displayName = message.name ?? message.user?.username ?? message.email;
    const subline = message.name ? (message.user ? message.user.username : message.email) : message.user ? message.email : null;
    const statusOptions = statusesFor(message.type).map((s) => ({ value: s, label: s }));

    // Al abrirlo queda leído (también en el listado)
    useEffect(() => {
        markRead([initial.id]);
    }, [initial.id]);

    // Siguiente sin leer (en orden circular, sin contar el actual)
    const currentIndex = MOCK_INBOX.findIndex((m) => m.id === message.id);
    const nextUnread = [...MOCK_INBOX.slice(currentIndex + 1), ...MOCK_INBOX.slice(0, currentIndex)].find(
        (m) => !read.has(m.id)
    );

    // Respuesta
    const greeting = greetingFor(message);
    const emptyReply = `${greeting}\n\n`;
    const [replyText, setReplyText] = useState(emptyReply);
    const [replyTemplate, setReplyTemplate] = useState('');
    const [replyStatus, setReplyStatus] = useState<InboxStatus>(statusAfterReply(message.status));
    const [replyError, setReplyError] = useState(false);

    // Notas internas
    const [noteText, setNoteText] = useState('');

    // Aviso
    const [toast, setToast] = useState('');

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(''), 2200);
        return () => clearTimeout(timer);
    }, [toast]);

    // "Responder" desde el listado llega con #reply
    useEffect(() => {
        if (window.location.hash === '#reply') focusReply();
    }, []);

    const addActivity = (kind: InboxActivity['kind'], text: string) => {
        setActivity((prev) => [{ id: `a-${Date.now()}`, kind, admin: CURRENT_ADMIN, daysAgo: 0, text }, ...prev]);
    };

    const changeStatus = (status: InboxStatus) => {
        if (status === message.status) return;
        addActivity('event', `Estado: ${message.status} → ${status}`);
        setMessage((prev) => ({ ...prev, status }));
        setReplyStatus(statusAfterReply(status));
    };

    const applyTemplate = (value: string) => {
        const template = REPLY_TEMPLATES[message.type].find((t) => t.value === value);
        if (!template) return;
        setReplyTemplate(value);
        setReplyText(`${greeting}\n\n${template.text}`);
        setReplyError(false);
    };

    // TODO: enviar el correo al remitente cuando haya backend
    const handleSendReply = () => {
        if (replyText.trim() === greeting.trim() || !replyText.trim()) {
            setReplyError(true);
            return;
        }
        const text = `${replyText.trimEnd()}\n\n${REPLY_SIGNATURE}`;
        setReplies((prev) => [...prev, { id: `r-${Date.now()}`, admin: CURRENT_ADMIN, daysAgo: 0, text }]);
        addActivity(
            'event',
            replyStatus === message.status ? 'Respuesta enviada' : `Respuesta enviada · ${message.status} → ${replyStatus}`
        );
        setMessage((prev) => ({ ...prev, status: replyStatus }));
        setReplyText(emptyReply);
        setReplyTemplate('');
        setReplyStatus(statusAfterReply(replyStatus));
        setToast('Respuesta enviada');
    };

    const handleAddNote = () => {
        if (!noteText.trim()) return;
        addActivity('note', noteText.trim());
        setNoteText('');
    };

    // Como en el correo: marcar como no leído te devuelve a la bandeja
    const handleMarkUnread = () => {
        markUnread([message.id]);
        router.push(backHref);
    };

    const copyEmail = async () => {
        try {
            await navigator.clipboard.writeText(message.email);
            setToast('Email copiado');
        } catch {
            setToast('No se ha podido copiar');
        }
    };

    const menuItems: MoreMenuItem[] = [
        { label: 'Marcar como no leído', onClick: handleMarkUnread },
        ...(message.user ? [{ label: 'Ver usuario', href: `/admin/users/${message.user.id}` }] : []),
        { label: 'Ver otros mensajes suyos', href: `/admin/inbox?q=${encodeURIComponent(message.email)}` },
        'divider',
        { label: 'Copiar email', onClick: copyEmail },
    ];

    return (
        <div className="admin-detail-container">
            <BackToInbox href={backHref} nextUnreadId={nextUnread?.id} />

            <header className="admin-detail-header-row">
                <div className="admin-detail-person">
                    {message.user ? (
                        <img src={message.user.avatar} alt="" className="admin-detail-avatar" />
                    ) : (
                        <span className="admin-detail-avatar inbox-detail-initial" aria-hidden="true">
                            {displayName.replace('@', '').charAt(0).toUpperCase()}
                        </span>
                    )}
                    <div className="admin-detail-info">
                        <p className="admin-detail-eyebrow">{isContact ? 'Mensaje de' : 'Sugerencia de'}</p>
                        <div className="admin-detail-name-row">
                            <h1 className="page-title">
                                {message.user ? (
                                    <Link href={`/admin/users/${message.user.id}`} className="admin-detail-person-link">
                                        {displayName}
                                    </Link>
                                ) : (
                                    displayName
                                )}
                            </h1>
                            <MoreMenu items={menuItems} label={`Más opciones del mensaje de ${displayName}`} />
                        </div>
                        {subline && <span className="admin-detail-handle">{subline}</span>}
                        <span className={`admin-detail-status inbox-status ${statusClass(message.status)}`}>
                            {message.status}
                        </span>
                    </div>
                </div>
                <div className="admin-detail-actions inbox-detail-actions">
                    <Select
                        className="inbox-status-select"
                        ariaLabel="Cambiar estado del mensaje"
                        options={statusOptions}
                        value={message.status}
                        onChange={(val) => changeStatus(val as InboxStatus)}
                        placeholder="Cambiar estado"
                    />
                    <Button className="admin-detail-action-btn" onClick={focusReply} variant="primary">
                        Responder
                    </Button>
                </div>
            </header>

            <div className="admin-detail-grid inbox-detail-grid">
                {/* conversación */}
                <section className="inbox-thread">
                    <h2 className="block-title section-heading">Conversación</h2>

                    <article className="inbox-msg">
                        <header className="inbox-msg-head">
                            <span className="inbox-msg-author">{displayName}</span>
                            <span className="inbox-msg-meta">
                                {formatDate(message.createdAt)} · {message.category}
                            </span>
                        </header>
                        <p className="inbox-msg-text">{message.message}</p>
                    </article>

                    {replies.map((r) => (
                        <article key={r.id} className="inbox-msg is-reply">
                            <header className="inbox-msg-head">
                                <span className="inbox-msg-author">
                                    {r.admin === CURRENT_ADMIN ? 'Tú' : r.admin}
                                    <span className="inbox-msg-badge">Equipo RVWD</span>
                                </span>
                                <span className="inbox-msg-meta">{timeAgo(r.daysAgo)}</span>
                            </header>
                            <p className="inbox-msg-text">{r.text}</p>
                        </article>
                    ))}

                    <div className="inbox-reply" id="reply">
                        <div className="inbox-reply-head">
                            <h3 id={REPLY_TITLE_ID}>Responder a {message.email}</h3>
                            <Select
                                className="inbox-template-select"
                                ariaLabel="Usar plantilla"
                                options={REPLY_TEMPLATES[message.type].map(({ value, label }) => ({ value, label }))}
                                value={replyTemplate}
                                onChange={applyTemplate}
                                placeholder="Usar plantilla"
                            />
                        </div>
                        <TextArea
                            id={REPLY_BOX_ID}
                            aria-labelledby={REPLY_TITLE_ID}
                            value={replyText}
                            onChange={(e) => {
                                setReplyText(e.target.value);
                                setReplyError(false);
                            }}
                            rows={7}
                            placeholder="Escribe tu respuesta..."
                        />
                        <p className="inbox-reply-signature">
                            Se añadirá la firma: <span>{REPLY_SIGNATURE.replace('\n', ' · ')}</span>
                        </p>
                        <div className="inbox-reply-footer">
                            <div className="inbox-reply-status">
                                <span id="inbox-reply-status-label">Al enviar, cambiar estado a</span>
                                <Select
                                    labelledBy="inbox-reply-status-label"
                                    options={statusOptions}
                                    value={replyStatus}
                                    onChange={(val) => setReplyStatus(val as InboxStatus)}
                                    placeholder="Estado"
                                />
                            </div>
                            <Button variant="primary" className="inbox-reply-send" onClick={handleSendReply}>
                                Enviar respuesta
                            </Button>
                        </div>
                        {replyError && (
                            <p className="modal-error-text" role="alert">
                                Escribe la respuesta antes de enviarla.
                            </p>
                        )}
                    </div>
                </section>

                {/* datos y actividad */}
                <div className="inbox-detail-side">
                    <section>
                        <h2 className="block-title section-heading">Datos</h2>
                        <ul className="admin-data-list">
                            <li>Tipo: {TYPE_LABEL[message.type]}</li>
                            <li>
                                {isContact ? 'Motivo' : 'Categoría'}: {message.category}
                            </li>
                            <li>Recibido: {formatDate(message.createdAt)}</li>
                            <li className="inbox-data-email">Email: {message.email}</li>
                            {message.user ? (
                                <>
                                    <li>
                                        <Link href={`/admin/users/${message.user.id}`} className="admin-data-link">
                                            Usuario: {message.user.username}
                                            <span className="admin-chevron" aria-hidden="true">›</span>
                                        </Link>
                                    </li>
                                    <li>
                                        Sanciones: {Math.min(message.user.sanctions, MAX_SANCTIONS)}/{MAX_SANCTIONS}
                                    </li>
                                </>
                            ) : (
                                <li className="inbox-data-muted">No es un usuario registrado</li>
                            )}
                        </ul>
                    </section>

                    <section>
                        <h2 className="block-title section-heading">Notas e historial</h2>
                        <div className="inbox-note-form">
                            <TextArea
                                aria-label="Nota interna"
                                value={noteText}
                                onChange={(e) => setNoteText(e.target.value)}
                                rows={2}
                                placeholder="Añade una nota interna (solo la ve el equipo)..."
                            />
                            <Button variant="outline" className="inbox-note-btn" onClick={handleAddNote}>
                                Añadir nota
                            </Button>
                        </div>
                        {activity.length === 0 ? (
                            <p className="empty-sanctions">Todavía no hay notas ni cambios.</p>
                        ) : (
                            <ul className="sanctions-list inbox-activity-list">
                                {activity.map((a) => (
                                    <li key={a.id} className={`sanction-info inbox-activity is-${a.kind}`}>
                                        <span className="sanction-time">
                                            {timeAgo(a.daysAgo)} · {a.admin === CURRENT_ADMIN ? 'Tú' : a.admin}
                                        </span>
                                        {a.kind === 'note' ? (
                                            <span className="inbox-activity-note">{a.text}</span>
                                        ) : (
                                            <span className="sanction-reason inbox-activity-event">{a.text}</span>
                                        )}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            {/* Siempre en el DOM: los lectores de pantalla solo anuncian cambios en una región que ya existía */}
            <div role="status">{toast && <div className="admin-toast">{toast}</div>}</div>
        </div>
    );
}
