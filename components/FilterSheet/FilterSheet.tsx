'use client';

import { useEffect, type ReactNode } from 'react';
import Button from '../Button/Button';
import './FilterSheet.css';

interface FilterSheetProps {
    open: boolean;
    onClose: () => void;
    onClear: () => void;
    resultCount: number;
    title?: string;
    children: ReactNode;
}

export default function FilterSheet({
    open,
    onClose,
    onClear,
    resultCount,
    title = 'Filtros',
    children,
}: FilterSheetProps) {
    useEffect(() => {
        if (!open) return;

        const prevOverflow = document.body.style.overflow;
        document.body.style.overflow = 'hidden';

        const handleKey = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleKey);

        const desktop = window.matchMedia('(min-width: 851px)');
        const handleResize = () => {
            if (desktop.matches) onClose();
        };
        desktop.addEventListener('change', handleResize);

        return () => {
            document.body.style.overflow = prevOverflow;
            document.removeEventListener('keydown', handleKey);
            desktop.removeEventListener('change', handleResize);
        };
    }, [open, onClose]);

    return (
        <>
            <div className={`filter-sheet-overlay ${open ? 'open' : ''}`} onClick={onClose} aria-hidden="true" />
            <div
                className={`filter-sheet ${open ? 'open' : ''}`}
                role={open ? 'dialog' : undefined}
                aria-modal={open ? true : undefined}
                aria-label={open ? title : undefined}
            >
                <div className="filter-sheet-handle" aria-hidden="true" />
                <div className="filter-sheet-header">
                    <h3>{title}</h3>
                    <button className="filter-sheet-close" onClick={onClose} aria-label="Cerrar filtros">
                        ✕
                    </button>
                </div>
                <div className="filter-sheet-body">{children}</div>
                <div className="filter-sheet-footer">
                    <Button variant="text" onClick={onClear}>
                        Limpiar
                    </Button>
                    <Button variant="primary" onClick={onClose}>
                        Ver {resultCount} {resultCount === 1 ? 'resultado' : 'resultados'}
                    </Button>
                </div>
            </div>
        </>
    );
}
