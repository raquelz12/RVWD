'use client';

import { useState } from 'react';
import Button from '../../../../components/Button/Button';
import Input from '../../../../components/Input/Input';
import Modal from '../../../../components/Modal/Modal';
import TextArea from '../../../../components/TextArea/TextArea';
import { formatDate } from '@/app/lib/adminFilters';
import type { LegalDoc, LegalSection } from './mockLegal';

interface Props {
    doc: LegalDoc;
    onClose: () => void;
    onPublish: (doc: LegalDoc, notifyUsers: boolean) => void;
}

// Editor de un texto legal: introducción y apartados (título + texto),
// que se pueden reordenar, añadir y quitar. Se monta al abrirse.
// Va en components/Modal (foco, scroll bloqueado, teclado del móvil) con un panel más ancho
export default function LegalEditor({ doc, onClose, onPublish }: Props) {
    const [intro, setIntro] = useState(doc.intro);
    const [sections, setSections] = useState<LegalSection[]>(doc.sections);
    const [notifyUsers, setNotifyUsers] = useState(false);
    const [error, setError] = useState('');
    const [confirmDiscard, setConfirmDiscard] = useState(false);

    const isDirty = intro !== doc.intro || JSON.stringify(sections) !== JSON.stringify(doc.sections);

    // Cerrar (✕, Escape, fondo o Cancelar) con cambios sin publicar pide confirmación
    const requestClose = () => {
        if (isDirty) setConfirmDiscard(true);
        else onClose();
    };

    const updateSection = (id: string, changes: Partial<LegalSection>) => {
        setSections((prev) => prev.map((s) => (s.id === id ? { ...s, ...changes } : s)));
        setError('');
    };

    const moveSection = (index: number, direction: -1 | 1) => {
        setSections((prev) => {
            const next = [...prev];
            const target = index + direction;
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const addSection = () => {
        setSections((prev) => [...prev, { id: `new-${Date.now()}`, title: '', body: '' }]);
        setError('');
        // el nuevo apartado queda al final: se baja hasta él
        setTimeout(() => {
            const input = document.querySelector<HTMLInputElement>('.legal-edit-section:last-child input');
            input?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            input?.focus({ preventScroll: true });
        }, 0);
    };

    const handlePublish = () => {
        if (sections.length === 0) {
            setError('Añade al menos un apartado.');
            return;
        }
        const incomplete = sections.findIndex((s) => !s.title.trim() || !s.body.trim());
        if (incomplete !== -1) {
            setError(`El apartado ${incomplete + 1} necesita título y texto.`);
            return;
        }
        onPublish(
            {
                ...doc,
                intro: intro.trim(),
                sections: sections.map((s) => ({ ...s, title: s.title.trim(), body: s.body.trim() })),
            },
            notifyUsers
        );
    };

    return (
        <Modal isOpen onClose={requestClose} labelledBy="legal-edit-title" className="admin-legal-editor">
            <div className="admin-dialog">
                <div className="admin-dialog-header">
                    <h2 className="section-title" id="legal-edit-title">{doc.title}</h2>
                    <p className="admin-dialog-text">
                        Última actualización: {formatDate(doc.updatedAt)} ·{' '}
                        <a href={doc.href} target="_blank" rel="noopener noreferrer" className="admin-text-btn">
                            Ver página ↗
                        </a>
                    </p>
                </div>

                <div className="modal-field">
                    <label htmlFor="legal-edit-intro" className="admin-dialog-label">Introducción</label>
                    <TextArea id="legal-edit-intro" value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} />
                </div>

                <p className="legal-edit-hint">
                    Empieza una línea con «- » para hacer una lista. Deja una línea en blanco para separar párrafos.
                </p>

                {sections.length > 0 && (
                    <ol className="legal-edit-sections">
                        {sections.map((section, i) => (
                            <li key={section.id} className="legal-edit-section">
                                <div className="legal-edit-section-head">
                                    <span className="legal-edit-number" aria-hidden="true">{i + 1}</span>
                                    <Input
                                        type="text"
                                        className="legal-edit-title"
                                        value={section.title}
                                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                        placeholder="Título del apartado"
                                        aria-label={`Título del apartado ${i + 1}`}
                                    />
                                    <span className="legal-edit-tools">
                                        <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} aria-label={`Subir el apartado ${i + 1}`}>
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveSection(i, 1)}
                                            disabled={i === sections.length - 1}
                                            aria-label={`Bajar el apartado ${i + 1}`}
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => {
                                                setSections((prev) => prev.filter((s) => s.id !== section.id));
                                                setError('');
                                            }}
                                            aria-label={`Quitar el apartado ${section.title || i + 1}`}
                                        >
                                            ✕
                                        </button>
                                    </span>
                                </div>
                                <TextArea
                                    value={section.body}
                                    onChange={(e) => updateSection(section.id, { body: e.target.value })}
                                    rows={Math.min(10, Math.max(3, section.body.split('\n').length + 1))}
                                    placeholder="Texto del apartado..."
                                    aria-label={`Texto del apartado ${i + 1}`}
                                />
                            </li>
                        ))}
                    </ol>
                )}

                <Button type="button" variant="outline" className="legal-edit-add" onClick={addSection}>
                    + Añadir apartado
                </Button>

                {/* Pegado abajo: Publicar y el aviso de descartar se ven aunque el texto sea largo */}
                <div className="legal-edit-footer">
                    {confirmDiscard ? (
                        <div className="legal-edit-discard" role="alert">
                            <span>Tienes cambios sin publicar. ¿Quieres descartarlos?</span>
                            <div className="modal-actions-row">
                                <Button type="button" variant="text" onClick={() => setConfirmDiscard(false)}>
                                    Seguir editando
                                </Button>
                                <Button type="button" variant="danger" onClick={onClose}>
                                    Descartar cambios
                                </Button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <label className="modal-checkbox">
                                <input type="checkbox" checked={notifyUsers} onChange={(e) => setNotifyUsers(e.target.checked)} />
                                <span>
                                    Avisar a los usuarios del cambio.
                                    <span className="legal-edit-note"> Si el cambio es importante, hay que avisar antes de aplicarlo.</span>
                                </span>
                            </label>
                            {error && (
                                <p className="admin-dialog-error" role="alert">
                                    {error}
                                </p>
                            )}
                            <div className="modal-actions-row">
                                <Button type="button" variant="text" onClick={requestClose}>
                                    Cancelar
                                </Button>
                                <Button type="button" variant="primary" onClick={handlePublish} disabled={!isDirty}>
                                    Publicar cambios
                                </Button>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </Modal>
    );
}
