'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Select from '../../../../../components/Select/Select';
import TextArea from '../../../../../components/TextArea/TextArea';
import Button from '../../../../../components/Button/Button';
import Score from '../../../../../components/Score/Score';
import ModerateContentModal, { type ModerationAction, type ModerationResult } from '../ModerateContentModal';
import {
    AUTHORS,
    CURRENT_ADMIN,
    MOCK_CONTENT,
    STATUS_CLASS,
    formatDate,
    getContentReports,
    publicHref,
    type AdminContent,
    type ContentAuthor,
    type ContentReport,
    type ModerationEntry,
} from '../mockContent';
import { MAX_SANCTIONS, REPORT_TO_SANCTION_REASON, SANCTION_REASONS } from '@/app/lib/adminModeration';
import '../../admin-shared.css';
import '../content.css';
import './content-detail.css';

// Denuncias que se ven aquí; el resto en el listado filtrado
const REPORTS_PREVIEW_LIMIT = 5;

const REPORT_STATUS_CLASS: Record<ContentReport['status'], string> = {
    'En revisión': 'is-pending',
    Aplicada: 'is-applied',
    Descartada: 'is-dismissed',
};

const timeAgo = (days: number) => (days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} días`);

// Con cacheComponents, useParams() solo se conoce en runtime, así que va dentro de un Suspense
export default function AdminContentDetailPage() {
    return (
        <Suspense fallback={null}>
            <AdminContentDetailWithParams />
        </Suspense>
    );
}

// La key recrea la página al cambiar de contenido ("Siguiente con denuncias pendientes"),
// porque Next conserva el estado de las rutas ya visitadas
function AdminContentDetailWithParams() {
    const { id } = useParams<{ id: string }>();
    const initial = MOCK_CONTENT.find((c) => c.id === id);
    if (!initial) return <ContentNotFound />;
    return <AdminContentDetail key={id} initial={initial} />;
}

function ContentNotFound() {
    const router = useRouter();
    return (
        <div className="admin-detail-container">
            <div className="admin-detail-topbar">
                <Button className="back-btn" onClick={() => router.push('/admin/content')} variant="text">
                    Volver a contenido
                </Button>
            </div>
            <p className="content-detail-empty">No se ha encontrado este contenido. Puede que el enlace sea incorrecto.</p>
        </div>
    );
}

function AdminContentDetail({ initial }: { initial: AdminContent }) {
    const router = useRouter();

    const [content, setContent] = useState<AdminContent>(initial);
    const [author, setAuthor] = useState<ContentAuthor>(AUTHORS[initial.authorId]);
    const [reports, setReports] = useState<ContentReport[]>(() => getContentReports(initial.id));
    const [history, setHistory] = useState<ModerationEntry[]>(initial.history);

    const pendingReports = reports.filter((r) => r.status === 'En revisión');
    const isRVW = content.type === 'RVW';
    const isBanned = author.status === 'Baneado';
    const firstName = author.name.split(' ')[0];

    // Pendientes primero; dentro de cada grupo, lo más reciente arriba
    const sortedReports = [...reports].sort((a, b) => {
        const pendingDiff = Number(b.status === 'En revisión') - Number(a.status === 'En revisión');
        return pendingDiff || b.createdAt.localeCompare(a.createdAt);
    });

    // Siguiente contenido con denuncias pendientes (en orden circular, sin contar el actual)
    const currentIndex = MOCK_CONTENT.findIndex((c) => c.id === content.id);
    const nextPending = [...MOCK_CONTENT.slice(currentIndex + 1), ...MOCK_CONTENT.slice(0, currentIndex)].find(
        (c) => c.pendingReports > 0
    );

    // Última acción que dejó el contenido como está, para la franja de aviso
    const statusEntry =
        content.status === 'Publicado'
            ? null
            : history.find((h) => h.action === (content.status === 'Oculto' ? 'Ocultado' : 'Eliminado'));

    // Menú de 3 puntos
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);
    const [toast, setToast] = useState('');

    // Modales
    const [moderationAction, setModerationAction] = useState<ModerationAction | null>(null);
    const [isSanctionOpen, setIsSanctionOpen] = useState(false);
    const [sanctionReason, setSanctionReason] = useState('');
    const [sanctionNote, setSanctionNote] = useState('');
    const [notifySanction, setNotifySanction] = useState(true);
    const [sanctionMarksReports, setSanctionMarksReports] = useState(true);
    const [sanctionError, setSanctionError] = useState(false);

    useEffect(() => {
        const handleClickOutside = (e: MouseEvent) => {
            if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
                setIsMenuOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    useEffect(() => {
        if (!toast) return;
        const timer = setTimeout(() => setToast(''), 2200);
        return () => clearTimeout(timer);
    }, [toast]);

    const addHistory = (...entries: Omit<ModerationEntry, 'id' | 'daysAgo' | 'admin'>[]) => {
        const stamp = Date.now();
        setHistory((prev) => [
            ...entries.map((e, i) => ({ ...e, id: `h-${stamp}-${i}`, daysAgo: 0, admin: CURRENT_ADMIN })),
            ...prev,
        ]);
    };

    // Marca las pendientes como aplicadas y devuelve la entrada de historial
    const applyPendingReports = () => {
        const count = pendingReports.length;
        setReports((prev) => prev.map((r) => (r.status === 'En revisión' ? { ...r, status: 'Aplicada' } : r)));
        setContent((prev) => ({ ...prev, pendingReports: 0 }));
        return { action: count === 1 ? '1 denuncia marcada como aplicada' : `${count} denuncias marcadas como aplicadas` };
    };

    const copyToClipboard = async (text: string, message: string) => {
        setIsMenuOpen(false);
        try {
            await navigator.clipboard.writeText(text);
            setToast(message);
        } catch {
            setToast('No se ha podido copiar');
        }
    };

    // TODO: enviar nota interna y aviso al autor cuando haya backend
    const handleConfirmModeration = ({ note, markReportsApplied }: ModerationResult) => {
        if (!moderationAction) return;
        const isHide = moderationAction === 'hide';
        setContent((prev) => ({ ...prev, status: isHide ? 'Oculto' : 'Eliminado' }));
        const entries: Omit<ModerationEntry, 'id' | 'daysAgo' | 'admin'>[] = [
            { action: isHide ? 'Ocultado' : 'Eliminado', note },
        ];
        if (markReportsApplied) entries.unshift(applyPendingReports());
        addHistory(...entries);
        setModerationAction(null);
    };

    // Mostrar y Restaurar deshacen una acción, así que se aplican sin confirmar
    const handleRestore = () => {
        const action = content.status === 'Oculto' ? 'Mostrado' : 'Restaurado';
        setContent((prev) => ({ ...prev, status: 'Publicado' }));
        addHistory({ action });
        setIsMenuOpen(false);
    };

    const openSanctionModal = () => {
        // Precarga el motivo según la denuncia pendiente más reciente
        const reportReason = sortedReports.find((r) => r.status === 'En revisión')?.reason;
        setSanctionReason(reportReason ? REPORT_TO_SANCTION_REASON[reportReason] ?? '' : '');
        setSanctionNote('');
        setNotifySanction(true);
        setSanctionMarksReports(true);
        setSanctionError(false);
        setIsSanctionOpen(true);
    };

    const handleAddSanction = () => {
        if (!sanctionReason || !sanctionNote.trim()) {
            setSanctionError(true);
            return;
        }
        const sanctions = author.sanctions + 1;
        const banned = sanctions >= MAX_SANCTIONS;
        setAuthor((prev) => ({ ...prev, sanctions, status: banned ? 'Baneado' : prev.status }));

        const reasonLabel = SANCTION_REASONS.find((r) => r.value === sanctionReason)?.label ?? sanctionReason;
        const entries: Omit<ModerationEntry, 'id' | 'daysAgo' | 'admin'>[] = [
            { action: `Sanción al autor: ${reasonLabel}`, note: sanctionNote.trim() },
        ];
        if (pendingReports.length > 0 && sanctionMarksReports) entries.unshift(applyPendingReports());
        if (banned) entries.unshift({ action: `Autor baneado (${MAX_SANCTIONS} sanciones)` });
        addHistory(...entries);
        setIsSanctionOpen(false);
    };

    const menuLink = (href: string, label: string) => (
        <Link href={href} className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
            {label}
        </Link>
    );

    return (
        <div className="admin-detail-container">
            <div className="admin-detail-topbar">
                <Button className="back-btn" onClick={() => router.push('/admin/content')} variant="text">
                    Volver a contenido
                </Button>
                {nextPending && (
                    <Link href={`/admin/content/${nextPending.id}`} className="admin-next-link">
                        Siguiente<span className="content-next-long"> con denuncias pendientes</span> ›
                    </Link>
                )}
            </div>

            {statusEntry && (
                <div className={`content-status-banner ${STATUS_CLASS[content.status]}`} role="status">
                    <strong>
                        {content.status === 'Oculto' ? 'Oculto' : 'Eliminado'} por {statusEntry.admin === CURRENT_ADMIN ? 'ti' : statusEntry.admin}
                    </strong>
                    {' · '}
                    {timeAgo(statusEntry.daysAgo).toLowerCase()}
                    {statusEntry.note && <span className="content-status-banner-note">Nota: {statusEntry.note}</span>}
                </div>
            )}

            <header className="admin-detail-header">
                <h1 className="admin-detail-title">{isRVW ? 'RVW de' : 'Comentario de'}</h1>
                <div className="admin-detail-header-row">
                    <div className="admin-detail-person">
                        <Link href={`/admin/users/${author.id}`} className="admin-detail-avatar-link">
                            <img src={author.avatar} alt={author.name} className="admin-detail-avatar" />
                        </Link>
                        <div className="admin-detail-info">
                            <div className="admin-detail-name-row">
                                <Link href={`/admin/users/${author.id}`} className="admin-detail-name-link">
                                    <h2>{author.name}</h2>
                                </Link>
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
                                            {content.status !== 'Eliminado' && (
                                                <a
                                                    href={publicHref(content)}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="dropdown-item"
                                                    onClick={() => setIsMenuOpen(false)}
                                                >
                                                    Ver en la web ↗
                                                </a>
                                            )}
                                            {menuLink(`/admin/users/${author.id}`, 'Ver autor')}
                                            {reports.length > 0 &&
                                                menuLink(
                                                    `/admin/reports?content=${encodeURIComponent(content.id)}`,
                                                    `Ver denuncias (${reports.length})`
                                                )}
                                            <div className="dropdown-divider" />
                                            <button
                                                className="dropdown-item"
                                                onClick={() => copyToClipboard(content.id, 'ID copiado')}
                                            >
                                                Copiar ID
                                            </button>
                                            <button
                                                className="dropdown-item"
                                                onClick={() =>
                                                    copyToClipboard(`${window.location.origin}${publicHref(content)}`, 'Enlace copiado')
                                                }
                                            >
                                                Copiar enlace
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="admin-detail-handle">{author.username}</span>
                            <span className={`admin-detail-status content-status ${STATUS_CLASS[content.status]}`}>
                                {content.status}
                            </span>
                            {author.status !== 'Activo' && (
                                <span className={`admin-detail-user-status status-${author.status.toLowerCase()}`}>
                                    Autor {author.status.toLowerCase()}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="admin-detail-actions content-detail-actions">
                        <Button
                            className="admin-detail-action-btn content-sanction-btn"
                            onClick={openSanctionModal}
                            disabled={isBanned}
                            variant="primary"
                        >
                            Añadir sanción al autor
                        </Button>
                        {content.status === 'Publicado' && (
                            <Button className="admin-detail-action-btn" onClick={() => setModerationAction('hide')} variant="outline">
                                Ocultar
                            </Button>
                        )}
                        {content.status === 'Oculto' && (
                            <Button className="admin-detail-action-btn" onClick={handleRestore} variant="outline">
                                Mostrar
                            </Button>
                        )}
                        {content.status === 'Eliminado' ? (
                            <Button className="admin-detail-action-btn" onClick={handleRestore} variant="outline">
                                Restaurar
                            </Button>
                        ) : (
                            <Button className="admin-detail-action-btn" onClick={() => setModerationAction('delete')} variant="danger">
                                Eliminar
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="admin-detail-grid">
                <div className="content-detail-main">
                    <section>
                        <h2 className="section-heading">Contenido</h2>
                        <article className="content-detail-card">
                            <Link href={content.subjectHref} className="content-subject">
                                <img src="/placeholderCards.png" alt="" className="content-subject-cover" />
                                <span className="content-subject-text">
                                    <span className="content-subject-name">{content.subject}</span>
                                    <span className="content-subject-meta">
                                        {content.subjectKind} · {content.subjectArtist}
                                    </span>
                                </span>
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>

                            {isRVW ? (
                                <>
                                    <div className="content-rvw-head">
                                        <h3 className="content-rvw-title">{content.title}</h3>
                                        {content.score !== undefined && (
                                            <Score score={content.score} variant="red" input={false} />
                                        )}
                                    </div>
                                    <p className="content-full-text">{content.text}</p>
                                </>
                            ) : (
                                <>
                                    {content.review && (
                                        <a
                                            href={`/reviews/${content.reviewId}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="content-context"
                                        >
                                            <span className="content-context-label">En la RVW de {content.review.author} ↗</span>
                                            «{content.review.excerpt}»
                                        </a>
                                    )}
                                    {content.replyTo && (
                                        <div className="content-context">
                                            <span className="content-context-label">Respondiendo a {content.replyTo.author}</span>
                                            «{content.replyTo.text}»
                                        </div>
                                    )}
                                    <blockquote className="content-comment">{content.text}</blockquote>
                                </>
                            )}
                        </article>
                    </section>

                    <section>
                        <h2 className="section-heading">Datos</h2>
                        <ul className="admin-data-list">
                            <li>
                                Publicado: {formatDate(content.createdAt)}
                                {content.edited && <span className="content-edited"> · editado</span>}
                            </li>
                            <li>Likes: {content.likes}</li>
                            {isRVW && (
                                <li>
                                    {content.commentsCount ? (
                                        <Link
                                            href={`/admin/content?review=${encodeURIComponent(content.id)}`}
                                            className="admin-data-link"
                                        >
                                            Comentarios: {content.commentsCount}
                                            <span className="admin-chevron" aria-hidden="true">›</span>
                                        </Link>
                                    ) : (
                                        'Comentarios: 0'
                                    )}
                                </li>
                            )}
                            <li>
                                {reports.length > 0 ? (
                                    <Link
                                        href={`/admin/reports?content=${encodeURIComponent(content.id)}`}
                                        className="admin-data-link"
                                    >
                                        Denuncias: {reports.length}
                                        {pendingReports.length > 0 && (
                                            <span className="content-pending-text"> ({pendingReports.length} pendientes)</span>
                                        )}
                                        <span className="admin-chevron" aria-hidden="true">›</span>
                                    </Link>
                                ) : (
                                    'Denuncias: 0'
                                )}
                            </li>
                            <li>
                                <Link href={`/admin/users/${author.id}`} className="admin-data-link">
                                    Sanciones del autor: {Math.min(author.sanctions, MAX_SANCTIONS)}/{MAX_SANCTIONS}
                                    <span className="admin-chevron" aria-hidden="true">›</span>
                                </Link>
                            </li>
                            <li>ID: {content.id}</li>
                        </ul>
                    </section>
                </div>

                <div className="content-detail-side">
                    <section>
                        <div className="sanctions-header">
                            <h2 className="section-heading">Denuncias</h2>
                            {pendingReports.length > 0 && (
                                <span className="content-pending-text content-pending-counter">
                                    <span className="pending-dot" aria-hidden="true" />
                                    {pendingReports.length} {pendingReports.length === 1 ? 'pendiente' : 'pendientes'}
                                </span>
                            )}
                        </div>
                        {reports.length === 0 ? (
                            <p className="empty-sanctions">Este contenido no tiene denuncias.</p>
                        ) : (
                            <ul className="content-reports-list">
                                {sortedReports.slice(0, REPORTS_PREVIEW_LIMIT).map((r) => (
                                    <li key={r.id}>
                                        <Link href={`/admin/reports/${r.id}`} className="content-report-row">
                                            <span className="content-report-main">
                                                <span className="content-report-reason">{r.reason}</span>
                                                <span className="content-report-meta">
                                                    {r.reporter} · {formatDate(r.createdAt)}
                                                </span>
                                            </span>
                                            <span className={`content-report-status ${REPORT_STATUS_CLASS[r.status]}`}>
                                                {r.status === 'En revisión' && <span className="pending-dot" aria-hidden="true" />}
                                                {r.status}
                                            </span>
                                            <span className="admin-chevron" aria-hidden="true">›</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        )}
                        {reports.length > REPORTS_PREVIEW_LIMIT && (
                            <Link
                                href={`/admin/reports?content=${encodeURIComponent(content.id)}`}
                                className="admin-data-link content-see-all"
                            >
                                Ver todas ({reports.length})
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>
                        )}
                    </section>

                    <section>
                        <h2 className="section-heading">Historial de moderación</h2>
                        {history.length === 0 ? (
                            <p className="empty-sanctions">Todavía no hay acciones de moderación.</p>
                        ) : (
                            <ul className="sanctions-list content-history-list">
                                {history.map((h) => (
                                    <li key={h.id} className="sanction-info content-history-row">
                                        <span className="sanction-time">
                                            {timeAgo(h.daysAgo)} · {h.admin === CURRENT_ADMIN ? 'Tú' : h.admin}
                                        </span>
                                        <span className="sanction-reason">{h.action}</span>
                                        {h.note && <span className="sanction-note">Nota: {h.note}</span>}
                                    </li>
                                ))}
                            </ul>
                        )}
                    </section>
                </div>
            </div>

            {/* modal: ocultar / eliminar */}
            {moderationAction && (
                <ModerateContentModal
                    action={moderationAction}
                    item={{ ...content, authorUsername: author.username }}
                    pendingReports={pendingReports.length}
                    onClose={() => setModerationAction(null)}
                    onConfirm={handleConfirmModeration}
                />
            )}

            {/* modal: añadir sanción al autor */}
            {isSanctionOpen && (
                <div className="admin-modal-overlay" onClick={() => setIsSanctionOpen(false)}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={() => setIsSanctionOpen(false)} aria-label="Cerrar">
                            ✕
                        </button>
                        <h3>Añadir sanción a {firstName}</h3>
                        <p className="modal-subtitle">
                            {author.sanctions}/{MAX_SANCTIONS}{' '}
                            {author.sanctions >= MAX_SANCTIONS - 1
                                ? `Con esta sanción se baneará a ${firstName}.`
                                : 'La sanción quedará asociada a este contenido.'}
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
                        {pendingReports.length > 0 && (
                            <label className="modal-checkbox">
                                <input
                                    type="checkbox"
                                    checked={sanctionMarksReports}
                                    onChange={(e) => setSanctionMarksReports(e.target.checked)}
                                />
                                <span>
                                    Marcar {pendingReports.length === 1 ? 'la denuncia pendiente como aplicada' : `las ${pendingReports.length} denuncias pendientes como aplicadas`}.
                                </span>
                            </label>
                        )}
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
                            <p className="modal-error-text">Debes completar todos los campos para añadir la sanción.</p>
                        )}
                    </div>
                </div>
            )}

            {toast && (
                <div className="content-toast" role="status">
                    {toast}
                </div>
            )}
        </div>
    );
}
