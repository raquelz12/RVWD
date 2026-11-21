'use client';

import { useState, useRef, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import Dot from '../../../../../components/Dot/Dot';
import Select from '../../../../../components/Select/Select';
import TextArea from '../../../../../components/TextArea/TextArea';
import Button from '../../../../../components/Button/Button';
import { SANCTION_REASONS, REPORT_TO_SANCTION_REASON } from '@/app/lib/adminModeration';
import '../../admin-shared.css';
import './report.css';

type ReportStatus = 'En revisión' | 'Aplicada' | 'Descartada';
type UserStatus = 'Activo' | 'Suspendido' | 'Baneado';

interface Sanction {
    id: string;
    daysAgo: number;
    reason: string;
    type: string;
    internalNote: string;
    contentId: string;
}

interface ReportDetail {
    id: string;
    status: ReportStatus;
    reason: string;
    createdAt: string;
    contentType: 'Comentario' | 'RVW' | 'Perfil';
    contentId: string;
    contentPreview: string;
    reporter: { id: string; username: string };
    reportedUser: {
        id: string;
        name: string;
        username: string;
        avatar: string;
        status: UserStatus;
        reportsReceived: number;
    };
}

const REPORTED_USER = {
    id: '1',
    name: 'Raquel Arnaiz',
    username: '@raquelz.12204',
    avatar: '/placeholderCards.png',
    status: 'Activo' as UserStatus,
    reportsReceived: 10,
};

// Datos de prueba (mismos ids que el listado de denuncias)
const MOCK_REPORTS: ReportDetail[] = [
    { id: '1', status: 'En revisión', reason: 'Spam', createdAt: '12/03/2027', contentType: 'Comentario', contentId: 'post123', contentPreview: 'Seguidme en mi canal para más reseñas!! link en mi perfil, sorteo cada semana!!', reporter: { id: '2', username: '@quevedo.20' }, reportedUser: REPORTED_USER },
    { id: '2', status: 'Descartada', reason: 'Palabras inapropiadas', createdAt: '12/03/2027', contentType: 'RVW', contentId: 'post124', contentPreview: 'Este disco es una basura, no entiendo cómo a alguien le puede gustar esto.', reporter: { id: '3', username: '@lucia.music' }, reportedUser: REPORTED_USER },
    { id: '3', status: 'Aplicada', reason: 'Mal uso', createdAt: '12/03/2027', contentType: 'Comentario', contentId: 'post125', contentPreview: 'Comentario repetido 15 veces en la misma reseña.', reporter: { id: '2', username: '@quevedo.20' }, reportedUser: REPORTED_USER },
    { id: '4', status: 'En revisión', reason: 'Spam', createdAt: '12/03/2027', contentType: 'RVW', contentId: 'post126', contentPreview: 'Compra seguidores baratos en mi web, 100% reales.', reporter: { id: '4', username: '@marcos_rvw' }, reportedUser: REPORTED_USER },
    { id: '5', status: 'Aplicada', reason: 'Spam', createdAt: '12/03/2027', contentType: 'RVW', contentId: 'post127', contentPreview: 'Mismo texto publicado en 20 álbumes distintos.', reporter: { id: '3', username: '@lucia.music' }, reportedUser: REPORTED_USER },
    { id: '6', status: 'En revisión', reason: 'Mal uso', createdAt: '12/03/2027', contentType: 'RVW', contentId: 'post128', contentPreview: 'Reseña de 0 estrellas sin escuchar el álbum, solo para bajar la nota.', reporter: { id: '4', username: '@marcos_rvw' }, reportedUser: REPORTED_USER },
];

const BAN_REASONS = [
    { value: '3 strikes', label: '3 strikes' },
    { value: 'Discurso de odio', label: 'Discurso de odio' },
    { value: 'Amenazas / Estafa', label: 'Amenazas o estafa' },
    { value: 'Bots / Review bombing', label: 'Bots / Review bombing' },
];

const SUSPEND_DURATIONS = [
    { value: '3 días', label: '3 días' },
    { value: '7 días', label: '7 días' },
    { value: '15 días', label: '15 días' },
    { value: '30 días', label: '30 días' },
];

const RESOLUTION_OPTIONS = [
    { value: 'Aplicada', label: 'Aplicar (la denuncia es válida)' },
    { value: 'Descartada', label: 'Descartar (no incumple las normas)' },
];

const statusClass = (status: string) =>
    `status-${status.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/\s+/g, '-')}`;

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
    return <AdminReportDetailContent key={id} reportId={id} />;
}

function AdminReportDetailContent({ reportId }: { reportId: string }) {
    const router = useRouter();

    const initialReport = MOCK_REPORTS.find((r) => r.id === reportId) ?? MOCK_REPORTS[0];

    const [report, setReport] = useState<ReportDetail>(initialReport);
    const [userStatus, setUserStatus] = useState<UserStatus>(initialReport.reportedUser.status);
    const [suspendedUntil, setSuspendedUntil] = useState('');
    const reportedUser = report.reportedUser;
    const firstName = reportedUser.name.split(' ')[0];

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

    // Siguiente denuncia pendiente (en orden circular, sin contar la actual)
    const currentIndex = MOCK_REPORTS.findIndex((r) => r.id === report.id);
    const nextReport = [...MOCK_REPORTS.slice(currentIndex + 1), ...MOCK_REPORTS.slice(0, currentIndex)].find(
        (r) => r.status === 'En revisión'
    );

    // Menú de 3 puntos
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const menuRef = useRef<HTMLDivElement>(null);

    // Control de modales
    const [activeModal, setActiveModal] = useState<
        'sanction' | 'resolve' | 'reopen' | 'removeSanction' | 'suspend' | 'ban' | 'unban' | null
    >(null);

    // Modal Añadir Sanción
    const [sanctionReason, setSanctionReason] = useState('');
    const [sanctionNote, setSanctionNote] = useState('');
    const [notifySanction, setNotifySanction] = useState(false);
    const [sanctionError, setSanctionError] = useState(false);

    // Modal Resolver denuncia
    const [resolution, setResolution] = useState<ReportStatus | ''>('');
    const [resolutionNote, setResolutionNote] = useState('');
    const [notifyReporter, setNotifyReporter] = useState(true);
    const [notifyReported, setNotifyReported] = useState(false);
    const [resolveError, setResolveError] = useState('');

    // Modal Reabrir denuncia
    const [reopenNote, setReopenNote] = useState('');
    const [notifyReopenReporter, setNotifyReopenReporter] = useState(false);
    const [reopenError, setReopenError] = useState(false);

    // Modal Quitar sanción
    const [sanctionToRemove, setSanctionToRemove] = useState<Sanction | null>(null);
    const [notifyRemoveSanction, setNotifyRemoveSanction] = useState(false);

    // Modales Suspender / Banear / Desbanear
    const [suspendDuration, setSuspendDuration] = useState('7 días');
    const [banReason, setBanReason] = useState('');
    const [notifyBan, setNotifyBan] = useState(false);
    const [banError, setBanError] = useState(false);
    const [notifyUnban, setNotifyUnban] = useState(false);

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
        setResolveError('');
        setReopenError(false);
        setBanError(false);
        setSanctionToRemove(null);
    };

    const openSanctionModal = () => {
        // Precarga el motivo según el motivo de la denuncia
        setSanctionReason(REPORT_TO_SANCTION_REASON[report.reason] ?? '');
        setActiveModal('sanction');
    };

    const openResolveModal = (preset: ReportStatus | '' = '') => {
        setResolution(preset);
        setResolutionNote('');
        setActiveModal('resolve');
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
            contentId: report.contentId,
        };

        const updated = [newSanction, ...sanctions];
        setSanctions(updated);

        // Sancionar desde la denuncia la da por válida
        setReport((prev) => ({ ...prev, status: 'Aplicada' }));

        // Si llega a 3 sanciones, baneo automático según normas
        if (updated.length >= 3) {
            setUserStatus('Baneado');
            setSuspendedUntil('');
        }

        setSanctionReason('');
        setSanctionNote('');
        setNotifySanction(false);
        closeModal();
    };

    const handleConfirmResolve = () => {
        if (!resolution) {
            setResolveError('Selecciona una resolución.');
            return;
        }
        if (resolution === 'Aplicada' && !resolutionNote.trim()) {
            setResolveError('Añade una nota interna para aplicar la denuncia.');
            return;
        }
        setReport((prev) => ({ ...prev, status: resolution }));
        setResolutionNote('');
        closeModal();
    };

    const openReopenModal = () => {
        setReopenNote('');
        setNotifyReopenReporter(false);
        setActiveModal('reopen');
    };

    const handleConfirmReopen = () => {
        if (!reopenNote.trim()) {
            setReopenError(true);
            return;
        }
        setReport((prev) => ({ ...prev, status: 'En revisión' }));
        setReopenNote('');
        closeModal();
    };

    const handleConfirmRemoveSanction = () => {
        if (!sanctionToRemove) return;
        setSanctions((prev) => prev.filter((s) => s.id !== sanctionToRemove.id));
        setNotifyRemoveSanction(false);
        closeModal();
    };

    const handleConfirmSuspend = () => {
        setUserStatus('Suspendido');
        setSuspendedUntil(suspendDuration);
        closeModal();
    };

    const handleConfirmBan = () => {
        if (!banReason) {
            setBanError(true);
            return;
        }
        setUserStatus('Baneado');
        setSuspendedUntil('');
        setBanReason('');
        setNotifyBan(false);
        closeModal();
    };

    const handleConfirmUnban = () => {
        setUserStatus('Activo');
        setSuspendedUntil('');
        setNotifyUnban(false);
        closeModal();
    };

    const isResolved = report.status !== 'En revisión';

    return (
        <div className="admin-detail-container">
            <div className="admin-detail-topbar">
                <Button className="back-btn" onClick={() => router.push('/admin/reports')} variant="text">
                    Volver a denuncias
                </Button>
                {nextReport && (
                    <Link href={`/admin/reports/${nextReport.id}`} className="admin-next-link">
                        Siguiente denuncia ›
                    </Link>
                )}
            </div>

            <header className="admin-detail-header">
                <h1 className="admin-detail-title">Denuncia de</h1>
                <div className="admin-detail-header-row">
                    <div className="admin-detail-person">
                        <Link href={`/admin/users/${reportedUser.id}`} className="admin-detail-avatar-link">
                            <img src={reportedUser.avatar} alt={reportedUser.name} className="admin-detail-avatar" />
                        </Link>
                        <div className="admin-detail-info">
                            <div className="admin-detail-name-row">
                                <Link href={`/admin/users/${reportedUser.id}`} className="admin-detail-name-link">
                                    <h2>{reportedUser.name}</h2>
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
                                            <Link
                                                href={`/admin/users/${reportedUser.id}`}
                                                className="dropdown-item"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Ver perfil
                                            </Link>
                                            <Link href={`/profile`} className="dropdown-item" onClick={() => setIsMenuOpen(false)}>
                                                Ver perfil público
                                            </Link>
                                            <Link
                                                href={`/admin/content/${report.contentId}`}
                                                className="dropdown-item"
                                                onClick={() => setIsMenuOpen(false)}
                                            >
                                                Ver contenido denunciado
                                            </Link>
                                            <div className="dropdown-divider" />
                                            {!isResolved && (
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        openResolveModal('Descartada');
                                                    }}
                                                >
                                                    Descartar denuncia
                                                </button>
                                            )}
                                            {userStatus === 'Activo' && (
                                                <button
                                                    className="dropdown-item warning"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setActiveModal('suspend');
                                                    }}
                                                >
                                                    Suspender cuenta
                                                </button>
                                            )}
                                            {userStatus === 'Baneado' ? (
                                                <button
                                                    className="dropdown-item"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setActiveModal('unban');
                                                    }}
                                                >
                                                    Desbanear usuario
                                                </button>
                                            ) : (
                                                <button
                                                    className="dropdown-item danger"
                                                    onClick={() => {
                                                        setIsMenuOpen(false);
                                                        setActiveModal('ban');
                                                    }}
                                                >
                                                    Banear usuario
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <span className="admin-detail-handle">{reportedUser.username}</span>
                            <span className={`admin-detail-status ${statusClass(report.status)}`}>
                                {report.status}
                            </span>
                            {userStatus !== 'Activo' && (
                                <span className={`admin-detail-user-status ${statusClass(userStatus)}`}>
                                    Usuario {userStatus.toLowerCase()}
                                    {userStatus === 'Suspendido' && suspendedUntil ? ` (${suspendedUntil})` : ''}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="admin-detail-actions">
                        <Button
                            className="admin-detail-action-btn"
                            onClick={openSanctionModal}
                            disabled={userStatus === 'Baneado'}
                            variant="primary"
                        >
                            Añadir sanción
                        </Button>
                        {isResolved ? (
                            <Button className="admin-detail-action-btn" onClick={openReopenModal} variant="outline">
                                Reabrir denuncia
                            </Button>
                        ) : (
                            <Button className="admin-detail-action-btn" onClick={() => openResolveModal()} variant="danger">
                                Resolver denuncia
                            </Button>
                        )}
                    </div>
                </div>
            </header>

            <div className="admin-detail-grid">
                <section className="report-data-section">
                    <h2 className="section-heading">Datos de la denuncia</h2>
                    <ul className="admin-data-list">
                        <li>
                            <Link href={`/admin/users/${report.reporter.id}`} className="admin-data-link">
                                Usuario denunciante: {report.reporter.username}
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>
                        </li>
                        <li>Fecha: {report.createdAt}</li>
                        <li>Motivo: {report.reason}</li>
                        <li>
                            <Link href={`/admin/content/${report.contentId}`} className="admin-data-link">
                                Contenido: {report.contentType}
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>
                        </li>
                        <li>
                            <Link href={`/admin/reports?q=${encodeURIComponent(reportedUser.username)}`} className="admin-data-link">
                                Denuncias recibidas: {reportedUser.reportsReceived}
                                <span className="admin-chevron" aria-hidden="true">›</span>
                            </Link>
                        </li>
                    </ul>

                    <div className="report-content-preview">
                        <span className="report-preview-label">Contenido denunciado</span>
                        <blockquote>{report.contentPreview}</blockquote>
                    </div>
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
                        <h3>Añadir Sanción a {firstName}</h3>
                        <p className="modal-subtitle">
                            {sanctions.length}/3{' '}
                            {sanctions.length >= 2
                                ? `Con uno más se deberá banear a ${firstName}`
                                : 'La denuncia se marcará como aplicada'}
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

            {/* modal: resolver denuncia */}
            {activeModal === 'resolve' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>Resolver denuncia</h3>
                        <p className="modal-subtitle">
                            Denuncia de {report.reporter.username} a {reportedUser.username} por {report.reason.toLowerCase()}.
                        </p>
                        <div className="modal-field">
                            <label>Resolución</label>
                            <Select
                                options={RESOLUTION_OPTIONS}
                                value={resolution}
                                onChange={(val) => {
                                    setResolution(val as ReportStatus);
                                    setResolveError('');
                                }}
                                placeholder="Seleccionar resolución"
                            />
                        </div>
                        <div className="modal-field">
                            <label>Nota interna{resolution === 'Descartada' ? ' (opcional)' : ''}</label>
                            <TextArea
                                value={resolutionNote}
                                onChange={(e) => {
                                    setResolutionNote(e.target.value);
                                    setResolveError('');
                                }}
                                rows={3}
                                placeholder="Explica la decisión para el equipo de moderación..."
                            />
                        </div>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifyReporter}
                                onChange={(e) => setNotifyReporter(e.target.checked)}
                            />
                            <span>Avisar al denunciante del resultado.</span>
                        </label>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifyReported}
                                onChange={(e) => setNotifyReported(e.target.checked)}
                            />
                            <span>Avisar al usuario denunciado.</span>
                        </label>
                        <button className="modal-submit-btn" onClick={handleConfirmResolve}>
                            Confirmar resolución
                        </button>
                        {resolveError && <p className="modal-error-text">{resolveError}</p>}
                    </div>
                </div>
            )}

            {/* modal: reabrir denuncia */}
            {activeModal === 'reopen' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>¿Reabrir esta denuncia?</h3>
                        <p className="modal-subtitle">
                            La denuncia está <strong>{report.status.toLowerCase()}</strong> y volverá a quedar en revisión.
                            Las sanciones ya aplicadas no se quitan.
                        </p>
                        <div className="modal-field">
                            <label>Nota interna</label>
                            <TextArea
                                value={reopenNote}
                                onChange={(e) => {
                                    setReopenNote(e.target.value);
                                    setReopenError(false);
                                }}
                                rows={3}
                                placeholder="Explica por qué se reabre para el equipo de moderación..."
                            />
                        </div>
                        <label className="modal-checkbox">
                            <input
                                type="checkbox"
                                checked={notifyReopenReporter}
                                onChange={(e) => setNotifyReopenReporter(e.target.checked)}
                            />
                            <span>Avisar al denunciante de que se vuelve a revisar.</span>
                        </label>
                        <div className="modal-actions-row">
                            <Button variant="text" onClick={closeModal}>
                                Cancelar
                            </Button>
                            <Button variant="primary" onClick={handleConfirmReopen}>
                                Reabrir denuncia
                            </Button>
                        </div>
                        {reopenError && (
                            <p className="modal-error-text">
                                Añade una nota interna para reabrir la denuncia.
                            </p>
                        )}
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
                            Se eliminará la sanción por <strong>{sanctionToRemove.reason}</strong> ({sanctionToRemove.type}) del historial activo de {firstName}.
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

            {/* modal: suspender cuenta */}
            {activeModal === 'suspend' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>Suspender a {firstName}</h3>
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

            {/* modal: banear usuario */}
            {activeModal === 'ban' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>¿Banear a {firstName}?</h3>
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

            {/* modal: desbanear */}
            {activeModal === 'unban' && (
                <div className="admin-modal-overlay" onClick={closeModal}>
                    <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                        <button className="modal-close-btn" onClick={closeModal} aria-label="Cerrar">✕</button>
                        <h3>¿Desbanear a {firstName}?</h3>
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
        </div>
    );
}
