'use client';

import { useEffect, useState } from 'react';
import Button from '../../../../components/Button/Button';
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
export default function LegalEditor({ doc, onClose, onPublish }: Props) {
    const [intro, setIntro] = useState(doc.intro);
    const [sections, setSections] = useState<LegalSection[]>(doc.sections);
    const [notifyUsers, setNotifyUsers] = useState(false);
    const [error, setError] = useState('');
    const [confirmDiscard, setConfirmDiscard] = useState(false);

    const isDirty = intro !== doc.intro || JSON.stringify(sections) !== JSON.stringify(doc.sections);

    // Cerrar con cambios sin publicar pide confirmación
    const requestClose = () => {
        if (isDirty) setConfirmDiscard(true);
        else onClose();
    };

    useEffect(() => {
        const handleKey = (e: KeyboardEvent) => {
            if (e.key !== 'Escape') return;
            if (isDirty) setConfirmDiscard(true);
            else onClose();
        };
        document.addEventListener('keydown', handleKey);
        return () => document.removeEventListener('keydown', handleKey);
    }, [isDirty, onClose]);

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
        // el nuevo apartado queda al final: se baja hasta él
        setTimeout(() => {
            document.querySelector('.legal-edit-section:last-child input')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
            (document.querySelector('.legal-edit-section:last-child input') as HTMLInputElement | null)?.focus({ preventScroll: true });
        }, 0);
    };

    const handlePublish = () => {
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
        <div className="admin-modal-overlay" onClick={requestClose}>
            <div
                className="admin-modal-card admin-legal-editor"
                role="dialog"
                aria-modal="true"
                aria-label={`Editar ${doc.title}`}
                onClick={(e) => e.stopPropagation()}
            >
                <button className="modal-close-btn" onClick={requestClose} aria-label="Cerrar">✕</button>
                <h3>{doc.title}</h3>
                <p className="modal-subtitle">
                    Última actualización: {formatDate(doc.updatedAt)} ·{' '}
                    <a href={doc.href} target="_blank" rel="noopener noreferrer" className="admin-text-btn">
                        Ver página ↗
                    </a>
                </p>

                <div className="legal-edit-body">
                    <div className="modal-field">
                        <label>Introducción</label>
                        <TextArea value={intro} onChange={(e) => setIntro(e.target.value)} rows={3} />
                    </div>

                    <p className="legal-edit-hint">
                        Empieza una línea con «- » para hacer una lista. Deja una línea en blanco para separar párrafos.
                    </p>

                    <ol className="legal-edit-sections">
                        {sections.map((section, i) => (
                            <li key={section.id} className="legal-edit-section">
                                <div className="legal-edit-section-head">
                                    <span className="legal-edit-number">{i + 1}</span>
                                    <input
                                        className="input legal-edit-title"
                                        value={section.title}
                                        onChange={(e) => updateSection(section.id, { title: e.target.value })}
                                        placeholder="Título del apartado"
                                        aria-label={`Título del apartado ${i + 1}`}
                                    />
                                    <span className="legal-edit-tools">
                                        <button type="button" onClick={() => moveSection(i, -1)} disabled={i === 0} aria-label="Subir apartado">
                                            ↑
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => moveSection(i, 1)}
                                            disabled={i === sections.length - 1}
                                            aria-label="Bajar apartado"
                                        >
                                            ↓
                                        </button>
                                        <button
                                            type="button"
                                            className="danger"
                                            onClick={() => setSections((prev) => prev.filter((s) => s.id !== section.id))}
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
                                />
                            </li>
                        ))}
                    </ol>

                    <Button variant="outline" className="legal-edit-add" onClick={addSection}>
                        + Añadir apartado
                    </Button>
                </div>

                <div className="legal-edit-footer">
                    {confirmDiscard ? (
                        <div className="legal-edit-discard" role="alert">
                            <span>Tienes cambios sin publicar. ¿Quieres descartarlos?</span>
                            <div className="modal-actions-row">
                                <Button variant="text" onClick={() => setConfirmDiscard(false)}>
                                    Seguir editando
                                </Button>
                                <Button variant="danger" onClick={onClose}>
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
                            <div className="modal-actions-row">
                                <Button variant="text" onClick={requestClose}>
                                    Cancelar
                                </Button>
                                <Button variant="primary" onClick={handlePublish} disabled={!isDirty}>
                                    Publicar cambios
                                </Button>
                            </div>
                            {error && <p className="modal-error-text">{error}</p>}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
