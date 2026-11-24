'use client';

import { useState } from 'react';
import TextArea from '../../../../components/TextArea/TextArea';
import AdminDialog, { NotifyCheckbox } from '../AdminDialog';

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

// Confirmación de Ocultar / Eliminar contenido (listado y detalle), sobre AdminDialog.
// Se monta al abrirse, así que el estado empieza limpio cada vez.
export default function ModerateContentModal({ action, item, pendingReports, onClose, onConfirm }: Props) {
    const [note, setNote] = useState('');
    const [notifyAuthor, setNotifyAuthor] = useState(false);
    const [markReportsApplied, setMarkReportsApplied] = useState(true);
    const [error, setError] = useState('');

    const isHide = action === 'hide';

    const handleConfirm = () => {
        if (!note.trim()) {
            setError(`Añade una nota interna para ${isHide ? 'ocultar' : 'eliminar'} el contenido.`);
            return;
        }
        onConfirm({ note: note.trim(), notifyAuthor, markReportsApplied: pendingReports > 0 && markReportsApplied });
    };

    return (
        <AdminDialog
            isOpen
            title={isHide ? '¿Ocultar este contenido?' : '¿Eliminar este contenido?'}
            text={
                isHide
                    ? 'Dejará de verse en la web, pero el autor y el equipo de moderación seguirán teniéndolo. Puedes volver a mostrarlo cuando quieras.'
                    : 'Se quitará de la web y del perfil del autor. Podrás restaurarlo más adelante.'
            }
            confirmLabel={isHide ? 'Ocultar' : 'Eliminar'}
            danger={!isHide}
            error={error}
            onClose={onClose}
            onConfirm={handleConfirm}
        >
            <blockquote className="content-modal-preview">
                <strong>
                    {item.type} · {item.subject}
                </strong>{' '}
                «{item.excerpt}»<span>{item.authorUsername}</span>
            </blockquote>
            <div className="modal-field">
                <label htmlFor="content-moderation-note" className="admin-dialog-label">
                    Nota interna
                </label>
                <TextArea
                    id="content-moderation-note"
                    value={note}
                    onChange={(e) => {
                        setNote(e.target.value);
                        setError('');
                    }}
                    rows={3}
                    placeholder={`Explica por qué se ${isHide ? 'oculta' : 'elimina'} para el equipo de moderación...`}
                />
            </div>
            {pendingReports > 0 && (
                <NotifyCheckbox
                    checked={markReportsApplied}
                    onChange={setMarkReportsApplied}
                    label={`Marcar ${pendingReports === 1 ? 'la denuncia pendiente como aplicada' : `las ${pendingReports} denuncias pendientes como aplicadas`}.`}
                />
            )}
            <NotifyCheckbox checked={notifyAuthor} onChange={setNotifyAuthor} label="Avisar al autor por correo." />
        </AdminDialog>
    );
}
