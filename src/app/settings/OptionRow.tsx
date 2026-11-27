import type { ReactNode } from 'react';
import Link from 'next/link';

/* Fila de ajustes, común a los ajustes de usuario y a los de admin.
   Estilos en ./settings.css */

export interface OptionRowProps {
    label: string;
    value?: ReactNode;
    description?: string;
    /** Fila que abre algo: toda la fila es un botón */
    onClick?: () => void;
    /** Fila que lleva a otra página: toda la fila es un enlace */
    href?: string;
    /** Fila que todavía no se puede usar (se ve, pero no se pulsa) */
    disabled?: boolean;
    actionLabel?: string;
    danger?: boolean;
    /** Control en línea (interruptor, desplegable...) */
    control?: ReactNode;
}

export default function OptionRow({ label, value, description, onClick, href, disabled, actionLabel = 'Cambiar', danger, control }: OptionRowProps) {
    const text = (
        <span className="settings-options-text">
            <span className="settings-option-label">{label}</span>
            {value !== undefined && <span className="settings-option-value">{value}</span>}
            {description && <span className="settings-option-description">{description}</span>}
        </span>
    );

    const actions = (
        <span className="settings-option-actions">
            {/* parece un botón en escritorio; en móvil se ve la flecha */}
            <span className={`custom-button ${danger ? 'danger' : 'outline'} settings-option-btn`}>{actionLabel}</span>
            <span className="settings-option-chevron" aria-hidden="true">›</span>
        </span>
    );

    const className = `settings-option settings-option-button ${danger ? 'is-danger' : ''}`;

    if (href && !disabled) {
        return (
            <Link href={href} className={className}>
                {text}
                {actions}
            </Link>
        );
    }

    if (onClick || href || disabled) {
        return (
            <button type="button" className={className} onClick={onClick} disabled={disabled}>
                {text}
                {actions}
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
