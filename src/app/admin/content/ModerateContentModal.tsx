'use client';

import { useState } from 'react';
import TextArea from '../../../../components/TextArea/TextArea';
import Button from '../../../../components/Button/Button';

export type ModerationAction = 'hide' | 'delete';

export interface ModerationResult {
    note: string;
    notifyAuthor: boolean;
    markReportsApplied: boolean;
}

interface Props {
    action: ModerationAction;
    item: { type: string; subject: string; excerpt: string; authorUsername: string };
    pendingReports: number;
    onClose: () => void;
    onConfirm: (result: ModerationResult) => void;
}

// Confirmación de Ocultar / Eliminar contenido (listado y detalle).
// Se monta al abrirse, así que el estado empieza limpio cada vez.
export default function ModerateContentModal({ action, item, pendingReports, onClose, onConfirm }: Props) {
    const [note, setNote] = useState('');
    const [notifyAuthor, setNotifyAuthor] = useState(true);
    const [markReportsApplied, setMarkReportsApplied] = useState(true);
    const [error, setError] = useState(false);

    const isHide = action === 'hide';

    const handleConfirm = () => {
        if (!note.trim()) {
            setError(true);
            return;
        }
        onConfirm({ note: note.trim(), notifyAuthor, markReportsApplied: pendingReports > 0 && markReportsApplied });
    };

    return (
        <div className="admin-modal-overlay" onClick={onClose}>
            <div className="admin-modal-card" onClick={(e) => e.stopPropagation()}>
                <button className="modal-close-btn" onClick={onClose} aria-label="Cerrar">✕</button>
                <h3>{isHide ? '¿Ocultar este contenido?' : '¿Eliminar este contenido?'}</h3>
                <p className="modal-subtitle">
                    {isHide
                        ? 'Dejará de verse en la web, pero el autor y el equipo de moderación seguirán teniéndolo. Puedes volver a mostrarlo cuando quieras.'
                        : 'Se quitará de la web y del perfil del autor. Podrás restaurarlo más adelante.'}
                </p>
                <blockquote className="content-modal-preview">
                    <strong>{item.type} · {item.subject}</strong> «{item.excerpt}»
                    <span>{item.authorUsername}</span>
                </blockquote>
                <div className="modal-field">
                    <label>Nota interna</label>
                    <TextArea
                        value={note}
                        onChange={(e) => {
                            setNote(e.target.value);
                            setError(false);
                        }}
                        rows={3}
                        placeholder={`Explica por qué se ${isHide ? 'oculta' : 'elimina'} para el equipo de moderación...`}
                    />
                </div>
                {pendingReports > 0 && (
                    <label className="modal-checkbox">
                        <input
                            type="checkbox"
                            checked={markReportsApplied}
                            onChange={(e) => setMarkReportsApplied(e.target.checked)}
                        />
                        <span>
                            Marcar {pendingReports === 1 ? 'la denuncia pendiente como aplicada' : `las ${pendingReports} denuncias pendientes como aplicadas`}.
                        </span>
                    </label>
                )}
                <label className="modal-checkbox">
                    <input
                        type="checkbox"
                        checked={notifyAuthor}
                        onChange={(e) => setNotifyAuthor(e.target.checked)}
                    />
                    <span>Avisar al autor por correo.</span>
                </label>
                <div className="modal-actions-row">
                    <Button variant="text" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button variant={isHide ? 'primary' : 'danger'} onClick={handleConfirm}>
                        {isHide ? 'Ocultar' : 'Eliminar'}
                    </Button>
                </div>
                {error && (
                    <p className="modal-error-text">
                        Añade una nota interna para {isHide ? 'ocultar' : 'eliminar'} el contenido.
                    </p>
                )}
            </div>
        </div>
    );
}
