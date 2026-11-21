'use client';

import { useEffect, type ReactNode } from 'react';
import './BottomSheet.css';

interface BottomSheetProps {
    open: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    footer?: ReactNode;
    /** Clase extra para el panel y el fondo (p. ej. "filter-sheet") */
    className?: string;
    /** Si la pantalla pasa de este ancho con el panel abierto, se cierra */
    closeAboveWidth?: number;
}

/**
 * Panel que sube desde abajo (bottom sheet): fondo oscuro, animación,
 * cierre con Escape / tocando fuera y bloqueo del scroll de la página.
 * Lo usan FilterSheet (filtros en móvil) y el menú "Más" de admin.
 */
export default function BottomSheet({
    open,
    onClose,
    title,
    children,
    footer,
    className = '',
    closeAboveWidth,
}: BottomSheetProps) {
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);

        const wide = closeAboveWidth ? window.matchMedia(`(min-width: ${closeAboveWidth + 1}px)`) : null;
        const handleResize = () => {
            if (wide?.matches) onClose();
        };
        wide?.addEventListener('change', handleResize);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKey);
            wide?.removeEventListener('change', handleResize);
        };
    }, [open, onClose, closeAboveWidth]);

    return (
        <>
            <div
                className={`bottom-sheet-overlay ${className} ${open ? 'open' : ''}`}
                onClick={onClose}
                aria-hidden="true"
            />
            <div
                className={`bottom-sheet ${className} ${open ? 'open' : ''}`}
                role={open ? 'dialog' : undefined}
                aria-modal={open ? true : undefined}
                aria-label={open ? title : undefined}
            >
                <div className="bottom-sheet-handle" aria-hidden="true" />
                <div className="bottom-sheet-header">
                    <h3>{title}</h3>
                    <button className="bottom-sheet-close" onClick={onClose} aria-label="Cerrar">
                        ✕
                    </button>
                </div>
                <div className="bottom-sheet-body">{children}</div>
                {footer && <div className="bottom-sheet-footer">{footer}</div>}
            </div>
        </>
    );
}
