'use client';

import type { ReactNode } from 'react';
import Button from '../../../components/Button/Button';
import Modal from '../../../components/Modal/Modal';

// Modal de confirmación de las fichas de admin (usuario, denuncia): título, texto, campos y Cancelar / Confirmar.
// Estilos en admin-shared.css (.admin-dialog)
export default function AdminDialog({
    isOpen,
    title,
    text,
    children,
    confirmLabel,
    danger = false,
    error,
    onClose,
    onConfirm,
}: {
    isOpen: boolean;
    title: string;
    text?: ReactNode;
    children?: ReactNode;
    confirmLabel: string;
    danger?: boolean;
    error?: string;
    onClose: () => void;
    onConfirm: () => void;
}) {
    return (
        <Modal isOpen={isOpen} onClose={onClose} labelledBy="admin-dialog-title">
            <form
                className="admin-dialog"
                onSubmit={(e) => {
                    e.preventDefault();
                    onConfirm();
                }}
                noValidate
            >
                <div className="admin-dialog-header">
                    <h2 className="section-title" id="admin-dialog-title">{title}</h2>
                    {text && <p className="admin-dialog-text">{text}</p>}
                </div>
                {children}
                {error && (
                    <p className="admin-dialog-error" role="alert">
                        {error}
                    </p>
                )}
                <div className="modal-actions-row">
                    <Button type="button" variant="text" onClick={onClose}>
                        Cancelar
                    </Button>
                    <Button type="submit" variant={danger ? 'danger' : 'primary'}>
                        {confirmLabel}
                    </Button>
                </div>
            </form>
        </Modal>
    );
}

// TODO: con backend, el aviso por correo se enviará con la acción
export function NotifyCheckbox({
    checked,
    onChange,
    label = 'Avisar al usuario por correo.',
}: {
    checked: boolean;
    onChange: (value: boolean) => void;
    label?: string;
}) {
    return (
        <label className="modal-checkbox">
            <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
            <span>{label}</span>
        </label>
    );
}
