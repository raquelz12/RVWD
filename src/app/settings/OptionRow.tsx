import type { ReactNode } from 'react';

/* Fila de ajustes, común a los ajustes de usuario y a los de admin.
   Estilos en ./settings.css */

export interface OptionRowProps {
    label: string;
    value?: ReactNode;
    description?: string;
    /** Fila que abre algo: toda la fila es un botón */
    onClick?: () => void;
    actionLabel?: string;
    danger?: boolean;
    /** Control en línea (interruptor, desplegable...) */
    control?: ReactNode;
}

export default function OptionRow({ label, value, description, onClick, actionLabel = 'Cambiar', danger, control }: OptionRowProps) {
    const text = (
        <span className="settings-options-text">
            <span className="settings-option-label">{label}</span>
            {value !== undefined && <span className="settings-option-value">{value}</span>}
            {description && <span className="settings-option-description">{description}</span>}
        </span>
    );

    if (onClick) {
        return (
            <button type="button" className={`settings-option settings-option-button ${danger ? 'is-danger' : ''}`} onClick={onClick}>
                {text}
                <span className="settings-option-actions">
                    {/* parece un botón en escritorio; en móvil se ve la flecha */}
                    <span className={`custom-button ${danger ? 'danger' : 'outline'} desktop-btn settings-option-btn`} aria-hidden="true">
                        {actionLabel}
                    </span>
                    <span className="mobile-action-icon" aria-hidden="true">›</span>
                </span>
            </button>
        );
    }

    return (
        <div className="settings-option is-static">
            {text}
            {control && <div className="settings-option-actions settings-option-control">{control}</div>}
        </div>
    );
}
