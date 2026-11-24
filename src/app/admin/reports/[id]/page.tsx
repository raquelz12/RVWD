'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Select from '../../../../../components/Select/Select';
import TextArea from '../../../../../components/TextArea/TextArea';
import Button from '../../../../../components/Button/Button';
import MoreMenu, { type MoreMenuItem } from '../../../../../components/MoreMenu/MoreMenu';
import SanctionDots from '../../SanctionDots';
import AdminDialog, { NotifyCheckbox } from '../../AdminDialog';
import { addDays, formatDate, timeAgo } from '@/app/lib/adminFilters';
import {
    AUTO_SUSPEND_DAYS,
    BAN_REASONS,
    MAX_SANCTIONS,
    REPORT_TO_SANCTION_REASON,
    SANCTION_EXPIRY_DAYS,
    SANCTION_REASONS,
    SUSPEND_DURATIONS,
    nextSanction,
    sanctionHint,
} from '@/app/lib/adminModeration';
import { MOCK_USERS, STATUS_CLASS, type AdminUser, type UserSanction, type UserStatus } from '../../users/mockUsers';
import { MOCK_CONTENT } from '../../content/mockContent';
import {
    MOCK_REPORTS,
    REPORT_STATUS_CLASS,
    reportContentHref,
    type AdminReport,
    type ReportStatus,
} from '../mockReports';
import { markReportSeen } from '../useSeenReports';
import '../../admin-shared.css';
import '../reports.css';
import './report.css';

const RESOLUTION_OPTIONS = [
    { value: 'Aplicada', label: 'Aplicar (la denuncia es válida)' },
    { value: 'Descartada', label: 'Descartar (no incumple las normas)' },
];

const ACCOUNT_LABEL: Record<UserStatus, string> = {
    Activo: 'Cuenta activa',
    Suspendido: 'Cuenta suspendida',
    Baneado: 'Cuenta baneada',
};

type ModalId = 'sanction' | 'resolve' | 'reopen' | 'removeSanction' | 'suspend' | 'liftSuspension' | 'ban' | 'unban';

// Mismo orden que el listado por defecto (más recientes primero), para "Siguiente denuncia"
const REPORTS_BY_NEWEST = [...MOCK_REPORTS].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

// Con cacheComponents, useParams() solo se conoce en runtime (el id no está en
// generateStaticParams), así que tiene que ir dentro de un Suspense o la build falla
export default function AdminReportDetailPage() {
    return (
        <Suspense fallback={null}>
            <AdminReportDetailWithParams />
        </Suspense>
    );
}

// La key recrea la página al cambiar de denuncia (p. ej. "Siguiente denuncia"),
// porque Next conserva el estado de las rutas ya visitadas
function AdminReportDetailWithParams() {
    const { id } = useParams<{ id: string }>();
    const report = MOCK_REPORTS.find((r) => r.id === id);
    const user = report && MOCK_USERS.find((u) => u.id === report.userId);
    if (!report || !user) return <ReportNotFound />;
    return <AdminReportDetail key={id} initialReport={report} initialUser={user} />;
}

function BackToReports({ nextReportId }: { nextReportId?: string }) {
    const router = useRouter();
    return (
        <div className="admin-detail-topbar">
            <Button className="back-btn" onClick={() => router.push('/admin/reports')} variant="text">
                Volver a denuncias
            </Button>
            {nextReportId && (
                <Link href={`/admin/reports/${nextReportId}`} className="admin-next-link">
                    Siguiente denuncia ›
                </Link>
            )}
        </div>
    );
}

function ReportNotFound() {
    return (
        <div className="admin-detail-container">
            <BackToReports />
            <p className="admin-empty-message">No se ha encontrado esta denuncia. Puede que el enlace sea incorrecto.</p>
        </div>
    );
}

function AdminReportDetail({ initialReport, initialUser }: { initialReport: AdminReport; initialUser: AdminUser }) {
    const [report, setReport] = useState<AdminReport>(initialReport);
    const [user, setUser] = useState<AdminUser>(initialUser);
    const [sanctions, setSanctions] = useState<UserSanction[]>(initialUser.sanctions);
    const reporter = MOCK_USERS.find((u) => u.id === report.reporterId);
    const content = report.contentType === 'Perfil' ? undefined : MOCK_CONTENT.find((c) => c.id === report.contentId);
    const contentHref = reportContentHref(report);
    const firstName = user.name.split(' ')[0];

    // Al abrirla deja de salir como nueva en el listado
    useEffect(() => {
        markReportSeen(initialReport.id);
    }, [initialReport.id]);

    // Siguiente denuncia pendiente (en orden circular, sin contar la actual)
    const currentIndex = REPORTS_BY_NEWEST.findIndex((r) => r.id === report.id);
    const nextReport = [...REPORTS_BY_NEWEST.slice(currentIndex + 1), ...REPORTS_BY_NEWEST.slice(0, currentIndex)].find(
        (r) => r.status === 'En revisión'
    );

    const [activeModal, setActiveModal] = useState<ModalId | null>(null);
    const [error, setError] = useState('');
    const [notify, setNotify] = useState(false);

    const [sanctionReason, setSanctionReason] = useState('');
    const [sanctionNote, setSanctionNote] = useState('');
    const [sanctionToRemove, setSanctionToRemove] = useState<UserSanction | null>(null);

    const [resolution, setResolution] = useState<ReportStatus | ''>('');
    const [resolutionNote, setResolutionNote] = useState('');
    const [notifyReporter, setNotifyReporter] = useState(true);
    const [notifyReported, setNotifyReported] = useState(false);

    const [reopenNote, setReopenNote] = useState('');
    const [suspendDuration, setSuspendDuration] = useState(`${AUTO_SUSPEND_DAYS} días`);
    const [banReason, setBanReason] = useState('');

    const isResolved = report.status !== 'En revisión';

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
        // Precarga el motivo según el motivo de la denuncia
        setSanctionReason(REPORT_TO_SANCTION_REASON[report.reason] ?? '');
        setSanctionNote('');
        openModal('sanction');
    };

    const openResolveModal = (preset: ReportStatus | '' = '') => {
        setResolution(preset);
        setResolutionNote('');
        setNotifyReporter(true);
        setNotifyReported(false);
        openModal('resolve');
    };

    // Como en la ficha de usuario: la penúltima sanción suspende la cuenta y la última la banea.
    // Sancionar desde la denuncia la da por válida
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
            contentId: report.contentType === 'Perfil' ? undefined : report.contentId,
        };
        setSanctions((prev) => [newSanction, ...prev]);
        setReport((prev) => ({ ...prev, status: 'Aplicada' }));

        if (banned) {
            setUser((prev) => ({ ...prev, status: 'Baneado', suspendedUntil: undefined }));
        } else if (suspended) {
            setUser((prev) => ({ ...prev, status: 'Suspendido', suspendedUntil: addDays(AUTO_SUSPEND_DAYS) }));
        }
        closeModal();
    };

    const handleConfirmResolve = () => {
        if (!resolution) {
            setError('Selecciona una resolución.');
            return;
        }
        if (resolution === 'Aplicada' && !resolutionNote.trim()) {
            setError('Añade una nota interna para aplicar la denuncia.');
            return;
        }
        setReport((prev) => ({ ...prev, status: resolution }));
        closeModal();
    };

    const handleConfirmReopen = () => {
        if (!reopenNote.trim()) {
            setError('Añade una nota interna para reabrir la denuncia.');
            return;
        }
        setReport((prev) => ({ ...prev, status: 'En revisión' }));
        closeModal();
    };

    const handleConfirmRemoveSanction = () => {
        if (!sanctionToRemove) return;
        setSanctions((prev) => prev.filter((s) => s.id !== sanctionToRemove.id));
        closeModal();
    };

    const handleConfirmSuspend = () => {
        setUser((prev) => ({ ...prev, status: 'Suspendido', suspendedUntil: addDays(parseInt(suspendDuration, 10)) }));
        closeModal();
    };

    const handleConfirmBan = () => {
        if (!banReason) {
            setError('Elige un motivo para banear la cuenta.');
            return;
        }
        setUser((prev) => ({ ...prev, status: 'Baneado', suspendedUntil: undefined }));
        closeModal();
    };

    const reactivate = () => {
        setUser((prev) => ({ ...prev, status: 'Activo', suspendedUntil: undefined }));
        closeModal();
    };

    const menuItems: MoreMenuItem[] = [
        // TODO: enlazar al perfil público de este usuario cuando exista la ruta
        { label: 'Ver perfil público', href: '/profile' },
        { label: report.contentType === 'Perfil' ? 'Ver perfil denunciado' : 'Ver contenido denunciado', href: contentHref },
        'divider',
        ...(!isResolved ? [{ label: 'Descartar denuncia', onClick: () => openResolveModal('Descartada') }] : []),
        ...(user.status === 'Activo'
            ? [{ label: 'Suspender cuenta', warning: true, onClick: () => openModal('suspend') }]
            : []),
        ...(user.status === 'Suspendido'
            ? [{ label: 'Levantar suspensión', onClick: () => openModal('liftSuspension') }]
            : []),
        user.status === 'Baneado'
            ? { label: 'Desbanear usuario', onClick: () => openModal('unban') }
            : {
                  label: 'Banear usuario',
                  danger: true,
                  onClick: () => {
                      setBanReason('');
                      openModal('ban');
                  },
              },
    ];

    return (
        <div className="admin-detail-container">
            <BackToReports nextReportId={nextReport?.id} />

            <header className="admin-detail-header-row">
                <div className="admin-detail-person">
                    <img src={user.avatar} alt="" className="admin-detail-avatar" />
                    <div className="admin-detail-info">
                        <p className="admin-detail-eyebrow">Denuncia a</p>
                        <div className="admin-detail-name-row">
                            <h1 className="page-title">
                                <Link href={`/admin/users/${user.id}`} className="admin-detail-person-link">
                                    {user.name}
                                </Link>
                            </h1>
                            <MoreMenu items={menuItems} label={`Más opciones de la denuncia a ${user.name}`} />
                        </div>
                        <span className="admin-detail-handle">{user.username}</span>
                        <span className={`admin-detail-status ${STATUS_CLASS[user.status]}`}>
                            {ACCOUNT_LABEL[user.status]}
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
                    {isResolved ? (
                        <Button
                            className="admin-detail-action-btn"
                            onClick={() => {
                                setReopenNote('');
                                openModal('reopen');
                            }}
                            variant="outline"
                        >
                            Reabrir denuncia
                        </Button>
                    ) : (
                        <Button className="admin-detail-action-btn" onClick={() => openResolveModal()} variant="danger">
                            Resolver denuncia
                        </Button>
                    )}
                </div>
            </header>

            <div className="admin-detail-grid">
                <section>
                    <h2 className="block-title section-heading">Datos de la denuncia</h2>
                    <ul className="admin-data-list">
                        <li>
                            Estado:{' '}
                            <span className={`report-status ${REPORT_STATUS_CLASS[report.status]}`}>{report.status}</span>
                        </li>
                        <li>
                            {reporter ? (
                                <Link href={`/admin/users/${reporter.id}`} className="admin-data-link">
                                    Usuario denunciante: {reporter.username}
                                    <span className="admin-chevron" aria-hidden="true">›</span>
                                </Link>
                            ) : (
                                'Usuario denunciante: cuenta eliminada'
                            )}
                        </li>
                        <li>Fecha: {formatDate(report.createdAt)}</li>
                        <li>Motivo: {report.reason}</li>
                        <li>
                            <Link href={contentHref} className="admin-data-link">
                                Contenido: {report.contentType}
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>
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
                    </ul>

                    {content && (
                        <div className="report-content-preview">
                            <p className="report-preview-label">Contenido denunciado</p>
                            <blockquote>{content.text}</blockquote>
                        </div>
                    )}
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
                text={`${sanctions.length}/${MAX_SANCTIONS} · ${sanctionHint(sanctions.length, firstName)} La denuncia se marcará como aplicada.`}
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
                    <label htmlFor="report-sanction-note" className="admin-dialog-label">
                        Nota interna
                    </label>
                    <TextArea
                        id="report-sanction-note"
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
                isOpen={activeModal === 'resolve'}
                title="Resolver denuncia"
                text={`Denuncia de ${reporter?.username ?? 'una cuenta eliminada'} a ${user.username} por ${report.reason.toLowerCase()}.`}
                confirmLabel="Confirmar resolución"
                error={error}
                onClose={closeModal}
                onConfirm={handleConfirmResolve}
            >
                <div className="modal-field">
                    <span className="admin-dialog-label">Resolución</span>
                    <Select
                        options={RESOLUTION_OPTIONS}
                        value={resolution}
                        onChange={(val) => {
                            setResolution(val as ReportStatus);
                            setError('');
                        }}
                        placeholder="Seleccionar resolución"
                    />
                </div>
                <div className="modal-field">
                    <label htmlFor="report-resolution-note" className="admin-dialog-label">
                        Nota interna{resolution === 'Descartada' ? ' (opcional)' : ''}
                    </label>
                    <TextArea
                        id="report-resolution-note"
                        value={resolutionNote}
                        onChange={(e) => {
                            setResolutionNote(e.target.value);
                            setError('');
                        }}
                        rows={3}
                        placeholder="Explica la decisión para el equipo de moderación..."
                    />
                </div>
                <NotifyCheckbox
                    checked={notifyReporter}
                    onChange={setNotifyReporter}
                    label="Avisar al denunciante del resultado."
                />
                <NotifyCheckbox
                    checked={notifyReported}
                    onChange={setNotifyReported}
                    label="Avisar al usuario denunciado."
                />
            </AdminDialog>

            <AdminDialog
                isOpen={activeModal === 'reopen'}
                title="¿Reabrir esta denuncia?"
                text={
                    <>
                        La denuncia está <strong>{report.status.toLowerCase()}</strong> y volverá a quedar en revisión. Las
                        sanciones ya aplicadas no se quitan.
                    </>
                }
                confirmLabel="Reabrir denuncia"
                error={error}
                onClose={closeModal}
                onConfirm={handleConfirmReopen}
            >
                <div className="modal-field">
                    <label htmlFor="report-reopen-note" className="admin-dialog-label">
                        Nota interna
                    </label>
                    <TextArea
                        id="report-reopen-note"
                        value={reopenNote}
                        onChange={(e) => {
                            setReopenNote(e.target.value);
                            setError('');
                        }}
                        rows={3}
                        placeholder="Explica por qué se reabre para el equipo de moderación..."
                    />
                </div>
                <NotifyCheckbox
                    checked={notify}
                    onChange={setNotify}
                    label="Avisar al denunciante de que se vuelve a revisar."
                />
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
        </div>
    );
}
