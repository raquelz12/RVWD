'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Select from '../../../../../components/Select/Select';
import TextArea from '../../../../../components/TextArea/TextArea';
import Button from '../../../../../components/Button/Button';
import Score from '../../../../../components/Score/Score';
import MoreMenu, { type MoreMenuItem } from '../../../../../components/MoreMenu/MoreMenu';
import AdminDialog, { NotifyCheckbox } from '../../AdminDialog';
import ModerateContentModal, { type ModerationAction, type ModerationResult } from '../ModerateContentModal';
import {
    CURRENT_ADMIN,
    MOCK_CONTENT,
    STATUS_CLASS,
    getContentReports,
    publicHref,
    type AdminContent,
    type ContentReport,
    type ModerationEntry,
} from '../mockContent';
import { MOCK_USERS, STATUS_CLASS as USER_STATUS_CLASS, type AdminUser, type UserSanction } from '../../users/mockUsers';
import {
    AUTO_SUSPEND_DAYS,
    MAX_SANCTIONS,
    REPORT_TO_SANCTION_REASON,
    SANCTION_REASONS,
    nextSanction,
    sanctionHint,
} from '@/app/lib/adminModeration';
import { addDays, formatDate, timeAgo } from '@/app/lib/adminFilters';
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

type HistoryInput = Omit<ModerationEntry, 'id' | 'daysAgo' | 'admin'>;

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
    const author = initial && MOCK_USERS.find((u) => u.id === initial.authorId);
    if (!initial || !author) return <ContentNotFound />;
    return <AdminContentDetail key={id} initial={initial} initialAuthor={author} />;
}

function BackToContent({ nextPendingId }: { nextPendingId?: string }) {
    const router = useRouter();
    return (
        <div className="admin-detail-topbar">
            <Button className="back-btn" onClick={() => router.push('/admin/content')} variant="text">
                Volver a contenido
            </Button>
            {nextPendingId && (
                <Link href={`/admin/content/${nextPendingId}`} className="admin-next-link">
                    Siguiente<span className="content-next-long"> con denuncias pendientes</span> ›
                </Link>
            )}
        </div>
    );
}

function ContentNotFound() {
    return (
        <div className="admin-detail-container">
            <BackToContent />
            <p className="admin-empty-message">No se ha encontrado este contenido. Puede que el enlace sea incorrecto.</p>
        </div>
    );
}

function AdminContentDetail({ initial, initialAuthor }: { initial: AdminContent; initialAuthor: AdminUser }) {
    const [content, setContent] = useState<AdminContent>(initial);
    const [author, setAuthor] = useState<AdminUser>(initialAuthor);
    const [reports, setReports] = useState<ContentReport[]>(() => getContentReports(initial.id));
    const [history, setHistory] = useState<ModerationEntry[]>(initial.history);

    const pendingReports = reports.filter((r) => r.status === 'En revisión');
    const isRVW = content.type === 'RVW';
    const isBanned = author.status === 'Baneado';
    const firstName = author.name.split(' ')[0];
    const sanctionsCount = author.sanctions.length;

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

    // RVW donde está un comentario: su ficha de admin si está en el listado; si no, la página pública
    const reviewHref =
        content.reviewId && MOCK_CONTENT.some((c) => c.id === content.reviewId)
            ? `/admin/content/${encodeURIComponent(content.reviewId)}`
            : `/reviews/${content.reviewId}`;

    // Modales
    const [moderationAction, setModerationAction] = useState<ModerationAction | null>(null);
    const [isSanctionOpen, setIsSanctionOpen] = useState(false);
    const [sanctionReason, setSanctionReason] = useState('');
    const [sanctionNote, setSanctionNote] = useState('');
    const [notifySanction, setNotifySanction] = useState(false);
    const [sanctionMarksReports, setSanctionMarksReports] = useState(true);
    const [sanctionError, setSanctionError] = useState('');

    const addHistory = (...entries: HistoryInput[]) => {
        const stamp = Date.now();
        setHistory((prev) => [
            ...entries.map((e, i) => ({ ...e, id: `h-${stamp}-${i}`, daysAgo: 0, admin: CURRENT_ADMIN })),
            ...prev,
        ]);
    };

    // Marca las pendientes como aplicadas y devuelve la entrada de historial
    const applyPendingReports = (): HistoryInput => {
        const count = pendingReports.length;
        setReports((prev) => prev.map((r) => (r.status === 'En revisión' ? { ...r, status: 'Aplicada' } : r)));
        setContent((prev) => ({ ...prev, pendingReports: 0 }));
        return { action: count === 1 ? '1 denuncia marcada como aplicada' : `${count} denuncias marcadas como aplicadas` };
    };

    // TODO: enviar nota interna y aviso al autor cuando haya backend
    const handleConfirmModeration = ({ note, markReportsApplied }: ModerationResult) => {
        if (!moderationAction) return;
        const isHide = moderationAction === 'hide';
        setContent((prev) => ({ ...prev, status: isHide ? 'Oculto' : 'Eliminado' }));
        const entries: HistoryInput[] = [{ action: isHide ? 'Ocultado' : 'Eliminado', note }];
        if (markReportsApplied) entries.unshift(applyPendingReports());
        addHistory(...entries);
        setModerationAction(null);
    };

    // Mostrar y Restaurar deshacen una acción, así que se aplican sin confirmar
    const handleRestore = () => {
        const action = content.status === 'Oculto' ? 'Mostrado' : 'Restaurado';
        setContent((prev) => ({ ...prev, status: 'Publicado' }));
        addHistory({ action });
    };

    const openSanctionModal = () => {
        // Precarga el motivo según la denuncia pendiente más reciente
        const reportReason = sortedReports.find((r) => r.status === 'En revisión')?.reason;
        setSanctionReason(reportReason ? REPORT_TO_SANCTION_REASON[reportReason] ?? '' : '');
        setSanctionNote('');
        setNotifySanction(false);
        setSanctionMarksReports(true);
        setSanctionError('');
        setIsSanctionOpen(true);
    };

    // Como en la ficha de usuario: la penúltima sanción suspende la cuenta y la última la banea
    const handleAddSanction = () => {
        if (!sanctionReason || !sanctionNote.trim()) {
            setSanctionError('Debes completar todos los campos para añadir la sanción.');
            return;
        }
        const { banned, suspended, type } = nextSanction(sanctionsCount);
        const newSanction: UserSanction = {
            id: `s-${Date.now()}`,
            daysAgo: 0,
            reason: sanctionReason,
            type,
            internalNote: sanctionNote.trim(),
            contentId: content.id,
        };
        setAuthor((prev) => ({
            ...prev,
            sanctions: [newSanction, ...prev.sanctions],
            status: banned ? 'Baneado' : suspended ? 'Suspendido' : prev.status,
            suspendedUntil: banned ? undefined : suspended ? addDays(AUTO_SUSPEND_DAYS) : prev.suspendedUntil,
        }));

        const reasonLabel = SANCTION_REASONS.find((r) => r.value === sanctionReason)?.label ?? sanctionReason;
        const entries: HistoryInput[] = [{ action: `Sanción al autor: ${reasonLabel}`, note: sanctionNote.trim() }];
        if (pendingReports.length > 0 && sanctionMarksReports) entries.unshift(applyPendingReports());
        if (banned) entries.unshift({ action: `Autor baneado (${MAX_SANCTIONS} sanciones)` });
        if (suspended) entries.unshift({ action: `Autor suspendido ${AUTO_SUSPEND_DAYS} días` });
        addHistory(...entries);
        setIsSanctionOpen(false);
    };

    const reportsHref = `/admin/reports?content=${encodeURIComponent(content.id)}`;

    const menuItems: MoreMenuItem[] = [
        ...(content.status !== 'Eliminado' ? [{ label: 'Ver en la web', href: publicHref(content) }] : []),
        { label: 'Ver autor', href: `/admin/users/${author.id}` },
        ...(reports.length > 0 ? [{ label: `Ver denuncias (${reports.length})`, href: reportsHref }] : []),
        ...(content.status !== 'Eliminado'
            ? (['divider', { label: 'Copiar enlace', copyPath: publicHref(content) }] as MoreMenuItem[])
            : []),
    ];

    return (
        <div className="admin-detail-container">
            <BackToContent nextPendingId={nextPending?.id} />

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

            <header className="admin-detail-header-row">
                <div className="admin-detail-person">
                    <img src={author.avatar} alt="" className="admin-detail-avatar" />
                    <div className="admin-detail-info">
                        <p className="admin-detail-eyebrow">{isRVW ? 'RVW de' : 'Comentario de'}</p>
                        <div className="admin-detail-name-row">
                            <h1 className="page-title">
                                <Link href={`/admin/users/${author.id}`} className="admin-detail-person-link">
                                    {author.name}
                                </Link>
                            </h1>
                            <MoreMenu
                                items={menuItems}
                                label={`Más opciones de ${isRVW ? 'la RVW' : 'el comentario'} de ${author.name}`}
                            />
                        </div>
                        <span className="admin-detail-handle">{author.username}</span>
                        <span className={`admin-detail-status content-status ${STATUS_CLASS[content.status]}`}>
                            {content.status}
                        </span>
                        {author.status !== 'Activo' && (
                            <span className={`admin-detail-user-status ${USER_STATUS_CLASS[author.status]}`}>
                                Autor {author.status.toLowerCase()}
                                {author.status === 'Suspendido' && author.suspendedUntil
                                    ? ` hasta el ${formatDate(author.suspendedUntil)}`
                                    : ''}
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
            </header>

            <div className="admin-detail-grid content-detail-grid">
                <div className="content-detail-main">
                    <section>
                        <h2 className="block-title section-heading">Contenido</h2>
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
                                        <Link href={reviewHref} className="content-context">
                                            <span className="content-context-label">En la RVW de {content.review.author}</span>
                                            «{content.review.excerpt}»
                                        </Link>
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
                        <h2 className="block-title section-heading">Datos</h2>
                        <ul className="admin-data-list">
                            <li>
                                Fecha de publicación: {formatDate(content.createdAt)}
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
                                    <Link href={reportsHref} className="admin-data-link">
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
                                    Sanciones del autor: {Math.min(sanctionsCount, MAX_SANCTIONS)}/{MAX_SANCTIONS}
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
                            <h2 className="block-title section-heading">Denuncias</h2>
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
                            <Link href={reportsHref} className="admin-data-link content-see-all">
                                Ver todas ({reports.length})
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>
                        )}
                    </section>

                    <section>
                        <h2 className="block-title section-heading">Historial de moderación</h2>
                        {history.length === 0 ? (
                            <p className="empty-sanctions">Todavía no hay acciones de moderación.</p>
                        ) : (
                            <ul className="sanctions-list content-history-list">
                                {history.map((h) => (
                                    <li key={h.id} className="sanction-info">
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
            <AdminDialog
                isOpen={isSanctionOpen}
                title={`Añadir sanción a ${firstName}`}
                text={`${sanctionsCount}/${MAX_SANCTIONS} · ${sanctionHint(sanctionsCount, firstName)} La sanción quedará asociada a este contenido.`}
                confirmLabel="Añadir sanción"
                error={sanctionError}
                onClose={() => setIsSanctionOpen(false)}
                onConfirm={handleAddSanction}
            >
                <div className="modal-field">
                    <span id="content-dialog-motivo-label" className="admin-dialog-label">Motivo</span>
                    <Select
                        labelledBy="content-dialog-motivo-label"
                        options={SANCTION_REASONS}
                        value={sanctionReason}
                        onChange={(val) => {
                            setSanctionReason(val);
                            setSanctionError('');
                        }}
                        placeholder="Seleccionar motivo"
                    />
                </div>
                <div className="modal-field">
                    <label htmlFor="content-sanction-note" className="admin-dialog-label">
                        Nota interna
                    </label>
                    <TextArea
                        id="content-sanction-note"
                        value={sanctionNote}
                        onChange={(e) => {
                            setSanctionNote(e.target.value);
                            setSanctionError('');
                        }}
                        rows={4}
                        placeholder="Escribe el contexto para el equipo de moderación..."
                    />
                </div>
                {pendingReports.length > 0 && (
                    <NotifyCheckbox
                        checked={sanctionMarksReports}
                        onChange={setSanctionMarksReports}
                        label={`Marcar ${pendingReports.length === 1 ? 'la denuncia pendiente como aplicada' : `las ${pendingReports.length} denuncias pendientes como aplicadas`}.`}
                    />
                )}
                <NotifyCheckbox checked={notifySanction} onChange={setNotifySanction} />
            </AdminDialog>
        </div>
    );
}
